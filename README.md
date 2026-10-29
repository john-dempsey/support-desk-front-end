# Support Desk front-end

A React front-end for the **Support Desk** API, built step by step in class.
It's the worked example for Assignment 2: you'll use the same techniques to
build a front-end for your own case-study API.

It started as a copy of the front-end starter (Stage 0). Each stage adds
one thing, and the code is tagged at the end of each stage (`stage-00`,
`stage-01`, ...), so you can look at, or go back to, any stage.

## Where we are: Stage 6, Hardening

Stage 6 adds **no new features**. It makes the app easier to change,
harder to break, and ready to run outside Vite. Stage 5's 161 tests all
pass unchanged after it, and it adds 38 more.

**Most of it needs nothing from your back-end**, so it works on any app,
even one that stopped at Stage 3 with no login. Only "Running it with
nginx" needs Docker, and it's optional.

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
| `/notifications` | `NotificationsPage` | anyone logged in |
| anything else | `NotFoundPage` | anyone |

New in this stage:

- **One hook for loading data.** `useFetch(fetchFunction, argument)` in
  `src/hooks/useFetch.js` holds the loading, error and data state, and
  the effect with its `ignore` flag, that five pages used to repeat. Each
  page now calls it once per request. Pass it the API function and its
  argument (`useFetch(getTicket, ticketId)`), not a new arrow function:
  a new arrow on every render would load the data again and again.
- **An error boundary.** If a page crashes while it renders (a bug), the
  page shows "Something went wrong" and the navigation bar keeps
  working, instead of the whole app going blank. Going to another page
  clears it.
- **An accessibility pass.** Every page sets the browser tab's title
  (`PageTitle`), a **Skip to main content** link is the first thing
  the keyboard reaches, and the ticket table has a caption.
- **A coverage report.** `npm run coverage` lists which lines no test
  runs. The gaps it found now have tests.
- **A production build, served by nginx.** A `Dockerfile` builds the app
  and serves `dist/` with nginx on port 8080 (see below).

## Notifications (Stage 5)

**Stage 5 needs notifications in your back-end** (back-end Step 5), as
well as authentication. If your own API has no notifications, skip it:
your app is complete and working without it.

The API tells users when something happens to their tickets: a new
ticket, an assignment, a comment, a change of status. The app shows those
notifications in two ways, because each one on its own would miss
something:

1. **History over REST.** `NotificationsPage` loads the saved list with
   `GET /notifications`. That includes everything that happened while the
   user was away.
2. **Live over Socket.IO.** While the user is logged in, the app keeps a
   socket open, and the API pushes each new notification the moment it's
   saved. A push is lost if nobody's connected, which is why part 1 comes
   first.

What Stage 5 added:

- **A notifications page.** Each notification shows when it happened,
  "New" if it hasn't been read, a **View ticket** link, and a **Mark as
  read** button (`PATCH /notifications/:id/read`).
- **An unread count in the navigation bar**, shared through a second
  context: `NotificationsProvider`, read with `useNotifications()`.
- **One shared socket** (`realtime/socket.js`). It connects when someone
  logs in, tells the API whose socket it is (on every connect, so a
  reconnect works too), and disconnects on logout.
- **Live updates.** When a notification arrives, the count goes up, and
  the notifications page adds it to the top of its list.
- **"This has changed" notices.** If a notification is about the ticket
  you're looking at (or any ticket, on the list page), the page offers a
  **Reload** button. It doesn't reload by itself, because that would
  throw away a comment you were halfway through typing.

Pages only hear about changes the API tells *you* about. Alex (an agent)
is told when Casey comments on Alex's ticket, so Alex's page shows the
notice; Ada (an admin) isn't told, so Ada's doesn't.

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
| `npm run coverage` | Runs the tests and shows which lines they never ran. The full report is in `coverage/index.html` |
| `npm run lint` | Checks the code for common mistakes |
| `npm run build` | Builds the production version into `dist/` |
| `npm run preview` | Serves the `dist/` build locally, to check it before you deploy |

