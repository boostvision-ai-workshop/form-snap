import { auth } from '@/lib/firebase/config';
import { apiClient, ApiError } from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SubmissionItem {
  id: string;
  created_at: string;
  data: Record<string, unknown>;
  email_status: 'pending' | 'sent' | 'failed';
  email_attempts: number;
}

export interface SubmissionPage {
  items: SubmissionItem[];
  page: number;
  page_size: number;
  total: number;
}

export async function listSubmissions(
  formId: string,
  page = 1,
  pageSize = 25,
): Promise<SubmissionPage> {
  const response = await apiClient(
    `/api/v1/forms/${formId}/submissions?page=${page}&page_size=${pageSize}`,
    { method: 'GET' },
  );
  return response.json() as Promise<SubmissionPage>;
}

/**
 * Download all submissions as CSV.
 *
 * Fetches the streaming CSV endpoint using the Firebase token (via apiClient
 * internals) and triggers a browser download without navigating away.
 */
export async function downloadSubmissionsCsv(
  formId: string,
  formName: string,
): Promise<void> {
  // We cannot use apiClient directly here because we need the raw blob, not
  // parsed JSON. Replicate the token-injection logic.
  if (!auth) {
    throw new ApiError('Firebase auth not initialized', 500);
  }
  const user = auth.currentUser;
  if (!user) {
    throw new ApiError('Not authenticated', 401);
  }

  let token = await user.getIdToken(false);
  let response = await fetch(
    `${API_URL}/api/v1/forms/${formId}/submissions.csv`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  // Single retry on 401 with forced token refresh
  if (response.status === 401) {
    token = await user.getIdToken(true);
    response = await fetch(
      `${API_URL}/api/v1/forms/${formId}/submissions.csv`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(
      (data as { detail?: string } | null)?.detail ||
        `Request failed with status ${response.status}`,
      response.status,
      data,
    );
  }

  // Determine filename from Content-Disposition or construct a fallback
  const disposition = response.headers.get('content-disposition') || '';
  const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
  const filename =
    filenameMatch?.[1] ??
    `${formName.replace(/[^A-Za-z0-9._-]+/g, '-')}-submissions.csv`;

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export { ApiError };
