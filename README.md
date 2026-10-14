# Support Desk front-end

A React front-end for the **Support Desk** API, built step by step in class.
It's the worked example for Assignment 2: you'll use the same techniques to
build a front-end for your own case-study API.

It started as a copy of the front-end starter (Stage 0). Each stage adds
one thing, and the code is tagged at the end of each stage (`stage-00`,
`stage-01`, ...), so you can look at, or go back to, any stage.

## Where we are: Stage 1, Foundations

The app has a list of tickets and a page for each ticket. The tickets are
a **hard-coded array** (`src/data/sampleTickets.js`), the same idea as the
in-memory array in Lesson 1 of the back-end, so this stage doesn't need the
API at all. Stage 2 replaces the array with real data from `GET /tickets`.

| URL | Page |
|---|---|
| `/` | `HomePage`: a welcome and a link to the tickets |
| `/tickets` | `TicketListPage`: every ticket in a table |
| `/tickets/:ticketId` | `TicketDetailPage`: one ticket, e.g. `/tickets/2` |
| anything else | `NotFoundPage` |

New in this stage:

- **Components and props.** `TicketListPage` owns the tickets and passes
  them to `TicketList` as a prop. `TicketList` passes each status to
  `StatusBadge`. Components only display what they're given.
- **Route parameters.** `TicketDetailPage` reads `:ticketId` from the URL
  with `useParams()`, like `req.params` in Express.
- **Lists and keys.** `tickets.map(...)` makes one table row per ticket,
  with `key={ticket.id}`.
- **A CSS Module.** `StatusBadge.module.css` holds styles that only apply
  to `StatusBadge`.
- **A utility function.** `formatDate()` turns the API's ISO dates into
  readable ones, using the browser's built-in `Intl.DateTimeFormat`.

## What you need

- Node.js 22 or later
- From Stage 2: the Support Desk API running on `http://localhost:3000`

## Running it

```bash
npm install
cp .env.example .env    # then change VITE_API_URL if your API isn't on port 3000
npm run dev             # front-end on http://localhost:5173
```

Open <http://localhost:5173> and click **Tickets**.

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

## How it's organised

```
index.html              the single HTML page; React fills in <div id="root">
src/
  main.jsx              entry point: starts React and the router
  App.jsx               the route table: which page shows at which URL
  index.css             global styles
  api/
    client.js           apiRequest(): the only code that calls fetch()
  data/
    sampleTickets.js    hard-coded tickets (Stage 1 only)
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
```

It mirrors the layers you know from the back-end:

| Back-end | Front-end |
|---|---|
| `routes/index.js`: which URL goes to which controller | `App.jsx`: which URL shows which page |
| `req.params.id` | `useParams()` |
| controllers: handle a request, call a service | pages: hold the data, call an API function, decide what to show |
| services: the only code that talks to the database | `api/*.api.js`: the only code that talks to the API (from Stage 2) |
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
 Test Files  8 passed (8)
      Tests  28 passed (28)
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
- `src/App.test.jsx` checks which page shows at which URL.
- `src/api/client.test.js` replaces `fetch()` with a fake, to test the API
  client without a back-end.

Find elements the way a user would: by role, label or text (`getByRole`,
`getByLabelText`, `findByText`), not by CSS class.

## Stages

1. **Foundations** (you are here): components, props, routes, a
   hard-coded list.
2. **Fetching from the API:** load the tickets with `GET /tickets`, with
   loading, error and "nothing here yet" states.
3. **Full CRUD:** create, edit and delete tickets, comments, tags,
   filtering, sorting and pagination.
4. **Login and roles** *(needs authentication in the back-end)*.
5. **Notifications** *(needs notifications in the back-end)*.
6. **Hardening:** a `useFetch` hook, an error boundary, accessibility and
   a production build.

## Try it yourself

Run `npm test` after each change, and commit when it passes.

1. Add a fifth ticket to `sampleTickets.js`. Which pages show it, and which
   files did you have to change? Why is that the point of passing data as
   props?
2. Change `key={ticket.id}` in `TicketList.jsx` to `key={ticket.subject}`,
   then give two tickets the same subject. Open the browser's developer
   tools console. What does React warn you about, and why does the `id`
   make a better key? (Change it back afterwards.)
3. In `TicketDetailPage.jsx`, remove `Number()` from around `ticketId`.
   What happens when you open `/tickets/1`? Which test fails, and why?
4. Add a **Description** column to the ticket table. Then write a test in
   `TicketList.test.jsx` that checks a ticket's description is shown.
5. Make `StatusBadge` accept a second, optional prop (e.g. `size="large"`)
   and use it on the detail page. Add a class for it to
   `StatusBadge.module.css`.
