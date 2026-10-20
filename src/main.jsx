// The entry point index.html loads. It finds the <div id="root"> in
// index.html, wraps the app in BrowserRouter (so <Routes>, <NavLink> and
// the routing hooks work anywhere inside it), AuthProvider (so any
// component can find out who is logged in, with useAuth()) and
// NotificationsProvider (the unread count, with useNotifications()), and
// renders <App />. NotificationsProvider goes inside AuthProvider because
// it needs to know who is logged in. StrictMode adds extra checks in development only.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.jsx';
import AuthProvider from './context/AuthProvider.jsx';
import NotificationsProvider from './context/NotificationsProvider.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
          <App />
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
