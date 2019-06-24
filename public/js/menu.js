$(document).ready(function(){
    var purple = "rgb(105,12,104)", yellow = "rgb(240,154,53)", orange = "rgb(234,78,80)";

    var AllNewMenus = $(".menuBar.website").filter(function(){
       return $(this).data("populated")=="no"; 
    });
    
    var tabs = [];
    var loadXHR = undefined;
    
    $(window).on("scroll",checkScrollMenus);
    
    AllNewMenus.each(function(i,menu){
        var tabGroup = $(menu).attr("id");
        var MenuItems = $(menu).find('.tab');
                
        MenuItems.each(function(){
            $(this).append("<span class='underline'></span>");
        })
        
        tabs = [];
        $.ajax({
            url: "/json/menu-data.json",
            dataType: "json",
            success: function(data){
                $.each(data,function(a, b){
                    if (a == tabGroup){
                        $.each(b,function(i,tab){
                            var myObj, myObj2;
                            var myArray=[];
                            if (tab.dropdown){
                                myObj = {"name":tab.name,"dropdown":tab.dropdown};

                                for (c=0;c<tab.options.length;c++){
                                    myObj2 = {"text":tab.options[c].text,"uri":tab.options[c].uri,"id":tab.options[c].id};
                                    myArray.push(myObj2);
                                }
                                myObj["options"] = myArray;
                            }else{
                                myObj = {"name":tab.name,"dropdown":tab.dropdown,"uri":tab.uri};
                            }
                            tabs.push(myObj);
                        })
                    }
                })
            }
        }).done(AddMenuLinks);
    })
    function AddMenuLinks(menu){
        var name, uri, options, optionsNode='';
        for (x=0;x<tabs.length;x++){
            optionsNode='';
            name = tabs[x].name;
            var MenuItem = $("#"+name);
            
            if ($(document).has(MenuItem).length>0){
                menu = MenuItem.closest(".menuBar.website");
                //console.log(menu);
            }
            
            if (tabs[x].dropdown){
                options = tabs[x].options;
                for (y=0;y<options.length;y++){
                    optionsNode += "<li id='"+options[y].id+"' data-uri='"+options[y].uri+"'>"+options[y].text+"</li>";
                    if (y < options.length -1){
                        optionsNode += "<br>";
                    }
                }
                $("<ul/>",{
                    "class":"dropDown",
                    html:optionsNode
                }).appendTo(MenuItem);
            }else{
                uri = tabs[x].uri;
                MenuItem.data("uri",uri);
            }   
        }
        
        ClickActiveTabsV2();
        
        $(menu).data("populated","yes");
        
    }    
    function animateMenuV2(menuID){
        var titles = $(menuID).find(".title").filter(function(){return !$(this).parent().is("#booknow")});
        var underlines = $(menuID).find(".tab").filter(function(){
            return $(this).find(".dropDown").length==0 || $(menuID).hasClass("siteMenu")
        }).find(".underline");
        var dropdowns = $(menuID).find(".dropDown"), activeDD = dropdowns.filter(".active"), inactiveDD = dropdowns.not(".active");
        var dropdownLIs = dropdowns.find("li");
        var activeTab = titles.filter(".active").parent();
        
        //activeTab.find(".title").css("color",orange);
        //titles.not(".active").css("color","black");
        //activeTab.find('li').filter(".active").css("color",orange);
        //dropdownLIs.not(".active").css("color","black");
        
        
        underlines.filter(".active, .hover").animate({width: "105%"}, 200);
        underlines.not(".active, .hover").animate({width: "0%"}, 200);
        activeDD.slideDown(400).css("transform","translateX(-50%) scaleX(1)");
        activeDD.closest(".tab").find(".title").addClass("showingDD");
        inactiveDD.not(".active").slideUp(400).css("transform","translateX(-50%) scaleX(0)");
        inactiveDD.closest(".tab").find(".title").removeClass("showingDD");
    }
    function tabMouseEnter(e){
        var underline = $(this).find(".underline");
        var dropdown = $(this).find(".dropDown");
        var menu = $(this).closest(".menuBar.website");
        underline.addClass("hover");
        dropdown.addClass("active");
        animateMenuV2(menu);
    }
    function tabMouseLeave(e){
        var underline = $(this).find(".underline");
        var dropdown = $(this).find(".dropDown");        
        var title = $(this).find(".title");
        var menu = $(this).closest(".menuBar.website");
        underline.removeClass("hover active");
        dropdown.removeClass("active");
        setTimeout(function(){
            animateMenuV2($(menu));
        },500);
    }
    
    var MenuItems = $(".menuBar.website").filter(function(){
        return $(this).data("populated") == 'no';
    }).find(".tab");
    MenuItems.on("touchstart",function(e){
        e.preventDefault();
        $(e.target).click();
    })
    MenuItems.hover(tabMouseEnter,tabMouseLeave);
        
    MenuItems.on("click",".title",function(e){
        var tab = $(this).parent();
        var title = tab.find(".title");
        var underline = tab.find(".underline");
        var id = tab.attr("id");
        var dropdown = tab.find(".dropDown");
        var menu = $(this).closest(".menuBar.website");
        var target = (menu.data("target")!="window") ? $(menu.data("target")) : "window" ;
        var uri = tab.data("uri");

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
            return false;
        }
                
        if (uri==undefined && !dropdown.hasClass("active")){
            dropdown.addClass("active");
            underline.addClass("active");
        }
        else if (uri==undefined && dropdown.hasClass("active")){
            if (underline.hasClass("hover")==false){
                dropdown.removeClass("active");
                console.log("A")
            }
            if (title.hasClass("active")==false){
                underline.removeClass("active");
                if (dropdown.hasClass("active")){
                    dropdown.removeClass("active");                    
                }
            }
        }
        else if (uri==undefined && !title.hasClass("active")){
            underline.addClass("active");
            dropdown.addClass("active");
        }
        else if (uri!=undefined && title.hasClass("active")){
            // link, already active, no action
            
        }
        else if (uri!=undefined && !title.hasClass("active")){
            // link, not active
            menu.find(".active").removeClass("active");
            underline.addClass("active");
            title.addClass("active");
            if (target=="window"){
                window.location.href = uri;
            }else{
                LoadingContent(target,uri);
                SetActiveTabs();
            }
        }
        
        animateMenuV2(menu);
        
        
    })
    
    MenuItems.on("click","li",function(){
        var uri = $(this).data("uri");
        var id = $(this).attr("id");
        var tab = $(this).closest(".tab");
        var title = tab.find(".title");
        var underline = tab.find(".underline");
        var menu = $(this).closest(".menuBar.website");
        var target = (menu.data("target")!="window") ? $(menu.data("target")) : "window" ;
        
        menu.find(".active").removeClass("active");
        $(this).addClass("active");
        title.addClass("active");
        underline.addClass("active");
        if (target=="window"){
            window.location.href = uri;
        }else{
            LoadingContent(target,uri);
            SetActiveTabs();
        }
        //setSessionVar("CurrentTab",id);
//        tab.find(".dropDown").slideUp(200);
    })
    
            
    function SetActiveTabs(){
        var activeTitles = $(".menuBar.website").find(".title").filter(".active") ;
        var activeLIs = $(".menuBar.website").find("li").filter(".active");
        var tabString = "";
        var activeTabs = activeLIs;

        activeTitles.each(function(i,x){
            if ($(x).closest(".tab").data("uri")!=undefined){
                activeTabs = activeTabs.add($(x));
            }
        })
        
        var MenuObj = {}
        for (x=0;x<activeTabs.length;x++){
            var tab = activeTabs[x];
            var tabID, menuID;
            if ($(tab).is("li")){
                tabID = "#"+$(tab).attr("id");
                menuID = "#"+$(tab).closest(".menuBar.website").attr("id");
            }else {
                if ($(tab).closest(".tab").data("uri")!=undefined){
                    tabID = "#"+$(tab).closest(".tab").attr("id");
                    menuID = "#"+$(tab).closest(".menuBar.website").attr("id");
                }
            }
            MenuObj[menuID] = tabID;
        }
        setSessionVar({"CurrentTabs":MenuObj});
    }
    function ClickActiveTabsV2(){
        var json = $("#tabList").text();
        if (json==""){return false;}
        var menus = JSON.parse($("#tabList").text());
        var ActiveMenus = [], ActiveTabs = [];
        $.each(menus,function(menu, tab){
            ActiveMenus.push(menu);
            ActiveTabs.push(tab);
        })
        menus = $(".menuBar.website").filter(function(){
            return $(this).data("populated") == 'no';
        });

        var x = 0, count = menus.length ;
        if (count>0){
            var step = setInterval(function(){
                var id = "#"+$(menus[x]).attr("id");
                var tabs = $(menus[x]).find(".title, li");
                var key = $.inArray(id,ActiveMenus);
                
                if ($(id).data('target')=="window"){
                    var tab = $(id).find(".title").filter(function(){
                        return window.location.href.includes($(this).closest(".tab").data('uri'));
                    });
                    var li = $(id).find("li").filter(function(){
                        return window.location.href.includes($(this).data('uri'));
                    });
                    li.closest(".tab").find(".title").addClass("active");
                    tab.add(li).addClass("active");
                    animateMenuV2($(id));
                }else if (key==-1){
                    tabs.first().click();
                }else{
                    var tab = $(ActiveTabs[key]);
                    if (tab.is(".tab")){
                        $(ActiveTabs[key]).find(".title").click();
                    }else{
                        $(ActiveTabs[key]).click();
                    }
                }
                if (x == count -1){
                    clearInterval(step);
                }
                x++;
                
            },100);            
        }
    }
    
    function LoadingContent(target,uri){
        if (target=="window"){
            alert("window");
        }
        //alert(target);
        console.log(target);
        
        if ($("#loading").length==0){
            $("<div id='loading' class='lds-ring'><div></div><div></div><div></div><div></div></div>").appendTo("body");
        }else{
            $("#loading").appendTo("body");
        }
        $("#loading").addClass("dark");
        $(target).html("").append($("#loading"));
        
        if (loadXHR!=undefined){
            loadXHR.abort();
        }
        
        loadXHR = $.ajax({
            url:uri,
            success:function(data){
                $(target).html(data);
            }
        })
    }
    
/*    var progressTarget = $(".progressBar").data('target');

    $(progressTarget).on("click",".next",function(){
        var tabs = $(".progressBar").find(".title");
        var activeTab = tabs.filter(".active");
        var activeIndex = tabs.index(activeTab);
        var nextIndex = activeIndex+1;
        
        $(tabs[nextIndex]).click();
    })
    
    $(progressTarget).on("click",".prev",function(){
        var tabs = $(".progressBar").find(".title");
        var activeTab = tabs.filter(".active");
        var activeIndex = tabs.index(activeTab);
        var prevIndex = activeIndex-1;
        
        $(tabs[prevIndex]).click();
    })*/
    
    var AllMenus = $(".menuBar.website").not(".siteMenu");
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
})

