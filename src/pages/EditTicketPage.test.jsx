// Tests editing a ticket: the form starts with the ticket's values, the
// agents fill the dropdown, and the changes are sent with PATCH. Both API
// modules the page uses are faked.
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import EditTicketPage from './EditTicketPage.jsx';
import { getTicket, updateTicket } from '../api/tickets.api.js';
import { getAgents } from '../api/users.api.js';
import { renderWithProviders } from '../test/renderWithProviders.jsx';
import { ticketAssignedToAlex, unassignedTicket } from '../test/testTickets.js';

vi.mock('../api/tickets.api.js');
vi.mock('../api/users.api.js');

const testAgents = [
  { id: 3, name: 'Alex Agent', email: 'alex@example.com', role: 'agent' },
  { id: 5, name: 'Sam Support', email: 'sam@example.com', role: 'agent' },
];

// After saving, the page goes to the ticket's own page, so there's a
// stand-in route for it to land on.
function renderEditPageFor(ticketId) {
  renderWithProviders(
    <Routes>
      <Route path="/tickets/:ticketId/edit" element={<EditTicketPage />} />
      <Route path="/tickets/:ticketId" element={<h1>Ticket page</h1>} />
    </Routes>,
    { route: `/tickets/${ticketId}/edit` },
  );
}

describe('EditTicketPage', () => {
  it("fills the form with the ticket's current values", async () => {
    getTicket.mockResolvedValue(ticketAssignedToAlex);
    getAgents.mockResolvedValue(testAgents);

    renderEditPageFor(1);

    expect(await screen.findByLabelText('Subject')).toHaveValue('Cannot log in');
    expect(screen.getByLabelText('Status')).toHaveValue('open');
    // toHaveDisplayValue checks the text the user sees in the dropdown.
    expect(screen.getByLabelText('Assigned to')).toHaveDisplayValue('Alex Agent');
  });

  it('names the browser tab after the page', async () => {
    getTicket.mockResolvedValue(ticketAssignedToAlex);
    getAgents.mockResolvedValue(testAgents);

    renderEditPageFor(1);

    await screen.findByRole('heading', { level: 1, name: 'Edit ticket' });
    expect(document.title).toBe('Edit ticket · Support Desk');
  });

  it('sends the changes with PATCH, then shows the ticket', async () => {
    getTicket.mockResolvedValue(unassignedTicket);
    getAgents.mockResolvedValue(testAgents);
    updateTicket.mockResolvedValue(unassignedTicket);
    renderEditPageFor(2);

    await userEvent.selectOptions(await screen.findByLabelText('Status'), 'Resolved');
    await userEvent.selectOptions(screen.getByLabelText('Assigned to'), 'Sam Support');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    // The agent's id is sent as a number, not the dropdown's string.
    expect(updateTicket).toHaveBeenCalledWith('2', {
      subject: 'Invoice discrepancy',
      description: 'Charged twice for March',
      status: 'resolved',
      assignedAgentId: 5,
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ticket page' }),
    ).toBeInTheDocument();
  });

  it('sends null when the ticket is unassigned', async () => {
    getTicket.mockResolvedValue(ticketAssignedToAlex);
    getAgents.mockResolvedValue(testAgents);
    updateTicket.mockResolvedValue(ticketAssignedToAlex);
    renderEditPageFor(1);

    await userEvent.selectOptions(await screen.findByLabelText('Assigned to'), 'Unassigned');
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(updateTicket).toHaveBeenCalledWith('1', expect.objectContaining({ assignedAgentId: null }));
  });

  it("shows the API's error if the ticket can't be loaded", async () => {
    getTicket.mockRejectedValue(new Error('Ticket 999 not found'));
    getAgents.mockResolvedValue(testAgents);

    renderEditPageFor(999);

    expect(await screen.findByRole('alert')).toHaveTextContent('Ticket 999 not found');
  });

  it('stays on the form and shows the error when saving fails', async () => {
    getTicket.mockResolvedValue(unassignedTicket);
    getAgents.mockResolvedValue(testAgents);
    const networkError = new Error("Can't reach the API at http://localhost:3000");
    networkError.status = 0;
    updateTicket.mockRejectedValue(networkError);
    renderEditPageFor(2);

    await userEvent.click(await screen.findByRole('button', { name: 'Save changes' }));

    expect(await screen.findByRole('alert')).toHaveTextContent("Can't reach the API");
    expect(screen.getByRole('heading', { level: 1, name: 'Edit ticket' })).toBeInTheDocument();
  });
});
