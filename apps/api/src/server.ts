import dotenv from 'dotenv';
import { app } from './app.js';
import { initDatabase } from './config/database.js';
import { logger } from './middleware/logger.js';

dotenv.config();

const port = Number(process.env.PORT || 4000);

void initDatabase()
	.then(() => {
		app.listen(port, () => {
			logger.info(`API listening on http://localhost:${port}`);
		});
	})
	.catch((error) => {
		logger.error({ err: error }, 'Failed to initialize database');
		process.exit(1);
	});
