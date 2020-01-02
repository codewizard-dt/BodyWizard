var action = undefined, appointmentDetails = {services:null,date:null,time:null,datetime:null,patient:null,practitioner:null}, 
	defaultPatientInfo = null, defaultPractitionerInfo = null, activeForm = null, category = null, practitioners, practiceTz, clientTz, patientInfo = {};
	// practitionersAnonEvents =[], anonEvents, defaultAnonEvents;

$(document).ready(function(){
	$("#createAppointment, #editAppointment").find('.submitForm').text("save appointment");
	$("#EditApptBtn").on('click',function(){
		blurElement($("body"),"#editAppointment");
	})
	$("#editAppointment").find("h1").first().text("Edit Appointment");
	$("#DeleteApptBtn").on('click',confirmApptDelete);
    $("#Details").on('click','.edit',openDetail);
    $('#FormInfo').on('click','.link',checkFormStatus);

    $(".selector").on('click','.next',goForward);
    $(".selector").on('click','.firstStep',firstStep);
    $(".selector").on('click',".selectDate",function(){
    	$("#Details").find('.date').find(".edit").click();
    })
    $(".selectPractitioner").on('click',function(){
    	$("#Details").find('.practitioner').find(".edit").click();
    })
    // $("#DateSelector").on('focusout',checkDate);
    $("#TimeSelector").on('click','li',updateTime);
    $("#PractitionerSelector").on('click','li',updatePractitioner);
    $("#SelectOrRandom").on('click','.closeBtn',randomPractitioner);
    $(".selector").hide();
})
function activateServiceSelection(){
	var categories = $("#CategoryDetails").data('details'), services = $("#ServiceDetails").data("details"),
		serviceItems = $("#createAppointment, #editAppointment").find(".item").filter(function(){
			return $(this).find(".q").text().includes("Select Service(s)");
		}), serviceLIs = $("#ServiceDetails").find("li"), categoryLIs = $("#CategoryDetails").find("li"),
		durationItems = $("#createAppointment, #editAppointment").find(".item").filter(function(){
			return $(this).find(".q").text().includes("Duration");
		}), patientItems = $(".item").filter(function(){
        	return $(this).find(".q").text().includes("Select Patient");
   		});

    anonEvents = $("#AnonFeed").data('schedule');
    practitioners = $("#Practitioners").data('schedule');

    if (practitioners.length == 1){
    	defaultPractitionerInfo = practitioners[0];
    	// console.log(defaultPractitionerInfo.name);
    	addDetail('practitioner',defaultPractitionerInfo.name);
    	$("#Details").find('.practitioner').find(".edit").hide();
    	resetEntireAppt();
    }

	serviceItems.find("textarea").off("focus",openConnectedModelModal);
	serviceItems.find("textarea").on("focus",function(){
		$("#SelectServices").addClass('yellowBgFlash');
		if (!$("#SelectServices").is(":visible")){slideFadeIn($("#SelectServices"))}
	});
	$("#SelectServices").on('click',function(){
		$(this).removeClass('yellowBgFlash')
	});
	$(".closeBtn").on('click',function(){
		if ($(this).hasClass('disabled')){return;}
		$(this).closest(".progressiveSelection").hide();
	})
	serviceItems.find(".q").text("Selected Service(s)");
    durationItems.find('input').attr('readonly',true);
    durationItems.find('.q').html("Duration <span class='little italic'>(automatically updates)</span>");

    if (defaultPatientInfo){
    	patientItems.find('input').val(defaultPatientInfo.name);
    	patientItems.find('input').removeClass('targetInput');
    }
    
    $(document).on('click', '.ui-timepicker-am, .ui-timepicker-pm', function(){
    	var form = $("#createAppointment, #editAppointment").filter(":visible"), date = date = form.find("#date").val(), time = $(this).text(),
    		dateTime = moment(date + " " + time, "MM-DD-YYYY hh:mma"),
    		services = ($("#ServiceListModal").data('uidArr') == undefined) ? null : $("#ServiceListModal").data('uidArr'),
    		practitioner = ($("#SelectServices").data('practitionerInfo') == undefined) ? null : $("#SelectServices").data('practitionerInfo'), 
    		bizCheck, practitionerCheck, h2 = [], div = [];
    	if (!form.is("#createAppointment, #editAppointment")){return;}
    	form.data('dateTime',dateTime);
    	if (services && services.length != 0){
    		updateDuration();
    	}else{
    		bizCheck = checkSchedule(dateTime, $("#BizHours").data('schedule'));
    		if (practitioner){practitionerCheck = checkSchedule(dateTime, practitioner.schedule);
    		}else{practitionerCheck = true;}

    		if (bizCheck !== true){
    			handleCheck(bizCheck,'biz','time',dateTime);
    		}else if (practitionerCheck !== true){
    			handleCheck(practitionerCheck,'practitioner','time',dateTime);
    		}
    	}
    });

	categoryLIs.each(function(){
		var name = $(this).text(), category = categories[name];
		$(this).data(category);
		$(this).data('show',true);
	})
	serviceLIs.each(function(){
		var name = $(this).text(), service = services[name];
		$(this).data(service);
		$(this).data('show',true);
	})
	categoryLIs.on('click',selectCategory);
	categoryLIs.on('click',goForward);
	serviceLIs.on('click',showServiceDescription);

	// $("#PatientListModal").find(".selectData").off('click',updateInputFromTable);
	$("#PatientListModal").find(".selectData").on('click',function(){
		// console.log(patientInfo);
		// setTimeout(function(){
		// 	console.log(patientInfo);
		// },400)
	});

	$(".selector").on('click','.back', goBack);
	categoryLIs.on('click',function(){
		var id = $(this).data('id'), matches = serviceLIs.filter(function(){
			return $(this).data('service_category_id') == id && $(this).data('show');
		}), notMatches = $("#ServiceDetails").find("li").not(matches);
		matches.show();
		notMatches.hide();
	})
	serviceLIs.on('click',function(){
		var description = $(this).data('description');
		$("#ServiceDescription").find('.target').text(description);
	})
	$("#SelectServiceBtn").on('click',addService);
	$("#SelectServiceBtn").on('click',goForward);
	
	var dateSelect = $("#DateSelector");
	dateSelect.datepick('destroy');
    $("#DateSelector").datepick({
    	yearRange: dateSelect.data('yearrange'),
    	minDate: dateSelect.data('mindate'),
    	maxDate: dateSelect.data('maxdate'),
    	onSelect: function(dates){
    		var date = moment(dates[0]).format("MM/DD/YYYY");
    		updateDate(date);
    	}
    });
    var practiceTz = $("#PatientCalendar").data('timezone');
}
function loadApptInfo(patientIds,practitionerId,serviceIds,dateTime,form){
	console.log("LOAD APPOINTMENT INFO");
	form.find("#date").val(dateTime.format("MM/DD/YYYY"));
	form.find("#time").val(dateTime.format("h:mma"));
	activeForm = form;
	updateInputByUID(form.find("#select_patient"),patientIds);
	updateInputByUID(form.find("#select_practitioner"),practitionerId);
	updateInputByUID(form.find("#select_services"),serviceIds);
	updateAppointment({
		patient: patientIds[0],
		practitioner: practitionerId,
		services: serviceIds,
		datetime: dateTime
	});
}
function moveServiceSelect(id, display = true){
	$(id).find(".section").last().append($("#SelectServices"));
	if (display){$("#SelectServices").fadeIn();}
}
function movePracTimeSelect(id, display = true){
	$(id).find(".section").last().append($("#SelectPractitioner, #SelectDateTime"));
	$("#SelectPractitioner").find('li').removeClass('disabled');
	if (display){$("#SelectPractitioner, #SelectDateTime").fadeIn();}
}
function moveDetails(id, display = true){
	var timeEdit = $("#Details").find('.time').find('.edit');
	$("#Details").insertAfter($(id).find("h2").first());
	$("#Details").find(".value").text("none");
	$("#Details").find(".edit").text('select');
	timeEdit.text('');
	if (display){$("#Details").fadeIn();}
	// $(id).find(".submitForm").addClass('disabled');
}

