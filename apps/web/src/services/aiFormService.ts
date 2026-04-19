import { apiRequest } from './api';

export interface GenerationResponse {
  success: boolean;
  data: {
    form: {
      title: string;
      description: string;
      schema: {
        fields: Array<{
          id: string;
          type: string;
          props: {
            label: string;
            placeholder?: string;
            required?: boolean;
            options?: Array<{ label: string; value: string }>;
            validation?: Record<string, unknown>;
            defaultValue?: string | number | boolean;
          };
        }>;
      };
    };
    generation: {
      tokensUsed: { input: number; output: number };
      model: string;
      usedFallback: boolean;
    };
    rateLimit: {
      remaining: number;
      limit: number;
      window: string;
    };
  };
}

export interface GenerationStatusResponse {
  success: boolean;
  data: {
    configured: boolean;
    mode: 'ai' | 'fallback';
    rateLimit: {
      remaining: number;
      limit: number;
      window: string;
      resetIn: number;
    };
  };
}

export const aiFormService = {
  async generateForm(prompt: string, saveForm: boolean = true) {
    const response = await apiRequest<any>('/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ prompt, saveForm }),
    });
    return response;
  },

  async getGenerationStatus() {
    const response = await apiRequest<any>('/ai/status', {
      method: 'GET',
    });
    return response.data || response;
  },

  async getAIGeneratedForms() {
    const response = await apiRequest<any>('/ai/forms', {
      method: 'GET',
    });
    return response.data || response;
  },
};
