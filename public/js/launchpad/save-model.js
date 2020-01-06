$(document).ready(function(){
	var saveModelBtns = $(".createNew, .editExisting").find(".submitForm").filter(function(){
		return $(this).data('updated') != true;
	});
	saveModelBtns.data('submission',false);
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

	removePasswordInputs();

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
		});
		// var box = $("#createTemplate").find('.summernote');
        $.ajax({
            url: '/retrieve/Template/default',
            success: function(data){
                if (data == 'not found'){
                	confirm('Default Template','Create a template named "Default" to make your life easier! It will automatically load each time you send a message. Would you like to create a default template now?','yes take me there','no not right now');
                	var wait = setInterval(function(){
                		if (confirmBool !== undefined){
                			if (confirmBool){
                				unblurTopMost();
                				$("#template-index").find('.title').click();
                			}
                			confirmBool = undefined;
                			clearInterval(wait);
                		}
                	},100)
                }else{
	                var m = data.markup, s = data.subject;
	                $("#createTemplate").find('.summernote').summernote('code',m);
	                $("#createTemplate").find("#default_subject_line").val(s);                	
                }
            }
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
          	  ['font', ['bold', 'underline', 'italic', 'strikethrough', 'clear']],
	          ['fontname', ['fontname']],
	          ['color', ['color']],
	          ['para', ['ul', 'ol', 'paragraph', 'height']],
	          ['insert', ['link', 'picture','hr']],
	          ['view', ['fullscreen', 'codeview', 'undo', 'redo', 'help']],
	        ]
		});
	form.data('initialized',true);
}
function openModal(){
	var model = $(this).data('model'),
		id = $(this).hasClass('createNew') ? "#create"+model : "#edit"+model,
		p = modalOrBody($(this)), lowerCaseModel;
	// SPECIAL STEP FOR CREATING A FORM
	if (model=='Form'){
		$("#forms-create").find('.title').click();
	}else{
		blurElement(p,id);
	}
	if ($.inArray(model,['Patient','User','Practitioner','StaffMember']) > -1 && $("#select_user_type").length > 0 && $("#select_user_type").is(":visible")){
		lowerCaseModel = (model == "StaffMember") ? "staff member" : model.toLowerCase();
		$("#select_user_type").find("li").filter(function(){
			return $(this).data('value') == lowerCaseModel;
		}).click();
	}
}
function updateEditForm(modal, dispModel, name){
	var ot = null, t, otsplice;
    $(modal).find("h1, h2, .q").each(function(){
    	if ($(this).data('originaltext') != undefined){
    		ot = $(this).data('originaltext');
    		$(this).text(ot);
    	}else{
    		$(this).data('originaltext',$(this).text());
    		otsplice = $(this).text().replace("Add ","Edit ").replace("New ","This ").replace("This " + dispModel, "");
    		$(this).data('originalsplice',otsplice);
    	}
        // $(this).data('originaltext',t);
        t = $(this).text();
        t = t.replace("Add ","Edit ").replace("New ","This ").replace("This " + dispModel, "'" + name + "'");
        $(this).text(t);
    });
}
function removePasswordInputs(){
	$(".noPW").find(".item").filter(function(){
		return $(this).text().toLowerCase().includes("password");
	}).remove();

	var userForms = $(".modalForm").filter(function(){
		return $.inArray($(this).data('model'),['Patient','User','Practitioner','StaffMember']) > -1;
	})
	// console.log(userForms);
    var emailItems = userForms.find(".item").filter(function(){
        return $(this).children(".question").text().toLowerCase().includes("email");
    });
    emailItems = filterByData(emailItems,'validation','undefined');
    emailItems.find("input").on("keyup",validateEmail);
    emailItems.data('validation',true);

    var phoneItems = userForms.find(".item").filter(function(){
        return $(this).children(".question").text().toLowerCase().includes("phone");
    });
    phoneItems = filterByData(phoneItems,'validation','undefined');
    phoneItems.find("input").on("keyup",validatePhone);
    phoneItems.data('validation',true);

    var username = filterUninitialized($("#username"));
    username.on("keyup",validateUsername);
    username.data('initialized',true);
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
function saveModel(includeInvisible = false){
	if ($(this).hasClass('disabled')){return;}
	// CONSTRUCT DATA OBJECT
		var form = $(this).closest('.formDisp'), modal = $(this).closest('.createNew, .editExisting');
		if (modal.data('model') == 'Appointment'){includeInvisible = true;}
		var	obj = checkForm(form, includeInvisible); 
		if (!obj){return false;}
		var model = modal.data('model'), connectedModelArr = checkConnectedModels(model), dataObj, columnObj, url, uid = null;
		if (!connectedModelArr){return false;}

		if ($.inArray(model,['Patient','User','Practitioner','StaffMember']) > -1){
			var u = modal.find("#username"), e = modal.find("#email_address"), p = modal.find("#phone_number");
			if (!finalizePhone(p) || !finalizeEmail(e) || !finalizeUsername(u)){return false;}
			var userid = $(".optionsNav").find(".name").data('userid');
			if (modal.find("#NewUserRegistration").length > 0){model = 'User';uid = userid;}
		}

		var method = modal.hasClass("createNew") ? "POST" : "PATCH",
			url = "/save/" + model;
		if (method == "PATCH"){
			uid = (!uid) ? modal.data('uid') : uid;
			url += "/" + uid;
		}

		columnObj = constructColumnObj(model);
		if (!columnObj){return false;}

		var noFullJson = ['Message','Attachment'];
		
		dataObj = {
			connectedModels: JSON.stringify(connectedModelArr),
			// columnObj: JSON.stringify(columnObj)
			columnObj: columnObj
		}
		if ($.inArray(model,noFullJson) == -1){
			dataObj['full_json'] = JSON.stringify(obj);
		}
		if (model == 'Message'){
			dataObj['recipient_ids'] = JSON.stringify($("#select_recipients").data('uidArr'));
		}

	var p = modalOrBody($(this)),
		m = parentModalOrBody($(this));
	// blurElement(p,"#loading");
	blurTopMost('#loading');
	var uidList = getUids() ? getUids() : {};
	alert(uidList);
	$.ajax({
		url: url,
		method: method,
		data: dataObj,
		success:function(data){
			console.log(data);
			$("#booknow").find('.active').removeClass('active');
			if (model == 'Appointment'){
				blurTopMost("#checkmark");
				delayedUnblurAll(1200);
				refreshAppointmentFeed(data); 
				// calendar.refetchEvents();
			}else if (data == 'checkmark'){
				if (m.is("body")){
					blurTopMost("#checkmark");
					delayedReloadTab();
				}else{
					blurTopMost("#checkmark");
					setTimeout(function(){
						blurTopMost("#loading");
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
					blurTopMost("#Error");
				}
				// else{
				// 	$("#Error").find(".message").html(data);
				// 	$("#Error").find(".submit").data('error',data);
				// 	console.log(data);
				// }
			}
		},
		headers: {"X-CURRENT-UIDS":JSON.stringify(uidList)}
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
            	console.log(data);
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
            }
        })
}
function checkConnectedModels(model){
	var models = $(".connectedModel").filter(function(){
		return $(this).data('connectedto') == model;
	}), arr = [], noPractitioner = false;
	models.each(function(){
		if ($(this).data('model') == 'Practitioner' && $(this).data('connectedto') == 'Appointment' && 
			($(this).data('uidArr') == undefined || $(this).data('uidArr').length == 0)){
			noPractitioner = true;
		}else{
			arr.push($(this).data());
		}
	})
	if (model == 'Appointment' && noPractitioner){
		var form = $("#createAppointment, #editAppointment").filter(":visible"), momentObj = form.data('dateTime'), duration = form.find("#duration").val(), services = $("#ServiceListModal").data('uidArr'), allAvailable = availablePractitioners(momentObj, duration, services), randomlySelected;
		if (allAvailable.length != 0){
			randomlySelected = randomArrayElement(allAvailable);
			$("#PractitionerListModal").data('uidArr',[randomlySelected.practitioner_id]);
			arr.push($("#PractitionerListModal").data());
		}else{
			feedback('No Available Practitioners','There are no practitioners on the schedule at this time that offer '+commaSeparated(getColumnById("Service",services),true)+". To override a practitioner's schedule, select them on the previous screen.");
			return false;
		}
	}
	if (model == 'Appointment' && defaultPatientInfo != undefined){
		var obj = {
			connectedto: 'Appointment',
			model: 'Patient',
			number: 'one',
			relationship: 'morphedByMany',
			uidArr: [defaultPatientInfo.id]
		};
		arr.push(obj);
	}
	return arr;
}
function constructColumnObj(model){
	var obj = {};
	if (model == 'Service'){
		obj = {
			name: justResponse($("#service_name")),
			description_calendar: justResponse($("#description_for_scheduling_and_website")),
			description_admin: justResponse($("#description_for_invoicing_and_superbills")),
			duration: justResponse($("#duration")).split(" ")[0],
			price: justResponse($("#price")).split(" ")[0]
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
	else if ($.inArray(model,['Patient','Practitioner','StaffMember','User']) > -1){
		obj = {
			// user_type: (justResponse($("#select_user_type")) == null) ? "patient" : justResponse($("#select_user_type")),
			// is_admin: turnToBoolean(justResponse($("#grant_admin_privileges"))),
			date_of_birth: justResponse($("#date_of_birth")),
			first_name: justResponse($("#first_name")),
			middle_name: justResponse($("#middle_name")),
			last_name: justResponse($("#last_name")),
			preferred_name: (justResponse($("#preferred_name")) != "") ? justResponse($("#preferred_name")) : null,
			phone: justResponse($("#phone_number")),
			email: justResponse($("#email_address")),
			username: (justResponse($("#username")) == "") ? justResponse($("#email_address")) : justResponse($("#username"))
		}
		if ($("#select_user_type").is(":visible")){obj['user_type'] = justResponse($("#select_user_type"));}
		if ($("#grant_admin_privileges").is(":visible")){obj['is_admin'] = turnToBoolean(justResponse($("#grant_admin_privileges")));}
	}
	else if (model == 'Message'){
		// var d = Date.now().toString(), l = d.length;
		// d = Number(d.slice(0, l - 3));
		// var s = {
		// 	'pending':[d],'processed':null,'dropped':null,'delivered':null,'deferred':null,
		// 	'bounce':null,'open':null,'click':null,'spamreport':null,'unsubscribe':null,'group_unsubscribe':null,'group_resubscribe':null
		// };
		var type = justResponse($("#message_type"));
		if (type == 'Email' || type == 'Secure Portal Message'){
			obj = {
				type: type,
				message: $("#createMessage").find(".summernote").summernote('code'),
				subject: justResponse($("#subject"))
			};
		}else if (type == 'SMS'){
			obj = {
				type: type,
				message: justResponse($("#plain_text_message"))
			};
		}
		// if ($("#subject").is(":visible")){
		// 	obj['subject'] = justResponse($("#subject"));
		// }
	}
	else if (model == 'Template'){
		var m = $('.summernote').filter(function(){
			return $(this).parent().is(":visible");
		}).summernote('code');
		obj = {
			name: justResponse($("#template_name")),
			markup: m,
			type: justResponse($("#what_type_of_template_is_this")),
		}
		if ($("#default_subject_line").val() != ""){
			obj['subject'] = $("#default_subject_line").val();
		}
	}
	else if (model == 'Complaint'){
		obj = {
			name: justResponse($("#complaint_name")),
			complaint_type: justResponse($("#complaint_category"))
		}
	}
	else if (model == "Appointment"){
		var form = $("#createAppointment").is(":visible") ? $("#createAppointment") : $("#editAppointment"),
			dateTime = moment(form.find("#date").val() + " " + form.find("#time").val(), "MM/DD/YYYY hh:mmA");
		dateTime = dateTime.format("YYYY-MM-DD kk:mm:ss");
		obj = {
			date_time: dateTime,
			duration: form.find("#duration").val()
		}
	}
	// console.log(obj);
	return obj;
}
function turnToBoolean(value){
	return (value == "yes") ? true : false;
}