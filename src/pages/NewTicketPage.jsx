// The page at /tickets/new: a form to report a new problem. It sends
// POST /tickets, then goes to the new ticket's own page.
//
// Only customers can create tickets, so App.jsx's ProtectedRoute only
// lets customers reach this page. If anyone else sends POST /tickets, the
// API answers 403, and the form would show its message.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { createTicket } from '../api/tickets.api.js';
import TicketForm from '../components/TicketForm.jsx';

function NewTicketPage() {
  const navigate = useNavigate();
  // The error from the last attempt, or null. The whole error is kept (not
  // just its message), because TicketForm needs its `details` too.
  const [saveError, setSaveError] = useState(null);

  async function handleCreate(newTicket) {
    setSaveError(null);
    try {
      const savedTicket = await createTicket(newTicket);
      // The API sends back the saved ticket with its new id, so go straight
      // to its page. navigate() changes the URL from code, like returning
      // redirect() from a Laravel controller.
      navigate(`/tickets/${savedTicket.id}`);
    } catch (error) {
      setSaveError(error);
    }
  }

  return (
    <>
      <p>
        <Link to="/tickets">Back to all tickets</Link>
      </p>
      <h1>New ticket</h1>
      <TicketForm submitLabel="Create ticket" onSubmit={handleCreate} error={saveError} />
    </>
  );
}

export default NewTicketPage;
