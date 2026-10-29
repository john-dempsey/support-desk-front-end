// Catches a page that crashes while it renders (a bug, such as reading
// .name from something that's null) and shows a "Something went wrong"
// message instead. Without it, React removes the whole app and the user
// is left with a blank page.
//
// It's the only class component in the app, because React has no hook
// that can catch these errors: only a class can. Two parts make it work:
//   - getDerivedStateFromError() runs when any component inside it throws
//     while rendering, and saves the error in state.
//   - render() then shows the fallback instead of the children.
//
// It doesn't catch errors in event handlers or async code (a failed
// request, say): those don't happen while rendering, and every page
// already handles them with try/catch and an error message.
//
// React logs every error it catches to the console by itself, so there's
// nothing more to do here. (A real app would also send it to an
// error-reporting service, from a method called componentDidCatch.)
import { Component } from 'react';
import { Link } from 'react-router';
import ErrorMessage from './ErrorMessage.jsx';
import PageTitle from './PageTitle.jsx';

class ErrorBoundary extends Component {
  // A class keeps its state in one object, this.state, instead of
  // useState. null means nothing has gone wrong.
  state = { error: null };

  // "static" means React calls it on the class itself. What it returns is
  // merged into this.state, the same as calling a setter.
  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error === null) {
      // Nothing has gone wrong: show the page as usual. this.props is the
      // class version of a function component's props.
      return this.props.children;
    }

    return (
      <>
        <PageTitle title="Something went wrong" />
        <h1>Something went wrong</h1>
        <ErrorMessage message="Sorry, this page stopped working. Try another page, or reload this one." />
        {/* The error's own message helps while developing, but means
            nothing to a user, so the production build leaves it out. */}
        {import.meta.env.DEV && <p>Details (development only): {this.state.error.message}</p>}
        <p>
          <Link to="/">Go to the home page</Link>
        </p>
      </>
    );
  }
}

export default ErrorBoundary;
