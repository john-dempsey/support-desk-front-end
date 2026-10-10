# context/

React Context for data that many components need at once, without passing
props through every level. Keep it for things that really are app-wide.

- **Stage 4 (authentication):** `AuthContext.jsx`, which holds the logged-in
  user and the `login()` / `logout()` functions.

Most state belongs in the page that uses it (`useState`), not here.
