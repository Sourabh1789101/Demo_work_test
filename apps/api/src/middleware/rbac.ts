import type { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from '../services/WorkspaceService.js';

// Workspace roles in order of permission level
const ROLE_HIERARCHY: Record<string, number> = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

// Middleware: requires user to be a member of the workspace with at least the given role.
// Reads workspaceId from req.params.workspaceId.
export const requireWorkspaceRole = (minRole: 'viewer' | 'editor' | 'admin' | 'owner') =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { workspaceId } = req.params;
    const userId = (req as any).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    if (!workspaceId) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Workspace ID required' },
      });
      return;
    }

    let role: string | null;
    try {
      role = await WorkspaceService.getMemberRole(String(workspaceId), String(userId));
    } catch (_err) {
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to verify workspace membership' },
      });
      return;
    }

    if (!role) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not a member of this workspace' },
      });
      return;
    }

    const userLevel = ROLE_HIERARCHY[role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole] ?? 0;

    if (userLevel < requiredLevel) {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: `Requires ${minRole} role or higher` },
      });
      return;
    }

    (req as any).workspaceRole = role;
    next();
  };
