import { pool } from '../config/database.js';

export type StoredForm = {
	id: string;
	title: string;
	description: string | null;
	schema: unknown;
	createdAt: string;
	updatedAt: string;
};

type UpsertFormInput = {
	id: string;
	title: string;
	description?: string;
	schema: unknown;
};

export class FormService {
	static async listForms(): Promise<StoredForm[]> {
		const result = await pool.query(
			`
				SELECT id, title, description, schema, created_at, updated_at
				FROM forms
				ORDER BY updated_at DESC
			`
		);

		return result.rows.map((row) => ({
			id: row.id,
			title: row.title,
			description: row.description,
			schema: row.schema,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		}));
	}

	static async getFormById(id: string): Promise<StoredForm | null> {
		const result = await pool.query(
			`
				SELECT id, title, description, schema, created_at, updated_at
				FROM forms
				WHERE id = $1
			`,
			[id]
		);

		if (result.rowCount === 0) {
			return null;
		}

		const row = result.rows[0];
		return {
			id: row.id,
			title: row.title,
			description: row.description,
			schema: row.schema,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		};
	}

	static async upsertForm(input: UpsertFormInput): Promise<StoredForm> {
		const result = await pool.query(
			`
				INSERT INTO forms (id, title, description, schema)
				VALUES ($1, $2, $3, $4::jsonb)
				ON CONFLICT (id)
				DO UPDATE SET
					title = EXCLUDED.title,
					description = EXCLUDED.description,
					schema = EXCLUDED.schema,
					updated_at = NOW()
				RETURNING id, title, description, schema, created_at, updated_at
			`,
			[input.id, input.title, input.description || null, JSON.stringify(input.schema)]
		);

		const row = result.rows[0];
		return {
			id: row.id,
			title: row.title,
			description: row.description,
			schema: row.schema,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		};
	}

	static async deleteForm(id: string): Promise<boolean> {
		const result = await pool.query('DELETE FROM forms WHERE id = $1', [id]);
		return (result.rowCount || 0) > 0;
	}
}