function goBack(){
	var box = $(this).closest(".selector"), steps = box.children().not(".progressBar"), current = steps.filter(":visible"), prev = current.prev(".step");
	if (prev.length != 0){
		current.fadeOut(200,function(){
			prev.fadeIn(400);
			prev.find(".active").removeClass('active');
			// reset current/prev
			current = steps.filter(":visible"), prev = current.prev(".step");
			if (prev.length == 0){
				box.find('.progressBar').find(".back").fadeOut(400);
			}
		})
	}else{box.find(".back").fadeOut();}
}
function goForward(){
	var box = $(this).closest(".selector"), steps = box.children().not(".progressBar"), current = steps.filter(":visible"), next = current.next(".step");	if (next.length != 0){
		current.fadeOut(200,function(){
			next.fadeIn(400);
			next.find(".active").removeClass('active');
			// reset current/next
			current = steps.filter(":visible"), next = current.next(".step");
			if (current.hasClass("noBack")){
				box.find('.progressBar').find(".back").fadeOut(400);
			}
		})
	}
}
function firstStep(box = null){
	if (typeof box == 'object'){box = $(this).closest(".selector");}
	var steps = box.children('.step'), current = steps.filter(":visible"), first = steps.first();
	if (first.length != 0){
		current.fadeOut(200,function(){
			first.fadeIn(400);
			first.find(".active").removeClass('active');
			// reset current/first
			current = steps.filter(":visible"), first = steps.first();
			if (current.hasClass("noBack")){
				box.find('.progressBar').find(".back").fadeOut(400);
			}
		})
	}	
}
function showAppointmentDetails(){
    var modalId = $(this).data('target');
    activeForm = $(modalId);
    // console.log(activeForm);
    moveServiceSelect(modalId, false);
    movePracTimeSelect(modalId, false);
    moveDetails(modalId);
    $(modalId).find(".selector").hide();
    if (modalId == '#createAppointment'){
        resetEntireAppt();
        updateAppointment();
    }else{
    	updateAppointment({
    		// services: activeForm.find("#select_services").val(),
    		// patient: activeForm.find("#select_patient").val(),
    		// practitioner: activeForm.find("#select_practitioner").val(),
    		date: activeForm.find("#date").val(),
    		time: activeForm.find("#time").val()
    	});
    }
    blurElement($("body"),modalId);
}

function resetEntireAppt(){
	var patient = null;
	resetConnectedModels();
	if (activeForm){
		activeForm.find('input, textarea').val("");
		activeForm.find('.active').removeClass('active');
		activeForm.removeData('dateTime');		
	}
	if (defaultPatientInfo){patient = defaultPatientInfo.id
	}else if (getUids('Patient') != null){patient = Number(getUids('Patient'))
	}

	appointmentDetails = 
	{
		services:null,
		date:null,
		time:null,
		datetime:null,
		patient: patient,
		practitioner: defaultPractitionerInfo ? defaultPractitionerInfo.practitioner_id : null,
	};
}
function appointment(attr){
	return appointmentDetails[attr];
}
function updateDate(date){
    updateAppointment({date:date});
    updateAvailableTimes(activeForm);
    addDetail('date',date);
    activeForm.find("#date").val(date);
    $("#SelectDate").find(".next").removeClass('disabled').click();
}
function updateAvailableTimes(){
    console.log('updateAvailableTimes');
    var bizHours = $("#BizHours").data('schedule'), services = appointmentDetails.services, duration = Number(activeForm.find('#duration').val()), date = appointmentDetails.date, slots = $("#TimeSelector").find("li"), practitioner = appointmentDetails.practitioner;
    if (practitioner){
        // var id = practitioner[0];
        practitionerInfo = practitioners.find(p => {
            return p.practitioner_id === practitioner;
        })
    }
    // console.log(practitioner);
    slots.addClass('disabled');
    var anonEvents = $("#AnonFeed").data('schedule');
    // console.log(practitioners);
    slots.each(function(){
        var slot = $(this), time = slot.data('value'), practitionerEvents, available, momentObj;
        momentObj = moment(date+" "+time, "MM/DD/YYYY HH:mm:ss");
        bizHourCheck = checkSchedule(momentObj, bizHours, services, duration);
		available = availablePractitioners(momentObj, duration, services, true);
        if (bizHourCheck === true){
            slot.removeClass('disabled');
        }
        if (practitioner == null){
        }else{
        	if ($.inArray(practitioner, available) > -1){
        		slot.removeClass('disabled');
        	}else{
        		slot.addClass("disabled");
        	}
        }
    })
    if (usertype == 'patient'){
    	slots.filter('.disabled').hide();
    	slots.not('.disabled').show();
    }
}
function updatePractitioner(){
	console.log("UPDATE PRACTITIONER");
    var name = $(this).text(), list = $("#PractitionerSelector").data('details'), id = list[name];
	updateAppointment({practitioner:id});
	$("#SelectPractitioner").slideFadeOut(800,function(){
		$("#SelectPractitioner").resetActives().css('opacity',1);
		// $("#SelectPractitioner").find('.active').removeClass('active');
	});
}
function randomPractitioner(){
    var form = activeForm;
    var p = randomArrayElement(availablePractitioners(form.data('dateTime'),form.find("#duration").val(),$("#ServiceListModal").data('uidArr')));
    updateInputByUID(form.find("#select_practitioner"),p.practitioner_id);
    addDetail('practitioner',p.name);
}
function updateTime(){
    if ($(this).hasClass('disabled')){return;}
    // console.log('updateTime');
    var form = $("#createAppointment, #editAppointment").filter(":visible"), time = $(this).text().replace(" ",""), date = form.find("#date").val(), services = $("#ServiceListModal").data('uidArr');
    form.find("#time").val(time);
    var dateTime = moment(date + " " + time,'MM/DD/YYYY hh:mma');
    $("#SelectTime").find(".next").removeClass('disabled').click();
    form.data('dateTime',dateTime);
    addDetail('time',time);
    updateAppointment({time:time});
    if (!defaultPractitionerInfo){
		var p = availablePractitioners(dateTime,form.find("#duration").val(), services);
	    $("#PractitionerSelector").find("li").addClass('disabled');
	    $.each(p,function(x,practitioner){
	        $("#PractitionerSelector").find("li").filter(function(){return $(this).text() == practitioner.name}).removeClass('disabled');
	    })
    }
    // slideFadeOut($(this).closest('.selector'));
    $(this).closest('.selector').slideFadeOut(800);
}

