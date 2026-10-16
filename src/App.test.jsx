// Tests the route table in App.jsx: does each URL show the right page?
// renderWithProviders() starts the app's router at the URL given, without
// a real browser address bar. The pages call the API, so the API modules
// are faked here too.
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import App from './App.jsx';
import AuthProvider from './context/AuthProvider.jsx';
import { login } from './api/auth.api.js';
import { getTicket, getTickets } from './api/tickets.api.js';
import { getComments } from './api/comments.api.js';
import { getAgents } from './api/users.api.js';
import { getTags } from './api/tags.api.js';
import { renderWithProviders } from './test/renderWithProviders.jsx';
import { testTickets, ticketAssignedToAlex } from './test/testTickets.js';
import { adminUser, customerUser } from './test/testUsers.js';

vi.mock('./api/auth.api.js');
vi.mock('./api/tickets.api.js');
vi.mock('./api/comments.api.js');
vi.mock('./api/users.api.js');
vi.mock('./api/tags.api.js');

// Ada, an admin, is logged in unless a test passes another user (or null).
function renderAppAt(url, user) {
  renderWithProviders(<App />, { route: url, user });
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

  it('shows customers the new ticket form at /tickets/new, not ticket "new"', () => {
    renderAppAt('/tickets/new', customerUser);

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

  it('sends a visitor who is not logged in to the login page', () => {
    renderAppAt('/tickets', null);

    expect(screen.getByRole('heading', { level: 1, name: 'Log in' })).toBeInTheDocument();
    expect(getTickets).not.toHaveBeenCalled();
  });

  it('tells a customer the tags page is not for them', () => {
    renderAppAt('/tags', customerUser);

    expect(screen.getByRole('heading', { level: 1, name: 'Not available' })).toBeInTheDocument();
    expect(getTags).not.toHaveBeenCalled();
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

  // Logging out and in again starts the next user afresh: nothing from the
  // last user's visit (here, page 2 of the list) carries over. This uses
  // the real AuthProvider (only the API modules are faked), so it follows
  // a whole visit: log in, move around, log out, log in as someone else.
  it("starts the next user at the plain ticket list, not the last user's page", async () => {
    login.mockResolvedValueOnce({ user: adminUser, token: 'ada-token' });
    login.mockResolvedValueOnce({ user: customerUser, token: 'casey-token' });
    getTickets.mockResolvedValue({ tickets: testTickets, meta: { page: 1, totalPages: 3 } });
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>,
    );

    async function logInAs(email) {
      await userEvent.type(screen.getByLabelText('Email'), email);
      await userEvent.type(screen.getByLabelText('Password'), 'password123');
      await userEvent.click(screen.getByRole('button', { name: 'Log in' }));
      await screen.findByRole('heading', { level: 1, name: 'Tickets' });
    }

    // Ada logs in, moves to page 2, and logs out.
    await logInAs('ada@example.com');
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }));
    expect(getTickets).toHaveBeenLastCalledWith('page=2');
    await userEvent.click(screen.getByRole('button', { name: 'Log out' }));

    // Casey logs in, and the list is asked for with no query at all.
    await logInAs('casey@example.com');
    expect(getTickets).toHaveBeenLastCalledWith('');
  });
});
