import type { FormSchema } from '../../modules/Core/types';
import { apiRequest } from './api';

export type StoredForm = {
  id: string;
  title: string;
  description: string | null;
  schema: FormSchema;
  createdAt: string;
  updatedAt: string;
};

export const formService = {
  async saveForm(schema: FormSchema): Promise<StoredForm> {
    return apiRequest<StoredForm>(`/forms/${schema.id}`, {
      method: 'PUT',
      body: JSON.stringify({ schema }),
    });
  },

  async getForm(id: string): Promise<StoredForm> {
    return apiRequest<StoredForm>(`/forms/${id}`);
  },

  async listForms(): Promise<StoredForm[]> {
    return apiRequest<StoredForm[]>('/forms');
  },

  async deleteForm(id: string): Promise<{ id: string }> {
    return apiRequest<{ id: string }>(`/forms/${id}`, { method: 'DELETE' });
  },
};
