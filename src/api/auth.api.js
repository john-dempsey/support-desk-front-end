// Requests about who the user is: logging in, registering, and checking a
// saved token. AuthProvider is the only file that calls these; pages use
// AuthProvider's login() and register() instead, so the token is always
// saved in one place.
import { apiRequest } from './client.js';

// POST /auth/login: returns { user, token }. A wrong email or password is
// a 401 "Invalid email or password" (the API doesn't say which was wrong).
export async function login(email, password) {
  const responseBody = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  return responseBody.data;
}

// POST /auth/register: always creates a customer, and returns
// { user, token }, so the new user is logged in straight away.
export async function register(name, email, password) {
  const responseBody = await apiRequest('/auth/register', {
    method: 'POST',
    body: { name, email, password },
  });
  return responseBody.data;
}

// GET /auth/me: returns the user the saved token belongs to
// ({ id, name, email, role, createdAt }). The back-end added this route in
// Lesson 07 so the front-end can save only the token: when the app loads,
// it asks who the token belongs to, so an expired token is caught straight
// away and the user's details are never out of date.
export async function getCurrentUser() {
  const responseBody = await apiRequest('/auth/me');
  return responseBody.data;
}
