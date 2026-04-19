import { nanoid } from 'nanoid';
import { FormSchema, FormComponent } from '../../modules/Core/types';

export interface FormTemplate {
  id: string;
  label: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  fields: number;
  buildSchema: () => Partial<FormSchema>;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface RawTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  design: {
    theme?: string;
    colors?: Record<string, string>;
    fonts?: Record<string, string>;
    layout?: string;
  };
  fields: Array<{
    type: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
    options?: Array<{ label: string; value: string }>;
    minLength?: number;
    maxLength?: number;
    rows?: number;
    helperText?: string;
  }>;
}


// Helper to build a component quickly
function field(
  type: FormComponent['type'],
  label: string,
  props: Record<string, any> = {},
  validation: any[] = [],
): FormComponent {
  return {
    id: nanoid(),
    type,
    label,
    properties: props,
    validation,
    styles: {},
  };
}

/**
 * Converts a raw template from JSON to FormTemplate format
 */
function convertRawTemplate(raw: RawTemplate): FormTemplate {
  const components: FormComponent[] = [];

  // Add heading
  components.push(
    field('heading', raw.name, { level: 2, content: raw.name })
  );

  // Add description if present
  if (raw.description) {
    components.push(
      field('paragraph', 'Description', { content: raw.description })
    );
  }

  // Convert fields
  if (raw.fields && Array.isArray(raw.fields)) {
    raw.fields.forEach((fieldDef) => {
      const validation: any[] = fieldDef.required ? [{ id: nanoid(), type: 'required' as const, message: '' }] : [];

      const props: Record<string, any> = {};

      if (fieldDef.placeholder) props.placeholder = fieldDef.placeholder;
      if (fieldDef.helperText) props.helperText = fieldDef.helperText;
      if (fieldDef.rows) props.rows = fieldDef.rows;

      // Handle select/radio/checkbox options
      if (fieldDef.options) {
        props.options = fieldDef.options.map((opt) => ({
          id: nanoid(),
          label: opt.label,
          value: opt.value,
        }));
      }

      components.push(
        field(fieldDef.type as any, fieldDef.label || 'Field', props, validation)
      );
    });
  }

  // Find a gradient color (simple heuristic)
  const categoryColors: Record<string, string> = {
    'job-application-forms': 'from-gray-700 to-gray-900',
    'event-registration-forms': 'from-green-500 to-emerald-600',
    'feedback-forms': 'from-yellow-500 to-orange-500',
    'medical-forms': 'from-blue-500 to-blue-600',
    'contact-forms': 'from-blue-500 to-blue-600',
    'education-forms': 'from-indigo-500 to-purple-600',
    'ecommerce-order-forms': 'from-red-500 to-rose-600',
    'survey-forms': 'from-slate-600 to-slate-800',
    'appointment-booking-forms': 'from-teal-500 to-emerald-600',
    'newsletter-subscription-forms': 'from-indigo-500 to-blue-600',
    'volunteer-donation-forms': 'from-rose-500 to-red-600',
    'legal-compliance-forms': 'from-slate-700 to-slate-900',
    'fitness-wellness-forms': 'from-red-600 to-orange-600',
    'restaurant-food-forms': 'from-amber-700 to-orange-800',
    'real-estate-forms': 'from-blue-700 to-blue-900',
    'travel-hospitality-forms': 'from-blue-500 to-cyan-600',
    'creative-portfolio-forms': 'from-pink-500 to-rose-600',
    'pet-animal-forms': 'from-orange-600 to-amber-700',
  };

  const color = categoryColors[raw.category] || 'from-blue-500 to-indigo-600';

  return {
    id: raw.id,
    label: raw.name,
    description: raw.description,
    category: raw.category,
    icon: '📋', // Default icon; should be added to JSON
    color,
    fields: raw.fields?.length || 0,
    buildSchema: () => ({
      title: raw.name,
      description: raw.description,
      components,
      settings: {
        submitButtonText: 'Submit',
        successMessage: 'Thank you for your submission!',
        layout: 'vertical' as const,
        multiStep: false,
        theme: raw.design?.theme || 'blue',
      },
    }),
  };
}

/**
 * TemplateService: Load templates from JSON files
 */
export const templateService = {
  /**
   * Load all categories from the static JSON file
   */
  async loadCategories(): Promise<TemplateCategory[]> {
    try {
      const response = await fetch('/data/categories.json');
      if (!response.ok) throw new Error('Failed to load categories');
      const data = await response.json();
      return data.categories || [];
    } catch (error) {
      console.error('Error loading categories:', error);
      return [];
    }
  },

  /**
   * Load all templates from the static JSON file
   */
  async loadTemplates(): Promise<FormTemplate[]> {
    try {
      const response = await fetch('/data/templates-catalog.json');
      if (!response.ok) throw new Error('Failed to load templates');
      const data = await response.json();

      if (!data.templates || !Array.isArray(data.templates)) {
        return [];
      }

      return data.templates.map((raw: RawTemplate) => convertRawTemplate(raw));
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  },

  /**
   * Get a single template by ID
   */
  async getTemplate(templateId: string): Promise<FormTemplate | null> {
    const templates = await this.loadTemplates();
    return templates.find((t) => t.id === templateId) || null;
  },

  /**
   * Get templates filtered by category
   */
  async getTemplatesByCategory(categoryId: string): Promise<FormTemplate[]> {
    const templates = await this.loadTemplates();
    return templates.filter((t) => t.category === categoryId);
  },
};
