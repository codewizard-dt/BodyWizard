$(document).ready(function(){

})
function initializeSettingsForm(){
	var settingsBtns = $(".settingsForm").find(".submitForm").filter(function(){
		return $(this).data('updated') != true;
	});
	settingsBtns.off("click",submitForm);
	settingsBtns.on("click",saveSettings);
	settingsBtns.data('updated',true);

	var settingsForm = filterUninitialized('.settingsForm');
	if (settingsForm.length > 0){
		var model = $(".settingsForm").data('model'), json = $(".settingsForm").data('settingsjson'), form = $("#ModelSettings");

		if (model == 'Form'){
			var target, sections;
			$(".submitForm").first().remove();
			target = $("#"+$(".settingsForm").data('target'));
			sections = target.find(".section");

	        var template = $(".template").filter("[data-type='section']"), 
	        	blockCss = {
	        		backgroundColor: "rgba(130,130,130,0.2)",
	        		opacity: '1'
	        	}, dynamicBtns = template.find("#dynamic").find("li");
	        
	        template.find(".plzselect").remove();
	        template.find("#complaint_types").hide().css("font-size","0.9em");
	        template.on('click','li',updateSectionOptions);
	        dynamicBtns.on('click',function(){
	        	var p = $(this).closest(".displayOptions"), t = p.find("#complaint_types"), v = $(this).data('value');

	       		var h4 = t.prev().is("h4");
	        	if (v == 'display based on complaint type'){
	        		if (!h4){
		        		$("<h4/>",{
		        			text: "Section will only display when treating one of the selected complaint types"
		        		}).insertBefore(t);
		        		$("<h4/>").insertAfter(t);        			
	        		}
	        		slideFadeIn(t);
	        	}else{
	        		if (h4){
		        		t.prev().remove();
		        		t.next().remove();
	        		}
	        		slideFadeOut(t);
	        		t.find('.active').removeClass('active');
	        	}        		
	        })
	        sections.each(function(){
	        	$("<div class='block'/>").css(blockCss).appendTo($(this));
	            template.clone(true).appendTo($(this).find(".block")).removeClass("template").show();
	            $(this).children(".requireSign").remove();
	        });
	        $(".showOptions").on('click',showOptions);
		}else if (model == 'Service'){
			$("#ServiceMap").insertAfter($("#to_which_other_services_can_this_service_be_added").closest(".itemFU")).hide();
			$("#to_which_other_services_can_this_service_be_added").on('click',"li",function(){
				var value = $(this).data('value');
				if (value == "select which service(s)"){
					slideFadeIn($("#ServiceMap"));
				}else{
					slideFadeOut($("#ServiceMap"));
				}
			})
			// console.log($("#ServiceMap").data('currentaddonservices'));
		}

		if (json != undefined){
		    fillForm(json,form);
		}

	    $(".settingsForm").on("mousedown touchstart",function(e){
	        var btn = $(".displayOptions").filter(function(){return $(this).find(".options").is(":visible");}).find(".showOptions"), t = $(e.target);
	        if (btn.length > 0 && t.closest(".options").length == 0 && !t.hasClass("showOptions")){btn.click();}
	    })	
	}
	settingsForm.data('initialized',true);
}
var defaultSectionOptions = {
	"dynamic":["always display"],
	"complaint_types":[]
}

