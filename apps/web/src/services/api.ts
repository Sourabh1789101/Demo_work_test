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

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = (configuredBaseUrl || '/api').replace(/\/+$/, '');

const buildApiUrl = (path: string): string => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const networkErrorMessage = (): string => {
  if (API_BASE_URL.startsWith('http')) {
    return `Unable to connect to API at ${API_BASE_URL}. Start the backend and PostgreSQL, then try again.`;
  }

  return 'Unable to connect to API. Start the backend and PostgreSQL, then try again.';
};

export const apiRequest = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const token = authService.getAccessToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(buildApiUrl(path), {
      ...init,
      headers,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(networkErrorMessage());
    }
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let json: ApiEnvelope<T> | null = null;
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    try {
      json = (await response.json()) as ApiEnvelope<T>;
    } catch {
      throw new Error('API returned invalid JSON. Please try again.');
    }
  }

  if (!response.ok) {
    throw new Error(json?.error?.message || `API request failed with status ${response.status}`);
  }

  if (!json?.success || json.data === undefined) {
    throw new Error(json?.error?.message || 'API response is missing expected data');
  }

  return json.data;
};
