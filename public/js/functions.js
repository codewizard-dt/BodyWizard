$(".jump").on("click",function(){
    var target = "#"+$(this).data("target");
    $.scrollTo(target);
});

(function($) {
    $.sanitize = function(input) {
        var output = input.replace(/<script[^>]*?>.*?<\/script>/gi, '').
                     replace(/<[\/\!]*?[^<>]*?>/gi, '').
                     replace(/<style[^>]*?>.*?<\/style>/gi, '').
                     replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
        return output;
    };
})(jQuery);

function filterUninitialized(selector){
    var uninitialized, obj;
    if (selector instanceof jQuery){obj = selector;}
    else if(typeof selector == 'string'){obj = $(selector);}
    else {return false;}
    uninitialized = obj.filter(function(){
        return !$(this).data('initialized');
    });
    return uninitialized;
}

function chkStrForArrayElement(yourstring,substrings){
    var length = substrings.length;
    while(length--) {
       if (yourstring.indexOf(substrings[length])!=-1) {
           return true;
       }
    }
    return false;
}

$.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
});
$(document).ajaxError(function(ev,xhr,settings,error){
    if (error !== 'abort'){
        // console.log("ev");
        // console.log(ev);
        // console.log("xhr");
        // console.log(xhr);
        // console.log("settings");
        // console.log(settings);
        // console.log("error");
        // console.log(error);
        console.log(error);
        var status = xhr.status,
            message = (xhr.responseJSON != undefined) ? xhr.responseJSON.message : error;
        if (status == 419){
            blurElement($("body"),"#Refresh");
            setTimeout(function(){
                location.reload();
            },1500)
        }else{
            if ($("#Error").length > 0){
                $("#Error").find(".submit").data('error',xhr);
                $("#Error").find(".message").html("<h2>Error</h2><div>"+message+"</div>");
                blurElement($("body"),"#Error");
            }            
        }
    }
})

function submitErrorReport(){
    console.log($(this).data('error'));
}

$(document).on("mousedown",".button",function(e){
//    console.log(e.target);
    if (e.target.tagName !== "SELECT"){
        e.preventDefault();
    }
});
$(document).on("mousedown","li",function(e){
        e.preventDefault();
});

var defaultCSS = {
    "item": {
        "inline":"false"
    },
    'section': {
        'displayNumbers':"false"
    }
};
function getDefaultCSS(type){
    return defaultCSS[type];
}


// function checkName(){
//     setTimeout(function(){
//         if ($("#FName").val()==""){
//             var noName = $('<div id="NoName" class="modal">There is no patient information loaded. You will be redirected to the Practitioner Launchpad shortly...</div>');
//             $('body').append(noName);
//             $("#NoName").modal();
//             setTimeout(function(){
//                 location.replace("/portal/launchpad");
//             },2000)
//         }        
//     },1500)        
// }

function alertBox(str,What,Where,Fade,Offset){
    var h = What.outerHeight(true), w = What.outerWidth(true), ele, w2;
    if (Fade=="nofade"){
        ele = $('<span class="zeroWrap a"><span class="alert">'+str+'</span></span>');
    }
    else{
        ele = $('<span class="zeroWrap a f"><span class="alert f">'+str+'</span></span>');
    }
    if (Where=="after"){
        ele.insertAfter(What).height(h);
    }
    else if (Where=="ontop"){
        ele.insertBefore(What).height(h);
    }
    else if (Where=="before"){
        ele.insertBefore(What).height(h);
        w = ele.find(".alert").outerWidth();
        ele.find(".alert").css("left","-"+w+"px");
    }
    else if (Where=="above"){
        ele.insertBefore(What).height(h);
        w2 = 0.5*w-0.5*$(ele).find(".alert").outerWidth(true);
        //ele.find(".alert").css({"top":"-"+h+"px","left":w2+"px"});
        var hA = $('.alert').outerHeight();
        ele.find(".alert").css({"top":"-"+hA+"px","left":w2+"px"});
    }    
    else if (Where=="below"){
        ele.insertBefore(What).height(h);
        w2 = 0.5*w-0.5*$(ele).find(".alert").outerWidth(true);
        ele.find(".alert").css({"top":2*h+"px","left":w2+"px"});
    }    
    else {
        ele.insertAfter(What).height(h);
    }
    if (Offset!==null){
        $(".alert").css("transform","translate("+Offset+")");
    }
    if ($.isNumeric(Fade)===false){Fade=1500;}
    var BC = What.css("border-color");
    
    What.css("border-color","red").attr("readonly","true");
    setTimeout(function(){
        What.css("border-color",BC);
        What.removeAttr("readonly");
        What.focus();
        if (What.is(".answer") && What.find("input").length>0){What.find("input").focus();}
        if (What.is(".answer") && What.find("textarea").length>0){What.find("textarea").focus();}
    },Fade)

    setTimeout(function(){
        $(".zeroWrap.a.f, .alert.f").fadeOut(600,function(){$(this).remove();})        
    },Fade)
        
}
function confirmBox(str,What,Where,Fade,Offset){
    var h = What.outerHeight(true), w = What.outerWidth(true), ele, w2;
    if (Fade=="nofade"){
        ele = $('<span class="zeroWrap c"><span class="confirm">'+str+'</span></span>');
    }else{
        ele = $('<span class="zeroWrap c f"><span class="confirm f">'+str+'</span></span>');
    }
    if (Where=="after"){
        ele.insertAfter(What).height(h);
    }
    else if (Where=="ontop"){
        ele.insertBefore(What).height(h);
    }
    else if (Where=="before"){
        ele.insertBefore(What).height(h);
        w = ele.find(".confirm").outerWidth();
        ele.find(".confirm").css("left","-"+w+"px");
    }
    else if (Where=="above"){
        ele.insertBefore(What).height(h);
        w2 = 0.5*w-0.5*$(ele).find(".confirm").outerWidth(true);
        ele.find(".confirm").css({"top":"-"+h+"px","left":w2+"px"});
    }    
    else if (Where=="below"){
        ele.insertBefore(What).height(h);
        w2 = 0.5*w-0.5*$(ele).find(".confirm").outerWidth(true);
        ele.find(".confirm").css({"top":2*h+"px","left":w2+"px"});
    }
    else if (Where=="append"){
        ele.appendTo(What).height(h);
    }
    else {
        ele.insertAfter(What).height(h);
    }
    if (Offset!==null){
        $(".confirm").css("transform","translate("+Offset+")");
    }

    
    var BC = What.css("border-color");
    What.css("border-color","rgb(46, 107, 53)");
    setTimeout(function(){
        What.css("border-color",BC);
        What.focus();
    },1500)

    setTimeout(function(){
        $(".zeroWrap.c.f, .confirm.f").fadeOut(600,function(){$(this).remove();})        
    },1500)
}

