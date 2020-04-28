var action = undefined, appointmentDetails = {services:null,date:null,time:null,datetime:null,patient:null,practitioner:null}, defaultPatientInfo = null, defaultPractitionerInfo = null, activeForm = null, category = null, practitioners, practiceTz, clientTz, patientInfo = {}, calendar, serviceConfirmBtn, dateTimeConfirmBtn, allowOverride = false, serviceOverride = false;
var appointment = {
	current: {
		uuid: null,
		patient: null,
		practitioner: null,
		services: null,
		date: null,
		time: null,
		datetime: null
	},
	has: function(attr){
		let val = appointment.current[attr];
		return (val == undefined || val == null) ? false : true;
	},
	defaultPatient: null,
	defaultPractitioner: null,
	set: function(updateObj = null){
		try{
			if (typeof updateObj != 'object') throw({error:'Invalid object',object:updateObj});
			if (updateObj !== null){
				$.each(updateObj,function(attr,val){
					if (attr == 'services'){
						console.log({attr,val});
						if (val === null){appointment.current.services = null;}
						else if (typeof val == 'object'){appointment.current.services = val;}
						else if (appointment.current.services == null){appointment.current.services = [val];}
						else {appointment.current.services.push(val);}
					}else if ($.inArray(attr, ['uuid','patient','practitioner','date','time','datetime']) > -1){
						appointment.current[attr] = val;
						if (attr == 'patient') uids.set('Patient',val);
					}else{
						console.log({error:'invalid attribute',attribute:attr});
					}
				})
				if (appointment.current.date && appointment.current.time && !appointment.current.datetime){
					appointment.current.datetime = moment(appointment.current.date + " " + appointment.current.time, "M/D/YYYY h:mma");
				}
				if (appointment.current.datetime && (!appointment.current.date || !appointment.current.time)){
					appointment.current.date = appointment.current.datetime.format("M/D/YYYY");
					appointment.current.time = appointment.current.datetime.format("h:mma");
				}
				if (appointment.current.datetime) appointment.schedules.check.momentObj = appointment.current.datetime;
			}
		}catch(error){
			if (user.isSuper()) console.log(error);
		}
		console.log({services: appointment.current.services});
		if (appointment.defaultPractitioner) appointment.current.practitioner = appointment.defaultPractitioner.practitioner_id;
		appointment.update.all();
	},
	update: {
		all: function(updateObj = null){
			if (appointment.form.active){
				appointment.update.hiddenValues();
				appointment.update.visibleDetails();
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
				if (appointment.defaultPatient) appointment.update.flow.hide(['patient']);
			},
			hide: function(details){
				let matches = details.map(detail => appointment.form.details.getOpener(detail));
				matches.forEach(function(opener,o){
					opener.hide();
				});
			},
		},
		hiddenValues: function(){
			if (appointment.has('patient')) {
				let list = table.get('PatientList');
				appointment.update.categories(list.getDataById(appointment.current.patient));
				let patient = appointment.defaultPatient ? appointment.defaultPatient : table.get('PatientList').getDataById(appointment.current.patient);
				appointment.update.categories(patient);				
			}
			// if (appointment.has('practitioner')) table.get('PractitionerList').selectByUid(appointment.current.practitioner);
			// if (appointment.has('services')) table.get('ServiceList').selectByUid(appointment.current.services);
			if (appointment.has('date')) appointment.form.active.find('.date, .DateSelector').val(appointment.current.date);
			if (appointment.has('time')) appointment.form.active.find('.time').val(appointment.current.time);
		},
		visibleDetails: function(key = null, value = null){
			if (!key) {
				appointment.update.visibleDetails({
					patient: appointment.has('patient') ? table.get('PatientList').getNameById(appointment.current.patient) : null,
					practitioner: appointment.has('practitioner') ? table.get('PractitionerList').getNameById(appointment.current.practitioner) : null,
					services: appointment.has('services') ? table.get('ServiceList').getNameById(appointment.current.services) : null,
					date: appointment.has('date') ? appointment.current.date : null,
					time: appointment.has('time') ? appointment.current.time : null
				});
			}
		    if (typeof key == 'object' && key != null){
				console.log({key,value})		    	
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
		    // var slots = $("#TimeSelector").find("li");
		    // slots.addClass('disabled');
		    // appointment.schedules.check.all();
		},
		services: function(category){
			let allowedServices = appointment.services.filter({category});
			appointment.form.service.list.forEach(function(serviceEle){
				let name = serviceEle.data('value');
				allowedServices.some(service => service.name == name) ? serviceEle.show() : serviceEle.hide();
			});
		},
		categories: function(patient){
			let allowedServices = appointment.services.filter({patient});
			let allowedCategories = appointment.services.categories.filter(allowedServices);
			appointment.form.category.list.forEach(function(categoryEle){
				let name = categoryEle.data('value');
				allowedCategories.some(category => category.name == name) ? categoryEle.show() : categoryEle.hide();
			});
		}
	},
	save: function(){},
	delete: function(){
		// confirm('Delete Appointment?')
	},
	services: {
		available: null,
		override: false,
		reset: function(){
			appointment.services.available = $("#ServiceDetails").data('details');
			appointment.services.override = false;
		},
		get: function(){
			return !appointment.services.available.isEmpty() ? appointment.services.available : null;
		},
		filter: function(options){
			if (options.patient != undefined){
				let isNew = options.patient.isnewpatient;
				appointment.services.available = appointment.services.available.filter(service => isNew ? service.new_patients_ok : !service.new_patients_only);
			}
			if (options.category != undefined){
				appointment.services.available = appointment.services.available.filter(service => service.service_category_id == options.category.id);
			}
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
			logError: function(error){
				appointment.schedules.check.errors.push(error)
			},
			resetErrors: function(){
				$.each(appointment.schedules.check.errors,function(type,value){
					appointment.schedules.check.errors[type] = null;
				});
			},
			all: function(){
				if (!appointment.schedules.check.momentObj) return false;
				appointment.schedules.check.resetErrors();
				var pass = false;
				var bizHourCheck = appointment.schedules.check.businessHours();
				if (!bizHourCheck) {appointment.schedules.check.logError('outside business hours'); return false;}
				return pass;
			},
			businessHours: function(){
				console.log('hi checking biz hours');
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
				var appts = appointment.schedules.anonEvents, pass = true;
				$.each(appts,function(a,appt){
					console.log(appt);
				})
				return pass;
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
				var momentStart = appointment.schedules.check.momentObj,
					blockStart = moment(momentStart.format("MM-DD-YYYY") + " " + timeBlock.start_time, "MM-DD-YYYY hh:mma"),
					blockEnd = moment(momentStart.format("MM-DD-YYYY") + " " + timeBlock.end_time, "MM-DD-YYYY hh:mma"),
					duration = appointment.schedules.check.duration,
					momentEnd = duration ? moment(momentStart).add('m',duration) : null;
				var startOk = (momentStart.isSameOrAfter(blockStart) && momentStart.isBefore(blockEnd)),
					endOk = momentEnd ? (momentEnd.isAfter(blockStart) && momentEnd.isSameOrBefore(blockEnd)) : true;
				return (startOk && endOk);
			},
			againstServicesOffered: function(timeBlock){
				if (timeBlock.services == undefined || appointment.schedules.check.services == null) return true;
				console.log({servicesOffered: timeBlock.services, requestedService: appointment.schedules.check.services});
				return true;
			},
			allAvailablePractitioners: function(){

			},
			thisPractitioner: function(practitionerId){

			}
		}
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
				blurElement($("body"),"#"+appointment.form.activeId);
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
			open: function(key){
				let selector = appointment.form.details.getSelector(key);
				appointment.form.details.selectors.hide();
				if (key == 'services') {
					let dispText = user.is('patient') ? 'Select Service Type' : 'Select Service Category';
					$("#CategoryDetails").find('h3').text(dispText);
					$("#ServiceDetails, #ServiceSummary").hide();
				}
				if ($(selector).is(".modalForm")) blurTopMost(selector);
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
			list: [],
			select: function(ev){
				let name = $(this).data('value');
				let category = appointment.services.categories.get().find(category => category.name == name);
				appointment.update.services(category);
				$("#CategoryDetails").fadeOut(400,function(){
					let dispText = $("#CategoryDetails").find("h3").text();
					$("#SelectServices").find(".progressBar").find(".back").data('target',$("#CategoryDetails")).find('.message').text(dispText);
					$("#ServiceDetails").find("h3").text(category.name);
					$("#ServiceDetails").fadeIn(400);
				})
			}
		},
		service: {
			list: [],
			select: function(ev){
				let name = $(this).data('value');
				let service = appointment.services.get().find(service => service.name == name);
				let description = $("#ServiceDescription");
				console.log(service);
				description.find('.message').html("").append($("<div/>",{class:'purple',text:service.description})).append($("<div/>",{class:'pink',text:practice.get('currency').symbol+service.price}));
				description.slideFadeIn();
				// $("#CategoryDetails").fadeOut(400,function(){
				// 	let dispText = $("#CategoryDetails").find("h3").text();
				// 	$("#SelectServices").find(".progressBar").find(".back").data('target',$("#CategoryDetails")).find('.message').text(dispText);
				// 	$("#ServiceDetails").find("h3").text(service.name);
				// 	$("#ServiceDetails").fadeIn(400);
				// })
			},
			confirm: function(ev){
				let serviceEle = $("#ServiceDetails").find(".active");
				let selection = appointment.services.get().find(service => service.name == serviceEle.data('value'));
				appointment.set({services:selection.id});
			},
			remove: function(ev){}
		},
	},
	reset: function(){
		appointment.current = {
			uuid: null,
			patient: appointment.defaultPatient ? appointment.defaultPatient.patient_id : uids.get('Patient'),
			practitioner: appointment.defaultPractitioner ? appointment.defaultPractitioner.practitioner_id : null,
			services: null,
			date: null,
			time: null,
			datetime: null
		};
		appointment.services.reset();
		appointment.services.categories.reset();		
		if (appointment.form.active){
			appointment.form.active.find('input, textarea').val("");
			appointment.form.active.resetActives();
		}
		// if (appointment.defaultPractitioner) appointment.set({practitioner: appointment.defaultPractitioner.practitioner_id});
		// if (appointment.defaultPatient) appointment.set({patient: appointment.defaultPatient.practitioner_id});
		// else appointment.set({patient: uids.get('Patient')});
	},
	initialize: {
		all: function(){
			if ($("#Appointment").dne()) return;
			appointment.reset();
			notes.resetForm();
			if (user.is('patient')) appointment.defaultPatient = user.current;
			appointment.schedules.businessHours = $("#BizHours").data();
			appointment.schedules.practitioners = $("#Practitioners").data('schedule');
			appointment.schedules.anonEvents = $("#AnonFeed").data('schedule');
			$.each(appointment.initialize, function(name, initFunc){
				if (name != 'all' && typeof initFunc === 'function') initFunc();
			})
			appointment.autofill.onload();
		},
		calendar: function(){
		    $(".ChangeTitle").attr('id','ChangeTitle');
		    $("#ChangeTitle").addClass('purple');
			var target = $(".calendar."+user.current.type.split(" ").join(""));
		    var tz = target.data('timezone'), clientTz = moment.tz.guess(), location = target.data('location');
		    moment.tz.setDefault(tz.replace(" ","_"));
		    target.html("");

			if (user.is('patient')){
				console.log('loading patient calendar lol');
			}else if (user.is('practitioner')){
				var header = {
			            left:"title",
			            center:"",
			            right:"prev,today,next dayGridMonth,timeGridWeek,timeGridDay",
			        };
			    calendar = new FullCalendar.Calendar(target[0], {
			        plugins: ['dayGrid','list', 'timeGrid', 'interaction', 'rrule', 'momentTimezone'],
			        timeZone: tz,
			        header: header,
			        height: "auto",
			        dateClick: function(info){
			            let date = moment(info.date).format("M/D/YYYY"), time = moment(info.date).format("h:mma");
			            // appointment.set();
			            appointment.form.open.create({date:date,time:time});
			        },
			        eventClick: function(info){
			            var ev = info.event, details = $.extend(true, {}, ev.extendedProps), ele = $(info.el), dateTime = moment(ev.start);
			            // var patients = details.patients, practitioner = details.practitioner, services = details.services, patientIds = details.patientIds, practitionerId = details.practitionerId, serviceIds = details.serviceIds, forms = details.forms, dateTime = moment(ev.start), uid = details.bodywizardUid, type = details.type, ele = $(info.el);
			            serviceOverride = false;
			            resetEntireAppt();
			            console.log(details);
			            if (ele.hasClass('appointment')){
			                activeForm = $("#editAppointment");
			                moveServiceSelect("#editAppointment",false);
			                movePracTimeSelect("#editAppointment",false);
			                moveDetails('#editAppointment');
			                updateAppointment({
			                    patient: details.patient.id,
			                    practitioner: details.practitioner.id,
			                    services: details.serviceIds,
			                    datetime: details.dateTime
			                });
			                $("#editAppointment").data('uid',details.uid);
			                // setUid("Appointment",details.uid);
			                uids.set({
			                	Appointment: details.uid,
			                	Practitioner: details.practitioner.id,
			                	ChartNote: details.chartNote.id
			                });
			                // uids.log();
			                $("#PatientName").text(details.patient.name);
			                $("#PractitionerName").text(details.practitioner.name);
			                $("#ApptDateTime").text(dateTime.format("h:mm a [on] dddd, MMMM Do YYYY"));
			                $("#ApptDateTime").data('dateTime',dateTime);
			                $("#ServiceInfo").text(details.services.names);
			                updateFormInfo(details.forms);
			                updateChartNoteBtn(details.chartNote);
			                updateInvoiceBtn(details.invoice);
			                // loadApptInfo(patientIds,practitionerId,serviceIds,dateTime,$("#editAppointment"));
			                blurElement($("body"),"#Appointment");                
			            }
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
			            var eventData = info.event, ele = info.el;
			            applyEventClasses(eventData,$(ele));
			        },
			        nowIndicator: true
			    })

			    calendar.render();
			    resizeFcCalendar();
			    var tb = target.find(".fc-toolbar");
			    $("#TimezoneWrap").insertAfter(tb).css('display','inline-block');
			    if (tz != clientTz){
			        $("#TimezoneWrap").html("Take note: you appear to be in a different timezone than your appointments will be held.<br><b>Appointments are displayed and scheduled in local "+location+" time.</b>");
			    }
			    $("#ChangeTitleWrap").insertAfter(tb).css('display','inline-block');
			    $("#ChangeTitleWrap").on('click','li',changeTitles);
			    $("#ChangeTitle").find("li").filter('[data-value="service"]').addClass('active');

			}
		},
		services: function(){
		    let practitioners = appointment.schedules.practitioners;
		    if (practitioners.isSolo()){
		    	appointment.defaultPractitioner = practitioners[0];
		    }
		    initialize.ele({
		    	select: $("#CategoryDetails").find('li'),
		    	function: function(){
		    		appointment.form.category.list.push($(this));
		    		$(this).on('click', appointment.form.category.select);
		    	}
		    })
		    initialize.ele({
		    	select: $("#ServiceDetails").find('li'),
		    	function: function(){
		    		appointment.form.service.list.push($(this));
		    		$(this).on('click', appointment.form.service.select);
		    	}
		    })
		    initialize.ele({
		    	select: '#SelectServiceBtn',
		    	function: function(){
		    		$(this).on('click', appointment.form.service.confirm);
		    	}
		    });
			// var serviceBtn = filterUninitialized('#SelectServiceBtn');
			// serviceBtn.on('click',addService);
			// serviceBtn.on('click',goForward);
			var removeServiceBtn = filterUninitialized('.removeService');
			removeServiceBtn.on('click',removeService);
			// removeServiceBtn.on('click',goForward);
			
			var dateSelect = filterByData('.DateSelector','hasUpdateFx',false);
			dateSelect.each(function(){
				$(this).datepick('destroy');
				var options = {
			    	minDate: $(this).data('mindate'),
			    	maxDate: $(this).data('maxdate'),
			    	dateFormat: 'm/d/yyyy',
			    	onSelect: function(dates){
			    		var date = moment(dates[0]).format("M/D/YYYY");
			    		updateDate(date);
			    	}			
				};
			    $(this).datepick(options);
			})
		},
		forms: function(){
			$("#createAppointment, #editAppointment").find('.submitForm').text("save appointment");
		    $("#createAppointment, #editAppointment").find(".item").hide();			
			appointment.form.details.selectors = $("#SelectServices, #SelectPractitioner, #SelectDate, #SelectTime");
			appointment.form.details.display = $("#ApptDetails");
			appointment.form.details.openers = $("#ApptDetails").find('.edit');
			appointment.form.timeSlots = $("#TimeSelector").find("li");
			initialize.ele({select: "#EditApptBtn", function: function(){
				$(this).on('click',appointment.form.open.edit);
			}});
			initialize.ele({
				select: appointment.form.details.openers, 
				function: function(){
					$(this).on('click', appointment.form.details.open.bind(null,$(this).data('value')));
				},
				dataAttr: 'openFx',
				searchValue: false,
				setValue: true
			});
			// initialize.ele({select: "#DeleteApptBtn",function:function(){$(this).on('click',function(){blurElement($("body"),'#editAppointment')})}});
		},
		deleteBtn: function(){
			var btn = filterUninitialized('#DeleteApptBtn');
			btn.on('click',confirmApptDelete);
			btn.data('initialized',true);
		},
		// detailClick: function(){
		// },
		formLink: function(){
			var info = filterUninitialized('#FormInfo');
			info.on('click','.link',checkFormStatus);
			info.data('initialized',true);			
		}
	},
	autofill: {
		onload: function(){
			console.log('fill appt details');
		}
	}
};
function initializeApptForms(){
	console.log('use appointment.initialize.all');
	return;
	$("#createAppointment, #editAppointment").find('.submitForm').text("save appointment");
    $("#createAppointment, #editAppointment").find(".item").hide();
 	$("#editAppointment").find("h1").first().text("Edit Appointment");
    $(".ChangeTitle").attr('id','ChangeTitle');
    $("#ChangeTitle").addClass('purple');

    var uninitialized = filterUninitialized('#EditApptBtn, #DeleteApptBtn, #ApptDetails, #FormInfo, .selector, .selectPractitioner, #SelectTime, #PractitionerSelector, #SelectOrRandom, #booknow, #SelectServices, #ChartNoteBtn, #InvoiceBtn');
	// uninitialized.filter("#EditApptBtn").on('click',function(){
	// 	blurElement($("body"),"#editAppointment");
	// })
	// uninitialized.filter("#DeleteApptBtn").on('click',confirmApptDelete);
    // uninitialized.filter("#ApptDetails").on('click','.edit',openDetail);
    // uninitialized.filter('#FormInfo').on('click','.link',checkFormStatus);

    uninitialized.filter(".selector").on('click','.next',goForward);
    uninitialized.filter(".selector").on('click','.firstStep',firstStep);
    uninitialized.filter(".selector").on('click',".selectDate",function(){
    	$("#ApptDetails").find('.date').find(".edit").click();
    })
    uninitialized.filter(".selectPractitioner").on('click',function(){
    	$("#ApptDetails").find('.practitioner').find(".edit").click();
    })
    // $(".dateSelector").on('focusout',checkDate);
    uninitialized.find("#TimeSelector").on('click','li',updateTime);
    uninitialized.filter("#PractitionerSelector").on('click','li',updatePractitioner);
    uninitialized.filter("#SelectOrRandom").on('click','.closeBtn',randomPractitioner);
    uninitialized.filter(".selector").hide();

    uninitialized.data('initialized',true);

    // usertype = getUsertype();
	if (usertype == 'patient'){
		defaultPatientInfo = $("#PatientInfo").data('patient');
		$("#ApptDetails").addClass('toModalHome');
		$("#createAppointment").find(".submitForm").text('book appointment');
	    $("#booknow").data('target','#createAppointment');
	    $("#EditApptBtn").data('target','#editAppointment');
	    var newBtns = filterByData("#booknow, #EditApptBtn",'hasFx',false);
	    newBtns.on('click',showAppointmentDetails);
	    newBtns.data('hasFx',true);
	    if ($("#PatientCalendar").exists()){
	        $("#PatientCalendar").html("");
	     	loadPatientCal($("#PatientCalendar"));
     	    activateServiceSelection();
	    }
	    $("#createAppointment").on('click','.cancel',function(){$("#booknow").find('.active').removeClass('active');})
	}else if (usertype == 'practitioner'){
		allowOverride = true;
	    uninitialized.filter("#SelectServices").on('click', '.override',overrideService);
	    uninitialized.filter("#ChartNoteBtn").on('click',checkForChartNote);
	    uninitialized.filter("#InvoiceBtn").on('click',checkForInvoice);
	    if ($("#PractitionerCalendar").exists()){
	       	$("#PractitionerCalendar").html("");
	    	loadPractitionerCal($("#PractitionerCalendar"));
			activateServiceSelection();
	    }
	}
}
function activateServiceSelection(){
	console.log('use appointment.initialize.services');
	return;
	// var categories = $("#CategoryDetails").data('details'), 
	// 	services = $("#ServiceDetails").data("details"),
	// 	serviceItems = filterUninitialized("#createAppointment, #editAppointment").find(".item").filter(function(){
	// 		return $(this).find(".q").text().includes("Select Service(s)");
	// 	}), 
	// 	serviceLIs = filterUninitialized("#ServiceDetails").find("li"), 
	// 	categoryLIs = filterUninitialized("#CategoryDetails").find("li"),
	// 	durationItems = filterUninitialized("#createAppointment, #editAppointment").find(".item").filter(function(){
	// 		return $(this).find(".q").text().includes("Duration");
	// 	}), 
	// 	patientItems = filterUninitialized(".item").filter(function(){
 //        	return $(this).find(".q").text().includes("Select Patient");
 //   		});

 //    anonEvents = $("#AnonFeed").data('schedule');
 //    practitioners = $("#Practitioners").data('schedule');

 //    if (practitioners != undefined && practitioners.length == 1){
 //    	// console.log(practitioners);
 //    	defaultPractitionerInfo = practitioners[0];
 //    	resetEntireAppt();
 //    }

	// serviceItems.find("textarea").off("focus",openConnectedModelModal);
	// serviceItems.find(".q").text("Selected Service(s)");
 //    durationItems.find('input').attr('readonly',true);
 //    durationItems.find('.q').html("Duration <span class='little italic'>(automatically updates)</span>");

 //    if (defaultPatientInfo){
 //    	patientItems.find('input').val(defaultPatientInfo.name);
 //    	patientItems.find('input').removeClass('targetInput');
 //    }
    
 //    var timepicker = filterUninitialized('.ui-timepicker-am, .ui-timepicker-pm');

	// categoryLIs.each(function(){
	// 	var name = $(this).text(), category = categories[name];
	// 	$(this).data(category);
	// 	$(this).data('show',true);
	// })
	// serviceLIs.each(function(){
	// 	var name = $(this).text(), service = services[name];
	// 	$(this).data(service);
	// 	$(this).data('show',true);
	// })
	// categoryLIs.on('click',selectCategory);
	// categoryLIs.on('click',goForward);
	// serviceLIs.on('click',showServiceDescription);

	// $(".selector").on('click','.back', goBack);
	// categoryLIs.on('click',function(){
	// 	var id = $(this).data('id'), matches = serviceLIs.filter(function(){
	// 		return $(this).data('service_category_id') == id && $(this).data('show');
	// 	}), notMatches = $("#ServiceDetails").find("li").not(matches);
	// 	matches.show();
	// 	notMatches.hide();
	// })
	// serviceLIs.on('click',function(){
	// 	var description = $(this).data('description');
	// 	$("#ServiceDescription").find('.target').text(description);
	// })

	// var serviceBtn = filterUninitialized('#SelectServiceBtn');
	// serviceBtn.on('click',addService);
	// serviceBtn.on('click',goForward);
	// var removeServiceBtn = filterUninitialized('.removeService');
	// removeServiceBtn.on('click',removeService);
	// // removeServiceBtn.on('click',goForward);
	
	// var dateSelect = filterByData('.DateSelector','hasUpdateFx',false);
	// dateSelect.each(function(){
	// 	$(this).datepick('destroy');
	// 	var options = {
	//     	minDate: $(this).data('mindate'),
	//     	maxDate: $(this).data('maxdate'),
	//     	dateFormat: 'm/d/yyyy',
	//     	onSelect: function(dates){
	//     		var date = moment(dates[0]).format("M/D/YYYY");
	//     		updateDate(date);
	//     	}			
	// 	};
	//     $(this).datepick(options);
	// })

	// serviceItems.data('initialized',true);
	// serviceLIs.data('initialized',true);
	// categoryLIs.data('initialized',true);
	// durationItems.data('initialized',true);
	// patientItems.data('initialized',true);
	// timepicker.data('initialized',true);
	// dateSelect.data('hasUpdateFx',true);
	// serviceBtn.data('initialized',true);
	// removeServiceBtn.data('initialized',true);	
}
function moveServiceSelect(id, display = true){
	console.log('use appointments.form.collectElements');
	return;
	$(id).find(".section").last().append($("#SelectServices"));
	if (display){$("#SelectServices").fadeIn();}else{$("#SelectServices").hide();}
}
function movePracTimeSelect(id, display = true){
	console.log('use appointments.form.collectElements');
	return;
	$(id).find(".section").last().append($("#SelectPractitioner, #SelectDateTime"));
	$("#SelectPractitioner").find('li').removeClass('disabled');
	if (display){$("#SelectPractitioner, #SelectDateTime").fadeIn();}else{$("#SelectPractitioner, #SelectDateTime").hide();}
}
function moveDetails(id, display = true){
	console.log('use appointments.form.collectElements');
	return;
	var timeEdit = $("#ApptDetails").find('.time').find('.edit');
	$("#ApptDetails").insertAfter($(id).find("h2").first());
	$("#ApptDetails").find(".value").text("none");
	$("#ApptDetails").find(".edit").text('select');
	timeEdit.text('');
	if (display){$("#ApptDetails").fadeIn();}else{$("#ApptDetails").hide();}
}

function goBack(){
	var box = $(this).closest(".selector"), steps = box.children().not(".progressBar"), current = steps.filter(":visible"), prev = current.prev(".step");
	if (prev.length != 0){
		current.fadeOut(200,function(){
			prev.fadeIn(400);
			prev.find(".active").removeClass('active');
			// reset current/prev
			current = steps.filter(":visible"), prev = current.prev(".step");
			if (prev.length == 0){
				box.find('.progressBar').find(".back").fadeOut(400);
			}
		})
	}else{box.find(".back").fadeOut();}
}
function goForward(){
	var box = $(this).closest(".selector"), steps = box.children().not(".progressBar"), current = steps.filter(":visible"), next = current.next(".step");	if (next.length != 0){
		current.fadeOut(200,function(){
			next.fadeIn(400);
			next.find(".active").removeClass('active');
			// reset current/next
			current = steps.filter(":visible"), next = current.next(".step");
			if (current.hasClass("noBack")){
				box.find('.progressBar').find(".back").fadeOut(400);
			}
		})
	}
}
function firstStep(box = null){
	if (typeof box == 'object'){box = $(this).closest(".selector");}
	var steps = box.children('.step'), current = steps.filter(":visible"), first = steps.first();
	if (first.length != 0){
		current.fadeOut(200,function(){
			first.fadeIn(400);
			first.find(".active").removeClass('active');
			// reset current/first
			current = steps.filter(":visible"), first = steps.first();
			if (current.hasClass("noBack")){
				box.find('.progressBar').find(".back").fadeOut(400);
			}
		})
	}	
}
function showAppointmentDetails(){
    var modalId = $(this).data('target');
    activeForm = $(modalId);
    // console.log(activeForm);
    moveServiceSelect(modalId, false);
    movePracTimeSelect(modalId, false);
    moveDetails(modalId);
    $(modalId).find(".selector").hide();
    if (modalId == '#createAppointment'){
        resetEntireAppt();
        updateAppointment();
    }else{
    	updateAppointment({
    		date: activeForm.find(".date").val(),
    		time: activeForm.find(".time").val()
    	});
    }
    updateServiceNames();
    blurElement($("body"),modalId);
}

function resetEntireAppt(){
	var patient = null;
	resetConnectedModels();
	if (activeForm){
		activeForm.find('input, textarea').val("");
		activeForm.find('.active').removeClass('active');
		activeForm.removeData('dateTime');		
	}
	if (defaultPatientInfo){patient = defaultPatientInfo.id
	}else if (getUids('Patient') != null){patient = Number(getUids('Patient'))
	}

	appointmentDetails = 
	{
		services:null,
		date:null,
		time:null,
		datetime:null,
		patient: patient,
		practitioner: defaultPractitionerInfo ? defaultPractitionerInfo.practitioner_id : null,
	};
}
function updateDate(date){
	console.log(activeForm,date);
    updateAppointment({date:date,time:null,datetime:null});
    updateAvailableTimes(activeForm);
    addDetail('date',date);
    addDetail('time','none');
    activeForm.find(".date").val(date);
    $("#SelectDate").find(".next").removeClass('disabled').click();
}
function updateAvailableTimes(){
    // console.log('updateAvailableTimes');
    var bizHours = $("#BizHours").data('schedule'), services = appointmentDetails.services, duration = Number(activeForm.find('.duration').val()), date = appointmentDetails.date, slots = $("#TimeSelector").find("li"), practitioner = appointmentDetails.practitioner;
    if (practitioner){
        // var id = practitioner[0];
        practitionerInfo = practitioners.find(p => {
            return p.practitioner_id === practitioner;
        })
    }
    // console.log(practitioner);
    slots.addClass('disabled');
    var anonEvents = $("#AnonFeed").data('schedule');
    // console.log(practitioners);
    slots.each(function(){
        var slot = $(this), time = slot.data('value'), practitionerEvents, available, momentObj;
        momentObj = moment(date+" "+time, "MM/DD/YYYY HH:mm:ss");
        bizHourCheck = checkSchedule(momentObj, bizHours, services, duration);
		available = availablePractitioners(momentObj, duration, services, true);
        if (bizHourCheck === true){
            slot.removeClass('disabled');
        }
        if (practitioner == null){
        }else{
        	if ($.inArray(practitioner, available) > -1){
        		slot.removeClass('disabled');
        	}else{
        		slot.addClass("disabled");
        	}
        }
    })
    if (usertype == 'patient'){
    	slots.filter('.disabled').hide();
    	slots.not('.disabled').show();
    }
}
function updatePractitioner(){
	console.log("UPDATE PRACTITIONER");
    var name = $(this).text(), list = $("#PractitionerSelector").data('details'), id = list[name];
	updateAppointment({practitioner:id});
	$("#SelectPractitioner").slideFadeOut(800,function(){
		$("#SelectPractitioner").resetActives().css('opacity',1);
		// $("#SelectPractitioner").find('.active').removeClass('active');
	});
}
function randomPractitioner(){
    var form = activeForm;
    var p = randomArrayElement(availablePractitioners(form.data('dateTime'),form.find("#duration").val(),$("#ServiceListModal").data('uidArr')));
    updateInputByUID(form.find("#select_practitioner"),p.practitioner_id);
    addDetail('practitioner',p.name);
}
function updateTime(){
    if ($(this).hasClass('disabled')){return;}
    // console.log('updateTime');
    var form = $("#createAppointment, #editAppointment").filter(":visible"), time = $(this).text().replace(" ",""), date = form.find(".date").val(), services = $("#ServiceListModal").data('uidArr');
    form.find(".time").val(time);
    var dateTime = moment(date + " " + time,'MM/DD/YYYY hh:mma');
    $("#SelectTime").find(".next").removeClass('disabled').click();
    form.data('dateTime',dateTime);
    addDetail('time',time);
    updateAppointment({time:time});
    if (!defaultPractitionerInfo){
		var p = availablePractitioners(dateTime,form.find("#duration").val(), services);
	    $("#PractitionerSelector").find("li").addClass('disabled');
	    $.each(p,function(x,practitioner){
	        $("#PractitionerSelector").find("li").filter(function(){return $(this).text() == practitioner.name}).removeClass('disabled');
	    })
    }
    // slideFadeOut($(this).closest('.selector'));
    $(this).closest('.selector').slideFadeOut(800);
}

function updateAppointment(attrArr = null){
	if (attrArr){
		$.each(attrArr,function(attr,val){
			if (attr == 'services'){
				if (val === null){appointmentDetails.services = null;}
				else if (typeof val == 'object'){appointmentDetails.services = val;}
				else if (appointmentDetails.services == null){appointmentDetails.services = [val];}
				else {appointmentDetails.services.push(val);}
			}else{
				appointmentDetails[attr] = val;
			}
		})
		if (appointmentDetails.date && appointmentDetails.time && !appointmentDetails.datetime){
			appointmentDetails.datetime = moment(appointmentDetails.date + " " + appointmentDetails.time, "M/D/YYYY h:mma");
		}
		if (appointmentDetails.datetime && (!appointmentDetails.date || !appointmentDetails.time)){
			appointmentDetails.date = appointmentDetails.datetime.format("M/D/YYYY");
			appointmentDetails.time = appointmentDetails.datetime.format("h:mma");
		}
	}
	var appt = appointmentDetails;	
	// console.log(activeForm, appointmentDetails);
	if (activeForm){
		if (appt.patient){
			updateInputByUID(activeForm.find(".select_patient"),appt.patient);
			addDetail('patient',activeForm.find(".select_patient").val());
		}else{removeDetail('patient');}
		if (appt.practitioner){
			updateInputByUID(activeForm.find(".select_practitioner"),appt.practitioner);
			addDetail('practitioner',activeForm.find(".select_practitioner").val());
		}else{removeDetail('practitioner');}
		if (appt.date){
			activeForm.find('.date, .DateSelector').val(appt.date);
			addDetail('date',activeForm.find(".date").val());
		}else{removeDetail('date');}
		if (appt.time){
			activeForm.find('.time').val(appt.time);
			addDetail('time',activeForm.find(".time").val());
		}else{removeDetail('time');}
		if (appt.services){
			// console.log(activeForm,activeForm.find(".select_services"));
			updateInputByUID(activeForm.find(".select_services"),appt.services);
			addDetail('services',activeForm.find(".select_services").val());
		}else{
			removeDetail('services');
		}
	}
	updateAvailableTimes();
	updateServiceNames();
	if (usertype == 'patient'){
		if (appt.practitioner && appt.services){
			$("#ApptDetails").find('.date').find('.edit').show();
		}else{
			$("#ApptDetails").find('.date').find('.edit').hide();			
		}		
	}else{
		if (appt.date){$("#ApptDetails").find('.date').find('.edit').show();}
	}

	setTimeout(function(){
		if (appt.patient){updatePatientData();}
		if (appt.practitioner){updatePractitionerData();}
	    updateAvailableServices();
	},205)

	var requires = [];
	if (appt.patient === null){requires.push('patient')};
	if (appt.practitioner === null){requires.push('practitioner')};
	if (appt.services === null){requires.push('services')};
	if (appt.datetime === null){requires.push('datetime')};
	
	if (requires.length == 0){
		$("#editAppointment, #createAppointment").find('.submitForm').removeClass('disabled');
		return true;
	}else{
		$("#editAppointment, #createAppointment").find('.submitForm').addClass('disabled');
		return requires;
	}
	// return (requires.length == 0) ? true : requires;
}
function resetConnectedModels(){
	// $("#ServiceListModal").removeData('uidArr');
	// $("#PractitionerListModal").removeData('uidArr');
	$(".connectedModel").removeData('uidArr');
	$(".connectedModelItem").val("");
	// console.log("resetConnectedModels");
}
function refreshAppointmentFeed(info){
	if (info == 'no changes'){
		return;
	}else if (typeof info == 'string'){
		var feed = jsonIfValid(info);
		if (!feed){return;}
	}else if (typeof info == 'object'){
		var feed = info;
	}
	if (feed.appointments == undefined){return;}
	var appts = feed.appointments;
	if ($('.calendar').length == 1){
		calendar.getEventSourceById('appointments').remove();
		calendar.addEventSource({events:appts,id:'appointments'});		
	}
	$("#AppointmentsFullCall").data('schedule',appts);
	var anon = (feed.anon != undefined) ? feed.anon : null;
	if (anon){$("#AnonFeed").data('schedule',anon);}
	changeTitles();
}
function checkFormStatus(){
	var formInfo = $(this).closest('.checkFormStatus');
	console.log(usertype);
	if (usertype == 'patient'){
		if (formInfo.data('completed')){
			confirm('Form Completed',"You've already completed this form!",'see your submission','go back');
			setUid('Submission',formInfo.data('completed'));
			var callback = function(){
				unblurAll(function(){
					$("#submissions-index").find(".title").click();					
				});
			}
		}else{
			confirm('Required Form Status','You haven\'t completed this form yet. Would you like to go to the forms page now?','go to forms','not right now');
			setUid('Form',formInfo.data('form_id'));
			var callback = function(){
				unblurAll(function(){
					$("#forms-home").find(".title").click();
				});
			}
		}
	}else if (usertype == 'practitioner'){
		if (formInfo.data('completed')){
			confirm('Form Completed',"Patient has already submitted this form",'view submission','go back');
			setUid('Submission',formInfo.data('completed'));
			var callback = function(){
				unblurAll(function(){
					$("#submission-index").find(".title").click();
				});
			}
		}else{
			confirm('Required Form Status','Patient has not completed this form.<h3 class="pink">Send reminder?</h3>','yes send reminder','not right now');
			var callback = function(){
				alert("SEND REMINDER");
			}
		}
	}

	var wait = setInterval(function(){
		// console.log(confirmBool);
		if (confirmBool != undefined){
			if (confirmBool){
				unblurTopMost();
				callback();
			}else{
				clearInterval(wait);
				confirmBool = undefined;
			}
			clearInterval(wait);
			setTimeout(function(){
				confirmBool = undefined;
			},300)
		}
	},100)	
}
function getServiceNames(){
	var services = appointmentDetails.services, names = [];
	$.each(services,function(s,serviceId){
		names.push($("#ServiceDetails").find("li").filter(function(){return $(this).data('id') == serviceId}).text());
	})
	return (names.length == 0) ? null : names;
}
function addService(){
	var service = $("#ServiceDetails").find(".active"), id = service.data().id, dateBtn = $("#ServiceSummary").find(".selectDate");
	// console.log(service.data(),id);
	updateAppointment({services:id});
	if (appointmentDetails.practitioner){dateBtn.show();
	}else{dateBtn.hide();}
	// updateServiceNames();
}
function removeService(){
	// console.log(appointmentDetails.services);
	var services = appointmentDetails.services;
	if (services == null || services.length == 0){
		return false;
	}
	services.pop();
	if (services.length == 0){
		updateAppointment({services:null});
	}else{
		updateAppointment({services:services});		
	}
	// console.log(appointmentDetails.services);
}
function updateServiceNames(){
	var services = getServiceNames();
	if (services){
		$("#ServiceSummary").find(".summary").text(services.join(", "));
	}else{
		$("#ServiceSummary").find(".summary").text('none selected');
		$("#ApptDetails").find(".services").find(".edit").click();
	}
}
function updateDuration(){
	// console.log('updateDuration');
	var form = $("#SelectServices").closest('.modalForm'), services = form.find('.select_services').val().split(", "), durationInput = form.find(".number").find('input'), duration = 0, endDateTime, matches = $("#ServiceDetails").find('li').filter(function(){return $.inArray($(this).text(), services) > -1;}), dateTime = form.data('dateTime'), practitioner = $("#SelectServices").data('practitionerInfo'), serviceIds = $("#ServiceListModal").data('uidArr') == undefined ? null : $("#ServiceListModal").data('uidArr'), practitionerCheck, formVisible = form.is(":visible"), h2 = [], div = [];
	matches.each(function(m,match){
		duration = duration + Number($(this).data('duration'));
		endDateTime = moment(dateTime).add(duration, 'm');
		if (formVisible){
			practitionerCheck = practitioner ? checkSchedule(dateTime, practitioner.schedule, serviceIds, duration) : null;
			bizCheck = checkSchedule(dateTime, $("#BizHours").data('schedule'), null, duration);
			if (bizCheck !== true && practitionerCheck === null){
	            handleCheck(bizCheck,'biz','service',dateTime,endDateTime);
			}else if (practitionerCheck && practitionerCheck !== true){
				handleCheck(practitionerCheck,'practitioner','service',dateTime,endDateTime);
			}
		}
	})
	if (matches.length == 0){duration = "0"}
	durationInput.val(duration);
}
function addDetail(type,value){
	console.log('use appointment.details');
	return;
	// if (type == 'services'){console.log(value)}
    $("#ApptDetails").find("."+type).find(".value").text(value);
    $("#ApptDetails").find("."+type).find(".edit").show().text("change");
    if (type == 'date'){
    	$("#ApptDetails").find(".time").find(".edit").text("select");
    }
    if (defaultPractitionerInfo){$("#ApptDetails").find('.practitioner').find(".edit").hide();}
}
function removeDetail(type){
	console.log('use appointment.details');
	return;
    if ($.isArray(type)){
        $.each(type,function(x,t){
            removeDetail(t);
        })
    }else{
        var t = (type == 'time') ? "" : "select";
        $("#ApptDetails").find("."+type).find(".value").text("none");
        $("#ApptDetails").find("."+type).find(".edit").text(t);        
    }
}
function openDetail(){
    var targetId = $(this).data('target'), target = $(targetId), openBtn = target.find('.openBtn'), steps = target.children('div').not('.progressBar'), 
    	allDetails = $("#SelectServices, #SelectDateTime, #SelectPractitioner"), inactive = allDetails.not(target);
    if (target.hasClass('modalForm')){
    	if ($(this).data('input') != undefined){
    		activeForm.find($(this).data('input')).addClass('targetInput');
    	}
    	blurTopMost(targetId);
    }else{
	    if (target.is("#SelectServices") && !appointmentDetails.patient){
	        feedback("Select A Patient","You must select a patient to determine the services available");
	        return;
	    }
	    steps.hide();
	    steps.first().fadeIn();
	    if (inactive.filter(":visible").length > 0){
	    	inactive.hide();
	    	target.css('opacity',1);
	    	target.fadeIn();
	    }else{
		    target.slideFadeIn();
	    }
	    if (($(this).text() == 'change' && !$(this).closest('h3').hasClass('date'))
	    	|| ($(this).closest('h3').hasClass('.time'))){
	    	steps.hide();
	    	steps.last().show();
	    }
	    
	    target.resetActives();
	    target.find('.back').fadeOut();    	
    }
}
function noEventConflict(start, duration, anonEvents){
	if (anonEvents===null){return true;}
	var sameDayEvents = anonEvents.filter(event => moment(event.start).format("MM-DD-YYYY") == start.format("MM-DD-YYYY")), pass = true,
		end = moment(start).add(Number(duration),'m');
	$.each(sameDayEvents,function(x,event){
		if (conflictWithExistingEvent(start, end, event)){pass = false;}
	})
	return pass;
}
function conflictWithExistingEvent(start, end, event){
	var conflict = true, eventStart = moment(event.start), eventEnd = moment(event.end);
	if (start.isSameOrAfter(eventEnd)){
		conflict = false;
	}else if (end.isSameOrBefore(eventStart)){
		conflict = false;
	}
	return conflict;
}
function hideAlreadySelected(progressiveSelector){
	var targetStr = progressiveSelector.data('target'), target = modalOrBody($(this)).find(targetStr), currentVal = target.val(),
		matches = progressiveSelector.find("li").filter(function(){
			return currentVal.includes($(this).text());
		});
	matches.data('show',false);
}

function updatePatientData(){
	// console.log('updatePatientData');
	var patient = appointmentDetails.patient, row, patientId;
	if (defaultPatientInfo){
		patientInfo = defaultPatientInfo;
		$("#ApptDetails").find('.patient').hide();
	}else{
		row = $("#PatientList").find("tr").filter(function(){return Number($(this).data('uid')) == patient;});
		$.each(row.find(".patientInfo").text().split(','),function(i,info){
        	var key = info.split(":")[0], val = info.split(":")[1];
        	if (val == "true"){val = true;}
        	if (val == "false"){val = false;}
        	patientInfo[key] = val;
        })
        patientInfo['id'] = patient;
        patientInfo['name'] = trimCellContents(row.find('.name'));
	}
	updateAvailableServices();
}
function updatePractitionerData(){
	// console.log('updatePractitionerData');
	var practitioner = appointmentDetails.practitioner, practitionerInfo;

	if (practitioner){
		$.each($("#Practitioners").data('schedule'),function(p,pract){
			if (pract.practitioner_id == practitioner){practitionerInfo = pract;}
		})
		if (activeForm){
			var services = ($("#ServiceListModal").data('uidArr') == undefined) ? null : $("#ServiceListModal").data('uidArr'),
				duration = ($.inArray(activeForm.find("#duration").val(),['','0']) > -1) ? null : Number(activeForm.find("#duration").val()), 
				time = activeForm.find(".time").val(), date = activeForm.find(".date").val(), dateTime = moment(date + " " + time, "MM-DD-YYYY hh:mma");
			dateTime = (activeForm.data('dateTime') != undefined) ? activeForm.data('dateTime') : null;
			if (services){
				updateDuration();
			}else if (dateTime){
				var check = checkSchedule(dateTime, practitionerInfo.schedule, null, duration);
				if (check !== true){
					var endTime = (duration) ? moment(dateTime).add(duration,'m') : null;
					setTimeout(function(){
						handleCheck(check,'practitioner','practitioner',dateTime, endTime);
					},500)
				}			
			}
		}
	}else{
		practitionerInfo = null;
		$("#PractitionerListModal").removeData('uidArr');
	}
	if (defaultPractitionerInfo){
		addDetail('practitioner',defaultPractitionerInfo.name);
		$("#SelectServices").find('.selectPractitioner').hide();
	}
	$("#SelectServices").data('practitionerInfo',practitionerInfo);
}
function updateAvailableServices(){
	// console.log('updateAvailableServices');
	var services = $("#ServiceDetails").find("li"), isNewPatient, newPatientsOk, newPatientsOnly, addonOk, addonOnly;
	var practitioner = appointmentDetails.practitioner;
	if (patientInfo == undefined){return false;}
	isNewPatient = patientInfo.isNewPatient;
	if (serviceOverride){
		services.data('show',true);
	}else if (isNewPatient){
		if (usertype == 'patient'){
			text = "New Patients are limited to Evaluation and Fascial Release appointments";
		}else if (allowOverride){
			text = "showing New Patient options only <span class='override'>show all</span>";
		}else{
			text = "showing New Patient options only";
		}
		$("#SelectServices").find(".conditionalLabel").html(text);
		services.each(function(){
			newPatientsOk = $(this).data('new_patients_ok');
			$(this).data('show',newPatientsOk);
		})
	}else if (!isNewPatient){
		$("#SelectServices").find(".conditionalLabel").text('');
		services.each(function(){
			newPatientsOnly = $(this).data('new_patients_only');
			$(this).data('show',newPatientsOnly);
		})
	}
	var count = (appointmentDetails.services) ? appointmentDetails.services.length : 0, text = $("#SelectServices").find(".conditionalLabel").text();
	if (count > 0){
		if (usertype == 'patient'){
			text = "Limited selection until Initial Evaluation";
		}else if (allowOverride){
			text = isNewPatient ? "Showing New Patient Add-On services only <span class='override'>show all</span>" : "Showing Add-On services only";
		}else{
			text = isNewPatient ? "Showing New Patient Add-On services only" : "Showing Add-On services only";
		}
		$("#SelectServices").find(".conditionalLabel").html(text);
		services.each(function(){
			addonOk = $(this).data('is_addon');
			if (!addonOk){
				$(this).data('show', false);
			}
		})
	}else{
		services.each(function(){
			addonOnly = $(this).data('add_on_only');
			if (addonOnly){
				$(this).data('show',false);
			}
		})
	}
	var alreadySelected = getServiceNames();
	if (alreadySelected){
		services.filter(function(){
			return alreadySelected.includes($(this).text());
		}).data('show',false);			
	}
	var showMe = services.filter(function(){
			return $(this).data('show')
		}), hideMe = services.not(showMe);
	// console.log(showMe,hideMe);
	showMe.show();
	hideMe.hide();
	updateAvailableCategories();
}
function updateAvailableCategories(){
	// console.log('updateAvailableCategories');
	var categories = $("#CategoryDetails").find("li"), services = $("#ServiceDetails").find("li"), categoryId, hasMatchingServices;
	categories.each(function(){
		categoryId = $(this).data('id');
		hasMatchingServices = (services.filter(function(){return $(this).data('show') && $(this).data('service_category_id') == categoryId}).length > 0);
		$(this).data('show',hasMatchingServices);
	});
	var showMe = categories.filter(function(){return $(this).data('show');}), hideMe = categories.not(showMe);
	showMe.show();
	hideMe.hide();
	if (showMe.length == 0){$("#CategoryDetails").find(".conditionalLabel").html("NO ADDITIONAL SERVICES AVAILABLE<br><div class='button xsmall pink removeService'>remove service</div><div class='button xsmall yellow selectDate'>select date</div>")}
}
function updateFormInfo(forms){
    $("#FormInfo").html("");
    $.each(forms,function(f, form){
    	var c = form.completed ? "complete":"incomplete";
        $("<div/>",{
            class: 'checkFormStatus ' + c,
            data: form,
            html: "<span class='link'>"+form.name+"</span>",
            css: {position:'relative'}
        }).appendTo($("#FormInfo"));
        if (form.completed){
            $("#FormInfo").find("div").last().append("<span class='checkmark'>✓</span>");
        }else{
            $("#FormInfo").find("div").last().append("<span class='xMark'>x</span>");
        }
    });
    if (forms.length == 0){
    	$("#FormInfo").append("<div>none</div>");
    }
}
function updateChartNoteBtn(noteInfo){
	$("#ChartNoteBtn").data('info',noteInfo);
}
function updateInvoiceBtn(invoiceInfo){
	$("#InvoiceBtn").data('info',invoiceInfo);
}

function selectCategory(){
	// console.log($(this).data());
	var back = $("#SelectServices").find(".progressBar").find(".back");
	back.find('.message').text("category");
	$("#CategoryDetails").fadeOut(200,function(){
		$("#ServiceDetails").fadeIn(400);
		$("#ServiceDetails").find(".active").removeClass('active');
		$("#ServiceDescription").hide();
		back.fadeIn(400);
	});
}
function showServiceDescription(){
	var data = $(this).data(), desc = data.description, price = data.price;
	$("#ServiceDescription").find(".message").html("<h4 class='purple'>"+desc+"<div class='pink'>$"+price+"</div></h4>");
	slideFadeIn($("#ServiceDescription"));
}
function confirmApptDelete(){
	var text, apptTime = $("#ApptDateTime").data('dateTime'), feeIncursion = moment().add(25, 'h').isAfter(apptTime), 
		dateStr = apptTime.format("h:mma [on] dddd MMMM Do, YYYY");
	if (usertype != 'patient'){
		var name = $("#PatientName").text();
		text = "<h3 class='purple flexbox'><span>"+name+"</span><span>"+dateStr+"</span></h3><label><input id='DoNotSendEmail' type='checkbox'>do not send cancellation email</label>";
		if (feeIncursion){text+="<br><label><input id='AutoChargeCancelFee' type='checkbox'>auto-charge cancellation fee</label>";}
	}else{
		text = "<div>You are about to cancel your appointment on "+dateStr+".</div>";
		if (feeIncursion){text += "<div class='paddedSmall'>Cancelling now will incur a cancellation fee because it is within 24hrs of your appointment.</div>";}
		text += "<label><input id='DoNotSendEmail' type='checkbox'>do not send cancellation email</label>";
	}
	confirm('Cancelling Appointment',text+'<h3 class="pink paddedSmall topOnly">Are you sure?</h3>','yes, cancel it','no, do not cancel');
	var wait = setInterval(function(){
		if (confirmBool != undefined){
			var obj = {};
			if ($("#DoNotSendEmail").length == 1 && $("#DoNotSendEmail").is(":checked")){obj['send_email'] = false;}
			else {obj['send_email'] = true;}
			if (feeIncursion && $("#AutoChargeCancelFee").length == 1){
				obj['late_cancel'] = $("#AutoChargeCancelFee").is(":checked") ? "charge" : 'no_charge';
			}else{obj['late_cancel'] = false;}
			if (confirmBool){
				deleteAppt(obj);
			}
			confirmBool = undefined;
			clearInterval(wait);
		}
	},100)
}
function deleteAppt(obj){
	blurTopMost("#loading");

	$.ajax({
		url:"/delete/Appointment/"+$("#editAppointment").data('uid'),
		method:"DELETE",
		data:obj,
		success:function(data){
			// if (data == 'checkmark'){
				// console.log(data);
				blurTopMost("#checkmark");
				delayedUnblurAll();
				refreshAppointmentFeed(data);
				// delayedUnblurAll();
				// calendar.refetchEvents();
			// }
		}
	})
}

function checkTime(momentObj, begin, end, duration = null){
	var arr = [];

	if (duration){
		duration = Number(duration);
		var moment2 = moment(momentObj).add(duration, 'm');
		if (!(momentObj.isSameOrAfter(begin) && momentObj.isBefore(end))){
			arr.push("start time");
		}
		if (!(moment2.isSameOrAfter(begin) && moment2.isSameOrBefore(end))){
			arr.push("end time");
		}
	}else{
		if (!(momentObj.isSameOrAfter(begin) && momentObj.isBefore(end))){
			arr.push("start time");
		}
	}
	return (arr.length == 0) ? true : arr;
}
function checkSchedule(momentObj, scheduleBlocks, services = null, duration = null){
	if (momentObj == undefined){return true;}
	var day = momentObj.day(), pass = false, notOffered = [], returnObj = {}, serviceInfo, dateInfo;
	// console.log(scheduleBlocks);
	$.each(scheduleBlocks,function(s,schedule){
		var start = moment(momentObj.format("MM-DD-YYYY") + " " + schedule.start_time, "MM-DD-YYYY hh:mma"), 
			end = moment(momentObj.format("MM-DD-YYYY") + " " + schedule.end_time, "MM-DD-YYYY hh:mma"),
			availableServices = (schedule.services != undefined) ? schedule.services : null, timeCheck;

		serviceInfo = {
			services: services,
			availableServices: availableServices
		};
		dateInfo = {
			momentObj: momentObj,
			start: start,
			end: end,
			duration: duration
		};
		var Sunday = (schedule.days.Sunday === true || schedule.days.Sunday === 'true'),
			Monday = (schedule.days.Monday === true || schedule.days.Monday === 'true'),
			Tuesday = (schedule.days.Tuesday === true || schedule.days.Tuesday === 'true'),
			Wednesday = (schedule.days.Wednesday === true || schedule.days.Wednesday === 'true'),
			Thursday = (schedule.days.Thursday === true || schedule.days.Thursday === 'true'),
			Friday = (schedule.days.Friday === true || schedule.days.Friday === 'true'),
			Saturday = (schedule.days.Saturday === true || schedule.days.Saturday === 'true'),
			isDayAvailable = [Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday];
		
		if (isDayAvailable[day]){
			returnObj = createCheckObj(dateInfo, serviceInfo);
			if ($.isEmptyObject(returnObj)){pass = true;}
		}
	})
	if (!pass && $.isEmptyObject(returnObj)){
		returnObj['timeCheck'] = ['no hours today'];
	}
	// console.log(returnObj);
	var r = ($.isEmptyObject(returnObj)) ? true : returnObj;
	return pass ? true : returnObj;
}
function createCheckObj(dateInfo, serviceInfo){
	var notOffered = [], timeCheck, returnObj = {};
	if (serviceInfo.services && serviceInfo.availableServices){
		$.each(serviceInfo.services,function(i,serviceId){
			if ($.inArray(serviceId,serviceInfo.availableServices) == -1){
				notOffered.push(serviceId);
			}
		})
		if (notOffered.length > 0){
			returnObj['notOffered'] = notOffered;
			returnObj['offered'] = serviceInfo.availableServices;
			returnObj['schedule'] = {'start':dateInfo.start,'end':dateInfo.end};
		}
	}
	timeCheck = checkTime(dateInfo.momentObj, dateInfo.start, dateInfo.end, dateInfo.duration);
	// console.log(dateInfo);
	if (timeCheck !== true){
		returnObj['timeCheck'] = timeCheck;
		returnObj['schedule'] = {'start':dateInfo.start,'end':dateInfo.end};
	}
	return returnObj;
}
function availablePractitioners(momentObj, duration, services, idsOnly = false){
	var practitioners = $("#Practitioners").data('schedule'), anonEvents = $("#AnonFeed").data('schedule'), availablePractitioners = [], availableIds = [];
	// console.log(typeof anonEvents);
	// practitioners = typeof practitioners == 'string
	$.each(practitioners,function(p,practitioner){
		var schedule = practitioner.schedule;
		var	pracMatch = anonEvents.filter(event => 
				(event.practitionerId != undefined && event.practitionerId == practitioner.practitioner_id)
				|| (event.block != undefined && event.block == true)
			), scheduleCheck = checkSchedule(momentObj, schedule, services, duration),
			conflictCheck = noEventConflict(momentObj, duration, pracMatch);
			// console.log(schedule,scheduleCheck,conflictCheck);
		if (scheduleCheck === true && conflictCheck){
			availablePractitioners.push(practitioner);
			availableIds.push(practitioner.practitioner_id);
		}
	})
	return idsOnly ? availableIds : availablePractitioners;
}
function applyEventClasses(details,element){
	var extProps = details.extendedProps, type = extProps.type, types = type.split(":").join(" ");
	$(element).addClass(types);
}
function handleCheck(check, type, action, start, end = null){
	var h2 = [], div = [], str = '';
	if (check.schedule != undefined){hours = "are set to " + check.schedule.start.format("h:mma") + "-" + check.schedule.end.format('h:mma') + ".";
	}else{hours = "are not set.";}

	if (type == 'biz'){
        h2.push('Outside Business Hours');
        if (end){
	        div.push("The selected services push the appointment end time to "+end.format("h:mm a")+", which is outside of business hours. On "+ end.format("dddd") + ", business hours "+hours);
        }else{
        	div.push(start.format("dddd, MMMM Do YYYY, h:mm a")+" is outside of business hours. On "+ start.format("dddd") + ", business hours "+hours);
        }
	}else if (type == 'practitioner'){
		var practitioner = $("#SelectServices").data('practitionerInfo'), services = $("#ServiceListModal").data('uidArr');

		if (check.timeCheck != undefined){
			var patient = (usertype == 'patient');
			var h = patient ? practitioner.name +" Unavailable" : 'Unscheduled Practitioner';
			h2.push(h);
			str = "";
			$.each(check.timeCheck, function(t,time){
				if (time.includes('start') && str == ""){
					str = "The start time, "+start.format("h:mm a")+", is outside of "+practitioner.name+"'s schedule. Their hours on " + check.schedule.start.format("dddd") +" are "+ check.schedule.start.format("h:mm a")+"-" + check.schedule.end.format("h:mm a") + ".";
				}else if (time.includes('end') && str == ""){
					if (patient){
						str = "Adding this service would push the appointment outside of " + practitioner.name + "'s availability. Would you like to choose a different date and time to accomodate this new service?";
					}else{
						str = "The end time, "+end.format("h:mm a")+", is outside of "+practitioner.name+"'s schedule. Their hours on " + check.schedule.start.format("dddd") +" are "+  check.schedule.start.format("h:mm a")+"-" + check.schedule.end.format("h:mm a") + ".";	
					}
				}else if (time.includes('end')){
					str = "This appointment time, "+start.format("h:mm a")+" to "+end.format("h:mm a")+", is outside of "+practitioner.name+"'s schedule. Their hours on " + check.schedule.start.format("dddd") +" are "+ check.schedule.start.format("h:mm a")+"-" + check.schedule.end.format("h:mm a") + ".";
				}
			})
			div.push(str);
		}else if (check.notOffered != undefined){
			var i = check.notOffered.length - 1, serviceId = check.notOffered[i], serviceName = services[i], offered;
			offered = commaSeparated(getColumnById("Service",check.offered),true);
			h2.push('Unscheduled Service');
			// console.log(services);
			div.push("'"+ serviceName + "' is not offered by " + practitioner.name + " at this time. On "+start.format('dddd')+"'s from "+check.schedule.start.format("h:mm a")+" to "+check.schedule.end.format("h:mm a")+" they offer only "+offered+".");
		}
	};

	$("#Warn").find(".message").html("");
	str = "";
	$.each(h2,function(i,error){
		str += "<h2>"+error+"</h2><div>"+div[i]+"</div>";
	});
	if (allowOverride){
		str += "<h3 class='pink'>Continue Anyway?</h3>";
	}

	var targetId = allowOverride ? "#Warn" : "#Confirm";
	$(targetId).find(".message").html(str);
    blurTopMost(targetId);

    if (allowOverride){
	    var wait = setInterval(function(){
	        if (confirmBool != undefined){
	            if (confirmBool){
	            	if (action == 'new'){
	            		blurElement($("body"),"#createAppointment");
	            	}else{
		            	unblurTopMost();
	            	}
	            }else{
	            	handleAction(action);
	            }
	            clearInterval(wait);
	            confirmBool = undefined;
	        }
	    },100)    	
    }else{
	    var wait = setInterval(function(){
	        if (confirmBool != undefined){
	            if (confirmBool){
	            	if (action == 'service'){
	            		removeDetail(['date','time']);
	            		$("#ApptDetails").closest(".modalForm").find(".time, .date, #DateSelector").val("");
	            	}
	            	unblurTopMost();
	            }else{
	            	handleAction(action);
	            }
	            clearInterval(wait);
	            confirmBool = undefined;
	        }
	    },100)    	
    }
}
function handleAction(action){
   	var form = $("#createAppointment, #editAppointment").filter(":visible");
	if (action == 'service'){
		// console.log('yup');
    	$("#SelectServices").find(".clearLastBtn").click();
	}else if (action == 'time'){
		form.find('.time').click();
	}else if (action == 'practitioner'){
		$("#PractitionerListModal").find(".active").removeClass('.active');
		$("#PractitionerListModal").removeData('uidArr');
		form.find('.select_practitioner').val('');
		$("#SelectServices").removeData('practitionerInfo');
	}
}

function loadPatientCal(target){
    var tz = target.data('timezone'), clientTz = moment.tz.guess(), location = target.data('location');
    moment.tz.setDefault(tz.replace(" ","_"));
    calendar = new FullCalendar.Calendar(target[0], {
        plugins: ['dayGrid','list', 'timeGrid', 'interaction', 'rrule', 'momentTimezone'],
        timeZone: tz,
        header:{
            left:"title",
            center:"",
            right:"prev,today,next dayGridMonth,listMonth",
        },
        height: "auto",
        dateClick: function(info){
            resetEntireAppt();
            // console.log(info);
            var date = moment(info.date).format("M/D/YYYY");
            updateAppointment({date:date});
            $("#booknow").click();
        },
        eventClick: function(info){
            var ev = info.event, details = $.extend(true, {}, ev.extendedProps), patients = details.patients, practitioner = details.practitioner, services = details.services, patientIds = details.patientIds, practitionerId = details.practitionerId, serviceIds = details.serviceIds, forms = details.forms, dateTime = moment(ev.start), uid = details.bodywizardUid, type = details.type, ele = $(info.el), title = ev.title;
            // console.log(ev,details);
            resetEntireAppt();
            if (ele.hasClass('appointment')){
                activeForm = $("#editAppointment");
                updateAppointment({
                    patient:patientIds[0],
                    practitioner:practitionerId,
                    services:serviceIds,
                    datetime:dateTime
                });
                $("#editAppointment").data('uid',uid);
                setUid("Appointment",uid);
                $("#PatientName").text(patients);
                $("#PractitionerName").text(practitioner);
                $("#ApptDateTime").text(dateTime.format("h:mm a [on] dddd, MMMM Do YYYY"));
                $("#ApptDateTime").data('dateTime',dateTime);
                $("#ServiceInfo").text(services);
                // console.log('updateform',details,forms);
                updateFormInfo(details.forms);
                moveServiceSelect("#editAppointment");
                // loadApptInfo(patientIds,practitionerId,serviceIds,dateTime,$("#editAppointment"));
                blurElement($("body"),"#Appointment");                
            }
        },
        defaultView:"listMonth",
        allDaySlot: false,
        minTime:$("#BizHours").data("earliest"),
        maxTime:$("#BizHours").data("latest"),
        noEventsMessage: "No appointments scheduled this month",
        eventSources: 
        [
            {
                events: jsonIfValid($("#AppointmentsFullCall").data('schedule')),
                id: "appointments"
            }
        ],
        businessHours: $("#BizHours").data('fullcal'),
        eventRender: function(info){
            var eventData = info.event, ele = info.el;
            applyEventClasses(eventData,$(ele));
        },
        nowIndicator: true
    })

    calendar.render();
    resizeFcCalendar();
    var tb = target.find(".fc-toolbar");
    $("#TimezoneWrap").insertAfter(tb).css('display','inline-block');
    if (tz != clientTz){
        $("#TimezoneWrap").html("Take note: you appear to be in a different timezone than your appointments will be held.<br><b>Appointments are displayed and scheduled in local "+location+" time.</b>");
    }
}
function loadPractitionerCal(target){
    var tz = target.data('timezone'), clientTz = moment.tz.guess(), location = target.data('location');
    moment.tz.setDefault(tz.replace(" ","_"));

    calendar = new FullCalendar.Calendar(target[0], {
        plugins: ['dayGrid','list', 'timeGrid', 'interaction', 'rrule', 'momentTimezone'],
        timeZone: tz,
        header:{
            left:"title",
            center:"",
            right:"prev,today,next dayGridMonth,timeGridWeek,timeGridDay",
        },
        height: "auto",
        dateClick: function(info){
            activeForm = $("#createAppointment");
            serviceOverride = false;
            resetEntireAppt();
            moveServiceSelect("#createAppointment",false);
            movePracTimeSelect("#createAppointment",false);
            moveDetails('#createAppointment');
            var date = moment(info.date).format("M/D/YYYY"), time = moment(info.date).format("h:mma");
            updateAppointment({date:date,time:time});
            blurElement($("body"),'#createAppointment');
        },
        eventClick: function(info){
            var ev = info.event, details = $.extend(true, {}, ev.extendedProps), ele = $(info.el), dateTime = moment(ev.start);
            // var patients = details.patients, practitioner = details.practitioner, services = details.services, patientIds = details.patientIds, practitionerId = details.practitionerId, serviceIds = details.serviceIds, forms = details.forms, dateTime = moment(ev.start), uid = details.bodywizardUid, type = details.type, ele = $(info.el);
            serviceOverride = false;
            resetEntireAppt();
            console.log(details);
            if (ele.hasClass('appointment')){
                activeForm = $("#editAppointment");
                moveServiceSelect("#editAppointment",false);
                movePracTimeSelect("#editAppointment",false);
                moveDetails('#editAppointment');
                updateAppointment({
                    patient: details.patient.id,
                    practitioner: details.practitioner.id,
                    services: details.serviceIds,
                    datetime: details.dateTime
                });
                $("#editAppointment").data('uid',details.uid);
                // setUid("Appointment",details.uid);
                uids.set({
                	Appointment: details.uid,
                	Practitioner: details.practitioner.id,
                	ChartNote: details.chartNote.id
                });
                uids.log();
                $("#PatientName").text(details.patient.name);
                $("#PractitionerName").text(details.practitioner.name);
                $("#ApptDateTime").text(dateTime.format("h:mm a [on] dddd, MMMM Do YYYY"));
                $("#ApptDateTime").data('dateTime',dateTime);
                $("#ServiceInfo").text(details.services.names);
                updateFormInfo(details.forms);
                updateChartNoteBtn(details.chartNote);
                updateInvoiceBtn(details.invoice);
                // loadApptInfo(patientIds,practitionerId,serviceIds,dateTime,$("#editAppointment"));
                blurElement($("body"),"#Appointment");                
            }
        },  
        defaultView:"timeGridWeek",
        allDaySlot: false,
        minTime:$("#BizHours").data("earliest"),
        maxTime:$("#BizHours").data("latest"),
        // events: $("#ApptFeed").data("events")
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
            var eventData = info.event, ele = info.el;
            applyEventClasses(eventData,$(ele));
        },
        nowIndicator: true
    })

    calendar.render();
    resizeFcCalendar();
    var tb = target.find(".fc-toolbar");
    $("#TimezoneWrap").insertAfter(tb).css('display','inline-block');
    if (tz != clientTz){
        $("#TimezoneWrap").html("Take note: you appear to be in a different timezone than your appointments will be held.<br><b>Appointments are displayed and scheduled in local "+location+" time.</b>");
    }
    $("#ChangeTitleWrap").insertAfter(tb).css('display','inline-block');
    $("#ChangeTitleWrap").on('click','li',changeTitles);
    $("#ChangeTitle").find("li").filter('[data-value="service"]').addClass('active');
}

