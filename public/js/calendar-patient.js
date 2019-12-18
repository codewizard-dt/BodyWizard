var calendar, serviceConfirmBtn, dateTimeConfirmBtn, allowOverride = false, usertype = 'patient', serviceOverride = false;
$(document).ready(function(){
    $("#ScheduleFeedTarget").load("/schedule/feed",function(){
        $("#PatientCalendar").html("");
     	loadCal($("#PatientCalendar"));
        // console.log($("#AnonFeed").data('schedule'));
    });
    $("#createAppointment").on('click','.cancel',function(){
        $("#booknow").find('.active').removeClass('active');
    })
    $("#createAppointment").find(".submitForm").text('book appointment');
    $("#createAppointment, #editAppointment").find(".item").hide();
    $("#booknow").data('target','#createAppointment');
    $("#EditApptBtn").data('target','#editAppointment');
    $("#booknow, #EditApptBtn").on('click',openAppointmentDetails);
    $('#FormInfo').on('click','.link',checkFormStatus);

    defaultPatientInfo = $("#PatientCalendar").data('patient');

    activateServiceSelection();

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
    $("#SelectDate, #SelectTime").find(".next").on('click',nextStep);
    $("#DateSelector").on('focusout',checkDate);
    $("#TimeSelector").on('click','li',updateTime);
    $("#PractitionerSelector").on('click','li',updatePractitioner);
    $("#SelectOrRandom").on('click','.closeBtn',randomPractitioner);
    $("#Details").on('click','.edit',openDetail);
    if (autoClickBtn != undefined){
        autoClickBtn.click();
        autoClickBtn = undefined;
    }
})
function loadCal(target){
    calendar = new FullCalendar.Calendar(target[0], {
        plugins: ['dayGrid','list', 'timeGrid', 'interaction', 'rrule'],
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
                // $("#ApptInfo").data({
                //     'patientIds': patientIds,
                //     'apptId': ev.id
                // });
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
                url: "/schedule/appointments",
                type: "GET",
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
function openAppointmentDetails(){
    var modalId = $(this).data('target');
    console.log(modalId);
    moveServiceSelect(modalId, false);
    movePracTimeSelect(modalId, false);
    moveDetails(modalId);
    if (modalId == '#createAppointment'){
        resetEntireAppt();
        resetConnectedModels();
        $(modalId).find('input, textarea').val("");
        $(modalId).find('.active').removeClass('active');
        $(modalId).removeData('dateTime');
    }else{
        addDetail('services',$(modalId).find("#select_services").val());
        addDetail('date',$(modalId).find("#date").val());
        addDetail('time',$(modalId).find("#time").val());
        addDetail('practitioner',$(modalId).find("#select_practitioner").val());
    }
    $(".progressiveSelection").hide();
    $(".progressiveSelection").find(".step").hide();
    $(".progressiveSelection").find(".open").show();
    checkCount($("#SelectServices"));
    resetProgressBar($("#SelectServices"));
    // updatePatientData();
    // updatePractitionerData();
    // updateDuration();
    // updateAvailableServices();
    // updateAvailableTimes();
    blurElement($("body"),modalId);
}
function addDetail(type,value){
    var btn = $("#Details").closest(".modalForm").find(".submitForm");
    $("#Details").find("."+type).find(".value").text(value);
    $("#Details").find("."+type).find(".edit").show().text("change");
    if (type == 'date'){$("#Details").find(".time").find(".edit").text("select");}
    if ($("#Details").find('.value').filter(function(){return $(this).text() == 'none'}).length == 0){
        btn.removeClass('disabled');
    }else{
        btn.addClass('disabled');
    }
}
function removeDetail(type){
    if ($.isArray(type)){
        $.each(type,function(x,t){
            removeDetail(t);
        })
    }else{
        var t = (type == 'time') ? "" : "select";
        $("#Details").find("."+type).find(".value").text("none");
        $("#Details").find("."+type).find(".edit").text(t);        
    }
}
function openDetail(){
    var target = $($(this).data('target')), openBtn = target.find('.openBtn');
    target.find(".active").removeClass('active');
    $(".progressiveSelection").hide();
    if (!target.is(".progressiveSelection")){
        target.closest('.progressiveSelection').find('.step, .open').hide();
        target.closest('.progressiveSelection').find('.active').removeClass('active');
        target.closest('.progressiveSelection').fadeIn();
    }
    target.fadeIn();
    if (openBtn.length > 0){openBtn.click();}
}
// var waitForDate;
function checkDate(){
    console.log('checkDate');
    var date, form = $(this).closest('.formDisp');
    setTimeout(function(){
        date = $("#DateSelector").val();
        if (date != ""){
            updateAvailableTimes(form);
            addDetail('date',date);
            form.find("#date").val(date);
            $("#SelectDate").find(".next").removeClass('disabled').click();
        }
    },200)
}
function updateAvailableTimes(){
    console.log('updateAvailableTimes');
    var form = $("#createAppointment, #editAppointment").filter(":visible"), bizHours = $("#BizHours").data('schedule'), practitioners = $("#Practitioners").data('schedule'), services = $("#ServiceListModal").data('uidArr'), duration = Number(form.find('#duration').val()), date = moment($("#DateSelector").val(),"MM/DD/YYYY"), slots = $("#TimeSelector").find("li"),
        practitioner = ($("#PractitionerListModal").data('uidArr') != undefined) ? $("#PractitionerListModal").data('uidArr') : null;
    if (practitioner && practitioner.length == 0){practitioner = null;}
    if (practitioner){
        var id = practitioner[0];
        practitioner = practitioners.find(p => {
            return p.practitioner_id === id
        })
    }
    // console.log(practitioner);
    slots.addClass('disabled');
    var anonEvents = ($("#AnonFeed").data('schedule') == "") ? null : $("#AnonFeed").data('schedule');
    // console.log(anonEvents);
    slots.each(function(){
        var slot = $(this), time = slot.data('value').split(":"), hour = Number(time[0]), min = Number(time[1]), practitionerEvents;
        date.hour(hour).minute(min);
        bizHourCheck = checkSchedule(date, bizHours, services, duration);
        if (bizHourCheck === true){
            slot.removeClass('disabled');
        }
        if (practitioner){
            practitionerEvents = anonEvents ? anonEvents.filter(event => event.practitionerId == practitioner.practitioner_id) : null;
            if (checkSchedule(date, practitioner.schedule, services, duration) === true
                && noEventConflict(date, duration, practitionerEvents)){
                slot.removeClass('disabled');
                // console.log(date);
            }else{
                slot.addClass('disabled');
            }
        }else{
            $.each(practitioners,function(p,practitioner){
                practitionerEvents = anonEvents ? anonEvents.filter(event => event.practitionerId == practitioner.practitioner_id) : null;
                if (checkSchedule(date, practitioner.schedule, services, duration) === true
                    && noEventConflict(date, duration, practitionerEvents)){
                    // console.log(date.format("H:mm ")+practitioner.name);
                    slot.removeClass('disabled');
                }
            })
        }
    })
}
function updatePractitioner(){
    var name = $(this).text(), list = $("#PractitionerSelector").data('details'), id = list[name], practitionerBtn = $(this),
        form = $("#createAppointment, #editAppointment").filter(":visible");

    // console.log($(this));
    if ($(this).hasClass('disabled')){
        confirm(name + ' Unavailable', "Would you like to select a new time to match "+ name + "'s schedule?",'yes, select new time','no');
        var wait = setInterval(function(){
            if (confirmBool != undefined){
                if (confirmBool){
                    form.find('#date, #DateSelector, #time, #TimeSelector').val("");
                    removeDetail(['date','time']);
                    practitionerBtn.removeClass('disabled').click();
                    $("#Details").find(".date").find(".edit").click();
                    clearInterval(wait);
                }
            }
        })
    }else{
        updateInputByUID(form.find("#select_practitioner"),id);
        $("#PractitionerSelector").find(".closeBtn").removeClass('disabled');
        addDetail('practitioner',name);
        if (form.find("#date").val() != ''){
            updateAvailableTimes();
        }
    }
}
function randomPractitioner(){
    var form = $("#createAppointment, #editAppointment").filter(":visible");
    var p = randomArrayElement(availablePractitioners(form.data('dateTime'),form.find("#duration").val(),$("#ServiceListModal").data('uidArr')));
    updateInputByUID(form.find("#select_practitioner"),p.practitioner_id);
    addDetail('practitioner',p.name);
}
function updateTime(){
    console.log('updateTime');
    if ($(this).hasClass('disabled')){return;}
    var form = $("#createAppointment, #editAppointment").filter(":visible"), time = $(this).text().replace(" ",""), date = form.find("#date").val(), services = $("#ServiceListModal").data('uidArr');
    form.find("#time").val(time);
    var dateTime = moment(date + " " + time,'MM/DD/YYYY hh:mma');
    $("#SelectTime").find(".next").removeClass('disabled').click();
    form.data('dateTime',dateTime);
    addDetail('time',time);
    var p = availablePractitioners(dateTime,form.find("#duration").val(), services);
    // console.log(dateTime);
    // console.log(form.find("#duration").val());
    // console.log(services);
    // console.log(p);
    $("#PractitionerSelector").find("li").addClass('disabled');
    $.each(p,function(x,practitioner){
        $("#PractitionerSelector").find("li").filter(function(){return $(this).text() == practitioner.name}).removeClass('disabled');
    })
}
