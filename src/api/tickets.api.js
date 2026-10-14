// Every request about tickets goes through this file: one function per
// endpoint, named for what it does. Pages call these functions and never
// build URLs themselves, so if a URI changes on the back-end, this is the
// only file that changes on the front-end. It's the front-end's version of
// the back-end's ticket.service.js: the one place that knows where tickets
// come from.
import { apiRequest } from './client.js';

// GET /tickets: returns the array of tickets.
// The API sends them 10 at a time, newest first, with a `meta` object
// ({ page, pageSize, total, totalPages }) alongside. Only the tickets are
// returned for now; Stage 3 uses `meta` for filtering and pagination.
export async function getTickets() {
  const responseBody = await apiRequest('/tickets');
  return responseBody.data;
}

// GET /tickets/:id: returns one ticket. If the ticket doesn't exist, the
// API answers 404 and apiRequest() throws an error with status 404, so the
// page can tell "not found" apart from "something went wrong".
export async function getTicket(ticketId) {
  const responseBody = await apiRequest(`/tickets/${ticketId}`);
  return responseBody.data;
}
