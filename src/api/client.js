// The one place in this app that talks HTTP to the back-end. Every other
// file in src/api/ calls apiRequest() instead of calling fetch() itself, so
// the base URL, the JSON handling, the auth header and the error shape are
// written once, here — the front-end's version of the back-end's
// utils/response.js and middleware/errorHandler.js working together.
//
// It understands the two response shapes the back-end always sends:
//   success: { data } or { data, meta }
//   error:   { error: { message, details? } }   (with a 4xx/5xx status)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Where the auth token comes from. There's no login yet, so there is never
// a token and no Authorization header is sent — which is exactly right for
// an API with no authentication. If you add login later (Stage 4), this is
// the only function in this file you need to change.
export function getToken() {
  return null;
}

// A plain Error with the extra information a page needs to decide what to
// show: `status` (e.g. 404) and, for a 400 validation failure, `details`
// (a list of { field, message } pairs from the back-end's validate.js).
function createApiError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

function buildHeaders(hasBody) {
  const headers = {};

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  // Only sent when a token exists, so the same client works against an API
  // with authentication and one without.
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

// Some responses have no JSON body (e.g. an error page from a proxy), so a
// failed parse returns null instead of crashing the request.
async function readJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

// path:    the URI after the base URL, e.g. '/welcome' or '/bookings/7'
// options: { method, body } — method defaults to 'GET'; body is a plain
//          object, converted to JSON here
// Returns the whole response body ({ data } or { data, meta }), or null for
// a 204 No Content. Throws an error (see createApiError) for anything else.
export async function apiRequest(path, options = {}) {
  const method = options.method || 'GET';
  const hasBody = options.body !== undefined;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: buildHeaders(hasBody),
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    // fetch() only rejects when no response arrived at all — the API isn't
    // running, the URL is wrong, or the network is down. Status 0 means
    // "no HTTP status", since there was no HTTP response.
    throw createApiError(0, `Can't reach the API at ${API_URL} — is the back-end running?`);
  }

  // 204 No Content (e.g. after a DELETE) has no body to read.
  if (response.status === 204) {
    return null;
  }

  const responseBody = await readJson(response);

  // response.ok is true for any 2xx status. Anything else is an error, and
  // the back-end puts its explanation in { error: { message, details } }.
  if (!response.ok) {
    const message = responseBody?.error?.message || `Request failed with status ${response.status}`;
    throw createApiError(response.status, message, responseBody?.error?.details);
  }

  return responseBody;
}
