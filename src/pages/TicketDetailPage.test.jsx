// TicketDetailPage reads the ticket's ID from the URL with useParams(), so
// each test passes both the URL to visit (`route`) and the route pattern
// the page lives at in App.jsx (`path`).
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import TicketDetailPage from './TicketDetailPage.jsx';
import { renderWithProviders } from '../test/renderWithProviders.jsx';

const DETAIL_PATH = '/tickets/:ticketId';

describe('TicketDetailPage', () => {
  it('shows the ticket whose ID is in the URL', () => {
    renderWithProviders(<TicketDetailPage />, { route: '/tickets/2', path: DETAIL_PATH });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Invoice discrepancy' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Charged twice for March')).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByText('Unassigned')).toBeInTheDocument();
  });

  it('shows "Ticket not found" for an ID that does not exist', () => {
    renderWithProviders(<TicketDetailPage />, { route: '/tickets/999', path: DETAIL_PATH });

    expect(screen.getByRole('heading', { level: 1, name: 'Ticket not found' })).toBeInTheDocument();
  });

  it('shows "Ticket not found" for an ID that is not a number', () => {
    renderWithProviders(<TicketDetailPage />, { route: '/tickets/abc', path: DETAIL_PATH });

    expect(screen.getByRole('heading', { level: 1, name: 'Ticket not found' })).toBeInTheDocument();
  });

  it('links back to the ticket list', () => {
    renderWithProviders(<TicketDetailPage />, { route: '/tickets/1', path: DETAIL_PATH });

    expect(screen.getByRole('link', { name: 'Back to all tickets' })).toHaveAttribute(
      'href',
      '/tickets',
    );
  });
});
