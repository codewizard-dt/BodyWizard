var notify, notificationCheck, notificationCategory = 'all', clickWhenFinished = null, multiBtns;
$(document).ready(function () {
	//NOTIFICATIONS
		// checkNotifications();
	    notificationCheck = setInterval(checkNotifications,3000*60);
	    var menu = $("#NavBar").find('.siteMenu'), divide = menu.find(".divide");
	    notify = $("#Notifications");
	    notify.insertBefore(divide);
	    notify.on('click','.title',showFullNotification);
	    notify.on('click','.selectMultiple',toggleSelectMode);
	    notify.on('click','.selectAll',toggleSelectAll);
	    notify.on('click','.markMultiAsUnread',markMultiAsUnread);
	    notify.on('click','.markMultiAsRead',markMultiAsRead);
	    notify.on('click','.deleteMulti',deleteMulti);

	    $("#Notification").on('click','.viewModel',showRelatedModel);
	    $("#Notification").on('click','.clickTab',clickTab);
	    $("#Notification").on('click','.markAsUnread',markNotificationAsUnread);
	    $("#Notification").on('click','.delete',deleteNotification);
	    multiBtns = notify.find(".multiBtns");
	    multiBtns.hide();
	// ERROR MESSAGES
		$('.openErrorMsg').on('click',openErrorMsg);
});

function clickTab(){
	var tabId = $(this).data('tabId');
	unblurAll();
	$(tabId).find(".title").click();
	toggleNotifications();
}
var notifyXhr = undefined;
function checkNotifications(){
	var update = filterUninitialized('.notificationUpdate');
	if (update.length == 1){
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
			// console.log(notifications);
			if (data == 'checkmark'){
				checkNotifications();
			}
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
		$("<div><div class='label'>"+key+":</div><div class='value' data-key='"+key+"'>"+displayText+"</div></div>").appendTo(msg.find('.details'));
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