import { nanoid } from 'nanoid';
import type { Request, Response } from 'express';
import { pool } from '../config/database.js';

/* ── List submissions for a form ──────────────────────────────────────── */
export const listSubmissions = async (req: Request, res: Response) => {
	const { formId } = req.params;

	const result = await pool.query(
		`SELECT id, form_id, data, metadata, submitted_at
		 FROM submissions
		 WHERE form_id = $1
		 ORDER BY submitted_at DESC
		 LIMIT 500`,
		[formId],
	);

	const submissions = result.rows.map((r) => ({
		id: r.id,
		formId: r.form_id,
		data: r.data,
		metadata: r.metadata,
		submittedAt: r.submitted_at,
	}));

	res.status(200).json({ success: true, data: submissions });
};

/* ── Create a submission ─────────────────────────────────────────────── */
export const createSubmission = async (req: Request, res: Response) => {
	const { formId } = req.params;
	const { data } = req.body as { data: Record<string, unknown> };

	if (!data || typeof data !== 'object') {
		res.status(400).json({
			success: false,
			error: { code: 'BAD_REQUEST', message: 'data field is required' },
		});
		return;
	}

	const formResult = await pool.query('SELECT id FROM forms WHERE id = $1', [formId]);
	if (formResult.rowCount === 0) {
		res.status(404).json({
			success: false,
			error: { code: 'FORM_NOT_FOUND', message: 'Form not found' },
		});
		return;
	}

	const id = nanoid();
	const metadata = {
		ip: req.ip,
		userAgent: req.headers['user-agent'] ?? null,
	};

	const result = await pool.query(
		`INSERT INTO submissions (id, form_id, data, metadata)
		 VALUES ($1, $2, $3::jsonb, $4::jsonb)
		 RETURNING id, form_id, data, metadata, submitted_at`,
		[id, formId, JSON.stringify(data), JSON.stringify(metadata)],
	);

	await pool.query('UPDATE forms SET submission_count = submission_count + 1 WHERE id = $1', [formId]);

	const row = result.rows[0];
	res.status(201).json({
		success: true,
		data: {
			id: row.id,
			formId: row.form_id,
			data: row.data,
			metadata: row.metadata,
			submittedAt: row.submitted_at,
		},
	});
};

/* ── Delete a single submission ──────────────────────────────────────── */
export const deleteSubmission = async (req: Request, res: Response) => {
	const { formId, submissionId } = req.params;

	const result = await pool.query(
		'DELETE FROM submissions WHERE id = $1 AND form_id = $2',
		[submissionId, formId],
	);

	if ((result.rowCount ?? 0) === 0) {
		res.status(404).json({
			success: false,
			error: { code: 'NOT_FOUND', message: 'Submission not found' },
		});
		return;
	}

	await pool.query(
		'UPDATE forms SET submission_count = GREATEST(submission_count - 1, 0) WHERE id = $1',
		[formId],
	);

	res.status(200).json({ success: true, data: { id: submissionId } });
};

/* ── Submission stats ────────────────────────────────────────────────── */
export const getSubmissionStats = async (req: Request, res: Response) => {
	const { formId } = req.params;

	const result = await pool.query(
		`SELECT COUNT(*) AS total, MIN(submitted_at) AS first_at, MAX(submitted_at) AS last_at
		 FROM submissions WHERE form_id = $1`,
		[formId],
	);

	const row = result.rows[0];
	res.status(200).json({
		success: true,
		data: {
			total: parseInt(row.total, 10),
			firstAt: row.first_at,
			lastAt: row.last_at,
		},
	});
};
