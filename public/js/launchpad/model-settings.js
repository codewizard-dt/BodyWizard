var settingsMap = {
	Form: 
	{
		form_type: 
		{
			name: "form_type",
			column: "form_type",
			valueType: "literal"
		},
		user_type:
		{
			name: "user_type",
			column: "user_type",
			valueType: "literal"
		},
		allow_as_part_of_chart_note:
		{
			name: "chart_inclusion",
			column: "settings",
			valueType: "boolean"
		},
		require_practice_admin_privileges:
		{
			name: "require_admin",
			column: "settings",
			valueType: "boolean"
		},
		default_patient_portal_access:
		{
			name: "default_access",
			column: "settings",
			valueType: "literal"
		},
		require_completion_at_registration:
		{
			name: "require_at_registration",
			column: "settings",
			valueType: "boolean"
		},
		require_this_form_to_be_completed_periodically:
		{
			name: "require_periodically",
			column: "settings",
			valueType: "boolean"
		},
		how_often_is_it_required:
		{
			name: "periodicity",
			column: "settings",
			valueType: "literal"
		},
		lock_this_form:
		{
			name: "locked",
			column: "locked",
			valueType: "boolean"
		},
	},
	Service:
	{
		is_this_service_allowed_as_an_add_on:
		{
			name: "is_addon",
			column: "is_addon",
			valueType: "boolean"
		},
		only_available_as_add_on:
		{
			name: "addon_only",
			column: "addon_only",
			valueType: "boolean"
		},
		available_for_new_patients:
		{
			name: "new_patients_ok",
			column: "new_patients_ok",
			valueType: "boolean"
		},
		only_available_for_new_patients:
		{
			name: "new_patients_only",
			column: "new_patients_only",
			valueType: "boolean"
		},
		duration_as_add_on:
		{
			name: "add_on_duration",
			column: "settings",
			valueType: "literal"
		},
		price_as_add_on:
		{
			name: "add_on_price",
			column: "settings",
			valueType: "literal"
		},
		combine_with_which_services:
		{
			name: "addon_services",
			column: "addon_services",
			valueType: "function",
			function: getAddOnServiceIdsFromNames
		},
	}
};
function initializeSettingsForm(){
	var settingsBtns = $(".settingsForm").find(".submitForm").filter(function(){
		return $(this).data('updated') != true;
	});
	settingsBtns.off("click",submitForm);
	settingsBtns.on("click",saveSettings);
	settingsBtns.data('updated',true);
	initializeAddOnServiceItem();

	var settingsForm = filterByData(".settingsForm",'hasCurrentSettings',false);
	settingsForm.each(function(){
		var json = $(this).data('settingsjson');
		if(json !== ""){
			fillForm(json,$(this));
		}		
	})
	settingsForm.data('hasCurrentSettings',true);
	initializeSuperUserOptions();
}
function initializeAddOnServiceItem(){
	var ul = $('#ServiceSettingsForm').find('.combine_with_which_services'), item = filterByData(ul,'hasAddOnFx',false), serviceLIs = $("#ServiceMap").find('li');
	item.find('li').last().replaceWith(serviceLIs);
	item.find('li').filter('[data-value="ALL Services"]').on('click',masterCheckbox);
	item.data('hasAddOnFx',true);
}
function initializeSuperUserOptions(){
	var model = $(".settingsForm").data('model');
	if (model == 'Form'){
		$(".answer.form_type").append("<li data-value='system'>system</li>");
	}
}
function saveSettings(){
	var form = $("#ModelSettings"), formWrap = form.closest(".settingsForm"), model = formWrap.data('model'),
		obj = checkForm(form), connectedModelArr = checkConnectedModels(model), uid = formWrap.data('uid'),
		url = "/save/settings/" + model + "/" + uid, columnObj = constructSettingsObj(model, form);

	if (obj){
		blurTopMost("#loading");
		var data = {
			settings_json: JSON.stringify(obj),
			connectedModels: JSON.stringify(connectedModelArr),
			columnObj: JSON.stringify(columnObj)
		};
		console.log(data);
		$.ajax({
			url: url,
			method: "PATCH",
			data: data,
			success:function(data){
				console.log(data);
				if (data=="checkmark"){
					blurTopMost("#checkmark");
					setTimeout(function(){
						reloadTab();
					},800)
				}
			}
		})
	}else{
		return false;
	}
}
function constructColumnAttributesObj(model,form){
	var obj = {};
	if (model == 'Service'){
		obj = {
			is_addon: turnToBoolean(justResponse(form.find(".is_this_service_an_add-on_type_service"))),
			new_patients_ok: turnToBoolean(justResponse(form.find(".is_this_service_available_for_new_patients")))
		}
		if (form.find(".is_this_service_only_for_new_patients").is(":visible")){
			obj['new_patients_only'] = turnToBoolean(justResponse(form.find(".is_this_service_only_for_new_patients")));
		}
		if (form.find(".is_this_service_only_available_as_an_add-on").is(":visible")){
			obj['addon_only'] = turnToBoolean(justResponse(form.find(".is_this_service_only_available_as_an_add-on")));
		}
		if (form.find(".to_which_other_services_can_this_service_be_added").is(":visible")){
			var val = justResponse(form.find(".to_which_other_services_can_this_service_be_added")), serviceIds = null, services, map = $("#ServiceMap").data('map');
			if (val != "any service"){
				serviceIds = [];
				services = $("#ServiceNames").find(".active");
				services.each(function(s,service){
					var name = $(service).data('value');
					serviceIds.push(map[name]);
				})
			}
			obj['addon_services'] = (serviceIds) ? JSON.stringify(serviceIds) : null;
		}
	}
	else if (model == 'Code'){
		obj = {
		}
	}
	else if (model == 'ServiceCategory'){
		obj = {
		}
	}
	else if (model == 'Form'){
		obj = {
			form_type: justResponse(form.find(".select_form_type"))
		}
	}
	if ($.isEmptyObject(obj)){obj = null;}
	// console.log(obj);
	return obj;
}
function constructSettingsObj(model, form){
	var settingsList = settingsMap[model], input, obj = {settings:{}};
	$.each(settingsList,function(inputName,details){
		input = form.find('input, ul, select').filter('[data-name="'+inputName+'"]');
		if (input.is(":visible") && details.column == 'settings'){
			obj['settings'][details.name] = interpretSettingResponse(details,input);
		}else if (input.is(":visible")){
			obj[details.column] = interpretSettingResponse(details,input);
		}else if (!input.is(":visible") && details.column == 'settings'){
			console.log(input,inputName);
			obj['settings'][details.name] = settingsNullResponse(details);
		}else if (!input.is(":visible")){
			console.log(input,inputName);
			obj[details.column] = settingsNullResponse(details);
		}
	})
	// if ($.isEmptyObject(obj['settings'])) obj['settings'] = null;
	return obj;
}
function interpretSettingResponse(settingDetails,input){
	var type = settingDetails.valueType;
	if (type == 'literal'){return justResponse(input);}
	else if (type == 'boolean'){return turnToBoolean(justResponse(input));}
	else if (type == 'function'){
		var fx = settingDetails.function;
		// console.log(fx);
		return fx(input);
	}
}
function settingsNullResponse(settingDetails){
	var type = settingDetails.valueType;
	if (type == 'literal'){return null;}
	else if (type == 'boolean'){return false;}
	else if (type == 'function'){return null;}
}
function constructSettingsAttribute(model, form){
	var obj = {};
	if (model == 'Form'){
		// var requirement = form.find(".how_often").is(":visible") ? justResponse(form.find(".how_often")) : form.find(".require_this_form_for_all_new_patients_at_registration");
		// obj['form_type'] = justResponse(form.find(".select_form_type"));
		// obj['admin_only'] = (justResponse(form.find(".require_admin_privileges_to_use_this_form"))!==null) ? justResponse(form.find(".require_admin_privileges_to_use_this_form")) : "no restriction";
		// obj['portal_listing'] = (justResponse(form.find(".add_this_form_to_patient_portal"))!==null) ? justResponse(form.find(".add_this_form_to_patient_portal")) : "never";
		// obj['in_office'] = (justResponse(form.find(".will_patients_complete_this_form_in-office_only"))!==null) ? justResponse(form.find(".will_patients_complete_this_form_in-office_only")) : "never";
		// if (form.find(".how_often").is(":visible")){
		// 	obj['required'] = justResponse(form.find(".how_often"));
		// }else{
		// 	obj['required'] = justResponse(form.find(".require_once_at_registration")) == 'yes' ? 'at registration only' : 'never';
		// }
		var settingsInputs = form.find(".answer").filter(":visible");
		settingsInputs.each(function(){

		})
		console.log(form.find(".answer").filter(":visible"));
		obj = null;
	}
	else if (model == 'Patient'){
		var appts = turnToBoolean(justResponse(form.find(".appointment_reminders"))), 
			confirms = justResponse(form.find(".appointment_confirmation_cancellation_emails"),true),
			forms = justResponse(form.find(".reminder_to_complete_required_forms"),true), apptReminder, formReminder;
		if (!appts){
			apptReminder = false;
		}else{
			var type = justResponse(form.find(".appointment_reminders").closest('.item').find(".text_or_email"),true);
			apptReminder = {
				'text': ($.inArray('text',type) > -1),
				'email': ($.inArray('email',type) > -1)
			}
		}
		if ($.inArray('never',forms) > -1){
			formReminder = false;
		}else{
			var type = justResponse(form.find(".reminder_to_complete_required_forms").closest('.item').find(".text_or_email"),true);
			formReminder = {
				'24hr': ($.inArray('24hr before',forms) > -1),
				'48hr': ($.inArray('48hr before',forms) > -1),
				'72hr': ($.inArray('72hr before',forms) > -1),
				'text': ($.inArray('text',type) > -1),
				'email': ($.inArray('email',type) > -1)
			}
		}
		console.log(confirms);
		obj['reminders'] = {'appointments':apptReminder,'forms':formReminder};
		obj['confirmations'] = ($.inArray('confirmations',confirms) > -1);
		obj['cancellations'] = ($.inArray('cancellations',confirms) > -1);
	}
	if ($.isEmptyObject(obj)){obj = null;}
	console.log(obj);
	return obj;	
}
function getAddOnServiceIdsFromNames(input){
	var response = justResponse(input, true), returnArr = [], map = $("#ServiceMap").data('map');
	if (response == "ALL Services"){
		return null;
	}else{
		$.each(response,function(r,resp){
			returnArr.push(map[resp]);
		})
		return returnArr;
	}
}