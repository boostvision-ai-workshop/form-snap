import { apiClient, ApiError } from './client';

export interface FormResponse {
  id: string;
  name: string;
  redirect_url: string | null;
  submit_url: string;
  html_snippet: string;
  created_at: string;
  updated_at: string;
}

export interface FormListItem {
  id: string;
  name: string;
  redirect_url: string | null;
  submission_count: number;
  last_submission_at: string | null;
  submit_url: string;
  created_at: string;
  updated_at: string;
}

export interface FormCreate {
  name: string;
  redirect_url?: string | null;
}

export interface FormUpdate {
  name?: string;
  redirect_url?: string | null;
}

export async function listForms(): Promise<FormListItem[]> {
  const response = await apiClient('/api/v1/forms', { method: 'GET' });
  return response.json() as Promise<FormListItem[]>;
}

export async function createForm(data: FormCreate): Promise<FormResponse> {
  const response = await apiClient('/api/v1/forms', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.json() as Promise<FormResponse>;
}

export async function updateForm(
  formId: string,
  data: FormUpdate,
): Promise<FormResponse> {
  const response = await apiClient(`/api/v1/forms/${formId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return response.json() as Promise<FormResponse>;
}

export async function deleteForm(formId: string): Promise<void> {
  await apiClient(`/api/v1/forms/${formId}`, { method: 'DELETE' });
}

export { ApiError };
