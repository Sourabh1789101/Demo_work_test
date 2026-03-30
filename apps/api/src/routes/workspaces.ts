import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { requireWorkspaceRole } from '../middleware/rbac.js';
import {
  createWorkspace,
  listMyWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
} from '../controllers/workspaceController.js';

const workspacesRouter = Router();

// All workspace routes require authentication
workspacesRouter.use(authenticateToken);

workspacesRouter.get('/', listMyWorkspaces);
workspacesRouter.post('/', createWorkspace);
workspacesRouter.get('/:workspaceId', requireWorkspaceRole('viewer'), getWorkspace);
workspacesRouter.patch('/:workspaceId', requireWorkspaceRole('admin'), updateWorkspace);
workspacesRouter.delete('/:workspaceId', requireWorkspaceRole('owner'), deleteWorkspace);
workspacesRouter.post('/:workspaceId/members', requireWorkspaceRole('admin'), addMember);
workspacesRouter.delete('/:workspaceId/members/:userId', requireWorkspaceRole('admin'), removeMember);

export { workspacesRouter };
