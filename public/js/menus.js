// class Menu {
// 	constructor(element,data){
// 		this.element = element;
// 		this.name = element.attr('id');
// 		this.tabs = element.find('.tab');
// 		this.target = data.target;
// 		this.links = this.tabs.filter((t, tab) => ($(tab).data('uri') != undefined && $(tab).data('uri') != ''));
// 		this.dropdowns = this.tabs.filter((t, tab) => $(tab).children('.dropDown').exists());
// 		this.loading = null;
// 		this.data = data;

// 		this.links.each((t, tab) => $(tab).on('click', {uri:$(tab).data('uri'),tabId:$(tab).attr('id')}, this.linkClick.bind(this)));
// 		this.dropdowns.each((t, tab) => {
// 			$(tab).on('mouseenter mouseleave', {tabId:$(tab).attr('id')}, this.dropdownHover.bind(this));
// 			$(tab).on('click', {tabId:$(tab).attr('id')}, this.dropdownClick.bind(this));
// 			$(tab).data('hold',false);
// 		});
// 		this.clickActive();
// 		this.hightlightActive();
// 	}

// 	get active() {
// 		let active = this.links.filter((t,tab) => $(tab).attr('id') == tabs.get(this.name));
// 		return active.exists() ? active : null;
// 	}

// 	clickActive(){
// 		if (this.active && this.target != 'window') this.active.click();
// 		else if (this.target != 'window') this.links.first().click();		
// 	}
// 	hightlightActive() {
// 		this.element.resetActives();
// 		if (this.active) {
// 			this.active.find('.title').addClass('active');
// 			this.active.parents('.tab').children('.title').addClass('active');
// 		}
// 	}
// 	insideDropdown(ev){
// 		return $(ev.target).closest('.dropDown').exists();
// 	}
// 	isNestedDropdown(ev){
// 		return !$(ev.target).parent().is(`#${ev.data.tabId}`);
// 	}
// 	linkClick(ev) {
// 		$("#loading").remove();
// 		let target = this.element.data('target'), uri = ev.data.uri, tabId = ev.data.tabId;
// 		tabs.set(this.name, tabId);
// 		if (this.loading && this.loading.readyState != 4) this.loading.abort();
// 		this.hightlightActive();
// 		if (target == 'window')	window.location.href = uri;
// 		else {
// 			let circle = $("<div id='loading' class='lds-ring dark'><div></div><div></div><div></div><div></div></div>");
// 			$(target).html("").append(circle);
// 			system.modals.reset();
// 			this.loading = menu.fetch(uri, target);
// 		}
// 	}
// 	dropdownHover(ev){
// 		let tab = $(`#${ev.data.tabId}`), showing = tab.children('.showingDD').exists(), mouseIn = (ev.type === 'mouseenter');
// 		if (mouseIn && !showing) this.dropdownShow(tab);
// 		else if (!mouseIn && showing) this.dropdownHide(tab);
// 	}
// 	dropdownShow(tab){
// 		tab.children('.dropDown').addClass('active').slideDown(400);
// 		tab.children('.title').addClass('showingDD');
// 	}
// 	dropdownHide(tab){
// 		tab.children('.dropDown').removeClass('active').slideUp(400);
// 		tab.children('.title').removeClass('showingDD');
// 		if (tab.is('#Notifications') && tab.hasClass('.multi')) {
// 			tab.find('.dropDown').resetActives();
// 			tab.removeClass('multi');
// 		}
// 	}
// 	dropdownClick(ev){
// 		let tab = $(`#${ev.data.tabId}`), title = tab.children('.title'), dropdown = tab.children('.dropDown'), evType = ev.type, target = ev.target;
// 		let showNow = !title.hasClass('showingDD');
// 		if (this.isNestedDropdown(ev) || (tab.is('#Notifications') && this.insideDropdown(ev))) return;
// 		if (showNow) this.dropdownShow(tab);
// 		else this.dropdownHide(tab);
// 	}
// }
// const menu = {
// 	list: [],
// 	get: name => menu.list.find(menu => menu.name == name) || null,
// 	initialize: {
// 		all: function(){
// 			init([
// 				['.menuBar', function(){
// 					let newMenu = new Menu($(this), $(this).data());
// 					system.initialize.list.addToList(menu.list, 'name', newMenu);
// 				}]
// 			]);
// 			system.initialize.list.verifyClassElements(menu.list, 'name');
// 			let x = 0;
// 			while (x < menu.list.length){
// 				if (x == 0) menu.list[x].element.addClass('siteMenu');
// 				else if (x == 1) menu.list[x].element.addClass('topMenu');
// 				else menu.list[x].element.addClass(`subMenu${x-1}`);
// 				x++;
// 			}
// 		},
// 	},
// 	headers: () => {
// 		return {
// 			'X-Current-Tabs': JSON.stringify(tabs.list),
// 			'X-Current-Uids': JSON.stringify(uids.list),
//       'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
// 		}
// 	},
// 	fetch: (url, target) => {
// 		// log({url,target});
// 		let headers = menu.headers();
// 		return $.ajax({
// 			url: url,
// 			headers: headers,
// 			success: (response, status, request) => {
// 				$(target).html(response);
// 				initialize.newContent();
// 			}
// 		});
// 	},
// 	checkHeaders: request => {
// 		let uidList = request.getResponseHeader('X-Current-Uids').json_if_valid(),
// 				tabList = request.getResponseHeader('X-Current-Tabs').json_if_valid(),
// 				csrf = request.getResponseHeader('X-CSRF-TOKEN'),
// 				unreadNotifications = request.getResponseHeader('X-Unread-Notifications').json_if_valid(),
// 				force_logout = request.getResponseHeader('X-FORCE-LOGOUT');
// 		log({uidList,tabList,csrf,unreadNotifications});
// 		if (uidList) {
// 			if (uidList === 'null') uids.clear();
// 			else uids.set(uidList);
// 		}
// 		if (tabList) tabs.set(tabList);
// 		if (csrf) $('meta[name="csrf-token"]').attr('content',csrf);
// 		if (unreadNotifications) {
// 			if (unreadNotifications === 'send ajax') notifications.get.unread();
// 			else notifications.add(unreadNotifications);
// 		}
// 	},
// 	load: async (options) => {
// 		let url = options.url || null,
// 				target = $(options.target) || null,
// 				callback = options.callback || null,
// 				modal = options.modal || false,
// 				blurred = options.blurred || false;
// 				loadingColor = options.loadingColor || 'dark';
// 		if (!url || !target) {
// 			log({error:{url:url,target:target}},'missing at least one: url || target');
// 			return;
// 		}
// 		if (blurred) blur(target,'#loading');
// 		else target.html(system.blur.modal.loading(loadingColor))
// 		let result = await menu.fetch(url, target);
// 		if (callback && typeof callback == 'function') callback();
// 	}
// }
// const tabs = {
// 	list: {},
// 	set: function(menu, tab = null){
// 		if (typeof menu == 'string' && menu != "") tabs.list[menu] = tab;
// 		else if (typeof menu == 'object') $.each(menu,function(key, value){tabs.set(key, value);});
// 	},
// 	get: function(menu){
// 		return (tabs.list[menu] != undefined) ? tabs.list[menu] : null;
// 	},
// 	clear: function(){tabs.list = {}},
// 	log: function(){console.log(tabs.list)}
// };


