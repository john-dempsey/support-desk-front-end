# Support Desk front-end

A React front-end for the **Support Desk** API, built step by step in class.
It's the worked example for Assignment 2: you'll use the same techniques to
build a front-end for your own case-study API.

It started as a copy of the front-end starter (Stage 0). Each stage adds
one thing, and the code is tagged at the end of each stage (`stage-00`,
`stage-01`, ...), so you can look at, or go back to, any stage.

## Where we are: Stage 2, Fetching from the API

The ticket pages now load real tickets from the Support Desk API. The
hard-coded array from Stage 1 is gone.

| URL | Page |
|---|---|
| `/` | `HomePage`: a welcome and a link to the tickets |
| `/tickets` | `TicketListPage`: every ticket, from `GET /tickets` |
| `/tickets/:ticketId` | `TicketDetailPage`: one ticket, from `GET /tickets/:id` |
| anything else | `NotFoundPage` |

New in this stage:

- **An API module.** `src/api/tickets.api.js` has one function per
  endpoint: `getTickets()` and `getTicket(id)`. Pages call these and
  never build URLs or call `fetch()` themselves.
- **`useEffect` and `useState`.** Each page loads its data when it first
  appears, using the same pattern as the Stage 0 starter's home page.
- **Loading, error and empty states.** While the request is on its way
  the page says "Loading…". If it fails, the page shows why. If the
  API sends an empty list, the page says there are no tickets.
- **Status codes mean something.** `TicketDetailPage` shows "Ticket not
  found" for a `404` (and for a `400`, which the API sends for an ID like
  `abc`), and an error message for anything else.
- **A stand-in token.** Every Support Desk ticket route needs a token,
  but there's no login page until Stage 4. For now you paste one into
  `.env` by hand (see below).

## What you need

