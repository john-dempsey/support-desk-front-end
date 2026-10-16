// Requests about a ticket's comments. Comments are nested under a ticket in
// the API (/tickets/:ticketId/comments), so every function here needs the
// ticket's id, just as the back-end's comment routes do.
import { apiRequest } from './client.js';

// GET /tickets/:ticketId/comments: returns the ticket's comments, oldest
// first, each with its `author` ({ id, name, email }).
export async function getComments(ticketId) {
  const responseBody = await apiRequest(`/tickets/${ticketId}/comments`);
  return responseBody.data;
}

// POST /tickets/:ticketId/comments: returns the saved comment, with its
// author. The API calls the comment's text `body`, which is why the request
// body is { body: commentText }.
export async function createComment(ticketId, commentText) {
  const responseBody = await apiRequest(`/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: { body: commentText },
  });
  return responseBody.data;
}

// DELETE /tickets/:ticketId/comments/:id: 204 No Content, so nothing to
// return.
export async function deleteComment(ticketId, commentId) {
  await apiRequest(`/tickets/${ticketId}/comments/${commentId}`, { method: 'DELETE' });
}
