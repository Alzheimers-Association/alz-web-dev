'use strict';
(function ($) {
  $(document).ready(function () {

    /*************/
    /* Namespace */
    /*************/
    window.cd = {};

    $('.menu-btn').on('click', function (e) {
      e.preventDefault();
    });
    var eventType = 'Ride%202019';
    var consID = $('body').data('cons-id') ? $('body').data('cons-id') : null;
    cd.evID = $('body').data('fr-id') ? $('body').data('fr-id') : null;

    cd.getURLParameter = function (url, name) {
      return (RegExp(name + '=' + '(.+?)(&|$)').exec(url) || [, null])[1];
    }

    // BEGIN default Walk login code
    var pageHeight = document.body.scrollHeight;
    var pageWidth = $(window).width();

    if(pageHeight > 1080 && pageWidth > 992){
      $('#back_to_top').removeClass('d-md-none');
    }

    if(pageWidth > 991){
      // Add dropdown hover effect for non-mobile menu
      $('ul.navbar-nav li.dropdown').hover(function () {
        $(this).find('.dropdown-menu').stop(true, true).fadeIn(150);
      }, function () {
        $(this).find('.dropdown-menu').stop(true, true).fadeOut(150);
      });
    }

    var sessionTRID = "";
    var trIDs = [];
    if (luminateExtend.global.auth.token == null) {
      luminateExtend.api.getAuth({
        callback: $.noop,
        useCache: true,
        useHTTPS: true
      });
    }
    /* check if the user is logged in onload */
    /* if they are logged in, call the getUser function above to display the "welcome back" message */
    /* if they are not logged in, show the login form */
    var loginTestCallback = {
      success: function () {
        cd.getUser();
      },
      error: function () {
        // console.log('loginTestCallback - NOT logged in');
      }
    };
    cd.loginTest = function () {
      luminateExtend.api({
        api: 'cons',
        callback: loginTestCallback,
        data: 'method=loginTest'
      });
    };

    cd.loginTest();

    /* get information on the currently logged in user, and display their name in the site's header */
    cd.getUser = function () {
      var getUserCallback = function (data) {
        if (data.getConsResponse) {
          consID = data.getConsResponse.cons_id;
          var nextUrl = ($('body').is('.pg_ridepc') ? 'https://act.alz.org/site/SPageServer?pagename=ride_homepage' : window.location.href);
          var logoutUrl = 'http://act.alz.org/site/UserLogin?logout=1&pw_id=11827&NEXTURL=' + encodeURIComponent(nextUrl);
          $('.js__log-out-link').attr('href', logoutUrl);

          cd.getRegisteredTeamraisers();
        }
        if (data.getConsResponse && data.getConsResponse.name.first) {
          $('.js__first-name').text(data.getConsResponse.name.first);
          $('.js__logged-out').hide();
          $('.js__logged-in').show();

          if ($.inArray(sessionTRID, trIDs) != -1) {
            console.log('sessionTRID not found in trIDs array');
          }
        }
      };
      luminateExtend.api({
        api: 'cons',
        data: 'method=getUser',
        requiresAuth: true,
        useHTTPS: true,
        requestType: 'POST',
        callback: getUserCallback
      });
    };

    /* get information for each registered Walk to load to the sidebar */
    cd.getTeamraiserInfo = function (trID) {
      var getTeamraiserInfoCallback = function (data) {
        var days = data.split('-')[0];
        var dollars = data.split('-')[1];
        var selector = '.slidebar-content';
        if ($('p#' + trID).length > 0) {
          selector = 'p#' + trID + ' + div';
        }
        $(selector + ' .daysToEvent').html(parseInt(days, 10) > -1 ? days : '0');
        $(selector + ' .dollarsRaised').html(dollars != '' ? dollars : '$0');
      };
      $.ajax({
        url: luminateExtend.global.path.secure + 'SPageServer?pagename=reus_ride_2018_getPartInfo&pgwrap=n&fr_id=' + trID + '&cons_id=' + consID,
        type: 'post',
        dataType: 'text',
        cache: 'false',
        success: getTeamraiserInfoCallback
      });
    };

    /* get information on the currently logged in user, and display a "welcome back" message in the site's header */
    cd.getRegisteredTeamraisers = function () {
      console.log('run cd.getRegisteredTeamraisers');
      var getRegisteredTeamraisersCallback = {
        success: function (data) {
          if (data.getRegisteredTeamraisersResponse && data.getRegisteredTeamraisersResponse.teamraiser) {
            console.log('has registration');

            var teamraisers = luminateExtend.utils.ensureArray(data.getRegisteredTeamraisersResponse.teamraiser);
            var currentDate = new Date();

            if (teamraisers.length > 1) {

              /* If registered for more than 1 walks */
              console.log('registered for more than 1 event');

              var totalTeamRaisers = 0;
              var hasClosedEvents = false;
              var teamRaiserList = '';

              $(teamraisers).each(function (i) {
                // if event is accepting registrations only (1), accepting registrations and gifts (2), or accepting gifts only (3) populate sidebar list
                if (this.status === '1' || this.status === '2' || this.status === '3') {
                  totalTeamRaisers += 1;
                  console.log('totalTeamRaisers: ', totalTeamRaisers);
                  $('.js__has-rides').show();
                  var trId = this.id;
                  var eventName = this.name;
                  var eventLocation = this.city + ', ' + this.state;
                  var teamPageUrl = (this.teamPageUrl ? this.teamPageUrl : null);

                  var eventDate = new Date(this.event_date);
                  var daysToEvent = Math.floor((eventDate - currentDate) / (24 * 60 * 60 * 1000)) + 1;
                  if (daysToEvent > 1) {
                    daysToEvent = '<span class="h5">' + String(daysToEvent) + ' DAYS</span> until your ride';
                  } else if (daysToEvent === 1) {
                    daysToEvent = '<span class="h5">' + String(daysToEvent) + ' DAY</span> until your ride';
                  } else {
                    // event date has passed
                    daysToEvent = '';
                  }

                  trIDs.push(trId);

                  teamRaiserList +=  '<div class="card bg-transparent">' +
                    '<div class="card-header" id="heading' + i + '">' +
                    '<a href="#" class="text-left text-white collapsed js__side-eventname" data-toggle="collapse" data-target="#collapse' + i + '" aria-expanded="false" aria-controls="collapse' + i + '">' +
                    '<i class="fas fa-plus-square text-secondary"></i>' +
                    '<i class="fas fa-minus-square text-secondary"></i>' +
                    '<span class="h3 text-underline">' + eventName + '</span>' +
                    eventLocation + '</a>' +
                    '</div>' +
                    '<div id="collapse' + i + '" class="collapse" aria-labelledby="heading' + i + '" data-parent="#eventsAccordion">' +
                    '<div class="card-body">' +
                    // '<p>' + daysToEvent + '</p>' +
                    '<hr>' +
                    '<ul class="nav flex-column"><li class="nav-item pushy-link"><a class="nav-link js__side-dashboard" href="SPageServer?pagename=ridepc&pc2_page=pc-dashboard&fr_id=' + trId + '">Dashboard</a></li>' +
                    '<li class="nav-item pushy-link"><a class="nav-link js__side-mypage" href="SPageServer?pagename=ridepc&pc2_page=pc-edit-page&fr_id=' + trId + '">My Page</a></li>' +
                    (teamPageUrl ? '<li class="nav-item pushy-link"><a class="nav-link js__side-myteam" href="' + teamPageUrl + '">My Team</a></li>' : '') +
                    '<li class="nav-item pushy-link"><a class="nav-link js__side-social" href="SPageServer?pagename=ridepc&pc2_page=pc-social&fr_id=' + trId + '">Social</a></li>' +
                    '<li class="nav-item pushy-link"><a class="nav-link js__side-email" href="SPageServer?pagename=ridepc&pc2_page=pc-email&fr_id=' + trId + '">Email</a></li>' +
                    '<li class="nav-item pushy-link"><a class="nav-link js__side-progress" href="SPageServer?pagename=ridepc&pc2_page=pc-donors&fr_id=' + trId + '">Progress</a></li>' +
                    '<li class="nav-item pushy-link"><a class="nav-link js__side-resources" href="SPageServer?pagename=ridepc&pc2_page=resources&fr_id=' + trId + '">Resources</a></li>' +
                    '<li class="nav-item pushy-link"><a class="nav-link js__side-community" href="http://alzride.smallworldlabs.com/dashboard" target="_blank">Community</a></li>' +
                    '<li class="nav-item pushy-link"><a class="nav-link js__side-notifications" href="SPageServer?pagename=ridepc&pc2_page=pc-notifications&fr_id=' + trId + '">Notifications</a></li></ul>' +
                    '</div>' +
                    '</div>' +
                    '</div><hr>' +
                    '</div>';
                } else {
                  hasClosedEvents = true;
                }
              });
              // manage case where someone is registered for more than 1 historic Ride but only 1 active Ride
              if(hasClosedEvents === true){
                console.log('hasClosedEvents = true');
                $('.js__has-events').attr('id', 'eventsAccordion').wrapInner("<div class='multiple-events'></div>");
                $('.multiple-events').append(teamRaiserList);
              } else {
                console.log('hasClosedEvents = false');
                if(totalTeamRaisers > 1){
                  var singleFrId = trIDs[0];
                  var singleEventLink = 'TR?fr_id=' + singleFrId + '&pg=entry';
                  // $('.js__has-events').addClass('single-event').append(teamRaiserList);
                  $('.js__has-events').attr('id', 'eventsAccordion').wrapInner("<div class='multiple-events'></div>");
                  $('.multiple-events').append(teamRaiserList);

                  // $('#collapse1').addClass('show');
                  // $('#heading1 .fas').hide();
                  // console.log('singleFrId: ', singleFrId);
                  // $('.js__side-eventname').removeClass('collapsed').removeAttr('data-toggle').attr('href', singleEventLink);
                } else {
                  var singleFrId = trIDs[0];
                  var singleEventLink = 'TR?fr_id=' + singleFrId + '&pg=entry';
                  $('.js__has-events').addClass('single-event').append(teamRaiserList);

                  $('#collapse1').addClass('show');
                  $('#heading1 .fas').hide();
                  console.log('singleFrId: ', singleFrId);
                  $('.js__side-eventname').removeClass('collapsed').removeAttr('data-toggle').attr('href', singleEventLink);
                }

              }

            } else if (teamraisers.length == 1 && teamraisers[0].status !== '0' && teamraisers[0].status !== '4' && teamraisers[0].status !== '8') {
              /* If registered for only 1 walk */
              console.log('STATUS: ', teamraisers[0].status);
              $('.js__has-rides').show();
              console.log('only registered for 1 event')
              var trId = teamraisers[0].id;
              var eventName = teamraisers[0].name;
              var eventLocation = teamraisers[0].city + ', ' + teamraisers[0].state;
              var teamPageUrl = (teamraisers[0].teamPageUrl ? teamraisers[0].teamPageUrl : null);
              var eventDate = new Date(teamraisers[0].event_date);
              var daysToEvent = Math.floor((eventDate - currentDate) / (24 * 60 * 60 * 1000)) + 1;
              if (daysToEvent > 1) {
                daysToEvent = '<span class="h5">' + String(daysToEvent) + ' DAYS</span> until your ride';
              } else if (daysToEvent === 1) {
                daysToEvent = '<span class="h5">' + String(daysToEvent) + ' DAY</span> until your ride';
              } else {
                // event date has passed
                daysToEvent = '';
              }

              trIDs.push(trId);

              $('.js__has-events').addClass('single-event').html(
                '<div class="card bg-transparent">' +
                '<div class="card-header text-left text-white">' +
                '<a class="js__side-eventname" href="TR?page=entry&fr_id=' + trId + '"><span class="h3">' + eventName + '</span></a>' +
                eventLocation +
                '</div>' +
                '<div class="card-body">' +
                // '<p>' + daysToEvent + '</p>' +
                '<hr>' +
                '<ul class="nav flex-column"><li class="nav-item pushy-link"><a class="nav-link js__side-dashboard" href="SPageServer?pagename=ridepc&pc2_page=pc-dashboard&fr_id=' + trId + '">Dashboard</a></li>' +
                '<li class="nav-item pushy-link"><a class="nav-link js__side-mypage" href="SPageServer?pagename=ridepc&pc2_page=pc-edit-page&fr_id=' + trId + '">My Page</a></li>' +
                (teamPageUrl ? '<li class="nav-item pushy-link"><a class="nav-link js__side-myteam" href="' + teamPageUrl + '">My Team</a></li>' : '') +
                '<li class="nav-item pushy-link"><a class="nav-link js__side-social" href="SPageServer?pagename=ridepc&pc2_page=pc-social&fr_id=' + trId + '">Social</a></li>' +
                '<li class="nav-item pushy-link"><a class="nav-link js__side-email" href="SPageServer?pagename=ridepc&pc2_page=pc-email&fr_id=' + trId + '">Email</a></li>' +
                '<li class="nav-item pushy-link"><a class="nav-link js__side-progress" href="SPageServer?pagename=ridepc&pc2_page=pc-donors&fr_id=' + trId + '">Progress</a></li>' +
                '<li class="nav-item pushy-link"><a class="nav-link js__side-resources" href="SPageServer?pagename=ridepc&pc2_page=resources&fr_id=' + trId + '">Resources</a></li>' +
                '<li class="nav-item pushy-link"><a class="nav-link js__side-community" href="http://alzride.smallworldlabs.com/dashboard" target="_blank">Community</a></li>' +
                '<li class="nav-item pushy-link"><a class="nav-link js__side-notifications" href="SPageServer?pagename=ridepc&pc2_page=pc-notifications&fr_id=' + trId + '">Notifications</a></li></ul>' +
                '</div>' +
                '</div><hr>' +
                '</div>');

            } else {
              console.log('not registered for any events');
              $('.js__has-events').replaceWith('<p style="color: #fff">You are not currently registered for a Ride to End ALZ.</p><p>' +
                (cd.evID === null ? '<a class="btn btn-block btn-secondary pushy-link" href="#" role="button" data-toggle="modal" data-target="#registerModal">Register now</a>' : '<a class="btn btn-block btn-secondary" href="TRR/?pg=utype&fr_id=' + cd.evID + '">Register now</a>') + '</p>');
            }

            if ($('.js__has-events').length > 0) {
              // add event tracking to side nav if events exist
              $('.js__side-eventname').on('click', function (e) {
                ga('send', 'event', 'top navigation', 'click', 'nav-utility-slide-greeting');
              });
              $('.js__side-dashboard').on('click', function (e) {
                ga('send', 'event', 'top navigation', 'click', 'nav-utility-slide-dashboard');
              });
              $('.js__side-mypage').on('click', function (e) {
                ga('send', 'event', 'top navigation', 'click', 'nav-utility-slide-my-page');
              });
              $('.js__side-myteam').on('click', function (e) {
                ga('send', 'event', 'top navigation', 'click', 'nav-utility-slide-team-page');
              });
              $('.js__side-social').on('click', function (e) {
                ga('send', 'event', 'top navigation', 'click', 'nav-utility-slide-social');
              });
              $('.js__side-email').on('click', function (e) {
                ga('send', 'event', 'top navigation', 'click', 'nav-utility-slide-email');
              });
              $('.js__side-resources').on('click', function (e) {
                ga('send', 'event', 'top navigation', 'click', 'nav-utility-slide-resources');
              });
              $('.js__side-community').on('click', function (e) {
                ga('send', 'event', 'top navigation', 'click', 'nav-utility-slide-community');
              });
              $('.js__side-notifications').on('click', function (e) {
                ga('send', 'event', 'top navigation', 'click', 'nav-utility-slide-notifications');
              });
            }

          }

        },
        error: function () {
          console.log('error: no events on account');
          $('.js__has-events').replaceWith('<p style="color: #fff">You are not currently registered for a Ride to End ALZ.</p><p>' +
            (cd.evID === null ? '<a class="btn btn-block btn-secondary pushy-link" href="#" role="button" data-toggle="modal" data-target="#registerModal">Register now</a>' : '<a class="btn btn-block btn-secondary" href="TRR/pg=utype&fr_id=' + cd.evID + '">Register now</a>') + '</p>');
        }
      };
      luminateExtend.api({
        api: 'teamraiser',
        data: 'method=getRegisteredTeamraisers&event_type=' + eventType,
        useHTTPS: true,
        requestType: 'POST',
        callback: getRegisteredTeamraisersCallback
      });
    };



    $(function () {
      sessionTRID = $('#session_trID').val();
      /* bind any forms with the "luminateApi" class */
      luminateExtend.api.bind();
    });

    // END default Walk login code


    // BEGIN global functions
    cd.consLogin = function (userName, password, loginLocation, rememberMe) {
      luminateExtend.api({
        api: 'cons',
        requestType: 'POST',
        data: 'method=login&user_name=' +
          userName +
          '&password=' +
          password +
          '&remember_me=' +
          rememberMe +
          '&source=' + ((cd.trLoginSourceCode !== undefined) ? cd.trLoginSourceCode : '') +
          '&sub_source=' + ((cd.trLoginSubSourceCode !== undefined) ? cd.trLoginSubSourceCode : '') +
          '&send_user_name=true',
        useHTTPS: true,
        requiresAuth: true,
        callback: {
          success: function (response) {
            console.log(
              'login success. show reg options to proceed to next step.'
            );

            /* if the user is logged in successfully, call the getRegisteredTeamraisers function above to retrieve the Ride list */

            if (loginLocation === 'sideMenu') {
              $('.js__side-login-form').fadeOut('slow');
              setTimeout(cd.getUser(), 100);
            } else if (loginLocation === 'trRegistration') {
              // log TR reg interaction
              console.log('log trLoginInteraction')
              cd.logInteraction(cd.trLoginInteractionID, cd.evID);
              // redirect to utype page to allow TR to auto redirect to tfind page

              if ($('main').data('join-team-id')) {
                window.location = luminateExtend.global.path.secure + 'TRR/?pg=ptype&fr_id=' + cd.evID + '&skip_login_page=true&fr_tjoin=' + $('main').data('join-team-id') + '&s_regType=joinTeam';
              } else {
                window.location = window.location.href + '&s_regType=';
              }
            }
          },

          error: function (response) {
            if (response.errorResponse.code === '22') {
              /* invalid email */
              $('.js__login-error-message').html(
                'Oops! You entered an invalid email address.'
              );

            } else if (response.errorResponse.code === '202') {
              /* invalid email */
              $('.js__login-error-message').html(
                'You have entered an invalid username or password. Please re-enter your credentials below.'
              );
            } else {
              $('.js__login-error-message').html(
                response.errorResponse.message
              );
            }
            $('.js__login-error-container').show();
          }
        }
      });
    };

    cd.consRetrieveLogin = function (accountToRetrieve, displayMsg) {
      luminateExtend.api({
        api: 'cons',
        requestType: 'POST',
        data: 'method=login&send_user_name=true&email=' + accountToRetrieve,
        useHTTPS: true,
        requiresAuth: true,
        callback: {
          success: function (response) {
            if (displayMsg === true) {
              console.log('account retrieval success. show log in page again.');
              $('.js__retrieve-login-container, .js__reg-retrieve-login-container').hide();
              $('.js__side-login-container, .js__reg-login-container').show();
              $('.js__retrieve-login-success-message').html('A password reset has been sent to ' + accountToRetrieve + '.');

              $('.js__login-success-container, .js__retrieve-login-success-container').show();
            }
          },
          error: function (response) {
            if (displayMsg === true) {
              console.log('account retrieval error: ' + JSON.stringify(response));
              $('.js__retrieve-login-error-message').html(response.errorResponse.message);
              $('.js__retrieve-login-error-container').show();
            }
          }
        }
      });
    };

    var parsleyOptions = {
      successClass: 'is-valid',
      errorClass: 'is-invalid',
      classHandler: function (_el) {
        var $parent = _el.$element.closest('.field-required');
        return $parent;
      }
    };

    // add front end validation
    $('.js__side-login-form').parsley(parsleyOptions);
    cd.resetValidation = function () {
      $('.js__side-login-form').parsley().reset();
    }
    // manage form submissions
    $('.js__side-login-form').on('submit', function (e) {
      e.preventDefault();
      var form = $(this);
      form.parsley().validate();
      if (form.parsley().isValid()) {
        var consUsername = $('#loginUsername').val();
        var consPassword = $('#loginPassword').val();
        var rememberMe = $('#sideRememberMe').is(':checked');
        cd.consLogin(consUsername, consPassword, 'sideMenu', rememberMe);
        cd.resetValidation();
      } else {
        $('.js__login-error-message').html('Please fix the errors below.');
        $('.js__login-error-container').show();
      }
    });

    $('.js__retrieve-login-form').on('submit', function (e) {
      e.preventDefault();
      var form = $(this);
      form.parsley().validate();
      if (form.parsley().isValid()) {
        var consEmail = $('#retrieveLoginEmail').val();
        cd.consRetrieveLogin(consEmail, true);
        cd.resetValidation();
      } else {
        $('.js__retrieve-login-error-message').html('Please fix the errors below.');
        $('.js__retrieve-login-error-container').show();
      }
    });

    // show login retrieval form
    $('.js__show-retrieve-login').on('click', function (e) {
      e.preventDefault();
      cd.resetValidation();
      $('.js__side-login-container, .js__reg-login-container').hide();
      $('.js__retrieve-login-container, .js__reg-retrieve-login-container').show();
    });

    // show login form
    $('.js__show-login').on('click', function (e) {
      e.preventDefault();
      cd.resetValidation();
      $('.js__retrieve-login-container, .js__reg-retrieve-login-container').hide();
      $('.js__side-login-container, .js__reg-login-container').show();
    });

    cd.getEvents = function (eventName) {
      $('.js__loading').show();

      luminateExtend.api({
        api: 'teamraiser',
        data: 'method=getTeamraisersByInfo' +
          '&name=' + eventName +
          '&event_type=' + eventType +
          '&response_format=json&list_page_size=499&list_page_offset=0&list_sort_column=event_date&list_ascending=true',
        callback: {
          success: function (response) {
            $('.js__loading').hide();

            if (response.getTeamraisersResponse.totalNumberResults > '0') {

              var events = luminateExtend.utils.ensureArray(response.getTeamraisersResponse.teamraiser);

              events.map(function (event, i) {
                var eventId = event.id;
                var eventName = event.name;
                var eventDate = luminateExtend.utils.simpleDateFormat(event.event_date,
                  'EEEE, MMMM d, yyyy');
                var eventCity = event.city;
                var eventStateAbbr = event.state;
                var eventStateFull = event.mail_state;
                var eventLocation = event.location_name;
                var eventType = event.public_event_type_name;
                var greetingUrl = event.greeting_url;
                var registerUrl = 'TRR/?pg=utype&fr_id=' + eventId + '&s_regType=';
                var acceptsRegistration = event.accepting_registrations;

                var eventRow = '<li class="event-detail row mb-4 fadein"' + (i < 3 ? '' : 'hidden') + '><div class="col-md-6"><p><a class="js__event-name" href="' +
                  greetingUrl + '" class="d-block font-weight-bold"><span class="city">' +
                  eventCity + '</span>, <span class="fullstate">' +
                  eventStateFull + '</span></a><span class="state-abbr d-none">' +
                  eventStateAbbr + '</span><span class="eventtype d-block">' +
                  eventType + '</span><span class="event-location d-block">' +
                  eventLocation + '</span><span class="event-date d-block">' +
                  eventDate + '</span></p></div><div class="col-md-3 col-6"><a href="' +
                  greetingUrl +
                  '" class="btuttonbtn-outline-dark btn-block btn-lg js__event-details">Details</a></div><div class="col-md-3 col-6">' +
                  (acceptsRegistration === 'true' ? '<a href="' +
                    registerUrl + '" class="button btn-primary btn-block btn-lg js__event-register">Register</a>' : '<span class="d-block text-center">Registration is closed<br>but <a class="scroll-link" href="#fundraiserSearch">you can still donate</a></span>') +
                  '</div></li>';

                $('.js__event-search-results').append(eventRow);

              });

            }
          },
          error: function (response) {
            $('.js__loading').hide();
            console.log('getEvents error: ' + response.errorResponse.message);
          }
        }
      });
    };

    cd.getParticipants = function (firstName, lastName, searchType, isCrossEvent) {
      firstName = encodeURIComponent(firstName);
      lastName = encodeURIComponent(lastName);
      $('.js__loading').show();
      luminateExtend.api({
        api: 'teamraiser',
        data: 'method=getParticipants' +
          '&first_name=' + ((firstName !== undefined) ? firstName : '') +
          '&last_name=' + ((lastName !== undefined) ? lastName : '') +
          (isCrossEvent === true ? '&event_type=' + eventType : '&fr_id=' + cd.evID) +
          '&list_page_size=499' +
          '&list_page_offset=0' +
          '&response_format=json' +
          '&list_sort_column=first_name' +
          '&list_ascending=true',
        callback: {
          success: function (response) {
            $('.js__loading').hide();

            if (response.getParticipantsResponse.totalNumberResults === '0') {
              // no search results
              $('.js__error-participant-search').text('Sorry. Your search did not return any results.').show();
            } else {
              var participants = luminateExtend.utils.ensureArray(response.getParticipantsResponse.participant);

              $(participants).each(function (i, participant) {
                $('.js__search-results-container').append('<div class="row pb-4"><div class="col-xs-12 col-sm-8 search-result-details search-result-details"><p><strong><a href="' + participant.personalPageUrl + '">' +
                  participant.name.first + ' ' + participant.name.last +
                  '</a></strong><br>' +
                  participant.eventName + '<br>' +
                  ((participant.teamName !== null) ? participant.teamName + '<br>' : '') +
                  '</p></div><div class="col-xs-12 col-sm-4 text-center">' + (participant.donationUrl != null ? '<a class="button btn-primary btn-block" href="' + participant.donationUrl + '">Donate Now</a>' : '<small>Donations Closed</small>') + ((searchType !== 'donate') ? '<a class="button btn-outline-dark btn-block" href="' + participant.personalPageUrl + '">Visit Personal Page</a>' : '') + '</div></div>'
                );
              });
              $('.js__search-tabs-container').hide();
              $('.js__refine-search-container').show();

              $('.js__search-results-container').slideDown();
            }
          },
          error: function (response) {
            $('.js__loading').hide();
            if(response.errorResponse.code === '2664'){
              $('.js__error-participant-search').text('You must enter at least 3 characters to search by participant first and last name.').show();
            } else {
              $('.js__error-participant-search').text(response.errorResponse.message).show();
            }
          }
        }
      });
    };

    cd.getTeams = function (teamName, searchType, isCrossEvent, firstName, lastName, companyId) {

      $('.js__loading').show();
      teamName = encodeURIComponent(teamName);
      luminateExtend.api({
        api: 'teamraiser',
        data: 'method=getTeamsByInfo' +
          '&team_name=' + teamName +
          (isCrossEvent === true ? '&event_type=' + eventType : '&fr_id=' + cd.evID) +
          (firstName ? '&first_name=' + firstName : '') +
          (lastName ? '&last_name=' + lastName : '') +
          (companyId ? '&team_company_id=' + companyId : '') +
          '&list_page_size=499' +
          '&list_page_offset=0' +
          '&response_format=json' +
          '&list_sort_column=name' +
          '&list_ascending=true',
        callback: {
          success: function (response) {
            $('.js__loading').hide();

            if (response.getTeamSearchByInfoResponse.totalNumberResults === '0') {
              // no search results
              $('.js__error-team-search').text('Sorry. Your search did not return any results.').show();
            } else {
              var teams = luminateExtend.utils.ensureArray(response.getTeamSearchByInfoResponse.team);

              if (searchType === 'registration') {
                $(teams).each(function (i, team) {
                  var donFormId = team.teamDonateURL;

                  $('.js__search-results-container').append(
                    '<div class="row"><div class="col-xs-12 col-sm-9 search-result-details"><div class="team-name"><a href="' + team.teamPageURL + '" >' +
                    team.name +
                    '</a></div>' +
                    '<div class="captain-name">Team Captain: ' + team.captainFirstName + ' ' + team.captainLastName + '</div>' +
                    ((team.companyName !== undefined) ? '<div class="team-company-name">' + team.companyName + '</div>' : '') +
                    '</div><div class="col-xs-12 col-sm-3 d-flex align-items-center">' + '<a class="button btn-block btn-secondary" href="' + team.joinTeamURL + '&skip_login_page=true&s_joinTeamID=' + team.id + '&s_captainConsId=' + team.captainConsId + '">JOIN</a></div></div>');
                  $('.js__search-tabs-container').hide();
                  $('.js__refine-search-container').show();
                  $('.js__search-results-container').slideDown();

                });
              } else {
                $(teams).each(function (i, team) {
                  var donFormId = team.teamDonateURL;

                  $('.js__search-results-container').append(
                    '<div class="row pb-4"><div class="col-xs-12 col-sm-8 search-result-details"><p><strong><a href="' + team.teamPageURL + '">' +
                    team.name +
                    '</a></strong><br>' +
                    team.eventName + '<br>' +
                    'Team Captain: ' + team.captainFirstName + ' ' + team.captainLastName + '<br>' +
                    ((team.companyName !== undefined) ? team.companyName + '<br>' : '') +
                    '<a href="' + team.teamPageURL + '">Visit Team Page</a></p></div><div class="col-xs-12 col-sm-4">' + '<a class="button btn-outline-dark btn-block" href="' + team.joinTeamURL + '&s_captainConsId=' + team.captainConsId + '&s_joinTeamID=' + team.id + '">Join Team</a><a class="button btn-primary btn-block" href="' + team.teamPageURL + '">Visit Team Page</a>' + '</div></div>');
                  $('.js__search-tabs-container').hide();
                  $('.js__refine-search-container').show();
                  $('.js__search-results-container').slideDown();

                });
              }


            }
          },
          error: function (response) {
            $('.js__loading').hide();

            $('.js__error-team-search').text(response.errorResponse.message).show();

          }
        }
      });
    };

    cd.getCompanies = function (companyName, isCrossEvent) {
      $('.js__loading').show();
      companyName = encodeURIComponent(companyName);

      luminateExtend.api({
        api: 'teamraiser',
        data: 'method=getCompaniesByInfo' +
          '&company_name=' + companyName +
          (isCrossEvent === true ? '&event_type=' + eventType : '&fr_id=' + cd.evID) +
          '&event_type=' + eventType +
          '&list_page_size=499' +
          '&list_page_offset=0' +
          '&include_cross_event=true' +
          '&response_format=json' +
          '&list_sort_column=company_name' +
          '&list_ascending=true',
        callback: {
          success: function (response) {
            $('.js__loading').hide();

            if (response.getCompaniesResponse.totalNumberResults === '0') {
              // no search results
              $('.js__error-company-search').text('Sorry. Your search did not return any results.').show();
            } else {
              var companies = luminateExtend.utils.ensureArray(response.getCompaniesResponse.company);

              $(companies).each(function (i, company) {
                $('.js__search-results-container').append(
                  '<div class="row pb-4"><div class="col-xs-12 col-md-9 col-sm-8 search-result-details search-result-details"><p><strong>' +
                  company.companyName +
                  '</strong></p></div>' +
                  '<div class="col-xs-12 col-md-3 col-sm-4"><a class="button btn-primary btn-block" href="' + company.companyURL + '">Visit Page</a></div></div>'
                );
                $('.js__search-tabs-container').hide();
                $('.js__refine-search-container').show();
                $('.js__search-results-container').slideDown();
              });

            }
          },
          error: function (response) {
            $('.js__loading').hide();
            if(response.errorResponse.code === '2664'){
              $('.js__error-company-search').text('You must enter at least 3 characters to search by company name.').show();
            } else {
              $('.js__error-company-search').text(response.errorResponse.message).show();
            }

          }
        }
      });
    };

    $('.js__redirect-participant-search-form').on('submit', function (e) {
      console.log('participant search submitted');
      e.preventDefault();
      var firstName = $('#participantFirstName').val();
      var lastName = $('#participantLastName').val();
      window.location.href = 'https://act.alz.org/site/SPageServer/?pagename=ride_search&search_for=participant&search_type=general&first_name=' + firstName + '&last_name=' + lastName;
    });

    // Search by Team
    $('.js__redirect-team-search-form').on('submit', function (e) {
      e.preventDefault();
      var teamName = $('#teamName').val();
      window.location.href = 'https://act.alz.org/site/SPageServer/?pagename=ride_search&search_for=team&search_type=general&team_name=' + teamName;
    });
    // Search by Company
    $('.js__redirect-company-search-form').on('submit', function (e) {
      e.preventDefault();
      var companyName = $('#companyName').val();
      window.location.href = 'https://act.alz.org/site/SPageServer/?pagename=ride_search&search_for=company&search_type=general&company_name=' + companyName;

    });

    cd.getTeamMembers = function (teamId) {
      $('.js__loading').show();
      luminateExtend.api({
        api: 'teamraiser',
        data: 'method=getTeamMembers' +
          '&fr_id=' + cd.evID +
          '&team_id=' + teamId +
          '&list_page_size=499' +
          '&list_page_offset=0' +
          '&response_format=json',
        callback: {
          success: function (response) {
            $('.js__loading').hide();
            var teamMembers = luminateExtend.utils.ensureArray(response.getTeamMembersResponse.member);
            $(teamMembers).each(function (i, member) {

              $('.js__roster-results-container').append(
                '<div class="row py-2 teammate-details"><div class="col-9 col-sm-8"><span class="teammate-name d-block">' +
                '<a href="' + member.personalPageUrl + '" class="text-primary">' + ((member.name.first !== undefined) ? member.name.first : '') + ' ' + ((member.name.last !== undefined) ? member.name.last : '') + '</a>' +
                ((member.aTeamCaptain === 'true') ? '<i class="fas fa-star text-secondary"></i></span>' : '') +
                '<span class="amt-raised">NEED AMOUNT RAISED</span></div>' +
                '<div class="col-3 col-sm-4 d-flex justify-content-end">' +
                '<a class="button btn-primary btn-lg" href="' + member.donationUrl + '">' +
                '<span class="d-sm-none"><i class="fas fa-dollar-sign"></i> <i class="fas fa-chevron-right"></i></span>' +
                '<span class="d-none d-sm-inline">DONATE</span></a>' +
                '</div></div>');


              $('.js__roster-results-container').slideDown();

            });
          },
          error: function (response) {
            $('.js__loading').hide();

            $('.js__error-team-search').text(response.errorResponse.message).show();

          }
        }
      });
    };

    // Mobile - Show more content on TR pages
    $('.js__fade-anchor').on('click', function (e) {
      e.preventDefault();
      $('.js__fade-content').css('max-height', 'none');
      $('.js__fade-anchor').remove();
    });

    // Scroll to top
    $('.js__back-to-top').on('click', function (e) {
      e.preventDefault();
      $('body,html').animate({
        scrollTop: 0
      }, 800);
    });

    $('#registerModal').on('show.bs.modal', function (e) {
      // Hide sidebar anytime reg modal is triggered
      $('body').removeClass('pushy-open-right modal-open');
    })

    if ($('body').is('.pg_ride_search')) {
      $('.js__refine-search').on('click', function (e) {
        e.preventDefault();
        $('.js__refine-search-container').hide();
        $('.js__search-tabs-container').show();
      });
    }

    if (!$('body').is('.pg_ridepc')) {

      $('a[href*="#"]')
        // Remove links that don't actually link to anything
        .not('[href="#"]')
        .not('[href="#0"]')
        .on('click', function (event) {
          // On-page links
          // Figure out element to scroll to
          var target = $(this.hash);
          console.log('target: ', target);
          target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
          // Does a scroll target exist?
          if (target.length) {
            // Only prevent default if animation is actually gonna happen
            event.preventDefault();
            $('html, body').animate({
              scrollTop: target.offset().top
            }, 1000, function () {
              // Callback after animation
              // Must change focus!
              var $target = $(target);
              $target.focus();
              if ($target.is(":focus")) { // Checking if the target was focused
                return false;
              } else {
                $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
                $target.focus(); // Set focus again
              };
            });
          }
          // }
        });

    }

    // #################
    // PAGEBUILDER PAGES
    // #################
    if ($('body').is('.pg_ride_homepage')) {
      // home page scripts

    }
    if ($('body').is('.pg_ride_search')) {

      // Search by Participant
      $('.js__participant-search-form').on('submit', function (e) {
        console.log('participant search submitted');
        e.preventDefault();
        $('.alert').hide();
        $('.js__search-results-container').html('');
        var firstName = $('#participantFirstName').val();
        var lastName = $('#participantLastName').val();
        cd.getParticipants(firstName, lastName, searchType, true);
      });

      // Search by Team
      $('.js__team-search-form').on('submit', function (e) {
        e.preventDefault();
        $('.alert').hide();
        $('.js__search-results-container').html('');
        var teamName = $('#teamName').val();
        cd.getTeams(teamName, searchType, true);
      });
      // Search by Company
      $('.js__company-search-form').on('submit', function (e) {
        e.preventDefault();
        $('.js__search-results-container').html('');
        var companyName = $('#companyName').val();
        cd.getCompanies(companyName, true);
      });

      // var firstName, lastName, teamName, companyName, searchType, searchFor;
      var currentUrl = window.location.href;
      var searchFor = cd.getURLParameter(currentUrl, 'search_for');
      var searchType = cd.getURLParameter(currentUrl, 'search_type');

      if (searchType === 'donate') {
        $('.js__search-headline').text('Donate');
      }
      cd.autoSearchParticipant = function () {
        var firstName = cd.getURLParameter(currentUrl, 'first_name') ? cd.getURLParameter(currentUrl, 'first_name') : '';
        var lastName = cd.getURLParameter(currentUrl, 'last_name') ? cd.getURLParameter(currentUrl, 'last_name') : '';
        $('#participant-search-tab').tab('show');
        cd.getParticipants(firstName, lastName, searchType, true);
      }

      cd.autoSearchTeam = function () {
        $('#team-search-tab').tab('show');
        var teamName = cd.getURLParameter(currentUrl, 'team_name');
        cd.getTeams(teamName, searchType, true);
      }

      cd.autoSearchCompany = function () {
        $('#company-search-tab').tab('show');
        var companyName = cd.getURLParameter(currentUrl, 'company_name');
        cd.getCompanies(companyName, true);
      }

      switch (searchFor) {
        case 'participant':
          cd.autoSearchParticipant();
          break;
        case 'team':
          cd.autoSearchTeam();
          break;
        case 'company':
          cd.autoSearchCompany();
          break;
      }

      // clear search results when other tabs are clicked
      $('.js__search-tabs').on('click', function (e) {
        $('.js__search-results-container').html('');
      });

    }


    if ($('body').is('.pg_ride_faq')) {
      // FAQ page scripts

      var faqCards = $('.js__faq-container li > .card ');
      // Use JS to add data attributes to make collapse functionality work. Otherwise, the WYSIWYG in LO will strip those from the hard coded HTML
      $(faqCards).each(function (i) {
        $(this).find('.card-header').attr('id', 'faq_header' + i);
        $(this).find('.faq-title').attr({
            'data-toggle': 'collapse',
            'data-target': '#faq_block_' + i,
            'aria-expanded': 'false',
            'aria-controls': 'faq_block_' + i
          })
          .append('<i class="fas fa-plus-square text-secondary"></i><i class="fas fa-minus-square text-secondary"></i>');
        $(this).find('.collapse').attr({
          'id': 'faq_block_' + i,
          'aria-labelledby': 'faq_block_' + i,
          'data-parent': '#faqSearch'
        });
      });
      // add sorting for landing page
      var options = {
        valueNames: [
          'faq-title',
          'keywords'
        ]
      };
      var faqList = new List('faqSearch', options);

      faqList.on('updated', function (list) {
        var searchTextLength = $('.search').val().length;
        if (list.matchingItems.length == 0) {
          $('.js__no-faq-results').show();
        } else if (list.matchingItems.length == list.items.length) {
          $('.js__no-faq-results').hide();
        } else {
          $('.js__no-faq-results').hide();
        }
        if (searchTextLength > 0) {
          $('.js__clear-faq-search').show();
        } else {
          $('.js__clear-faq-search').hide();
        }
      });

      $('.js__faq-search-form').on('submit', function (e) {
        e.preventDefault();
        faqList.search();
      });
      // clear search on click
      $('.js__clear-faq-search').on('click', function (e) {
        e.preventDefault();
        $('.search').val('');
        faqList.search();
        $('.js__clear-faq-search').hide();
      });

    }


    // ########
    // TR PAGES
    // ########

    cd.runThermometer = function (raised, goal) {

      var fundraiserRaised = parseInt(raised.replace('$', '').replace(',', ''));
      var fundraiserGoal = parseInt(goal.replace('$', '').replace(',', ''));

      var percentRaised = (fundraiserRaised / fundraiserGoal);
      if (isNaN(percentRaised)) {
        percentRaised = 0;
      }

      var percentRaisedFormatted = (percentRaised * 100) + '%';

      $('.js__progress-bar')
        .css('width', percentRaisedFormatted)
        .attr("aria-valuenow", percentRaisedFormatted);

      $('.js__percent-raised').each(function () {
        $(this).prop('Counter', 0).animate({
          Counter: percentRaisedFormatted
        }, {
          duration: 1000,
          easing: 'swing',
          step: function (now) {
            $(this).text(Math.ceil(now) + '%');
            if (now > 80 && now <= 100) {
              $(this).addClass('invert-percent-raised');
            } else if (now > 100) {
              $(this).addClass('progress-goal-met');
            }
          }
        });
      });
    }

    if ($('body').is('.pg_ride_eventList')) {
      var lnkArray = [];
      $('.lc_Table tr a').each(function () {
        lnkArray.push(this);
      });
      if (lnkArray.length == 1) {
        var pcLink = $('.lc_Table tr a').attr('href');
        window.location = pcLink;
      } else {
        //do nothing
      }
    }


    if ($('body').is('.pg_entry')) {
      // greeting page scripts
      // thermo logic
      var personalRaised = $('.js__fundraiser-raised').text();
      var personalGoal = $('.js__fundraiser-goal').text();

      cd.runThermometer(personalRaised, personalGoal);

      // Roster Logic

      cd.loadTopParticipantsRoster = function () {

        $('#frStatus4 .indicator-list-row').each(function (i) {
          if(i < 5){
            var url = $(this).find('.team-honor-list-name a').attr('href');
            var name = $(this).find('.team-honor-list-name a').text();
            var amount = $(this).find('.team-honor-list-value').text();
            var participantData = '<li class="list-group-item"><a class="roster-name" href="' + url +
              '">' + name + '</a><span class="roster-amt">' +
              amount + '</span></li>';
            if (url !== undefined) {
              $('.js__top-participants-list').append(participantData);
            }
          }

        });
      } // end loadTopParticipantsRoster

      cd.loadTopTeamsRoster = function () {

        $('#frStatus2 .team-honor-list-row').each(function (i) {
          if(i < 5){
            var url = $(this).find('.team-honor-list-name a').attr('href');
            var name = $(this).find('.team-honor-list-name a').text();
            var amount = $(this).find('.team-honor-list-value').text();
            var teamData = '<li class="list-group-item"><a class="roster-name" href="' + url +
            '">' + name + '</a><span class="roster-amt">' +
            amount + '</span></li>';
            if (url !== undefined) {
              $('.js__top-teams-list').append(teamData);
            }
          }
        });

      } // end loadTopTeamsRoster

      cd.loadTopCompaniesRoster = function () {
        // Create an empty companies array to hold the company data that we need to pull from two different sources before we can build our custom top companies roster

        // clean up default LO company roster markup
        $('.js__default-company-roster').html(function (i, html) {
          return html.replace(/&nbsp;&nbsp;/g, '<div class="company-roster-row">').replace('<br>', '</div>');
        });

        var topCompaniesData = [];
        // Get the company name and URL from the hidden E42 top-companies S tag.
        $('.company-roster-row').each(function (i) {
        if(i < 5){
          var url = $(this).find('a').attr('href');
          var name = $(this).find('a').text();

          console.log('url: ', url);
          console.log('name: ', name);
          topCompaniesData[i] = {
            "companyUrl": url,
            "companyName": name
          }
        }
        });

        // Get the company raised amount from the default "Top Companies" list that appears on the greeting page
        $('#frStatus3 .indicator-list-row').each(function (i) {
          if (i < 5) {
            var amount = $(this).find('.list-value-container').text();
            topCompaniesData[i].companyAmt = amount;
          } else {
            return false;
          }
        });

        // Now that all data is in a single array, iterate through that array to build our custom top companies leaderboard
        $(topCompaniesData).each(function (i) {
          var companyData = '<li class="list-group-item"><a class="roster-name" href="' + $(topCompaniesData)[i].companyUrl +
            '">' + $(topCompaniesData)[i].companyName + '</a><span class="roster-amt">' +
            $(topCompaniesData)[i].companyAmt + '</span></li>';
          $('.js__top-companies-list').append(companyData);
        });
      } // end loadTopCompaniesRoster

      cd.loadTopParticipantsRoster();
      cd.loadTopTeamsRoster();
      cd.loadTopCompaniesRoster();

      // add to calendar logic
      $('.js__add-to-calendar').on('click', function (e) {
        e.preventDefault();
        $('.js__calendar-menu').toggle();
      });


      // $('.js__add-to-calendar-opening-ceremony').on('click', function (e) {
      //   e.preventDefault();
      //   $('.js__calendar-menu-opening-ceremony').toggle();
      // });

      // $('.js__add-to-calendar-ride-day').on('click', function (e) {
      //   e.preventDefault();
      //   $('.js__calendar-menu-ride-day').toggle();
      // });
      $('.js__greeting-intro').html($('#fr_html_container').html());

    }

    if ($('body').is('.pg_personal')) {
      // personal page scripts
      var fundraiserRaised = $('.js__fundraiser-raised').text();
      var fundraiserGoal = $('.js__fundraiser-goal').text();

      cd.runThermometer(fundraiserRaised, fundraiserGoal);

      $('.js__tr-story-text').html($('.personal-page-description').html());
      $('.js__top-donors-roster').append($('.donor-list-indicator-container .vscroll-container'));
      $('.js__personal-bottom').append('<div class="row"><div class="col-12 text-center font-italic report-content">' + $('.tr-personal-page-footer > p').html() + '</div></div>');
    }


    if ($('body').is('.pg_team')) {
      // team page scripts
      var fundraiserRaised = $('.js__fundraiser-raised').text();
      var fundraiserGoal = $('.js__fundraiser-goal').text();

      cd.runThermometer(fundraiserRaised, fundraiserGoal);

      $('.js__tr-story-text').html($('.team-description').html());
      $('.js__top-donors-roster').append($('.donor-list-indicator-container .vscroll-container'));

      var dfId = $('body').data('df-id');
      var teamMember = $('.team-roster-participant-row ');

      $(teamMember).each(function (i, member) {

        var memberName = $(this).find('.team-roster-participant-name').text();
        var memberPersonalUrl = $(this).find('.team-roster-participant-name a').attr('href');
        var memberIsCaptain = ($(this).find('.team-roster-participant-name').hasClass('team-roster-captain-name') ? true : false);
        var memberConsIdSplit = memberPersonalUrl.split('px=');
        var memberConsId = memberConsIdSplit[1].split('&')[0];
        var memberDonateUrl = 'Donation2?df_id=' + dfId + '&PROXY_ID=' + memberConsId + '&PROXY_TYPE=20&FR_ID=' + cd.evID;
        var memberAmtFormatted = $(this).find('.team-roster-participant-raised').text().split('$');
        var memberAmt = parseInt(memberAmtFormatted[1].replace(/,/g, ''));

        $('.js__roster-results-container').append(
          '<div class="listItem row py-2 teammate-details"><div class="col-9 col-sm-8"><span class="teammate-name d-block">' +
          '<a href="' + memberPersonalUrl + '" class="teammate-name text-primary js__teammate-name">' + memberName + '</a>' +
          ((memberIsCaptain === true) ? '<i class="fas fa-star text-secondary"></i></span>' : '') +
          '<div class="amt-raised">$' + memberAmt + '</div></div>' +
          '<div class="col-3 col-sm-4 d-flex justify-content-end">' +
          '<a class="button btn-primary btn-lg js__teammate-donate" href="' + memberDonateUrl + '"><span class="d-sm-none"><i class="fas fa-dollar-sign"></i> <i class="fas fa-chevron-right"></i></span>' +
          '<span class="d-none d-sm-inline">DONATE</span></a>' +
          '</div></div>');
      });

      // add event tracking to team roster list
      $('.js__teammate-name').on('click', function (e) {
        ga('send', 'event', 'ride team', 'click', 'team-roster-name');
      });

      $('.js__teammate-donate').on('click', function (e) {
        ga('send', 'event', 'ride team', 'click', 'team-roster-donate');
      });


      var options = {
        valueNames: ['teammate-name']
      };

      var rosterList = new List('roster_search', options);

      rosterList.on('updated', function (list) {
        var searchTextLength = $('.search').val().length;
        if (list.matchingItems.length == 0) {
          $('.js__no-roster-results').show();
        } else if (list.matchingItems.length == list.items.length) {
          $('.js__no-roster-results').hide();
        } else {
          $('.js__no-roster-results').hide();
        }
        if (searchTextLength > 0) {
          $('.js__clear-teammate-search').show();
        } else {
          $('.js__clear-teammate-search').hide();
        }
      });

      $('.js__participant-team-search').on('submit', function (e) {
        e.preventDefault();
        rosterList.search();
      });
      // clear search on click
      $('.js__clear-teammate-search').on('click', function (e) {
        e.preventDefault();
        $('.search').val('');
        faqList.search();
        $('.js__clear-teammate-search').hide();
      });
    }


    if ($('body').is('.pg_company')) {
      // company page scripts
      var companyName = $('#company_hierarchy_list_component > tbody > tr > td:nth-child(1) > span').text().trim();
      var companyId = cd.getURLParameter(window.location.href, 'company_id');
      var companyGoal = $('.total-goal-value').text().replace('.00', '');
      var companyRaised = $(".amount-raised-label:contains('Raised')").prev('.amount-raised-value').text();
      var recruits = $(".company-tally-title:contains('Total Recruited')").next('.company-tally-ammount').text();
      var gifts = $(".company-tally-title:contains('Number of Gifts')").next('.company-tally-ammount').text();
      var coordinatorName = $('.js__coordinator-name').text();
      var coordinatorEmail = $('.js__coordinator-email').text();
      var companyLogoUrl = $('#company_banner:eq(0) img').attr('src');
      var companyLogoAttr = $('#company_banner:eq(0) img').attr('alt');
      var companyLogoTag = '<img class="img-fluid" src="' + companyLogoUrl + '" alt="' + companyLogoAttr + '">';

      $('.js__tr-image').html(companyLogoTag);
      $('.js__company-name').text(companyName);
      $('.js__fundraiser-raised').text(companyRaised);
      $('.js__fundraiser-goal').text(companyGoal);
      $('.js__num-recruits').text(recruits);
      $('.js__num-donations').text(gifts);
      $('.js__tr-story-text').html($('.company-description').html());
      $('.js__coordinator-name-container').text(coordinatorName);
      $('.js__coordinator-email-container').html('<a href="mailto:' + coordinatorEmail + '">' + coordinatorEmail + '</a>');

      jQuery('.js__coordinator-email-container a').on('click', function () {
        ga('send', 'event', 'ride company', 'click', 'contact-email');
      });

      var companyTeams = $('.company-team-list');

      // TODO - prevent loop from running if no teams exist
      $(companyTeams).each(function (i, team) {
        var teamName = $(this).find('.company-team-list-team-name').text().trim();
        var teamPageUrl = $(this).find('.company-team-list-team-name a').attr('href');
        var teamJoinUrl = $(this).find('.company-list-join-team-button').attr('href');
        var teamNumRecruits = $(this).find('.company-team-list-members').text();
        var teamAmt = '$0';

        $('#company_page_frstatus_container .indicator-list-row').each(function (i, team) {
          var innerTeamName = $(this).find('.indicator-link').text().trim();
          if (teamName === innerTeamName) {
            console.log('we have a match');
            teamAmt = $(this).find('.list-value-container').text().trim();
          } else {
            console.log('we do NOT have a match');
          }
        });

        $('.js__roster-results-container').append('<div class="row py-2 roster-details"><div class="col-9"><span class="roster-name d-block"><a href="' + teamPageUrl + '" class="text-primary js__top-teams-name">' + teamName + '</a></span><span class="num-members font-italic d-block">' + teamNumRecruits + '</span><span class="amt-raised">' + teamAmt + '</span></div><div class="col-3 d-flex justify-content-end"><a class="button btn-primary btn-lg btn-block js__top-teams-join" href="' + teamJoinUrl + '">Join</a></div></div>');

      });

      var companyParticipants = $('.top-participants-container .trr-tbody tr');
      var dfId = $('body').data('df-id');

      $(companyParticipants).each(function (i, participant) {

        var participantName = $(this).find('.trr-table-row-link').text();
        var participantPageUrl = $(this).find('.trr-table-row-link').attr('href');
        var participantJoinUrl = $(this).find('.company-list-join-participant-button').attr('href');
        console.log('participantPageUrl: ', participantPageUrl);
        var participantConsIdSplit = participantPageUrl.split('px=');
        var participantConsId = participantConsIdSplit[1].split('&')[0];

        var participantDonateUrl = 'Donation2?df_id=' + dfId + '&PROXY_ID=' + participantConsId + '&PROXY_TYPE=20&FR_ID=' + cd.evID;

        var participantAmt = $(this).find('.righted').text();

        $('.js__participants-roster-results-container').append(
          '<div class="row py-2 roster-details"><div class="col-8 col-md-9"><span class="roster-name d-block"><a class="js__top-participants-name" href="' + participantPageUrl + '">' + participantName + '</a></span><span class="amt-raised">' + participantAmt + '</span></div><div class="col-4 col-md-3 d-flex justify-content-end"><a class="js__top-participants-donate button btn-primary btn-lg btn-block" href="' + participantDonateUrl + '">Donate</a></div></div>');

      });

      // add event tracking to top teams and top participants lists
      $('.js__top-teams-name').on('click', function (e) {
        ga('send', 'event', 'ride company', 'click', 'top-teams-name');
      });

      $('.js__top-teams-join').on('click', function (e) {
        ga('send', 'event', 'ride company', 'click', 'top-teams-join');
      });

      $('.js__top-participants-name').on('click', function (e) {
        ga('send', 'event', 'ride company', 'click', 'top-participants-name');
      });

      $('.js__top-participants-donate').on('click', function (e) {
        ga('send', 'event', 'ride company', 'click', 'top-participants-donate');
      });

      cd.runThermometer(companyRaised, companyGoal);
    }

    // #########
    //  DONATION
    // #########
    if ($('body').is('.app_donation')) {
      // donation scripts
      $("#fake-check #anonymous_fake").on('click', function () {
        if ($("#fake-check #anonymous_fake").is(':checked')) {
          $("#tr_recognition_nameanonymous_row input[type=checkbox]").each(function () {
            $(this).prop("checked", false);
          });

        } else if ($("#fake-check #anonymous_fake").not(':checked')) {
          $("#tr_recognition_nameanonymous_row input[type=checkbox]").each(function () {
            $(this).prop("checked", true);
          });
        }
      });
      $('#fake-check #anonymous_fake').on('change', function () {
        $('input#tr_recognition_namerec_namename').attr('disabled', !this.checked)
      });
      $('#pageLoadingMsg').hide();


      /* display Process button after page finishes loading */
      $('#pstep_finish').show();

      /* Updated for EJ */
      $('p:contains("You are making a donation to Edward Jones.")').html('You are making a donation to the Alzheimer\'s Association on behalf of Team Edward Jones.');
      $('p:contains("Edward Jones GWR")').html('You are making a donation to the Alzheimer\'s Association on behalf of Edward Jones for the Guinness World Record.');
      //change labels here
      $('h2.section-header-container:eq(0)').attr('id', 'giftInfoHdr');
      $('.donation-levels input[type=radio]').each(function () {
        $(this).attr('aria-labelledby', 'giftInfoHdr');
      });
      $('#tr_recognition_namerec_namename').before($('#displayNameAs'));
      $('#tr_recognition_namerec_namename').attr('aria-label', 'Display my name as (optional)');
      $(".donation-level-input-container label").addClass("donate_level");
      $(".donation-level-input-container input").addClass("donate_input");
      $(".donation-form-container").wrapInner("<div class='donate-body-content'></div>");
      $("#billing_first_name_row, #billing_last_name_row, #donor_email_address_row, #donor_email_opt_in_Row").wrapAll('<div id="billing-info">');
      $("#billing_addr_street1_row, #billing_addr_street2_row, #billing_addr_city_row, #billing_addr_state_row, #billing_addr_zip_row, #billing_addr_country_row").wrapAll('<div id="billing-address">');
      console.log('running ej');

      $('.payment-type-dropdown').attr('aria-label', 'Payment method');
      $('.payment-type-dropdown').parent().parent().wrapAll('<div id="payment-select">');
      $('.disclaimer').parent().css('width', '100%');
      $('.show-mobile').parent().css('width', '100%');

      // set autocomplete to organization for employer name field
      $('#donor_matching_employersearchname').attr('autocomplete', 'organization');

      /* update input types for HTML5 mobile device UX */
      $('#responsive_payment_typecc_numbername, #responsive_payment_typecc_cvvname, .donation-level-user-entered input:visible').attr('pattern', '[0-9]*');
      $('.donation-level-user-entered input:visible').attr('aria-label', 'Other amount');
      $('#ProcessForm').attr('novalidate', 'novalidate');

      if (($('.field-error-text').length == 0) && (($('#billing_addr_cityname').val() == '') && ($('#billing_addr_state').val() == ''))) {
        $('#billing_addr_city_row').hide();
        $('#billing_addr_state_row').hide();
      }

      // Other country selected
      $('#billing_addr_country').on('change', function (e) {
        if ($(this).val() !== 'United States') {
          if ($(this).val() !== 'Canada') {
            $("#billing_addr_state").val('None');
          }
          $('#billing_addr_city_row').slideDown();
          $('#billing_addr_state_row').slideDown();
        }
      });

      // OnKeyDown Function
      $("#billing_addr_zipname").on('keyup', function () {
        var zip_in = $(this);
        var zip_box = $('#billing_addr_zip_row');

        if (zip_in.val().length < 5) {
          zip_box.removeClass('error success');
        } else if (((zip_in.val().length > 5) && ($('#billing_addr_country').val() == 'United States')) || ((zip_in.val().length > 7) && ($('#billing_addr_country').val() == 'Canada'))) {
          zip_box.addClass('error').removeClass('success');

        } else if ((zip_in.val().length == 5) && ($('#billing_addr_country').val() == 'United States')) {

          // Make HTTP Request
          $.ajax({
            url: "https://api.zippopotam.us/us/" + zip_in.val(),
            cache: false,
            dataType: "json",
            type: "GET",
            success: function (result, success) {
              // Make the city and state boxes visible
              $('.ziperror').remove();
              $('#billing_addr_city_row').slideDown();
              $('#billing_addr_state_row').slideDown();

              // US Zip Code Records Officially Map to only 1 Primary Location
              var places = result['places'][0];
              $("#billing_addr_cityname").val(places['place name']);
              $("#billing_addr_state").val(places['state abbreviation']);
              zip_box.addClass('success').removeClass('error');
            },
            error: function (result, success) {
              zip_box.removeClass('success').addClass('error');
              if ($('.ziperror').length == 0) {
                $('#billing-address').append('<div class="error ziperror">Please enter a valid zip code</div>');
              }
            }
          });
        } else if ((zip_in.val().length <= 7) && ($('#billing_addr_country').val() == 'Canada')) {

          // Make HTTP Request
          $.ajax({
            url: "https://api.zippopotam.us/ca/" + zip_in.val().substring(0, 3),
            cache: false,
            dataType: "json",
            type: "GET",
            success: function (result, success) {
              // Make the city and state boxes visible
              $('.ziperror').remove();
              $('#billing_addr_city_row').slideDown();
              $('#billing_addr_state_row').slideDown();

              // US Zip Code Records Officially Map to only 1 Primary Location
              places = result['places'][0];
              $("#billing_addr_cityname").val(places['place name']);
              $("#billing_addr_state").val(places['state abbreviation']);
              zip_box.addClass('success').removeClass('error');
            },
            error: function (result, success) {
              zip_box.removeClass('success').addClass('error');
              if ($('.ziperror').length == 0) {
                $('#billing-address').append('<div class="error ziperror">Please enter a valid zip code</div>');
              }
            }
          });
        }
      });

      $('#ProcessForm').submit(function () {
        $('#ProcessForm').append('<input type="hidden" name="pstep_finish" value="Process My Donation" />');
        $('#pstep_finish').attr('disabled', 'disabled').addClass('disabled');
      });

      /* whenever a radio button is checked, toggle its parent label */

      $('.donation-levels').on('click', '.donate_level', function (e) {
        var $radioLabel = $(e.target).closest('.donate_level'),
          radioName = $radioLabel.find('input[type="radio"]').attr('name');

        $('.selected input[name="' + radioName + '"]').closest('.donate_level').removeClass('selected');
        $radioLabel.addClass('selected');
      });

      // Donate Double code
      $('#donate_double_text_field_input').closest('.custom-field-container').hide();
      $.ajax({
        type: "POST",
        url: "https://donatedouble.org/donate_api.php",
        data: {
          api_key: "JasdkfCXfdje23sjfxCDFipjfseppcMDMM",
          json: '{"action":"read","type":"companies"}'
        },
        success: function (data) {
          $.each(data.companies, function (i) {
            $('#donate_double_dropdown_dropdown').append($('<option>').text(this.name.replace('&amp;', '&')).attr('value', i));

          });
        }
      });
      $('#donate_double_dropdown_dropdown').change(function () {
        var companyName = $('#donate_double_dropdown_dropdown option:selected').text();
        $('#donate_double_text_field_input').val('');
        $('#donate_double_text_field_input').val(companyName);
      });

      if ($('.transaction-summary-info').length > 0) {
        // donation thank you step
      }
    }

    // ##########
    // API SURVEY
    // ##########
    if ($('.survey-form').length > 0) {

    }

  });
})(jQuery);