function updateAppointment(attrArr = null){
	if (attrArr){
		$.each(attrArr,function(attr,val){
			if (attr == 'services'){
				if (val === null){appointmentDetails.services = null;}
				else if (appointmentDetails.services == null){appointmentDetails.services = [val];}
				else if (typeof val == 'object'){appointmentDetails.services = val;}
				else {appointmentDetails.services.push(val);}
			}else{
				appointmentDetails[attr] = val;
			}
		})
		if (appointmentDetails.date && appointmentDetails.time && !appointmentDetails.datetime){
			appointmentDetails.datetime = moment(appointmentDetails.date + " " + appointmentDetails.time, "M/D/YYYY h:mma");
		}
		if (appointmentDetails.datetime && (!appointmentDetails.date || !appointmentDetails.time)){
			appointmentDetails.date = appointmentDetails.datetime.format("M/D/YYYY");
			appointmentDetails.time = appointmentDetails.datetime.format("h:mma");
		}
	}
	var appt = appointmentDetails;	
	console.log(appt, activeForm);

	if (activeForm){
		if (appt.patient){
			updateInputByUID(activeForm.find("#select_patient"),appt.patient);
			addDetail('patient',activeForm.find("#select_patient").val());
		}
		if (appt.practitioner){
			updateInputByUID(activeForm.find("#select_practitioner"),appt.practitioner);
			addDetail('practitioner',activeForm.find("#select_practitioner").val());
		}
		if (appt.date){
			activeForm.find('#date').val(appt.date);
			addDetail('date',activeForm.find("#date").val());
		}
		if (appt.time){
			activeForm.find('#time').val(appt.time);
			addDetail('time',activeForm.find("#time").val());
		}
		if (appt.services){
			updateInputByUID(activeForm.find("#select_services"),appt.services);
			addDetail('services',activeForm.find("#select_services").val());
			updateAvailableTimes();
		}
	}
	if (appt.practitioner && appt.services){
		$("#Details").find('.date').find('.edit').show();
	}else{
		$("#Details").find('.date').find('.edit').hide();			
	}

	setTimeout(function(){
		if (appt.patient){updatePatientData();}
		if (appt.practitioner){updatePractitionerData();}
	    updateAvailableServices();
	},205)

	var requires = [];
	if (appt.patient === null){requires.push('patient')};
	if (appt.practitioner === null){requires.push('practitioner')};
	if (appt.services === null){requires.push('services')};
	if (appt.datetime === null){requires.push('datetime')};
	
	if (requires.length == 0){
		$("#editAppointment, #createAppointment").find('.submitForm').removeClass('disabled');
		return true;
	}else{
		$("#editAppointment, #createAppointment").find('.submitForm').addClass('disabled');
		return requires;
	}
	// return (requires.length == 0) ? true : requires;
}
function resetConnectedModels(){
	// $("#ServiceListModal").removeData('uidArr');
	// $("#PractitionerListModal").removeData('uidArr');
	$(".connectedModel").removeData('uidArr');
	$(".connectedModelItem").val("");
	// console.log("resetConnectedModels");
}