function CheckMark(What,Fade,Offset){
    var h = What.outerHeight(true), w = What.outerWidth(true), ele;
    if (Fade=="fade"){
        ele = $('<span class="zeroWrap fade"><span class="checkmark fade">✓</span></span>');    
    }else{
        ele = $('<span class="zeroWrap"><span class="checkmark">✓</span></span>');    
    }
    ele.insertAfter(What).height(h);
    if (Offset!==null){
        $(".checkmark").css("transform","translate("+Offset+")");
    }
    setTimeout(function(){
        $(".fade").fadeOut(400,function(){$(".fade").remove();});
    },1000)
}

$(document).on("click",".toggle",function(){
        var target = $(this).data("target");
        $(target).slideToggle(800);
        if ($(this).find("span").text()=="show"){
            $(this).find("span").text("hide");
        }else if ($(this).find("span").text()=="hide"){
            $(this).find("span").text("show");
        }
    })

function setSessionVar(KeysValuesObj){
    $.ajax({
        url:"/setvar",
        method:"POST",
        data:KeysValuesObj,
        success:function(data){
            // console.log(data);
        },
        error:function(e){
            console.log(e);
        }
    })
}
var yourSessionVar = undefined;
function getSessionVar(keyName){
    $.ajax({
        url:"/getvar",
        method:"POST",
        data:{"getVar":keyName},
        success:function(data){
            yourSessionVar = data;
        },
        error:function(e){
            console.log(e);
        }
    })
}

function slideFadeOut(elem,time,callback) {
    time = (time != undefined) ? time : "400";
    var t = "opacity "+time+"ms";
    var fade = { opacity: 0, transition: t };
    if (elem.length==1){
        elem.css(fade).delay(100).slideUp(time);
    }else if (elem.length>1){
        elem.each(function(){
            $(this).css(fade).delay(100).slideUp(time);
        })
    }
    if (callback!=undefined){
        setTimeout(callback,time+101);
    }
}
function slideFadeIn(elem,time,callback){
    time = (time != undefined) ? time : "400";
    var t = "opacity "+time+"ms";
    var solid = { opacity: 1, transition: t};
    elem.css("opacity","0")
    elem.slideDown(time).delay(100).css(solid);
    if (callback!=undefined){
        setTimeout(callback,time+101);
    }
}  

function modalLinkClk(){
    var target = $(this).data("window"), link = $(this).data("link");
    if ($(link).find(".cancel").length == 0){
        $("<div/>",{class:'cancel button xsmall',text:'dismiss'}).appendTo(link);
    }
    if ($(this).closest("#Block").length == 0){blurElement($(target),link);}
    else {blurModal($(target),link);}
}
function modalOrBody(ele){
    var B = ele.closest(".blur");
    if (B.length > 0){
        return B.children().first();
    }else{
        return $("body");
    }
}
function parentModalOrBody(ele){
    var B = ele.closest('.blur').parent().closest('.blur');
    if (B.length > 0){
        return B.children().first();
    }else{
        return $("body");
    }
}
function containedBySubModal(ele){
    var B = ele.closest("#Block2");
    if (B.length > 0){
        return B.children().first();
    }else{
        return false;
    }
}

$(document).keyup(function(e){
    if (e.keyCode === 27 && $('.blur').length > 0){
        var b = $(".blur").last(), p = parentModalOrBody(b);
        unblurElement(p);
    }
})

function blurElement(elem,modal,time,callback){
    time = (time != undefined) ? time : "400";
    var position = $(elem).css("position"),
        home = ($("#ModalHome").length > 0) ? $("#ModalHome") : $("body");

    $("#loading, #checkmark").remove();
    if (modal=="#loading"){
        $("<div id='loading' class='lds-ring'><div></div><div></div><div></div><div></div></div>").appendTo("body");
    }else if (modal=="#checkmark"){
        $("<span id='checkmark' class='checkmark' style='font-size:4em'>✓</span>").appendTo("body").css({
            borderRadius:"50%",
            padding:"0.1em 0.5em",
            boxShadow:"0 0 20px 10px rgba(230,230,230,0.4)",
            backgroundColor:"rgba(230,230,230,0.8)",
            border:"2px solid green"
        });
    }else{
        if (elem.is("body")){$(modal).css("box-shadow","0 0 15px 10px rgba(230,230,230,0.4)");}
        else {$(modal).css("box-shadow","0 0 15px 10px rgba(190,190,190,0.4)");} 
    }
    if ($(modal).find(".cancel").length>0){
        $(modal).find(".cancel").on("click",function(){
            unblurElement($(elem));
        });
    }
    $("#loading").removeClass("dark");
    if (position!=("relative"||"fixed"||"absolute")){
        $(elem).css({
            position:"relative",
            overflow:"hidden"
        });
    }
    if ($(elem).is(".modalForm") && modal!="#loading" && modal!="#checkmark" && modal!="#Error"){$(elem.addClass('expanded'));}
    $(elem).css("overflow","hidden");
    $(elem).find("input:focus, textarea:focus").blur();
    if ($(elem).children().first().hasClass("blur")){
        var block = $(elem).children().first();
        block.children().hide().appendTo(home);
    }else{
        var n = $(".blur").length, i = n + 1;
        if (n == 0){
            $("body").append("<div id='Block' class='blur'></div>");
        }else{
            $("<div/>",{
                id: "Block" + i,
                class: "blur"
            }).appendTo("body");
        }
        var block = (n == 0) ? $("#Block") : $("#Block"+i);
    }

    if (!block.is("#Block")){$("#loading").addClass("dark");}
    
    var showCSS = {};
    var w = $(elem).outerWidth(), h = $(elem).outerHeight();
    if (elem.is("body")){
        var top = (window.pageYOffset || document.scrollTop)  - (document.clientTop || 0);
        if (isNaN(top)){
            top = 0;
        }
        showCSS["top"] = top;
        //var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth; 
        var w = "100%";
        var h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;    
    }else{
        showCSS['top'] = $(elem).scrollTop();
    }
    showCSS.width = (elem.is("body")) ? w : "100%";
    showCSS.height = (elem.is("body")) ? h : "100%";
    // $("#Block").prependTo(elem).css(showCSS).fadeIn(time);
    block.prependTo(elem).css(showCSS).fadeIn(time);
    var center = {
        position: "absolute",
        left:"50%",
        top:"50%",
        transform:"translate(-50%,-50%)",
    }

    // if (!block.is("#Block")){
    //     modalCSS['boxShadow'] = "0 0 15px 3px rgb(190,190,190)";
    // }

    if (modal!=undefined){
        $(modal).css("opacity","1");
        if (modal=="#loading"){
            $(modal).css({opacity:1,display:"inline-block"});
        }
        if ($(modal).is("#Warn, #Error, #Confirm")){
            $(modal).css("box-shadow","0 0 15px 3px rgb(245,245,245)");
        }
        if (modal==".c" || modal=='.a'){
            $(modal).css({backgroundColor:"transparent",boxShadow:""});
            $(modal).find(".confirm, .alert").css(center);
        }
        // $(modal).appendTo("#Block").css(center);
        $(modal).appendTo(block).css(center);
        if ($(modal).find(".formDisp").length>0){
            $(modal).css({
                overflowX:"auto",
                overflowY:'auto'
            })
        }
        if ($(modal).is(":visible")==false){
            $(modal).fadeIn(time);
        }
        $(modal).find('.cancel').on("click",function(){
            unblurElement(elem);
        })
    }
    
    if (callback!=undefined){
        setTimeout(callback,time+101);
    }
}
function unblurElement(elem){
    var n = $(".blur").length,
        block = (n == 1) ? $("#Block") : $("#Block"+n);
        // console.log(block);
        // console.log(elem.children(".blur"));
    if ($(elem).is(".modalForm")){$(elem.removeClass('expanded'));}

    block = elem.children(".blur");
    block.fadeOut(400,function(){
        if ($("#ModalHome").length==0){
            block.children().hide().appendTo($("body"));
        }else{
            block.children().hide().appendTo($("#ModalHome"));
        }
        block.remove();
    });
    // console.log(elem);    console.log(block.parent());
    // $(elem).css({
    //     overflowX:"hidden",
    //     overflowY:"auto"
    // });
    block.parent().css({
        overflowX:"hidden",
        overflowY:"auto"
    });
}
function loadBlurLight(elem){
    if ($("#loading").length==0){
        $("<div id='loading' class='lds-ring'><div></div><div></div><div></div><div></div></div>").appendTo("body");
    }
    $("#loading").addClass("dark").show().css(loadingRingCSS);
    var block = $("<div/>",{
        css:{
            backgroundColor:"rgba(190,190,190,0.4)",
            position: "absolute",
            top:0,
            left:0,
            width:"100%",
            height:"100%",  
            boxShadow: "0 0 20px 10px rgb(230,230,230) inset"
        },
        class:"loadBlock"
    })
    $(elem).css("overflow","hidden");
    block.appendTo($(elem)).append($("#loading"));
}
function loadBlurDark(elem){
    if ($("#loading").length==0){
        $("<div id='loading' class='lds-ring'><div></div><div></div><div></div><div></div></div>").appendTo("body");
    }
    $("#loading").show().css(loadingRingCSS);
    var block = $("<div/>",{
        css:{
            backgroundColor:"rgba(0,0,0,0.4)",
            position: "absolute",
            top:0,
            left:0,
            width:"100%",
            height:"100%",  
            boxShadow: "0 0 20px 10px rgb(120,120,120) inset"
        },
        class:"loadBlock"
    })
    $(elem).css("overflow","hidden");
    block.appendTo($(elem)).append($("#loading"));
}
function blurButton(elem,color){
    elem.addClass("disabled");
    if ($("#loading").length==0){
        $("<div id='loading' class='lds-ring'><div></div><div></div><div></div><div></div></div>").appendTo("body");
    }
    $("#loading").show().css(loadingRingCSS);
    if (color != undefined){$("#loading").addClass(color)};
    $("#loading").appendTo(elem);
}
function unblurButton(elem,checkmark,hideButton){
    $("#loading").hide().appendTo("body");
    $(elem).removeClass("disabled");
    if (checkmark == true){
        if ($("#checkmark").length==0){
            $("<span id='checkmark' class='checkmark' style='font-size:4em'>✓</span>").appendTo("body").css({
                borderRadius:"50%",
                padding:"0.1em 0.5em",
                margin:"0",
                left:"50%",
                boxShadow:"0 0 20px 10px rgba(230,230,230,0.4)",
                backgroundColor:"rgba(230,230,230,0.8)",
                transform: "translate(-50%,-50%)"
            });
        }
        $("#checkmark").appendTo(elem);
        setTimeout(function(){
            $("#checkmark").appendTo("body").hide();
            if (hideButton){
                $(elem).hide();
            }
        },1500)
    }
}

