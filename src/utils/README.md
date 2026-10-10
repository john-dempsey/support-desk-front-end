# utils/

Small plain functions with no React in them, used by more than one
component. For example:

- `formatDate.js`: turns the API's ISO date strings
  (`2026-10-10T09:30:00.000Z`) into something readable, using
  `Intl.DateTimeFormat`.

Because they're plain functions, they're also the easiest things in the app
to test.
