// Holds who is logged in, and shares it with the whole app through
// AuthContext (see authContext.js). main.jsx wraps the app in
// <AuthProvider>, so every component inside it can call useAuth() and get:
//   user              the logged-in user ({ id, name, email, role }), or null
//   isCheckingSession true while a saved token is being checked
//   login(email, password), register(name, email, password), logout()
//   hasRole(...roles) true if the user has one of these roles
import { useEffect, useState } from 'react';
import { AuthContext } from './authContext.js';
import * as authApi from '../api/auth.api.js';
import { setSessionExpiredHandler } from '../api/client.js';
import { clearSavedToken, getSavedToken, saveToken } from '../api/tokenStorage.js';

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Only a saved token needs checking. With none, there's nothing to wait
  // for: the user is logged out.
  const [isCheckingSession, setIsCheckingSession] = useState(getSavedToken() !== null);

  // When the app first loads, ask the API who the saved token belongs to.
  useEffect(() => {
    if (getSavedToken() === null) {
      return;
    }

    let ignore = false;

    async function checkSession() {
      try {
        const currentUser = await authApi.getCurrentUser();
        if (!ignore) {
          setUser(currentUser);
        }
      } catch {
        // Usually a 401: the token has expired, or its user is gone. Any
        // other problem (the API is down) is treated the same way. Either
        // way, the user starts logged out and can simply log in again, and
        // the login page will show any problem with the API.
        if (!ignore) {
          clearSavedToken();
        }
      } finally {
        if (!ignore) {
          setIsCheckingSession(false);
        }
      }
    }

    checkSession();

    return () => {
      ignore = true;
    };
  }, []); // [] = only once, when the app starts

  // A 401 from any later request means the session is over, so client.js
  // calls this function, and the user is logged out wherever they are.
  // ProtectedRoute then sends them to the login page.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      clearSavedToken();
      setUser(null);
    });
    return () => {
      setSessionExpiredHandler(null);
    };
  }, []);

  // login() and register() use the user in the API's response directly:
  // there's no need to ask GET /auth/me again. Errors aren't caught here,
  // so the page that called them can show the message.
  async function login(email, password) {
    const result = await authApi.login(email, password);
    saveToken(result.token);
    setUser(result.user);
  }

  async function register(name, email, password) {
    const result = await authApi.register(name, email, password);
    saveToken(result.token);
    setUser(result.user);
  }

  function logout() {
    clearSavedToken();
    setUser(null);
  }

  // The front-end's version of the back-end's authorize('agent', 'admin'):
  // hasRole('agent', 'admin') is true for an agent or an admin.
  function hasRole(...roles) {
    return user !== null && roles.includes(user.role);
  }

  const authValue = { user, isCheckingSession, login, register, logout, hasRole };

  // Every component inside the provider can now read authValue.
  return <AuthContext value={authValue}>{children}</AuthContext>;
}

export default AuthProvider;