function checkOverflow(elem){
    if ($(elem).is(":visible")===false){return false;}
    if ($(elem).data("maxheight")!=undefined){
        $(elem).css({
            maxHeight:$(elem).data("maxheight")
        })
    }
    var h1 = elem.scrollHeight, h2 = $(elem).innerHeight();
    $(elem).find(".showOverflow").off("click",showOverflow);
    var dif = Math.abs(h1 - h2);
    if (dif > 25 && !$(elem).css("overflow").includes("auto")){
        slideFadeIn($(elem).find(".showOverflow"));
        $(elem).find(".showOverflow").on("click",showOverflow);
    }else{
        slideFadeOut($(elem).find(".showOverflow"));
    }
}
function showOverflow(){
    var elem = $(this).closest(".manageOverflow")[0];
    var h1 = elem.scrollHeight, h2 = $(elem).innerHeight();
    
    if ($(this).closest(".modalForm").length==0){
        $(elem).css({
            maxHeight:"none",
            height:h2
        })
        $(elem).animate({height:h1},800,function(){$(elem).css("height","auto")});        
    }else{
        $(elem).css({
            overflowX:"hidden",
            overflowY:"auto"
        })
    }
    
    slideFadeOut($(elem).find(".showOverflow"));
}
$(document).ready(function(){
    $('.manageOverflow').each(function(i,ele){
        checkOverflow(ele);
    })
    $("#Error").find(".submit").on('click',submitErrorReport);
})

function allowButtonFocus(){
    $(".button").attr("tabindex","0");
    $(".button").off("keyup",enterClick);
    $(".button").on("keyup",enterClick);
}
function enterClick(e){
    if (e.keyCode=="13"){
        $(this).click();
    }
}

function highlightRow(){
    if ($(this).find("th").length==0){
        $(this).addClass("hover");
    }
}
function reverseHighlight(){
    $(this).removeClass("hover");
}
function stylizeTables(){
    var tables = $(document).find(".styledTable").filter(function(){
        return $(this).data("styled") == undefined;
    });
    tables.wrap("<div class='tableWrapper'/>");
    tables.filter(".clickable").find("tr").not(".head").hover(highlightRow,reverseHighlight);
    tables.each(function(){
        if ($(this).hasClass('hideOverflow')){
            var t = $(this).closest(".tableWrapper"), h = $(this).data('maxheight');
            t.addClass('manageOverflow').data("maxHeight",h);
            $("<div/>",{
                class:"showOverflow",
                text:"show all matches"
            }).appendTo(t);
        }
    })
    tables.data('styled',true);
}

function animateWidthChange(elem){
    var w1 = elem.scrollWidth, w2 = $(elem).innerWidth(), w3;
    $(elem).css({
        "width":w2,
        "overflow":"hidden"
    });
    var wait = setInterval(function(){
        w3 = elem.scrollWidth;
        console.log(w1+" "+w2+" "+w3);
        if (w3!=w1){
            clearInterval(wait);
            $(elem).animate({"width":w3},800,function(){
                $(elem).css({
                    "width":"auto",
                    "oveflow":"auto"
                })
            })
        }
    },100)
    console.log('finish')
;}
function wrapAndCenter(item){
    if ($(item).is(".optionsNav.hide")){
        $(item).wrap("<div class='wrapper' style='display:none'/>");
    }else{
        $(item).wrap("<div class='wrapper'/>");
    }
}

