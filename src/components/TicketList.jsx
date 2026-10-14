// Shows a list of tickets as a table. It's a component, not a page: it
// doesn't know or care where the tickets came from (a hard-coded array now,
// the API from Stage 2). It just displays whatever `tickets` it's given.
import { Link } from 'react-router';
import StatusBadge from './StatusBadge.jsx';
import { formatDate } from '../utils/formatDate.js';

function TicketList({ tickets }) {
  // The "empty" state. Not possible with the hard-coded tickets, but it
  // will be once the list comes from the API (e.g. a brand-new customer).
  if (tickets.length === 0) {
    return <p>There are no tickets to show.</p>;
  }

  return (
    // The wrapper lets the table scroll sideways on a narrow phone screen,
    // instead of making the whole page wider than the screen.
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th scope="col">Subject</th>
            <th scope="col">Status</th>
            <th scope="col">Customer</th>
            <th scope="col">Assigned to</th>
            <th scope="col">Created</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            // React uses `key` to tell the rows apart when the list
            // changes. The ticket's id never changes, so it's a safe key.
            <tr key={ticket.id}>
              <td>
                <Link to={`/tickets/${ticket.id}`}>{ticket.subject}</Link>
              </td>
              <td>
                <StatusBadge status={ticket.status} />
              </td>
              <td>{ticket.customer.name}</td>
              <td>{ticket.assignedAgent ? ticket.assignedAgent.name : 'Unassigned'}</td>
              <td>{formatDate(ticket.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TicketList;
