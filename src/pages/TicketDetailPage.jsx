// The page at /tickets/:ticketId, e.g. /tickets/2. useParams() reads the
// :ticketId part of the URL (the front-end's version of req.params in an
// Express route), and the page asks the API for that ticket with
// GET /tickets/:id.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getTicket } from '../api/tickets.api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { formatDate } from '../utils/formatDate.js';

function TicketDetailPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isNotFound, setIsNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // The same `ignore` flag as TicketListPage, for the same reason: a
    // response that arrives after the page has gone must be ignored.
    let ignore = false;

    async function loadTicket() {
      try {
        const ticketData = await getTicket(ticketId);
        if (!ignore) {
          setTicket(ticketData);
        }
      } catch (error) {
        if (ignore) {
          return;
        }
        // The page decides what each status means to the user. 404: there's
        // no ticket with that ID. 400: the API's validation rejected the ID
        // itself (e.g. /tickets/abc). Either way, there's no such ticket.
        // Anything else (the API is down, a 500, ...) is a real error.
        if (error.status === 404 || error.status === 400) {
          setIsNotFound(true);
        } else {
          setErrorMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadTicket();

    return () => {
      ignore = true;
      // If the URL has changed to another ticket, React keeps this page on
      // the screen, so its state still describes the old ticket. Go back
      // to "loading", so nothing from the old ticket (its details, a "not
      // found" or an error) is shown while the new one loads.
      setTicket(null);
      setErrorMessage('');
      setIsNotFound(false);
      setIsLoading(true);
    };
    // ticketId is listed because the effect uses it: if the URL changes to
    // a different ticket while this page is showing, the effect runs again
    // and loads that ticket instead.
  }, [ticketId]);

  if (isLoading) {
    return <Loading message="Loading the ticket…" />;
  }

  if (isNotFound) {
    return (
      <>
        <h1>Ticket not found</h1>
        <p>There's no ticket with the ID "{ticketId}".</p>
        <p>
          <Link to="/tickets">Back to all tickets</Link>
        </p>
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        <h1>Couldn't load the ticket</h1>
        <ErrorMessage message={errorMessage} />
        <p>
          <Link to="/tickets">Back to all tickets</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <p>
        <Link to="/tickets">Back to all tickets</Link>
      </p>
      <h1>{ticket.subject}</h1>
      <p>
        <StatusBadge status={ticket.status} />
      </p>

      {/* A description list (<dl>) pairs each label (<dt>) with its value
          (<dd>), so screen readers read them out together. */}
      <dl className="details-list">
        <dt>Ticket ID</dt>
        <dd>{ticket.id}</dd>
        <dt>Customer</dt>
        <dd>{ticket.customer.name}</dd>
        <dt>Assigned to</dt>
        <dd>{ticket.assignedAgent ? ticket.assignedAgent.name : 'Unassigned'}</dd>
        <dt>Created</dt>
        <dd>{formatDate(ticket.createdAt)}</dd>
        <dt>Last updated</dt>
        <dd>{formatDate(ticket.updatedAt)}</dd>
      </dl>

      <h2>Description</h2>
      <p>{ticket.description}</p>
    </>
  );
}

export default TicketDetailPage;
