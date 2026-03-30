/**
 * Migration script: workspace tables + forms column additions.
 *
 * Run once manually:
 *   npx tsx src/scripts/migrate-workspaces.ts
 *
 * This script is intentionally NOT invoked from initDatabase() to avoid
 * breaking an existing database on every startup.
 */
import { pool } from '../config/database.js';
import { CREATE_WORKSPACES_SQL } from '../config/workspaces.sql.js';

const run = async (): Promise<void> => {
  console.log('Running workspace migration...');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(CREATE_WORKSPACES_SQL);
    await client.query('COMMIT');
    console.log('Workspace migration completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Workspace migration failed, transaction rolled back:', err);
    process.exitCode = 1;
  } finally {
    client.release();
  }
};

void run().finally(async () => {
  await pool.end();
});
