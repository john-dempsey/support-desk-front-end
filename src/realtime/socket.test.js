// Tests socket.js without a real server. socket.io-client is faked: io()
// returns a pretend socket that remembers its event handlers, so a test
// can "fire" an event (a connect, or a push from the server) by calling
// the handlers itself.
import { describe, expect, it, vi } from 'vitest';
import { connectSocket, disconnectSocket, onNotification } from './socket.js';
import { saveToken } from '../api/tokenStorage.js';
import { commentPush } from '../test/testNotifications.js';

// vi.hoisted() makes fakeSocket exist before vi.mock() below runs, which
// Vitest moves to the top of the file.
const fakeSocket = vi.hoisted(() => {
  const handlers = {};
  return {
    // `on` and `off` really store and remove handlers, so the fake works
    // like the real thing.
    on(eventName, handler) {
      handlers[eventName] = handlers[eventName] || [];
      handlers[eventName].push(handler);
    },
    off(eventName, handler) {
      handlers[eventName] = (handlers[eventName] || []).filter(
        (storedHandler) => storedHandler !== handler,
      );
    },
    // Calls every handler for an event, as the real socket would when the
    // event happens.
    fire(eventName, payload) {
      for (const handler of handlers[eventName] || []) {
        handler(payload);
      }
    },
    emit: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
});

vi.mock('socket.io-client', () => ({
  io: () => fakeSocket,
}));

describe('socket', () => {
  it('connectSocket() connects, and sends the saved token once connected', () => {
    saveToken('casey-token');
    connectSocket();

    expect(fakeSocket.connect).toHaveBeenCalled();
    expect(fakeSocket.emit).not.toHaveBeenCalled();

    fakeSocket.fire('connect');

    expect(fakeSocket.emit).toHaveBeenCalledWith('authenticate', 'casey-token');
    disconnectSocket();
  });

  it('sends the token again after a reconnect', () => {
    saveToken('casey-token');
    connectSocket();
    fakeSocket.fire('connect');
    // The connection dropped and Socket.IO reconnected by itself.
    fakeSocket.fire('connect');

    expect(fakeSocket.emit).toHaveBeenCalledTimes(2);
    disconnectSocket();
  });

  it('sends the token only once per connect, even after connectSocket() twice', () => {
    connectSocket();
    connectSocket();
    fakeSocket.fire('connect');

    expect(fakeSocket.emit).toHaveBeenCalledTimes(1);
    disconnectSocket();
  });

  it('disconnectSocket() disconnects, and stops sending the token', () => {
    connectSocket();

    disconnectSocket();
    fakeSocket.fire('connect');

    expect(fakeSocket.disconnect).toHaveBeenCalled();
    expect(fakeSocket.emit).not.toHaveBeenCalled();
  });

  it('onNotification() passes each pushed notification to the handler', () => {
    const handler = vi.fn();
    const stopListening = onNotification(handler);

    fakeSocket.fire('notification.created', commentPush);

    expect(handler).toHaveBeenCalledWith(commentPush);
    stopListening();
  });

  it('the function onNotification() returns stops the handler being called', () => {
    const handler = vi.fn();
    const stopListening = onNotification(handler);

    stopListening();
    fakeSocket.fire('notification.created', commentPush);

    expect(handler).not.toHaveBeenCalled();
  });
});
