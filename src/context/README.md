# context/

React Context for data that many components need at once, without passing
props through every level. Keep it for things that really are app-wide.

- `authContext.js`: the context for the logged-in user, and `useAuth()`,
  the hook every component uses to read it.
- `AuthProvider.jsx`: the component that holds the user, checks a saved
  token when the app starts, and provides `login()`, `register()`,
  `logout()` and `hasRole()`.

They're two files because React's fast refresh (which keeps your page's
state when you save a file in `npm run dev`) only works for files that
export nothing but components.

Most state belongs in the page that uses it (`useState`), not here.
