// How many notifications the user hasn't read yet is shown in NavBar, but
// it changes on NotificationsPage (Mark as read) and when a push arrives.
// So, like the logged-in user, it's shared through a context, and any
// component can read it with useNotifications().
//
// Two files, as with authContext.js and AuthProvider.jsx: this one creates
// the context and the hook; NotificationsProvider.jsx fills it.
import { createContext, useContext } from 'react';

export const NotificationsContext = createContext(null);

// The one way components get the value:
//   const { unreadCount, refreshUnreadCount } = useNotifications();
export function useNotifications() {
  return useContext(NotificationsContext);
}
