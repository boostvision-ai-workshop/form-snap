import { apiClient } from './client';

export interface UserMeResponse {
  uid: string;
  id: string;
  email: string;
  email_verified: boolean;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export async function getMe(): Promise<UserMeResponse> {
  const response = await apiClient('/api/v1/me', { method: 'GET' });
  return response.json() as Promise<UserMeResponse>;
}
