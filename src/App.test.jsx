// Tests the route table in App.jsx. MemoryRouter is a router for tests: it
// starts at whatever URL `initialEntries` says, without a real browser
// address bar.
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from './App.jsx';
import { getWelcome } from './api/welcome.api.js';

vi.mock('./api/welcome.api.js');

function renderAppAt(url) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <App />
    </MemoryRouter>,
  );
}

describe('App routes', () => {
  it('shows the home page at /', async () => {
    getWelcome.mockResolvedValue({ message: 'Hello world!' });

    renderAppAt('/');

    expect(screen.getByRole('heading', { level: 1, name: 'Welcome' })).toBeInTheDocument();
    expect(await screen.findByText('Hello world!')).toBeInTheDocument();
  });

  it('shows the not found page for an unknown URL', () => {
    renderAppAt('/no-such-page');

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  });

  it('shows the navigation on every page', () => {
    renderAppAt('/no-such-page');

    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  });
});