// var waitForForm, autoClickBtn = undefined, xhrWait = undefined, purple = "rgb(105,12,104)", yellow = "rgb(240,154,53)", pink = "rgb(234,78,80)";

// $(document).ready(function(){
// 	$("#MobileMenu").children(".title").attr('id','MenuToggle');
// 	$("#MobileMenu").children('.dropDown').attr('id','MenuDisplay');
// 	// console.log($("#NavBar").data('initialtabs'));
// 	// tabs.set($("#NavBar").data('initialtabs'));

// 	// initializeNewMenus();
// 	$(document).on('touchstart mousedown scroll',function(e){
// 		var dropdown = $(e.target).closest('.dropDown'), activeDD = $(".dropDown").filter('.active'), tabs = activeDD.parents('.tab'), parents = tabs.add(tabs.children());
// 		if (activeDD.length == 0 || dropdown.length > 0 || $(e.target).is(parents)){return;}
// 		else {
// 			var  menu = activeDD.closest('.menuBar');
// 			activeDD.removeClass('active');
// 			animateMenuV2(menu);
// 		}
// 	})
// });
// var scrollTimer = undefined;
// function checkScrollMenus(){
// 	if (scrollTimer == undefined){
// 		scrollTimer = setTimeout(function(){
// 			var targets = $(".menuBar.website").filter("[data-mode='scroll']").find(".tab"),
// 			winPos = $(window).scrollTop();

