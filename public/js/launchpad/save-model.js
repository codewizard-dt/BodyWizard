function initializeNewModelForms(){
	initializeMessageForm();
	initializeTemplateForm();
	var saveModelBtns = $(".createNew, .editExisting").find(".submitForm").filter(function(){
		return $(this).data('updated') != true;
	});
	saveModelBtns.data('submission',false);
	saveModelBtns.on("click",saveModel);
	saveModelBtns.data('updated',true);

	// var modalBtns = $(".button").filter(".createNew, .editExisting").filter(function(){
	// 	return $(this).data('initialized') != true ;
	// });
	modalBtns = filterUninitialized(".button.createNew, .button.editExisting");
	modalBtns.on("click",openModal);
	modalBtns.data('initialized',true);

	removePasswordInputs();
}
function getDefaultTemplate(form){
	if (!defaultTemplateInfo){
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
	                var m = data.markup, s = data.subject, subjectInput = form.find('input').filter(function(){
	                	return $(this).attr('name') != undefined && $(this).attr('name').includes('subject');
	                });
	                defaultTemplateInfo = data;
     	            console.log("STORING DEFAULT",defaultTemplateInfo);
	                form.find('.summernote').summernote('code',m);
	                subjectInput.val(s);                	
	            }
	        }
	    })	
	    console.log('b');	
	}else{
		console.log('a');
        var m = defaultTemplateInfo.markup, s = defaultTemplateInfo.subject, subjectInput = form.find('input').filter(function(){
	        return $(this).attr('name') != undefined && $(this).attr('name').includes('subject');
        });
        form.find('.summernote').summernote('code',m);
        subjectInput.val(s);                	
	}
}
function initializeTemplateForm(){
	var forms = filterUninitialized("#createTemplate, #editTemplate");
	forms.each(function(){
		var section = $(this).find(".section").first();
		$("<div/>",{
			class: 'summernote'
		}).appendTo(section);
	})
	if (forms.length != 0){
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
			getDefaultTemplate($("#createTemplate"));
		},500);
	}
	forms.data('initialized',true);
}
function initializeMessageForm(){
	var form = filterUninitialized("#createMessage");
	if (form.length != 0){
		form.find(".rich_text_message").addClass('summernote');
		setTimeout(function(){
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
			getDefaultTemplate($("#createMessage"));
		},500);
	}
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
			var u = modal.find(".username"), e = modal.find(".email_address"), p = modal.find(".phone_number");
			if (!finalizePhone(p) || !finalizeEmail(e) || !finalizeUsername(u)){return false;}
			var userid = $(".optionsNav").find(".name").data('userid');
			model = 'User';
			uid = userid;
		}

		var method = modal.hasClass("createNew") ? "POST" : "PATCH",
			url = "/save/" + model;
		if (method == "PATCH"){
			uid = (!uid) ? modal.data('uid') : uid;
			url += "/" + uid;
		}

		columnObj = constructColumnObj(model, form);
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
	$.ajax({
		url: url,
		method: method,
		data: dataObj,
		success:function(data){
			$("#booknow").find('.active').removeClass('active');
			if (data == 'checkmark'){
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
			}else if(data == 'no changes'){
				// do nothing
			}else if (model == 'Appointment'){
				blurTopMost("#checkmark");
				delayedUnblurAll(1200);
				refreshAppointmentFeed(data); 
			}else{
				if (data['errors'] != undefined){
					var str = [];
					$.each(data['errors'],function(attr,message){
						str.push(message);
					})
					$("#Error").find(".message").html("<h3>Server Error</h3>"+str.join("<br>"));
					blurTopMost("#Error");
				}else{
					$("#Error").find(".message").html("<h3>Server error</h3><div>Apologies, there was an unspecified error in our server.</div>");
					blurTopMost("#Error");					
				}
			}
		},
		headers: {"X-Current-Uids":JSON.stringify(uidList)}
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
function constructColumnObj(model, form){
	var obj = {};
	if (model == 'Service'){
		obj = {
			name: justResponse(form.find(".service_name")),
			description_calendar: justResponse(form.find(".description_for_scheduling_and_website")),
			description_admin: justResponse(form.find(".description_for_invoicing_and_superbills")),
			duration: justResponse(form.find(".duration")).split(" ")[0],
			price: justResponse(form.find(".price")).split(" ")[0]
		}
	}
	else if (model == 'Code'){
		obj = {
			name: justResponse(form.find(".code_as_used_for_billing_and_invoicing")),
			code_type:  justResponse(form.find(".code_type")),
			code_description: justResponse(form.find(".code_description")),
			key_words: justResponse(form.find(".keywords"))
		}
		if (form.find(".which_version_of_icd").is(":visible")){
			obj['icd_version'] = justResponse(form.find(".which_version_of_icd"))
		}
	}
	else if (model == 'ServiceCategory'){
		obj = {
			name: justResponse(form.find(".category_name")),
			description: justResponse(form.find(".category_description"))
		}
	}
	else if (model == 'Diagnosis'){
		var type = form.find(".CurrentDiagnosis").data('dxtype');
		var affectInput = form.find(".itemFU").filter(function(){
			return $(this).find(".q").text().includes("diagnosis can affect");
		}).find('.answer');
		obj = {
			name: justResponse(form.find(".diagnosis_name")),
			category: justResponse(form.find(".what_type_of_diagnosis_is_this")),
			affects: justResponse(affectInput),
			medicine_type: type
		}
	}
	else if ($.inArray(model,['Patient','Practitioner','StaffMember','User']) > -1){
		obj = {
			// user_type: (justResponse(form.find(".select_user_type")) == null) ? "patient" : justResponse(form.find(".select_user_type")),
			// is_admin: turnToBoolean(justResponse(form.find(".grant_admin_privileges"))),
			date_of_birth: justResponse(form.find(".date_of_birth")),
			first_name: justResponse(form.find(".first_name")),
			middle_name: justResponse(form.find(".middle_name")),
			last_name: justResponse(form.find(".last_name")),
			preferred_name: (justResponse(form.find(".preferred_name")) != "") ? justResponse(form.find(".preferred_name")) : null,
			phone: justResponse(form.find(".phone_number")),
			email: justResponse(form.find(".email_address")),
			username: (justResponse(form.find(".username")) == "") ? justResponse(form.find(".email_address")) : justResponse(form.find(".username"))
		}
		if (form.find(".select_user_type").is(":visible")){obj['user_type'] = justResponse(form.find(".select_user_type"));}
		if (form.find(".grant_admin_privileges").is(":visible")){obj['is_admin'] = turnToBoolean(justResponse(form.find(".grant_admin_privileges")));}
	}
	else if (model == 'Message'){
		var type = justResponse(form.find(".message_type"));
		if (type == 'Email' || type == 'Secure Portal Message'){
			obj = {
				type: type,
				message: form.find(".summernote").summernote('code'),
				subject: justResponse(form.find(".subject"))
			};
		}else if (type == 'SMS'){
			obj = {
				type: type,
				message: justResponse(form.find(".plain_text_message"))
			};
		}
	}
	else if (model == 'Template'){
		var m = $('.summernote').filter(function(){
			return $(this).parent().is(":visible");
		}).summernote('code');
		obj = {
			name: justResponse(form.find(".template_name")),
			markup: m,
			type: justResponse(form.find(".what_type_of_template_is_this")),
		}
		if (form.find(".default_subject_line").val() != ""){
			obj['subject'] = form.find(".default_subject_line").val();
		}
	}
	else if (model == 'Complaint'){
		obj = {
			name: justResponse(form.find(".complaint_name")),
			complaint_type: justResponse(form.find(".complaint_category"))
		}
	}
	else if (model == "Appointment"){
		var dateTime = moment(form.find(".date").val() + " " + form.find(".time").val(), "MM/DD/YYYY hh:mmA");
		dateTime = dateTime.format("YYYY-MM-DD kk:mm:ss");
		obj = {
			date_time: dateTime,
			duration: form.find(".duration").val()
		}
	}
	// console.log(obj);
	return obj;
}
function turnToBoolean(value){
	return (value == "yes") ? true : false;
}