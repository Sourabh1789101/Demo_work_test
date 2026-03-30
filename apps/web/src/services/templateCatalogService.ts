import { apiRequest } from './api';
import type {
  StoredTemplateResponse,
  TemplateAnswerMap,
  TemplateCategory,
  FormTemplate,
} from '../types/templateCatalog';

export const templateCatalogService = {
  async listCategories(): Promise<TemplateCategory[]> {
    return apiRequest<TemplateCategory[]>('/templates/categories');
  },

  async getTemplate(templateId: string): Promise<FormTemplate> {
    return apiRequest<FormTemplate>(`/templates/${templateId}`);
  },

  async submitTemplateResponse(templateId: string, answers: TemplateAnswerMap): Promise<StoredTemplateResponse> {
    return apiRequest<StoredTemplateResponse>(`/templates/${templateId}/responses`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  },
};
