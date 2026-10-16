// The login and register pages show the API's error messages, apart from
// two that need saying in the user's own words:
//   429: the API allows only 10 login or register attempts every 15
//        minutes, so the user needs to know to wait.
//   409: registering with an email that's already used. The API's message
//        names a database index ("A record with that User_email_key
//        already exists"), which means nothing to a user.
// Any other error is returned as it is, `details` and all.
export function describeAuthError(error) {
  if (error.status === 429) {
    return new Error('Too many attempts. Wait a few minutes, then try again.');
  }
  if (error.status === 409) {
    return new Error('An account with that email already exists. Try logging in.');
  }
  return error;
}
