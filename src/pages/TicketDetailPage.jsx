// The page at /tickets/:ticketId, e.g. /tickets/2. useParams() reads the
// :ticketId part of the URL — the front-end's version of req.params in an
// Express route.
//
// For now it finds the ticket in the hard-coded sampleTickets array. In
// Stage 2 it asks the API for it instead (GET /tickets/:id).
import { Link, useParams } from 'react-router';
import StatusBadge from '../components/StatusBadge.jsx';
import sampleTickets from '../data/sampleTickets.js';
import { formatDate } from '../utils/formatDate.js';

function TicketDetailPage() {
  const { ticketId } = useParams();

  // Everything in a URL is text, so ticketId is the string "2", not the
  // number 2. Without Number(), `ticket.id === ticketId` would always be
  // false, because 2 and "2" aren't strictly equal.
  const ticket = sampleTickets.find((sampleTicket) => sampleTicket.id === Number(ticketId));

  // find() gives undefined when nothing matches, e.g. /tickets/999. The API
  // will answer 404 in the same situation from Stage 2.
  if (!ticket) {
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
