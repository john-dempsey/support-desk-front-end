// Comments for the page tests to "receive from the API", in the same shape
// as GET /tickets/:ticketId/comments: oldest first, each with its author.

export const testComments = [
  {
    id: 1,
    body: 'Have you checked your spam folder?',
    ticketId: 1,
    authorId: 3,
    author: { id: 3, name: 'Alex Agent', email: 'alex@example.com' },
    createdAt: '2026-10-08T11:00:00.000Z',
  },
  {
    id: 2,
    body: 'Yes, it is not there either.',
    ticketId: 1,
    authorId: 1,
    author: { id: 1, name: 'Casey Customer', email: 'casey@example.com' },
    createdAt: '2026-10-08T11:30:00.000Z',
  },
];
