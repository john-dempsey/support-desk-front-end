// The app's one connection to the API's Socket.IO server, shared by every
// component that wants live notifications: the same "one shared instance"
// idea as the back-end's config/socket.js, seen from the other end.
//
// HTTP only answers when asked. A socket stays open, so the server can
// send a message the moment something happens. The API uses it for one
// thing: a `notification.created` event, sent only to the user it's for,
// carrying the notification it has just saved.
//
// A push is lost if this user isn't connected when it's sent: nothing is
// replayed later. That's why the notifications page loads its list over
// REST (notifications.api.js), and the socket only adds to it.
import { io } from 'socket.io-client';
import { getSavedToken } from '../api/tokenStorage.js';

// The same base URL as client.js: Socket.IO runs on the API's own port.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// autoConnect: false means "don't connect yet". There's nobody to connect
// for until a user has logged in, so connectSocket() does it then.
const socket = io(API_URL, { autoConnect: false });

// The server doesn't know who a socket belongs to until it's told, so the
// token is sent on *every* connect. If the connection drops (the API
// restarts, the Wi-Fi blinks), Socket.IO reconnects by itself, but the
// server has forgotten the socket's room, so it must be told again.
// The token comes from the same place as client.js's: the one saved at
// login.
function sendToken() {
  socket.emit('authenticate', getSavedToken());
}

export function connectSocket() {
  // off() first, so connecting twice never sends the token twice.
  socket.off('connect', sendToken);
  socket.on('connect', sendToken);
  socket.connect();
}

// Called on logout: no more pushes for the user who has left.
export function disconnectSocket() {
  socket.off('connect', sendToken);
  socket.disconnect();
}

// Calls `handler` with each new notification as it arrives. Returns a
// function that stops listening, for a component's effect cleanup:
//   const stopListening = onNotification(handleNotification);
//   return stopListening;
export function onNotification(handler) {
  socket.on('notification.created', handler);
  return () => {
    socket.off('notification.created', handler);
  };
}
