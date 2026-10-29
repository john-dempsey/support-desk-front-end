// The page at /register. It creates a customer account through
// AuthProvider's register(); the API answers with a token too, so the new
// customer is logged in straight away. Like LoginPage, its form is only
// used here, so it's written in the page.
import { useState } from 'react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../context/authContext.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import FieldError from '../components/FieldError.jsx';
import PageTitle from '../components/PageTitle.jsx';
import { getFieldError } from '../utils/getFieldError.js';
import { describeAuthError } from '../utils/describeAuthError.js';

function RegisterPage() {
  const { user, register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registerError, setRegisterError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // As on LoginPage: once register() has set the user, go to the tickets.
  if (user) {
    return <Navigate to="/tickets" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setRegisterError(null);
    setIsSubmitting(true);
    try {
      await register(name, email, password);
    } catch (error) {
      setRegisterError(describeAuthError(error));
      setIsSubmitting(false);
    }
  }

  const nameError = getFieldError(registerError, 'name');
  const emailError = getFieldError(registerError, 'email');
  const passwordError = getFieldError(registerError, 'password');

  return (
    <>
      <PageTitle title="Create an account" />
      <h1>Create an account</h1>
      <form className="form" onSubmit={handleSubmit}>
        {registerError && <ErrorMessage message={registerError.message} />}

        <div className="form-field">
          <label htmlFor="register-name">Name</label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'register-name-error' : undefined}
          />
          <FieldError id="register-name-error" message={nameError} />
        </div>

        <div className="form-field">
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? 'register-email-error' : undefined}
          />
          <FieldError id="register-email-error" message={emailError} />
        </div>

        <div className="form-field">
          <label htmlFor="register-password">Password</label>
          {/* minLength 8 matches the back-end's registerSchema. The hint is
              linked to the input too, so a screen reader reads it out. */}
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={Boolean(passwordError)}
            aria-describedby={
              passwordError
                ? 'register-password-hint register-password-error'
                : 'register-password-hint'
            }
          />
          <p id="register-password-hint" className="field-hint">
            At least 8 characters.
          </p>
          <FieldError id="register-password-error" message={passwordError} />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating your account…' : 'Create account'}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </>
  );
}

export default RegisterPage;
