var calendar, defaultPatientInfo = undefined, allowOverride = true, usertype = 'practitioner', serviceOverride = false;
$(document).ready(function(){
     $("#ScheduleFeedTarget").load("/schedule/feed",function(){
        $("#PractitionerCalendar").html("");
     	loadCal($("#PractitionerCalendar"));
        if ($("#Practitioners").data('schedule') == ''){
            alert("Practitioner schedules not set");
        }
        if ($("#BizHours").data('schedule') == ''){
            alert("Business hours not set");
        }
     });
     $("#SelectServices").on('click', '.override',overrideService);
})
function loadCal(target){
    calendar = new FullCalendar.Calendar(target[0], {
        plugins: ['dayGrid','list', 'timeGrid', 'interaction', 'rrule'],
        header:{
            left:"title",
            center:"",
            right:"prev,today,next dayGridMonth,timeGridWeek,timeGridDay",
        },
        height: "auto",
        dateClick: function(info){
            // console.log(info);
            $("#createAppointment").find("#date").val(formatDate(info.date));
            $("#createAppointment").find("#time").val(formatTime(info.date));
            $("#createAppointment").find("#select_services").val("");
            $("#ServiceListModal").removeData('uidArr');
            // $("#PractitionerListModal").removeData('uidArr');
            serviceOverride = false;
            moveServiceSelect("#createAppointment");
            resetProgressBar($("#SelectServices"));
            updatePatientData();
            updatePractitionerData();
            updateDuration();
            updateAvailableServices();
            var clickedDateTime = moment(info.date), date = clickedDateTime.format("YYYY-MM-DD"), earliest = moment(date + " " + $("#BizHours").data('earliest')), latest = moment(date + " " + $("#BizHours").data('latest'));
            $("#createAppointment").data('dateTime',clickedDateTime);
            var bizHourCheck = checkSchedule(clickedDateTime, $("#BizHours").data('schedule'));
            if (bizHourCheck === true){
                blurElement($("body"),"#createAppointment");
            }else{
                handleCheck(bizHourCheck,'biz','new',clickedDateTime);
            }
        },
        eventClick: function(info){
            var ev = info.event, details = ev.extendedProps, patients = details.patients, practitioner = details.practitioner, services = details.services, patientIds = details.patientIds, practitionerId = details.practitionerId, serviceIds = details.serviceIds, forms = details.forms, dateTime = moment(ev.start), uid = details.bodywizardUid, type = details.type, ele = $(info.el), title = ev.title;
            console.log(ev);
            // console.log(ele);
            if (ele.hasClass('appointment')){
                $("#ApptInfo").data({
                    'patientIds': patientIds,
                    'apptId': ev.id
                });
                $("#editAppointment").data('uid',uid);
                $.ajax({
                    url:"/setvar",
                    method:"POST",
                    data:{
                        setUID: {"Appointment":uid}
                    },
                    success: function(){
                        updateUidList();
                    }
                });
                $("#PatientName").text(patients);
                $("#PractitionerName").text(practitioner);
                $("#ApptDateTime").text(dateTime.format("h:mm a \on dddd, MMMM Do YYYY"));
                $("#ApptDateTime").data('dateTime',dateTime);
                $("#ServiceInfo").text(services);
                moveServiceSelect("#editAppointment");
                $("#SelectServices").hide();
                updateFormInfo(forms);
                loadApptInfo(patientIds,practitionerId,serviceIds,dateTime,$("#editAppointment"));
                blurElement($("body"),"#ApptInfo");                
            }else if (ele.hasClass('break')){

            }else if (ele.hasClass('nonEHR')){
                $("#NonEhrInfo").find("h1").text(title);
                blurTopMost("#NonEhrInfo");
            }
        },
        defaultView:"timeGridWeek",
        allDaySlot: false,
        minTime:$("#BizHours").data("earliest"),
        maxTime:$("#BizHours").data("latest"),
        // events: $("#ApptFeed").data("events")
        eventSources: 
        [
            {
                url: "/schedule/appointments",
                type: "GET",
                id: "appointments"
            },
            {
                url: "/schedule/non-ehr",
                type: "GET",
                id: "nonEHR"
            }    
        ],
        businessHours: $("#BizHours").data('fullcal'),
        eventRender: function(info){
            var eventData = info.event, ele = info.el;
            applyEventClasses(eventData,$(ele));
        },
        nowIndicator: true
    })

    var uids = JSON.parse($("#uidList").text()), patientId;
    if (uids && uids.Patient != undefined){
        patientId = uids.Patient;
        $("#PatientList").find(".active").removeClass("active");
        var row = $("#PatientList").find("tr").filter("[data-uid='"+patientId+"']"), selectBtn = $("#PatientListModal").find(".selectData");
        $("#createAppointment").find("#select_patient").addClass('targetInput');
        row.click();
        selectBtn.click();
    }

    calendar.render();
    activateServiceSelection();
    var tb = $("#PractitionerCalendar").find(".fc-toolbar");
    $("#ChangeTitleWrap").insertAfter(tb).css('display','inline-block');
    $("#ChangeTitleWrap").on('click','li',changeTitles);
}
function changeTitles(){
    var attr = $(this).data('value'), events = calendar.getEvents();
    console.log(events);
    if (attr == 'names'){
        $.each(events,function(e,event){
            event.setProp('title', event.extendedProps.patients);
        })
    }else if (attr == 'service'){
        $.each(events,function(e,event){
            event.setProp('title', event.extendedProps.services.split(", ")[0]);
        })
    }else if (attr == 'no label'){
        $.each(events,function(e,event){
            event.setProp('title', "");
        })
    }
    calendar.rerenderEvents();

}
function overrideService(){
    serviceOverride = true;
    updateAvailableServices();
    $("#SelectServices").find(".conditionalLabel").text('showing all options');
    $('.step').hide();
    $("#CategoryDetails").find(".active").removeClass('active');
    $("#CategoryDetails").fadeIn();
}
// function resetOverride(){
//     $("#SelectServices").on('click', '.override',overrideService);
//     $("#SelectServices").find(".override").text("show all");
// }