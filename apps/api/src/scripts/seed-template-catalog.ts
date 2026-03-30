import { initDatabase, pool, seedTemplateCatalog } from '../config/database.js';

const run = async (): Promise<void> => {
	await initDatabase();
	await seedTemplateCatalog(true);
	console.log('Template catalog seeded successfully.');
};

void run()
	.catch((error) => {
		console.error('Failed to seed template catalog:', error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await pool.end();
	});
