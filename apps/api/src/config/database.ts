import dotenv from 'dotenv';
import { Pool, type PoolClient } from 'pg';
import { loadAllTemplateCategories } from '../data/allCategoriesLoader.js';
import { TEMPLATE_CATALOG_SEED } from '../data/formTemplatesWithDesign.js';
import type { FormTemplate, TemplateCategorySeed } from '../types/templateCatalog.js';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('DATABASE_URL is required for API startup');
}

export const pool = new Pool({ connectionString });

const createBuilderTables = async (client: PoolClient): Promise<void> => {
	await client.query(`
		CREATE TABLE IF NOT EXISTS forms (
			id TEXT PRIMARY KEY,
			user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
			title TEXT NOT NULL,
			description TEXT,
			schema JSONB NOT NULL,
			is_published BOOLEAN NOT NULL DEFAULT TRUE,
			submission_count INTEGER NOT NULL DEFAULT 0,
			ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
			generation_metadata JSONB,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`);

	await client.query('ALTER TABLE forms ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;');
	await client.query('ALTER TABLE forms ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT TRUE;');
	await client.query('ALTER TABLE forms ADD COLUMN IF NOT EXISTS submission_count INTEGER NOT NULL DEFAULT 0;');
	await client.query('ALTER TABLE forms ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN NOT NULL DEFAULT FALSE;');
	await client.query('ALTER TABLE forms ADD COLUMN IF NOT EXISTS generation_metadata JSONB;');
	await client.query('CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);');

	await client.query(`
		CREATE TABLE IF NOT EXISTS submissions (
			id TEXT PRIMARY KEY,
			form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
			data JSONB NOT NULL,
			metadata JSONB,
			submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`);

	await client.query('CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON submissions(form_id);');
	await client.query('CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON submissions(submitted_at DESC);');
};

const createTemplateCatalogTables = async (client: PoolClient): Promise<void> => {
	await client.query(`
		CREATE TABLE IF NOT EXISTS template_categories (
			category_slug TEXT PRIMARY KEY,
			category_name TEXT NOT NULL,
			description TEXT,
			template_count TEXT,
			source_url TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`);

	await client.query('ALTER TABLE template_categories ADD COLUMN IF NOT EXISTS template_count TEXT;');
	await client.query('ALTER TABLE template_categories ADD COLUMN IF NOT EXISTS source_url TEXT;');

	await client.query(`
		CREATE TABLE IF NOT EXISTS form_templates (
			id TEXT PRIMARY KEY,
			category_slug TEXT NOT NULL REFERENCES template_categories(category_slug) ON DELETE CASCADE,
			name TEXT NOT NULL,
			description TEXT,
			design_settings JSONB NOT NULL,
			fields JSONB NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`);

	await client.query(`
		CREATE TABLE IF NOT EXISTS template_responses (
			id TEXT PRIMARY KEY,
			template_id TEXT NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,
			answers JSONB NOT NULL,
			submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`);

	await client.query('CREATE INDEX IF NOT EXISTS idx_form_templates_category_slug ON form_templates(category_slug);');
	await client.query('CREATE INDEX IF NOT EXISTS idx_template_responses_template_id ON template_responses(template_id);');
};

const resolveTemplateCategorySlug = (
	seedCategorySlug: string,
	loadedCategoriesBySlug: Map<string, TemplateCategorySeed>
): string => {
	if (loadedCategoriesBySlug.has(seedCategorySlug)) {
		return seedCategorySlug;
	}

	const fallbackSlugCandidates = [
		seedCategorySlug.replace(/-forms?$/, ''),
		seedCategorySlug.replace(/-form$/, ''),
	].filter((candidate) => candidate.length > 0);

	for (const candidateSlug of fallbackSlugCandidates) {
		if (loadedCategoriesBySlug.has(candidateSlug)) {
			return candidateSlug;
		}
	}

	return seedCategorySlug;
};

