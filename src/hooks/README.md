# hooks/

Custom hooks: your own functions that start with `use` and call React's hooks
(`useState`, `useEffect`, ...) so several components can share the same logic.

Don't create one straight away. Write the logic in your pages first. When
you find yourself copying the same `useEffect` loading pattern into a third
page, that's when to move it here.

- `useFetch.js` (Stage 6): loads data from one `src/api/` function, with
  loading, error and `reload()`. Every page that loads data uses it.