// 			targets.each(function(t, target){
// 				var ele = $(target).data("uri"),
// 				top = $(ele).offset().top, bottom = top + $(ele).height(),
// 				h = $("#SiteMenu").height() + $(target).closest(".menuBar.website").height() + 21;

// 				if (winPos > top - h && winPos < bottom - h){
// 					$(target).find(".title").addClass("active");
// 					animateMenuV2($(target).closest(".menuBar.website"));
// 				}else{
// 					$(target).find(".title").removeClass("active");
// 				}
// 			})
// 			scrollTimer = undefined;
// 		},500);
// 	}
// }
// function checkUriUid(uri){
// 	var uids = JSON.parse($("#uidList").text());
// 	if (uids=="null"){
// 		return uri;
// 	}

// 	if (uri != undefined && uri.includes("UID")){
// 		uri = uri.split("/");
// 		$.each(uids,function(label,uid){
// 			var model = label.split("_")[0];
// 			if (uri[1].includes(model)){
// 				uri[2] = uid;
// 			}
// 		})
// 		uri = uri.join("/");
// 	}
// 	return uri;
// }
// function animateMenuV2(menuID){
// 	var titles = $(menuID).find(".title").filter(function(){return !$(this).parent().is("#booknow")}),
// 	tabs = $(menuID).find(".tab"),
// 	underlines = $(menuID).find(".tab").filter(
// 		function(){return $(this).find(".dropDown").length==0 || $(menuID).hasClass("siteMenu");
// 	}).find(".underline"),
// 	dropdowns = tabs.children(".dropDown"), 
// 	activeDD = dropdowns.filter(".active"), 
// 	inactiveDD = dropdowns.not(".active"),
// 	activeTab = activeDD.closest('.tab');

// 	if (activeTab.is("#Notifications")){
// 		$("#UnreadCount").fadeOut();
// 	}else if ($("#UnreadCount").length == 1 && $("#UnreadCount").text() != "0"){
// 		$("#UnreadCount").fadeIn();
// 		if ($("#Notifications").find(".selectMultiple").text().includes('exit')){toggleSelectMode();}
// 	}else{
// 		$("#UnreadCount").fadeOut();
// 	}
// 	activeTab.find('.underline').removeClass('active hover');
// 	underlines.filter(".active, .hover").animate({width: "105%"}, 200);
// 	underlines.not(".active, .hover").animate({width: "0%"}, 200);
// 	activeDD.slideDown(400);
// 	activeDD.closest(".tab").children(".title").addClass("showingDD");
// 	if (activeDD.closest("#Notifications").length == 1){$("#UnreadCount").hide();}
// 	inactiveDD.not(".active").slideUp(400);
// 	inactiveDD.closest(".tab").children(".title").removeClass("showingDD");

// 	if (activeDD.length > 0){
// 		var rect = activeDD[0].getBoundingClientRect(), w = $("body").width();
// 		if (rect.width != 0){
// 			if (w - rect.right < 10){
// 				$(activeDD[0]).addClass('shiftLeft');
// 			}
// 			if (rect.left < 10){
// 				$(activeDD[0]).addClass('shiftRight');
// 			}            
// 		}
// 	}
// }
// function getParentTitles(clickedTitle){
// 	var parentTab = clickedTitle.closest('.tab'),
// 	nested = parentTab.parent().is(".dropDown"), titles = false;

