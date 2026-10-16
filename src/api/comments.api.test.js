// Checks each function in comments.api.js uses the nested URL
// (/tickets/:ticketId/comments). apiRequest() is faked, as in
// tickets.api.test.js.
import { describe, expect, it, vi } from 'vitest';
import { createComment, deleteComment, getComments } from './comments.api.js';
import { apiRequest } from './client.js';

vi.mock('./client.js');

describe('comments.api', () => {
  it("getComments() calls GET /tickets/:ticketId/comments and returns the comments", async () => {
    const comments = [{ id: 1, body: 'Have you tried turning it off and on?' }];
    apiRequest.mockResolvedValue({ data: comments });

    const result = await getComments('2');

    expect(apiRequest).toHaveBeenCalledWith('/tickets/2/comments');
    expect(result).toEqual(comments);
  });

  it('createComment() sends the text as `body`', async () => {
    apiRequest.mockResolvedValue({ data: { id: 3, body: 'Thanks!' } });

    await createComment(2, 'Thanks!');

    expect(apiRequest).toHaveBeenCalledWith('/tickets/2/comments', {
      method: 'POST',
      body: { body: 'Thanks!' },
    });
  });

  it('deleteComment() sends DELETE /tickets/:ticketId/comments/:id', async () => {
    apiRequest.mockResolvedValue(null);

    await deleteComment(2, 3);

    expect(apiRequest).toHaveBeenCalledWith('/tickets/2/comments/3', { method: 'DELETE' });
  });
});
