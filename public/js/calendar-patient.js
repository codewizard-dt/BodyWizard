var calendar, serviceConfirmBtn, dateTimeConfirmBtn, allowOverride = false, usertype = 'patient', serviceOverride = false;
$(document).ready(function(){
    $("#ScheduleFeedTarget").load("/schedule/feed",function(){
        $("#PatientCalendar").html("");
     	loadCal($("#PatientCalendar"));
    });
    $("#createAppointment").on('click','.cancel',function(){
        $("#booknow").find('.active').removeClass('active');
    })
    $("#createAppointment").find(".submitForm").text('book appointment');
    $("#createAppointment, #editAppointment").find(".item").hide();
    $("#booknow").data('target','#createAppointment');
    $("#EditApptBtn").data('target','#editAppointment');
    $("#booknow, #EditApptBtn").on('click',showAppointmentDetails);

    defaultPatientInfo = $("#PatientCalendar").data('patient');
    
    serviceConfirmBtn = $("#SelectServices").find('.closeBtn');
    dateTimeConfirmBtn = $("#SelectDateTime").find('.closeBtn');

    $(".closeBtn").on('click',function(){
        if ($(this).hasClass('disabled')){return false;}
        var next = ($(this).data('next') != undefined) ? $(this).data('next') : null,
            open = ($(this).data('autoOpen') != undefined) ? $(this).data('autoOpen') : true,
            btn = $(next).find('.openBtn');
        if (next){
            btn.removeClass('disabled');
            if (open){btn.click();}
            $(next).show();            
        }
    });
    // $("#SelectDate, #SelectTime").find(".next").on('click',nextStep);
    if (autoClickBtn != undefined){
        autoClickBtn.click();
        autoClickBtn = undefined;
    }
})
function loadCal(target){
    var tz = target.data('timezone'), clientTz = moment.tz.guess(), location = target.data('location');
    moment.tz.setDefault(tz.replace(" ","_"));
    calendar = new FullCalendar.Calendar(target[0], {
        plugins: ['dayGrid','list', 'timeGrid', 'interaction', 'rrule', 'momentTimezone'],
        timeZone: tz,
        header:{
            left:"title",
            center:"",
            right:"prev,today,next dayGridMonth,listMonth",
        },
        height: "auto",
        dateClick: function(info){
            resetEntireAppt();
            // console.log(info);
            var date = moment(info.date).format("M/D/YYYY");
            updateAppointment({date:date});
            $("#booknow").click();
        },
        eventClick: function(info){
            var ev = info.event, details = ev.extendedProps, patients = details.patients, practitioner = details.practitioner, services = details.services, patientIds = details.patientIds, practitionerId = details.practitionerId, serviceIds = details.serviceIds, forms = details.forms, dateTime = moment(ev.start), uid = details.bodywizardUid, type = details.type, ele = $(info.el), title = ev.title;
            console.log(ev);
            resetEntireAppt();
            if (ele.hasClass('appointment')){
                activeForm = $("#editAppointment");
                updateAppointment({
                    patient:patientIds[0],
                    practitioner:practitionerId,
                    services:serviceIds,
                    datetime:dateTime
                });
                $("#editAppointment").data('uid',uid);
                setUid("Appointment",uid);
                $("#PatientName").text(patients);
                $("#PractitionerName").text(practitioner);
                $("#ApptDateTime").text(dateTime.format("h:mm a [on] dddd, MMMM Do YYYY"));
                $("#ApptDateTime").data('dateTime',dateTime);
                $("#ServiceInfo").text(services);
                updateFormInfo(forms);
                moveServiceSelect("#editAppointment");
                loadApptInfo(patientIds,practitionerId,serviceIds,dateTime,$("#editAppointment"));
                blurElement($("body"),"#ApptInfo");                
            }
        },
        defaultView:"listMonth",
        allDaySlot: false,
        minTime:$("#BizHours").data("earliest"),
        maxTime:$("#BizHours").data("latest"),
        noEventsMessage: "No appointments scheduled this month",
        eventSources: 
        [
            {
                events: $("#AppointmentsFullCall").data('schedule'),
                id: "appointments"
            }
        ],
        businessHours: $("#BizHours").data('fullcal'),
        eventRender: function(info){
            var eventData = info.event, ele = info.el;
            applyEventClasses(eventData,$(ele));
        },
        nowIndicator: true
    })

    calendar.render();
    activateServiceSelection();
    var tb = target.find(".fc-toolbar");
    $("#TimezoneWrap").insertAfter(tb).css('display','inline-block');
    if (tz != clientTz){
        $("#TimezoneWrap").html("Take note: you appear to be in a different timezone than your appointments will be held.<br><b>Appointments are displayed and scheduled in local "+location+" time.</b>");
    }
}
function whichFirst(){
    var val = $(this).data('value');
    if (val.includes("Service")){
        $("#SelectServices").find(".openBtn").click();
        $("#WhichFirst").hide();
        serviceConfirmBtn.text('date + time >');
        $("#SelectServices").fadeIn();
        serviceConfirmBtn.data('next','#SelectDateTime');
        dateTimeConfirmBtn.data({'next':'#SelectPractitioner', 'autoOpen':false});
    }else if (val.includes("Practitioner")){
        $("#WhichFirst").hide();
        $("#SelectPractitioner").show();
    }
}


// var waitForDate;
