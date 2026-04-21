import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomePage from '../app/(marketing)/page';

describe('Marketing Home Page', () => {
  it('renders without crashing', () => {
    render(<HomePage />);
    expect(document.body).toBeTruthy();
  });

  it('displays the hero heading', () => {
    render(<HomePage />);
    const heading = screen.getByRole('heading', {
      name: /Form submissions/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('displays get started CTA', () => {
    render(<HomePage />);
    expect(screen.getByText(/Get started free/i)).toBeInTheDocument();
  });

  it('displays sign in link', () => {
    render(<HomePage />);
    expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
  });

  it('displays feature cards section', () => {
    render(<HomePage />);
    expect(
      screen.getByRole('heading', { name: /Everything you need/i }),
    ).toBeInTheDocument();
  });

  it('displays all 3 feature cards', () => {
    render(<HomePage />);
    expect(screen.getByText(/One endpoint, zero backends/i)).toBeInTheDocument();
    // "Instant email notifications" appears in both hero text and as a card title
    expect(screen.getAllByText(/Instant email notifications/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Browse & export submissions/i)).toBeInTheDocument();
  });

  it('displays the Free to start badge', () => {
    render(<HomePage />);
    expect(screen.getByText(/Free to start/i)).toBeInTheDocument();
  });
});
