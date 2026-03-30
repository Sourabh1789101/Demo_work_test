import { Router } from 'express';
import {
	deleteAccount,
	getProfile,
	login,
	logout,
	refreshToken,
	register,
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { loginSchema, registerSchema, validate } from '../middleware/validator.js';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', validate(registerSchema), register);

// POST /api/auth/login  — stricter rate limiting for credential endpoints
authRouter.post('/login', authLimiter, validate(loginSchema), login);

// POST /api/auth/refresh
authRouter.post('/refresh', refreshToken);

// POST /api/auth/logout
authRouter.post('/logout', authenticateToken, logout);

// GET /api/auth/profile
authRouter.get('/profile', authenticateToken, getProfile);

// DELETE /api/auth/me  — GDPR right to erasure
authRouter.delete('/me', authenticateToken, deleteAccount);
