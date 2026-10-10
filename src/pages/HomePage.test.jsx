// Tests HomePage the way a user would see it. The API module is replaced
// with a fake (vi.mock), so the test controls exactly what "the API" sends
// back, and the real back-end doesn't need to be running.
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomePage from './HomePage.jsx';
import { getWelcome } from '../api/welcome.api.js';

// Every function exported by welcome.api.js becomes a fake (vi.fn()) whose
// result each test sets for itself.
vi.mock('../api/welcome.api.js');

describe('HomePage', () => {
  it("shows the API's welcome message", async () => {
    getWelcome.mockResolvedValue({ message: 'Hello world!' });

    render(<HomePage />);

    // findBy... waits for the text to appear, because the page only shows
    // it after the (fake) request has finished.
    expect(await screen.findByText('Hello world!')).toBeInTheDocument();
  });

  it('shows a loading message while waiting for the API', () => {
    // A promise that never resolves keeps the page in its loading state.
    getWelcome.mockReturnValue(new Promise(() => {}));

    render(<HomePage />);

    expect(screen.getByRole('status')).toHaveTextContent('Connecting to the API');
  });

  it('shows an error message when the API cannot be reached', async () => {
    getWelcome.mockRejectedValue(new Error("Can't reach the API"));

    render(<HomePage />);

    expect(await screen.findByRole('alert')).toHaveTextContent("Can't reach the API");
  });
});