function showOptions(){
    var p = $(this).parent(), t = $(this), 
    	sectionOptions = ($(this).closest(".section").data('settings') != undefined) ? $(this).closest(".section").data('settings') : defaultSectionOptions, 
    	item;
    $(".showOptions").filter(function(){return $(this).text() == 'close';}).click();
    $.each(sectionOptions,function(name,value){
        item = p.find("#"+name);
        if (item.is(".radio")){
        	item.find("li[data-value='"+value[0]+"']").addClass('active');
        }else if (item.is(".checkboxes")){
        	item.find("li").filter(function(){
        		return $.inArray($(this).data('value'),value) > -1;
        	}).addClass('active');
        }
    })
    slideFadeIn(p.find(".options"));
    p.addClass('active');
    $(this).text('close');
    $(this).off('click',showOptions).on('click',hideOptions);
}
function updateSectionOptions(){
	var section = $(this).closest(".section"), p = $(this).closest(".displayOptions"), settings = p.find("ul"), name, value = [], active, settingsObj = {};
	settings.each(function(s,setting){
		value = [];
		name = $(setting).data("name");
		active = $(setting).find('.active');
		active.each(function(){
			value.push($(this).data('value'));
		});
		settingsObj[name] = value;
	})
	section.data('settings',settingsObj);
	// console.log(section.data('settings'));
}
function saveSectionSettings(){
	var sections = $("#SectionSettings").find(".section"), json = $("#SectionSettings").data('json'), 
		uid = $("#SectionSettings").find(".formDisp").data('uid'), obj, sectionsObj = json['sections'], section;

	for (x = 0; x < sections.length; x++){
		section = $(sections[x]);
		obj = section.data('settings');
		json['sections'][x]['settings'] = obj;
	}
	obj = JSON.stringify(json);
	$.ajax({
		method:"PATCH",
		url: "/save/Form/" + uid,
		data: {
			full_json: obj
		}
	})
}
function hideOptions(){
    var p = $(this).parent(), t = $(this);
    p.removeClass('active');
    slideFadeOut(p.find(".options"),400,function(){t.text('dynamic display settings');});
    $(this).off('click',hideOptions).on('click',showOptions);
}
function saveSettings(){
	var form = $("#ModelSettings"), formWrap = form.closest(".settingsForm"), model = formWrap.data('model'),
		obj = checkForm(form), connectedModelArr = checkConnectedModels(model), uid = formWrap.data('uid'),
		url = "/save/settings/" + model + "/" + uid, columnObj = constructColumnSettingsObj(model, form),
		settings = constructEasyAccessList(model, form);

	if (model == 'Form'){
		saveSectionSettings();
	}
	if (obj){
		blurTopMost("#loading");
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
					blurTopMost("#checkmark");
					setTimeout(function(){
						reloadTab();
					},800)
				}else if (data != 'no changes'){
					console.log(data);
					$("#Error").find(".message").text("Error saving settings");
					blurTopMost("#Error");
				}
			},
			error:function(e){
				console.log(e);
				$("#Error").find(".message").text("Server Error");
				blurTopMost("#Error");
			}
		})
	}else{
		return false;
	}
}
function constructColumnSettingsObj(model,form){
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
function constructEasyAccessList(model, form){
	var obj = {};
	if (model == 'Service'){
	}
	else if (model == 'Code'){
	}
	else if (model == 'ServiceCategory'){
	}
	else if (model == 'Form'){ 
		var requirement = form.find(".how_often").is(":visible") ? justResponse(form.find(".how_often")) : form.find(".require_this_form_for_all_new_patients_at_registration");
		obj['form_type'] = justResponse(form.find(".select_form_type"));
		obj['admin_only'] = (justResponse(form.find(".require_admin_privileges_to_use_this_form"))!==null) ? justResponse(form.find(".require_admin_privileges_to_use_this_form")) : "no restriction";
		obj['portal_listing'] = (justResponse(form.find(".add_this_form_to_patient_portal"))!==null) ? justResponse(form.find(".add_this_form_to_patient_portal")) : "never";
		obj['in_office'] = (justResponse(form.find(".will_patients_complete_this_form_in-office_only"))!==null) ? justResponse(form.find(".will_patients_complete_this_form_in-office_only")) : "never";
		// obj['required_every'] = justResponse(form.find(".require_this_form_to_be_completed_periodically").closest(".item").find("#how_often"));
		if (form.find(".how_often").is(":visible")){
			obj['required'] = justResponse(form.find(".how_often"));
		}else{
			obj['required'] = justResponse(form.find(".require_once_at_registration")) == 'yes' ? 'at registration only' : 'never';
		}
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