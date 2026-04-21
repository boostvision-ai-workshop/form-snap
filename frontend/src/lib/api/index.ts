import { apiClient } from './client';

export { apiClient, ApiError } from './client';

export const api = {
  get: (endpoint: string) => apiClient(endpoint, { method: 'GET' }),

  post: (endpoint: string, body?: unknown) =>
    apiClient(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: (endpoint: string, body?: unknown) =>
    apiClient(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (endpoint: string) => apiClient(endpoint, { method: 'DELETE' }),
};
