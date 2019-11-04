// BEGIN https://act.alz.org/ridepc/js/main2.js.gz
(function($) {
  'use strict';
  /* ****** */
  /* Global */
  /* ****** */


  window.adarda = {
    formatMoney: function(amountInCents) {
      amountInCents = Number(amountInCents);
      if(amountInCents > 0) {
        amountInCents = amountInCents / 100;
      }
      var i = parseInt(amountInCents = Math.abs(+amountInCents || 0).toFixed(2), 10) + '', 
      j = (j = i.length) > 3 ? j % 3 : 0, 
      formattedMoney = '$' + (j ? i.substr(0, j) + ',' : '') + 
                       i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + ',') + 
                       '.' + Math.abs(amountInCents - i).toFixed(2).slice(2);
      
      formattedMoney = formattedMoney.replace('.00', '');
      
      return formattedMoney;
    }, 
    
    getZipForLatLng: function(options) {
      var settings = $.extend({
        callback: $.noop
      }, options || {});
      
      if(settings.lat && settings.lng) {
        new google.maps.Geocoder().geocode({
          'latLng': new google.maps.LatLng(settings.lat, settings.lng)
        }, function (results, status) {
          var postalCode;
          
          if(status == google.maps.GeocoderStatus.OK && results[0]) {
            $.each(results[0].address_components, function() {
              if($.inArray('postal_code', this.types) >= 0) {
                postalCode = this.short_name;
              }
            });
          }
          
          settings.callback(postalCode);
        });
      }
    }, 
    
    getStateForZip: function(options) {
      var settings = $.extend({
        callback: $.noop
      }, options || {});
      
      if(settings.zipCode) {
        new google.maps.Geocoder().geocode({
          'address': settings.zipCode
        }, function (results, status) {
          var state;
          
          if(status == google.maps.GeocoderStatus.OK && results[0]) {
            $.each(results[0].address_components, function() {
              if($.inArray('administrative_area_level_1', this.types) >= 0) {
                state = this.short_name;
              }
            });
          }
          
          settings.callback(state);
        });
      }
    }, 
    
    getZipForAddress: function(options) {
      var settings = $.extend({
        callback: $.noop
      }, options || {});
      
      if(settings.address) {
        var geocoder = new google.maps.Geocoder();
        
        geocoder.geocode({
          'address': settings.address
        }, function (results0, status0) {
          var postalCode;
          
          if(status0 == google.maps.GeocoderStatus.OK && results0[0]) {
            $.each(results0[0].address_components, function() {
              if($.inArray('postal_code', this.types) >= 0) {
                postalCode = this.short_name;
              }
            });
            
            if(postalCode) {
              settings.callback(postalCode);
            }
            else {
              if(results0[0].geometry && results0[0].geometry.location) {
                adarda.getZipForLatLng({
                  lat: results0[0].geometry.location.lat(), 
                  lng: results0[0].geometry.location.lng(), 
                  callback: settings.callback
                });
              }
              else {
                settings.callback(postalCode);
              }
            }
          }
          else {
            settings.callback(postalCode);
          }
        });
      }
    }, 
    
    getTeamraisers: function(options) {
      var settings = $.extend({
        radius: '0', 
        eventName: '', 
        size: '25', 
        offset: '0', 
        ascending: 'true', 
        fullSearch: false
      }, options || {});
      
      if(settings.eventName.length === 0) {
        settings.eventName = '%';
      }
      
      luminateExtend.api({
        api: 'teamraiser', 
        data: (settings.zipCode ? 
               ('method=getTeamraisersByDistance' + 
                '&starting_postal=' + settings.zipCode + 
                '&search_distance=' + settings.radius) : 
               ('method=getTeamraisersByInfo' + 
                '&name=' + encodeURIComponent(settings.eventName)) + 
                (settings.state ? ('&state=' + settings.state) : '')) + 
              (settings.eventType ? ('&event_type=' + encodeURIComponent(settings.eventType)) : '') + 
              (settings.frId ? ('&list_filter_column=fr_id&list_filter_text=' + settings.frId) : '') + 
              '&list_page_size=' + settings.size + '&list_page_offset=' + settings.offset + 
              (settings.sortColumn ? ('&list_sort_column=' + settings.sortColumn + '&list_ascending=' + settings.ascending) : '') + 
              (settings.fullSearch ? '&full_search=true' : ''), 
        callback: settings.callback
      });
    }, 
    
    getRegisteredTeamraisers: function(options) {
      var settings = $.extend({
        size: '25', 
        offset: '0'
      }, options || {});
      
      luminateExtend.api({
        api: 'teamraiser', 
        data: 'method=getRegisteredTeamraisers' + 
              (settings.eventType ? ('&event_type=' + encodeURIComponent(settings.eventType)) : '') + 
              '&list_page_size=' + settings.size + '&list_page_offset=' + settings.offset, 
        requiresAuth: true, 
        callback: settings.callback
      });
    }, 
    
    getParticipants: function(options) {
      var settings = $.extend({
        firstName: '', 
        size: '25', 
        offset: '0', 
        ascending: 'true'
      }, options || {});
      
      while(settings.firstName.length < 3) {
        settings.firstName += '%';
      }
      
      luminateExtend.api({
        api: 'teamraiser', 
        data: 'method=getParticipants' + 
              (settings.frId ? 
               ('&fr_id=' + settings.frId) : 
               ('&event_type=' + encodeURIComponent(settings.eventType))) + 
              '&first_name=' + encodeURIComponent(settings.firstName) + 
              (settings.lastName ? ('&last_name=' + encodeURIComponent(settings.lastName)) : '') + 
              (settings.companyId ? ('&team_name=' + encodeURIComponent('%%%') + '&list_filter_column=team.company_id&list_filter_text=' + settings.companyId) : '') + 
              (settings.teamId ? ('&team_name=' + encodeURIComponent('%%%') + '&list_filter_column=team.team_id&list_filter_text=' + settings.teamId) : '') + 
              (settings.teamName ? ('&team_name=' + encodeURIComponent(settings.teamName)) : '') + 
              '&list_page_size=' + settings.size + '&list_page_offset=' + settings.offset + 
              (settings.sortColumn ? ('&list_sort_column=' + settings.sortColumn + '&list_ascending=' + settings.ascending) : ''), 
        callback: settings.callback
      });
    }, 
    
    getTeams: function(options) {
      var settings = $.extend({
        teamName: '%', 
        size: '25', 
        offset: '0', 
        ascending: 'true'
      }, options || {});
      
      luminateExtend.api({
        api: 'teamraiser', 
        data: 'method=getTeamsByInfo' + 
              (settings.frId ? 
               ('&fr_id=' + settings.frId) : 
               ('&event_type=' + encodeURIComponent(settings.eventType))) + 
              '&team_name=' + encodeURIComponent(settings.teamName) + 
              (settings.teamId ? ('&team_id=' + settings.teamId) : '') + 
              (settings.firstName ? ('&first_name=' + settings.firstName) : '') + 
              (settings.lastName ? ('&last_name=' + settings.lastName) : '') + 
              (settings.companyId ? ('&team_company_id=' + settings.companyId) : '') + 
              (settings.companyName ? ('&team_company=' + settings.companyName) : '') + 
              '&list_page_size=' + settings.size + '&list_page_offset=' + settings.offset + 
              (settings.sortColumn ? ('&list_sort_column=' + settings.sortColumn + '&list_ascending=' + settings.ascending) : ''), 
        callback: settings.callback
      });
    }, 
    
    getNationalCompanyEvents: function(options) {
      var settings = $.extend({
        companyId: '', 
        offset: '0'
      }, options || {});
      
      settings.offset = Number(settings.offset) + 1;
      
      $.ajax({
        url: 'TR?company_id=' + settings.companyId + '&pg=natl_co_events&filter_text=' + 
             '&page_number=' + settings.offset + '&goto_page=To%20Page' + 
             (settings.offset === 1 ? '&lcmd=amount.desc' : '&lcmd=filtering') + 
             '&lcmd_cf=&pgwrap=n', 
        dataType: 'html', 
        success: function(response) {
          var $paginatorCell = $(response).find('.lc_PaginatorCell'), 
          totalNumberResults = $paginatorCell.length === 0 ? 0 : Number($paginatorCell.eq(0).text().split(' of ')[1].trim()), 
          teamraisers = [];
          
          if(totalNumberResults > 0) {
            $(response).find('.lc_Table tr').each(function() {
              if($(this).find('td').length > 0) {
                teamraisers.push({
                  "frId": $(this).find('td').eq(0).find('a').attr('href').split('fr_id=')[1].split('&')[0], 
                  "eventName": $(this).find('td').eq(0).find('a').text().trim(), 
                  "amountRaised": $(this).find('td').eq(1).find('.lc_Text').text().trim(), 
                  "numMembers": $(this).find('td').eq(2).find('.lc_Text').text().trim()
                });
              }
            });
          }
          
          settings.callback({
            "totalNumberResults": totalNumberResults, 
            "teamraisers": teamraisers
          });
        }
      });
    }, 
    
    getNationalCompanyParticipants: function(options) {
      var settings = $.extend({
        companyId: '', 
        offset: '0'
      }, options || {});
      
      settings.offset = Number(settings.offset) + 1;
      
      $.ajax({
        url: 'TR?company_id=' + settings.companyId + '&pg=natl_co_parts&filter_text=' + 
             '&page_number=' + settings.offset + '&goto_page=To%20Page' + 
             (settings.offset === 1 ? '&lcmd=amount.desc' : '&lcmd=filtering') + 
             '&lcmd_cf=&pgwrap=n', 
        dataType: 'html', 
        success: function(response) {
          var $paginatorCell = $(response).find('.lc_PaginatorCell'), 
          totalNumberResults = $paginatorCell.length === 0 ? 0 : Number($paginatorCell.eq(0).text().split(' of ')[1].trim()), 
          participants = [];
          
          if(totalNumberResults > 0) {
            $(response).find('.lc_Table tr').each(function() {
              if($(this).find('td').length > 0) {
                participants.push({
                  "consId": $(this).find('td').eq(0).find('a').attr('href').split('px=')[1].split('&')[0], 
                  "participantName": $(this).find('td').eq(0).find('a').text().trim(), 
                  "frId": $(this).find('td').eq(0).find('a').attr('href').split('fr_id=')[1].split('&')[0], 
                  "eventName": $(this).find('td').eq(1).find('.lc_Text').text().trim(), 
                  "amountRaised": $(this).find('td').eq(2).find('.lc_Text').text().trim()
                });
              }
            });
          }
          
          settings.callback({
            "totalNumberResults": totalNumberResults, 
            "participants": participants
          });
        }
      });
    }, 
    
    getNationalCompanyTeams: function(options) {
      var settings = $.extend({
        companyId: '', 
        offset: '0'
      }, options || {});
      
      settings.offset = Number(settings.offset) + 1;
      
      $.ajax({
        url: 'TR?company_id=' + settings.companyId + '&pg=natl_co_teams&filter_text=' + 
             '&page_number=' + settings.offset + '&goto_page=To%20Page' + 
             (settings.offset === 1 ? '&lcmd=amount.desc' : '&lcmd=filtering') + 
             '&lcmd_cf=&pgwrap=n', 
        dataType: 'html', 
        success: function(response) {
          var $paginatorCell = $(response).find('.lc_PaginatorCell'), 
          totalNumberResults = $paginatorCell.length === 0 ? 0 : Number($paginatorCell.eq(0).text().split(' of ')[1].trim()), 
          teams = [];
          
          if(totalNumberResults > 0) {
            $(response).find('.lc_Table tr').each(function() {
              if($(this).find('td').length > 0) {
                teams.push({
                  "teamId": $(this).find('td').eq(0).find('a').attr('href').split('team_id=')[1].split('&')[0], 
                  "teamName": $(this).find('td').eq(0).find('a').text().trim(), 
                  "frId": $(this).find('td').eq(0).find('a').attr('href').split('fr_id=')[1].split('&')[0], 
                  "eventName": $(this).find('td').eq(1).find('.lc_Text').text().trim(), 
                  "amountRaised": $(this).find('td').eq(2).find('.lc_Text').text().trim(), 
                  "numMembers": $(this).find('td').eq(3).find('.lc_Text').text().trim()
                });
              }
            });
          }
          
          settings.callback({
            "totalNumberResults": totalNumberResults, 
            "teams": teams
          });
        }
      });
    }, 
    
    getTeamDivisions: function(options) {
      var settings = $.extend({}, options || {});
      
      luminateExtend.api({
        api: 'teamraiser', 
        data: 'method=getTeamDivisions&fr_id=' + settings.frId, 
        callback: settings.callback
      });
    }, 
    
    getCompanyList: function(options) {
      var settings = $.extend({}, options || {});
      
      luminateExtend.api({
        api: 'teamraiser', 
        data: 'method=getCompanyList&fr_id=' + settings.frId, 
        callback: settings.callback
      });
    }, 
    
    updateTeamInformation: function(options) {
      var settings = $.extend({
        form: ''
      }, options || {});
      
      luminateExtend.api({
        api: 'teamraiser', 
        requestType: 'POST', 
        requiresAuth: true, 
        data: 'method=updateTeamInformation&fr_id=' + settings.frId + 
              (settings.data ? ('&' + settings.data) : ''), 
        form: settings.form, 
        callback: settings.callback
      });
    }, 
    
    leaveTeam: function(options) {
      var settings = $.extend({}, options || {});
      
      luminateExtend.api({
        api: 'teamraiser', 
        requestType: 'POST', 
        requiresAuth: true, 
        data: 'method=leaveTeam&fr_id=' + settings.frId, 
        callback: settings.callback
      });
    }, 
    
    joinTeam: function(options) {
      var settings = $.extend({}, options || {});
      
      luminateExtend.api({
        api: 'teamraiser', 
        requestType: 'POST', 
        requiresAuth: true, 
        data: 'method=joinTeam&fr_id=' + settings.frId + 
              '&team_id=' + settings.teamId, 
        callback: settings.callback
      });
    }, 
    
    getSurveyResponses: function(options) {
      var settings = $.extend({}, options || {});
      
      luminateExtend.api({
        api: 'teamraiser', 
        requestType: 'POST', 
        requiresAuth: true, 
        data: 'method=getSurveyResponses&fr_id=' + settings.frId, 
        callback: settings.callback
      });
    }, 
    
    updateSurveyResponses: function(options) {
      var settings = $.extend({
        form: ''
      }, options || {});
      
      luminateExtend.api({
        api: 'teamraiser', 
        requestType: 'POST', 
        requiresAuth: true, 
        data: 'method=updateSurveyResponses&fr_id=' + settings.frId + 
              (settings.data ? ('&' + settings.data) : ''), 
        form: settings.form, 
        callback: settings.callback
      });
    }, 
    
    getUser: function(options) {
      var settings = $.extend({}, options || {});
      
      luminateExtend.api({
        api: 'cons', 
        requestType: 'POST', 
        requiresAuth: true, 
        data: 'method=getUser', 
        callback: settings.callback
      });
    }, 
    
    listUserFields: function(options) {
      var settings = $.extend({}, options || {});
      
      luminateExtend.api({
        api: 'cons', 
        requiresAuth: true, 
        data: 'method=listUserFields&include_choices=true&sort_order=group', 
        callback: settings.callback
      });
    }, 
    
    updateUser: function(options) {
      var settings = $.extend({}, options || {});
      
      luminateExtend.api({
        api: 'cons', 
        requestType: 'POST', 
        requiresAuth: true, 
        data: 'method=update' + 
              (settings.data ? ('&' + settings.data) : ''), 
        callback: settings.callback
      });
    }, 
    
    changePassword: function(options) {
      var settings = $.extend({
        form: ''
      }, options || {});
      
      luminateExtend.api({
        api: 'cons', 
        useHTTPS: true, 
        requestType: 'POST', 
        requiresAuth: true, 
        data: 'method=changePassword' + 
              (settings.data ? ('&' + settings.data) : ''), 
        form: settings.form, 
        callback: settings.callback
      });
    }
  };
  
  $.fn.prefillZip = function(options) {
    var settings = $.extend({
      callback: $.noop
    }, options || {});
    
    return this.each(function() {
      var $elem = $(this), 
      
      latLngToZip = function(lat, lng) {
        adarda.getZipForLatLng({
          lat: lat, 
          lng: lng, 
          callback: function(postalCode) {
            if(postalCode) {
              $elem.val(postalCode);
            }
            
            settings.callback();
          }
        });
      }, 
      
      getLatLngByIp = function() {
        $.getScript('//www.google.com/jsapi', function() {
          if(google.loader.ClientLocation) {
            latLngToZip(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude);
          }
        });
      };
      
      if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          latLngToZip(position.coords.latitude, position.coords.longitude);
        }, getLatLngByIp);
      }
      else {
        getLatLngByIp();
      }
    });
  };
  
  $.fn.participantList = function(options) {
    var defaultSettings = $.extend({}, options || {});
    
    return this.each(function() {
      var $elem = $(this), 
      settings = $.extend(true, {}, defaultSettings), 
      dataSettings = {
        frId: 'frid', 
        eventType: 'eventtype', 
        lastName: 'lastname', 
        firstName: 'firstname', 
        companyId: 'companyid', 
        teamId: 'teamid', 
        sortColumn: 'sortcolumn', 
        size: 'size', 
        offset: 'offset'
      };
      $.each(dataSettings, function(key, value) {
        if($elem.data(value)) {
          settings[key] = $elem.data(value) || settings[key];
        }
      });
      
      if(!$elem.data('includeteam')) {
        settings.excludeTeam = true;
      }
      else {
        settings.excludeTeam = false;
      }
      
      if(!$elem.data('descending')) {
        settings.ascending = 'true';
      }
      else {
        settings.ascending = 'false';
      }
      
      settings.callback = function(response) {
        $elem.find('.content__table--loading-row').addClass('hidden');
        
        var totalNumberResults = response.getParticipantsResponse.totalNumberResults, 
        participants = luminateExtend.utils.ensureArray(response.getParticipantsResponse.participant);
        $.each(participants, function(rowIndex) {
          var participantName = this.name;
          if(participantName && participantName.first && this.personalPagePrivate == 'false') {
            $elem.append('<div class="content__table--row content__table--' + (rowIndex % 2 === 0 ? 'even' : 'odd') + '">' + 
                           '<div>' + 
                             '<span>Participant Name:</span> ' + 
                             '<a href="' + this.personalPageUrl + '">' + 
                               participantName.first + ' ' + participantName.last + 
                             '</a>' + 
                           '</div>' + 
                           (settings.excludeTeam ? '' : 
                            ('<div class="table__column--bordered">' + 
                               (this.teamName ? 
                                ('<span>Team Name:</span> ' + 
                                 '<a href="' + this.teamPageUrl + '">' + 
                                   this.teamName + 
                                 '</a>') : '') + 
                           '</div>')) + 
                           '<div class="table__column--bordered">' + 
                             '<span>Raised:</span> ' + 
                             adarda.formatMoney(this.amountRaised) + 
                           '</div>' + 
                           '<div class="table__column--buttons">' + 
                             '<a href="' + this.personalPageUrl + '" class="button button-outline button-sm">View</a>' + 
                             (this.donationUrl ? 
                              ('<a href="' + this.donationUrl + '" class="button button-sm">Donate</a>') : '') + 
                           '</div>' + 
                         '</div>');
          }
        });
        
        if($elem.find('.content__table--row').length === 0) {
          $elem.find('.content__table--no-results-row').removeClass('hidden');
        }
        
        var listOffset = Number($elem.data('offset'));
        if(listOffset != 0) {
          $elem.parent().find('.js--participant-list-pagination .js--pagination-prev').removeClass('hidden');
        }
        if((listOffset + 1) * Number($elem.data('size')) < totalNumberResults) {
          $elem.parent().find('.js--participant-list-pagination .js--pagination-next').removeClass('hidden');
        }
      };
      
      $elem.find('.content__table--loading-row').removeClass('hidden');
      $elem.find('.content__table--no-results-row').addClass('hidden');
      $elem.find('.content__table--row').remove();
      $elem.parent().find('.js--participant-list-pagination .js--pagination-prev, ' + 
                          '.js--participant-list-pagination .js--pagination-next').addClass('hidden');
      
      adarda.getParticipants(settings);
      
      $elem.parent().find('.js--participant-list-pagination .js--pagination-prev').not('.js--pagination-bound').click(function(e) {
        e.preventDefault();
        
        var $targetList = $('.participant-list');
        $targetList.data('offset', Number($targetList.data('offset')) - 1);
        $targetList.participantList();
      }).addClass('js--pagination-bound');
      
      $elem.parent().find('.js--participant-list-pagination .js--pagination-next').not('.js--pagination-bound').click(function(e) {
        e.preventDefault();
        
        var $targetList = $('.participant-list');
        $targetList.data('offset', Number($targetList.data('offset')) + 1);
        $targetList.participantList();
      }).addClass('js--pagination-bound');
    });
  };
  
  $.fn.teamList = function(options) {
    var defaultSettings = $.extend({}, options || {});
    
    return this.each(function() {
      var $elem = $(this), 
      settings = $.extend(true, {}, defaultSettings), 
      dataSettings = {
        frId: 'frid', 
        eventType: 'eventtype', 
        teamName: 'teamname', 
        companyId: 'companyid', 
        sortColumn: 'sortcolumn', 
        size: 'size', 
        offset: 'offset'
      };
      $.each(dataSettings, function(key, value) {
        if($elem.data(value)) {
          settings[key] = $elem.data(value) || settings[key];
        }
      });
      
      if(!$elem.data('includecaptain')) {
        settings.excludeCaptain = true;
      }
      else {
        settings.excludeCaptain = false;
      }
      
      if(!$elem.data('descending')) {
        settings.ascending = 'true';
      }
      else {
        settings.ascending = 'false';
      }
      
      settings.callback = function(response) {
        $elem.find('.content__table--loading-row').addClass('hidden');
        
        var totalNumberResults = response.getTeamSearchByInfoResponse.totalNumberResults, 
        teams = luminateExtend.utils.ensureArray(response.getTeamSearchByInfoResponse.team);
        $.each(teams, function(rowIndex) {
          $elem.append('<div class="content__table--row content__table--' + (rowIndex % 2 === 0 ? 'even' : 'odd') + '">' + 
                         '<div>' + 
                           '<span>Team Name:</span> ' + 
                           '<a href="' + this.teamPageURL + '">' + 
                             this.name + 
                           '</a>' + 
                         '</div>' + 
                         (settings.excludeCaptain ? '' : 
                          ('<div class="table__column--bordered">' + 
                             '<span>Team Captain:</span> ' + 
                             (this.captainFirstName ? 
                              ('<a href="TR?fr_id=' + this.EventId + '&pg=personal&px=' + this.captainConsId + '">' + 
                                 this.captainFirstName + ' ' + this.captainLastName + 
                               '</a>') : '') + 
                           '</div>')) + 
                         '<div class="table__column--bordered">' + 
                           '<span>Raised:</span> ' + 
                           adarda.formatMoney(this.amountRaised) + 
                         '</div>' + 
                         '<div class="table__column--buttons">' + 
                           (this.joinTeamURL ? 
                            ('<a href="' + this.joinTeamURL + '" class="button button-outline button-sm">Join</a>') : '') + 
                           (this.teamDonateURL ? 
                            ('<a href="' + this.teamDonateURL + '" class="button button-sm">Donate</a>') : '') + 
                         '</div>' + 
                       '</div>');
        });
        
        if($elem.find('.content__table--row').length === 0) {
          $elem.find('.content__table--no-results-row').removeClass('hidden');
        }
        
        var listOffset = Number($elem.data('offset'));
        if(listOffset != 0) {
          $elem.parent().find('.js--team-list-pagination .js--pagination-prev').removeClass('hidden');
        }
        if((listOffset + 1) * Number($elem.data('size')) < totalNumberResults) {
          $elem.parent().find('.js--team-list-pagination .js--pagination-next').removeClass('hidden');
        }
      };
      
      $elem.find('.content__table--loading-row').removeClass('hidden');
      $elem.find('.content__table--no-results-row').addClass('hidden');
      $elem.find('.content__table--row').remove();
      $elem.parent().find('.js--team-list-pagination .js--pagination-prev, ' + 
                          '.js--team-list-pagination .js--pagination-next').addClass('hidden');
      
      adarda.getTeams(settings);
      
      $elem.parent().find('.js--team-list-pagination .js--pagination-prev').not('.js--pagination-bound').click(function(e) {
        e.preventDefault();
        
        var $targetList = $('.team-list');
        $targetList.data('offset', Number($targetList.data('offset')) - 1);
        $targetList.teamList();
      }).addClass('js--pagination-bound');
      
      $elem.parent().find('.js--team-list-pagination .js--pagination-next').not('.js--pagination-bound').click(function(e) {
        e.preventDefault();
        
        var $targetList = $('.team-list');
        $targetList.data('offset', Number($targetList.data('offset')) + 1);
        $targetList.teamList();
      }).addClass('js--pagination-bound');
    });
  };
  
  $.fn.nationalCompanyEventList = function(options) {
    var defaultSettings = $.extend({}, options || {});
    
    return this.each(function() {
      var $elem = $(this), 
      settings = $.extend(true, {}, defaultSettings), 
      dataSettings = {
        companyId: 'companyid', 
        offset: 'offset'
      };
      $.each(dataSettings, function(key, value) {
        if($elem.data(value)) {
          settings[key] = $elem.data(value) || settings[key];
        }
      });
      
      if(!settings.offset) {
        settings.offset = 0;
      }
      
      var prevOffset = Number($elem.data('prevoffset') || 0), 
      listOffset = Number(settings.offset);
      
      settings.callback = function(response) {
        $elem.find('.content__table--loading-row').addClass('hidden');
        
        var totalNumberResults = response.totalNumberResults;
        $.each(response.teamraisers, function(rowIndex) {
          var rowIsHidden = false;
          if((listOffset % 2 === 0 && rowIndex >= 10) || 
             (listOffset % 2 === 1 && rowIndex < 10)) {
            rowIsHidden = true;
          }
          
          $elem.append('<div class="content__table--row content__table--' + (rowIndex % 2 === 0 ? 'even' : 'odd') + 
                       (rowIsHidden ? ' hidden' : '') + '">' + 
                         '<div>' + 
                           '<span>Event:</span> ' + 
                           '<a href="TR?fr_id=' + this.frId + '">' + 
                             this.eventName.replace('adarda Walk to Cure Diabetes, ', '').replace('adarda One Walk, ', '') + 
                           '</a>' + 
                           '</div>' + 
                           '<div class="table__column--bordered">' + 
                             '<span>Raised:</span> ' + 
                             this.amountRaised.replace('.00', '') + 
                           '</div>' + 
                           '<div class="table__column--bordered">' + 
                             '<span>Participants:</span> ' + 
                             this.numMembers + 
                           '</div>' + 
                           '<div class="table__column--buttons">' + 
                             '<a href="PageServer?pagename=walk_register&fr_id=' + this.frId + '" class="button button-sm">Register</a>' + 
                           '</div>' + 
                         '</div>');
        });
        
        if($elem.find('.content__table--row').length === 0) {
          $elem.find('.content__table--no-results-row').removeClass('hidden');
        }
        
        $elem.data('totalnumberresults', totalNumberResults);
        
        if(listOffset != 0) {
          $elem.parent().find('.js--national-team-list-pagination .js--pagination-prev').removeClass('hidden');
        }
        if((listOffset + 1) * 10 < totalNumberResults) {
          $elem.parent().find('.js--national-team-list-pagination .js--pagination-next').removeClass('hidden');
        }
      };
      
      $elem.parent().find('.js--national-team-list-pagination .js--pagination-prev, ' + 
                          '.js--national-team-list-pagination .js--pagination-next').addClass('hidden');
      
      if((listOffset % 2 === 0 && prevOffset <= listOffset) || 
         (listOffset % 2 === 1 && prevOffset > listOffset)) {
        $elem.find('.content__table--loading-row').removeClass('hidden');
        $elem.find('.content__table--no-results-row').addClass('hidden');
        $elem.find('.content__table--row').remove();
        
        if(listOffset > 0) {
          settings.offset = Math.floor(listOffset / 2);
        }
        
        adarda.getNationalCompanyEvents(settings);
      }
      else {
        var $visibleRows = $elem.find('.content__table--row').not('.hidden'), 
        $hiddenRows = $elem.find('.content__table--row.hidden');
        
        $visibleRows.addClass('hidden');
        $hiddenRows.removeClass('hidden');
        
        if(listOffset != 0) {
          $elem.parent().find('.js--national-team-list-pagination .js--pagination-prev').removeClass('hidden');
        }
        if((listOffset + 1) * 10 < Number($elem.data('totalnumberresults'))) {
          $elem.parent().find('.js--national-team-list-pagination .js--pagination-next').removeClass('hidden');
        }
      }
      
      $elem.parent().find('.js--national-team-list-pagination .js--pagination-prev').not('.js--pagination-bound').click(function(e) {
        e.preventDefault();
        
        var $targetList = $('.national-company-event-list'), 
        listOffset = Number($targetList.data('offset'));
        $targetList.data('prevoffset', listOffset)
                   .data('offset', listOffset - 1)
                   .nationalCompanyEventList();
      }).addClass('js--pagination-bound');
      
      $elem.parent().find('.js--national-team-list-pagination .js--pagination-next').not('.js--pagination-bound').click(function(e) {
        e.preventDefault();
        
        var $targetList = $('.national-company-event-list'), 
        listOffset = Number($targetList.data('offset'));
        $targetList.data('prevoffset', listOffset)
                   .data('offset', listOffset + 1)
                   .nationalCompanyEventList();
      }).addClass('js--pagination-bound');
    });
  };
  
  $.fn.nationalCompanyParticipantList = function(options) {
    var defaultSettings = $.extend({}, options || {});
    
    return this.each(function() {
      var $elem = $(this), 
      settings = $.extend(true, {}, defaultSettings), 
      dataSettings = {
        companyId: 'companyid', 
        offset: 'offset'
      };
      $.each(dataSettings, function(key, value) {
        if($elem.data(value)) {
          settings[key] = $elem.data(value) || settings[key];
        }
      });
      
      if(!settings.offset) {
        settings.offset = 0;
      }
      
      var prevOffset = Number($elem.data('prevoffset') || 0), 
      listOffset = Number(settings.offset);

      settings.callback = function(response) {
        $elem.find('.content__table--loading-row').addClass('hidden');
        
        var totalNumberResults = response.totalNumberResults;
        $.each(response.participants, function(rowIndex) {
          var rowIsHidden = false;
          if((listOffset % 2 === 0 && rowIndex >= 10) || 
             (listOffset % 2 === 1 && rowIndex < 10)) {
            rowIsHidden = true;
          }
          
          $elem.append('<div class="content__table--row content__table--' + (rowIndex % 2 === 0 ? 'even' : 'odd') + 
                       (rowIsHidden ? ' hidden' : '') + '">' + 
                         '<div>' + 
                           '<span>Participant Name:</span> ' + 
                           '<a href="TR?fr_id=' + this.frId + '&pg=personal&px=' + this.consId + '">' + 
                             this.participantName + 
                           '</a>' + 
                         '</div>' + 
                         '<div class="table__column--bordered">' + 
                           '<span>Event:</span> ' + 
                           '<a href="TR?fr_id=' + this.frId + '">' + 
                             this.eventName.replace('adarda Walk to Cure Diabetes, ', '').replace('adarda One Walk, ', '') + 
                           '</a>' + 
                         '</div>' + 
                         '<div class="table__column--bordered">' + 
                           '<span>Raised:</span> ' + 
                           this.amountRaised.replace('.00', '') + 
                         '</div>' + 
                         '<div class="table__column--buttons">' + 
                           '<a href="TR?px=' + this.consId + '&pg=personal&fr_id=' + this.frId + '" class="button button-sm button-outline">View</a>' + 
                         '</div>' + 
                       '</div>');
        });
        
        if($elem.find('.content__table--row').length === 0) {
          $elem.find('.content__table--no-results-row').removeClass('hidden');
        }
        
        $elem.data('totalnumberresults', totalNumberResults);
        
        if(listOffset != 0) {
          $elem.parent().find('.js--national-team-list-pagination .js--pagination-prev').removeClass('hidden');
        }
        if((listOffset + 1) * 10 < totalNumberResults) {
          $elem.parent().find('.js--national-team-list-pagination .js--pagination-next').removeClass('hidden');
        }
      };
      
      $elem.parent().find('.js--national-team-list-pagination .js--pagination-prev, ' + 
                          '.js--national-team-list-pagination .js--pagination-next').addClass('hidden');
      
      if((listOffset % 2 === 0 && prevOffset <= listOffset) || 
         (listOffset % 2 === 1 && prevOffset > listOffset)) {
        $elem.find('.content__table--loading-row').removeClass('hidden');
        $elem.find('.content__table--no-results-row').addClass('hidden');
        $elem.find('.content__table--row').remove();
        
        if(listOffset > 0) {
          settings.offset = Math.floor(listOffset / 2);
        }
        
        adarda.getNationalCompanyParticipants(settings);
      }
      else {
        var $visibleRows = $elem.find('.content__table--row').not('.hidden'), 
        $hiddenRows = $elem.find('.content__table--row.hidden');
        
        $visibleRows.addClass('hidden');
        $hiddenRows.removeClass('hidden');
        
        if(listOffset != 0) {
          $elem.parent().find('.js--national-team-list-pagination .js--pagination-prev').removeClass('hidden');
        }
        if((listOffset + 1) * 10 < Number($elem.data('totalnumberresults'))) {
          $elem.parent().find('.js--national-team-list-pagination .js--pagination-next').removeClass('hidden');
        }
      }
      
      $elem.parent().find('.js--national-team-list-pagination .js--pagination-prev').not('.js--pagination-bound').click(function(e) {
        e.preventDefault();
        
        var $targetList = $('.national-company-participant-list'), 
        listOffset = Number($targetList.data('offset'));
        $targetList.data('prevoffset', listOffset)
                   .data('offset', listOffset - 1)
                   .nationalCompanyParticipantList();
      }).addClass('js--pagination-bound');
      
      $elem.parent().find('.js--national-team-list-pagination .js--pagination-next').not('.js--pagination-bound').click(function(e) {
        e.preventDefault();
        
        var $targetList = $('.national-company-participant-list'), 
        listOffset = Number($targetList.data('offset'));
        $targetList.data('prevoffset', listOffset)
                   .data('offset', listOffset + 1)
                   .nationalCompanyParticipantList();
      }).addClass('js--pagination-bound');
    });
  };
  
  $.fn.nationalCompanyTeamList = function(options) {
    var defaultSettings = $.extend({}, options || {});
    
    return this.each(function() {
      var $elem = $(this), 
      settings = $.extend(true, {}, defaultSettings), 
      dataSettings = {
        companyId: 'companyid', 
        offset: 'offset'
      };
      $.each(dataSettings, function(key, value) {
        if($elem.data(value)) {
          settings[key] = $elem.data(value) || settings[key];
        }
      });
      
      if(!settings.offset) {
        settings.offset = 0;
      }
      
      var prevOffset = Number($elem.data('prevoffset') || 0), 
      listOffset = Number(settings.offset);
      
      settings.callback = function(response) {
        $elem.find('.content__table--loading-row').addClass('hidden');
        
        var totalNumberResults = response.totalNumberResults;
        $.each(response.teams, function(rowIndex) {
          var rowIsHidden = false;
          if((listOffset % 2 === 0 && rowIndex >= 10) || 
             (listOffset % 2 === 1 && rowIndex < 10)) {
            rowIsHidden = true;
          }
          
          $elem.append('<div class="content__table--row content__table--' + (rowIndex % 2 === 0 ? 'even' : 'odd') + 
                       (rowIsHidden ? ' hidden' : '') + '">' + 
                         '<div>' + 
                           '<span>Team Name:</span> ' + 
                           '<a href="TR?fr_id=' + this.frId + '&pg=team&team_id=' + this.teamId + '">' + 
                             this.teamName + 
                           '</a>' + 
                         '</div>' + 
                         '<div class="table__column--bordered">' + 
                           '<span>Event:</span> ' + 
                           '<a href="TR?fr_id=' + this.frId + '">' + 
                             this.eventName.replace('adarda Walk to Cure Diabetes, ', '').replace('adarda One Walk, ', '') + 
                           '</a>' + 
                         '</div>' + 
                         '<div class="table__column--bordered">' + 
                           '<span>Raised:</span> ' + 
                           this.amountRaised.replace('.00', '') + 
                         '</div>' + 
                         '<div class="table__column--bordered">' + 
                           '<span>Participants:</span> ' + 
                           this.numMembers + 
                         '</div>' + 
                         '<div class="table__column--buttons">' + 
                           '<a href="TR?team_id=' + this.teamId + '&pg=team&fr_id=' + this.frId + '" class="button button-outline button-sm">View</a>' + 
                           '<a href="TRR?fr_tjoin=' + this.teamId + '&pg=tfind&fr_id=' + this.frId + '" class="button button-sm">Join</a>' + 
                         '</div>' + 
                       '</div>');
        });
        
        if($elem.find('.content__table--row').length === 0) {
          $elem.find('.content__table--no-results-row').removeClass('hidden');
        }
        
        $elem.data('totalnumberresults', totalNumberResults);
        
        if(listOffset != 0) {
          $elem.parent().find('.js--national-team-list-pagination .js--pagination-prev').removeClass('hidden');
        }
        if((listOffset + 1) * 10 < totalNumberResults) {
          $elem.parent().find('.js--national-team-list-pagination .js--pagination-next').removeClass('hidden');
        }
      };
      
      $elem.parent().find('.js--national-team-list-pagination .js--pagination-prev, ' + 
                          '.js--national-team-list-pagination .js--pagination-next').addClass('hidden');
      
      if((listOffset % 2 === 0 && prevOffset <= listOffset) || 
         (listOffset % 2 === 1 && prevOffset > listOffset)) {
        $elem.find('.content__table--loading-row').removeClass('hidden');
        $elem.find('.content__table--no-results-row').addClass('hidden');
        $elem.find('.content__table--row').remove();
        
        if(listOffset > 0) {
          settings.offset = Math.floor(listOffset / 2);
        }
        
        adarda.getNationalCompanyTeams(settings);
      }
      else {
        var $visibleRows = $elem.find('.content__table--row').not('.hidden'), 
        $hiddenRows = $elem.find('.content__table--row.hidden');
        
        $visibleRows.addClass('hidden');
        $hiddenRows.removeClass('hidden');
        
        if(listOffset != 0) {
          $elem.parent().find('.js--national-team-list-pagination .js--pagination-prev').removeClass('hidden');
        }
        if((listOffset + 1) * 10 < Number($elem.data('totalnumberresults'))) {
          $elem.parent().find('.js--national-team-list-pagination .js--pagination-next').removeClass('hidden');
        }
      }
      
      $elem.parent().find('.js--national-team-list-pagination .js--pagination-prev').not('.js--pagination-bound').click(function(e) {
        e.preventDefault();
        
        var $targetList = $('.national-company-team-list'), 
        listOffset = Number($targetList.data('offset'));
        $targetList.data('prevoffset', listOffset)
                   .data('offset', listOffset - 1)
                   .nationalCompanyTeamList();
      }).addClass('js--pagination-bound');
      
      $elem.parent().find('.js--national-team-list-pagination .js--pagination-next').not('.js--pagination-bound').click(function(e) {
        e.preventDefault();
        
        var $targetList = $('.national-company-team-list'), 
        listOffset = Number($targetList.data('offset'));
        $targetList.data('prevoffset', listOffset)
                   .data('offset', listOffset + 1)
                   .nationalCompanyTeamList();
      }).addClass('js--pagination-bound');
    });
  };
  
  $.fn.consProfile = function(teamraiserOptions) {
    var defaultTeamraiserSettings = $.extend({}, teamraiserOptions || {});
    
    return this.each(function() {
      var $elem = $(this), 
      teamraiserSettings = $.extend(true, {}, defaultTeamraiserSettings), 
      dataSettings = {
        eventType: 'eventtype', 
        surveyExcludes: 'surveyexcludes'
      };
      $.each(dataSettings, function(key, value) {
        if($elem.data(value)) {
          teamraiserSettings[key] = $elem.data(value) || teamraiserSettings[key];
        }
      });
      
      if(teamraiserSettings.surveyExcludes) {
        var surveyExcludes = teamraiserSettings.surveyExcludes.replace(/ /g, '').split(',');
        teamraiserSettings.surveyExcludes = [];
        $.each(surveyExcludes, function(i, key) {
          teamraiserSettings.surveyExcludes.push(key.toLowerCase());
        });
      }
      
      $elem.find('.cons-profile__loading').removeClass('hidden');
      $elem.removeData('consloaded').removeData('trloaded').removeData('conssuccess').removeData('trsuccess');
      $elem.find('.cons-profile__panels, .cons-profile__panels .panel').addClass('hidden');
      $elem.find('.cons-profile__panels .form-group').not('.js--default-form-group').remove();
      $elem.find('.cons-profile__save').addClass('hidden');
      
      var buildFormField = function(options) {
        var fieldMarkup = '<label for="' + options.id + '" class="col-md-2 control-label">' + 
                            options.label + 
                          '</label>' + 
                          '<div class="col-md-10">' + 
                            '<input type="' + 
                            ($.inArray(options.type, ['number']) > -1 ? options.type : 'text') + 
                            '" maxlength="' + options.maxChars + 
                            '" name="' + options.name + 
                            '" class="form-control" id="' + options.id + 
                            '" ' + (options.value ? ('value="' + options.value + '"') : '') + 
                            (options.required ? 'required' : '') + '>' + 
                          '</div>';
        
        switch(options.type) {
          case 'hidden':
            fieldMarkup = '<input type="hidden" name="' + options.name + 
                          '" id="' + options.id + 
                          '" ' + (options.value ? ('value="' + options.value + '"') : '') + '>';
            break;
          case 'enumeration':
            fieldMarkup = '<label for="' + options.id + '" class="col-md-2 control-label">' + 
                            options.label + 
                          '</label>' + 
                          '<div class="col-md-10">' + 
                            '<select name="' + options.name + 
                            '" class="form-control" id="' + options.id + 
                            '" ' + (options.required ? 'required' : '') + '>' + 
                              '<option value=""></option>';
            
            $.each(options.choices, function() {
              fieldMarkup += '<option value="' + this.value + 
                             '" ' + (options.value && this.value == options.value ? 'selected' : '') + '>' + 
                               this.label + 
                             '</option>'
            });
            
            fieldMarkup += '</select></div>';
            break;
          case 'date':
            var monthOptions = '', 
            dayOptions = '', 
            currentYear = new Date().getFullYear(), 
            yearOptions = '';

            for(var i = 1; i <= 31; i++) {
              if(i <= 12) {
                monthOptions += '<option value="' + i + '">' + i + '</option>';
              }
              dayOptions += '<option value="' + i + '">' + i + '</option>';
            }
            for(var i = currentYear; i >= currentYear - 100; i--) {
              yearOptions += '<option value="' + i + '">' + i + '</option>';
            }
            
            fieldMarkup = '<label for="' + options.id + '" class="col-md-2 control-label">' + 
                            options.label + 
                          '</label>' + 
                          '<div class="col-md-10">' + 
                            '<div class="row">' + 
                              '<div class="col-xs-4">' + 
                                '<select class="form-control js--cons-profile-date" id="' + options.id + '-month"' + 
                                ' data-targetdate="#' + options.id + '"' + 
                                (options.required ? 'required' : '') + '>' + 
                                  '<option value=""></option>' + 
                                  monthOptions + 
                                '</select>' + 
                              '</div>' + 
                              '<div class="col-xs-4">' + 
                                '<select class="form-control js--cons-profile-date" id="' + options.id + '-day"' + 
                                ' data-targetdate="#' + options.id + '"' + 
                                (options.required ? 'required' : '') + '>' + 
                                  '<option value=""></option>' + 
                                  dayOptions + 
                                '</select>' + 
                              '</div>' + 
                              '<div class="col-xs-4">' + 
                                '<select class="form-control js--cons-profile-date" id="' + options.id + '-year"' + 
                                ' data-targetdate="#' + options.id + '"' + 
                                (options.required ? 'required' : '') + '>' + 
                                  '<option value=""></option>' + 
                                  yearOptions + 
                                '</select>' + 
                              '</div>' + 
                            '</div>' + 
                            '<input type="hidden" name="' + options.name + '" id="' + options.id + '">' + 
                          '</div>';
            break;
          case 'radio':
            fieldMarkup = '<label class="col-md-2 control-label">' + 
                            options.label + 
                          '</label>' + 
                          '<div class="col-md-10">';
            
            $.each(options.choices, function(i) {
              fieldMarkup += '<div class="radio">' + 
                               '<label for="' + options.id + '-' + i + '">' + 
                                 '<input type="radio" name="' + options.name + 
                                 '" id="' + options.id + '-' + i + 
                                 '" value="' + this.value + 
                                 '" data-label="' + this.label + '">' + 
                                 this.label + 
                               '</label>' + 
                             '</div>';
            });
            
            fieldMarkup += '</div>';
            break;
          case 'boolean':
            fieldMarkup = '<div class="col-md-offset-2 col-md-10">' + 
                            '<div class="checkbox">' + 
                              '<label for="' + options.id + '">' + 
                                '<input type="checkbox" name="' + options.name + 
                                '" id="' + options.id + '" value="true">' + 
                                options.label + 
                              '</label>' + 
                            '</div>' + 
                          '</div>';
            break;
          case 'multimulti':
            fieldMarkup = '<label class="col-md-2 control-label">' + 
                            options.label + 
                          '</label>' + 
                          '<div class="col-md-10">';
            
            $.each(options.choices, function(i) {
              fieldMarkup += '<div class="checkbox">' + 
                               '<label for="' + options.id + '-' + i + '">' + 
                                 '<input type="checkbox" name="' + options.name + 
                                 '" id="' + options.id + '-' + i + 
                                 '" value="' + this.value + 
                                 '" data-label="' + this.label + '">' + 
                                 this.label + 
                               '</label>' + 
                             '</div>';
            });
            
            fieldMarkup += '</div>';
            break;
        }
        
        return fieldMarkup;
      }, 
      showProfile = function() {
        if($elem.data('consloaded') && $elem.data('consloaded') === 1 && 
           (!teamraiserSettings.eventType || 
            ($elem.data('trloaded') && $elem.data('trloaded') === 1))) {
          $elem.find('.cons-profile__loading').addClass('hidden');
          $elem.find('.cons-profile__panels, .cons-profile__save').removeClass('hidden');
        }
      };
      
      /* add change password modal */
      if($('#change-password-modal').length === 0) {
        $('body').append('<div class="modal fade" id="change-password-modal">' + 
                           '<div class="modal-dialog">' + 
                             '<div class="modal-content">' + 
                               '<form class="form-horizontal" id="change-password-form">' + 
                                 '<div class="modal-header">' + 
                                   '<h4 class="modal-title">Change Password</h4>' + 
                                 '</div>' + 
                                 '<div class="modal-body">' + 
                                   '<div class="row">' + 
                                     '<div class="col-xs-12">' + 
                                       '<div class="alert alert-danger hidden" id="change-password-error"></div>' + 
                                     '</div>' + 
                                   '</div>' + 
                                   '<div class="form-group">' + 
                                     '<label for="change-password-old" class="col-lg-3 control-label">' + 
                                       'Old Password:' + 
                                     '</label>' + 
                                     '<div class="col-lg-9">' + 
                                       '<input type="password" class="form-control" name="old_password" id="change-password-old" required>' + 
                                     '</div>' + 
                                   '</div>' + 
                                   '<div class="form-group">' + 
                                     '<label for="change-password-new" class="col-lg-3 control-label">' + 
                                       'New Password:' + 
                                     '</label>' + 
                                     '<div class="col-lg-9">' + 
                                       '<input type="password" class="form-control" maxlength="20" name="user_password" id="change-password-new" required>' + 
                                     '</div>' + 
                                   '</div>' + 
                                   '<div class="form-group">' + 
                                     '<label for="change-password-new-repeat" class="col-lg-3 control-label">' + 
                                       'Repeat New Password:' + 
                                     '</label>' + 
                                     '<div class="col-lg-9">' + 
                                       '<input type="password" class="form-control" maxlength="20" name="retype_password" id="change-password-new-repeat" required>' + 
                                     '</div>' + 
                                   '</div>' + 
                                   '<div class="form-group">' + 
                                     '<label for="change-password-reminder-hint" class="col-lg-3 control-label">Reminder Hint:</label>' + 
                                     '<div class="col-lg-9">' + 
                                       '<input type="text" class="form-control" maxlength="90" name="reminder_hint" id="change-password-reminder-hint" required>' + 
                                     '</div>' + 
                                   '</div>' + 
                                 '</div>' + 
                                 '<div class="modal-footer clearfix">' + 
                                   '<button type="submit" class="button pull-left">Save</button> ' + 
                                   '<button type="button" class="button button-outline pull-right" data-dismiss="modal">Cancel</button>' + 
                                 '</div>' + 
                               '</form>' + 
                             '</div>' + 
                           '</div>' + 
                         '</div>');
        
        $('#change-password-form').submit(function(e) {
          e.preventDefault();
          
          $('#change-password-error').html('')
                                     .addClass('hidden');
          
          adarda.changePassword({
            form: '#change-password-form', 
            callback: {
              success: function(response) {
                $('#change-password-form input').val('');
                
                window.scrollTo(0, 0);
                $elem.find('.cons-profile__success').removeClass('hidden');
                
                $('#change-password-modal').modal('hide');
              }, 
              error: function(response) {
                if($.inArray(response.errorResponse.code, ['3', '5', '14']) > -1) {
                  window.location = luminateExtend.global.path.secure + 
                                    'UserLogin?NEXTURL=' + encodeURIComponent(window.location.href);
                }
                else {
                  $('#change-password-error').html(response.errorResponse.message)
                                             .removeClass('hidden');
                }
              }
            }
          });
        });
      }
      
      adarda.listUserFields({
        callback: {
          success: function(response) {
            var profileFields = luminateExtend.utils.ensureArray(response.listConsFieldsResponse.field);
            $.each(profileFields, function() {
              var fieldGroup = this.group.replace(/ /g, '-').toLowerCase(), 
              fieldSubGroup = (this.subGroup ? this.subGroup.replace(/ /g, '-').toLowerCase() : undefined), 
              fieldType = this.valueType.toLowerCase(), 
              fieldLabel = this.label, 
              fieldName = this.name, 
              fieldId = fieldName.replace(/\./g, '-').replace(/\_/g, '-'), 
              fieldIsUserModifiable = this.isUserModifiable, 
              fieldIsRequired = (this.required != 'true' ? false : true), 
              fieldMaxChars = this.maxChars, 
              fieldChoices = this.choices;
              
              /* use a special group for username */
              if(fieldId === 'user-name') {
                fieldGroup = 'login';
              }
              
              if(fieldGroup === 'address') {
                fieldGroup = fieldSubGroup;
              }
              
              /* if a field has choices, ensure its type is "enumeration" */
              if(fieldChoices && fieldChoices.choice && fieldType != 'date') {
                fieldType = 'enumeration';
                
                var fieldAnswers = luminateExtend.utils.ensureArray(fieldChoices.choice);
                fieldChoices = [];
                $.each(fieldAnswers, function(i, key) {
                  if(fieldId != 'email-preferred-format' || key.toLowerCase() != 'undefined') {
                    fieldChoices.push({
                      value: key, 
                      label: key
                    });
                  }
                });
              }
              
              /* add the field to the appropriate panel */
              var fieldsToExclude = ['reminder-hint'];
              if($.inArray(fieldId, fieldsToExclude) === -1) {
                $('.js--cons-profile-' + fieldGroup).removeClass('hidden')
                                                    .find('.panel-body')
                                                    .append('<div class="form-group" id="cons-profile-' + fieldId + '-wrap">' + 
                                                              buildFormField({
                                                                type: fieldType, 
                                                                label: fieldLabel + (fieldType === 'boolean' ? '' : ':'), 
                                                                name: fieldName, 
                                                                id: 'cons-profile-' + fieldId, 
                                                                required: fieldIsRequired, 
                                                                maxChars: fieldMaxChars, 
                                                                choices: fieldChoices
                                                              }) + 
                                                            '</div>');
              }
            });
            
            /* add change password link below username */
            $('#cons-profile-user-name-wrap').after('<div class="form-group">' + 
                                                      '<div class="col-md-offset-2 col-md-10">' + 
                                                        '<a href="#change-password-modal" data-toggle="modal">Change password</a>' + 
                                                      '</div>' + 
                                                    '</div>');
            
            /* pre-fill field values */
            adarda.getUser({
              callback: {
                success: function(response) {
                  $.each(response.getConsResponse, function(key, value) {
                    var fieldName = key.replace(/\./g, '-').replace(/\_/g, '-'), 
                    fieldValue = value;
                    
                    /* convert gender to title case */
                    if(fieldName === 'gender' && fieldValue) {
                      fieldValue = fieldValue.charAt(0).toUpperCase() + fieldValue.substr(1).toLowerCase();
                    }
                    
                    if($.type(value) === 'object') {
                      $.each(value, function(key2, value2) {
                        var fieldName2 = fieldName + '-' + key2.replace(/\./g, '-').replace(/\_/g, '-'), 
                        $field2 = $elem.find('#cons-profile-' + fieldName2);
                        if($field2.is('input[type="checkbox"]')) {
                          if(value2 == 'true') {
                            $field2.click();
                          }
                        }
                        else {
                          $field2.val(value2);
                        }
                      });
                    }
                    else {
                      var $field = $elem.find('#cons-profile-' + fieldName);
                      if($field.is('input[type="checkbox"]')) {
                        if(fieldValue == 'true') {
                          $field.click();
                        }
                      }
                      else {
                        $field.val(fieldValue);
                      }
                    }
                  });
                }, 
                error: function(response) {
                  if($.inArray(response.errorResponse.code, ['3', '5', '14']) > -1) {
                    window.location = luminateExtend.global.path.secure + 
                                      'UserLogin?NEXTURL=' + encodeURIComponent(window.location.href);
                  }
                }
              }
            });
            
            $elem.data('consloaded', 1);
            showProfile();
          }
        }
      });
      
      if(teamraiserSettings.eventType) {
        /* add edit team modal */
        if($('#edit-team-modal').length === 0) {
          $('body').append('<div class="modal fade" id="edit-team-modal">' + 
                             '<div class="modal-dialog">' + 
                               '<div class="modal-content">' + 
                                 '<form class="form-horizontal" id="edit-team-form">' + 
                                   '<div class="modal-header">' + 
                                     '<h4 class="modal-title">Update Team Information</h4>' + 
                                   '</div>' + 
                                   '<div class="modal-body">' + 
                                     '<div class="row">' + 
                                       '<div class="col-xs-12">' + 
                                         '<div class="alert alert-danger hidden" id="edit-team-error"></div>' + 
                                       '</div>' + 
                                     '</div>' + 
                                     '<div class="form-group">' + 
                                       '<label for="edit-team-name" class="col-lg-3 control-label">' + 
                                         'Team Name:' + 
                                       '</label>' + 
                                       '<div class="col-lg-9">' + 
                                         '<input type="text" name="team_name" class="form-control" id="edit-team-name">' + 
                                       '</div>' + 
                                     '</div>' + 
                                     '<div class="form-group">' + 
                                       '<label for="edit-team-division" class="col-lg-3 control-label">' + 
                                         'Team Type:' + 
                                       '</label>' + 
                                       '<div class="col-lg-9">' + 
                                         '<select name="division_name" class="form-control" id="edit-team-division">' + 
                                           '<option value=""></option>' + 
                                         '</select>' + 
                                       '</div>' + 
                                     '</div>' + 
                                     '<div class="form-group">' + 
                                       '<label for="edit-team-company" class="col-lg-3 control-label">' + 
                                         'Team Company:' + 
                                       '</label>' + 
                                       '<div class="col-lg-9">' + 
                                         '<select name="company_id" class="form-control" id="edit-team-company">' + 
                                           '<option></option>' + 
                                           '<optgroup class="js--edit-team-company-national" label="National Teams"></optgroup>' + 
                                           '<optgroup class="js--edit-team-company-local" label="Local Companies"></optgroup>' + 
                                         '</select>' + 
                                       '</div>' + 
                                     '</div>' + 
                                   '</div>' + 
                                   '<div class="modal-footer clearfix">' + 
                                     '<button type="submit" class="button pull-left">' + 
                                       'Save' + 
                                     '</button>' + 
                                     '<button type="button" class="button button-outline pull-right" data-dismiss="modal">' + 
                                       'Cancel' + 
                                     '</button>' + 
                                   '</div>' + 
                                 '</form>' + 
                               '</div>' + 
                             '</div>' + 
                           '</div>');
          
          $('#edit-team-modal').on('show.bs.modal', function() {
            var frId = $('.js--cons-profile-tr-team-fr_id').val(), 
            $teamNameWrap = $('#cons-profile-tr-team-name-' + frId + '-wrap'), 
            teamDivision = $teamNameWrap.data('teamdivision'), 
            teamCompanyId = $teamNameWrap.data('teamcompanyid');
            
            $('#edit-team-name').val($('#cons-profile-tr-team-name-' + frId).text());
            
            $('#edit-team-division option[value!=""]').remove();
            
            adarda.getTeamDivisions({
              frId: frId, 
              callback: {
                success: function(response) {
                  var teamDivisions = response.getTeamDivisionsResponse.divisionName;
                  $.each(teamDivisions, function(i, key) {
                    $('#edit-team-division').append('<option value="' + key + 
                                                    '">' + 
                                                      key + 
                                                    '</option>');
                  });
                  if(teamDivision) {
                    $('#edit-team-division').val(teamDivision);
                  }
                }
              }
            });
            
            $('#edit-team-company optgroup').addClass('hidden');
            $('#edit-team-company optgroup option').remove();
            
            adarda.getCompanyList({
              frId: frId, 
              callback: {
                success: function(response) {
                  var nationalTeams = [], 
                  localCompanies = [];
                  
                  if(response.getCompanyListResponse.nationalItem) {
                    nationalTeams = luminateExtend.utils.ensureArray(response.getCompanyListResponse.nationalItem);
                  }
                  if(response.getCompanyListResponse.companyItem) {
                    localCompanies = luminateExtend.utils.ensureArray(response.getCompanyListResponse.companyItem);
                  }
                  
                  if(nationalTeams.length > 0) {
                    $('.js--edit-team-company-national').removeClass('hidden');
                    $.each(nationalTeams, function() {
                      $('.js--edit-team-company-national').append('<option value="' + this.companyId + '">' + 
                                                                    this.companyName + 
                                                                  '</option>');
                    });
                  }
                  if(localCompanies.length > 0) {
                    $('.js--edit-team-company-local').removeClass('hidden');
                    $.each(localCompanies, function() {
                      $('.js--edit-team-company-local').append('<option value="' + this.companyId + '">' + 
                                                                 this.companyName + 
                                                               '</option>');
                    });
                  }
                  
                  if(teamCompanyId) {
                    $('#edit-team-company').val(teamCompanyId);
                  }
                }
              }
            });
          });
          
          $('#edit-team-form').submit(function(e) {
            e.preventDefault();
            
            var frId = $('.js--cons-profile-tr-team-fr_id').val(), 
            $teamNameWrap = $('#cons-profile-tr-team-name-' + frId + '-wrap');
            
            adarda.updateTeamInformation({
              frId: frId, 
              form: '#edit-team-form', 
              callback: {
                success: function(response) {
                  $elem.find('.cons-profile__success').removeClass('hidden');
                  
                  $('#cons-profile-tr-team-name-' + frId).html($('#edit-team-name').val());
                  $teamNameWrap.data('teamdivision', $('#edit-team-division').val())
                               .data('teamcompanyid', $('#edit-team-company').val());
                  
                  $('#edit-team-modal').modal('hide');
                }, 
                error: function(response) {
                  if($.inArray(response.errorResponse.code, ['3', '5', '14', '2604']) > -1) {
                    window.location = luminateExtend.global.path.secure + 
                                      'UserLogin?NEXTURL=' + encodeURIComponent(window.location.href);
                  }
                  else {
                    $('#edit-team-error').html(response.errorResponse.message)
                                         .removeClass('hidden');
                  }
                }
              }
            });
          });
        }
        
        /* add join a new team modal */
        if($('#join-new-team-modal').length === 0) {
          $('body').append('<div class="modal fade" id="join-new-team-modal">' + 
                             '<div class="modal-dialog">' + 
                               '<div class="modal-content">' + 
                                 '<form class="form-horizontal" id="join-new-team-form">' + 
                                   '<div class="modal-header">' + 
                                     '<h4 class="modal-title">Join a Team</h4>' + 
                                   '</div>' + 
                                   '<div class="modal-body">' + 
                                     '<div class="row">' + 
                                       '<div class="col-xs-12">' + 
                                         '<div class="alert alert-danger hidden" id="join-new-team-error"></div>' + 
                                       '</div>' + 
                                     '</div>' + 
                                     '<div class="form-group">' + 
                                       '<div class="col-xs-12">' + 
                                         '<input type="text" class="form-control pull-left" id="fr_team_name" placeholder="Team Name">' + 
                                         '<button type="submit" class="button button--addon">Search</button>' + 
                                       '</div>' + 
                                       '<div class="clearfix"></div>' + 
                                     '</div>' + 
                                     '<div class="row hidden" id="join-new-team-results-wrap">' + 
                                       '<div class="col-xs-12">' + 
                                         '<div class="table-responsive">' + 
                                           '<table class="table table-striped">' + 
                                             '<thead>' + 
                                               '<tr>' + 
                                                 '<th>Team Name</th>' + 
                                                 '<th>Team Captain</th>' + 
                                                 '<th>Company</th>' + 
                                                 '<th></th>' + 
                                               '</tr>' + 
                                             '</thead>' + 
                                             '<tbody>' + 
                                               '<tr class="table--no-results-row hidden">' + 
                                                 '<td colspan="4" class="table--no-results">' + 
                                                   'No teams found.' + 
                                                 '</td>' + 
                                               '</tr>' + 
                                               '<tr class="table--loading-row">' + 
                                                 '<td colspan="4" class="table--loading">' + 
                                                   'Loading ...' + 
                                                 '</td>' + 
                                               '</tr>' + 
                                             '</tbody>' + 
                                           '</table>' + 
                                         '</div>' + 
                                       '</div>' + 
                                     '</div>' + 
                                   '</div>' + 
                                   '<div class="modal-footer clearfix">' + 
                                     '<button type="button" class="button button-outline pull-right" data-dismiss="modal">' + 
                                       'Cancel' + 
                                     '</button>' + 
                                   '</div>' + 
                                 '</form>' + 
                               '</div>' + 
                             '</div>' + 
                           '</div>');
          
          $('#join-new-team-form').submit(function(e) {
            e.preventDefault();
            
            var frId = $('.js--cons-profile-tr-team-fr_id').val();
            
            $('#join-new-team-results-wrap, #join-new-team-results-wrap .table--loading-row').removeClass('hidden');
            $('#join-new-team-results-wrap .table--no-results-row').addClass('hidden');
            $('#join-new-team-results-wrap .table--row').remove();
            
            adarda.getTeams({
              frId: frId, 
              teamName: $('#fr_team_name').val(), 
              size: '4', 
              callback: {
                success: function(response) {
                  $('#join-new-team-results-wrap .table--loading-row').addClass('hidden');
                  
                  var teams = luminateExtend.utils.ensureArray(response.getTeamSearchByInfoResponse.team);
                  
                  $.each(teams, function() {
                    var teamId = this.id, 
                    teamName = this.name, 
                    captainName = '', 
                    teamCompany = this.companyName || '';
                    
                    if(this.captainFirstName) {
                      captainName = this.captainFirstName + 
                                    (this.captainLastName ? (' ' + this.captainLastName) : '');
                    }
                    
                    $('#join-new-team-results-wrap tbody').append('<tr class="table--row">' + 
                                                                    '<td>' + 
                                                                      teamName + 
                                                                    '</td>' + 
                                                                    '<td>' + 
                                                                      captainName + 
                                                                    '</td>' + 
                                                                    '<td>' + 
                                                                      teamCompany + 
                                                                    '</td>' + 
                                                                    '<td>' + 
                                                                      '<a class="js--update-team-id" href="#" data-teamid="' + teamId + '" data-teamname="' + teamName + '">' + 
                                                                        'Join' + 
                                                                      '</a>' + 
                                                                    '</td>' + 
                                                                  '</tr>');
                  });
                  
                  if($('#join-new-team-results-wrap .table--row').length === 0) {
                    $('#join-new-team-results-wrap .table--no-results-row').removeClass('hidden');
                  }
                }, 
                error: function(response) {
                  $('#join-new-team-results-wrap .table--loading-row').addClass('hidden');
                  $('#join-new-team-results-wrap .table--no-results-row').removeClass('hidden');
                }
              }
            });
          });
          
          $('#join-new-team-results-wrap').on('click', '.js--update-team-id', function(e) {
            e.preventDefault();
            
            $('#join-new-team-error').html('')
                                     .addClass('hidden');
            
            var frId = $('.js--cons-profile-tr-team-fr_id').val(), 
            $teamNameWrap = $('#cons-profile-tr-team-name-' + frId + '-wrap'), 
            currentTeamId = $teamNameWrap.data('teamid'), 
            newTeamId = $(this).data('teamid'), 
            teamName = $(this).data('teamname'), 
            leaveCurrentTeam = function() {
              adarda.leaveTeam({
                frId: frId, 
                callback: {
                  success: function(response) {
                    joinNewTeam();
                  }, 
                  error: function(response) {
                    if($.inArray(response.errorResponse.code, ['3', '5', '14', '2604']) > -1) {
                      window.location = luminateExtend.global.path.secure + 
                                        'UserLogin?NEXTURL=' + encodeURIComponent(window.location.href);
                    }
                    else {
                      $('#join-new-team-error').html(response.errorResponse.message)
                                               .removeClass('hidden');
                    }
                  }
                }
              });
            }, 
            joinNewTeam = function() {
              adarda.joinTeam({
                frId: frId, 
                teamId: newTeamId, 
                callback: {
                  success: function(response) {
                    $elem.find('.cons-profile__success').removeClass('hidden');
                    
                    $('#cons-profile-tr-team-name-' + frId).html(teamName);
                    $teamNameWrap.data('teamid', newTeamId)
                                 .find('.js--cons-profile-tr-team-action').html('<a href="#join-new-team-modal" data-toggle="modal">Join a different team</a> or ' + 
                                                                                '<a href="#leave-team-modal" data-toggle="modal">participate as an individual</a>');
                    
                    $('#join-new-team-modal').modal('hide');
                  }, 
                  error: function(response) {
                    if($.inArray(response.errorResponse.code, ['3', '5', '14', '2604']) > -1) {
                      window.location = luminateExtend.global.path.secure + 
                                        'UserLogin?NEXTURL=' + encodeURIComponent(window.location.href);
                    }
                    else {
                      $('#join-new-team-error').html(response.errorResponse.message)
                                               .removeClass('hidden');
                    }
                  }
                }
              });
            };
            
            if(currentTeamId && currentTeamId != '') {
              leaveCurrentTeam();
            }
            else {
              joinNewTeam();
            }
          });
        }
        
        /* add leave team modal */
        if($('#leave-team-modal').length === 0) {
          $('body').append('<div class="modal fade" id="leave-team-modal">' + 
                             '<div class="modal-dialog">' + 
                               '<div class="modal-content">' + 
                                 '<form class="form-horizontal" id="leave-team-form">' + 
                                   '<div class="modal-header">' + 
                                     '<h4 class="modal-title">Leave Team</h4>' + 
                                   '</div>' + 
                                   '<div class="modal-body">' + 
                                     '<div class="row">' + 
                                       '<div class="col-xs-12">' + 
                                         '<div class="alert alert-danger hidden" id="leave-team-error"></div>' + 
                                       '</div>' + 
                                     '</div>' + 
                                     'Are you sure you wish to leave your current team?' + 
                                   '</div>' + 
                                   '<div class="modal-footer">' + 
                                     '<button type="submit" class="button pull-left">' + 
                                       'Confirm' + 
                                     '</button>' + 
                                     '<button type="button" class="button button-outline pull-right" data-dismiss="modal">' + 
                                       'Cancel' + 
                                     '</button>' + 
                                   '</div>' + 
                                 '</form>' + 
                               '</div>' + 
                             '</div>' + 
                           '</div>');
          
          $('#leave-team-form').submit(function(e) {
            e.preventDefault();
            
            $('#leave-team-error').html('')
                                  .addClass('hidden');
            
            var frId = $('.js--cons-profile-tr-team-fr_id').val(), 
            $teamNameWrap = $('#cons-profile-tr-team-name-' + frId + '-wrap');
            
            adarda.leaveTeam({
              frId: frId, 
              callback: {
                success: function(response) {
                  $elem.find('.cons-profile__success').removeClass('hidden');
                  
                  $('#cons-profile-tr-team-name-' + frId).html('You are not currently a member of a team');
                  $teamNameWrap.removeData('teamid')
                               .find('.js--cons-profile-tr-team-action').html('<a href="#join-new-team-modal" data-toggle="modal">Join a team</a>');
                  
                  $('#leave-team-modal').modal('hide');
                }, 
                error: function(response) {
                  if($.inArray(response.errorResponse.code, ['3', '5', '14', '2604']) > -1) {
                    window.location = luminateExtend.global.path.secure + 
                                      'UserLogin?NEXTURL=' + encodeURIComponent(window.location.href);
                  }
                  else {
                    $('#leave-team-error').html(response.errorResponse.message)
                                          .removeClass('hidden');
                  }
                }
              }
            });
          });
        }
        
        adarda.getRegisteredTeamraisers({
          eventType: teamraiserSettings.eventType, 
          callback: {
            success: function(response) {
              var teamraisers = luminateExtend.utils.ensureArray(response.getRegisteredTeamraisersResponse.teamraiser), 
              consId = response.getRegisteredTeamraisersResponse.consId;
              
              if(consId) {
                $elem.data('consid', consId);
              }
              
              if(teamraisers.length > 0) {
                if(teamraisers.length > 1) {
                  teamraisers = $(teamraisers).sort(function(a, b) {
                    var eventDateA = a.event_date.replace('-', '').split('T')[0], 
                    eventDateB = b.event_date.replace('-', '').split('T')[0];
                    if(eventDateA == eventDateB) {
                      return 0;
                    }
                    return eventDateA > eventDateB ? 1 : -1;
                  });
                }
                
                $.each(teamraisers, function() {
                  if(this.accepting_registrations == 'true' || this.accepting_donations == 'true') {
                    var frId = this.id, 
                    eventDate = this.event_date, 
                    eventCity = this.city, 
                    eventName = this.name, 
                    teamPageUrl = this.teamPageUrl, 
                    teamName = this.teamName;
                    
                    if(eventCity) {
                      eventName = eventCity + ' ' + luminateExtend.utils.simpleDateFormat(eventDate, 'yyyy');
                    }
                    
                    $('.js--cons-profile-fr_id').append('<option value="' + frId + '">' + 
                                                          eventName + 
                                                        '</option>');
                    
                    $('.js--cons-profile-tr-team-names').append('<div class="js--cons-profile-tr-team-name-wrap hidden" id="cons-profile-tr-team-name-' + frId + '-wrap">' + 
                                                                  '<div class="form-group">' + 
                                                                    '<label class="col-md-2 control-label">My Team:</label>' + 
                                                                    '<div class="col-md-10">' + 
                                                                      '<p class="form-control-static" id="cons-profile-tr-team-name-' + frId + '">' + 
                                                                        (teamName ? teamName : 'You are not currently a member of a team') + 
                                                                      '</p>' + 
                                                                    '</div>' + 
                                                                  '</div>' + 
                                                                '</div>');
                    
                    if(teamPageUrl) {
                      $('#cons-profile-tr-team-name-' + frId + '-wrap').data('teamid', teamPageUrl.split('team_id=')[1].split('&')[0]);
                    }
                  }
                });
                
                $('.js--cons-profile-fr_id').each(function() {
                  var $teamraiserDropdown = $(this), 
                  $teamraiserPanel = $teamraiserDropdown.closest('.panel'), 
                  $teamraiserDropdownFormGroup = $teamraiserDropdown.closest('.form-group'), 
                  $teamraiserOptions = $teamraiserDropdown.find('option');
                  
                  if($teamraiserOptions.length > 0) {
                    $teamraiserPanel.removeClass('hidden');
                    $teamraiserDropdown.val($teamraiserOptions.eq(0).val()).change();
                    
                    if($teamraiserOptions.length === 1) {
                      $teamraiserDropdownFormGroup.find('.js--cons-profile-tr-single').removeClass('hidden');
                      $teamraiserDropdownFormGroup.find('.js--cons-profile-tr-single .form-control-static').html($teamraiserOptions.html());
                    }
                    else {
                      $teamraiserDropdownFormGroup.find('.js--cons-profile-tr-multiple').removeClass('hidden');
                    }
                  }
                });
              }
              
              $elem.data('trloaded', 1);
              showProfile();
            }, 
            error: function(response) {
              if($.inArray(response.errorResponse.code, ['3', '5', '14', '2604']) > -1) {
                window.location = luminateExtend.global.path.secure + 
                                  'UserLogin?NEXTURL=' + encodeURIComponent(window.location.href);
              }
              else {
                $elem.data('trloaded', 1);
                showProfile();
              }
            }
          }
        });
        
        $elem.find('.js--cons-profile-tr-team-fr_id').change(function() {
          var frId = $(this).val(), 
          $teamNameWrap = $('#cons-profile-tr-team-name-' + frId + '-wrap'), 
          teamId = $teamNameWrap.data('teamid');
          
          $('.js--cons-profile-tr-team-name-wrap').addClass('hidden');
          if($.inArray($teamNameWrap.data('iscaptain'), [0, 1]) > -1) {
            $teamNameWrap.removeClass('hidden');
          }
          else if(!teamId || teamId === '') {
            $teamNameWrap.data('iscaptain', 0)
                         .removeClass('hidden')
                         .append('<div class="form-group">' + 
                                   '<div class="col-md-offset-2 col-md-10">' + 
                                     '<p class="js--cons-profile-tr-team-action">' + 
                                       '<a href="#join-new-team-modal" data-toggle="modal">Join a team</a>' + 
                                     '</p>' + 
                                   '</div>' + 
                                 '</div>');
          }
          else {
            adarda.getTeams({
              frId: frId, 
              teamId: teamId, 
              size: '1', 
              callback: {
                success: function(response) {
                  var teams = luminateExtend.utils.ensureArray(response.getTeamSearchByInfoResponse.team), 
                  consId = $elem.data('consid'), 
                  isCaptain = 0;
                  
                  if(consId && consId != '' && teams.length === 1) {
                    var teamDivision = teams[0].divisionName, 
                    teamCompanyId = teams[0].companyId;
                    
                    if(consId === teams[0].captainConsId) {
                      isCaptain = 1;
                      
                      $teamNameWrap.data('teamdivision', teamDivision)
                                   .data('teamcompanyid', teamCompanyId)
                                   .append('<div class="form-group">' + 
                                             '<div class="col-md-offset-2 col-md-10">' + 
                                               '<p class="js--cons-profile-tr-team-action">' + 
                                                 '<a href="#edit-team-modal" data-toggle="modal">Update team information</a>' + 
                                               '</p>' + 
                                             '</div>' + 
                                           '</div>');
                    }
                    else {
                      $teamNameWrap.append('<div class="form-group">' + 
                                             '<div class="col-md-offset-2 col-md-10">' + 
                                               '<p class="js--cons-profile-tr-team-action">' + 
                                                 '<a href="#join-new-team-modal" data-toggle="modal">Join a different team</a> or ' + 
                                                 '<a href="#leave-team-modal" data-toggle="modal">participate as an individual</a>' + 
                                               '</p>' + 
                                             '</div>' + 
                                           '</div>');
                    }
                  }
                  
                  $teamNameWrap.data('iscaptain', isCaptain).removeClass('hidden');
                }, 
                error: function(response) {
                  $teamNameWrap.data('iscaptain', 0).removeClass('hidden');
                }
              }
            })
          }
          
          $('#join-new-team-results-wrap').addClass('hidden');
          $('#fr_team_name').val('');
          $('#join-new-team-results-wrap .table--row').remove();
        });
        
        $elem.find('.js--cons-profile-tr-reg-fr_id').change(function() {
          var frId = $(this).val();
          
          $('.js--cons-profile-tr-reg-survey').addClass('hidden');
          
          if($('#cons-profile-tr-reg-survey-' + frId).length > 0) {
            $('#cons-profile-tr-reg-survey-' + frId).removeClass('hidden');
          }
          else {
            $('.js--cons-profile-tr-reg-surveys').append('<div class="js--cons-profile-tr-reg-survey hidden" id="cons-profile-tr-reg-survey-' + frId + '"></div>');
            
            adarda.getSurveyResponses({
              frId: frId, 
              callback: {
                success: function(response) {
                  var surveyResponses = luminateExtend.utils.ensureArray(response.getSurveyResponsesResponse.responses);
                  
                  $.each(surveyResponses, function() {
                    var fieldType = this.questionType.toLowerCase(), 
                    fieldLabel = this.questionText, 
                    fieldName = 'question_' + this.questionId, 
                    fieldId = fieldName.replace(/\_/g, '-'), 
                    fieldSurveyKey = this.key.toLowerCase(), 
                    fieldIsUserModifiable = (this.isHidden != 'true' ? true : false), 
                    fieldIsRequired = (this.questionRequired != 'true' ? false : true), 
                    fieldMaxChars, 
                    fieldAnswers = this.questionAnswer, 
                    fieldChoices, 
                    fieldValue = this.responseValue;
                    
                    if(typeof fieldValue != 'string' || fieldValue === 'User Provided No Response') {
                      fieldValue = undefined;
                    }
                    
                    if(fieldIsUserModifiable) {
                      if(teamraiserSettings.surveyExcludes && $.inArray(fieldSurveyKey, teamraiserSettings.surveyExcludes) > -1) {
                        fieldType = 'hidden';
                      }
                      
                      else if(fieldType === 'shorttextvalue') {
                        fieldMaxChars = '40';
                      }
                      
                      else if($.inArray(fieldType, ['multimulti', 'categories']) > -1) {
                        fieldType = 'multimulti';
                        fieldChoices = luminateExtend.utils.ensureArray(fieldAnswers);
                      }
                      
                      else if(fieldType === 'multisingleradio') {
                        fieldType = 'radio';
                        fieldChoices = luminateExtend.utils.ensureArray(fieldAnswers);
                      }
                      
                      else if(fieldAnswers) {
                        fieldType = 'enumeration';
                        fieldAnswers = luminateExtend.utils.ensureArray(fieldAnswers);
                        if(fieldAnswers.length > 0) {
                          fieldChoices = [];
                          
                          $.each(fieldAnswers, function() {
                            fieldChoices.push(this);
                          });
                        }
                      }
                      
                      if($('#tr-reg-' + fieldId + '-wrap').length === 0) {
                        $('#cons-profile-tr-reg-survey-' + frId).append('<div class="form-group' + (fieldType === 'hidden' ? ' hidden' : '') + 
                                                                        '" id="tr-reg-' + fieldId + '-wrap">' + 
                                                                          buildFormField({
                                                                            type: fieldType, 
                                                                            label: fieldLabel, 
                                                                            name: fieldName, 
                                                                            id: fieldId, 
                                                                            required: fieldIsRequired, 
                                                                            maxChars: fieldMaxChars, 
                                                                            choices: fieldChoices, 
                                                                            value: fieldValue
                                                                          }) + 
                                                                        '</div>');
                      }
                      
                      if($.inArray(fieldType, ['boolean', 'multimulti', 'radio']) > -1 && fieldValue) {
                        var $inputByValue = $('input[name="' + fieldName + '"][value="' + fieldValue + '"]');
                        if($inputByValue.length > 0) {
                          $('input[name="' + fieldName + '"][value="' + fieldValue + '"]').click();
                        }
                        else {
                          $('input[name="' + fieldName + '"][data-label="' + fieldValue + '"]').click();
                        }
                      }
                    }
                  });
                  
                  $('#cons-profile-tr-reg-survey-' + frId).removeClass('hidden');
                }, 
                error: function(response) {
                  if($.inArray(response.errorResponse.code, ['3', '5', '14', '2604']) > -1) {
                    window.location = luminateExtend.global.path.secure + 
                                      'UserLogin?NEXTURL=' + encodeURIComponent(window.location.href);
                  }
                }
              }
            });
          }
        });
      }
      
      $elem.submit(function(e) {
        e.preventDefault();
        
        $elem.find('.cons-profile__success').addClass('hidden');
        
        var showProfileSuccess = function() {
          if($elem.data('conssuccess') && $elem.data('conssuccess') === 1 && 
           $elem.data('trsuccess') && $elem.data('trsuccess') === 1) {
            window.scrollTo(0, 0);
            $elem.find('.cons-profile__success').removeClass('hidden');
          }
        };
        
        adarda.updateUser({
          data: $elem.find('input, select, textarea').not('[name^="question_"]').serialize(), 
          callback: {
            success: function(response) {
              $elem.data('conssuccess', 1);
              showProfileSuccess();
            }, 
            error: function(response) {
              if($.inArray(response.errorResponse.code, ['3', '5', '14']) > -1) {
                window.location = luminateExtend.global.path.secure + 
                                  'UserLogin?NEXTURL=' + encodeURIComponent(window.location.href);
              }
              else {
                /* TODO: updateUser error */
              }
            }
          }
        });
        
        if(!teamraiserSettings.eventType || $elem.find('input, select, textarea').filter('[name^="question_"]').length === 0) {
          $elem.data('trsuccess', 1);
          showProfileSuccess();
        }
        else {
          adarda.updateSurveyResponses({
            frId: $('.js--cons-profile-tr-reg-fr_id').val(), 
            data: $elem.find('input, select, textarea').filter('[name^="question_"]').serialize(), 
            callback: {
              success: function(response) {
                if(response.updateSurveyResponsesResponse.success == 'false') {
                  /* TODO: updateSurveyResponses error */
                }
                else {
                  $elem.data('trsuccess', 1);
                  showProfileSuccess();
                }
              }, 
              error: function(response) {
                if($.inArray(response.errorResponse.code, ['3', '5', '14']) > -1) {
                  window.location = luminateExtend.global.path.secure + 
                                    'UserLogin?NEXTURL=' + encodeURIComponent(window.location.href);
                }
                else {
                  /* TODO: updateSurveyResponses error */
                }
              }
            }
          });
        }
      });
    });
  };
  
  (function() {
    $('.js--login__form').submit(function(e) {
      e.preventDefault();
      
      $('.login__success, .login__error').html('').addClass('hidden');
      $('.js--login__form .has-error').removeClass('has-error');
      
      var $loginUsername = $('#login__user-name'), 
      $loginPassword = $('#login__password');
      
      if($loginUsername.val() === '') {
        var errorMessage = 'Username is required.';
        $loginUsername.addClass('has-error');
        if($loginPassword.val() === '') {
          errorMessage = 'Username and password are required.';
          $loginPassword.addClass('has-error');
        }
        $('.login__error').html(errorMessage).removeClass('hidden');
      }
      else if($loginPassword.val() === '') {
        $('.login__error').html('Password is required.').removeClass('hidden');
        $loginPassword.addClass('has-error');
      }
      else {
        $('.login__submit').addClass('disabled');
        
        luminateExtend.api({
          api: 'cons', 
          form: '.js--login__form', 
          requestType: 'POST', 
          callback: {
            success: function() {
              window.location = $('.js--login__nexturl').val();
            }, 
            error: function(response) {
              $('.login__submit').removeClass('disabled');
              if(response.errorResponse.code === '202') {
                $('.login__error').html('Username or password is invalid.').removeClass('hidden');
              }
              else {
                $('.login__error').html(response.errorResponse.message).removeClass('hidden');
              }
            }
          }
        });
      }
    });
    
    $('#forgot_username_link').click(function(e) {
      e.preventDefault();
      $('#step_1').addClass('hidden');
      $('#forgot_username').removeClass('hidden');
    });
    $('#forgot_password_link').click(function(e) {
      e.preventDefault();
      $('#step_1').addClass('hidden');
      $('#forgot_password').removeClass('hidden');
    });
    $('.back_button').click(function(e) {
      e.preventDefault();
      $('#step_1').removeClass('hidden');
      $('#forgot_password, #forgot_username').addClass('hidden');
    });
    
    $('.js--forgot-username-form').submit(function(e) {
      e.preventDefault();
      
      $('.login__success, .login__error, .login__forgot-username-error').html('').addClass('hidden');
      $('.js--forgot-username-form .has-error').removeClass('has-error');
      
      if($('#login__forgot-username-email').val() === '') {
        $('.login__forgot-username-error').html('Email is required.').removeClass('hidden');
        $('#login__forgot-username-email').addClass('has-error');
      }
      else {
        $('.login__forgot-username-submit').addClass('disabled');
        
        luminateExtend.api({
          api: 'cons', 
          form: '.js--forgot-username-form', 
          requestType: 'POST', 
          callback: {
            success: function(response) {
              $('.login__forgot-username-submit').removeClass('disabled');
              $('.login__success').html('User name and password emailed to ' + $('#login__forgot-username-email').val()).removeClass('hidden');
              $('#step_1').removeClass('hidden');
              $('#forgot_username').addClass('hidden');
            }, 
            error: function(response) {
              $('.login__forgot-username-error').html(response.errorResponse.message).removeClass('hidden');
              $('.login__forgot-username-submit').removeClass('disabled');
            }
          }
        });
      }
    });
    
    /* fallback for browsers that don't support SVG */
    if(!Modernizr.svg) {
      $('img[data-pngfb]').each(function() {
        $(this).attr('src', $(this).data('pngfb'));
      });
    }
  })();
  
  /* ********* */
  /* My Events */
  /* ********* */
  
  (function() {
    if($('.js--my-events').length > 0) {
      adarda.getRegisteredTeamraisers({
        eventType: $('.js--my-events').data('eventtype'), 
        callback: {
          success: function(response) {
            var teamraisers = luminateExtend.utils.ensureArray(response.getRegisteredTeamraisersResponse.teamraiser);
            
            /* sort teamraisers by date */
            teamraisers = $(teamraisers).sort(function(a, b) {
              var eventDateA = a.event_date.replace('-', '').split('T')[0], 
              eventDateB = b.event_date.replace('-', '').split('T')[0];
              if(eventDateA == eventDateB) {
                return 0;
              }
              return eventDateA > eventDateB ? 1 : -1;
            });
            
            $.each(teamraisers, function() {
              if(this.accepting_registrations == 'true' || this.accepting_donations == 'true') {
                $('.js--my-events').append('<div class="content__table--row hidden" data-frid="' + this.id + '">' + 
                                             '<div>' + 
                                               '<span>Event:</span> ' + 
                                               this.name + 
                                             '</div>' + 
                                             '<div class="table__column--bordered">' + 
                                               '<span>Date:</span> ' + 
                                               luminateExtend.utils.simpleDateFormat(this.event_date, 'MMM d, yyyy').replace('apr ', 'Apr ').replace('aug ', 'Aug ').replace('mar ', 'Mar ') + 
                                             '</div>' + 
                                             '<div class="table__column--bordered">' + 
                                               '<span>Venue:</span> ' + 
                                               (this.location_name ? this.location_name : '') + 
                                             '</div>' + 
                                             '<div class="table__column--bordered table__column--buttons">' + 
                                               '<a href="TRC?fr_id=' + this.id + '" class="button button-sm">Dashboard</a>' + 
                                             '</div>' + 
                                           '</div>');
              }
            });
            
            if($('.js--my-events .content__table--row').length === 0) {
               $('.js--my-events .content__table--loading-row').addClass('hidden');
              $('.js--my-events .content__table--no-results-row').removeClass('hidden');
            }
            else {
              $('.js--my-events .content__table--row').filter(':even').addClass('content__table--even');
              $('.js--my-events .content__table--row').filter(':odd').addClass('content__table--odd');
              
              if($('.js--my-events .content__table--row').length === 1) {
                window.location = luminateExtend.global.path.secure + 
                                  'TRC?fr_id=' + $('.js--my-events .content__table--row').eq(0).data('frid');
              }
              else {
                $('.js--my-events .content__table--loading-row').addClass('hidden');
                $('.js--my-events .content__table--row').removeClass('hidden');
              }
            }
          }, 
          error: function(response) {
            $('.js--my-events .content__table--loading-row').addClass('hidden');
            $('.js--my-events .content__table--no-results-row').removeClass('hidden');
          }
        }
      });
    }
  })();
  
  /* ************ */
  /* Edit Profile */
  /* ************ */
  
  $('.cons-profile__form').consProfile();
  
  /* ************* */
  /* Donation Form */
  /* ************* */
  
  (function() {
    if($('body').is('.app-9')) {
      /* use HTML5 input types and patterns */
      $('#donor_email_addressname').attr('type', 'email');
      $('#payment_typecc_numbername').attr('pattern', '[0-9]*').attr('title', 'Enter credit card number with no spaces or hyphens').blur(function() {
        $(this).val($(this).val().replace(/ /g, '').replace(/-/g, ''));
      });
      $('#payment_typecc_cvvname').attr('pattern', '[0-9]*').attr('title', 'Enter credit card verification code (3- or 4-digit number found on the back of your card)');
      
      /* bootstrapify form fields */
      $('input, select, textarea').not('[type="hidden"], [type="radio"], [type="checkbox"]').addClass('form-control');
      $('input[type="radio"], input[type="checkbox"]').not('.payment-type-selection-container input[type="radio"], .btn-group input[type="radio"]').each(function() {
        var $field = $(this), 
        $label = $('label[for="' + $field.attr('id') + '"]').prepend($field)
                                                            .wrap('<div class="' + $field.attr('type') + '" />');
      });
      
      /* format donation levels */
      $('.donation-level-label-input-container').remove();
      $('.donation-level-amount-container').each(function() {
        var $amount = $(this), 
        amountInCents = Number($amount.html().replace('$', '').replace(/,/g, '')) * 100;
        $amount.html(adarda.formatMoney(amountInCents));
      });
      
      /* default email opt out if Canada is selected */
      $('#donor_addr_country').change(function() {
        if($(this).val() === 'Canada' && $('#donor_email_opt_inname').is(':checked')) {
          $('#donor_email_opt_inname').click();
        };
      });
      
      /* ensure payment type fields are shown/hidden correctly */
      $('.payment-type-selections').on('click', '.payment-type-option', function(e) {
        switch ($(e.target).closest('.payment-type-option').find('[name="payment_typepay_typeradio"]').val()) {
          case 'check':
            hide_element('payment_cc_container');
            hide_element('payment_bank_container');
            show_element('payment_check_container');
            break;
          case 'credit':
            hide_element('payment_bank_container');
            hide_element('payment_check_container');
            show_element('payment_cc_container');
            break;
          case 'ach':
            hide_element('payment_cc_container');
            hide_element('payment_check_container');
            show_element('payment_bank_container');
            break;
          default:
            hide_element('payment_bank_container');
            hide_element('payment_cc_container');
            hide_element('payment_check_container');
            break;
        }
      });
      
      /* bootstrapify matching gift component */
      var $matchingGiftSearchRow = $('#donor_matching_employer_Row'), 
      $matchingGiftResultsRow = $('#donor_matching_employer_company_information'), 
      $matchingGiftMatchRow = $('#donor_matching_employer_match_information'), 
      $matchingGiftRadios = $matchingGiftResultsRow.find('input[name="donor_matching_employerradioGroup"]'), 
      $matchingGiftErrors = $matchingGiftSearchRow.find('.ErrorMessage');
      $matchingGiftSearchRow.find('.form-content').removeClass('form-content').addClass('form-group');
      if($matchingGiftRadios.length === 0 && 
         $matchingGiftErrors.length > 0) {
        $('.matching-gift-container.form-error').removeClass('form-error');
        $matchingGiftErrors.find('span:last-of-type').each(function() {
          var $errorMessage = $(this).closest('.ErrorMessage');
          
          $errorMessage.after('<p class="alert alert-danger">' + 
                                $(this).html() + 
                              '</p>');
          
          $errorMessage.remove();
        });
      }
      
      /* show a message if only matching gift result is "None of the above" */
      else if($matchingGiftRadios.length === 1) {
        $matchingGiftSearchRow.prepend('<div class="form-group">' + 
                                         '<p class="alert alert-danger">' + 
                                           'There was no information for your company\'s matching gift program in the database. ' + 
                                           'Please check with your Human Resources office regarding your employer\'s matching gifts program.' + 
                                         '</p>' + 
                                       '</div>');
        
        $matchingGiftResultsRow.addClass('hidden');
        $matchingGiftMatchRow.addClass('hidden');
      }
      
      /* automatically scroll down to the matching gift component after a donor submits their company name */
      if(window.location.href.indexOf('?') === -1 && 
         $('#ProcessForm .ErrorMessage').not('#donor_matching_employer_Row .ErrorMessage').length === 0 && 
         ($matchingGiftRadios.length > 0 || $matchingGiftErrors.length > 0)) {
        window.scrollTo($('.matching-gift-container').offset().left, $('.matching-gift-container').offset().top - 100);
      }
    }
  })();
  
  /* ****** */
  /* Survey */
  /* ****** */
  
  (function() {
    if($('body').is('.app-17, .app-22') || $('form[action*="Survey"]').length > 0) {
      $('form[action*="Survey"]').not('#pc-team-membership-view form').each(function () {
        if (console) { console.log('modify survey'); }
        var $surveyForm = $(this);
        
        /* keep hidden inputs */
        $surveyForm.find('input[type="hidden"]').each(function() {
          $surveyForm.prepend($(this));
        });
        if($surveyForm.find('#denySubmit').length > 0) {
          $surveyForm.prepend('<div class="hidden">' + 
                                $surveyForm.find('#denySubmit').closest('div').html() + 
                              '</div>');
        }
        
        /* turn .ObjTitle into an h1 */
        if($surveyForm.find('.ObjTitle').length > 0) {
          $surveyForm.before('<h1 class="text-center">' + 
                               $surveyForm.find('.ObjTitle').eq(0).html() + 
                             '</h1>');
        }
        
        /* error messages */
        $surveyForm.find('.ErrorMessage').each(function() {
          var $errorMessage = $(this), 
          errorMessage = $errorMessage.html();
          
          if($.trim(errorMessage) != '*') {
            $errorMessage.replaceWith('<div class="form-group">' + 
                                        '<div class="alert alert-danger">' + 
                                          errorMessage + 
                                        '</div>' + 
                                      '</div>');
          }
        });
        
        /* remove question numbering */
        $surveyForm.find('.num').remove();
        
        /* remove unnecessary classes */
        $surveyForm.find('.wrapable').removeClass('wrapable');
        $surveyForm.find('.legendWrapper').each(function() {
          $(this).replaceWith($(this).html());
        });
        
        /* remove unnecessary attributes */
        $surveyForm.find('*[size]').removeAttr('size');
        
        /* replace legends with labels */
        $surveyForm.find('legend').each(function() {
          $(this).replaceWith('<label class="form-group-label">' + 
                                $(this).html() + 
                              '</label>');
        });
        
        /* bootstrapify form fields */
        $surveyForm.find('input[type="text"], input[type="number"], input[type="password"], textarea, select').not('#denySubmit').each(function() {
          var $field = $(this).addClass('form-control').wrap('<div class="form-group" />'), 
          $label = $('label[for="' + $field.attr('id') + '"]');
          $field.before($label);
        });
        
        /* radio buttons and checkboxes */
        $surveyForm.find('input[type="radio"], input[type="checkbox"]').not('fieldset.combo input[type="radio"]').each(function() {
          var $field = $(this).removeClass('radio checkbox'), 
          $label = $('label[for="' + $field.attr('id') + '"]').prepend($field)
                                                              .wrap('<div class="' + $field.attr('type') + '" />');
        });
        
        /* combo boxes */
        $surveyForm.find('fieldset.combo').each(function() {
          var $fieldset = $(this), 
          $formGroupLabel = $fieldset.closest('td').find('.Explicit').eq(0), 
          $selectedRadio = $fieldset.find('input[type="radio"]:checked'), 
          radioName = $fieldset.find('input[type="radio"]').eq(0).attr('name'), 
          $select = $fieldset.find('select').addClass('js--survey-combo-dropdown'), 
          $input = $fieldset.find('input[type="text"]').removeAttr('onfocus')
                                                       .addClass('hidden js--survey-combo-input')
                                                       .attr('disabled', 'disabled');
          
          if($formGroupLabel.length > 0) {
            $fieldset.prepend($formGroupLabel.addClass('form-group-label'));
            $fieldset.find('.form-group-label').replaceWith('<label class="form-group-label">' + 
                                                              $formGroupLabel.html() + 
                                                            '</label>');
          }
          
          $fieldset.append('<input type="hidden" class="js--survey-combo-toggle" name="' + radioName + '" value="1">');
          
          $select.attr('data-dropdownname', $select.attr('name'))
                 .append('<option value="Other" data-togglecombo="other">Other</option>');
          $fieldset.append($select);
          
          $input.attr('placeholder', 'Other');
          if($input.val() === 'Other...') {
            $input.removeAttr('value');
          }
          $fieldset.append($input);
          
          if($selectedRadio.length > 0) {
            $fieldset.find('.js--survey-combo-toggle').val($selectedRadio.val());
            if($selectedRadio.val() === '2') {
              $select.val('Other').change();
            }
          }
          
          $fieldset.children().not('.form-group-label, select, input[type="hidden"], input[type="text"]').remove();
          
          $fieldset.find('select').wrap('<p />');
          
          $fieldset.replaceWith('<div class="form-group">' + 
                                  $fieldset.html() + 
                                '</div>');
        });
        $surveyForm.on('change', '.js--survey-combo-dropdown', function(e) {
          var $select = $(e.target).attr('name', $(e.target).data('dropdownname')), 
          $selectedOption = $select.find('option:selected'), 
          $comboToggleInput = $select.closest('.form-group').find('.js--survey-combo-toggle').val('1'), 
          $otherInput = $select.closest('.form-group').find('.js--survey-combo-input').addClass('hidden').attr('disabled', 'disabled');
          
          if($selectedOption.is('[data-togglecombo="other"]')) {
            $select.removeAttr('name');
            $comboToggleInput.val('2');
            $otherInput.removeClass('hidden').removeAttr('disabled').focus();
          }
        });
        
        /* CAPTCHA */
        $surveyForm.find('img[id^="captcha_img_"]').each(function() {
          var $captchaImage = $(this).wrap('<p />'), 
          captchaFieldId = $captchaImage.attr('id').replace('captcha_img_', ''), 
          $captchaPlayer = $('#captcha_player_' + captchaFieldId);
          
          $('#' + captchaFieldId).before($captchaPlayer)
                                 .before($captchaImage)
                                 .before('<p><a href="javascript:change_img_962_6509_16_25212();">Change image</a></p>');
        });
        
        /* keep password component explanatory text */
        var $passwordComponent = $surveyForm.find('#passwordComponent');
        if($passwordComponent.length > 0) {
          $passwordComponent.prev('p').wrap('<div class="form-group" />');
        }
        
        /* hide email format */
        $surveyForm.find('#cons_email_format').closest('.form-group').addClass('hidden');
        
        /* replace fieldsets with .form-group */
        $surveyForm.find('fieldset').each(function() {
          var $fieldset = $(this), 
          $formGroupLabel = $fieldset.find('.form-group-label'), 
          $radiosAndCheckboxes = $fieldset.find('.radio, .checkbox'), 
          $selects = $fieldset.find('select');
          
          if($formGroupLabel.length > 0) {
            $fieldset.prepend($formGroupLabel);
          }
          
          if($radiosAndCheckboxes.length > 0) {
            $radiosAndCheckboxes.each(function() {
              $fieldset.append($(this));
            });
            
            $fieldset.children().not('label, .radio, .checkbox').remove();
          }
          else if($selects.length > 0) {
            $formGroupLabel.find('.aural-only').removeClass('aural-only');
            
            $fieldset.append('<div class="row js--survey-date-row" />');
            
            $selects.each(function() {
              $fieldset.find('.js--survey-date-row').append($(this));
            });
            
            $fieldset.find('.js--survey-date-row select').wrap('<div class="col-xs-4" />');
            
            $fieldset.children().not('label, .js--survey-date-row').remove();
          }
          
          $fieldset.replaceWith('<div class="form-group">' + 
                                  $fieldset.html() + 
                                '</div>');
        });
        
        /* wrap checkboxes not in a fieldset in a .form-group */
        $surveyForm.find('.radio, .checkbox').not('.form-group .radio, .form-group .checkbox').each(function() {
          $(this).wrap('<div class="form-group" />');
        });
        
        /* mark fields as required */
        $surveyForm.find('#cons_email').closest('.old-school').find('p:contains("*")').each(function() {
          $(this).closest('tr').find('input, textarea, select').each(function() {
            var $field = $(this), 
            $label = $('label[for="' + $field.attr('id') + '"]');
            
            if($label.find('span:contains("Required")').length > 0) {
              if(!$label.is('.radio label, .checkbox label')) {
                $label.prepend('* ');
              }
              $field.attr('required', 'required');
            }
          });
        });
        $surveyForm.find('.req.true').each(function() {
          $(this).closest('tr').find('label').not('.radio label, .checkbox label').prepend('* ');
          $(this).closest('tr').find('input, textarea, select').not('.js--survey-combo-toggle, .js--survey-combo-dropdown, .js--survey-combo-input').attr('required', 'required');
        });
        
        /* HTML captions */
        $surveyForm.find('.old-school').each(function() {
          if($(this).find('input, textarea, select').length === 0) {
            $(this).find('td').eq(1).wrapInner('<div class="form-group" />');
          }
        });
        
        /* buttons */
        $surveyForm.append('<div class="form-group js--survey-buttons" />');
        $surveyForm.find('input[type="submit"], input[type="reset"]').each(function() {
          var $button = $(this);
          
          if($button.is('#ACTION_SUBMIT_SURVEY_RESPONSE')) {
            $button.addClass('button button-action');
          }
          else {
            $button.addClass('button button-grey');
          }
          
          $surveyForm.find('.js--survey-buttons').append($button, ' ');
        });
        
        /* remove default markup */
        $surveyForm.find('.form-group').each(function() {
          $surveyForm.append($(this));
        });
        $surveyForm.find('.appArea').remove();
      });
    }
  })();
  
  /* ********************** */
  /* TellAFriend and Ecards */
  /* ********************** */
  
  (function() {
    if($('body').is('.app-5') || $('body').is('.app-41')) {
      $('#InputForm').each(function () {
        var $tafForm = $(this);
        
        /* keep hidden inputs */
        $tafForm.find('input[type="hidden"]').each(function() {
          $tafForm.prepend($(this));
        });
        if($tafForm.find('#denySubmit').length > 0) {
          $tafForm.prepend('<div class="hidden">' + 
                             $tafForm.find('#denySubmit').closest('div').html() + 
                           '</div>');
        }
        
        /* turn .ObjTitle into an h1 */
        if($tafForm.find('.ObjTitle').length > 0) {
          $tafForm.before('<h1 class="text-center">' + 
                            $tafForm.find('.ObjTitle').eq(0).html() + 
                          '</h1>');
        }
        
        /* error messages */
        $tafForm.find('.ErrorMessage').each(function() {
          var $errorMessage = $(this);
          
          if($errorMessage.find('label').length > 0) {
            $errorMessage.after($errorMessage.find('label'));
          }
          
          var errorMessage = $errorMessage.html();
          
          if($.trim(errorMessage) != '*') {
            $errorMessage.replaceWith('<div class="form-group">' + 
                                        '<div class="alert alert-danger">' + 
                                          errorMessage + 
                                        '</div>' + 
                                      '</div>');
          }
        });
        
        /* remove unnecessary classes */
        $tafForm.find('.wrapable').removeClass('wrapable');
        
        /* bootstrapify form fields */
        $tafForm.find('input[type="text"], textarea').not('#denySubmit').each(function() {
          var $field = $(this).addClass('form-control').wrap('<div class="form-group" />'), 
          $label = $('label[for="' + $field.attr('id') + '"]');
          $field.before($label);
        });
        
        /* checkboxes */
        $tafForm.find('input[type="checkbox"]').each(function() {
          var $field = $(this), 
          $label = $('label[for="' + $field.attr('id') + '"]').prepend($field)
                                                              .wrap('<div class="' + $field.attr('type') + '" />');
        });
        
        /* keep Send To explanatory text */
        var $sendTo = $tafForm.find('#sendtoemail');
        $sendTo.after('<p class="help-block">' + 
                        $sendTo.closest('td').find('.Explicit, .Hint').eq(0).html() + 
                      '</p>');
        
        /* keep the message body if it is not editable */
        var $messageBodyCell = $tafForm.find('#subject').closest('tr').next('tr').find('td').eq(1);
        if($messageBodyCell.find('textarea').length === 0) {
          $messageBodyCell.wrapInner('<div class="form-group" />');
        }
        
        /* CAPTCHA */
        $tafForm.find('img[id^="captcha_img_"]').each(function() {
          var $captchaImage = $(this).wrap('<p />'), 
          captchaFieldId = $captchaImage.attr('id').replace('captcha_img_', ''), 
          $captchaPlayer = $('#captcha_player_' + captchaFieldId);
          
          $('#' + captchaFieldId).before($captchaPlayer)
                                 .before($captchaImage)
                                 .before('<p><a href="javascript:change_img_962_6509_16_25212();">Change image</a></p>');
          
          if($tafForm.find('label[for="taf_captcha"]').length > 0 && $tafForm.find('#ecard_captcha').length > 0) {
            $tafForm.find('#ecard_captcha').before($tafForm.find('label[for="taf_captcha"]'));
          }
        });
        
        /* wrap checkboxes not in a fieldset in a .form-group */
        $tafForm.find('.checkbox').not('.form-group .checkbox').each(function() {
          $(this).wrap('<div class="form-group" />');
        });
        
        /* mark fields as required */
        $tafForm.find('label[for="cons_first_name"], label[for="cons_last_name"], label[for="youremail"], label[for="sendtoemail"]').prepend('* ');
        $tafForm.find('#cons_first_name, #cons_last_name, #youremail, #cons_email, #sendtoemail, #taf_captcha, #ecard_captcha').attr('required', 'required');
        
        /* buttons */
        $tafForm.append('<div class="form-group js--taf-buttons" />');
        $tafForm.find('input[type="submit"], input[type="reset"]').each(function() {
          var $button = $(this);
          
          if($button.is('#taf_send')) {
            $button.addClass('button button-action');
          }
          else {
            $button.addClass('button button-grey');
          }
          
          $tafForm.find('.js--taf-buttons').append($button, ' ');
        });
        
        /* remove default markup */
        $tafForm.find('.form-group').each(function() {
          $tafForm.append($(this));
        });
        $tafForm.find('.appArea').remove();
      });
    }
  })();
})(jQuery);
// END https://act.alz.org/ridepc/js/main2.js.gz


// BEGIN https://act.alz.org/ridepc/js/ride-main.js.gz
(function($) {
  'use strict';
  
  /* ****** */
  /* Global */
  /* ****** */
  
  window.walk = {
    disablePopup: function(clicked) {
      $('.popup-bg, .' + clicked).fadeOut(300);
      document.ontouchmove = function() {
        return true;
      };
    }, 
    
    loadPopup: function(clicked) {
      $('.popup-bg, .' + clicked).fadeIn(300);
    }, 
    
    centerPopup: function(clicked) {
      var windowWidth = $(window).width(), 
      windowHeight = $(window).height(), 
      popupHeight = $('.' + clicked).height(), 
      popupWidth = $('.' + clicked).width();
      
      if(windowWidth <= 700) {
        $('.' + clicked).css({
          top: '0', 
          left: '0'
        });
      }
      else if(windowWidth > 700 && windowWidth <= 810) {
        $('.' + clicked).css({
          top: (windowHeight / 2) - (popupHeight / 2) + 'px', 
          left: '0'
        });
      }
      else {
        $('.' + clicked).css({
          top: (windowHeight / 2) - (popupHeight / 2) + 'px', 
          left: (windowWidth / 2) - (popupWidth / 2) + 'px'
        });
      }
    }, 
    
    searchForms: function(element, form) {
      $('.main-search--hero-register, .main-search--hero-donate').hide();
      $('.hero-image img, .hero-image h1, .hero-image h2').removeClass('blur');
      
      if($(element).is('.open')) {
        $('.hero-image .main-search__navigation--donate, .hero-image .main-search__navigation--register').removeClass('open');
      }
      else {
        $('.hero-image .main-search__navigation--donate, .hero-image .main-search__navigation--register').removeClass('open');
        $('.main-search--hero-' + form).show();
        $(element).addClass('open')
        $('.hero-image img, .hero-image h1, .hero-image h2').addClass('blur');
      }
      
      return false;
    }, 
    
    buildThermometers: function() {
      $('.js__thermometer').not('.js--pending').each(function() {
        var percentage = $(this).data('percent');
        
        if ($(this).find('ul li:nth-child(2)').length>0){
    			$(this).find('ul li:nth-child(2)').animate({
    			  width: percentage + '%'
    			}, 1000, 'swing');
		    }

        if ($(this).find('.thermometer__bar-raised').length>0){
          if ($(this).find('.thermometer__bar-raised').find('.thermometer__percentage_container').length > 0) {
            $(this).find('.thermometer__bar-raised').each(function(){
              var $this = $(this);
              $this.animate({
                  width: percentage + '%'
                },
                { 'duration': 1000, 'easing': 'swing', 'progress': function(a, p){
                  if (p * percentage > 50) {
                    if ((navigator.userAgent.indexOf('MSIE') != -1) || (navigator.userAgent.indexOf('Trident') != -1)) {
                      $this.find('.thermometer__percentage_container').css({ 'color': '#fff', 'right': 'unset', 'left': 0 });
                    } else {
                      $this.find('.thermometer__percentage_container').css({ 'color': '#fff', 'right': 'unset', 'left': ($this.width() - $this.find('.thermometer__percentage_container').width() - 8) + 'px' });
                    }
                  } else {
                    $this.find('.thermometer__percentage_container').css({ 'color': '', 'right': '', 'left': '' });
                  } } });
            });
          } else {
      			$(this).find('.thermometer__bar-raised').animate({
      			  width: percentage + '%'
      			}, 1000, 'swing');
          }
		    }
        $(this).find('.thermometer__percentage').animateNumber({
          number: percentage,
          easing: 'swing',
          numberStep: $.animateNumber.numberStepFactories.append('%')
        }, 1500);
      });
    }, 
    
    participantPhotoResize: function($element) {
      $('.js--hero__image-container').css('height', '440px');
      
      if($element.is('img')) {
        $element.css({
          width: 'auto', 
          height: 'auto'
        });
      }
      else {
        $element.css({
          width: '650px', 
          height: '440px'
        });
      }
      
      if($('.js--hero__image-container').width() <= $element.width() && $element.is('img')) {
        $element.css({
          width: '100%', 
          height: 'auto'
        });
      }
    }, 
    
    participantPhotoReset: function() {
      $('.js--hero__image-container, .js--hero__content, .js--img-caption, .js--active').removeAttr('style');
      
      if($('.js--active').is('iframe')) {
        $('.js--active').css({
          width: '100%', 
          height: '440px'
        });
      }
      else if($('.js--hero__image-container').width() < $('.js--active').width()) {
        $('.js--active').css({
          width: '100%', 
          height: 'auto'
        });
      }
      
      if($(window).width() < 650) {
        $('.js--hero__image-container').height($('.js--active').height() + 'px');
      }
    }, 
    
    localSponsorsCarouselScroll: function(direction, speed) {
      var $carousel = $('#js--responsive--carousel'), 
      $carousel__body = $('#js--carousel__body'), 
      $carousel__list = $('#js--carousel__list');
      
      $carousel__body.velocity('stop').css({
        left: '0'
      });
      
      var left = $carousel__body.css('left');
      if(left === 'auto') {
        left = 0;
      }
      else {
        left = parseInt(left);
      }
      
      if(direction === 'right') {
        var $el = $('.js--c_img:first', $carousel);
        
        left = left - 10 - $el.width();
        
        $carousel__body.velocity({
          left: left + 'px'
        }, speed, 'linear', function() {
          $carousel__list.append($el);
          $carousel__body.css({
            left: '0'
          });
        });
      }
      else {
        var $el = $('.js--c_img:last', $carousel);
        
        left = left + $el.width() + 10;
        
        $carousel__body.velocity({
          left: left + 'px'
        }, speed, 'linear', function() {
          $carousel__list.prepend($el);
          $carousel__body.css({
            left: '0'
          });
        });
      }
    }, 
    
    localSponsorsCarousel: function() {
      var $carousel = $('#js--responsive--carousel'), 
      $carousel__body = $('#js--carousel__body'), 
      $carousel__wrapper = $('#js--carousel__wrapper'), 
      $left_control = $('#js--responsive--carousel .sponsors-event__arrow--left a'), 
      $right_control = $('#js--responsive--carousel .sponsors-event__arrow--right a'), 
      speed = 500, 
      animation_speed = 1000, 
      total = 45, 
      interval = 517, 
      stop = false, 
      intervalHandler, 
      timeoutHandler;
      
      /* calculate total width of the list and apply this width to ul element */
      $('.js--c_img', $carousel).each(function() {
        total = total + parseFloat($(this).width()) + 30;
      });
      $carousel__body.css({
        width: total + 'px'
      });
      
      /* hide controls */
      $left_control.hide();
      $right_control.hide();
      
      /* check if all elements are showing */
      if(total - 35 > $carousel__wrapper.width()) {
        $left_control.show();
        $right_control.show();
        
        window.clearInterval(intervalHandler);
        
        intervalHandler = setInterval(function() {
          walk.localSponsorsCarouselScroll('right', animation_speed);
        }, speed + interval);
      }
      
      $right_control.click(function(e) {
        e.preventDefault();
        window.clearInterval(intervalHandler);
        walk.localSponsorsCarouselScroll('right');
        stop = true;
      });
      $left_control.click(function(e) {
        e.preventDefault();
        window.clearInterval(intervalHandler);
        walk.localSponsorsCarouselScroll('left');
        stop = true;
      });
      
      $(window).resize(function() {
        if(total - 35 > $carousel__wrapper.width()) {
          $left_control.show();
          $right_control.show();
          
          window.clearInterval(intervalHandler);
          
          intervalHandler = setInterval(function() {
            walk.localSponsorsCarouselScroll('right', animation_speed);
          }, speed + interval);
        }
        else {
          window.clearInterval(intervalHandler);
          
          $left_control.hide();
          $right_control.hide();
        }
      });
      
      $carousel__wrapper.hover(function() {
        window.clearTimeout(timeoutHandler);
        window.clearInterval(intervalHandler);
      }, function() {
        window.clearTimeout(timeoutHandler);
        window.clearInterval(intervalHandler);
        
        if(!stop) {
          intervalHandler = setInterval(function() {
            walk.localSponsorsCarouselScroll('right', animation_speed);
          }, speed + interval);
        }
      });
    }, 
    
    dialogOverlay: function() {
      $('body').on('click', '[data-toggle="dialog"]', function(e) {
        e.preventDefault();
        walk.dialogOverlayOpen($(this).attr('data-target'));
      }).on('click', '[data-action="overlay-close"]', function(e) {
        e.preventDefault();
        walk.dialogOverlayClose();
      });
    }, 
    
    dialogOverlayClose: function() {
      $('body').removeClass('overflowHidden js--dialog-open');
      
      if($('.dialog-overlay').length > 0) {
        if($('.js--dialog-overlays').length === 0) {
          $('body').append('<div class="js--dialog-overlays hidden" />');
        }
        $('.js--dialog-overlays').append($('.dialog-body').children());
        
        $('.dialog-overlay').remove();
      }
    }, 
    
    dialogOverlayOpen: function(selector) {
      if($('body').is('.js--dialog-open')) {
        walk.dialogOverlayClose();
      }
      
      $('body').addClass('overflowHidden js--dialog-open')
               .prepend('<div class="dialog-overlay">' + 
                          '<button class="overlay-close" data-action="overlay-close">' + 
                            '<span class="icon-cross"></span>' + 
                          '</button>' + 
                          '<div class="dialog-body" tabindex="-1"></div>' + 
                        '</div>');
      
      $('.dialog-body').append($(selector).removeClass('hidden'));
      
      setTimeout(function() {
        if ($('.dialog-body').length > 0) {
          $('.dialog-body').css({
            opacity: 0,
            display: 'block'
          }).velocity({
            scale: '0.25',
          }, 0);
          $('.dialog-body').velocity({
            opacity: 1,
            scale: '1',
          }, 575, [6, 3]);
        }
      }, 150)
    }
  };
  
  (function() {
    /* jQuery placeholder plugin */
    $('input[placeholder], textarea[placeholder]').placeholder();
    
    /* everywhere but the participant center, animate the top/bottom nav onscroll */
    if(!$('body').is('.page-walk_participant_center')) {
      
      var lastScroll = 0, 
      $headerElements = $('.header .header__navbar, .header .offcanvas-menu'), 
      $footerElements = $('.bottom-nav');
      
      $(window).scroll(function() {
        var scrollTop = $(document).scrollTop();
        
        if(scrollTop >= 0) {
          if(scrollTop > lastScroll) {
            $footerElements.removeClass('animated slideInUp')
                           .addClass('scroll animated slideOutDown');
          }
          else if(scrollTop < lastScroll) {
            $footerElements.removeClass('slideOutDown animated')
                           .addClass('scroll animated slideInUp');
          }
          else {
            $footerElements.removeClass('scroll animated animated-slow slideInUp slideOutDown');
          }
          
          if(scrollTop > lastScroll && scrollTop > 140 && $headerElements.is('.scroll')) {
            $headerElements.removeClass('animated slideInDown')
                           .addClass('scroll animated-slow slideOutUp');
          }
          else if(scrollTop > 80 && scrollTop < lastScroll) {
            $headerElements.removeClass('slideOutUp animated-slow')
                           .addClass('scroll animated slideInDown');
          }
          else {
            $headerElements.removeClass('scroll animated animated-slow slideInDown slideOutUp');
          }
          
          lastScroll = scrollTop;
        }
        else {
          $headerElements.removeClass('scroll animated animated-slow slideInDown slideOutUp');
          $footerElements.removeClass('scroll animated animated-slow slideInUp slideOutDown');
        }
      });
    }
    
    /* open/close popup menu */
    $('.navbar__button--menu a').click(function(e) {
      e.preventDefault();
      walk.centerPopup('popup-menu');
      walk.loadPopup('popup-menu');
    });
    $('.popup-menu__button--close, .popup-bg').click(function() {
      walk.disablePopup('popup-menu');
    });
    
    /* center the menu onresize */
    $(window).resize(function() {
      walk.centerPopup('popup-menu');
    });
    
    /* hide the logged in panel and set a cookie when the user clicks the close icon */
    $('.offcanvas-menu__link').click(function(e) {
      e.preventDefault();
      $('.main-container').toggleClass('offcanvas--active');
      $('.bottom-nav').toggleClass('offcanvas--active');
      document.cookie = 'loginPanel=off; expires=' + new Date(new Date().getTime() + 31536000000).toUTCString() + '; path=/';
    });
    
    /* build thermometers */
    walk.buildThermometers();
    
    /* enable links to dialog overlays */
    walk.dialogOverlay();
    
    /* build participant and team lists */
    $('.participant-list').participantList();
    $('.team-list').teamList();
    
    /* show modal if participant attempts to register for an event they are already registered for */
    if(luminateExtend.global.isRegistered) {
      $('body').on('click', 
                   'a[href*="TRR"][href*="pg=tfind"][href*="fr_id=' + luminateExtend.global.frId + '"]:not(a[href*="UserLogin"]):not(a[href$="#"]), ' + 
                   'a[href*="pagename=walk_register"][href*="fr_id=' + luminateExtend.global.frId + '"]:not(a[href*="UserLogin"]):not(a[href$="#"])', 
                   function(e) {
        e.preventDefault();
        
        $('#already-registered-modal').modal('show');
      });
    }
  })();
  
  /* ************ */
  /* Nearby Walks */
  /* ************ */
  
  (function() {
    /* nearby walks */
    if($('.js--nearby-events-list').length > 0) {
      $('.js--nearby-events-form').submit(function(e) {
        e.preventDefault();
        
        $('.js--nearby-events-list').html('');
        var $postalCode = $('.js--nearby-events-zip'), 
        postalCode = $.trim($postalCode.val()), 
        $searchResultsLoadingRow = $('.location-search__item--loading'), 
        $searchResultsNoResultsRow = $('.location-search__item--no-results').addClass('hidden'), 
        $searchResultsMore = $('.js--nearby-events-more').addClass('hidden');
        
        if(postalCode != '') {
          $searchResultsLoadingRow.removeClass('hidden');
          
          if(isNaN(postalCode) || postalCode.length != 5) {
            $(window).resize(function() {
              $postalCode.popover('dispose');
            });
            
            $('body').click(function(e) {
              var $target = $(e.target);
              if($target.closest('.popover').length === 0) {
                $postalCode.popover('dispose');
              }
            });
            
            var showInvalidZipPopover = function() {
              $postalCode.popover({
                content: '"' + postalCode + '" is not a valid ZIP Code. Please try again.', 
                trigger: 'manual', 
                placement: 'auto top'
              }).popover('show');
              $searchResultsLoadingRow.addClass('hidden');
              $searchResultsNoResultsRow.removeClass('hidden');
            };
            
            if(isNaN(postalCode)) {
              adarda.getZipForAddress({
                address: postalCode, 
                callback: function(addressPostalCode) {
                  if(addressPostalCode && !isNaN(addressPostalCode) && addressPostalCode.length === 5) {
                    $postalCode.data('originalsearch', postalCode).val(addressPostalCode).popover({
                      content: 'You entered "' + postalCode + '", which is not a valid ZIP Code. ' + 
                               'Does this ZIP Code look correct? If not, please try again.', 
                      trigger: 'manual', 
                      placement: 'auto top'
                    }).popover('show');
                    $('.js--nearby-events-form').submit();
                  }
                  else {
                    showInvalidZipPopover();
                  }
                }
              });
            }
            else {
              showInvalidZipPopover();
            }
          }
          else {
            var buildNearbyWalks = function(teamraisers) {
              $searchResultsLoadingRow.addClass('hidden');
              
              $.each(teamraisers, function() {
                var rowIndex = $('.js--nearby-events-list .location-search__item').length, 
                eventDate = this.event_date, 
                eventDateObject = new Date(luminateExtend.utils.simpleDateFormat(eventDate, 'yyyy'), 
                                           Number(luminateExtend.utils.simpleDateFormat(eventDate, 'M')) - 1, 
                                           luminateExtend.utils.simpleDateFormat(eventDate, 'd')), 
                daysToEvent = Math.ceil((eventDateObject - new Date()) / 86400000),
                eventCity = this.city;
                
                if(rowIndex < 3 && daysToEvent >= 0) {
                  var rowClass = 'location-search__item--' + (rowIndex % 2 === 0 ? 'even' : 'odd');
                  
                  if(!eventCity) {
                    eventCity = this.name;
                  }
                  else {
                    var eventState = this.state, 
                    eventCode = this.mailingAddrAttn;
                    
                    if(eventState) {
                      eventCity += ', ' + eventState;
                    }
                    
                    switch (eventCode) {
                      case '6179':
                        eventCity += ' (Monmouth County residents)';
                        break;
                      case '6180':
                        eventCity += ' (Ocean County residents)';
                        break;
                      case '6191':
                        eventCity += ' (Hudson County residents)';
                        break;
                      case '6181':
                        eventCity += ' (Essex/Union County residents)';
                        break;
                    }
                  }
                  
                  $('.js--nearby-events-list').append('<div class="location-search__item ' + rowClass + '">' + 
                                                        '<div class="item__arrow">' + 
                                                          '<a href="' + this.greeting_url + '">' + 
                                                            '<span class="icon-arrow-right arrow--left"></span>' + 
                                                          '</a>' + 
                                                        '</div>' + 
                                                        '<div class="item__body">' + 
                                                          '<h4>' + 
                                                            eventCity + 
                                                          '</h4>' + 
                                                          '<ul class="list-inline">' + 
                                                            '<li>' + 
                                                              luminateExtend.utils.simpleDateFormat(this.event_date, 'MMMM d, yyyy') + 
                                                            '</li>' +
                                                            (this.location_name ? 
                                                             ('<li>' + this.location_name + '</li>') : '') +
                                                          '</ul>' +
                                                        '</div>' +
                                                      '</div>');
                }
              });
              
              if($('.js--nearby-events-list .location-search__item').length === 0) {
                $searchResultsNoResultsRow.removeClass('hidden');
              }
              
              if(teamraisers.length > 3 || 
                 ($('.js--nearby-events-list .location-search__item').length === 0 && teamraisers.length > 0)) {
                $searchResultsMore.removeClass('hidden');
              }
            };
            
            adarda.getTeamraisers({
              eventType: 'Walk', 
              zipCode: postalCode, 
              radius: '200', 
              size: '50', 
              sortColumn: 'distance', 
              callback: function(response) {
                if(response.getTeamraisersResponse && response.getTeamraisersResponse.teamraiser) {
                  var teamraisers = luminateExtend.utils.ensureArray(response.getTeamraisersResponse.teamraiser);
                  buildNearbyWalks(teamraisers);
                }
                else {
                  adarda.getStateForZip({
                    zipCode: postalCode, 
                    callback: function(state) {
                      adarda.getTeamraisers({
                        eventType: 'Walk', 
                        state: state, 
                        sortColumn: 'event_date', 
                        callback: function(response) {
                          if(response.getTeamraisersResponse && response.getTeamraisersResponse.teamraiser) {
                            var teamraisers = luminateExtend.utils.ensureArray(response.getTeamraisersResponse.teamraiser);
                            buildNearbyWalks(teamraisers);
                          }
                          else {
                            $searchResultsLoadingRow.addClass('hidden');
                            $searchResultsNoResultsRow.removeClass('hidden');
                          }
                        }
                      });
                    }
                  });
                }
              }
            });
            
            $searchResultsMore.find('a').attr('href', 'PageServer?pagename=walk_event_list&amp;search_type=event' + 
                                                      '&amp;starting_postal=' + postalCode);
          }
        }
      });
      
      $('.js--nearby-events-zip').prefillZip({
        callback: function() {
          $('.js--nearby-events-form').submit();
        }
      });
      
      /* make rows clickable in nearby walks lists */
      $('.js--nearby-events-list').on('click', '.location-search__item--odd, .location-search__item--even', function() {
        $(this).find('a').get(0).click();
      });
    }
  })();
  
  /* ******** */
  /* Homepage */
  /* ******** */
  
  (function() {
    /* open/close the donate toolbar */
    $('.hero-image .main-search__navigation--donate').click(function(e) {
      e.preventDefault();
      walk.searchForms(this, 'donate');
      return false;
    });
    $('.hero-image .main-search__navigation--register').click(function(e) {
      e.preventDefault();
      walk.searchForms(this, 'register');
      return false;
    });
    
    /* toggle donate search type */
    $('.donation-search-type a').click(function(e) {
      e.preventDefault();
      
      if($(this).attr('data-searchtype')=='participant_name'){
        $('#js--donate-searchtype-participant_name').removeClass('hidden');
        $('#js--donate-searchtype-participant_name input').removeAttr('disabled');
        $('#js--donate-searchtype-team_name').addClass('hidden');
        $('#js--donate-searchtype-team_name input').attr('disabled', 'disabled');
      }
      else{
        $('#js--donate-searchtype-team_name').removeClass('hidden');
        $('#js--donate-searchtype-team_name input').removeAttr('disabled');
        $('#js--donate-searchtype-participant_name').addClass('hidden');
        $('#js--donate-searchtype-participant_name input').attr('disabled', 'disabled');
      }
      
      $(this).closest('.dropdown').find('.dropdown-toggle').html($(this).html()).dropdown('toggle');
    });
  })();
  
  /* ************* */
  /* Donate Search */
  /* ************* */
  
  (function() {
    /* handle search type toggle */
    $('.js--advanced-search-dd .dropdown-menu a').click(function(e) {
      e.preventDefault();
      
      var searchType = $(this).data('search');
      
      $('.js--advanced-dd-value').html($(this).html());
      
      $('.advanced-search__form, .advanced-search__results').addClass('hidden');
      $('.advanced-search__form--' + searchType).removeClass('hidden');
    });
    
    /* handle team search toggle */
    $('.js--team-search-dd .dropdown-menu a').click(function(e) {
      e.preventDefault();
      
      var teamSearchType = $(this).data('search');
      
      $('.js--team-search-dd .js--dd-value').html($(this).html());
      
      $('.js--team-search-input').addClass('hidden');
      $('.js--team-search-input input').val('');
      $('.js--team-search-input--' + teamSearchType).removeClass('hidden');
    });
    
    if($('.advanced-search__results--participant').length > 0) {
      /* handle participant search form */
      $('.js--participant-search-form').submit(function(e) {
        e.preventDefault();
        
        var $searchForm = $(this), 
        isNewSearch = $searchForm.data('newsearch'), 
        $searchResultsTable = $('.js--participant-search-table'), 
        listOffset = isNewSearch ? 0 : Number($searchResultsTable.data('offset')), 
        $searchResultsLoadingRow = $searchResultsTable.find('.content__table--loading-row'), 
        $searchResultsNoResultsRow = $searchResultsTable.find('.content__table--no-results-row'), 
        $searchResultsPagination = $('.js--participant-search-pagination'), 
        $searchResultsPaginationPrev = $searchResultsPagination.find('.js--pagination-prev'), 
        $searchResultsPaginationNext = $searchResultsPagination.find('.js--pagination-next');
        
        $('.advanced-search__results--participant').removeClass('hidden');
        $searchResultsLoadingRow.removeClass('hidden');
        $searchResultsNoResultsRow.addClass('hidden');
        $searchResultsTable.find('.content__table--row').remove();
        $searchResultsPaginationPrev.addClass('hidden');
        $searchResultsPaginationNext.addClass('hidden');
        
        var searchOptions = {
          eventType: 'Walk', 
          firstName: $('#donate-search-first-name').val(), 
          lastName: $('#donate-search-last-name').val(), 
          size: '7', 
          sortColumn: 'first_name_lower', 
          offset: listOffset, 
          callback: {
            success: function(response) {
              $searchResultsLoadingRow.addClass('hidden');
              
              var totalNumberResults = response.getParticipantsResponse.totalNumberResults,
              participants = luminateExtend.utils.ensureArray(response.getParticipantsResponse.participant);
              
              $.each(participants, function(rowIndex) {
                var participantName = this.name;
                if(participantName && 
                   participantName.first && 
                   this.personalPagePrivate == 'false') {
                  $searchResultsTable.append('<div class="content__table--row content__table--' + (rowIndex % 2 === 0 ? 'even' : 'odd') + '">' + 
                                               '<div>' + 
                                                 '<span>Name:</span> ' + 
                                                 '<a href="' + this.personalPageUrl + '">' + 
                                                   participantName.first + ' ' + participantName.last + 
                                                 '</a>' + 
                                               '</div>' + 
                                               '<div class="table__column--bordered">' + 
                                                 '<span>Event:</span> ' + 
                                                 '<a href="TR?fr_id=' + this.eventId + '">' + 
                                                   this.eventName.replace('adarda Walk to Cure Diabetes, ', '').replace('adarda One Walk, ', '') + 
                                                 '</a>' + 
                                               '</div>' + 
                                               '<div class="table__column--buttons">' + 
                                                 '<a href="' + this.personalPageUrl + '" class="button button-sm button-outline">View</a>' + 
                                                 (this.donationUrl ? 
                                                  ('<a href="' + this.donationUrl + '" class="button button-sm">Donate</a>') : '') + 
                                               '</div>' + 
                                             '</div>');
                }
              });
              
              if($searchResultsTable.find('.content__table--row').length === 0) {
                $searchResultsNoResultsRow.removeClass('hidden');
              }
              
              if(listOffset != 0) {
                $searchResultsPaginationPrev.removeClass('hidden');
              }
              if((listOffset + 1) * 7 < totalNumberResults) {
                $searchResultsPaginationNext.removeClass('hidden');
              }
            }, 
            error: function(response) {
              $searchResultsLoadingRow.addClass('hidden');
              $searchResultsNoResultsRow.removeClass('hidden');
            }
          }
        };
        
        adarda.getParticipants(searchOptions);
        
        $searchForm.data('newsearch', 'true');
      });
      
      /* handle participant search pagination */
      $('.js--participant-search-pagination .js--pagination-prev').click(function(e) {
        e.preventDefault();
        var $targetList = $('.js--participant-search-table');
        $targetList.data('offset', Number($targetList.data('offset')) - 1);
        $('.js--participant-search-form').removeData('newsearch').submit();
      });
      $('.js--participant-search-pagination .js--pagination-next').click(function(e) {
        e.preventDefault();
        var $targetList = $('.js--participant-search-table');
        $targetList.data('offset', Number($targetList.data('offset')) + 1);
        $('.js--participant-search-form').removeData('newsearch').submit();
      });
      
      if($('#donate-search-first-name').val() != '' || $('#donate-search-last-name').val() != '') {
        $('.js--participant-search-form').submit();
      }
    }

    if($('.advanced-search__results--team').length > 0) {
      /* handle team search form */
      $('.js--team-search-form').submit(function(e) {
        e.preventDefault();
        
        var $searchForm = $(this), 
        isNewSearch = $searchForm.data('newsearch'), 
        $searchResultsTable = $('.js--team-search-table'), 
        listOffset = isNewSearch ? 0 : Number($searchResultsTable.data('offset')), 
        $searchResultsLoadingRow = $searchResultsTable.find('.content__table--loading-row'), 
        $searchResultsNoResultsRow = $searchResultsTable.find('.content__table--no-results-row'), 
        $searchResultsPagination = $('.js--team-search-pagination'), 
        $searchResultsPaginationPrev = $searchResultsPagination.find('.js--pagination-prev'), 
        $searchResultsPaginationNext = $searchResultsPagination.find('.js--pagination-next');
        
        $('.advanced-search__results--team').removeClass('hidden');
        $searchResultsLoadingRow.removeClass('hidden');
        $searchResultsNoResultsRow.addClass('hidden');
        $searchResultsTable.find('.content__table--row').remove();
        $searchResultsPaginationPrev.addClass('hidden');
        $searchResultsPaginationNext.addClass('hidden');
        
        var searchOptions = {
          eventType: 'Walk', 
          teamName: $('#donate-search-team-name').val(), 
          firstName: $('#donate-search-captain-first-name').val(), 
          lastName: $('#donate-search-captain-last-name').val(), 
          companyName: $('#donate-search-company-name').val(), 
          size: '7', 
          offset: listOffset, 
          callback: {
            success: function(response) {
              $searchResultsLoadingRow.addClass('hidden');
              
              var totalNumberResults = response.getTeamSearchByInfoResponse.totalNumberResults, 
              teams = luminateExtend.utils.ensureArray(response.getTeamSearchByInfoResponse.team);
              
              $.each(teams, function(rowIndex) {
                $searchResultsTable.append('<div class="content__table--row content__table--' + (rowIndex % 2 === 0 ? 'even' : 'odd') + '">' + 
                                             '<div>' + 
                                               '<span>Team Name:</span> ' + 
                                               '<a href="' + this.teamPageURL + '">' + 
                                                 this.name + 
                                               '</a>' + 
                                             '</div>' + 
                                             '<div class="table__column--bordered">' + 
                                               '<span>Team Captain:</span> ' + 
                                               (this.captainFirstName ? 
                                                ('<a href="TR?fr_id=' + this.EventId + '&pg=personal&px=' + this.captainConsId + '">' + 
                                                   this.captainFirstName + ' ' + this.captainLastName + 
                                                 '</a>') : '') + 
                                             '</div>' + 
                                             '<div class="table__column--bordered">' + 
                                               '<span>Event:</span> ' + 
                                               '<a href="TR?fr_id=' + this.EventId + '">' + 
                                                 this.eventName.replace('adarda Walk to Cure Diabetes, ', '').replace('adarda One Walk, ', '') + 
                                               '</a>' + 
                                             '</div>' + 
                                             '<div class="table__column--buttons">' + 
                                               '<a href="' + this.teamPageURL + '" class="button button-sm button-outline">View</a>' + 
                                               (this.teamDonateURL ? 
                                                ('<a href="' + this.teamDonateURL + '" class="button button-sm">Donate</a>') : '') + 
                                             '</div>' + 
                                           '</div>');
              });
              
              if($searchResultsTable.find('.content__table--row').length === 0) {
                $searchResultsNoResultsRow.removeClass('hidden');
              }
              
              if(listOffset != 0) {
                $searchResultsPaginationPrev.removeClass('hidden');
              }
              if((listOffset + 1) * 7 < totalNumberResults) {
                $searchResultsPaginationNext.removeClass('hidden');
              }
            }, 
            error: function(response) {
              $searchResultsLoadingRow.addClass('hidden');
              $searchResultsNoResultsRow.removeClass('hidden');
            }
          }
        };
        
        adarda.getTeams(searchOptions);
        
        $searchForm.data('newsearch', 'true');
      });
      
      /* handle team search pagination */
      $('.js--team-search-pagination .js--pagination-prev').click(function(e) {
        e.preventDefault();
        var $targetList = $('.js--team-search-table');
        $targetList.data('offset', Number($targetList.data('offset')) - 1);
        $('.js--team-search-form').removeData('newsearch').submit();
      });
      $('.js--team-search-pagination .js--pagination-next').click(function(e) {
        e.preventDefault();
        var $targetList = $('.js--team-search-table');
        $targetList.data('offset', Number($targetList.data('offset')) + 1);
        $('.js--team-search-form').removeData('newsearch').submit();
      });
      
      if($('#donate-search-team-name').val() != '') {
        $('.js--team-search-form').submit();
      }
    }
  })();
  
  /* *************** */
  /* Register Search */
  /* *************** */
  
  (function() {
    if($('.advanced-search__results--event').length > 0) {
      /* handle event search form */
      $('.js--event-search-form').submit(function(e) {
        e.preventDefault();
        
        var $postalCode = $('.js--event-search-postal'), 
        postalCode = $.trim($postalCode.val()), 
        $searchState = $('.js--event-search-state'), 
        state = $searchState.val(), 
        $searchResults = $('.advanced-search__results--event'), 
        $searchResultsLoadingRow = $searchResults.find('.content__table--loading-row'), 
        $searchResultsNoResultsRow = $searchResults.find('.content__table--no-results-row'), 
        $searchResultsPagination = $('.js--event-list-pagination'), 
        $searchResultsPaginationPrev = $searchResultsPagination.find('.js--pagination-prev'), 
        $searchResultsPaginationNext = $searchResultsPagination.find('.js--pagination-next');
        
        if(postalCode != '') {
          $searchState.val('');
          state = '';
        }
        
        if(!$postalCode.data('originalsearch')) {
          $postalCode.popover('dispose');
        }
        $postalCode.removeData('originalsearch');
        $searchResults.removeClass('hidden');
        $searchResultsLoadingRow.removeClass('hidden');
        $searchResultsNoResultsRow.addClass('hidden');
        $searchResults.find('.content__table--row').remove();
        $searchResultsPaginationPrev.addClass('hidden');
        $searchResultsPaginationNext.addClass('hidden');
        
        if(postalCode != '' && (isNaN(postalCode) || postalCode.length != 5)) {
          $(window).resize(function() {
            $postalCode.popover('dispose');
          });
          
          $('body').click(function(e) {
            var $target = $(e.target);
            if($target.closest('.popover').length === 0) {
              $postalCode.popover('dispose');
            }
          });
          
          var showInvalidZipPopover = function() {
            $postalCode.popover({
              content: '"' + postalCode + '" is not a valid ZIP Code. Please try again, or, use the dropdown to search by state.', 
              trigger: 'manual', 
              placement: 'auto top'
            }).popover('show');
            $searchResultsLoadingRow.addClass('hidden');
            $searchResultsNoResultsRow.removeClass('hidden');
          };
          
          if(isNaN(postalCode)) {
            adarda.getZipForAddress({
              address: postalCode, 
              callback: function(addressPostalCode) {
                if(addressPostalCode && !isNaN(addressPostalCode) && addressPostalCode.length === 5) {
                  $postalCode.data('originalsearch', postalCode).val(addressPostalCode).popover({
                    content: 'You entered "' + postalCode + '", which is not a valid ZIP Code. ' + 
                             'Does this ZIP Code look correct? If not, please try again, or, use the dropdown to search by state.', 
                    trigger: 'manual', 
                    placement: 'auto top'
                  }).popover('show');
                  $('.js--event-search-form').submit();
                }
                else {
                  showInvalidZipPopover();
                }
              }
            });
          }
          else {
            showInvalidZipPopover();
          }
        }
        else {
          var searchOptions = {
            eventType: 'Walk', 
            zipCode: postalCode, 
            state: state, 
            radius: '200', 
            sortColumn: 'distance', 
            size: postalCode === '' && state === '' ? '500' : '100', 
            fullSearch: true, 
            callback: {
              success: function(response) {
                $searchResultsLoadingRow.addClass('hidden');
                
                var teamraisers = luminateExtend.utils.ensureArray(response.getTeamraisersResponse.teamraiser);
                $.each(teamraisers, function(rowIndex) {
                  var eventStatus = this.status, 
                  eventDate = this.event_date, 
                  eventDateObject = new Date(luminateExtend.utils.simpleDateFormat(eventDate, 'yyyy'), 
                                             Number(luminateExtend.utils.simpleDateFormat(eventDate, 'M')) - 1, 
                                             luminateExtend.utils.simpleDateFormat(eventDate, 'd')), 
                  daysToEvent = Math.ceil((eventDateObject - new Date()) / 86400000), 
                  eventCity = this.city, 
                  $listContainer = $searchResults.find('.js--event-list--' + (daysToEvent < 0 ? 'past' : 'upcoming'));
                  
                  if(!eventCity) {
                    eventCity = this.name;
                  }
                  else {
                    var eventState = this.state, 
                    eventCode = this.mailingAddrAttn;
                    
                    if(eventState) {
                      eventCity += ', ' + eventState;
                    }
                    
                    switch (eventCode) {
                      case '6179':
                        eventCity += ' (Monmouth County residents)';
                        break;
                      case '6180':
                        eventCity += ' (Ocean County residents)';
                        break;
                      case '6191':
                        eventCity += ' (Hudson County residents)';
                        break;
                      case '6181':
                        eventCity += ' (Essex/Union County residents)';
                        break;
                    }
                  }
                  
                  $listContainer.append('<div class="content__table--row">' + 
                                          '<div>' + 
                                            '<span>City:</span> ' + 
                                            eventCity + 
                                          '</div>' + 
                                          '<div class="table__column--bordered">' + 
                                            '<span>Date:</span> ' + 
                                            luminateExtend.utils.simpleDateFormat(eventDate, 'MMM d, yyyy').replace('apr ', 'Apr ').replace('aug ', 'Aug ').replace('mar ', 'Mar ') + 
                                          '</div>' + 
                                          '<div class="table__column--bordered">' + 
                                            '<span>Venue:</span> ' + 
                                            (this.location_name ? this.location_name : '') + 
                                          '</div>' + 
                                          '<div class="table__column--bordered table__column--buttons">' + 
                                            ($.inArray(eventStatus, ['1', '2', '3']) > -1 ? 
                                             ('<a href="' + this.greeting_url + '" class="button button-outline button-sm">Details</a>') : '') + 
                                            (this.accepting_registrations === 'true' ? 
                                             ('<a href="PageServer?pagename=walk_register&fr_id=' + this.id + '" class="button button-sm">Register</a>') : '') + 
                                          '</div>' + 
                                        '</div>');
                });
                
                $('.js--event-list--upcoming, .js--event-list--past').each(function() {
                  if($(this).find('.content__table--row').length === 0) {
                    $(this).find('.content__table--no-results-row').removeClass('hidden');
                  }
                  else {
                    $(this).find('.content__table--row').filter(':even').addClass('content__table--even');
                    $(this).find('.content__table--row').filter(':odd').addClass('content__table--odd');
                    
                    if($(this).find('.content__table--row').length > 7) {
                      $(this).find('.content__table--row:gt(6)').addClass('hidden');
                      $(this).closest('.tab-pane').find('.js--pagination-next').removeClass('hidden');
                    }
                  }
                });
              }, 
              error: function(response) {
                $searchResultsLoadingRow.addClass('hidden');
                $searchResultsNoResultsRow.removeClass('hidden');
              }
            }
          };
          
          adarda.getTeamraisers(searchOptions);
        }
      });
      
      /* handle event search pagination */
      $('.js--event-list-pagination .js--pagination-prev').click(function(e) {
        e.preventDefault();
        
        var $targetList = $(this).closest('.tab-pane').find('.js--event-list'), 
        listOffset = Number($targetList.data('offset')) - 1;
        $targetList.find('.content__table--row').addClass('hidden');
        $targetList.find('.content__table--row').each(function(rowIndex) {
          if(rowIndex > ((listOffset * 7) - 1) && rowIndex < ((listOffset + 1) * 7)) {
            $(this).removeClass('hidden');
          }
        });
        if(listOffset === 0) {
          $(this).addClass('hidden');
        }
        $(this).closest('.js--event-list-pagination').find('.js--pagination-next').removeClass('hidden');
        window.scrollTo(0, 0);
        $targetList.data('offset', listOffset);
      });
      $('.js--event-list-pagination .js--pagination-next').click(function(e) {
        e.preventDefault();
        
        var $targetList = $(this).closest('.tab-pane').find('.js--event-list'), 
        listOffset = Number($targetList.data('offset')) + 1;
        $targetList.find('.content__table--row').addClass('hidden');
        $targetList.find('.content__table--row').each(function(rowIndex) {
          if(rowIndex > ((listOffset * 7) - 1) && rowIndex < ((listOffset + 1) * 7)) {
            $(this).removeClass('hidden');
          }
        });
        if($targetList.find('.content__table--row:gt(' + (((listOffset + 1) * 7) - 1) + ')').length === 0) {
          $(this).addClass('hidden');
        }
        $(this).closest('.js--event-list-pagination').find('.js--pagination-prev').removeClass('hidden');
        window.scrollTo(0, 0);
        $targetList.data('offset', listOffset);
      });
      
      /* handle event state dropdown */
      $('.js--event-search-state').change(function() {
        if($(this).val() != '') {
          $('.js--event-search-postal').val('');
        }

        $('.js--event-search-form').submit();
      });
      
      if($('.js--event-search-postal').val() != '') {
        $('.js--event-search-form').submit();
      }
      else if($('.js--event-search-state').val() != '') {
        $('.js--event-search-state').change();
      }
    }
  })();
  
  /* ******************* */
  /* Event Greeting Page */
  /* ******************* */
  
  (function() {
    if($('body').is('.pg-entry')) {
      /* team list search */
      $('.js--team-list-form').submit(function(e) {
        e.preventDefault();
        
        $('.team-list').data('teamname', $('#team-list-name').val()).data('offset', '0').teamList();
      });
      
      /* participant list search */
      $('.js--participant-list-form').submit(function(e) {
        e.preventDefault();
        
        $('.participant-list').data('lastname', $('#participant-list-lname').val())
                              .data('firstname', $('#participant-list-fname').val())
                              .data('offset', '0').participantList();
      });
      
      /* build tabs */
      $('.js--teamraiser-nav .topnavLinkCellLink').each(function(linkIndex) {
        if(linkIndex < 2) {
          var frId = $(this).attr('href').split('fr_id=')[1].split('&')[0], 
          pageId = $(this).attr('href').split('sid=')[1].split('&')[0];
          
          $('.js--dynamic-tabs').append('<li>' + 
                                          '<a class="js--dynamic-tab-link" href="' + window.location.href.split('#')[0] + '#event_tab' + pageId + '" data-pageid="' + pageId + '">' + 
                                            $(this).html() + 
                                          '</a>' + 
                                          '<a class="hidden" href="#event_tab' + pageId + '" data-toggle="tab"></a>' + 
                                        '</li>');
          
          $('.js--dynamic-tab-content').append('<div class="tab-pane" id="event_tab' + pageId + '" data-frid="' + frId + '" data-pageid="' + pageId + '">' + 
                                                 '<p>Loading ...</p>' + 
                                               '</div>');
          
          if(window.location.hash === '#event_tab' + pageId) {
            $('.js--dynamic-tabs a[href="#event_tab' + pageId + '"]').click();
            $('body').animate({
              scrollTop: $('.js--dynamic-tabs').offset().top - 10
            }, 0);
          }
        }
      });
      $('.js--teamraiser-nav').remove();
      
      $('.js--dynamic-tab-link').click(function(e) {
        e.preventDefault();
        
        $('.js--dynamic-tabs a[href="#event_tab' + $(this).data('pageid') + '"]').click();
      });
      
      $('.js--dynamic-tabs a[data-toggle="tab"]').each(function() {
        var $tabLink = $(this), 
        $tabPane = $($tabLink.attr('href'));
        
        if($tabPane.data('frid') && $tabPane.data('pageid')) {
          $.ajax({
            url: 'TR?pg=informational&type=fr_informational&fr_id=' + $tabPane.data('frid') + 
                 '&sid=' + $tabPane.data('pageid') + 
                 '&pgwrap=n', 
            dataType: 'html', 
            success: function(response) {
              if($tabPane.is('.js--loaded')) {
                $tabPane.prepend(response).addClass('js--loaded trcontainer');
              }
              else {
                $tabPane.html('<div class="tabbed-content trcontainer">' + 
                                response + 
                              '</div>');
              }
            }
          });
        }
      });
      
      /* build local sponsors carousel */
      if($('.sponsors-event').length > 0) {
        $.ajax({
          dataType: 'html', 
          url: luminateExtend.global.path.secure + 
               'TR?pg=informational&fr_id=' + luminateExtend.global.frId + 
               '&type=fr_informational&sid=1012&pgwrap=n', 
          success: function(response) {
            var sponsorLevelNames = [], 
            sponsorLogos = [];
            
            $(response).find('*').not('img[src*="walk-local-sponsor-placeholder.jpg"]').each(function() {
              if($(this).is('h2')) {
                sponsorLevelNames.push($(this).html());
              }
              else if($(this).is('img')) {
                var sponsorLogoIndex = (sponsorLevelNames.length === 0) ? 0 : sponsorLevelNames.length - 1;
                if(!sponsorLogos[sponsorLogoIndex]) {
                  sponsorLogos[sponsorLogoIndex] = [];
                }
                sponsorLogos[sponsorLogoIndex].push($(this));
              }
            });
            
            $.each(sponsorLogos, function(logoGroupIndex) {
              $.each(this, function(logoIndex) {
                $('#js--carousel__list').append('<li class="js--c_img">' +
                                                  ((logoIndex === 0 && sponsorLevelNames[logoGroupIndex]) ?
                                                   ('<p>' + sponsorLevelNames[logoGroupIndex] + '</p>') : '') +
                                                '</li>');
                $('#js--carousel__list li').last().append(this);
              });
            });
            
            if($('#js--carousel__list img').length > 0) {
              $('.sponsors-event').removeClass('hidden');
            }
            
            walk.localSponsorsCarousel();
          }
        });
      }
    }
  })();
  
  /* ********************************* */
  /* Personal, Team, and Company Pages */
  /* ********************************* */
  
  (function() {
    /* image/video carousel */
    if($('.js--hero__image-container.js--loading').length > 0) {
      $('.js--hero__image-container.js--loading').removeClass('js--loading');
    }
    if($('.js--hero__image-container ul li').length > 0) {
      var $element = $('.js--hero__image-container ul li:first>img');
      if($('.js--hero__image-container ul li iframe').length > 0) {
        $element = $('.js--hero__image-container ul li iframe');
        $element.parent('li').css('z-index', '3');
      }
      else {
        if($('.js--hero__image-container ul li').length > 1) {
          $('.js--hero__image-container ul li').each(function() {
            $(this).children('img').css('height', 'auto');
            if($(this).children('img').width() >= $element.width()) {
              $element = $(this).children('img');
            }
          });
        }
      }
      
      if($('.js--hero__image-container ul li').length < 2) {
        $('.js--left, .js--right').hide();
      }
      
      $element.addClass('js--active').siblings('.js--img-caption').addClass('js--img-caption-active');
      
      if($(window).width() < 991) {
        walk.participantPhotoReset();
      }
      else {
        walk.participantPhotoResize($element);
      }
      
      $(window).resize(function() {
        if($(window).width() < 991) {
          walk.participantPhotoReset();
        }
        else {
          walk.participantPhotoResize($element);
        }
      });
      
      $('.js--right').click(function() {
        var $active = $('.js--active');
        if($active.parent('li').next().length > 0) {
          $active.siblings('.js--img-caption').removeClass('js--img-caption-active');
          $active.removeClass('js--active').parent('li').next().find('.js--hero__image').addClass('js--active').siblings('.js--img-caption').addClass('js--img-caption-active');
        }
        else {
          $active.siblings('.js--img-caption').removeClass('js--img-caption-active');
          $active.removeClass('js--active').parent('li').siblings('li:first').find('.js--hero__image').addClass('js--active').siblings('.js--img-caption').addClass('js--img-caption-active');
        }
        if($(window).width() < 991) {
          walk.participantPhotoReset();
        }
        else {
          walk.participantPhotoResize($element);
        }
      });
      $('.js--left').click(function() {
        var $active = $('.js--active');
        if($active.parent('li').prev().length > 0) {
          $active.siblings('.js--img-caption').removeClass('js--img-caption-active');
          $active.removeClass('js--active').parent('li').prev().find('.js--hero__image').addClass('js--active').siblings('.js--img-caption').addClass('js--img-caption-active');
        }
        else {
          $active.siblings('.js--img-caption').removeClass('js--img-caption-active');
          $active.removeClass('js--active').parent('li').siblings(':last').find('.js--hero__image').addClass('js--active').siblings('.js--img-caption').addClass('js--img-caption-active');
        }
        if($(window).width() < 991) {
          walk.participantPhotoReset();
        }
        else {
          walk.participantPhotoResize($element);
        }
      });
    }
    
    /* rebuild default company thermometers */
    if($('.js--default-company-thermometer').length > 0) {
      var companyAchieved = $('.js--default-company-thermometer .goal dl dt:contains("Achieved")').next().text().replace('.00', ''), 
      companyGoal = $('.js--default-company-thermometer .goal dl dt:contains("Goal")').next().text().replace('.00', ''), 
      companyPercent = Math.ceil((Number(companyAchieved.replace('$', '').replace(/,/g, '')) / Number(companyGoal.replace('$', '').replace(',', ''))) * 100);
      
      if(isNaN(companyPercent)) {
        companyPercent = 0;
      }
      if(companyPercent > 100) {
        companyPercent = 100;
      }
      
      $('.js--company-raised').html(companyAchieved);
      $('.js--company-goal').html(companyGoal);
      $('.fundraising-progress__meter').data('percent', companyPercent).removeClass('js--pending');
      walk.buildThermometers();
      
      $('.js--default-company-thermometer').remove();
    }
    if($('.js--default-company-stats').length > 0) {
      var numParticipants = Number($('.js--default-company-stats td:eq(5)').text());
      if(isNaN(numParticipants)) {
        numParticipants = 0;
      }
      $('.js--company-num-participants').html(numParticipants);
      $('.js--default-company-stats').remove();
    }
    
    /* build national team lists */
    $('.national-company-team-list').nationalCompanyTeamList();
    $('.national-company-participant-list').nationalCompanyParticipantList();
    $('.national-company-event-list').nationalCompanyEventList();
  })();
  
  /* *********** */
  /* Honor Rolls */
  /* *********** */
  
  (function() {
    /* rebuild default honor roll */
    if($('.default-honor-roll').length > 0) {
      $('.default-honor-roll').each(function() {
        var $defaultHonorRoll = $(this), 
        $defaultHonorRollRows = $defaultHonorRoll.find('.scrollContent p'), 
        $customHonorRoll = $($defaultHonorRoll.data('honorroll'));
        $defaultHonorRollRows.each(function(rowIndex) {
          var rowName = $(this).html().split('<')[0], 
          rowAmount = $(this).html().split('>')[1] || '';
          
          $customHonorRoll.append('<div class="content__table--row content__table--' + (rowIndex % 2 === 0 ? 'even' : 'odd') + '">' + 
                                    '<div>' + 
                                      '<span>Donor Name:</span> ' + 
                                      rowName + 
                                    '</div>' + 
                                    '<div class="table__column--bordered">' + 
                                      '<span>Amount Donated:</span> ' + 
                                      rowAmount.replace('.00', '') + 
                                    '</div>' + 
                                  '</div>');
        });

        if($defaultHonorRollRows.length > 0) {
          $customHonorRoll.closest('.honor-roll').removeClass('hidden');
          
          if($customHonorRoll.find('.content__table--row').length > 7) {
            $customHonorRoll.find('.content__table--row:gt(6)').addClass('hidden');
            $customHonorRoll.parent().find('.js--pagination-next').removeClass('hidden');
          }
        }
      });
      
      /* handle custom honor roll pagination */
      $('.js--honor-roll-pagination .js--pagination-prev').click(function(e) {
        e.preventDefault();
        
        var $targetList = $(this).closest('.honor-roll').find('.custom-honor-roll'), 
        listOffset = Number($targetList.data('offset')) - 1;
        $targetList.find('.content__table--row').addClass('hidden');
        $targetList.find('.content__table--row').each(function(rowIndex) {
          if(rowIndex > ((listOffset * 7) - 1) && rowIndex < ((listOffset + 1) * 7)) {
            $(this).removeClass('hidden');
          }
        });
        if(listOffset === 0) {
          $(this).addClass('hidden');
        }
        $(this).closest('.js--honor-roll-pagination').find('.js--pagination-next').removeClass('hidden');
        $targetList.data('offset', listOffset);
      });
      $('.js--honor-roll-pagination .js--pagination-next').click(function(e) {
        e.preventDefault();
        
        var $targetList = $(this).closest('.honor-roll').find('.custom-honor-roll'), 
        listOffset = Number($targetList.data('offset')) + 1;
        $targetList.find('.content__table--row').addClass('hidden');
        $targetList.find('.content__table--row').each(function(rowIndex) {
          if(rowIndex > ((listOffset * 7) - 1) && rowIndex < ((listOffset + 1) * 7)) {
            $(this).removeClass('hidden');
          }
        });
        if($targetList.find('.content__table--row:gt(' + (((listOffset + 1) * 7) - 1) + ')').length === 0) {
          $(this).addClass('hidden');
        }
        $(this).closest('.js--honor-roll-pagination').find('.js--pagination-prev').removeClass('hidden');
        $targetList.data('offset', listOffset);
      });
    }
  })();
  
  /* **** */
  /* FAQs */
  /* **** */
  
  (function() {
    /* handle FAQ prize state list */
    if($('.js--state-prize-list').length > 0) {
      $('.js--state-prize-list').change(function() {
        var eventPrizeUrl = $(this).val();
        if(eventPrizeUrl && eventPrizeUrl != '') {
          window.location = eventPrizeUrl;
        }
      });
    }
  })();
  
  /* ************* */
  /* Donation Form */
  /* ************* */
  
  (function() {
    if($('body').is('.app-9')) {
      /* move donation total to bottom of the form */
      var getTotalAmount = function() {
        var totalAmount = Number($('#level_flexible_row .donation-level-total-amount').text().replace('$', '').replace(/,/g, '')) * 100, 
        $giftType = $('input[name="level_flexiblegift_type"]:checked');
        
        if($giftType && $giftType.val() === '2') {
          var giftDuration = $('#level_flexibleduration').val();
          if(giftDuration && giftDuration.split(':')[1]) {
            totalAmount = totalAmount / Number(giftDuration.split(':')[1]);
          }
        }
        
        $('.button-container .donation-level-total-amount').text(adarda.formatMoney(totalAmount));
      };
      addOnLoadHandler(function() {
        $('#pstep_finish').before('<div id="level_flexibletotal_row" class="well clearfix">' + 
                                    '<span class="donation-level-total-label">' + 
                                      'Today\'s Payment Amount:' + 
                                    '</span> ' + 
                                    '<span class="donation-level-total-amount pull-right"></span>' + 
                                  '</div>');
        if(!(/mobile|android/i.test(navigator.userAgent))) {
          setTimeout(getTotalAmount, 2000);
        }
        else {
          $('#level_flexible_row .input--dynamic:checked').change();
        }
      });
      
      // Only bind if ask string has not been modified for mobile
      if(!(/mobile|android/i.test (navigator.userAgent))) {
        $('#level_flexible_row').change(function() {
          setTimeout(getTotalAmount, 1000);
        });
      }
      
      // Update ask string on mobile
      var replaceLevels = function(levels) {
        var levelTemplate = '<div class="donation-level-container">' + 
                              '<div class="form-content">' + 
                                '<div class="donation-level-input-container form-input">' + 
                                  '<div class="radio">' + 
                                    '<label for="level_flexibleexpanded%%val%%">' + 
                                      '<input type="radio" name="level_flexibleexpanded" ' + 
                                        'id="level_flexibleexpanded%%val%%" value="%%val%%" ' + 
                                        'class="input--dynamic">' + 
                                      '<div class="donation-level-amount-container">' + 
                                        '&nbsp;$%%val%%' + 
                                      '</div>' +
                                    '</label>' + 
                                  '</div>' + 
                                '</div>' + 
                              '</div>' +
                            '</div> \n';
        
        // hide existing levels but keep other field visible
        $('.donation-levels .donation-level-container:not(:last-child)').hide();
        
        // add new levels
        $.each(levels, function() {
          var $level = $(levelTemplate.replace(/%%val%%/g, this.value));
          $('.donation-levels').prepend($level);
          
          // if this value should be checked and other amount radio is not already checked
          if(this.checked && !$('[name="level_flexibleexpanded"]').last().is(':checked')) {
            $('input[type="radio"]', $level).attr('checked', 'checked');
          }
        });
        
        // Update "Today's payment amount" using our own function
        $('#level_flexible_row input[name="level_flexibleexpanded"], .donation-level-user-entered input[type="text"]').unbind().change(function() {
          var $selected = $('#level_flexible_row input[name="level_flexibleexpanded"]:checked'), 
          value = $selected.is('.input--dynamic') ? $selected.val() : $('.donation-level-user-entered input[type="text"]').val();
          $('.donation-level-total-amount').text('$' + value);
        });
        
        // Hijack form submit to fill in other field with selected amount
        $('#ProcessForm').submit(function() {
          if(!$('[name="level_flexibleexpanded"]:last').is(':checked')) {
            $('.donation-level-user-entered input').val($('[name="level_flexibleexpanded"]:checked').val());
            $('[name="level_flexibleexpanded"]').last().attr('checked', 'checked');
            
            return true;
          }
        });
      };
      
      $(function() {
        // Define new ask string. Mobile and desktop users get different versions.
        if((/mobile|android/i.test (navigator.userAgent))) {
          replaceLevels([{
            'value': '35'
          }, 
          {
            'value': '75', 
            'checked': true
          }, 
          {
            'value': '150'
          },
          {
            'value': '250'
          }]);
        }
      });
      
      /* update matching gift empty error message */
      if(luminateExtend.global.chapter && luminateExtend.global.chapter.email && luminateExtend.global.chapter.email != '') {
        $('.js--matching-gift-empty-error').html('Contact the adarda office at ' + luminateExtend.global.chapter.email + 
                                                 (luminateExtend.global.chapter.phone && luminateExtend.global.chapter.phone != '' ? 
                                                  (' or ' + luminateExtend.global.chapter.phone) : '') + ' if you need assistance.');
      }
    }
  })();
})(jQuery);
// END https://act.alz.org/ridepc/js/ride-main.js.gz

// BEGIN https://act.alz.org/ridepc/js/participant-center.js.gz
var photoEditor, dtContacts;
(function($) {
  /* ********* */
  /* namespace */
  /* ********* */
  
  adarda.trpc = {};
  
  /* constituent information */
  adarda.trpc.cons = {
    /* the constituent's profile information */
    /* cached as of the time the constituent logs in */
    profile: {
      /* id: cons_id */
      /* name: { */
      /*   first: constituent's first name */
      /*   last: constituent's last name */
      /* } */
    }
  };
  
  /* teamraiser event information */
  adarda.trpc.teamraiser = {
    /* example for fr_id 1234: */
    /* 1234: { */
    /*   name: public event name, set at login */
    /*   date: raw event date in ISO-8601 format, set at login */
    /*   dateFriendly: event date formatted as "MMMM d, yyyy", set at login */
    /*   time: event time from the "Event Schedule" field on the Greeting page */
    /*   locationName: event location name, set at login */
    /* } */
  };
  
  /* teamraiser configuration */
  adarda.trpc.teamraiserConfig = {
    /* example for fr_id 1234: */
    /* 1234: { */
    /*   adminNewsFeedsEnabled: boolean */
    /*   defaultStationeryId: ID of the default stationery if one is defined */
    /*   offlineTeamGifts: string indicating who may enter offline gifts, e.g. "CAPTAINS" or "MEMBERS" */
    /*   personalOfflineGiftsAllowed: boolean */
    /*   teamCaptainsMaximum: the maximum number of captains allowed per team */
    /*   teamGiftsAllowed: boolean */
    /* } */
  };
  
  /* teamraiser registration information */
  adarda.trpc.teamraiserRegistration = {
    /* example for fr_id 1234: */
    /* 1234: { */
    /*   aTeamCaptain: boolean */
    /*   lastPC2Login: timestamp of the last time the participant logged in */
    /*   receiveGiftNotification: boolean */
    /*   teamId: ID of the constituent's team */
    /*   teamName: name of the constituent's team, set by separate call to getTeamsByInfo */
    /* } */
  };
  
  /* the participant's address book contacts */
  adarda.trpc.contacts = {
    autoComplete: []
  };
  
  /* the currently selected teamraiser's fr_id */
  // adarda.trpc.frId = $('body').data('fr-id');
  adarda.trpc.frId = $('#pc-container').data('frid');
  
  /* the currently loaded view */
  adarda.trpc.currentView = undefined;
  
  /* the current hash */
  adarda.trpc.currentHash = undefined;
  
  /* a boolean indicating if the page encountered an error while loading */
  adarda.trpc.pageLoadError = false;
  
  /* rsvp information */
  adarda.trpc.rsvp = {
    event_id: undefined,
    link: undefined
  };

  /* *************** */
  /* private methods */
  /* *************** */
  
  /* show/hide loading indicator */
  var showLoading = function() {
    // $('.js__pc-loading-modal').show();
    $('.js__pc-loading-modal').modal('show');
  }, 
  hideLoading = function() {
    // $('.js__pc-loading-modal').hide();
    $('.js__pc-loading-modal').modal('hide');
    $('.modal-backdrop').not('.js--popover-modal-backdrop').remove();
  }, 
  
  /* scroll to the top of the window */
  scrollToTop = function() {
    // window.scrollTo(0, document.body.scrollHeight);
    window.scrollTo(0,0);

  }, 
  deleteCookie = function(name){
      document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  },
  /* get the specified query parameter */
  getQueryParam = function(paramName) {
    var queryString = window.location.search.replace('?', '&');
    if(queryString.indexOf('&' + paramName + '=') === -1) {
      return undefined;
    }
    else {
      return queryString.split('&' + paramName + '=')[1].split('&')[0];
    }
  }, 
  
  /* ping the server to keep the user's session from timing out */
  keepAlive = function() {
    if(adarda.trpc.cons.profile.id) {
      $.ajax({
        url: luminateExtend.global.path.secure + 'AjaxHelper?pgwrap=n'
      });
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) { navigator.serviceWorker.controller.postMessage('start'); }
    }
  },  
  startKeepAlive = function(noPing) {
    if(adarda.trpc.extendKeepAliveTimer) {
      clearTimeout(adarda.trpc.extendKeepAliveTimer);
      delete adarda.trpc.extendKeepAliveTimer;
    }
    if(adarda.trpc.extendKeepAliveTimer2) {
      clearTimeout(adarda.trpc.extendKeepAliveTimer2);
      delete adarda.trpc.extendKeepAliveTimer2;
    }
    if(adarda.trpc.extendKeepAliveTimer3) {
      clearTimeout(adarda.trpc.extendKeepAliveTimer3);
      delete adarda.trpc.extendKeepAliveTimer3;
    }
    
    if(!noPing) {
      keepAlive();
    }
    
    pollKeepAlive();
  }, 
  pollKeepAlive = function() {
    /* extend the session automatically after 10 minutes */
    adarda.trpc.extendKeepAliveTimer = setTimeout(function() {
      keepAlive();
    }, 600000);
    
    /* extend the session automatically after 20 minutes */
    adarda.trpc.extendKeepAliveTimer2 = setTimeout(function() {
      keepAlive();
    }, 1200000);
    
    /* extend the session automatically after 30 minutes */
    adarda.trpc.extendKeepAliveTimer3 = setTimeout(function() {
      keepAlive();
    }, 1800000);
  }, 
  /* ping the server to keep the user's self-donor status up to date */
  checkSelfDonor = function() {
    if(adarda.trpc.cons.profile.id) {	  
      getRegCallback = {
        success: function(response) {
          var reg = response.getRegistrationResponse;
		  if (reg && reg.registration) {
			if (reg.registration.selfDonor === 'true') {
			  $('.selfDonorCompleted').removeClass('hidden');
			  $('.selfDonorNotCompleted').hide();
			}
		  }
        }, 
        error: handleApiError
      };
	  
      adarda.trpc.api.teamraiser.getRegistration({
        callback: {
          success: function(response) {
            getRegCallback.success(response);
          }, 
          error: function(response) {
            getRegCallback.error(response);
          }
        }
      });
    }
  },
  
  /* handle API errors caused by user not being logged in */
  handleApiError = function(response) {
    $('.handleApiErrorMsg').html('');
    if (response && response.errorResponse && (response.errorResponse.code != '204')) { $('.handleApiErrorMsg').html('Please report this error code to our site admin or your chapter staff: ' + response.errorResponse.code); }
    if($.inArray(response.errorResponse.code, ['3', '5', '14', '204', '2604']) > -1 && !adarda.trpc.pageLoadError) {
      if(!$('#pc-container').is('.js--has-auth-error')) {
        /* hide any modals or dialogs that are open */
        $('.modal').modal('hide');
        walk.dialogOverlayClose();
        
        $('#pc-container').addClass('js--has-auth-error');
        
        adarda.trpc.currentView = undefined;
        adarda.trpc.currentHash = undefined;
        
        if(luminateExtend.global.auth.token) {
          delete luminateExtend.global.auth.token;
        }
        if(luminateExtend.global.sessionCookie) {
          delete luminateExtend.global.sessionCookie;
        }
        
        adarda.trpc.api.cons.logout({
          callback: function() {
            /* trigger custom event */
            $(document).trigger('logout');
          }
        });
      }
      
      return false;
    }
    
    return response;
  }, 
  
  /* show a generic error message when something unknown goes wrong and prevents the page from loading */
  showGenericPageError = function() {
    adarda.trpc.pageLoadError = true;
    
    /* hide any modals or dialogs that are open */
    $('.modal').modal('hide');
    walk.dialogOverlayClose();
    
    adarda.trpc.view('page-error');
    $('#page-error-view').append($('<div>Error: genericPageError</div>'));
  }, 
  
  /* check to see if the user is currently logged in */
  testLoginStatus = function() {
    if(!$('#pc-container').is('.js--has-auth-error') && !$('#pc-container').is('.js--login-test-pending')) {
      $('#pc-container').addClass('js--login-test-pending');
      
      adarda.trpc.api.cons.loginTest({
        callback: {
          success: function(response) {
            if(adarda.trpc.cons.profile.id && adarda.trpc.cons.profile.id != response.loginResponse.cons_id) {
              location.reload();
            }
            else {
              adarda.trpc.api.teamraiser.getRecentActivity({
                callback: {
                  success: function(response) {
                    $('#pc-container').removeClass('js--login-test-pending');
                    
                    startKeepAlive(true);
                  }, 
                  error: function(response) {
                    $('#pc-container').removeClass('js--login-test-pending');
                    
                    handleApiError(response);
                  }
                }
              });
            }
          }, 
          error: function(response) {
            $('#pc-container').removeClass('js--login-test-pending');
            
            handleApiError(response);
          }
        }
      });
    }
  }, 
  
  /* take a monetary amount as a string and return it in cents */
  moneyToCents = function(dollarAmountString) {
    return Number(dollarAmountString.replace(/\$/g, '').replace(/,/g, '')) * 100;
  }, 
  
  /* set a text editor's content */
  setEditorContent = function(editor, editorContent) {
    var $editor = $(editor);
    
    $editor.jqteVal(editorContent);
    $editor.closest('.jqte').removeClass('jqte-placeholder').find('.jqte_editor').keydown();
  }, 
  
  /* reset a text editor's content to its placeholder */
  resetEditorContent = function(editor) {
    var $editor = $(editor), 
    editorContent = '';
    
    if($editor.is('textarea[placeholder]')) {
      editorContent = $editor.attr('placeholder');
    }
    
    setEditorContent(editor, editorContent);
    
    $editor.closest('.jqte').addClass('jqte-placeholder');
  }, 
  
  /* sanitize a text editor's content */
  getEditorContent = function(editor) {
    var $editor = $(editor);
    
    var editorContent = $editor.val().replace(/<\/?[A-Z]+.*?>/g, function(m) {
                          return m.toLowerCase();
                        })
                        .replace(/<font>/g, '<span>').replace(/<font /g, '<span ').replace(/<\/font>/g, '</span>')
                        .replace(/<b>/g, '<strong>').replace(/<b /g, '<strong ').replace(/<\/b>/g, '</strong>')
                        .replace(/<i>/g, '<em>').replace(/<i /g, '<em ').replace(/<\/i>/g, '</em>')
                        .replace(/<u>/g, '<span style="text-decoration: underline;">').replace(/<u /g, '<span style="text-decoration: underline;" ').replace(/<\/u>/g, '</span>')
                        .replace(/[\u00A0-\u9999\&]/gm, function(i) {
                          return '&#' + i.charCodeAt(0) + ';';
                        })
                        .replace(/&#38;/g, '&')
                        .replace(/<!--[\s\S]*?-->/g, '');
    
    if($editor.is('textarea[placeholder]') && 
       $.trim($('<div>' + editorContent + '</div>').text()) === $editor.attr('placeholder')) {
      editorContent = '';
    }
    
    return editorContent;
  }, 
  
  /* save a draft email using the current content */
  saveDraftEmail = function() {
    var $emailSubject = $('#email-subject'), 
    emailSubject = $emailSubject.val(), 
    prevEmailSubject = $emailSubject.data('prevvalue') || emailSubject, 
    $emailMessageBody = $('#email-message-body'), 
    emailMessageBody = $emailMessageBody.val(), 
    prevEmailMessageBody = $emailMessageBody.data('prevvalue') || emailMessageBody;
    
    if(emailSubject != '' && 
       (emailSubject != prevEmailSubject || 
        emailMessageBody != prevEmailMessageBody)) {
      var draftApiMethod = 'addDraft', 
      messageId = $('#email-compose-draft').val();
      
      if(messageId != '') {
        draftApiMethod = 'updateDraft';
      }
      
      startKeepAlive(true);
      
      $('.email__compose-saving').html('Saving ...');
      
      if(adarda.trpc.draftStatusTimestamp) {
        delete adarda.trpc.draftStatusTimestamp;
      }
      
      adarda.trpc.draftStatusTimestamp = new Date().getTime();
      
      adarda.trpc.api.teamraiser[draftApiMethod]({
        data: 'message_id=' + messageId + 
              '&message_body=' + encodeURIComponent(getEditorContent('#email-message-body')), 
        form: '#email-compose-form', 
        callback: {
          success: function(response) {
            var messageInfo = response[draftApiMethod + 'Response'].message, 
            messageId = messageInfo.messageId;
            
            $('#email-compose-draft').val(messageId);
            
            if(adarda.trpc.draftStatusTimestamp) {
              var currentTime = new Date().getTime(), 
              timeSaving = currentTime - adarda.trpc.draftStatusTimestamp;
              if(timeSaving > 2000) {
                delete adarda.trpc.draftStatusTimestamp;
                $('.email__compose-saving').html('All changes saved in Drafts');
              }
              else {
                delete adarda.trpc.draftStatusTimestamp;
                setTimeout(function() {
                  if(!adarda.trpc.draftStatusTimestamp && $('#email-compose-draft').val() != '') {
                    $('.email__compose-saving').html('All changes saved in Drafts');
                  }
                }, 2000 - timeSaving);
              }
            }
          }, 
          error: function(response) {
            if(handleApiError(response)) {
              $('.email__compose-saving').html('');
            }
          }
        }
      });
    }
    
    $emailSubject.data('prevvalue', emailSubject);
    $emailMessageBody.data('prevvalue', emailMessageBody);
    
    if(adarda.trpc.saveDraftEmailTimer) {
      clearTimeout(adarda.trpc.saveDraftEmailTimer);
      delete adarda.trpc.saveDraftEmailTimer;
    }
  }, 
  
  /* poll to see if draft should be saved */
  pollSaveDraftEmail = function() {
    if(!adarda.trpc.saveDraftEmailTimer) {
      adarda.trpc.saveDraftEmailTimer = setTimeout(function() {
        saveDraftEmail();
      }, 5000);
    }
  }, 
  
  /* save selected contacts to local storage */
  saveSelectedContacts = function() {
    testLoginStatus();
    
    if(Modernizr.localstorage) {
      /* TODO */
    }
    
    if(adarda.trpc.saveSelectedContactsTimer) {
      clearTimeout(adarda.trpc.saveSelectedContactsTimer);
      delete adarda.trpc.saveSelectedContactsTimer;
    }
  }, 
  
  /* poll to see if the list of selected contacts should be saved to local storage */
  pollSaveSelectedContacts = function() {
    if(!adarda.trpc.saveSelectedContactsTimer) {
      adarda.trpc.saveSelectedContactsTimer = setTimeout(function() {
        saveSelectedContacts();
      }, 5000);
    }
  }, 
  
  /* save personal/team/company page to local storage */
  savePageContent = function() {
    var $personalPageHeadline = $('#edit-personal-page-title'), 
    personalPageHeadline = $personalPageHeadline.val(), 
    prevPersonalPageHeadline = $personalPageHeadline.data('prevvalue') || personalPageHeadline, 
    $personalPageBody = $('#edit-personal-page-body'), 
    personalPageBody = $personalPageBody.val(), 
    prevPersonalPageBody = $personalPageBody.data('prevvalue') || personalPageBody, 
    $teamPageBody = $('#edit-team-page-body'), 
    teamPageBody = $teamPageBody.val(), 
    prevTeamPageBody = $teamPageBody.data('prevvalue') || teamPageBody, 
    $companyPageBody = $('#edit-company-page-body'), 
    companyPageBody = $companyPageBody.val(), 
    prevCompanyPageBody = $companyPageBody.data('prevvalue') || companyPageBody;
    
    if(personalPageHeadline != prevPersonalPageHeadline || 
       personalPageBody != prevPersonalPageBody || 
       teamPageBody != prevTeamPageBody || 
       companyPageBody != prevCompanyPageBody) {
      testLoginStatus();
      
      if(Modernizr.localstorage) {
        /* TODO */
      }
    }
    
    $personalPageHeadline.data('prevvalue', personalPageHeadline);
    $personalPageBody.data('prevvalue', personalPageBody);
    $teamPageBody.data('prevvalue', teamPageBody);
    $companyPageBody.data('prevvalue', companyPageBody);
    
    if(adarda.trpc.savePageContentTimer) {
      clearTimeout(adarda.trpc.savePageContentTimer);
      delete adarda.trpc.savePageContentTimer;
    }
  }, 
  
  /* poll to see if personal/team/company page content should be saved to local storage */
  pollSavePageContent = function() {
    if(!adarda.trpc.savePageContentTimer) {
      adarda.trpc.savePageContentTimer = setTimeout(function() {
        savePageContent();
      }, 15000);
    }
  };
  
  /* ************** */
  /* public methods */
  /* ************** */
  
  /* load the specified view */
  adarda.trpc.view = function(viewName, isPopState) {
    /* convert default PC2 pages to correct view */
    switch(viewName) {
      case 'center':
        viewName = 'pc-dashboard';
        break;
      case 'progress':
        viewName = 'pc-donors';
        break;
      case 'tprogress':
        viewName = 'pc-donors';
        break;
      case 'mtype':
        viewName = 'pc-email';
        break;
      case 'peditor':
        viewName = 'pc-edit-page';
        break;
      case 'social':
        viewName = 'pc-social';
        break;
      case 'resources':
        viewName = 'pc-resources';
        break;
        case 'community':
        viewName = 'pc-community';
        break;
      case 'support':
        viewName = 'pc-support';
        break;
      case 'badges':
        viewName = 'pc-badges';
        break;
      case 'team':
        viewName = 'pc-team-roster';
        break;
    }

    if (getQueryParam('setTab')) {
      var origPage = getQueryParam('pc2_page');
    }
    
    if(viewName != adarda.trpc.currentView || viewName === 'pc-notifications') {
      scrollToTop();
      
      /* hide all views except the one specified */
      $('.view-container').addClass('hidden');
      $('#' + viewName + '-view').removeClass('hidden');
      
      /* trigger custom events */
      $(document).trigger('view:' + viewName);
      
      /* mark the new view as loaded */
      $('#' + viewName + '-view').addClass('view-loaded');
      
      /* set tab of the loading page if set in URL */
      if (getQueryParam('setTab')) {
        $('.nav-tabs a[href="#'+origPage.replace('pc-','').replace('-','')+'__'+getQueryParam('setTab')+'"]').click();
      }

      if(window.history && history.pushState && !isPopState) {
        /* convert views to default PC2 pages */
        var pc2Page = viewName;
        switch(viewName) {
          case 'pc-dashboard':
            pc2Page = 'center';
            break;
          case 'pc-email':
            pc2Page = 'mtype';
            break;
          case 'pc-resources':
            pc2Page = 'resources';
            break;
            case 'pc-community':
            pc2Page = 'community';
            break;
          case 'pc-edit-page':
            pc2Page = 'peditor';
            break;
        }
        
        var viewUrl = window.location.href.split('?')[0] + 
                      '?pagename=' + getQueryParam('pagename') + 
                      '&pc2_page=' + pc2Page + 
                      '&fr_id=' + adarda.trpc.frId + 
                      ($('.js__registration-thank-you-dialog').length === 1 ? '&reg=completed' : '') +
                      (window.location.hash != adarda.trpc.currentHash ? window.location.hash : '');
        history.pushState({
          view: viewName
        }, '', viewUrl);
      }
      
      adarda.trpc.currentView = viewName;
      adarda.trpc.currentHash = window.location.hash;
    }
    
    /* trigger custom events */
    $(document).trigger('viewchange', viewName);
  };
  
  /* api methods */
  adarda.trpc.api = {
    /* constituent */
    cons: {
      /* used to test if the constituent is currently logged in */
      /* note that this API method can return somewhat of a false positive */
      /* it checks if the user is logged in via either password or cookie login */
      /* however, the TeamRaiser API does not currently allow cookie logins */
      loginTest: function(options) {
        var settings = $.extend({
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'cons', 
          useHTTPS: true, 
          data: 'method=loginTest', 
          callback: settings.callback
        });
      }, 
      
      /* used to log a constituent out */
      logout: function(options) {
        var settings = $.extend({
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'cons', 
          useHTTPS: true, 
          data: 'method=logout', 
          callback: settings.callback
        });
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) { navigator.serviceWorker.controller.postMessage('stop'); }
      }, 
      
      /* used to retrieve profile information for the logged in constituent */
      getUser: function(options) {
        var settings = $.extend({
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'cons', 
          useHTTPS: true, 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=getUser', 
          callback: settings.callback
        });
      }, 
      
      /* listUserFields */
      /* used to retrieve a list of constituent profile fields */
      /* the list is sorted by field group */
      listUserFields: function(options) {
        var settings = $.extend({
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'cons', 
          useHTTPS: true, 
          requiresAuth: true, 
          data: 'method=listUserFields&include_choices=true&sort_order=group', 
          callback: settings.callback
        });
      }, 
      
      /* update */
      /* used to update profile information for the logged in constituent */
      update: function(options) {
        var settings = $.extend({
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'cons', 
          useHTTPS: true, 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=update' + 
                (settings.data ? ('&' + settings.data) : ''), 
          form: settings.form, 
          callback: settings.callback
        });
      }, 
      
      /* changePassword */
      /* used to update password for the logged in constituent */
      changePassword: function(options) {
        var settings = $.extend({
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'cons', 
          useHTTPS: true, 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=changePassword' + 
                (settings.data ? ('&' + settings.data) : ''), 
          form: settings.form, 
          callback: settings.callback
        });
      }, 
      
      /* getUserInteractions */
      /* get a list of interactions for the logged in constituent */
      getUserInteractions: function(options) {
        var settings = $.extend({
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'cons', 
          useHTTPS: true, 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=getUserInteractions' + 
                (settings.data ? ('&' + settings.data) : ''), 
          form: settings.form, 
          callback: settings.callback
        });
      }, 
      
      /* listInteractions */
      /* get a list of interactions for all constituents */
      /* by default, 250 interactions are returned */
      listInteractions: function(options) {
        var settings = $.extend({
          listPageSize: 250, /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'cons', 
          useHTTPS: true, 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=listInteractions' + 
                (settings.typeId ? ('&interaction_type_id=' + settings.typeId) : '') + 
                (settings.subject ? ('&interaction_subject=' + settings.subject) : '') + 
                '&list_page_size=' + settings.listPageSize, 
          form: settings.form, 
          callback: settings.callback
        });
      }, 
      
      /* logInteraction */
      /* record an interaction for the logged in constituent */
      logInteraction: function(options) {
        var settings = $.extend({
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'cons', 
          useHTTPS: true, 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=logInteraction' + 
                (settings.data ? ('&' + settings.data) : ''), 
          callback: settings.callback
        });
      }, 
      
      /* updateInteraction */
      /* update an interaction previously recorded by the logged in constituent */
      updateInteraction: function(options) {
        var settings = $.extend({
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'cons', 
          useHTTPS: true, 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=updateInteraction' + 
                (settings.data ? ('&' + settings.data) : ''), 
          callback: settings.callback
        });
      }
    }, 
    
    /* teamraiser */
    /* methods which require an fr_id default to using the value stored in adarda.trpc.frId */
    teamraiser: {
      /* used to retrieve a list of recenty activity for the participant */
      getRecentActivity: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          data: 'method=getRecentActivity&fr_id=' + settings.frId, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve the configuration info for the specified teamraiser */
      getTeamraiserConfig: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          data: 'method=getTeamraiserConfig&fr_id=' + settings.frId, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve the constituent's registration info for the specified teamraiser */
      getRegistration: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=getRegistration&fr_id=' + settings.frId, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve a list of team's for the specified teamraiser */
      /* optionally, filter by a specific teamId */
      getTeamsByInfo: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          listAscending: 'true', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          data: 'method=getTeamsByInfo&fr_id=' + settings.frId + 
                (settings.teamId ? ('&team_id=' + settings.teamId) : '') + 
                (settings.companyId ? ('&team_company_id=' + settings.companyId) : '') + 
                (settings.firstName ? ('&first_name=' + settings.firstName) : '') +
                (settings.lastName ? ('&last_name=' + settings.lastName) : '') +
                (settings.teamName ? ('&team_name=' + settings.teamName) : '') +
                (settings.listSortColumn ? 
                 ('&list_sort_column=' + settings.listSortColumn + 
                  '&list_ascending=' + settings.listAscending) : '') + 
                (settings.listPageSize ? ('&list_page_size=' + settings.listPageSize) : '') + 
                (settings.listPageOffset ? ('&list_page_offset=' + settings.listPageOffset) : ''), 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve the constituent's personal, and team fundraising progress */
      getParticipantProgress: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          data: 'method=getParticipantProgress&fr_id=' + settings.frId, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve a list of news feed items */
      getNewsFeeds: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          feedCount: 1, /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=getNewsFeeds&fr_id=' + settings.frId + '&feed_count=' + settings.feedCount + 
                (adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] !== undefined ? '&last_pc2_login=' + adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].lastPC2Login : ''), 
          callback: settings.callback
        });
      }, 
      
      /* used to update the participant's registration information */
      updateRegistration: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=updateRegistration&fr_id=' + settings.frId + 
                (settings.data ? ('&' + settings.data) : ''), 
          callback: settings.callback
        });
      }, 

      /* used to update the participant's personal page privacy */
      updatePersonalPagePrivacy: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=updatePersonalPagePrivacy&fr_id=' + settings.frId + 
                (settings.data ? ('&' + settings.data) : ''), 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve a list of team captains and co-captains */
      getTeamCaptains: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          teamId: adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          data: 'method=getTeamCaptains&fr_id=' + settings.frId + 
                '&team_id=' + settings.teamId, 
          callback: settings.callback
        });
      },
      
      /* used to set a list of team captains and co-captains */
      setTeamCaptains: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          teamId: adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          data: 'method=setTeamCaptains&fr_id=' + settings.frId + 
                '&team_id=' + settings.teamId +
                '&captains=' + options.captains, 
          callback: settings.callback
        });
      },
      
      /* used to mark a gift as acknowledged */
      acknowledgeGifts: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          contactId: '', /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=acknowledgeGifts&fr_id=' + settings.frId + 
                '&contact_id=' + settings.contactId, 
          callback: settings.callback
        });
      }, 
      
      /* used to delete an unconfirmed offline gift */
      deleteGift: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=deleteGift&fr_id=' + settings.frId, 
          form: settings.form, 
          callback: settings.callback
        });
      }, 
      
      /* used to record an offline donation to the participant or team */
      addGift: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=addGift&fr_id=' + settings.frId + 
                (settings.data ? ('&' + settings.data) : ''), 
          form: settings.form, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve a list of filters to be used with the contacts list */
      getTeamraiserAddressBookFilters: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requiresAuth: true, 
          data: 'method=getTeamraiserAddressBookFilters&fr_id=' + settings.frId + 
                '&include_past_teammates_filters=true&include_returning_team_filters=true' + 
                '&count_contacts=true', 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve a list of the participant's existing contacts */
      /* by default, contacts are returned in ascending order by first name */
      /* optionally, filters can be applied to return a subset of contacts, */
      /* and the sort column and order can be overriden */
      getTeamraiserAddressBookContacts: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          trAbFilter: 'all', /* optional */
          listSortColumn: 'firstName', /* optional */
          listAscending: 'true', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requiresAuth: true, 
          data: 'method=getTeamraiserAddressBookContacts&fr_id=' + settings.frId + 
                '&tr_ab_filter=' + settings.trAbFilter + 
                (settings.listFilterText ? ('&list_filter_text=' + settings.listFilterText) : '') + 
                '&list_sort_column=' + settings.listSortColumn + 
                '&list_ascending=' + settings.listAscending + 
                (settings.listPageSize ? ('&list_page_size=' + settings.listPageSize) : ''), 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve a single contact from the participant's address book */
      getTeamraiserAddressBookContact: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          contactId: '', /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requiresAuth: true, 
          data: 'method=getTeamraiserAddressBookContact&fr_id=' + settings.frId + 
                '&contact_id=' + settings.contactId, 
          callback: settings.callback
        });
      }, 
      
      /* used to delete the specified contacts from the participant's address book */
      deleteTeamraiserAddressBookContacts: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          contactIds: '', /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=deleteTeamraiserAddressBookContacts&fr_id=' + settings.frId + 
                '&contact_ids=' + settings.contactIds, 
          form: settings.form, 
          callback: settings.callback
        });
      }, 
      
      /* used to update a contact's information in the participant's address book */
      updateTeamraiserAddressBookContact: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=updateTeamraiserAddressBookContact&fr_id=' + settings.frId, 
          form: settings.form, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve a list of suggested messages for the specified teamraiser */
      getSuggestedMessages: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requiresAuth: true, 
          data: 'method=getSuggestedMessages&fr_id=' + settings.frId, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve a list of the constituent's drafts for the specified teamraiser */
      getDrafts: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          listPageSize: '25', /* optional */
          listPageOffset: '0', /* optional */
          listSortColumn: 'modify_date', /* optional */
          listAscending: 'false', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requiresAuth: true, 
          data: 'method=getDrafts&fr_id=' + settings.frId + 
                '&list_page_size=' + settings.listPageSize + 
                '&list_page_offset=' + settings.listPageOffset + 
                '&list_sort_column=' + settings.listSortColumn + 
                '&list_ascending=' + settings.listAscending, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve a list of the constituent's sent messages for the specified teamraiser */
      getSentMessages: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          listPageSize: '25', /* optional */
          listPageOffset: '0', /* optional */
          listSortColumn: 'log.date_sent', /* optional */
          listAscending: 'false', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requiresAuth: true, 
          data: 'method=getSentMessages&fr_id=' + settings.frId + 
                '&list_page_size=' + settings.listPageSize + 
                '&list_page_offset=' + settings.listPageOffset + 
                '&list_sort_column=' + settings.listSortColumn + 
                '&list_ascending=' + settings.listAscending, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve the specified suggested message */
      getSuggestedMessage: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          messageId: '', /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requiresAuth: true, 
          data: 'method=getSuggestedMessage&fr_id=' + settings.frId + 
                '&message_id=' + settings.messageId, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve the specified draft */
      getDraft: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          messageId: '', /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requiresAuth: true, 
          data: 'method=getDraft&fr_id=' + settings.frId + 
                '&message_id=' + settings.messageId, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve the specified sent message */
      getSentMessage: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          messageId: '', /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requiresAuth: true, 
          data: 'method=getSentMessage&fr_id=' + settings.frId + 
                '&message_id=' + settings.messageId, 
          callback: settings.callback
        });
      }, 
      
      /* used to build the list of stationeries for the TeamRaiser */
      getMessageLayouts: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requiresAuth: true, 
          data: 'method=getMessageLayouts&fr_id=' + settings.frId, 
          callback: settings.callback
        });
      }, 
      
      /* used to save a new draft */
      /* the message data can be provided as a data string */
      /* alternatively, a selector can be provided for an email form to be serialized */
      addDraft: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=addDraft&fr_id=' + settings.frId + 
                (settings.data ? ('&' + settings.data) : ''), 
          form: settings.form, 
          callback: settings.callback
        });
      }, 
      
      /* used to save an update to an existing draft */
      /* the message data can be provided as a data string */
      /* alternatively, a selector can be provided for an email form to be serialized */
      updateDraft: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=updateDraft&fr_id=' + settings.frId + 
                (settings.data ? ('&' + settings.data) : ''), 
          form: settings.form, 
          callback: settings.callback
        });
      }, 
      
      /* used to delete a draft */
      deleteDraft: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          messageId: '', /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=deleteDraft&fr_id=' + settings.frId + 
                '&message_id=' + settings.messageId, 
          callback: settings.callback
        });
      }, 
      
      /* used to delete a sent message */
      deleteSentMessage: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          messageId: '', /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=deleteSentMessage&fr_id=' + settings.frId + 
                '&message_id=' + settings.messageId, 
          callback: settings.callback
        });
      }, 
      
      /* used to preview an email */
      /* the message data can be provided as a data string */
      /* alternatively, a selector can be provided for an email form to be serialized */
      previewMessage: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=previewMessage&fr_id=' + settings.frId + 
                (settings.data ? ('&' + settings.data) : ''), 
          form: settings.form, 
          callback: settings.callback
        });
      }, 
      
      /* used to send an email to a list of recipients */
      /* the message data can be provided as a data string */
      /* alternatively, a selector can be provided for an email form to be serialized */
      sendTafMessage: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=sendTafMessage&fr_id=' + settings.frId + 
                (settings.data ? ('&' + settings.data) : ''), 
          form: settings.form, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve the participant's personal page URL */
      getShortcut: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=getShortcut&fr_id=' + settings.frId, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to update the participant's personal page URL */
      updateShortcut: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=updateShortcut&fr_id=' + settings.frId, 
          form: settings.form, 
          requiresAuth: true, 
          callback: settings.callback
        });
      },
      
      /* used to retrieve the photos uploaded to the participant's personal page */
      getPersonalPhotos: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=getPersonalPhotos&fr_id=' + settings.frId, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve the video defined for the participant's personal page */
      getPersonalVideoUrl: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=getPersonalVideoUrl&fr_id=' + settings.frId, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to update the video for the participant's personal page */
      updatePersonalMediaLayout: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=updatePersonalMediaLayout&fr_id=' + settings.frId + '&personal_media_layout=' + ( $('#edit-personal-media-type').val().indexOf('video') != -1 ? 'video' : 'photos' ), 
          form: settings.form, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 

      /* used to update the video for the participant's personal page */
      updatePersonalVideoUrl: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=updatePersonalVideoUrl&fr_id=' + settings.frId, 
          form: settings.form, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to build the personal page content editor */
      getPersonalPageInfo: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=getPersonalPageInfo&fr_id=' + settings.frId, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to update the personal page content */
      updatePersonalPageInfo: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=updatePersonalPageInfo&fr_id=' + settings.frId + 
                (settings.data ? ('&' + settings.data) : ''), 
          form: settings.form, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve the participant's team page URL */
      getTeamShortcut: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=getTeamShortcut&fr_id=' + settings.frId, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to update the participant's team page URL */
      updateTeamShortcut: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=updateTeamShortcut&fr_id=' + settings.frId, 
          form: settings.form, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve the photo uploaded to the participant's team page */
      getTeamPhoto: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=getTeamPhoto&fr_id=' + settings.frId, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to build the team page content editor */
      getTeamPageInfo: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=getTeamPageInfo&fr_id=' + settings.frId, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to update the team page content */
      updateTeamPageInfo: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=updateTeamPageInfo&fr_id=' + settings.frId + 
                (settings.data ? ('&' + settings.data) : ''), 
          form: settings.form, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* team membership - join a team */
      joinTeam: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          teamId: '', /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=joinTeam&fr_id=' + settings.frId + 
                '&team_id=' + settings.teamId,
          callback: settings.callback
        });
      }, 
      
      /* team membership - leave team */
      leaveTeam: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=leaveTeam&fr_id=' + settings.frId,
          callback: settings.callback
        });
      }, 
      
      /* team membership - retrive company list */
      getCompanyList: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=getCompanyList&fr_id=' + settings.frId,
          callback: settings.callback
        });
      }, 
      
      /* team membership - retrive team divisions list */
      getDivisionsList: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=getTeamDivisions&fr_id=' + settings.frId,
          callback: settings.callback
        });
      },
      
      /* used to retrieve the participant's company page URL */
      getCompanyShortcut: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=getCompanyShortcut&fr_id=' + settings.frId, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to update the participant's company page URL */
      updateCompanyShortcut: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=updateCompanyShortcut&fr_id=' + settings.frId, 
          form: settings.form, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve the photo uploaded to the participant's company page */
      getCompanyPhoto: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=getCompanyPhoto&fr_id=' + settings.frId, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to build the company page content editor */
      getCompanyPageInfo: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=getCompanyPageInfo&fr_id=' + settings.frId, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to update the company page content */
      updateCompanyPageInfo: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          data: 'method=updateCompanyPageInfo&fr_id=' + settings.frId + 
                (settings.data ? ('&' + settings.data) : ''), 
          form: settings.form, 
          requiresAuth: true, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve a list of the participant's personal donations */
      /* by default, 25 donations are returned in descending order by date */
      /* optionally, the page size, sort column, and order can be overriden */
      getGifts: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          listPageSize: '25', /* optional */
          listPageOffset: '0', /* optional */
          listSortColumn: 'date_recorded', /* optional */
          listAscending: 'false', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=getGifts&fr_id=' + settings.frId + 
                '&list_page_size=' + settings.listPageSize + 
                '&list_page_offset=' + settings.listPageOffset + 
                '&list_sort_column=' + settings.listSortColumn + 
                '&list_ascending=' + settings.listAscending, 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve a list of the participant's team donations */
      /* by default, 25 donations are returned in descending order by date */
      /* optionally, the sort column and order can be overriden */
      getTeamGifts: function(options) {
        var settings = $.extend({
          frId: adarda.trpc.frId, /* required */
          listPageSize: '25', /* optional */
          listPageOffset: '0', /* optional */
          listSortColumn: 'date_recorded', /* optional */
          listAscending: 'false', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'teamraiser', 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=getTeamGifts&fr_id=' + settings.frId + 
                '&list_page_size=' + settings.listPageSize + 
                '&list_page_offset=' + settings.listPageOffset + 
                '&list_sort_column=' + settings.listSortColumn + 
                '&list_ascending=' + settings.listAscending, 
          callback: settings.callback
        });
      }
    }, 
    
    /* address book */
    addressbook: {
      /* used to get the URL to start online import for gmail and yahoo */
      startOnlineAddressBookImport: function(options) {
        var settings = $.extend({
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'addressbook', 
          useHTTPS: true, 
          requiresAuth: true, 
          data: 'method=startOnlineAddressBookImport' + 
                (settings.data ? ('&' + settings.data) : ''), 
          callback: settings.callback
        });
      }, 
      
      /* used to get the status for an address book import job by its ID */
      getAddressBookImportJobStatus: function(options) {
        var settings = $.extend({
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'addressbook', 
          useHTTPS: true, 
          requiresAuth: true, 
          data: 'method=getAddressBookImportJobStatus' + 
                (settings.jobId ? ('&import_job_id=' + settings.jobId) : ''), 
          callback: settings.callback
        });
      }, 
      
      /* used to retrieve the list of imported contacts for a job by its ID */
      getAddressBookImportContacts: function(options) {
        var settings = $.extend({
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'addressbook', 
          useHTTPS: true, 
          requiresAuth: true, 
          data: 'method=getAddressBookImportContacts' + 
                (settings.jobId ? ('&import_job_id=' + settings.jobId) : ''), 
          callback: settings.callback
        });
      }, 
      
      /* used to import a list of contacts */
      importAddressBookContacts: function(options) {
        var settings = $.extend({
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'addressbook', 
          useHTTPS: true, 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=importAddressBookContacts' + 
                (settings.contactsToAdd ? ('&contacts_to_add=' + encodeURIComponent(settings.contactsToAdd)) : ''), 
          callback: settings.callback
        });
      }, 
      
      /* used to add a contact to the constituent's address book */
      /* the contact data can be provided as a data string */
      /* alternatively, a selector can be provided for a contact form to be serialized */
      addAddressBookContact: function(options) {
        var settings = $.extend({
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'addressbook', 
          useHTTPS: true, 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=addAddressBookContact' + 
                (settings.data ? ('&' + settings.data) : ''), 
          form: settings.form, 
          callback: settings.callback
        });
      }, 
      
      /* used to add a new contact group to the constituent's address book */
      addAddressBookGroup: function(options) {
        var settings = $.extend({
          form: '', /* optional */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'addressbook', 
          useHTTPS: true, 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=addAddressBookGroup', 
          form: settings.form, 
          callback: settings.callback
        });
      }, 
      
      /* used to add specified contacts to a group */
      addContactsToGroup: function(options) {
        var settings = $.extend({
          groupId: '', /* required */
          contactIds: '', /* required */
          callback: $.noop /* optional */
        }, options || {});
        
        luminateExtend.api({
          api: 'addressbook', 
          useHTTPS: true, 
          requestType: 'POST', 
          requiresAuth: true, 
          data: 'method=addContactsToGroup&group_id=' + settings.groupId + 
                '&contact_ids=' + settings.contactIds, 
          callback: settings.callback
        });
      }
    }
  };
  
  /* ui methods */
  adarda.trpc.ui = {
    /* build the pc dashboard */
    buildDashboard: function() {
      /* set the days left until the event */
      var eventDate = new Date(luminateExtend.utils.simpleDateFormat(adarda.trpc.teamraiser['tr'+adarda.trpc.frId].date, 'yyyy'), 
                               Number(luminateExtend.utils.simpleDateFormat(adarda.trpc.teamraiser['tr'+adarda.trpc.frId].date, 'M')) - 1, 
                               luminateExtend.utils.simpleDateFormat(adarda.trpc.teamraiser['tr'+adarda.trpc.frId].date, 'd')), 
      daysToEvent = Math.ceil((eventDate - new Date()) / 86400000);
      if(daysToEvent > 0) {
        $('.js--days-left').html(daysToEvent + ' day' + (daysToEvent > 1 ? 's' : '') + ' left').removeClass('hidden');
      }
      
      adarda.trpc.api.teamraiser.getParticipantProgress({
        callback: {
          success: function(response) {
            /* build thermometers */
            var personalProgress = response.getParticipantProgressResponse.personalProgress, 
            teamProgress = response.getParticipantProgressResponse.teamProgress, 
            companyProgress = response.getParticipantProgressResponse.companyProgress;
            
            adarda.trpc.ui.buildPersonalThermometer(personalProgress.raised, personalProgress.goal, personalProgress.percent);
            $('#edit-goal-personal-goal').val(adarda.formatMoney(personalProgress.goal));
            
            if(teamProgress) {
              adarda.trpc.ui.buildTeamThermometer(teamProgress.raised, teamProgress.goal, teamProgress.percent);
              $('#edit-goal-team-goal').val(adarda.formatMoney(teamProgress.goal));
            }
            
            if(companyProgress && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.isCompanyCoordinator) {
              adarda.trpc.ui.buildCompanyThermometer(companyProgress.raised, companyProgress.goal, companyProgress.percent);
            }
          }, 
          error: handleApiError
        }
      });
      
      $('.js--steps-to-success .pc__module-content').filter(':even').addClass('pc__module-content--even');
      $('.js--steps-to-success .pc__module-content').filter(':odd').addClass('pc__module-content--odd');
      
      adarda.trpc.ui.buildDonationLists();
      
      if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].receiveGiftNotification) {
        $('.js--gift-notif-on').removeClass('hidden');
        $('.js--gift-notif-off').addClass('hidden');
        $('.gift-notif a').data('giftnotif','on');
      }
      else {
        $('.js--gift-notif-on').addClass('hidden');
        $('.js--gift-notif-off').removeClass('hidden');
        $('.gift-notif a').data('giftnotif','off');
      }
      
      /* reset news feed */
      $('.js--news-feed').addClass('hidden');
      $('.news-item').remove();
      
      if(adarda.trpc.teamraiserConfig['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserConfig['tr'+adarda.trpc.frId].adminNewsFeedsEnabled) {
        adarda.trpc.api.teamraiser.getNewsFeeds({
          callback: {
            success: function(response) {
              var newsFeeds = luminateExtend.utils.ensureArray(response.getNewsFeedsResponse.newsFeed);
              $.each(newsFeeds, function() {
                $('.js--news-items').append('<div class="news-item">' + 
                                              '<p class="text-muted">' + this.lastModifiedDate + '</p>' + 
                                              '<p><strong>' + this.feedTitle + '</strong></p>' + 
                                              this.feedContent + 
                                            '</div>');
              });
              
              if($('.news-item').length > 0) {
                $('.js--news-feed').removeClass('hidden');
              }
            }, 
            error: handleApiError
          }
        });
      }
      
      if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId) {
        adarda.trpc.ui.buildTeamMembersList();
      }
      
      if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.isCompanyCoordinator) {
        $('.company-roster .table--loading-row').removeClass('hidden');
        $('.company-roster .table--no-results-row').addClass('hidden');
        $('.company-roster .table--row').remove();
        
        adarda.trpc.api.teamraiser.getTeamsByInfo({
          companyId: (adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] !== undefined ? adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.companyId : ''), 
          listSortColumn: 'total', 
          listAscending: 'false', 
          listPageSize: '7', 
          callback: {
            success: function(response) {
              $('.company-roster .table--loading-row').addClass('hidden');
              
              var companyTeams = luminateExtend.utils.ensureArray(response.getTeamSearchByInfoResponse.team);
              
              $.each(companyTeams, function(rowIndex) {
                var captainName = (this.captainFirstName ? (this.captainFirstName + ' ' + this.captainLastName) : '');
                
                $('.company-roster tbody').append('<tr class="table--row">' + 
                                                    '<td>' + 
                                                      this.name + 
                                                    '</td>' + 
                                                    '<td>' + 
                                                      captainName + 
                                                    '</td>' + 
                                                    '<td>' + 
                                                      adarda.formatMoney(this.amountRaised) + 
                                                    '</td>' + 
                                                  '</tr>');
              });
            }
          }
        });
      }
    }, 
    
    /* build the participant's personal thermometer */
    buildPersonalThermometer: function(raised, goal, percent) {
      if(Number(percent) > 100) {
        percent = 100;
      }
      
      if(goal > 0) {
        $('.js__personal-thermometer').addClass('js__thermometer')
                                      .data('percent', percent);
        walk.buildThermometers();
      }
      
      $('.js--personal-raised').html(adarda.formatMoney(raised));
      $('.js--personal-goal').html(adarda.formatMoney(goal));
      $('.js--personal-progress').removeClass('hidden');
    }, 
    
    /* build the team's thermometer */
    buildTeamThermometer: function(raised, goal, percent) {
      if(Number(percent) > 100) {
        percent = 100;
      }
      
      if(goal > 0) {
        $('.js__team-thermometer').addClass('js__thermometer')
                                  .data('percent', percent);
        walk.buildThermometers();
      }
      
      $('.js--team-raised').html(adarda.formatMoney(raised));
      $('.js--team-goal').html(adarda.formatMoney(goal));
      $('.js--team-progress').removeClass('hidden');
    }, 
    
    /* build the company's thermometer */
    buildCompanyThermometer: function(raised, goal, percent) {
      if(Number(percent) > 100) {
        percent = 100;
      }
      
      if(goal > 0) {
        $('.js--company-thermometer').addClass('js__thermometer')
                                     .data('percent', percent);
        walk.buildThermometers();
      }
      
      $('.js--company-raised').html(adarda.formatMoney(raised));
      $('.js--company-goal').html(adarda.formatMoney(goal));
      $('.js--company-progress').removeClass('hidden');
    }, 
    
    /* build the lists of personal and team donations */
    buildDonationLists: function(isFullList) {
      var resetList = function(listContainer) {
        $(listContainer).each(function() {
          var $listContainer = $(this);
          $listContainer.find('.donation-list .table--loading-row').removeClass('hidden');
          $listContainer.find('.donation-list .table--no-results-row, .js--has-personal-donations, .js--has-team-donations, ' + 
                              '.js--has-more-personal-donations, .js--has-more-team-donations, ' + 
                              '.js--personal-donors-pagination .js--pagination-prev, .js--personal-donors-pagination .js--pagination-next, ' + 
                              '.js--team-donors-pagination .js--pagination-prev, .js--team-donors-pagination .js--pagination-next').addClass('hidden');
          $listContainer.find('.donation-list .table--row').remove();
        });
      }, 
      
      getGiftsCallback = {
        success: function(response, listContainer) {
          var totalNumberResults = Number(response.getGiftsResponse.totalNumberResults), 
          gifts = luminateExtend.utils.ensureArray(response.getGiftsResponse.gift);
          
          $(listContainer).each(function() {
            var $listContainer = $(this), 
            isTeamGift = false;
            
            if($listContainer.is('#dashboard__myteam, #pc-team-donors-view')) {
              isTeamGift = true;
            }
            
            $listContainer.find('.donation-list .table--loading-row').addClass('hidden');
            
            $.each(gifts, function(rowIndex) {
              var listMaxSize = $listContainer.find('.donation-list').data('maxsize');
              if(!listMaxSize || rowIndex < Number(listMaxSize)) {
                var giftId = this.id, 
                isAcknowledged = (this.acknowledged == 'true'), 
                isConfirmed = (this.confirmed == 'true'), 
                isRecurring = (this.isRecurring == 'true'), 
                contactId = this.contactId, 
                donorName = '<no name>', 
                giftAmount = adarda.formatMoney(this.giftAmount), 
                giftMessage = this.giftMessage || '', 
                giftReceiptURL = this.receiptUrl,
                giftDate = luminateExtend.utils.simpleDateFormat(this.date, 'MMM d').replace(/apr /g, 'Apr ')
                                                                                    .replace(/aug /g, 'Aug ')
                                                                                    .replace(/mar /g, 'Mar '), 
                donorEmail = this.email || '';
                
                /* check if the gift has a name */
                if(this.name && this.name.first) {
                  donorName = this.name.first;
                  if(this.name.last) {
                    donorName += ' ' + this.name.last;
                  }
                }
                
                $listContainer.find('.donation-list tbody').append('<tr class="table--row">' + 
                                                                     '<td>' + 
                                                                       giftDate + 
                                                                     '</td>' + 
                                                                     '<td>' + 
                                                                       donorName + 
                                                                     '</td>' + 
                                                                     '<td>' + 
                                                                       giftAmount + 
                                                                       (giftReceiptURL ? ' (<a href="' + giftReceiptURL + '" target="_blank">View Receipt</a>)' : '') +
                                                                       (isRecurring ? 
                                                                        ' <i class="icon-cycle" data-toggle="tooltip" data-placement="auto top" ' + 
                                                                        'title="Congratulations on receiving a recurring gift! If you have questions about this donation, ' + 
                                                                        'please contact us at ' + luminateExtend.global.chapter.email + ' or ' + luminateExtend.global.chapter.phone + '."></i>' : '') + 
                                                                     '</td>' +
                                                                     '<td>' + 
                                                                       (!isAcknowledged ? 
                                                                        ('<a class="js--gift-email icon-reply" ' + 
                                                                         'href="' + window.location.href + '#" ' + 
                                                                         'data-email="' + donorEmail + '" title="Send Thank You Email">' + 
                                                                           'Send Thank You Email' + 
                                                                         '</a> <a class="js--gift-acknowledge icon-minus2" ' + 
                                                                         'href="' + window.location.href + '#" ' + 
                                                                         'data-contactid="' + contactId + '" title="Acknowledge Gift">' + 
                                                                           'Acknowledge Gift' + 
                                                                         '</a>') : '') +  
                                                                     '</td>' + 
                                                                   '</tr>');
                
                $listContainer.find('.donation-list tbody *[data-toggle="tooltip"]').tooltip();
              }
            });
            
            if($listContainer.find('.donation-list .table--row').length === 0) {
              $listContainer.find('.donation-list .table--no-results-row').removeClass('hidden');
            }
            else {
              $listContainer.find('.js--has-personal-donations, .js--has-team-donations').removeClass('hidden');
              if(totalNumberResults > 7) {
                $listContainer.find('.js--has-more-personal-donations, .js--has-more-team-donations').removeClass('hidden');
              }
              
              listOffset = Number($listContainer.find('.donation-list').data('offset'));
              if(listOffset != 0) {
                $listContainer.find('.js--personal-donors-pagination .js--pagination-prev, .js--team-donors-pagination .js--pagination-prev').removeClass('hidden');
              }
              if((listOffset + 1) * 50 < totalNumberResults) {
                $listContainer.find('.js--personal-donors-pagination .js--pagination-next, .js--team-donors-pagination .js--pagination-next').removeClass('hidden');
              }
            }
          });
        }, 
        error: handleApiError
      };
      
      /* get the list of personal gifts */
      var personalListOffset = Number($('#donors__me .donation-list').data('offset')), 
      personalListContainers = [];
      if(!isFullList || personalListOffset === 0) {
        personalListContainers.push('#donors__me');
      }
      if(isFullList) {
        personalListContainers.push('#donors__me');
      }
      
      resetList(personalListContainers.join(','));
      
      adarda.trpc.api.teamraiser.getGifts({
        listPageSize: '50', 
        listPageOffset: isFullList ? personalListOffset : 0, 
        callback: {
          success: function(response) {
            getGiftsCallback.success(response, personalListContainers.join(','));
          }, 
          error: function(response) {
            getGiftsCallback.error(response);
          }
        }
      });
      
      if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId) {
        /* get the list of team gifts */
        var teamListOffset = Number($('#donors__myteam .donation-list').data('offset')), 
        teamListContainers = [];
        if(!isFullList || Number($('#donors__myteam .donation-list').data('offset')) === 0) {
          teamListContainers.push('#donors__myteam');
        }
        if(isFullList) {
          teamListContainers.push('#donors__myteam');
        }
        
        resetList(teamListContainers.join(','));
        
        adarda.trpc.api.teamraiser.getTeamGifts({
          listPageSize: '50', 
          listPageOffset: isFullList ? teamListOffset : 0, 
          callback: {
            success: function(response) {
              getGiftsCallback.success(response, teamListContainers.join(','));
            }, 
            error: function(response) {
              getGiftsCallback.error(response);
            }
          }
        });
      }
    },
    
    buildTeamMembersList: function(isFullList) {
      var resetList = function(listContainer) {
        $(listContainer).each(function() {
          var $listContainer = $(this);
          
          $listContainer.find('.js--team-captain-name').html('')
                          .closest('p').addClass('hidden');
          $listContainer.find('.team-roster .table--loading-row').removeClass('hidden');
          $listContainer.find('.team-roster .table--no-results-row, ' + 
                              '.js--team-members-pagination .js--pagination-prev, ' + 
                              '.js--team-members-pagination .js--pagination-next').addClass('hidden');
          $listContainer.find('.team-roster .table--row').remove();
        });
      },
      
      getTeamCaptainsCallback = function(response, listContainer) {
        $(listContainer).each(function() {
          var $listContainer = $(this), 
          teamCaptains = luminateExtend.utils.ensureArray(response.getTeamCaptainsResponse.captain);
          
          $.each(teamCaptains, function(captainIndex) {
            var $teamCaptainNames = $listContainer.find('.js--team-captain-name');
            if(captainIndex > 0) {
              $teamCaptainNames.html($teamCaptainNames.html() + ' | ');
            }
            $teamCaptainNames.html($teamCaptainNames.html() + 
                                   '<strong>' + 
                                     this.name.first + ' ' + this.name.last + 
                                   '</strong>');
            $teamCaptainNames.closest('p').removeClass('hidden');
          });
        });
      }, 
      
      getParticipantsCallback = function(response, listContainer) {
        $(listContainer).each(function() {
          var $listContainer = $(this);
          
          $listContainer.find('.team-roster .table--loading-row').addClass('hidden');
          
          var totalNumberResults = Number(response.getParticipantsResponse.totalNumberResults), 
          teamMembers = luminateExtend.utils.ensureArray(response.getParticipantsResponse.participant);
          
          $.each(teamMembers, function(rowIndex) {
            var listMaxSize = $listContainer.find('.team-roster').data('maxsize');
            if(!listMaxSize || rowIndex < Number(listMaxSize)) {
              var participantName = this.name;
              
              if(participantName && participantName.first) {
                $listContainer.find('.team-roster tbody').append('<tr class="table--row" data-id="'+this.consId+'">' + 
                                                                   '<td>' + 
                                                                     '<input type="checkbox"' + (this.aTeamCaptain == 'true' ? ' checked="checked"' : '') + ' />' + 
                                                                   '</td>' + 
                                                                   '<td>' + 
                                                                     participantName.first + ' ' + participantName.last + 
                                                                   '</td>' + 
                                                                   '<td>' + 
                                                                     (this.aTeamCaptain == 'true' ? 'Captain' : 'Member') + 
                                                                   '</td>' + 
                                                                   '<td>' + 
                                                                     adarda.formatMoney(this.amountRaised) + 
                                                                   '</td>' + 
                                                                 '</tr>');
              }
            }
          });
          
          if($listContainer.find('.team-roster .table--row').length === 0) {
            $listContainer.find('.team-roster .table--no-results-row').removeClass('hidden');
          }
          else {
            listOffset = Number($listContainer.find('.team-roster').data('offset'));
            if(listOffset != 0) {
              $listContainer.find('.js--team-members-pagination .js--pagination-prev').removeClass('hidden');
            }
            if((listOffset + 1) * 50 < totalNumberResults) {
              $listContainer.find('.js--team-members-pagination .js--pagination-next').removeClass('hidden');
            }
          }
        });
      }, 
      
      listOffset = Number($('#pc-team-roster-view .team-roster').data('offset')), 
      listContainers = [];
      if(!isFullList || listOffset === 0) {
        listContainers.push('#dashboard__myteam');
      }
      if(isFullList) {
        listContainers.push('#pc-team-roster-view');
      }
      
      resetList(listContainers.join(','));
      
      adarda.trpc.api.teamraiser.getTeamCaptains({
        callback: {
          success: function(response) {
            getTeamCaptainsCallback(response, listContainers.join(','));
          }
        }
      });
      
      adarda.getParticipants({
        frId: adarda.trpc.frId, 
        teamId: adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId, 
        sortColumn: 'total', 
        ascending: 'false', 
        size: '50', 
        offset: isFullList ? listOffset : 0, 
        callback: {
          success: function(response) {
            getParticipantsCallback(response, listContainers.join(','));
          }
        }
      });
    }, 

    /* build company list for event for use on the edit team membership page */
    buildCompanyList: function(isFullList) {
      var getCompanyListCallback = function(response) {
        var selectedCompanyName = '';
        if (response.getCompanyListResponse) {
          $('.get-companies-btn').removeClass('hidden');
          var companyList = '<option value="">None</option>',
          nationals = luminateExtend.utils.ensureArray(response.getCompanyListResponse.nationalItem),
          companies = luminateExtend.utils.ensureArray(response.getCompanyListResponse.companyItem);

          $.each(nationals, function() {
            if (adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.companyId == this.companyId) { selectedCompanyName = this.companyName; }
            companyList += '<option value="' + this.companyId + '"'+(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.companyId == this.companyId ? ' selected="selected"' : '')+'>' + this.companyName + '</option>';
          });
          $.each(companies, function() {
            companyList += '<option value="' + this.companyId + '"'+(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.companyId == this.companyId ? ' selected="selected"' : '')+'>' + this.companyName + '</option>';
          });
          $('select.companyList').html(companyList);
          if (selectedCompanyName == 'Edward Jones') {
            $('.is-edward-jones').removeClass('hidden');
          }
        } else {
          $('.get-companies-btn').addClass('hidden');
        }
      };

      adarda.trpc.api.teamraiser.getCompanyList({
        frId: adarda.trpc.frId, 
        callback: getCompanyListCallback
      });

    },

    /* build division list for event for use on the edit team membership page */
    buildDivisionsList: function(isFullList) {
      var getDivisionsListCallback = function(response) {
        var divisionsList = '',
        divisions = luminateExtend.utils.ensureArray(response.getTeamDivisionsResponse.divisionName);

        $.each(divisions, function() {
          divisionsList += '<option value="' + this + '">' + this + '</option>';
        });
        $('#tm__help #teamDivision').append(divisionsList);
      };

      adarda.trpc.api.teamraiser.getDivisionsList({
        frId: adarda.trpc.frId, 
        callback: getDivisionsListCallback
      });

    },
    
    buildTeamMembershipList: function(isFullList) {
      var resetList = function(listContainer) {
        $(listContainer).each(function() {
          var $listContainer = $(this);
          
          $listContainer.find('.tm-team-search .table--loading-row').removeClass('hidden');
          $listContainer.find('.tm-team-search .table--no-results-row, ' + 
                              '.js--team-membership-pagination .js--pagination-prev, ' + 
                              '.js--team-membership-pagination .js--pagination-next').addClass('hidden');
          $listContainer.find('.tm-team-search .table--row').remove();
        });
      }, 
      
      getTeamsByInfoCallback = function(response, listContainer) {
        $(listContainer).each(function() {
          var $listContainer = $(this);
          
          $listContainer.find('.tm-team-search').removeClass('hidden');
          $listContainer.find('.tm-team-search .table--loading-row').addClass('hidden');
          
          var totalNumberResults = Number(response.getTeamSearchByInfoResponse.totalNumberResults), 
          teams = luminateExtend.utils.ensureArray(response.getTeamSearchByInfoResponse.team);
          
          $.each(teams, function(rowIndex) {
            var listMaxSize = $listContainer.find('.tm-team-search').data('maxsize');
            if(!listMaxSize || rowIndex < Number(listMaxSize)) {
              $listContainer.find('.tm-team-search tbody').append('<tr class="table--row" data-id="'+this.consId+'">' + 
                         '<td>' + 
                           '<span class="tm-teamName">' + this.name +'</span><br />' + 
                           (this.captainFirstName ? this.captainFirstName + ' ' + this.captainLastName : '&nbsp;') +
                         '</td>' + 
                         '<td class="companyCol">' + 
                           (this.companyName ? this.companyName : '&nbsp;') +
                         '</td>' + 
                         '<td class="joinCol">' + 
                           '<button class="button tm-join" data-team-id="' + this.id + '">Join</button>' +
                         '</td>' + 
                       '</tr>');
            }
          });
          
          if($listContainer.find('.tm-team-search .table--row').length === 0) {
            $listContainer.find('.tm-team-search .table--no-results-row').removeClass('hidden');
          }
          else {
            listOffset = Number($listContainer.find('.tm-team-search').data('offset'));
            if(listOffset != 0) {
              $listContainer.find('.js--team-membership-pagination .js--pagination-prev').removeClass('hidden');
            }
            if((listOffset + 1) * 50 < totalNumberResults) {
              $listContainer.find('.js--team-membership-pagination .js--pagination-next').removeClass('hidden');
            }
          }
        });
      }, 
      
      listOffset = Number($('#pc-team-membership-view .tm-team-search').data('offset')), 
      listContainers = [];
      /*if(!isFullList || listOffset === 0) {
        listContainers.push('#dashboard__myteam');
      }*/
      //if(isFullList) {
        listContainers.push('#pc-team-membership-view');
      //}
      
      resetList(listContainers.join(','));
      
      adarda.trpc.api.teamraiser.getTeamsByInfo({
          companyId: $('#tm-team-company').val(),
          teamName: $('#tm-team-name').val(),
          firstName: $('#tm-team-captain-first').val(),
          lastName: $('#tm-team-captain-last').val(),
          listSortColumn: 'total', 
          listAscending: 'false', 
          listPageSize: '10',
          callback: {
          success: function(response) {
            getTeamsByInfoCallback(response, listContainers.join(','));
          }
        }
      });
    }, 
    
    /* build the full notifications list */
    buildNotificationsList: function() {
      $('#pc-notifications-view .table--loading-row').removeClass('hidden');
      $('#pc-notifications-view .table--no-results-row').addClass('hidden');
      $('#pc-notifications-view .table--row').remove();
      
      adarda.trpc.api.teamraiser.getRecentActivity({
        callback: {
          success: function(response) {
            $('#pc-notifications-view .table--loading-row').addClass('hidden');
            
            if(response.getRecentActivityResponse.activityRecord) {
				/* build the email form and contacts list if the view hasn't already been loaded */
				if(!$('#pc-email-view').is('.view-loaded') && $('.email-contacts-table .table--row input[type="checkbox"]:checked').length === 0) {
				  adarda.trpc.ui.buildEmailForm();
				  adarda.trpc.ui.buildContactFilters();
				  adarda.trpc.ui.buildContactsList();
				}
				
              var activityRecords = luminateExtend.utils.ensureArray(response.getRecentActivityResponse.activityRecord);
              $.each(activityRecords, function(rowIndex) {
                var rowClass = 'content__table--' + (rowIndex % 2 === 0 ? 'even' : 'odd');
                $('#pc-notifications-view tbody').append('<tr class="table--row">' + 
                                                           '<td>' + 
                                                             (this.type == 'DONATION' ? '<a class="js--notif-donor" href="#pc-email&fr_id='+adarda.trpc.frId+'" data-id="'+this.contactId+'">' : '') +
															 this.activity + 
                                                             (this.type == 'DONATION' ? '</a>' : '') +
                                                           '</td>' + 
                                                           '<td>' + 
                                                             this.date + 
                                                           '</td>' +  
                                                         '</tr>');
              });
            }
            
            if($('#pc-notifications-view .table--row').length === 0) {
              $('#pc-notifications-view .table--no-results-row').removeClass('hidden');
            }
          }, 
          error: handleApiError
        }
      });
    }, 
    
    /* build the email form */
    buildEmailForm: function() {
      
      /* reset suggested messages */
      $('.email-suggested-messages option').not('[value=""],[value="drafts"]').remove();
      
      /* get list of suggested messages */
      adarda.trpc.api.teamraiser.getSuggestedMessages({
        callback: {
          success: function(response) {
            var suggestedMessages = luminateExtend.utils.ensureArray(response.getSuggestedMessagesResponse.suggestedMessage);
            
            suggestedMessages = $(suggestedMessages).sort(function(a, b) {
              var messageNameA = a.name, 
              messageNameB = b.name;
              if(messageNameA === messageNameB) {
                return 0;
              }
              return messageNameA > messageNameB ? 1 : -1;
            });
            
            $.each(suggestedMessages, function() {
              /* add an option for each active message to the appropriate optgroup */
              if(this.active == 'true') {
                var messageType = this.messageType.toLowerCase(), 
                messageId = this.messageId, 
                messageName = this.name;
                
                if (adarda.trpc.rsvp.event_id != undefined || ((messageName.toLowerCase() != "invite friends to rsvp") && (messageName.toLowerCase() != "reminding friends about the event") && (messageName.toLowerCase() != "thank friends for coming"))) {
                  $('.email-suggested-messages-' + messageType).removeClass('hidden')
                                                             .append('<option value="' + messageId + 
                                                                     '" data-messagename="' + messageName.toLowerCase() + '">' + 
                                                                       messageName + 
                                                                     '</option>');
                }
              }
            });
			
            if ($('.email-suggested-messages-solicit').length>0){
            	var $fr = $('.email-suggested-messages-solicit option[data-messagename="fundraising follow-up"]'),
            		$sm = $('.email-suggested-messages-solicit option[data-messagename="sponsor me"]');
            	if ($fr.length>0 && $sm.length>0){
            		$sm.insertBefore($fr);
            	}
            }
            
            var preSelectedMessageName = $('.email-suggested-messages').data('messagename');
            if(preSelectedMessageName) {
              var preSelectedMessageId = $('.email-suggested-messages option[data-messagename="' + preSelectedMessageName.toLowerCase() + '"]').val();
              if(preSelectedMessageId) {
                $('.email-suggested-messages').val(preSelectedMessageId).change();
                $('#pc2EmailSection').addClass('show');
              }
            }
          }, 
          error: handleApiError
        }
      });
      
      /* reset stationery */
      $('.js--email-layouts select option').not('[value=""]').remove();
      
      adarda.trpc.api.teamraiser.getMessageLayouts({
        callback: {
          success: function(response) {
            var layouts = luminateExtend.utils.ensureArray(response.getMessageLayoutsResponse.layout);
            if(layouts.length === 1) {
              $('#email-layout-id').val(layouts[0].layoutId);
            }
            else {
              $.each(layouts, function() {
                $('.js--email-layouts select').append('<option value="' + this.layoutId + '">' + 
                                                        this.name + 
                                                      '</option>');
              });
              
              if(adarda.trpc.teamraiserConfig['tr'+adarda.trpc.frId].defaultStationeryId) {
                $('.js--email-layouts select').val(adarda.trpc.teamraiserConfig['tr'+adarda.trpc.frId].defaultStationeryId).change();
              }
            }
          }, 
          error: handleApiError
        }
      });
    }, 
    
    /* build the email preview dialog */
    buildEmailPreview: function(options) {
      var settings = $.extend({
        container: '.js--email-preview-dialog-wrapper', 
        date: '', 
        recipients: '', 
        subject: '', 
        message: ''
      }, options || {});
      
      $(settings.container).each(function() {
        var $previewContainer = $(this), 
        numRecipients = settings.recipients.split(',').length;
        
        $previewContainer.find('.js--email-preview-date').html(settings.date);
        
        $previewContainer.find('.js--email-send-count').html(numRecipients + ' contact' + (numRecipients > 1 ? 's' : ''));
        
        $previewContainer.find('.js--email-preview-to').html(settings.recipients.replace(/</g, '&' + 'lt;').replace(/>/g, '&' + 'gt;'));
        
        $previewContainer.find('.js--email-preview-subject').html(settings.subject);
        
        var $stationery = $('.js--email-layouts select'), 
        $previewStationery = $previewContainer.find('.js--email-preview-stationery');
        if($previewStationery.length > 0) {
          $previewStationery.addClass('hidden');
          $previewStationery.find('select').removeAttr('disabled');
          $previewStationery.find('select option').remove();
          if($stationery.find('option').not('[value=""]').length > 0) {
            $stationery.find('option').each(function() {
              $previewStationery.find('select').append('<option value="' + $(this).val() + '" ' + ($(this).is(':selected') ? 'selected' : '') + '>' + 
                                                         $(this).text() + 
                                                       '</option>');
            });
            $previewStationery.removeClass('hidden');
          }
        }
        
        $previewContainer.find('.email-preview-body').html(settings.message.replace('[[S431]]', '')
                                                                           .replace(/http:\/\/act.alz.org\//gi, 'https://act.alz.org/')
                                                                           .replace(/http:\/\/act.alz.org\//gi, 'https://act.alz.org/')
                                                                           .replace(/http:\/\/act.alz.org\//gi, 'https://act.alz.org/'));
        
        // Make all links open in a new window with window.name=_Preview. This window name controlling window closure when closing video in personal page. In addition, prevent Google analytic from tracking preview events.
        $previewContainer.find('.email-preview-body a').each(function() {
          $(this).click(function(e) {
            e.preventDefault();
            window.open(this.href, '_Preview');
          });
        });
        
        /* convert deprecated HTML attributes to CSS */
        $previewContainer.find('.email-preview-body *[bgcolor]').each(function() {
          $(this).css('background-color', $(this).attr('bgcolor'));
        });
      });
    }, 
    
    /* build the drafts and sent message lists */
    buildEmailMessageList: function(listType, listContainer) {
      var $listContainer = $(listContainer);
      
      $listContainer.find('.table--loading-row').removeClass('hidden');
      $listContainer.find('.table--no-results-row, .js--pagination-prev, .js--pagination-next').addClass('hidden');
      $listContainer.find('.table--row').remove();

      /* get the offset */
      var emailSentOffset = Number($listContainer.find('.email-list-results').data('offset'));
      
      adarda.trpc.api.teamraiser['get' + listType + 's']({
        listPageSize: '25',
        listPageOffset: emailSentOffset,
        callback: {
          success: function(response) {
            var totalNumberResults = Number(response['get' + listType + 'sResponse'].totalNumberResults); 
            $listContainer.find('.table--loading-row').addClass('hidden');
            
            var messageItems = luminateExtend.utils.ensureArray(response['get' + listType + 'sResponse'].messageItem);
            
            $.each(messageItems, function(rowIndex) {
              var recipients = this.recipients, 
              messageId = this.message_id, 
              messageDate = this.date.split('/'), 
              messageDateObject = new Date(messageDate[2], Number(messageDate[0]) - 1, messageDate[1]), 
              messageDateMMDD = luminateExtend.utils.simpleDateFormat(messageDateObject, 'MM/dd'), 
              messageDateFriendly = luminateExtend.utils.simpleDateFormat(messageDateObject, 'MMM d').replace(/apr /g, 'Apr ')
                                                                                                     .replace(/aug /g, 'Aug ')
                                                                                                     .replace(/mar /g, 'Mar ');
              
              $listContainer.find('tbody').append('<tr class="table--row">' + 
                                                    '<td>' + 
                                                      (recipients ? 
                                                       ('<a class="js--message-load" ' + 
                                                        'href="' + window.location.href + '#" ' + 
                                                        'data-messagetype="' + listType + '" ' + 
                                                        'data-messageid="' + messageId + '" ' + 
                                                        'data-messagedate="' + messageDateMMDD + '">' + 
                                                          recipients + 
                                                        '</a>') : '') + 
                                                    '</td>' + 
                                                    '<td>' + 
                                                      '<a class="js--message-load" ' + 
                                                      'href="' + window.location.href + '#" ' + 
                                                      'data-messagetype="' + listType + '" ' + 
                                                      'data-messageid="' + messageId + '" ' + 
                                                      'data-messagedate="' + messageDateMMDD + '">' + 
                                                        this.subject + 
                                                      '</a>' + 
                                                    '</td>' + 
                                                    '<td>' + 
                                                      messageDateFriendly + 
                                                    '</td>' + 
                                                    '<td>' + 
                                                      '<a class="js--message-delete" ' + 
                                                      'href="' + window.location.href + '#" ' + 
                                                      'data-messagetype="' + listType + '" ' + 
                                                      'data-messageid="' + messageId + '">' + 
                                                        '<span class="icon-trash"></span>' + 
                                                      '</a>' + 
                                                    '</td>' + 
                                                  '</tr>');
            });
            
            if($listContainer.find('.table--row').length === 0) {
              $listContainer.find('.table--no-results-row').removeClass('hidden');
            } else {              
              listOffset = Number($listContainer.find('.email-list-results').data('offset'));
              if(listOffset != 0) {
                $listContainer.find('.js--pagination-prev').removeClass('hidden');
              }
              if((listOffset + 1) * 25 < totalNumberResults) {
                $listContainer.find('.js--pagination-next').removeClass('hidden');
              }
            }
          }, 
          error: handleApiError
        }
      });
    }, 
    
    /* build the contact filters dropdown */
    buildContactFilters: function(defaultFilter) {
      /* reset the contact filters and groups */
      $('.js--email-contacts-filter-link').not('[data-filter="all"]').each(function() {
        $(this).closest('li').remove();
      });
      $('.js--email-contacts-filter optgroup').remove();
      $('.contacts__dropdown .dropdown-menu li').not('.js--add-to-new-group').remove();
      
      adarda.trpc.api.teamraiser.getTeamraiserAddressBookFilters({
        callback: {
          success: function(response) {
            var filterGroups = luminateExtend.utils.ensureArray(response.getTeamraiserAddressBookFiltersResponse.filterGroup);
            $.each(filterGroups, function() {
              var groupName = this.groupName;
              
              $('.js--email-contacts-filter').append('<optgroup label="' + groupName + '" />');
              
              var filters = luminateExtend.utils.ensureArray(this.filter), 
              filterNames = {
                email_rpt_show_donors: 'Donors', 
                email_rpt_show_unthanked_donors: 'Unthanked donors', 
                email_rpt_show_nondonors: 'Non-donors', 
                email_rpt_show_ly_donors: 'Past Donors', 
                email_rpt_show_lybunt_donors: 'Past Donors Who Haven\'t Donated', 
                email_rpt_show_teammates: 'Teammates', 
                email_rpt_show_nonteammates: 'Non-teammates', 
                email_rpt_show_company_coordinator_captains: 'Team captains for your company', 
                email_rpt_show_company_coordinator_participants: 'Participants for your company', 
                email_rpt_show_never_emailed: 'Never emailed', 
                email_rpt_show_nondonors_followup: 'Needs follow-up'
              };
              $.each(filters, function() {
                var filterValue = this.filterValue, 
                filterName = this.filterName;
                
                if(filterNames[filterValue]) {
                  filterName = filterNames[filterValue];
                }
                
                $('.email__contacts--filter-list ul').each(function() {
                  $(this).append('<li>' + 
                                   '<a class="js--email-contacts-filter-link" href="' + window.location.href + '#" data-filter="' + filterValue + '">' + 
                                     filterName + ' <span class="badge pull-right hidden"></span>' + 
                                   '</a>' + 
                                 '</li>');
                });
                $('.js--email-contacts-filter').each(function() {
                  $(this).find('optgroup').last().append('<option value="' + filterValue + '">' + 
                                                           filterName + 
                                                         '</option>');
                });
                
                if(filterValue.indexOf('email_rpt_group_') != -1) {
                  $('.js--add-to-new-group').each(function() {
                    $(this).before('<li>' + 
                                     '<a class="js--email-contacts-group-add" href="' + window.location.href + '#" ' + 
                                     'data-groupid="' + filterValue.split('email_rpt_group_')[1] + '">' + 
                                       filterName + 
                                     '</a>' + 
                                   '</li>');
                  });
                }
                
                if(defaultFilter) {
                  $('.js--email-contacts-filter-link[data-filter="' + defaultFilter + '"]').click();
                }
              });
            });
          }, 
          error: handleApiError
        }
      });
    }, 
    
    /* build the contacts list */
    buildContactsList: function(isFiltered) {
      var $contactsFilter = $('.js--email-contacts-filter');
      
      if(!isFiltered) {
        $contactsFilter.val('all');
        $('.js--email-contacts-filter-link.active').removeClass('active');
        $('.js--email-contacts-filter-link[data-filter="all"]').addClass('active');
        
        $('.email-contacts-search').val('');
      }
      
      if(adarda.trpc.addressBookGroupBadgeLoadTimer) {
        clearTimeout(adarda.trpc.addressBookGroupBadgeLoadTimer);
        delete adarda.trpc.addressBookGroupBadgeLoadTimer;
      }
      $('.js--email-contacts-filter-link .badge').html('').addClass('hidden');
      var $groupBadge = $('.js--email-contacts-filter-link[data-filter="' + $contactsFilter.eq(0).val() + '"] .badge').data('loadpulse', 1).removeClass('hidden'), 
      badgeLoader = function() {
        $groupBadge.data('loadpulse', $groupBadge.data('loadpulse') + 1);
        if($groupBadge.data('loadpulse') === 4) {
          $groupBadge.data('loadpulse', 1);
        }
        var loadPulse = $groupBadge.data('loadpulse');
        $groupBadge.html((loadPulse === 1 ? '.' : '<span style="font-size: 0.85em;">.</span>') + 
                         (loadPulse === 2 ? '.' : '<span style="font-size: 0.85em;">.</span>') + 
                         (loadPulse === 3 ? '.' : '<span style="font-size: 0.85em;">.</span>'));
        adarda.trpc.addressBookGroupBadgeLoadTimer = setTimeout(badgeLoader, 200);
      };
      badgeLoader();
      
      /* reset contact actions */
      if (dtContacts) { dtContacts.destroy(); }
      $('#email__contacts .email-contacts-compose, .email-contacts-delete, .email-contacts-group').addClass('hidden');
      $('#email-contacts-modal .email-contacts-compose').addClass('disabled');
      
      $('.js--contacts-select-all').removeAttr('checked');
      $('.email-contacts-table .table--loading-row').removeClass('hidden');
      $('.email-contacts-table .table--no-results-row').addClass('hidden');
      $('.email-contacts-table .table--row').remove();
      
      adarda.trpc.api.teamraiser.getTeamraiserAddressBookContacts({
        trAbFilter: $contactsFilter.eq(0).val(), 
        listFilterText: $('.email-contacts-search').eq(0).val(), 
        callback: {
          success: function(response) {
            if(!isFiltered) {
              adarda.trpc.contacts.autoComplete = [];
            }
            
            var totalNumberResults = Number(response.getTeamraiserAddressBookContactsResponse.totalNumberResults);
            
            if(adarda.trpc.addressBookGroupBadgeLoadTimer) {
              clearTimeout(adarda.trpc.addressBookGroupBadgeLoadTimer);
              delete adarda.trpc.addressBookGroupBadgeLoadTimer;
            }
            $groupBadge.html(totalNumberResults);
            
            $('.email-contacts-table .table--loading-row').addClass('hidden');
            
            if(response.getTeamraiserAddressBookContactsResponse.addressBookContact) {
              var addressBookContacts = luminateExtend.utils.ensureArray(response.getTeamraiserAddressBookContactsResponse.addressBookContact);

              /* Export data setup */
              var csvContent = '';

              $.each(addressBookContacts, function(rowIndex) {
                var autoCompleteContact, 
                contactId = this.id, 
                contactName, 
                contactNameFormatted = '&' + 'lt;no name&' + 'gt;', 
                contactEmail = this.email, 
                donationsTotal = adarda.formatMoney(this.amountRaised), 
                donationsPrevTotal = adarda.formatMoney(this.previousAmountRaised), 
                sentTotal = this.messagesSent, 
                openedTotal = this.messagesOpened, 
                pageVisitsTotal = this.clickThroughs;
                
                /* check if contact has an email address */
                if(contactEmail) {
                  autoCompleteContact = {
                    label: '<' + contactEmail + '>', 
                    value: contactEmail
                  };
                }
                else {
                  contactEmail = '';
                }
                
                /* check if the contact has a name */
                if(this.firstName) {
                  contactNameFormatted = this.firstName;
                  if(this.lastName) {
                    contactNameFormatted += ' ' + this.lastName;
                  }
                  
                  contactName = '' + contactNameFormatted;
                  
                  if(autoCompleteContact) {
                    autoCompleteContact.label = contactNameFormatted + ' ' + autoCompleteContact.label;
                  }
                }
                
                if(!isFiltered && autoCompleteContact) {
                  adarda.trpc.contacts.autoComplete.push(autoCompleteContact);
                }

                $('.email-contacts-table').each(function(contact, index) {
                  var $table = $(this);
                  
                  if($table.find('tr[data-id="' + contactId + '"]').length === 0) {
                    $table.find('tbody').append('<tr class="table--row" data-id="' + contactId + '" data-email="' + contactEmail + '" data-name="' + (contactName || '') + '">' + 
                                                  '<td>' + 
                                                    '<input type="checkbox">' + 
                                                  '</td>' + 
                                                  '<td>' + 
                                                    ($table.is('#email__contacts table') ? 
                                                     ('<a class="js--edit-contact" href="#">' + 
                                                        contactNameFormatted + '<br>' + 
                                                        contactEmail + 
                                                      '</a>') : 
                                                     (contactNameFormatted + '<br>' + 
                                                      contactEmail)) + 
                                                  '</td>' + 
                                                  '<td>' + 
                                                    donationsTotal + 
                                                  '</td>' + 
                                                  '<td>' + 
                                                    donationsPrevTotal + 
                                                  '</td>' + 
                                                  '<td>' + 
                                                    sentTotal + 
                                                  '</td>' + 
                                                  '<td>' + 
                                                    openedTotal + 
                                                  '</td>' + 
                                                  '<td>' + 
                                                    pageVisitsTotal + 
                                                  '</td>' +      
                                                '</tr>');
                  }
                });

                /* build CSV export contact list */
                var contactNameEscaped = contactNameFormatted.replace(/"/g, '""');
                var contactEmailEscaped = contactEmail.replace(/"/g, '""');
                csvContent += '"'+contactNameEscaped+'","'+contactEmailEscaped+'"\n';

              });

              /* Set up export link */
              var blob = new Blob([csvContent], {type:'text/csv;charset=utf-8;'});
              if (navigator.msSaveBlob) { $('.email-contacts-export').click(function(){navigator.msSaveBlob(blob, 'contact-export.csv');}); }
              else {
                var url = URL.createObjectURL(blob);
                $('.email-contacts-export').attr('href',url);
                $('.email-contacts-export').removeClass('hidden');
              }
              
              if(!isFiltered) {
                adarda.trpc.ui.buildEmailAutoComplete();
              }

              /* select filter and all contacts */
            }

 
            $('.email-contacts-table .table--loading-row').remove();
            
            if($('.email-contacts-table .table--row').length === 0) {
              $('.email-contacts-table .table--no-results-row').removeClass('hidden');
            } else {
              $('.email-contacts-table .table--no-results-row').remove();
            }

            dtContacts = $('#email__contacts .email-contacts-table').DataTable({
              "order": [[ 1, "asc" ]],
              "destroy": true,
              "lengthMenu": [ [10, 25, 50, 100, -1], [10, 25, 50, 100, "All"] ],
              "pageLength": -1
            });
            // $tableData.find('.table--no-results-row, .table--loading-row, th:first-child, td:first-child').remove();


            /* select filter and all contacts */
            if ($('#pc-email-view').hasClass('email_rpt_show_teammates')) {
              if ($('a[data-filter="email_rpt_show_teammates"]:eq(0)').hasClass('active')) {
                $('#email__contacts .email-contacts-table .js--contacts-select-all:eq(0)').click();
                $('.email__contacts--action.email-contacts-compose').click();
                $('#pc-email-view').removeClass('email_rpt_show_teammates');
              } else {
                $('a[data-filter="email_rpt_show_teammates"]:eq(0)').click();
              }
            } else if ($('#pc-email-view').hasClass('email_rpt_show_donors')) {
               $('a[data-filter="email_rpt_show_donors"]:eq(0)').click();
            }

          }, 
          error: handleApiError
        }
      });
    }, 
    
    buildEmailAutoComplete: function() {
      $('#email-recipients').autocomplete()
                            .autocomplete('destroy')
                            .autocomplete({
                              source: function(request, response) {
                                var allTerms = request.term.split(/[,;]+/);
                                for(var i = 0; i < allTerms.length; i++) {
                                  allTerms[i] = allTerms[i].replace(/^\s+|\s+$/g, '');
                                }
                                var lastTerm = allTerms[allTerms.length - 1], 
                                matcher = new RegExp($.ui.autocomplete.escapeRegex(lastTerm), 'i');
                                response($.grep(adarda.trpc.contacts.autoComplete, function(item) {
                                  if($.inArray(item.value, allTerms) > -1 || $.inArray(item.label, allTerms) > -1) {
                                    return false;
                                  }
                                  else {
                                    return matcher.test(item.label);
                                  }
                                }));
                              }, 
                              search: function() {
                                var allTerms = this.value.split(/[,;]+/), 
                                lastTerm = allTerms[allTerms.length - 1].replace(/^\s+|\s+$/g, '');
                                if(lastTerm.length < 1) {
                                  return false;
                                }
                              }, 
                              focus: function() {
                                return false;
                              }, 
                              select: function(event, ui) {
                                var allTerms = this.value.split(/[,;]+/);
                                for(var i = 0; i < allTerms.length; i++) {
                                  allTerms[i] = allTerms[i].replace(/^\s+|\s+$/g, '');
                                }
                                allTerms.pop();
                                allTerms.push(ui.item.label);
                                this.value = allTerms.join(', ');
                                return false;
                              }
                            });
    }, 
    
    /* build the online address book import */
    buildAddressBookImport: function(importJobId) {
      adarda.trpc.api.addressbook.getAddressBookImportJobStatus({
        jobId: importJobId, 
        callback: {
          success: function(response) {
            var jobStatus = response.getAddressBookImportJobStatusResponse.jobStatus.toLowerCase();
            
            if(response.getAddressBookImportJobStatusResponse.events) {
              /* reset job events */
              $('#import-contacts-online-events ul li').remove();
              
              var jobEvents = luminateExtend.utils.ensureArray(response.getAddressBookImportJobStatusResponse.events.event);
              $.each(jobEvents, function(eventIndex, eventText) {
              $('#import-contacts-online-events ul').append('<li>' + 
                                                              eventText + 
                                                            '</li>');
              });
            }
            
            if(jobStatus === 'pending') {
              adarda.trpc.ui.buildAddressBookImport(importJobId);
            }
            else if(jobStatus === 'success') {
              adarda.trpc.api.addressbook.getAddressBookImportContacts({
                jobId: importJobId, 
                callback: {
                  success: function(response) {
                    $('.import-contacts-step').addClass('hidden');
                    $('#import-contacts-online-results, #import-contacts-online-next').removeClass('hidden');
                    
                    var importContacts = luminateExtend.utils.ensureArray(response.getAddressBookImportContactsResponse.contact);
                    $.each(importContacts, function(contactIndex) {
                      var isOddRow = !(contactIndex % 2), 
                      firstName = typeof this.firstName === 'string' ? $.trim(this.firstName) : '', 
                      lastName = typeof this.lastName === 'string' ? $.trim(this.lastName) : '', 
                      contactName = '&' + 'lt;no name&' + 'gt;', 
                      contactEmail = typeof this.email === 'string' ? this.email : '';
                      
                      if(firstName != '') {
                        contactName = firstName;
                        
                        if(lastName != '') {
                          contactName += ' ' + lastName;
                        }
                      }
                      
                      $('#ab-import-list').append('<div class="ab-import-row' + (!isOddRow ? ' ab-import-row-even' : '') + '">' + 
                                                    '<div class="ab-import-checkbox-col">' + 
                                                      '<input type="checkbox">' + 
                                                    '</div>' + 
                                                    '<div class="ab-import-name-col">' + 
                                                      contactName + 
                                                    '</div>' + 
                                                    '<div class="ab-import-email-col">' + 
                                                      contactEmail + 
                                                    '</div>' + 
                                                  '</div>');
                      
                      $('#ab-import-list .ab-import-row').last().data('contact', '"' + firstName + '", "' + lastName + '", "' + contactEmail + '"');
                    });
                  }, 
                  error: function(response) {
                    if(handleApiError(response)) {
                      /* TODO: getAddressBookImportContacts error */
                    }
                  }
                }
              });
            }
          }, 
          error: function(response) {
            if(handleApiError(response)) {
              /* TODO: getAddressBookImportJobStatus error */
            }
          }
        }
      });
    }, 
    
    /* build the personal and team page editors */
    buildPageEditor: function() {
      if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].privatePage) {
        $('.js--mypage-public').val('private');
        $('.js--mypage-public-msg.msg-public').addClass('hidden');
        $('.js--mypage-public-msg.msg-private').removeClass('hidden');
      }
      else {
        $('.js--mypage-public').val('public');
        $('.js--mypage-public-msg.msg-private').addClass('hidden');
        $('.js--mypage-public-msg.msg-public').removeClass('hidden');
      }
      adarda.trpc.api.teamraiser.getShortcut({
        callback: {
          success: function(response) {
            var shortcutItem = response.getShortcutResponse.shortcutItem, 
            shortcutUrl = shortcutItem.url || 
                          (luminateExtend.global.path.secure + 
                           'TR?fr_id=' + adarda.trpc.frId + 
                           '&pg=personal&px=' + adarda.trpc.cons.profile.id);
            $('#edit-page-url').html(shortcutUrl);
            $('.viewPagePersonal').attr('href',shortcutUrl);
            $('.edit-page-url-prefix').html(shortcutItem.prefix);
            $('#edit-page-url-shortcut').val(shortcutItem.text || '');
          }, 
          error: handleApiError
        }
      });
      
      adarda.trpc.ui.refreshPersonalPhoto();
      adarda.trpc.ui.refreshPersonalVideo();
      
      $('.edit-photo-fr_id').val(adarda.trpc.frId);
      if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.companyId) {
        $('.edit-photo-company_id').val(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.companyId);
      }
      $('.auth-token').val(luminateExtend.global.auth.token);
      
      if(!$('#edit-personal-page-body').data('prevvalue')) {
        adarda.trpc.api.teamraiser.getPersonalPageInfo({
          callback: {
            success: function(response) {
              $('#edit-personal-page-title').val(response.getPersonalPageResponse.personalPage.pageTitle);
              setEditorContent('#edit-personal-page-body', response.getPersonalPageResponse.personalPage.richText);
            }, 
            error: handleApiError
          }
        });
      }

      adarda.trpc.api.teamraiser.getParticipantProgress({
        callback: {
          success: function(response) {
            /* build thermometers */
            var personalProgress = response.getParticipantProgressResponse.personalProgress, 
            teamProgress = response.getParticipantProgressResponse.teamProgress, 
            companyProgress = response.getParticipantProgressResponse.companyProgress;
            
            $('#edit-goal-personal-goal').val(adarda.formatMoney(personalProgress.goal));
            
            if(teamProgress) {
              $('#edit-goal-team-goal').val(adarda.formatMoney(teamProgress.goal));
            }
          }, 
          error: handleApiError
        }
      });
      
      if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].aTeamCaptain) {
        adarda.trpc.api.teamraiser.getTeamShortcut({
          callback: {
            success: function(response) {
              var shortcutItem = response.getTeamShortcutResponse.shortcutItem, 
              shortcutUrl = shortcutItem.url || 
                            (luminateExtend.global.path.secure + 
                             'TR?fr_id=' + adarda.trpc.frId + 
                             '&pg=team&team_id=' + adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId);
              $('#edit-team-page-url').html(shortcutUrl);
              $('.viewPageTeam').attr('href',shortcutUrl);
              $('#edit-team-page-url-shortcut').val(shortcutItem.text || '');
            }, 
            error: handleApiError
          }
        });
        
        adarda.trpc.ui.refreshTeamPhoto();
        
        if(!$('#edit-team-page-body').data('prevvalue')) {
          adarda.trpc.api.teamraiser.getTeamPageInfo({
            callback: {
              success: function(response) {
                setEditorContent('#edit-team-page-body', response.getTeamPageResponse.teamPage.richText);
              }, 
              error: handleApiError
            }
          });
        }
      }
      
      if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.isCompanyCoordinator) {
        adarda.trpc.api.teamraiser.getCompanyShortcut({
          callback: {
            success: function(response) {
              var shortcutItem = response.getCompanyShortcutResponse.shortcutItem, 
              shortcutUrl = shortcutItem.url || 
                            (luminateExtend.global.path.secure + 
                             'TR?fr_id=' + adarda.trpc.frId + 
                             '&pg=' + 
                             (adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.companyType === 'LOCAL' ? 'company' : 'national_company') + 
                             '&company_id=' + adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.companyId);
              $('#edit-company-page-url').html(shortcutUrl);
              $('#edit-company-page-url-shortcut').val(shortcutItem.text || '');
            }, 
            error: handleApiError
          }
        });
        
        adarda.trpc.ui.refreshCompanyPhoto();
        
        if(!$('#edit-company-page-body').data('prevvalue')) {
          adarda.trpc.api.teamraiser.getCompanyPageInfo({
            callback: {
              success: function(response) {
                setEditorContent('#edit-company-page-body', response.getCompanyPageResponse.companyPage.richText);
              }, 
              error: handleApiError
            }
          });
        }
      }
    }, 

    /* refresh the personal photo after it is updated */
    refreshPersonalPhoto: function(retainModals) {
      /* close the photo modals if one is open */
      if (retainModals != true) {
        $('#edit-personal-photo-1-modal, #edit-personal-caption-modal, #delete-personal-photo-1-modal, #edit-personal-photo-2-modal, #delete-personal-photo-2-modal').modal('hide');
      }
      
      /* reset the photos */
      $('.js--delete-personal-photo-1, .js--delete-personal-photo-2').addClass('hidden');
      $('.js--personal-photo-1 .edit-photo__inner, .js--personal-photo-2 .edit-photo__inner').html('');
      $('#edit-personal-photo-1-file, #edit-personal-photo-2-file').val('');
      $('#edit-personal-photo-1-submit, #edit-personal-caption-submit, #edit-personal-photo-2-submit').removeClass('disabled');
      
      /* get the participant's personal page photos */
      adarda.trpc.api.teamraiser.getPersonalPhotos({
        callback: {
          success: function(response) {
            if(response.getPersonalPhotosResponse.photoItem) {
              var photoItems = luminateExtend.utils.ensureArray(response.getPersonalPhotosResponse.photoItem);
              $.each(photoItems, function() {
                var photoId = this.id, 
                photoUrl = this.customUrl, 
                photoCaption = typeof this.caption === 'string' ? this.caption : undefined, 
                $photoContainer = $('.js--personal-photo-' + photoId + ' .edit-photo__inner');
                
                if(photoUrl) {
                  $('.js--delete-personal-photo-' + photoId).removeClass('hidden');
                  if (photoUrl.indexOf('641140856.custom.jpg') == -1) {
                    $('.js--personal-photo-' + photoId + ' a:contains("Upload Photo")').html('Edit Photo');
                  }
                  $photoContainer.append('<div>' + 
                                           '<img alt="" src="' + photoUrl + '">' + 
                                         '</div>');
                  
                  // if(photoCaption) {
                  //   $photoContainer.find('img').after('<div class="img-caption js--img-caption js--img-caption-active">' + 
                  //                                       '<p>' + photoCaption + '</p>' + 
                  //                                     '</div>');
                  //   $('#edit-personal-photo-' + photoId + '-caption').val(photoCaption);
                  //   $('#edit-personal-caption-caption').val(photoCaption);
                  // }
                } else {
                  $('.js--personal-photo-' + photoId + ' a:contains("Edit Photo")').html('Upload Photo');
                }
              });
            }
          }, 
          error: handleApiError
        }
      });
    }, 
    
    /* refresh the personal video after it is updated */
    refreshPersonalVideo: function() {
      /* close the video edit modal if it is open */
      $('#edit-personal-video-modal').modal('hide');
      
      /* reset the video */
      $('.js--personal-video .edit-video__inner iframe').remove();
      
      adarda.trpc.api.teamraiser.getPersonalVideoUrl({
        callback: {
          success: function(response) {
            var videoUrl = response.getPersonalVideoUrlResponse.videoUrl;
            if(videoUrl) {
              var videoId;
              if(videoUrl.indexOf('/embed/') != -1) {
                videoId = videoUrl.split('/embed/')[1].split('?')[0];
              }
              else if(videoUrl.indexOf('v=') != -1) {
                videoId = videoUrl.split('v=')[1].split('&')[0];
              }
              else {
                videoId = videoUrl.split('/')[videoUrl.split('/').length - 1].split('?')[0];
              }
              
              $('.js--personal-video .edit-video__inner').append('<iframe src="//www.youtube.com/embed/' + videoId + 
                                                                 '?wmode=opaque" frameborder="0" allowfullscreen></iframe>')
                                                         .removeClass('hidden');
              
              $('#edit-personal-video-url').val('http://www.youtube.com/watch?v=' + videoId);
            }
          }, 
          error: handleApiError
        }
      });
    }, 
    
    /* handle errors encountered uploading photos */
    uploadPhotoError: function(response, errorContainer) {
      if(handleApiError(response)) {
        $(errorContainer).html(response.errorResponse.message)
                         .removeClass('hidden');
        
        $(errorContainer).closest('.modal').find('.js--edit-photo-submit').removeClass('disabled');
      }
    }, 
    
    /* handle errors encountered updating page content */
    updatePageError: function(errorMessage) {
      $('#pc-edit-page-error').html(errorMessage)
                              .removeClass('hidden');
    }, 
    
    /* handle errors encountered in the preview popup window */
    previewPageError: function(response) {
      if(handleApiError(response)) {
        adarda.trpc.ui.updatePageError(response.errorResponse.message);
      }
    }, 
    
    /* refresh the team photo after it is updated */
    refreshTeamPhoto: function(retainModals) {
      /* close the photo edit modal if it is open */
      if (retainModals != true) {
        $('#edit-team-photo-modal, #edit-team-caption-modal, #delete-team-photo-modal').modal('hide');
      }
      
      /* reset the photo */
      $('.js--delete-team-photo-1').addClass('hidden');
      $('.js--team-photo-1 .edit-photo__inner').html('');
      $('#edit-team-photo-file').val('');
      $('#edit-team-photo-submit, #edit-team-caption-submit').removeClass('disabled');
      
      /* get the team page photo */
      adarda.trpc.api.teamraiser.getTeamPhoto({
        callback: {
          success: function(response) {
            if(response.getTeamPhotoResponse.photoItem) {
              var photoItems = luminateExtend.utils.ensureArray(response.getTeamPhotoResponse.photoItem);
              $.each(photoItems, function() {
                var photoId = this.id, 
                photoUrl = this.customUrl, 
                photoCaption = typeof this.caption === 'string' ? this.caption : undefined, 
                $photoContainer = $('.js--team-photo-' + photoId + ' .edit-photo__inner');
                
                if(photoUrl) {
                  $('.js--delete-team-photo-' + photoId).removeClass('hidden');
                  if (photoUrl.indexOf('1080908456.custom.jpg') == -1) {
                    $('.js--team-photo-' + photoId + ' a:contains("Upload Photo")').html('Edit Photo');
                  }
                  $photoContainer.append('<div>' + 
                                           '<img alt="" src="' + photoUrl + '">' + 
                                         '</div>');
                  
                  // if(photoCaption) {
                  //   $photoContainer.find('img').after('<div class="img-caption js--img-caption js--img-caption-active">' + 
                  //                                       '<p>' + photoCaption + '</p>' + 
                  //                                     '</div>');
                  //   $('#edit-team-photo-caption').val(photoCaption);
                  //   $('#edit-team-caption-caption').val(photoCaption);
                  // }
                } else {
                  $('.js--team-photo-' + photoId + ' a:contains("Edit Photo")').html('Upload Photo');
                }
              });
            }
          }, 
          error: handleApiError
        }
      });
    }, 
    
    /* refresh the company photo after it is updated */
    refreshCompanyPhoto: function() {
      /* close the photo edit modal if it is open */
      $('#edit-company-photo-modal, #delete-company-photo-modal').modal('hide');
      
      /* reset the photo */
      $('.js--delete-company-photo-1').addClass('hidden');
      $('.js--company-photo-1 .edit-photo__inner').html('');
      $('#edit-company-photo-file').val('');
      $('#edit-company-photo-submit').removeClass('disabled');
      
      /* get the company page photo */
      adarda.trpc.api.teamraiser.getCompanyPhoto({
        callback: {
          success: function(response) {
            if(response.getCompanyPhotoResponse.photoItem) {
              var photoItems = luminateExtend.utils.ensureArray(response.getCompanyPhotoResponse.photoItem);
              $.each(photoItems, function() {
                var photoId = this.id, 
                photoUrl = this.customUrl, 
                $photoContainer = $('.js--company-photo-' + photoId + ' .edit-photo__inner');
                
                if(photoUrl) {
                  $('.js--delete-company-photo-' + photoId).removeClass('hidden');
                  $photoContainer.append('<div>' + 
                                           '<img alt="" src="' + photoUrl + '">' + 
                                         '</div>');
                }
              });
            }
          }, 
          error: handleApiError
        }
      });
    }, 
    
    /* build the custom video form */
    getSurveyAnswers: function() {
      adarda.getSurveyResponses({
        frId: adarda.trpc.frId, 
        callback: {
          success: function(response) {
            var surveyResponses = luminateExtend.utils.ensureArray(response.getSurveyResponsesResponse.responses);
            
            /* store the survey responses */
            adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].surveyResponses = surveyResponses;
            
            $.each(surveyResponses, function() {
              var surveyResponse = this, 
              questionId = surveyResponse.questionId, 
              surveyQuestionName = 'question_' + questionId, 
              surveyKey = surveyResponse.key || '', 
              responseValue = surveyResponse.responseValue;
              // console.log('surveyQuestionName: ', surveyQuestionName);
              // console.log('surveyKey: ', surveyKey);
              if(typeof responseValue != 'string' || responseValue === 'User Provided No Response') {
                responseValue = '';
              }

              if(surveyKey === 'mobile_phone') {
                if(!$.isEmptyObject(responseValue) && (responseValue != '')) {
                  // $('#edit-honorary').val(responseValue);
                  $('.js__mobile-phone-field').val(responseValue).attr('name', surveyQuestionName).closest('label');
                  $('.js__mobile-phone-field').prev('label').attr('for', surveyQuestionName);

                  $('.js__mobile-phone-answer').html(responseValue);
                }
              }

              if(surveyKey === 'alz_connection') {
                if(!$.isEmptyObject(responseValue) && (responseValue != '')) {
                  $('.js__alz-connection-field').attr('name', surveyQuestionName);
                  $('.js__alz-connection-field').prev('label').attr('for', surveyQuestionName);

                  $('.js__alz-connection-answer').html(responseValue);

                  var questionAnswers = luminateExtend.utils.ensureArray(surveyResponse.questionAnswer);

                  $.each(questionAnswers, function() {
                    var questionAnswer = this;
                    $('.js__alz-connection-field').append('<option value="' + questionAnswer.value + '">' + 
                                               questionAnswer.label + 
                                             '</option>');
                  });
                  if($('.js__alz-connection-field option[value="' + responseValue + '"]').length > 0) {
                    $('.js__alz-connection-field').val(responseValue);
                  }

                }
              }
              if(surveyKey === 'ride_honoree') {
                if(!$.isEmptyObject(responseValue) && (responseValue != '')) {
                  // $('#edit-honorary').val(responseValue);
                  $('.js__honoree-field').val(responseValue).attr('name', surveyQuestionName).closest('label');
                  $('.js__honoree-field').prev('label').attr('for', surveyQuestionName);

                  $('.js__honoree-answer').html(responseValue);
                }
              }
              if(surveyKey === 'tshirt_size') {
                if(!$.isEmptyObject(responseValue) && (responseValue != '')) {
                  $('.js__tshirt-size-field').attr('name', surveyQuestionName);
                  $('.js__tshirt-size-answer').html(responseValue);
                  $('.js__tshirt-size-field').prev('label').attr('for', surveyQuestionName);

                  var questionAnswers = luminateExtend.utils.ensureArray(surveyResponse.questionAnswer);

                  $.each(questionAnswers, function() {
                    var questionAnswer = this;
                    $('.js__tshirt-size-field').append('<option value="' + questionAnswer.value + '">' + 
                                               questionAnswer.label + 
                                             '</option>');
                  });
                  if($('.js__tshirt-size-field option[value="' + responseValue + '"]').length > 0) {
                    $('.js__tshirt-size-field').val(responseValue);
                  }
                }
              }

              if(surveyKey === 'ride_route') {
                if(!$.isEmptyObject(responseValue) && (responseValue != '')) {
                  $('.js__ride-route-field').attr('name', surveyQuestionName);
                  $('.js__ride-route-answer').html(responseValue);
                  $('.js__ride-route-answer').prev('label').attr('for', surveyQuestionName);

                  var questionAnswers = luminateExtend.utils.ensureArray(surveyResponse.questionAnswer);

                  $.each(questionAnswers, function() {
                    var questionAnswer = this;
                    $('.js__ride-route-field').append('<option value="' + questionAnswer.value + '">' + 
                                               questionAnswer.label + 
                                             '</option>');
                  });
                  if($('.js__ride-route-field option[value="' + responseValue + '"]').length > 0) {
                    $('.js__ride-route-field').val(responseValue);
                  }
                }
              }

              if(surveyKey === 'is_vegetarian') {
                if(!$.isEmptyObject(responseValue) && (responseValue != '')) {
                  $('.js__is-vegetarian-answer').html(responseValue);
                  $('.js__is-vegetarian-answer').parent().prev('label').attr('for', surveyQuestionName);

                  var questionAnswers = luminateExtend.utils.ensureArray(surveyResponse.questionAnswer);
                  $.each(questionAnswers, function(i) {
                    var questionAnswer = this;
                    var radioMarkup = '<div class="custom-control custom-radio custom-control-inline">' + 
                    '<input class="custom-control-input" type="radio" name="' + surveyQuestionName + 
                    '" id="' + questionId + '-' + i + 
                    '" value="' + this.value + 
                    '" data-label="' + this.label + '"' + (responseValue === this.value ? 'checked' : '') + '>' + 
                      '<label class="custom-control-label" for="' + questionId + '-' + i + '">' + 
                      this.label + 
                      '</label>' + 
                    '</div>';
                    $('.js__is-vegetarian-field').append(radioMarkup);
                  });
                }
              }

              if(surveyKey === 'volunteer_interests') {
                if(!$.isEmptyObject(responseValue) && (responseValue != '')) {
                  $('.js__ride-volunteer-position-field').attr('name', surveyQuestionName);
                  $('.js__ride-volunteer-position-answer').html(responseValue);
                  $('.js__ride-volunteer-position-answer').prev('label').attr('for', surveyQuestionName);

                  var questionAnswers = luminateExtend.utils.ensureArray(surveyResponse.questionAnswer);

                  $.each(questionAnswers, function() {
                    var questionAnswer = this;
                    $('.js__ride-volunteer-position-field').append('<option value="' + questionAnswer.value + '">' + 
                                               questionAnswer.label + 
                                             '</option>');
                  });
                  if($('.js__ride-volunteer-position-field option[value="' + responseValue + '"]').length > 0) {
                    $('.js__ride-volunteer-position-field').val(responseValue);
                  }
                }
              }

              if(surveyKey === 'crew_interests') {
                if(!$.isEmptyObject(responseValue) && (responseValue != '')) {
                  $('.js__ride-crew-position-field').attr('name', surveyQuestionName);
                  $('.js__ride-crew-position-answer').html(responseValue);
                  $('.js__ride-crew-position-answer').prev('label').attr('for', surveyQuestionName);

                  var questionAnswers = luminateExtend.utils.ensureArray(surveyResponse.questionAnswer);

                  $.each(questionAnswers, function() {
                    var questionAnswer = this;
                    $('.js__ride-crew-position-field').append('<option value="' + questionAnswer.value + '">' + 
                                               questionAnswer.label + 
                                             '</option>');
                  });
                  if($('.js__ride-crew-position-field option[value="' + responseValue + '"]').length > 0) {
                    $('.js__ride-crew-position-field').val(responseValue);
                  }
                }
              }

              // if(surveyResponse.questionText === 'I am participating to honor') {
              //   $('#edit-honorary').data('questionid', questionId);
                
              //   if(!$.isEmptyObject(responseValue) && (responseValue != '')) {
              //     $('#edit-honorary').val(responseValue);
              //     $('.honoraryName').html(responseValue);
              //   }
              // }
              if(surveyResponse.questionText === 'Name in personal video') {
                $('#edit-video-name').data('questionid', questionId);
                
                if(!$.isEmptyObject(responseValue) && (responseValue != '')) {
                  $('#edit-video-name').val(responseValue);
                  $('.videoName').html(responseValue);
                }
              }
              if(surveyResponse.questionText === 'Edward Jones FA/BOA') {
                if(!$.isEmptyObject(responseValue) && (responseValue != '')) {
                  $('.is-hba').addClass('hidden');
                  $('.is-edward-jones, .is-faboa').removeClass('hidden');
                  $('#edit-ej-type').val('faboa');
                  var faboasplit = responseValue.split('|');
                  if (faboasplit.length == 4) {
                    $('#edit-ej-faboa').val(faboasplit[0]);
                    $('#edit-ej-region').val(faboasplit[1]);
                    $('#edit-ej-branch').val(faboasplit[2]);
                    $('#edit-ej-fanum').val(faboasplit[3]);
                  }
                }
              }
              if(surveyResponse.questionText === 'Edward Jones HBA') {
                if(!$.isEmptyObject(responseValue) && (responseValue != '')) {
                  $('.is-faboa').addClass('hidden');
                  $('.is-edward-jones, .is-hba').removeClass('hidden');
                  $('#edit-ej-type').val('hba');
                  var hbasplit = responseValue.split('|');
                  if (hbasplit.length > 3 && hbasplit.length < 6) {
                    $('#edit-ej-jpnum').val(hbasplit[0]);
                    $('#edit-ej-homeoffice').val(hbasplit[1]);
                    if (hbasplit.length == 5) {
                      $('#edit-ej-division').val(hbasplit[4]);
                    }
                  }
                }
              }
            });
            /* trigger custom event */
            $(document).trigger('surveyResponses:loaded');
          }, 
          error: handleApiError
        }
      });
    },
    
    /* Facebook Fundraiser functionality */

    /* get suggested fundraiser config */
    fbLogin: function(suggest) {
      FB.login(function(resp){
        if (resp && resp.status == 'connected' && resp.authResponse && resp.authResponse.accessToken && resp.authResponse.userID) {
          var fbUserID = resp.authResponse.userID;
          var fbAccessToken = resp.authResponse.accessToken;
          FB.api('/me/permissions', function(resp){
            if (resp && resp.data && (resp.data.length > 0)) {
              $(resp.data).each(function(){
                if (this.permission == 'manage_fundraisers' && this.status == 'granted') {
                  adarda.trpc.cons.profile.fb = {
                    'userId': fbUserID,
                    'accessToken': fbAccessToken
                  };
                  if (suggest) {
                    // In future use to confirm details with user  -  fbSuggestFundraiserConfig();
                    adarda.trpc.ui.fbCreateFundraiser();
                  } else {
                    adarda.trpc.ui.fbCreateFundraiser();
                  }
                  return false;
                }
              });
              if (!adarda.trpc.cons.profile.fb.userId) {
                $('.js__btn-fbf').each(function(){
                  $(this).html($(this).data('original'));
                });
                $('#fbf-error-modal .fbf-error').html('We need your permission to create a Facebook Fundraiser on your behalf. Please try again.');
                $('#fbf-error-modal').modal('show');
                setTimeout(function(){$('#fbf-error-modal').modal('hide');}, 5000);
              }
            } else {
              $('.js__btn-fbf').each(function(){
                $(this).html($(this).data('original'));
              });
              $('#fbf-error-modal .fbf-error').html('An error occurred attempting to connect to Facebook. Please try again later.');
              $('#fbf-error-modal').modal('show');
              setTimeout(function(){$('#fbf-error-modal').modal('hide');}, 5000);
            }
          });
        } else {
          $('.js__btn-fbf').each(function(){
            $(this).html($(this).data('original'));
          });
          $('#fbf-error-modal .fbf-error').html('An error occurred attempting to connect to Facebook. Please try again later.');
          $('#fbf-error-modal').modal('show');
          setTimeout(function(){$('#fbf-error-modal').modal('hide');}, 5000);
        }
      }, {scope: 'manage_fundraisers'});
    },

    /* get suggested fundraiser config */
    fbSuggestFundraiserConfig: function() {
      var requestData={
        charity_id: charity_id,
        external_id: 'lotrp:'+adarda.trpc.frId+'-'+adarda.trpc.cons.profile.id
      };

      $.ajax({
        url: 'https://facebookfundraiser.sky.blackbaud.com/suggest_fundraiser_config',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(requestData)
      }).done(function(resp){
          // TODO: Load suggestions into modal for verification
        }).fail(function(e){
          $('.js__btn-fbf').each(function(){
            $(this).html($(this).data('original'));
          });
          $('#fbf-error-modal .fbf-error').html('An error occurred attempting to connect to Facebook. Please try again later. Error: ' + e.error.code + ' - ' + e.error.message);
          $('#fbf-error-modal').modal('show');
          setTimeout(function(){$('#fbf-error-modal').modal('hide');}, 5000);
        });
    },
    /* create fundraiser */
    fbCreateFundraiser: function() {
      var requestData={
        charity_id: charity_id,
        external_id: 'lotrp:'+adarda.trpc.frId+'-'+adarda.trpc.cons.profile.id,
        fundraiser_name: adarda.trpc.cons.profile.name.first.substring(0,39) + ' is Riding to End Alzheimer\'s!',
        cover_photo: 1,
        default_cover_photo: 'https://act.alz.org/images/content/pagebuilder/FacebookFundraiserCover_purplebike01.jpg',
        default_goal_amount: '1600.00',
        end_time: Math.round((new Date(adarda.trpc.teamraiser['tr'+adarda.trpc.frId].date).getTime()) / 1000 + 2592000),
        facebook_user_id: adarda.trpc.cons.profile.fb.userId,
        access_token: adarda.trpc.cons.profile.fb.accessToken
      };

      $.ajax({
        url: 'https://facebookfundraiser.sky.blackbaud.com/create_fundraiser',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(requestData)
      }).done(function(resp){
          if (!resp.error) {
            $('.fbf-link').attr('href','https://www.facebook.com/donate/'+resp.fundraiser.id);
            $('.js__btn-fbf').attr('href','https://www.facebook.com/donate/'+resp.fundraiser.id).attr('target','_blank').html('GO TO FACEBOOK <i class="fas fa-chevron-right"></i>');
            $('.fbf-msg-new').addClass('hidden');
            $('.fbf-msg-created').removeClass('hidden');
            adarda.trpc.ui.fbSyncDonations();
            fbq('track', 'Walk_FBFundraiser');
          } else {
            $('.js__btn-fbf').each(function(){
              $(this).html($(this).data('original'));
            });
          }
        }).fail(function(e){
          $('.js__btn-fbf').each(function(){
            $(this).html($(this).data('original'));
          });
          $('#fbf-error-modal .fbf-error').html('An error occurred attempting to connect to Facebook. Please try again later. Error: ' + e.error.code + ' - ' + e.error.message);
          $('#fbf-error-modal').modal('show');
          setTimeout(function(){$('#fbf-error-modal').modal('hide');}, 5000);
        });
    },
    /* update fundraiser - currently only goal */
    fbUpdateFundraiser: function() {
      var requestData={
        charity_id: charity_id,
        external_id: 'lotrp:'+adarda.trpc.frId+'-'+adarda.trpc.cons.profile.id
      };

      $.ajax({
        url: 'https://facebookfundraiser.sky.blackbaud.com/update_fundraiser',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(requestData)
      }).done(function(resp){
        }).fail(function(e){
          $('#fbf-error-modal .fbf-error').html('An error occurred attempting to update Facebook. Please try again later. Error: ' + e.error.code + ' - ' + e.error.message);
          $('#fbf-error-modal').modal('show');
          setTimeout(function(){$('#fbf-error-modal').modal('hide');}, 5000);
        });
    },
    /* sync donations across platforms */
    fbSyncDonations: function() {
      var requestData={
        charity_id: charity_id,
        external_id: 'lotrp:'+adarda.trpc.frId+'-'+adarda.trpc.cons.profile.id
      };

      $.ajax({
        url: 'https://facebookfundraiser.sky.blackbaud.com/sync_donations',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(requestData)
      }).done(function(resp){
        }).fail(function(e){
          $('#fbf-error-modal .fbf-error').html('An error occurred attempting to sync to Facebook. Please try again later. Error: ' + e.error.code + ' - ' + e.error.message);
          $('#fbf-error-modal').modal('show');
          setTimeout(function(){$('#fbf-error-modal').modal('hide');}, 5000);
        });
    },
    /* sync donations across platforms */
    fbConfirmStatus: function() {
      var requestData={
        charity_id: charity_id,
        external_id: 'lotrp:'+adarda.trpc.frId+'-'+adarda.trpc.cons.profile.id
      };

      $.ajax({
        url: 'https://facebookfundraiser.sky.blackbaud.com/confirm_fundraiser_status',
        type: 'POST',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(requestData)
      }).done(function(resp){
          if(!resp.status || !resp.status.active) {
            /* not active */
            $('.js__btn-fbf').attr('href','').attr('target','').removeAttr('disabled').html('<span class="icon-facebook"></span> Connect Fundraiser to Facebook');
          } else {
            /* active */
            $('.js__btn-fbf').removeAttr('disabled');
          }
        }).fail(function(e){
          $('#fbf-error-modal .fbf-error').html('An error occurred attempting to confirm status of Facebook Fundraiser. Please reload the page. Error: ' + e.error.code + ' - ' + e.error.message);
          $('#fbf-error-modal').modal('show');
          setTimeout(function(){$('#fbf-error-modal').modal('hide');}, 5000);
        });
    }
  };
  
  /* ********************* */
  /* custom event handlers */
  /* ********************* */
  
  /* viewchange event */
  $(document).on('viewchange', function(e, viewName) {
    startKeepAlive();
    if ($('.js__btn-fbf').length > 0 && $('.js__btn-fbf').eq(0).html().indexOf('View') != -1) {
      adarda.trpc.ui.fbConfirmStatus();
    }

    $('.js--current-view').removeClass('hidden-xs')
    .html($('.pc-navbar a[href="#' + viewName + '"]').html() + ' <span class="caret"></span>');
    if($('.navbar-collapse').is('.in')) {
      $('.navbar-collapse').collapse('hide');
    }
    $('.pc-navbar li').removeClass('active');
    if(viewName != 'pc-notifications') {
      $('.pc-navbar a[href="#' + viewName + '"]:eq(0)').closest('li').addClass('active');
    }
    
    var $personalVideo = $('.js--personal-video .edit-video__inner iframe');
    if($personalVideo.length > 0) {
      $personalVideo.attr('src', $personalVideo.attr('src'));
    }
    
    var currentHash = window.location.hash;
    if(currentHash && currentHash != '' && $(currentHash).length > 0) {
      $(window).scrollTop($(currentHash).offset().top)
               .scrollLeft($(currentHash).offset().left);
    }
    if(viewName === 'pc-social'){
      //console.log("here is social");
      if (!jQuery('#social-tab-tab iframe').length > 0) {
        //console.log("Social does NOT exist");
        var bfSocialVars = new Object();
        var bfDataSet = window.parent.document.getElementById('social-tab-tab');
        bfSocialVars.bfConsId = adarda.trpc.cons.profile.id;
        bfSocialVars.bfFrId = adarda.trpc.frId;
        bfSocialVars.bfAcct = "alzaride";
        bfSocialVars.bfauth = bfDataSet.dataset.bfauth;
        bfSocialVars.bfsession = bfDataSet.dataset.bfsession;
        //console.log(bfSocialVars);
        jQuery('#social-tab-tab').append('<iframe title="Boundless Fundraising Social App" src="https://loadprod.boundlessfundraising.com/applications/'+bfSocialVars.bfAcct+'/social/app/ui/#/addsocial/'+bfSocialVars.bfConsId+'/'+bfSocialVars.bfFrId+'/'+bfSocialVars.bfauth+'/'+bfSocialVars.bfsession+'/?source=PCSocial" style="width:100%;height:1000px;border:1px solid #cccccc;"></iframe>');
      }
    }
  })
  /* logout event */
  .on('logout', function() {
    /* reset views */
    $('.view-container').removeClass('view-loaded');
    
    /* reset config and registration info */
    adarda.trpc.teamraiserConfig = {};
    adarda.trpc.teamraiserRegistration = {};
    
    /* hide any modals or dialogs that are open */
    $('.modal').modal('hide');
    walk.dialogOverlayClose();
    
    /* show the login modal */
    $('#login-modal').modal('show');
  })
  /* constituent info loaded event */
  .on('consInfo:loaded', function() {
    var consName = adarda.trpc.cons.profile.name;
    if(consName) {
      if(consName.first) {
        $('.cons-first-name').html(consName.first);
      }
      if(consName.last) {
        $('.cons-last-name').html(consName.last);
      }
    }
  })
  /* pc dashboard view event */
  .on('view:pc-dashboard', function() {
    /* build the dashboard if the view hasn't already been loaded */
    if(!$('#pc-dashboard-view').is('.view-loaded')) {
      $('.js__newsbar-container').show();
      adarda.trpc.ui.buildDashboard();
      adarda.trpc.ui.buildCompanyList();
    }
  })
  /* pc email view event */
  .on('view:pc-email', function() {
    if ($('a[href="#email__compose"]').length > 0) {
      $('a[href="#email__compose"]').click();
    }
    
    $('#email-compose-error').html('').addClass('hidden');
    
    scrollToTop();
    
    var $suggestedMessages = $('.email-suggested-messages'), 
    preSelectedMessageName = $suggestedMessages.data('messagename');
    if(preSelectedMessageName) {
      var preSelectedMessageId = $suggestedMessages.find('option[data-messagename="' + preSelectedMessageName.toLowerCase() + '"]').val();
      if(preSelectedMessageId) {
        $suggestedMessages.val(preSelectedMessageId).change();
        $('#pc2EmailSection').addClass('show');
      }
    }
    
    /* build the email form and contacts list if the view hasn't already been loaded */
    if(!$('#pc-email-view').is('.view-loaded') && $('.email-contacts-table .table--row input[type="checkbox"]:checked').length === 0) {
      adarda.trpc.ui.buildEmailForm();
      adarda.trpc.ui.buildContactFilters();
      adarda.trpc.ui.buildContactsList();
    }

    if ($('#pc-email-view').hasClass('email_rpt_show_teammates')) {
      if ($('a[data-filter="email_rpt_show_teammates"]:eq(0)').hasClass('active')) {
        $('#email__contacts .email-contacts-table .js--contacts-select-all:eq(0)').click();
        $('.email__contacts--action.email-contacts-compose').click();
        $('#pc-email-view').removeClass('email_rpt_show_teammates');
      } else {
        $('a[data-filter="email_rpt_show_teammates"]:eq(0)').click();
      }
    } else if ($('#pc-email-view').hasClass('email_rpt_show_donors')) {
      $('.email-tabs-contacts a').click();
      $('a[data-filter="email_rpt_show_donors"]:eq(0)').click();
      $('#pc-email-view').removeClass('email_rpt_show_donors');
    }

    /* update personal URLs in external message templates */
    adarda.trpc.api.teamraiser.getShortcut({
      callback: {
        success: function(response) {
          var shortcutItem = response.getShortcutResponse.shortcutItem, 
          shortcutUrl = shortcutItem.url || 
                        (luminateExtend.global.path.secure + 
                         'TR?fr_id=' + adarda.trpc.frId + 
                         '&pg=personal&px=' + adarda.trpc.cons.profile.id);
          $('#pc-email-view .js__personal-page-link').html('<a href="' + shortcutUrl + '">' + shortcutUrl + '</a>');
          $('#pc-email-view .openEmail').each(function(){
            $(this).attr('href', $(this).attr('href') + encodeURIComponent('My page: ' + shortcutUrl));
          });
        }, 
        error: handleApiError
      }
    });
  })
  /* pc edit page view event */
  .on('view:pc-edit-page', function() {
    $('#pc-edit-page-success').addClass('hidden');
    $('#pc-edit-page-error').html('')
                            .addClass('hidden');
    
    /* build the personal page editor if the view hasn't already been loaded */
    if(!$('#pc-edit-page-view').is('.view-loaded')) {
      adarda.trpc.ui.buildPageEditor();
      /* adarda.trpc.ui.buildTeamMembersList(true); */
    }
  })
  /* pc custom video view event */
  .on('view:pc-custom-video', function() {
    $('#pc-custom-video-success').addClass('hidden');
    
    /* build the custom video form if the view hasn't already been loaded */
    if(!$('#pc-custom-video-view').is('.view-loaded')) {
      adarda.trpc.ui.getSurveyAnswers();
    }
  })
  /* pc notifications view event */
  .on('view:pc-notifications', function() {
    /* build the notifications list each time the view is loaded */
    adarda.trpc.ui.buildNotificationsList();
  })
  /* personal donors view event */
  .on('view:pc-donors', function() {
    /* build the donation list each time the view is loaded */
    if($('#pc-dashboard-view').is('.view-loaded')) {
      $('#donors__me .donation-list').data('offset', 0);
    }
    adarda.trpc.ui.buildDonationLists(true);
  })
  /* team donors view event */
  .on('view:pc-team-donors', function() {
    /* build the donation list each time the view is loaded */
    if($('#pc-dashboard-view').is('.view-loaded')) {
      $('#donors__myteam .donation-list').data('offset', 0);
    }
    adarda.trpc.ui.buildDonationLists(true);
  })
  /* support view event */
  .on('view:pc-support', function() {
    /* build the company list */
      adarda.trpc.ui.buildCompanyList();
  })
  .on('view:pc-resources', function() {
  //  TODO - add resource page calls here
  })
  /* team members view event */
  .on('view:pc-team-roster', function() {
    /* build the team members list each time the view is loaded */
    if($('#pc-dashboard-view').is('.view-loaded')) {
      $('#pc-team-roster-view .donation-list').data('offset', 0);
    }
    adarda.trpc.ui.buildTeamMembersList(true);
  })
  /* team membersship change event */
  .on('view:pc-team-membership', function() {
    adarda.trpc.ui.buildCompanyList();
    adarda.trpc.ui.buildDivisionsList();
    if (adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].aTeamCaptain) {
      $('#tm__leave').addClass('hidden');
      $('#tm__help').addClass('active');
    }
  });
  
  if($('.js__registration-thank-you-dialog').length > 0) {
    /* confirm URL is ready */
    adarda.trpc.api.teamraiser.getShortcut({
      callback: {
        success: function(response) {
          var shortcutItem = response.getShortcutResponse.shortcutItem, 
          shortcutUrl = shortcutItem.url || 
                        (luminateExtend.global.path.secure + 
                         'TR?fr_id=' + adarda.trpc.frId + 
                         '&pg=personal&px=' + adarda.trpc.cons.profile.id);
          $('#edit-page-url').html(shortcutUrl);
          $('.viewPagePersonal').attr('href',shortcutUrl);
          $('.edit-page-url-prefix').html(shortcutItem.prefix);
          $('#edit-page-url-shortcut').val(shortcutItem.text || '');
        }, 
        error: handleApiError
      }
    });

    /* show the registration thank you dialog TODO - ADD BROWSER TESTING HERE */
    // walk.dialogOverlayOpen('.js__registration-thank-you-dialog');

/*------------------------------------------------------------------------
START CUSTOM BOUNDLESS FUNDRAISING LIGHTBOX FUNCTION (***DO NOT EDIT***)
------------------------------------------------------------------------*/
  //MODERNIZER TOUCH ACCESS (***DO NOT EDIT***)
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;
 userAgent.match(/iPad/i) || userAgent.match(/iPhone/i) || userAgent.match(/iPod/i) ? walk.dialogOverlayOpen('#pc-lightbox-mobile-apple') : userAgent.match(/Android/i) ? walk.dialogOverlayOpen('#pc-lightbox-mobile-android') : setTimeout(function() {
  if($('#pc-lightbox').length > 0) {
    walk.dialogOverlayOpen('#pc-lightbox')
  }
 }, 1e3);
  //END MODERNIZER TOUCH ACCESS
  /*------------------------------------------------------------------------
END CUSTOM BOUNDLESS FUNDRAISING LIGHTBOX FUNCTION (***DO NOT EDIT***)
------------------------------------------------------------------------*/


    // TODO - set cookie indicating that one visit has occurred
    document.cookie = 'pcVisits=1; expires=' + new Date(new Date().getTime() + 31536000000).toUTCString() + '; path=/';

    adarda.trpc.api.teamraiser.getShortcut({
      callback: {
        success: function(response) {
          var shortcutItem = response.getShortcutResponse.shortcutItem, 
          shortcutUrl = shortcutItem.url || 
                        (luminateExtend.global.path.secure + 
                         'TR?fr_id=' + adarda.trpc.frId + 
                         '&pg=personal&px=' + adarda.trpc.cons.profile.id);
          $('#thanks-edit-page-url').html(shortcutUrl);
        }, 
        error: handleApiError
      }
    });
  }
  else {
    /* show the loading modal */
    showLoading();
  }

  if(document.cookie.indexOf('pcVisits=1') > 0 && $('.js__registration-thank-you-dialog').length === 0 && $('.page-update-step').data('pageupdated') !== 'true') {
    walk.dialogOverlayOpen('#update-your-page-dialog');
    deleteCookie('pcVisits');
  }

  if($('#pc-container').data('daystoevent') === 30) {
    // TODO - update the copy for this modal in reus_ridepc_modals before turning it on again
    // walk.dialogOverlayOpen('#fundraising-progress-dialog');
  }
  /* init text editors */
  $('.jquery-text-editor').jqte({
    indent: false, 
    outdent: false, 
    remove: false, 
    rule: false, 
    source: false, 
    strike: false, 
    sub: false, 
    sup: false, 
    focus: function() {
      testLoginStatus();

      $('.jquery-text-editor[placeholder]').each(function() {
        var $editor = $(this), 
        editorId = $editor.attr('id');
        
        if($editor.closest('.jqte').is('.jqte-placeholder')) {
          setEditorContent('#' + editorId, '');
          
          $editor.closest('.jqte').removeClass('.jqte-placeholder');
        }
      });
    }, 
    blur: function() {
      $('.jquery-text-editor[placeholder]').each(function() {
        var $editor = $(this), 
        editorId = $editor.attr('id');
        
        if($.trim($('<div>' + getEditorContent('#' + editorId) + '</div>').text()) === '') {
          resetEditorContent('#' + editorId);
        }
      });
    }, 
    change: function() {
      $('.jqte_editor *[style*="mso-"]').each(function() {
        var elemStyleProperties = $(this).attr('style').split(';'), 
        elemStylePropertiesCleaned = [];
        $.each(elemStyleProperties, function(i, styleProperty) {
          if($.trim(styleProperty).split(':')[0].toLowerCase().indexOf('mso-') === -1) {
            elemStylePropertiesCleaned.push(styleProperty);
          }
        });
        $(this).attr('style', elemStylePropertiesCleaned.join(';'));
      });
      
      $('.jqte_editor *[color]').each(function() {
        $(this).css('color', $(this).attr('color'));
        $(this).removeAttr('color');
      });
    }
  });
  $('.jquery-text-editor').each(function() {
    resetEditorContent('#' + $(this).attr('id'));
  });
  
  /* handle bootstrap tooltip links */
  $('.pg_ridepc *[data-toggle="tooltip"]').tooltip().click(function(e) {
    e.preventDefault();
  });
  
  /* load view onpopstate */
  $(window).on('popstate', function() {
    if(history.state && 
       history.state.view) {
      adarda.trpc.view(history.state.view, true);
    }
  });

  /* Configure deferred functions */
  adarda.trpc.defers = {};
  adarda.trpc.defers.consName = $.Deferred();
  adarda.trpc.defers.initialLoad = $.Deferred();
  adarda.trpc.defers.eventDate = $.Deferred();
  adarda.trpc.defers.updateTeamInfo = $.Deferred();
  adarda.trpc.defers.showTeamInfo = $.Deferred();

  /* constituent info loaded event */
  $(document).on('consInfo:loaded', function() {
    adarda.trpc.defers.consName.then(function() {
      var consName = adarda.trpc.cons.profile.name;
      if(consName) {
        if(consName.first) {
          $('.cons-first-name').html(consName.first);
        }
        if(consName.last) {
          $('.cons-last-name').html(consName.last);
        }
      }
    });
  })
  /* event info loaded event */
  .on('eventInfo:loaded', function() {
    adarda.trpc.defers.eventDate.then(function() {
      $('.pc-event-date').html(luminateExtend.utils.simpleDateFormat(adarda.trpc.teamraiser['tr'+adarda.trpc.frId].date, 'M/d/yyyy'));
    });
  })
  /* team info loaded event */
  .on('teamInfo:loaded', function() {
    adarda.trpc.defers.showTeamInfo.then(function() {
      var $personalThermometerColumn = $('.js__personal-thermometer').closest('.fundraising-progress__meter--dual');
      $personalThermometerColumn.removeClass('hidden');
      
      if(!adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId) {
        /* show content for individual participants only */
        $('.not-team-member').removeClass('hidden');
      }
      else {
        /* show content for team members */
        $('.is-team-member').removeClass('hidden');
        
        if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].aTeamCaptain) {
          /* show content for team captains */
          $('.is-team-captain').removeClass('hidden');
          $('.not-team-captain').addClass('hidden');
          // $('.not-team-captain').addClass('hidden');
        } else {
          /* show content for all participants other than team captains */
          $('.not-team-captain').removeClass('hidden');
        }

        /* load team URL to thank you lightbox */
        adarda.trpc.api.teamraiser.getTeamShortcut({
          callback: {
            success: function(response) {
              var shortcutItem = response.getTeamShortcutResponse.shortcutItem, 
              shortcutUrl = shortcutItem.url || 
                            (luminateExtend.global.path.secure + 
                             'TR?fr_id=' + adarda.trpc.frId + 
                             '&pg=team&team_id=' + adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId);
              $('#thanks-edit-team-page-url').html(shortcutUrl);
            }, 
            error: handleApiError
          }
        });
      }
    });
  })
  /* registration loaded event */
  .on('registration:loaded', function() {
    adarda.trpc.api.teamraiser.updateRegistration({
      data: 'update_last_pc2_login=true', 
      callback: {
        success: function(response) {
          adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].lastPC2Login = new Date().getTime();
        }, 
        error: handleApiError
      }
    });
    
    /* get the participant's team information */
    if(!adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId) {
      /* trigger custom event */
      $(document).trigger('teamInfo:loaded');
    }
    else {
      adarda.trpc.api.teamraiser.getTeamsByInfo({
        teamId: adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId, 
        callback: {
          success: function(response) {
            if(response.getTeamSearchByInfoResponse.team) {
              /* store the necessary team info */
              var team = response.getTeamSearchByInfoResponse.team, 
              teamInfo = {
                teamName: team.name
              };
              
              $.extend(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId], teamInfo);
              
              /* trigger custom event */
              $(document).trigger('teamInfo:loaded');
            }
          }
        }
      });
      
      adarda.trpc.defers.updateTeamInfo.then(function() {
        /* set the team ID for all necessary fields */
        $('.js--team-id-value').val(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId);
        /* set the URL for all team page links */
        $('.team-page-link').attr('href', 'TR?fr_id=' + adarda.trpc.frId + 
                                          '&pg=team&team_id=' + 
                                          adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId);
      });
    }
    
    /* load survey questions for personalized video */
    adarda.trpc.ui.getSurveyAnswers();
  })
  /* login event */
  .on('login', function() {
    startKeepAlive(true);
    
    $('#pc-container').removeClass('js--has-auth-error');
    
    /* get the constituent's profile info */
    adarda.trpc.api.cons.getUser({
      callback: {
        success: function(response) {
          /* store the profile information */
          $.extend(adarda.trpc.cons.profile, response.getConsResponse);
          
          /* trigger custom event */
          $(document).trigger('consInfo:loaded');
        }, 
        error: handleApiError
      }
    });
    
    if(!adarda.trpc.frId) {
      window.location = luminateExtend.global.path.secure + 'SPageServer?pagename=ride_eventList';
    }
    else {
      var initialLoad = function() {
        hideLoading();
        if(adarda.trpc.teamraiser['tr'+adarda.trpc.frId] && 
           adarda.trpc.teamraiserConfig['tr'+adarda.trpc.frId] && 
           adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId]) {
          adarda.trpc.defers.initialLoad.then(function() {
            adarda.trpc.view(getQueryParam('pc2_page') || 'pc-dashboard');
            
            hideLoading();

            /* start tour if not previously disabled and not seeing the register thank you overlay */
            if($('.js__registration-thank-you-dialog').length === 0 && $('.pc-tour-start').length > 0) {
              if(document.cookie.indexOf('tourPopover=off') === -1) {
                hideLoading();

                $('#sb-site').append('<div class="modal-backdrop fade in js--popover-modal-backdrop" />');
                $('.pc__content').popover({
                  html: true, 
                  content: $('.pc-tour-start').html(), 
                  trigger: 'manual', 
                  placement: 'top'
                }).popover('show');
                $('#pc2EmailSection').addClass('show');
                
                $('.popover').on('click', '.js--tour-popover-dismiss', function(e) {
                  e.preventDefault();

                  $('.js--popover-modal-backdrop').remove();
                  $('.pc__content').popover('hide');
                  document.cookie = 'tourPopover=off; expires=' + new Date(new Date().getTime() + 31536000000).toUTCString() + '; path=/';
                
                });
              }
            }
          });

        }
      };
      
      adarda.getTeamraisers({
        frId: adarda.trpc.frId, 
        size: '1', 
        callback: {
          success: function(response) {
            var teamraiser = response.getTeamraisersResponse.teamraiser;
            if(teamraiser) {
              adarda.trpc.teamraiser['tr'+teamraiser.id] = {
                name: teamraiser.name, 
                date: teamraiser.event_date, 
                dateFriendly: luminateExtend.utils.simpleDateFormat(teamraiser.event_date, 'MMMM d, yyyy'), 
                time: $('#pc-container').data('eventtime'), 
                locationName: teamraiser.location_name
              };
              
              /* trigger custom event */
              $(document).trigger('eventInfo:loaded');
              
              initialLoad();
            }
            else {
              showGenericPageError();
              $('#page-error-view').append($('<div>Error: getTeamraisers</div>'));
            }
          }, 
          error: function() {
            showGenericPageError(); 
            $('#page-error-view').append($('<div>Error: getTeamraisers error</div>')); }
        }
      });
      
      adarda.trpc.api.teamraiser.getTeamraiserConfig({
        callback: {
          success: function(response) {
            /* store the necessary config info */
            if(!adarda.trpc.teamraiserConfig['tr'+adarda.trpc.frId]) {
              adarda.trpc.teamraiserConfig['tr'+adarda.trpc.frId] = {};
            }
            
            var teamraiserConfig = {}, 
            configInfoToStore = ['adminNewsFeedsEnabled', 
                                 'defaultStationeryId', 
                                 'offlineTeamGifts', 
                                 'personalOfflineGiftsAllowed', 
                                 'teamCaptainsMaximum', 
                                 'teamGiftsAllowed'];
            $.each(configInfoToStore, function(i, propName) {
              var propValue = response.getTeamraiserConfigResponse.teamraiserConfig[propName];
              
              if(propValue === 'true' || propValue === 'false') {
                propValue = (propValue === 'true');
              }
              
              teamraiserConfig[propName] = propValue;
            });
            $.extend(adarda.trpc.teamraiserConfig['tr'+adarda.trpc.frId], teamraiserConfig);
            
            if(adarda.trpc.teamraiserConfig['tr'+adarda.trpc.frId].defaultStationeryId == '-1') {
              delete adarda.trpc.teamraiserConfig['tr'+adarda.trpc.frId].defaultStationeryId;
            }
            if(adarda.trpc.teamraiserConfig['tr'+adarda.trpc.frId].teamCaptainsMaximum) {
              adarda.trpc.teamraiserConfig['tr'+adarda.trpc.frId].teamCaptainsMaximum = Number(adarda.trpc.teamraiserConfig['tr'+adarda.trpc.frId].teamCaptainsMaximum);
            }
            
            /* trigger custom event */
            $(document).trigger('config:loaded');
            
            initialLoad();
          }, 
          error: function() {
            showGenericPageError(); 
            $('#page-error-view').append($('<div>Error: getTeamraiserConfig</div>')); }
        }
      });
      
      adarda.trpc.api.teamraiser.getRegistration({
        callback: {
          success: function(response) {
            /* store the necessary registration info */
            if(!adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId]) {
              adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] = {};
            }
            
            var teamraiserRegistration = {}, 
            regInfoToStore = ['aTeamCaptain', 
                              'companyInformation', 
                              'lastPC2Login', 
                              'receiveGiftNotification', 
                              'privatePage',
                              'teamId'];
            $.each(regInfoToStore, function(i, propName) {
              var propValue = response.getRegistrationResponse.registration[propName];
              
              if(propValue === 'true' || propValue === 'false') {
                propValue = (propValue === 'true');
              }
              
              teamraiserRegistration[propName] = propValue;
            });
            $.extend(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId], teamraiserRegistration);
            
            if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation) {
              if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.isCompanyCoordinator === 'true') {
                adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.isCompanyCoordinator = true;
              }
              else {
                adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.isCompanyCoordinator = false;
              }
            }
            else if (adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId]) {
              adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation = {
                isCompanyCoordinator: false
              };
            }
            
            if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId == '-1') {
              delete adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId;
            }
            
            /* trigger custom event */
            $(document).trigger('registration:loaded');
            
            initialLoad();
          }, 
          error: function(response) {
            if(handleApiError(response)) {
              if(response.errorResponse.code === '2603') {
                window.location = luminateExtend.global.path.secure + 'SPageServer?pagename=ride_eventList';
              }
              else {
                showGenericPageError();
                $('#page-error-view').append($('<div>Error: getRegistration ' + response.errorResponse.message + '</div>'));
              }
            }
          }
        }
      });
      
      /* set the URL for all personal page links */
      $('.personal-page-link').attr('href', 'TR?fr_id=' + adarda.trpc.frId + '&pg=personal&px=' + adarda.trpc.cons.profile.id);
    }
  });

  /* test if the user is logged in */
  adarda.trpc.api.cons.loginTest({
    callback: {
      success: function(response) {
        /* store cons_id */
        adarda.trpc.cons.profile = {
          id: response.loginResponse.cons_id
        };
        
        /* trigger custom event */
        $(document).trigger('login');
      }, 
      error: handleApiError
    }
  });

  /* ******************* */
  /* $(document).ready() */
  /* ******************* */
  
  $(function() {
    /* test login status whenever window regains focus */
    $(window).focus(testLoginStatus);

  	/* blank out chapter fields if empty */
  	if (!luminateExtend.global.chapter) {
      luminateExtend.global.chapter = new Object();
      luminateExtend.global.chapter.phone = '';
      luminateExtend.global.chapter.email = '';
      luminateExtend.global.chapter.address = '';
  	}

    /* Deferred functions - resolve the promises here now that the document is ready */
    adarda.trpc.defers.consName.resolve();
    adarda.trpc.defers.initialLoad.resolve();
    adarda.trpc.defers.eventDate.resolve();
    adarda.trpc.defers.updateTeamInfo.resolve();
    adarda.trpc.defers.showTeamInfo.resolve();
    
    /* handle login modal close */
    $('#loginClose').on('click', function(e){
      e.preventDefault();
      $('#login-modal').modal('hide');
      document.location.href='https://act.alz.org/site/SPageServer/?pagename=ride_homepage';
    });
	
    /* handle login modal */
    $('#login-form').submit(function(e) {
      e.preventDefault();
      
      $('.login__error').html('').addClass('hidden');
      $('#login-form .has-error').removeClass('has-error');
      
      var $loginUsername = $('#login__user-name'), 
      $loginPassword = $('#login__password');
      
      if($.trim($loginUsername.val()) === '') {
        var errorMessage = 'Username is required.';
        $loginUsername.closest('.form-group').addClass('has-error');
        if($.trim($loginPassword.val()) === '') {
          errorMessage = 'Username and password are required.';
          $loginPassword.closest('.form-group').addClass('has-error');
        }
        $('.login__error').html(errorMessage).removeClass('hidden');
      }
      else if($.trim($loginPassword.val()) === '') {
        $('.login__error').html('Password is required.').removeClass('hidden');
        $loginPassword.closest('.form-group').addClass('has-error');
      }
      else {
        $('.login__submit').addClass('disabled');
        
        luminateExtend.api({
          api: 'cons', 
          form: $('#login-form'), 
          requestType: 'POST', 
          callback: {
            success: function(response) {
              if(!adarda.trpc.cons.profile.id || adarda.trpc.cons.profile.id != response.loginResponse.cons_id) {
                location.reload();
              }
              else {
                $loginPassword.val('');
                $('.login__submit').removeClass('disabled');
                
                $('#login-modal').modal('hide');
                
                showLoading();
                
                /* trigger custom event */
                $(document).trigger('login');
              }
            }, 
            error: function(response) {
              $('.login__submit').removeClass('disabled');
              
              if(response.errorResponse.code === '202') {
                $('.login__error').html('Username or password is invalid.').removeClass('hidden');
              }
              else {
                $('.login__error').html(response.errorResponse.message).removeClass('hidden');
              }
            }
          }
        });
      }
      return false;
    });
    
    /* handle header details toggle */
    $('.js--toggle-header-details').click(function(e) {
      e.preventDefault();
      
      $('.pc__header-details').slideToggle();
    });
    
    /* handle xs collapsible menu */
    $('.js--current-view').on('click', function(e) {
      e.preventDefault();
      $(this).addClass('hidden-xs');
      $('#pc-container .navbar-collapse').collapse('show');
    });
    
    /* display notifications */
    $('#pc-nav-notifications').click(function(e) {
      e.preventDefault();
    }).popover({
      placement: 'bottom', 
      container: '#pc-container', 
      html: true, 
      content: '<ul class="list-group" id="notifications-list">' + 
                 '<li class="list-group-item">' + 
                   '<strong>Activity</strong>' + 
                 '</li>' + 
                 '<li class="list-group-item">' + 
                   'Loading ...' + 
                 '</li>' + 
               '</ul>'
    }).on('shown.bs.popover', function() {
      adarda.trpc.api.teamraiser.getRecentActivity({
        callback: {
          success: function(response) {
            $('#notifications-list .list-group-item').remove();
            
            if(response.getRecentActivityResponse.activityRecord) {
				/* build the email form and contacts list if the view hasn't already been loaded */
				if(!$('#pc-email-view').is('.view-loaded') && $('.email-contacts-table .table--row input[type="checkbox"]:checked').length === 0) {
				  adarda.trpc.ui.buildEmailForm();
				  adarda.trpc.ui.buildContactFilters();
				  adarda.trpc.ui.buildContactsList();
				}
				
              $('#notifications-list').append('<li class="list-group-item">' + 
                                                '<strong>Activity</strong>' + 
                                              '</li>');
              
              var activityRecords = luminateExtend.utils.ensureArray(response.getRecentActivityResponse.activityRecord);
              $.each(activityRecords, function(recordIndex) {
                /* show the 3 most recent activity records */
                if(recordIndex < 3) {
                  $('#notifications-list').append('<li class="list-group-item">' + 
													 (this.type == 'DONATION' ? '<a class="js--notif-donor" href="#pc-email&fr_id='+adarda.trpc.frId+'" data-id="'+this.contactId+'">' : '') +
													 this.activity + 
													 (this.type == 'DONATION' ? '</a>' : '') + /* TODO: enforce maxlength of activity text */
                                                    '<span class="notification-date">' + this.date + '</span>' + 
                                                  '</li>');
                }
              });
              
              if($('#notifications-list .list-group-item').length >= 4) {
                $('#notifications-list').append('<li class="list-group-item notifications-more">' + 
                                                  '<a href="#pc-notifications" class="load-view">View More</a>' + 
                                                '</li>');
              }
            }
          }, 
          error: handleApiError
        }
      });
    });
    
    /* dismiss notifications when anything other than the popover is clicked */
    $('body').click(function(e) {
      var $target = $(e.target);
      if($('.popover').length > 0 && $('#notifications-list').length > 0 && 
         $target.closest('#pc-nav-notifications').length === 0 && 
         ($target.closest('.popover').length === 0 || $target.closest('.notifications-more').length > 0)) {
        $('#pc-nav-notifications').popover('toggle');
      }
    });

    /* handle view change links */
    /* any link with className "load-view" will load the view specified by the href attribute */
    $('body').on('click', '.load-view', function(e) {
      e.preventDefault();
      
      /* hide any modals or dialogs that are open */
      $('.modal').modal('hide');
      walk.dialogOverlayClose();
      
      var viewName = $(this).attr('href').split('#')[1], 
      messageName = $(e.target).closest('a').data('messagename');
      if(viewName === 'pc-email' && messageName) {
        $('.email-suggested-messages').data('messagename', messageName);
      }
      
      adarda.trpc.view(viewName);

      if(viewName === 'pc-dashboard'){
        $('.js__newsbar-container').show();
      } else {
        $('.js__newsbar-container').hide();
      }
      /* set tab */
      if ($(e.target).data('tab') != '' && $('.nav-tabs a[href="#'+viewName.replace('pc-','').replace('-','')+'__'+$(e.target).data('tab')+'"]').length > 0) {
        $('.nav-tabs a[href="#'+viewName.replace('pc-','').replace('-','')+'__'+$(e.target).data('tab')+'"]').click();
      }

$('.pc-navbar .navbar-collapse').collapse('hide');

      /* scroll to field if defined as data-scroll parameter on link */
      var scrollToClass = $(this).data('scroll');
      if (scrollToClass && (scrollToClass != '') && ($('.'+scrollToClass).length > 0)) {
        setTimeout(function(){
          $('html, body').scrollTop($('.'+scrollToClass).offset().top);
        }, 300);
      }
      return false;
    });
    
    /* handle cons profile collapsibles */
    /* onclick, trigger the click event for its child anchor */
    $('#cons-profile-panel-group').on('click', '.panel-heading, .panel-title', function(e) {
      if($(e.target).is('.panel-heading') || $(e.target).is('.panel-title')) {
        $(e.target).find('a').click();
      }
    });
    
    /* handle cons profile form submission */
    $('#cons-profile-form').submit(function(e) {
      e.preventDefault();
      
      showLoading();
      
      scrollToTop();
      
      $('#cons-profile-success').addClass('hidden');
      $('#cons-profile-error').html('')
                               .addClass('hidden');
      
      adarda.trpc.api.cons.update({
        form: '#cons-profile-form', 
        callback: {
          success: function(response) {
            /* TODO: update trpc.cons.profile */
            
            $('#cons-profile-success').removeClass('hidden');
            
            hideLoading();
            
            /* trigger custom event */
            $(document).trigger('cons-profile:updated');
          }, 
          error: function(response) {
            if(handleApiError(response)) {
              $('#cons-profile-error').html(response.errorResponse.message)
                                      .removeClass('hidden');
              
              hideLoading();
            }
          }
        }
      });
      return false;
    });
    
    /* handle change password form submission */
    $('#change-password-form').submit(function(e) {
      e.preventDefault();
      
      $('#change-password-error').html('')
                                 .addClass('hidden');
      
      /* TODO: check for required fields before submitting */
      adarda.trpc.api.cons.changePassword({
        form: '#change-password-form', 
        callback: {
          success: function(response) {
            $('#change-password-modal').modal('hide');
          }, 
          error: function(response) {
            if(handleApiError(response)) {
              $('#change-password-error').html(response.errorResponse.message)
                                         .removeClass('hidden');
            }
          }
        }
      });
      return false;
    });
  	
  	/* handle dashboard donate button to check for new donation more frequently */
  	$('.selfDonorNotCompleted .button').click(function(){
  		adarda.trpc.seflDonorTimer = setTimeout(function() {
  		  checkSelfDonor();
  		}, 3000);
  	});
  	
  	/* handle Next Steps when editing page */
    $('#edit-personal-photo-1-submit, #edit-personal-caption-submit, #edit-personal-page-save').click(function(){
      $('.editPageCompleted').removeClass('hidden');
      $('.page-update-step').data('pageupdated', 'true');
  		$('.editPageNotCompleted').hide();
  	});
      
  	/* handle Next Steps when sending an email */
  	$('.js--email-send').click(function(){
  		$('.emailCompleted').removeClass('hidden');
  		$('.emailNotCompleted').hide();
  	});
      
    /* handle printing contacts list */
    $('.email-contacts-print').click(function(e){
      e.preventDefault();
      /*$('<iframe>').hide().attr('name', 'printIframe').appendTo(document.body);
      window.frames['printIframe'].document.body.innerHTML = $('#email__contacts .email-contacts-table').parent().html();
      $('iframe[name="printIframe"]').contents().find('.table--no-results-row, .table--loading-row, th:first-child, td:first-child').remove();
      window.frames['printIframe'].window.print();*/
      var $tableData = $('#email__contacts .email-contacts-table').parent().clone();
      $tableData.find('.table--no-results-row, .table--loading-row, th:first-child, td:first-child').remove();
      $tableData.append('<style>table { border-collapse: collapse; } th, td { border: 1px solid #999; padding: 3px; }</style>')
      var newWindow = window.open();
      newWindow.document.body.innerHTML = $tableData.html();
      newWindow.focus();
      newWindow.print();
      return false;
    });

    /* make contacts expandeable */
    $('.collapseBtn').click(function(e){
      e.preventDefault();
      if ($(this).parent().parent().hasClass('wideview')) {
        $(this).parent().parent().removeClass('wideview');
        $(this).html('Hide Groups &lt;');
      } else {
        $(this).parent().parent().addClass('wideview');
        $(this).html('View Groups &gt;');
      }
      return false;
    });

    /* preventDefault explicitly */
    $('a[data-toggle="tab"], a[data-toggle="modal"], a[data-toggle="collapse"]').on('click', function(e) {
      e.preventDefault();
    });
	
    /* handle bootstrap tab shown event */
    $('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
      var targetTabPane = $(e.target).attr('href');
      if(targetTabPane.indexOf('#email__') != -1) {
        $('#email-compose-error').html('')
                                 .addClass('hidden');
        
        if($.inArray(targetTabPane, ['#email__drafts', '#email__sent']) > -1) {
          adarda.trpc.ui.buildEmailMessageList($(targetTabPane).data('messagetype'), targetTabPane);
        
          
        }
      }
      else if(targetTabPane.indexOf('#editpage__') != -1) {
        $('#pc-edit-page-success').addClass('hidden');
        $('#pc-edit-page-error').html('')
                                .addClass('hidden');
        
        var $personalVideo = $('.js--personal-video .edit-video__inner iframe');
        if($personalVideo.length > 0) {
          $personalVideo.attr('src', $personalVideo.attr('src'));
        }
      }
    });
     
    /* handle edit goal form */
    $('#edit-goal-form').submit(function(e) {
      e.preventDefault();
      
      $('#dashboard-edit-personal-goal-error, #dashboard-edit-team-goal-error').html('')
                                                                               .addClass('hidden');
      
      var personalGoal = moneyToCents($('#edit-goal-personal-goal').val()), 
      teamGoal = moneyToCents($('#edit-goal-team-goal').val()), 
      personalGoalUpdated = false, 
      teamGoalUpdated = false, 
      
      goalUpdated = function() {
        if(personalGoalUpdated && 
           (teamGoalUpdated || !adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].aTeamCaptain)) {
          var personalRaised = moneyToCents($('.js--personal-raised').html()), 
          personalPercent = Math.ceil((personalRaised / personalGoal) * 100);
          adarda.trpc.ui.buildPersonalThermometer(personalRaised, personalGoal, personalPercent);
          
          if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId) {
            var teamRaised = moneyToCents($('.js--team-raised').html()), 
            teamPercent = Math.ceil((teamRaised / teamGoal) * 100);
            adarda.trpc.ui.buildTeamThermometer(teamRaised, teamGoal, teamPercent);
          }
          
          $('#dashboard-edit-goal-modal').modal('hide');
          //$('body').append('<img src="https://alzpv.see3labs.com/servlet/refreshParticipant?cons_id='+adarda.trpc.cons.profile.id+'&fr_id='+adarda.trpc.frId+'&event_id=1703&r=' + new Date().getTime() + '" alt="" class="pxlTrkr" style="position:absolute; width:1px; height:1px; />');
          adarda.trpc.ui.fbUpdateFundraiser();
        }
      };
      
      if(isNaN(personalGoal)) {
        $('#dashboard-edit-personal-goal-error').html('Error: Personal Goal must be a number between 0 and 1,000,000,000.00')
                                                .removeClass('hidden');
      }
      else {
        adarda.trpc.api.teamraiser.updateRegistration({
          data: 'goal=' + personalGoal, 
          callback: {
            success: function(response) {
              personalGoalUpdated = true;
              goalUpdated();
            }, 
            error: function(response) {
              if(handleApiError(response)) {
                $('#dashboard-edit-personal-goal-error').html(response.errorResponse.message)
                                                        .removeClass('hidden');
              }
            }
          }
        });
      }
      
      if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].aTeamCaptain) {
        adarda.updateTeamInformation({
          frId: adarda.trpc.frId, 
          data: 'team_goal=' + teamGoal, 
          callback: {
            success: function(response) {
              teamGoalUpdated = true;
              goalUpdated();
            }, 
            error: function(response) {
              if(handleApiError(response)) {
                $('#dashboard-edit-team-goal-error').html(response.errorResponse.message)
                                                    .removeClass('hidden');
              }
            }
          }
        });
      }
      return false;
    });

    /* handle team name form */
    $('#edit-team-name-form').submit(function(e) {
      e.preventDefault();
      $('#dashboard-edit-team-name-error').addClass('hidden');
      
      if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].aTeamCaptain) {
        adarda.updateTeamInformation({
          frId: adarda.trpc.frId, 
          data: 'team_name=' + encodeURIComponent($('#edit-team-name-team-name').val()),
          callback: {
            success: function(response) {
              $('.team-name').html(response.updateTeamInformationResponse.teamName);
              $('#dashboard-edit-team-name-modal').modal('hide');
            }, 
            error: function(response) {
              if(handleApiError(response)) {
                $('#dashboard-edit-team-name-error').html(response.errorResponse.message)
                                                    .removeClass('hidden');
              }
            }
          }
        });
      }
      return false;
    });

  /* handle start tour action */
  $('.pg_ridepc').on('click', '.js--start-tour', function(e) {
    e.preventDefault();

    /* hide all other modals */
    $('.modal').modal('hide');

    adarda.trpc.view('pc-dashboard');
    window.scrollTo(0,0);

    if ($('.js--current-view.visible-xs').is(':visible')) {
      $('.js--current-view.visible-xs').popover('dispose');
      console.log('popoverTarget 1');
      var popoverTarget = $('.js--current-view.visible-xs');
    } else {
      console.log('popoverTarget 2');
      var popoverTarget = $('.navbar-nav .nav-dashboard');
    }

    popoverTarget.popover({
      html: true, 
      content: $('.js--tour-db-start-popover-content').html(), 
      trigger: 'manual', 
      placement: 'bottom'
    }).popover('show');
    $('#pc2EmailSection').addClass('show');
    
    // popoverTarget.parent().on('click', '.js--tour-popover-dismiss', function(e) {
      $('.js--tour-popover-dismiss').on('click', function(e) {
      e.preventDefault();
      console.log('close popover');
      popoverTarget.popover('hide');
      document.cookie = 'tourPopover=off; expires=' + new Date(new Date().getTime() + 31536000000).toUTCString() + '; path=/';
    });
  });

  /* handle tour next step buttons */
  $('.pg_ridepc').on('click','.js--tour-next-step', function(e){
    // $('.js--tour-next-step').on('click', function(e){
    e.preventDefault();
    $('.js__newsbar-container').hide();
    var thisButton = $(this);
    var nextStep = thisButton.data('nextstep');
    var nextStepTarget = thisButton.data('nextstep-target');
    var nextStepTargetEl = $('.'+nextStepTarget);
    var changeView = thisButton.data('changeview');
    var changeTab = thisButton.data('changetab');

    $('.js--popover-modal-backdrop').remove();
    thisButton.parents('.popover').prev().popover('hide');

    if (nextStepTarget && (nextStepTarget.indexOf('navbar-nav') != -1) && $('.js--current-view.visible-xs').is(':visible')) {
      console.log('first case');
      $('.js--current-view.visible-xs').popover('dispose');
      var popoverTarget = $('.js--current-view.visible-xs');
    } else {
      console.log('second case');
      $(this).closest('.popover').popover('dispose');
      var popoverTarget = nextStepTargetEl;
    }

    if (changeView && changeView != '') {
      adarda.trpc.view(changeView);
    } else if (changeTab && changeTab != '') {
      $('a[href=#'+changeTab+']').click();
    }
    if(changeView === 'pc-community'){
      $('.js--current-view').html('Community <span class="caret"></span>');
    }
    popoverTarget.popover({
      html: true, 
      content: $('.js--tour-'+nextStep+'-popover-content').html(), 
      trigger: 'manual', 
      placement: 'bottom'
    }).popover('show');

    if (($(window).height() < (popoverTarget.next().offset().top + popoverTarget.next().outerHeight())) || (popoverTarget.next().offset().top < window.pageYOffset)) {
      $.scrollTo(popoverTarget, {axis: 'y', duration: 800, easing: 'swing'});
    }
    
    $('.pg_ridepc').on('click', '.js--tour-popover-dismiss', function(e) {
      e.preventDefault();
console.log('hide subsequent popover');
      $('.js--popover-modal-backdrop').remove();
      $(this).parents('.popover').popover('hide');
      // $(this).parents('.popover').prev().popover('hide');
      document.cookie = 'tourPopover=off; expires=' + new Date(new Date().getTime() + 31536000000).toUTCString() + '; path=/';
      if(adarda.trpc.currentView === 'pc-dashboard'){
        $('.js__newsbar-container').show();
      }
    });
  });

	/* handle notification list send thank you action */
	$('.pg_ridepc').on('click', '.js--notif-donor', function(e) {
	  e.preventDefault();
	  
	  var donorId = $(this).data('id');
	  if(donorId != '') {
		  $('#email-recipients').val($('tr[data-id='+donorId+']:eq(0)').data('email'));
	  }
	  
	  adarda.trpc.view('pc-email');
    $('#pc2EmailSection').addClass('show');
	});
	
	/* handle full notification list send thank you action */
	$('#pc-notifications-view').on('click', '.js--notif-donor', function(e) {
	  e.preventDefault();
      
      var donorId = $(this).data('id');
      if(donorId != '') {
        $('#email-recipients').val($('tr[data-id='+donorId+']:eq(0)').data('email'));
      }
      
      adarda.trpc.view('pc-email');
      $('#pc2EmailSection').addClass('show'); 
	});
    


    /* handle donation list send thank you action */
    $('.donation-list').on('click', '.js--gift-email', function(e) {
      e.preventDefault();
      
      var donorEmail = $(this).data('email');
      if(donorEmail != '') {
        $('#email-recipients').val(donorEmail);
      }
      
      adarda.trpc.view('pc-email');
      $('#pc2EmailSection').addClass('show');
    });
    
    /* handle donation list acknowledge gift action */
    $('.donation-list').on('click', '.js--gift-acknowledge', function(e) {
      e.preventDefault();
      
      var $acknowledgeGiftLink = $(this), 
      $giftActionColumn = $(this).closest('td');
      
      adarda.trpc.api.teamraiser.acknowledgeGifts({
        contactId: $acknowledgeGiftLink.data('contactid'), 
        callback: {
          success: function(response) {
            $giftActionColumn.find('.js--gift-email').remove();
            $acknowledgeGiftLink.remove();
          }, 
          error: handleApiError
        }
      });
    });
    
    /* handle donation list delete gift action */
    $('.donation-list').on('click', '.js--gift-delete, .js--team-gift-delete', function(e) {
      e.preventDefault();
      
      $('#delete-gift-form input[name="team_gift"]').val($(this).is('.js--team-gift-delete') ? 'true' : 'false');
      
      $('#delete-gift-form input[name="gift_id"]').val($(this).data('giftid'));
      
      $('#delete-gift-modal').modal('show');
    });
    
    /* handle delete gift form */
    $('#delete-gift-form').submit(function(e) {
      e.preventDefault();
      
      adarda.trpc.api.teamraiser.deleteGift({
        form: '#delete-gift-form', 
        callback: {
          success: function(response) {
            $('#delete-gift-modal').modal('hide');
            
            adarda.trpc.ui.buildDashboard();
          }, 
          error: handleApiError
        }
      });
      return false;
    });
    
    /* handle donor list pagination */
    $('.js--personal-donors-pagination .js--pagination-prev, .js--team-donors-pagination .js--pagination-prev').click(function(e) {
      e.preventDefault();
      
      scrollToTop();
      
      var $targetList = $(this).closest('.view-container').find('.donation-list');
      $targetList.data('offset', Number($targetList.data('offset')) - 1);
      adarda.trpc.ui.buildDonationLists(true);
    });
    $('.js--personal-donors-pagination .js--pagination-next, .js--team-donors-pagination .js--pagination-next').click(function(e) {
      e.preventDefault();
      
      scrollToTop();

      var $targetList = $(this).closest('.view-container').find('.donation-list');
      $targetList.data('offset', Number($targetList.data('offset')) + 1);
      adarda.trpc.ui.buildDonationLists(true);
    });
    
    /* handle offline gift hide amount checkbox */
    $('#enter-gifts-display-amount').click(function() {
      if($(this).is(':checked')) {
        $('input[name="gift_display_personal_page"]').val('true');
      }
      else {
        $('input[name="gift_display_personal_page"]').val('false');
      }
    });
    
    /* handle offline gift payment type */
    $('#enter-gifts-form input[name="payment_type"]').click(function() {
      if($(this).val() === 'check') {
        $('#enter-gifts-check-number').attr('required', 'required').closest('.form-group').removeClass('hidden');
      }
      else {
        $('#enter-gifts-check-number').removeAttr('required').closest('.form-group').addClass('hidden');
      }
    });
    
    /* handle offline gift form */
    $('#enter-gifts-form').submit(function(e) {
      e.preventDefault();
      
      $('#enter-gifts-error').html('').addClass('hidden');
      $('#enter-gifts-form .has-error').removeClass('has-error');
      
      var $donorFirstName = $('#enter-gifts-first-name'), 
      $donorLastName = $('#enter-gifts-last-name'), 
      $giftAmount = $('#enter-gifts-amount'), 
      $paymentType = $('#enter-gifts-form input[name="payment_type"]:checked'), 
      $checkNumber = $('#enter-gifts-check-number'), 
      scrollToForm = function() {
        $('.dialog-overlay').animate({
          scrollTop: 0
        }, 0);
        $('.dialog-overlay').animate({
          scrollTop: $('#enter-gifts-form').offset().top - 10
        }, 0);
      };
      
      if($.trim($donorFirstName.val()) === '') {
        scrollToForm();
        
        var errorMessage = 'First name is required.';
        $donorFirstName.closest('.form-group').addClass('has-error');
        if($.trim($donorLastName.val()) === '') {
          errorMessage = 'First and last name are required.';
          $donorLastName.closest('.form-group').addClass('has-error');
        }
        $('#enter-gifts-error').html(errorMessage).removeClass('hidden');
      }
      else if($.trim($donorLastName.val()) === '') {
        scrollToForm();
        
        $('#enter-gifts-error').html('Last name is required.').removeClass('hidden');
        $donorLastName.closest('.form-group').addClass('has-error');
      }
      else if($.trim($giftAmount.val()) === '') {
        scrollToForm();
        
        $('#enter-gifts-error').html('Gift amount is required.').removeClass('hidden');
        $giftAmount.closest('.form-group').addClass('has-error');
      }
      else if($paymentType.length === 0) {
        scrollToForm();
        
        $('#enter-gifts-error').html('Please select a payment type.').removeClass('hidden');
      }
      else if($paymentType.val() === 'check' && $.trim($checkNumber.val()) === '') {
        scrollToForm();
        
        $('#enter-gifts-error').html('Please enter a check number.').removeClass('hidden');
        $checkNumber.closest('.form-group').addClass('has-error');
      }
      else {
        adarda.trpc.api.teamraiser.addGift({
          form: $('#enter-gifts-form'), 
          callback: {
            success: function(response) {
              walk.dialogOverlayClose();
              
              /* reset the form */
              $('#enter-gifts-form input[type="text"], #enter-gifts-form input[type="email"], #enter-gifts-form select').val('');
              document.getElementById('enter-gifts-display-amount').click();
              if(!$('#enter-gifts-display-amount').is(':checked')) {
                $('#enter-gifts-display-amount').click();
              }
              $('#enter-gifts-payment-cash').click();
              
              /* rebuild the dashboard */
              adarda.trpc.ui.buildDashboard();
              
              /* rebuild the contacts list */
              adarda.trpc.ui.buildContactsList();
            }, 
            error: function(response) {
              if(handleApiError(response)) {
                scrollToForm();
                
                var errorMessage = response.errorResponse.message;
                
                if(errorMessage.indexOf('gift_amount') != -1) {
                  errorMessage = 'Please enter a valid gift amount.';
                  $giftAmount.closest('.form-group').addClass('has-error');
                }
                
                $('#enter-gifts-error').html(errorMessage).removeClass('hidden');
              }
            }
          }
        });
      }
      return false;
    });
    
    /* handle gift notification toggle */
    $('.gift-notif a').click(function(e) {
      e.preventDefault();
      
      var giftNotif = $(this).data('giftnotif');
      adarda.trpc.api.teamraiser.updateRegistration({
        data: 'receive_gift_notification=' + (giftNotif === 'on' ? 'false' : 'true'), 
        callback: {
          success: function(response) {
            if(giftNotif === 'on') {
              $('.js--gift-notif-on').addClass('hidden');
              $('.js--gift-notif-off').removeClass('hidden');
              $('.gift-notif a').data('giftnotif','off');
            }
            else {
              $('.js--gift-notif-on').removeClass('hidden');
              $('.js--gift-notif-off').addClass('hidden');
              $('.gift-notif a').data('giftnotif','on');
            }
          }, 
          error: handleApiError
        }
      });
    });

    /* handle public/private personal page toggle */
    $('.js--mypage-public').change(function(e) {
      e.preventDefault();

      var publicVal = $(this).val();
      adarda.trpc.api.teamraiser.updatePersonalPagePrivacy({
        data: 'is_private=' + (publicVal === 'private' ? 'true' : 'false'),
        callback: {
          success: function(response) {
            var reg = response.updatePersonalPagePrivacyResponse;
            if (reg) {
              if (reg.privatePage === 'true') {
                $('.js--mypage-public').val('private');
                $('.js--mypage-public-msg.msg-public').addClass('hidden');
                $('.js--mypage-public-msg.msg-private').removeClass('hidden');
              } else {
                $('.js--mypage-public').val('public');
                $('.js--mypage-public-msg.msg-private').addClass('hidden');
                $('.js--mypage-public-msg.msg-public').removeClass('hidden');
              }
            }
          },
          error: handleApiError
        }
      });
    });
    
    /* handle team members list pagination */
    $('.js--team-members-pagination .js--pagination-prev').click(function(e) {
      e.preventDefault();
      
      scrollToTop();
      
      var $targetList = $(this).closest('.team-roster');
      $targetList.data('offset', Number($targetList.data('offset')) - 1);
      adarda.trpc.ui.buildTeamMembersList(true);
    });
    $('.js--team-members-pagination .js--pagination-next').click(function(e) {
      e.preventDefault();
      
      scrollToTop();
      
      var $targetList = $(this).closest('.team-roster');
      $targetList.data('offset', Number($targetList.data('offset')) + 1);
      adarda.trpc.ui.buildTeamMembersList(true);
    });
    
    /* handle selection of suggested message */
    $('.email-suggested-messages').change(function() {
      var messageId = $(this).val();
      
      $('.email-suggested-messages').not($(this)).val(messageId);
      
      $('.email-suggested-messages').removeData('messagename');
      
      if (messageId == 'drafts') {
        $('#email-recipients').val('');
        $('.email-suggested-messages').val('');
        $('#email-subject').removeData('prevvalue').val('');
        $('#email-message-body').removeData('prevvalue');
        resetEditorContent('#email-message-body');
        $('a[href="#email__drafts"]').click();
      } else if(messageId != '') {
        showLoading();
        
        $('#email-compose-draft').val('');
        $('.email__compose-saving').html('');
        
        adarda.trpc.api.teamraiser.getSuggestedMessage({
          messageId: messageId, 
          callback: {
            success: function(response) {
              var messageInfo = response.getSuggestedMessageResponse.messageInfo, 
              messageSubject = messageInfo.subject, 
              messageBody = (typeof messageInfo.messageBody === 'string' ? messageInfo.messageBody : ''), 
              messageLayout = messageInfo.layoutId, 
              
              personalGoal = $('.js--personal-goal').html(), 
              personalAmountRaised = $('.js--personal-raised').html(),
              personalAmountRaisedPrev = (($('#amountRaisedPrev').length > 0) ? $('#amountRaisedPrev').val() + '' : '[AMOUNT RAISED LAST YEAR]'),
              personalAmountToGoal = Number(personalGoal.replace('$', '').replace(/,/g, '')) - 
                                     Number(personalAmountRaised.replace('$', '').replace(/,/g, ''));
              
              if(personalAmountToGoal < 0) {
                personalAmountToGoal = '$0';
              }
              else {
                personalAmountToGoal = adarda.formatMoney(personalAmountToGoal * 100);
              }
              
              messageBody = messageBody.replace(/\[PARTICIPANT NAME\]/g, 
                                                adarda.trpc.cons.profile.name.first + ' ' + adarda.trpc.cons.profile.name.last)
                                       .replace(/\[PARTICIPANT FIRST NAME\]/g, 
                                                adarda.trpc.cons.profile.name.first)
                                       .replace(/\[PARTICIPANT ADDRESS\]/g, 
                                                adarda.trpc.cons.profile.primary_address.street1 + ' ' + 
                                                (adarda.trpc.cons.profile.primary_address.street2 || '') + '<br>' + 
                                                adarda.trpc.cons.profile.primary_address.city + ', ' + 
                                                adarda.trpc.cons.profile.primary_address.state + ' ' + 
                                                adarda.trpc.cons.profile.primary_address.zip)
                                       .replace(/\[EVENT DATE\]/g, 
                                                luminateExtend.utils.simpleDateFormat(adarda.trpc.teamraiser['tr'+adarda.trpc.frId].date, 'MM/dd/yyyy'))
                                       .replace(/\[TEAM DOLLARS RAISED\]/g, $('.js--team-raised').html())
                                       .replace(/\[PARTICIPANT AMOUNT RAISED\]/g, personalAmountRaised)
                                       .replace(/\[AMOUNT RAISED LAST YEAR\]/g, personalAmountRaisedPrev)
                                       .replace(/\[PARTICIPANT GOAL\]/g, personalGoal)
                                       .replace(/\[PARTICIPANT AMOUNT TO GOAL\]/g, personalAmountToGoal)
                                       .replace(/\[EVENT DATE FRIENDLY\]/g, 
                                                adarda.trpc.teamraiser['tr'+adarda.trpc.frId].dateFriendly)
                                       .replace(/\[EVENT TIME\]/g, adarda.trpc.teamraiser['tr'+adarda.trpc.frId].time)
                                       .replace(/\[EVENT LOCATION NAME\]/g, 
                                                adarda.trpc.teamraiser['tr'+adarda.trpc.frId].locationName)
                                       .replace(/\[PARTICIPANT PERSONAL PAGE LINK\]/g, 
                                                '<a href="' + luminateExtend.global.path.secure + 
                                                'TR?fr_id=' + adarda.trpc.frId + 
                                                '&pg=personal&px=' + adarda.trpc.cons.profile.id + '">')
                                       .replace(/\[END LINK\]/g, '</a>')
                                       .replace(/\[PERSONALIZED VIDEO URL\]/g, 
                                                luminateExtend.global.path.secure + 
                                                'TR?fr_id=' + adarda.trpc.frId + 
                                                '&pg=personal&px=' + adarda.trpc.cons.profile.id + 
                                                '&r={recipientName}&play=1')
                                       .replace(/\[TEAM NAME\]/g, adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamName)
                                       .replace(/\[TEAM PAGE LINK\]/g, 
                                                '<a href="' + luminateExtend.global.path.secure + 
                                                'TR?fr_id=' + adarda.trpc.frId + 
                                                '&pg=team&team_id=' + 
                                                adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId + '">')
                                       .replace(/\[TEAM PAGE LINK TEXT\]/g, 
                                                luminateExtend.global.path.secure + 
                                                'TR?fr_id=' + adarda.trpc.frId + 
                                                '&pg=team&team_id=' + 
                                                adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId)
                                       .replace(/\[CHAPTER PHONE\]/g, luminateExtend.global.chapter.phone)
                                       .replace(/\[CHAPTER EMAIL\]/g, 
                                                '<a href="mailto:' + luminateExtend.global.chapter.email + '">' + 
                                                  luminateExtend.global.chapter.email + 
                                                '</a>')
                                       .replace(/\[CHAPTER ADDRESS\]/g, luminateExtend.global.chapter.address);
              
              $('#email-subject').removeData('prevvalue')
                                 .val(messageSubject);
              $('#email-message-body').removeData('prevvalue');
              setEditorContent('#email-message-body', messageBody);
              
              if(messageLayout) {
                $('#email-layout-id').val(messageLayout);
              }
              
              hideLoading();
            }, 
            error: handleApiError
          }
        });
      }
    });
    
    /* auto-save draft email 5 seconds after subject or message is changed */
    $('#email-subject').focus(function() {
      if(!$(this).data('prevvalue')) {
        $(this).data('prevvalue', $(this).val() || '');
      }
      
      pollSaveDraftEmail();
    }).keydown(pollSaveDraftEmail);
    $('#email-message-wrap').on('click', '.jqte_editor', function() {
      if(!$('#email-message-body').data('prevvalue')) {
        $('#email-message-body').data('prevvalue', $('#email-message-body').val() || '');
      }
      
      pollSaveDraftEmail();
    }).on('keydown', '.jqte_editor', pollSaveDraftEmail);
    
    /* handle email stationery selection */
    $('.js--email-layouts select').change(function() {
      $('#email-layout-id').val($(this).val());
    });
    
    /* handle email compose form submission */
    $('#email-compose-form').submit(function(e) {
      e.preventDefault();
      
      var $emailError = $('#email-compose-error').html('').addClass('hidden'), 
      $emailRecipients = $('#email-recipients'), 
      $emailTemplate = $('.email-suggested-messages'), 
      $emailPreviewButton = $('.js--show-email-preview');
      
      $emailRecipients.val($.trim($emailRecipients.val().replace(/;/g, ',')
                                                        .replace(/\r?\n/g, ',')
                                                        .replace(/,,/g, ',')).replace(/(^,)|(,$)/g, ''));
      
      if($.trim($emailRecipients.val()) === '') {
        scrollToTop();
        
        $emailError.html('Please enter one or more recipients.').removeClass('hidden');
      }
      else if($.trim($('#email-subject').val()) === '') {
        scrollToTop();
        
        $emailError.html('Please enter a subject.').removeClass('hidden');
      }
      /* TODO: check if more recipients than F2F_PC2_MAX_NUM_RECIPIENTS allows */
      else {
        $emailPreviewButton.addClass('disabled');
        
        saveDraftEmail();
        
        adarda.trpc.api.teamraiser.previewMessage({
          data: 'message_body=' + encodeURIComponent(getEditorContent('#email-message-body')) + 
                ($emailTemplate.val() != '' ? ('&taf_id=' + $emailTemplate.val()) : ''), 
          form: '#email-compose-form', 
          callback: {
            success: function(response) {
              scrollToTop();
              
              $emailPreviewButton.removeClass('disabled');
              
              if(response.teamraiserErrorResponse) {
                var errorCode = response.teamraiserErrorResponse.code, 
                errorMessage = response.teamraiserErrorResponse.message;
                if(errorCode === '2647') {
                  errorMessage = 'The body content contained invalid HTML tags that were removed. Check your message again for formatting and accuracy.';
                }
                $emailError.html(errorMessage).removeClass('hidden');
                setEditorContent('#email-message-body', response.teamraiserErrorResponse.body);
                saveDraftEmail();
              }
              else {
                adarda.trpc.ui.buildEmailPreview({
                  recipients: $emailRecipients.val(), 
                  subject: response.getMessagePreviewResponse.subject, 
                  message: response.getMessagePreviewResponse.message
                });
                
                if(!$('body').is('.js--dialog-open')) {
                  walk.dialogOverlayOpen('#email-preview-dialog');
                }
              }
            }, 
            error: function(response) {
              scrollToTop();
              
              $emailPreviewButton.removeClass('disabled');
              
              if(handleApiError(response)) {
                $emailError.html(response.errorResponse.message).removeClass('hidden');
              }
            }
          }
        });
      }
      return false;
    });
    
    /* handle email preview dialog stationery selection */
    $('body').on('change', '.js--email-preview-stationery select', function(e) {
      var $target = $(e.target), 
      selectedLayout = $target.val();
      $('.js--email-preview-stationery select').val(selectedLayout).attr('disabled', 'disabled');
      $('.js--email-layouts select').val(selectedLayout).change();
      $('#email-compose-form').submit();
    });
    
    /* handle email preview dialog send button */
    $('body').on('click', '.js--email-send', function(e) {
      e.preventDefault();
      
      var $emailSendButton = $('.js--email-send').addClass('disabled');
      
      adarda.trpc.api.teamraiser.sendTafMessage({
        data: 'message_body=' + encodeURIComponent(getEditorContent('#email-message-body')), 
        form: '#email-compose-form', 
        callback: {
          success: function(response) {
            /* close preview dialog */
            walk.dialogOverlayClose();
            $emailSendButton.removeClass('disabled');
            
            /* Custom event tracking by Google Analytic */
            if (_gaq) {
              _gaq.push(['_trackEvent', 'TAF', $('.email-suggested-messages option:selected').text(), 'TAF - fr_id=' + adarda.trpc.frId + '&px=' + adarda.trpc.cons.profile.id, ($('#email-recipients').val().split(',')).length, true]);
            }
            
            /* delete the draft */
            var draftMessageId = $('#email-compose-draft').val();
            if(draftMessageId != '') {
              adarda.trpc.api.teamraiser.deleteDraft({
                messageId: draftMessageId
              });
              $('#email-compose-draft').val('');
            }
            $('.email__compose-saving').html('');
            
            /* reset the contacts list */
            $('.email-contacts-table .table--row input[type="checkbox"]:checked').prop('checked', false);
            adarda.trpc.ui.buildContactsList();
            
            /* reset email form */
            $('#pc-email-view').removeClass('view-loaded');
            $('#email-recipients').val('');
            $('.email-suggested-messages').val('');
            $('#email-subject').removeData('prevvalue').val('');
            $('#email-message-body').removeData('prevvalue');
            resetEditorContent('#email-message-body');
            
            /* show success dialog */
            walk.dialogOverlayOpen('#email-success-dialog');
          }, 
          error: function(response) {
            /* close preview dialog */
            walk.dialogOverlayClose();
            $emailSendButton.removeClass('disabled');
            
            if(handleApiError(response)) {
              $('#email-compose-error').html(response.errorResponse.message).removeClass('hidden');
            }
          }
        }
      });
    });
    
    /* handle draft and sent message subject line links */
    $('#pc-email-view').on('click', '.js--message-load', function(e) {
      e.preventDefault();
      scrollToTop();
     
      console.log('scroll to top');
      var messageType = $(this).data('messagetype'), 
      messageId = $(this).data('messageid'), 
      messageDate = $(this).data('messagedate');
      
      adarda.trpc.api.teamraiser['get' + messageType]({
        messageId: messageId, 
        callback: {
          success: function(response) {
            var messageInfo = response['get' + messageType + 'Response'].messageInfo, 
            emailRecipients = luminateExtend.utils.ensureArray(messageInfo.recipient), 
            emailSubject = (typeof messageInfo.subject === 'string' ? messageInfo.subject : ''), 
            emailMessageBody = (typeof messageInfo.messageBody === 'string' ? messageInfo.messageBody : '');
            
            if(emailRecipients) {
              var emailRecipientString = '';
              $.each(emailRecipients, function(recipientIndex) {
                var recipientFirstName = this.firstName, 
                recipientLastName = this.lastName, 
                recipientEmail = this.email;
                
                if(recipientIndex > 0) {
                  emailRecipientString += ', ';
                }
                
                if(recipientFirstName) {
                  emailRecipientString += recipientFirstName + ' ';
                  
                  if(recipientLastName) {
                    emailRecipientString += recipientLastName + ' ';
                  }
                }
                
                emailRecipientString += '<' + recipientEmail + '>';
              });
            }
            
            if(messageType === 'Draft') {
              $('#email-recipients').val(emailRecipientString);
              
              $('.email-suggested-messages').val('');
              
              $('#email-compose-draft').val(messageId);
              
              $('.email__compose-saving').html('');
              
              $('#email-subject').removeData('prevvalue')
                                 .val(emailSubject);
              $('#email-message-body').removeData('prevvalue');
              setEditorContent('#email-message-body', emailMessageBody);
              
              $('a[href="#email__compose"]').click();
              
              scrollToTop();
            }
            else {
              adarda.trpc.ui.buildEmailPreview({
                container: '.js--email-sent-preview-dialog-wrapper', 
                date: messageDate, 
                recipients: emailRecipientString, 
                subject: emailSubject, 
                message: emailMessageBody
              });
              scrollToTop();
             
              walk.dialogOverlayOpen('#email-sent-preview-dialog');
            }
          }, 
          error: handleApiError
        }
      });
    });
    
    /* handle sent message copy to new message links */
    $('body').on('click', '.js--email-copy-sent', function(e) {
      e.preventDefault();
  
      $('.email-suggested-messages').val('');
      
      $('#email-compose-draft').val('');
      
      $('.email__compose-saving').html('');
      
      $('#email-subject').removeData('prevvalue')
                         .val($('.js--email-sent-preview-dialog-wrapper .js--email-preview-subject').html());
      $('#email-message-body').removeData('prevvalue');
      setEditorContent('#email-message-body', $('.js--email-sent-preview-dialog-wrapper .email-preview-body').eq(0).html());
      
      $('a[href="#email__compose"]').click();
      
      scrollToTop();
      
      walk.dialogOverlayClose();
    });
    
    /* handle draft and sent message delete links */
    $('#pc-email-view').on('click', '.js--message-delete', function(e) {
      e.preventDefault();
      
      var messageType = $(this).data('messagetype');
      $('#delete-message-form').data('messagetype', messageType);
      $('#delete-message-form input[name="method"]').val('delete' + messageType);
      $('#delete-message-form input[name="message_id"]').val($(this).data('messageid'));
      
      $('#delete-message-modal').modal('show');
    });
    
    /* handle delete draft and sent message form */
    $('#delete-message-form').submit(function(e) {
      e.preventDefault();
      
      var messageType = $('#delete-message-form').data('messagetype'), 
      messageId = $('#delete-message-form input[name="message_id"]').val();
      
      $('.js--delete-message-type').html(messageType);
      
      adarda.trpc.api.teamraiser[$('#delete-message-form input[name="method"]').val()]({
        messageId: messageId, 
        callback: {
          success: function(response) {
            $('#delete-message-modal').modal('hide');
            
            adarda.trpc.ui.buildEmailMessageList(messageType, $('#pc-email-view .tab-pane[data-messagetype="' + messageType + '"]'));
          }, 
          error: handleApiError
        }
      });
      return false;
    });
    
    /* handle add new contact form */
    $('#email-new-contact-form').submit(function(e) {
      e.preventDefault();
      
      $('#new-contact-error').html('')
                             .addClass('hidden');
      $('#email-new-contact-form .has-error').removeClass('has-error');
      
      /* check if email is null */
      if($.trim($('#new-contact-email').val()) === '') {
        /* show the error message */
        $('#new-contact-error').html('Email address is required.')
                               .removeClass('hidden');
        
        /* highlight the field in error */
        $('#new-contact-email').closest('.form-group').addClass('has-error');
      }
      else {
        adarda.trpc.api.addressbook.addAddressBookContact({
          form: '#email-new-contact-form', 
          callback: {
            success: function(response) {
              /* reset the form */
              $('#email-new-contact-form input, #email-new-contact-form select').not('[type="hidden"]').val('');
              
              /* close the modal */
              $('#email-new-contact-modal').modal('hide');
              
              /* reset the contacts list */
              adarda.trpc.ui.buildContactsList();
            }, 
            error: function(response) {
              if(handleApiError(response)) {
                $('#new-contact-error').html(response.errorResponse.message)
                                       .removeClass('hidden');
              }
            }
          }
        });
      }
      return false;
    });
    
    /* handle import contacts button */
    $('.email-contacts-import').click(function() {
      /* reset modal */
      $('.import-contacts-step, .import-contacts-step-btn').addClass('hidden');
      $('#import-contacts-choose-type, #import-contacts-next').removeClass('hidden');
      $('#import-contacts-next').addClass('disabled');
      $('#import-contacts-choose-type input').removeAttr('checked');
      $('#import-contacts-online-events ul li').remove();
      $('.ab-import-list').html('');
      $('#import-contacts-upload-error').html('')
                                        .addClass('hidden');
    });
    
    /* handle import contacts type radio buttons */
    $('#import-contacts-choose-type input').click(function() {
      $('#import-contacts-next').removeClass('disabled');
    });
    
    /* handle import contacts overlay buttons */
    $('#import-contacts-next').click(function() {
      var $addContactsType = $('input[name="import-contacts-type"]:checked');
      if($addContactsType.length > 0) {
        var addContactsType = $addContactsType.val();
        $('.import-contacts-step, #import-contacts-next').addClass('hidden');
        if(addContactsType === 'GMAIL' || addContactsType === 'YAHOO') {
          $('#import-contacts-start-import').removeClass('hidden');
          
          window.open('../trpc/address-book-import.html?import_source=' + addContactsType, 'startimport', 'location=no,menubar=no,toolbar=no,height=400');
        }
        else if(addContactsType === 'csv') {
          $('#import-contacts-start-upload').removeClass('hidden');
          $('#import-contacts-upload-next').removeClass('hidden');
        }
      }
    });
    $('#import-contacts-online-next, #import-contacts-upload-complete').click(function() {
      var contactsToAdd;
      $($(this).data('list') + ' .ab-import-checkbox-col input:checked').each(function() {
        if(contactsToAdd) {
          contactsToAdd += '\n';
        }
        else {
          contactsToAdd = '';
        }
        contactsToAdd += $(this).closest('.ab-import-row').data('contact');
      });
      
      if(!contactsToAdd) {
        /* TODO: error message */
      }
      else {
        adarda.trpc.api.addressbook.importAddressBookContacts({
          contactsToAdd: contactsToAdd.replace(/""/g, ''), 
          callback: {
            success: function(response) {
              var potentialDuplicateContacts = luminateExtend.utils.ensureArray(response.importAddressBookContactsResponse.potentialDuplicateContact), 
              errorContacts = luminateExtend.utils.ensureArray(response.importAddressBookContactsResponse.errorContact);
              
              if(potentialDuplicateContacts.length > 0) {
                /* TODO */
              }
              
              if(errorContacts.length > 0) {
                /* TODO */
              }
              
              /* close the modal */
              $('#email-import-contacts-modal').modal('hide');
              
              /* reset the contacts list */
              adarda.trpc.ui.buildContactsList();
            }, 
            error: function(response) {
              if(handleApiError(response)) {
                /* TODO */
              }
            }
          }
        });
      }
    });
    $('#import-contacts-upload-next').click(function() {
      $('#import-contacts-upload-error').html('')
                                        .addClass('hidden');
      
      if($('#import-contacts-upload-file').val() === '') {
        $('#import-contacts-upload-error').html('Please select a file and try again.')
                                          .removeClass('hidden');
      }
      else if($('#import-contacts-upload-file').val().toLowerCase().indexOf('.csv') === -1) {
        $('#import-contacts-upload-error').html('Upload file must be in .csv format. Please try again.')
                                          .removeClass('hidden');
      }
      else {
        $('#import-contacts-upload-form').submit();
      }
    });
    
    /* handle import contacts select all checkbox */
    $('.ab-import-header-row input').click(function() {
      if($(this).is(':checked')) {
        $(this).closest('.ab-import-grid').find('.ab-import-list input').not(':checked').click();
      }
      else {
        $(this).closest('.ab-import-grid').find('.ab-import-list input:checked').click();
      }
    });
    
    /* handle contacts upload iframe */
    $('#import-contacts-upload-shim').load(function() {
      var shimContents = $(this).contents();
      if(shimContents && shimContents != '') {
        $('.import-contacts-step, .import-contacts-step-btn').addClass('hidden');
        $('#import-contacts-upload-results, #import-contacts-upload-complete').removeClass('hidden');
        
        var shimResponse = $.parseJSON(shimContents.text());
        if(shimResponse.errorResponse) {
          /* TODO */
        }
        else {
          var parseCsvContactsResponse = shimResponse.parseCsvContactsResponse, 
          proposedMapping = parseCsvContactsResponse.proposedMapping, 
          firstNameColumnIndex = Number(proposedMapping.firstNameColumnIndex), 
          lastNameColumnIndex = Number(proposedMapping.lastNameColumnIndex), 
          emailColumnIndex = Number(proposedMapping.emailColumnIndex), 
          csvDataRows = luminateExtend.utils.ensureArray(parseCsvContactsResponse.csvDataRows.csvDataRow);
          
          $.each(csvDataRows, function(contactIndex) {
            var isOddRow = !(contactIndex % 2), 
            csvValue = this.csvValue, 
            firstName = typeof csvValue[firstNameColumnIndex] === 'string' ? csvValue[firstNameColumnIndex] : '', 
            lastName = typeof csvValue[lastNameColumnIndex] === 'string' ? csvValue[lastNameColumnIndex] : '', 
            contactName = '&' + 'lt;no name&' + 'gt;', 
            contactEmail = typeof csvValue[emailColumnIndex] === 'string' ? csvValue[emailColumnIndex] : '';
            
            if(firstName != '' || lastName != '' || contactEmail != '') {
              if(firstName != '') {
                contactName = firstName;
                
                if(lastName != '') {
                  contactName += ' ' + lastName;
                }
              }
              
              $('#ab-upload-list').append('<div class="ab-import-row' + (!isOddRow ? ' ab-import-row-even' : '') + '">' + 
                                            '<div class="ab-import-checkbox-col">' + 
                                              '<input type="checkbox">' + 
                                            '</div>' + 
                                            '<div class="ab-import-name-col">' + 
                                              contactName + 
                                            '</div>' + 
                                            '<div class="ab-import-email-col">' + 
                                              contactEmail + 
                                            '</div>' + 
                                          '</div>');
              
              $('#ab-upload-list .ab-import-row').last().data('contact', '"' + firstName + '", "' + lastName + '", "' + contactEmail + '"');
            }
          });
        }
      }
    });
    
    /* handle contacts compose email button */
    $('.email-contacts-compose').click(function() {
      var $emailRecipients = $('#email-recipients'), 
      currentRecipients = $.trim($emailRecipients.val()), 
      selectedContactEmails;
      
      $('#email__contacts .email-contacts-table .table--row input[type="checkbox"]:checked').each(function() {
        var $contactRow = $(this).closest('.table--row'), 
        contactEmail = $contactRow.data('email'), 
        contactName = $contactRow.data('name') || '';
        
        if(contactEmail) {
          contactEmail = '<' + contactEmail + '>'
          
          if(contactName != '') {
            contactEmail = contactName + ' ' + contactEmail;
          }
          
          if(currentRecipients.indexOf(contactEmail) === -1) {
            if(!selectedContactEmails) {
              selectedContactEmails = '';
            }
            else {
              selectedContactEmails += ', ';
            }
            selectedContactEmails += contactEmail;
          }
        }
      });
      
      if(selectedContactEmails) {
        $emailRecipients.val(currentRecipients + (currentRecipients === '' ? '' : ', ') + selectedContactEmails);
      }
      
      $('.modal').modal('hide');
      
      $('a[href="#email__compose"]').click();
      
      scrollToTop();
    });
    
    /* handle contacts delete button */
    $('.email-contacts-delete').click(function(e) {
      e.preventDefault();
      
      var $selectedContactCheckboxes = $('#email__contacts .email-contacts-table .table--row input[type="checkbox"]:checked');

      $('.js--delete-contacts-count').html($selectedContactCheckboxes.length + ' contact' + 
                                           ($selectedContactCheckboxes.length > 1 ? 's' : ''));
      
      $('#delete-contacts-modal').modal('show');
    });
    
    /* handle delete contacts form */
    $('#delete-contacts-form').submit(function(e) {
      e.preventDefault();
      
      var selectedContactIds;
      
      $('#email__contacts .email-contacts-table .table--row input[type="checkbox"]:checked').each(function() {
        var $contactRow = $(this).closest('.table--row'), 
        contactId = $contactRow.data('id');
        
        if(!selectedContactIds) {
          selectedContactIds = '';
        }
        else {
          selectedContactIds += ',';
        }
        selectedContactIds += contactId;
      });
      
      adarda.trpc.api.teamraiser.deleteTeamraiserAddressBookContacts({
        contactIds: selectedContactIds, 
        callback: {
          success: function(response) {
            if(response.deleteTeamraiserAddressBookContactsResponse.errors === 'true') {
              /* TODO */
            }
            else {
              $('#delete-contacts-modal').modal('hide');
              
              /* reset the contacts list */
              adarda.trpc.ui.buildContactsList($('.js--email-contacts-filter').val() != 'all');
            }
          }, 
          error: handleApiError
        }
      });
      return false;
    });
    
    /* handle email contacts add to group links */
    $('.contacts__dropdown').on('click', '.js--email-contacts-group-add', function(e) {
      e.preventDefault();
      
      var groupId = $(e.target).data('groupid'), 
      selectedContactIds;
      
      $('.email-contacts-table .table--row input[type="checkbox"]:checked').each(function() {
        var $contactRow = $(this).closest('.table--row'), 
        contactId = $contactRow.data('id');
        
        if(!selectedContactIds) {
          selectedContactIds = '';
        }
        else {
          selectedContactIds += ',';
        }
        selectedContactIds += contactId;
      });
      
      adarda.trpc.api.addressbook.addContactsToGroup({
        groupId: groupId, 
        contactIds: selectedContactIds, 
        callback: {
          success: function(response) {
            /* select the group and rebuild the contact list */
            $('.email-contacts-search').val('');
            $('.js--email-contacts-filter-link[data-filter="email_rpt_group_' + groupId + '"]').click();
          }, 
          error: function(response) {
            if(handleApiError(response)) {
              /* TODO */
            }
          }
        }
      });
    });
    
    /* handle email contacts filter links */
    $('.email__contacts--filter-list').on('click', '.js--email-contacts-filter-link', function(e) {
      e.preventDefault();
      
      $('.js--email-contacts-filter-link.active').removeClass('active');
      $('.js--email-contacts-filter-link .badge').html('').addClass('hidden');
      var $filterLink = $(e.target).addClass('active');
      $('.js--email-contacts-filter').val($filterLink.data('filter'));
      
      adarda.trpc.ui.buildContactsList(true);
    });
    
    /* handle email contacts filter dropdown */
    $('.js--email-contacts-filter').change(function() {
      var $filter = $(this), 
      filterValue = $filter.val();
      
      $('.js--email-contacts-filter').not($filter).val(filterValue);
      $('.js--email-contacts-filter-link.active').removeClass('active');
      $('.js--email-contacts-filter-link[data-filter="' + filterValue + '"]').addClass('active');
      
      adarda.trpc.ui.buildContactsList(true);
    });
    
    /* handle add new group links */
    $('.js--email-contacts-add-group').click(function(e) {
      e.preventDefault();
      
      $('#email-new-contact-group-form input[name="contact_ids"]').val('');
      if($(this).is('.js--add-contacts-to-group')) {
        var selectedContactIds;
        
        $('.email-contacts-table .table--row input[type="checkbox"]:checked').each(function() {
          var $contactRow = $(this).closest('.table--row'), 
          contactId = $contactRow.data('id');
          
          if(!selectedContactIds) {
            selectedContactIds = '';
          }
          else {
            selectedContactIds += ',';
          }
          selectedContactIds += contactId;
        });
        
        $('#email-new-contact-group-form input[name="contact_ids"]').val(selectedContactIds);
      }
      
      $('#email-new-contact-group-modal').modal('show');
    });
    
    /* give group name focus when new group modal is shown */
    $('#email-new-contact-group-modal').on('shown.bs.modal', function() {
      $('#email-new-contact-group-name').focus();
    });

    $(document).on('show.bs.modal', '.modal', function(event) {
      $(this).appendTo($('body'));
    });
    
    /* handle new contact group form */
    $('#email-new-contact-group-form').submit(function(e) {
      e.preventDefault();
      
      adarda.trpc.api.addressbook.addAddressBookGroup({
        form: '#email-new-contact-group-form', 
        callback: {
          success: function(response) {
            var groupId = response.addAddressBookGroupResponse.addressBookGroup.id;
            
            /* select the group and rebuild the contact list */
            $('.email-contacts-search').val('');
            adarda.trpc.ui.buildContactFilters('email_rpt_group_' + groupId);
            
            /* reset the form */
            $('#email-new-contact-group-form input[name="contact_ids"], #email-new-contact-group-name').val('');
            
            /* close the modal */
            $('#email-new-contact-group-modal').modal('hide');
          }, 
          error: function(response) {
            if(handleApiError(response)) {
              /* TODO */
            }
          }
        }
      });
      return false;
    });
    
    /* handle email contacts search form */
    $('.email-contacts-search-form').submit(function(e) {
      e.preventDefault();
      
      var $search = $(this).find('.email-contacts-search');
      $('.email-contacts-search').not($search).val($search.val());
      
      adarda.trpc.ui.buildContactsList(true);
      return false;
    });
    
    /* handle email contacts select all checkbox */
    $('.js--contacts-select-all').click(function() {
      var $contactCheckboxes = $('.email-contacts-table .table--row input[type="checkbox"]'), 
      $contactActions = $('#email__contacts .email-contacts-compose, .email-contacts-delete, .email-contacts-group'), 
      $contactModalActions = $('#email-contacts-modal .email-contacts-compose');
      
      if($(this).is(':checked')) {
        $contactCheckboxes.not(':checked').prop('checked', true);
      }
      else {
        $contactCheckboxes.filter(':checked').prop('checked', false);
      }
      
      if($contactCheckboxes.filter(':checked').length > 0) {
        $contactActions.removeClass('hidden');
        $contactModalActions.removeClass('disabled');
      }
      else {
        $contactActions.addClass('hidden');
        $contactModalActions.addClass('disabled');
      }
      
      $('.js--contacts-select-all').prop('checked', $(this).is(':checked'));
      
      pollSaveSelectedContacts();
    });
    
    /* handle email contact row checkboxes */
    $('.email-contacts-table').on('click', '.table--row input[type="checkbox"]', function() {
      var $contactRow = $(this).closest('.table--row'), 
      contactId = $contactRow.data('id'), 
      $contactActions = $('#email__contacts .email-contacts-compose, .email-contacts-delete, .email-contacts-group'), 
      $contactModalActions = $('#email-contacts-modal .email-contacts-compose');
      
      if($('.email-contacts-table .table--row input[type="checkbox"]:checked').length > 0) {
        $contactActions.removeClass('hidden');
        $contactModalActions.removeClass('disabled');
      }
      else {
        $contactActions.addClass('hidden');
        $contactModalActions.addClass('disabled');
      }
      
      $('.email-contacts-table .table--row[data-id="' + contactId + '"] input[type="checkbox"]').prop('checked', $(this).is(':checked'));
      
      pollSaveSelectedContacts();
    });
    
    /* handle edit contact links */
    $('.email-contacts-table').on('click', '.js--edit-contact', function(e) {
      e.preventDefault();
      
      var $contactRow = $(this).closest('.table--row'), 
      contactId = $contactRow.data('id');
      
      $('#edit-contact-form input[name="contact_id"]').val(contactId);
      $('#edit-contact-first-name, #edit-contact-last-name, #edit-contact-email').val('');
      
      adarda.trpc.api.teamraiser.getTeamraiserAddressBookContact({
        contactId: contactId, 
        callback: {
          success: function(response) {
            var addressBookContact = response.getTeamraiserAddressBookContactResponse.addressBookContact, 
            contactFirstName = typeof addressBookContact.firstName === 'string' ? addressBookContact.firstName : '', 
            contactLastName = typeof addressBookContact.lastName === 'string' ? addressBookContact.lastName : '', 
            contactEmail = typeof addressBookContact.email === 'string' ? addressBookContact.email : '';
            
            $('#edit-contact-first-name').val(contactFirstName);
            $('#edit-contact-last-name').val(contactLastName);
            $('#edit-contact-email').val(contactEmail);
          }, 
          error: handleApiError
        }
      });
      
      $('#email-edit-contact-modal').modal('show');
    });
    
    /* handle edit contact form */
    $('#edit-contact-form').submit(function(e) {
      e.preventDefault();
      
      $('#edit-contact-error').html('')
                              .addClass('hidden');
      $('#edit-contact-form .has-error').removeClass('has-error');
      
      if($.trim($('#edit-contact-email').val()) === '') {
        /* show the error message */
        $('#edit-contact-error').html('Email address is required.')
                                .removeClass('hidden');
        
        /* highlight the field in error */
        $('#edit-contact-email').closest('.form-group').addClass('has-error');
      }
      else {
        adarda.trpc.api.teamraiser.updateTeamraiserAddressBookContact({
          form: '#edit-contact-form', 
          callback: {
            success: function(response) {
              $('#email-edit-contact-modal').modal('hide');
              
              adarda.trpc.ui.buildContactsList();
            }, 
            error: function(response) {
              if(handleApiError(response)) {
                $('#edit-contact-error').html(response.errorResponse.message)
                                        .removeClass('hidden');
              }
            }
          }
        });
      }
      return false;
    });

    /* handle email sent pagination */
    $('.js--email-sent-pagination .js--pagination-prev').click(function(e) {
      e.preventDefault();
      
      var $targetList = $(this).closest('.row').prev('.email-list-results');
      $targetList.data('offset', Number($targetList.data('offset')) - 1);
      adarda.trpc.ui.buildEmailMessageList('SentMessage', $('#pc-email-view .tab-pane[data-messagetype="SentMessage"]'));
    });
    $('.js--email-sent-pagination .js--pagination-next').click(function(e) {
      e.preventDefault();
      
      var $targetList = $(this).closest('.row').prev('.email-list-results');
      $targetList.data('offset', Number($targetList.data('offset')) + 1);
      adarda.trpc.ui.buildEmailMessageList('SentMessage', $('#pc-email-view .tab-pane[data-messagetype="SentMessage"]'));
    });
    /* handle email draft pagination */
    $('.js--email-draft-pagination .js--pagination-prev').click(function(e) {
      e.preventDefault();
      
      var $targetList = $(this).closest('.row').prev('.email-list-results');
      $targetList.data('offset', Number($targetList.data('offset')) - 1);
      adarda.trpc.ui.buildEmailMessageList('Draft', $('#pc-email-view .tab-pane[data-messagetype="Draft"]'));
    });
    $('.js--email-draft-pagination .js--pagination-next').click(function(e) {
      e.preventDefault();
      
      var $targetList = $(this).closest('.row').prev('.email-list-results');
      $targetList.data('offset', Number($targetList.data('offset')) + 1);
      adarda.trpc.ui.buildEmailMessageList('Draft', $('#pc-email-view .tab-pane[data-messagetype="Draft"]'));
    });

    /* add clipboard functionality for email */
    var client1 = new ClipboardJS('#pc-email-view .js__copy-text');
    client1.on('success', function(readyEvent) {
        $('#copied-modal').modal('show');
        setTimeout(function(){$('#copied-modal').modal('hide');}, 5000)
    });
    // var client = new ZeroClipboard($('#pc-email-view .copyText'));
    // client.on('ready', function(readyEvent) {
    //   client.on('copy', function(event) {
    //     event.clipboardData.setData("text/plain", $(event.target).parent().find('.tab-window').text());
    //     $('#copied-modal').modal('show');
    //     setTimeout(function(){$('#copied-modal').modal('hide');}, 5000)
    //   });
    // });

    /* add clipboard functionality for social share */

    // var client2 = new ClipboardJS('.sampleScroller .js__copy-text');
    // client2.on('success', function(readyEvent) {
    //     $('#copied-social-modal').modal('show');
    //     setTimeout(function(){$('#copied-social-modal').modal('hide');}, 5000)
    // });

    // var client2 = new ZeroClipboard($('.sampleScroller .copyText'));
    // client2.on('ready', function(readyEvent) {
    //   client2.on('copy', function(event) {
    //     event.clipboardData.setData("text/plain", $(event.target).parent().find('li.active').text());
    //     $('#copied-social-modal').modal('show');
    //     setTimeout(function(){$('#copied-social-modal').modal('hide');}, 5000)
    //   });
    // });


    

    /* add clipboard functionality for page URL */
    var client3 = new ClipboardJS('#pc-edit-page-view .js__copy-text');
    client3.on('success', function(readyEvent) {
        $('#copied-link-modal').modal('show');
        setTimeout(function(){$('#copied-link-modal').modal('hide');}, 5000)
    });

    // var client3 = new ZeroClipboard($('#pc-edit-page-view .copyText'));
    // client3.on('ready', function(readyEvent) {
    //   console.log('zeroClipboard clicked');
    //   client3.on('copy', function(event) {
    //   console.log('zeroClipboard copied');
    //     event.clipboardData.setData("text/plain", $(event.target).parent().find('p:eq(0)').text());
    //     //$('#copied-social-modal').modal('show');
    //     setTimeout(function(){$('#copied-social-modal').modal('hide');}, 5000)
    //   });
    // });

    /* box rollovers and links */
    $('.rollover').click(function(e) {
      e.preventDefault();
      if (!$(this).hasClass('load-view') && !$(this).hasClass('cashAndChecksLink') && !$(this).hasClass('identifyCommitteeMember') && $(this).find('a[data-toggle="modal"]').length == 0) {
        if ($(this).data('href') != '' && $(this).data('href') != undefined) {
          if ($(this).data('href-target') == '_blank') {
            window.open($(this).data('href'), '_blank');
          } else {
            document.location.href = $(this).data(href);
          }
        } else {
          if ($(this).find('a').attr('target') == '_blank') {
            window.open($(this).find('a').attr('href'), '_blank');
          } else {
            document.location.href = $(this).find('a').attr('href');
          }
        }
      } else if ($(this).find('a[data-toggle="modal"]').length == 1) {
        $(this).find('a[data-toggle="modal"]').click();
      }
      return false;
    }).mouseenter(function(e) {
        $(this).append($('<div class="ctd"><span>'+($(this).is('[data-overlay-text]') ? $(this).attr('data-overlay-text') : 'Click to Download' )+'</span></div>'));
    }).mouseleave(function(e){
        $('.ctd').remove();
    });

    /* Back to Top links */
    $('.btt a').click(function(e){
      e.preventDefault();
      scrollToTop();
    });
    
    /* handle edit personal URL form submission */
    $('#edit-page-url-form').submit(function(e) {
      e.preventDefault();
      
      $('#edit-page-url-error').html('')
                               .addClass('hidden');
      
      adarda.trpc.api.teamraiser.updateShortcut({
        form: '#edit-page-url-form', 
        callback: {
          success: function(response) {
            var shortcutItem = response.updateShortcutResponse.shortcutItem, 
            shortcutUrl = shortcutItem.url;
            
            if(typeof shortcutUrl === 'string') {
              $('#edit-page-url').html(shortcutUrl);
              $('.viewPagePersonal').attr('href',shortcutUrl);
            }
            else {
              $('#edit-page-url').html(luminateExtend.global.path.secure + 
                                       'TR?fr_id=' + adarda.trpc.frId + 
                                       '&pg=personal&px=' + adarda.trpc.cons.profile.id);
              $('.viewPagePersonal').attr('href',luminateExtend.global.path.secure + 
                                       'TR?fr_id=' + adarda.trpc.frId + 
                                       '&pg=personal&px=' + adarda.trpc.cons.profile.id);
            }
            
            $('#edit-page-url-modal').modal('hide');
          }, 
          error: function(response) {
            if(handleApiError(response)) {
              $('#edit-page-url-error').html(response.errorResponse.message)
                                       .removeClass('hidden');
            }
          }
        }
      });
      return false;
    });
    
    /* auto-save personal/team/company page to local storage 15 seconds after headline or body content is changed */
    $('#edit-personal-page-title').focus(function() {
      if(!$(this).data('prevvalue')) {
        $(this).data('prevvalue', $(this).val() || '');
      }
      
      pollSavePageContent();
    }).keydown(pollSavePageContent);
    $('#edit-personal-page-form, #edit-team-page-form, #edit-company-page-form').on('click', '.jqte_editor', function(e) {
      var $editorSource = $(e.target).closest('.jqte').find('.jqte_source textarea');
      
      if(!$editorSource.data('prevvalue')) {
        $editorSource.data('prevvalue', $editorSource.val() || '');
      }
      
      pollSavePageContent();
    }).on('keydown', '.jqte_editor', pollSavePageContent);
    
    /* handle personal media type dropdown */
    $('#edit-personal-media-type').change(function() {
      $('.js--personal-photo-1, .js--personal-photo-2, .js--personal-video').addClass('hidden');
      
      var mediaType = $(this).val(), 
      $personalVideo = $('.js--personal-video .edit-video__inner iframe');
      
      if(mediaType != 'video' && $personalVideo && $personalVideo.attr('src')) {
        $personalVideo.attr('src', $personalVideo.attr('src'));
      }

      adarda.trpc.api.teamraiser.updatePersonalMediaLayout();
      
      $('.js--personal-' + mediaType).removeClass('hidden');
    });
    
    /* handle edit personal photo form */
    $('.js--edit-photo-form').submit(function(e) {
      if ($(this).find('input[type="file"]').length > 0 && $(this).find('input[type="file"]').val() != '') {
        var $photoForm = $(this), 
        $photoFile = $photoForm.find('input[type="file"]'), 
        photoFile = $photoFile.val(), 
        photoFileSplit = photoFile.split('.'), 
        $photoFormError = $photoForm.find('.js--edit-photo-error').html('').addClass('hidden'), 
        $photoFormSubmit = $photoForm.find('.js--edit-photo-submit').addClass('disabled');
        
        if(photoFile && photoFile != '' && 
           (photoFileSplit.length === 1 || 
            $.inArray(photoFileSplit[photoFileSplit.length - 1].toLowerCase(), ['jpg', 'jpeg']) < 0)) {
          e.preventDefault();
          
          $photoFormError.html('Photo must be in .jpg format. Please select another photo and try again.').removeClass('hidden');
          $photoFormSubmit.removeClass('disabled');
          return false;
        }
      }
    });

    var peContainer = document.getElementById('photoEditor')
    photoEditor = new PhotoEditorSDK.UI.ReactUI({
      container: peContainer,
      assets: {
        baseUrl: '/js/pesdk/assets'
      },
      editor: {
        maxMegaPixels: {
          desktop: 4,
          mobile: 4
        },
        controlsOptions: {
          crop: {
            ratios: [
              {
                name: 'custom',
                ratio: '*',
                selected: true
              },
              {
                name: 'facebook',
                ratio: 1004 / 520
              },
              {
                name: '3-4',
                ratio: 3 / 4
              }
            ],
            replaceRatios: true
          },
          sticker: {
            categories: [
              {
                'name': 'alz',
                'label': 'Alzheimer\'s',
                'stickers': [
                  {
                    'name': 'balloons',
                    'label': 'Balloons',
                    'images': {
                      'mediaThumb': {
                        'uri': 'stickers/thumb/balloons.png',
                        'width': 100,
                        'height': 100
                      },
                      'mediaBase': {
                        'uri': 'stickers/base/balloons.png',
                        'width': 139,
                        'height': 250
                      }
                    }
                  },
                  {
                    'name': 'bowtie',
                    'label': 'Bow Tie',
                    'images': {
                      'mediaThumb': {
                        'uri': 'stickers/thumb/bowtie.png',
                        'width': 100,
                        'height': 100
                      },
                      'mediaBase': {
                        'uri': 'stickers/base/bowtie.png',
                        'width': 164,
                        'height': 107
                      }
                    }
                  },
                  {
                    'name': 'sunglasses',
                    'label': 'Sunglasses',
                    'images': {
                      'mediaThumb': {
                        'uri': 'stickers/thumb/glasses-sun-purple.png',
                        'width': 100,
                        'height': 100
                      },
                      'mediaBase': {
                        'uri': 'stickers/base/glasses-sun-purple.png',
                        'width': 250,
                        'height': 113
                      }
                    }
                  },
                  {
                    'name': 'i-ride-to-end-alz-frame',
                    'label': 'Frame - Ride to End ALZ',
                    'images': {
                      'mediaThumb': {
                        'uri': 'stickers/thumb/i-ride-to-end-alz-frame-thumb.png',
                        'width': 100,
                        'height': 100
                      },
                      'mediaBase': {
                        'uri': 'stickers/base/i-ride-to-end-alz-frame.png',
                        'width': 500,
                        'height': 76
                      }
                    }
                  },
                  {
                    'name': 'ride-logo-white',
                    'label': 'Ride to End ALZ Logo - White',
                    'images': {
                      'mediaThumb': {
                        'uri': 'stickers/thumb/ride-logo-white-thumb.png',
                        'width': 100,
                        'height': 100
                      },
                      'mediaBase': {
                        'uri': 'stickers/base/ride-logo-white.png',
                        'width': 341,
                        'height': 206
                      }
                    }
                  },
                  {
                    'name': 'ride-logo-purple',
                    'label': 'Ride to End ALZ Logo - Purple',
                    'images': {
                      'mediaThumb': {
                        'uri': 'stickers/thumb/ride-logo-purple-thumb.png',
                        'width': 100,
                        'height': 100
                      },
                      'mediaBase': {
                        'uri': 'stickers/base/ride-logo-purple.png',
                        'width': 341,
                        'height': 206
                      }
                    }
                  }
                ]
              }
            ],
            'replaceCategories': true
          }
        },
        export: {
          download: false,
          format: 'image/jpeg',
          type: PhotoEditorSDK.RenderType.DATAURL,
          quality: 1
        }
      }
    });
    photoEditor._language.editor.export = 'Add to Page';
    photoEditor._languages.en.controls.crop['3-4'] = '3-4';
    photoEditor._languages.en.controls.crop['facebook'] = 'Facebook';
    photoEditor._languages.en.controls.sticker.categories['alz'] = 'Alzheimer\'s';
    photoEditor.on('export', function(dataURL) {
      function dataURItoBlob(dataURI) {
          var binary = atob(dataURI.split(',')[1]);
          var array = [];
          for(var i = 0; i < binary.length; i++) {
              array.push(binary.charCodeAt(i));
          }
          return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
      }
      
      var blob = dataURItoBlob(dataURL);
      var fd, fdName;
      if ($('#pc-edit-page-view ul.nav li.active a').html().indexOf('Team') != -1) {
        fdName = 'edit-team-photo-form';
      } else {
        fdName = 'edit-personal-photo-1-form';
      }
      var $thisForm = $('#'+fdName);
      var $inputs = $('input[type="file"]:not([disabled])', $thisForm);
      $inputs.each(function(_, input) {
        if (input.files.length > 0) return;
        $(input).prop('disabled', true);
      });
      fd = new FormData(document.getElementById(fdName));
      fd.append("graphic_upload_file", blob, 'newImage.jpg');
      $inputs.prop('disabled', false);


      var xhr = new XMLHttpRequest();
      xhr.open('POST', 'CRTeamraiserAPI', true);
      xhr.onload = function () {
        $('#photo-editor-modal').modal('hide');
        adarda.trpc.ui.refreshPersonalPhoto(true);
        adarda.trpc.ui.refreshTeamPhoto(true);
      };
      xhr.send(fd);
      $('.editPageCompleted').removeClass('hidden');
      $('.editPageNotCompleted').hide();
    });

    $('a[href="#photo-editor-modal"]').click(function(){
      if (($(this).data('phototype') == 'team') && ($('.js--team-photo-1 img').length > 0) && ($('.js--team-photo-1 img').attr('src').indexOf('1080908456.custom.jpg') == -1)) {
        setTimeout(function(){photoEditor.setImage($('.js--team-photo-1 img').get(0), false)}, 500);
      } else if (($(this).data('phototype') == 'personal') && ($('.js--personal-photo-1 img').length > 0) && ($('.js--personal-photo-1 img').attr('src').indexOf('641140856.custom.jpg') == -1)) {
        setTimeout(function(){photoEditor.setImage($('.js--personal-photo-1 img').get(0), false)}, 500);
      }
    });

    $('#save-photo-submit').click(function(e){
      e.preventDefault();
      photoEditor.export();
      return false;
    });
    
    /* handle edit personal video form */
    $('#edit-personal-video-form').submit(function(e) {
      e.preventDefault();
      
      $('#edit-personal-video-error').html('')
                                     .addClass('hidden');
      
      adarda.trpc.api.teamraiser.updatePersonalVideoUrl({
        form: '#edit-personal-video-form', 
        callback: {
          success: function(response) {
            adarda.trpc.ui.refreshPersonalVideo();
            adarda.trpc.api.teamraiser.updatePersonalMediaLayout();
          }, 
          error: function(response) {
            if(handleApiError(response)) {
              $('#edit-personal-video-error').html(response.errorResponse.message)
                                             .removeClass('hidden');
            }
          }
        }
      });
      return false;
    });

    /* Request new generation of personal video */
    $('.updatePersonalVideo').click(function(e){
      e.preventDefault();
      //$('body').append('<img src="https://alzpv.see3labs.com/servlet/refreshParticipant?cons_id='+adarda.trpc.cons.profile.id+'&fr_id='+adarda.trpc.frId+'&event_id=1703&r=' + new Date().getTime() + '" alt="" class="pxlTrkr" style="position:absolute; width:1px; height:1px" />');
        $('#update-video-modal').modal('show');
        setTimeout(function(){$('#update-video-modal').modal('hide');}, 10000);
      return false;
    });
	
	/* handle clicking Manage Contacts from recipients modal */
	$('#manageContactsFromModal').click(function(e){
		$('#pc-email-view a[href="#email__contacts"]').click();
	});
    
    /* handle edit personal page preview */
    $('#edit-personal-page-preview').click(function() {
      window.open('../trpc/edit-page-preview.html?page_type=personal&fr_id=' + adarda.trpc.frId, 
                  'previewpage', 
                  'location=no,menubar=no,toolbar=no,scrollbars=yes,resizable=yes,' + 
                  'width=' + ($(window).width() - 100) + ',height=' + ($(window).height() - 100));
      
      $('#pc-edit-page-success').addClass('hidden');
      $('#pc-edit-page-error').html('')
                              .addClass('hidden');
    });
    
    /* handle edit personal page form submission */
    $('#edit-personal-page-form').submit(function(e) {
      e.preventDefault();
      showLoading();
      $('#pc-edit-page-success').addClass('hidden');
      $('#pc-edit-page-error').html('')
                              .addClass('hidden');
      
      adarda.trpc.api.teamraiser.updatePersonalPageInfo({
        data: 'rich_text=' + encodeURIComponent(getEditorContent('#edit-personal-page-body')), 
        form: '#edit-personal-page-form', 
        callback: {
          success: function(response) {
            console.log('success updating personal page');
            // hideLoading();
            $('.js__pc-loading-modal').modal('hide');
            $('.modal-backdrop').not('.js--popover-modal-backdrop').remove();
            scrollToTop();
            if(response.teamraiserErrorResponse) {
              var errorCode = response.teamraiserErrorResponse.code, 
              errorMessage = response.teamraiserErrorResponse.message;
              if(errorCode === '2647') {
                errorMessage = 'The body content contained invalid HTML tags that were removed. Check your message again for formatting and accuracy.';
              }
              adarda.trpc.ui.updatePageError(errorMessage);
              setEditorContent('#edit-personal-page-body', response.teamraiserErrorResponse.body);
            }
            else {
              // hideLoading();
              $('.js__pc-loading-modal').modal('hide');
              $('.modal-backdrop').not('.js--popover-modal-backdrop').remove();
              $('#pc-edit-page-success').removeClass('hidden');
            }
            
          }, 
          error: function(response) {
            // hideLoading();
            $('.js__pc-loading-modal').modal('hide');
            $('.modal-backdrop').not('.js--popover-modal-backdrop').remove();
            if(handleApiError(response)) {
              adarda.trpc.ui.updatePageError(response.errorResponse.message);
            }
          }
        }
      });
      return false;
    });
    
    /* handle edit team URL form submission */
    $('#edit-team-page-url-form').submit(function(e) {
      e.preventDefault();
      
      $('#edit-team-page-url-error').html('')
                                    .addClass('hidden');
      
      adarda.trpc.api.teamraiser.updateTeamShortcut({
        form: '#edit-team-page-url-form', 
        callback: {
          success: function(response) {
            var shortcutItem = response.updateTeamShortcutResponse.shortcutItem, 
            shortcutUrl = shortcutItem.url;
            
            if(typeof shortcutUrl === 'string') {
              $('#edit-team-page-url').html(shortcutUrl);
              $('.viewPageTeam').attr('href',shortcutUrl);
            }
            else {
              $('#edit-team-page-url').html(luminateExtend.global.path.secure + 
                                            'TR?fr_id=' + adarda.trpc.frId + 
                                            '&pg=team&team_id=' + 
                                            adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId);
              $('.viewPageTeam').attr('href',luminateExtend.global.path.secure + 
                                            'TR?fr_id=' + adarda.trpc.frId + 
                                            '&pg=team&team_id=' + 
                                            adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId);
            }
            
            $('#edit-team-page-url-modal').modal('hide');
          }, 
          error: function(response) {
            if(handleApiError(response)) {
              $('#edit-team-page-url-error').html(response.errorResponse.message)
                                            .removeClass('hidden');
            }
          }
        }
      });
      return false;
    });
	
    
    /* handle edit team page preview */
    $('#edit-team-page-preview').click(function() {
      window.open('../trpc/edit-page-preview.html?page_type=team&fr_id=' + adarda.trpc.frId + 
                  '&team_id=' + adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].teamId, 
                  'previewpage', 
                  'location=no,menubar=no,toolbar=no,scrollbars=yes,resizable=yes,' + 
                  'width=' + ($(window).width() - 100) + ',height=' + ($(window).height() - 100));
      
      $('#pc-edit-page-success').addClass('hidden');
      $('#pc-edit-page-error').html('')
                              .addClass('hidden');
    });
    
    /* handle edit team page form submission */
    $('#edit-team-page-form').submit(function(e) {
      e.preventDefault();
      
      showLoading();
      
      $('#pc-edit-page-success').addClass('hidden');
      $('#pc-edit-page-error').html('')
                              .addClass('hidden');
      
      adarda.trpc.api.teamraiser.updateTeamPageInfo({
        data: 'rich_text=' + encodeURIComponent(getEditorContent('#edit-team-page-body')), 
        form: '#edit-team-page-form', 
        callback: {
          success: function(response) {
            hideLoading();
            scrollToTop();
            if(response.teamraiserErrorResponse) {
              var errorCode = response.teamraiserErrorResponse.code, 
              errorMessage = response.teamraiserErrorResponse.message;
              if(errorCode === '2647') {
                errorMessage = 'The body content contained invalid HTML tags that were removed. Check your message again for formatting and accuracy.';
              }
              adarda.trpc.ui.updatePageError(errorMessage);
              setEditorContent('#edit-team-page-body', response.teamraiserErrorResponse.body);
            }
            else {
              $('#pc-edit-page-success').removeClass('hidden');
            }
          }, 
          error: function(response) {
            hideLoading();
            if(handleApiError(response)) {
              adarda.trpc.ui.updatePageError(response.errorResponse.message);
            }
          }
        }
      });
      return false;
    });

    /* handle save team captains button */
    $('.set-team-member-captain').click(function(e) {
      e.preventDefault();
      
      var selectedParticipantIds;
      
      $('#pc-team-roster-view .team-roster .table--row input[type="checkbox"]:checked').each(function() {
        var $contactRow = $(this).closest('.table--row'), 
        contactId = $contactRow.data('id');
        
        if(!selectedParticipantIds) {
          selectedParticipantIds = '';
        }
        else {
          selectedParticipantIds += ',';
        }
        selectedParticipantIds += contactId;
      });
      
      if (selectedParticipantIds != null) {
        adarda.trpc.api.teamraiser.setTeamCaptains({
          captains: selectedParticipantIds, 
          callback: {
            success: function(response) {
              if(response.getTeamMembersResponse.errors === 'true') {
                /* TODO */
              }
              else {
                /* reset the team member list */
                adarda.trpc.ui.buildTeamMembersList(true);
                $('.setCaptainsMsg').fadeIn(300).delay(5000).fadeOut(1000);
              }
            }, 
            error: handleApiError
          }
        });
      } else {
        $('#pc-team-roster-view .team-roster .table--row input[type="checkbox"]:eq(0)').popover({
          html: true, 
          content: $('.js--captain-popover-content').html(), 
          trigger: 'manual', 
          placement: 'top'
        }).popover('show');
        
        $('.team-roster').on('click', '.js--captain-popover-dismiss', function(e) {
          e.preventDefault();
          $('#pc-team-roster-view .team-roster .table--row input[type="checkbox"]:eq(0)').popover('hide');
        });
      }
    });

    var checkEJQuestions = function() {
      /* Validate EJ questions */
      var ejtype = $('#edit-ej-type').val();
      var faboatype = $('#edit-ej-faboa').val();
      var regionnumber = $('#edit-ej-region').val();
      var branchnumber = $('#edit-ej-branch').val();
      var ejfanumber = $('#edit-ej-fanum').val();
      var ejjpnumber = $('#edit-ej-jpnum').val();
      var ejlocation = $('#edit-ej-homeoffice').val();
      var ejdivision = $('#edit-ej-division').val();

      if (ejtype == '') { return false; }
      if ((ejtype == 'faboa') && ((faboatype == '') || (regionnumber == '') || (branchnumber == '') || (ejfanumber == '') || (regionnumber.length != 3) || (branchnumber.length != 5) || (ejfanumber.length != 6))) {
        $('#edit-team-company-error').html('You must answer the additional Edward Jones questions to select this company.').removeClass('hidden');
        return false;
      }
      if (ejtype == 'faboa') {
        $('#edit-team-company-error').html('').addClass('hidden');
        return true;
      }
      if ((ejtype == 'hba') && ((ejjpnumber == '') || (ejlocation == '') || (ejdivision == '') || ((ejjpnumber.length != 7) && (ejjpnumber.length != 6)) || (ejjpnumber[0] != 'J' && ejjpnumber[0] != 'P' && ejjpnumber[0] != 'p' && ejjpnumber[0] != 'j'))) {
        $('#edit-team-company-error').html('You must answer the additional Edward Jones questions to select this company.').removeClass('hidden');
        return false;
      }
      if (ejtype == 'hba') {
        $('#edit-team-company-error').html('').addClass('hidden');
        return true;
      }
    };

    /* team company/organization affiliation */
    $('#edit-team-company-form').submit(function(e){
      e.preventDefault();
      if(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId] && adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].aTeamCaptain) {
        var companyId = ($('#edit-team-company-select').length > 0 ? $('#edit-team-company-select').val() : 'None');
        var companyName = $('#edit-team-company-select option:selected').text() + '';
        if (companyName == 'Edward Jones' && checkEJQuestions()) {
          /* update survey */
          var ejtype = $('#edit-ej-type').val();
          var faboatype = $('#edit-ej-faboa').val();
          var regionnumber = $('#edit-ej-region').val();
          var branchnumber = $('#edit-ej-branch').val();
          var ejfanumber = $('#edit-ej-fanum').val();
          var ejjpnumber = $('#edit-ej-jpnum').val();
          var ejlocation = $('#edit-ej-homeoffice').val();
          var ejdivision = $('#edit-ej-division').val();
          var ejtshirt = '';
          var ejvolunteer = '';
          var surveyQuestions = '';
          $(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].surveyResponses).each(function(){
            /* fa/boa survey question id = 106548
               hba/home survey question id = 106549 */
            if(this.questionId != '106548' && this.questionId != '106549') {
              var responseValue = this.responseValue;
              if(typeof responseValue != 'string' || responseValue === 'User Provided No Response') {
                responseValue = '';
              }
              if (surveyQuestions.indexOf('question_' + this.questionId) == -1) {
                surveyQuestions += 'question_' + this.questionId + '=' + responseValue + '&';
              }
            }
            if (this.questionText.indexOf('T-shirt size') != -1) {
              ejtshirt = this.responseValue;
            }
            if (this.questionText.indexOf('Planning Committee') != -1) {
              ejvolunteer = this.responseValue;
            }
          });
          adarda.updateSurveyResponses({
            frId: adarda.trpc.frId, 
            form: '#edit-honorary-form', 
            data: surveyQuestions + ((ejtype == 'faboa') ? 'question_106549=&question_106548=' + encodeURIComponent(faboatype + '|' + regionnumber.replace('|','*') + '|' + branchnumber.replace('|','*') + '|' + ejfanumber.replace('|','*')) : 'question_106548=&question_106549=' + encodeURIComponent(ejjpnumber.replace('|','*') + '|' + ejlocation + '|' + ejtshirt + '|' + ejvolunteer + '|' + ejdivision)),
            callback: {
              success: function(response) {
                if(response.updateSurveyResponsesResponse.success === 'true') {
                  $('#edit-team-company-success, #edit-team-company-error').html('').addClass('hidden');
                  adarda.updateTeamInformation({
                    frId: adarda.trpc.frId, 
                    data: 'company_id=' + companyId, 
                    callback: {
                      success: function(response) {
                        $('#edit-team-company-success').html('Team Company/Organization updated.').removeClass('hidden');
                        $('#edit-team-company-modal').modal('hide');
                      }, 
                      error: function(response) {
                        if(handleApiError(response)) {
                          $('#edit-team-company-error').html(response.errorResponse.message).removeClass('hidden');
                        }
                      }
                    }
                  });
                } else {
                  $('#edit-team-company-error').html(response.updateSurveyResponsesResponse.errorMessage).removeClass('hidden');
                }
              }, 
              error: function(response) {
                $('#edit-team-company-error').html(response.errorResponse.message).removeClass('hidden');
                if(handleApiError(response)) {
                }
              }
            }
          });
        } else if (companyName != 'Edward Jones') { 
          $('#edit-team-company-success, #edit-team-company-error').html('').addClass('hidden');
          adarda.updateTeamInformation({
            frId: adarda.trpc.frId, 
            data: 'company_id=' + companyId, 
            callback: {
              success: function(response) {
                $('#edit-team-company-success').html('Team Company/Organization updated.').removeClass('hidden');
                $('#edit-team-company-modal').modal('hide');
              }, 
              error: function(response) {
                if(handleApiError(response)) {
                  $('#edit-team-company-error').html(response.errorResponse.message).removeClass('hidden');
                }
              }
            }
          });
        }
      }
      return false;
    });

    /* Edward Jones custom questions */
    $('#edit-team-company-select').change(function(e){
      if ($(this).children("option:selected").text() == 'Edward Jones') {
        $('.is-edward-jones').removeClass('hidden');
      } else {
        $('.is-edward-jones').addClass('hidden');
      }
    });

    $('#edit-ej-type').change(function(e){
      if ($(this).children("option:selected").val() == 'faboa') {
        $('.is-hba').addClass('hidden');
        $('.is-faboa').removeClass('hidden');
      } else if ($(this).children("option:selected").val() == 'hba') {
        $('.is-faboa').addClass('hidden');
        $('.is-hba').removeClass('hidden');
      } else {
        $('.is-faboa').addClass('hidden');
        $('.is-hba').addClass('hidden');
      }
    });

    /* TEAM MEMBERSHIP CODE START */

    /* handle team membership search buttons */
    $('.tm-search').click(function(e){
      e.preventDefault();
      adarda.trpc.ui.buildTeamMembershipList(true);
    });
    $('.tm-cancel').click(function(e){
      e.preventDefault();
      $('.tm-team-search').addClass('hidden');
      $('.tm-team-search .table--row').remove();
      $('.team-search-input input').each(function(){ $(this).val(''); });
      $('.tm-search, .tm-cancel').attr('disabled', 'disabled');
    });

    /* on team membership search form, once something is typed in, enable the search and cancel buttons */
    $('#join-team-search-terms input').keyup(function(){
      if ($(this).val() != '') {
        $('.tm-search, .tm-cancel').removeAttr('disabled');
      } else if ($('#join-team-search-terms input').filter(function(){ return $.trim(this.value) != "";}).length == 0) {
        $('.tm-search, .tm-cancel').attr('disabled', 'disabled');
      }
    });

    /* handle team membership search list pagination */
    $('.js--team-membership-pagination .js--pagination-prev').click(function(e) {
      e.preventDefault();
      
      var $targetList = $(this).closest('.tm-team-search');
      $targetList.data('offset', Number($targetList.data('offset')) - 1);
      adarda.trpc.ui.buildTeamMembershipList(true);
    });
    $('.js--team-membership-pagination .js--pagination-next').click(function(e) {
      e.preventDefault();
      
      scrollToTop();
      
      var $targetList = $(this).closest('.tm-team-search');
      $targetList.data('offset', Number($targetList.data('offset')) + 1);
      adarda.trpc.ui.buildTeamMembershipList(true);
    });

    /* handle join a team */
    $('#tm__join').on('click', '.tm-join', function(e) {
      e.preventDefault();
      showLoading();
      var teamId = $(this).data('team-id');
      
      adarda.trpc.api.teamraiser.joinTeam({
        teamId: teamId,
        callback: {
          success: function(response) {
            hideLoading();
            location.reload();
          }, 
          error: function(response) {
            hideLoading();
            if(handleApiError(response)) {
              adarda.trpc.ui.updatePageError(response.errorResponse.message);
            }
          }
        }
      });
    });

    /* handle leave team */
    $('#tm__leave .tm-leave').click(function(e) {
      e.preventDefault();
      showLoading();
      adarda.trpc.api.teamraiser.leaveTeam({
        callback: {
          success: function(response) {
            hideLoading();
            location.reload();
          }, 
          error: function(response) {
            hideLoading();
            if(handleApiError(response)) {
              adarda.trpc.ui.updatePageError(response.errorResponse.message);
            }
          }
        }
      });
    });

    /* set up radio button toggle event handler */
    $('#tm__help #lbl-tm-join').click(function(){
      $('#tm__help #tm-help-start').addClass('hidden');
      $('#tm__help #tm-help-join').removeClass('hidden');
    });
    $('#tm__help #lbl-tm-start').click(function(){
      $('#tm__help #tm-help-join').addClass('hidden');
      $('#tm__help #tm-help-start').removeClass('hidden');
    });

    /* a fake dropdown for company options, and handle it's change() event */
    $('#tm__help #orgExisting').change(function(){
      $('#tm__help #1796_46550_10_93911').val($('#tm__help #orgExisting option:selected').text() + ' (' + $(this).val() + ')');
    });

    /* handle toggling of company existing/new radio buttons */
    $('#tm__help #1796_46550_9_93910_1').click(function(){
      $('#tm__help #orgExisting').removeAttr('disabled');
      $('#tm__help #1796_46550_11_93912').attr('disabled','disabled');
    });
    $('#tm__help #1796_46550_9_93910_2').click(function(){
      $('#tm__help #1796_46550_11_93912').removeAttr('disabled');
      $('#tm__help #orgExisting').attr('disabled','disabled');
    });

    /* fake dropdown for team division, and handle it's change() event */
    $('#tm__help #teamDivision').change(function(){
      $('#tm__help #1796_46550_12_93913').val($(this).val());
    });

    /* if no option for company is selected, then choose the first */
    if (!$('#tm__help #1796_46550_9_93910_1').is(':checked') && !$('#tm__help #1796_46550_9_93910_2').is(':checked')) {
      $('#tm__help #1796_46550_9_93910_1').attr('checked','checked');
    } else {
      if ($('#tm__help #1796_46550_9_93910_1').is(':checked')) {
        $('#tm__help #orgExisting').removeAttr('disabled');
        $('#tm__help #1796_46550_11_93912').attr('disabled','disabled');
      } else {
      $('#tm__help #1796_46550_11_93912').removeAttr('disabled');
      $('#tm__help #orgExisting').attr('disabled','disabled');
      }
    }

    /* Set the default selection and show the appropriate fields */
    if (!$('#tm__help #1796_46550_2_93903_1').is(':checked') && !$('#tm__help #1796_46550_2_93903_2').is(':checked')) {
      $('#tm__help #1796_46550_2_93903_1').attr('checked','checked');
      $('#tm__help .joinTeamRow').show();
    } else {
      if ($('#tm__help #1796_46550_2_93903_1').is(':checked')) {
        $('#tm__help .joinTeamRow').show();
      } else {
        $('#tm__help .startTeamRow').show();
      }
    }

    $('#teamMembershipForm').submit(function(e){
      e.preventDefault();
      showLoading();
      /* fake the submit button so I can disable it */
      var $form = $(this);
      var $hiddenButton = $('#fakeFinish', $form);
      if (($hiddenButton).length == 0)
      {
          // add the hidden to the form as needed
          $hiddenButton = $('<input>')
              .attr({ type: 'hidden', id: 'fakeFinish', name: 'ACTION_SUBMIT_SURVEY_RESPONSE' })
              .appendTo($form);
      }
      $hiddenButton.attr('value', $('#ACTION_SUBMIT_SURVEY_RESPONSE').val());
      /* disable the button to prevent repeat */
      $('#ACTION_SUBMIT_SURVEY_RESPONSE').attr('disabled','disabled');
      $.ajax({
        url: $('#teamMembershipForm').attr('action'),
        data: $('#teamMembershipForm').serialize()
      }).done(function(data){
        console.log('done with AJAX');
        $('#teamMembershipForm').addClass('hidden');
        $('#teamMembershipFormConfirm').removeClass('hidden');
        $('#ACTION_SUBMIT_SURVEY_RESPONSE').removeAttr('disabled');
        hideLoading();
      });
      return false;
    });
    /* TEAM MEMBERSHIP CODE STOP */

    /* handle email your team button */
    $('.email-team-members').click(function(e) {
      e.preventDefault();
      $('#pc2EmailSection').addClass('show');
      $('#pc-email-view').addClass('email_rpt_show_teammates');
      adarda.trpc.view('pc-email');
      setTimeout(function(){
        $.scrollTo($('#pc2EmailSection'), {axis: 'y', duration: 800, easing: 'swing'});
      }, 300);
      setTimeout(function(){
        $('#email-contacts-modal').modal('show');
        $('.js--email-contacts-filter').val('email_rpt_show_teammates');
      }, 1000);
      return false;
    });

    /* handle view donors (in email center) button */
    $('.email-view-donors').click(function(e) {
      e.preventDefault();
      
      $('#pc2EmailSection').addClass('show');
      $('#pc-email-view').addClass('email_rpt_show_donors');
      adarda.trpc.view('pc-email');
      setTimeout(function(){$.scrollTo($('#pc2EmailSection'), {axis: 'y', duration: 800, easing: 'swing'});}, 300);
      
      return false;
    });
    
    /* handle edit company URL form submission */
    $('#edit-company-page-url-form').submit(function(e) {
      e.preventDefault();
      
      $('#edit-company-page-url-error').html('')
                                       .addClass('hidden');
      
      adarda.trpc.api.teamraiser.updateCompanyShortcut({
        form: '#edit-company-page-url-form', 
        callback: {
          success: function(response) {
            var shortcutItem = response.updateCompanyShortcutResponse.shortcutItem, 
            shortcutUrl = shortcutItem.url;
            
            if(typeof shortcutUrl === 'string') {
              $('#edit-company-page-url').html(shortcutUrl);
            }
            else if (adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId]) {
              $('#edit-company-page-url').html(luminateExtend.global.path.secure + 
                                               'TR?fr_id=' + adarda.trpc.frId + 
                                               '&pg=' + 
                                               (adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.companyType === 'LOCAL' ? 'company' : 'national_company') + 
                                               '&company_id=' + adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].companyInformation.companyId);
            }
            
            $('#edit-company-page-url-modal').modal('hide');
          }, 
          error: function(response) {
            if(handleApiError(response)) {
              $('#edit-company-page-url-error').html(response.errorResponse.message)
                                               .removeClass('hidden');
            }
          }
        }
      });
      return false;
    });
    
    /* handle edit company page preview */
    $('#edit-company-page-preview').click(function() {
      window.open('../trpc/edit-page-preview.html?page_type=company&fr_id=' + adarda.trpc.frId, 
                  'previewpage', 
                  'location=no,menubar=no,toolbar=no,scrollbars=yes,resizable=yes,' + 
                  'width=' + ($(window).width() - 100) + ',height=' + ($(window).height() - 100));
      
      $('#pc-edit-page-success').addClass('hidden');
      $('#pc-edit-page-error').html('')
                              .addClass('hidden');
    });
    
    /* handle edit company page form submission */
    $('#edit-company-page-form').submit(function(e) {
      e.preventDefault();
      showLoading();
      $('#pc-edit-page-success').addClass('hidden');
      $('#pc-edit-page-error').html('')
                              .addClass('hidden');
      adarda.trpc.api.teamraiser.updateCompanyPageInfo({
        data: 'rich_text=' + encodeURIComponent(getEditorContent('#edit-company-page-body')), 
        form: '#edit-company-page-form', 
        callback: {
          success: function(response) {
            hideLoading();
            scrollToTop();
            if(response.teamraiserErrorResponse) {
              var errorCode = response.teamraiserErrorResponse.code, 
              errorMessage = response.teamraiserErrorResponse.message;
              if(errorCode === '2647') {
                errorMessage = 'The body content contained invalid HTML tags that were removed. Check your message again for formatting and accuracy.';
              }
              adarda.trpc.ui.updatePageError(errorMessage);
              setEditorContent('#edit-company-page-body', response.teamraiserErrorResponse.body);
            }
            else {
              $('#pc-edit-page-success').removeClass('hidden');
            }
          }, 
          error: function(response) {
            hideLoading();
            if(handleApiError(response)) {
              adarda.trpc.ui.updatePageError(response.errorResponse.message);
            }
          }
        }
      });
      return false;
    });
  });

  $('.alreadySentEmails').click(function(e) {
    e.preventDefault();
    console.log('sent emails');
    document.cookie = 'sentEmail=true; expires=' + new Date(new Date().getTime() + 31536000000).toUTCString() + '; path=/';
    $('body').append($('<img src="'+luminateExtend.global.path.secure+'SSurvey?cons_info_component=t&denySubmit=&ACTION_SUBMIT_SURVEY_RESPONSE=Submit+Survey&SURVEY_ID=54925&cons_email='+encodeURIComponent(adarda.trpc.cons.profile.email.primary_address)+'" alt="" height="1" width="1" style="visibility: hidden;"/>'));
    $('.emailNotCompleted').addClass('hidden');
    $('.emailCompleted').removeClass('hidden');
    return false;
  });
 if(document.cookie.indexOf('sentEmail=true') !== -1) {
    console.log('has sent emails');
    $('.emailCompleted').removeClass('hidden');
    $('.emailNotCompleted').hide();
 }
  $('.cashAndChecksLink').click(function(e) {
    e.preventDefault();
    $('body').append($('<img src="'+luminateExtend.global.path.secure+'SSurvey?cons_info_component=t&denySubmit=&ACTION_SUBMIT_SURVEY_RESPONSE=Submit+Survey&SURVEY_ID=51340&cons_email='+encodeURIComponent(adarda.trpc.cons.profile.email.primary_address)+'" alt="" height="1" width="1" style="visibility: hidden;"/>'));
    $('.cashAndChecksBadge').removeClass('hidden');
    $('.cashAndChecksLink').parent().addClass('hidden');
    return false;
  });

  $('.identifyCommitteeMember').click(function(e) {
    e.preventDefault();
    $('body').append($('<img src="'+luminateExtend.global.path.secure+'SSurvey?cons_info_component=t&denySubmit=&ACTION_SUBMIT_SURVEY_RESPONSE=Submit+Survey&SURVEY_ID=54314&cons_email='+encodeURIComponent(adarda.trpc.cons.profile.email.primary_address)+'" alt="" height="1" width="1" style="visibility: hidden;"/>'));
    $('.committeeMemberBadge').removeClass('hidden');
    $('.identifyCommitteeMember').parent().addClass('hidden');
    return false;
  });

  $('#fbCoverPhotoSelector').change(function(e){
    $('#fbCoverPhotoImg').attr('href','https://act.alz.org/2016walk/img/FacebookCover_WALK2016_IWalkFor_'+$('#fbCoverPhotoSelector').val()+'.jpg');
    $('#fbCoverPhotoImg img').attr('src','https://act.alz.org/2016walk/img/FacebookCover_WALK2016_IWalkFor_'+$('#fbCoverPhotoSelector').val()+'.jpg');
  });

  $('.updateHonoraryModal').click(function(){
    $('#pc-custom-video-success, #pc-custom-video-error').addClass('hidden');
  });
  
  /* handle custom video form submission */
  $('#edit-honorary-form').submit(function(e) {
    e.preventDefault();
    var surveyQuestions = '';

    $(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].surveyResponses).each(function(){
      if(this.questionId != $('#edit-honorary').data('questionid') && this.questionId != $('#edit-video-name').data('questionid')) {
        var responseValue = this.responseValue;
        if(typeof responseValue != 'string' || responseValue === 'User Provided No Response') {
          responseValue = '';
        }
        if (surveyQuestions.indexOf('question_' + this.questionId) == -1) {
          surveyQuestions += 'question_' + this.questionId + '=' + responseValue + '&';
        }
      }
    });
    
    adarda.updateSurveyResponses({
      frId: adarda.trpc.frId, 
      form: '#edit-honorary-form', 
      data: surveyQuestions + 'question_' + $('#edit-honorary').data('questionid') + '=' + 
            encodeURIComponent($('#edit-honorary').val()) +
            '&question_' + $('#edit-video-name').data('questionid') + '=' + 
            encodeURIComponent($('#edit-video-name').val()),
      callback: {
        success: function(response) {
          if(response.updateSurveyResponsesResponse.success === 'true') {
            $('#pc-custom-video-success').removeClass('hidden');
            adarda.trpc.ui.getSurveyAnswers();
            $('#mypage-edit-honorary-modal').modal('hide');
          } else {
            $('#pc-custom-video-error').html(response.updateSurveyResponsesResponse.errorMessage);
            $('#pc-custom-video-error').removeClass('hidden');
          }
        }, 
        error: function(response) {
          $('#pc-custom-video-error').html(response.errorResponse.message);
          $('#pc-custom-video-error').removeClass('hidden');
          if(handleApiError(response)) {
          }
        }
      }
    });
    return false;
  });

  /* Add users to a group via Survey 48765 when they share their personalized video */
  $('.js--pvideo-ready .js--personal-share a').click(function(){
    $('body').append($('<img src="'+luminateExtend.global.path.secure+'SSurvey?cons_info_component=t&denySubmit=&ACTION_SUBMIT_SURVEY_RESPONSE=Submit+Survey&SURVEY_ID=48765&cons_email='+encodeURIComponent(adarda.trpc.cons.profile.email.primary_address)+'" alt="" height="1" width="1" style="visibility: hidden;"/>'));
    return true;
  });

    /* facebook create buttons */
    $('.js__btn-fbf').click(function(e){
      if ($(this).html().indexOf('GO') == -1 && $(this).html().indexOf('Go') == -1) {
        e.preventDefault();
        e.preventDefault();
        $('.js__btn-fbf').each(function(){
          $(this).data('original',$(this).html()).html('Loading...');
        });
        if (adarda.trpc.view.current == 'pc-editpage') {
          adarda.trpc.ui.fbLogin(false);
        } else {
          adarda.trpc.ui.fbLogin(true);
        }
        return false;
      }
    });

  /* sample social sharing scripts */
  $('.sampleScroller .previous').click(function(e) {
    e.preventDefault();
    var $thisScroller = $(this).parent();
    var $currentSample = $thisScroller.find('li.active');
    var $prevSample = $currentSample.prev().length>0 ? $currentSample.prev() : $thisScroller.find('li').last();
    $currentSample.removeClass('active').addClass('hidden');
    $prevSample.removeClass('hidden').addClass('active');
    return false;
  });
  $('.sampleScroller .next').click(function(e) {
    e.preventDefault();
    var $thisScroller = $(this).parent();
    var $currentSample = $thisScroller.find('li.active');
    var $nextSample = $currentSample.next().length>0 ? $currentSample.next() : $thisScroller.find('li').first();
    $currentSample.removeClass('active').addClass('hidden');
    $nextSample.removeClass('hidden').addClass('active');
    return false;
  });
  
  $(window).resize(function() {
    if($('.popover').length > 0) {
      $('#pc-nav-notifications').popover('toggle');
    }
    
    $('#email-recipients').autocomplete()
                          .autocomplete('search');
  });


  $('#pc-edit-page-view .nav-tabs li a').on('click', function(e){
    $('#pc-edit-page-view .nav-tabs li').removeClass('active');
    $(this).parent().addClass('active');
  });

  $('#pc-email-view .nav-tabs li a').on('click', function(e){
    $(this).closest('ul').find('li').removeClass('active');
    $(this).parent().addClass('active');
  });

  $('#pc-donors-view .nav-tabs li a').on('click', function(e){
    $(this).closest('ul').find('li').removeClass('active');
    $(this).parent().addClass('active');
  });

  $('#pc-team-membership-view .nav-tabs li a').on('click', function(e){
    console.log('clicking');
    $(this).closest('ul').find('li').removeClass('active');
    $(this).closest('li').addClass('active');
  });
//  Edit Reg Qs
$('.js__edit-reg-info-btn').on('click', function(e){
  e.preventDefault();
  $(this).hide();
  $('.js__reg-answer').hide();
  $('.js__editing-reg-info').show();
});

$('.js__cancel-reg-update-btn').on('click', function(e){
  e.preventDefault();
  $('.js__editing-reg-info').hide();
  $('.js__edit-reg-info-btn, .js__reg-answer').show();
})

  $('.js__update-reg-form').on('submit', function(e){
    e.preventDefault();
    var surveyQuestions = '';
    var $elem = $(this);

    var hasMobilePhone = $('.js__mobile-phone-field').val();
    var hasAlzConnection = $('.js__alz-connection-field').val();
    var hasHonoree = ($('.js__honoree-field').val().length ? $('.js__honoree-field').val() : 'User Provided No Response');
    var hasTshirtSize = $('.js__tshirt-size-field').val();
    var hasRideRoute = $('.js__ride-route-field').val();
    var hasIsVegetarian = $('.js__is-vegetarian-field input:checked').val();
    var hasVolunteerPosition = $('.js__ride-volunteer-position-field').val();
    var hasCrewPosition = $('.js__ride-crew-position-field').val();
 
    $(adarda.trpc.teamraiserRegistration['tr'+adarda.trpc.frId].surveyResponses).each(function(){
      var surveyResponse = this, 
      surveyKey = surveyResponse.key || '';
      // console.log('surveyKey: ', surveyKey);
      if(surveyKey !== 'mobile_phone' && surveyKey !== 'ride_honoree' && surveyKey !== 'alz_connection' && surveyKey !== 'tshirt_size' && surveyKey !== 'ride_route' && surveyKey !== 'is_vegetarian' && surveyKey !== 'crew_interests' && surveyKey !== 'volunteer_interests') {
        var responseValue = this.responseValue;
        if(typeof responseValue != 'string' || responseValue === 'User Provided No Response') {
          responseValue = '';
        }
        if (surveyQuestions.indexOf('question_' + this.questionId) == -1) {
          surveyQuestions += 'question_' + this.questionId + '=' + responseValue + '&';
        }
      }
    });

    adarda.updateSurveyResponses({
      frId: adarda.trpc.frId,
      data: surveyQuestions + (hasMobilePhone ? '&question_key_mobile_phone=' + encodeURIComponent(hasMobilePhone) : '')  + (hasAlzConnection ? '&question_key_alz_connection=' + encodeURIComponent(hasAlzConnection) : '') + (hasHonoree ? '&question_key_ride_honoree=' + encodeURIComponent(hasHonoree) : '') + (hasTshirtSize ? '&question_key_tshirt_size=' + encodeURIComponent(hasTshirtSize) : '')  + (hasRideRoute ? '&question_key_ride_route=' + encodeURIComponent(hasRideRoute) : '')  + (hasIsVegetarian  ? '&question_key_is_vegetarian=' + encodeURIComponent(hasIsVegetarian) : '') + (hasVolunteerPosition  ? '&question_key_volunteer_interests=' + encodeURIComponent(hasVolunteerPosition) : '') + (hasCrewPosition  ? '&question_key_crew_interests=' + encodeURIComponent(hasCrewPosition) : ''), 
      callback: {
        success: function(response) {
          if(response.updateSurveyResponsesResponse.success == 'false') {
            /* TODO: updateSurveyResponses error */
            console.log('survey update error 1', response.updateSurveyResponsesResponse);
          }
          else {
            console.log('survey update success: ', response.updateSurveyResponsesResponse);
  console.log('hasHonoree: ', hasHonoree);
            $('.js__mobile-phone-answer').html(hasMobilePhone);
            $('.js__alz-connection-answer').html(hasAlzConnection);
            $('.js__honoree-answer').html((hasHonoree === 'User Provided No Response' ? '' : hasHonoree));
            $('.js__tshirt-size-answer').html(hasTshirtSize);

            // RIDER ONLY QUESTIONS
            $('.js__ride-route-answer').html(hasRideRoute);
            $('.js__is-vegetarian-answer').html(hasIsVegetarian);

            // CREW ONLY QUESTIONS
            $('.js__ride-crew-position-answer').html(hasCrewPosition);

            // VOLUNTEER ONLY QUESTIONS
            $('.js__ride-volunteer-position-answer').html(hasVolunteerPosition);


            $('.js__editing-reg-info').hide();
            $('.js__edit-reg-info-btn, .js__reg-answer').show();

          }
        }, 
        error: function(response) {
          if($.inArray(response.errorResponse.code, ['3', '5', '14']) > -1) {
            window.location = luminateExtend.global.path.secure + 
                              'UserLogin?NEXTURL=' + encodeURIComponent(window.location.href);
          }
          else {
            /* TODO: updateSurveyResponses error */
            console.log('survey update error 2', response.updateSurveyResponsesResponse);
  
          }
        }
      }
    });
  });


})(jQuery);

// END https://act.alz.org/ridepc/js/participant-center.js.gz