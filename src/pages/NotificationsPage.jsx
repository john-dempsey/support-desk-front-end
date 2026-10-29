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
//
// Since Stage 6 the useFetch hook does part 1's loading.
import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '../api/notifications.api.js';
import { useFetch } from '../hooks/useFetch.js';
import { useNotifications } from '../context/notificationsContext.js';
import { onNotification } from '../realtime/socket.js';
import NotificationList from '../components/NotificationList.jsx';
import Loading from '../components/Loading.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import PageTitle from '../components/PageTitle.jsx';

function NotificationsPage() {
  const { refreshUnreadCount } = useNotifications();
  // 1. Load the saved notifications once, when the page opens.
  const {
    data: notifications,
    setData: setNotifications,
    error,
    isLoading,
  } = useFetch(getNotifications);
  const [markErrorMessage, setMarkErrorMessage] = useState('');

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
    // setNotifications never changes (it's useFetch's own useState
    // setter), so listing it doesn't make the effect run again. oxlint
    // asks for it because it can't see inside our hook.
  }, [setNotifications]);

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
      <PageTitle title="Notifications" />
      <h1>Notifications</h1>
      {isLoading && <Loading message="Loading notifications…" />}
      {error && <ErrorMessage message={error.message} />}
      {markErrorMessage && <ErrorMessage message={markErrorMessage} />}
      {notifications && (
        <NotificationList notifications={notifications} onMarkRead={handleMarkRead} />
      )}
    </>
  );
}

export default NotificationsPage;
