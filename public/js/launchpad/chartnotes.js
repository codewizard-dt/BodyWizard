var chartnote = {
	current: {
		uid: null,
		autosave: null,
		notes: null,
		patient_id: null,
		practitioner_id: null,
		appointment_id: null,
		signature: null,
		changes: null,
	},
	previous: {
		autosave: null,
		notes: null,
	},
	autosaveXHR: null,
	forms: {
		add: function(form){
			blurTop('#loading');
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
					unblur();
				}
			})			
		},
		remove: function(){
			unblur();
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
			if (openModal) blurTop('#ChartFormsModal');
		},
		retrieve: function(form, autosave = false){
			if (!form.is(":visible") && !autosave){
				$(".chartNoteTitle").filter("[data-target='"+form.attr('id')+"']").click();
			}
			var formObj = forms.retrieve(form, autosave, autosave);
			if (!formObj) return false;
			if (!chartnote.current.autosave) chartnote.current.autosave = {};
			chartnote.current.autosave[form.data('uid')] = formObj;
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
	autosave: () => {
		let note = chartnote.current;
		let data = {
			uid: note.uid,
			columns: {
				patient_id: note.patient_id,
				practitioner_id: note.practitioner_id,
				appointment_id: note.appointment_id,
				notes: note.notes,
				autosave: note.autosave,
			},
			sync: [],
		};
		log(data,'chartnote autosave data');
		return $.ajax({
			url:'/save/ChartNote',
			method: 'POST',
			data: data,
			success:function(data){
				note.uid = getUids('ChartNote');
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
			autosave.clearTimer();

			let note = chartnote.current;
			let data = {
				uid: note.uid,
				columns: {
					patient_id: note.patient_id,
					practitioner_id: note.practitioner_id,
					appointment_id: note.appointment_id,
					notes: note.notes,
					signed_at: moment().format('YYYY-MM-DD HH:mm:ss'),
					signature: note.signature,
				},
				submissions: note.autosave,
				sync: [],
			};
			log(data,'chartnote sign data');

			blurTop('#loading');
			$.ajax({
				url:'/save/ChartNote',
				method: 'POST',
				data: data,
				success:function(data){
					console.log(data);
					blurTop('#checkmark',{
						callback: function(){
							log({data},'should be callback');
							unblur();
							$("#chart-notes-index").click();
						},
						delay: 1000
					})
				}
			})
		}
	},
	autofill: {
		onload: function(){
			if ($("#ChartNote").dne()) return;
			if (!$("#ChartNote").hasClass('signed') && !$('#ApptInfo').data()) return;
			
			init('#ChartNote',function(){
				// log({data:$("#ApptInfo").data()},'appt load');
				let data = $("#ApptInfo").data();
				for (attr in data){
					chartnote.current[attr] = data[attr];
					console.log(attr,data[attr]);
				}
				// console.log(chartnote.current.autosave);
				chartnote.autofill.completeForms();
				chartnote.autofill.signature();
				chartnote.autofill.incompleteForms(chartnote.current.autosave);
				notes.autofill(chartnote.current.notes);
				setTimeout(autosave.clearTimer,2000);
			});
		},
		incompleteForms: function(autosaveData){
			if (autosaveData == '""' || autosaveData == undefined) return false;
			$.each(autosaveData,function(formId,responses){
				var form = $('form').filter("[data-uid='"+formId+"']");
				forms.fill(form, responses);
				// log({form,responses});
			});
		},
		completeForms: function(){
			var submissions = filterByData('.chartNoteTitle','type','submission');
			log({submissions},'autofill submission data');
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
		if (modal.top().is('#Confirm')) unblur();
		blurTop("#loading");
		$.ajax({
			url:'/ChartNote/'+uid+'/view',
			method: "GET",
			success: function(data){
				if ($("#ChartNote").exists()) $("#ChartNote").html(data).attr('class', 'modalForm signed');
				else $("<div/>",{id:"ChartNote",class:'modalForm signed',html:data}).appendTo('body');
				$("#ChartNote").data('initialized',false);
				blurTop('#ChartNote');
				initializeNewForms();
				chartnote.initialize.all();
			}
		})		
	},
	edit: function(){
		unblurAll({fade:800});
		$("#chart-note-create").click();
	},
	initialize: {
		all: function(){
			if ($("#ChartNote").dne()) return;
			notes.resetForm();
			$.each(chartnote.initialize, function(name, initFunc){
				if (name != 'all' && typeof initFunc === 'function') initFunc();
			})
			appointment.initialize.externalSelectAndLoad({
				target: $("#ChartNote"),
				url: "/appointment/apptId/edit-chart-note",
				callback: chartnote.forms.updateActiveList,
				btnText: {hasNote:'finish note',noNote:'start note'},
			});
			chartnote.autofill.onload();
			init([
				['#SignChartBtn',function(){$(this).on('click',chartnote.sign.check)}],
				['#ChartFormsModalBtn',function(){$(this).on('click',chartnote.forms.updateActiveList.bind(null,true))}],
				]);
			if ($("#CurrentAppt").dne()) $(".selectNewAppt").click();
			else {
				chartnote.current.appointment_id = $("#CurrentAppt").data('uid');
				uids.set({Appointment: $("#CurrentAppt").data('uid')});
			}
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
						confirm({
							header: 'Removing Form',
							message: "Any information you have entered will be lost.<h3 class='pink'>Remove Form and Data?</h3>",
							yesBtnText: 'remove form',
							noBtnText: 'go back',
							affirmativeCallback: chartnote.forms.remove,
						})
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
			log({form:$("#AddNote")});
			initAlt('#AddNote','hasNoteFx',function(){
				log({this:this},'note initialize');
				minifyForm($(this));
				notes.initialize.withModel(chartnote, autosave.trigger);
			});
		},
		autosave: function(){
			autosave.reset();
			if ($("#ChartNote").hasClass('signed')) return;
			autosave.initialize({
				saveBtn: $("#SignChartBtn"),
				ajaxCall: chartnote.autosave,
				callback: function(data){
					log({data},'callback data');
					if (data.uid) chartnote.current.uid = data.uid;
					log(chartnote.current,'current');
				},
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
		blurTop('#ChartFormsModal');
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
	blurTop("#loading");
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
			blurTop('#ChartNote');
			$("<div/>",{text:'dismiss',class:'button cancel'}).insertAfter($("#SignChartBtn"));
			initializeNewForms();
			// initializeChartNotePage();
			chartnote.initialize.all();
		}
	})
}
// function viewNoteFromOptionsNav(){
// 	var uid = $("#CurrentChartNote").data('uid');
// 	viewNote(uid);
// }
// function viewNoteFromApptInfo(){
// 	var uid = $("#ChartNoteBtn").data('info').id;
// 	unblurAll(500,function(){
// 		viewNote(uid);
// 	});
// }

function signChart(){
	console.log('use chartnote.sign');
	return;
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
