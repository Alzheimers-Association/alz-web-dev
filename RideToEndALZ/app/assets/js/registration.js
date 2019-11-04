'use strict';
(function ($) {
  $(document).ready(function () {
    // TODO - reg scripts
    // var evID = $('body').data('fr-id') ? $('body').data('fr-id') : null;

    $('#find_hdr_container').replaceWith(function () {
      return '<h2 class="' + ($(this).attr('class') ? $(this).attr('class') : '') + '" id="' + $(this).attr('id') + '">' + $(this).html() + '</h2>';
    });
    $('.section-header-text').replaceWith(function () {
      return '<h1 class="reg-headline ' + ($(this).attr('class') ? $(this).attr('class') : '') + '" id="' + $(this).attr('id') + '">' + $(this).html() + '</h1>';
    });

    $('#title_container').replaceWith(function () {
      return '<h1 class="reg-headline ' + ($(this).attr('class') ? $(this).attr('class') : '') + '" id="' + $(this).attr('id') + '">' + $(this).html() + '</h1>';
    });

    $('.sub-section-header, #emergency_contact_title_container').replaceWith(function () {
      return '<h2 class="' + ($(this).attr('class') ? $(this).attr('class') : '') + '"' + ($(this).attr('id') ? ' id="' + $(this).attr('id') + '"' : '') + '>' + $(this).html() + '</h2>';
    });

    var eventName = luminateExtend.global.eventName;
    var srcCode = luminateExtend.global.srcCode;
    var subSrcCode = luminateExtend.global.subSrcCode;
    var isProd = true;

    cd.trLoginSourceCode = (srcCode.length ? srcCode : 'trReg');
    cd.trSignupSourceCode = (srcCode.length ? srcCode : 'trReg');
    cd.trLoginSubSourceCode = (subSrcCode.length ? subSrcCode : eventName + '_' + cd.evID);
    cd.trSignupSubSourceCode = (subSrcCode.length ? subSrcCode : eventName + '_' + cd.evID);

    // ################################
    //  REGISTRATION INTERACTION LOGIC
    // ################################



    // interaction IDs from LO custom interactions
    cd.trRegNewAccountInteractionID = '1052';
    cd.trLoginInteractionID = '1050';
    cd.trLoggedInInteractionID = '1051';

    cd.logInteraction = function (intTypeId, intSubject, intCallback) {
      var logInteractionCallback = {
        success: function (response) {
          console.log('interaction logged');
        },
        error: function (response) {
          console.log('Error logging interaction');
        }
      };
      luminateExtend.api({
        api: 'cons',
        useHTTPS: true,
        requestType: 'POST',
        requiresAuth: true,
        data: 'method=logInteraction&interaction_subject=' + intSubject + '&interaction_type_id=' + intTypeId,
        callback: logInteractionCallback
      });
    };

    cd.getInteraction = function (intTypeId, intSubject, intCallback) {
      luminateExtend.api({
        api: 'cons',
        useHTTPS: true,
        requestType: 'POST',
        requiresAuth: true,
        data: 'method=getUserInteractions&interaction_subject=' + intSubject + '&interaction_type_id=' + intTypeId,
        callback: intCallback
      });
    };

    var getLoginInteractionCallback = {
      success: function (data) {
        // console.log('getLoginInteraction success: ' + JSON.stringify(data));
        var hasInteraction = data.getUserInteractionsResponse.interaction;
        if (!hasInteraction) {
          // Logged in but does not have trLoginInteraction. Assign a trLoggedInInteraction as they arrived in the reg flow a logged in state
              // console.log('log trLoggedInInteractionID');
              cd.logInteraction(cd.trLoggedInInteractionID, cd.evID);
        } else {
          // console.log('already has trLoginInteraction');
        }
      },
      error: function (data) {
        // console.log('getLoginInteraction error: ' + JSON.stringify(data));
      }
    };


    var getNewRegInteractionCallback1 = {
      success: function (data) {
        // console.log('getNewRegInteractionCallback1 success: ' + JSON.stringify(data));
        var hasInteraction = data.getUserInteractionsResponse.interaction;
        if (!hasInteraction) {
          // Does not have trLogInInteraction. Check to see if has trLoggedInInteraction
          // console.log('Running getNewRegInteractionCallback1. Does not have logInInteraction. Check for loggedInInteraction in getNewRegInteractionCallback2');
          cd.getInteraction(cd.trLoggedInInteractionID, cd.evID, getNewRegInteractionCallback2);
        } else {
          // console.log('Running getNewRegInteractionCallback1. Already has logInInteraction.');
        }
      },
      error: function (data) {
        // console.log('getNewRegInteraction1 error: ' + JSON.stringify(data));
      }
    };

    var getNewRegInteractionCallback2 = {
      success: function (data) {
        // console.log('getNewRegInteractionCallback2 success: ' + JSON.stringify(data));
        var hasInteraction = data.getUserInteractionsResponse.interaction;
        if (!hasInteraction) {
          // Does not have trLogInInteraction or trLoggedInInteraction. Log a trRegNewAccountInteraction.
          // console.log('running getNewRegInteractionCallback2. Does not have logInInteraction or loggedInInteraction. Log trRegNewAccountInteraction');
          cd.logInteraction(cd.trRegNewAccountInteractionID, cd.evID);
        } else {
          // console.log('Running getNewRegInteractionCallback2. Already has trLoggedInInteraction');
        }
      },
      error: function (data) {
        // console.log('getNewRegInteraction2 error: ' + JSON.stringify(data));
      }
    };

    if ($('#team_find_page').length > 0) {
      // TR Reg Options step
      // check registrants interactions and assign trLoggedInInteraction if they are logged in but do not have a trLoginInteraction
      // getLoginInteraction();
      if ($('body').is('.user-logged-in')) {
        cd.getInteraction(cd.trLoginInteractionID, cd.evID, getLoginInteractionCallback);
      }
  }
    if ($('#FriendraiserUserWaiver').length > 0) {
      // TR reg summary step
      // check registrants interactions and assign trRegNewAccountInteraction if they are logged in but do not have a trLoginInteraction OR a trLoggedInInteraction
      if($('.js__reg-team-name').length){
        $('.reg-summary-part-type').after('<div class="reg-summary-team-name"><div class="team-name-header-container clearfix"><span class="team-name-label option-label">Team Name: </span></div><div class="reg-team-name font-weight-bold">' + $('.js__reg-team-name').text() + '</div></div>');
      }
      $('.reg-summary-option-info-container').removeClass('clearfix');
      cd.getInteraction(cd.trLoginInteractionID, cd.evID, getNewRegInteractionCallback1);
    }
    // ####################
    //  REGISTRATION PAGES
    // ####################

    if ($('#user_type_page').length > 0) {
      // TR reg login / sign in
      $('.js__past-participant').on('click', function (e) {
        e.preventDefault();
        $('.js__past-participant-container').hide();
        $('.js__reg-login-container').show();
      });

      // $('.js__new-participant').on('click', function (e) {
      //   e.preventDefault();
      //   window.location = luminateExtend.global.path.secure + 'TRR/?pg=tfind&fr_id=' + cd.evID + '&skip_login_page=true';
      // });

      $('.js__go-back').on('click', function (e) {
        e.preventDefault();
        $('.js__reg-login-container').hide();
        $('.js__past-participant-container').show();
      });

      $('.js__reg-show-login').on('click', function (e) {
        e.preventDefault();
        $('.js__reg-retrieve-login-container').hide();
        $('.js__reg-login-container').show();
      });

      $('.js__reg-show-retrieve-login').on('click', function (e) {
        e.preventDefault();
        $('.js__reg-login-container').hide();
        $('.js__reg-retrieve-login-container').show();
      });

      $('.js__reg-login-form').on('submit', function (e) {
        e.preventDefault();
        var form = $(this);
        form.parsley().validate();
        if (form.parsley().isValid()) {
          var consUsername = $('#regLoginUsername').val();
          var consPassword = $('#regLoginPassword').val();
          var rememberMe = $('#regRememberMe').is(':checked');

          cd.consLogin(consUsername, consPassword, 'trRegistration', rememberMe);
          cd.resetValidation();
        } else {
          $('.js__signup-error-message').html('Please fix the errors below.');
          $('.js__signup-error-container').removeClass('d-none');
        }

      });


      $('.js__reg-retrieve-login-form').on('submit', function (e) {
        e.preventDefault();
        var form = $(this);
        form.parsley().validate();
        if (form.parsley().isValid()) {
          var consEmail = $('#regRetrieveLoginEmail').val();
          cd.consRetrieveLogin(consEmail, true);
          cd.resetValidation();
        } else {
          $('.js__retrieve-login-error-message').html('Please fix the errors below.');
          $('.js__retrieve-login-error-container').removeClass('d-none');
        }
      });


    }


    if ($('#team_find_page').length > 0) {
      // TR Start and Join team page
      // TODO - remove this for testing
      // $('.js__reg-retrieve-login-container').hide();

      // determine what kind of registation path has been chosen
      $('#team_find_registration_type_container').hide();
      // new, existing, none
      var frTmOpt = $('main').data('fr-tm-opt') ? $('main').data('fr-tm-opt') : null;

      if (frTmOpt === null) {
        $('.js__reg-options-container').show();
        $('form[name="FriendraiserFind"]').hide();
        console.log('no frTmOpt in URL');
      } else {
        console.log('frTmOpt exists in URL');
      }
      $('#new_team_container').text('Start a Team');
      $('#existing_team_container').text('Join an Existing Team');
      $('#individual_container').text('Participate as an Individual');
      $('#fr_co_list > option:first-child').text('Choose from existing list');

      // $('form[name="FriendraiserFind"]').insertBefore($('.js__join-team-container'));
      // $('form[name="FriendraiserFind"]').before($('.js__join-team-container'));

      var showJoinTeam = function () {
        $('.js__reg-options-container').hide();
        $('form[name="FriendraiserFind"]').hide();
        $('.js__join-team-container').show();
        $('#team_find_registration_type_container').show();
        $('.js__new-team-name').remove();
      }

      var showStartTeam = function () {
        $('.js__reg-options-container').hide();
        $('.js__join-team-container').hide();
        $('form[name="FriendraiserFind"]').show();
        $('#team_find_registration_type_container').show();
        // store new team name as session variable in order to populate on summary page
        $('#team_find_new_team_name').prepend('<input type="hidden" class="js__new-team-name" name="s_newTeamName" />');
        $('#fr_team_name').on('keyup', function(e){
          $('.js__new-team-name').val($(this).val());
        });
      }

      $('#friend_potion_next').text('NEXT');

      $('#fr_co_list_sel option').each(function () {
        var text = $(this).text();
        if (text.indexOf('(sponsor)') != -1) {
          text = text.split('(sponsor)')[0];
          $(this).text(text);
        }
      });

      $('#back_to_top').insertAfter($('.registration-page-container'));

      // Accessibility updates
      $('#team_find_new_team_company label.input-label').attr('for', 'fr_co_list');
      $('#team_find_new_team_recruiting_goal label.input-label').attr('for', 'fr_team_member_goal');


    }
    if ($('#team_find_new_team_name').length > 0 && frTmOpt === 'new') {
      // TR start team step only
      showStartTeam();

      $('.section-header-text').text('Start a Team');
      $('#team_find_section_body').before('<div class="reg-text mt-3 col-md-8 offset-md-2"><p>Note: Each Rider on the Team is individually responsible for meeting their individual fundraising minimum based on the <a href="SPageServer/?pagename=ride_fundraising_packages" class="text-primary" style="text-decoration:underline;">fundraising package</a> they selected at time of registration.</p></div>');
      $('#company_label_container').text("Group/Company (optional)");


      $('#fr_co_list_new').on('keyup', function (e) {
        console.log('checking for company duplicates');
        var $newCompInput = $(this);
        var newComp = $newCompInput.val();
        if (newComp.length > 2) {
          $('#fr_co_list_sel option').each(function () {
            if (($(this).html() == newComp.trim()) || ($(this).html().indexOf(newComp.trim() + ' ') != -1)) {
              if ($newCompInput.parent().parent().find('div.error').length == 0) {
                $newCompInput.addClass('error').parent().after('<div class="alert alert-danger">This company has already been created. Please check the dropdown list above.</div>');
              }
              return false;
            }
            $newCompInput.removeClass('error');
            $newCompInput.parent().parent().find('div.alert').remove();
          });
        } else {
          $newCompInput.removeClass('error');
          $newCompInput.parent().parent().find('div.alert').remove();
        }
      });

      $('#fr_co_list_new').val('').attr('placeholder', 'New Group/Company');
      $("input[name='fr_co_list']#fr_co_list_1").hide();
      $("input[name='fr_co_list']#fr_co_list_2").hide();
      $("input[name='fr_co_list_new']").removeAttr("disabled");

      $("input[name='fr_co_list_new']").on("focus", function () {
        $("input[name='fr_co_list_new']").val("");
        $("input[name='fr_co_list_new']").removeAttr("disabled");
        $("input[name='fr_co_list']#fr_co_list_2").prop("checked", true);
        $("input[name='fr_co_list']#fr_co_list_1").prop("checked", false);
      });

      $("select[name='fr_co_list_sel']").on("focus", function () {
        $("select[name='fr_co_list_sel']").removeAttr("disabled");
        $("input[name='fr_co_list']#fr_co_list_1").prop("checked", true);
        $("input[name='fr_co_list']#fr_co_list_2").prop("checked", false);
      });

      var currentUrl = window.location.href;
      var startCompanyTeamId = cd.getURLParameter(currentUrl, 'co_start_team') ? cd.getURLParameter(currentUrl, 'co_start_team') : false;

      if (startCompanyTeamId) {
        // automatically select company ID if someone is starting a team from a company page
        $('#fr_co_list_sel').val(startCompanyTeamId);
      } 

      $('#team_find_registration_type_container').prepend("<p>Don't want to start a Team?</p>");

    }

    if ($('#team_find_existing').length > 0 && frTmOpt === 'existing') {
      // TR reg join team step only
      // $('.section-header-text').text('Join a Team');

      // $('#team_find_section_body').before('');
      // $('#company_label_container').text("Team's Group/Company");
      showJoinTeam();

      $('#team_find_registration_type_container').prepend("<p>Don't want to join a Team?</p>");


      cd.getCompanyList = function (frId, companyId) {
        // $('.js__loading').show();

        luminateExtend.api({
          api: 'teamraiser',
          data: 'method=getCompanyList' +
            '&fr_id=' + frId +
            '&list_page_size=499' +
            '&list_page_offset=0' +
            '&response_format=json' +
            '&list_sort_column=company_name' +
            '&list_ascending=true',
          callback: {
            success: function (response) {
              // $('.js__loading').hide();


              var companyList = '',
                nationals = (response.getCompanyListResponse.nationalItem ? luminateExtend.utils.ensureArray(response.getCompanyListResponse.nationalItem) : []),
                regionals = (response.getCompanyListResponse.regionalItem ? luminateExtend.utils.ensureArray(response.getCompanyListResponse.regionalItem) : []),
                companies = (response.getCompanyListResponse.companyItem ? luminateExtend.utils.ensureArray(response.getCompanyListResponse.companyItem) : []);

              var sortCompanies = function (a, b) {
                var A = a.companyName.toLowerCase();
                var B = b.companyName.toLowerCase();
                if (A < B) {
                  return -1;
                } else if (A > B) {
                  return 1;
                } else {
                  return 0;
                }
              };

              nationals.sort(sortCompanies);
              regionals.sort(sortCompanies);
              companies.sort(sortCompanies);

              if (nationals.length > 0) {
                companyList += '<optgroup label="National Companies">';
              }
              $.each(nationals, function () {
                if (this.companyName.indexOf('(sponsor)') != -1) {
                  this.companyName = this.companyName.split('(sponsor)')[0];
                }
                companyList += '<option value="' + this.companyId + '">' + this.companyName + '</option>';
              });
              if (nationals.length > 0) {
                companyList += '</optgroup>';
              }
              if (regionals.length > 0) {
                companyList += '<optgroup label="Regional Companies">';
              }
              $.each(regionals, function () {
                if (this.companyName.indexOf('(sponsor)') != -1) {
                  this.companyName = this.companyName.split('(sponsor)')[0];
                }
                companyList += '<option value="' + this.companyId + '">' + this.companyName + '</option>';
              });
              if (regionals.length > 0) {
                companyList += '</optgroup>';
              }
              if (companies.length > 0) {
                companyList += '<optgroup label="Local Companies, Schools and Organizations">';
              }
              $.each(companies, function () {
                if (this.companyName.indexOf('(sponsor)') != -1) {
                  this.companyName = this.companyName.split('(sponsor)')[0];
                }
                companyList += '<option value="' + this.companyId + '">' + this.companyName + '</option>';
              });
              if (companies.length > 0) {
                companyList += '</optgroup>';
              }
              $('.js__reg-company-name').append(companyList);
    

            },
            error: function (response) {
              // $('.js__loading').hide();
              $('.js__error-team-search').text(response.errorResponse.message).show();
            }
          }
        });
      };

      cd.getCompanyList(cd.evID);


      $('.js__reg-team-search-form').on('submit', function (e) {
        e.preventDefault();
        $('.alert').hide();
        $('.js__search-results-container').html('');
        var teamName = $('#regTeamName').val();
        var firstName = $('#regTeamMemberFirst').val();
        var lastName = $('#regTeamMemberLast').val();
        var companyId = $('#regCompanyId').val();
        // cd.getTeams(teamName, searchType);
        cd.getTeams(teamName, 'registration', false, firstName, lastName, companyId);

      });

    } 
 
    if ($('#F2fRegPartType').length > 0) {
      // TR reg ptype step

      // TODO - see if these won't work if applied via sass
      $('.part-type-container').addClass('custom-control').addClass('custom-radio');

      $('.part-type-decoration-messages ').each(function(e){
        var dspAmt = $(this).find('.goal').val().replace('.00','');
        var ptypeRegFee = $(this).find('.part-type-fee-text').text().replace('.00','').trim();
        // console.log('dspAmt: ', dspAmt);
        // console.log('ptypeRegFee: ', ptypeRegFee);
        var ptypeSubhead = '<div class="ptype-subhead">Registration: ' + (ptypeRegFee === "No Fee" ? '$0' : ptypeRegFee) + (dspAmt === "$0" ? '' : ' / Fundraising Commitment: ' + dspAmt) + '</div>';
        $(this).find('.part-type-name').after(ptypeSubhead);
        // No Fee
      });
      // Format {ul}{li} ptype description syntax into HTML
      $('.part-type-description-text').each(function(i){
        var origPtypeText = $(this).text();
        var newPtypeText = origPtypeText
          .replace(/{br}/g, '<br>')
          .replace(/{ul}/g, '<ul>')
          .replace(/{li}/g, '<li>')
          .replace(/{div}/g, '<div class="collapse" id="ptypeCollapse' + i + '">')
          .replace(/{\/li}/g, '<\/li>')
          .replace(/{\/ul}/g, '<\/ul>')
          .replace(/{\/div}/g, '<\/div>')
          .replace(/{split}/g, '<a class="ptype-collapse-link collapsed" data-toggle="collapse" href="#ptypeCollapse' + i + '" role="button" aria-expanded="false" aria-controls="ptypeCollapse' + i + '"><i class="fas fa-caret-up"></i><i class="fas fa-caret-down"></i><\/a>')

        $(this).html(newPtypeText);
      });
      $('.part-type-container').addClass('d-block');

      $('#part_type_additional_gift_container').before('<div class="section-header" id="part_type_section_header"><div><span class="section-header-text text-uppercase">Did you know?</span></div></div><div class="bg-primary stripe-overlay text-white text-center text-uppercase h2 py-5 mt-3 did-you-know-text"><div class="col-md-8 offset-md-2">Every 65 seconds, someone in the United States develops Alzheimer\'s disease.</div></div>');
      $('#part_type_additional_gift_section_header').addClass("col-md-12").html("<p>As the world's largest nonprofit funder of Alzheimer's disease research, the Alzheimer's Association is setting the pace of the field with innovation and investment - and you're setting the pace with each pedal stroke.</p><p><strong>Would you like to make a $65 self-donation now</strong> to set your fundraising pace and breakaway from the pack?</p>");
$('#fr_part_co_list_new').val('Enter a new company or organization');
      // $('.donation-level-row-container').addClass('custom-control').addClass('custom-radio');
      // $('.donation-level-row-decoration-container label').addClass('custom-control-label');


      $('#part_type_additional_gift_container, #part_type_individual_company_selection_container').addClass('col-md-8 offset-md-2');
      $('.donation-level-container').addClass('row');
      $('.donation-level-amount-text').closest('.donation-level-row-container').addClass('don-level-btn col-md-3');
      $('.donation-level-container .input-container').parent().addClass('other-amount-row-container col-md-8');

      $('.other-amount-row-container .donation-level-row-label').text('Enter your own amount:').attr('id', 'enterAmtLabel');

      $('.donation-level-row-label-no-gift').text("No additional donation at this time").closest('.donation-level-row-container').addClass('don-no-gift col-md-12');
      $('.don-no-gift, #part_type_anonymous_input_container, #part_type_show_public_input_container, #part_type_individual_company_selection_container .input-container').wrap('<div class="form-check"/>');

      $('label[for="fr_anonymous_gift"]').text('Keep my name private');
      $('#fr_show_public_gift').prop('checked', true).hide();
      $('label[for="fr_show_public_gift"]').hide();
      $('#part_type_show_public_input_container').prepend('<input type="checkbox" class="js__fake-show-gift" name="fake_show_gift" id="fake_show_gift"><label for="fake_show_gift">Keep my donation amount private</label>');

      $('.js__fake-show-gift').on('click', function(e){
        if($(this).is(':checked')){
          $('#fr_show_public_gift').prop('checked', false);
        } else {
          $('#fr_show_public_gift').prop('checked', true);
        }
      });

      $('#suggested_goal_container').text('Riders have a required fundraising minimum. Stretch goals are encouraged!');

      // Change minimum fundraising message based on what ptype is selected
      $('.part-type-container label').on('click', function (e) {
        console.log('ptype name: ', $(this).find('.part-type-name').text());
        var ptypeName = $(this).find('.part-type-name').text();

        if(ptypeName.indexOf('Pace') > 0){
          console.log('pace clicked');
          $('#suggested_goal_container').text('The required fundraising minimum commitment is $1,800 for Pace Package Riders. Stretch goals are encouraged!');
        } else if(ptypeName.indexOf('Peak') > 0) {
          console.log('peak clicked');
          $('#suggested_goal_container').text('The required fundraising minimum commitment is $3,600 for Peak Package Riders. Stretch goals are encouraged!');
        } else if(ptypeName.indexOf('Podium') > 0) {
          console.log('podium clicked');
          $('#suggested_goal_container').text('The required fundraising minimum commitment is $6,000 for Podium Package Riders. Stretch goals are encouraged!');
        } else {
          console.log('ptype with no fundraising minimum was clicked');
          $('#suggested_goal_container').text('Riders have a required fundraising minimum. Stretch goals are encouraged!');
        }
      });

      if ($('.page-error').length > 0) {
        console.log('page error');
        var errorMsg = $('.field-error-text').eq(0).text();
        if ($('.field-error-text:contains("minimum fundraising goal")').length > 0) {
          console.log('min goal error');
        
          var errorMsgArray = errorMsg.split('$');
          console.log('errorMsgArray: ', errorMsgArray);

          $('#part_type_fundraising_goal_container .form-content')
            .addClass('form-error')
            .prepend('<div class="ErrorMessage"><span class="field-error-indicator"></span><span class="field-error-text">Error: Please enter a goal greater than your fundraising minimum of $' + errorMsgArray[1] + '</span></div>');
        } 
      } else {
        console.log('no page error');
      }
      
      $('.donation-level-row-label').on('click', function (e) {
        $('.donation-level-row-label').removeClass('active');
        $('.other-amount-row-container input[type="text"]').val('');
        $(this).addClass('active');
      });

      $('.other-amount')
        .prop('onclick', null).off('click')
        .prop('onkeyup', null).off('keyup')
        .prop('onchange', null).off('change')
        .prop('onfocus', null).off('focus');

      $('.other-amount').on('keyup', function (e) {
        if ($(this).val() > 0) {
          $('.donation-level-row-label').removeClass('active');
          $(this).parent().find('input[type="radio"]').prop('checked', true);
        } else {
          $(this).parent().find('input[type="radio"]').prop('checked', false);
        }
      });

      $('.other-amount-row-container input[type="radio"]').on('click, focus', function (e) {
        $('.donation-level-row-label').removeClass('active');
        $(this).closest('input[type=radio]').prop('checked', true);
      });

      $('.don-no-gift').on('click', function (e) {
        $('.donation-level-row-label').removeClass('active');
      });

      $('.donation-level-row-label-no-gift').on('click', function (e) {
        $('.donation-level-row-label').removeClass('active');
        $('.other-amount-row-container input[type="text"]').val('');
      });

      $('.don-level-btn').each(function () {
        var donRadio = $(this).find('input[type="radio"]');
        var donLabel = $(this).find('.donation-level-row-label');
        var donText = $(this).find('.donation-level-amount-text');
        $(donText).text($(donText).text().replace('.00', ''));
        $(donLabel).prepend($(donRadio));

        if ($(donRadio).is(':checked')) {
          $(donRadio).closest('.donation-level-row-label').addClass('active');
        }

      });


      // modify button behavior at bottom
      $('#next_step').text('NEXT').wrap('<div class="col-md-4 offset-md-4 col-8 offset-2 mb-3 text-center"></div>');

      // Accessibility updates
      // add label to other amount text input
      $('.other-amount-row-container input[type=text]').addClass('other-amount').attr('aria-labelledby', 'enterAmtLabel');
      $('#part_type_selection_container').wrapInner('<fieldset role="radiogroup" class="ptype-selection" aria-labelledby="sel_type_container"/>');

      $('.donation-level-container').before('<legend id="reg_donation_label" class="sr-only">Make a donation</legend>');
      // associate ptype label with input
      $('.part-type-container label').each(function (i) {
        var ptypeOptionId = $(this).attr('for');
        $(this).closest('.part-type-container').find('input[name="fr_part_radio"]').attr('id', ptypeOptionId);
      });

      $('#part_type_donation_level_input_container').wrapInner('<fieldset role="radiogroup" class="donation-form-fields" aria-labelledby="reg_donation_label"/>');

      // $('.donation-level-row-label-no-gift').on('click', function(e){
      //   $('#fr_anonymous_gift, #fr_show_public_gift').prop('checked', false);
      // });

    }
    if ($('#F2fRegContact').length > 0) {
      // TR reg info step
      // $('#title_container').wrapInner('<h1 />');
      $('.input-label.cons_first_name').text('First Name');
      $('.input-label.cons_last_name').text('Last Name');
      $('.input-label.cons_street1').text('Street 1');
      $('.input-label.cons_employer').text('Employer');
      $('.input-label.cons_city_town').text('City');
      $('.input-label.cons_state').text('State');
      $('.input-label.cons_zip').text('Zip Code');
      $('.input-label.cons_email').text('Email');
      $('#password_hdr_container').text('Create Your Ride Hub Log In');

      $('#emergency_contact_title_container').text('Emergency Contact');


$('.input-label:contains("Riding alone?")').closest('.survey-question-container').addClass('js__riding-alone-container').css('display', 'none');

$('.input-label:contains("Facebook Fundraiser ID")').closest('.survey-question-container').css('display', 'none');

      $('.input-label:contains("Mobile")').closest('.survey-question-container').addClass('mobile-question-container').removeClass('survey-question-container');
      $('.input-label:contains("text message")').closest('.survey-question-container').addClass('sms-question-container').removeClass('survey-question-container');

      $('.survey-caption-container:contains("safety guidelines")').closest('.survey-question-container').addClass('guidelines-question-container').removeClass('survey-question-container');
      $('.input-label:contains("safety guidelines")').closest('.survey-question-container').addClass('guidelines-question-container hidden').removeClass('survey-question-container');

      $('.sub-section-header:contains("Agree to Terms")').closest('.survey-question-container').addClass('terms-question-container').removeClass('survey-question-container');
      $('.input-label:contains("Agree to terms")').closest('.survey-question-container').addClass('terms-question-container hidden').removeClass('survey-question-container');

      $('.indented-field-group .input-container').each(function () {
        var surveyRadio = $(this).find('input[type="radio"]');
        var surveyLabel = $(this).find('label');
        $(surveyLabel).prepend($(surveyRadio));
      });


      $('.guidelines-question-container, .terms-question-container').wrapAll('<div class="legal-questions-container col-md-10 offset-md-1" />');

      $('#additional_questions_container').prepend($('#cons_info_dob'));

      $('#contact_info_section_two')
        .append($('.mobile-question-container'))
        .append($('.sms-question-container'));
      $('.sms-question-container .survey-question-label').after('<small id="emailHelp" class="form-text text-muted font-italic">Text message rates may apply.</small>');

      $('#emergency_contact_container').insertBefore($('.section-footer'));
      $('.legal-questions-container').insertBefore($('.section-footer'));
      // disable next step button unless terms have been checked
      $('#next_step')
        .attr('disabled', true)
        .wrap('<div class="col-md-4 offset-md-4 col-8 offset-2 mb-3 text-center"/>');

        if($('body').data('reg-type') === "individual" ){
          $('.js__riding-alone-container').show();
        }

      $('.input-container input[type="radio"]').each(function () {
        if ($(this).is(':checked')) {
          $(this).closest('label').addClass('active');
        }
      });
      $('.input-container input[type="radio"]').on('click', function (e) {
        $(this).closest('ul').find('label').removeClass('active');
        $(this).closest('label').addClass('active');
      });

$('.survey-question-label:contains("Would you like to")').closest('.survey-question-container').addClass('reg-interest-container');
// make sure passwords match
$('#F2fRegContact').parsley().destroy();
var parsleyOptions = {
  successClass: 'is-valid',
  errorClass: 'is-invalid'
};
// $('#F2fRegContact').attr('data-parsley-validate', '');
// $('#cons_password').attr('data-parsley-equalto', '#cons_password');
$('#cons_rep_password')
  .attr('data-parsley-equalto', '#cons_password')
  .attr('data-parsley-equalto-message', 'Passwords do not match')
  .attr('data-parsley-trigger', 'change');
  // .attr('data-parsley-debounce', '500');

$('#F2fRegContact').parsley(parsleyOptions);
      // enable "next step" button after guidelines and terms are checked
      var guidelinesChecked = ($('.guidelines-check').length > 0 ? false : true);
      var termsChecked = false;

      $('.js__guidelines-checkbox').on('click', function (e) {
        if ($(this).is(':checked')) {
          guidelinesChecked = true;
          $('.guidelines-question-container input[type="radio"]').prop('checked', true);
          if (guidelinesChecked === true && termsChecked === true) {
            $('#next_step').attr('disabled', false);
          }
        } else {
          guidelinesChecked = false;
          $('.guidelines-question-container input[type="radio"]').prop('checked', false);
          if (guidelinesChecked === false || termsChecked === false) {
            $('#next_step').attr('disabled', true);
          }
        }
      });

      $('.js__waiver-checkbox').on('click', function (e) {
        if ($(this).is(':checked')) {
          $('.terms-question-container input[type="radio"]').prop('checked', true);
          termsChecked = true;
          if (guidelinesChecked === true && termsChecked === true) {
            $('#next_step').attr('disabled', false);
          }
        } else {
          termsChecked = false;
          $('.terms-question-container input[type="radio"]').prop('checked', false);
          if (guidelinesChecked === false || termsChecked === false) {
            $('#next_step').attr('disabled', true);
          }
        }
      });

      if ($('.js__waiver-checkbox').is(':checked') === true) {
        $('#next_step').attr('disabled', false);
        if (guidelinesChecked === true && termsChecked === true) {
          $('#next_step').attr('disabled', false);
        }
      }

      // auto check guidelines and terms on error reload if previously checked
      if($('.guidelines-question-container input[type="radio"]').prop('checked') === true) {
        guidelinesChecked = true;
        $('.js__guidelines-checkbox').prop('checked', true);
      } else if(!$('.guidelines-check').length > 0){
        guidelinesChecked = true;
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

      // accessibliity updates
      $('#cons_birth_date_DAY').before('<label class="sr-only" for="cons_birth_date_DAY">Birth Day</label>');
      $('#cons_birth_date_MONTH').before('<label class="sr-only" for="cons_birth_date_MONTH">Birth Month</label>');
      $('#cons_birth_date_YEAR').before('<label class="sr-only" for="cons_birth_date_YEAR">Birth Year</label>');
      $('label[for="cons_first_name"]').eq(0).remove();

    }
    if ($('#FriendraiserUserWaiver').length > 0) {
      // TR reg summary step

      $('#reg_summary_body_container').before('<div class="row"><div class="reg-text mt-3 col-md-8 offset-md-2"><p>To complete your registration, please review your information below and then click "Complete Registration."</p><div class="text-center"><a href="#" class="btn btn-secondary text-uppercase js__submit-registration" id="submit-button">Complete Registration</a></div></div>');

      $('.reg-summary-name-info').each(function () {
        $(this).parent().find('.reg-summary-address-info').prepend($(this));
      });
      $("#next_button").removeClass("step-button next-step").addClass("btn mt-4 mb-2 btn-secondary text-uppercase").text('Complete Registration').parent().parent().wrap('<div class="d-block" />');
      $("#cancel_button").removeClass("step-button next-step cancel-step").addClass("btn btn-light-grey text-uppercase").text('Cancel').wrap('<div class="text-center text-md-right clearfix" />');

      $('.reg-summary-total').each(function () {
        $(this).parent().find('.reg-summary-event-info').append($(this));
      });

      $('.js__submit-registration').on('click', function (e) {
        e.preventDefault();
        $('#next_button').click();
      });

    }
    if ($('#fr_payment_form').length > 0) {
      // TR reg payment step

      $('.payment-type-selection-container h3').html('<h2 class="reg-sub-headline text-center">PAYMENT METHOD</h2>');
      $('#payment_cc_container h3').replaceWith('<h2 class="reg-sub-headline text-center">CREDIT CARD INFORMATION</h2>');
      $('#reg_billing_info_block h3').replaceWith('<h2 class="reg-sub-headline text-center">BILLING INFORMATION</h2>');


      $('#btn_next').wrap('<div class="col-md-8 offset-md-2 col-10 offset-1 mb-3"/>');


      // Accessibility updates

      // unhide legend for screenreaders
      // $('#responsive_payment_typecc_type_row legend').addClass('aural-only');
      $('#responsive_payment_typecc_type_row legend').text('Credit Cards Accepted');
      $('#responsive_payment_typepay_typeradio_payment_types').wrap('<fieldset />').prepend('<legend class="sr-only">Payment method:</legend>');
      $('.cardExpGroup').prepend('<legend class="sr-only">Credit card expiration date</legend>');

      // Add aria-required to donation form inputs
      $('#billing_first_namename,#billing_last_namename,#billing_addr_street1name,#billing_addr_street1name,#billing_addr_state,#billing_addr_cityname,#billing_addr_zipname,#donor_email_addressname,#responsive_payment_typecc_numbername,#responsive_payment_typecc_exp_date_MONTH,#responsive_payment_typecc_exp_date_YEAR,#responsive_payment_typecc_cvvname').attr('aria-required', 'true');
    }



  });
})(jQuery);
