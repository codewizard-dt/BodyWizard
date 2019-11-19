var action = undefined;
$(document).ready(function(){
	$("#createAppointment, #editAppointment").find('.submitForm').text("save appointment");
	$("#EditApptBtn").on('click',function(){
		blurElement($("body"),"#editAppointment");
	})
	$("#editAppointment").find("h1").first().text("Edit Appointment");
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

    if (defaultPatientInfo != undefined){
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

	$("#SelectServices").find(".clearBtn").hide();
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
	checkCount($("#SelectServices"));
    
    updatePatientData();
    updatePractitionerData();
	$("#PatientListModal").find(".selectData").on('click',updatePatientData);
	$("#PractitionerListModal").find(".selectData").on('click',updatePractitionerData);

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
	$("#ServiceDescription").on('click','.submit',addService);
	$("#CategoryDetails, #ServiceDetails").on('click','li',nextStep);
	$(".progressiveSelection").on('click','.openBtn',firstStep);
	$(".progressiveSelection").on('click','.clearBtn',clearAll);
	$(".progressiveSelection").on('click','.clearLastBtn',clearLast);
	$(".progressiveSelection").on('click','.back',previousStep);
	$(".progressiveSelection").on('click','.forward',nextStep);
}
function loadApptInfo(patientIds,practitionerId,serviceIds,dateTime,form){
	form.find("#date").val(dateTime.format("MM/DD/YYYY"));
	form.find("#time").val(dateTime.format("hh:mma"));
	updateInputByUID(form.find("#select_patient"),patientIds);
	updateInputByUID(form.find("#select_practitioner"),practitionerId);
	updateInputByUID(form.find("#select_services"),serviceIds);
	updatePatientData();
	// return;
	updateDuration();
	resetProgressBar($("#SelectServices"));
	updateAvailableServices();
	hideAlreadySelected($("#SelectServices"));
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
// function moveWhichFirst(id, display = true){
// 	$(id).find(".section").last().append($("#WhichFirst"));
// 	if (display){$("#WhichFirst").fadeIn();}
// }
function moveDetails(id, display = true){
	var timeEdit = $("#Details").find('.time').find('.edit');
	$("#Details").insertAfter($(id).find("h2").first());
	$("#Details").find(".value").text("none");
	$("#Details").find(".edit").text('select');
	timeEdit.text('');
	if (display){$("#Details").fadeIn();}
	$(id).find(".submitForm").addClass('disabled');
}
function updatePatientData(){
	var patient = checkCondition($("#SelectServices")), row, patientId, patientInfo = {}, isNewPatient, uidList = JSON.parse($("#uidList").text());
	// console.log(uidList);
    if (patient == null && (uidList == null || uidList.Patient == undefined)){
    	// console.log("patient 1");
        $("#SelectServices").find(".openBtn").addClass("disabled");
    }else if (defaultPatientInfo != undefined){
    	// console.log('patient 2');
        $("#SelectServices").find(".openBtn").removeClass("disabled");
        $("#SelectServices").data('patientInfo',defaultPatientInfo);
        $("#SelectServices").closest('.modalForm').find("#select_patient").val(defaultPatientInfo.name);
    }
    else{
    	// console.log("patient 3");
    	patientId = ($("#PatientListModal").data('uidArr') == undefined) ? $("#ApptInfo").data('patientIds')[0] : $("#PatientListModal").data('uidArr')[0];
        $("#SelectServices").find(".openBtn").removeClass("disabled");
        row = $("#PatientList").find("tr").filter(function(){return $(this).data('uid') == patientId;});
        $.each(row.find(".patientInfo").text().split(','),function(i,info){
        	var key = info.split(":")[0], val = info.split(":")[1];
        	if (val == "true"){val = true;}
        	if (val == "false"){val = false;}
        	patientInfo[key] = val;
        })
        // console.log(patientInfo);
        $("#SelectServices").data('patientInfo',patientInfo);
    }
    updateAvailableServices($("#SelectServices"));
}
function updatePractitionerData(){
	var practitioner = ($("#PractitionerListModal").data('uidArr') == undefined) ? null : $("#PractitionerListModal").data('uidArr')[0], practitionerInfo;
	if (practitioner){
		$.each($("#Practitioners").data('schedule'),function(p,pract){
			if (pract.practitioner_id == practitioner){practitionerInfo = pract;}
		})
		var form = $("#SelectServices").closest('.modalForm');
		if (form.is(":visible")){
			var services = ($("#ServiceListModal").data('uidArr') == undefined) ? null : $("#ServiceListModal").data('uidArr'),
				duration = ($.inArray(form.find("#duration").val(),['','0']) > -1) ? null : Number(form.find("#duration").val()), 
				time = form.find("#time").val(), date = form.find("#date").val(), dateTime = moment(date + " " + time, "MM-DD-YYYY hh:mma");
			dateTime = (form.data('dateTime') != undefined) ? form.data('dateTime') : null;
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
	$("#SelectServices").data('practitionerInfo',practitionerInfo);
}
function resetConnectedModels(){
	// $("#ServiceListModal").removeData('uidArr');
	// $("#PractitionerListModal").removeData('uidArr');
	$(".connectedModel").removeData('uidArr');
	// console.log("reset");
}
function checkCondition(progressiveSelector){
	var conditionEle = (progressiveSelector.data('condition') !== undefined) ? progressiveSelector.data('condition') : null, parent = progressiveSelector.data('parent'), conditionVal;
	if (!conditionEle){conditionVal = null;
		// console.log("condition 1");
	}
	else if (progressiveSelector.closest(parent).find(conditionEle).val() == ''){conditionVal = null;
		// console.log("condition 2");
	}
	else{conditionVal = progressiveSelector.closest(parent).find(conditionEle).val();
		// console.log("condition 3");
	}

	if (!conditionVal){progressiveSelector.find('.openBtn').removeClass('pinkflash').addClass('pink70')}
	else{progressiveSelector.find('.openBtn').removeClass('pink70').addClass('pinkflash')}
	// console.log(conditionVal);
	return conditionVal;
}
function addService(){
	var name = $("#ServiceDescription").find("h3").text(), details = $("#ServiceDetails").find('li').filter(function(){
		return $(this).data('name') == name;
	}).data(), form = $(this).closest('.modalForm'), serviceItem = form.find('.item').filter(function(){
		return $(this).find(".q").text().includes("Selected Service(s)");
	}), row = $("#ServiceListModal").find("tr").filter(function(){
		return $(this).data('uid') == details.id;
	}), selectBtn = $("#ServiceListModal").find(".selectData"), currentVal = serviceItem.find("textarea").val();

	serviceItem.find("input, textarea").addClass('targetInput');
	if (currentVal != ""){selectRowsByName(currentVal, $("#ServiceList"));}
	row.click();
	selectBtn.click();

		if (usertype == 'patient'){
			addDetail('services', serviceItem.find("textarea").val());
		}
	updateDuration();
	resetProgressBar($("#SelectServices"));
	// resetOverride();
	updateAvailableServices();
	hideAlreadySelected($("#SelectServices"));
}
function updateDuration(){
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
function serviceFitsSched(momentObj, duration, scheduleBlocks){
}
function durationFitsSched(momentObj, duration, scheduleBlocks, services = null){
	duration = Number(duration);
	var endTime = moment(momentObj).add(duration, 'm');
	if (services){
		return checkSchedule(endTime, scheduleBlocks, services);
	}else{
		return checkSchedule(endTime, scheduleBlocks);
	}
}
function noEventConflict(start, duration, anonEvents){
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
function resetProgressBar(progressiveSelector){
	// console.log('HI');
	var current = progressiveSelector.find(".step:visible"), open = progressiveSelector.find(".open"), back = progressiveSelector.find(".back");
	if (current.length == 0){current = progressiveSelector.find(".step");}
	current.fadeOut(200,function(){
		open.fadeIn(400);
		back.html("");
		checkCount(progressiveSelector);
	})
}
function checkCount(progressiveSelector){
	var targetStr = progressiveSelector.data('target'), target = modalOrBody(progressiveSelector).find(targetStr), count = (target.val() == "") ? 0 : target.val().split(", ").length, toggleTextBtns = progressiveSelector.find(".button").filter("[data-toggletext]");
	if (count > 0){
		progressiveSelector.find(".openBtn").removeClass("pinkflash").addClass("pink70");
	}else{
		progressiveSelector.find(".openBtn").removeClass("pink70").addClass("pinkflash");
	}
	if (count == 0){
		progressiveSelector.find(".clearBtn, .clearLastBtn, .closeBtn").hide();
	}else{
		progressiveSelector.find('.clearLastBtn, .closeBtn').show();
	}
	toggleTextBtns.each(function(){
		var toggleText = $(this).data('toggletext'), originalText = $(this).data('originaltext'), togglecount = Number($(this).data('togglecount'));
		if (count >= togglecount){
			$(this).text(toggleText);
		}else{
			$(this).text(originalText);
		}
	})
	progressiveSelector.data('count',count);
	return count;
}
function updateAvailableServices(){
	var services = $("#ServiceDetails").find("li"), patientInfo = $("#SelectServices").data('patientInfo'), isNewPatient, newPatientsOk, newPatientsOnly, addonOk, addonOnly, practitioner = ($("#PractitionerListModal").data('uidArr') == undefined) ? null : $("#PractitionerListModal").data('uidArr')[0];
	if (patientInfo == undefined){return false;}
	isNewPatient = patientInfo.isNewPatient;
	if (serviceOverride){
		services.data('show',true);
	}else if (isNewPatient){
		if (usertype == 'patient'){
			text = "New Patients: choose an evaluation appointment";
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
	var count = checkCount($("#SelectServices")), text = $("#SelectServices").find(".conditionalLabel").text();
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
	var showMe = services.filter(function(){return $(this).data('show');}), hideMe = services.not(showMe);
	showMe.show();
	hideMe.hide();
	updateAvailableCategories();
}
function updateAvailableCategories(){
	var categories = $("#CategoryDetails").find("li"), services = $("#ServiceDetails").find("li"), categoryId, hasMatchingServices;
	categories.each(function(){
		categoryId = $(this).data('id');
		hasMatchingServices = (services.filter(function(){return $(this).data('show') && $(this).data('service_category_id') == categoryId}).length > 0);
		$(this).data('show',hasMatchingServices);
	});
	var showMe = categories.filter(function(){return $(this).data('show');}), hideMe = categories.not(showMe);
	showMe.show();
	hideMe.hide();
}
function clearAll(){
	var currentModel = $(this).closest('.modalForm').data('model'), modelToClear = $(this).data('model'), progressiveSelector = $(this).closest(".progressiveSelection"), targetStr = progressiveSelector.data('target'), target = modalOrBody($(this)).find(targetStr), modal = $(".connectedModel").filter(function(){
			return $(this).data('connectedto') == currentModel && $(this).data('model') == modelToClear;
		}), form = $(this).closest('.modalForm');
	target.val("");
	modal.removeData('uidArr');
	updateAvailableServices();
	updateDuration();
}
function clearLast(){
	var currentModel = $(this).closest('.modalForm').data('model'), modelToClear = $(this).data('model'), progressiveSelector = $(this).closest(".progressiveSelection"), targetStr = progressiveSelector.data('target'), target = modalOrBody($(this)).find(targetStr), modal = $(".connectedModel").filter(function(){
			return $(this).data('connectedto') == currentModel && $(this).data('model') == modelToClear;
		}), form = $(this).closest('.modalForm'), val = target.val(), uidArr = modal.data('uidArr');
	val = val.split(", ");
	val.splice(val.length - 1, 1);
	target.val(val);
	uidArr.splice(uidArr.length -1, 1);
	modal.data('uidArr', uidArr);
	if (usertype == 'patient'){
		removeDetail('services');
		if (val != ""){addDetail('services',val);}
	}
	updateAvailableServices();
	updateDuration();
}
function firstStep(){
	if ($(this).hasClass("disabled")){
		if ($(this).closest('.progressiveSelection').data('stopmsg') != undefined){
			var msg = $(this).closest('.progressiveSelection').data('stopmsg').split("||");
			$("#Feedback").find(".message").html("<h2>"+msg[0]+"</h2><div>"+msg[1]+"</div>");
			blurTopMost("#Feedback");			
		}
		return false;
	}
	var select = $(this).closest('.progressiveSelection'), open = select.find('.open'), first = select.find(".step").filter("[data-order='1']");
	open.fadeOut(200,function(){
		// first.find(".active").removeClass('active');
		first.fadeIn(400);
	})
	select.find(".progressBar").find(".back").html("<span class='left'></span>cancel");
}
function nextStep(){
	if ($(this).hasClass('disabled')){return;}
	var select = $(this).closest('.progressiveSelection'), step = select.find(".step").filter(":visible"), num = Number(step.data('order')), 
		header = step.find("h1, h2, h3").text(),
		next = select.find('.step').filter(function(){
			return Number($(this).data('order')) == num + 1;
		}), text = null;
	if ($(this).is('li')){
		text = $(this).text();
	}else if ($(this).hasClass('button') && $(this).data('target') != undefined){
		var id = $(this).data('target'), t = $(id), type = $(this).data('targettype'),
			defaultText = ($(this).data('defaulttext') != undefined);
		if (type == 'input'){
			text = t.val();
		}else if (type == 'ul'){
			text = t.find('.active').text();
		}
		$(this).data('val',text);

		if (defaultText){
			defaultText = $(this).data('defaulttext');
			// console.log(defaultText);
			if (defaultText.includes("%PrevVAL%")){
				console.log(step.prev('.step').find('.next'));
				var prev = step.prev('.step').find('.next').data('val'), str;
				str = defaultText.replace("%PrevVAL%",prev);
				text = str.replace("%VAL%",text);
			}else{
				text = defaultText.replace("%VAL%",text);
			}
		}
		if (moment(text,'MM/DD/YYYY [at] hh:mm a',true).isValid()){
			text = moment(text,'MM-DD-YYYY [at] hh:mm a').format("dddd, MM/DD/YYYY [at] hh:mma");
		}
	}
	select.find(".progressBar").find(".back").html("<span class='left'></span>"+header);
	next.find(".active").removeClass('active');
	next.find("input").val("");
	step.fadeOut(200,function(){
		var nextHead = next.find("h1, h2, h3");
		if (text){nextHead.text(text);}
		next.fadeIn(400);
	})
}
function previousStep(){
	var select = $(this).closest('.progressiveSelection'), step = select.find(".step").filter(":visible"), num = Number(step.data('order')), 
		previous = select.find('.step').filter(function(){
			return Number($(this).data('order')) == num - 1;
		}), back = select.find(".progressBar").find(".back"), backTxt = back.text(),
		twoBack = select.find('.step').filter(function(){
			return Number($(this).data('order')) == num - 2;
		}), text = null,
		header = (twoBack.length > 0) ? twoBack.find("h3").text() : null;
	if (previous.length == 0){previous = select.find(".open");}
	previous.find(".active").removeClass('active');
	if (!header){
		if (backTxt == 'cancel'){back.html("");}
		else{back.html("<span class='left'></span>cancel");}
	}else{back.html("<span class='left'></span>"+header);}
	
	step.fadeOut(200,function(){
		var prevHead = previous.find("h3");
		if (text){prevHead.text(text);}
		previous.fadeIn(400);
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
		
		var isDayAvailable = [schedule.days.Sunday, schedule.days.Monday, schedule.days.Tuesday, schedule.days.Wednesday, schedule.days.Thursday, schedule.days.Friday, schedule.days.Saturday];

		if (isDayAvailable[day]){
			returnObj = createCheckObj(dateInfo, serviceInfo);
			pass = true;
		}
	})
	if (!pass && $.isEmptyObject(returnObj)){
		returnObj['timeCheck'] = ['no hours today'];
	}
	var r = ($.isEmptyObject(returnObj)) ? true : returnObj;
	return r;
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
	if (timeCheck !== true){
		returnObj['timeCheck'] = timeCheck;
		returnObj['schedule'] = {'start':dateInfo.start,'end':dateInfo.end};
	}
	return returnObj;
}
function availablePractitioners(momentObj, duration, services){
	var practitioners = $("#Practitioners").data('schedule'), schedule, availablePractitioners = [];
	$.each(practitioners,function(p,practitioner){
		schedule = practitioner.schedule;
		if (checkSchedule(momentObj, schedule, services, duration) === true){
			availablePractitioners.push(practitioner);
		}
	})
	return availablePractitioners;
}
function applyEventClasses(details,element){
	var extProps = details.extendedProps, type = extProps.type, types = type.split(":").join(" ");
	$(element).addClass(types);
}
function handleCheck(check, type, action, start, end = null){
	// console.log(check);
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
			div.push("'"+ serviceName + "' is not offered by " + practitioner.name + " at this time. On "+dateTime.format('dddd')+"'s from "+check.schedule.start.format("h:mm a")+" to "+check.schedule.end.format("h:mm a")+" they offer only "+offered+".");
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
	            	unblurTopMost();
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
		console.log('yup');
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