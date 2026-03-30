import type { NextFunction, Request, Response } from 'express';
import { z, type ZodSchema } from 'zod';

// ─── Shared schemas ───────────────────────────────────────────────────────────

export const registerSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(8, 'Password must be at least 8 characters'),
	name: z.string().min(2, 'Name must be at least 2 characters'),
});

export const loginSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(1, 'Password is required'),
});

// ─── Middleware factory ───────────────────────────────────────────────────────

/**
 * Returns an Express middleware that validates `req.body` against the given
 * Zod schema.  On failure it responds with HTTP 400 and structured error details.
 */
export const validate =
	(schema: ZodSchema) =>
	(req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			res.status(400).json({
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Request body validation failed',
					details: result.error.issues.map((issue) => ({
						field: issue.path.join('.'),
						message: issue.message,
					})),
				},
			});
			return;
		}

		// Replace body with the parsed (and coerced) value
		req.body = result.data;
		next();
	};
