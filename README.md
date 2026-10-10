# Front-end starter

A minimal React starting point for Assignment 2. It already has routing, a
client for talking to the back-end API, and a test setup, but none of your
case study's pages. Build your own front-end on top of this, the same way you
built your API on top of the back-end starter.

Right now it does one thing: the home page calls the back-end's
`GET /welcome` endpoint and shows the message it sends back. If you see
**"The API says: Hello world!"**, your front-end and back-end are talking to
each other.

## What you need

- Node.js 22 or later
- Your back-end API running on `http://localhost:3000` (any version of it
  that still has `GET /welcome`, or change `src/api/welcome.api.js` to call
  one of your own endpoints)

## Running it

```bash
npm install
cp .env.example .env    # then change VITE_API_URL if your API isn't on port 3000
npm run dev             # front-end on http://localhost:5173
```

Start your back-end first (`npm run dev` or `docker compose up` in your API
project), then open <http://localhost:5173>.

| Command | What it does |
|---|---|
| `npm run dev` | Starts the dev server. Saving a file updates the browser straight away |
| `npm test` | Runs every test once |
| `npm run test:watch` | Re-runs the tests every time you save a file. Press `q` to quit |
| `npm run lint` | Checks the code for common mistakes |
| `npm run build` | Builds the production version into `dist/` |
| `npm run preview` | Serves the `dist/` build locally, to check it before you deploy |

**If you see "Can't reach the API":** the back-end isn't running, or it's on
a different port from the one in your `.env`. If you change `.env`, save
it and Vite restarts itself (the terminal shows `.env changed, restarting
server...`). Then reload the page.

## How it's organised

```
index.html              the single HTML page; React fills in <div id="root">
src/
  main.jsx              entry point: starts React and the router
  App.jsx               the route table: which page shows at which URL
  index.css             global styles
  api/
    client.js           apiRequest(): the only code that calls fetch()
    welcome.api.js      one function per endpoint, e.g. getWelcome()
  pages/                one component per URL, e.g. HomePage, NotFoundPage
  components/           reusable pieces: NavBar, Loading, ErrorMessage
  context/              shared app-wide state (later, for login)
  hooks/                your own custom hooks (later)
  utils/                small plain helper functions
  test/setup.js         runs before the tests
```

It mirrors the layers you know from the back-end:

| Back-end | Front-end |
|---|---|
| `routes/index.js`: which URL goes to which controller | `App.jsx`: which URL shows which page |
| controllers: handle a request, call a service | pages: hold the data, call an API function, decide what to show |
| services: the only code that talks to the database | `api/*.api.js`: the only code that talks to the API |
| `utils/response.js` + `errorHandler.js`: one response/error shape | `api/client.js`: reads that shape back |
| `middleware/notFound.js` | `pages/NotFoundPage.jsx` |

**Pages** own the data and **components** just display what they're given as
props. Neither calls `fetch()` directly: every request goes through a
function in `src/api/`.

## Responses from the API

`api/client.js` expects the response shapes your back-end sends:

- success: `{ data }` or `{ data, meta }`. `apiRequest()` returns this body,
  and your API functions return `data` (plus `meta` for paginated lists)
- `204 No Content`: `apiRequest()` returns `null`
- error: `{ error: { message, details } }`. `apiRequest()` throws an `Error`
  with `message`, `status` and `details` (the list of validation problems on
  a 400), so a page can show `error.message`, and a form can show each
  `details` entry next to its field
- API not running: `apiRequest()` throws an `Error` with status `0` and a
  "Can't reach the API" message

`apiRequest()` only sends an `Authorization` header if there's a token. There
isn't one until you add login, so the starter works with an API that has no
authentication.

## Tests

```bash
npm test
```

You should see:

```
 Test Files  3 passed (3)
      Tests  13 passed (13)
```

Test files sit next to the file they test (`HomePage.jsx` →
`HomePage.test.jsx`). They use [Vitest](https://vitest.dev/) and
[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).
Read them before you write your own:

- `src/api/client.test.js` replaces `fetch()` with a fake, to test the API
  client without a back-end.
- `src/pages/HomePage.test.jsx` replaces the API module with a fake
  (`vi.mock`), to test what the user sees when the API succeeds, is slow, or
  fails.
- `src/App.test.jsx` uses `MemoryRouter` to check which page shows at which
  URL.

Find elements the way a user would: by role, label or text (`getByRole`,
`getByLabelText`, `findByText`), not by CSS class.

## Where to go from here

Look for the `TODO (your case study)` comments. Then, one step at a time,
testing and committing after each step:

1. **Show your main entity.** Add a list page and a detail page for your
   main entity (e.g. `/bookings` and `/bookings/:id`), starting with a
   hard-coded array before you fetch anything.
2. **Fetch it from your API.** Add `src/api/bookings.api.js` and load the
   real data, with loading, error and "nothing here yet" states.
3. **Full CRUD.** Forms to create and edit, delete with a confirmation, the
   API's validation messages shown next to each field, and filtering,
   sorting or pagination.
4. **Login and roles** *(only if your API has authentication)*.
5. **Notifications** *(only if your API has them)*.

## Try it yourself

1. Change `My App` in `NavBar.jsx` and `index.html` to your case study's name.
2. Stop your back-end and reload the page. What does the user see? Which file
   decides that message?
3. Add an `/about` page: create `src/pages/AboutPage.jsx`, add a `<Route>` in
   `App.jsx` and a `<NavLink>` in `NavBar.jsx`. Then write a test in
   `App.test.jsx` that checks it shows at `/about`.
4. Open the browser's developer tools (Network tab) and reload the home
   page. How many times is `/welcome` requested? Why? (Hint: look at
   `<StrictMode>` in `main.jsx`.) Then read the comment about `ignore` in
   `HomePage.jsx`. Why don't the two requests cause a problem?
