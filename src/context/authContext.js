// The logged-in user is needed all over the app: the navigation bar, the
// pages that hide buttons by role, ProtectedRoute. Passing it as a prop
// through every component in between would be tiring and easy to get
// wrong. A context lets any component read it directly, with useAuth().
//
// This file only creates the context and the hook that reads it.
// AuthProvider.jsx fills it with the real value; in tests,
// renderWithProviders fills it with a fake one.
import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

// The one way components get the auth value:
//   const { user, hasRole } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}
