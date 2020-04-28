var chartnote = {
	current: {
		id: null,
		submissions: null,
		notes: null,
		appointment_id: null,
		signature: null
	},
	autosaveXHR: null,
	forms: {
		add: function(form){
			blurTopMost('#loading');
			$("<h2/>",
				{
					id:'LoadingChartForm',
					class:'chartNoteTitle purple marginSmall topOnly hideTarget',
					html:"Loading "+form.title+"<div style='position:absolute;left:0;top:0;width:100%;height:2.5em;background-color: var(--white50);'><div class='lds-ring dark' style='padding:0;'><div></div><div></div><div></div><div></div></div></div>"
				}
			).insertBefore("#ChartFormsModalBtn");
			$.ajax({
				url:"/ChartNote/load-form/"+form.formid,
				method:'GET',
				success:function(data){
					$("#LoadingChartForm").replaceWith(data);
					initializeNewForms();
					// updateActiveFormList();
					chartnote.forms.updateActiveList();
					// initializeChartNoteAutoSave();
					chartnote.initialize.all();
					unblurTopMost();
				}
			})			
		},
		remove: function(){
			unblurTopMost();
			var btn = $(".removeTarget"), match = $(".chartNoteTitle").filter(function(){return $(this).data('formname') == btn.find('.label').text();}), formWrap = $("#"+match.data('target'));
			// console.log(btn,match,formWrap);
			btn.find('.removeForm, .UpDown').remove();
			btn.appendTo("#AvailableChartingForms").removeClass('removeTarget');
			match.add(formWrap).slideFadeOut(500,function(){
				match.add(formWrap).remove();
				chartnote.forms.updateActiveList();
			});
		},
		updateActiveList: function(openModal = false){
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
			if (openModal) blurTopMost('#ChartFormsModal');
		},
		retrieve: function(form, autosave = false){
			if (!form.is(":visible") && !autosave){
				$(".chartNoteTitle").filter("[data-target='"+form.attr('id')+"']").click();
			}
			var formObj = forms.retrieve(form, autosave, autosave);
			if (!formObj) return false;
			if (!chartnote.current.submissions) chartnote.current.submissions = {};
			chartnote.current.submissions[form.data('uid')] = formObj;
			return true;
		},
		autosave: function(ev){
			var form = $(ev.target).closest('form');
			setTimeout(function(){
				chartnote.forms.retrieve(form, true);
			},50)
			setTimeout(autosave.trigger, 300);
		}
	},
	autosave: function(){
		chartnote.autosaveXHR = $.ajax({
			url:'/ChartNote/'+$("#ApptInfo").data('noteid')+'/autosave',
			method: 'POST',
			data: chartnote.current,
			success:function(data){
				$("#ApptInfo").data('noteid',getUids('ChartNote'));
				chartnote.autosaveXHR = null;
				autosave.success();
			}
		})
	},
	sign: {
		check: function(){
			if ($(this).hasClass('disabled')) return;
			var pass = true, sig = $("#PractitionerSignature");
			var chartForms = $(".chartNoteTitle").filter(function(){
				return ($(this).data('type') == 'form' || $(this).data('type') == 'missingSubmission');
			});
			chartForms.each(function(){
				var targetId = $(this).data('target'), targetForm = $("#"+targetId);
				if (!chartnote.forms.retrieve(targetForm)) {
					pass = false;
					return false;
				}
			})
			if (!pass) return false;
			
			sig.data('required',true);
			if (!validateItem(sig,'signature')){return false;}
			chartnote.current.signature = justResponse(sig,false,'signature')
			setTimeout(chartnote.sign.ajaxCall, 300);
		},
		ajaxCall: function(){
			console.log('5');
			clearTimeout(autosave.settings.timer);
			blurTopMost('#loading');
			$.ajax({
				url:'/ChartNote/'+$("#ApptInfo").data('noteid')+'/sign',
				method: 'POST',
				data: chartnote.current,
				success:function(data){
					console.log(data);
					blurTopMost("#checkmark",400,function(){
						delayedUnblurAll();
						clickTab("#chart-notes-index");
					});
				}
			})
		}
	},
	autofill: {
		onload: function(){
			if ($("#ChartNote").dne()) return;
			// var submissions = $("#ApptInfo").data('autosave');
			chartnote.autofill.incompleteForms($("#ApptInfo").data('autosave'));
			chartnote.autofill.completeForms();
			chartnote.autofill.signature();
			notes.autofill($("#ApptInfo").data('notes'));
			setTimeout(function(){
				console.log('clear');
				clearTimeout(chartnote.autosaveTimer);
				clearTimeout(autosave.settings.timer);
			},2000)
		},
		incompleteForms: function(autosaveData){
			if (autosaveData == '""' || autosaveData == undefined) return false;
			$.each(autosaveData,function(formId,responses){
				var form = $('form').filter("[data-uid='"+formId+"']");
				forms.fill(form, responses);
			});
		},
		completeForms: function(){
			var submissions = filterByData('.chartNoteTitle','type','submission');
			submissions = filterByData(submissions,'deactivated',false);
			submissions.each(function(){
				var target = $(this).data('target'), response = filterByData('.responses','target',target), form = $("#"+target);
				forms.fill(form, response.data('json'));
				forms.disable(form);
			})
			submissions.data('deactivated',true);
		},
		signature: function(){
			var sig = $("#ChartSignature");
			if (sig.data('signature') != undefined){
				fillAnswer(sig, sig.data('signature'));
				sig.find('.signature').jSignature('disable');
				sig.find('.clear').remove();				
			}
		}
	},
	view: function(uid = null){
		if (!uid && !getUids('ChartNote')) return false;
		else if (!uid && getUids('ChartNote')) uid = getUids('ChartNote');
		blurTopMost("#loading");
		$.ajax({
			url:'/ChartNote/'+uid+'/view',
			method: "GET",
			success: function(data){
				if ($("#ChartNote").exists()) $("#ChartNote").html(data).attr('class', 'modalForm signed');
				else $("<div/>",{id:"ChartNote",class:'modalForm signed',html:data}).appendTo('body');
				blurTopMost('#ChartNote');
				initializeNewForms();
				chartnote.initialize.all();
			}
		})		
	},
	edit: function(uid = 'new'){

	},

	initialize: {
		all: function(){
			if ($("#ChartNote").dne()) return;
			notes.resetForm();
			$.each(chartnote.initialize, function(name, initFunc){
				if (name != 'all' && typeof initFunc === 'function') initFunc();
			})
			chartnote.autofill.onload();
			$("#SignChartBtn").on('click',chartnote.sign.check);
			$('#ChartFormsModalBtn').on('click',function(){chartnote.forms.updateActiveList(true);})
			if (!$("#CurrentAppt").exists()) $(".selectNewAppt").click();
			else chartnote.current.appointment_id = $("#CurrentAppt").data('uid');
		},
		selectNewApptBtns: function(fadeTheseIn = "#ApptsWithoutNotes"){
		    var selectBtn = filterUninitialized('.selectNewAppt');
		    selectBtn.on('click',function(){
		        showOtherAppts(fadeTheseIn);
		    });
		    selectBtn.data('initialized',true);			
		},
		confirmApptBtn: function(){
			var btn = filterUninitialized($('#ConfirmApptForNote').find('.confirmApptBtn'));
			btn.on('click',function(){
				if ($(this).hasClass('disabled')) {
					feedback('No Appointment Selected','Pick an appointment first, silly.');
					return false;
				}
				var active = $(".appt, .unsignedNote").filter('.active'), apptId = (active.length == 0) ? getUids('Appointment') : active.data('uid');
				$("#ConfirmApptForNote").slideFadeOut();
				LoadingContent("#ChartNote","/appointment/"+apptId+"/edit-chart-note",chartnote.forms.updateActiveList);				
			});
			btn.data('initialized',true);
		},
		apptClick: function(){
		    var appts = filterUninitialized('.appt');
		    if (appts.dne()) return;
		    appts.on('click',selectThisAppt);
		    appts.data('initialized');
		},
		noApptsBtn: function(message = 'All of your appointments from the last 30 days are settled.'){
		    var btn = filterUninitialized("#NoEligibleApptsBtn");
		    btn.on('click',function(){
		        confirm('No Eligible Appointments',message,'create new appointment','dismiss',null,function(){clickTab("appointments-index");unblurAll();})
		    });
		    btn.data('initalized',true);			
		},
		availableFormClicks: function(){
			var btns = filterUninitialized('.availableChartForm');
			btns.on('click',function(ev){
				var title = $(this).text(), formid = $(this).data('formid');
				var active = $(this).closest('#LoadedForms').length == 1;
				if (active){
					var target = $(ev.target);
					if (target.is(".removeForm")){
						$(this).addClass('removeTarget');
						confirm("Removing Form", "Any information you have entered will be lost.<h3 class='pink'>Remove Form and Data?</h3>", "yes, remove", 'no, do not remove', null, chartnote.forms.remove)				
					}else if (target.is(".up, .down")){
						console.log("add this function yo");
					}
				}else{
					chartnote.forms.add({title:title,formid:formid});
				}
			});
			btns.data('initialized',true);
		},
		pinnedNotes: function(){
			var noteForm = filterByData($("#ChartNote").find("#AddNote"),'hasNoteFx',false);
			if (noteForm.dne()) return;
			minifyForm(noteForm);
			notes.initialize.withModel(chartnote, autosave.trigger);
			noteForm.data('hasNoteFx',true);			
		},
		autosave: function(){
			autosave.reset();
			autosave.initialize({
		        saveBtn: $("#SignChartBtn"),
		        ajaxCall: chartnote.autosave,
		        callback: null,
		        delay: 10000
			});
			var needsAutosave = $("#ChartNote").find('form').not("#AddNote");
			var textfields = filterByData(needsAutosave.find("input, textarea"),'autoSaveTrigger',false),
				listItems = filterByData(needsAutosave.find('li'),'autoSaveTrigger',false),
				numbers = filterByData(needsAutosave.find('.number'),'autoSaveTrigger',false),
				dropdowns = filterByData(needsAutosave.find('.dropdown'),'autoSaveTrigger',false),
				scale = filterByData(needsAutosave.find('.scale'),'autoSaveTrigger',false),
				dates = filterByData(needsAutosave.find('.date'),'autoSaveTrigger',false),
				times = filterByData(needsAutosave.find('.timePick'),'autoSaveTrigger',false),
				imageClicks = filterByData(needsAutosave.find('.imageClick'),'autoSaveTrigger',false),
				sigs = filterByData(needsAutosave.find('.signature'),'autoSaveTrigger',false);
			
			textfields.on('keyup', chartnote.forms.autosave);
			listItems.on('click', chartnote.forms.autosave);
			numbers.find('.up, .down').on('mouseup touchend', chartnote.forms.autosave);
			dropdowns.find('select').on('change', chartnote.forms.autosave);
			scale.find('input').on('mouseup touchend', chartnote.forms.autosave);
			dates.find('input').on('focusout', chartnote.forms.autosave);
			times.on('change', chartnote.forms.autosave);
			imageClicks.on('mouseup touchend', chartnote.forms.autosave);
			sigs.on('mouseup touchend', chartnote.forms.autosave);
			textfields.add(listItems).add(numbers).add(dropdowns).add(scale).add(dates).add(times).add(imageClicks).add(sigs).data('autoSaveTrigger',true);
		}
	}
};
function initializeChartNotePage(){
	console.log('use chartnote.initialize');
	return false;
	if ($("#ChartNote").dne()) return;
	notes.resetForm();
	initializeSelectNewApptBtns("#ApptsWithoutNotes");
	initializeConfirmApptForNoteBtn();
	initializeNoApptsBtn('All of your chart notes from the last 30 days are already signed.');
	initializeApptClicks();
	initializeAvailableChartForm();
	initializePinnedChartNotes();
	initializeChartNoteAutoSave();
	if (!$("#CurrentAppt").exists()) $(".selectNewAppt").click();
	else chartnote.current.appointment_id = $("#CurrentAppt").data('uid');
	$('#ChartFormsModalBtn').on('click',function(){
		chartnote.forms.updateActiveList();
		blurTopMost('#ChartFormsModal');
	})
	$("#SignChartBtn").on('click',chartnote.sign.check);
	chartnote.autofill.onload();
	if ($("#ChartSignature").data('signature') != undefined) disableChartSignature();
}
function initializePinnedChartNotes(){
	// var noteForm = filterByData($("#ChartNote").find("#AddNote"),'hasNoteFx',false);
	// if (noteForm.dne()) return;
	// minifyForm(noteForm);
	// initializeAdditionalNoteForm(chartnote, autosave.trigger);
	// noteForm.data('hasNoteFx',true);
}
function initializeChartNoteAutoSave(){
	if ($("#ChartNote").hasClass('signed')) return false;
	return;
	chartnote.autosave.initialize();
	var needsAutosave = $("#ChartNote").find('form').not("#AddNote");
	var textfields = filterByData(needsAutosave.find("input, textarea"),'autoSaveTrigger',false),
		listItems = filterByData(needsAutosave.find('li'),'autoSaveTrigger',false),
		numbers = filterByData(needsAutosave.find('.number'),'autoSaveTrigger',false),
		dropdowns = filterByData(needsAutosave.find('.dropdown'),'autoSaveTrigger',false),
		scale = filterByData(needsAutosave.find('.scale'),'autoSaveTrigger',false),
		dates = filterByData(needsAutosave.find('.date'),'autoSaveTrigger',false),
		times = filterByData(needsAutosave.find('.timePick'),'autoSaveTrigger',false),
		imageClicks = filterByData(needsAutosave.find('.imageClick'),'autoSaveTrigger',false),
		sigs = filterByData(needsAutosave.find('.signature'),'autoSaveTrigger',false);
	
	textfields.on('keyup', chartnote.forms.autosave);
	listItems.on('click', chartnote.forms.autosave);
	numbers.find('.up, .down').on('mouseup touchend', chartnote.forms.autosave);
	dropdowns.find('select').on('change', chartnote.forms.autosave);
	scale.find('input').on('mouseup touchend', chartnote.forms.autosave);
	dates.find('input').on('focusout', chartnote.forms.autosave);
	times.on('change', chartnote.forms.autosave);
	imageClicks.on('mouseup touchend', chartnote.forms.autosave);
	sigs.on('mouseup touchend', chartnote.forms.autosave);
	// textfields.on('keyup', autosave.trigger);
	// listItems.on('click', autosave.trigger);
	// numbers.find('.up, .down').on('mouseup touchend', autosave.trigger);
	// dropdowns.find('select').on('change', autosave.trigger);
	// scale.find('input').on('mouseup touchend', autosave.trigger);
	// dates.find('input').on('focusout', autosave.trigger);
	// times.on('change', autosave.trigger);
	// imageClicks.on('mouseup touchend', autosave.trigger);
	// sigs.on('mouseup touchend', autosave.trigger);
	textfields.add(listItems).add(numbers).add(dropdowns).add(scale).add(dates).add(times).add(imageClicks).add(sigs).data('autoSaveTrigger',true);
}
function initializeAvailableChartForm(){
	// var btns = filterUninitialized('.availableChartForm');
	// btns.on('click',function(ev){
	// 	var title = $(this).text(), formid = $(this).data('formid');
	// 	var active = $(this).closest('#LoadedForms').length == 1;
	// 	if (active){
	// 		var target = $(ev.target);
	// 		if (target.is(".removeForm")){
	// 			$(this).addClass('removeTarget');
	// 			confirm("Removing Form", "Any information you have entered will be lost.<h3 class='pink'>Remove Form and Data?</h3>", "yes, remove", 'no, do not remove', null, chartnote.forms.remove)				
	// 		}else if (target.is(".up, .down")){
	// 			console.log("add this function yo");
	// 		}
	// 	}else{
	// 		chartnote.forms.add({title:title,formid:formid});
	// 	}
	// });
	// btns.data('initialized',true);
}
function initializeConfirmApptForNoteBtn(){
	// var btn = filterUninitialized($('#ConfirmApptForNote').find('.confirmApptBtn'));
	// btn.on('click',confirmApptForNote);
	// btn.data('initialized',true);
}
function editNoteFromOptionsNav(){
	blurTopMost("#loading");
	var uid = $("#CurrentChartNote").data('uid');
	$.ajax({
		url:'/ChartNote/'+uid+'/edit',
		method: "GET",
		success: function(data){
			if ($("#ChartNote").exists()){
				$("#ChartNote").html("<h1 class='purple'>Edit Chart Note</h1>"+data);
			}else{
				$("<div/>",{id:"ChartNote",class:'modalForm',html:"<h1 class='purple'>Edit Chart Note</h1>"+data}).appendTo('body');
			}
			blurTopMost('#ChartNote');
			$("<div/>",{text:'dismiss',class:'button cancel'}).insertAfter($("#SignChartBtn"));
			initializeNewForms();
			// initializeChartNotePage();
			chartnote.initialize.all();
		}
	})
}
function viewNoteFromOptionsNav(){
	var uid = $("#CurrentChartNote").data('uid');
	viewNote(uid);
}
function viewNoteFromApptInfo(){
	var uid = $("#ChartNoteBtn").data('info').id;
	unblurAll(500,function(){
		viewNote(uid);
	});
}
function viewNote(uid){
	console.log('use chartnote.view.modal');
	// blurTopMost("#loading");
	// $.ajax({
	// 	url:'/ChartNote/'+uid+'/view',
	// 	method: "GET",
	// 	success: function(data){
	// 		console.log('"viewNote" load');
	// 		if ($("#ChartNote").exists()){
	// 			$("#ChartNote").html(data);
	// 		}else{
	// 			$("<div/>",{id:"ChartNote",class:'modalForm signed',html:data}).appendTo('body');
	// 		}
	// 		blurTopMost('#ChartNote');
	// 		initializeNewForms();
	// 		initializeChartNotePage();
	// 	}
	// })	
}