function checkFormStatus(){
	var formInfo = $(this).closest('.checkFormStatus');
	console.log(usertype);
	if (usertype == 'patient'){
		if (formInfo.data('completed')){
			confirm('Form Completed',"You've already completed this form!",'see your submission','go back');
			setUid('Submission',formInfo.data('completed'));
			var callback = function(){
				unblurAll();
				$("#submissions-index").find(".title").click();					
			}
		}else{
			confirm('Required Form Status','You haven\'t completed this form yet. Would you like to go to the forms page now?','go to forms','not right now');
			setUid('Form',formInfo.data('form_id'));
			var callback = function(){
				unblurAll();
				$("#forms-home").find(".title").click();					
			}
		}
	}else if (usertype == 'practitioner'){
		if (formInfo.data('completed')){
			confirm('Form Completed',"Patient has already submitted this form",'view submission','go back');
			setUid('Submission',formInfo.data('completed'));
			var callback = function(){
				unblurAll();
				$("#submission-index").find(".title").click();					
			}
		}else{
			confirm('Required Form Status','Patient has not completed this form.<h3 class="pink">Send reminder?</h3>','yes send reminder','not right now');
			var callback = function(){
				alert("SEND REMINDER");
			}
		}
	}

	var wait = setInterval(function(){
		// console.log(confirmBool);
		if (confirmBool != undefined){
			if (confirmBool){
				unblurTopMost();
				callback();
			}else{
				clearInterval(wait);
				confirmBool = undefined;
			}
			clearInterval(wait);
			setTimeout(function(){
				confirmBool = undefined;
			},300)
		}
	},100)	
}
function getServiceNames(){
	var services = appointmentDetails.services, names = [];
	$.each(services,function(s,serviceId){
		names.push($("#ServiceDetails").find("li").filter(function(){return $(this).data('id') == serviceId}).text());
	})
	return (names.length == 0) ? null : names;
}
function addService(){
	var service = $("#ServiceDetails").find(".active"), id = service.data().id, dateBtn = $("#ServiceSummary").find(".selectDate");
	// console.log(service.data());
	updateAppointment({services:id});
	if (appointmentDetails.practitioner){dateBtn.show();
	}else{dateBtn.hide();}
	$("#ServiceSummary").find(".summary").text(getServiceNames());
}
function updateDuration(){
	// console.log('updateDuration');
	var form = $("#SelectServices").closest('.modalForm'), services = form.find('#select_services').val().split(", "), durationInput = form.find(".number").find('input'), duration = 0, endDateTime, matches = $("#ServiceDetails").find('li').filter(function(){return $.inArray($(this).text(), services) > -1;}), dateTime = form.data('dateTime'), practitioner = $("#SelectServices").data('practitionerInfo'), serviceIds = $("#ServiceListModal").data('uidArr') == undefined ? null : $("#ServiceListModal").data('uidArr'), practitionerCheck, formVisible = form.is(":visible"), h2 = [], div = [];
	matches.each(function(m,match){
		duration = duration + Number($(this).data('duration'));
		endDateTime = moment(dateTime).add(duration, 'm');
		if (formVisible){
			practitionerCheck = practitioner ? checkSchedule(dateTime, practitioner.schedule, serviceIds, duration) : null;
			bizCheck = checkSchedule(dateTime, $("#BizHours").data('schedule'), null, duration);
			if (bizCheck !== true && practitionerCheck === null){
	            handleCheck(bizCheck,'biz','service',dateTime,endDateTime);
			}else if (practitionerCheck && practitionerCheck !== true){
				handleCheck(practitionerCheck,'practitioner','service',dateTime,endDateTime);
			}
		}
	})
	if (matches.length == 0){duration = "0"}
	durationInput.val(duration);
}
function addDetail(type,value){
    $("#Details").find("."+type).find(".value").text(value);
    $("#Details").find("."+type).find(".edit").show().text("change");
    if (type == 'date'){$("#Details").find(".time").find(".edit").text("select");}
    if (defaultPractitionerInfo){$("#Details").find('.practitioner').find(".edit").hide();}
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
    var targetId = $(this).data('target'), target = $(targetId), openBtn = target.find('.openBtn'), steps = target.children('div').not('.progressBar'), 
    	allDetails = $("#SelectServices, #SelectDateTime, #SelectPractitioner"), inactive = allDetails.not(target);
    activeForm = $("#createAppointment, #editAppointment").filter(":visible");
    if (target.hasClass('modalForm')){
    	if ($(this).data('input') != undefined){
    		activeForm.find($(this).data('input')).addClass('targetInput');
    	}
    	blurTopMost(targetId);
    }else{
	    if (target.is("#SelectServices") && !appointmentDetails.patient){
	        feedback("Select A Patient","You must select a patient to determine the services available");
	        return;
	    }
	    steps.hide();
	    steps.first().fadeIn();
	    if (inactive.filter(":visible").length > 0){
	    	inactive.hide();
	    	target.fadeIn();
	    }else{
		    target.slideFadeIn();
	    }
	    if (($(this).text() == 'change' && !$(this).closest('h3').hasClass('date'))
	    	|| ($(this).closest('h3').hasClass('.time'))){
	    	steps.hide();
	    	steps.last().show();
	    }
	    
	    target.resetActives();
	    target.find('.back').fadeOut();    	
    }
}
function noEventConflict(start, duration, anonEvents){
	if (anonEvents===null){return true;}
	var sameDayEvents = anonEvents.filter(event => moment(event.start).format("MM-DD-YYYY") == start.format("MM-DD-YYYY")), pass = true,
		end = moment(start).add(Number(duration),'m');
	$.each(sameDayEvents,function(x,event){
		if (conflictWithExistingEvent(start, end, event)){pass = false;}
	})
	return pass;
}
function conflictWithExistingEvent(start, end, event){
	var conflict = true, eventStart = moment(event.start), eventEnd = moment(event.end);
	if (start.isSameOrAfter(eventEnd)){
		conflict = false;
	}else if (end.isSameOrBefore(eventStart)){
		conflict = false;
	}
	return conflict;
}
function hideAlreadySelected(progressiveSelector){
	var targetStr = progressiveSelector.data('target'), target = modalOrBody($(this)).find(targetStr), currentVal = target.val(),
		matches = progressiveSelector.find("li").filter(function(){
			return currentVal.includes($(this).text());
		});
	matches.data('show',false);
}
// let's try getting rid of this
	// function checkCount(progressiveSelector){
	// 	var targetStr = progressiveSelector.data('target'), target = modalOrBody(progressiveSelector).find(targetStr), count = (target.val() == "") ? 0 : target.val().split(", ").length, toggleTextBtns = progressiveSelector.find(".button").filter("[data-toggletext]");
	// 	if (count > 0){progressiveSelector.find(".openBtn").removeClass("pinkflash").addClass("pink70");
	// 	}else{progressiveSelector.find(".openBtn").removeClass("pink70").addClass("pinkflash");
	// 	}
	// 	if (count == 0){progressiveSelector.find(".clearBtn, .clearLastBtn, .closeBtn").hide();
	// 	}else{progressiveSelector.find('.clearLastBtn, .closeBtn').show();
	// 	}
	// 	toggleTextBtns.each(function(){
	// 		var toggleText = $(this).data('toggletext'), originalText = $(this).data('originaltext'), togglecount = Number($(this).data('togglecount'));
	// 		if (count >= togglecount){$(this).text(toggleText);
	// 		}else{$(this).text(originalText);
	// 		}
	// 	})
	// 	progressiveSelector.data('count',count);
	// 	return count;
	// }
	// function resetProgressBar(progressiveSelector){
	// 	// console.log('HI');
	// 	var current = progressiveSelector.find(".step:visible"), open = progressiveSelector.find(".open"), back = progressiveSelector.find(".back");
	// 	if (current.length == 0){current = progressiveSelector.find(".step");}
	// 	current.fadeOut(200,function(){
	// 		open.fadeIn(400);
	// 		back.html("");
	// 		checkCount(progressiveSelector);
	// 	})
	// 	progressiveSelector.find(".active").removeClass('active');
	// }
	// function checkCondition(progressiveSelector){
	// 	var conditionEle = (progressiveSelector.data('condition') !== undefined) ? progressiveSelector.data('condition') : null, parent = progressiveSelector.data('parent'), conditionVal;
	// 	if (!conditionEle){conditionVal = null;
	// 		// console.log("condition 1");
	// 	}
	// 	else if (progressiveSelector.closest(parent).find(conditionEle).val() == ''){conditionVal = null;
	// 		// console.log("condition 2");
	// 	}
	// 	else{conditionVal = progressiveSelector.closest(parent).find(conditionEle).val();
	// 		// console.log("condition 3");
	// 	}

	// 	if (!conditionVal){progressiveSelector.find('.openBtn').removeClass('pinkflash').addClass('pink70')}
	// 	else{progressiveSelector.find('.openBtn').removeClass('pink70').addClass('pinkflash')}
	// 	// console.log(conditionVal);
	// 	return conditionVal;
	// }
	// function clearAll(){
	// 	var currentModel = $(this).closest('.modalForm').data('model'), modelToClear = $(this).data('model'), progressiveSelector = $(this).closest(".progressiveSelection"), targetStr = progressiveSelector.data('target'), target = modalOrBody($(this)).find(targetStr), modal = $(".connectedModel").filter(function(){
	// 			return $(this).data('connectedto') == currentModel && $(this).data('model') == modelToClear;
	// 		}), form = $(this).closest('.modalForm');
	// 	target.val("");
	// 	modal.removeData('uidArr');
	// 	updateAvailableServices();
	// 	updateDuration();
	// }
	// function clearLast(){
	// 	var currentModel = $(this).closest('.modalForm').data('model'), modelToClear = $(this).data('model'), progressiveSelector = $(this).closest(".progressiveSelection"), targetStr = progressiveSelector.data('target'), target = modalOrBody($(this)).find(targetStr), modal = $(".connectedModel").filter(function(){
	// 			return $(this).data('connectedto') == currentModel && $(this).data('model') == modelToClear;
	// 		}), form = $(this).closest('.modalForm'), val = target.val(), uidArr = modal.data('uidArr');
	// 	val = val.split(", ");
	// 	val.splice(val.length - 1, 1);
	// 	target.val(val);
	// 	uidArr.splice(uidArr.length -1, 1);
	// 	modal.data('uidArr', uidArr);
	// 	if (usertype == 'patient'){
	// 		removeDetail('services');
	// 		if (val != ""){addDetail('services',val);}
	// 	}
	// 	updateAvailableServices();
	// 	updateDuration();
	// }
	// function firstStep(){
	// 	if ($(this).hasClass("disabled")){
	// 		if ($(this).closest('.progressiveSelection').data('stopmsg') != undefined){
	// 			var msg = $(this).closest('.progressiveSelection').data('stopmsg').split("||");
	// 			$("#Feedback").find(".message").html("<h2>"+msg[0]+"</h2><div>"+msg[1]+"</div>");
	// 			blurTopMost("#Feedback");			
	// 		}
	// 		return false;
	// 	}
	// 	var select = $(this).closest('.progressiveSelection'), open = select.find('.open'), first = select.find(".step").filter("[data-order='1']");
	// 	open.fadeOut(200,function(){
	// 		// first.find(".active").removeClass('active');
	// 		first.fadeIn(400);
	// 	})
	// 	select.find(".progressBar").find(".back").html("<span class='left'></span>cancel");
	// }
	// function nextStep(){
	// 	if ($(this).hasClass('disabled')){return;}
	// 	var select = $(this).closest('.progressiveSelection'), step = select.find(".step").filter(":visible"), num = Number(step.data('order')), 
	// 		header = step.find("h1, h2, h3").text(),
	// 		next = select.find('.step').filter(function(){
	// 			return Number($(this).data('order')) == num + 1;
	// 		}), text = null;
	// 	if ($(this).is('li')){
	// 		text = $(this).text();
	// 	}else if ($(this).hasClass('button') && $(this).data('target') != undefined){
	// 		var id = $(this).data('target'), t = $(id), type = $(this).data('targettype'),
	// 			defaultText = ($(this).data('defaulttext') != undefined);
	// 		if (type == 'input'){
	// 			text = t.val();
	// 		}else if (type == 'ul'){
	// 			text = t.find('.active').text();
	// 		}
	// 		$(this).data('val',text);

	// 		if (defaultText){
	// 			defaultText = $(this).data('defaulttext');
	// 			// console.log(defaultText);
	// 			if (defaultText.includes("%PrevVAL%")){
	// 				console.log(step.prev('.step').find('.next'));
	// 				var prev = step.prev('.step').find('.next').data('val'), str;
	// 				str = defaultText.replace("%PrevVAL%",prev);
	// 				text = str.replace("%VAL%",text);
	// 			}else{
	// 				text = defaultText.replace("%VAL%",text);
	// 			}
	// 		}
	// 		if (moment(text,'MM/DD/YYYY [at] hh:mm a',true).isValid()){
	// 			text = moment(text,'MM-DD-YYYY [at] hh:mm a').format("dddd, MM/DD/YYYY [at] hh:mma");
	// 		}
	// 	}
	// 	select.find(".progressBar").find(".back").html("<span class='left'></span>"+header);
	// 	next.find(".active").removeClass('active');
	// 	next.find("input").val("");
	// 	step.fadeOut(200,function(){
	// 		var nextHead = next.find("h1, h2, h3");
	// 		if (text){nextHead.text(text);}
	// 		next.fadeIn(400);
	// 	})
	// }
	// function previousStep(){
	// 	var select = $(this).closest('.progressiveSelection'), step = select.find(".step").filter(":visible"), num = Number(step.data('order')), 
	// 		previous = select.find('.step').filter(function(){
	// 			return Number($(this).data('order')) == num - 1;
	// 		}), back = select.find(".progressBar").find(".back"), backTxt = back.text(),
	// 		twoBack = select.find('.step').filter(function(){
	// 			return Number($(this).data('order')) == num - 2;
	// 		}), text = null,
	// 		header = (twoBack.length > 0) ? twoBack.find("h3").text() : null;
	// 	if (previous.length == 0){previous = select.find(".open");}
	// 	previous.find(".active").removeClass('active');
	// 	if (!header){
	// 		if (backTxt == 'cancel'){back.html("");}
	// 		else{back.html("<span class='left'></span>cancel");}
	// 	}else{back.html("<span class='left'></span>"+header);}
		
	// 	step.fadeOut(200,function(){
	// 		var prevHead = previous.find("h3");
	// 		if (text){prevHead.text(text);}
	// 		previous.fadeIn(400);
	// 	})
	// }

