function initializeChartNotePage(){
	initializeSelectNewApptBtns();
	initializeConfirmApptForNoteBtn();
	initializeNoApptsBtn();
	initializeApptsWithoutNotes();
	initializeAvailableChartForm();
	initializeSubmissions();
	initializeNoteAutoSave();
	if ($("#CurrentAppt").length == 0) $(".selectNewAppt").click();
	$('#ChartFormsModalBtn').on('click',function(){
		updateActiveFormList();
		blurTopMost('#ChartFormsModal');
	})
	$("#SignChartBtn").on('click',signChart);
	loadNoteAutoSaveData();
	if ($("#ChartSignature").data('signature') != undefined) disableChartSignature();
}
function initializeNoteAutoSave(){
	if ($("#ChartNote").hasClass('signed')) return false;

	var textfields = filterByData($('#ChartNote').find("input, textarea"),'autoSaveTrigger',false),
		listItems = filterByData($('#ChartNote').find('li'),'autoSaveTrigger',false),
		numbers = filterByData($('#ChartNote').find('.number'),'autoSaveTrigger',false),
		dropdowns = filterByData($('#ChartNote').find('.dropdown'),'autoSaveTrigger',false),
		scale = filterByData($('#ChartNote').find('.scale'),'autoSaveTrigger',false),
		dates = filterByData($('#ChartNote').find('.date'),'autoSaveTrigger',false),
		times = filterByData($('#ChartNote').find('.timePick'),'autoSaveTrigger',false),
		imageClicks = filterByData($('#ChartNote').find('.imageClick'),'autoSaveTrigger',false),
		sigs = filterByData($('#ChartNote').find('.signature'),'autoSaveTrigger',false);
	textfields.on('keyup',autoSaveNote);
	listItems.on('click',autoSaveNote);
	numbers.find('.up, .down').on('mouseup touchend',autoSaveNote);
	dropdowns.find('select').on('change',autoSaveNote);
	scale.find('input').on('mouseup touchend',autoSaveNote);
	dates.find('input').on('focusout',autoSaveNote);
	times.on('change',autoSaveNote);
	imageClicks.on('mouseup touchend',autoSaveNote);
	sigs.on('mouseup touchend',autoSaveNote);
	textfields.add(listItems).add(numbers).add(dropdowns).add(scale).add(dates).add(times).add(imageClicks).add(sigs).data('autoSaveTrigger',true);
}
function initializeSubmissions(){
	var submissions = filterByData('.chartNoteTitle','type','submission');
	submissions = filterByData(submissions,'deactivated',false);
	// console.log(submissions);
	submissions.each(function(){
		var target = $(this).data('target'), response = filterByData('.responses','target',target), form = $("#"+target);
		fillForm(response.data('json'),form);
		disableForm(form);
	})
	submissions.data('deactivated',true);
}
function initializeSelectNewApptBtns(){
	var selectBtn = filterUninitialized('.selectNewAppt');
	selectBtn.on('click',showOtherAppts);
	selectBtn.data('initialized',true);
}
function initializeAvailableChartForm(){
	var btns = filterUninitialized('.availableChartForm');
	btns.on('click',function(ev){
		var title = $(this).text(), formid = $(this).data('formid');
		var active = $(this).closest('#LoadedForms').length == 1;
		if (active){
			var target = $(ev.target);
			if (target.is(".removeForm")){
				$(this).addClass('removeTarget');
				confirm("Removing Form", "Any information you have entered will be lost.<h3 class='pink'>Remove Form and Data?</h3>", "yes, remove", 'no, do not remove', null, removeLoadedForm)				
			}else if (target.is(".up, .down")){

			}else{
				// var formName = $(this).find('.label').text(), scrollTarget = $("h2").filter(function(){return $(this).text() == formName});
				// $.scrollTo(scrollTarget);
			}
		}else{
			blurTopMost('#loading');
			$("<h2/>",
				{
					id:'LoadingChartForm',
					class:'chartNoteTitle purple marginSmall topOnly hideTarget',
					html:"Loading "+title+"<div style='position:absolute;left:0;top:0;width:100%;height:2.5em;background-color: var(--white50);'><div class='lds-ring dark' style='padding:0;'><div></div><div></div><div></div><div></div></div></div>"
				}
			).insertBefore("#ChartFormsModalBtn");
			$.ajax({
				url:"/ChartNote/load-form/"+formid,
				method:'GET',
				success:function(data){
					$("#LoadingChartForm").replaceWith(data);
					initializeNewForms();
					updateActiveFormList();
					initializeNoteAutoSave();
					unblurTopMost();
				}
			})
		}
	});
	btns.data('initialized',true);
}
function initializeApptsWithoutNotes(){
	var appts = filterUninitialized('.appt');
	appts.on('click',selectThisAppt);
	appts.data('initialized');
}
function initializeConfirmApptForNoteBtn(){
	var btn = filterUninitialized($('#ConfirmApptForNote').find('.confirmApptBtn'));
	btn.on('click',confirmApptForNote);
	btn.data('initialized',true);
}
function initializeNoApptsBtn(){
	var btn = filterUninitialized("#NoEligibleApptsBtn");
	btn.on('click',function(){
		confirm('No Eligible Appointments',"All of your chart notes from the last 30 days are already signed.",'create new appointment','dismiss',null,function(){clickTab("appointments-index");unblurAll();})
	});
	btn.data('initalized',true);
}
function editNoteFromOptionsNav(){
	blurTopMost("#loading");
	var uid = $("#CurrentChartNote").data('uid');
	$.ajax({
		url:'/ChartNote/'+uid+'/edit',
		method: "GET",
		success: function(data){
			$("<div/>",{id:"ChartNote",class:'modalForm',html:"<h1 class='purple'>Edit Chart Note</h1>"+data}).appendTo('body');
			blurTopMost('#ChartNote');
			$("<div/>",{text:'dismiss',class:'button cancel'}).insertAfter($("#SignChartBtn"));
			initializeNewForms();
			initializeChartNotePage();
		}
	})
}
function viewNoteFromOptionsNav(){
	blurTopMost("#loading");
	var uid = $("#CurrentChartNote").data('uid');
	$.ajax({
		url:'/ChartNote/'+uid+'/view',
		method: "GET",
		success: function(data){
			$("<div/>",{id:"ChartNote",class:'modalForm signed',html:data}).appendTo('body');
			blurTopMost('#ChartNote');
			initializeNewForms();
			initializeChartNotePage();
		}
	})
}
function disableChartSignature(){
	var sig = $("#ChartSignature");
	fillAnswer(sig, sig.data('signature'));
	sig.find('.signature').jSignature('disable');
	sig.find('.clear').remove();
}
function loadNoteAutoSaveData(){
	var submissions = $("#ApptInfo").data('autosave');
	if (submissions == '""' || submissions == undefined || $("#ChartNote").length == 0) return false;
	$.each(submissions,function(formId,submission){
		var form = $('form').filter("[data-uid='"+formId+"']");
		fillForm(submission,form);			
	});
	setTimeout(function(){
		clearTimeout(autosaveNoteTimer);
		autosaveNoteTimer = null;
	},400)
}
function removeLoadedForm(){
	console.log("remove");
	unblurTopMost();
	var btn = $(".removeTarget"), match = $(".chartNoteTitle").filter(function(){return $(this).data('formname') == btn.find('.label').text();}), formWrap = $("#"+match.data('target'));
	console.log(btn,match,formWrap);
	btn.find('.removeForm, .UpDown').remove();
	btn.appendTo("#AvailableChartingForms").removeClass('removeTarget');
	match.add(formWrap).slideFadeOut(500,function(){
		match.add(formWrap).remove();updateActiveFormList();
	});
}
var autosaveNoteTimer = null, autosaveNoteXHR = null;
function autoSaveNote(){
	console.log('start timer');
	if (autosaveNoteTimer){
		clearTimeout(autosaveNoteTimer);
	}
	autosaveNoteTimer = setTimeout(function(){
		var formsObj = createChartFormsObj(true);
		var postObj = {
			submissions: formsObj,
			appointment_id: $("#ApptInfo").data('id')
		};
		autosaveNoteXHR = $.ajax({
			url:'/ChartNote/'+$("#ApptInfo").data('noteid')+'/autosave',
			method: 'POST',
			data: postObj,
			success:function(data){
				console.log("saved " + Date());
				$("#ApptInfo").data('noteid',getUids('ChartNote'));
				autosaveNoteXHR = null;
				showAutosaveTime();
			}
		})
	},5000);
}
function signChart(){
	var formsObj = createChartFormsObj(), pass = true;
	if (!formsObj) return false;
	var sig = $("#PractitionerSignature");
	sig.data('required',true);
	if (!validateItem(sig,'signature')){return false;}
	clearTimeout(autosaveNoteTimer);
	autosaveNoteTimer = null;
	if (autosaveNoteXHR) {
		console.log(autosaveNoteXHR)
		setTimeout(signChart,300);
		// autosaveNoteXHR.abort();
	}
	var postObj = {
		submissions: formsObj,
		signature: justResponse(sig,false,'signature'),
		appointment_id: $("#ApptInfo").data('id')
	}
	blurTopMost('#loading');
	$.ajax({
		url:'/ChartNote/'+$("#ApptInfo").data('noteid')+'/sign',
		method: 'POST',
		data: postObj,
		success:function(data){
			console.log(data);
			blurTopMost("#checkmark",400,function(){
				delayedUnblurAll();
				clickTab("#chart-notes-index");
			});
		}
	})
	console.log(postObj);
}
function createChartFormsObj(autosave = false){
	var formHeader = $(".chartNoteTitle").filter('[data-type="form"]'), forms = [], submissionHeader = $(".chartNoteTitle").filter('[data-type="missingSubmission"]'), missingSubmissions = [];
	formHeader.each(function(h,header){
		var name = $(header).data('target');
		forms.push($("#"+name));
	});
	submissionHeader.each(function(h,header){
		var name = $(header).data('target');
		missingSubmissions.push($("#"+name));
	});
	var pass = true, allFormsObj = {}, allSubmissionsObj = {};
	$.each(missingSubmissions,function(f,form){
		var header = $(".chartNoteTitle").filter("[data-target='"+form.attr('id')+"']");
		if (!form.is(":visible") && !autosave){
			header.click();
		}
		var formSubmissionObj = checkForm(form, autosave, autosave);

		if (!formSubmissionObj){
			pass = false;
			return false;
		}else{
			allFormsObj[form.data('uid')] = formSubmissionObj;
		}
	})
	if (!pass){return false;}
	$.each(forms,function(f,form){
		var header = $(".chartNoteTitle").filter("[data-target='"+form.attr('id')+"']");
		if (!form.is(":visible") && !autosave){
			header.click();
		}
		var formSubmissionObj = checkForm(form, autosave, autosave);
		if (!formSubmissionObj){
			pass = false;
			return false;
		}else{
			allFormsObj[form.data('uid')] = formSubmissionObj;
		}
	})
	return pass ? allFormsObj : false;
}
function selectThisAppt(){
	if ($(this).hasClass('active') || $(this).closest("#ApptLegend").length == 1){
		return;
	}else{
		$(".appt").removeClass('active');
		$(this).addClass('active');		
		$("#ApptSummary").html($(this).html().split("<br>").join(", ") + "<br>" + $(this).data('services'));
		$('.confirmApptBtn').removeClass('disabled');
		if ($(this).hasClass('hasNote')){
			$(".confirmApptBtn").text('finish note');
		}else if ($(this).hasClass('noNote')){
			$(".confirmApptBtn").text('start note');
		}
	}
}
function showOtherAppts(){
	$(this).slideFadeOut();
	$("#ApptsWithoutNotes, #UnsignedNotes, #ApptLegend").slideFadeIn();
	// $("#UnsignedNotes").slideFadeIn();
	$("#CurrentAppt").slideFadeOut();
	$('.confirmApptBtn').addClass('disabled');
}
function confirmApptForNote(){
	if ($(this).hasClass('disabled')) {
		feedback('No Appointment Selected','Pick an appointment first, silly.');
		return false;
	}
	var active = $(".appt, .unsignedNote").filter('.active'), apptId = (active.length == 0) ? getUids('Appointment') : active.data('uid');
	$("#ConfirmApptForNote").slideFadeOut();
	LoadingContent("#ChartNote","/appointment/"+apptId+"/edit-chart-note",updateActiveFormList);
}
function updateActiveFormList(){
	$(".chartNoteTitle").filter('[data-type="form"]').each(function(){
		var formName = $(this).data('formname'), match = $(".availableChartForm").filter(function(){
			return $(this).text().includes(formName);
		}), alreadyActive = match.closest('#LoadedForms').length == 1;
		if (!alreadyActive) {match.append('<div class="UpDown"><div class="up"></div> <div class="down"></div></div><span class="removeForm flexbox">x</span>').addClass('flexbox rightSided');
		}
		match.appendTo("#LoadedForms");
	})
	if ($("#AvailableChartingForms").children().length == 0){
		$("<div/>",{id:'NoMoreForms',text:'no more available forms'}).appendTo("#AvailableChartingForms");
	}else{$("#NoMoreForms").remove();}
}