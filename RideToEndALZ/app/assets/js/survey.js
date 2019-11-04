'use strict';
(function ($) {
  $(function () {

    $.fn.responsifySurvey = function () {
      return this.each(function () {
        var $surveyForm = $(this);

        $surveyForm.addClass('responsive-survey');

        /* move all hidden inputs to top of survey */
        $surveyForm.find('input[type="hidden"]').each(function () {
          $surveyForm.prepend($(this));
        });

        if ($surveyForm.find('#denySubmit').length) {
          $surveyForm.prepend('<div class="hidden">' +
            $surveyForm.find('#denySubmit').closest('div').html() +
            '</div>');
        }

        /* replace .ObjTitle with h1 */
        if ($surveyForm.find('.ObjTitle').length) {
          $surveyForm.before('<h1 class="center-text">' +
            $surveyForm.find('.ObjTitle').eq(0).html() +
            '</h1>');
        }

        /* wrap error messages in alert styles */
        $surveyForm.find('.ErrorMessage').each(function () {
          var $errorMessage = $(this),
            errorMessage = $errorMessage.html();

          if ($.trim(errorMessage) !== '*') {
            $errorMessage.replaceWith('<div class="form-group">' +
              '<div class="alert alert-danger">' +
              errorMessage +
              '</div>' +
              '</div>');
          }
        });

        /* remove survey numbers */
        $surveyForm.find('.num').remove();

        /* remove unnecessary classes */
        $surveyForm.find('.wrapable').removeClass('wrapable');
        $surveyForm.find('.legendWrapper').each(function () {
          $(this).replaceWith($(this).html());
        });

        /* remove unnecessary size attribute */
        $surveyForm.find('*[size]').removeAttr('size');

        /* replace legends with labels */
        $surveyForm.find('legend').each(function () {
          $(this).replaceWith('<label class="form-group-label">' +
            $(this).html() +
            '</label>');
        });

        /* make form fields responsive */
        $surveyForm.find('input[type="text"], input[type="tel"], input[type="email"], input[type="number"], input[type="password"], textarea, select').not('#denySubmit').each(function () {
          var $field = $(this).addClass('form-control').wrap('<div class="form-group ' +
              $(this).attr('id') +
              '_container" />'),
            $label = $('label[for="' + $field.attr('id') + '"]');
          $field.before($label);
        });

        /* make radio buttons and checkboxes responsive */
        $surveyForm.find('input[type="radio"], input[type="checkbox"]').not('fieldset.combo input[type="radio"]').each(function () {
          var $field = $(this).removeClass('radio checkbox').addClass('form-check-input');
          $('label[for="' + $field.attr('id') + '"]').addClass('form-check-label').prepend($field)
            .wrap('<div class="form-check ' + $field.attr('type') + '" />');
        });

        /* make combo boxes responsive */
        $surveyForm.find('fieldset.combo').each(function () {
          var $fieldset = $(this),
            $formGroupLabel = $fieldset.closest('td').find('.Explicit').eq(0),
            $selectedRadio = $fieldset.find('input[type="radio"]:checked'),
            radioName = $fieldset.find('input[type="radio"]').eq(0).attr('name'),
            $select = $fieldset.find('select').addClass('js__combo-dropdown'),
            $input = $fieldset.find('input[type="text"]').removeAttr('onfocus')
            .addClass('hidden js__combo-input')
            .prop('disabled', true);

          // $input.before('<label class="form-group-label" for="' + $input.attr('name') +'">label test</label>');


          if ($formGroupLabel.length) {
            $fieldset.prepend($formGroupLabel.addClass('form-group-label'));
            $fieldset.find('.form-group-label').replaceWith('<label class="form-group-label" for="' + $select.attr('name') + '">' +
              $formGroupLabel.html() +
              '</label>');
            // $fieldset.prepend($formGroupLabel.addClass('form-group-label'));

            // $formGroupLabel.remove();
            // $fieldset.wrap('<label class="form-group-label" for="' + $select.attr('name') +'">' +
            //   $formGroupLabel.html() +
            // '</label>');
          }

          $fieldset.append('<input type="hidden" class="js__combo-toggle" name="' + radioName + '" value="1">');

          /* append 'other' selection option */
          $select.prop('data-dropdownname', $select.attr('name'))
            .append('<option value="Other" data-togglecombo="other">Other</option>');
          $fieldset.append($select);

          $input.prop('placeholder', 'Other');
          if ($input.val() === 'Other...') {
            $input.removeAttr('value');
          }
          $fieldset.append($input);

          /* manage 'other' selection and input */
          if ($selectedRadio.length) {
            $fieldset.find('.js__combo-toggle').val($selectedRadio.val());
            if ($selectedRadio.val() === '2') {
              $select.val('Other').change();
            }
          }

          /* remove extraneous markup from combo box question */
          $fieldset.children().not('.form-group-label, select, input[type="hidden"], input[type="text"]').remove();

          $fieldset.find('select').wrap('<p />');

          $fieldset.replaceWith('<div class="form-group">' +
            $fieldset.html() +
            '</div>');
        });

        /* toggle combo box 'other' input based on select dropdown */
        $('.js__combo-dropdown').on('change', function (e) {
          var $select = $(e.target).prop('name', $(e.target).data('dropdownname')),
            $selectedOption = $select.find('option:selected'),
            $comboToggleInput = $select.closest('.form-group').find('.js__combo-toggle').val('1'),
            $otherInput = $select.closest('.form-group').find('.js__combo-input').addClass('hidden').prop('disabled', true).attr('aria-label', 'Enter your other response');


          if ($selectedOption.is('[data-togglecombo="other"]')) {
            $select.removeAttr('name');
            $comboToggleInput.val('2');
            $otherInput.removeClass('hidden').removeAttr('disabled').focus();
          }
        });

        /* CAPTCHA */
        $surveyForm.find('img[id^="captcha_img_"]').each(function () {
          var $captchaImage = $(this).wrap('<p />'),
            captchaInputId = $captchaImage.attr('id').replace('captcha_img_', ''),
            $captchaPlayer = $('#captcha_player_' + captchaInputId),
            $captchaAudioChallenge = '<a class="captcha-help" href="javascript:audio_challenge_' + captchaInputId + '();" title="Visually impaired? Click here to play an audio challenge then enter the spelled out code."><img src="../images/Action_buttons/accessibility.gif" align="top" border="0" alt="Visually impaired? Click here to play an audio challenge then enter the spelled out code."></a>';

          $('#' + captchaInputId).addClass('captcha-input')
            .before($captchaPlayer)
            .before($captchaImage)
            .before('<p><a href="javascript:change_img_' + captchaInputId + '();">Change image</a></p>')
            .after($captchaAudioChallenge);
        });

        /* hide email format question */
        $surveyForm.find('#cons_email_format').closest('.form-group').addClass('hidden');

        /* replace fieldsets with .form-group */
        $surveyForm.find('fieldset').each(function () {
          var $fieldset = $(this),
            $formGroupLabel = $fieldset.find('.form-group-label'),
            $radiosAndCheckboxes = $fieldset.find('.radio, .checkbox'),
            $selects = $fieldset.find('select');

          if ($formGroupLabel.length) {
            $fieldset.prepend($formGroupLabel);
          }

          if ($radiosAndCheckboxes.length) {
            $radiosAndCheckboxes.each(function () {
              $fieldset.append($(this));
            });

            /* remove extraneous markup from within fieldsets */
            $fieldset.children().not('label, .radio, .checkbox').remove();
          } else if ($selects.length) {
            $formGroupLabel.find('.aural-only').removeClass('aural-only');

            $fieldset.append('<div class="survey-row js__date-row" />');

            $selects.each(function () {
              $fieldset.find('.js__date-row').append($(this));
            });

            $fieldset.find('.js__date-row select').wrap('<div class="three-column" />');

            $fieldset.children().not('label, .js__date-row').remove();
          }

          $fieldset.replaceWith('<div class="form-group">' +
            $fieldset.html() +
            '</div>');
        });


        /* wrap checkboxes not in a fieldset in a .form-group */
        $surveyForm.find('.radio, .checkbox').not('.form-group .radio, .form-group .checkbox').each(function () {
          $(this).wrap('<div class="form-group" />');
        });

        /* mark fields as required */
        $surveyForm.find('#cons_email').closest('.old-school').find('p:contains("*")').each(function () {
          $(this).closest('tr').find('input, textarea, select').each(function () {
            var $field = $(this),
              $label = $('label[for="' + $field.attr('id') + '"]');
            if ($label.find('span:contains("Required")').length) {
              if (!$label.is('.radio label, .checkbox label')) {
                $label.prepend('<span class="survey-req">* </span>');
              }
              $field.prop('required', true);
            }
          });
        });

        $surveyForm.find('.req.true').each(function () {
          $(this).closest('tr').find('label').not('.radio label, .checkbox label').prepend('* ');
          $(this).closest('tr').find('input, textarea, select').not('.js__combo-toggle, .js__combo-dropdown, .js__combo-input').prop('required', true);
        });

        /* make html captions responsive */
        $surveyForm.find('.old-school').each(function () {
          if ($(this).find('input, textarea, select').length === 0) {
            $(this).find('td').eq(1).wrapInner('<div class="form-group" />');
          }
        });

        /* buttons */
        $surveyForm.append('<div class="form-group js__buttons" />');
        $surveyForm.find('input[type="submit"], input[type="reset"]').each(function () {
          var $button = $(this);

          if ($button.is('#ACTION_SUBMIT_SURVEY_RESPONSE')) {
            $button.addClass('btn btn-secondary btn-block btn-lg');
          } else {
            $button.addClass('btn btn-default');
          }

          $surveyForm.find('.js__buttons').append($button, ' ');

          $('#ACTION_SUBMIT_SURVEY_RESPONSE')
            .closest('.form-group')
            .addClass('btn-submit-container col-md-4 offset-md-4');

        });

        /* remove default markup */
        $surveyForm.find('.form-group').each(function () {
          $surveyForm.append($(this));
        });
        $surveyForm.find('.appArea, table').remove();
        // hide keep me logged in checkbox
        $('#s_rememberMe').closest('.form-group').hide();
        // add front end validation for required fields
        var parsleyOptions = {
          // successClass: 'has-success',
          errorClass: 'has-error',
          classHandler: function (_el) {
            return _el.$element.closest('.form-group');
          }
        };

if($('body').is('.pg_ride_survey')){
  var preferredContactMethod = $('.Explicit:contains("How would you prefer")').parent().next('select');
  var emailInput = $('.Explicit:contains("Email:")');
  var phoneInput = $('.Explicit:contains("Phone:")');
  var mobileInput = $('.Explicit:contains("Mobile")');

  $(emailInput).closest('.form-group').addClass('contact-method-field contact-by-email').hide();
  $(phoneInput).closest('.form-group').addClass('contact-method-field contact-by-phone').hide();
  $(mobileInput).closest('.form-group').addClass('contact-method-field contact-by-text').hide();

  $(emailInput).parent().next('input').prop('required', true);
  $(phoneInput).parent().next('input').prop('required', true);
  $(mobileInput).parent().next('input').prop('required', true);

  $(preferredContactMethod).on('change', function (e) {
    $('.contact-method-field').hide();

    var selectedMethod = $(this).val();
    console.log('selectedMethod: ', selectedMethod);
    switch (selectedMethod) {
      case 'Email':
        $('.contact-by-email').show();
        break;
      case 'Phone':
        $('.contact-by-phone').show();
        break;
      case 'Text (text message rates may apply)':
        $('.contact-by-text').show();
        break;
    }
  });
}
        




        // add basic validation for required fields
        $('.responsive-survey').parsley(parsleyOptions);


        Parsley.on('field:validated', function(fieldInstance){
          if (fieldInstance.$element.is(":hidden")) {
              // hide the message wrapper
              fieldInstance._ui.$errorsWrapper.css('display', 'none');
              // set validation result to true
              fieldInstance.validationResult = true;
              return true;
          }
      });


        $('.js__loading').hide();
        $('form[action*=Survey]').show();
      });

    };

    // target embedded surveys, otherwise things like scraped surveys will be responsified
    // $('form[id*="survey_"]').responsifySurvey();
    $('form[action*=Survey]').responsifySurvey();

  });
})(jQuery);