// UPDATE FORM INFO
	function updatePatientData(){
		console.log('updatePatientData');
		var patient = appointmentDetails.patient, row, patientId;
		if (defaultPatientInfo){
			patientInfo = defaultPatientInfo;
			$("#Details").find('.patient').hide();
		}else{
			row = $("#PatientList").find("tr").filter(function(){return Number($(this).data('uid')) == patient;});
			$.each(row.find(".patientInfo").text().split(','),function(i,info){
	        	var key = info.split(":")[0], val = info.split(":")[1];
	        	if (val == "true"){val = true;}
	        	if (val == "false"){val = false;}
	        	patientInfo[key] = val;
	        })
	        patientInfo['id'] = patient;
	        patientInfo['name'] = trimCellContents(row.find('.name'));
		}
		// $("#SelectServices").data('patientInfo',patientInfo);
		// console.log(patientInfo);
		// addDetail('patient',patientInfo.name);
	}
	function updatePractitionerData(){
		// console.log('updatePractitionerData');
		var practitioner = appointmentDetails.practitioner, practitionerInfo;

		if (practitioner){
			$.each($("#Practitioners").data('schedule'),function(p,pract){
				if (pract.practitioner_id == practitioner){practitionerInfo = pract;}
			})
			if (activeForm){
				var services = ($("#ServiceListModal").data('uidArr') == undefined) ? null : $("#ServiceListModal").data('uidArr'),
					duration = ($.inArray(activeForm.find("#duration").val(),['','0']) > -1) ? null : Number(activeForm.find("#duration").val()), 
					time = activeForm.find("#time").val(), date = activeForm.find("#date").val(), dateTime = moment(date + " " + time, "MM-DD-YYYY hh:mma");
				dateTime = (activeForm.data('dateTime') != undefined) ? activeForm.data('dateTime') : null;
				if (services){
					updateDuration();
				}else if (dateTime){
					var check = checkSchedule(dateTime, practitionerInfo.schedule, null, duration);
					if (check !== true){
						var endTime = (duration) ? moment(dateTime).add(duration,'m') : null;
						setTimeout(function(){
							handleCheck(check,'practitioner','practitioner',dateTime, endTime);
						},500)
					}			
				}
			}
		}else{
			practitionerInfo = null;
			$("#PractitionerListModal").removeData('uidArr');
		}
		if (defaultPractitionerInfo){
			addDetail('practitioner',defaultPractitionerInfo.name);
			$("#SelectServices").find('.selectPractitioner').hide();
		}
		$("#SelectServices").data('practitionerInfo',practitionerInfo);
	}
	function updateAvailableServices(){
		// console.log('updateAvailableServices');
		var services = $("#ServiceDetails").find("li"), isNewPatient, newPatientsOk, newPatientsOnly, addonOk, addonOnly;
		var practitioner = appointmentDetails.practitioner;
		// var practitioner = ($("#PractitionerListModal").data('uidArr') == undefined) ? null : $("#PractitionerListModal").data('uidArr')[0];
		// var patientInfo = $("#SelectServices").data('patientInfo');
		if (patientInfo == undefined){return false;}
		isNewPatient = patientInfo.isNewPatient;
		if (serviceOverride){
			services.data('show',true);
		}else if (isNewPatient){
			if (usertype == 'patient'){
				text = "New Patients are limited to Evaluation and Fascial Release appointments";
			}else if (allowOverride){
				text = "showing New Patient options only <span class='override'>show all</span>";
			}else{
				text = "showing New Patient options only";
			}
			$("#SelectServices").find(".conditionalLabel").html(text);
			services.each(function(){
				newPatientsOk = $(this).data('new_patients_ok');
				$(this).data('show',newPatientsOk);
			})
		}else if (!isNewPatient){
			$("#SelectServices").find(".conditionalLabel").text('');
			services.each(function(){
				newPatientsOnly = $(this).data('new_patients_only');
				$(this).data('show',newPatientsOnly);
			})
		}
		var count = (appointmentDetails.services) ? appointmentDetails.services.length : 0, text = $("#SelectServices").find(".conditionalLabel").text();
		if (count > 0){
			if (usertype == 'patient'){
				text = "Limited selection until Initial Evaluation";
			}else if (allowOverride){
				text = isNewPatient ? "Showing New Patient Add-On services only <span class='override'>show all</span>" : "Showing Add-On services only";
			}else{
				text = isNewPatient ? "Showing New Patient Add-On services only" : "Showing Add-On services only";
			}
			$("#SelectServices").find(".conditionalLabel").html(text);
			services.each(function(){
				addonOk = $(this).data('is_addon');
				if (!addonOk){
					$(this).data('show', false);
				}
			})
		}else{
			services.each(function(){
				addonOnly = $(this).data('add_on_only');
				if (addonOnly){
					$(this).data('show',false);
				}
			})
		}
		var alreadySelected = getServiceNames();
		if (alreadySelected){
			services.filter(function(){
				return alreadySelected.includes($(this).text());
			}).data('show',false);			
		}
		var showMe = services.filter(function(){
				return $(this).data('show')
			}), hideMe = services.not(showMe);
		// console.log(showMe,hideMe);
		showMe.show();
		hideMe.hide();
		updateAvailableCategories();
	}

	function updateAvailableCategories(){
		// console.log('updateAvailableCategories');
		var categories = $("#CategoryDetails").find("li"), services = $("#ServiceDetails").find("li"), categoryId, hasMatchingServices;
		categories.each(function(){
			categoryId = $(this).data('id');
			hasMatchingServices = (services.filter(function(){return $(this).data('show') && $(this).data('service_category_id') == categoryId}).length > 0);
			$(this).data('show',hasMatchingServices);
		});
		var showMe = categories.filter(function(){return $(this).data('show');}), hideMe = categories.not(showMe);
		showMe.show();
		hideMe.hide();
		if (showMe.length == 0){$("#CategoryDetails").find(".conditionalLabel").html("NO ADDITIONAL SERVICES AVAILABLE<br><div class='button xsmall pink removeService'>remove service</div><div class='button xsmall yellow selectDate'>select date</div>")}
	}
	function updateFormInfo(forms){
	    $("#FormInfo").html("");
	    $.each(forms,function(f, form){
	    	// console.log(form.completed);
	    	var c = form.completed ? "complete":"incomplete";
	        $("<div/>",{
	            class: 'checkFormStatus ' + c,
	            data: form,
	            html: "<span class='link'>"+form.name+"</span>",
	            css: {position:'relative'}
	        }).appendTo($("#FormInfo"));
	        if (form.completed){
	            $("#FormInfo").find("div").last().append("<span class='checkmark'>✓</span>");
	        }else{
	            $("#FormInfo").find("div").last().append("<span class='xMark'>x</span>");
	        }
	    });
	    if (forms.length == 0){
	    	$("#FormInfo").append("<div>none</div>");
	    }
	}

