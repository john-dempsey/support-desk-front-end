// Every request about tickets goes through this file: one function per
// endpoint, named for what it does. Pages call these functions and never
// build URLs themselves, so if a URI changes on the back-end, this is the
// only file that changes on the front-end. It's the front-end's version of
// the back-end's ticket.service.js: the one place that knows where tickets
// come from.
import { apiRequest } from './client.js';

// GET /tickets: returns { tickets, meta }.
// `queryString` is the part of the page's URL after the "?", e.g.
// "status=open&page=2". It's passed to the API unchanged, because the page
// uses the same names in its URL as the API's query parameters (status,
// sortBy, order, page, pageSize). The API sends 10 tickets at a time, and
// `meta` ({ page, pageSize, total, totalPages }) says how many pages there
// are in all.
export async function getTickets(queryString = '') {
  let path = '/tickets';
  if (queryString) {
    path = `/tickets?${queryString}`;
  }

  const responseBody = await apiRequest(path);
  return { tickets: responseBody.data, meta: responseBody.meta };
}

// GET /tickets/:id: returns one ticket. If the ticket doesn't exist, the
// API answers 404 and apiRequest() throws an error with status 404, so the
// page can tell "not found" apart from "something went wrong".
export async function getTicket(ticketId) {
  const responseBody = await apiRequest(`/tickets/${ticketId}`);
  return responseBody.data;
}

// POST /tickets: `newTicket` is { subject, description }. Returns the saved
// ticket, including the id the database gave it.
export async function createTicket(newTicket) {
  const responseBody = await apiRequest('/tickets', { method: 'POST', body: newTicket });
  return responseBody.data;
}

// PATCH /tickets/:id: `changes` holds only the fields to change, e.g.
// { status: 'resolved' }. Returns the ticket as it is now.
export async function updateTicket(ticketId, changes) {
  const responseBody = await apiRequest(`/tickets/${ticketId}`, {
    method: 'PATCH',
    body: changes,
  });
  return responseBody.data;
}

// DELETE /tickets/:id: the API answers 204 No Content, so there's nothing
// to return. A 409 means the ticket still has comments.
export async function deleteTicket(ticketId) {
  await apiRequest(`/tickets/${ticketId}`, { method: 'DELETE' });
}
