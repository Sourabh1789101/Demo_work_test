import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { exportMyData, rightToBeForgotten, dataInfo } from '../controllers/gdprController.js';

const gdprRouter = Router();

// Public: describes what data is collected (no auth needed)
gdprRouter.get('/data-info', dataInfo);

// Protected: requires an authenticated user
gdprRouter.get('/export', authenticateToken, exportMyData);
gdprRouter.delete('/me', authenticateToken, rightToBeForgotten);

export { gdprRouter };
