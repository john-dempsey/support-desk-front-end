// Requests about the logged-in user's notifications. The API saves every
// notification as a row before it pushes it over Socket.IO (Stage 5's
// second half), so these two routes are the full history: anything that
// happened while the user was away, and SLA breaches, which are saved but
// never pushed. GET /notifications and PATCH /notifications/:id/read were
// added to the back-end in Lesson 07 for this page.
import { apiRequest } from './client.js';

// GET /notifications: returns the user's notifications, newest first.
// Each is { id, type, message, ticketId, readAt, createdAt }; readAt is
// null until it's marked as read, and ticketId is null once its ticket has
// been deleted. There's no pagination, so no `meta`.
export async function getNotifications() {
  const responseBody = await apiRequest('/notifications');
  return responseBody.data;
}

// GET /notifications?unread=true: only the ones not read yet. NavBar's
// count is the length of this list.
export async function getUnreadNotifications() {
  const responseBody = await apiRequest('/notifications?unread=true');
  return responseBody.data;
}

// PATCH /notifications/:id/read: returns the notification, now with
// readAt set. There's no request body: the URL says it all.
export async function markNotificationRead(notificationId) {
  const responseBody = await apiRequest(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
  return responseBody.data;
}
