// The page at /tickets/:ticketId/edit. It loads the ticket and the list of
// agents, shows them in a TicketForm, and saves the changes with
// PATCH /tickets/:id. This is where a ticket's status is changed and where
// it's assigned to an agent.
//
// Only agents and admins can change a ticket, so App.jsx's ProtectedRoute
// only lets them reach this page. A customer's GET /users would get a 403
// anyway.
//
// Since Stage 6 the useFetch hook loads the ticket and the agents.
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { getTicket, updateTicket } from '../api/tickets.api.js';
import { getAgents } from '../api/users.api.js';
import { useFetch } from '../hooks/useFetch.js';
import TicketForm from '../components/TicketForm.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import PageTitle from '../components/PageTitle.jsx';

function EditTicketPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  // One useFetch for each request. Both run when the page first renders,
  // so the two requests are still sent at the same time.
  const { data: ticket, error: ticketError, isLoading: isTicketLoading } =
    useFetch(getTicket, ticketId);
  const { data: agents, error: agentsError, isLoading: areAgentsLoading } =
    useFetch(getAgents);
  const [saveError, setSaveError] = useState(null);

  async function handleSave(changes) {
    setSaveError(null);
    try {
      await updateTicket(ticketId, changes);
      // No state to update here: the ticket's page loads the ticket fresh
      // from the API, so it shows exactly what was saved.
      navigate(`/tickets/${ticketId}`);
    } catch (error) {
      setSaveError(error);
    }
  }

  if (isTicketLoading || areAgentsLoading) {
    return <Loading message="Loading the ticket…" />;
  }

  // Either request may have failed: show whichever error there is.
  const loadError = ticketError || agentsError;
  if (loadError) {
    return (
      <>
        <PageTitle title="Couldn't load the ticket" />
        <h1>Couldn't load the ticket</h1>
        <ErrorMessage message={loadError.message} />
        <p>
          <Link to="/tickets">Back to all tickets</Link>
        </p>
      </>
    );
  }

  // The form's starting values, taken from the ticket. A <select>'s value
  // is always a string, and '' stands for "Unassigned".
  let assignedAgentId = '';
  if (ticket.assignedAgent) {
    assignedAgentId = String(ticket.assignedAgent.id);
  }
  const initialValues = {
    subject: ticket.subject,
    description: ticket.description,
    status: ticket.status,
    assignedAgentId,
  };

  return (
    <>
      <p>
        <Link to={`/tickets/${ticketId}`}>Back to the ticket</Link>
      </p>
      <PageTitle title="Edit ticket" />
      <h1>Edit ticket</h1>
      <TicketForm
        initialValues={initialValues}
        agents={agents}
        submitLabel="Save changes"
        onSubmit={handleSave}
        error={saveError}
      />
    </>
  );
}

export default EditTicketPage;
