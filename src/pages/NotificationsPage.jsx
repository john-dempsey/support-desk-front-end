// The page at /notifications: everything the API has told this user,
// newest first, with a "Mark as read" button on each unread one.
//
// It works in two ways at once, because each one on its own would miss
// something:
//   1. History over REST: the page loads the saved list when it opens
//      (GET /notifications). That includes what happened while the user
//      was away, and SLA breaches, which the API never pushes.
//   2. Live over Socket.IO: while the page is open, each new notification
//      the API pushes is added to the top of the list.
import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '../api/notifications.api.js';
import { useNotifications } from '../context/notificationsContext.js';
import { onNotification } from '../realtime/socket.js';
import NotificationList from '../components/NotificationList.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

function NotificationsPage() {
  const { refreshUnreadCount } = useNotifications();
  // null = not loaded yet, as in TicketListPage.
  const [notifications, setNotifications] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [markErrorMessage, setMarkErrorMessage] = useState('');

  // 1. Load the saved notifications once, when the page opens.
  useEffect(() => {
    let ignore = false;

    async function loadNotifications() {
      try {
        const notificationsData = await getNotifications();
        if (!ignore) {
          setNotifications(notificationsData);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      ignore = true;
    };
  }, []);

  // 2. Add each pushed notification to the top of the list.
  useEffect(() => {
    function handleNotification(newNotification) {
      // This handler is registered once, when the page opens, so the
      // `notifications` variable it can see is the list as it was then
      // (null!). Passing setNotifications() a function instead lets React
      // hand it the list as it is *now*, and the function returns the new
      // list: the new notification, then all the current ones.
      setNotifications((currentNotifications) => {
        // Still loading: leave it. The API saved this notification before
        // pushing it, so the list on its way almost always includes it.
        // (Only if the API answered the list request in the moment before
        // the save is it missing, until the page is next opened.)
        if (currentNotifications === null) {
          return null;
        }
        return [newNotification, ...currentNotifications];
      });
    }

    const stopListening = onNotification(handleNotification);
    // Stop listening when the user leaves the page.
    return stopListening;
  }, []);

  async function handleMarkRead(notificationToMark) {
    setMarkErrorMessage('');
    try {
      const updatedNotification = await markNotificationRead(notificationToMark.id);
      // The API sends back the notification with readAt filled in. map()
      // makes a new array the same length, swapping in the updated one and
      // keeping every other notification as it was. It's the function form
      // again, because a push may have added to the list while this
      // request was on its way.
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === updatedNotification.id ? updatedNotification : notification,
        ),
      );
      // One fewer unread, so NavBar's count needs updating too.
      refreshUnreadCount();
    } catch (error) {
      setMarkErrorMessage(error.message);
    }
  }

  return (
    <>
      <h1>Notifications</h1>
      {isLoading && <Loading message="Loading notifications…" />}
      {errorMessage && <ErrorMessage message={errorMessage} />}
      {markErrorMessage && <ErrorMessage message={markErrorMessage} />}
      {notifications && (
        <NotificationList notifications={notifications} onMarkRead={handleMarkRead} />
      )}
    </>
  );
}

export default NotificationsPage;
