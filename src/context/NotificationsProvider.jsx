// Holds the number of unread notifications, and shares it with the whole
// app through NotificationsContext (see notificationsContext.js).
// main.jsx puts it inside <AuthProvider>, because it needs to know who is
// logged in. Every component inside it can call useNotifications() and
// get:
//   unreadCount          how many notifications the user hasn't read
//   refreshUnreadCount() asks the API for the number again
//
// It also opens the socket when someone logs in, closes it when they log
// out, and refreshes the count whenever a notification is pushed.
import { useEffect, useState } from 'react';
import { NotificationsContext } from './notificationsContext.js';
import { useAuth } from './authContext.js';
import { getUnreadNotifications } from '../api/notifications.api.js';
import { connectSocket, disconnectSocket, onNotification } from '../realtime/socket.js';

// The API is the truth: the count is always the length of the user's
// unread list, never a number this file adds to or takes away from.
async function fetchUnreadCount() {
  const unreadNotifications = await getUnreadNotifications();
  return unreadNotifications.length;
}

function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Runs when the app starts and whenever the user changes (log in, log
  // out, or another user logs in).
  useEffect(() => {
    // Nobody logged in: no count to load, and no socket to open.
    if (user === null) {
      return;
    }

    // The same `ignore` flag as the pages: after a logout, a late answer
    // about the old user's count must not be shown.
    let ignore = false;

    async function loadUnreadCount() {
      try {
        const count = await fetchUnreadCount();
        if (!ignore) {
          setUnreadCount(count);
        }
      } catch {
        // The count is extra information in the corner of the screen, so
        // a failure leaves the last number showing, rather than an error
        // on every page. (A 401 still logs the user out, in client.js.)
      }
    }

    // 1. History over REST: everything not read yet, including what
    //    arrived while the user was away.
    loadUnreadCount();

    // 2. Live updates over the socket: each push means a new unread
    //    notification. Asking the API again, instead of adding 1, keeps
    //    the API as the truth. The API saves a notification before it
    //    pushes it, so the new one is always in the answer.
    connectSocket();
    const stopListening = onNotification(() => {
      loadUnreadCount();
    });

    // When the user logs out (user becomes null) or changes: stop
    // listening and close the socket, so nobody gets someone else's
    // pushes, and forget the old user's count.
    return () => {
      ignore = true;
      stopListening();
      disconnectSocket();
      setUnreadCount(0);
    };
  }, [user]);

  // For pages that change what's unread, e.g. NotificationsPage after
  // "Mark as read".
  async function refreshUnreadCount() {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch {
      // As above: keep the last number showing.
    }
  }

  const notificationsValue = { unreadCount, refreshUnreadCount };

  return <NotificationsContext value={notificationsValue}>{children}</NotificationsContext>;
}

export default NotificationsProvider;
