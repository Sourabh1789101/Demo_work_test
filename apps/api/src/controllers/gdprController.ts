import type { Request, Response } from 'express';
import { pool } from '../config/database.js';
import { AuditService } from '../services/AuditService.js';

// GET /api/gdpr/export - Export all user data as JSON
export const exportMyData = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id as string | undefined;

  if (!userId) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
    return;
  }

  try {
    // Fetch user profile
    const { rows: userRows } = await pool.query<{
      id: string;
      email: string;
      name: string;
      role: string;
      is_verified: boolean;
      created_at: string;
      updated_at: string;
    }>(
      `SELECT id, email, name, role, is_verified, created_at, updated_at
       FROM users WHERE id = $1`,
      [userId]
    );

    const user = userRows[0] ?? null;

    // Fetch all forms belonging to this user
    const { rows: forms } = await pool.query(
      `SELECT id, title, description, schema, is_published, submission_count, workspace_id, created_at, updated_at
       FROM forms WHERE user_id = $1
       ORDER BY created_at ASC`,
      [userId]
    );

    // Fetch all submissions for those forms
    let submissions: unknown[] = [];
    if (forms.length > 0) {
      const formIds = forms.map((f: { id: string }) => f.id);
      const placeholders = formIds.map((_: string, i: number) => `$${i + 1}`).join(', ');

      const { rows: submissionRows } = await pool.query(
        `SELECT id, form_id, data, metadata, submitted_at
         FROM submissions WHERE form_id IN (${placeholders})
         ORDER BY submitted_at ASC`,
        formIds
      );

      submissions = submissionRows;
    }

    // Fetch audit logs for this user
    const auditLogs = await AuditService.getLogsForUser(userId, 500);

    // Log the export action
    await AuditService.log({
      userId,
      action: 'gdpr.export',
      resourceType: 'user',
      resourceId: userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: {
        exportedAt: new Date().toISOString(),
        formsCount: forms.length,
        submissionsCount: submissions.length,
      },
    });

    const exportPayload = {
      exportedAt: new Date().toISOString(),
      user,
      forms,
      submissions,
      auditLogs,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="my-data-export.json"');
    res.json(exportPayload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to export data';
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
  }
};

// DELETE /api/gdpr/me - Right to be forgotten
export const rightToBeForgotten = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as any).user?.id as string | undefined;

  if (!userId) {
    res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });
    return;
  }

  try {
    // Log the deletion before it happens (while user still exists)
    await AuditService.log({
      userId,
      action: 'gdpr.delete',
      resourceType: 'user',
      resourceId: userId,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { requestedAt: new Date().toISOString() },
    });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Nullify user_id references in forms so the forms can be optionally cleaned up.
      // If cascade deletion of forms is desired, delete them explicitly first.
      await client.query(
        `DELETE FROM submissions
         WHERE form_id IN (SELECT id FROM forms WHERE user_id = $1)`,
        [userId]
      );

      await client.query('DELETE FROM forms WHERE user_id = $1', [userId]);

      // Remove from workspace memberships
      await client.query('DELETE FROM workspace_members WHERE user_id = $1', [userId]);

      // Transfer-owned workspaces to nobody (set owner_id to a placeholder) or delete them.
      // Here we delete workspaces owned solely by this user (no other members).
      const { rows: soloWorkspaces } = await client.query<{ id: string }>(
        `SELECT w.id FROM workspaces w
         WHERE w.owner_id = $1
           AND NOT EXISTS (
             SELECT 1 FROM workspace_members wm
             WHERE wm.workspace_id = w.id AND wm.user_id != $1
           )`,
        [userId]
      );

      for (const ws of soloWorkspaces) {
        await client.query('DELETE FROM workspaces WHERE id = $1', [ws.id]);
      }

      // Finally delete the user — audit_logs.user_id will be set to NULL by FK ON DELETE SET NULL
      await client.query('DELETE FROM users WHERE id = $1', [userId]);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    const deletedAt = new Date().toISOString();
    res.json({
      success: true,
      data: {
        message: 'All your data has been deleted',
        deletedAt,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete user data';
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
  }
};

// GET /api/gdpr/data-info - Info about what data we store
export const dataInfo = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    data: {
      dataCollected: [
        'Email address (required for authentication)',
        'Name (provided during registration)',
        'Form schemas (forms you create)',
        'Form submissions (responses collected)',
        'IP addresses (stored with submissions for fraud prevention)',
        'User agent strings (stored with submissions)',
        'Audit logs (actions you take in the system)',
      ],
      dataRetention: 'Data is retained until you delete your account',
      dataPortability: 'You can export all your data via GET /api/gdpr/export',
      contact: process.env.DPO_EMAIL || 'privacy@kimaiforms.com',
    },
  });
};
