/**
 * Demo API interceptor.
 *
 * When NEXT_PUBLIC_DEMO_MODE === 'true', this module exports a function that
 * intercepts apiClient() calls and returns synthetic Response objects from the
 * demo store — no network requests are made.
 *
 * Usage: called exclusively from client.ts when demo mode is active.
 */

import { demoStore, DEMO_USER } from './demo-store';

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function notFound(detail = 'Not found'): Response {
  return new Response(JSON.stringify({ detail }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}

function noContent(): Response {
  return new Response(null, { status: 204 });
}

/**
 * Attempt to handle the request from the demo store.
 *
 * Returns a synthetic Response when the endpoint matches, or null when the
 * route is unrecognised (caller should fall through to real fetch).
 */
export async function demoIntercept(
  endpoint: string,
  options: RequestInit,
): Promise<Response | null> {
  const method = (options.method ?? 'GET').toUpperCase();

  // --- GET /api/v1/me ---
  if (endpoint === '/api/v1/me' && method === 'GET') {
    return json(DEMO_USER);
  }

  // --- GET /api/v1/forms ---
  if (endpoint === '/api/v1/forms' && method === 'GET') {
    return json(demoStore.listForms());
  }

  // --- POST /api/v1/forms ---
  if (endpoint === '/api/v1/forms' && method === 'POST') {
    const body = options.body ? (JSON.parse(options.body as string) as { name?: string; redirect_url?: string | null }) : {};
    const name = body.name ?? 'Untitled form';
    const form = demoStore.createForm(name, body.redirect_url);
    return json(form, 201);
  }

  // Routes with formId segment
  // Match /api/v1/forms/:id  (PATCH, DELETE)
  // Match /api/v1/forms/:id/submissions(.csv)?(\?...)?
  const formBase = '/api/v1/forms/';
  if (endpoint.startsWith(formBase)) {
    const rest = endpoint.slice(formBase.length);

    // /api/v1/forms/:id/submissions.csv
    if (rest.includes('/submissions.csv')) {
      const formId = rest.split('/')[0];
      return buildCsvResponse(formId);
    }

    // /api/v1/forms/:id/submissions?page=&page_size=
    const submissionsMatch = rest.match(/^([^/?]+)\/submissions(\?.*)?$/);
    if (submissionsMatch && method === 'GET') {
      const formId = submissionsMatch[1];
      const qs = submissionsMatch[2] ?? '';
      const params = new URLSearchParams(qs.replace(/^\?/, ''));
      const page = parseInt(params.get('page') ?? '1', 10);
      const pageSize = parseInt(params.get('page_size') ?? '25', 10);
      const result = demoStore.listSubmissions(formId, page, pageSize);
      return json(result);
    }

    // /api/v1/forms/:id  (no trailing segment)
    const idOnlyMatch = rest.match(/^([^/?]+)$/);
    if (idOnlyMatch) {
      const formId = idOnlyMatch[1];

      if (method === 'PATCH') {
        const body = options.body
          ? (JSON.parse(options.body as string) as { name?: string; redirect_url?: string | null })
          : {};
        const updated = demoStore.updateForm(formId, body);
        if (!updated) return notFound('Form not found');
        return json(updated);
      }

      if (method === 'DELETE') {
        const deleted = demoStore.deleteForm(formId);
        if (!deleted) return notFound('Form not found');
        return noContent();
      }
    }
  }

  // Unknown route — let caller decide what to do
  return null;
}

/** Build a text/csv Response from the demo store. */
function buildCsvResponse(formId: string): Response {
  const submissions = demoStore.allSubmissions(formId);

  // Gather all data keys in order from all submissions
  const keySet = new Set<string>();
  for (const sub of submissions) {
    Object.keys(sub.data).forEach((k) => keySet.add(k));
  }
  const dataKeys = Array.from(keySet);
  const headers = ['id', 'created_at', ...dataKeys, 'email_status', 'email_attempts'];

  function csvEscape(value: unknown): string {
    const str = value === null || value === undefined ? '' : String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const rows = [
    headers.join(','),
    ...submissions.map((sub) =>
      [
        sub.id,
        sub.created_at,
        ...dataKeys.map((k) => csvEscape(sub.data[k])),
        sub.email_status,
        sub.email_attempts,
      ]
        .map(csvEscape)
        .join(','),
    ),
  ];

  const csvText = rows.join('\n');

  return new Response(csvText, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${formId}-submissions.csv"`,
    },
  });
}
