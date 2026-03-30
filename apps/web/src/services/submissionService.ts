import { apiRequest } from './api';

export type Submission = {
  id: string;
  formId: string;
  data: Record<string, unknown>;
  metadata: { ip?: string; userAgent?: string } | null;
  submittedAt: string;
};

export type SubmissionStats = {
  total: number;
  firstAt: string | null;
  lastAt: string | null;
};

export const submissionService = {
  async listSubmissions(formId: string): Promise<Submission[]> {
    return apiRequest<Submission[]>(`/forms/${formId}/submissions`);
  },

  async createSubmission(formId: string, data: Record<string, unknown>): Promise<Submission> {
    return apiRequest<Submission>(`/forms/${formId}/submissions`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  },

  async deleteSubmission(formId: string, submissionId: string): Promise<{ id: string }> {
    return apiRequest<{ id: string }>(`/forms/${formId}/submissions/${submissionId}`, {
      method: 'DELETE',
    });
  },

  async getStats(formId: string): Promise<SubmissionStats> {
    return apiRequest<SubmissionStats>(`/forms/${formId}/submissions/stats`);
  },
};
