$(document).ready(function(){
	var saveModelBtns = $(".createNew, .editExisting").find(".submitForm").filter(function(){
		return $(this).data('updated') != true;
	});
	saveModelBtns.off("click",submitForm);
	saveModelBtns.on("click",saveModel);
	saveModelBtns.data('updated',true);

	var modalBtns = $(".button").filter(".createNew, .editExisting").filter(function(){
		if ($(this).data('model') == 'Template' && !$("#createTemplate").data('initialized')){
			initializeTemplateForm();
		}else if ($(this).data('model') == 'Message' && !$("#createMessage").data('initialized')){
			initializeMessageForm();
		}
		return $(this).data('initialized') != true ;
	});
	modalBtns.on("click",openModal);
	modalBtns.data('initialized',true);

})
function initializeTemplateForm(){
	var forms = $("#createTemplate, #editTemplate");
	forms.each(function(){
		var section = $(this).find(".section").first();
		$("<div/>",{
			class: 'summernote'
		}).appendTo(section);
	})
	setTimeout(function(){
		forms.find(".summernote").summernote({
			height:500,
	        placeholder: 'Enter your text here',
	        toolbar: [
	          ['style', ['style']],
	          ['font', ['bold', 'underline', 'clear']],
	          ['fontname', ['fontname']],
	          ['color', ['color']],
	          ['para', ['ul', 'ol', 'paragraph', 'height']],
	          ['insert', ['link', 'picture']],
	          ['view', ['fullscreen', 'codeview', 'undo', 'redo', 'help']],
	        ]
		})		
	},500);
	forms.data('initialized',true);
}
function initializeMessageForm(){
	var form = $("#createMessage");
	form.find("#rich_text_message").addClass('summernote');
	form.find(".summernote").summernote({
			height:500,
	        placeholder: 'Enter your text here',
	        toolbar: [
	          ['style', ['style']],
	          ['font', ['bold', 'underline', 'clear']],
	          ['fontname', ['fontname']],
	          ['color', ['color']],
	          ['para', ['ul', 'ol', 'paragraph', 'height']],
	          ['insert', ['link', 'picture']],
	          ['view', ['fullscreen', 'codeview', 'undo', 'redo', 'help']],
	        ]
		});
	form.data('initialized',true);

}
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
			var thisModel = element.data('model');
			console.log(thisModel);
			setTimeout(function(){
				$("#create"+thisModel).find(".submitForm").on('click',saveModel);
			},300)
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

	// console.log(model);
	// console.log(connectedModelArr);
	var method = modal.hasClass("createNew") ? "POST" : "PATCH",
		url = "/save/" + model;
	if (method == "PATCH"){
		var uid = modal.data('uid');
		url += "/" + uid;
	}
	if (!obj){return false;}

	columnObj = constructColumnObj(model);
	var noFullJson = ['Message','Attachment'];
	
	dataObj = {
		connectedModels: JSON.stringify(connectedModelArr),
		columnObj: JSON.stringify(columnObj)
	}
	if ($.inArray(model,noFullJson) == -1){
		dataObj['full_json'] = JSON.stringify(obj);
	}
	if (model == 'Message'){
		dataObj['recipient_ids'] = JSON.stringify($("#select_recipients").data('uidArr'));
	}

	var p = modalOrBody($(this)),
		m = parentModalOrBody($(this));
	blurElement(p,"#loading");

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
function checkConnectedModels(model,form){
	// console.log(form);
	var models = $(".connectedModel").filter(function(){
		return $(this).data('connectedto') == model;
	}), arr = [];
	models.each(function(){
		arr.push($(this).data());
	})
	console.log(arr);
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
		var d = Date.now().toString(), l = d.length;
		d = Number(d.slice(0, l - 3));
		var s = {
			'pending':[d],'processed':null,'dropped':null,'delivered':null,'deferred':null,
			'bounce':null,'open':null,'click':null,'spamreport':null,'unsubscribe':null,'group_unsubscribe':null,'group_resubscribe':null
		};
		obj = {
			type: justResponse($("#message_type")),
			message: $("#createMessage").find(".summernote").summernote('code'),
			status: JSON.stringify(s)
		};
		if ($("#subject").is(":visible")){
			obj['subject'] = justResponse($("#subject"));
		}
	}
	else if (model == 'Template'){
		var m = $('.summernote').filter(function(){
			return $(this).parent().is(":visible");
		}).summernote('code');
		obj = {
			name: justResponse($("#template_name")),
			markup: m
		}
	}
	// console.log(obj);
	return obj;
}
function turnToBoolean(value){
	return (value == "yes") ? true : false;
}