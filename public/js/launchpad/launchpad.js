var notify, notificationCheck, notificationCategory = 'all', clickWhenFinished = null, multiBtns;
var uids = {
	list: {},
	set: function(model, uid = null){
		if (typeof model == 'string') uids.list[model] = uid ? Number(uid) : null;
		else $.each(model,function(key, value){uids.set(key, value);});
	},
	get: function(model){
		return (uids.list[model] != undefined) ? uids.list[model] : null;
	},
	clear: function(){uids.list = {}},
	log: function(){console.log(uids.list)}
};
const practice = {
	info: null,
	set: function(practiceData){
		if (Object.isFrozen(practice)) return;
		practice.info = practiceData;
		Object.freeze(practice);
	},
	get: function(key){
		if (!practice.info) log({error:'practice info not set'});
		return (practice.info[key] != undefined) ? practice.info[key] : null;
	}
}
const notifications = {
	current: [],
	element: null,
	markAsUnreadBtn: null,
	markAsReadBtn: null,
	deleteBtn: null,
	selectBtn: null,
	allBtn: null,
	limit: 1,
	timer: null,
	initialize: {
		all: function(){
			notifications.element = $("#Notifications");
			notifications.element.insertBefore($("#NavBar").find(".siteMenu").find('.divide'));
			$.each(notifications.initialize, function(name, initFunc){
				if (!['all'].includes(name) && typeof initFunc === 'function') initFunc();
			});
			notifications.update.list();
			if (notifications.timer) clearInterval(notifications.timer);
			notifications.timer = setInterval(notifications.get.unread, 180000);
		},
		buttons: function(){
			init([
				[notifications.element.find('.list').find(".tab"),function(){
					$(this).on('click', {notification: $(this)}, notifications.click)
				}],
				[notifications.element.find('.button.markAsUnread'), function(){
					notifications.markAsUnreadBtn = new Button({
						element: $(this),
						action: notifications.update.ajax.bind(null,'unread'),
						id: 'MarkSelectedAsUnreadBtn',
					});
				}],
				[notifications.element.find('.button.markAsRead'), function(){
					notifications.markAsReadBtn = new Button({
						element: $(this),
						action: notifications.update.ajax.bind(null,'read'),
						id: 'MarkSelectedAsReadBtn',
					});
				}],
				[notifications.element.find('.button.delete'), function(){
					notifications.deleteBtn = new Button({
						element: $(this),
						action: notifications.delete,
						id: 'DeleteSelectedBtn',
					});
				}],
				[$("#Notification").find('.button.markThisAsUnread'), function(){
					new Button({
						element: $(this),
						action: function(){
							notifications.update.ajax('unread');
							unblur();
						},
						id: 'MarkThisAsUnread',
					});
				}],
				[$("#Notification").find('.button.deleteThis'), function(){
					new Button({
						element: $(this),
						action: async function(){
							let result = await notifications.delete();	
							if (result) unblur();
						},
						id: 'DeleteThis',
					});
				}],
				[notifications.element.find('.button.selectMultiple'), function(){
					notifications.deleteBtn = new Button({
						element: $(this),
						action: function(){
							notifications.element.toggleClass('multi');
							if (notifications.limit == 1)	notifications.limit = null;
							else notifications.limit = 1;
						},
						id: 'SelectMultiBtn',
					});
				}],
			]);			
		}
	},
	add: notificationJson => {
		log({notifcations: notificationJson},`notifications ${moment().format('h:mma')}`);
		notificationJson.forEach(notification => {
			if (!notifications.element.find('.notification').find('.title').get().find(
				existing => $(existing).data('id') == notification.id)
			) {
				log({notification});
				let node = $(`<div class='tab notification'><div class='title'><span class='selector'></span>${notification.type}<span class='indicator unread'></span></div></div>`);
				node.prependTo(notifications.element.find('.list')).find('.title').data(jsonIfValid(notification.data));
				node.on('click',notifications.click);
			}
		})
		notifications.update.list();
	},
	get: {
		unread: async () => {
			let unreadNotifications = await $.ajax('/notification-check');
			let json = jsonIfValid(unreadNotifications);
			notifications.add(json);
			clearInterval(notifications.timer);
			notifications.timer = setInterval(notifications.get.unread, 180000);
		},
		active: () => $("#Notifications").find(".list").find(".active"),
		activeIds: () => notifications.get.active().get().map(notification => $(notification).data('id')),
	},
	delete: async () => {
		try{
			let ele = notifications.element.find('.list').is(':visible') ? notifications.element.find('.list') : $("#Notification");
			blur(ele,'#loading');
			let ids = notifications.get.activeIds();
			let result = await $.ajax({
				url: '/notification-delete',
				method: 'POST',
				data: {ids: ids}
			})
			unblur();
			log({notifications:notifications.get.active()});
			if (result == 'checkmark') {
				notifications.get.active().parent().slideFadeOut(400,function(){
					$(this).remove();
					notifications.update.list();
				});
			}else feedback('Error deleting','System admins have been notified.');
			// notifications.update.list();
			return result == 'checkmark';
		}catch(error){
			log({error});
			return false;
		}
	},
	update: {
		ajax: async (status) => {
			let ids = notifications.get.activeIds();
			if (!status) {log({error:'status not defined',status:status}); return;}
			notifications.update.list(status);
			// log({status},'updating as '+status);
			let result = await $.ajax({
				url: '/notification-update',
				method: 'POST',
				data: {ids: ids, status: status}
			})
			let reverse = (status == 'read') ? 'unread' : 'read';
			if (result != 'checkmark') {
				log({error:result},'notification error');
				notifications.update.list(reverse);
			}
		},
		list: (status = null) => {
			if (status) {
				let active = notifications.get.active();
				if (status == 'unread') active.find('.indicator').removeClass('read').addClass('unread');
				else if (status == 'read') active.find('.indicator').removeClass('unread').addClass('read');
			}
			let unreadCount = notifications.element.find('.indicator.unread').length;
			$("#UnreadCount").text(unreadCount);
			if (unreadCount == 0) $("#UnreadCount").slideFadeOut();	
			else $("#UnreadCount").slideFadeIn();
			let totalCount = notifications.element.find('.notification').length;
			if (totalCount == 0 && notifications.element.find('.noNotifications').dne()) {
				let noNotifications = $(`<div class='tab noNotifications'><div class='title'>No notifications</div></div>`);
				notifications.element.find('.list').prepend(noNotifications);
			}else if (totalCount != 0) notifications.element.find('.noNotifications').remove();
		}
	},
	click: (ev) => {
		let notification = $(ev.target);
		if (notification.parent().hasClass('noNotifications')) return;
		if (notifications.limit == 1) {
			notifications.element.resetActives();
			notification.addClass('active');
			notifications.update.ajax('read');
			notifications.open(notification);
			notifications.update.list('read');
		}else{
			notification.toggleClass('active');
		}
	},
	open: notification => {
		let data = notification.data(), message = $("#Notification").find('.message'), options = $("#Notification").find('.options');
		options.find('.button.temp').remove();
		message.html(`<h2 class='purple'>${data.type}</h2><h3>${data.description}</h3><div class='split3366KeyValues'></div>`);
		let list = message.find('.split3366KeyValues'),
				details = jsonIfValid(data.details), buttons = jsonIfValid(data.buttons);
		// log({notification,data,details,buttons });
		$.each(details, (key,value) => {
			// log({key,value,list});
			value = (value == null) ? 'none' : value;
			list.append(`<span class='label'>${key}</span><span class='value'>${value}</span>`);
		})
		if (data.model && data.uid) {
			uids.set(data.model,data.uid);
		}
		if (buttons) {
			buttons.forEach(button => {
				let btnOptions = {
					classList: "small yellow temp",
					appendTo: options.find('.tempBtns'),
					text: button.text,
				}
				if (button.type == 'click') btnOptions.action = function(){unblurAll();$(button.target).click();}
				else if (button.type == 'viewModel') btnOptions.action = function(){log({btn:data},'view model')}
				new Button(btnOptions);
			});
		}
		blurTop("#Notification");
	},
}