function filterTableList(table){
    $(".styledTable").removeClass("active");
    table.addClass("active");
    
    var filterObj = {}, 
        filterList = [], 
        AllRows = table.find("tr").not('.head, .noMatch'), 
        noMatch = table.find(".noMatch");
    $(".filterType").removeClass("active").each(function(){
        var checks = $(this).find(".tableFilter").filter(":checked").length,
            searches = $(this).find(".tableSearch").filter(function(){return $(this).val()!=""}).length;
        if (checks > 0 || searches > 0){
            $(this).addClass("active");
        }
        if (searches > 0){
            $(this).data('options','{"wholeWords":"false","separateWords":"true"}');
        }
    })
    
    //AllRows.removeClass("match").addClass("hide").unmark();
    AllRows.unmark();
    AllRows.unmark({element:"exclude"});
    AllRows.show();

    $(".tableFilter").filter(function(){
        return table.is($(this).closest(".filterType").data("target")) && $(this).is(":checked");
    }).each(function(f,ele){
        filterList.push($(ele).data('filter'));
    })
    
    $(".tableSearch").filter(function(){
        return table.is($(this).closest(".filterType").data("target")) && $(this).val()!="";
    }).each(function(f,ele){
        var filter = $(ele).data("filter") + ":" + $(ele).val();
        filterList.push(filter);
    })
        
    filterList.forEach(function(filter,f){
        var type = filter.split(":")[0], value = filter.split(":")[1];
        if (type=='hide'){
            value = filter.split(":")[1] + ":" + filter.split(":")[2];
        }
        if (filterObj[type]==undefined){
            filterObj[type] = [value];
        }else{
            filterObj[type].push(value);
        }
    });
    
    if ($.isEmptyObject(filterObj)){
        AllRows.removeClass("hide");
        if (AllRows.length==0){
            noMatch.find(".name").text("None available").show();
        }else{
            noMatch.hide();
        }
        if (table.parent().hasClass("manageOverflow")){
            checkOverflow(table.parent()[0]);
        }

        $('.clearTableFilters').filter('[data-target="#'+table.attr('id')+'"]').addClass('disabled');
        return false;
    }
    
    $('.clearTableFilters').filter('[data-target="#'+table.attr('id')+'"]').removeClass('disabled');

    AllRows.data("marks",0);
    AllRows.data("match",0);
    $.each(filterObj,function(type,values){
        var options = $(".tableFilter, .tableSearch").filter(function(){
            return table.is($(this).closest(".filterType").data("target")) && $(this).data("filter").includes(type);
        }).closest(".filterType").data("options");

        optionsObj = {};
        // optionsObj['done'] = checkMatches;
        optionsObj['done'] = function(){
            // if (type != 'hide'){
                checkMatches();
            // }
        }
        optionsObj['synonyms'] = {
            "spleen":"spleen-pancreas",
            "burner":"jiao"
        };
        
        if (options['highlight']=="false"){
            optionsObj["className"] = "invis";
        }
        if (options['separateWords']=='false'){
            optionsObj['separateWordSearch']=false;
        }
        if (options['wholeWords']=='true'){
            optionsObj['accuracy']={value:"exactly",limiters:[",","."]};
        }else{
            optionsObj['accuracy']="partially";
        }
        if (type=='hide'){
            optionsObj['element'] = 'exclude';
        }
        AllRows.find("."+type).mark(values,optionsObj);
    })

    if (filterObj.length == 1){
        alert("HI");
    }
    AllRows.filter(function(){
        return $(this).find("exclude").length > 0;
    }).hide();

    if (AllRows.filter(":visible").length==0){
        noMatch.removeClass("hide").show();
    }else{
        noMatch.hide();
    }
    alternateRowColor(table);

    if (table.parent().hasClass("manageOverflow")){
        checkOverflow(table.parent()[0]);
    }
    
    checkHorizontalTableFit(table);
}
function checkMatches(){
    var table = $(".styledTable").filter(".active");
    var filterCount = $(".filterType").filter(function(){
        return table.is($(this).data("target")) && $(this).hasClass("active") && $(this).data('filter') != 'hide';
    }).length;
    
    var noMatch = table.find("tr").filter(".noMatch"),
        AllRows = table.find("tr").not('.head').not(noMatch);

    // DETERMINE AND SHOW MATCHES, HIDE THE REST
    AllRows.each(function(){
        var currentMarks = $(this).find("mark").length, previousMarks = $(this).data("marks"), currentMatches = $(this).data("match");
        if (currentMarks > previousMarks){
            $(this).data('marks',currentMarks);
            $(this).data('match',currentMatches+1);
        }
        if ($(this).data('match')==filterCount){
            $(this).removeClass("hide").addClass("match");
        }else{
            $(this).addClass("hide").removeClass("match");
        }
        // console.log($(this).data());
    })
}
function checkHorizontalTableFit(table){
    table.find("td, th").show();
    var hideOrder = table.data("hideorder").split(",");
    hideOrder.forEach(function(column,c){
        if (table.parent()[0].scrollWidth > table.parent()[0].clientWidth + 1){
            table.find("."+column).hide();
        }
    })
    table.find(".tdSizeControl").filter(":visible").each(function(){
        var h1 = $(this)[0].scrollHeight, h2 = $(this).height();
        if (h1 > h2){
            $(this).find(".indicator").show();
        }else{
            $(this).find('.indicator').hide();
        }
    })
    alternateRowColor(table);
}
var tableCheck = undefined;
function resizeCheckTableWidth(){
    if (tableCheck!=undefined){
        clearTimeout(tableCheck);
    }
    tableCheck = setTimeout(function(){
        $(".styledTable").each(function(i,t){
            if ($(t).data("hideorder")!=undefined){
                checkHorizontalTableFit($(t));
            }
        })
        tableCheck = undefined;
    },500)
}
function clearTableFilters(){
    if ($(this).hasClass('disabled')){return false;}
    var t = $(this).data("target");
    // console.log(t);
    $(".filterType").filter("[data-target='"+t+"']").find(".tableSearch").val("").keyup();
    $(".filterType").filter("[data-target='"+t+"']").find(".tableFilter").each(function(){
        if ($(this).is(":checked")){
            $(this).click();
        }
    })
    alternateRowColor($(t));
}

function resetOptionsNavBtns(){
    $(".optionsNav").off("click",".button",optionsNavBtnClick);
    $(".optionsNav").on("click",".button",optionsNavBtnClick);
}

function masterStyle(){
    resetOptionsNavBtns();
    $(".wrapMe").filter(function(){return !$(this).parent().is(".wrapper");}).each(function(){
        wrapAndCenter($(this));
    })
    allowButtonFocus();
    stylizeTables();
    $(".manageOverflow").each(function(i,ele){checkOverflow(ele);})
    $("#scrollToBtm").on("click", function(){$.scrollTo("max");})
    $(".modalForm").each(function(){
        if ($(this).find(".cancel").length==0){
            $("<div class='cancel button small'>dismiss</div>").appendTo($(this));
        }
    })
    $(".modalLink").off("click",modalLinkClk);
    $(".modalLink").on("click",modalLinkClk);
    $(window).off("resize",resizeCheckTableWidth);
    $(window).on("resize",resizeCheckTableWidth);
}

