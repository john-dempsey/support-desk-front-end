// TicketList contains <Link>s, which only work inside a router, so it's
// rendered with renderWithProviders() instead of a plain render().
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import TicketList from './TicketList.jsx';
import { renderWithProviders } from '../test/renderWithProviders.jsx';

// The test's own small set of tickets, so it doesn't depend on the sample
// data and can include exactly the cases it wants to check.
const testTickets = [
  {
    id: 7,
    subject: 'Printer on fire',
    description: 'Smoke coming out',
    status: 'open',
    customer: { id: 1, name: 'Casey Customer', email: 'casey@example.com' },
    assignedAgent: { id: 3, name: 'Alex Agent', email: 'alex@example.com' },
    createdAt: '2026-10-08T12:00:00.000Z',
    updatedAt: '2026-10-08T12:00:00.000Z',
  },
  {
    id: 8,
    subject: 'Mouse missing',
    description: 'Gone from my desk',
    status: 'closed',
    customer: { id: 2, name: 'Priya Patel', email: 'priya@example.com' },
    assignedAgent: null,
    createdAt: '2026-10-09T12:00:00.000Z',
    updatedAt: '2026-10-09T12:00:00.000Z',
  },
];

describe('TicketList', () => {
  it('shows one row for each ticket, plus the heading row', () => {
    renderWithProviders(<TicketList tickets={testTickets} />);

    expect(screen.getAllByRole('row')).toHaveLength(3);
  });

  // The caption is visually hidden, but it's still the table's name, which
  // is how a screen reader user (and getByRole) finds it.
  it('names the table with a caption', () => {
    renderWithProviders(<TicketList tickets={testTickets} />);

    expect(screen.getByRole('table', { name: 'Tickets' })).toBeInTheDocument();
  });

  it("links each ticket's subject to its detail page", () => {
    renderWithProviders(<TicketList tickets={testTickets} />);

    const link = screen.getByRole('link', { name: 'Printer on fire' });
    expect(link).toHaveAttribute('href', '/tickets/7');
  });

  it('shows "Unassigned" when a ticket has no agent', () => {
    renderWithProviders(<TicketList tickets={testTickets} />);

    // within() limits the search to one row, so the test checks the right
    // ticket, not just that "Unassigned" appears somewhere on the page.
    const mouseRow = screen.getByRole('row', { name: /Mouse missing/ });
    expect(within(mouseRow).getByText('Unassigned')).toBeInTheDocument();
  });

  it('shows a message when there are no tickets', () => {
    renderWithProviders(<TicketList tickets={[]} />);

    expect(screen.getByText('There are no tickets to show.')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});