If you change `.env`, save it and Vite restarts itself (the terminal shows
`.env changed, restarting server...`). Then reload the page. Comments in
`.env` start with `#` (Docker Compose refuses any other kind).

`npm run build` writes the API's address into the built JavaScript, so
after changing `VITE_API_URL`, build again.

## Running it with nginx (optional)

This needs Docker, as in back-end Lesson 6. Start the API's stack first,
then, in this folder:

```bash
docker compose up -d --build    # the built app on http://localhost:8080
docker compose down             # stops it
```

The `Dockerfile` runs `npm ci` and `npm run build` in a Node image, then
copies only `dist/` into an nginx image (`nginx.conf` has nginx's
settings). The browser still calls the API on port 3000 itself, so the
two stacks don't share a network. The image holds one build: after
changing the code, `.env` or `nginx.conf`, run `docker compose up -d
--build` again. Keep using `npm run dev` while you work.

Port 8080 is a different origin from 5173, so it has its own saved
token: log in again there.

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

## Seeing notifications live

Use two browsers side by side (or one normal window and one private
window, so each has its own saved token): log in as Casey in one and
Alex in the other.

| Do this as | What the other one sees |
|---|---|
| Casey: create a ticket | Alex's count goes up; Alex's notifications page shows it at the top |
| Alex: assign the ticket to Alex | Alex's own count goes up: the API tells the assigned agent, even when they did it |
| Alex: change the ticket's status | Casey's page for that ticket says "This ticket has changed" |
| Casey: comment on a ticket assigned to Alex | Alex's count goes up, and Alex's page for that ticket offers **Reload** |

Admins hear about almost nothing, so log in as Ada and nothing arrives.

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
    notifications.api.js  getNotifications(), getUnreadNotifications(),
                        markNotificationRead()
  realtime/
    socket.js           the one shared socket: connectSocket(),
                        disconnectSocket(), onNotification()
  pages/                one component per URL: HomePage, LoginPage,
                        RegisterPage, TicketListPage, NewTicketPage,
                        TicketDetailPage, EditTicketPage, TagsPage,
                        NotificationsPage, NotFoundPage
  components/           reusable pieces: NavBar, TicketList, StatusBadge,
                        Loading, ErrorMessage, TicketForm, CommentList,
                        CommentForm, TagForm, TicketFilters, Pagination,
                        FieldError, ProtectedRoute, NotificationList,
                        RefreshNotice, ErrorBoundary, PageTitle
  utils/
    formatDate.js       ISO date string → readable date
    getFieldError.js    finds one field's message in a 400's details
    ticketStatuses.js   the four statuses and their labels
    describeAuthError.js  friendlier wording for login and register errors
  context/
    authContext.js      the logged-in user's context, and useAuth()
    AuthProvider.jsx    holds the user; login(), register(), logout()
    notificationsContext.js  the unread count's context, and
                        useNotifications()
    NotificationsProvider.jsx  holds the unread count; opens and closes
                        the socket
  hooks/
    useFetch.js         loads data from one src/api/ function, with
                        loading, error and reload()
  test/
    setup.js            runs before the tests
    renderWithProviders.jsx   renders a component inside a router, with
                        a fake logged-in user and unread count, for tests
    fakeSocket.js       lets a test "push" a notification
    testTickets.js      tickets for the tests to "receive from the API"
    testComments.js     comments, likewise
    testUsers.js        a customer, an agent and an admin to log in as
    testNotifications.js  notifications, read and unread
Dockerfile              builds the app, then serves dist/ with nginx
nginx.conf              nginx's settings: index.html for every URL,
                        and a year's caching for the hashed files
compose.yaml            runs that image on port 8080
.dockerignore           what Docker never receives (.env, node_modules)
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
| `config/socket.js`: one shared Socket.IO server | `realtime/socket.js`: one shared Socket.IO client |
| controllers: handle a request, call a service | pages: hold the data, call an API function, decide what to show |
| services: the only code that talks to the database | `api/*.api.js`: the only code that talks to the API |
| `utils/response.js` + `errorHandler.js`: one response/error shape | `api/client.js`: reads that shape back |
| `middleware/notFound.js` | `pages/NotFoundPage.jsx` |
| `middleware/errorHandler.js` / Laravel's error page | `components/ErrorBoundary.jsx`, for a page that crashes |

