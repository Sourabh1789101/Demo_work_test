/**
 * Vercel Serverless Function Handler
 * This file is automatically detected by Vercel and deployed as a function
 * Entry point: /api
 */

import dotenv from 'dotenv';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { app } from '../apps/api/src/app.js';
import { initDatabase } from '../apps/api/src/config/database.js';

dotenv.config();

let dbInitialized = false;

/**
 * Main handler for all API requests
 * Vercel will route all /api/* requests to this handler
 */
export default async (req: VercelRequest, res: VercelResponse) => {
	// Initialize database on first request
	if (!dbInitialized) {
		try {
			await initDatabase();
			dbInitialized = true;
		} catch (error) {
			res.status(500).json({
				success: false,
				error: {
					code: 'DB_INIT_ERROR',
					message: 'Failed to initialize database connection',
				},
			});
			return;
		}
	}

	// Handle the request through Express
	return new Promise((resolve) => {
		app(req, res as any);
		res.on('finish', () => {
			resolve(undefined);
		});
	});
};
