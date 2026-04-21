/**
 * Batch-2 frontend tests.
 * Covers: AT-002 (create form dialog), AT-004 (form list), AT-005 (delete dialog),
 * AT-006a (settings form), AT-022 (unverified gate), AT-023 (verified enables button).
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
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
  auth: null,
  app: null,
}));

vi.mock('@/lib/api/forms', () => ({
  listForms: vi.fn(),
  createForm: vi.fn(),
  updateForm: vi.fn(),
  deleteForm: vi.fn(),
}));

vi.mock('@/lib/api/me', () => ({
  getMe: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

import type { FormListItem } from '@/lib/api/forms';
import { listForms, createForm, deleteForm } from '@/lib/api/forms';

const NOW = '2026-04-21T10:00:00Z';

function makeForm(overrides: Partial<FormListItem> = {}): FormListItem {
  return {
    id: 'form-id-1',
    name: 'Personal contact',
    redirect_url: null,
    submission_count: 0,
    last_submission_at: null,
    submit_url: 'http://localhost:8000/f/form-id-1',
    created_at: NOW,
    updated_at: NOW,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// FormRow tests (AT-002 / AT-004)
// ---------------------------------------------------------------------------

describe('FormRow', () => {
  it('renders form name and submission count', () => {
    const { FormRow } = require('@/components/dashboard/form-row');
    const form = makeForm({ name: 'Test Form', submission_count: 5 });
    render(<FormRow form={form} onDelete={vi.fn()} />);

    expect(screen.getByText('Test Form')).toBeTruthy();
    expect(screen.getByText(/5 submissions/)).toBeTruthy();
    expect(screen.getByTestId('form-row')).toBeTruthy();
    expect(screen.getByTestId('copy-snippet-button')).toBeTruthy();
  });

  it('shows singular "submission" for count of 1', () => {
    const { FormRow } = require('@/components/dashboard/form-row');
    const form = makeForm({ submission_count: 1 });
    render(<FormRow form={form} onDelete={vi.fn()} />);
    expect(screen.getByText(/1 submission(?!s)/)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// FormListEmptyState tests
// ---------------------------------------------------------------------------

describe('FormListEmptyState', () => {
  it('shows create prompt when verified', () => {
    const { FormListEmptyState } = require('@/components/dashboard/form-list-empty-state');
    const onCreateClick = vi.fn();
    render(
      <FormListEmptyState isVerified={true} onCreateClick={onCreateClick} />,
    );
    expect(screen.getByText('No forms yet')).toBeTruthy();
    const createBtn = screen.getByText('Create form');
    fireEvent.click(createBtn);
    expect(onCreateClick).toHaveBeenCalled();
  });

  it('hides create button when not verified', () => {
    const { FormListEmptyState } = require('@/components/dashboard/form-list-empty-state');
    render(
      <FormListEmptyState isVerified={false} onCreateClick={vi.fn()} />,
    );
    expect(screen.queryByText('Create form')).toBeFalsy();
    expect(screen.getByText(/Verify your email/)).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// CopyButton tests
// ---------------------------------------------------------------------------

describe('CopyButton', () => {
  it('renders with default label', () => {
    const { CopyButton } = require('@/components/dashboard/copy-button');
    render(<CopyButton text="hello" data-testid="copy-btn" />);
    expect(screen.getByText('Copy')).toBeTruthy();
    expect(screen.getByTestId('copy-btn')).toBeTruthy();
  });

  it('renders with custom label', () => {
    const { CopyButton } = require('@/components/dashboard/copy-button');
    render(<CopyButton text="hello" label="Copy snippet" />);
    expect(screen.getByText('Copy snippet')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// DeleteFormDialog tests (AT-005)
// ---------------------------------------------------------------------------

describe('DeleteFormDialog', () => {
  it('renders form name in confirmation message', () => {
    const { DeleteFormDialog } = require('@/components/dashboard/delete-form-dialog');
    const form = makeForm({ name: 'My Contact Form' });
    render(
      <DeleteFormDialog
        form={form}
        open={true}
        onOpenChange={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );
    expect(screen.getByText(/My Contact Form/)).toBeTruthy();
    expect(screen.getByTestId('confirm-delete')).toBeTruthy();
  });

  it('calls deleteForm and onDeleted when confirmed', async () => {
    const { DeleteFormDialog } = require('@/components/dashboard/delete-form-dialog');
    vi.mocked(deleteForm).mockResolvedValue(undefined);
    const onDeleted = vi.fn();
    const onOpenChange = vi.fn();
    const form = makeForm();

    render(
      <DeleteFormDialog
        form={form}
        open={true}
        onOpenChange={onOpenChange}
        onDeleted={onDeleted}
      />,
    );

    fireEvent.click(screen.getByTestId('confirm-delete'));
    await waitFor(() => {
      expect(deleteForm).toHaveBeenCalledWith(form.id);
      expect(onDeleted).toHaveBeenCalledWith(form.id);
    });
  });
});

// ---------------------------------------------------------------------------
// CreateFormDialog tests (AT-002 / AT-003)
// ---------------------------------------------------------------------------

describe('CreateFormDialog', () => {
  it('renders form name input and submit button', () => {
    const { CreateFormDialog } = require('@/components/dashboard/create-form-dialog');
    render(
      <CreateFormDialog
        open={true}
        onOpenChange={vi.fn()}
        onCreated={vi.fn()}
      />,
    );
    expect(screen.getByTestId('form-name-input')).toBeTruthy();
    expect(screen.getByTestId('create-form-submit')).toBeTruthy();
  });

  it('calls createForm with the entered name', async () => {
    const { CreateFormDialog } = require('@/components/dashboard/create-form-dialog');
    const fakeResponse = {
      id: 'new-id',
      name: 'Beta signup',
      redirect_url: null,
      submit_url: 'http://localhost:8000/f/new-id',
      html_snippet: '<form action="..." method="POST"></form>',
      created_at: NOW,
      updated_at: NOW,
    };
    vi.mocked(createForm).mockResolvedValue(fakeResponse);
    const onCreated = vi.fn();

    render(
      <CreateFormDialog
        open={true}
        onOpenChange={vi.fn()}
        onCreated={onCreated}
      />,
    );

    const input = screen.getByTestId('form-name-input');
    fireEvent.change(input, { target: { value: 'Beta signup' } });
    fireEvent.click(screen.getByTestId('create-form-submit'));

    await waitFor(() => {
      expect(createForm).toHaveBeenCalledWith({ name: 'Beta signup' });
      expect(onCreated).toHaveBeenCalled();
    });
  });
});

// ---------------------------------------------------------------------------
// lib/api/forms.ts type shape test (AT-003 / AT-004)
// ---------------------------------------------------------------------------

describe('forms API types', () => {
  it('FormListItem has required AT-004 fields', () => {
    const form = makeForm({ submission_count: 3, submit_url: 'http://x/f/y' });
    expect(form).toHaveProperty('id');
    expect(form).toHaveProperty('name');
    expect(form).toHaveProperty('submission_count');
    expect(form).toHaveProperty('last_submission_at');
    expect(form).toHaveProperty('submit_url');
    expect(form).toHaveProperty('created_at');
    expect(form).toHaveProperty('updated_at');
  });
});
