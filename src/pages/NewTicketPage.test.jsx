// Tests creating a ticket: what's sent to the API, where the page goes
// next, and how the API's errors are shown. createTicket() is faked.
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import NewTicketPage from './NewTicketPage.jsx';
import { createTicket } from '../api/tickets.api.js';
import { renderWithProviders } from '../test/renderWithProviders.jsx';

vi.mock('../api/tickets.api.js');

// The page navigates to the new ticket's page, so the test needs a route
// for it to land on. A plain heading stands in for the real detail page.
function renderNewTicketPage() {
  renderWithProviders(
    <Routes>
      <Route path="/tickets/new" element={<NewTicketPage />} />
      <Route path="/tickets/:ticketId" element={<h1>Ticket page</h1>} />
    </Routes>,
    { route: '/tickets/new' },
  );
}

// Types into the form the way a user would, then clicks the button.
async function fillInAndSubmit(subject, description) {
  await userEvent.type(screen.getByLabelText('Subject'), subject);
  await userEvent.type(screen.getByLabelText('Description'), description);
  await userEvent.click(screen.getByRole('button', { name: 'Create ticket' }));
}

describe('NewTicketPage', () => {
  it('sends the subject and description to the API, then shows the new ticket', async () => {
    createTicket.mockResolvedValue({ id: 9, subject: 'Printer jammed' });
    renderNewTicketPage();

    await fillInAndSubmit('Printer jammed', 'Paper stuck in tray 2');

    expect(createTicket).toHaveBeenCalledWith({
      subject: 'Printer jammed',
      description: 'Paper stuck in tray 2',
    });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Ticket page' }),
    ).toBeInTheDocument();
  });

  it("doesn't show the status or agent fields for a new ticket", () => {
    renderNewTicketPage();

    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Assigned to')).not.toBeInTheDocument();
  });

  it("shows the API's validation details next to the right field", async () => {
    const validationError = new Error('Validation failed');
    validationError.status = 400;
    validationError.details = [{ field: 'subject', message: 'subject is required' }];
    createTicket.mockRejectedValue(validationError);
    renderNewTicketPage();

    // Spaces get past the browser's `required`, but not the API's trim().
    await fillInAndSubmit('   ', 'Paper stuck');

    expect(await screen.findByText('subject is required')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Subject')).toHaveAccessibleDescription('subject is required');
    expect(screen.getByLabelText('Description')).toHaveAttribute('aria-invalid', 'false');
  });

  it("shows the API's message for any other error, e.g. 403", async () => {
    const forbiddenError = new Error('You do not have permission to perform this action');
    forbiddenError.status = 403;
    createTicket.mockRejectedValue(forbiddenError);
    renderNewTicketPage();

    await fillInAndSubmit('Printer jammed', 'Paper stuck');

    expect(await screen.findByRole('alert')).toHaveTextContent('You do not have permission');
  });

  it('disables the button while the ticket is being saved', async () => {
    createTicket.mockReturnValue(new Promise(() => {}));
    renderNewTicketPage();

    await fillInAndSubmit('Printer jammed', 'Paper stuck');

    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled();
  });
});