function informational(){
    var info = $($(this).data('target'));
    if (info.find(".cancel").length == 0){
        $("<div/>",{
            class: "cancel",
            text: "dismiss"
        }).appendTo(info);
    }
    if (info.closest("#Block").length > 0){
        blurModal($("#Block").children().first(),)
    }else{
        blurElement($("#body"),info);
    }
}

var confirmBool=undefined;
$(document).on('click',".confirmY",function(){
    confirmBool = true;
})    
$(document).on('click',".confirmN",function(){
    confirmBool = false;
})   
function confirm(target,where,offset){
    var str = "<span class='confirmQ'>are you sure? this cannot be undone</span> <span class='confirmY'>yes</span><span class='confirmN'>no</span>";
    confirmBox(str,target,where,"nofade",offset);
}
function warn(target,where,offset,customText=""){
    customText = (customText != '') ? " "+customText : "";
    var str = "<span class='confirmQ'>are you sure"+customText+"? this cannot be undone</span> <span class='confirmY'>yes</span><span class='confirmN'>no</span>";
    alertBox(str,target,where,"nofade",offset);
}

function optionsNavBtnClick(){
    if ($(this).hasClass("disabled")){return false;}
    var optionsNav = $(this).closest('.optionsNav'),
        model = optionsNav.data('model'),
        dest = $(this).data('destination'),
        link = $(".tab").add($(".dropDown").find("li")).filter("#"+dest),
        uid = optionsNav.data("uid");


    // console.log(link.data());
    
    if (link.length>0){
        if (link.data('uri').match(/(edit|delete|show|update|settings)/)){
            var uri = link.data('uri').split("/");
            uri[2] = uid;
            uri = uri.join("/");
            link.data('uri',uri);
        }
        if (link.is(".tab")){link.find(".title").click();}
        else if (link.is("li")){link.click();}
        }
    // things that aren't a menuBar item
    else if (dest=='form-preview'){
        $("<div/>",{
            id: "FormPreview",
            class: "modalForm"
        }).appendTo("#ModalHome");
        blurElement($('body'),"#loading");
        $("#FormPreview").load("/forms/"+uid+"/preview",function(){
            blurElement($('body'),"#FormPreview");
        })
    }
    else if (dest=='delete'){
        model = model.replace(" ","");
        var modal = '#delete'+model;
        // console.log(modal);
        $(modal).find(".name").text(optionsNav.find(".name").text());
        blurElement($("body"),modal);
    }
    else if (dest=='create'){
        var modal = '#create'+model;
        blurElement($("body"),modal);
    }
    else if (dest=='edit'){
        var modal = '#edit'+model,
            json = optionsNav.find(".name").data('json'),
            form = $(modal).find(".formDisp"),
            name = optionsNav.find(".name").text(),
            dispModel = (model == 'Diagnosis') ? optionsNav.data("dxtype") + " " + model : model;

        if ($.inArray(model,['Diagnosis',"User"])){
            if (model == 'Diagnosis'){
                dispModel = optionsNav.data("dxtype") + " " + model;
            }else if (model == 'User'){
                var h1 = "<h1 class='purple'>Edit Basic Patient Info</h1>", h2 = "<h1 class='yellow'>"+name+"</h1>";
                $(modal).find("h1").remove();
                $(modal).prepend(h1,h2);
            }else if (model == 'Template'){
                var m = optionsNav.find(".name").data('markup');
                $("#editTemplate").find(".summernote").summernote('code',m);
            }
        }

        dispModel = dispModel != undefined ? dispModel : model;

        removePasswordInputs();

        $(modal).find("h1, h2, .q").filter(function(){return !$(this).data('updated');}).each(function(){
            var t = $(this).text();
            t = t.replace("Add ","Edit ").replace("New","This").replace("This " + dispModel, "'" + name + "'").replace("This " + model, "'" + name + "'");
            $(this).text(t);
            $(this).data('updated',true);
        });
        $(modal).find(".submitForm").text("update");
        $(modal).data('uid',optionsNav.data('uid'));
        fillForm(json,form);
        // console.log(json);
        blurElement($("body"),modal);
    }
    else if (dest=="settings"){
        var id = model+"SettingsForm";

        $("#"+id).attr("id","xxx").remove();
        blurElement($("body"),"#loading");
        $.ajax({
            url: "/settings"+"/"+model+"/"+optionsNav.data('uid'),
            method: "GET",
            success:function(data){
                $(data).appendTo("#ModalHome");
                var form = $("#"+id), settings = (form.data('settings')!=undefined) ? form.data('settings') : false;
                form.find(".button.submitForm").text("save settings");
                form.find("h1, h2, .q").filter(function(){return !$(this).data('updated');}).each(function(){
                    var t = $(this).text(), name = optionsNav.find(".name").text();
                    t = t.replace("this " + model.toLowerCase(), "'" + name + "'");
                    $(this).text(t);
                    $(this).data('updated',true);
                });
                blurElement($("body"),"#"+id);
                setTimeout(function(){
                    attachConnectedModelInputs(form);
                    if (settings){
                        fillForm(settings,form.find(".formDisp"));
                    }else{
                        console.log('no settings');
                    }
                },250)

            },
            error:function(e){
                $("#Error").find('.message').text('Error loading settings');
                $("#Error").data('errMsg',e);
                blurElement($('body'),"#Error");
            }

        })
    }
    // old ones
    // else if (dest=="deleteForm"){
    //     var UID = $("#formStats").data('uniqueid');
    //     if (UID==undefined){
    //         return false;
    //     }
    //     confirm($(this),"below","");
    //     $(".confirmQ").html("delete <span style='font-size:1.3em'>\""+$("#CurrentForm").find(".name").text()+"\"?</span> this cannot be undone");
    //     blurElement($("#CurrentForm"),".c");
    //     var check = setInterval(function(){
    //         if (confirmBool!=undefined){
    //             if (confirmBool){
    //                 blurElement($("#CurrentForm"),"#loading");
    //                 confirmBool=undefined;
    //                 clearInterval(check);
    //                 $(".c").remove();
    //                 $.ajax({
    //                     url:"/php/launchpad/practitioner/delete-form.php",
    //                     method:"POST",
    //                     data:{
    //                         UID:UID,
    //                         why:"because"
    //                     },
    //                     success:function(data){
    //                         if (data=="true"){
    //                             blurElement($("#CurrentForm"),"#checkmark");
    //                             setTimeout(function(){
    //                                 location.reload(true);
    //                             },1000)
    //                         }else{
    //                             $("#CurrentForm").html("Error deleting form"+data);
    //                         }
    //                     }
    //                 })
    //             }else{
    //                 unblurElement($("#CurrentForm"));
    //                 confirmBool=undefined;
    //                 clearInterval(check);
    //                 $(".c").remove();
    //             }
    //         }
    //     },50);
    // }
    // else if (dest=='formPreview'){
    //     var PreviewForm = window.open('/portal/medicalforms/preview-form', 'PreviewForm', 'menubar=no,titlebar=no');
    // }
    // // else if (dest=="serviceEdit"){
    // //     blurElement($("body"),"#EditService");
    // //     $("#EditService").find("h2").text("Edit \""+$("#CurrentService").find(".name").text()+"\" Service Details");
    // //     var service = $("#CurrentService").find(".name").data("json");
    // //     var form = $("#EditServiceForm");
    // //     $.each(service,function(question,answer){
    // //         if (!$.isArray(answer)){
    // //             var item = form.find(".item").filter(function(){
    // //                 return $(this).children('.question').find(".q").text() == question;
    // //             });
    // //             var type = item.data('type');
    // //             if ($.inArray(type,['text','text box'])>-1){
    // //                 item.find("input, textarea").val(answer);
    // //             }
    // //             else if ($.inArray(type,['checkboxes','radio'])>-1){
    // //                 answer = answer.split("***");
    // //                 item.find("li").filter(function(){
    // //                     return $.inArray($(this).data('value'),answer)>-1;;
    // //                 }).click();
    // //             }
    // //             else if (type=="number"){
    // //                 answer = answer.split(" ")[0];
    // //                 item.find("input").val(answer);
    // //             }
    // //         }
    // //         if (question=="combine"){
    // //             $.each(answer,function(qFU,aFU){
    // //                 var i = form.find(".itemFU").filter(function(){
    // //                   return $(this).find(".q").text() == qFU;  
    // //                 }), type = i.data("type");
    // //                 if ($.inArray(type,['checkboxes','radio'])>-1){
    // //                     aFU = aFU.split("***");
    // //                     i.find("li").filter(function(){
    // //                         return $.inArray($(this).data('value'),aFU)>-1;;
    // //                     }).click();
    // //                 }
    // //                 else if (type=="number"){
    // //                     aFU = aFU.split(" ")[0];
    // //                     i.find("input").val(aFU);
    // //                 }
    // //                 /*aFU = aFU.split(" ")[0];
    // //                 i.find("input").val(aFU);*/
    // //             })
    // //         }
    // //     });
    // //     var name = $("#CurrentService").find(".name").text();
    // //     var q = $("#EditService").find(".itemFU").filter(function(){
    // //         return $(this).find(".q").text() == "Which services can this combine with?";
    // //     });
    // //     q.find("li").filter(function(){return $(this).data('value') == name;}).hide();
    // //     q.find("li").filter(function(){return $(this).data('value') !== name;}).show();
    // // }
    // else if (dest=="serviceDelete"){
    //     var UID = $("#CurrentService").find(".name").data('serviceid');
    //     if (UID==undefined){
    //         return false;
    //     }
    //     confirm($(this),"below","");
    //     $(".confirmQ").html("delete <span style='font-size:1.3em'>\""+$("#CurrentService").find(".name").text()+"\"?</span> this cannot be undone");
    //     blurElement($("#CurrentService"),".c");
    //     var check = setInterval(function(){
    //         if (confirmBool!=undefined){
    //             if (confirmBool){
    //                 blurElement($("#CurrentService"),"#loading");
    //                 confirmBool=undefined;
    //                 clearInterval(check);
    //                 $(".c").remove();
    //                 $.ajax({
    //                     url:"/php/launchpad/practitioner/delete-service.php",
    //                     method:"POST",
    //                     data:{
    //                         ServiceID:UID,
    //                         why:"because"
    //                     },
    //                     success:function(data){
    //                         if (data=="true"){
    //                             blurElement($("#CurrentService"),"#checkmark");
    //                             setTimeout(function(){
    //                                 location.reload(true);
    //                             },1000)
    //                         }else{
    //                             $("#CurrentService").html("Error deleting code"+data);
    //                         }
    //                     }
    //                 })
    //             }else{
    //                 unblurElement($("#CurrentService"));
    //                 confirmBool=undefined;
    //                 clearInterval(check);
    //                 $(".c").remove();
    //             }
    //         }
    //     },50)
    // }
    // else if (dest=="newService"){
    //     $("#NewServiceBtn").click();
    // }
    // else if (dest=="codeEdit"){
    //     blurElement($("body"),"#EditCode");
    //     $("#EditCode").find("h2").text("Edit \""+$("#CurrentCode").find(".name").text()+"\" Code Details");
    //     var code = $("#CodeList").find("tr").not(".head").filter(function(){
    //         return $(this).data("codeid") == $("#CurrentCode").find('.name').data("codeid");
    //     }), num = code.find('.code').text(), type = code.find(".type").text(), desc = code.find(".description").text();
    //     var form = $("#EditCodeForm");
    //     form.find(".item").filter(function(){return $(this).find(".q").text().includes("Code Type")}).find("li").filter("[data-value='"+type+"']").click();
    //     form.find(".item").filter(function(){return $(this).find(".q").text().includes("Enter Code")}).find("input").val(num);
    //     form.find(".item").filter(function(){return $(this).find(".q").text().includes("Code Description")}).find("textarea").val(desc);
    // }
    // else if (dest=="codeDelete"){
    //     var UID = $("#CurrentCode").find(".name").data('codeid');
    //     if (UID==undefined){
    //         return false;
    //     }
    //     confirm($(this),"below","");
    //     $(".confirmQ").html("delete <span style='font-size:1.3em'>\""+$("#CurrentCode").find(".name").text()+"\"?</span> this cannot be undone");
    //     blurElement($("#CurrentCode"),".c");
    //     var check = setInterval(function(){
    //         if (confirmBool!=undefined){
    //             if (confirmBool){
    //                 blurElement($("#CurrentCode"),"#loading");
    //                 confirmBool=undefined;
    //                 clearInterval(check);
    //                 $(".c").remove();
    //                 $.ajax({
    //                     url:"/php/launchpad/practitioner/delete-code.php",
    //                     method:"POST",
    //                     data:{
    //                         CodeID:UID,
    //                         why:"because"
    //                     },
    //                     success:function(data){
    //                         if (data=="true"){
    //                             blurElement($("#CurrentCode"),"#checkmark");
    //                             setTimeout(function(){
    //                                 location.reload(true);
    //                             },1000)
    //                         }else{
    //                             $("#CurrentCode").html("Error deleting code"+data);
    //                         }
    //                     }
    //                 })
    //             }else{
    //                 unblurElement($("#CurrentCode"));
    //                 confirmBool=undefined;
    //                 clearInterval(check);
    //                 $(".c").remove();
    //             }
    //         }
    //     },50)
    // }
    // else if (dest=="codeNew"){
    //     $("#NewCodeBtn").click();
    // }
    // else if (dest=='codesView'){
    //     var codes = $(this).closest(".optionsNav").find(".name").data("codes").split(", ").join(" "), name = $(this).closest(".optionsNav").find(".name").text();
    //     if ($("#CodeListModal").length===0){
    //         blurElement($(this.closest(".optionsNav"),"#loading"));
    //         var btn = $(this);
    //         //setTimeout(function(){
    //           //  btn.click();
    //         //},100)
    //         return false;
    //     }
    //     blurElement($("body"),"#CodeListModal");
    //     $("#CodeListCLM").removeClass("active");
    //     $("#CodeListModal").find(".tableSearch").val(codes);
    //     $("#CodeListModal").find("h4, .filterType, .button").hide();
    //     var h4 = $("<h4>Listed Codes for "+name+"</h4>");
    //     h4.insertBefore($("#CodeListModal").find("h4"));
    //     $("#CodeListModal").find(".cancel").show().on('click',function(){
    //         setTimeout(function(){$("#CodeListModal").find("h4, .filterType, .button").show();},500)
    //         h4.remove();
    //     })
    //     filterTableList($("#CodeListCLM"));
    // }
    // else if (dest=="diagnosisEdit"){
    //     blurElement($("body"),"#EditDiagnosis");
    //     var diagnosis = $("#CurrentDiagnosis").find(".name").data("json");
    //     var form = $("#EditDiagnosisForm");
    //     $.each(diagnosis,function(question,answer){
    //         if (question!=="options"){
    //             var i = form.find(".item, .itemFU").filter(function(){
    //                 return $(this).children(".question").find(".q").text() == question;
    //             })
    //             fillAnswer(i,answer);
    //         }
    //         else{
    //             $.each(answer,function(q,a){
    //                 var i = form.find(".item, .itemFU").filter(function(){
    //                     return $(this).children(".question").find(".q").text() == q;
    //                 })
    //                 fillAnswer(i,a);
    //             })
    //         }
    //     })
    // }
    // else if (dest=="diagnosisDelete"){
    //     var UID = $("#CurrentDiagnosis").find(".name").data('diagnosisid');
    //     if (UID==undefined){
    //         return false;
    //     }
    //     confirm($(this),"below","");
    //     $(".confirmQ").html("delete <span style='font-size:1.3em'>\""+$("#CurrentDiagnosis").find(".name").text()+"\"?</span> this cannot be undone");
    //     blurElement($("#CurrentDiagnosis"),".c");
    //     var check = setInterval(function(){
    //         if (confirmBool!=undefined){
    //             if (confirmBool){
    //                 blurElement($("#CurrentDiagnosis"),"#loading");
    //                 confirmBool=undefined;
    //                 clearInterval(check);
    //                 $(".c").remove();
    //                 $.ajax({
    //                     url:"/php/launchpad/practitioner/delete-diagnosis.php",
    //                     method:"POST",
    //                     data:{
    //                         DiagnosisID:UID,
    //                         why:"because"
    //                     },
    //                     success:function(data){
    //                         if (data=="true"){
    //                             console.log(data);
    //                             blurElement($("#CurrentDiagnosis"),"#checkmark");
    //                             setTimeout(function(){
    //                                 //location.reload(true);
    //                             },1000)
    //                         }else{
    //                             $("#CurrentDiagnosis").html("Error deleting code"+data);
    //                         }
    //                     }
    //                 })
    //             }else{
    //                 unblurElement($("#CurrentDiagnosis"));
    //                 confirmBool=undefined;
    //                 clearInterval(check);
    //                 $(".c").remove();
    //             }
    //         }
    //     },50)
    // }
    // else if (dest=='diagnosisNew'){
    //     $("#NewDiagnosisBtn").click();
    // }
    // else if (dest=='complaintEdit'){
    //     blurElement($("body"),"#EditComplaint");
    //     var complaint = $("#CurrentComplaint").find(".name").data("json");
    //     var form = $("#EditChiefComplaint");
    //     $.each(complaint,function(question,answer){
    //         if (question!=="options"){
    //             var i = form.find(".item, .itemFU").filter(function(){
    //                 return $(this).children(".question").find(".q").text() == question;
    //             })
    //             fillAnswer(i,answer);
    //         }
    //         else{
    //             $.each(answer,function(q,a){
    //                 var i = form.find(".item, .itemFU").filter(function(){
    //                     return $(this).children(".question").find(".q").text() == q;
    //                 })
    //                 fillAnswer(i,a);
    //             })
    //         }
    //     })
    // }
    // else if (dest=='complaintDelete'){
    //     var UID = $("#CurrentComplaint").find(".name").data('complaintid');
    //     if (UID==undefined){
    //         return false;
    //     }
    //     confirm($(this),"below","");
    //     $(".confirmQ").html("delete <span style='font-size:1.3em'>\""+$("#CurrentComplaint").find(".name").text()+"\"?</span> this cannot be undone");
    //     blurElement($("#CurrentComplaint"),".c");
    //     var check = setInterval(function(){
    //         if (confirmBool!=undefined){
    //             if (confirmBool){
    //                 blurElement($("#CurrentComplaint"),"#loading");
    //                 confirmBool=undefined;
    //                 clearInterval(check);
    //                 $(".c").remove();
    //                 $.ajax({
    //                     url:"/php/launchpad/practitioner/delete-complaint.php",
    //                     method:"POST",
    //                     data:{
    //                         ComplaintID:UID,
    //                         why:"because"
    //                     },
    //                     success:function(data){
    //                         if (data=="true"){
    //                             blurElement($("#CurrentComplaint"),"#checkmark");
    //                             setTimeout(function(){
    //                                 location.reload(true);
    //                             },1000)
    //                         }else{
    //                             $("#CurrentComplaint").html("Error deleting code"+data);
    //                         }
    //                     }
    //                 })
    //             }else{
    //                 unblurElement($("#CurrentComplaint"));
    //                 confirmBool=undefined;
    //                 clearInterval(check);
    //                 $(".c").remove();
    //             }
    //         }
    //     },50)
    // }
    // else if (dest=='complaintNew'){
    //     $("#NewComplaintBtn").click();
    // }
    // else if (dest=='patientNew'){}
    // else if (dest=='patientEdit'){
    //     blurElement($("body"),"#EditPatient");
    //     var complaint = $("#CurrentPatient").find(".name").data("json");
    //     var form = $("#EditPatientForm");
    //     $.each(complaint,function(question,answer){
    //         if (question!=="options"){
    //             var i = form.find(".item, .itemFU").filter(function(){
    //                 return $(this).children(".question").find(".q").text() == question;
    //             })
    //             fillAnswer(i,answer);
    //         }
    //         else{
    //             $.each(answer,function(q,a){
    //                 var i = form.find(".item, .itemFU").filter(function(){
    //                     return $(this).children(".question").find(".q").text() == q;
    //                 })
    //                 fillAnswer(i,a);
    //             })
    //         }
    //     })
    // }
    // else if (dest=='patientDelete'){
    //     var UID = $("#CurrentPatient").find(".name").data('patientid');
    //     if (UID==undefined){
    //         return false;
    //     }
    //     confirm($(this),"below","");
    //     $(".confirmQ").html("delete <span style='font-size:1.3em'>\""+$("#CurrentPatient").find(".name").text()+"\"?</span> this cannot be undone");
    //     blurElement($("#CurrentPatient"),".c");
    //     var check = setInterval(function(){
    //         if (confirmBool!=undefined){
    //             if (confirmBool){
    //                 blurElement($("#CurrentPatient"),"#loading");
    //                 confirmBool=undefined;
    //                 clearInterval(check);
    //                 $(".c").remove();
    //                 $.ajax({
    //                     url:"/php/launchpad/practitioner/delete-patient.php",
    //                     method:"POST",
    //                     data:{
    //                         PatientID:UID,
    //                         why:"because"
    //                     },
    //                     success:function(data){
    //                         if (data=="true"){
    //                             //$("#CurrentPatient").html("Patient deleted! Select another patient to proceed.");
    //                             blurElement($("#CurrentPatient"),"#checkmark");
    //                             setTimeout(function(){
    //                                 location.reload(true);
    //                             },1000)
    //                         }else{
    //                             $("#CurrentPatient").html("Error deleting patient"+data);
    //                         }
    //                     }
    //                 })
    //             }else{
    //                 unblurElement($("#CurrentPatient"));
    //                 confirmBool=undefined;
    //                 clearInterval(check);
    //                 $(".c").remove();
    //             }
    //         }
    //     },50)
    // }
    // else if (dest=='usernameChange'){
    //     blurElement($("body"),"#ChangeUsername");
    // }
    // else if (dest=='resetPW'){
    //     blurElement($("body"),"#PasswordReset");
    //     $("#PasswordReset").find(".username").text($("#CurrentPatient").find(".name").text());
    // }
    // else if (dest=='resetSecQ'){
    //     blurElement($("body"),"#SecurityQuestionReset");
    //     $("#SecurityQuestionReset").find(".username").text($("#CurrentPatient").find(".name").text());
    // }
}
function optionsNavOverflowCheck(){
    $(".optionsNav").each(function(){
        var bar = $(this).find(".optionsBar"),
            w1 = bar.outerWidth(),
            w2 = $(this).outerWidth();
            if (w1 > w2){
                console.log("RESIZE");
                // return false;
                bar.css({
                    whiteSpace:"normal"
                })
            }
    })
}

