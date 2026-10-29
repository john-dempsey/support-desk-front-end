// Tests ErrorBoundary with a tiny component that always crashes. React
// logs every error a boundary catches with console.error, so each test
// that crashes on purpose silences it, to keep the test output readable.
// (mockReset in vite.config.js puts console.error back afterwards.)
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary.jsx';
import { renderWithProviders } from '../test/renderWithProviders.jsx';

function BrokenPage() {
  throw new Error('Broken on purpose');
}

function silenceConsoleErrors() {
  vi.spyOn(console, 'error').mockImplementation(() => {});
}

describe('ErrorBoundary', () => {
  it('shows the page as usual when nothing goes wrong', () => {
    renderWithProviders(
      <ErrorBoundary>
        <h1>Working page</h1>
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: 'Working page' })).toBeInTheDocument();
  });

  it('shows "Something went wrong" when the page crashes', () => {
    silenceConsoleErrors();

    renderWithProviders(
      <ErrorBoundary>
        <BrokenPage />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(document.title).toBe('Something went wrong · Support Desk');
    expect(screen.getByRole('alert')).toHaveTextContent('Sorry, this page stopped working.');
    expect(screen.getByRole('link', { name: 'Go to the home page' })).toHaveAttribute('href', '/');
    // React still reports the error, even though the boundary caught it.
    expect(console.error).toHaveBeenCalled();
  });

  it("shows the error's message in development", () => {
    silenceConsoleErrors();

    renderWithProviders(
      <ErrorBoundary>
        <BrokenPage />
      </ErrorBoundary>,
    );

    expect(screen.getByText('Details (development only): Broken on purpose')).toBeInTheDocument();
  });

  it("leaves the error's message out of the production build", () => {
    silenceConsoleErrors();
    // Pretend this is the production build, where DEV is false.
    vi.stubEnv('DEV', false);

    renderWithProviders(
      <ErrorBoundary>
        <BrokenPage />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: 'Something went wrong' })).toBeInTheDocument();
    expect(screen.queryByText(/Broken on purpose/)).not.toBeInTheDocument();
  });
});
