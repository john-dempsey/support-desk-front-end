// The page at /tickets. A page owns the data and passes it down to
// components as props; TicketList then does the displaying.
//
// For now the data is the hard-coded sampleTickets array. In Stage 2 this
// page loads the tickets from the API instead (the same useEffect pattern
// as Stage 0's HomePage), and TicketList doesn't change at all.
import TicketList from '../components/TicketList.jsx';
import sampleTickets from '../data/sampleTickets.js';

function TicketListPage() {
  return (
    <>
      <h1>Tickets</h1>
      <TicketList tickets={sampleTickets} />
    </>
  );
}

export default TicketListPage;