function clickTab(){
	alert('clickTab');
	var tabId = $(this).data('tabId');
	unblurAll();
	$(tabId).find(".title").click();
	toggleNotifications();
}
var notifyXhr = undefined;
function checkNotifications(){
	log({error:'dont use check notifications'},'old function');
	return;
	var update = filterUninitialized('.notificationUpdate');
	if (update.exists()){
		$("#Notifications").find('.notificationUpdate').replaceWith(update);
		updateNotificationList();
		update.data('initialized',true);
	}else{
		notifyXhr = $.ajax({
			url:'/notification-check',
			success:function(info){
				$(info).appendTo('body');
				update = filterUninitialized('.notificationUpdate');
				$("#Notifications").find('.notificationUpdate').replaceWith(update);
				updateNotificationList();
				update.data('initialized',true);
			}
		})
	}
}
function updateNotificationList(){
	var selectMultiBtn = $("#Notifications").find(".selectMultiple");

	var unreadCount = $("#UnreadCount"), allCount = $("#Notifications").find('.title').length;
	unreadCount.text($("#Notifications").find(".unread").length);

	if (unreadCount.text() == '0'){
		slideFadeOut(unreadCount);
	}else if (!$("#Notifications").find(".list").is(":visible")){
		slideFadeIn(unreadCount);
	}
	if (allCount < 2){
		if (selectMultiBtn.text()=='exit multi'){selectMultiBtn.click()}
		selectMultiBtn.slideFadeOut();
	}else{
		selectMultiBtn.slideFadeIn();
	}
}
function updateNotifications(uids, action = 'mark-read'){
    if (notifyXhr!=undefined){
        notifyXhr.abort();
        notifyXhr = undefined;
    }
	notifyXhr = $.ajax({
		url: "/notification-update",
		method: 'post',
		data: {
			uids: uids,
			action: action,
			fetch: notificationCategory
		},
		success:function(data){
			console.log(data);
		}
	})
}
function showRelatedModel(){
	// console.log($(this));
	unblurTopMost();
	var data = $("#Notification").data();
	var model = data.model, uid = data.uid, tab = data.tabid, clickWhenFinished = [model, uid], url = "/"+model+"/index/"+uid;
	if ($(tab).length == 0){
		feedback('Link Does not Exist','Oopsie, sorry');
		clickWhenFinished = null;
	}else{
		setUid(model,uid);
		$(tab).find(".title").click();
	}
}
function showFullNotification(){
	if ($(this).text() == 'No Notifications'
		|| $(this).parent().is("#Notifications")){
		return;
	}
	var data = $(this).data(), notification = $("#Notification"), msg = notification.find(".message"), details = (data.details == null) ? [] : data.details, notificationId = $(this).data('notificationid');
	notification.data(data);
	$(this).find(".indicator").removeClass('unread').addClass('read');
	updateNotifications([notificationId]);
	msg.html("");
	$("<h1 class='purple'>"+data.type+"</h1><h3 class='pink paddedSmall bottomOnly'>"+data.description+"</h3><div class='details split3366KeyValues paddedSmall'></div>").appendTo(msg);
	$.each(details, function(key,value){
		var displayText = (typeof value === 'string') ? value : 'complex';
		$("<div class='label'>"+key+":</div><div class='value' data-key='"+key+"'>"+displayText+"</div>").appendTo(msg.find('.details'));
	});
	if (data.model !== ""){notification.find(".viewModel").text('view '+data.model).data({model:data.model,uid:data.uid}).show();
	}else{notification.find(".viewModel").hide();
	}
	if (data.click !== ""){notification.find('.clickTab').text(data.click.text).data('tabId',data.click.tabId);
	}else{notification.find(".clickTab").hide();}
	if (data.changes != ""){
		manageChanges(data.changes);
	}
	blurTopMost("#Notification");
}
function manageChanges(changes){
	var box = null, newVal, oldVal;
	$.each(changes,function(c,change){
		$.each(change,function(key,values){
			if (key == 'date_time'){
				box = $("#Notification").find(".value").filter("[data-key='Date + Time']");
				newVal = moment(values.new).format('ddd M/D/YY [at] h:mma');
				oldVal = moment(values.old).format('ddd M/D/YY [at] h:mma');
			}

			if (box){
				box.html("<b class='pink'>OLD</b> <span style='text-decoration:line-through'>"+oldVal+"</span><br><b class='pink'>NEW</b> "+newVal);
				box = null;
			}
		})
	})
}
function listenForToggle(ev){
	var withinNotifications = ($(ev.target).closest("#Notifications, #Notification").length === 1);
	if (!withinNotifications){toggleNotifications();}
}
function toggleNotifications(){
	checkNotifications();
	// var openNow = notify.find(".open").is(":visible"), openBtn = notify.find('.open'), list = notify.find('.list');
	var openNow = !notify.find(".open").hasClass('active'), openBtn = notify.find('.open'), list = notify.find('.list');
	if (openNow){
		// openBtn.hide();
		slideFadeIn(list,1200);
		list.addClass('active');
		// $(document).on('mousedown touchstart scroll',listenForToggle);
	}else{
		slideFadeOut(list,800,function(){
			// slideFadeIn(openBtn);
		});
		// $(document).off('mousedown touchstart scroll',listenForToggle);
	}
}
function deleteNotification(){
	var id = $("#Notification").data('notificationid');
	slideFadeOut($("#Notifications").find(".title").filter(function(){return $(this).data('notificationid') == id;}),1500);
	unblurTopMost();
	updateNotifications([id],'delete');
}
function deleteMulti(){
	var selected = notify.find(".title").filter(".active"), uids = [];
	selected.each(function(n, notification){
		uids.push($(notification).data('notificationid'));
	});
	slideFadeOut(selected,1500);
	updateNotifications(uids,'delete');
	selected.removeClass('active');
	toggleSelectMode();
}
function markNotificationAsUnread(){
	var id = $("#Notification").data('notificationid');
	$("#Notifications").find(".title").filter(function(){return $(this).data('notificationid') == id;}).find(".indicator").removeClass('read').addClass('unread');
	updateNotifications([id],'mark-unread');	
}
function markMultiAsUnread(){
	var selected = notify.find(".title").filter(".active"), uids = [];
	selected.each(function(n, notification){
		uids.push($(notification).data('notificationid'));
	});
	selected.find(".indicator").removeClass('read').addClass('unread');
	updateNotifications(uids,'mark-unread');
	selected.removeClass('active');
	toggleSelectMode();
}
function markMultiAsRead(){
	var selected = notify.find(".title").filter(".active"), uids = [];
	selected.each(function(n, notification){
		uids.push($(notification).data('notificationid'));
	});
	selected.find(".indicator").removeClass('unread').addClass('read');
	updateNotifications(uids,'mark-read');
	selected.removeClass('active');
	toggleSelectMode();
}
function toggleSelect(){
	$(this).toggleClass('active');
}
function toggleSelectAll(){
	var titles = $("#Notifications").find('.dropDown').find('.title'), count = titles.length, active = titles.filter('.active'), activeCount = active.length,
		multiBtn = $("#Notifications").find(".selectMultiple"), multiMode = multiBtn.text().includes("exit");
	if (!multiMode){multiBtn.click();}
	if (activeCount !== count){titles.addClass('active')
	}else{
		titles.removeClass('active');
	}
}
function toggleSelectMode(){
	var selectBtn = $("#Notifications").find(".selectMultiple"), showNow = selectBtn.text().includes("select");
	if (showNow){
	    notify.off('click','.title',showFullNotification);
	    notify.on('click','.title',toggleSelect);
	    multiBtns.slideFadeIn();
	    selectBtn.text('exit multi');
	}else{
	    notify.on('click','.title',showFullNotification);
	    notify.off('click','.title',toggleSelect);
	    multiBtns.slideFadeOut();
	    checkNotifications();
	    $("#Notifications").find('.title').filter(".active").removeClass('active');
	    selectBtn.text('select');
	}
}
function openErrorMsg(){
	var parent = $(this).closest('.blur').parent();
	blurElement(parent,"#ErrorMessageFromClient");
}