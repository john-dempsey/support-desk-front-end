// TEMPORARY: a hard-coded list of tickets, so the pages can be built before
// they talk to the API. It plays the same part as the in-memory tickets
// array in Lesson 1 of the back-end. Stage 2 deletes this file and loads
// the real tickets with GET /tickets instead.

const casey = { id: 1, name: 'Casey Customer', email: 'casey@example.com' };
const priya = { id: 2, name: 'Priya Patel', email: 'priya@example.com' };
const alex = { id: 3, name: 'Alex Agent', email: 'alex@example.com' };

const sampleTickets = [
  {
    id: 1,
    subject: 'Cannot log in',
    description: 'Password reset email never arrives',
    status: 'open',
    customer: casey,
    assignedAgent: alex,
    createdAt: '2026-10-08T09:15:00.000Z',
    updatedAt: '2026-10-08T09:15:00.000Z',
  },
  {
    id: 2,
    subject: 'Invoice discrepancy',
    description: 'Charged twice for March',
    status: 'in_progress',
    customer: priya,
    // null means "not assigned to an agent yet". The API sends null, not an
    // empty object, so the pages must check for it before reading `.name`.
    assignedAgent: null,
    createdAt: '2026-10-08T10:40:00.000Z',
    updatedAt: '2026-10-09T14:05:00.000Z',
  },
  {
    id: 3,
    subject: 'Export button does nothing',
    description: 'Clicking "Export CSV" on the reports page has no effect',
    status: 'resolved',
    customer: casey,
    assignedAgent: alex,
    createdAt: '2026-10-06T16:30:00.000Z',
    updatedAt: '2026-10-09T11:20:00.000Z',
  },
  {
    id: 4,
    subject: 'Dashboard shows wrong currency',
    description: 'Amounts display in USD instead of EUR',
    status: 'closed',
    customer: priya,
    assignedAgent: null,
    createdAt: '2026-10-05T08:00:00.000Z',
    updatedAt: '2026-10-07T12:45:00.000Z',
  },
  {
    id: 5,
    subject: 'Feature request: Dark mode',
    description: 'Would love a dark mode option for the dashboard',
    status: 'open',
    customer: casey,
    assignedAgent: null,
    createdAt: '2026-10-09T14:30:00.000Z',
    updatedAt: '2026-10-09T14:30:00.000Z',
  }
];

export default sampleTickets;
