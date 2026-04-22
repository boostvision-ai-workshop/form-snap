import { apiClient, ApiError } from './client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

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
 * Trigger a browser file download from a Response (blob).
 */
function _triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * Download all submissions as CSV.
 *
 * In demo mode: builds the CSV client-side from the in-memory store and
 * triggers a download without any network request.
 *
 * In production mode: fetches the streaming CSV endpoint using the Firebase
 * token and triggers a browser download without navigating away.
 */
export async function downloadSubmissionsCsv(
  formId: string,
  formName: string,
): Promise<void> {
  const fallbackFilename = `${formName.replace(/[^A-Za-z0-9._-]+/g, '-')}-submissions.csv`;

  // --- Demo mode: generate CSV from store ---
  if (IS_DEMO) {
    const { demoIntercept } = await import('./demo-interceptor');
    const response = await demoIntercept(
      `/api/v1/forms/${formId}/submissions.csv`,
      { method: 'GET' },
    );
    if (!response) {
      throw new ApiError('Demo CSV not available', 404);
    }
    const blob = await response.blob();
    const disposition = response.headers.get('content-disposition') || '';
    const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
    const filename = filenameMatch?.[1] ?? fallbackFilename;
    _triggerDownload(blob, filename);
    return;
  }

  // --- Production mode: fetch streaming CSV from backend ---
  // We cannot use apiClient directly here because we need the raw blob, not
  // parsed JSON. Replicate the token-injection logic using the auth provider.
  const { authProvider } = await import('@/lib/auth');

  let _resolveToken: ((t: string | null) => void) | null = null;
  const tokenPromise = new Promise<string | null>((resolve) => {
    _resolveToken = resolve;
  });
  // Get the current user's token via a one-shot listener
  const unsub = authProvider.onAuthStateChanged(async (u) => {
    if (_resolveToken) {
      _resolveToken(u ? await u.getIdToken(false) : null);
      _resolveToken = null;
    }
  });
  const token = await tokenPromise;
  unsub();

  if (!token) {
    throw new ApiError('Not authenticated', 401);
  }

  let response = await fetch(
    `${API_URL}/api/v1/forms/${formId}/submissions.csv`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  // Single retry on 401 with forced token refresh
  if (response.status === 401) {
    const { authProvider: ap } = await import('@/lib/auth');
    let _resolveToken2: ((t: string | null) => void) | null = null;
    const tokenPromise2 = new Promise<string | null>((resolve) => {
      _resolveToken2 = resolve;
    });
    const unsub2 = ap.onAuthStateChanged(async (u) => {
      if (_resolveToken2) {
        _resolveToken2(u ? await u.getIdToken(true) : null);
        _resolveToken2 = null;
      }
    });
    const freshToken = await tokenPromise2;
    unsub2();

    if (!freshToken) throw new ApiError('Not authenticated', 401);

    response = await fetch(
      `${API_URL}/api/v1/forms/${formId}/submissions.csv`,
      {
        headers: { Authorization: `Bearer ${freshToken}` },
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

  const disposition = response.headers.get('content-disposition') || '';
  const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
  const filename = filenameMatch?.[1] ?? fallbackFilename;

  const blob = await response.blob();
  _triggerDownload(blob, filename);
}

export { ApiError };
