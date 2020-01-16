// var calendar, allowOverride = true, usertype = 'practitioner', serviceOverride = false;
$(document).ready(function(){
})
// function loadCal(target){
//     var tz = target.data('timezone'), clientTz = moment.tz.guess(), location = target.data('location');
//     moment.tz.setDefault(tz.replace(" ","_"));

//     calendar = new FullCalendar.Calendar(target[0], {
//         plugins: ['dayGrid','list', 'timeGrid', 'interaction', 'rrule', 'momentTimezone'],
//         timeZone: tz,
//         header:{
//             left:"title",
//             center:"",
//             right:"prev,today,next dayGridMonth,timeGridWeek,timeGridDay",
//         },
//         height: "auto",
//         dateClick: function(info){
//             activeForm = $("#createAppointment");
//             serviceOverride = false;
//             resetEntireAppt();
//             moveServiceSelect("#createAppointment",false);
//             movePracTimeSelect("#createAppointment",false);
//             moveDetails('#createAppointment');
//             // console.log(info);
//             var date = moment(info.date).format("M/D/YYYY"), time = moment(info.date).format("h:mma");
//             updateAppointment({date:date,time:time});
//             blurElement($("body"),'#createAppointment');
//         },
//         eventClick: function(info){
//             var ev = info.event, details = ev.extendedProps, patients = details.patients, practitioner = details.practitioner, services = details.services, patientIds = details.patientIds, practitionerId = details.practitionerId, serviceIds = details.serviceIds, forms = details.forms, dateTime = moment(ev.start), uid = details.bodywizardUid, type = details.type, ele = $(info.el), title = ev.title;
//             serviceOverride = false;
//             console.log(ev);
//             resetEntireAppt();
//             if (ele.hasClass('appointment')){
//                 activeForm = $("#editAppointment");
//                 moveServiceSelect("#editAppointment",false);
//                 movePracTimeSelect("#editAppointment",false);
//                 moveDetails('#editAppointment');
//                 updateAppointment({
//                     patient:patientIds[0],
//                     practitioner:practitionerId,
//                     services:serviceIds,
//                     datetime:dateTime
//                 });
//                 $("#editAppointment").data('uid',uid);
//                 setUid("Appointment",uid);
//                 $("#PatientName").text(patients);
//                 $("#PractitionerName").text(practitioner);
//                 $("#ApptDateTime").text(dateTime.format("h:mm a [on] dddd, MMMM Do YYYY"));
//                 $("#ApptDateTime").data('dateTime',dateTime);
//                 $("#ServiceInfo").text(services);
//                 updateFormInfo(forms);
//                 loadApptInfo(patientIds,practitionerId,serviceIds,dateTime,$("#editAppointment"));
//                 blurElement($("body"),"#ApptInfo");                
//             }
//         },        
//         defaultView:"timeGridWeek",
//         allDaySlot: false,
//         minTime:$("#BizHours").data("earliest"),
//         maxTime:$("#BizHours").data("latest"),
//         // events: $("#ApptFeed").data("events")
//         eventSources: 
//         [
//             {
//                 // url: "/schedule/appointments",
//                 // type: "GET",
//                 events: jsonIfValid($("#AppointmentsFullCall").data('schedule')),
//                 id: "appointments"
//             },
//             {
//                 // url: "/schedule/non-ehr",
//                 // type: "GET",
//                 events: jsonIfValid($("#NonEhr").data('schedule')),
//                 id: "nonEHR"
//             }    
//         ],
//         businessHours: $("#BizHours").data('fullcal'),
//         eventRender: function(info){
//             var eventData = info.event, ele = info.el;
//             applyEventClasses(eventData,$(ele));
//         },
//         nowIndicator: true
//     })

//     // var uids = JSON.parse($("#uidList").text()), patientId;
//     // if (uids && uids.Patient != undefined){
//     //     // patientId = uids.Patient;
//     //     // $("#PatientList").find(".active").removeClass("active");
//     //     // var row = $("#PatientList").find("tr").filter("[data-uid='"+patientId+"']"), selectBtn = $("#PatientListModal").find(".selectData");
//     //     // $("#createAppointment").find("#select_patient").addClass('targetInput');
//     //     // row.click();
//     //     // selectBtn.click();
//     //     updateAppointment({patient:uids.Patient});
//     // }

//     calendar.render();
//     activateServiceSelection();
//     var tb = target.find(".fc-toolbar");
//     $("#TimezoneWrap").insertAfter(tb).css('display','inline-block');
//     if (tz != clientTz){
//         $("#TimezoneWrap").html("Take note: you appear to be in a different timezone than your appointments will be held.<br><b>Appointments are displayed and scheduled in local "+location+" time.</b>");
//     }
//     $("#ChangeTitleWrap").insertAfter(tb).css('display','inline-block');
//     $("#ChangeTitleWrap").on('click','li',changeTitles);
// }
// function changeTitles(){
//     var attr = $(this).data('value'), events = calendar.getEvents();
//     console.log(events);
//     if (attr == 'names'){
//         $.each(events,function(e,event){
//             event.setProp('title', event.extendedProps.patients);
//         })
//     }else if (attr == 'service'){
//         $.each(events,function(e,event){
//             event.setProp('title', event.extendedProps.services.split(", ")[0]);
//         })
//     }else if (attr == 'no label'){
//         $.each(events,function(e,event){
//             event.setProp('title', "");
//         })
//     }
//     calendar.rerenderEvents();
// }
// function overrideService(){
//     serviceOverride = true;
//     updateAvailableServices();
//     $("#SelectServices").find(".conditionalLabel").text('showing all options');
//     $('.step').hide();
//     $("#CategoryDetails").find(".active").removeClass('active');
//     $("#CategoryDetails").fadeIn();
// }
// function checkForChartNote(){
    
// }