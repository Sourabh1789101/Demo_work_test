import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
	generateFormWithAI,
	getGenerationStatus,
	getAIGeneratedForms,
} from '../controllers/aiController.js';

export const aiRouter = Router();

// All AI routes require authentication
aiRouter.use(authenticateToken);

// POST /api/ai/generate - Generate a form using AI
aiRouter.post('/generate', authLimiter, generateFormWithAI);

// GET /api/ai/status - Get AI service status and rate limit info
aiRouter.get('/status', getGenerationStatus);

// GET /api/ai/forms - Get user's AI-generated forms
aiRouter.get('/forms', getAIGeneratedForms);
