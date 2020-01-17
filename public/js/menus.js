var waitForForm, autoClickBtn = undefined, xhrWait = undefined, purple = "rgb(105,12,104)", yellow = "rgb(240,154,53)", pink = "rgb(234,78,80)";
$(document).ready(function(){
    initializeNewMenus();
});
function initializeNewMenus(){
    var MenuItems = filterUninitialized($(".menuBar").find('.tab'));
    MenuItems.on("touchstart",function(e){
        e.preventDefault();
        $(e.target).click();
    })
    MenuItems.hover(tabMouseEnter,tabMouseLeave);
    MenuItems.on("click",".title",function(e){
        // var isNotification = ($(this).closest('#Notifications').length == 1);
        // if (isNotification){return;}
        var tab = $(this).parent(), underline = tab.children(".underline"), id = tab.attr("id"), 
            dropdown = tab.children(".dropDown"), menu = $(this).closest(".menuBar"), menuId = menu.attr('id'),
            target = (menu.data("target")!="window") ? $(menu).data("target") : "window", uri = $(this).data("uri"),
            hasDropdown = (tab.children('.dropDown').length === 1), titleActive = $(this).hasClass("active"),
            parentTitles = getParentTitles($(this)), dropdownActive = (hasDropdown) ? dropdown.hasClass("active") : null;

        if ((tab.is("#booknow") && uri == '#createAppointment') 
            || (uri == '' && target != "window")
            || (tab.is("#lock-ehr"))
            || ($(this).closest('#Notifications').length == 1)){
            return;
        }
        // if (uri == '' && target != "window"){            
        //     return;
        // }
        if (uri != undefined && uri.match(/(edit|delete|show|update|settings)/)){
            if ($.inArray(uri,[
                    '/forms/UID/edit',
                    '/settings/Patient/uid'
                ]) == -1){
                alert('undefined action menus.js 26 uri: '+uri);
            }
            // uri = $(this).data('uri').split("/");
            // var model = singular(uri[1]), Model = model.substr(0,1).toUpperCase() + model.substr(1), models = plural(model);
            //     action = uri[3];
                    
            // var match = $(".optionsNav").filter(function(){
            //     var d = $(this).data('tabanchor');
            //     return (d == plural(model) || d == model);
            // })

            // if (uri[2] == "UID"){
            //     var uid = match.data("uid");
            //     if (uid == undefined || uid == ""){
            //         var uidList = JSON.parse($("#uidList").text());
            //         uid = (uidList[Model] !== undefined) ? uidList[Model] : uid;
            //     }

            //     if ((uid == undefined || uid == "") && $("#"+Model+"List").length > 0){
            //         $.scrollTo($("#"+Model+"List"));
            //         alertBox('select a ' + model + ' to edit',$("#"+Model+"List"),"ontop",1000,"-50%,-50%");
            //         return false;
            //     }else if ((uid == undefined || uid == "") && $("#"+Model+"List").length == 0){
            //         var index = $("#" + plural(model) + "-index");
            //         var warning = "<h2>Select a " + model + " before you can " + action + "</h2><div id='listLink' class='button xsmall pink'>Select a " + model + "</div><div class='button xsmall cancel'>dismiss</div>";
            //         $("<div/>",{
            //             id:"uidWarning",
            //             class:'modal delete'
            //         }).appendTo("#ModalHome").html(warning);
            //         blurElement($("body"),"#uidWarning");
            //         $("#listLink").on("click",function(){
            //             var t = $("#"+plural(model)+"-index").find(".title");
            //             t.click();
            //             unblurElement($("body"));
            //         })
            //         return false;
            //     }
            //     uri[2] = uid;
            // }
            // uri = uri.join("/");
            // $(this).data('uri',uri);
        }
        if (uri=='/logout'){
            $("#logoutForm").submit();
            return false;
        }
        
        if (menu.data("mode")=="scroll" && target != 'window'){
            $(target).scrollTo($(uri),400,{
                offset: {left:0,top:-20}
            });
            var h = $("#SiteMenu").height() + menu.height();
            var offset = $(window).scrollTop() + h;
            if (offset > $(target).offset().top){
                $(window).scrollTo($(target),400,{
                    offset: {left:0,top:-h}
                })
            }
            return false;
        }else if (menu.data("mode")=='scroll'){
            var h = $("#SiteMenu").height() + menu.height() + 20;
            $.scrollTo($(uri),400,{
                offset: {left:0,top:-h}
            })
            console.log('scrolll',$(uri));
            return false;
        }
                
        if (hasDropdown && titleActive){
            dropdown.removeClass('active');
        }else if (hasDropdown && !titleActive){
            dropdown.addClass('active');
        }else if (!hasDropdown && titleActive){
            return false;
        }else if (!hasDropdown && !titleActive){
            menu.find('.active').removeClass('active');
            setActiveTab(menuId,id);
            $(this).add(parentTitles).addClass('active');
            if (target=="window"){
                window.location.href = uri;
            }else{
                // setActiveTab(menuId,id);
                var obj = {};
                obj[menuId] = id;
                LoadingContent(target,uri,obj);
            }
        }        
        animateMenuV2(menu);
    })
    MenuItems.data('initialized',true);
    
    // to organize and stylize multiple menus
        var AllMenus = $(".menuBar.portal").not(".siteMenu");
        var l = AllMenus.length;
        AllMenus.removeClass("topMenu subMenu1 subMenu2 subMenu3 subMenu4")
        AllMenus.each(function(i,m){
            var zIndex = -(i-l), orderClass;
            if (i==0){
                orderClass = "topMenu";
            }else if (i==1){
                orderClass = "subMenu1";
            }else if (i==2){
                orderClass = "subMenu2";
            }else if (i==3){
                orderClass = "subMenu3";
            }else if (i==4){
                orderClass = "subMenu4";
            }
            $(m).addClass(orderClass);
        })

    ClickActiveTabsV2();
}
var scrollTimer = undefined;
function checkScrollMenus(){
    if (scrollTimer == undefined){
        scrollTimer = setTimeout(function(){
            var targets = $(".menuBar.website").filter("[data-mode='scroll']").find(".tab"),
                winPos = $(window).scrollTop();

            targets.each(function(t, target){
                var ele = $(target).data("uri"),
                    top = $(ele).offset().top, bottom = top + $(ele).height(),
                    h = $("#SiteMenu").height() + $(target).closest(".menuBar.website").height() + 21;

                if (winPos > top - h && winPos < bottom - h){
                    $(target).find(".title").addClass("active");
                    animateMenuV2($(target).closest(".menuBar.website"));
                }else{
                    $(target).find(".title").removeClass("active");
                }
            })
            scrollTimer = undefined;
        },500);
    }
}
function ClickActiveTabsV2(){
    var menus = $(".menuBar").not(".siteMenu").filter(function(){
        return $(this).data('mode') != 'scroll' && $(this).find(".title.active").length == 0;
    });
    if (menus.length == 0){return false;}
    var activeTabJson = JSON.parse($("#tabList").text()), tab;

    menus.each(function(){
        if (!activeTabJson){
            $(this).find('.title').first().click();
        }else{
            tab = activeTabJson[$(this).attr('id')];
            if (tab){
                $("#"+tab).children(".title").click();
            } else{
                $(this).find('.title').first().click();
            }           
        }
    })
}
function checkUriUid(uri){
    var uids = JSON.parse($("#uidList").text());
    // console.log(uids);
    if (uids=="null"){
        return uri;
    }

    if (uri != undefined && uri.includes("UID")){
            uri = uri.split("/");
        $.each(uids,function(label,uid){
            var model = label.split("_")[0];
            if (uri[1].includes(model)){
                uri[2] = uid;
            }
        })
        uri = uri.join("/");
    }
    return uri;
}
function animateMenuV2(menuID){
    var titles = $(menuID).find(".title").filter(function(){return !$(this).parent().is("#booknow")}),
        tabs = $(menuID).find(".tab"),
        underlines = $(menuID).find(".tab").filter(
            function(){return $(this).find(".dropDown").length==0 || $(menuID).hasClass("siteMenu");
        }).find(".underline"),
        dropdowns = tabs.children(".dropDown"), 
        activeDD = dropdowns.filter(".active"), 
        inactiveDD = dropdowns.not(".active"),
        activeTab = activeDD.closest('.tab');

    if (activeTab.is("#Notifications")){
        // console.log("hi");
        $("#UnreadCount").fadeOut();
    }else if ($("#UnreadCount").length == 1 && $("#UnreadCount").text() != "0"){
        $("#UnreadCount").fadeIn();
        if ($("#Notifications").find(".selectMultiple").text().includes('exit')){toggleSelectMode();}
    }else{
        $("#UnreadCount").fadeOut();
    }
    activeTab.find('.underline').removeClass('active hover');
    underlines.filter(".active, .hover").animate({width: "105%"}, 200);
    underlines.not(".active, .hover").animate({width: "0%"}, 200);
    // activeDD.slideDown(400).css("transform","translateX(-50%) scaleX(1)");
    activeDD.slideDown(400);
    activeDD.closest(".tab").children(".title").addClass("showingDD");
    if (activeDD.closest("#Notifications").length == 1){$("#UnreadCount").hide();}
    // inactiveDD.not(".active").slideUp(400).css("transform","translateX(-50%) scaleX(0)");
    inactiveDD.not(".active").slideUp(400);
    inactiveDD.closest(".tab").children(".title").removeClass("showingDD");
}
function getParentTitles(clickedTitle){
    var parentTab = clickedTitle.parent(),
        nested = parentTab.parent().is(".dropDown"), titles = false;

    while (nested){
        if (!titles){
            titles = parentTab.closest('.dropDown').closest('.tab').children('.title');
        }else{
            titles = titles.add(parentTab.closest('.dropDown').closest('.tab').children('.title'));
        }
        nested = parentTab.parent().is(".dropDown");
        parentTab = parentTab.parent().closest('.tab');
    }
    return titles;
}
function tabMouseEnter(e){
    var underline = $(this).children(".underline");
    var dropdown = $(this).children(".dropDown");
    var menu = $(this).closest(".menuBar");
    underline.addClass("hover");
    dropdown.addClass("active");
    // console.log(menu);
    animateMenuV2(menu);
}
function tabMouseLeave(e){
    var underline = $(this).children(".underline");
    var dropdown = $(this).children(".dropDown");        
    var title = $(this).children(".title");
    var menu = $(this).closest(".menuBar");
    underline.removeClass("hover active");
    dropdown.removeClass("active");
    setTimeout(function(){
        animateMenuV2($(menu));
    },500);
}
function setActiveTab(menu,tab){
    // if ($("#tabList").text().trim() == 'no session'){return false;}
    // var tabJson = JSON.parse($("#tabList").text());
    // if (!tabJson){tabJson = {};}
    // tabJson[menu] = tab;
    // setSessionVar({"CurrentTabs":tabJson})
    // $("#tabList").text(JSON.stringify(tabJson));
    try{
        tabHeaderInfo = JSON.parse($("#tabList").text());
        tabHeaderInfo = (tabHeaderInfo === null) ? {} : tabHeaderInfo;
    }catch(e){
        tabHeaderInfo = {};
    }
    tabHeaderInfo[menu] = tab;
    $("#tabList").text(JSON.stringify(tabHeaderInfo));
    // console.log(tabHeaderInfo);
}
function reloadTab(){
    var active = $(".menuBar").last().find(".title.active").last(),
        target = $(".loadTarget").last(),
        uri = active.data('uri');
    if (active.length == 0){
        location.reload(true);
    }else{
        unblurAll();
        LoadingContent(target,uri);        
    }
}
function delayedReloadTab(time = 800){
    setTimeout(function(){
        unblurAll();
        reloadTab();
    },time)
}
var loadXHR = undefined, xhrWait = undefined;
function LoadingContent(target,uri){
    if (target=="window"){
        alert("window");
    }
    $("#loading").remove();
    $("<div id='loading' class='lds-ring'><div></div><div></div><div></div><div></div></div>").appendTo("body");
    $("#loading").addClass("dark");
    $(target).html("").append($("#loading"));
    
    if (loadXHR!=undefined){
        loadXHR.abort();
    }

    loadXHR = $.ajax({
        url:uri,
        headers:{
            'X-CURRENT-TABS': $("#tabList").text(),
            'X-CURRENT-UIDS': $("#uidList").text()
        },
        success:function(data){
            // console.log(uri);
            $(".toModalHome, .modalForm").appendTo("#ModalHome");
            $("#ModalHome").children().filter(function(){
                return $.inArray($(this).attr('id'),systemModalList) === -1;
            }).remove();
            $(target).html(data);
            // console.log('list updates',$(target).find(".listUpdate").length);
            if ($(target).find(".listUpdate").length != 0){
                var lists = $(target).find(".listUpdate").data(), uids = lists.uids, tabs = lists.tabs;
                // console.log('uids',uids,'tabs',tabs);
                uids = (uids && uids.length == 0) ? 'null' : JSON.stringify(uids);
                tabs = (tabs && tabs.length == 0) ? 'null' : JSON.stringify(tabs);
                $("#uidList").text(uids);
                $("#tabList").text(tabs);
            }
            initializeNewContent();
        },
        error: function(e){
            if (e.status == 404){
                $(target).html("<h2 class='paddedSmall'>Content Unavailable</h2><div class='central small paddedSmall bottomOnly'>Sorry for the inconvenience. If this continues, please submit an error report. Submitting an error report is just one-click away.</div><div class='button pink xxsmall errorReport'>send error report</div>");
            }
            // console.log(e);
        }
    })
}
function updateUriUids(){
    console.log("don't use this updateUriUids!");
    alert("Fix me updateUriUids!");
    // getSessionVar('uidList');
    // var check = setInterval(function(){
    //     if (yourSessionVar!=undefined && yourSessionVar!=""){
    //         var uidList = JSON.parse(yourSessionVar);
    //         // console.log(uidList);
    //         $.each(uidList,function(label,uid){
    //             var model = label.split("_")[0];
    //             var menuItems = $('.menuBar').find(".tab, li").filter(function(){
    //                 return $(this).data('uri') !== undefined;
    //             }).filter(function(){
    //                 var model = label.split("_")[0], uri = $(this).data('uri');
    //                 var includesModel = uri.includes(model);
    //                 var needsUid = uri.match(/(edit|delete|show|update|settings)/);
    //                 return includesModel && needsUid;
    //             })
    //             menuItems.each(function(){
    //                 var uri = $(this).data('uri');
    //                 uri = uri.split("/");
    //                 uri[2] = uid;
    //                 uri =   uri.join("/");
    //                 $(this).data('uri',uri);
    //             })
    //         })
    //         yourSessionVar=undefined;
    //         clearInterval(check);
    //     }
    // },50)
}

