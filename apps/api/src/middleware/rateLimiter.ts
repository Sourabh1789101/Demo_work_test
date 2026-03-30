import rateLimit from 'express-rate-limit';

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

/**
 * General rate limiter applied to all routes.
 * 100 requests per 15 minutes per IP.
 */
export const generalLimiter = rateLimit({
	windowMs: FIFTEEN_MINUTES,
	max: 100,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		error: { code: 'RATE_LIMITED', message: 'Too many requests. Please try again later.' },
	},
});

/**
 * Stricter rate limiter for authentication endpoints.
 * 10 requests per 15 minutes per IP.
 */
export const authLimiter = rateLimit({
	windowMs: FIFTEEN_MINUTES,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		error: {
			code: 'RATE_LIMITED',
			message: 'Too many authentication attempts. Please try again later.',
		},
	},
});

/**
 * Rate limiter for AI form generation.
 * 10 generations per hour per IP.
 */
export const aiGenerationLimiter = rateLimit({
	windowMs: ONE_HOUR,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		error: {
			code: 'RATE_LIMITED',
			message: 'Too many AI generation requests. You can generate up to 10 forms per hour. Please try again later.',
		},
	},
});
