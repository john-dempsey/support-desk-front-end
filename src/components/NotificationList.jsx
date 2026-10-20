// Shows the user's notifications, newest first. Like TicketList, it just
// displays what it's given: NotificationsPage owns the list and does the
// marking as read (onMarkRead).
import { Link } from 'react-router';
import { formatDate } from '../utils/formatDate.js';

function NotificationList({ notifications, onMarkRead }) {
  if (notifications.length === 0) {
    return <p>You have no notifications.</p>;
  }

  return (
    <ul className="notification-list">
      {notifications.map((notification) => {
        // readAt stays null until the notification is marked as read.
        const isUnread = notification.readAt === null;

        return (
          <li
            key={notification.id}
            className={isUnread ? 'notification notification-unread' : 'notification'}
          >
            <p className="notification-message">
              {/* "New" is a word, not just bold text or a colour, so
                  everyone can tell which notifications are unread. */}
              {isUnread && <span className="new-label">New</span>}{' '}
              {notification.message}
            </p>
            <p className="notification-meta">{formatDate(notification.createdAt)}</p>

            <div className="button-row">
              {/* ticketId is null once the ticket has been deleted, and
                  then there's nothing to link to. */}
              {notification.ticketId !== null && (
                <Link to={`/tickets/${notification.ticketId}`}>View ticket</Link>
              )}
              {isUnread && (
                <button
                  type="button"
                  className="secondary-button"
                  aria-label={`Mark as read: ${notification.message}`}
                  onClick={() => onMarkRead(notification)}
                >
                  Mark as read
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default NotificationList;
