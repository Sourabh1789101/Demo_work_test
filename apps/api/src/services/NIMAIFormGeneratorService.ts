import { nanoid } from 'nanoid';
// Note: NVIDIA NIM uses REST API, no SDK needed

// Types
interface FormComponent {
  id: string;
  type: string;
  label: string;
  name?: string;
  description?: string;
  defaultValue?: any;
  properties?: Record<string, any>;
  validation?: Array<{ type: string; message?: string }>;
  styles?: Record<string, any>;
}

interface FormSchema {
  id: string;
  version: number;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  components: FormComponent[];
  settings: {
    submitButtonText: string;
    layout: string;
    theme: string;
    successMessage?: string;
  };
}

interface AIGenerationRequest {
  prompt: string;
  userId: string;
}

interface AIGenerationResponse {
  schema: FormSchema;
  tokensUsed?: {
    input: number;
    output: number;
  };
}

export class NIMAIFormGeneratorService {
  static readonly API_BASE_URL = 'https://integrate.api.nvidia.com/v1';
  static readonly MODEL = 'meta/llama-3.1-405b-instruct';

  static async generateFormFromPrompt(
    request: AIGenerationRequest,
  ): Promise<AIGenerationResponse> {
    if (!process.env.NVIDIA_NIM_API_KEY) {
      throw new Error('NVIDIA_NIM_API_KEY environment variable is not set');
    }

    const systemPrompt = `You are an expert form builder AI. Your task is to generate a JSON form schema based on user descriptions.

Rules:
1. Generate a valid FormSchema JSON object (no markdown, no code blocks - just raw JSON)
2. Each component must have: id (uuid), type (from allowed types), label, and name
3. Use these component types: textfield, email, number, textarea, phone, select, checkbox, radio, date, file, rating, heading, paragraph, divider
4. Create realistic, production-ready forms
5. Include validation rules where appropriate
6. Set reasonable defaults for all properties
7. Return ONLY valid JSON, nothing else

Form component structure:
{
  "id": "unique-uuid-v4",
  "type": "component-type",
  "label": "Display Label",
  "name": "field_name",
  "description": "Optional helper text",
  "defaultValue": null,
  "properties": {},
  "validation": [{"type": "required", "message": "This field is required"}],
  "styles": {}
}

FormSchema structure:
{
  "id": "unique-id",
  "version": 1,
  "title": "Form Title",
  "description": "Form Description",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp",
  "components": [/* array of components */],
  "settings": {
    "submitButtonText": "Submit",
    "layout": "vertical",
    "theme": "default",
    "successMessage": "Thank you!"
  }
}`;

    const userPrompt = `Create a form based on this description: "${request.prompt}"

Generate a complete, functional FormSchema JSON object that matches the description. Include all necessary fields, validations, and settings. Make it professional and user-friendly.`;

    try {
      const response = await fetch(`${this.API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NVIDIA_NIM_API_KEY}`,
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`NVIDIA NIM API error: ${response.status} - ${error}`);
      }

      const data = (await response.json()) as any;

      // Extract the text content
      const textContent = data.choices?.[0]?.message?.content;
      if (!textContent) {
        throw new Error('No text response from NVIDIA NIM');
      }

      // Parse the JSON response
      let schema: FormSchema;
      try {
        schema = JSON.parse(textContent);
      } catch (parseError) {
        // Try to extract JSON if it's wrapped in markdown code blocks
        const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          schema = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Failed to parse NVIDIA NIM response as JSON');
        }
      }

      // Validate and normalize the schema
      schema = this.normalizeSchema(schema);

      return {
        schema,
        tokensUsed: {
          input: data.usage?.prompt_tokens || 0,
          output: data.usage?.completion_tokens || 0,
        },
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`AI generation failed: ${error.message}`);
      }
      throw error;
    }
  }

  private static normalizeSchema(schema: any): FormSchema {
    const now = new Date().toISOString();

    // Ensure required fields exist
    if (!schema.id) schema.id = nanoid();
    if (!schema.version) schema.version = 1;
    if (!schema.title) schema.title = 'Untitled Form';
    if (!schema.createdAt) schema.createdAt = now;
    if (!schema.updatedAt) schema.updatedAt = now;
    if (!Array.isArray(schema.components)) schema.components = [];
    if (!schema.settings) {
      schema.settings = {
        submitButtonText: 'Submit',
        layout: 'vertical',
        theme: 'default',
        successMessage: 'Thank you for your submission!',
      };
    }

    // Normalize components
    schema.components = schema.components.map((comp: any) => {
      if (!comp.id) comp.id = nanoid();
      if (!comp.type) comp.type = 'textfield';
      if (!comp.label) comp.label = 'Untitled Field';
      if (!comp.name) comp.name = comp.label.toLowerCase().replace(/\s+/g, '_');
      if (!comp.validation) comp.validation = [];
      if (!comp.properties) comp.properties = {};
      if (!comp.styles) comp.styles = {};
      return comp;
    });

    return schema as FormSchema;
  }

  static validatePrompt(prompt: string): { valid: boolean; error?: string } {
    if (!prompt || prompt.trim().length === 0) {
      return { valid: false, error: 'Prompt cannot be empty' };
    }

    if (prompt.length > 2000) {
      return { valid: false, error: 'Prompt is too long (max 2000 characters)' };
    }

    return { valid: true };
  }
}