// PRACTITIONER FUNCTIONS
function changeTitles(){
	var active = $("#ChangeTitle").find(".active"), hasActive = (active.length == 1), attr, events = calendar.getEvents();
	if (!$(this).is('li')){
		if (!hasActive){console.log("oh");return;}
		attr = active.data('value');
	}else{
		attr = $(this).data('value');
	}
    if (attr == 'names'){
        $.each(events,function(e,event){event.setProp('title', event.extendedProps.patient.name)})
    }else if (attr == 'service'){
        $.each(events,function(e,event){event.setProp('title', event.extendedProps.services.names.split(", ")[0])})
    }else if (attr == 'no label'){
        $.each(events,function(e,event){event.setProp('title', "")})
    }
    calendar.rerenderEvents();
}
function overrideService(){
    serviceOverride = true;
    updateAvailableServices();
    $("#SelectServices").find(".conditionalLabel").text('showing all options');
    $('.step').hide();
    $("#CategoryDetails").find(".active").removeClass('active');
    $("#CategoryDetails").fadeIn();
}
function checkForChartNote(){
	var info = $("#ChartNoteBtn").data('info');
	console.log(info);
	if (info.id === null){
		confirm('No Chart Note',"There is no chart note for this appointment yet. <h3 class='pink'>Create chart note now?</h3>", 'yes, create','not now', null, loadChartNoteInEditor);
	}
	else if (info.status == 'not signed'){
		confirm('Unsigned Chart Note',"There's an unsigned chart note for this appointment. <h3 class='pink'>Do you want to edit it?</h3>",'yes, edit','not now', null, loadChartNoteInEditor);
	}else{
		// console.log("confirming");
		confirm('Chart Note Complete',"The chart note for this appointment is already signed. <h3 class='pink'>View chart note?</h3>",'yes, view','not now',null, chartnote.view(info.id));
	}
	return false;
}
function checkForInvoice(){
	var info = $("#InvoiceBtn").data('info');
	console.log(info);
	if (info.id === null){
		confirm('No Invoice',"There is no invoice for this appointment yet. <h3 class='pink'>Create invoice now?</h3>", 'yes, create','not now', null, loadInvoiceInEditor);
	}
	else if (info.status == 'unsettled'){
		confirm('Unpaid Invoice',"There's an unsettled invoice for this appointment. <h3 class='pink'>Do you want to edit it?</h3>",'yes, edit','not now',null,invoice.view.apptInfoClick);
	}else{
		confirm('Invoice Settled',"The invoice for this appointment is already settled. <h3 class='pink'>View invoice?</h3>",'yes, view','not now',null,function(){alert('hi')});
	}
	return false;
}
function loadChartNoteInEditor(){
	console.log('use chartnote.view')
	unblurAll(function(){clickTab("chart-note-create");});
}
function loadInvoiceInEditor(){
	console.log('use invoice.char')
	unblurAll(function(){clickTab("invoice-create");});
}
