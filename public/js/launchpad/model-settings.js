$(document).ready(function(){
	var settingsBtns = $(".settingsForm").find(".submitForm").filter(function(){
		return $(this).data('updated') != true;
	});
	settingsBtns.off("click",submitForm);
	settingsBtns.on("click",saveSettings);
	settingsBtns.data('updated',true);

	var model = $(".settingsForm").data('model'), json = $("#ModelSettings").closest('.modalForm').data('settingsjson'), form = $("#ModelSettings");

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
		console.log($("#ServiceMap").data('currentaddonservices'));
	}
	if (json != undefined){
	    fillForm(json,form);
	}

    $(".settingsForm").on("mousedown touchstart",function(e){
        var btn = $(".displayOptions").filter(function(){return $(this).find(".options").is(":visible");}).find(".showOptions"), t = $(e.target);
        if (btn.length > 0 && t.closest(".options").length == 0 && !t.hasClass("showOptions")){btn.click();}
    })
})

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
	var form = $("#ModelSettings"), modal = form.closest(".modalForm"), model = modal.data('model'),
		obj = checkForm(form), connectedModelArr = checkConnectedModels(model), uid = modal.data('uid'),
		url = "/save/settings/" + model + "/" + uid, columnObj = constructColumnSettingsObj(model),
		settings = constructEasyAccessList(model);

	if (model == 'Form'){
		saveSectionSettings();
	}
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
			is_addon: turnToBoolean(justResponse($("#is_this_service_an_add-on_type_service"))),
			new_patients_ok: turnToBoolean(justResponse($("#is_this_service_available_for_new_patients")))
		}
		if ($("#is_this_service_only_for_new_patients").is(":visible")){
			obj['new_patients_only'] = turnToBoolean(justResponse($("#is_this_service_only_for_new_patients")));
		}
		if ($("#is_this_service_only_available_as_an_add-on").is(":visible")){
			obj['addon_only'] = turnToBoolean(justResponse($("#is_this_service_only_available_as_an_add-on")));
		}
		if ($("#to_which_other_services_can_this_service_be_added").is(":visible")){
			var val = justResponse($("#to_which_other_services_can_this_service_be_added")), serviceIds = null, services, map = $("#ServiceMap").data('map');
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
			form_type: justResponse($("#select_form_type"))
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
		obj['form_type'] = justResponse($("#select_form_type"));
		obj['admin_only'] = (justResponse($("#require_admin_privileges_to_use_this_form"))!=="") ? justResponse($("#require_admin_privileges_to_use_this_form")) : "no restriction";
		obj['portal_listing'] = (justResponse($("#add_this_form_to_patient_portal"))!==null) ? justResponse($("#add_this_form_to_patient_portal")) : "never";
	}
	if (obj == {}){obj = null;}
	// console.log(obj);
	return obj;	
}
