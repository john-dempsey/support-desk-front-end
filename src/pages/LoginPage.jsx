// The page at /login. It sends the email and password to AuthProvider's
// login(), which asks the API and saves the token. This form is only used
// on this page, so it's written here, not as a separate component.
import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../context/authContext.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import FieldError from '../components/FieldError.jsx';
import { getFieldError } from '../utils/getFieldError.js';
import { describeAuthError } from '../utils/describeAuthError.js';

function LoginPage() {
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Once someone is logged in, this page has nothing to do. That includes
  // straight after logging in: login() sets the user, this page re-renders,
  // and this sends them to the ticket list.
  if (user) {
    return <Navigate to="/tickets" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (error) {
      setLoginError(describeAuthError(error));
      setIsSubmitting(false);
    }
  }

  const emailError = getFieldError(loginError, 'email');

  return (
    <>
      <h1>Log in</h1>
      <form className="form" onSubmit={handleSubmit}>
        {loginError && <ErrorMessage message={loginError.message} />}

        <div className="form-field">
          <label htmlFor="login-email">Email</label>
          {/* autoComplete lets the browser and password managers fill
              these in. */}
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? 'login-email-error' : undefined}
          />
          <FieldError id="login-email-error" message={emailError} />
        </div>

        <div className="form-field">
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p>
        New here? <Link to="/register">Create an account</Link>
      </p>
    </>
  );
}

export default LoginPage;
