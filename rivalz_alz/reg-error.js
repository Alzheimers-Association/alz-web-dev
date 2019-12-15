// manage guideline and waiver checkboxes on error page load
if($('.guidelines-question-container input[type="radio"]').prop('checked') === true) {
  guidelinesChecked = true;
  $('.js__guidelines-checkbox').prop('checked', true);
} else {
  guidelinesChecked = false;
}

if($('.terms-question-container input[type="radio"]').prop('checked') === true) {
  termsChecked = true;
  $('.js__waiver-checkbox').prop('checked', true);
} else {
  termsChecked = false;
}
if (guidelinesChecked === true && termsChecked === true) {
  $('#next_step').attr('disabled', false);
}
