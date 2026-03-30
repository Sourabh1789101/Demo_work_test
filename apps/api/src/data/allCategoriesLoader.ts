import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TemplateCategorySeed } from '../types/templateCatalog.js';

// Resolve __dirname in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type RawCategory = {
	name?: unknown;
	slug?: unknown;
	url?: unknown;
	template_count?: unknown;
	description?: unknown;
};

const normalizeCategory = (rawCategory: RawCategory): TemplateCategorySeed | null => {
	if (typeof rawCategory.slug !== 'string' || rawCategory.slug.trim().length === 0) {
		return null;
	}

	if (typeof rawCategory.name !== 'string' || rawCategory.name.trim().length === 0) {
		return null;
	}

	return {
		category_slug: rawCategory.slug.trim(),
		category_name: rawCategory.name.trim(),
		description: typeof rawCategory.description === 'string' ? rawCategory.description.trim() : null,
		template_count: typeof rawCategory.template_count === 'string' ? rawCategory.template_count.trim() : null,
		source_url: typeof rawCategory.url === 'string' ? rawCategory.url.trim() : null,
	};
};

const resolveCategoriesFilePath = (): string | null => {
	if (process.env.TEMPLATE_CATEGORIES_PATH && fs.existsSync(process.env.TEMPLATE_CATEGORIES_PATH)) {
		return process.env.TEMPLATE_CATEGORIES_PATH;
	}

	const candidatePaths = [
		// Relative to compiled output (dist/data/) → apps/api/data/
		path.resolve(__dirname, '../../data/categories.json'),
		// Relative to source (src/data/) → apps/api/data/
		path.resolve(__dirname, '../../../data/categories.json'),
		// CWD-relative fallbacks
		path.resolve(process.cwd(), 'data/categories.json'),
		path.resolve(process.cwd(), 'categories.json'),
	];

	for (const candidatePath of candidatePaths) {
		if (fs.existsSync(candidatePath)) {
			return candidatePath;
		}
	}

	return null;
};

export const loadAllTemplateCategories = (): TemplateCategorySeed[] => {
	const categoriesFilePath = resolveCategoriesFilePath();

	if (!categoriesFilePath) {
		console.warn('Template categories JSON file not found. Falling back to template-seeded categories only.');
		return [];
	}

	const fileContents = fs.readFileSync(categoriesFilePath, 'utf-8');
	const parsed = JSON.parse(fileContents) as RawCategory[];

	if (!Array.isArray(parsed)) {
		console.warn(`Template categories JSON at ${categoriesFilePath} is not an array.`);
		return [];
	}

	const normalizedCategories = parsed
		.map((item) => normalizeCategory(item))
		.filter((item): item is TemplateCategorySeed => item !== null);

	return normalizedCategories;
};
