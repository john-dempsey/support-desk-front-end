// TicketDetailPage reads the ticket's ID from the URL with useParams(), so
// each test passes both the URL to visit (`route`) and the route pattern
// the page lives at in App.jsx (`path`). The API module is faked, as in
// TicketListPage.test.jsx.
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link } from 'react-router';
import TicketDetailPage from './TicketDetailPage.jsx';
import { getTicket } from '../api/tickets.api.js';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { unassignedTicket } from '../test/testTickets.js';

vi.mock('../api/tickets.api.js');

const DETAIL_PATH = '/tickets/:ticketId';

// The same kind of error apiRequest() throws: a message plus the status.
function createApiError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function renderPageAt(url) {
  renderWithProviders(<TicketDetailPage />, { route: url, path: DETAIL_PATH });
}

describe('TicketDetailPage', () => {
  it('asks the API for the ticket whose ID is in the URL', () => {
    getTicket.mockReturnValue(new Promise(() => {}));

    renderPageAt('/tickets/2');

    expect(getTicket).toHaveBeenCalledWith('2');
  });

  it('shows a loading message while waiting for the API', () => {
    getTicket.mockReturnValue(new Promise(() => {}));

    renderPageAt('/tickets/2');

    expect(screen.getByRole('status')).toHaveTextContent('Loading the ticket');
  });

  it('shows the ticket from the API', async () => {
    getTicket.mockResolvedValue(unassignedTicket);

    renderPageAt('/tickets/2');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Invoice discrepancy' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Charged twice for March')).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('shows "Ticket not found" when the API answers 404', async () => {
    getTicket.mockRejectedValue(createApiError(404, 'Ticket 999 not found'));

    renderPageAt('/tickets/999');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ticket not found' }),
    ).toBeInTheDocument();
  });

  it('shows "Ticket not found" when the API rejects the ID with 400', async () => {
    getTicket.mockRejectedValue(createApiError(400, 'Validation failed'));

    renderPageAt('/tickets/abc');

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ticket not found' }),
    ).toBeInTheDocument();
  });

  it("shows the API's error message for any other error", async () => {
    getTicket.mockRejectedValue(createApiError(0, "Can't reach the API"));

    renderPageAt('/tickets/2');

    expect(await screen.findByRole('alert')).toHaveTextContent("Can't reach the API");
  });

  it('shows the new ticket when the URL changes from a ticket that was not found', async () => {
    // Ticket 999 doesn't exist; ticket 2 does.
    getTicket.mockImplementation(async (ticketId) => {
      if (ticketId === '999') {
        throw createApiError(404, 'Ticket 999 not found');
      }
      return unassignedTicket;
    });
    // The link sits next to the page, inside the same route, so clicking
    // it changes the URL while the same TicketDetailPage stays on screen.
    renderWithProviders(
      <>
        <Link to="/tickets/2">Go to ticket 2</Link>
        <TicketDetailPage />
      </>,
      { route: '/tickets/999', path: DETAIL_PATH },
    );
    await screen.findByRole('heading', { level: 1, name: 'Ticket not found' });

    await userEvent.click(screen.getByRole('link', { name: 'Go to ticket 2' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Invoice discrepancy' }),
    ).toBeInTheDocument();
  });

  it('links back to the ticket list', async () => {
    getTicket.mockResolvedValue(unassignedTicket);

    renderPageAt('/tickets/2');

    expect(await screen.findByRole('link', { name: 'Back to all tickets' })).toHaveAttribute(
      'href',
      '/tickets',
    );
  });
});
