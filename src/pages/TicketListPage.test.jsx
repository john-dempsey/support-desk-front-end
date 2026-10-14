// Checks the page puts the sample tickets on screen. TicketList's own test
// covers the details of how each ticket is shown.
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import TicketListPage from './TicketListPage.jsx';
import { renderWithProviders } from '../test/renderWithProviders.jsx';

describe('TicketListPage', () => {
  it('shows the page heading', () => {
    renderWithProviders(<TicketListPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Tickets' })).toBeInTheDocument();
  });

  it('shows the sample tickets', () => {
    renderWithProviders(<TicketListPage />);

    expect(screen.getByRole('link', { name: 'Cannot log in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Invoice discrepancy' })).toBeInTheDocument();
  });
});
