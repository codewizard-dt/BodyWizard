// var action = undefined, appointmentDetails = {services:null,date:null,time:null,datetime:null,patient:null,practitioner:null}, defaultPatientInfo = null, defaultPractitionerInfo = null, activeForm = null, category = null, practitioners, practiceTz, clientTz, patientInfo = {}, calendar, serviceConfirmBtn, dateTimeConfirmBtn, allowOverride = false, serviceOverride = false;

var appointment = {
	current: {
		uid: null,
		uuid: null,
		patient: null,
		practitioner: null,
		services: null,
		duration: null,
		date: null,
		time: null,
		datetime: null,
		chartnote: null,
		invoice: null,
		forms: null,
		changes: null,
	},
	previous: {
		attributes: {
			practitioner: null,
			services: null,
			datetime: null,			
		},
		set: function(updateObj){
			for (let attr in updateObj){appointment.previous.attributes[attr] = updateObj[attr]}
			log({previous:appointment.previous.attributes},'previous settings');
		},
		updateChanges: function(){
			let now = appointment.current, then = appointment.previous.attributes;
			let changes = model.attr.compare([
				['practitioner_id',then.practitioner,now.practitioner],
				['services',then.services,now.services],
				['date_time',then.datetime,now.datetime],
			]);
			appointment.current.changes = changes;
			return changes;
		},
	},
	list: [],

	get: function(uid){
		return appointment.list.find(appt => appt.extendedProps.uid == uid);
	},
	has: function(attr){
		if (typeof attr == 'string'){
			let val = appointment.current[attr];
			return (val == undefined || val == null) ? false : true;
		}else{
			for (let prop of attr){
				if (!appointment.has(prop)) return false;
			}
			return true;
		}
	},
	isComplete: function(){
		return appointment.has(['patient','datetime','services','practitioner']);
	},
	requires: function(){
		let missing = [];
		for (let attr of ['patient','date','time','services','practitioner']){
			if (!appointment.has(attr)) missing.push(attr);
		}
		return missing;
	},
	defaultPatient: null,
	defaultPractitioner: null,
	bypassCheck: false,
	set: function(updateObj = null){
		try{
			if (typeof updateObj != 'object') throw({error:'Invalid object',object:updateObj});
			if (updateObj !== null){
				log({updateObj});
				$.each(updateObj,function(attr,val){
					if (attr == 'services'){
						let isObj = (typeof val == 'object');
						if (val === null || (isObj && val.isEmpty())){appointment.current.services = null;}
						else if (typeof val == 'object'){appointment.current.services = val;}
						else if (appointment.current.services == null){appointment.current.services = [val];}
						else {appointment.current.services.push(val);}
						appointment.current.duration = appointment.services.getDuration();
					}else if ($.inArray(attr, ['uid', 'uuid','patient','practitioner','date','time','chartnote','invoice','forms']) > -1){
						appointment.current[attr] = val;
						if (attr == 'patient') {
							uids.set('Patient',val);
							appointment.services.override = false;
						}
						if (attr == 'date') {
							appointment.current.time = null;
							appointment.current.datetime = null;
						}
						if (attr == 'time' && appointment.has(['date','time'])) {
							appointment.current.datetime = moment(appointment.current.date + " " + appointment.current.time, "M/D/YYYY h:mma");
						}
					}else if (attr == 'datetime'){
						appointment.current.datetime = val;
						appointment.current.date = appointment.current.datetime.format("M/D/YYYY");
						appointment.current.time = appointment.current.datetime.format("h:mma");
					}else{
						let message = 'invalid attribute', error = {attribute:attr};
						log({message,error});
					}
				})
				// if (appointment.current.datetime && !appointment.has('date')) appointment.set({date:appointment.current.datetime.format("M/D/YYYY")})
				// if (appointment.current.datetime && !appointment.has('time')) appointment.set({time:appointment.current.datetime.format("h:mma")})
				// if (appointment.current.datetime && (!appointment.current.date || !appointment.current.time)){
				// 	appointment.current.date = appointment.current.datetime.format("M/D/YYYY");
				// 	appointment.current.time = appointment.current.datetime.format("h:mma");
				// }
				if (appointment.current.datetime) appointment.schedules.check.momentObj = appointment.current.datetime;
			}
		}catch(error){
			if (user.isSuper()) console.log(error);
		}
		if (appointment.defaultPractitioner) appointment.current.practitioner = appointment.defaultPractitioner.practitioner_id;
		if (appointment.has('patient') && !appointment.patient.info) appointment.patient.info = appointment.patient.getInfo();
		if (appointment.has('uid')) appointment.previous.updateChanges();
		else appointment.current.changes == null;
		appointment.update.all(updateObj);
	},
	update: {
		all: function(updateObj = null){
			if (appointment.form.active){
				appointment.update.hiddenValues();
				appointment.update.visibleDetails();
				if (appointment.has('uid')) {
					appointment.save.btn.text('save changes');
					if (appointment.current.changes.isEmpty()) appointment.save.btn.addClass('disabled');
					else appointment.save.btn.removeClass('disabled');	
				}else{
					appointment.save.btn.text('book appointment');
					if (appointment.isComplete()) appointment.save.btn.removeClass('disabled');
					else appointment.save.btn.addClass('disabled');					
				}
				// log(appointment.current, `current duration is ${appointment.current.duration}`);
				appointment.schedules.check.duration = appointment.current.duration;
				
				if (updateObj.date || updateObj.services){
					// appointment.schedules.check.updateDayAvailability(updateObj.date || appointment.current.date);
					appointment.update.times();
				}
				if (updateObj.services && appointment.has('datetime')) {
					let check = appointment.schedules.check.this(appointment.current.datetime, appointment.current.duration);
					if (!check && !appointment.bypassCheck) {
						let options = {goback: appointment.form.service.remove, callback: unblur};
						setTimeout(appointment.schedules.check.displayErrors.bind(null,options),400);
					}
					console.log({check},'service datetime check');
				}
				if (updateObj.patient) appointment.update.servicesLabel();
			}
			if (user.is('practitioner')) appointment.update.flow.practitioner();
		},
		flow: {
			patient: function(){},
			practitioner: function(){
				if (appointment.has('datetime')){
					if (!appointment.has('patient')){
						appointment.update.flow.allow(['patient','date','time','practitioner']);
						appointment.update.flow.hide(['services']);						
					}else{
						appointment.update.flow.allow(['patient','date','time','practitioner','services']);
						if (appointment.has('practitioner') && !appointment.has('services')) appointment.form.details.open('services');
					}
				}
			},
			allow: function(details){
				let matches = details.map(detail => appointment.form.details.getOpener(detail));
				matches.forEach(function(detailOpener,o){
					let attr = detailOpener.data('value');
					if (appointment.has(attr)){
						detailOpener.show().text('change');
					}else{
						detailOpener.show().text('select');
					}
				});
				if (appointment.defaultPractitioner) appointment.update.flow.hide(['practitioner']);
				if (appointment.defaultPatient || appointment.current.uid) appointment.update.flow.hide(['patient']);
			},
			hide: function(details){
				let matches = details.map(detail => appointment.form.details.getOpener(detail));
				matches.forEach(function(opener,o){
					opener.hide();
				});
			},
		},
		hiddenValues: function(){
			appointment.update.categories();
			if (appointment.has('date')) appointment.form.active.find('.date, .DateSelector').val(appointment.current.date);
			if (appointment.has('time')) appointment.form.active.find('.time').val(appointment.current.time);
		},
		visibleDetails: function(key = null, value = null){
			if (!key) {
				let serviceList = appointment.services.getNames();
				appointment.update.visibleDetails({
					patient: appointment.has('patient') ? table.get('PatientList').getNameById(appointment.current.patient) : null,
					practitioner: appointment.has('practitioner') ? table.get('PractitionerList').getNameById(appointment.current.practitioner) : null,
					services: appointment.has('services') ? serviceList : null,
					date: appointment.has('date') ? appointment.current.date : null,
					time: appointment.has('time') ? appointment.current.time : null
				});
				$("#ServiceSummary").find(".summary").text(serviceList);
				$("#SelectServices").resetActives();
			}
			if (typeof key == 'object' && key != null){
				$.each(key,function(attr, val){
					appointment.update.visibleDetails(attr, val);
				});
			}else{
				appointment.update.detail(key, value);
			}
		},
		detail: function(key, value = null){
			if (!key) return;
			let detail = appointment.form.details.display.find('.'+key);
			detail.find('.value').text(value ? value : 'none');
			detail.find('.edit').text(value ? 'change' : 'select');
		},
		times: function(){
			if (!appointment.has('date')) return;
			// log({date:appointment.current.date},'UPDATING TIMES');
			let timeSlots = appointment.form.timeSlots, date = appointment.current.date, time = appointment.current.time, duration = appointment.schedules.check.duration, availability = appointment.schedules.check.dayAvailability[date] || [];
			// log({current:appointment.current},'updating times');
			if (time){
				timeSlots.removeClass('active');
				let currentMatch = timeSlots.filter((s,slot) => $(slot).text().replace(" ","") == time);
				currentMatch.addClass('active');				
			}else timeSlots.removeClass('active');
			// log({duration,availability,date,time});
			timeSlots.each(function(s,slot){
				let thisTime = $(slot).data('value'), momentObj = moment(`${date} ${thisTime}`,'M/D/YYYY hh:mm:ss'),
						timeOk = availability.includes(thisTime) && appointment.schedules.check.this(momentObj, duration);
				// log({thisTime,momentObj});
				if (timeOk) $(slot).data({errors:null,conflicts:null}).removeClass('disabled');
				else $(slot).data({errors:appointment.schedules.check.errors,conflicts:appointment.schedules.check.conflicts}).addClass('disabled');
			})
			// log('done updating','DONE UPDATING TIMES');

		},
		servicesLabel: function(){
			if (user.is('patient')){
				if (appointment.patient.isNew()) $("#SelectServices").find(".conditionalLabel").html("showing New Patient options only");
				else $("#SelectServices").find(".conditionalLabel").html("");
			}else{
				if (appointment.patient.isNew() && !appointment.services.override) $("#SelectServices").find(".conditionalLabel").html("showing New Patient options only <span class='override'>override</span>");
				else if (appointment.patient.isNew() && appointment.services.override) $("#SelectServices").find(".conditionalLabel").html("showing all options");
				else $("#SelectServices").find(".conditionalLabel").html("");
			}
		},
		services: function(){
			let allowedServices = appointment.services.get();
			if (allowedServices){
				appointment.form.service.elements.forEach(function(serviceEle){
					let name = serviceEle.data('value');
					allowedServices.some(service => service.name == name) ? serviceEle.show() : serviceEle.hide();
				});
				$("#NoServicesAvailable").hide();				
			}else{
				appointment.form.service.elements.forEach(function(){$(this).hide();});
				$("#NoServicesAvailable").show();
			}
		},
		categories: function(){
			appointment.services.removeFilter('category');
			if (!appointment.has('services')) appointment.services.removeFilter('services');
			if (appointment.has('patient')) {
				let list = table.get('PatientList');
				let patient = appointment.defaultPatient ? appointment.defaultPatient : list.getDataById(appointment.current.patient);
				if (!appointment.services.override) appointment.services.filter({patient});
				else appointment.services.removeFilter('patient');
			}
			if (appointment.has('services')) {
				let services = appointment.current.services;
				appointment.services.filter({services});
			}else{
				appointment.services.filter({serviceAttr: {attr: 'addon_only', value: false}});
			}
			//update categories based on allowed services
			let allowedServices = appointment.services.get();
			let allowedCategories = appointment.services.categories.filter(allowedServices);
			if (allowedServices){
				appointment.form.category.elements.forEach(function(categoryEle){
					let name = categoryEle.data('value');
					allowedCategories.some(category => category.name == name) ? categoryEle.show() : categoryEle.hide();
				});
				$("#NoServicesAvailable").hide();
			}else{
				appointment.form.category.elements.forEach(function(){$(this).hide();});
				$("#NoServicesAvailable").show();
			}
		},
		calendar: {
			feed: function(info){
				if (typeof info == 'string'){
					var feed = jsonIfValid(info);
					if (!feed){return;}
				}else if (typeof info == 'object'){
					var feed = info;
				}
				if (feed.appointments == undefined){return;}
				var appts = feed.appointments;
				appointment.list = appts;
				if ($('.calendar').exists()){
					appointment.calendar.element.getEventSourceById('appointments').remove();
					appointment.calendar.element.addEventSource({events:appts,id:'appointments'});		
				}
				// $("#AppointmentsFullCall").data('schedule',appts);
				if (feed.anon) appointment.schedules.anonEvents = feed.anon;
				var anon = (feed.anon != undefined) ? feed.anon : null;
				if (anon){$("#AnonFeed").data('schedule',anon);}
				appointment.update.calendar.eventTitles();
			},
			eventTitles: function(){
				var active = $("#ChangeTitle").find(".active"), hasActive = (active.exists()), attr, events = appointment.calendar.element.getEvents();
				if (!$(this).is('li') && hasActive) attr = active.data('value'); 
				else attr = $(this).data('value');

				if (attr == 'names') $.each(events,function(e,event){event.setProp('title', event.extendedProps.patient.name)})
				else if (attr == 'service') $.each(events,function(e,event){event.setProp('title', event.extendedProps.services.names)})
				else if (attr == 'no label') $.each(events,function(e,event){event.setProp('title', "")})

				appointment.calendar.element.rerenderEvents();
			}
		}
		
	},
	save: {
		btn: null,
		confirm: function(){
			let missing = appointment.requires(), changes = appointment.current.changes,
					isChanged = model.attr.changesIncludes.bind(changes),
					changed = model.attr.changedFrom.bind(changes);
			if (missing.isEmpty()){
				if (changes !== null && changes.isEmpty()){
					feedback('Unable To Save',"You haven't changed the appointment.");
					return;
				}

				let date = appointment.current.datetime,
						dateStr = `${appointment.current.time} on ${appointment.current.date}`,
						dateRelStr = appointment.schedules.relDateString(),
						services = appointment.form.active.find(".services.value").text(),
						patient = appointment.form.active.find(".patient.value").text(),
						newAppt = appointment.form.active.is("#createAppointment"),
						message = $(`<h3 class='pink'></h3>`),
						dateChange = isChanged('date_time'),
						oldDateTime = dateChange ? moment(changed('date_time'),'YYYY-MM-DD HH:mm:ss') : null;
				message.append(`<div class='patient'>${patient}</div>`);
				message.append(`<div class='services'>${services}</div>`);
				if (isChanged('services')) {
					$(`<div style='text-decoration:line-through;'>${table.get('ServiceList').getNameById(changed('services'))}</div>`).insertBefore(message.find('.services'));
				}
				message.append(`<div class='date_time'>${dateStr} (${dateRelStr})</div>`);
				if (dateChange) {
					let oldRelString = appointment.schedules.relDateString(oldDateTime);
					$(`<div style='text-decoration:line-through;'>${oldDateTime.format('h:mma')} on ${oldDateTime.format('M/D/YYYY')} (${oldRelString})</div>`).insertBefore(message.find('.date_time'));
				}
				// message.append(`<div class='bold date_time_rel'>appointment ${dateRelStr}</div>`);
				// if (dateChange) {
				// 	oldRelString = appointment.schedules.relDateString(oldDateTime).replace('is','was');
				// 	$(`<div class='bold' style='text-decoration:line-through;'>appointment ${oldRelString}</div>`).insertBefore(message.find('.date_time_rel'));
				// }
				confirm({
					header: newAppt ? 'Confirm New Appointment' : 'Confirm Changes to Appointment',
					message: message,
					yesBtnText: newAppt ? 'confirm new appointment' : 'confirm changes',
					noBtnText: 'cancel',
					affirmativeCallback: appointment.save.ajax,
				})
				// if (changes && !changes.isEmpty()){
				// 	changes.forEach(change => {
				// 		for (attr in change){
				// 			let old = change[attr].old, ele = $("#Confirm").find(`.${attr}`);
				// 			if (attr == 'date_time') {
				// 				let oldMoment = moment(old,'YYYY-MM-DD HH:mm:ss'),
				// 						oldRel = `was ${oldMoment.fromNow()}`,
				// 						eleRel = $("#Confirm").find(`.date_time_rel`);
				// 				old = oldMoment.format('h:mma [on] M/D/YYYY');
				// 				eleRel.css('text-decoration','line-through');
				// 				// $(`<div class='bold'>appointment ${oldRel}</div>`).insertBefore(eleRel);
				// 			}
				// 			ele.css('text-decoration','line-through');
				// 			$(`<div>${old}</div>`).insertBefore(ele);
				// 			log({ele,old,attr,change});
				// 		}
				// 	})
				// }
				// appointment.save.ajax();
			}else{
				let message = $("<div/>",{html:"<h3 class='pink'>Cannot save:</h3><ul></ul>",css:{textAlign:'left',display:'inline-block'}});
				for (let detail of missing){
					message.find('ul').append("<li>Appointment is missing "+detail.toTitleCase()+"</li>");
				}
				feedback('Appointment Incomplete',message);
			}
		},
		ajax: function(){
			let data = {
				uid: appointment.current.uid,
				columns: {
					patient_id: appointment.current.patient,
					practitioner_id: appointment.current.practitioner,
					date_time: appointment.current.datetime.format('YYYY-MM-DD HH:mm:ss'),
					duration: appointment.current.duration,
				},
				sync: {
					services: appointment.current.services
				}
			}
			if (appointment.current.uid){
				data['changes'] = appointment.current.changes;
			}
			log({data},'ajaxcall data');
			// return;
			blurTop('#loading');
			$.ajax({
				url: '/save/Appointment',
				method: "POST",
				data: data,
				success:function(result){
					appointment.update.calendar.feed(result);
					blurTop('#checkmark');
					let date = appointment.current.datetime.format('M/D/YYYY');
					unblurAll(appointment.schedules.check.updateDayAvailability.bind(null,date,true), 1000);
				}
			})
		},
	},
	delete: {
		confirm: function(){
			let date = appointment.current.datetime,
					status = ifu(appointment.current.chartnote.status,null);
			log({note:appointment.current.chartnote,status:status});
			let options = {
				header: 'Delete Appointment?',
				yesBtnText: 'yes delete now',
				noBtnText: 'dismiss',
				affirmativeCallback: appointment.delete.ajax,
			}
			if (status !== null && status !== 'not signed'){
				feedback('Unable to Delete','You are unable to delete any appointment with a signed chart note');
				return;
			}
			if (date.isBefore(moment()) && (status === null || status === 'not signed')) {
				options.message = `<h3 class='pink'>${appointment.patient.info.name}<br>${date.format('M/D/YY h:mma')}<br><span class='bold'>this appointment was ${date.fromNow()}</span></h3>`;
			}else	if (date.isAfter(moment()) && (status === null || status === 'not signed')) {
				options.message = `<h3 class='pink'>${appointment.patient.info.name}<br>${date.format('M/D/YY h:mma')}<br><span class='bold'>this appointment is ${date.fromNow()}</span></h3>`;
			}
			confirm(options);				

		},
		ajax: function(){			
			blurTop('#loading');	
			model.delete('Appointment',appointment.current.uid, function(result){
				appointment.update.calendar.feed(result);
				blurTop('#checkmark',{
					callback: unblurAll,
					delay: 800,
				});
				let date = appointment.current.datetime.format('M/D/YYYY');
				setTimeout(appointment.schedules.check.updateDayAvailability.bind(null,date,true), 1000);
			})
		},
	},
	calendar: {
		element: null,

	},
	patient: {
		info: null,
		getInfo: function(){
			if (!appointment.has('patient')) return null;
			return appointment.defaultPatient ? appointment.defaultPatient : table.get('PatientList').getDataById(appointment.current.patient);
		},
		isNew: function(){
			return appointment.patient.info ? appointment.patient.info.isnewpatient : null;
		}
	},
	services: {
		available: null,
		override: false,
		activeFilters: {},
		reset: function(){
			appointment.services.available = $("#ServiceDetails").data('details');
			// appointment.services.override = false;
			appointment.services.categories.reset();
		},
		get: function(){
			return !appointment.services.available.isEmpty() ? appointment.services.available : null;
		},
		getNames: function(){
			return appointment.has('services') ? table.get('ServiceList').getNameById(appointment.current.services).join(", ") : 'No Services';
		},
		getDuration: function(){
			if (!appointment.has('services')) return null;
			let services = table.get('ServiceList').getDataById(appointment.current.services);
			return services.map(service => Number(service.duration)).reduce((total,duration) => total + duration);
		},
		updateActiveFilters: function(name,newFilter){
			let filters = appointment.services.activeFilters, existingFilterArr = filters[name];
			// console.log(newFilter);
			if (existingFilterArr == undefined) filters[name] = [newFilter];
			else if (name == 'serviceAttr'){
				let i = existingFilterArr.indexOf(existingFilterArr.find(f => f.attr == newFilter.attr));
				if (i > -1)	existingFilterArr.splice(i, 1);
				existingFilterArr.push(newFilter);
				filters.serviceAttr = existingFilterArr;
			}
			else if (name == 'patient'){
				let i = existingFilterArr.indexOf(existingFilterArr.find(f => f.id == newFilter.id));
				if (i > -1)	existingFilterArr.splice(i, 1);
				existingFilterArr.push(newFilter);
				filters.patient = existingFilterArr;
			}
			else if (name == 'services') filters.services = [newFilter];
			else if (name == 'category') filters.category = [newFilter];
			appointment.services.activeFilters = filters;
		},
		removeFilter: function(filterType, value = null){
			if (appointment.services.activeFilters[filterType] == undefined) return;
			if (!value) delete appointment.services.activeFilters[filterType];
			appointment.services.reset();
			appointment.services.filter();
		},
		filter: function(newFilter = null){
			if (newFilter){
				for (let type in newFilter){
					appointment.services.updateActiveFilters(type,newFilter[type]);
				}
			}
			for (let filterType in appointment.services.activeFilters){
				let values = appointment.services.activeFilters[filterType];
				appointment.services.activeFilters[filterType].forEach(function(filter,f){
					if (filterType == 'services'){
						let serviceIds = filter;
						appointment.services.available = appointment.services.available.filter(
							service => service.is_addon && (service.addon_services ? service.addon_services.some(addon => $.inArray(addon, serviceIds) > -1) : true) && $.inArray(service.id, serviceIds) == -1
							);
					}
					if (filterType == 'serviceAttr'){
						let attr = filter.attr, value = filter.value;
						appointment.services.available = appointment.services.available.filter(service => (service[attr] == undefined) ? true : service[attr] == value);
					}
					if (filterType == 'patient'){
						let isNew = filter.isnewpatient;
						appointment.services.available = appointment.services.available.filter(service => isNew ? service.new_patients_ok : !service.new_patients_only);
					}
					if (filterType == 'category'){
						appointment.services.available = appointment.services.available.filter(service => service.service_category_id == filter.id);
					}
				})
			}
			// appointment.update.categories();
			return appointment.services.get();
		},
		categories: {
			available: null,
			reset: function(){
				appointment.services.categories.available = $("#CategoryDetails").data('details');			
			},
			get: function(){
				return !appointment.services.categories.available.isEmpty() ? appointment.services.categories.available : null;
			},
			filter: function(availableServices){
				if (availableServices == null){
					appointment.services.categories.available = [];
				}else{
					let categories = appointment.services.categories.available;
					appointment.services.categories.available = categories.filter(category => availableServices.some(service => Number(service.service_category_id) == category.id));
				}
				return appointment.services.categories.get();
				// let isNew = patient.is_new_patient;
				// appointment.services.available = appointment.services.available.filter(service => isNew ? service.new_patients_ok)
			}
		},
	},
	schedules: {
		businessHours: null,
		practitioners: null,
		anonEvents: null,
		check: {
			momentObj: null,
			duration: null,
			services: null,
			errors: [],
			conflicts: null,
			dayAvailability: {},
			displayErrors: function(options){
				let errors = ifu(options.errors, appointment.schedules.check.errors, true), 
						datetime = ifu(options.datetime, appointment.schedules.check.momentObj),
						conflicts = ifu(options.conflicts, appointment.schedules.check.conflicts, true),
						callbackAffirm = ifu(options.callback, null),
						callbackNegate = ifu(options.goback, null),
						duration = ifu(options.duration, appointment.schedules.check.duration);
				log({errors,datetime,conflicts,callbackAffirm,callbackNegate,duration},'displaying errors');
				let display = $("<div/>",{
						class: 'scheduleErrors',
						html:`<h3 class='pink'>${datetime.format('h:mma')}${(duration ? moment(datetime).add(duration,'m').format('[-] h:mma') : "") + ' on ' + datetime.format('M/D/YY')}</h3><ul style='text-align:left'></ul>`,
						css:{display:'inline-block'}
					});
				errors.reverse().forEach(error => display.find('ul').append(`<li>${error.toTitleCase()}</li>`));
				
				if (user.is('practitioner')) {
					// confirm('Schedule Conflict', display, 'continue despite conflict', 'go back', null, callbackAffirm, callbackNegate);
					confirm({
						header: 'Schedule Conflict',
						message: display,
						yesBtnText: 'continue despite conflict',
						noBtnText: 'go back',
						affirmativeCallback: callbackAffirm,
						negativeCallback: callbackNegate,
						resolveOnClick: $("#Confirm").find('li'),
					});
					if (conflicts) {
						display.append("<h3 class='pink'>Closest Available Times</h3>");
						conflicts.forEach(function(conflict){
							log({conflict});
							let appt = appointment.get(conflict.uid);
							$("#Confirm").find('li').filter((l,li) => $(li).text().includes('Another Appointment')).append(`<br><i>${appt.extendedProps.patient.name} (${moment(appt.start).format('h:mma')} - ${moment(appt.end).format('h:mma')})<br>${appt.title}</i>`);													
						})
						let firstBeforeConflict = appointment.schedules.find.firstBeforeConflict(datetime),
								firstAfterConflict = appointment.schedules.find.firstAfterConflict(datetime);
						if (firstBeforeConflict.exists()){
							let firstTimeBeforeBtn = new Button({
								classList: 'small yellow70 smallMargin resolve',
								action: function(){firstBeforeConflict.click();},
								id: 'firstTimeBeforeBtn',
								text: firstBeforeConflict.text(),
								appendTo: $("#Confirm").find(".scheduleErrors")
							});
						}
						if (firstAfterConflict.exists()){
							let firstTimeAfterBtn = new Button({
								classList: 'small yellow70 smallMargin resolve',
								action: function(){firstBeforeConflict.click();},
								id: 'firstTimeAfterBtn',
								text: firstAfterConflict.text(),
								appendTo: $("#Confirm").find(".scheduleErrors")
							});
						}
						if (firstBeforeConflict.dne() && firstAfterConflict.dne()) display.append('no available times on this date');
					}else display.append("<h3 class='pink'>How To Proceed?</h3>");
				}else {
					feedback('Appointment Unavailable',display);
				}
			},
			logError: function(error){
				appointment.schedules.check.errors.push(error)
			},
			resetErrors: function(){
				appointment.schedules.check.errors = [];
				appointment.schedules.check.conflicts = null;
			},
			this: function(momentObj, duration = null){
				appointment.schedules.check.momentObj = momentObj;
				appointment.schedules.check.duration = duration;
				if (debug.level(0)) console.log({moment:momentObj,duration:duration});
				return appointment.schedules.check.all();
			},
			within: function(limits,test){
				if (test.duration) test.end = moment(test.start).add(test.duration,'m');
				let startWithin = (test.start.isSameOrAfter(limits.start) && test.start.isBefore(limits.end)),
					endWithin = test.end ? (test.end.isAfter(limits.start) && test.end.isSameOrBefore(limits.end)) : true;
				if (debug.level(0)) console.log(`${moment(test.start).format('h:mma')} & ${moment(test.end).format('h:mma')} within ${moment(limits.start).format('h:mma')} - ${moment(limits.end).format('h:mma')}?`);
				if (debug.level(0)) console.log(`start:${startWithin?'true':'false'} end:${endWithin?'true':'false'}, both:${(startWithin&&endWithin)?'true':'false'}`)
				return startWithin && endWithin;
			},
			overlaps: function(limits,test){
				if (test.duration) test.end = moment(test.start).add(test.duration,'m');
				let startWithin = (test.start.isSameOrAfter(limits.start) && test.start.isBefore(limits.end)),
					endWithin = test.end ? (test.end.isAfter(limits.start) && test.end.isSameOrBefore(limits.end)) : false;
				if (debug.level(0)) console.log(`${moment(test.start).format('h:mma')} & ${moment(test.end).format('h:mma')} within ${moment(limits.start).format('h:mma')} - ${moment(limits.end).format('h:mma')}?`);
				if (debug.level(0)) console.log(`start:${startWithin?'true':'false'} end:${endWithin?'true':'false'}, both:${(startWithin&&endWithin)?'true':'false'}`)
				return startWithin || endWithin;
			},
			all: function(){
				if (!appointment.schedules.check.momentObj) {
					let error = 'appointment.schedules.check.momentObj not defined';
					// log({error},'schedule check error');
					return false;
				}
				appointment.schedules.check.resetErrors();
				if (debug.level(0)) console.groupCollapsed(`check ALL, start:${appointment.schedules.check.momentObj.format('h:mma')}, duration:${appointment.schedules.check.duration}`);
				if (debug.level(0)) console.groupCollapsed('business hour checks');
				let bizHourCheck = appointment.schedules.check.businessHours();
				if (debug.level(0)) console.groupEnd();
				if (!bizHourCheck) appointment.schedules.check.logError('outside business hours');
				if (debug.level(0)) console.groupCollapsed('appointment conflict checks');
				let apptConflictCheck = appointment.schedules.check.againstCurrentAppts();
				if (debug.level(0)) console.groupEnd();
				if (!apptConflictCheck) appointment.schedules.check.logError('conflicts with another appointment');
				if (debug.level(0)) log({bizHourCheck,apptConflictCheck},`bizcheck:${bizHourCheck?'true':'false'} apptcheck:${apptConflictCheck?'true':'false'}`);
				if (debug.level(0)) console.groupEnd();

				let errors = appointment.schedules.check.errors;
				// log({errors},'figure this shitout');
				if (!errors.isEmpty() && debug){
					let options = {momentObj: appointment.schedules.check.momentObj, duration: appointment.current.duration};
					// log({errors,options},'schedule check errors');
				}
				return errors.isEmpty();
			},
			businessHours: function(){
				return appointment.schedules.check.againstSchedule(appointment.schedules.businessHours.schedule);
			},
			againstSchedule: function(schedule){
				let dayMatch = schedule.filter(timeBlock => appointment.schedules.check.againstDayOfWeek.bind(null, timeBlock)());
				if (dayMatch.isEmpty()) {appointment.schedules.check.logError('day not offered'); return false;}
				let timeMatch = dayMatch.filter(timeBlock => appointment.schedules.check.againstTimeOfDay.bind(null, timeBlock)());
				if (timeMatch.isEmpty()) {appointment.schedules.check.logError('time not offered'); return false;}
				let serviceMatch = timeMatch.filter(timeBlock => appointment.schedules.check.againstServicesOffered.bind(null, timeBlock)());
				if (serviceMatch.isEmpty()) {appointment.schedules.check.logError('service not offered'); return false;}
				return true;
			},
			againstCurrentAppts: function(){
				var appts = appointment.schedules.anonEvents, test = appointment.schedules.check.momentObj, duration = appointment.schedules.check.duration,
						practitioner = appointment.current.practitioner, uid = appointment.current.uid;
				let testObj = {start:test,duration:duration};
				if (debug.level(0)) console.groupCollapsed(`check ${testObj.start.format('M/D')} start:${testObj.start.format("h:mma")}, duration:${testObj.duration} againstCurrentAppts`);
				if (debug.level(0)) log(testObj,'test obj');
				let conflicts = appts.filter(function(appt) {
					if (debug.level(0)) console.groupCollapsed(`existingAPPT ${moment(appt.start).format('M/D h:mma')}-${moment(appt.end).format('h:mma')}`);
					let overlapCheck = appointment.schedules.check.overlaps({start:appt.start,end:appt.end},testObj);
					if (debug.level(0)) console.log(`test ${moment(testObj.start).format('h:mma')}-${moment(testObj.end).format('h:mma')}`);
					if (debug.level(0)) console.log(`overlaps:${overlapCheck}, pract:${(practitioner ? practitioner == appt.practitioner_id : true)}, uid:${(uid ? uid != appt.uid : true)}`);
					if (debug.level(0)) console.groupEnd();
					// return overlapCheck && (practitioner ? practitioner == appt.practitioner_id : true) && (uid ? uid != appt.uid : true);
					return overlapCheck;
				});
				if (debug.level(0)) console.groupEnd();
				if (!conflicts.isEmpty()) {
					let error = 'appointment overlap';
					if (duration && debug.level(0)) log({error,conflicts,test,duration},'conflicts');
					appointment.schedules.check.conflicts = conflicts;
					return false;
				}else{
					return true;	
				}
			},
			againstDayOfWeek: function(timeBlock){
				var dayToCheck = appointment.schedules.check.momentObj.day();
				var availability = [
				(timeBlock.days.Sunday === true || timeBlock.days.Sunday === 'true'),
				(timeBlock.days.Monday === true || timeBlock.days.Monday === 'true'),
				(timeBlock.days.Tuesday === true || timeBlock.days.Tuesday === 'true'),
				(timeBlock.days.Wednesday === true || timeBlock.days.Wednesday === 'true'),
				(timeBlock.days.Thursday === true || timeBlock.days.Thursday === 'true'),
				(timeBlock.days.Friday === true || timeBlock.days.Friday === 'true'),
				(timeBlock.days.Saturday === true || timeBlock.days.Saturday === 'true'),
				];
				return availability[dayToCheck];
			},
			againstTimeOfDay: function(timeBlock){
				var testStart = appointment.schedules.check.momentObj, within = appointment.schedules.check.within,
					blockStart = moment(testStart.format("MM-DD-YYYY") + " " + timeBlock.start_time, "MM-DD-YYYY hh:mma"),
					blockEnd = moment(testStart.format("MM-DD-YYYY") + " " + timeBlock.end_time, "MM-DD-YYYY hh:mma"),
					duration = appointment.schedules.check.duration,
					testEnd = duration ? moment(testStart).add(duration,'m') : null;
				var startOk = (testStart.isSameOrAfter(blockStart) && testStart.isBefore(blockEnd)),
				endOk = testEnd ? (testEnd.isAfter(blockStart) && testEnd.isSameOrBefore(blockEnd)) : true;
				return within({start:blockStart,end:blockEnd},{start:testStart,end:testEnd});
			},
			againstServicesOffered: function(timeBlock){
				if (timeBlock.services == undefined || appointment.schedules.check.services == null) return true;
				console.log({servicesOffered: timeBlock.services, requestedService: appointment.schedules.check.services});
				return true;
			},
			allAvailablePractitioners: function(){

			},
			thisPractitioner: function(practitionerId){

			},
			updateDayAvailability: async function(date = null, thisDayOnly = false){
				if (!date) date = moment().format('M/D/YYYY');
				appointment.reset();
				let workingDate = moment(date,'M/D/YYYY'), lastDate = moment(date,'M/D/YYYY'),
						slots = appointment.form.timeSlots.get().map(slot => $(slot).data('value').split(":")),
						duration = appointment.current.duration || null;
				if (!thisDayOnly){
					workingDate.startOf('month').subtract(1,'M').subtract(7,'d');
					lastDate.endOf('month').add(1,'M').add(7,'d');
				}
				// console.groupCollapsed('updating availability');
				while(workingDate.isSameOrBefore(lastDate)){
					let available = slots.filter(slot => appointment.schedules.check.this(moment(workingDate).hours(slot[0]).minutes(slot[1]),duration));
					appointment.schedules.check.dayAvailability[workingDate.format('M/D/YYYY')] = available.map(time => time.join(":"));
					// log({availability:appointment.schedules.check.dayAvailability[workingDate.format('M/D/YYYY')]},workingDate.format('M/D/YYYY'));
					workingDate.add(1,'d');
				}
				// console.groupEnd();
				return true;
			},
			dayHasAvailability: function(date){
				let findMe = moment(date).format('M/D/YYYY'), availability = appointment.schedules.check.dayAvailability[findMe],
						durationCheck = true;
				if (availability == undefined) {
					appointment.schedules.check.updateDayAvailability(findMe);
					availability = appointment.schedules.check.dayAvailability[findMe]
				}
				if (appointment.has('duration')){
					let duration = appointment.current.duration;
					durationCheck = availability.some(time => appointment.schedules.check.this(moment(`${findMe} ${time}`,'M/D/YYYY hh:mm:ss'), duration));
				}
				return (availability.isEmpty() || !durationCheck) ? {selectable:false, dateClass:'unavailable'} : {};
			}
		},
		find: {
			firstBeforeConflict: function(datetime){
				let match = appointment.form.timeSlots.get().find(slot => $(slot).text() == datetime.format("h:mm a")),
						previous = $(match).prev();
				while(previous.hasClass('disabled')){
					previous = previous.prev();
				}
				return previous;
			},
			firstAfterConflict: function(datetime){
				let match = appointment.form.timeSlots.get().find(slot => $(slot).text() == datetime.format("h:mm a")),
						next = $(match).next();
				while(next.hasClass('disabled')){
					next = next.next();
				}
				return next;

			}
		},
		relDateString: (datetime = appointment.current.datetime) => {
			if (datetime === null) return 'NULL';
			return datetime.fromNow();
		},
	},
	form: {
		active: null,
		activeId: null,
		timeSlots: null,
		setActive: function(activeForm){
			if (activeForm === 'edit') activeForm = $("#editAppointment");
			else if (activeForm === 'create') activeForm = $("#createAppointment");
			if (activeForm instanceof jQuery && activeForm.dne()) return;
			appointment.form.active = activeForm;
			appointment.form.activeId = activeForm.attr('id');
			appointment.reset();
		},
		open: {
			summary: function(){
				// appointment.
			},
			edit: function(apptDetails = null){
				appointment.form.setActive('edit');
				appointment.form.open.active(apptDetails);
			},
			create: function(apptDetails = null){
				appointment.form.setActive('create');
				appointment.form.open.active(apptDetails);
			},
			active: function(apptDetails = null){
				appointment.form.collectElements();
				if (apptDetails) appointment.set(apptDetails);
				blur('body',`#${appointment.form.activeId}`);
			}
		},
		collectElements: function(display = false){
			if (!appointment.form.active) return;
			let selectors = appointment.form.details.selectors, apptDetails = appointment.form.details.display;
			appointment.form.active.find(".section").last().append(selectors);
			apptDetails.insertAfter(appointment.form.active.find("h2").first()).show();
			if (display){selectors.fadeIn();}else{selectors.hide();}
		},
		details: {
			selectors: null,
			display: null,
			openers: null,
			open: function(key, addon = null){
				let selector = appointment.form.details.getSelector(key);
				appointment.form.details.selectors.hide();
				if (key == 'services') {
					if (appointment.has('services') && !addon){
						$("#SelectServices").find('.progressBar').find('.back').fadeOut();
						$("#CategoryDetails, #ServiceDetails").hide();
						$("#ServiceSummary").fadeIn();
					}else{
						let dispText = user.is('patient') ? 'Select Service Type' : 'Select Service Category';
						let isNew = table.get('PatientList').getDataById(appointment.current.patient)
						$("#CategoryDetails").fadeIn().find('h3').first().text(dispText)
						$("#ServiceDetails, #ServiceSummary").hide();
					}
				}else if (key == 'time') {
					$("#SelectTime").css({opacity:1});
					log({has:appointment.has('services'),current:appointment.current.services});
					if (!appointment.has('services')) {
						$("#ServiceWarning").find('.message').text('availability may change when services are added');
						$("#ServiceWarningLink").text('select services now');
					} else {
						$("#ServiceWarning").find('.message').text('availability may change if additional services are added');
						$("#ServiceWarningLink").text('add/change services now');
					}
				}
				if ($(selector).is(".modalForm")) blurTop(selector);
				else $(selector).fadeIn();
			},
			getOpener: function(key){
				return appointment.form.details.openers.filter('.'+key);
			},
			getSelector: function(key){
				return appointment.form.details.getOpener(key).data('target');
			}
		},
		category: {
			elements: [],
			select: function(ev){
				let name = $(this).data('value');
				let category = appointment.services.categories.get().find(category => category.name == name);
				appointment.services.filter({category});
				appointment.update.services();
				$("#CategoryDetails").fadeOut(400,function(){
					let dispText = $("#CategoryDetails").find("h3").first().text();
					$("#SelectServices").find(".progressBar").find(".back").fadeIn().find('.message').text(dispText);
					$("#ServiceDetails").resetActives().fadeIn(400).find("h3").first().text(category.name);
					$("#ServiceDescription").hide();
				})
			}
		},
		service: {
			elements: [],
			addOnBtn: null,
			removeBtn: null,
			select: function(ev){
				let name = $(this).data('value');
				let service = appointment.services.get().find(service => service.name == name);
				let description = $("#ServiceDescription");
				description.find('.message').html("").append($("<div/>",{class:'purple',text:service.description})).append($("<div/>",{class:'pink',text:practice.get('currency').symbol+service.price}));
				description.slideFadeIn();
			},
			confirm: function(ev){
				let serviceEle = $("#ServiceDetails").find(".active");
				let selection = appointment.services.get().find(service => service.name == serviceEle.data('value'));
				appointment.set({services:selection.id});
				$("#ServiceDescription, #ServiceDetails").hide();
				let services = $("#ApptDetails").find('.services.value').text();
				$("#ServiceSummary").find(".summary").text(services);
				$("#ServiceSummary").fadeIn();
				$("#SelectServices").find('.progressBar').find(".back").fadeOut();
				appointment.services.removeFilter('category');
				appointment.services.filter({services:appointment.current.services});
			},
			remove: function(ev){
				appointment.current.services.pop();
				appointment.set({services: appointment.current.services});
			},
			chooseAddOn: function(ev){
				appointment.form.details.open('services','addon');
			}
		},
		chartnote: {
			check: function(){
				let info = appointment.current.chartnote;
				// console.log(appointment.current);
				if (!info) return false;
				if (info.id === null){
					confirm({
						header: 'No Chart Note',
						message: 'There is no chart note for this appointment yet.<h3 class="pink">Create Charte Note Now?</h3>',
						yesBtnText: 'create note',
						noBtnText: 'dismiss',
						affirmativeCallback: chartnote.edit,
					})
				}
				else if (info.status == 'not signed'){
					confirm({
						header: 'Unfinished Chart Note',
						message: 'There is an existing chart note that has not been finished and signed.<h3 class="pink">Edit + Finish Chart Note?</h3>',
						yesBtnText: 'edit note',
						noBtnText: 'dismiss',
						affirmativeCallback: chartnote.edit,
					})
				}else{
					confirm({
						header: 'Chart Note Complete',
						message: 'The chart note for this appointment is finished and signed.<h3 class="pink">View chart note?</h3>',
						yesBtnText: 'view note',
						noBtnText: 'dismiss',
						affirmativeCallback: chartnote.view.bind(null,info.id),
					})
				}
				return false;
			}
		},
		invoice: {
			check: function(){
				let info = appointment.current.invoice;
				console.log(appointment.current);
				if (!info) return false;
				if (info.id === null){
					// confirm('Create Invoice?',"There's been no payment for this appointment yet. <h3 class='pink'>Create invoice now?</h3>", 'yes, create','not now', null, invoice.edit);
					confirm({
						header: 'No Invoice Yet',
						message: 'There has been no invoice created for this appointment.<h3 class="pink">Create invoice now?</h3>',
						yesBtnText: 'create invoice',
						noBtnText: 'dismiss',
						affirmativeCallback: invoice.edit,
					})

				}
				else if (info.status == 'not settled'){
					// confirm('Pending Invoice',"There's an invoice for this appointment that hasn't been settled. <h3 class='pink'>Go to Invoice?</h3>",'yes, go now','not now', null, invoice.edit);
					confirm({
						header: 'Pending Invoice',
						message: 'This invoice is missing payment and has not been settled.<h3 class="pink">Edit + Settle Invoice?</h3>',
						yesBtnText: 'edit invoice',
						noBtnText: 'dismiss',
						affirmativeCallback: invoice.edit,
					})
				}else{
					// console.log("confirming");
					// confirm('Settled Invoice',"This invoice is complete with payments and is up to date. <h3 class='pink'>View invoice?</h3>",'view invoice','not now',null, invoice.view.modal.bind(null,info.id));
					confirm({
						header: 'Settled Invoice',
						message: 'This invoice is complete with payments and is settled.<h3 class="pink">View Invoice?</h3>',
						yesBtnText: 'view invoice',
						noBtnText: 'dismiss',
						affirmativeCallback: invoice.view.modal.bind(null,info.id),
					})
				}
				return false;
			}
		},
	},
	reset: function(){
		for (let attr in appointment.current){
			// console.log({attr:attr,value:appointment.current[attr]});
			if (attr == 'patient') appointment.defaultPatient ? appointment.defaultPatient.patient_id : uids.get('Patient');
			else if (attr == 'practitioner') appointment.defaultPractitioner ? appointment.defaultPractitioner.practitioner_id : null;
			else appointment.current[attr] = null;
		}
		// log(appointment.current,'current appointment');
		appointment.services.reset();
		appointment.services.categories.reset();
		if (appointment.form.active){
			appointment.form.active.find('input, textarea').val("");
			appointment.form.active.resetActives();
		}
	},
	initialize: {
		all: function(){
			if ($("#Appointment").dne()) return;
			appointment.list = jsonIfValid($("#AppointmentsFullCall").data('schedule'));
			appointment.reset();
			notes.resetForm();
			if (user.is('patient')) appointment.defaultPatient = user.current;
			appointment.schedules.businessHours = $("#BizHours").data();
			appointment.schedules.practitioners = $("#Practitioners").data('schedule');
			appointment.schedules.anonEvents = $("#AnonFeed").data('schedule');
			appointment.form.timeSlots = $("#TimeSelector").find("li");
			$.each(appointment.initialize, function(name, initFunc){
				if (!['all','externalSelectAndLoad'].includes(name) && typeof initFunc === 'function') initFunc();
			})
		},
		calendar: function(){
			$(".ChangeTitle").attr('id','ChangeTitle');
			$("#ChangeTitle").addClass('purple');
			var target = $(".calendar."+user.current.type.split(" ").join(""));
			var tz = target.data('timezone'), clientTz = moment.tz.guess(), location = target.data('location');
			moment.tz.setDefault(tz.replace(" ","_"));
			target.html("");
			init([
				[$("#ChangeTitle").find("li"), function(){$(this).on('click',appointment.update.calendar.eventTitles)}],
				[$(".datepick").on('click','.unavailable', function(){
					console.log('hi');
				})]
			]);
			if (user.is('patient')){
				console.log('loading patient calendar lol');
			}else if (user.is('practitioner')){
				var header = {
					left:"title",
					center:"",
					right:"prev,today,next dayGridMonth,timeGridWeek,timeGridDay",
				};
				appointment.calendar.element = new FullCalendar.Calendar(target[0], {
					plugins: ['dayGrid','list', 'timeGrid', 'interaction', 'rrule', 'momentTimezone'],
					timeZone: tz,
					header: header,
					height: "auto",
					dateClick: function(info){
						let check = appointment.schedules.check.this(moment(info.date));
						if (!check){
							appointment.schedules.check.displayErrors({callback: function(){
								let date = moment(info.date).format("M/D/YYYY"), time = moment(info.date).format("h:mma");
				        appointment.form.open.create({date:date,time:time});							
							}})
						}else{
							let date = moment(info.date).format("M/D/YYYY"), time = moment(info.date).format("h:mma");
			        appointment.form.open.create({date:date,time:time});							
						}
		      },
	        eventClick: function(info){
	        	var ev = info.event, details = $.extend(true, {}, ev.extendedProps), clonedProps = $.extend(true, {}, ev.extendedProps), ele = $(info.el);
            appointment.bypassCheck = true;
            if (ele.hasClass('appointment')){
              uids.set({
              	Appointment: details.uid,
              	Practitioner: details.practitioner.id,
              	ChartNote: details.chartNote.id
              });
              appointment.previous.set({
              	patient: clonedProps.patient.id,
              	practitioner: clonedProps.practitioner.id,
              	services: clonedProps.services.ids,
              	datetime: moment(ev.start),
              });
              try{
	              appointment.form.open.edit({
	              	uid: details.uid,
	              	uuid: details.googleUuid,
	              	patient: details.patient.id,
	              	practitioner: details.practitioner.id,
	              	services: details.services.ids,
	              	datetime: moment(ev.start),
	              	chartnote: details.chartNote,
	              	invoice: details.invoice,
	              	forms: details.forms,
	              });
              }catch(error){
              	log({error});
              }
            }
            appointment.bypassCheck = false;
	        },  
	        defaultView:"timeGridWeek",
	        allDaySlot: false,
	        minTime:$("#BizHours").data("earliest"),
	        maxTime:$("#BizHours").data("latest"),
	        eventSources: 
	        [
		        {
		        	events: jsonIfValid($("#AppointmentsFullCall").data('schedule')),
		        	id: "appointments"
		        },
		        {
		        	events: jsonIfValid($("#NonEhr").data('schedule')),
		        	id: "nonEHR"
		        }    
	        ],
	        businessHours: $("#BizHours").data('fullcal'),
	        eventRender: function(info){
	     //    	var eventData = info.event, ele = info.el;
						// var extProps = details.extendedProps, type = extProps.type, types = type.split(":").join(" ");
						$(info.el).addClass(info.event.extendedProps.type.split(":").join(' '));
	        	// applyEventClasses(eventData,$(ele));
	        },
	        nowIndicator: true
		    })

				appointment.calendar.element.render();
				resizeFcCalendar();
				var tb = target.find(".fc-toolbar");
				$("#TimezoneWrap").insertAfter(tb).css('display','inline-block');
				if (tz != clientTz){
					$("#TimezoneWrap").html("Take note: you appear to be in a different timezone than your appointments will be held.<br><b>Appointments are displayed and scheduled in local "+location+" time.</b>");
				}
				$("#ChangeTitleWrap").insertAfter(tb).css('display','inline-block');
				// $("#ChangeTitleWrap").on('click','li',changeTitles);
				$("#ChangeTitle").find("li").filter('[data-value="service"]').addClass('active');
			}
			appointment.schedules.check.updateDayAvailability(moment().format('M/D/YYYY'));
		},
		services: function(){
			let practitioners = appointment.schedules.practitioners;
			if (practitioners.isSolo()){
				appointment.defaultPractitioner = practitioners[0];
			}
			init([
				[$("#CategoryDetails").find('li'),function(){
					appointment.form.category.elements.push($(this));
					$(this).on('click', appointment.form.category.select);
				}],
				[$("#ServiceDetails").find('li'),function(){
					appointment.form.service.elements.push($(this));
					$(this).on('click', appointment.form.service.select);
				}],
				['#SelectServiceBtn',function(){
					$(this).on('click', appointment.form.service.confirm);
				}],
				['.DateSelector','hasUpdateFx',function(){
					$(this).css({fontSize:'1.3em',textAlign:'center'});
					$(this).datepick('destroy');
					let options = {
						minDate: $(this).data('mindate'),
						maxDate: $(this).data('maxdate'),
						dateFormat: 'm/d/yyyy',
						onDate: appointment.schedules.check.dayHasAvailability,
						onSelect: function(dates){
							// log({dates});
							appointment.set({date:moment(dates[0]).format("M/D/YYYY")});
							$("#SelectTime").css({opacity:1});
							$("#SelectDate").fadeOut(400,function(){$("#SelectTime").fadeIn(400)})
						},
						beforeShow: function(picker, instance){
							console.log({picker,instance});
						}
					};
					$(this).datepick(options);					
				}],
				[appointment.form.timeSlots, function(){
					$(this).on('click',function(){
						let time = $(this).text().replace(" ","");
						log({slotData:$(this).data()},`${time} data`);
						if ($(this).data('errors')){
							appointment.schedules.check.displayErrors({
								errors: $(this).data('errors'),
								conflicts: $(this).data('conflicts'),
								datetime: moment(`${appointment.current.date} ${time}`,'M/D/YYYY h:mma'),
								callback:function(){
									appointment.set({time});
									$("#SelectTime").slideFadeOut();								
									setTimeout(unblur,400);
								}
							})
						}else{
							appointment.set({time:$(this).text().replace(" ","")});
							$("#SelectTime").slideFadeOut();							
						}
					})
				}],
				['#ServiceWarningLink','hasEditFx',function(){
					$(this).on('click',function(){
						if (appointment.has('patient')) appointment.form.details.open('services');
						else {
							confirm({
								header: 'Select Patient First',
								message: 'A patient must be selected to determine which services are available',
								yesBtnText: 'select patient now',
								noBtnText: 'go back',
								affirmativeCallback: function(){
									unblur();
									appointment.form.details.open('patient');
								}
							})
						}
					})
				}]
			]);
		},
		forms: function(){
			let forms = $("#createAppointment, #editAppointment");
			forms.find(".item").hide();
			appointment.save.btn = forms.find(".submitForm");
			appointment.save.btn.addClass('disabled').off('click',saveModel).on('click',appointment.save.confirm).text("save appointment");
			appointment.form.service.addOnBtn = $("#ServiceSummary").find(".button.add");
			appointment.form.service.removeBtn = $("#ServiceSummary").find(".button.remove");
			appointment.delete.btn = new Button({
				url: 'Appointment/delete',
				classList: 'small pink70',
				id: 'DeleteApptBtn',
				action: appointment.delete.confirm,
				text: 'delete',
				insertAfter: $("#editAppointment").find('.button.submitForm')
			})
			appointment.form.chartnote.btn = new Button({
				url: 'ChartNote/index',
				classList: 'small yellow',
				id: 'CheckNoteBtn',
				action: appointment.form.chartnote.check,
				text: 'chart note',
				insertAfter: $("#DeleteApptBtn")
			})
			appointment.form.invoice.btn = new Button({
				url: 'Invoice/index',
				classList: 'small yellow70',
				id: 'InvoiceBtn',
				action: appointment.form.invoice.check,
				text: 'invoice',
				insertAfter: $("#CheckNoteBtn")
			})
			appointment.form.details.selectors = $("#SelectServices, #SelectPractitioner, #SelectDate, #SelectTime");
			appointment.form.details.display = $("#ApptDetails");
			appointment.form.details.openers = $("#ApptDetails").find('.edit');
			init([
				['#editAppointment',function(){$(this).find("h1").first().remove()}],
				[appointment.form.service.addOnBtn, function(){$(this).on('click',appointment.form.service.chooseAddOn)}],
				[appointment.form.service.removeBtn, function(){$(this).on('click',appointment.form.service.remove)}],
				[$("#SelectServices").find(".conditionalLabel"), function(){
						$(this).on('click','.override',function(){
							appointment.services.override = true;
							appointment.update.servicesLabel();
							appointment.services.removeFilter('patient');
							appointment.update.categories();
						})					
				}],
				["#EditApptBtn", function(){$(this).on('click',appointment.form.open.edit)}],
				[appointment.form.details.openers, 'openFx', function(){
					let addon = appointment.has('services');
					$(this).on('click', appointment.form.details.open.bind(null,$(this).data('value'),addon));
				}],
				[$(".progressBar"), function(){
					$(this).on('click','.back',function(){
						let box = $(this).closest(".selector"), steps = box.find('.step'), thisStep = steps.filter(':visible'), lastStep = thisStep.prev('.step');
						steps.hide();
						if (lastStep.is("#CategoryDetails")) appointment.services.removeFilter('category');
						lastStep.resetActives().fadeIn();
						if (lastStep.prev('.step').dne()) $(this).fadeOut();
					});
				}],
			]);
		},
		externalSelectAndLoad: function(options = {}){
			let target = ifu(options.target, null),
					url = ifu(options.url, null),
					callback = ifu(options.callback, null),
					btnText = ifu(options.btnText, null),
					errors = [];
			if (!target) errors.push('invalid target');
			if (!url) errors.push('invalid url');
			if (callback && typeof callback != 'function') errors.push('invalid callback');
			if (!btnText) log(options,'define btnText for more flex');
			if (!errors.isEmpty()) {
				let message = 'Error initializing appt links';
				log({errors,options,message});
				return;
			}
			init([
				['.selectNewAppt',function(){
					$(this).on('click',function(){
				    $(".selectNewAppt").hide();
				    $("#ApptLegend, #ApptsList").slideFadeIn();
				    $("#CurrentAppt").slideFadeOut();
				    $('.confirmApptBtn').addClass('disabled');						
					})
				}],
				['.confirmApptBtn',function(){
					let btn = $(this);
					$(this).on('click',function(){
						if (btn.hasClass('disabled')) {
							feedback('No Appointment Selected','Pick an appointment first, silly.');
							return false;
						}
						var active = $(".appt").filter('.active'), 
								apptId = active.data('uid') || uids.get('Appointment');
						if (!apptId) {
							feedback('No Appointment Selected','Pick an appointment first, silly.');
							return;
						}
						url = url.replace('apptId',apptId);
						log({target,apptId,url,callback,btnText})
						// return;
						$(".confirmAppt").slideFadeOut();
						menu.load({url,	target,	callback});

					});
				}],
				['.appt',function(){
					let appt = $(this);
					$(this).on('click',function(ev){
						log({ev:ev,this:this,appt:appt,isactive:appt.hasClass('active'),legend:appt.closest("#ApptLegend")},'appt');
				    if (appt.hasClass('active') || $("#ApptLegend").dne()){
				        return;
				    }else{
				        $(".appt").removeClass('active');
				        log({appt:appt, data:appt.data()},'MADE IT');
				        // return;	
				        appt.addClass('active');     
				        $("#ApptSummary").html($(this).html().split("<br>").join(", ") + "<br>" + $(this).data('services'));
				        $('.confirmApptBtn').removeClass('disabled');
				        var newText;
				        if (btnText) {
				        	log(btnText,'Button text');
				        	for (let searchClass in btnText){
				        		if ($(this).hasClass(searchClass)) $(".confirmApptBtn").text(btnText[searchClass]);
				        	}
				        }else	log(options,'define btnText for more flex');
				    }						
					})
				}],
			]);
		},
		// formLink: function(){
		// 	var info = filterUninitialized('#FormInfo');
		// 	info.on('click','.link',checkFormStatus);
		// 	info.data('initialized',true);			
		// }
	},
};
