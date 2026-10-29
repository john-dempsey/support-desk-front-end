// TicketFilters only uses its props, so a plain render() is enough, as in
// Pagination.test.jsx. A fake function (vi.fn()) stands in for onChange,
// so each test can check which name and value a dropdown reported.
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketFilters from './TicketFilters.jsx';

// The choices TicketListPage passes when the URL has no query at all.
function renderDefaultFilters(handleChange) {
  render(<TicketFilters status="" sortBy="createdAt" order="desc" onChange={handleChange} />);
}

describe('TicketFilters', () => {
  it('shows the choices it is given', () => {
    render(<TicketFilters status="resolved" sortBy="subject" order="asc" onChange={vi.fn()} />);

    expect(screen.getByLabelText('Status')).toHaveValue('resolved');
    expect(screen.getByLabelText('Sort by')).toHaveValue('subject');
    expect(screen.getByLabelText('Order')).toHaveValue('asc');
  });

  // The names are the API's own query parameter names, so a mistake here
  // would send the API a parameter it ignores.
  it('reports a new status as "status"', async () => {
    const handleChange = vi.fn();
    renderDefaultFilters(handleChange);

    await userEvent.selectOptions(screen.getByLabelText('Status'), 'Closed');

    expect(handleChange).toHaveBeenCalledWith('status', 'closed');
  });

  it('reports a new sort as "sortBy"', async () => {
    const handleChange = vi.fn();
    renderDefaultFilters(handleChange);

    await userEvent.selectOptions(screen.getByLabelText('Sort by'), 'Subject');

    expect(handleChange).toHaveBeenCalledWith('sortBy', 'subject');
  });

  it('reports a new order as "order"', async () => {
    const handleChange = vi.fn();
    renderDefaultFilters(handleChange);

    await userEvent.selectOptions(screen.getByLabelText('Order'), 'Ascending (oldest, A to Z)');

    expect(handleChange).toHaveBeenCalledWith('order', 'asc');
  });
});
