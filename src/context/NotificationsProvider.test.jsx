// Tests the real NotificationsProvider, with notifications.api.js and the
// socket faked. The logged-in user comes from a plain AuthContext value,
// so a test can "log in" or "log out" by rendering again with a different
// user. A tiny component, ShowCount, displays the count the provider
// gives it.
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NotificationsProvider from './NotificationsProvider.jsx';
import { useNotifications } from './notificationsContext.js';
import { AuthContext } from './authContext.js';
import { getUnreadNotifications } from '../api/notifications.api.js';
import { connectSocket, disconnectSocket, onNotification } from '../realtime/socket.js';
import { agentUser } from '../test/testUsers.js';
import { commentPush, unreadNotification } from '../test/testNotifications.js';
import { captureNotificationHandler } from '../test/fakeSocket.js';

vi.mock('../api/notifications.api.js');
vi.mock('../realtime/socket.js');

function ShowCount() {
  const { unreadCount, refreshUnreadCount } = useNotifications();
  return (
    <>
      <p>{unreadCount} unread</p>
      <button type="button" onClick={refreshUnreadCount}>
        Refresh
      </button>
    </>
  );
}

function providersFor(user) {
  return (
    <AuthContext value={{ user }}>
      <NotificationsProvider>
        <ShowCount />
      </NotificationsProvider>
    </AuthContext>
  );
}

describe('NotificationsProvider', () => {
  it('shows 0, and asks nothing, when nobody is logged in', () => {
    render(providersFor(null));

    expect(screen.getByText('0 unread')).toBeInTheDocument();
    expect(getUnreadNotifications).not.toHaveBeenCalled();
    expect(connectSocket).not.toHaveBeenCalled();
  });

  it('loads the unread count for a logged-in user', async () => {
    getUnreadNotifications.mockResolvedValue([unreadNotification]);
    onNotification.mockReturnValue(vi.fn());

    render(providersFor(agentUser));

    expect(await screen.findByText('1 unread')).toBeInTheDocument();
  });

  it('connects the socket when a user logs in', () => {
    getUnreadNotifications.mockResolvedValue([]);
    onNotification.mockReturnValue(vi.fn());

    render(providersFor(agentUser));

    expect(connectSocket).toHaveBeenCalled();
  });

  it('stops listening, disconnects and goes back to 0 on logout', async () => {
    getUnreadNotifications.mockResolvedValue([unreadNotification]);
    const stopListening = vi.fn();
    onNotification.mockReturnValue(stopListening);
    const { rerender } = render(providersFor(agentUser));
    await screen.findByText('1 unread');

    rerender(providersFor(null));

    expect(stopListening).toHaveBeenCalled();
    expect(disconnectSocket).toHaveBeenCalled();
    expect(screen.getByText('0 unread')).toBeInTheDocument();
  });

  it('asks the API for the count again when a notification is pushed', async () => {
    getUnreadNotifications.mockResolvedValue([unreadNotification]);
    const socket = captureNotificationHandler();
    render(providersFor(agentUser));
    await screen.findByText('1 unread');

    // By the time the push arrives, the API has saved the new one.
    getUnreadNotifications.mockResolvedValue([commentPush, unreadNotification]);
    await socket.push(commentPush);

    expect(await screen.findByText('2 unread')).toBeInTheDocument();
    expect(getUnreadNotifications).toHaveBeenCalledTimes(2);
  });

  it('refreshUnreadCount() asks the API for the count again', async () => {
    getUnreadNotifications.mockResolvedValue([unreadNotification]);
    onNotification.mockReturnValue(vi.fn());
    render(providersFor(agentUser));
    await screen.findByText('1 unread');

    // e.g. NotificationsPage after "Mark as read".
    getUnreadNotifications.mockResolvedValue([]);
    await userEvent.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(await screen.findByText('0 unread')).toBeInTheDocument();
  });

  it('keeps showing the last count if the API fails', async () => {
    getUnreadNotifications.mockRejectedValue(new Error("Can't reach the API"));
    onNotification.mockReturnValue(vi.fn());

    render(providersFor(agentUser));

    // Give the failed request time to finish; nothing should change.
    await act(async () => {});
    expect(screen.getByText('0 unread')).toBeInTheDocument();
  });
});
