// Tests each state of TicketListPage: loading, success, empty and error,
// and that the filters and pagination change what's asked of the API.
// The API module is replaced with a fake (vi.mock), so each test decides
// what "the API" sends back, and no back-end needs to be running. This is
// the same approach as Stage 0's HomePage test.
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketListPage from './TicketListPage.jsx';
import { getTickets } from '../api/tickets.api.js';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { testTickets } from '../test/testTickets.js';
import { customerUser } from '../test/testUsers.js';

vi.mock('../api/tickets.api.js');

// What getTickets() returns: the tickets, plus the API's `meta`.
function ticketsResult(tickets, page = 1, totalPages = 1) {
  return { tickets, meta: { page, pageSize: 10, total: tickets.length, totalPages } };
}

describe('TicketListPage', () => {
  it('shows a loading message while waiting for the API', () => {
    // A promise that never resolves keeps the page in its loading state.
    getTickets.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<TicketListPage />, { route: '/tickets' });

    expect(screen.getByRole('heading', { level: 1, name: 'Tickets' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Loading tickets');
  });

  it('shows the tickets from the API', async () => {
    getTickets.mockResolvedValue(ticketsResult(testTickets));

    renderWithProviders(<TicketListPage />, { route: '/tickets' });

    // findBy... waits, because the tickets only appear once the (fake)
    // request has finished.
    expect(await screen.findByRole('link', { name: 'Cannot log in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Invoice discrepancy' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows a message when the API sends no tickets', async () => {
    getTickets.mockResolvedValue(ticketsResult([], 1, 0));

    renderWithProviders(<TicketListPage />, { route: '/tickets' });

    expect(await screen.findByText('There are no tickets to show.')).toBeInTheDocument();
  });

  it("shows the API's error message when the request fails", async () => {
    getTickets.mockRejectedValue(new Error('Invalid or expired token'));

    renderWithProviders(<TicketListPage />, { route: '/tickets' });

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid or expired token');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('passes the query in the URL to the API', () => {
    getTickets.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<TicketListPage />, { route: '/tickets?status=resolved&page=2' });

    expect(getTickets).toHaveBeenCalledWith('status=resolved&page=2');
    // The dropdown shows the filter from the URL.
    expect(screen.getByLabelText('Status')).toHaveValue('resolved');
  });

  it('asks the API again, from page 1, when the status filter changes', async () => {
    getTickets.mockResolvedValue(ticketsResult(testTickets, 2, 3));
    renderWithProviders(<TicketListPage />, { route: '/tickets?page=2' });
    await screen.findByRole('link', { name: 'Cannot log in' });

    await userEvent.selectOptions(screen.getByLabelText('Status'), 'Open');

    expect(getTickets).toHaveBeenLastCalledWith('status=open');
  });

  it('asks the API for the next page when Next is clicked', async () => {
    getTickets.mockResolvedValue(ticketsResult(testTickets, 1, 3));
    renderWithProviders(<TicketListPage />, { route: '/tickets?status=open' });

    await userEvent.click(await screen.findByRole('button', { name: 'Next' }));

    expect(getTickets).toHaveBeenLastCalledWith('status=open&page=2');
  });

  it('links customers to the new ticket page', () => {
    getTickets.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<TicketListPage />, { route: '/tickets', user: customerUser });

    expect(screen.getByRole('link', { name: 'New ticket' })).toHaveAttribute(
      'href',
      '/tickets/new',
    );
  });

  it("doesn't offer New ticket to staff, who can't create tickets", () => {
    getTickets.mockReturnValue(new Promise(() => {}));

    // The default test user is Ada, an admin.
    renderWithProviders(<TicketListPage />, { route: '/tickets' });

    expect(screen.queryByRole('link', { name: 'New ticket' })).not.toBeInTheDocument();
  });
});
