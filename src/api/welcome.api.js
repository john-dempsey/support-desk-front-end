// One file per back-end resource, one function per endpoint. Pages call
// these functions and never build URLs themselves — so if a URI changes on
// the back-end, this is the only file that changes on the front-end.
//
// TODO (your case study): add a file like this for each of your own
// resources, e.g. bookings.api.js with getBookings(), getBooking(id),
// createBooking(newBooking), ...
import { apiRequest } from './client.js';

// GET /welcome — the back-end starter's only endpoint. Returns just the
// `data` part of the response, e.g. { message: 'Hello world!' }, because
// that's all a page needs.
export async function getWelcome() {
  const responseBody = await apiRequest('/welcome');
  return responseBody.data;
}
