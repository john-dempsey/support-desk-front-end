// Users for the tests to "log in" as, one per role, in the shape the API
// sends from /auth/login and /auth/me. Their ids match the customer,
// agent and comment authors in testTickets.js and testComments.js, so a
// test can check, for example, that Casey may delete Casey's comment.

export const customerUser = {
  id: 1,
  name: 'Casey Customer',
  email: 'casey@example.com',
  role: 'customer',
  createdAt: '2026-10-01T09:00:00.000Z',
};

export const agentUser = {
  id: 3,
  name: 'Alex Agent',
  email: 'alex@example.com',
  role: 'agent',
  createdAt: '2026-10-01T09:00:00.000Z',
};

export const adminUser = {
  id: 4,
  name: 'Admin Ada',
  email: 'ada@example.com',
  role: 'admin',
  createdAt: '2026-10-01T09:00:00.000Z',
};
