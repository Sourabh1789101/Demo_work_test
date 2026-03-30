import { authService } from './authService';

type ApiError = {
  code?: string;
  message: string;
};

type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: ApiError;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

export const apiRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = authService.getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
  });

  const json = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !json.success || json.data === undefined) {
    throw new Error(json.error?.message || `API request failed with status ${response.status}`);
  }

  return json.data;
};