const mergeCategorySources = (): {
	mergedCategories: TemplateCategorySeed[];
	templateAssignments: Array<{ categorySlug: string; template: FormTemplate }>;
} => {
	const importedCategories = loadAllTemplateCategories();
	const categoriesBySlug = new Map<string, TemplateCategorySeed>();

	for (const importedCategory of importedCategories) {
		categoriesBySlug.set(importedCategory.category_slug, importedCategory);
	}

	const templateAssignments: Array<{ categorySlug: string; template: FormTemplate }> = [];

	for (const seedCategory of TEMPLATE_CATALOG_SEED) {
		const resolvedCategorySlug = resolveTemplateCategorySlug(seedCategory.category_slug, categoriesBySlug);
		const existingCategory = categoriesBySlug.get(resolvedCategorySlug);

		if (existingCategory) {
			categoriesBySlug.set(resolvedCategorySlug, {
				...existingCategory,
				category_name: seedCategory.category_name,
				description: existingCategory.description ?? seedCategory.description ?? null,
			});
		} else {
			categoriesBySlug.set(resolvedCategorySlug, {
				category_slug: resolvedCategorySlug,
				category_name: seedCategory.category_name,
				description: seedCategory.description ?? null,
				template_count: null,
				source_url: null,
			});
		}

		for (const template of seedCategory.templates) {
			templateAssignments.push({ categorySlug: resolvedCategorySlug, template });
		}
	}

	return {
		mergedCategories: Array.from(categoriesBySlug.values()),
		templateAssignments,
	};
};

export const seedTemplateCatalog = async (force = false): Promise<void> => {
	const client = await pool.connect();
	const { mergedCategories, templateAssignments } = mergeCategorySources();

	try {
		await client.query('BEGIN');

		if (force) {
			await client.query('DELETE FROM template_responses;');
			await client.query('DELETE FROM form_templates;');
			await client.query('DELETE FROM template_categories;');
		}

		for (const category of mergedCategories) {
			await client.query(
				`
					INSERT INTO template_categories (category_slug, category_name, description, template_count, source_url)
					VALUES ($1, $2, $3, $4, $5)
					ON CONFLICT (category_slug)
					DO UPDATE SET
						category_name = EXCLUDED.category_name,
						description = EXCLUDED.description,
						template_count = EXCLUDED.template_count,
						source_url = EXCLUDED.source_url,
						updated_at = NOW()
				`,
				[
					category.category_slug,
					category.category_name,
					category.description ?? null,
					category.template_count ?? null,
					category.source_url ?? null,
				]
			);
		}

		for (const assignment of templateAssignments) {
			await client.query(
				`
					INSERT INTO form_templates (id, category_slug, name, description, design_settings, fields)
					VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
					ON CONFLICT (id)
					DO UPDATE SET
						category_slug = EXCLUDED.category_slug,
						name = EXCLUDED.name,
						description = EXCLUDED.description,
						design_settings = EXCLUDED.design_settings,
						fields = EXCLUDED.fields,
						updated_at = NOW()
				`,
				[
					assignment.template.id,
					assignment.categorySlug,
					assignment.template.name,
					assignment.template.description,
					JSON.stringify(assignment.template.design_settings),
					JSON.stringify(assignment.template.fields),
				]
			);
		}

		await client.query('COMMIT');
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}
};

const createPaymentTables = async (client: PoolClient): Promise<void> => {
	await client.query(`
		CREATE TABLE IF NOT EXISTS payments (
			id TEXT PRIMARY KEY,
			form_id TEXT NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
			submission_id TEXT,
			stripe_payment_intent_id TEXT NOT NULL UNIQUE,
			amount_cents INTEGER NOT NULL,
			currency TEXT NOT NULL DEFAULT 'usd',
			status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed','refunded')),
			description TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`);

	await client.query('CREATE INDEX IF NOT EXISTS idx_payments_form_id ON payments(form_id);');
	await client.query('CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);');
	await client.query('CREATE INDEX IF NOT EXISTS idx_payments_intent ON payments(stripe_payment_intent_id);');
};

const createUserTables = async (client: PoolClient): Promise<void> => {
	await client.query(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT NOT NULL UNIQUE,
			password_hash TEXT NOT NULL,
			name TEXT NOT NULL,
			role TEXT NOT NULL DEFAULT 'user',
			is_verified BOOLEAN NOT NULL DEFAULT false,
			refresh_token TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`);

	await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');

	await client.query(`
		CREATE TABLE IF NOT EXISTS audit_logs (
			id TEXT PRIMARY KEY,
			user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
			action TEXT NOT NULL,
			resource_type TEXT NOT NULL,
			resource_id TEXT,
			ip_address TEXT,
			user_agent TEXT,
			metadata JSONB,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
	`);

	await client.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);');
	await client.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);');
};

export const initDatabase = async (): Promise<void> => {
	const client = await pool.connect();

	try {
		await client.query('BEGIN');
		await createBuilderTables(client);
		await createTemplateCatalogTables(client);
		await createUserTables(client);
		await createPaymentTables(client);
		await client.query('COMMIT');
	} catch (error) {
		await client.query('ROLLBACK');
		throw error;
	} finally {
		client.release();
	}

	await seedTemplateCatalog(false);
};

