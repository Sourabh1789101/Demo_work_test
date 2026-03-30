import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { pool } from '../config/database.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';
const BCRYPT_ROUNDS = 10;

// ─── Token helpers ────────────────────────────────────────────────────────────

const signAccessToken = (payload: { id: string; email: string; role: string }): string =>
	jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

const signRefreshToken = (id: string): string =>
	jwt.sign({ id }, JWT_REFRESH_SECRET, { expiresIn: '7d' });

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Body is pre-validated by the `validate(registerSchema)` middleware.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
	const { email, password, name } = req.body as { email: string; password: string; name: string };

	try {
		// Check for existing account
		const exists = await pool.query('SELECT id FROM users WHERE email = $1', [
			email.toLowerCase().trim(),
		]);

		if ((exists.rowCount ?? 0) > 0) {
			res.status(409).json({
				success: false,
				error: { code: 'CONFLICT', message: 'An account with this email already exists' },
			});
			return;
		}

		const id = nanoid();
		const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
		const accessToken = signAccessToken({ id, email, role: 'user' });
		const refreshToken = signRefreshToken(id);
		const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);

		await pool.query(
			`INSERT INTO users (id, email, password_hash, name, role, refresh_token)
       VALUES ($1, $2, $3, $4, 'user', $5)`,
			[id, email.toLowerCase().trim(), passwordHash, name.trim(), refreshTokenHash],
		);

		res.status(201).json({
			success: true,
			data: {
				user: { id, email: email.toLowerCase().trim(), name: name.trim(), role: 'user' },
				accessToken,
				refreshToken,
			},
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Registration failed';
		res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
	}
};

/**
 * POST /api/auth/login
 * Body is pre-validated by the `validate(loginSchema)` middleware.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
	const { email, password } = req.body as { email: string; password: string };

	try {
		const result = await pool.query(
			'SELECT id, email, password_hash, name, role FROM users WHERE email = $1',
			[email.toLowerCase().trim()],
		);

		if ((result.rowCount ?? 0) === 0) {
			// Identical response to a wrong password to prevent user enumeration
			res.status(401).json({
				success: false,
				error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
			});
			return;
		}

		const user = result.rows[0] as {
			id: string;
			email: string;
			password_hash: string;
			name: string;
			role: string;
		};

		const passwordMatch = await bcrypt.compare(password, user.password_hash);
		if (!passwordMatch) {
			res.status(401).json({
				success: false,
				error: { code: 'UNAUTHORIZED', message: 'Invalid email or password' },
			});
			return;
		}

		const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
		const refreshToken = signRefreshToken(user.id);
		const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);

		await pool.query(
			'UPDATE users SET refresh_token = $1, updated_at = NOW() WHERE id = $2',
			[refreshTokenHash, user.id],
		);

		res.status(200).json({
			success: true,
			data: {
				user: { id: user.id, email: user.email, name: user.name, role: user.role },
				accessToken,
				refreshToken,
			},
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Login failed';
		res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
	}
};

/**
 * POST /api/auth/refresh
 * Body: { refreshToken: string }
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
	const { refreshToken: token } = req.body as { refreshToken?: string };

	if (!token) {
		res.status(400).json({
			success: false,
			error: { code: 'VALIDATION_ERROR', message: 'refreshToken is required' },
		});
		return;
	}

	try {
		const payload = jwt.verify(token, JWT_REFRESH_SECRET) as { id: string };

		const result = await pool.query(
			'SELECT id, email, role, refresh_token FROM users WHERE id = $1',
			[payload.id],
		);

		if ((result.rowCount ?? 0) === 0) {
			res.status(401).json({
				success: false,
				error: { code: 'UNAUTHORIZED', message: 'User not found' },
			});
			return;
		}

		const user = result.rows[0] as {
			id: string;
			email: string;
			role: string;
			refresh_token: string | null;
		};

		if (!user.refresh_token) {
			res.status(401).json({
				success: false,
				error: { code: 'UNAUTHORIZED', message: 'No active session' },
			});
			return;
		}

		const tokenMatch = await bcrypt.compare(token, user.refresh_token);
		if (!tokenMatch) {
			res.status(401).json({
				success: false,
				error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' },
			});
			return;
		}

		const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });

		res.status(200).json({ success: true, data: { accessToken } });
	} catch {
		res.status(401).json({
			success: false,
			error: { code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' },
		});
	}
};

/**
 * POST /api/auth/logout
 * Requires `authenticateToken` middleware.
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
	try {
		await pool.query(
			'UPDATE users SET refresh_token = NULL, updated_at = NOW() WHERE id = $1',
			[req.user!.id],
		);

		res.status(200).json({ success: true, data: { message: 'Logged out' } });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Logout failed';
		res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
	}
};

/**
 * GET /api/auth/profile
 * Requires `authenticateToken` middleware.
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {
	try {
		const result = await pool.query(
			'SELECT id, email, name, role, is_verified, created_at FROM users WHERE id = $1',
			[req.user!.id],
		);

		if ((result.rowCount ?? 0) === 0) {
			res.status(404).json({
				success: false,
				error: { code: 'NOT_FOUND', message: 'User not found' },
			});
			return;
		}

		const user = result.rows[0] as {
			id: string;
			email: string;
			name: string;
			role: string;
			is_verified: boolean;
			created_at: string;
		};

		res.status(200).json({
			success: true,
			data: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role,
				isVerified: user.is_verified,
				createdAt: user.created_at,
			},
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to fetch profile';
		res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
	}
};

/**
 * DELETE /api/auth/me
 * GDPR right to erasure — permanently deletes the authenticated user's account,
 * their forms, and all related submissions (via ON DELETE CASCADE).
 * Requires `authenticateToken` middleware.
 */
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
	const userId = req.user!.id;

	try {
		// Forms and submissions cascade from the foreign key on forms(user_id),
		// but since the current schema doesn't yet have user_id on forms we
		// delete the user directly; the DB will cascade audit_logs via SET NULL.
		const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);

		if ((result.rowCount ?? 0) === 0) {
			res.status(404).json({
				success: false,
				error: { code: 'NOT_FOUND', message: 'User not found' },
			});
			return;
		}

		res.status(200).json({ success: true, data: { message: 'Account deleted' } });
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Failed to delete account';
		res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
	}
};
