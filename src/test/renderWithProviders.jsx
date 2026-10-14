// A test helper for rendering anything that uses routing: <Link>,
// <NavLink>, useParams(), ... Those only work inside a router, and in the
// real app main.jsx provides one (<BrowserRouter>). In tests, MemoryRouter
// does the same job, starting at whatever URL the test asks for.
//
// Stage 4 adds a fake logged-in user here too, so every test gets both
// "providers" from one place. That's where the name comes from.
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';

// `route` is the URL to start at. `path` is only needed for pages that read
// part of the URL with useParams(): it's the same pattern as the page's
// <Route> in App.jsx (e.g. '/tickets/:ticketId'), so the page can find out
// which ticket the URL asks for.
export function renderWithProviders(componentToTest, { route = '/', path } = {}) {
  let content = componentToTest;
  if (path) {
    content = (
      <Routes>
        <Route path={path} element={componentToTest} />
      </Routes>
    );
  }

  return render(<MemoryRouter initialEntries={[route]}>{content}</MemoryRouter>);
}
