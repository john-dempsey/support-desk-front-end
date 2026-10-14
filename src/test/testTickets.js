// Tickets for the page tests to "receive from the API". They're the same
// shape the real API sends (GET /tickets and GET /tickets/:id), so the
// pages are tested with realistic data, without a back-end running.

export const ticketAssignedToAlex = {
  id: 1,
  subject: 'Cannot log in',
  description: 'Password reset email never arrives',
  status: 'open',
  customer: { id: 1, name: 'Casey Customer', email: 'casey@example.com' },
  assignedAgent: { id: 3, name: 'Alex Agent', email: 'alex@example.com' },
  createdAt: '2026-10-08T09:15:00.000Z',
  updatedAt: '2026-10-08T09:15:00.000Z',
};

export const unassignedTicket = {
  id: 2,
  subject: 'Invoice discrepancy',
  description: 'Charged twice for March',
  status: 'in_progress',
  customer: { id: 2, name: 'Priya Patel', email: 'priya@example.com' },
  assignedAgent: null,
  createdAt: '2026-10-08T10:40:00.000Z',
  updatedAt: '2026-10-09T14:05:00.000Z',
};

export const testTickets = [ticketAssignedToAlex, unassignedTicket];
