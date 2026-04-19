import { nanoid } from 'nanoid';
import { logger } from '../middleware/logger.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface FormField {
	id: string;
	type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'phone' | 'url' | 'file' | 'rating' | 'slider';
	label: string;
	placeholder?: string;
	required?: boolean;
	validation?: {
		min?: number;
		max?: number;
		pattern?: string;
		minLength?: number;
		maxLength?: number;
	};
	options?: { label: string; value: string }[];
	defaultValue?: string | number | boolean;
}

export interface GeneratedFormSchema {
	title: string;
	description: string;
	fields: FormField[];
}

export interface GenerationResult {
	form: GeneratedFormSchema;
	tokensUsed: {
		input: number;
		output: number;
	};
	model: string;
}

export interface AIGeneratorConfig {
	apiKey: string;
	model?: string;
	maxTokens?: number;
}

const SYSTEM_PROMPT = `You are an expert form designer. Given a description of a form, generate a JSON schema for the form.

Output ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "title": "Form Title",
  "description": "Form description",
  "fields": [
    {
      "id": "field_unique_id",
      "type": "text|email|number|textarea|select|checkbox|radio|date|phone|url|file|rating|slider",
      "label": "Field Label",
      "placeholder": "Placeholder text (optional)",
      "required": true|false,
      "validation": {
        "min": number (optional),
        "max": number (optional),
        "minLength": number (optional),
        "maxLength": number (optional),
        "pattern": "regex pattern (optional)"
      },
      "options": [{"label": "Label", "value": "value"}] (only for select/radio/checkbox),
      "defaultValue": "default value (optional)"
    }
  ]
}

Field type guidelines:
- Use "email" for email addresses
- Use "phone" for phone numbers
- Use "textarea" for long text/comments
- Use "select" for dropdowns with multiple options
- Use "radio" for single choice from few options (2-5)
- Use "checkbox" for multiple selections or yes/no
- Use "date" for dates
- Use "number" for numeric inputs
- Use "rating" for star ratings (1-5)
- Use "slider" for range selections
- Use "file" for file uploads
- Use "url" for website URLs

Always generate sensible field IDs (snake_case). Include appropriate validation based on field type.
Ensure all required fields have required: true. Generate 3-15 fields based on the complexity of the request.`;

class AIFormGeneratorService {
	private apiKey: string | null = null;
	private model: string = 'gemini-2.0-flash';
	private maxTokens: number = 2000;
	private genAI: GoogleGenerativeAI | null = null;

	configure(config: AIGeneratorConfig): void {
		this.apiKey = config.apiKey;
		this.model = config.model || 'gemini-2.0-flash';
		this.maxTokens = config.maxTokens || 2000;
		this.genAI = new GoogleGenerativeAI(this.apiKey);
	}

	isConfigured(): boolean {
		return !!this.apiKey;
	}

	async generateForm(prompt: string): Promise<GenerationResult> {
		if (!this.apiKey || !this.genAI) {
			throw new Error('AI service not configured. Please set GEMINI_API_KEY environment variable.');
		}

		if (!prompt || prompt.trim().length < 10) {
			throw new Error('Prompt must be at least 10 characters long.');
		}

		if (prompt.length > 2000) {
			throw new Error('Prompt must be less than 2000 characters.');
		}

		logger.info({ prompt: prompt.substring(0, 100) }, 'Generating form with AI');

		try {
			const model = this.genAI.getGenerativeModel({ model: this.model });

			const response = await model.generateContent({
				contents: [
					{
						role: 'user',
						parts: [
							{
								text: `${SYSTEM_PROMPT}\n\nCreate a form for: ${prompt}`,
							},
						],
					},
				],
				generationConfig: {
					maxOutputTokens: this.maxTokens,
					temperature: 0.7,
				},
			});

			const content = response.response.text();

			if (!content) {
				throw new Error('No response from AI service');
			}

			// Parse the JSON response
			let formSchema: GeneratedFormSchema;
			try {
				// Remove potential markdown code blocks
				const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
				formSchema = JSON.parse(cleanedContent);
			} catch {
				logger.error({ content }, 'Failed to parse AI response as JSON');
				throw new Error('Failed to parse AI response. Please try again.');
			}

			// Validate and enhance the schema
			formSchema = this.validateAndEnhanceSchema(formSchema);

			const tokensUsed = {
				input: response.response.usageMetadata?.promptTokenCount || 0,
				output: response.response.usageMetadata?.candidatesTokenCount || 0,
			};

			logger.info({
				title: formSchema.title,
				fieldCount: formSchema.fields.length,
				tokensUsed
			}, 'Form generated successfully');

			return {
				form: formSchema,
				tokensUsed,
				model: this.model,
			};
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Failed to generate form. Please try again.');
		}
	}

