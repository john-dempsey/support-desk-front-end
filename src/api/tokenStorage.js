// Where the logged-in user's token is kept between visits: the browser's
// localStorage, which survives a reload or closing the tab. Only the token
// is saved, never the user's details. When the app starts, AuthProvider
// asks the API who the token belongs to (GET /auth/me), so the details are
// never out of date and an expired token is noticed straight away.
//
// The trade-off: any JavaScript running on the page can read localStorage.
// If an attacker ever got a script onto the page (an XSS attack), they
// could copy the token. The safer alternative is an httpOnly cookie, which
// scripts can't read at all, but that needs changes to the back-end, so
// this app keeps localStorage and is careful never to run other people's
// code.

const TOKEN_KEY = 'supportDeskToken';

// Returns the saved token, or null if there isn't one.
export function getSavedToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSavedToken() {
  localStorage.removeItem(TOKEN_KEY);
}
