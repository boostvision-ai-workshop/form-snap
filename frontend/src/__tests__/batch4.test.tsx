/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Batch-4 frontend tests.
 * Covers: AT-015 (inbox UI: pagination + row expansion), AT-016 (submissions list),
 *         AT-017 (CSV export button), AT-018 (email status badge).
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/dashboard',
  useParams: () => ({ formId: 'test-form-id' }),
}));

vi.mock('firebase/auth', () => ({
  sendEmailVerification: vi.fn(),
  getAuth: vi.fn(() => ({})),
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  GithubAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  linkWithCredential: vi.fn(),
  fetchSignInMethodsForEmail: vi.fn(),
  AuthErrorCodes: {},
}));

vi.mock('@/lib/firebase/config', () => ({
  auth: { currentUser: null },
  app: null,
}));

vi.mock('@/lib/api/submissions', () => ({
  listSubmissions: vi.fn(),
  downloadSubmissionsCsv: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { listSubmissions, downloadSubmissionsCsv } from '@/lib/api/submissions';
import type { SubmissionPage, SubmissionItem } from '@/lib/api/submissions';

const NOW = '2026-04-21T10:00:00Z';
const LATER = '2026-04-21T11:00:00Z';

function makeSubmission(
  overrides: Partial<SubmissionItem> = {},
): SubmissionItem {
  return {
    id: crypto.randomUUID(),
    created_at: NOW,
    data: { name: 'Ada', email: 'ada@example.com' },
    email_status: 'sent',
    email_attempts: 1,
    ...overrides,
  };
}

function makePage(
  items: SubmissionItem[],
  overrides: Partial<SubmissionPage> = {},
): SubmissionPage {
  return {
    items,
    page: 1,
    page_size: 25,
    total: items.length,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// EmailStatusBadge
// ---------------------------------------------------------------------------

describe('EmailStatusBadge', () => {
  it('renders "sent" badge with correct text', () => {
    const { EmailStatusBadge } = require('@/components/dashboard/email-status-badge');
    render(<EmailStatusBadge status="sent" />);
    expect(screen.getByText('Notification sent')).toBeInTheDocument();
    expect(screen.getByTestId('email-status-badge')).toHaveAttribute('data-status', 'sent');
  });

  it('renders "failed" badge with correct text (AT-020 UI)', () => {
    const { EmailStatusBadge } = require('@/components/dashboard/email-status-badge');
    render(<EmailStatusBadge status="failed" />);
    expect(screen.getByText('Notification not delivered')).toBeInTheDocument();
    expect(screen.getByTestId('email-status-badge')).toHaveAttribute('data-status', 'failed');
  });

  it('renders "pending" badge', () => {
    const { EmailStatusBadge } = require('@/components/dashboard/email-status-badge');
    render(<EmailStatusBadge status="pending" />);
    expect(screen.getByText('Notification pending')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// SubmissionRow — row expansion (AT-015)
// ---------------------------------------------------------------------------

describe('SubmissionRow', () => {
  it('renders collapsed by default with a toggle button', () => {
    const { SubmissionRow } = require('@/components/dashboard/submission-row');
    const sub = makeSubmission();
    render(<SubmissionRow submission={sub} />);
    expect(screen.getByTestId('submission-row')).toBeInTheDocument();
    // Detail panel not visible yet
    expect(screen.queryByTestId(`submission-detail-${sub.id}`)).toBeNull();
  });

  it('expands to show detail when clicked (AT-015)', () => {
    const { SubmissionRow } = require('@/components/dashboard/submission-row');
    const sub = makeSubmission({ data: { name: 'Bob', message: 'Hello' } });
    render(<SubmissionRow submission={sub} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByTestId(`submission-detail-${sub.id}`)).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('shows the EmailStatusBadge for failed submissions', () => {
    const { SubmissionRow } = require('@/components/dashboard/submission-row');
    const sub = makeSubmission({ email_status: 'failed', email_attempts: 3 });
    render(<SubmissionRow submission={sub} />);
    expect(screen.getByTestId('email-status-badge')).toHaveAttribute('data-status', 'failed');
  });
});

// ---------------------------------------------------------------------------
// SubmissionTable — AT-015, AT-016, AT-017
// ---------------------------------------------------------------------------

describe('SubmissionTable', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders loading skeletons while fetching', () => {
    const { SubmissionTable } = require('@/components/dashboard/submission-table');
    // Never resolves during this test
    (listSubmissions as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    render(<SubmissionTable formId="form-1" formName="My Form" />);
    // Loading state: skeletons should appear (no rows yet)
    expect(screen.queryByTestId('submission-row')).toBeNull();
  });

  it('renders submission rows after load (AT-015)', async () => {
    const { SubmissionTable } = require('@/components/dashboard/submission-table');
    const subs = [
      makeSubmission({ created_at: LATER }),
      makeSubmission({ created_at: NOW }),
    ];
    (listSubmissions as ReturnType<typeof vi.fn>).mockResolvedValue(makePage(subs));
    render(<SubmissionTable formId="form-1" formName="My Form" />);
    await waitFor(() => {
      const rows = screen.getAllByTestId('submission-row');
      expect(rows.length).toBe(2);
    });
  });

  it('shows empty state when no submissions', async () => {
    const { SubmissionTable } = require('@/components/dashboard/submission-table');
    (listSubmissions as ReturnType<typeof vi.fn>).mockResolvedValue(makePage([]));
    render(<SubmissionTable formId="form-1" formName="My Form" />);
    await waitFor(() => {
      expect(screen.getByText('No submissions yet')).toBeInTheDocument();
    });
  });

  it('shows pagination controls when total > page_size (AT-015)', async () => {
    const { SubmissionTable } = require('@/components/dashboard/submission-table');
    // 30 total, only 25 per page → 2 pages
    const subs = Array.from({ length: 25 }, () => makeSubmission());
    (listSubmissions as ReturnType<typeof vi.fn>).mockResolvedValue(
      makePage(subs, { total: 30, page: 1, page_size: 25 }),
    );
    render(<SubmissionTable formId="form-1" formName="My Form" />);
    await waitFor(() => {
      expect(screen.getByTestId('pagination-next')).toBeInTheDocument();
    });
  });

  it('renders export CSV button (AT-017)', async () => {
    const { SubmissionTable } = require('@/components/dashboard/submission-table');
    (listSubmissions as ReturnType<typeof vi.fn>).mockResolvedValue(makePage([]));
    render(<SubmissionTable formId="form-1" formName="My Form" />);
    await waitFor(() => {
      expect(screen.getByTestId('export-csv-button')).toBeInTheDocument();
    });
  });

  it('calls downloadSubmissionsCsv on export button click (AT-017)', async () => {
    const { SubmissionTable } = require('@/components/dashboard/submission-table');
    (listSubmissions as ReturnType<typeof vi.fn>).mockResolvedValue(makePage([]));
    (downloadSubmissionsCsv as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    render(<SubmissionTable formId="form-1" formName="My Form" />);
    await waitFor(() => {
      expect(screen.getByTestId('export-csv-button')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId('export-csv-button'));
    await waitFor(() => {
      expect(downloadSubmissionsCsv).toHaveBeenCalledWith('form-1', 'My Form');
    });
  });

  it('shows error alert when API call fails', async () => {
    const { SubmissionTable } = require('@/components/dashboard/submission-table');
    (listSubmissions as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Network error'),
    );
    render(<SubmissionTable formId="form-1" formName="My Form" />);
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// CsvExportButton standalone
// ---------------------------------------------------------------------------

describe('CsvExportButton', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders with data-testid (AT-017)', () => {
    const { CsvExportButton } = require('@/components/dashboard/csv-export-button');
    render(<CsvExportButton formId="form-1" formName="My Form" />);
    expect(screen.getByTestId('export-csv-button')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
  });

  it('shows loading text while downloading', async () => {
    const { CsvExportButton } = require('@/components/dashboard/csv-export-button');
    // Mock to never resolve (simulate in-flight)
    (downloadSubmissionsCsv as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {}),
    );
    render(<CsvExportButton formId="form-1" formName="My Form" />);
    fireEvent.click(screen.getByTestId('export-csv-button'));
    await waitFor(() => {
      expect(screen.getByText('Exporting…')).toBeInTheDocument();
    });
  });
});
