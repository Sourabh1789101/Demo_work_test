import type { Request, Response } from 'express';
import { WorkspaceService } from '../services/WorkspaceService.js';

// POST /api/workspaces
export const createWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const { name } = req.body as { name?: unknown };
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'Workspace name is required' },
      });
      return;
    }

    const workspace = await WorkspaceService.createWorkspace(name.trim(), userId);
    res.status(201).json({ success: true, data: workspace });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create workspace';
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
  }
};

// GET /api/workspaces
export const listMyWorkspaces = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id as string | undefined;
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const workspaces = await WorkspaceService.listUserWorkspaces(userId);
    res.json({ success: true, data: workspaces });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list workspaces';
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
  }
};

// GET /api/workspaces/:workspaceId
export const getWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const workspace = await WorkspaceService.getWorkspace(String(workspaceId));

    if (!workspace) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Workspace not found' },
      });
      return;
    }

    res.json({ success: true, data: workspace });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get workspace';
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
  }
};

// PATCH /api/workspaces/:workspaceId
export const updateWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { name, plan, settings } = req.body as {
      name?: string;
      plan?: string;
      settings?: Record<string, unknown>;
    };

    const updates: { name?: string; plan?: string; settings?: Record<string, unknown> } = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Name must be a non-empty string' },
        });
        return;
      }
      updates.name = name.trim();
    }

    if (plan !== undefined) {
      if (!['free', 'pro', 'enterprise'].includes(plan)) {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Plan must be one of: free, pro, enterprise' },
        });
        return;
      }
      updates.plan = plan;
    }

    if (settings !== undefined) {
      if (typeof settings !== 'object' || Array.isArray(settings)) {
        res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Settings must be an object' },
        });
        return;
      }
      updates.settings = settings;
    }

    const workspace = await WorkspaceService.updateWorkspace(String(workspaceId), updates);

    if (!workspace) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Workspace not found' },
      });
      return;
    }

    res.json({ success: true, data: workspace });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update workspace';
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
  }
};

// DELETE /api/workspaces/:workspaceId
export const deleteWorkspace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const deleted = await WorkspaceService.deleteWorkspace(String(workspaceId));

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Workspace not found' },
      });
      return;
    }

    res.json({ success: true, data: { id: workspaceId, deleted: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete workspace';
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
  }
};

// POST /api/workspaces/:workspaceId/members
export const addMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const invitedBy = (req as any).user?.id as string;
    const { userId, role } = req.body as { userId?: unknown; role?: unknown };

    if (!userId || typeof userId !== 'string') {
      res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'userId is required' },
      });
      return;
    }

    const validRoles = ['owner', 'admin', 'editor', 'viewer'];
    const resolvedRole = typeof role === 'string' && validRoles.includes(role) ? role : 'viewer';

    const member = await WorkspaceService.addMember(String(workspaceId), userId, resolvedRole, invitedBy);
    res.status(201).json({ success: true, data: member });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add member';
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
  }
};

// DELETE /api/workspaces/:workspaceId/members/:userId
export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workspaceId, userId } = req.params;
    const removed = await WorkspaceService.removeMember(String(workspaceId), String(userId));

    if (!removed) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Member not found in workspace' },
      });
      return;
    }

    res.json({ success: true, data: { workspaceId, userId, removed: true } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to remove member';
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
  }
};
