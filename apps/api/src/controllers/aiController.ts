import { Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { pool } from '../config/database.js';
import { logger } from '../middleware/logger.js';
import { aiFormGeneratorService, GeneratedFormSchema } from '../services/AIFormGeneratorService.js';
import { AuditService } from '../services/AuditService.js';

// Rate limiting map: userId -> { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // 10 generations per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
	const now = Date.now();
	const userLimit = rateLimitMap.get(userId);

	if (!userLimit || now > userLimit.resetTime) {
		// Reset or initialize
		rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
		return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_LIMIT_WINDOW };
	}

	if (userLimit.count >= RATE_LIMIT) {
		return { 
			allowed: false, 
			remaining: 0, 
			resetIn: userLimit.resetTime - now 
		};
	}

	userLimit.count++;
	return { 
		allowed: true, 
		remaining: RATE_LIMIT - userLimit.count, 
		resetIn: userLimit.resetTime - now 
	};
}

export async function generateFormWithAI(req: Request, res: Response): Promise<void> {
	const userId = req.user?.id;
	if (!userId) {
		res.status(401).json({
			success: false,
			error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
		});
		return;
	}

	const { prompt, saveForm = false, workspaceId } = req.body;

	if (!prompt || typeof prompt !== 'string') {
		res.status(400).json({
			success: false,
			error: { code: 'VALIDATION_ERROR', message: 'Prompt is required' },
		});
		return;
	}

	// Check rate limit
	const rateLimit = checkRateLimit(userId);
	if (!rateLimit.allowed) {
		res.status(429).json({
			success: false,
			error: {
				code: 'RATE_LIMIT_EXCEEDED',
				message: 'AI generation limit exceeded. Please try again later.',
				details: {
					resetIn: Math.ceil(rateLimit.resetIn / 1000),
					limit: RATE_LIMIT,
					window: 'hour',
				},
			},
		});
		return;
	}

	try {
		let result;
		let usedFallback = false;

		// Check if AI service is configured
		if (!aiFormGeneratorService.isConfigured()) {
			// Use fallback template-based generation
			logger.info('AI service not configured, using fallback generation');
			const fallbackForm = aiFormGeneratorService.generateFallbackForm(prompt);
			result = {
				form: fallbackForm,
				tokensUsed: { input: 0, output: 0 },
				model: 'fallback-template',
			};
			usedFallback = true;
		} else {
			// Use AI service
			result = await aiFormGeneratorService.generateForm(prompt);
		}

		// Build form schema in the expected format
		const formSchema = {
			fields: result.form.fields.map(field => ({
				id: field.id,
				type: field.type,
				props: {
					label: field.label,
					placeholder: field.placeholder || '',
					required: field.required || false,
					options: field.options,
					validation: field.validation,
					defaultValue: field.defaultValue,
				},
			})),
		};

		let savedForm = null;

		// Optionally save the form to database
		if (saveForm) {
			const formId = nanoid();
			const now = new Date().toISOString();

			const insertResult = await pool.query(
				`INSERT INTO forms (id, user_id, title, description, schema, ai_generated, generation_metadata, created_at, updated_at)
				 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
				 RETURNING id, title, description, created_at`,
				[
					formId,
					userId,
					result.form.title,
					result.form.description,
					JSON.stringify(formSchema),
					true,
					JSON.stringify({
						prompt: prompt.substring(0, 500),
						model: result.model,
						tokensUsed: result.tokensUsed,
						generatedAt: now,
						usedFallback,
					}),
					now,
					now,
				]
			);

			savedForm = insertResult.rows[0];

			// Log audit
			await AuditService.log({
				userId,
				action: 'form.create',
				resourceType: 'form',
				resourceId: formId,
				metadata: {
					prompt: prompt.substring(0, 200),
					model: result.model,
					tokensUsed: result.tokensUsed,
					aiGenerated: true,
				},
			});
		}

		res.status(200).json({
			success: true,
			data: {
				form: {
					title: result.form.title,
					description: result.form.description,
					schema: formSchema,
				},
				savedForm,
				generation: {
					tokensUsed: result.tokensUsed,
					model: result.model,
					usedFallback,
				},
				rateLimit: {
					remaining: rateLimit.remaining,
					limit: RATE_LIMIT,
					window: 'hour',
				},
			},
		});

		logger.info({ 
			userId, 
			title: result.form.title,
			fieldCount: result.form.fields.length,
			saved: !!savedForm,
		}, 'AI form generated');

	} catch (error) {
		logger.error({ err: error, userId, prompt: prompt?.substring(0, 100) }, 'AI generation failed');

		const message = error instanceof Error ? error.message : 'Failed to generate form';
		res.status(500).json({
			success: false,
			error: { code: 'AI_GENERATION_ERROR', message },
		});
	}
}

export async function getGenerationStatus(req: Request, res: Response): Promise<void> {
	const userId = req.user?.id;
	if (!userId) {
		res.status(401).json({
			success: false,
			error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
		});
		return;
	}

	const rateLimit = checkRateLimit(userId);
	// Decrement since checkRateLimit increments
	const userLimit = rateLimitMap.get(userId);
	if (userLimit) userLimit.count = Math.max(0, userLimit.count - 1);

	const isConfigured = aiFormGeneratorService.isConfigured();

	res.status(200).json({
		success: true,
		data: {
			configured: isConfigured,
			mode: isConfigured ? 'ai' : 'fallback',
			rateLimit: {
				remaining: rateLimit.remaining + 1,
				limit: RATE_LIMIT,
				window: 'hour',
				resetIn: Math.ceil(rateLimit.resetIn / 1000),
			},
		},
	});
}

export async function getAIGeneratedForms(req: Request, res: Response): Promise<void> {
	const userId = req.user?.id;
	if (!userId) {
		res.status(401).json({
			success: false,
			error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
		});
		return;
	}

	try {
		const result = await pool.query(
			`SELECT id, title, description, generation_metadata, created_at, updated_at
			 FROM forms
			 WHERE user_id = $1 AND ai_generated = true
			 ORDER BY created_at DESC
			 LIMIT 50`,
			[userId]
		);

		res.status(200).json({
			success: true,
			data: result.rows,
		});
	} catch (error) {
		logger.error({ err: error, userId }, 'Failed to fetch AI-generated forms');
		res.status(500).json({
			success: false,
			error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch forms' },
		});
	}
}
