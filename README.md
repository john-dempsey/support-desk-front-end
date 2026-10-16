# Support Desk front-end

A React front-end for the **Support Desk** API, built step by step in class.
It's the worked example for Assignment 2: you'll use the same techniques to
build a front-end for your own case-study API.

It started as a copy of the front-end starter (Stage 0). Each stage adds
one thing, and the code is tagged at the end of each stage (`stage-00`,
`stage-01`, ...), so you can look at, or go back to, any stage.

## Where we are: Stage 3, Full CRUD

The app can now change data as well as show it: create, edit and delete
tickets, change a ticket's status, assign it to an agent, add and delete
comments, and manage tags. The ticket list can be filtered, sorted and
paged.

| URL | Page |
|---|---|
| `/` | `HomePage`: a welcome and a link to the tickets |
| `/tickets` | `TicketListPage`: the tickets, filtered, sorted and paged |
| `/tickets/new` | `NewTicketPage`: report a new problem (`POST /tickets`) |
| `/tickets/:ticketId` | `TicketDetailPage`: one ticket, its comments, and Delete |
| `/tickets/:ticketId/edit` | `EditTicketPage`: change the details, status and agent (`PATCH /tickets/:id`) |
| `/tags` | `TagsPage`: list, add, rename and delete tags |
| anything else | `NotFoundPage` |

New in this stage:

- **Forms with controlled inputs.** Each input shows a piece of state, and
  typing updates it. `TicketForm` is shared by the new and edit pages.
  The form looks after what's typed; the page sends it to the API.
- **Validation errors by the field.** The browser checks the basics
  (`required`, `maxLength`), but the API has the final say. When it
  answers `400 Validation failed`, each message in its `details` is shown
  under the matching field (`getFieldError()` and `FieldError`).
- **Create, update, delete.** `tickets.api.js`, `comments.api.js`,
  `tags.api.js` and `users.api.js` have one function per endpoint. Every
  delete asks for confirmation first.
- **Updating the page after a change.** Sometimes the page changes its own
  state from the API's response (a new comment is added to the list);
  sometimes it asks the API again (the tags list, which the API sorts).
  The comments in the code say which, and why.
- **Filters in the URL.** The status filter, the sort order and the page
  number live in the URL (`/tickets?status=open&page=2`), read with
  `useSearchParams()`. A refresh or the Back button keeps them, and the
  query is passed straight to the API.
- **Every control is shown.** There's no login yet, and Ada's admin token
  is allowed to do everything except one thing (next section). Stage 4
  hides each control from the roles that can't use it.

### Creating a ticket with Ada's token

Only **customers** can create tickets. With Ada's (admin) token, the
**New ticket** form shows the API's answer: *"You do not have permission
to perform this action"* (`403`). That's the API protecting itself, and
it's what Stage 4 is about. To create a ticket now, log in as
`casey@example.com` and use Casey's token for a while. (Casey can't edit
or delete tickets, so switch back to Ada's token afterwards.)

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
| Invalid or expired token | The token is wrong, or has expired. Tokens last one day: log in again and paste the new one |

## How it's organised

```
index.html              the single HTML page; React fills in <div id="root">
src/
  main.jsx              entry point: starts React and the router
  App.jsx               the route table: which page shows at which URL
  index.css             global styles
  api/
    client.js           apiRequest(): the only code that calls fetch()
    tickets.api.js      getTickets(query), getTicket(id), createTicket(),
                        updateTicket(), deleteTicket()
    comments.api.js     getComments(), createComment(), deleteComment()
    tags.api.js         getTags(), createTag(), updateTag(), deleteTag()
    users.api.js        getAgents(), for the "Assigned to" dropdown
  pages/                one component per URL: HomePage, TicketListPage,
                        NewTicketPage, TicketDetailPage, EditTicketPage,
                        TagsPage, NotFoundPage
  components/           reusable pieces: NavBar, TicketList, StatusBadge,
                        Loading, ErrorMessage, TicketForm, CommentList,
                        CommentForm, TagForm, TicketFilters, Pagination,
                        FieldError
  utils/
    formatDate.js       ISO date string → readable date
    getFieldError.js    finds one field's message in a 400's details
    ticketStatuses.js   the four statuses and their labels
  context/              shared app-wide state (Stage 4, for login)
  hooks/                your own custom hooks (Stage 6)
  test/
    setup.js            runs before the tests
    renderWithProviders.jsx   renders a component inside a router, for tests
    testTickets.js      tickets for the tests to "receive from the API"
    testComments.js     comments, likewise
```

It mirrors the layers you know from the back-end:

| Back-end | Front-end |
|---|---|
| `routes/index.js`: which URL goes to which controller | `App.jsx`: which URL shows which page |
| `req.params.id` | `useParams()` |
| `req.query` | `useSearchParams()` |
| `res.redirect()` / Laravel's `redirect()` | `navigate()`, from `useNavigate()` |
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
 Test Files  17 passed (17)
      Tests  87 passed (87)
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
- `src/App.test.jsx` checks which page shows at which URL.
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
3. **Full CRUD** (you are here): create, edit and delete tickets,
   comments, tags, filtering, sorting and pagination.
4. **Login and roles** *(needs authentication in the back-end)*.
5. **Notifications** *(needs notifications in the back-end)*.
6. **Hardening:** a `useFetch` hook, an error boundary, accessibility and
   a production build.

## Try it yourself

Run `npm test` after each change, and commit when it passes.

1. Open the ticket list and choose a status, a sort order and page 2.
   Look at the address bar. Refresh the page, then press Back a few
   times. What happens, and why wouldn't it if the choices were kept in
   `useState`?
2. On **New ticket**, type three spaces as the subject and submit. The
   browser's `required` check lets it through: why? Which part of the app
   writes the red message under the field, and where does its text come
   from? Now try it with Casey's token, and then with Ada's again.
3. Try to delete ticket 1, which has a comment. What does the API answer,
   and why? Delete its comment first, then try again.
4. In `TicketDetailPage.jsx`, `handleAddComment` adds the new comment to
   the list itself, but `TagsPage.jsx` loads the tags again after adding
   one. Explain why each page made the choice it did. What would go wrong
   if `TagsPage` added the new tag to the end of its list instead?
5. Open the **Network** tab and rename a tag. Find the `PATCH` request:
   what did it send, and what came back? Then delete a tag: what status
   came back, and why is there no response body?
6. Add a test to `TagsPage.test.jsx` that checks the "Delete" button does
   nothing when the user clicks **Cancel** in the confirmation box.
7. **Challenge:** the API also has `PATCH /tickets/:ticketId/comments/:id`.
   Add an `updateComment()` function to `comments.api.js`, and an **Edit**
   button on each comment, using `TagsPage`'s rename as a model.
8. **Challenge:** open `/tickets?page=99`. What does the page show? Change
   `TicketListPage` (or `Pagination`) so the user can always get back to
   a page that has tickets.
