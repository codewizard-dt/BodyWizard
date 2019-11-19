$(document).ready(function(){
	var model = ($(".optionsNav").length > 0) ? $(".optionsNav").data('model') : "Practice",
		target = (model == "Practice") ? "body" : "#EditScheduleModal";
	if ($.inArray(model, ['StaffMember','Practice']) > -1){
		$("#AddTimeBlock, #EditTimeBlock").find(".item").filter(function(){
			return $(this).find(".q").text() == "Services Offered" || $(this).data('type') == 'narrative';
		}).hide();
	}

	$("#AddTimeBlockBtn").on('click',function(){blurElement($(target),"#AddTimeBlock");});
	$("#AddBreakBtn").on('click',function(){blurElement($(target),"#AddBreak");});
	$("#AddTimeBlock, #AddBreak").on("click",'.submitForm',function(){
		var timeBlock = createTimeBlockObj($(this).closest('.modalForm'));
		if (timeBlock){
			addBlockToScheduleAndSave(timeBlock);
		}
	})
	$("#EditTimeBlock, #EditBreak").on("click",'.submitForm',function(){
		var timeBlock = createTimeBlockObj($(this).closest('.modalForm')), blockNum = $(this).data('block');
		if (timeBlock){
			editBlockAndSave(timeBlock,blockNum);
		}
	})

	$("#EditTimeBlock").find("h2").text("Edit Time Block");
	$("#EditBreak").find("h2").text("Edit Break");
	$("#deleteBlockBtn, #deleteBreakBtn").on('click',confirmDelete);
	$("#editBlockBtn, #editBreakBtn").on('click',editBlock);
	attachConnectedModelInputs($("#AddTimeBlock"));
	attachConnectedModelInputs($("#EditTimeBlock"));


	var schedule = $("#CurrentSchedule").data('schedulearray'), scheduleTables = filterByData(".scheduleTable","activated",'undefined'), timeBlockRows = scheduleTables.find("tr").not('.head');
	
	timeBlockRows.on("click",function(){
		console.log($(this));
	})
	    

    var miniCal = new FullCalendar.Calendar($("#miniSchedule")[0], {
 		plugins: ['dayGrid','list', 'timeGrid', 'interaction','moment'],
        header:{
            left:"",
            center:"",
            right:"",
        },
        height:"auto",
        allDaySlot:false,
	  	columnHeaderText: function(date) {
	    	if (date.getDay() === 0) {return 'Sunday';}
	    	else if (date.getDay() === 1) {return 'Monday';}
	    	else if (date.getDay() === 2) {return 'Tuesday';}
	    	else if (date.getDay() === 3) {return 'Wednesday';}
	    	else if (date.getDay() === 4) {return 'Thursday';}
	    	else if (date.getDay() === 5) {return 'Friday';}
	    	else if (date.getDay() === 6) {return 'Saturday';}
	  	},
        dateClick: function(info){
			console.log('Clicked on: ' + info.dateStr);
			console.log('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
			console.log('Current view: ' + info.view.type);
            // blurElement($("body"),"#NewAppointment");
			// change the day's background color just for fun
			// info.dayEl.style.backgroundColor = 'red';
        },
        defaultView:"timeGridWeek",
        minTime:($("#miniSchedule").data('earliest') != "23:00:00") ? $("#miniSchedule").data('earliest') : "8:00:00",
        maxTime:($("#miniSchedule").data('latest') != "00:59:59") ? $("#miniSchedule").data('latest') : "17:00:00",
 		events: schedule,
 		eventColor: 'rgba(240,154,53,0.7)',
 		eventTimeFormat:
 		{  
 			hour: 'numeric',
  			minute: '2-digit',
			meridiem:'narrow'
		},
 		eventRender: function(info){
 			var blockNum = info.event.extendedProps.block, isBreak = info.event.extendedProps.break;
 			$(info.el).data('block',blockNum);
 			if (isBreak){$(info.el).addClass('breakTime');}
 		}
 	})
	miniCal.render();
	var timeBlocks = filterUninitialized(".timeBlock");
	timeBlocks.hover(highlightTimeBlock,unhighlightTimeBlock);
	timeBlocks.on("click",editOrDelete);
	timeBlocks.data('initialized',true);
})
function highlightTimeBlock(){
	var block = $(this).data('block'), matches = $(".timeBlock").filter(function(){return $(this).data('block') === block;});
	$(".timeBlock").removeClass("hover");
	matches.addClass("hover");
}
function unhighlightTimeBlock(){
	$(".timeBlock").removeClass("hover");
}
function createTimeBlockObj(form){
	if (checkForm(form)){
		var services = form.find("#services_offered").data('uidArr');
		if (services != undefined && services.length == 0){services = undefined;}
		var days = {
			"Sunday": form.find("#selected_days").find("li[data-value='Sunday']").hasClass('active'),
			"Monday": form.find("#selected_days").find("li[data-value='Monday']").hasClass('active'),
			"Tuesday": form.find("#selected_days").find("li[data-value='Tuesday']").hasClass('active'),
			"Wednesday": form.find("#selected_days").find("li[data-value='Wednesday']").hasClass('active'),
			"Thursday": form.find("#selected_days").find("li[data-value='Thursday']").hasClass('active'),
			"Friday": form.find("#selected_days").find("li[data-value='Friday']").hasClass('active'),
			"Saturday": form.find("#selected_days").find("li[data-value='Saturday']").hasClass('active')
		};
		var obj = {
			"services": services,
			"days": days,
			"start_time":justResponse(form.find("#start_time")),
			"end_time":justResponse(form.find("#end_time")),
			"break": form.data('break')
		}
		console.log(obj);
		return obj;
	}else{
		return false;
	}
}
function sortScheduleSundayFirst(scheduleArr){
	var newScheduleArr = [], abreak, bbreak;
	newScheduleArr = scheduleArr.sort(function(a, b){
		return getFirstDay(a.days) - getFirstDay(b.days);
	})
	// Put breaks at the end of the schedule list
	newScheduleArr = newScheduleArr.sort(function(a, b){
		abreak = a.break ? 1 : 0;
		bbreak = b.break ? 1 : 0;
		return abreak - bbreak;
	})
	return newScheduleArr;
}
function getFirstDay(daysObj){
	if (daysObj.Sunday){return 0;}
	else if (daysObj.Monday){return 1;}
	else if (daysObj.Tuesday){return 2;}
	else if (daysObj.Wednesday){return 3;}
	else if (daysObj.Thursday){return 4;}
	else if (daysObj.Friday){return 5;}
	else if (daysObj.Saturday){return 6;}
}
function addBlockToScheduleAndSave(blockObj){
	var schedule = $("#CurrentSchedule").data('schedulejson'), 
		model = ($(".optionsNav").length > 0) ? $(".optionsNav").data('model') : "Practice",
		uid = (model == "Practice") ? null : $(".optionsNav").data('uid');

	schedule.push(blockObj);
	if (model == "Practice"){
		blurTopMost("#loading");
		$.ajax({
			url:"/schedule/Practice/save",
			method:"POST",
			data:{
				schedule: sortScheduleSundayFirst(schedule)
			},
			success:function(data){
				if (data == 'checkmark'){
					reloadTab();
				}else{
					console.log(data);
				}
			},
			error:function(e){
				console.log(e);
			}
		})
	}else{
		var columnObj = {schedule: sortScheduleSundayFirst(schedule)}, form = $("#AddTimeBlock").is(':visible') ? "#AddTimeBlock" : "#AddBreak";
		blurElement($(form),"#loading");
		$.ajax({
			url:"/save/"+model+"/"+uid,
			method:"PATCH",
			data:{
				columnObj : JSON.stringify(columnObj)
			},
			success:function(data){
				if (data=='checkmark'){
					blurElement($(form),"#checkmark");
					setTimeout(function(){
						$("#EditScheduleModal").clone().appendTo("body").attr("id","proxyModal");
						clearAllScheduleModals();
						$("#proxyModal").attr('id','EditScheduleModal');
						blurElement($("body"),"#EditScheduleModal");
						blurElement($("#EditScheduleModal"),"#loading");
						$.ajax({
							url:"/schedule/"+model+"/"+uid,
							success:function(data){
								$("#EditScheduleModal").html(data);
								blurTopMost("#EditScheduleModal");
							}
						})
					},500);
				}else{
					console.log(data);
				}
			},
			error:function(e){
				console.log(e);
			}
		})
	}
}
function editBlockAndSave(blockObj,blockNum){
	var schedule = $("#CurrentSchedule").data('schedulejson'), 
		model = ($(".optionsNav").length > 0) ? $(".optionsNav").data('model') : "Practice",
		uid = (model == "Practice") ? null : $(".optionsNav").data('uid');

	schedule.splice(blockNum,1,blockObj);
	if (model == "Practice"){
		blurTopMost("#loading");
		$.ajax({
			url:"/schedule/Practice/save",
			method:"POST",
			data:{
				schedule: sortScheduleSundayFirst(schedule)
			},
			success:function(data){
				saveSystemModals();
				if (data == 'checkmark'){
					reloadTab();
				}else{
					console.log(data);
				}
			},
			error:function(e){
				console.log(e);
			}
		})
	}else{
		var columnObj = {schedule: sortScheduleSundayFirst(schedule)}, form = $("#EditTimeBlock").is(":visible") ? "#EditTimeBlock" : "#EditBreak";
		blurElement($(form),"#loading");
		$.ajax({
			url:"/save/"+model+"/"+uid,
			method:"PATCH",
			data:{
				columnObj : JSON.stringify(columnObj)
			},
			success:function(data){
				saveSystemModals();
				if (data=='checkmark'){
					blurElement($(form),"#checkmark");
					setTimeout(function(){
						$("#EditScheduleModal").clone().appendTo("body").attr("id","proxyModal");
						clearAllScheduleModals();
						$("#proxyModal").attr('id','EditScheduleModal');
						blurElement($("body"),"#EditScheduleModal");
						blurElement($("#EditScheduleModal"),"#loading");
						$.ajax({
							url:"/schedule/"+model+"/"+uid,
							success:function(data){
								$("#EditScheduleModal").html(data);
						        blurTopMost("#EditScheduleModal");
							}
						})
					},500);
				}else{
					console.log(data);
				}
			},
			error:function(e){
				console.log(e);
			}
		})
	}
}
function editBlock(){
	var schedule = $("#CurrentSchedule").data('schedulejson'), blockNum = $(this).data('block'), blockObj = schedule[blockNum], 
		row = $(".scheduleTable").find("tr").filter(function(){
			return $(this).data('block') == blockNum;
		}), form = $(this).is("#editBlockBtn") ? "#EditTimeBlock" : "#EditBreak", target = modalOrBody($(this));

	$.each(blockObj.days,function(day,bool){
		var li = $(form).find("#selected_days").find("li").filter(function(){
			return $(this).data('value') == day;
		});
		if (bool){li.addClass('active');}
		else{li.removeClass('active');}
	})
	$(form).find(".submitForm").data('block',blockNum);
	$(form).find("#start_time").val(blockObj.start_time);
	$(form).find("#end_time").val(blockObj.end_time);
	if (blockObj.services == undefined){
		$(form).find("#services_offered").removeData('uidArr');
		$(form).find("#services_offered").val("");
	}else{
		$("#ServiceListModal").data('uidArr',blockObj.services);
		$(form).find("#services_offered").data('uidArr',blockObj.services);
		$(form).find("#services_offered").val(row.find(".services").text().replace("...","").trim());
	}
	blurElement($(target),form);
}
function deleteBlockAndSave(blockNum){
	var schedule = $("#CurrentSchedule").data('schedulejson'), 
	model = ($(".optionsNav").length > 0) ? $(".optionsNav").data('model') : "Practice",
	uid = (model == "Practice") ? null : $(".optionsNav").data('uid');

	schedule.splice(blockNum,1);

	if (model == "Practice"){
		$.ajax({
			url:"/schedule/Practice/save",
			method:"POST",
			data:{
				schedule: sortScheduleSundayFirst(schedule)
			},
			success:function(data){
				if (data == 'checkmark'){
					reloadTab();
				}else{
					console.log(data);
				}
			},
			error:function(e){
				console.log(e);
			}
		})
	}else{
		var columnObj = {schedule: sortScheduleSundayFirst(schedule)};
		blurTopMost("#loading");
		$.ajax({
			url:"/save/"+model+"/"+uid,
			method:"PATCH",
			data:{
				columnObj : JSON.stringify(columnObj)
			},
			success:function(data){
				if (data=='checkmark'){
					blurTopMost("#checkmark");
					saveSystemModals();
					setTimeout(function(){
						$("#EditScheduleModal").clone().appendTo("body").attr("id","proxyModal");
						clearAllScheduleModals();
						$("#proxyModal").attr('id','EditScheduleModal');
						blurElement($("body"),"#EditScheduleModal");
						blurElement($("#EditScheduleModal"),"#loading");
				        $("#EditScheduleModal").load("/schedule/"+model+"/"+uid, function(){
					        $("#EditScheduleModal").find(".cancel").on('click',function(){unblurElement($("body"));});
				        });
					},500);
				}
			}
		})		
	}
}
function confirmDelete(){
	var str = $(this).is("#deleteBlockBtn") ? "Time Block" : "Break", btn = $(this), target = modalOrBody($(this));
	$("#Warn").find(".message").html("<h2>Deleting " + str + "</h2><div>Are you sure?</div>");

	blurElement(target,"#Warn");
	var wait = setInterval(function(){
		if (confirmBool !== undefined){
			clearInterval(wait);

			if (confirmBool){
				deleteBlockAndSave(btn.data('block'));
			}else{
				// console.log('no');
				unblurElement(target);
			}
			confirmBool = undefined;
		}
	},100)
}
function editOrDelete(){
	var schedule = $("#CurrentSchedule").data('schedulejson'), model = $(".optionsNav").data('model'), uid = $(".optionsNav").data('uid'), 
		blockNum = $(this).data('block'), blockObj = schedule[blockNum], displayStr = "", target = modalOrBody($(this));

	var row = $("#SingleScheduleTable").find('tr').filter(function(){
		return $(this).data('block') == blockNum;
	}), days = row.find('.days').text().replace("...",""), times = row.find('.hours').text().replace("...",""), services = row.find('.services').text().replace("...",""), form, btns;
	if ($(this).hasClass('breakTime')){
		form = "#editOrDeleteBreak";
		btns = "#editBreakBtn, #deleteBreakBtn";
	}else{
		form = "#editOrDeleteBlock";
		btns = "#editBlockBtn, #deleteBlockBtn";			
	}
	$(form).find(".days").find('.value').text(days);
	$(form).find(".times").find('.value').text(times);
	$(form).find(".services").find('.value').text(services);
	$(btns).data('block',blockNum);
	blurElement($(target),form);
}