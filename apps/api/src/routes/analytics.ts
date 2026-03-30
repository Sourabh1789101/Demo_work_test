import { Router } from 'express';
import {
	getDashboardStats,
	getFormStats,
	getSubmissionTrend,
} from '../controllers/analyticsController.js';

const analyticsRouter = Router();

analyticsRouter.get('/dashboard', getDashboardStats);
analyticsRouter.get('/forms/:formId/stats', getFormStats);
analyticsRouter.get('/forms/:formId/trend', getSubmissionTrend);

export { analyticsRouter };
