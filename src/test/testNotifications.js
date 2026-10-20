// Notifications for the tests to "receive from the API", in the same shape
// as one item of GET /notifications, and as the payload of a
// notification.created push.

// For Alex (the agent): ticket 1 was assigned to them. Not read yet.
export const unreadNotification = {
  id: 7,
  type: 'ticket.assigned',
  message: 'Ticket #1 was assigned to you',
  ticketId: 1,
  readAt: null,
  createdAt: '2026-10-08T11:00:00.000Z',
};

// Already read, and its ticket has since been deleted (ticketId: null).
export const readNotification = {
  id: 6,
  type: 'ticket.created',
  message: 'New ticket in the queue: "Printer on fire".',
  ticketId: null,
  readAt: '2026-10-08T10:30:00.000Z',
  createdAt: '2026-10-08T10:00:00.000Z',
};

// What a push looks like when Casey comments on ticket 1, which is
// assigned to Alex.
export const commentPush = {
  id: 8,
  type: 'ticket.commented',
  message: 'Casey Customer commented on "Cannot log in".',
  ticketId: 1,
  readAt: null,
  createdAt: '2026-10-08T12:00:00.000Z',
};

export const testNotifications = [unreadNotification, readNotification];
