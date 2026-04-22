import { authProvider } from '@/lib/auth';
import type { AuthUser } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const IS_DEMO = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Module-level cached user reference updated via onAuthStateChanged
let _currentUser: AuthUser | null = null;

if (typeof window !== 'undefined') {
  authProvider.onAuthStateChanged((u) => {
    _currentUser = u;
  });
}

async function getAuthToken(forceRefresh = false): Promise<string> {
  const user = _currentUser;
  if (!user) {
    throw new ApiError('Not authenticated', 401);
  }
  return user.getIdToken(forceRefresh);
}

export async function apiClient(
  endpoint: string,
  options: RequestInit = {},
): Promise<Response> {
  // In demo mode, intercept all requests and serve from the in-memory store.
  if (IS_DEMO) {
    const { demoIntercept } = await import('./demo-interceptor');
    const demoResponse = await demoIntercept(endpoint, options);
    if (demoResponse !== null) {
      return demoResponse;
    }
    // Unknown demo route — fall through to a 404 rather than hitting the network.
    throw new ApiError('Not found (demo mode)', 404);
  }

  const token = await getAuthToken(false);

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // Single 401 retry with forced token refresh
  if (response.status === 401) {
    try {
      const freshToken = await getAuthToken(true);
      const retryResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
          Authorization: `Bearer ${freshToken}`,
        },
      });

      if (!retryResponse.ok) {
        const data = await retryResponse.json().catch(() => null);
        throw new ApiError(
          data?.detail || `Request failed with status ${retryResponse.status}`,
          retryResponse.status,
          data,
        );
      }

      return retryResponse;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Authentication failed', 401);
    }
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new ApiError(
      data?.detail || `Request failed with status ${response.status}`,
      response.status,
      data,
    );
  }

  return response;
}
