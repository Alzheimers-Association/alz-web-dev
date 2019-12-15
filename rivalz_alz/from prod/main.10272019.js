'use strict';
(function ($) {
  $(document).ready(function () {

    /*************/
    /* Namespace */
    /*************/
    window.cd = {};

    $('ul.navbar-nav li.dropdown').hover(function () {
      $(this).find('.dropdown-menu').stop(true, true).fadeIn(150);
    }, function () {
      $(this).find('.dropdown-menu').stop(true, true).fadeOut(150);
    });

    $('.menu-btn').on('click', function (e) {
      e.preventDefault();
    });

    $('#logInCollapse').on('hide.bs.collapse', function () {
      console.log('closed log in collapse');
      $('.utility-nav .navbar-nav.logged-out').removeClass('login-open');
    });

    $('#logInCollapse').on('show.bs.collapse', function () {
      console.log('show log in collapse');
      $('.utility-nav .navbar-nav.logged-out').addClass('login-open');
    });

    var eventType = 'BvB';
    var consID = $('body').data('cons-id') ? $('body').data('cons-id') : null;
    var dfID = $('body').data('df-id') ? $('body').data('df-id') : null;

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
          var nextUrl = ($('body').is('.pg_rivalzpc') ? 'https://act.alz.org/site/SPageServer?pagename=rivalz_homepage' : window.location.href);
          var logoutUrl = 'http://act.alz.org/site/UserLogin?logout=1&pw_id=13127&NEXTURL=' + encodeURIComponent(nextUrl);
          $('.js__log-out-link').attr('href', logoutUrl);
          $('.js__sidebar-log-out-link').show();
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

                  trIDs.push(trId);

                }
              });
              // manage case where someone is registered for more than 1 historic Ride but only 1 active Ride
              if(totalTeamRaisers > 1){
                // $('.js__has-events').attr('id', 'eventsAccordion').wrapInner("<div class='multiple-events'></div>");
                // $('.multiple-events').append(teamRaiserList);
              } else {
                var singleFrId = trIDs[0];
                var singleEventLink = 'TR?fr_id=' + singleFrId + '&pg=entry';
                $('.js__has-events').addClass('single-event').append(teamRaiserList);
                $('#collapse1').addClass('show');
                $('#heading1 .fas').hide();
                console.log('singleFrId: ', singleFrId);
                $('.js__side-eventname').removeClass('collapsed').removeAttr('data-toggle').attr('href', singleEventLink);
              }
              $('.js__has-event').show();

            } else if (teamraisers.length == 1 && teamraisers[0].status !== '0' && teamraisers[0].status !== '4' && teamraisers[0].status !== '8') {
              /* If registered for only 1 RivALZ event */
              console.log('STATUS: ', teamraisers[0].status);
              $('.js__has-rides').show();
              console.log('only registered for 1 event')
              var trId = teamraisers[0].id;
              var teamPageUrl = (teamraisers[0].teamPageUrl ? teamraisers[0].teamPageUrl : null);
              var pcUrl = 'https://act.alz.org/site/SPageServer?pagename=rivalzpc&pc2_page=center&fr_id=' + trId;
              $('.js__pc-btn').show();
              $('.js__has-event').show();
              trIDs.push(trId);

            } else {
              console.log('not registered for any events');
              $('.js__pc-btn').replaceWith('<p style="color: #fff">You are not currently registered for a RivALZ event.</p><p>' +
                (cd.evID === null ? '<a class="btn btn-block btn-secondary pushy-link" href="#" role="button" >Register now</a>' : '<a class="btn btn-block btn-secondary" href="TRR/?pg=utype&fr_id=' + cd.evID + '">Register now</a>') + '</p>');
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
              'login success.'
            );

            /* if the user is logged in successfully, call the getRegisteredTeamraisers function above to retrieve the Ride list */
              setTimeout(cd.getUser(), 100);
          },

          error: function (response) {
            if (response.errorResponse.code === '22') {
              /* invalid email */
              $('.js__header-login-form').popover({
                  trigger: 'manual',
                  container: 'body',
                  placement: 'left',
                  content: function () {
                      return 'Oops! You entered an invalid email address.';
                  }
              }).popover('show');
            } else if (response.errorResponse.code === '202') {
              /* invalid email */
              $('.js__header-login-form').popover({
                  trigger: 'manual',
                  container: 'body',
                  placement: 'bottom',
                  content: function () {
                      return 'You have entered an invalid username or password. Please re-enter your credentials.';
                  }
              }).popover('show');
            } else {
              $('.js__header-login-form').popover({
                  trigger: 'manual',
                  container: 'body',
                  placement: 'left',
                  content: function () {
                      return response.errorResponse.message;
                  }
              }).popover('show');
            }
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
              $('.js__retrieve-login-form').hide();
              $('.js__header-login-form').show();
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
      successClass: 'has-success',
      errorClass: 'has-error',
      classHandler: function (_el) {
        var $parent = _el.$element.closest('.field-required');
        return $parent;
      }
    };

    // BEGIN TEST TOOLTIP
    window.Parsley.on('field:error', function (fieldInstance) {
          fieldInstance.$element.popover({
              trigger: 'manual',
              container: 'body',
              placement: 'bottom',
              content: function () {
                  return fieldInstance.getErrorsMessages().join(';');
              }
          }).popover('show');
      });
      
      window.Parsley.on('field:success', function (fieldInstance) {
          fieldInstance.$element.popover('dispose');
      });
    // END TEST TOOLTIP

    // add front end validation
    $('.js__header-login-form').parsley(parsleyOptions);
    cd.resetValidation = function () {
      $('.js__header-login-form').parsley().reset();
    }
    // manage form submissions
    $('.js__header-login-form').on('submit', function (e) {
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
        $('.js__retrieve-login-error-container').show();
      }
    });
    // show login retrieval form
    $('.js__show-retrieve-login').on('click', function (e) {
      e.preventDefault();
      cd.resetValidation();
      $('.js__header-login-form').hide();
      $('.js__retrieve-login-form').show();
    });

    // show login form
    $('.js__show-login').on('click', function (e) {
      e.preventDefault();
      cd.resetValidation();
      $('.js__retrieve-login-form').hide();
      $('.js__header-login-form').show();
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


    $('.js__redirect-participant-search-form').on('submit', function (e) {
      console.log('participant search submitted');
      e.preventDefault();
      var firstName = $('#participantFirstName').val();
      var lastName = $('#participantLastName').val();
      window.location.href = 'https://act.alz.org/site/SPageServer/?pagename=ride_search&search_for=participant&search_type=general&first_name=' + firstName + '&last_name=' + lastName;
    });

    


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

    if (!$('body').is('.pg_rivalz_eventList')) {
        var lnkArray = [];
        $('.lc_Table tr a').each(function() {
          lnkArray.push(this); 
        });
        if (lnkArray.length == 1) {
          var pcLink = $('.lc_Table tr a').attr('href');
          window.location = pcLink;
        } else {
          //do nothing
        }
    }
    if (!$('body').is('.pg_rivalzpc')) {

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
    if ($('body').is('.pg_rivalz_homepage')) {
      // home page scripts
        //initialize map
        var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Points &copy 2012 LINZ'
        }),
        latlng = L.latLng(39.36, -96.76);

        var map = L.map('map', {center: latlng, zoom: 4, layers: [tiles], scrollWheelZoom: false});

        //initial api request for accepting gifts and reg
        luminateExtend.api.request({
        api: 'TeamRaiser',
        data: 'method=getTeamraisersByInfo&event_type=BvB&name='+escape('%%%')+'&list_page_size=500&list_filter_column=status&list_filter_text=2&list_sort_column=event_date',
        callback: dropMarkers
        });
        //second api request for accepting gifts only
        luminateExtend.api.request({
        api: 'TeamRaiser',
        data: 'method=getTeamraisersByInfo&event_type=BvB&name='+escape('%%%')+'&list_page_size=500&list_filter_column=status&list_filter_text=3&list_sort_column=event_date',
        callback: dropMarkers
        });

        //stores all Markers on map for purposes of clearing overlay
        var markersArray = [];
        var activeWindow;
        var myIcon = L.icon({
        iconUrl: 'https://act.alz.org/images/content/pagebuilder/bvb_football_icon.png',
        });

        //callback function from API request - geocode locations + drop markers on map
        function dropMarkers(data){

        //convert teamraisers in JSON response to array
        var teamraisers = luminateExtend.utils.ensureArray(data.getTeamraisersResponse.teamraiser);


        if(!(typeof teamraisers[0] === 'undefined')){ //check for results
          //remove all invalid locations from array
          teamraisers = removeNullLocationsFrom(teamraisers);
          
        }
        else{ //no results
          return;
        }
        //geocode locations from results + drop markers on map
        $.each(teamraisers, function(i, tr) {
          var addr = '';
          if (tr.location_name) {
            addr += tr.location_name+',+';
          }
          addr += tr.city + ',+' + tr.state;
          
          if(tr.area == null || isNaN(tr.area.split(',')[0]) || isNaN(tr.area.split(',')[1])) return 'skip';
          var content =  '<div class="markerInfo"><h4>' + tr.name + '</h4>'
                + '<table><tr><td><strong>Date:&nbsp;</strong><td>' + luminateExtend.utils.simpleDateFormat(tr.event_date, 'MMM d, yyyy') + '</td></tr>'
                + '<tr><td><strong>Location:&nbsp;</strong><td>' + (tr.location_name ? tr.location_name : "TBA") + '</td></tr></table>'
                + '<span class="trlinks"><a href="' + tr.greeting_url + '">TeamRaiser Link</a> | '
                + '<a href="http://map'+'s.goo'+'gle.com/?q=' + addr + '&ll=' + tr.area + '">Directions</a></span></div>';
          var latLng = new L.latLng(Number(tr.area.split(',')[0]),Number(tr.area.split(',')[1]));
          var marker = new L.Marker(latLng, {title: '', icon: myIcon, alt: tr.city + ', ' + tr.state});
          marker.bindPopup(content);
          markersArray.push(marker);
        });
        L.layerGroup(markersArray).addTo(map);

            
        }

        //removes all TeamRaiser API results with undefined or null locations, or invalid lat/long coordinates - i.e. can't be displayed on map
        function removeNullLocationsFrom(array){
        return $.grep(array, function(tr, i) {
          if(typeof tr.city === 'undefined' || typeof tr.state === 'undefined' || typeof tr.area === 'undefined') return false; 
          else if (tr.city == null || tr.state == null || tr.area == null) return false;
          else if ((tr.area.match(/[A-z]/g) != null) || (tr.area.match(/,/g) == null)) return false;
          else return true;
        });
        }



        function buildTeamRaisersByInfo(data) {
          if (data && data.getTeamraisersResponse) {
            var listLength = data.getTeamraisersResponse.teamraiser.length;
            
            for (var i = 0; i < listLength; i++) {
        
        var rivName = '';
        if (data.getTeamraisersResponse.teamraiser[i].name.indexOf('-') != -1) {
        rivName = data.getTeamraisersResponse.teamraiser[i].name.substring(data.getTeamraisersResponse.teamraiser[i].name.indexOf('-')+2,(data.getTeamraisersResponse.teamraiser[i].name.indexOf(',')!=-1)?data.getTeamraisersResponse.teamraiser[i].name.indexOf(','):data.getTeamraisersResponse.teamraiser[i].name.length);
        } else if (data.getTeamraisersResponse.teamraiser[i].name.indexOf(':') != -1) {
        rivName = data.getTeamraisersResponse.teamraiser[i].name.substring(data.getTeamraisersResponse.teamraiser[i].name.indexOf(':')+2,(data.getTeamraisersResponse.teamraiser[i].name.indexOf(',')!=-1)?data.getTeamraisersResponse.teamraiser[i].name.indexOf(','):data.getTeamraisersResponse.teamraiser[i].name.length);
        } else {
        rivName = data.getTeamraisersResponse.teamraiser[i].name;
        }
        
              if ((data.getTeamraisersResponse.teamraiser[i].id != 4020) && (data.getTeamraisersResponse.teamraiser[i].id != 12964) && (data.getTeamraisersResponse.teamraiser[i].event_date.indexOf('2012-') == -1) && (data.getTeamraisersResponse.teamraiser[i].event_date.indexOf('2018-') == -1) && (data.getTeamraisersResponse.teamraiser[i].status == 2 || data.getTeamraisersResponse.teamraiser[i].status == 3)) {
                $('#eventCarousel').append($('<li class="game">'+
                  '<div class="game_city">'+rivName+'</div>'+
                  '<div class="game_date">'+luminateExtend.utils.simpleDateFormat(data.getTeamraisersResponse.teamraiser[i].event_date, 'MMM d, yyyy')+'</div>'+
                  '<div class="game_info"><a href="'+data.getTeamraisersResponse.teamraiser[i].greeting_url+'">Game Info</a></div>'+
                  '</li>'));
              }
            }
            $('#eventCarousel').jcarousel({});
          } else {
            if (console) {
              console.log('error occured with parsing TeamRaiser API response data');
              console.log(data);
            }
          }
        }
        
    
            luminateExtend.api.request({
              api: 'teamraiser', 
              data: 'method=getTeamraisersByInfo&event_type=BvB&name='+escape('%%%')+'&list_page_size=500&list_sort_column=event_date',
              callback: buildTeamRaisersByInfo
            });
            $('.flexslider').flexslider({
              animation: "slide",
              controlsContainer: ".flex-container",
              controlNav: true
            });

    }



    // ########
    // TR PAGES 
    // ########



    if ($('body').is('.pg_entry')) {

      var ajaxSlideshow = jQuery.ajax({
        url: 'TR/General?pg=informational&fr_id=' +  cd.evID + '&type=fr_informational&sid=26647&pgwrap=n',
        headers:{
          'X-Requested-With':'Foo'
        }
      });
      
      ajaxSlideshow.done(function(data){
        $(data).find('#page_body_container ul').appendTo($('.flexslider'));
        $('.flexslider').flexslider({
          animation: "slide",
          controlsContainer: ".flex-container",
          directionNav: true,
          prevText: "",
          nextText: ""
        });
      });
  
      $(document).click(function() {
        $("#calendarMenu").hide();
      });
      $("#calendarContainer").click(function(e) {
        e.stopPropagation();
      });

      // https set to relative
      var ajaxGreeting = jQuery.ajax({
        url: 'TR/General?pg=informational&fr_id=' +  cd.evID + '&type=fr_informational&sid=26648&pgwrap=n',
        method: 'GET'
      });

      var ajaxNews = jQuery.ajax({
        url: 'TR/General?pg=informational&fr_id=' +  cd.evID + '&type=fr_informational&sid=26644&pgwrap=n',
        method: 'GET'
      });

      var ajaxSpotlight = jQuery.ajax({
        url: 'TR/General?pg=informational&fr_id=' +  cd.evID + '&type=fr_informational&sid=26645&pgwrap=n',
        method: 'GET'
      });

      var ajaxStory = jQuery.ajax({
        url: 'TR/General?pg=informational&fr_id=' +  cd.evID + '&type=fr_informational&sid=26646&pgwrap=n',
        method: 'GET'
      });

      jQuery(document).ready(function(){
        ajaxGreeting.done(function(response) {
            var $greeting_copy = jQuery(response).find('#page_body_container').html()

            jQuery('#editable-greeting-copy').html($greeting_copy);
        });

        ajaxNews.done(function(response) {
            var $news_updates = jQuery(response).find('#page_body_container').html()

            jQuery('#newsContainer').html($news_updates);
        });

        ajaxSpotlight.done(function(response) {
            var $captain_spotlight = jQuery(response).find('#page_body_container').html()

            jQuery('.spotlight-boxes').html($captain_spotlight);
        });

        ajaxStory.done(function(response) {
            var $story_content = jQuery(response).find('#page_body_container').html()

            jQuery('.story-content-box').html($story_content);
        });
      });


    }

    if ($('body').is('.pg_personal')) {

      $('#sidebar_donate_button').html('Donate');
  
        // Move personal buttons
        $('#personalpage-top-block').append( $('#personal_sidebar_donate_button') );
        $('#personalpage-top-buttons').append( $('#personal_sidebar_join_team_button') );
        // Move personal image
  if ($('#personal_page_image_div').length > 0) {
        $('#personalpage-top-buttons').after( $('#personal_page_image_div') );
  } else {
        $('#personalpage-top-buttons').after( $('<div class="tr-image-div" id="personal_page_image_div"><img src="../images/content/pagebuilder/default_rivalz_profile.jpg" alt=""><div class="caption"></div></div>') ); 
  }
        // Move personal progress
        $('#personalpage-top-progress').append( $('#personal-progress-area') );
        // Move top block
        $('#fr_rich_text_container').parent().before( $('#personalpage-top-block') );
        // Move sidebar share buttons
        // $('#fr_rich_text_container').parent().after( $('#personal_sidebar_share') );
        // Move donor list
        $('#personal_sidebar_mail_form').before( $('#frStatus2') );

        // Move badges
        
        $('#personal_sidebar_share').before( $('#frBadge') );
        $('#personal-badges-container').insertBefore( $('#personal_sidebar_share') );
        // Move power of a donation
        $('#personal_sidebar_mail_form').after( $('#powerofdonation') );
  
      $('#personal-progress-raised span').text($('#personal-progress-raised span').text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'));
      $('#personal-progress-goal span').text($('#personal-progress-goal span').text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'));
  
        // Inserting part_type under player name
        $insertPlayer = $('<div id="insert-ptype-personal">[[S48:0:part-type]]</div>');
  
        $('#personalpage-title-block h1').after($insertPlayer);
    }


    if ($('body').is('.pg_team')) {
      var teamPageLink = window.location;
      var teamId = cd.getURLParameter(teamPageLink,'team_id');

       // Change text
       $('.TrAchievementBadgeIconListLargeHeader').html('Our Achievements');
       $('#join_team_button').html('Join Team');
       $('#join_team_button').attr('href', 'TRR?fr_id=' + cd.evID + '&pg=tfind&fr_tjoin=' + teamId);
       $('#sidebar_donate_button').html('Donate');
 
 console.log($('.team-roster-title-container').closest('.tr-status-indicator-container'));
       // Move roster
       $('#team-progress-area').after( $('.team-roster-title-container').closest('.tr-status-indicator-container') );
 
       // Move badges
       $('#frStatus2').before( $('#team_achievement_badge') );
 
       // Move share
       $('#frStatus2').before( $('#team_sidebar_share') );
 
       // Move roster legend
       $('.team-roster-area div.indicator-title').after( $('.team-roster-legend') );
       $('.team-roster-legend .team-roster-star').attr('src','../../2015longestday/images/team-list-captain.png');
       $('.team-roster-legend .team-roster-icon-description').html('Indicates team captain');
 
        // Move Join Team Button
       $('#team_page_team_name').after($ ('#join_team_button_container') );
 
       // Move Donate Button
       $('#join_team_button_container').append($ ('.non-mobile-donate-button-container') );
 
       // Move Team Name
       $('#team_page_team_name').before($ ('.team-page h1') );
 
       // Move Amount Raised
       $('#custom-progress-container').before($ ('#team-progress-raised') );
 
       // Move Line Up
       $('div.team-roster-legend').before($ ('#line-up') );
 

      var teamMemberConsIds = [];
      // $('#team_page').append('<div class="container clearfix"><div class="row"><div class="col-12"><h3>' + $('#team_page_main_content > h1').text() + ' Line-Up</h3><div class="card-columns js--team-photo-roster"></div><div class="card-columns js--team-text-roster"></div></div></div></div>');


      

  //    $('.team-roster-participant-name a').each(function(i, teamMember){
  //     console.log('cons link: ', $(this).attr('href'));
  //  });

       // Add donate buttons to roster and update Team Gifts text
       $( '.team-roster-participant-row' ).each(function() {
         if($(this).find('.team-roster-participant-name').text().indexOf('Team Gifts') != -1) {
           $(this).find('.team-roster-participant-name').html('<strong>Gifts Directly to the Team</strong>');
           console.log('name: ' + $(this).find('.team-roster-participant-name').text().trim() + ' raised: ' + $(this).find('.team-roster-participant-raised').text().trim());
         }
         else {

           console.log('name: ' + $(this).find('.team-roster-participant-name').text().trim() + ' href: ' + $(this).find('.team-roster-participant-name a').attr('href'));
           var participantPageLink = $(this).find('.team-roster-participant-name a').attr('href');

           var participandId = cd.getURLParameter(participantPageLink,'px');
           var participantName = $(this).find('.team-roster-participant-name').text().trim();
           var participantRaised = $(this).find('.team-roster-participant-raised').text();
           var participantIsCaptain = $(this).find('.team-roster-participant-name').hasClass('team-roster-captain-name');

           var customViewContent = $('<div/>', {
             "class": 'team-roster-participant-donate',
             html: '<a href="Donation2?df_id=' + dfID + '&PROXY_ID=' + participandId + '&PROXY_TYPE=20&FR_ID=' + cd.evID + '" class="team-roster-participant-donate-button">Donate</a>'
           });
           $(this).find('.team-roster-participant-raised').after( customViewContent );

          //  TODO - build array of team member cons id for photo roster API call
          // TODO - need to push team member name as well
          teamMemberConsIds.push({
            id: participandId, 
            name: participantName,
            raised: participantRaised,
            isCaptain: participantIsCaptain
          });
         }
         var participantRaised = $(this).find('.team-roster-participant-raised').text().trim();
         $(this).find('.team-roster-participant-raised').html('Raised ' + participantRaised);
       });

       //  TODO - iterate through team member consIds to build photo roster via API call
       console.log('consId array: ', teamMemberConsIds);
       var teamMembersWithPhotos = [];
       var teamMembersNoPhotos = [];

       $(teamMemberConsIds).each(function(i, participant){

        var consId = participant.id;
        var consName = participant.name;
        var consRaised = participant.raised;
        var isCaptain = participant.isCaptain;
        var consDonUrl = 'Donation2?df_id=' + dfID + '&PROXY_ID=' + consId + '&PROXY_TYPE=20&FR_ID=' + cd.evID;

        luminateExtend.api.request({
          api: 'TeamRaiser',
          data: 'method=getPersonalPhotos&fr_id=' + cd.evID + '&cons_id='+ participant.id,
          callback: {
            success: function (response) {
            
                var photoResponse = response.getPersonalPhotosResponse.photoItem;

              // TODO - add team captain indicator to card?

                var rosterCard = '<div class="col-6 col-sm-4 col-md-3 col-lg-3 mb-4 px-1 align-self-center ' + (photoResponse[0].customUrl ? 'photo-card' : 'text-card') + '"><div class="roster-participant bg-light border pt-2 d-flex flex-column">' + (isCaptain ? '<img class="roster-captain-badge" src="https://act.alz.org/rivalz_alz/assets/images/icon-captain.svg" height="15" alt="Team Captain Icon">' : '') + (photoResponse[0].customUrl ? '<div class="roster-img-container mt-auto"><img src="' + photoResponse[0].customUrl + '" alt="' + consName + '" width="150" height="150" class="rounded-circle mb-1 mt-2 shadow-sm"></div>' : '') + '<div class="card-copy mt-auto"><h3 class="my-2"><a href="https://act.alz.org/site/TR/?px=' + consId + '&pg=personal&fr_id=' + cd.evID + '">' + consName + '</a></h3><div class="mb-3"><span class="participant-raised">Raised: ' + consRaised + '</span></div></div><div class="mt-auto"><a href="' + consDonUrl + '" class="team-roster-participant-donate btn btn-primary btn-block mb-0 text-white">Donate</a></div></div></div>'

              if(photoResponse[0].customUrl){
                $('.js--team-photo-roster').append(rosterCard);
              } else {
                $('.js--team-text-roster').append(rosterCard);
              }
            },
            error: function (response) {
              console.log('error getting team roster photo');
            }
          }
        });

       });
 
     if ($('.team-roster-participant-container a:eq(0)').length>0) {
       var consID = $('.team-roster-participant-container a:eq(0)').attr('href').substring($('.team-roster-participant-container a:eq(0)').attr('href').indexOf('px=')+3,$('.team-roster-participant-container a:eq(0)').attr('href').indexOf('&pg=personal'));
       $('<a href="TRGiftForm?fr_id=' + cd.evID + '&px='+consID+'&form=TRGiftFormTeam" id="team_sidebar_mail_form" target="_blank">Mail-in donation form</a>').appendTo('#frStatus2 > .donor-list-indicator-container');
     }
 
     $('#team-progress-raised span').text($('#team-progress-raised span').text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'));
     $('#team-progress-goal span').text($('#team-progress-goal span').text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'));

    //  $.each(teamraisers, function(i, tr) {

    }


    if ($('body').is('.pg_rivalz_search')) {
      /*$('#fr_event_state').val('[[S334:st]]');*/
          $('#ev_joinus_box_normal').after($('<div id="movedResults" class="clearfix"></div>'));
          $('p.eventSearchResultsTitle, #FrEventSearchResults').appendTo('#movedResults');

              //initialize map
              var tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  maxZoom: 18,
                  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Points &copy 2012 LINZ'
                }),
              latlng = L.latLng(39.36, -96.76);
          
              var map = L.map('map', {center: latlng, zoom: 4, layers: [tiles], scrollWheelZoom: false});
              
              //initial api request for accepting gifts and reg
              luminateExtend.api.request({
                api: 'TeamRaiser',
                data: 'method=getTeamraisersByInfo&event_type=BvB&name='+escape('%%%')+'&list_page_size=500&list_filter_column=status&list_filter_text=2&list_sort_column=event_date',
                callback: dropMarkers
              });
              //second api request for accepting gifts only
              luminateExtend.api.request({
                api: 'TeamRaiser',
                data: 'method=getTeamraisersByInfo&event_type=BvB&name='+escape('%%%')+'&list_page_size=500&list_filter_column=status&list_filter_text=3&list_sort_column=event_date',
                callback: dropMarkers
              });
              
              //stores all Markers on map for purposes of clearing overlay
              var markersArray = [];
              var activeWindow;
              var myIcon = L.icon({
                iconUrl: '../images/content/pagebuilder/bvb_football_icon.png',
              });
          
              //callback function from API request - geocode locations + drop markers on map
              function dropMarkers(data){
                
                //convert teamraisers in JSON response to array
                var teamraisers = luminateExtend.utils.ensureArray(data.getTeamraisersResponse.teamraiser);
                
                
                if(!(typeof teamraisers[0] === 'undefined')){ //check for results
                  //remove all invalid locations from array
                  teamraisers = removeNullLocationsFrom(teamraisers);
                  
                }
                else{ //no results
                  return;
                }
                //geocode locations from results + drop markers on map
                $.each(teamraisers, function(i, tr) {
                  var addr = '';
                  if (tr.location_name) {
                    addr += tr.location_name+',+';
                  }
                  addr += tr.city + ',+' + tr.state;
                  
                  if(tr.area == null || isNaN(tr.area.split(',')[0]) || isNaN(tr.area.split(',')[1])) return 'skip';
                  var content =  '<div class="markerInfo"><h4>' + tr.name + '</h4>'
                        + '<table><tr><td><strong>Date:&nbsp;</strong><td>' + luminateExtend.utils.simpleDateFormat(tr.event_date, 'MMM d, yyyy') + '</td></tr>'
                        + '<tr><td><strong>Location:&nbsp;</strong><td>' + (tr.location_name ? tr.location_name : "TBA") + '</td></tr></table>'
                        + '<span class="trlinks"><a href="' + tr.greeting_url + '">TeamRaiser Link</a> | '
                        + '<a href="http://map'+'s.goo'+'gle.com/?q=' + addr + '&ll=' + tr.area + '">Directions</a></span></div>';
                      var latLng = new L.latLng(Number(tr.area.split(',')[0]),Number(tr.area.split(',')[1]));
                      var marker = new L.Marker(latLng, {title: '', icon: myIcon, alt: tr.city + ', ' + tr.state});
                      marker.bindPopup(content);
                      markersArray.push(marker);
                });
                L.layerGroup(markersArray).addTo(map);
          
                    
              }
          
                
          
              //removes all TeamRaiser API results with undefined or null locations, or invalid lat/long coordinates - i.e. can't be displayed on map
              function removeNullLocationsFrom(array){
                return $.grep(array, function(tr, i) {
                  if(typeof tr.city === 'undefined' || typeof tr.state === 'undefined' || typeof tr.area === 'undefined') return false; 
                  else if (tr.city == null || tr.state == null || tr.area == null) return false;
                  else if ((tr.area.match(/[A-z]/g) != null) || (tr.area.match(/,/g) == null)) return false;
                  else return true;
                });
              }
          
    }

    // #########
    //  DONATION
    // #########
    if ($('body').is('.app_donation')) {
      // donation scripts
      // $("#fake-check #anonymous_fake").on('click', function () {
      //   if ($("#fake-check #anonymous_fake").is(':checked')) {
      //     $("#tr_recognition_nameanonymous_row input[type=checkbox]").each(function () {
      //       $(this).prop("checked", false);
      //     });

      //   } else if ($("#fake-check #anonymous_fake").not(':checked')) {
      //     $("#tr_recognition_nameanonymous_row input[type=checkbox]").each(function () {
      //       $(this).prop("checked", true);
      //     });
      //   }
      // });
      // $('#fake-check #anonymous_fake').on('change', function () {
      //   $('input#tr_recognition_namerec_namename').attr('disabled', !this.checked)
      // });
      // $('#pageLoadingMsg').hide();


      // /* display Process button after page finishes loading */
      // $('#pstep_finish').show();

      // /* Updated for EJ */
      // $('p:contains("You are making a donation to Edward Jones.")').html('You are making a donation to the Alzheimer\'s Association on behalf of Team Edward Jones.');
      // $('p:contains("Edward Jones GWR")').html('You are making a donation to the Alzheimer\'s Association on behalf of Edward Jones for the Guinness World Record.');
      // //change labels here
      // $('h2.section-header-container:eq(0)').attr('id', 'giftInfoHdr');
      // $('.donation-levels input[type=radio]').each(function () {
      //   $(this).attr('aria-labelledby', 'giftInfoHdr');
      // });
      // $('#tr_recognition_namerec_namename').before($('#displayNameAs'));
      // $('#tr_recognition_namerec_namename').attr('aria-label', 'Display my name as (optional)');
      // $(".donation-level-input-container label").addClass("donate_level");
      // $(".donation-level-input-container input").addClass("donate_input");
      // $(".donation-form-container").wrapInner("<div class='donate-body-content'></div>");
      // $("#billing_first_name_row, #billing_last_name_row, #donor_email_address_row, #donor_email_opt_in_Row").wrapAll('<div id="billing-info">');
      // $("#billing_addr_street1_row, #billing_addr_street2_row, #billing_addr_city_row, #billing_addr_state_row, #billing_addr_zip_row, #billing_addr_country_row").wrapAll('<div id="billing-address">');
      // console.log('running ej');

      // $('.payment-type-dropdown').attr('aria-label', 'Payment method');
      // $('.payment-type-dropdown').parent().parent().wrapAll('<div id="payment-select">');
      // $('.disclaimer').parent().css('width', '100%');
      // $('.show-mobile').parent().css('width', '100%');

      // // set autocomplete to organization for employer name field 
      // $('#donor_matching_employersearchname').attr('autocomplete', 'organization');

      // /* update input types for HTML5 mobile device UX */
      // $('#responsive_payment_typecc_numbername, #responsive_payment_typecc_cvvname, .donation-level-user-entered input:visible').attr('pattern', '[0-9]*');
      // $('.donation-level-user-entered input:visible').attr('aria-label', 'Other amount');
      // $('#ProcessForm').attr('novalidate', 'novalidate');

      // if (($('.field-error-text').length == 0) && (($('#billing_addr_cityname').val() == '') && ($('#billing_addr_state').val() == ''))) {
      //   $('#billing_addr_city_row').hide();
      //   $('#billing_addr_state_row').hide();
      // }

      // // Other country selected
      // $('#billing_addr_country').on('change', function (e) {
      //   if ($(this).val() !== 'United States') {
      //     if ($(this).val() !== 'Canada') {
      //       $("#billing_addr_state").val('None');
      //     }
      //     $('#billing_addr_city_row').slideDown();
      //     $('#billing_addr_state_row').slideDown();
      //   }
      // });

      // // OnKeyDown Function
      // $("#billing_addr_zipname").on('keyup', function () {
      //   var zip_in = $(this);
      //   var zip_box = $('#billing_addr_zip_row');

      //   if (zip_in.val().length < 5) {
      //     zip_box.removeClass('error success');
      //   } else if (((zip_in.val().length > 5) && ($('#billing_addr_country').val() == 'United States')) || ((zip_in.val().length > 7) && ($('#billing_addr_country').val() == 'Canada'))) {
      //     zip_box.addClass('error').removeClass('success');

      //   } else if ((zip_in.val().length == 5) && ($('#billing_addr_country').val() == 'United States')) {

      //     // Make HTTP Request
      //     $.ajax({
      //       url: "https://api.zippopotam.us/us/" + zip_in.val(),
      //       cache: false,
      //       dataType: "json",
      //       type: "GET",
      //       success: function (result, success) {
      //         // Make the city and state boxes visible
      //         $('.ziperror').remove();
      //         $('#billing_addr_city_row').slideDown();
      //         $('#billing_addr_state_row').slideDown();

      //         // US Zip Code Records Officially Map to only 1 Primary Location
      //         places = result['places'][0];
      //         $("#billing_addr_cityname").val(places['place name']);
      //         $("#billing_addr_state").val(places['state abbreviation']);
      //         zip_box.addClass('success').removeClass('error');
      //       },
      //       error: function (result, success) {
      //         zip_box.removeClass('success').addClass('error');
      //         if ($('.ziperror').length == 0) {
      //           $('#billing-address').append('<div class="error ziperror">Please enter a valid zip code</div>');
      //         }
      //       }
      //     });
      //   } else if ((zip_in.val().length <= 7) && ($('#billing_addr_country').val() == 'Canada')) {

      //     // Make HTTP Request
      //     $.ajax({
      //       url: "https://api.zippopotam.us/ca/" + zip_in.val().substring(0, 3),
      //       cache: false,
      //       dataType: "json",
      //       type: "GET",
      //       success: function (result, success) {
      //         // Make the city and state boxes visible
      //         $('.ziperror').remove();
      //         $('#billing_addr_city_row').slideDown();
      //         $('#billing_addr_state_row').slideDown();

      //         // US Zip Code Records Officially Map to only 1 Primary Location
      //         places = result['places'][0];
      //         $("#billing_addr_cityname").val(places['place name']);
      //         $("#billing_addr_state").val(places['state abbreviation']);
      //         zip_box.addClass('success').removeClass('error');
      //       },
      //       error: function (result, success) {
      //         zip_box.removeClass('success').addClass('error');
      //         if ($('.ziperror').length == 0) {
      //           $('#billing-address').append('<div class="error ziperror">Please enter a valid zip code</div>');
      //         }
      //       }
      //     });
      //   }
      // });

      // $('#ProcessForm').submit(function () {
      //   $('#ProcessForm').append('<input type="hidden" name="pstep_finish" value="Process My Donation" />');
      //   $('#pstep_finish').attr('disabled', 'disabled').addClass('disabled');
      // });

      // /* whenever a radio button is checked, toggle its parent label */

      // $('.donation-levels').on('click', '.donate_level', function (e) {
      //   var $radioLabel = $(e.target).closest('.donate_level'),
      //     radioName = $radioLabel.find('input[type="radio"]').attr('name');

      //   $('.selected input[name="' + radioName + '"]').closest('.donate_level').removeClass('selected');
      //   $radioLabel.addClass('selected');
      // });

      // // Donate Double code
      // $('#donate_double_text_field_input').closest('.custom-field-container').hide();
      // $.ajax({
      //   type: "POST",
      //   url: "https://donatedouble.org/donate_api.php",
      //   data: {
      //     api_key: "JasdkfCXfdje23sjfxCDFipjfseppcMDMM",
      //     json: '{"action":"read","type":"companies"}'
      //   },
      //   success: function (data) {
      //     $.each(data.companies, function (i) {
      //       $('#donate_double_dropdown_dropdown').append($('<option>').text(this.name.replace('&amp;', '&')).attr('value', i));

      //     });
      //   }
      // });
      // $('#donate_double_dropdown_dropdown').change(function () {
      //   var companyName = $('#donate_double_dropdown_dropdown option:selected').text();
      //   $('#donate_double_text_field_input').val('');
      //   $('#donate_double_text_field_input').val(companyName);
      // });

      // if ($('.transaction-summary-info').length > 0) {
      //   // donation thank you step
      // }
    }

    if ($('#F2fRegContact').length > 0) {
      $('.input-label:contains("Facebook Fundraiser ID")').closest('.survey-question-container').css('display', 'none');
    }


    // ########## 
    // API SURVEY 
    // ########## 
    if ($('.survey-form').length > 0) {

    }
    // #################### 
    // Other legacy RivALZ JS
    // #################### 
    
     /* Replace Social Login images */
     $('img.loginLinks').each(function(){
      if ($(this).attr('src').indexOf('facebook_small.png') != -1) {
        $(this).attr('src','../images/content/pagebuilder/walk2013-pclogin-fb.png');
      } else if ($(this).attr('src').indexOf('linkedin_small.png') != -1) {
        $(this).attr('src','../images/content/pagebuilder/walk2013-pclogin-tw.png');
      } else if ($(this).attr('src').indexOf('twitter_small.png') != -1) {
        $(this).attr('src','../images/content/pagebuilder/walk2013-pclogin-li.png');
      }
    });
    $(".loginLinks").attr('title', 'Log in using one of your preferred sites');
    $(".loginLinks").attr('class','loginLinks addHover');

    /* pfind - BDC */
    if( $('#pg') && $('#pg').val() === 'pfind' ) {
            for( var i = 0; i < 4; i++ ) {
                    $( '.lc_Table th:eq(6)' ).remove();
            }
            $( '.lc_Table .lc_Row1' ).each( function() {
                    for( var i = 0; i < 2; i++ ) {
                            $( 'td:eq(3)', $(this) ).remove();
                    }
            });
            $( '.lc_Table .lc_Row0' ).each( function() {
                    for( var i = 0; i < 2; i++ ) {
                            $( 'td:eq(3)', $(this) ).remove();
                    }
            });
    }

    /* end pfind - BDC */

    $('.addHover').hover(
      function() {
        if ($(this).attr('src')) {
          $(this).attr('src',$(this).attr('src').replace('.png','-hover.png').replace('.jpg','-hover.jpg').replace('.gif','-hover.gif'));
        }
      },
      function() {
        if ($(this).attr('src')) {
          $(this).attr('src',$(this).attr('src').replace('-hover.png','.png').replace('-hover.jpg','.jpg').replace('-hover.gif','.gif'));
        }
      }
    );

    // Top Fundraisers Box 
    $('.hp_top5 .donor-list-indicator-container .indicator-title, .hp_top5 .donor-list-indicator-container .badge-icon').remove();
  
    $(".hp_top5 .donor-list-indicator-container .indicator-list-row").filter( ":odd" ).css("background-color", "#f2f2f2");

  });
})(jQuery);
