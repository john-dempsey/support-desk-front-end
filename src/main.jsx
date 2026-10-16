// The entry point index.html loads. It finds the <div id="root"> in
// index.html, wraps the app in BrowserRouter (so <Routes>, <NavLink> and
// the routing hooks work anywhere inside it) and AuthProvider (so any
// component can find out who is logged in, with useAuth()), and renders
// <App />. StrictMode adds extra checks in development only.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './App.jsx';
import AuthProvider from './context/AuthProvider.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
