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
		url = "/save/settings/" + model + "/" + uid, columnObj = constructColumnSettingsObj(model)

		// console.log(modal.data());
		// console.log(connectedModelArr);

		if (obj){
			blurElement(modal,"#loading");
			var data = {
				settings: JSON.stringify(obj),
				connectedModels: JSON.stringify(connectedModelArr),
				columnObj: JSON.stringify(columnObj)
			};
			// var columnObj = constructColumnSettingsObj(model);
			// if (columnObj){
			// 	data['columnObj'] = 
			// }
			console.log(data);
			// AJAX
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
						$("#Error").html("Error saving settings<div class='button xsmall cancel'>dismiss</div>")
						blurElement(modal,"#Error");
					}
				},
				error:function(e){
					console.log(e);
					$("#Error").html("Server error<div class='button xsmall cancel'>dismiss</div>")
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
