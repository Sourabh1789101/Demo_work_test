import { randomUUID } from 'node:crypto';
import { pool } from '../config/database.js';
import type {
	FormTemplate,
	FormTemplateWithCategory,
	StoredTemplateResponse,
	TemplateAnswers,
	TemplateCategory,
} from '../types/templateCatalog.js';

type CategoryWithTemplatesRow = {
	category_slug: string;
	category_name: string;
	description: string | null;
	template_count: string | null;
	source_url: string | null;
	templates: unknown;
};

type TemplateRow = {
	id: string;
	category_slug: string;
	category_name: string;
	category_description: string | null;
	name: string;
	description: string;
	design_settings: unknown;
	fields: unknown;
};

export class TemplateCatalogService {
	static async listTemplateCategories(): Promise<TemplateCategory[]> {
		const result = await pool.query<CategoryWithTemplatesRow>(`
			SELECT
				c.category_slug,
				c.category_name,
				c.description,
				c.template_count,
				c.source_url,
				COALESCE(
					json_agg(
						json_build_object(
							'id', t.id,
							'name', t.name,
							'description', t.description,
							'design_settings', t.design_settings,
							'fields', t.fields
						)
						ORDER BY t.name
					) FILTER (WHERE t.id IS NOT NULL),
					'[]'::json
				) AS templates
			FROM template_categories c
			LEFT JOIN form_templates t ON t.category_slug = c.category_slug
			GROUP BY c.category_slug, c.category_name, c.description, c.template_count, c.source_url
			ORDER BY c.category_name;
		`);

		return result.rows.map((row) => ({
			category_slug: row.category_slug,
			category_name: row.category_name,
			description: row.description,
			template_count: row.template_count,
			source_url: row.source_url,
			templates: Array.isArray(row.templates) ? (row.templates as FormTemplate[]) : [],
		}));
	}

	static async getTemplateById(templateId: string): Promise<FormTemplateWithCategory | null> {
		const result = await pool.query<TemplateRow>(
			`
				SELECT
					t.id,
					t.category_slug,
					c.category_name,
					c.description AS category_description,
					t.name,
					t.description,
					t.design_settings,
					t.fields
				FROM form_templates t
				INNER JOIN template_categories c ON c.category_slug = t.category_slug
				WHERE t.id = $1
			`,
			[templateId]
		);

		if (result.rowCount === 0) {
			return null;
		}

		const row = result.rows[0];
		return {
			id: row.id,
			name: row.name,
			description: row.description,
			design_settings: row.design_settings as FormTemplate['design_settings'],
			fields: (Array.isArray(row.fields) ? row.fields : []) as FormTemplate['fields'],
			category_slug: row.category_slug,
			category_name: row.category_name,
			category_description: row.category_description,
		};
	}

	static async createTemplateResponse(templateId: string, answers: TemplateAnswers): Promise<StoredTemplateResponse> {
		const responseId = randomUUID();

		const result = await pool.query<StoredTemplateResponse>(
			`
				INSERT INTO template_responses (id, template_id, answers)
				VALUES ($1, $2, $3::jsonb)
				RETURNING id, template_id, answers, submitted_at
			`,
			[responseId, templateId, JSON.stringify(answers)]
		);

		return result.rows[0];
	}
}