**Pages** own the data and **components** just display what they're given as
props. Neither calls `fetch()` directly: every request goes through a
function in `src/api/`.

## Tests

```bash
npm test
```

You should see:

```
 Test Files  32 passed (32)
      Tests  199 passed (199)
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
- `src/realtime/socket.test.js` replaces `socket.io-client` with a fake
  socket, to check the token is sent on every connect.
- The tests for `NotificationsPage` and the ticket pages fake the socket
  module (`vi.mock('../realtime/socket.js')`), and use
  `captureNotificationHandler()` (in `src/test/fakeSocket.js`) to "push" a
  notification, as if the server had sent it.
- `src/context/NotificationsProvider.test.jsx` tests the real provider:
  the count, the socket opening and closing, and a push refreshing the
  count.
- `src/App.test.jsx` checks which page shows at which URL, and who is
  sent to the login page.
- `src/api/client.test.js` replaces `fetch()` with a fake, to test the API
  client without a back-end. `src/api/tickets.api.test.js` replaces
  `apiRequest()` with a fake, to check each function asks for the right
  URL.

- `src/hooks/useFetch.test.js` tests the hook on its own with
  `renderHook()`, including a slow answer arriving after a newer one.
- `src/components/ErrorBoundary.test.jsx` renders a page that throws on
  purpose, and checks the fallback appears (and that the error's details
  are left out of a production build).
- Stage 6 also added tests for the gaps the coverage report found, such
  as `src/components/TicketFilters.test.jsx`, and for each page's title,
  the table's caption and the skip link.

To see which lines the tests never run:

```bash
npm run coverage
```

The table after the tests lists every file in `src/` (except the test
helpers in `src/test/`). Open `coverage/index.html` in a browser to see
each file with the lines no test ran in red. A covered line isn't
necessarily *checked*, so 100% isn't the goal.

Find elements the way a user would: by role, label or text (`getByRole`,
`getByLabelText`, `findByText`), not by CSS class.

## Stages

1. **Foundations:** components, props, routes, a hard-coded list.
2. **Fetching from the API:** load the tickets with `GET /tickets`, with
   loading, error and "nothing here yet" states.
3. **Full CRUD:** create, edit and delete tickets, comments, tags,
   filtering, sorting and pagination.
4. **Login and roles** *(needs authentication in the back-end)*.
5. **Notifications** *(needs notifications in the back-end)*.
6. **Hardening** (you are here): a `useFetch` hook, an error boundary,
   an accessibility pass, a coverage report, a production build and
   nginx.

## Try it yourself

Run `npm test` after each change, and commit when it passes.

1. Open a page, then look for its `useFetch` call. What does it pass,
   and what does it get back? Follow one request from the page into
   `useFetch.js` and out to `src/api/`.
2. In `TicketDetailPage.jsx`, show the agent's name with
   `ticket.assignedAgent.name` (no check for `null`), and open an
   unassigned ticket. What does the page show, and does the navigation
   bar still work? Put it back.
3. Press **Tab** once on any page, then **Enter**, then **Tab** again.
   Where does the focus go, and why is that useful?
4. Run `npm run coverage` and open `coverage/index.html`. Pick a file
   that isn't at 100% and find the red lines. Would a test for them be
   worth writing?
5. Run `npm run build`, then search the `.js` file in `dist/assets/` for
   `localhost:3000`. How many times is it there, and where does each
   come from?
6. With the nginx container running, reload `http://localhost:8080/tickets/3`.
   Then put a `#` in front of the `try_files $uri /index.html;` line in
   `nginx.conf`, run `docker compose up -d --build`, and reload again.
   Put the line back and build again.
7. **Challenge:** after each navigation, move the keyboard focus to the
   new page's `<h1>`, so a screen reader announces the new page.
8. **Challenge:** add a **Try again** button to the error boundary's
   message.
9. **Challenge:** on your own back-end, pin CORS to your front-end's
   origins, then open the app from an origin that isn't on the list and
   read the error in the console.
