$(document).ready(function(){
	var settingsBtns = $(".settingsForm").find(".submitForm").filter(function(){
		return $(this).data('updated') != true;
	});
	settingsBtns.off("click",submitForm);
	settingsBtns.on("click",saveSettings);
	settingsBtns.data('updated',true);
})

function saveSettings(){
	var form = $(this).closest('.formDisp'), modal = form.closest(".modalForm"), model = modal.data('model'),
		obj = checkForm(form), connectedModelArr = checkConnectedModels(model), uid = modal.data('uid'),
		url = "/save/settings/" + model + "/" + uid, columnObj = constructColumnSettingsObj(model),
		settings = constructEasyAccessList(model);

	if (obj){
		blurElement(modal,"#loading");
		var data = {
			settings_json: JSON.stringify(obj),
			connectedModels: JSON.stringify(connectedModelArr),
			columnObj: JSON.stringify(columnObj)
		};
		if (settings){
			data['settings'] = JSON.stringify(settings);
		}

		$.ajax({
			url: url,
			method: "PATCH",
			data: data,
			success:function(data){
				console.log(data);
				if (data=="checkmark"){
					blurElement(modal,"#checkmark");
					setTimeout(function(){
						reloadTab();
					},800)
				}else{
					console.log(data);
					$("#Error").find(".message").text("Error saving settings");
					blurElement(modal,"#Error");
				}
			},
			error:function(e){
				console.log(e);
				$("#Error").find(".message").text("Server Error");
				blurElement(modal,"#Error");
			}
		})
	}else{
		return false;
	}
}
function constructColumnSettingsObj(model){
	var obj = {};
	if (model == 'Service'){
		obj = {
			is_addon: turnToBoolean(justResponse($("#is_this_an_add-on_type_service"))),
			new_patients_ok: turnToBoolean(justResponse($("#is_this_service_available_for_new_patients")))
		}
		if ($("#is_this_service_only_for_new_patients").is(":visible")){
			obj['new_patients_only'] = turnToBoolean(justResponse($("#is_this_service_only_for_new_patients")));
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
			form_type: justResponse($("#form_type")),
			locked: turnToBoolean(justResponse($("#lock_this_form_to_prevent_editing_and_deletion")))
		}
	}
	if (obj == {}){obj = null;}
	console.log(obj);
	return obj;
}
function constructEasyAccessList(model){
	var obj = {};
	if (model == 'Service'){
	}
	else if (model == 'Code'){
	}
	else if (model == 'ServiceCategory'){
	}
	else if (model == 'Form'){ 
		obj['display_numbers'] = turnToBoolean(justResponse($("#display_question_numbers")));
		obj['form_type'] = justResponse($("#form_type"));
		if ($("#list_this_form_in_the_patients_portal").is(":visible")){
			obj['portal_listing'] = justResponse($("#list_this_form_in_the_patients_portal"));
		}
		if ($("#automatically_prompt_practitioner_to_fill_out_form_when_a_service_requires_it").is(":visible")){
			obj['prompt_practitioner'] = turnToBoolean(justResponse($("#automatically_prompt_practitioner_to_fill_out_form_when_a_service_requires_it")));
		}
	}
	if (obj == {}){obj = null;}
	// console.log(obj);
	return obj;	
}