//
function selectCategory(){
	// console.log($(this).data());
	var back = $("#SelectServices").find(".progressBar").find(".back");
	back.find('.message').text("category");
	$("#CategoryDetails").fadeOut(200,function(){
		$("#ServiceDetails").fadeIn(400);
		$("#ServiceDetails").find(".active").removeClass('active');
		$("#ServiceDescription").hide();
		back.fadeIn(400);
	});
}
function showServiceDescription(){
	var data = $(this).data(), desc = data.description, price = data.price;
	$("#ServiceDescription").find(".message").html("<h4 class='purple'>"+desc+"<div class='pink'>$"+price+"</div></h4>");
	slideFadeIn($("#ServiceDescription"));
}

function confirmApptDelete(){
	var text, apptTime = $("#ApptDateTime").data('dateTime'), feeIncursion = moment().add(25, 'h').isAfter(apptTime), 
		dateStr = apptTime.format("h:mma [on] dddd MMMM Do, YYYY");
	if (usertype != 'patient'){
		var name = $("#PatientName").text();
		text = "<h3 class='purple'>"+name+"<br>"+dateStr+"</h3><label><input id='DoNotSendEmail' type='checkbox'>do not send cancellation email</label>";
		if (feeIncursion){text+="<br><label><input id='AutoChargeCancelFee' type='checkbox'>auto-charge cancellation fee</label>";}
	}else{
		text = "<div>You are about to cancel your appointment on "+dateStr+".</div>";
		if (feeIncursion){text += "<div class='paddedSmall'>Cancelling now will incur a cancellation fee because it is within 24hrs of your appointment.</div>";}
		text += "<label><input id='DoNotSendEmail' type='checkbox'>do not send cancellation email</label>";
	}
	confirm('Cancelling Appointment',text+'<h3 class="pink">Are you sure?</h3>','yes, cancel it','no, do not cancel');
	var wait = setInterval(function(){
		if (confirmBool != undefined){
			var obj = {};
			if ($("#DoNotSendEmail").length == 1 && $("#DoNotSendEmail").is(":checked")){obj['send_email'] = false;}
			else {obj['send_email'] = true;}
			if (feeIncursion && $("#AutoChargeCancelFee").length == 1){
				obj['late_cancel'] = $("#AutoChargeCancelFee").is(":checked") ? "charge" : 'no_charge';
			}else{obj['late_cancel'] = false;}
			if (confirmBool){
				deleteAppt(obj);
			}
			confirmBool = undefined;
			clearInterval(wait);
		}
	},100)
}
function deleteAppt(obj){
	blurTopMost("#loading");

	$.ajax({
		url:"/delete/Appointment/"+$("#ApptInfo").data('apptId'),
		method:"DELETE",
		data:obj,
		success:function(data){
			if (data == 'checkmark'){
				blurTopMost("#checkmark");
				delayedUnblurAll();
				calendar.refetchEvents();
			}
		}
	})
}

