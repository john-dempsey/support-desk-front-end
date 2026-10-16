// The one place in this app that talks HTTP to the back-end. Every other
// file in src/api/ calls apiRequest() instead of calling fetch() itself, so
// the base URL, the JSON handling, the auth header and the error shape are
// written once, here — the front-end's version of the back-end's
// utils/response.js and middleware/errorHandler.js working together.
//
// It understands the two response shapes the back-end always sends:
//   success: { data } or { data, meta }
//   error:   { error: { message, details? } }   (with a 4xx/5xx status)

import { getSavedToken } from './tokenStorage.js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Where the auth token comes from: since Stage 4, the token saved when the
// user logged in (see tokenStorage.js), or null when nobody is logged in.
// In Stages 2 and 3 this returned a token pasted into .env by hand.
export function getToken() {
  return getSavedToken();
}

// What to do when the API says a token is no longer any good (401): it has
// expired, or its user has gone. AuthProvider gives this file a function
// that logs the user out, so every page gets that behaviour from one
// place, instead of each page checking for 401 itself.
let sessionExpiredHandler = null;

export function setSessionExpiredHandler(handler) {
  sessionExpiredHandler = handler;
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

function buildHeaders(hasBody, token) {
  const headers = {};

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  // Only sent when a token exists, so the same client works against an API
  // with authentication and one without, and logging in (when there's no
  // token yet) sends none.
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
  const token = getToken();

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: buildHeaders(hasBody, token),
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
    // A 401 to a request that carried a token means the session is over.
    // (A 401 with no token, such as a wrong password at login, doesn't.)
    if (response.status === 401 && token && sessionExpiredHandler) {
      sessionExpiredHandler();
    }

    const message = responseBody?.error?.message || `Request failed with status ${response.status}`;
    throw createApiError(response.status, message, responseBody?.error?.details);
  }

  return responseBody;
}
