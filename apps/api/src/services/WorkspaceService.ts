import { pool } from '../config/database.js';
import { nanoid } from 'nanoid';

export type Workspace = {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  ownerId: string;
  settings: Record<string, unknown>;
  createdAt: string;
};

export type WorkspaceMember = {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: string;
};

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  owner_id: string;
  settings: Record<string, unknown>;
  created_at: string;
};

type WorkspaceMemberRow = {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  joined_at: string;
};

const mapWorkspace = (row: WorkspaceRow): Workspace => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  plan: row.plan as Workspace['plan'],
  ownerId: row.owner_id,
  settings: row.settings ?? {},
  createdAt: row.created_at,
});

const mapMember = (row: WorkspaceMemberRow): WorkspaceMember => ({
  id: row.id,
  workspaceId: row.workspace_id,
  userId: row.user_id,
  role: row.role as WorkspaceMember['role'],
  joinedAt: row.joined_at,
});

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export class WorkspaceService {
  static async createWorkspace(name: string, ownerId: string): Promise<Workspace> {
    const baseSlug = generateSlug(name) || 'workspace';

    // Check for slug collision; append random suffix if needed
    let slug = baseSlug;
    const { rows: existing } = await pool.query<{ id: string }>(
      'SELECT id FROM workspaces WHERE slug = $1',
      [slug]
    );

    if (existing.length > 0) {
      slug = `${baseSlug}-${nanoid(4)}`;
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const workspaceId = nanoid();
      const { rows } = await client.query<WorkspaceRow>(
        `INSERT INTO workspaces (id, name, slug, plan, owner_id, settings)
         VALUES ($1, $2, $3, 'free', $4, '{}')
         RETURNING *`,
        [workspaceId, name, slug, ownerId]
      );

      const workspace = mapWorkspace(rows[0]);

      await client.query(
        `INSERT INTO workspace_members (id, workspace_id, user_id, role, invited_by)
         VALUES ($1, $2, $3, 'owner', NULL)`,
        [nanoid(), workspaceId, ownerId]
      );

      await client.query('COMMIT');
      return workspace;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  static async getWorkspace(id: string): Promise<Workspace | null> {
    const { rows } = await pool.query<WorkspaceRow>(
      'SELECT * FROM workspaces WHERE id = $1',
      [id]
    );

    return rows.length > 0 ? mapWorkspace(rows[0]) : null;
  }

  static async listUserWorkspaces(userId: string): Promise<Workspace[]> {
    const { rows } = await pool.query<WorkspaceRow>(
      `SELECT w.*
       FROM workspaces w
       INNER JOIN workspace_members wm ON wm.workspace_id = w.id
       WHERE wm.user_id = $1
       ORDER BY w.created_at ASC`,
      [userId]
    );

    return rows.map(mapWorkspace);
  }

  static async addMember(
    workspaceId: string,
    userId: string,
    role: string,
    invitedBy: string
  ): Promise<WorkspaceMember> {
    const { rows } = await pool.query<WorkspaceMemberRow>(
      `INSERT INTO workspace_members (id, workspace_id, user_id, role, invited_by)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (workspace_id, user_id)
       DO UPDATE SET role = EXCLUDED.role, invited_by = EXCLUDED.invited_by
       RETURNING *`,
      [nanoid(), workspaceId, userId, role, invitedBy]
    );

    return mapMember(rows[0]);
  }

  static async removeMember(workspaceId: string, userId: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      'DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, userId]
    );

    return (rowCount ?? 0) > 0;
  }

  static async getMemberRole(workspaceId: string, userId: string): Promise<string | null> {
    const { rows } = await pool.query<{ role: string }>(
      'SELECT role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [workspaceId, userId]
    );

    return rows.length > 0 ? rows[0].role : null;
  }

  static async updateWorkspace(
    id: string,
    updates: { name?: string; plan?: string; settings?: Record<string, unknown> }
  ): Promise<Workspace | null> {
    const setClauses: string[] = ['updated_at = NOW()'];
    const values: unknown[] = [];
    let paramIdx = 1;

    if (updates.name !== undefined) {
      setClauses.push(`name = $${paramIdx++}`);
      values.push(updates.name);
    }

    if (updates.plan !== undefined) {
      setClauses.push(`plan = $${paramIdx++}`);
      values.push(updates.plan);
    }

    if (updates.settings !== undefined) {
      setClauses.push(`settings = $${paramIdx++}::jsonb`);
      values.push(JSON.stringify(updates.settings));
    }

    values.push(id);

    const { rows } = await pool.query<WorkspaceRow>(
      `UPDATE workspaces SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *`,
      values
    );

    return rows.length > 0 ? mapWorkspace(rows[0]) : null;
  }

  static async deleteWorkspace(id: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      'DELETE FROM workspaces WHERE id = $1',
      [id]
    );

    return (rowCount ?? 0) > 0;
  }
}
