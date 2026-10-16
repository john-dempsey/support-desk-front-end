// Tests the route table in App.jsx: does each URL show the right page?
// renderWithProviders() starts the app's router at the URL given, without
// a real browser address bar. The pages call the API, so the API modules
// are faked here too.
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import App from './App.jsx';
import { getTicket, getTickets } from './api/tickets.api.js';
import { getComments } from './api/comments.api.js';
import { getAgents } from './api/users.api.js';
import { getTags } from './api/tags.api.js';
import { renderWithProviders } from './test/renderWithProviders.jsx';
import { testTickets, ticketAssignedToAlex } from './test/testTickets.js';

vi.mock('./api/tickets.api.js');
vi.mock('./api/comments.api.js');
vi.mock('./api/users.api.js');
vi.mock('./api/tags.api.js');

function renderAppAt(url) {
  renderWithProviders(<App />, { route: url });
}

describe('App routes', () => {
  it('shows the home page at /', () => {
    renderAppAt('/');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Welcome to Support Desk' }),
    ).toBeInTheDocument();
  });

  it('shows the ticket list at /tickets', () => {
    getTickets.mockResolvedValue({ tickets: testTickets, meta: { page: 1, totalPages: 1 } });

    renderAppAt('/tickets');

    expect(screen.getByRole('heading', { level: 1, name: 'Tickets' })).toBeInTheDocument();
  });

  it('shows one ticket at /tickets/:ticketId', async () => {
    getTicket.mockResolvedValue(ticketAssignedToAlex);
    getComments.mockResolvedValue([]);

    renderAppAt('/tickets/1');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Cannot log in' }),
    ).toBeInTheDocument();
  });

  it('shows the new ticket form at /tickets/new, not ticket "new"', () => {
    renderAppAt('/tickets/new');

    expect(screen.getByRole('heading', { level: 1, name: 'New ticket' })).toBeInTheDocument();
    expect(getTicket).not.toHaveBeenCalled();
  });

  it('shows the edit form at /tickets/:ticketId/edit', async () => {
    getTicket.mockResolvedValue(ticketAssignedToAlex);
    getAgents.mockResolvedValue([]);

    renderAppAt('/tickets/1/edit');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Edit ticket' }),
    ).toBeInTheDocument();
  });

  it('shows the tags page at /tags', () => {
    getTags.mockReturnValue(new Promise(() => {}));

    renderAppAt('/tags');

    expect(screen.getByRole('heading', { level: 1, name: 'Tags' })).toBeInTheDocument();
  });

  it('shows the not found page for an unknown URL', () => {
    renderAppAt('/no-such-page');

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  });

  it('shows the navigation on every page', () => {
    renderAppAt('/no-such-page');

    const navigation = screen.getByRole('navigation', { name: 'Main' });
    expect(navigation).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tickets' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tags' })).toBeInTheDocument();
  });
});
