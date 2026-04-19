import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import { initDatabase } from './config/database.js';
import { httpLogger, logger } from './middleware/logger.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { formsRouter } from './routes/forms.js';
import { templatesRouter } from './routes/templates.js';
import { submissionsRouter } from './routes/submissions.js';
import { authRouter } from './routes/auth.js';
import { analyticsRouter } from './routes/analytics.js';
import { workspacesRouter } from './routes/workspaces.js';
import { gdprRouter } from './routes/gdpr.js';
import { webhooksRouter } from './routes/webhooks.js';
import { paymentsRouter } from './routes/payments.js';
import { aiRouter } from './routes/ai.js';
import { aiFormGeneratorService } from './services/AIFormGeneratorService.js';

dotenv.config();

const app = express();

// Security headers
app.use(
	helmet({
		crossOriginResourcePolicy: { policy: 'cross-origin' },
	}),
);

// CORS
app.use(
	cors({
		origin:
			process.env.ALLOWED_ORIGINS?.split(',') ?? [
				'http://localhost:3000',
				'http://localhost:5173',
			],
		credentials: true,
	}),
);

// Request logging
app.use(httpLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Health + readiness probes (excluded from rate limiting and request logging)
app.get('/health', (_req, res) => {
	res.status(200).json({ status: 'ok', service: 'api', timestamp: new Date().toISOString() });
});

app.get('/readyz', (_req, res) => {
	res.status(200).json({ status: 'ready' });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/forms', formsRouter);
app.use('/api/forms/:formId/submissions', submissionsRouter);
app.use('/api/templates', templatesRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/workspaces', workspacesRouter);
app.use('/api/gdpr', gdprRouter);
app.use('/api', webhooksRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/ai', aiRouter);

// Configure AI service if API key is available
if (process.env.GEMINI_API_KEY) {
	aiFormGeneratorService.configure({
		apiKey: process.env.GEMINI_API_KEY,
		model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
	});
	logger.info('AI Form Generator service configured with Google Gemini');
}

// 404 handler
app.use((_req, res) => {
	res.status(404).json({
		success: false,
		error: { code: 'NOT_FOUND', message: 'Route not found' },
	});
});

// Global error handler
app.use(
	(
		error: unknown,
		_req: express.Request,
		res: express.Response,
		_next: express.NextFunction,
	) => {
		const message = error instanceof Error ? error.message : 'Unexpected error';
		logger.error({ err: error }, 'Unhandled error');
		res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
	},
);

export { app };
