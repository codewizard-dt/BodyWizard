$(document).ready(function(){
	var saveModelBtns = $(".createNew, .editExisting").find(".submitForm").filter(function(){
		return $(this).data('updated') != true;
	});
	saveModelBtns.off("click",submitForm);
	saveModelBtns.on("click",saveModel);
	saveModelBtns.data('updated',true);

	var modalBtns = $(".button").filter(".createNew, .editExisting").filter(function(){
		return $(this).data('initialized') != true ;
	});
	modalBtns.on("click",openModal);
	modalBtns.data('initialized',true);

	// $(".createNew").filter("[data-model='Message']").off("click",openModal);
})
function openModal(){
	var model = $(this).data('model'),
		id = $(this).hasClass('createNew') ? "#create"+model : "#edit"+model,
		p = modalOrBody($(this));
	// SPECIAL STEP FOR CREATING A FORM
	if (model=='Form'){
		$("#forms-create").find('.title').click();
	}else{
		blurElement(p,id);
	}
	if (model == 'User'){
		removePasswordInputs();
	}

}
function removePasswordInputs(){
	$(".item").filter(function(){
		return $(this).text().toLowerCase().includes("password");
	}).remove();
}
function reloadTableModal(element,model){

	var id = element.attr('id'), t = $("#"+id),
		p = modalOrBody(element), m = parentModalOrBody(element);

	$.ajax({
		url:"/"+model+"/modal",
		method:"GET",
		data: element.data(),
		success:function(data){
			if (p.find(".blur").length > 0){unblurElement(p);}
			unblurElement(element);
			console.log(element);
			element.attr("id","xxx").remove();
			$(data).appendTo("#ModalHome");
			blurElement(m,$("#"+id));
			// t.find(".selectData").on("click",updateInputFromTable);
		},
		error:function(e){
			$("#Error").html("Error saving<br><div class='button xsmall cancel'>dismiss</div>");
			blurElement(m, "#Error");
		}
	})
}
function saveModel(){
	var form = $(this).closest('.formDisp'), modal = $(this).closest('.createNew, .editExisting');

	var	obj = checkForm(form), model = modal.data('model'), 
		connectedModelArr = checkConnectedModels(model), dataObj, columnObj, url;

	var method = modal.hasClass("createNew") ? "POST" : "PATCH",
		url = "/save/" + model;
	if (method == "PATCH"){
		var uid = modal.data('uid');
		url += "/" + uid;
	}
	if (!obj){return false;}

	columnObj = constructColumnObj(model);
	var noFullJson = ['Message'];
	
	dataObj = {
		connectedModels: JSON.stringify(connectedModelArr),
		columnObj: JSON.stringify(columnObj)
	}
	if ($.inArray(model,noFullJson) == -1){
		dataObj['full_json'] = JSON.stringify(obj);
	}

	var p = modalOrBody($(this)),
		m = parentModalOrBody($(this));
	blurElement(p,"#loading");

	// console.log(p);
	// console.log(m);
	// return false;

	$.ajax({
		url: url,
		method: method,
		data: dataObj,
		success:function(data){
			// console.log(data);
			if (data == 'checkmark'){
				if (m.is("body")){
					blurElement(p,"#checkmark");
					setTimeout(function(){
						unblurElement($("body"));
						reloadTab();
					},800)
				}else{
					blurElement(p,"#checkmark");
					setTimeout(function(){
						blurElement(p,"#loading");
						reloadTableModal(m,model);
						resetForm(form);
					},800)
				}
			}else{
				if (data['errors'] != undefined){
					var str = [];
					$.each(data['errors'],function(attr,message){
						str.push(message);
					})
					$("#Error").find(".message").html(str.join("<br>"));
				}else{
					$("#Error").find(".message").text("Unknown error");
					$("#Error").data('error',data);
					console.log(data);
				}
				blurElement(p,"#Error");
			}
		},
		error:function(e){
			console.log(e);
			$("#Error").html("Error saving<br><div class='button cancel xsmall'>dismiss</div>");
			blurElement(p,"#Error");
		}
	})
}
function deleteModel(){
    var model = $(this).data('model'),
        uid = $("#Current"+model).data('uid'),
        loadTarget = $(this).closest('.loadTarget'),
        deleteModal = $("#delete"+model);
        console.log(model + uid);
        blurElement(deleteModal,"#loading");
        // return false;
        $.ajax({
            url: "/delete/" + model + "/" + uid,
            method: "DELETE",
            success:function(data){
                if (data=='checkmark'){
                    blurElement(deleteModal,"#checkmark");
                    setTimeout(function(){
                        // location.reload(true);
                        reloadTab();
                    },800)
                }else{
                    $("#Error").html("<h3>Error deleting</h3><div class='button cancel xsmall>dismiss</div>");
                    $("#Error").data('error',data);
                    blurElement($("body"),"#Error");
                    console.log(data);
                }
            },
            error:function(e){
                $("#Error").html("<h3>Error deleting</h3><div class='button cancel xsmall>dismiss</div>");
                blurElement($("body"),"#Error");
                console.log(e);
            }
        })
}
function checkConnectedModels(model){
	var models = $(".connectedModel").filter(function(){
		return $(this).data('connectedto') == model;
	}), arr = [];
	models.each(function(){
		arr.push($(this).data());
	})
	// console.log(arr);
	return arr;
}
function constructColumnObj(model){
	var obj = {};
	if (model == 'Service'){
		obj = {
			name: justResponse($("#service_name")),
			description_calendar: justResponse($("#description_for_scheduling_and_website")),
			description_admin: justResponse($("#description_for_invoicing_and_superbills")),
			duration: justResponse($("#duration")).split(" ")[0]
		}
	}
	else if (model == 'Code'){
		obj = {
			name: justResponse($("#code_as_used_for_billing_and_invoicing")),
			code_type:  justResponse($("#code_type")),
			code_description: justResponse($("#code_description")),
			key_words: justResponse($("#keywords"))
		}
		if ($("#which_version_of_icd").is(":visible")){
			obj['icd_version'] = justResponse($("#which_version_of_icd"))
		}
	}
	else if (model == 'ServiceCategory'){
		obj = {
			name: justResponse($("#category_name")),
			description: justResponse($("#category_description"))
		}
	}
	else if (model == 'Diagnosis'){
		var type = $("#CurrentDiagnosis").data('dxtype');
		var affectInput = $(".itemFU").filter(function(){
			return $(this).find(".q").text().includes("diagnosis can affect") && !modalOrBody($(this)).is("body");
		}).find('.answer');
		obj = {
			name: justResponse($("#diagnosis_name")),
			category: justResponse($("#what_type_of_diagnosis_is_this")),
			affects: justResponse(affectInput),
			medicine_type: type
		}
	}
	else if (model == 'User'){
		obj = {
			first_name: justResponse($("#first_name")),
			middle_name: justResponse($("#middle_name")),
			last_name: justResponse($("#last_name")),
			preferred_name: justResponse($("#preferred_name")),
			phone: justResponse($("#phone_number")),
			email: justResponse($("#email_address")),
			username: (justResponse($("#username")) == null) ? justResponse($("#email_address")) : justResponse($("#username"))
		}
		// console.log(obj);
	}
	else if (model == 'Message'){
		obj = {
			type: justResponse($("#message_type")),
			message: justResponse($("#message")),
			status: 'pending'
		}
		if ($("#subject").is(":visible")){
			obj['subject'] = justResponse($("#subject"));
		}
	}
	// console.log(obj);
	return obj;
}
function turnToBoolean(value){
	return (value = "yes") ? true : false;
}