import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SettingsPage from '../app/(dashboard)/dashboard/settings/page';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockUseAuth = vi.fn();
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => mockUseTheme(),
}));

const mockApiGet = vi.fn();
vi.mock('@/lib/api', () => ({
  api: {
    get: () => mockApiGet(),
  },
}));

describe('Settings Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({ user: { uid: 'test-uid', email: 'test@example.com' } });
    mockUseTheme.mockReturnValue({ theme: 'system', setTheme: vi.fn() });
  });

  it('renders without crashing', () => {
    mockApiGet.mockResolvedValue({
      json: async () => ({
        uid: 'test-uid',
        email: 'test@example.com',
        email_verified: true,
      }),
    });
    render(<SettingsPage />);
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
  });

  it('displays profile and appearance tabs', () => {
    mockApiGet.mockResolvedValue({
      json: async () => ({
        uid: 'test-uid',
        email: 'test@example.com',
        email_verified: true,
      }),
    });
    render(<SettingsPage />);
    expect(screen.getByRole('tab', { name: /Profile/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Appearance/i })).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    mockApiGet.mockReturnValue(new Promise(() => {})); // Never resolves
    render(<SettingsPage />);
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
  });

  it('displays error when API call fails', async () => {
    mockApiGet.mockRejectedValue(new Error('Network error'));
    render(<SettingsPage />);
    
    const errorAlert = await screen.findByText(/Network error/i);
    expect(errorAlert).toBeInTheDocument();
  });
});
