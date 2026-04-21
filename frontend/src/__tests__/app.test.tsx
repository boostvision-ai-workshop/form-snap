import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '../app/page';

describe('Home Page', () => {
  it('renders without crashing', () => {
    render(<Home />);
    expect(document.body).toBeTruthy();
  });

  it('displays the hero heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', {
      name: /Build Your SaaS Product with AI/i,
    });
    expect(heading).toBeInTheDocument();
  });

  it('displays the hero subtitle', () => {
    render(<Home />);
    expect(screen.getByText(/A production-ready template with Next.js, FastAPI/i)).toBeInTheDocument();
  });

  it('displays CTA buttons', () => {
    render(<Home />);
    const getStartedButtons = screen.getAllByText(/Get Started/i);
    expect(getStartedButtons.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Learn More/i)).toBeInTheDocument();
  });

  it('displays feature cards section', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /Everything You Need to Build Fast/i })).toBeInTheDocument();
  });

  it('displays all 6 feature cards', () => {
    render(<Home />);
    expect(screen.getByText(/Full-Stack Template/i)).toBeInTheDocument();
    expect(screen.getByText(/Authentication Built-in/i)).toBeInTheDocument();
    expect(screen.getByText(/Database Ready/i)).toBeInTheDocument();
    expect(screen.getByText(/AI-Powered Development/i)).toBeInTheDocument();
    expect(screen.getByText(/Type-Safe/i)).toBeInTheDocument();
    expect(screen.getByText(/Docker Ready/i)).toBeInTheDocument();
  });

  it('displays final CTA section', () => {
    render(<Home />);
    expect(screen.getByRole('heading', { name: /Ready to Build Your SaaS\?/i })).toBeInTheDocument();
  });
});