- Node.js 22 or later
- The Support Desk API running on `http://localhost:3000`, with its
  database migrated and seeded (see the back-end's README)

## Running it

```bash
npm install
cp .env.example .env    # then change VITE_API_URL if your API isn't on port 3000
npm run dev             # front-end on http://localhost:5173
```

Then get a token for `.env` (next section), open
<http://localhost:5173> and click **Tickets**.

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server. Saving a file updates the browser straight away |
| `npm test` | Runs every test once |
| `npm run test:watch` | Re-runs the tests every time you save a file. Press `q` to quit |
| `npm run lint` | Checks the code for common mistakes |
| `npm run build` | Builds the production version into `dist/` |
| `npm run preview` | Serves the `dist/` build locally, to check it before you deploy |

If you change `.env`, save it and Vite restarts itself (the terminal shows
`.env changed, restarting server...`). Then reload the page.

## The stand-in token (Stages 2 and 3 only)

The API only answers ticket requests that carry a token. Until Stage 4
adds a login page, log in once by hand and paste the token into `.env`:

1. In a REST client, send
   `POST http://localhost:3000/auth/login` with the JSON body
   `{ "email": "ada@example.com", "password": "password123" }`.
   Ada is an admin, so she can see every ticket. (The API allows only 10
   logins every 15 minutes. If you get `429 Too many requests`, wait a
   few minutes.)
2. Copy the `token` from the response (the long string, without the
   quotes) into `.env`:

   ```
   VITE_DEV_TOKEN=eyJhbGciOi...
   ```

3. Save `.env`. Vite restarts itself; reload the page.

`api/client.js` sends this token in an `Authorization: Bearer ...`
header with every request. Stage 4 removes `VITE_DEV_TOKEN` and uses the
token of whoever logs in instead.

**If your own API has no authentication**, leave `VITE_DEV_TOKEN` empty.
No header is sent, and everything works the same.

If the tickets page shows an error instead of tickets:

| Message | What it means |
|---|---|
| Can't reach the API at http://localhost:3000 — is the back-end running? | The API isn't running, or `VITE_API_URL` is wrong |
| Authentication required | `VITE_DEV_TOKEN` is empty or missing |
| Invalid or expired token | The token is wrong, or has expired. Log in again and paste the new one. (Tokens last as long as `JWT_EXPIRES_IN` in the API's `.env`) |

## How it's organised

```
index.html              the single HTML page; React fills in <div id="root">
src/
  main.jsx              entry point: starts React and the router
  App.jsx               the route table: which page shows at which URL
  index.css             global styles
  api/
    client.js           apiRequest(): the only code that calls fetch()
    tickets.api.js      getTickets(), getTicket(id)
  pages/                one component per URL: HomePage, TicketListPage,
                        TicketDetailPage, NotFoundPage
  components/           reusable pieces: NavBar, TicketList, StatusBadge,
                        Loading, ErrorMessage
  utils/
    formatDate.js       ISO date string → readable date
  context/              shared app-wide state (Stage 4, for login)
  hooks/                your own custom hooks (Stage 6)
  test/
    setup.js            runs before the tests
    renderWithProviders.jsx   renders a component inside a router, for tests
    testTickets.js      tickets for the tests to "receive from the API"
```

It mirrors the layers you know from the back-end:

| Back-end | Front-end |
|---|---|
| `routes/index.js`: which URL goes to which controller | `App.jsx`: which URL shows which page |
| `req.params.id` | `useParams()` |
| controllers: handle a request, call a service | pages: hold the data, call an API function, decide what to show |
| services: the only code that talks to the database | `api/*.api.js`: the only code that talks to the API |
| `utils/response.js` + `errorHandler.js`: one response/error shape | `api/client.js`: reads that shape back |
| `middleware/notFound.js` | `pages/NotFoundPage.jsx` |

**Pages** own the data and **components** just display what they're given as
props. Neither calls `fetch()` directly: every request goes through a
function in `src/api/`.

## Tests

```bash
npm test
```

You should see:

```
 Test Files  9 passed (9)
      Tests  36 passed (36)
```

Test files sit next to the file they test (`TicketList.jsx` →
`TicketList.test.jsx`). They use [Vitest](https://vitest.dev/) and
[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

- `src/utils/formatDate.test.js` tests a plain function: call it, check
  what it returns.
- `src/components/StatusBadge.test.jsx` renders a component with different
  props.
- `src/components/TicketList.test.jsx` and the page tests use
  `renderWithProviders()`, because anything with a `<Link>` or
  `useParams()` needs a router around it.
- The page tests replace `tickets.api.js` with a fake
  (`vi.mock('../api/tickets.api.js')`), so each test decides what "the
  API" sends back: tickets, an empty list, or an error. The back-end
  doesn't need to be running for `npm test`.
- `src/App.test.jsx` checks which page shows at which URL.
- `src/api/client.test.js` replaces `fetch()` with a fake, to test the API
  client without a back-end. `src/api/tickets.api.test.js` replaces
  `apiRequest()` with a fake, to check each function asks for the right
  URL.

Find elements the way a user would: by role, label or text (`getByRole`,
`getByLabelText`, `findByText`), not by CSS class.

## Stages

1. **Foundations:** components, props, routes, a hard-coded list.
2. **Fetching from the API** (you are here): load the tickets with
   `GET /tickets`, with loading, error and "nothing here yet" states.
3. **Full CRUD:** create, edit and delete tickets, comments, tags,
   filtering, sorting and pagination.
4. **Login and roles** *(needs authentication in the back-end)*.
5. **Notifications** *(needs notifications in the back-end)*.
6. **Hardening:** a `useFetch` hook, an error boundary, accessibility and
   a production build.

## Try it yourself

Run `npm test` after each change, and commit when it passes.

1. Open the browser's developer tools, go to the **Network** tab, and
   reload `/tickets`. Find the request to `/tickets`. What status did it
   get, what headers did it send, and what did the response look like?
   Why are there two requests in development? (Hint: `StrictMode` in
   `main.jsx`.)
2. Stop the API, then reload `/tickets`. Then start it again, empty
   `VITE_DEV_TOKEN` in `.env`, and reload. Which message does each
   problem give, and which file wrote each message?
3. Log in as `casey@example.com` instead of Ada, and use Casey's token.
   How many tickets do you see now, and why? Open `/tickets/2`. What
   does the page say, and why does the API answer `404` and not `403`?
4. In `TicketListPage.jsx`, change `useState(null)` to `useState([])`.
   What does the page show for a moment before the tickets arrive?
   Change it back, then explain in your own words why `null` and `[]`
   mean different things here.
5. Add a test to `TicketDetailPage.test.jsx` that checks the ticket's
   customer name is shown. Use `unassignedTicket` from
   `src/test/testTickets.js`.
6. **Challenge:** the API also has `GET /tickets/:ticketId/comments`. Add
   a `getComments(ticketId)` function in a new `src/api/comments.api.js`,
   and show the comments under the ticket's description, with their own
   loading and error states.
