import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeProvider } from '../components/theme-provider';
import { ThemeToggle } from '../components/theme-toggle';

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
  useTheme: () => ({
    theme: 'system',
    setTheme: vi.fn(),
  }),
}));

describe('Theme Components', () => {
  describe('ThemeProvider', () => {
    it('renders without crashing', () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      );
      expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
    });

    it('renders children', () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('ThemeToggle', () => {
    it('renders without crashing', () => {
      render(<ThemeToggle />);
      expect(document.body).toBeTruthy();
    });

    it('renders theme toggle button', () => {
      render(<ThemeToggle />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('has screen reader text', () => {
      render(<ThemeToggle />);
      expect(screen.getByText(/Toggle theme/i)).toBeInTheDocument();
    });
  });
});
