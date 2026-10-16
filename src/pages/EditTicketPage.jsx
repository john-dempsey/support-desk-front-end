// The page at /tickets/:ticketId/edit. It loads the ticket and the list of
// agents, shows them in a TicketForm, and saves the changes with
// PATCH /tickets/:id. This is where a ticket's status is changed and where
// it's assigned to an agent.
//
// Only agents and admins can change a ticket. Ada's admin token can, so
// every control is shown for now. Stage 4 hides this page from customers.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { getTicket, updateTicket } from '../api/tickets.api.js';
import { getAgents } from '../api/users.api.js';
import TicketForm from '../components/TicketForm.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

function EditTicketPage() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function loadTicketAndAgents() {
      try {
        // The two requests don't depend on each other, so both are sent at
        // once, and Promise.all() waits until both have answered: the same
        // idea as Promise.all() in the back-end's ticket.service.js.
        const [ticketData, agentsData] = await Promise.all([
          getTicket(ticketId),
          getAgents(),
        ]);
        if (!ignore) {
          setTicket(ticketData);
          setAgents(agentsData);
        }
      } catch (error) {
        if (!ignore) {
          setLoadErrorMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadTicketAndAgents();

    return () => {
      ignore = true;
    };
  }, [ticketId]);

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

  if (isLoading) {
    return <Loading message="Loading the ticket…" />;
  }

  if (loadErrorMessage) {
    return (
      <>
        <h1>Couldn't load the ticket</h1>
        <ErrorMessage message={loadErrorMessage} />
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