function checkTime(momentObj, begin, end, duration = null){
	var arr = [];

	if (duration){
		duration = Number(duration);
		var moment2 = moment(momentObj).add(duration, 'm');
		if (!(momentObj.isSameOrAfter(begin) && momentObj.isBefore(end))){
			arr.push("start time");
		}
		if (!(moment2.isSameOrAfter(begin) && moment2.isSameOrBefore(end))){
			arr.push("end time");
		}
	}else{
		if (!(momentObj.isSameOrAfter(begin) && momentObj.isBefore(end))){
			arr.push("start time");
		}
	}
	return (arr.length == 0) ? true : arr;
}
function checkSchedule(momentObj, scheduleBlocks, services = null, duration = null){
	if (momentObj == undefined){return true;}
	var day = momentObj.day(), pass = false, notOffered = [], returnObj = {}, serviceInfo, dateInfo;
	// console.log(scheduleBlocks);
	$.each(scheduleBlocks,function(s,schedule){
		var start = moment(momentObj.format("MM-DD-YYYY") + " " + schedule.start_time, "MM-DD-YYYY hh:mma"), 
			end = moment(momentObj.format("MM-DD-YYYY") + " " + schedule.end_time, "MM-DD-YYYY hh:mma"),
			availableServices = (schedule.services != undefined) ? schedule.services : null, timeCheck;

		serviceInfo = {
			services: services,
			availableServices: availableServices
		};
		dateInfo = {
			momentObj: momentObj,
			start: start,
			end: end,
			duration: duration
		};
		var Sunday = (schedule.days.Sunday === true || schedule.days.Sunday === 'true'),
			Monday = (schedule.days.Monday === true || schedule.days.Monday === 'true'),
			Tuesday = (schedule.days.Tuesday === true || schedule.days.Tuesday === 'true'),
			Wednesday = (schedule.days.Wednesday === true || schedule.days.Wednesday === 'true'),
			Thursday = (schedule.days.Thursday === true || schedule.days.Thursday === 'true'),
			Friday = (schedule.days.Friday === true || schedule.days.Friday === 'true'),
			Saturday = (schedule.days.Saturday === true || schedule.days.Saturday === 'true'),
			isDayAvailable = [Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday];
		
		if (isDayAvailable[day]){
			returnObj = createCheckObj(dateInfo, serviceInfo);
			if ($.isEmptyObject(returnObj)){pass = true;}
		}
	})
	if (!pass && $.isEmptyObject(returnObj)){
		returnObj['timeCheck'] = ['no hours today'];
	}
	// console.log(returnObj);
	var r = ($.isEmptyObject(returnObj)) ? true : returnObj;
	return pass ? true : returnObj;
}
function createCheckObj(dateInfo, serviceInfo){
	var notOffered = [], timeCheck, returnObj = {};
	if (serviceInfo.services && serviceInfo.availableServices){
		$.each(serviceInfo.services,function(i,serviceId){
			if ($.inArray(serviceId,serviceInfo.availableServices) == -1){
				notOffered.push(serviceId);
			}
		})
		if (notOffered.length > 0){
			returnObj['notOffered'] = notOffered;
			returnObj['offered'] = serviceInfo.availableServices;
			returnObj['schedule'] = {'start':dateInfo.start,'end':dateInfo.end};
		}
	}
	timeCheck = checkTime(dateInfo.momentObj, dateInfo.start, dateInfo.end, dateInfo.duration);
	// console.log(dateInfo);
	if (timeCheck !== true){
		returnObj['timeCheck'] = timeCheck;
		returnObj['schedule'] = {'start':dateInfo.start,'end':dateInfo.end};
	}
	return returnObj;
}
function availablePractitioners(momentObj, duration, services, idsOnly = false){
	var practitioners = $("#Practitioners").data('schedule'), availablePractitioners = [], availableIds = [];
	$.each(practitioners,function(p,practitioner){
		var schedule = practitioner.schedule, anonEvents = $("#AnonFeed").data('schedule'), 
			pracMatch = anonEvents.filter(event => 
				(event.practitionerId != undefined && event.practitionerId == practitioner.practitioner_id)
				|| (event.block != undefined && event.block == true)
			), scheduleCheck = checkSchedule(momentObj, schedule, services, duration),
			conflictCheck = noEventConflict(momentObj, duration, pracMatch);
			// console.log(schedule,scheduleCheck,conflictCheck);
		if (scheduleCheck === true && conflictCheck){
			availablePractitioners.push(practitioner);
			availableIds.push(practitioner.practitioner_id);
		}
	})
	return idsOnly ? availableIds : availablePractitioners;
}
function applyEventClasses(details,element){
	var extProps = details.extendedProps, type = extProps.type, types = type.split(":").join(" ");
	$(element).addClass(types);
}
function handleCheck(check, type, action, start, end = null){
	var h2 = [], div = [], str = '';
	if (check.schedule != undefined){hours = "are set to " + check.schedule.start.format("h:mma") + "-" + check.schedule.end.format('h:mma') + ".";
	}else{hours = "are not set.";}

	if (type == 'biz'){
        h2.push('Outside Business Hours');
        if (end){
	        div.push("The selected services push the appointment end time to "+end.format("h:mm a")+", which is outside of business hours. On "+ end.format("dddd") + ", business hours "+hours);
        }else{
        	div.push(start.format("dddd, MMMM Do YYYY, h:mm a")+" is outside of business hours. On "+ start.format("dddd") + ", business hours "+hours);
        }
	}else if (type == 'practitioner'){
		var practitioner = $("#SelectServices").data('practitionerInfo'), services = $("#ServiceListModal").data('uidArr');

		if (check.timeCheck != undefined){
			var patient = (usertype == 'patient');
			var h = patient ? practitioner.name +" Unavailable" : 'Unscheduled Practitioner';
			h2.push(h);
			str = "";
			$.each(check.timeCheck, function(t,time){
				if (time.includes('start') && str == ""){
					str = "The start time, "+start.format("h:mm a")+", is outside of "+practitioner.name+"'s schedule. Their hours on " + check.schedule.start.format("dddd") +" are "+ check.schedule.start.format("h:mm a")+"-" + check.schedule.end.format("h:mm a") + ".";
				}else if (time.includes('end') && str == ""){
					if (patient){
						str = "Adding this service would push the appointment outside of " + practitioner.name + "'s availability. Would you like to choose a different date and time to accomodate this new service?";
					}else{
						str = "The end time, "+end.format("h:mm a")+", is outside of "+practitioner.name+"'s schedule. Their hours on " + check.schedule.start.format("dddd") +" are "+  check.schedule.start.format("h:mm a")+"-" + check.schedule.end.format("h:mm a") + ".";	
					}
				}else if (time.includes('end')){
					str = "This appointment time, "+start.format("h:mm a")+" to "+end.format("h:mm a")+", is outside of "+practitioner.name+"'s schedule. Their hours on " + check.schedule.start.format("dddd") +" are "+ check.schedule.start.format("h:mm a")+"-" + check.schedule.end.format("h:mm a") + ".";
				}
			})
			div.push(str);
		}else if (check.notOffered != undefined){
			var i = check.notOffered.length - 1, serviceId = check.notOffered[i], serviceName = services[i], offered;
			offered = commaSeparated(getColumnById("Service",check.offered),true);
			h2.push('Unscheduled Service');
			// console.log(services);
			div.push("'"+ serviceName + "' is not offered by " + practitioner.name + " at this time. On "+start.format('dddd')+"'s from "+check.schedule.start.format("h:mm a")+" to "+check.schedule.end.format("h:mm a")+" they offer only "+offered+".");
		}
	};

	$("#Warn").find(".message").html("");
	str = "";
	$.each(h2,function(i,error){
		str += "<h2>"+error+"</h2><div>"+div[i]+"</div>";
	});
	if (allowOverride){
		str += "<h3 class='pink'>Continue Anyway?</h3>";
	}

	var targetId = allowOverride ? "#Warn" : "#Confirm";
	$(targetId).find(".message").html(str);
    blurTopMost(targetId);

    if (allowOverride){
	    var wait = setInterval(function(){
	        if (confirmBool != undefined){
	            if (confirmBool){
	            	if (action == 'new'){
	            		blurElement($("body"),"#createAppointment");
	            	}else{
		            	unblurTopMost();
	            	}
	            }else{
	            	handleAction(action);
	            }
	            clearInterval(wait);
	            confirmBool = undefined;
	        }
	    },100)    	
    }else{
	    var wait = setInterval(function(){
	        if (confirmBool != undefined){
	            if (confirmBool){
	            	if (action == 'service'){
	            		removeDetail(['date','time']);
	            		$("#Details").closest(".modalForm").find("#time, #date, #DateSelector").val("");
	            	}
	            	unblurTopMost();
	            }else{
	            	handleAction(action);
	            }
	            clearInterval(wait);
	            confirmBool = undefined;
	        }
	    },100)    	
    }
}
function handleAction(action){
   	var form = $("#createAppointment, #editAppointment").filter(":visible");
	if (action == 'service'){
		// console.log('yup');
    	$("#SelectServices").find(".clearLastBtn").click();
	}else if (action == 'time'){
		form.find('#time').click();
	}else if (action == 'practitioner'){
		$("#PractitionerListModal").find(".active").removeClass('.active');
		$("#PractitionerListModal").removeData('uidArr');
		form.find('#select_practitioner').val('');
		$("#SelectServices").removeData('practitionerInfo');
	}
}