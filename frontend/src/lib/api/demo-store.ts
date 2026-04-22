/**
 * Demo store — in-memory mutable data for GitHub Pages / static demo mode.
 *
 * Activated when NEXT_PUBLIC_DEMO_MODE === 'true'.
 * Reset on page refresh is intentional (stateless demo).
 */

import type { FormListItem, FormResponse } from './forms';
import type { SubmissionItem, SubmissionPage } from './submissions';
import type { UserMeResponse } from './me';

// ---------------------------------------------------------------------------
// Demo user
// ---------------------------------------------------------------------------

export const DEMO_USER: UserMeResponse = {
  uid: 'demo-user',
  id: 'demo-user',
  email: 'demo@formsnap.dev',
  email_verified: true,
  display_name: 'Demo User',
  avatar_url: null,
  created_at: '2024-01-15T09:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isoNow(): string {
  return new Date().toISOString();
}

function makeSubmitUrl(formId: string): string {
  // In a real deployment, this would point to the API. In demo mode we use a
  // placeholder anchor so HTML snippets render correctly in the UI.
  return `https://api.formsnap.dev/submit/${formId}`;
}

function makeHtmlSnippet(formId: string): string {
  const url = makeSubmitUrl(formId);
  return [
    `<form action="${url}" method="POST">`,
    `  <input name="name" type="text" required />`,
    `  <input name="email" type="email" required />`,
    `  <textarea name="message"></textarea>`,
    `  <input type="text" name="_gotcha" style="display:none" />`,
    `  <button type="submit">Send</button>`,
    `</form>`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Seed submissions
// ---------------------------------------------------------------------------

const SEED_SUBMISSIONS: Record<string, SubmissionItem[]> = {
  'demo-contact': [
    {
      id: 'sub-c1',
      created_at: '2024-03-10T14:22:00.000Z',
      data: {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        message: 'Hi, I would love to learn more about your enterprise plans.',
      },
      email_status: 'sent',
      email_attempts: 1,
    },
    {
      id: 'sub-c2',
      created_at: '2024-03-11T09:05:00.000Z',
      data: {
        name: 'Bob Martinez',
        email: 'bob.martinez@acme.io',
        message:
          'Can you integrate with our existing Zapier workflow? Please reach out when convenient.',
      },
      email_status: 'sent',
      email_attempts: 1,
    },
    {
      id: 'sub-c3',
      created_at: '2024-03-12T16:45:00.000Z',
      data: {
        name: 'Carol White',
        email: 'carol@startup.dev',
        message: 'Interested in the Pro tier. Is annual billing available?',
      },
      email_status: 'pending',
      email_attempts: 0,
    },
    {
      id: 'sub-c4',
      created_at: '2024-03-13T11:30:00.000Z',
      data: {
        name: 'David Kim',
        email: 'david.kim@techcorp.com',
        message:
          'We need custom domain support. Is that on the roadmap? Also, do you offer SSO?',
      },
      email_status: 'sent',
      email_attempts: 2,
    },
    {
      id: 'sub-c5',
      created_at: '2024-03-14T08:10:00.000Z',
      data: {
        name: 'Eva Green',
        email: 'eva.g@freelance.me',
        message: 'Love the product! Quick question — is there a free tier for personal projects?',
      },
      email_status: 'failed',
      email_attempts: 3,
    },
  ],
  'demo-newsletter': [
    {
      id: 'sub-n1',
      created_at: '2024-03-09T20:00:00.000Z',
      data: {
        name: 'Frank Torres',
        email: 'frank@newsletter.example',
        message: '',
      },
      email_status: 'sent',
      email_attempts: 1,
    },
    {
      id: 'sub-n2',
      created_at: '2024-03-10T07:30:00.000Z',
      data: {
        name: 'Grace Lee',
        email: 'grace.lee@designco.io',
        message: '',
      },
      email_status: 'sent',
      email_attempts: 1,
    },
  ],
  'demo-feedback': [],
};

// ---------------------------------------------------------------------------
// Seed forms
// ---------------------------------------------------------------------------

function buildFormListItem(
  id: string,
  name: string,
  createdAt: string,
): FormListItem {
  const subs = SEED_SUBMISSIONS[id] ?? [];
  const lastSub = subs.length > 0 ? subs[0].created_at : null;
  return {
    id,
    name,
    redirect_url: null,
    submission_count: subs.length,
    last_submission_at: lastSub,
    submit_url: makeSubmitUrl(id),
    created_at: createdAt,
    updated_at: createdAt,
  };
}

// ---------------------------------------------------------------------------
// Mutable store (module-level — resets on page refresh)
// ---------------------------------------------------------------------------

const _forms: FormListItem[] = [
  buildFormListItem('demo-contact', 'Contact form', '2024-01-20T10:00:00.000Z'),
  buildFormListItem('demo-newsletter', 'Newsletter sign-up', '2024-02-05T12:00:00.000Z'),
  buildFormListItem('demo-feedback', 'Product feedback', '2024-02-28T15:30:00.000Z'),
];

const _submissions: Record<string, SubmissionItem[]> = {
  'demo-contact': [...SEED_SUBMISSIONS['demo-contact']],
  'demo-newsletter': [...SEED_SUBMISSIONS['demo-newsletter']],
  'demo-feedback': [...SEED_SUBMISSIONS['demo-feedback']],
};

// ---------------------------------------------------------------------------
// Store API
// ---------------------------------------------------------------------------

export const demoStore = {
  /** Return snapshot of all forms (newest first). */
  listForms(): FormListItem[] {
    return [..._forms];
  },

  /** Find a single form by id. */
  getForm(id: string): FormListItem | undefined {
    return _forms.find((f) => f.id === id);
  },

  /** Create a new form and return the FormResponse shape. */
  createForm(name: string, redirectUrl?: string | null): FormResponse {
    const id = `demo-${Date.now()}`;
    const now = isoNow();
    const listItem: FormListItem = {
      id,
      name,
      redirect_url: redirectUrl ?? null,
      submission_count: 0,
      last_submission_at: null,
      submit_url: makeSubmitUrl(id),
      created_at: now,
      updated_at: now,
    };
    _forms.unshift(listItem);
    _submissions[id] = [];

    const response: FormResponse = {
      id,
      name,
      redirect_url: redirectUrl ?? null,
      submit_url: makeSubmitUrl(id),
      html_snippet: makeHtmlSnippet(id),
      created_at: now,
      updated_at: now,
    };
    return response;
  },

  /** Patch an existing form. Returns updated FormResponse or null if not found. */
  updateForm(id: string, patch: { name?: string; redirect_url?: string | null }): FormResponse | null {
    const idx = _forms.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    const now = isoNow();
    const existing = _forms[idx];
    const updated: FormListItem = {
      ...existing,
      name: patch.name ?? existing.name,
      redirect_url: patch.redirect_url !== undefined ? patch.redirect_url : existing.redirect_url,
      updated_at: now,
    };
    _forms[idx] = updated;
    return {
      id: updated.id,
      name: updated.name,
      redirect_url: updated.redirect_url,
      submit_url: updated.submit_url,
      html_snippet: makeHtmlSnippet(updated.id),
      created_at: updated.created_at,
      updated_at: now,
    };
  },

  /** Delete a form. Returns true if found & removed. */
  deleteForm(id: string): boolean {
    const idx = _forms.findIndex((f) => f.id === id);
    if (idx === -1) return false;
    _forms.splice(idx, 1);
    delete _submissions[id];
    return true;
  },

  /** Return a paginated submission page. */
  listSubmissions(formId: string, page: number, pageSize: number): SubmissionPage {
    const all = _submissions[formId] ?? [];
    // Newest first
    const sorted = [...all].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    const start = (page - 1) * pageSize;
    const items = sorted.slice(start, start + pageSize);
    return {
      items,
      page,
      page_size: pageSize,
      total: all.length,
    };
  },

  /** Return all submissions for CSV export. */
  allSubmissions(formId: string): SubmissionItem[] {
    const all = _submissions[formId] ?? [];
    return [...all].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  },

  /** Append a public submission. Returns the new item, or null if the form does not exist. */
  addSubmission(
    formId: string,
    data: Record<string, unknown>,
  ): SubmissionItem | null {
    const form = _forms.find((f) => f.id === formId);
    if (!form) return null;
    const item: SubmissionItem = {
      id: `sub-${Date.now()}`,
      created_at: isoNow(),
      data,
      email_status: 'sent',
      email_attempts: 1,
    };
    if (!_submissions[formId]) _submissions[formId] = [];
    _submissions[formId].unshift(item);
    // Bump the form's submission_count and last_submission_at
    form.submission_count = _submissions[formId].length;
    form.last_submission_at = item.created_at;
    return item;
  },
};