function SecurityReset(elem,value){
    blurModal(elem,"#loading");
    console.log(value);
    $.ajax({
        url:"/php/launchpad/practitioner/security-reset.php",
        method:"POST",
        data:{
            SecurityReset:value
        },
        success:function(data){
            //console.log(data);
            if (data){
                blurModal(elem,"#checkmark");
                setTimeout(function(){
                    unblurElem($("body"));
                },1000)
              //  console.log("SUCCESS");
            }else{
                //console.log("FAIL");
            }
        }
    })

}

$(window).on("resize",resizeElements);
var splits = $(".split50, .split60, .split40"), leftOnly = splits.find(".leftOnly"), rightOnly = splits.find(".rightOnly");
function resizeSplits(){
    var bodyWidth = $("body").outerWidth();
    if (bodyWidth < 700){
        splits.addClass("break");
        leftOnly.removeClass('leftOnly');
        rightOnly.removeClass('rightOnly');
    }else{
        splits.removeClass("break");
        leftOnly.addClass('leftOnly');
        rightOnly.addClass('rightOnly');
    }
}
function resizeQuotes(){
    $(".quote").each(function(){
        var h = $(this).outerHeight();
        $(this).closest(".quoteBlock").css("height","calc("+h.toString()+"px + 11em)");
    })
}
function resizeFooterPadding(){
    var h = $("footer").outerHeight();
    $("body").css("padding-bottom",h);
}
var menuWidth;
function resizeMobileMenuAndFooter(){
    var tabs = $("#SiteMenu").find("div").not("#MobileMenu, #MenuToggle, #MenuDisplay");
    if (!$("#SiteMenu").hasClass("mobile")){
        menuWidth = $("#SiteMenu").outerWidth();
    }
    var w = $("body").width(),  p = menuWidth / w;
    if (p > 0.6){
        $("#SiteMenu").addClass("mobile");
        tabs.appendTo("#MenuDisplay");
    }else{
        $("#SiteMenu").removeClass("mobile");
        tabs.appendTo("#SiteMenu");
        $("#SiteMenu").find(".dropDown").removeClass("active");
    }
    if (w < 480){$("footer").find(".logo, .icons, .contact, .hours").addClass("mobile");}
    else if (w < 750){
        $("footer").find(".logo, .icons").addClass("mobile");
        $("footer").find(".contact, .hours").removeClass("mobile");
    }
    else {$("footer").find(".logo, .icons, .contact, .hours").removeClass("mobile");}
}
$("#MenuToggle").on("click",function(){
    var b = $("#MobileMenu").hasClass("active");
    if (!b){
        $("#MobileMenu, #MenuDisplay").addClass("active");
        $(window).on("mousedown scroll",listenMobileMenuExit);
    }else{
        $("#MenuDisplay").removeClass("active");
        setTimeout(function(){
            $("#MobileMenu").removeClass("active");
            $("#SiteMenu").find(".dropDown, .underline").removeClass("active");
            $(window).off("mousedown scroll",listenMobileMenuExit);            
        },500)
    }
})
function listenMobileMenuExit(e){
    if (!$(e.target).is(".tab, .title, .dropdown, li, #MenuToggle")){
        $("#MenuToggle").click();
    }
}