// 	while (nested){
// 		if (!titles){
// 			titles = parentTab.closest('.dropDown').closest('.tab').children('.title');
// 		}else{
// 			titles = titles.add(parentTab.closest('.dropDown').closest('.tab').children('.title'));
// 		}
// 		nested = parentTab.parent().is(".dropDown");
// 		parentTab = parentTab.parent().closest('.tab');
// 	}
// 	return titles;
// }
// function reloadTab(){
// 	var active = $(".menuBar").last().find(".title.active").last(),
// 	target = $(".loadTarget").last(),
// 	uri = active.data('uri');
// 	if (active.length == 0){
// 		location.reload(true);
// 	}else{
// 		unblurAll();
// 		LoadingContent(target,uri);        
// 	}
// }
// function delayedReloadTab(time = 800){
// 	setTimeout(function(){
// 		unblurAll();
// 		reloadTab();
// 	},time)
// }
// var loadXHR = undefined, xhrWait = undefined;
// function LoadingContent(target,uri,callback = null){
// 	if (target=="window"){
// 		alert("window");
// 	}
// 	target = target instanceof jQuery ? target : $(target);
// 	$("#loading").remove();
// 	$("<div id='loading' class='lds-ring'><div></div><div></div><div></div><div></div></div>").appendTo("body");
// 	$("#loading").addClass("dark");
// 	$(target).html("").append($("#loading"));

// 	if (loadXHR!=undefined){
// 		loadXHR.abort();
// 		console.log('aborted xhr');
// 	}
// // if (autosaveNoteTimer) clearTimeout(autosaveNoteTimer);

// loadXHR = $.ajax({
// 	url:uri,
// 	headers:{
// 		'X-Current-Tabs': JSON.stringify(tabs.list),
// 		'X-Current-Uids': JSON.stringify(uids.list)
// 	},
// 	success:function(data){
// 		$(".toModalHome, .modalForm").appendTo("#ModalHome");
// 		$("#ModalHome").children().filter(function(){
// 			return $.inArray($(this).attr('id'),systemModalList) === -1;
// 		}).remove();
// 		$(target).html(data);
// 		// if ($(target).find(".listUpdate").length != 0){
// 		//     var lists = $(target).find(".listUpdate").data(), newUids = lists.uids, tabs = lists.tabs;
// 		//     uids.set(newUids);
// 		//     // newUids = (newUids && newUids.length == 0) ? 'null' : JSON.stringify(newUids);
// 		//     tabs = (tabs && tabs.length == 0) ? 'null' : JSON.stringify(tabs);
// 		//     // $("#uidList").text(newUids);
// 		//     $("#tabList").text(tabs);
// 		//     // var user = $(target).find(".userUpdate").data();
// 		//     // $("#user").data({
// 		//     //     usertype: user.usertype, 
// 		//     //     isAdmin: (user.isadmin == 1), 
// 		//     //     isSuper: (user.issuperuser == 1)
// 		//     // });
// 		// }
// 		initializeNewContent();
// 		if (callback) callback();
// loadXHR = undefined;
// },
// error: function(e){
// 	if (e.status == 404){
// 		$(target).html("<h2 class='p-y-xsmall'>Content Unavailable</h2><div class='central small p-y-xsmall bottomOnly'>Sorry for the inconvenience. If this continues, please submit an error report. Submitting an error report is just one-click away.</div><div class='button pink xxsmall errorReport'>send error report</div>");
// 	}
// // console.log(e);
// }
// })
// }
// function updateUriUids(){
// 	console.log("don't use this updateUriUids!");
// 	alert("Fix me updateUriUids!");
// // getSessionVar('uidList');
// // var check = setInterval(function(){
// //     if (yourSessionVar!=undefined && yourSessionVar!=""){
// //         var uidList = JSON.parse(yourSessionVar);
// //         // console.log(uidList);
// //         $.each(uidList,function(label,uid){
// //             var model = label.split("_")[0];
// //             var menuItems = $('.menuBar').find(".tab, li").filter(function(){
// //                 return $(this).data('uri') !== undefined;
// //             }).filter(function(){
// //                 var model = label.split("_")[0], uri = $(this).data('uri');
// //                 var includesModel = uri.includes(model);
// //                 var needsUid = uri.match(/(edit|delete|show|update|settings)/);
// //                 return includesModel && needsUid;
// //             })
// //             menuItems.each(function(){
// //                 var uri = $(this).data('uri');
// //                 uri = uri.split("/");
// //                 uri[2] = uid;
// //                 uri =   uri.join("/");
// //                 $(this).data('uri',uri);
// //             })
// //         })
// //         yourSessionVar=undefined;
// //         clearInterval(check);
// //     }
// // },50)
// }

