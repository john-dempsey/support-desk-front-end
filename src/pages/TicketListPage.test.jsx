// Tests each state of TicketListPage: loading, success, empty and error.
// The API module is replaced with a fake (vi.mock), so each test decides
// what "the API" sends back, and no back-end needs to be running. This is
// the same approach as Stage 0's HomePage test.
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import TicketListPage from './TicketListPage.jsx';
import { getTickets } from '../api/tickets.api.js';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { testTickets } from '../test/testTickets.js';

vi.mock('../api/tickets.api.js');

describe('TicketListPage', () => {
  it('shows a loading message while waiting for the API', () => {
    // A promise that never resolves keeps the page in its loading state.
    getTickets.mockReturnValue(new Promise(() => {}));

    renderWithProviders(<TicketListPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Tickets' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Loading tickets');
  });

  it('shows the tickets from the API', async () => {
    getTickets.mockResolvedValue(testTickets);

    renderWithProviders(<TicketListPage />);

    // findBy... waits, because the tickets only appear once the (fake)
    // request has finished.
    expect(await screen.findByRole('link', { name: 'Cannot log in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Invoice discrepancy' })).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows a message when the API sends no tickets', async () => {
    getTickets.mockResolvedValue([]);

    renderWithProviders(<TicketListPage />);

    expect(await screen.findByText('There are no tickets to show.')).toBeInTheDocument();
  });

  it("shows the API's error message when the request fails", async () => {
    getTickets.mockRejectedValue(new Error('Invalid or expired token'));

    renderWithProviders(<TicketListPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid or expired token');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
