import { apiRequest } from './api';
import { FormSchema } from '../../modules/Core/types';

export interface AIGenerationResponse {
  form: {
    id: string;
    title: string;
    description?: string;
    schema: FormSchema;
  };
  tokensUsed: {
    input: number;
    output: number;
  };
}

export class AIFormService {
  static async generateForm(prompt: string): Promise<AIGenerationResponse> {
    const response = await apiRequest<AIGenerationResponse>('/ai/generate-form', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
    return response;
  }
}
