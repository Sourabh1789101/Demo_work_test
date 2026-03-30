import { pool } from '../config/database.js';
import { nanoid } from 'nanoid';

export type AuditAction =
  | 'user.register'
  | 'user.login'
  | 'user.logout'
  | 'user.delete'
  | 'form.create'
  | 'form.update'
  | 'form.delete'
  | 'form.publish'
  | 'submission.create'
  | 'submission.delete'
  | 'workspace.create'
  | 'workspace.update'
  | 'workspace.delete'
  | 'member.add'
  | 'member.remove'
  | 'gdpr.export'
  | 'gdpr.delete';

export type AuditEntry = {
  id?: string;
  userId?: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

type AuditLogRow = {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

const mapRow = (row: AuditLogRow): AuditEntry => ({
  id: row.id,
  userId: row.user_id ?? undefined,
  action: row.action as AuditAction,
  resourceType: row.resource_type,
  resourceId: row.resource_id ?? undefined,
  ipAddress: row.ip_address ?? undefined,
  userAgent: row.user_agent ?? undefined,
  metadata: row.metadata ?? undefined,
  createdAt: row.created_at,
});

export class AuditService {
  static async log(entry: AuditEntry): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, ip_address, user_agent, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
        [
          nanoid(),
          entry.userId ?? null,
          entry.action,
          entry.resourceType,
          entry.resourceId ?? null,
          entry.ipAddress ?? null,
          entry.userAgent ?? null,
          JSON.stringify(entry.metadata ?? {}),
        ]
      );
    } catch (err) {
      // Audit logging must never crash the main flow
      console.error('[AUDIT] Failed to log audit entry:', err);
    }
  }

  static async getLogsForUser(userId: string, limit = 50): Promise<AuditEntry[]> {
    const { rows } = await pool.query<AuditLogRow>(
      `SELECT * FROM audit_logs
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return rows.map(mapRow);
  }

  static async getLogsForResource(
    resourceType: string,
    resourceId: string
  ): Promise<AuditEntry[]> {
    const { rows } = await pool.query<AuditLogRow>(
      `SELECT * FROM audit_logs
       WHERE resource_type = $1 AND resource_id = $2
       ORDER BY created_at DESC`,
      [resourceType, resourceId]
    );

    return rows.map(mapRow);
  }
}
