// Shows the API's validation message for one form field, under that field.
// The field's input points to it with aria-describedby="<this id>", so a
// screen reader reads the message out when the user reaches the input.
// Shows nothing when there's no message.
function FieldError({ id, message }) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="field-error">
      {message}
    </p>
  );
}

export default FieldError;
