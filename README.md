# Support Desk front-end

A React front-end for the **Support Desk** API, built step by step in class.
It's the worked example for Assignment 2: you'll use the same techniques to
build a front-end for your own case-study API.

It started as a copy of the front-end starter (Stage 0). Each stage adds
one thing, and the code is tagged at the end of each stage (`stage-00`,
`stage-01`, ...), so you can look at, or go back to, any stage.

## Where we are: Stage 4, Login and roles

**This stage needs authentication in your back-end** (back-end Step 4).
If your own API has no login, stop at Stage 3: your app is complete and
working without this stage.

The app has a login. Each user sees only what their role can use, and
the stand-in `VITE_DEV_TOKEN` from Stages 2 and 3 is gone.

| URL | Page | Who can open it |
|---|---|---|
| `/` | `HomePage`: a welcome, and links to log in | anyone |
| `/login` | `LoginPage` | anyone |
| `/register` | `RegisterPage`: creates a **customer** account | anyone |
| `/tickets` | `TicketListPage` | anyone logged in |
| `/tickets/:ticketId` | `TicketDetailPage` | anyone logged in |
| `/tickets/new` | `NewTicketPage` | customers |
| `/tickets/:ticketId/edit` | `EditTicketPage` | agents and admins |
| `/tags` | `TagsPage` | agents and admins |
| anything else | `NotFoundPage` | anyone |

New in this stage:

- **Logging in and out.** `LoginPage` and `RegisterPage` send the user's
  details to the API, which answers with a token. Only the token is saved
  (in `localStorage`, see `api/tokenStorage.js`), and `client.js` sends it
  with every request.
- **One place that knows who's logged in.** `AuthProvider` holds the user,
  and any component reads it with `useAuth()`: React **Context**. When the
  app starts with a saved token, it asks the API who the token belongs to
  (`GET /auth/me`) and shows "Checking your session…" until it knows.
- **Protected pages.** `ProtectedRoute` sends a visitor to the login page,
  and tells a user whose role can't use a page that it isn't for them,
  like the back-end's `authenticate` and `authorize(...)`.
- **Controls by role.** Only customers see **New ticket**; only agents and
  admins see **Edit**, **Delete** and **Tags**; and a comment's **Delete**
  only shows for its author, or an admin. That's for the user's sake: the
  API still checks every request.
- **A session that ends.** If any request gets a `401` (the token has
  expired, after a day), the user is logged out and sent to the login
  page.

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

Then open <http://localhost:5173> and log in (next section).

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

## Logging in

The seeded accounts all have the password `password123`:

| Email | Role | Sees |
|---|---|---|
| `casey@example.com` | customer | Casey's own tickets; **New ticket** |
| `priya@example.com` | customer | Priya's own tickets; **New ticket** |
| `alex@example.com` | agent | Alex's tickets and the unassigned ones; **Edit**, **Delete**, **Tags** |
| `ada@example.com` | admin | every ticket and every control |

Try each one: the pages change to match the role. **Register** always
creates a customer.

The API allows only **10 logins or registrations every 15 minutes**. If
the login page says "Too many attempts", wait a few minutes.

If you still have a `VITE_DEV_TOKEN` line in your `.env` from Stage 3,
delete it: nothing reads it any more.

| Message | What it means |
|---|---|
| Can't reach the API at http://localhost:3000 — is the back-end running? | The API isn't running, or `VITE_API_URL` is wrong |
| Invalid email or password | Check both: the API doesn't say which was wrong |
| You're sent back to the login page | Your session ended: tokens last one day. Log in again |

## How it's organised

```
index.html              the single HTML page; React fills in <div id="root">
src/
  main.jsx              entry point: starts React, the router and AuthProvider
  App.jsx               the route table: which page shows at which URL
  index.css             global styles
  api/
    client.js           apiRequest(): the only code that calls fetch()
    tokenStorage.js     saves the token in localStorage
    auth.api.js         login(), register(), getCurrentUser()
    tickets.api.js      getTickets(query), getTicket(id), createTicket(),
                        updateTicket(), deleteTicket()
    comments.api.js     getComments(), createComment(), deleteComment()
    tags.api.js         getTags(), createTag(), updateTag(), deleteTag()
    users.api.js        getAgents(), for the "Assigned to" dropdown
  pages/                one component per URL: HomePage, LoginPage,
                        RegisterPage, TicketListPage, NewTicketPage,
                        TicketDetailPage, EditTicketPage, TagsPage,
                        NotFoundPage
  components/           reusable pieces: NavBar, TicketList, StatusBadge,
                        Loading, ErrorMessage, TicketForm, CommentList,
                        CommentForm, TagForm, TicketFilters, Pagination,
                        FieldError, ProtectedRoute
  utils/
    formatDate.js       ISO date string → readable date
    getFieldError.js    finds one field's message in a 400's details
    ticketStatuses.js   the four statuses and their labels
    describeAuthError.js  friendlier wording for login and register errors
  context/
    authContext.js      the logged-in user's context, and useAuth()
    AuthProvider.jsx    holds the user; login(), register(), logout()
  hooks/                your own custom hooks (Stage 6)
  test/
    setup.js            runs before the tests
    renderWithProviders.jsx   renders a component inside a router, with
                        a fake logged-in user, for tests
    testTickets.js      tickets for the tests to "receive from the API"
    testComments.js     comments, likewise
    testUsers.js        a customer, an agent and an admin to log in as
```