function signChart(){
	console.log('use chartnote.sign');
	var formsObj = createChartFormsObj(), pass = true;
	if (!formsObj) return false;
	clearInterval(autosaveNoteTimer);
	blurTopMost('#loading');
	if (autosaveNoteXHR) {
		console.log(autosaveNoteXHR);
		setTimeout(signChart,300);
		return false;
	}

	var notes = [];
	$("#NoteList").find(".note").each(function(){
		notes.push($(this).data());
	});
	var sig = $("#PractitionerSignature");
	sig.data('required',true);
	if (!validateItem(sig,'signature')){return false;}
	var postObj = {
		submissions: formsObj,
		signature: justResponse(sig,false,'signature'),
		appointment_id: $("#ApptInfo").data('id'),
		notes: notes
	}
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
function confirmApptForNote(){
	if ($(this).hasClass('disabled')) {
		feedback('No Appointment Selected','Pick an appointment first, silly.');
		return false;
	}
	var active = $(".appt, .unsignedNote").filter('.active'), apptId = (active.length == 0) ? getUids('Appointment') : active.data('uid');
	$("#ConfirmApptForNote").slideFadeOut();
	LoadingContent("#ChartNote","/appointment/"+apptId+"/edit-chart-note",chartnote.forms.updateActiveList);
}
