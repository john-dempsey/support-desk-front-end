// A custom hook: our own function, starting with "use", that calls React's
// hooks for us. Since Stage 2 every page that loads data has had the same
// state (the data, an error, "still loading?") and the same useEffect
// with an `ignore` flag. This file holds that pattern once, so each page
// only says *what* to load:
//
//   const { data, setData, error, isLoading, reload } = useFetch(getTags);
//   const { data, ... } = useFetch(getTicket, ticketId);
//
// Pass an API function itself (getTicket), never a new arrow such as
// () => getTicket(ticketId). The effect runs again whenever fetchFunction
// changes, and an arrow written in a page is a brand-new function on every
// render, so the page would load, re-render, and load again, forever.
import { useEffect, useState } from 'react';

// fetchFunction: one of the functions in src/api/, e.g. getTickets.
// argument: the one value it needs (a ticket ID, a query string), if any.
// Returns:
//   data      what fetchFunction returned, or null until it has
//   setData   to change the data after a create, delete or push
//   error     the Error the API client threw (with .status), or null
//   isLoading true until the request has finished
//   reload    a function that asks the API again
export function useFetch(fetchFunction, argument) {
  // null means "not loaded yet", which is different from [] ("loaded, and
  // there are none"), so a page doesn't say "There are none" too early.
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // Its only job is to be in the effect's dependency list: adding 1 makes
  // the effect run again, which is how reload() works.
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    // If the argument changes (or the page closes) before this request
    // finishes, the cleanup below sets `ignore` to true, so a slow,
    // out-of-date response can't replace the data of a newer one.
    let ignore = false;

    async function loadData() {
      try {
        const result = await fetchFunction(argument);
        if (!ignore) {
          setData(result);
        }
      } catch (caughtError) {
        if (!ignore) {
          setError(caughtError);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      ignore = true;
      // Go back to "loading" while the next request is on its way, so the
      // old data or an old error isn't shown in the meantime.
      setData(null);
      setError(null);
      setIsLoading(true);
    };
  }, [fetchFunction, argument, reloadCount]);

  function reload() {
    // The function form, because a page may call reload() from code that
    // runs later than its render (e.g. after an await).
    setReloadCount((currentCount) => currentCount + 1);
  }

  return { data, setData, error, isLoading, reload };
}
