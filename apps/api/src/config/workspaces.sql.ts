export const CREATE_WORKSPACES_SQL = `
  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free',
    owner_id TEXT NOT NULL,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX IF NOT EXISTS idx_workspaces_owner_id ON workspaces(owner_id);
  CREATE INDEX IF NOT EXISTS idx_workspaces_slug ON workspaces(slug);

  CREATE TABLE IF NOT EXISTS workspace_members (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    invited_by TEXT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(workspace_id, user_id)
  );
  CREATE INDEX IF NOT EXISTS idx_workspace_members_workspace_id ON workspace_members(workspace_id);
  CREATE INDEX IF NOT EXISTS idx_workspace_members_user_id ON workspace_members(user_id);

  ALTER TABLE forms ADD COLUMN IF NOT EXISTS workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE;
  ALTER TABLE forms ADD COLUMN IF NOT EXISTS user_id TEXT;
  CREATE INDEX IF NOT EXISTS idx_forms_workspace_id ON forms(workspace_id);
  CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
`;
