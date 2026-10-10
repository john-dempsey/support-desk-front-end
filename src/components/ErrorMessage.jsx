// Shared by every page that can fail, so errors look the same everywhere.
// role="alert" makes screen readers announce the error straight away.
function ErrorMessage({ message }) {
  return (
    <p role="alert" className="error-message">
      {message}
    </p>
  );
}

export default ErrorMessage;