It mirrors the layers you know from the back-end:

| Back-end | Front-end |
|---|---|
| `routes/index.js`: which URL goes to which controller | `App.jsx`: which URL shows which page |
| `req.params.id` | `useParams()` |
| `req.query` | `useSearchParams()` |
| `res.redirect()` / Laravel's `redirect()` | `navigate()`, from `useNavigate()` |
| `middleware/authenticate.js` and `authorize(...)` | `components/ProtectedRoute.jsx`, with `allowedRoles` |
| `req.user` | `useAuth().user` |
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
 Test Files  24 passed (24)
      Tests  122 passed (122)
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
- The form tests (`NewTicketPage.test.jsx`, `EditTicketPage.test.jsx`,
  `TagsPage.test.jsx`) type and click with `userEvent`, the way a user
  would, then check what was sent to the (fake) API and what the page
  shows. Tests that delete something replace `window.confirm()` with a
  fake that answers OK or Cancel (`vi.spyOn(window, 'confirm')`).
- `renderWithProviders()` also gives every test a fake logged-in user:
  Ada, an admin, unless the test passes `user: customerUser`,
  `user: agentUser` or `user: null` (nobody). So a test can check that a
  customer doesn't see **Edit**, without any login requests.
- `src/context/AuthProvider.test.jsx` tests the real `AuthProvider`, with
  `auth.api.js` faked: checking a saved token, logging in and out, and
  being logged out by a `401`.
- `src/App.test.jsx` checks which page shows at which URL, and who is
  sent to the login page.
- `src/api/client.test.js` replaces `fetch()` with a fake, to test the API
  client without a back-end. `src/api/tickets.api.test.js` replaces
  `apiRequest()` with a fake, to check each function asks for the right
  URL.

Find elements the way a user would: by role, label or text (`getByRole`,
`getByLabelText`, `findByText`), not by CSS class.

## Stages

1. **Foundations:** components, props, routes, a hard-coded list.
2. **Fetching from the API:** load the tickets with `GET /tickets`, with
   loading, error and "nothing here yet" states.
3. **Full CRUD:** create, edit and delete tickets, comments, tags,
   filtering, sorting and pagination.
4. **Login and roles** (you are here) *(needs authentication in the
   back-end)*.
5. **Notifications** *(needs notifications in the back-end)*.
6. **Hardening:** a `useFetch` hook, an error boundary, accessibility and
   a production build.

## Try it yourself

Run `npm test` after each change, and commit when it passes.

1. Log in as each of the four seeded users in turn. Make a table of which
   links and buttons each one sees. Then, as Casey, type
   `/tickets/2/edit` into the address bar. What happens, and which file
   decided?
2. Log in, then open the browser's developer tools: **Application** →
   **Local storage** → `http://localhost:5173`. What's saved? Delete it
   and click a link. What happens? Now reload the page. Why is it
   different?
3. Log in, then edit the saved token in **Local storage** (change one
   character) and reload. What do you see, briefly, and then? Which
   request found the problem?
4. As Casey, open a ticket and look at the comments. Which ones have a
   **Delete** button, and why? Use a REST client to send the `DELETE`
   for one that doesn't. What does the API answer?
5. Log in with the wrong password eleven times. What does the login page
   say on the eleventh, and which file chose those words?
6. **Challenge:** after a `401`, the user lands on the login page with no
   explanation. Make the login page say "Your session has ended. Please
   log in again." when that's why they're there. (Hint: what could the
   session-expired handler pass to the login page?)
7. **Challenge:** let a comment's author **edit** it, as well as delete
   it (`PATCH /tickets/:ticketId/comments/:id`), using the same
   `canDelete` idea to decide who sees the button.
