$(document).ready(function(){
    var clientId = '857249391862-t5q6nh4gb8i2rki0to7kh7hn0k3vqh53.apps.googleusercontent.com';
    var apiKey = 'AIzaSyByDM-RAvxMiQ3xGxZFWRgJZ3eDRF9jvTA';
    var scopes = 'https://www.googleapis.com/auth/calendar';
    
    $("#calendar").html("<div id='loadCal' class='lds-ring dark'><div></div><div></div><div></div><div></div></div>");
    setTimeout(function(){
        handleClientLoad();
    },500)
    
    function handleClientLoad() {
        //console.log("handleClientLoad");
        gapi.client.setApiKey(apiKey);
        window.setTimeout(checkAuth,1);
    }

    function checkAuth() {
        console.log("checkAuth");
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
    }

    function handleAuthResult(authResult) {
        var authorizeButton = document.getElementById('authorize-button');
        console.log("handleAuthResult");
        if (authResult && !authResult.error) {
            authorizeButton.style.visibility = 'hidden';		  
            makeApiCall();
        } else {
            authorizeButton.style.visibility = '';
            authorizeButton.onclick = handleAuthClick;
            GeneratePublicCalendar();
        }
    }

    function handleAuthClick(event) {            
        gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
        return false;
    }


    // Load the API and make an API call.  Display the results on the screen.
    function makeApiCall() {

        // Step 4: Load the Google+ API
        gapi.client.load('calendar', 'v3').then(function() {
          // Step 5: Assemble the API request
              var request = gapi.client.calendar.events.list({
                    'calendarId': 'headspaceacupuncture.com_pi373bj31igc3rle6ln43b5n0k@group.calendar.google.com'
                });

                // Step 6: Execute the API request
                request.then(function(resp) {

                    var eventsList = [];
                    var successArgs;
                    var successRes;

                    if (resp.result.error) {
                        reportError('Google Calendar API: ' + data.error.message, data.error.errors);
                    }
                    else if (resp.result.items) {
                        $.each(resp.result.items, function(i, entry) {
                            var url = entry.htmlLink;

                            // make the URLs for each event show times in the correct timezone
                            //if (timezoneArg) {
                            //    url = injectQsComponent(url, 'ctz=' + timezoneArg);
                            //}

                            eventsList.push({
                                id: entry.id,
                                title: entry.summary,
                                start: entry.start.dateTime || entry.start.date, // try timed. will fall back to all-day
                                end: entry.end.dateTime || entry.end.date, // same
                                //url: url,
                                location: entry.location,
                                description: entry.description
                            });
                        });

                        // call the success handler(s) and allow it to return a new events array
                        successArgs = [ eventsList ].concat(Array.prototype.slice.call(arguments, 1)); // forward other jq args
                        successRes = $.fullCalendar.applyAll(true, this, successArgs);
                        if ($.isArray(successRes)) {
                            return successRes;
                        }
                    }

                    if(eventsList.length > 0)
                    {
                      // Here create your calendar but the events options is :
                      //fullcalendar.events: eventsList (Still looking for a methode that remove current event and fill with those news event without recreating the calendar.
                        $("#calendar").fullCalendar({
                           events: eventsList,
                            header:{
                                left:"title",
                                center:"",
                                right:"prev,today,next month,agendaWeek,agendaDay,listCustom",
                            },
                            defaultView:"agendaWeek",
                            minTime:"08:00:00",
                            maxTime:"020:00:00",
                            views:{
                                listCustom:{
                                    type:"list",
                                    buttonText:"list",
                                    visibleRange: function(currentDate){
                                        return {
                                            start: currentDate.clone().subtract(1,"days"),
                                            end: currentDate.clone().add(1,"weeks")
                                        };
                                    }
                                }
                            },
                            eventRender: function(event, element){
                                console.log(event);
                                console.log(element);
                                //element.data("description",event.description);
                            },
                            eventClick: function(calEvent,jsEvent,view){
                                console.log(calEvent.description);
                            }
                        });
                        $("#loadCal").remove();
                    }
                  return eventsList;

              }, function(reason) {
                console.log('Error: ' + reason.result.error.message);
              });
        });
    }
    
    function GeneratePublicCalendar(){  
      // You need a normal fullcalendar with googleApi when user isn't logged

        $('#calendar').fullCalendar({
            //googleCalendarApiKey: 'AIzaSyByDM-RAvxMiQ3xGxZFWRgJZ3eDRF9jvTA';
        });  
    }  


    
    
//    $("#calendar").fullCalendar({
        
  //  })
})

