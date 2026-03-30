export interface TemplateDesignSettings {
	theme: string;
	primary_color?: string;
	secondary_color?: string;
	font_family?: string;
	layout?: string;
	background_type?: string;
	background_image?: string;
}

export interface TemplateField {
	type: string;
	label: string;
	placeholder?: string;
	required?: boolean;
	options?: string[];
	price?: string;
	scale?: string;
}

export interface FormTemplate {
	id: string;
	name: string;
	description: string;
	design_settings: TemplateDesignSettings;
	fields: TemplateField[];
}

export interface TemplateCategory {
	category_slug: string;
	category_name: string;
	description?: string | null;
	template_count?: string | null;
	source_url?: string | null;
	templates: FormTemplate[];
}

export interface TemplateCategorySeed {
	category_slug: string;
	category_name: string;
	description?: string | null;
	template_count?: string | null;
	source_url?: string | null;
}

export interface FormTemplateWithCategory extends FormTemplate {
	category_slug: string;
	category_name: string;
	category_description?: string | null;
}

export type TemplateAnswers = Record<string, unknown>;

export interface StoredTemplateResponse {
	id: string;
	template_id: string;
	answers: TemplateAnswers;
	submitted_at: string;
}
