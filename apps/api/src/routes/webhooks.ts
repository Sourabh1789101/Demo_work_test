import { Router } from 'express';
import type { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { nanoid } from 'nanoid';
import { ZapierService, type IntegrationType } from '../services/ZapierService.js';

const webhooksRouter = Router();

const VALID_INTEGRATION_TYPES: IntegrationType[] = ['zapier', 'make', 'n8n', 'generic'];
const VALID_EVENTS = ['submission.created', 'form.published', 'form.updated', '*'];

// Ensure the webhooks table exists (idempotent — called once at startup normally)
const ensureWebhooksTable = async (): Promise<void> => {
	await pool.query(`
		CREATE TABLE IF NOT EXISTS webhooks (
			id TEXT PRIMARY KEY,
			form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
			url TEXT NOT NULL,
			secret TEXT,
			events JSONB NOT NULL DEFAULT '[]',
			integration_type TEXT NOT NULL DEFAULT 'generic',
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			delivery_count INTEGER NOT NULL DEFAULT 0,
			last_delivered_at TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`);
	// Add integration_type column if upgrading from old schema
	await pool.query(`
		ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS integration_type TEXT NOT NULL DEFAULT 'generic'
	`).catch(() => { /* ignore if column already exists */ });
	await pool.query(`
		ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS delivery_count INTEGER NOT NULL DEFAULT 0
	`).catch(() => { /* ignore */ });
	await pool.query(`
		ALTER TABLE webhooks ADD COLUMN IF NOT EXISTS last_delivered_at TIMESTAMPTZ
	`).catch(() => { /* ignore */ });
};

// ── GET /api/forms/:formId/webhooks ──────────────────────────────────────────
webhooksRouter.get('/forms/:formId/webhooks', async (req: Request, res: Response) => {
	const { formId } = req.params;
	try {
		await ensureWebhooksTable();
		const result = await pool.query(
			`SELECT id, form_id, url, events, integration_type, is_active,
			        delivery_count, last_delivered_at, created_at
			 FROM webhooks WHERE form_id = $1 ORDER BY created_at DESC`,
			[formId],
		);
		res.json({ success: true, data: result.rows });
	} catch {
		res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list webhooks' } });
	}
});

// ── POST /api/forms/:formId/webhooks ─────────────────────────────────────────
webhooksRouter.post('/forms/:formId/webhooks', async (req: Request, res: Response) => {
	const { formId } = req.params;
	const { url, events, secret, integrationType } = req.body as {
		url?: string;
		events?: string[];
		secret?: string;
		integrationType?: IntegrationType;
	};

	if (!url || !url.startsWith('http')) {
		res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Valid URL starting with http(s):// is required' } });
		return;
	}
	if (!Array.isArray(events) || events.length === 0) {
		res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'At least one event is required' } });
		return;
	}
	const unknownEvents = events.filter((e) => !VALID_EVENTS.includes(e));
	if (unknownEvents.length > 0) {
		res.status(400).json({
			success: false,
			error: { code: 'BAD_REQUEST', message: `Unknown events: ${unknownEvents.join(', ')}. Valid: ${VALID_EVENTS.join(', ')}` },
		});
		return;
	}
	const resolvedType: IntegrationType = VALID_INTEGRATION_TYPES.includes(integrationType!)
		? integrationType!
		: 'generic';

	try {
		await ensureWebhooksTable();
		const id = nanoid();
		const result = await pool.query(
			`INSERT INTO webhooks (id, form_id, url, secret, events, integration_type)
			 VALUES ($1, $2, $3, $4, $5::jsonb, $6)
			 RETURNING id, form_id, url, events, integration_type, is_active, delivery_count, created_at`,
			[id, formId, url, secret ?? null, JSON.stringify(events), resolvedType],
		);
		res.status(201).json({ success: true, data: result.rows[0] });
	} catch {
		res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create webhook' } });
	}
});

// ── POST /api/forms/:formId/webhooks/:webhookId/test ─────────────────────────
// Send a test payload to the webhook to verify the connection.
webhooksRouter.post('/forms/:formId/webhooks/:webhookId/test', async (req: Request, res: Response) => {
	const { formId, webhookId } = req.params;

	try {
		await ensureWebhooksTable();
		const { rows } = await pool.query(
			'SELECT * FROM webhooks WHERE id = $1 AND form_id = $2 LIMIT 1',
			[webhookId, formId],
		);
		if (!rows[0]) {
			res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Webhook not found' } });
			return;
		}

		const hook = rows[0] as {
			url: string;
			secret: string | null;
			events: string[];
			integration_type: IntegrationType;
		};

		const testPayload = {
			id: `test_${nanoid(8)}`,
			formId,
			data: { name: 'Test User', email: 'test@example.com' },
			submittedAt: new Date().toISOString(),
			_isTest: true,
		};

		const result = await ZapierService.deliver(
			{
				url: hook.url,
				secret: hook.secret ?? undefined,
				events: ['submission.created'],
				integrationType: hook.integration_type ?? 'generic',
			},
			'submission.created',
			testPayload,
		);

		if (result.success) {
			res.json({ success: true, data: { message: 'Test delivery successful', statusCode: result.statusCode } });
		} else {
			res.status(422).json({ success: false, error: { code: 'DELIVERY_FAILED', message: result.error ?? `HTTP ${result.statusCode}` } });
		}
	} catch {
		res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to send test payload' } });
	}
});

// ── PATCH /api/forms/:formId/webhooks/:webhookId ──────────────────────────────
// Toggle active state / update URL or events.
webhooksRouter.patch('/forms/:formId/webhooks/:webhookId', async (req: Request, res: Response) => {
	const { formId, webhookId } = req.params;
	const { isActive, url, events } = req.body as { isActive?: boolean; url?: string; events?: string[] };

	try {
		await ensureWebhooksTable();
		const setClauses: string[] = [];
		const values: unknown[] = [];
		let idx = 1;

		if (typeof isActive === 'boolean') { setClauses.push(`is_active = $${idx++}`); values.push(isActive); }
		if (url) { setClauses.push(`url = $${idx++}`); values.push(url); }
		if (events) { setClauses.push(`events = $${idx++}::jsonb`); values.push(JSON.stringify(events)); }

		if (setClauses.length === 0) {
			res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'No fields to update' } });
			return;
		}

		values.push(webhookId, formId);
		const result = await pool.query(
			`UPDATE webhooks SET ${setClauses.join(', ')} WHERE id = $${idx++} AND form_id = $${idx}
			 RETURNING id, form_id, url, events, integration_type, is_active, delivery_count, created_at`,
			values,
		);

		if ((result.rowCount ?? 0) === 0) {
			res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Webhook not found' } });
			return;
		}

		res.json({ success: true, data: result.rows[0] });
	} catch {
		res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update webhook' } });
	}
});

// ── DELETE /api/forms/:formId/webhooks/:webhookId ─────────────────────────────
webhooksRouter.delete('/forms/:formId/webhooks/:webhookId', async (req: Request, res: Response) => {
	const { formId, webhookId } = req.params;
	try {
		const result = await pool.query(
			'DELETE FROM webhooks WHERE id = $1 AND form_id = $2',
			[webhookId, formId],
		);
		if ((result.rowCount ?? 0) === 0) {
			res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Webhook not found' } });
			return;
		}
		res.json({ success: true, data: { id: webhookId } });
	} catch {
		res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete webhook' } });
	}
});

export { webhooksRouter };