	private validateAndEnhanceSchema(schema: GeneratedFormSchema): GeneratedFormSchema {
		// Ensure required fields exist
		if (!schema.title) {
			schema.title = 'Generated Form';
		}
		if (!schema.description) {
			schema.description = '';
		}
		if (!Array.isArray(schema.fields)) {
			schema.fields = [];
		}

		// Validate and enhance each field
		schema.fields = schema.fields.map((field, index) => {
			const validTypes = ['text', 'email', 'number', 'textarea', 'select', 'checkbox', 'radio', 'date', 'phone', 'url', 'file', 'rating', 'slider'];
			
			return {
				id: field.id || `field_${nanoid(8)}`,
				type: validTypes.includes(field.type) ? field.type : 'text',
				label: field.label || `Field ${index + 1}`,
				placeholder: field.placeholder,
				required: Boolean(field.required),
				validation: field.validation || {},
				options: field.options,
				defaultValue: field.defaultValue,
			};
		});

		return schema;
	}

	// Fallback generation without AI (uses templates)
	generateFallbackForm(prompt: string): GeneratedFormSchema {
		const lowerPrompt = prompt.toLowerCase();

		if (lowerPrompt.includes('contact') || lowerPrompt.includes('feedback')) {
			return {
				title: 'Contact Form',
				description: 'Get in touch with us',
				fields: [
					{ id: 'name', type: 'text', label: 'Full Name', placeholder: 'Enter your name', required: true },
					{ id: 'email', type: 'email', label: 'Email Address', placeholder: 'Enter your email', required: true },
					{ id: 'subject', type: 'text', label: 'Subject', placeholder: 'What is this about?', required: true },
					{ id: 'message', type: 'textarea', label: 'Message', placeholder: 'Your message...', required: true },
				],
			};
		}

		if (lowerPrompt.includes('survey') || lowerPrompt.includes('feedback')) {
			return {
				title: 'Feedback Survey',
				description: 'We value your feedback',
				fields: [
					{ id: 'rating', type: 'rating', label: 'Overall Rating', required: true },
					{ id: 'satisfaction', type: 'select', label: 'How satisfied are you?', required: true, options: [
						{ label: 'Very Satisfied', value: 'very_satisfied' },
						{ label: 'Satisfied', value: 'satisfied' },
						{ label: 'Neutral', value: 'neutral' },
						{ label: 'Dissatisfied', value: 'dissatisfied' },
						{ label: 'Very Dissatisfied', value: 'very_dissatisfied' },
					]},
					{ id: 'comments', type: 'textarea', label: 'Additional Comments', placeholder: 'Share your thoughts...' },
					{ id: 'recommend', type: 'radio', label: 'Would you recommend us?', options: [
						{ label: 'Yes', value: 'yes' },
						{ label: 'No', value: 'no' },
						{ label: 'Maybe', value: 'maybe' },
					]},
				],
			};
		}

		if (lowerPrompt.includes('registration') || lowerPrompt.includes('signup') || lowerPrompt.includes('register')) {
			return {
				title: 'Registration Form',
				description: 'Create your account',
				fields: [
					{ id: 'first_name', type: 'text', label: 'First Name', placeholder: 'Enter first name', required: true },
					{ id: 'last_name', type: 'text', label: 'Last Name', placeholder: 'Enter last name', required: true },
					{ id: 'email', type: 'email', label: 'Email Address', placeholder: 'Enter your email', required: true },
					{ id: 'phone', type: 'phone', label: 'Phone Number', placeholder: '+1 (555) 000-0000' },
					{ id: 'dob', type: 'date', label: 'Date of Birth' },
					{ id: 'terms', type: 'checkbox', label: 'I agree to the terms and conditions', required: true },
				],
			};
		}

		// Default form
		return {
			title: 'Custom Form',
			description: prompt,
			fields: [
				{ id: 'field_1', type: 'text', label: 'Field 1', placeholder: 'Enter value', required: true },
				{ id: 'field_2', type: 'email', label: 'Email', placeholder: 'Enter email', required: true },
				{ id: 'field_3', type: 'textarea', label: 'Details', placeholder: 'Enter details' },
			],
		};
	}
}

export const aiFormGeneratorService = new AIFormGeneratorService();