function resizeFont(){
    var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0), fontSize;
    // console.log("WIDTH "+ w);
    if (w >= 1000){fontSize = "16px";}
    else if (w >= 800){fontSize = "15px";}
    else if (w >= 600){fontSize = "14px";}
    else if (w >= 400){fontSize = "13px";}
    else{fontSize = "12px";}
    $("body").css("font-size",fontSize);
}

var timer;
function resizeElements(){
    clearTimeout(timer);
    timer = setTimeout(function(){
        resizeFont();
        resizeSplits();
        resizeQuotes();
        resizeMobileMenuAndFooter();
        resizeFooterPadding();
        optionsNavOverflowCheck();
    },100)
}

function followLink(){
    var t = $(this).data("target");
    window.location.href = t;
}
function plural(model){
    model = model.toLowerCase();
    model += "s";
    return model;
}
function singular(model){
    model = model.toLowerCase();
    model = model.slice(0, -1);
    return model;
}

var loadingRing = "<div class='lds-ring dark'><div></div><div></div><div></div><div></div></div>", loadingRingCSS = {top:"50%",transform:"translate(-50%,-50%)"};

$(document).ready(function(){
    resizeElements();
    if ($("#LoggedOut").length>0){
        setTimeout(function(){
            slideFadeOut($("#LoggedOut"));
        },2000)
    }
    $(".booknow").addClass("link").data("target","/booknow");
    $(".link").on("click",followLink);
})
