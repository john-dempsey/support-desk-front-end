// When the API rejects a form with 400 "Validation failed", apiRequest()
// attaches the back-end's list of problems to the error as `details`, e.g.
//   [{ field: 'subject', message: 'subject is required' }]
// A form calls this once per field, to find the message to show next to
// that field.
//
// error:     the error apiRequest() threw, or null if there isn't one
// fieldName: the field to look for, named as the API names it
// Returns the message, or '' if that field has no problem.
export function getFieldError(error, fieldName) {
  if (!error || !error.details) {
    return '';
  }

  const problem = error.details.find((detail) => detail.field === fieldName);
  if (!problem) {
    return '';
  }

  return problem.message;
}
