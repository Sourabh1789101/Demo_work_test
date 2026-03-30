import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

// ─── Type augmentation ────────────────────────────────────────────────────────

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace Express {
		interface Request {
			user?: {
				id: string;
				email: string;
				role: string;
			};
		}
	}
}

// ─── Constants ────────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-prod';

// ─── Middleware ───────────────────────────────────────────────────────────────

/**
 * Reads `Authorization: Bearer <token>`, verifies the JWT and attaches the
 * decoded payload to `req.user`.  Returns HTTP 401 on any failure.
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
	const authHeader = req.headers.authorization;

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		res.status(401).json({
			success: false,
			error: { code: 'UNAUTHORIZED', message: 'Missing or malformed Authorization header' },
		});
		return;
	}

	const token = authHeader.slice(7); // strip "Bearer "

	try {
		const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
		req.user = { id: payload.id, email: payload.email, role: payload.role };
		next();
	} catch {
		res.status(401).json({
			success: false,
			error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' },
		});
	}
};

/**
 * Middleware factory — checks that the authenticated user's role is one of
 * the supplied `roles`.  Must be used AFTER `authenticateToken`.
 * Returns HTTP 403 if the role does not match.
 */
export const requireRole =
	(...roles: string[]) =>
	(req: Request, res: Response, next: NextFunction): void => {
		if (!req.user || !roles.includes(req.user.role)) {
			res.status(403).json({
				success: false,
				error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
			});
			return;
		}
		next();
	};
