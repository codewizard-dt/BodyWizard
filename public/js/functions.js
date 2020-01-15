$(".jump").on("click",function(){
    var target = "#"+$(this).data("target");
    $.scrollTo(target);
});

var systemModalList = ['Confirm','Warn','Error','Feedback','Refresh','Notification'],
    systemModals = $('#Confirm, #Warn, #Error, #Feedback, #Refresh, #Notification'), usertype,
    defaultTemplateInfo;



(function($) {
    $.sanitize = function(input) {
        var output = input.replace(/<script[^>]*?>.*?<\/script>/gi, '').
                     replace(/<[\/\!]*?[^<>]*?>/gi, '').
                     replace(/<style[^>]*?>.*?<\/style>/gi, '').
                     replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
        return output;
    };
})(jQuery);

$.fn.slideFadeOut = function (time = 400, callback = null) {
    slideFadeOut(this, time, callback);
    return this;
};
$.fn.slideFadeIn = function (time = 400, callback = null) {
    slideFadeIn(this, time, callback);
    return this;
};
$.fn.resetActives = function (){
    this.find('.active').removeClass('active');
    return this;
}

function confirmJson(data){
    var json;
    try{
        json = JSON.parse(data);
    }catch(e){
        if (typeof data != 'object'){
            alert('invalid json, functions.js 38');
            json = "not valid JSON";
        }else{
            json = data;
        }
    }
    return json;
}

// Elements must have data-order attributes already set
jQuery.fn.sortEle = function sortEle(eleStr = "div") {
    $("> "+eleStr, this[0]).sort(dec_sort).appendTo(this[0]);
    function dec_sort(a, b){ return ($(b).data("order")) < ($(a).data("order")) ? 1 : -1; }
}

function commaSeparated (arr, quotes = false) {
    if (quotes){
        $.each(arr,function(a,item){
            arr[a] = "'"+arr[a]+"'";
        });
    }
    var last = arr.pop();
    if (arr.length == 0){
        return last;    
    }else if (arr.length == 1){
        return arr.join(', ') + ' and ' + last;    
    }else{
        return arr.join(', ') + ', and ' + last;
    }
}

function getUsertype(){
    return $("#uidList").data('usertype');
}

function filterUninitialized(selector,debug = false){
    var uninitialized, obj;
    if (selector instanceof jQuery){obj = selector;}
    else if(typeof selector == 'string'){obj = $(selector);}
    else {return false;}
    uninitialized = obj.filter(function(){
        return !$(this).data('initialized');
    });
    if (debug){
        var alreadyInitialized = obj.not(uninitialized);
        if (alreadyInitialized.length > 0){
            console.log(selector,'already initialized',obj.not(uninitialized).length);
        }else{
            console.log(selector,'none already initialized');
        }
        
    }
    return uninitialized;
}
function filterByData(selector,key,value){
    var matches, obj;
    if (selector instanceof jQuery){obj = selector;}
    else if(typeof selector == 'string'){obj = $(selector);}
    else {return false;}
    matches = obj.filter(function(){
        if ($.inArray(value,['unset','null','undefined',false,"false"]) > -1){
            return !$(this).data(key);
        }else{
            return $(this).data(key) === value;
        }
    });
    return matches;
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
function randomArrayElement(array){
    return array[Math.floor(Math.random() * array.length)];
}
function randomArrayElements(array,number){
    var count = array.length, newArray = [], newEle = null;
    if (number > count){
        alert('cannot select '+number+" elements from an array of "+count+" items");
        return false;
    }
    do {
        newEle = randomArrayElement(array);
        if ($.inArray(newEle, array) === -1){
            newArray.push(newEle);
        }
    } while (newArray.length < number);
}
var uidList, tabList, tabHeaderInfo = {};
$.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
        },
        dataFilter: function(data,type){
            data = data.trim();
            var returnData = data;
            try{
                var json = JSON.parse(data);
                if (json.uidList != undefined){$("#uidList").text(JSON.stringify(json.uidList));}
                if (json.tabList != undefined){$("#tabList").text(JSON.stringify(json.tabList));}
                if (json.message != undefined){returnData = json.message;}
                if (json.notifications != undefined){console.log(json.notifications);}
            }catch(e){
            }
            return returnData;
        }
});
var SystemModalBtnFlash;
$(document).ajaxSuccess(function(ev,xhr,settings){
    var text = xhr.responseText;
    if (text.trim() == "no changes"){
        $("#Feedback").find(".message").html("<h2>No Changes</h2><div>There was no update performed because there were <u>no changes.</u></div>");
        blurTopMost("#Feedback");
    }else if (text.includes("<h2>Notifications</h2>")){
        // console.log('notifications');
    }else{
        // console.log("AJAX BABY!!!",xhr);
    }
})
$(document).ajaxError(function(ev,xhr,settings,error){
    if (error !== 'abort'){
        console.log(error);
        console.log(xhr);
        var status = xhr.status,
            message = (xhr.responseJSON != undefined) ? xhr.responseJSON.message : error,
            modal = "#Error";

        if ($.inArray(status, [419, 401]) > -1){
            modal = "#Refresh";
            blurTopMost(modal);
            setTimeout(function(){
                location.reload();
            },1500);
        }else if (status === 404){
            $(modal).find('.message').html("<h2>Not Found</h2><div>The content you asked for is not available</div>");
            $(modal).find(".submit").data('error',xhr);
            blurTopMost(modal);
        }else if (status == 422){
            if ($("#Feedback").length == 0){
                $("<div/>",{
                    id: "Feedback",
                    class:'prompt',
                    html: "<div class='message'></div><div class='options'><div class='button small cancel'>dismiss</div></div>"
                }).appendTo("#ModalHome");                
            }
            var msg = $("#Feedback").find(".message");
            errorJson = xhr.responseJSON;
            msg.html("");
            $("<h2>Login Error</h2><div class='split3366KeyValues'></div>").appendTo(msg);
            $.each(errorJson.errors, function(key,value){
                $("<div class='label'>"+key+"</div><div class='value'>"+value+"</div>").appendTo(msg.find(".split3366KeyValues"));
            });
            blurElement($("body"),"#Feedback");
        }else{
            $(modal).find(".submit").data('error',xhr);
            $(modal).find(".message").html("<h2>Error</h2><div>"+message+"</div>");
            blurTopMost(modal);
        }
        // blurTopMost(modal);
        var btn = $(modal).find(".submit");
        SystemModalBtnFlash = setInterval(function(){
            btn.toggleClass("pink70 pink");
        },500);

    }
})

function submitErrorReport(){
    console.log($("#Error").find(".submit").data('error'));
}
function updateUidList(uidList = null){
    if (uidList){
        $("#uidList").text(uidList);
    }else{
        $.ajax({
            url:"/getvar",
            method:"POST",
            data:{
                "getVar":"uidList"
            },
            success:function(data){
                $("#uidList").text(data);
            }
        })

    }
}
function setUid(model, uid){
    try{
        uidList = JSON.parse($("#uidList").text());
        if (uidList == null){uidList = {};};
    }catch(e){
        uidList = {};
    }
    uidList[model] = uid;
    $("#uidList").text(JSON.stringify(uidList));
}
function getUids(model = null){
    try{
        var uidList = JSON.parse($("#uidList").text());
        if (uidList == null){return null;}
        else if (model == null){return uidList;}
        else if (uidList[model] == undefined){return null;}
        else{return uidList[model];}        
    }catch(e){
        return null;
    }
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
function formatDate(jsDateObj) {
      var day = jsDateObj.getDate(), monthIndex = jsDateObj.getMonth() +1, year = jsDateObj.getFullYear();
      return monthIndex + "/"+ day + '/' + year;
}
function formatTime(jsDateObj){
    var hour = jsDateObj.getHours(), mins = jsDateObj.getMinutes(), meridian = (hour - 11 > 0) ? "pm" : "am";
    if (mins == "0"){mins = "00";}
    if (hour > 12){hour = hour - 12;}
    return hour + ":" + mins + meridian;
}


// EMAIL PHONE USERNAME FUNCTIONS
    function validateUsername(){
        // console.log("HI");
        var i = $(this);
        var val = i.val();
        var m = val.match(/[^a-zA-Z0-9._\-]/);
        val = val.replace(/[^a-zA-Z0-9._\-]/g,"");
        if (i.val()!=val){
            i.off("keyup",validateUsername);
            i.val(val);
            var alertStr = (m == " ") ? "no spaces allowed" : m + " is not allowed";
            alertBox(alertStr,i,"after",800);
            setTimeout(function(){
                i.on("keyup",validateUsername);
            },801)
        }
    }
    function finalizeUsername(i){
        var val = i.val();
        if (val.length !=0 && (val.length < 5 || val.length > 15)){
            i.off("focusout",finalizeUsername);
            // $(this).val(val);
            alertBox('must be between 5 and 15 characters',i,"after",800);
            scrollToInvalidItem(i);
            // setTimeout(function(){
            //     i.on("focusout",finalizeUsername);
            // },801)
            return false;
        }
        return true;
    }
    function validateEmail(){
        var val = $(this).val(), i = $(this);
        var m = val.match(/[^a-zA-Z0-9@._\-]/);
        val = val.replace(/[^a-zA-Z0-9@._\-]/g,"");
        if ($(this).val()!=val){
            i.off("keyup",validateEmail);
            $(this).val(val);
            alertBox(m+" is an invalid character",$(this),"after",800);
            setTimeout(function(){
                i.on("keyup",validateEmail);
            },801)
        }
    }
    function finalizeEmail(i){
        var val = i.val();
        var pattern = /[a-zA-Z0-9._\-]*@[a-zA-Z0-9._\-]*\.[a-zA-Z0-9.]*/;
        if (!pattern.test(val)){
            // i.off("keyup",validateEmail);
            // $(this).val(val);
            scrollToInvalidItem(i);
            alertBox('enter a valid email',i,"after",800);
            // setTimeout(function(){
            //     i.on("keyup",validateEmail);
            // },801)
            return false;
        }
        return true;
    }
    function validatePhone(){
        var i = $(this), val = i.val();
        var m = val.match(/[^0-9.()-]/);
        val = val.replace(/[^0-9.()-]/g,"");
        if ($(this).val()!=val){
            i.off("keyup",validatePhone);
            $(this).val(val);
            alertBox("numbers only",$(this),"after",800);
            setTimeout(function(){
                i.on("keyup",validatePhone);
            },801)
        }
    }
    function finalizePhone(i){
        var val = i.val();
        var digits = val.match(/\d/g);
        if (digits != null && digits.length!=10){
            // i.off("keyup",validatePhone);
            scrollToInvalidItem(i);
            alertBox("invalid phone number",i,"after",800);
            // setTimeout(function(){
            //     i.on("keyup",validatePhone);
            // },801);
            return false;
        }else if (digits != null){
            var ph = digits[0]+digits[1]+digits[2]+"-"+digits[3]+digits[4]+digits[5]+"-"+digits[6]+digits[7]+digits[8]+digits[9];
            i.val(ph);
            return true;
        }else{
            alertBox("required",i,"after",800);
            return false;
        }
    }
    function checkPasswordStrength(i){
        var pw = i.val(), errors = [];
        if (!/[a-z]/.test(pw)){
            errors.push('Password must contain a lower case letter.');
        }
        if (!/[A-Z]/.test(pw)){
            errors.push('Password must contain an upper case letter.');
        }
        if (!/[0-9]/.test(pw)){
            errors.push('Password must contain a number.');
        }
        if (pw.length < 5){
            errors.push('Password must be at least 6 characters.');
        }
        if (errors.length == 0){
            return true;
        }else{
            str = errors.join("<br>");
            feedback("Attention",str);
            return false;
        }
    }

function feedback(header, message, delay = null){
    $("#Feedback").find('.message').html("<h2>"+header+"</h2><div>"+message+"</div>");
    if (delay != null){
        setTimeout(function(){
            blurTopMost("#Feedback");            
        },delay);
    }else{
        blurTopMost("#Feedback");   
    }
}
function confirm(header, message, yesText = null, noText = null, delay = null){
    $("#Confirm").find('.message').html("<h2 class='purple'>"+header+"</h2><div>"+message+"</div>");
    if (yesText){$("#Confirm").find(".confirmY").text(yesText);}
    else{$("#Confirm").find(".confirmY").text("confirm");}
    if (noText){$("#Confirm").find(".confirmN").text(noText);}
    else{$("#Confirm").find(".confirmN").text("cancel");}

    if (delay != null){
        setTimeout(function(){
            blurTopMost("#Confirm");            
        },delay);
    }else{
        blurTopMost("#Confirm");   
    }
}

function alertBox(message, ele, where = 'below', time = 1500, offset = null){
    var hEle = ele.outerHeight(), wEle = ele.outerWidth(), wrap, wAlert, hAlert, readonly = ele.attr('readonly'), css;
    if (time=="nofade"){
        wrap = $('<span class="zeroWrap a"><span class="alert">'+message+'</span></span>');
        time = 0;
    }else{
        wrap = $('<span class="zeroWrap a f"><span class="alert f">'+message+'</span></span>');
    }

    if ($.inArray(ele.css('position'), ['fixed','absolute','relative']) == -1){
        ele.css('position','relative');
    }
    wrap.appendTo("body");
    wAlert = wrap.find('.alert').outerWidth();
    hAlert = wrap.find('.alert').outerHeight();
    if (where=="after"){
        // wrap.insertAfter(ele).height(hEle);
        wrap.appendTo(ele);
        css = {top:0.5*hEle,right:-5};
    }else if (where=="ontop"){
        // wrap.insertBefore(ele).height(hEle);
        wrap.appendTo(ele);
        css = {top:0.5*hEle,left:0.5*wEle};
    }else if (where=="before"){
        // wrap.insertBefore(ele).height(hEle);
        wrap.appendTo(ele);
        css = {top:0,left:-wAlert-5};
        // wEle = wrap.find(".alert").outerWidth();
        // wrap.find(".alert").css("left","-"+wEle+"px");
    }else if (where=="above"){
        // wrap.insertBefore(ele).height(hEle);
        wrap.appendTo(ele);
        css = {left:0,top:-hAlert-5};
        // wAlert = 0.5 * wEle - 0.5 * $(wrap).find(".alert").outerWidth(true);
        // var hA = $('.alert').outerHeight();
        // wrap.find(".alert").css({"top":"-"+hA+"px","left":wAlert+"px"});
    }else if (where=="below"){
        // wrap.insertBefore(ele).height(hEle);
        wrap.appendTo(ele);
        css = {left:0,bottom:-hAlert};
        // wAlert = 0.5 * wEle - 0.5 * $(wrap).find(".alert").outerWidth(true);
        // wrap.find(".alert").css({"top":2*hEle+"px","left":wAlert+"px"});
    }
    wrap.css(css);

    if (offset!==null){
        $(".alert").css("transform","translate("+offset+")");
    }
    
    if (ele.is('ul')){
        var bgColor = (ele.data('bgColor') != undefined) ? ele.data('bgColor') : ele.css('background-color');
        ele.data('bgColor',bgColor);
        ele.css('background-color','rgb(234,78,80)');
        setTimeout(function(){
            ele.css("background-color",bgColor);
        },time)
    }else{
        var borderColor = (ele.data('borderColor') != undefined) ? ele.data('borderColor') : ele.css('border-color');
        ele.data('borderColor',borderColor);
        ele.css("border-color","rgb(234,78,80)").attr("readonly","true");
        setTimeout(function(){
            ele.css("border-color",borderColor);
            if (readonly != undefined){
                ele.attr('readonly',readonly);
            }else{
                ele.removeAttr("readonly");
            }
        },time)

    }

    setTimeout(function(){
        $(".zeroWrap.a.f, .alert.f").fadeOut(600,function(){$(this).remove();})        
    },time)
        
}
// function confirmBox(str,What,Where,Fade,Offset){
//     var h = What.outerHeight(true), w = What.outerWidth(true), ele, w2;
//     if (Fade=="nofade"){
//         ele = $('<span class="zeroWrap c"><span class="confirm">'+str+'</span></span>');
//     }else{
//         ele = $('<span class="zeroWrap c f"><span class="confirm f">'+str+'</span></span>');
//     }
//     if (Where=="after"){
//         ele.insertAfter(What).height(h);
//     }
//     else if (Where=="ontop"){
//         ele.insertBefore(What).height(h);
//     }
//     else if (Where=="before"){
//         ele.insertBefore(What).height(h);
//         w = ele.find(".confirm").outerWidth();
//         ele.find(".confirm").css("left","-"+w+"px");
//     }
//     else if (Where=="above"){
//         ele.insertBefore(What).height(h);
//         w2 = 0.5*w-0.5*$(ele).find(".confirm").outerWidth(true);
//         ele.find(".confirm").css({"top":"-"+h+"px","left":w2+"px"});
//     }    
//     else if (Where=="below"){
//         ele.insertBefore(What).height(h);
//         w2 = 0.5*w-0.5*$(ele).find(".confirm").outerWidth(true);
//         ele.find(".confirm").css({"top":2*h+"px","left":w2+"px"});
//     }
//     else if (Where=="append"){
//         ele.appendTo(What).height(h);
//     }
//     else {
//         ele.insertAfter(What).height(h);
//     }
//     if (Offset!==null){
//         $(".confirm").css("transform","translate("+Offset+")");
//     }

    
//     var BC = What.css("border-color");
//     What.css("border-color","rgb(46, 107, 53)");
//     setTimeout(function(){
//         What.css("border-color",BC);
//         What.focus();
//     },1500)

//     setTimeout(function(){
//         $(".zeroWrap.c.f, .confirm.f").fadeOut(600,function(){$(this).remove();})        
//     },1500)
// }

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
    console.log('dont use this  setSessionVar!');
    alert("fix me setSessionVar!");
    // $.ajax({
    //     url:"/setvar",
    //     method:"POST",
    //     data:KeysValuesObj,
    //     success:function(data){
    //         // console.log(data);
    //     }
    // })
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

function slideFadeOut(elem,time = 400,callback = null) {
    var t = "opacity "+time+"ms";
    var fade = { opacity: 0, transition: t };
    if (elem.length==1){
        elem.css(fade).delay(100).slideUp(time);
    }else if (elem.length>1){
        elem.each(function(){
            $(this).css(fade).delay(100).slideUp(time);
        })
    }
    if (callback){
        setTimeout(callback,time+101);
    }
}
function slideFadeIn(elem,time = 400,callback = null){
    var t = "opacity "+time+"ms";
    var solid = {opacity: 1, transition: t};
    elem.css("opacity","0");
    elem.slideDown(time).delay(100).css(solid);
    // setTimeout(function(){
    //     if (elem.css('opacity') == 0){
    //         alert('help!');
    //         elem.animate({opacity:1},time);
    //     }
    // },101)
    if (callback){
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
    var B = ele.closest(".blur"), MF = ele.closest(".modalForm");
    if (B.length > 0){
        return B.children().first();
    }else if (MF.length > 0){
        return MF;
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
        var b = $(".blur").last(), cancelBtn = b.find(".cancel"), p = parentModalOrBody(b);
        if (cancelBtn.length > 0){
            cancelBtn.click();
        }else{
            unblurElement(p);
        }
    }
})
function clearModalHome(){
    $("#ModalHome").children().not(systemModals).removeAttr('id').remove();
}
function saveSystemModals(){
    systemModals.appendTo("#ModalHome");
}
function blurElement(elem,modal,time,callback){
    if (modal == "#Feedback"){
        console.log(elem, modal, $(modal));
    }
    time = (time != undefined) ? time : "400";
    var position = $(elem).css("position"),
        home = ($("#ModalHome").length > 0) ? $("#ModalHome") : $("body");
    $(modal).removeClass('expanded');
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
    $("#loading").removeClass("dark");
    if (position!=("relative"||"fixed"||"absolute")){
        // console.log('fix');
        $(elem).css({
            // position:"relative",
            position:"absolute",
            overflowY:"hidden"
        });
    }
    if ($(elem).is(".modalForm") && modal!="#loading" && modal!="#checkmark" && $.inArray($(modal).attr('id'),systemModalList) === -1){
        $(elem.addClass('expanded'));
    }
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

    if (modal!=undefined){
        $(modal).css("opacity","1");
        if (modal=="#loading"){
            $(modal).css({opacity:1,display:"inline-block"});
        }
        if ($.inArray($(modal).attr('id'), systemModalList) > -1){
            $(modal).css("box-shadow","0 0 15px 3px rgb(245,245,245)");
        }
        if (modal==".c" || modal=='.a'){
            $(modal).css({backgroundColor:"transparent",boxShadow:""});
            $(modal).find(".confirm, .alert").css(center);
        }
        $(modal).appendTo(block).css(center);
        $(modal).css({
            overflowX:"hidden",
            overflowY:'auto'
        })
        if ($(modal).is(":visible")==false){
            $(modal).fadeIn(time);
        }

        var eH = elem.innerHeight(), mH = $(modal)[0].scrollHeight, em = Number($("body").css('font-size').replace("px","")),
            eW = elem.innerWidth(), mW = $(modal)[0].scrollWidth;
            // console.log(eH);
            // console.log(mH);
        if (!elem.is('body')){
            if ((mH/eH) > 0.95){
                var newH = mH + 2*em;
                console.log('height change');
                elem.css('height',newH);
                elem.data('resetHeight',true);
            }
            if ((mW/eW) > 0.95){
                var newW = mW + 2*em;
                console.log('width change');
                elem.css('width',newW);            
                elem.data('resetWidth',true);
                elem.data('originalWidth',eW);
            }            
        }
    }
    if (callback!=undefined){
        setTimeout(callback,time+101);
    }
}
function unblurElement(elem, callback = null){
    var n = $(".blur").length,
        block = (n == 1) ? $("#Block") : $("#Block"+n);
    if ($(elem).is(".modalForm")){$(elem.removeClass('expanded'));}
    $(elem).css('height','auto');
    if ($(elem).data('resetWidth')){$(elem).css('width',$(elem).data('originalWidth'));}
    block = elem.children(".blur");
    block.fadeOut(400,function(){
        if ($("#ModalHome").length==0){
            block.children().hide().appendTo($("body"));
        }else{
            block.children().hide().appendTo($("#ModalHome"));
        }
        if (callback){callback();}
        block.remove();
    });
    block.parent().css({
        overflowX:"hidden",
        overflowY:"auto"
    });
}
function blurTopMost(modal){
    var ele = $(".blur").last().children().first();
    if (ele.length == 0){ele = $("body");}
    else if (ele.attr('id') == "loading"){ele = $(".blur").last().parent();}
    if (ele.is(modal)){
        console.log("can't blur "+ele.attr('id')+" since top most is "+modal);
        return;
    }else if (ele.is("#checkmark")){
        setTimeout(function(){
            blurTopMost(modal);
        },100);
        return;
    }
    blurElement(ele,modal);
}
function unblurTopMost(){
    var ele = $(".blur").last().parent();
    unblurElement(ele);
}
function unblurAll(){
    var clearBlurs = setInterval(function(){
        // console.log($(".blur"));
        unblurTopMost();
        if ($(".blur").length == 0){
            clearInterval(clearBlurs);
        }
    },100)
}
function delayedUnblurAll(time = 800){
    setTimeout(function(){
        unblurAll();
    },time);
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
    $("body").on("click",".errorReport", submitErrorReport);
    systemModals.find(".button").on('click',function(){
        clearInterval(SystemModalBtnFlash);
    })
})

function allowButtonFocus(){
    var btns = filterByData(".button","focusable",false);
    btns.attr("tabindex","0");
    $(".button").on("keyup",enterClick);
    btns.data('focusable',true);
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
    // console.log(AllRows);
    
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
        var filterParts = filter.split(":"), type = filterParts[0], value = filterParts[1];
        if (filterParts.length > 2){
            value = filterParts[1] + ":" + filterParts[2];
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
// function warn(target,where,offset,customText=""){
//     customText = (customText != '') ? " "+customText : "";
//     var str = "<span class='confirmQ'>are you sure"+customText+"? this cannot be undone</span> <span class='confirmY'>yes</span><span class='confirmN'>no</span>";
//     alertBox(str,target,where,"nofade",offset);
// }
function clearAllScheduleModals(){
    var list = "#AddTimeBlock, #EditTimeBlock, #EditScheduleModal, #AddTimeOff, #EditTimeOff, #editOrDelete";
    $(list).removeAttr('id').remove();
}
function optionsNavBtnClick(){
    if ($(this).hasClass("disabled")){return;}
    var optionsNav = $(this).closest('.optionsNav'),
        model = optionsNav.data('model'),
        dest = $(this).data('destination'),
        link = $(".tab").filter("#"+dest).find(".title"),
        uid = optionsNav.data("uid");
    
    if (link.length>0){
        if (link.data('uri').match(/(edit|delete|show|update|settings)/)){
            // var uri = link.data('uri').split("/");
            // uri[2] = uid;
            // uri = uri.join("/");
            // link.data('uri',uri);
        }
        link.click();
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
    else if (dest=='schedule'){
        clearAllScheduleModals();
        $("<div/>",{
            id: "EditScheduleModal",
            class: "modalForm"
        }).appendTo("#ModalHome");
        blurElement($('body'),"#loading");
        $.ajax({
            url:"/schedule/"+model+"/"+uid,
            method:"GET",
            success:function(data){
                $("#EditScheduleModal").html(data);
                blurElement($("body"),"#EditScheduleModal");
                initializeNewContent();
            }
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
            name = optionsNav.find(".name").text().trim(),
            dispModel = null;
            // dispModel = (model == 'Diagnosis') ? optionsNav.data("dxtype") + " " + model : model;


        if (model == 'Diagnosis'){
            dispModel = optionsNav.data("dxtype") + " " + model;
        }else if (model == 'User'){
            var h1 = "<h1 class='purple'>Edit Basic Patient Info</h1>", h2 = "<h1 class='yellow'>"+name+"</h1>";
            $(modal).find("h1").remove();
            $(modal).prepend(h1,h2);
        }else if (model == 'Template'){
            var m = optionsNav.find(".name").data('markup');
            // console.log(optionsNav.find(".name").data());
            $("#editTemplate").find(".summernote").summernote('code',m);
        }

        dispModel = !dispModel ? model : dispModel;

        removePasswordInputs();

        updateEditForm(modal, dispModel, name);
        $(modal).find(".submitForm").text("update");
        $(modal).data('uid',optionsNav.data('uid'));

        // console.log($.inArray(model, ['Patient','User','StaffMember','Practitioner']));
        if ($.inArray(model, ['Patient','User','StaffMember','Practitioner']) > -1){
            var type = optionsNav.find('.name').data('usertype'),
                isAdmin = (optionsNav.find(".name").data('isadmin') == "1") ? "yes" : "no";
            $(modal).find("#select_user_type").find("li").filter("[data-value='"+type+"']").click();
            $(modal).find("#grant_admin_privileges").val(isAdmin);
        }
        fillForm(json,form);
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
                // initializeNewForms();
                // initializeSettingsForm();
                form.find(".button.submitForm").text("save settings");
                form.find("h1, h2, .q").filter(function(){return !$(this).data('updated');}).each(function(){
                    var t = $(this).text(), name = optionsNav.find(".name").text();
                    t = t.replace("this " + model.toLowerCase(), "'" + name + "'");
                    $(this).text(t);
                    $(this).data('updated',true);
                });
                initializeNewContent();
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
    else if (dest=='loadForm'){
        var status = trimCellContents($("#FormList").find('tr').filter(function(){return $(this).data('uid') == uid;}).find(".status"));
        if (status == 'required'){
            blurTopMost("#loading");
            $.ajax({
                url: "/retrieve/Form/"+uid,
                success: function(data){
                    $("<div/>",{
                        id: "LoadedForm",
                        class: "modalForm"
                    }).appendTo("#ModalHome");
                    $("#LoadedForm").load("/retrieve/Form/"+uid,function(){
                        blurTopMost("#LoadedForm");
                        initializeNewForms();
                    });
                }
            })            
        }else{
            confirm('Form Already Completed',"You've already completed this form and you don't have to complete it again right now. Would you like to view your submission?","yes, go to submissions",'no thanks');
            var wait = setInterval(function(){
                if (confirmBool != undefined){
                    if (confirmBool){
                        setUid('Submission',optionsNav.find(".name").data('lastsubmission'));
                        blurElement($("body"),"#loading");
                        $("#submissions-index").find(".title").click();
                        delayedUnblurAll();
                    }
                    clearInterval(wait);
                    confirmBool = undefined;
                }
            },100)
        }
    }else if (dest=='loadSubmission'){
        blurTopMost("#loading");
        $.ajax({
            url: "/retrieve/Submission/"+uid,
            success: function(data){
                $("<div/>",{
                    id: "LoadedSubmission",
                    class: "modalForm"
                }).appendTo("#ModalHome");
                $("#LoadedSubmission").load("/retrieve/Submission/"+uid,function(){
                    var json = $("#responses").data('json');
                    initializeNewForms();
                    setTimeout(function(){
                        fillForm(json,$("#LoadedSubmission"));
                        disableForm($("#LoadedSubmission"));
                    },500)
                    blurTopMost("#LoadedSubmission");
                })
            }
        })        
    }
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
function getEm(){
    return Number($("body").css('font-size').split("px")[0]);
}
var menuWidth;
function resizeMobileMenuAndFooter(){
    var siteMenu = $(".siteMenu").first();
    var tabs = siteMenu.add("#MenuDisplay").children(".tab");
    if (!siteMenu.hasClass("mobile")){
        menuWidth = siteMenu.outerWidth();
    }
    var logo = $("#NavBar").find('.logo'), logoW = logo[0].scrollWidth, menuW = siteMenu[0].scrollWidth, em;
    em = getEm();
    var w = $("body").width();
    var tooWide = ((logoW + menuW + 6*em) > w), wideEnough = null;
    if (siteMenu.data('width') != undefined){
        wideEnough = ((logoW + siteMenu.data('width') + 6*em) < w);
    }
    // if (p > 0.6){
    if (tooWide){
        siteMenu.data('width',menuW);
        siteMenu.addClass("mobile");
        tabs.appendTo("#MenuDisplay");
    }else if (wideEnough){
    // }else{
        siteMenu.removeClass("mobile");
        tabs.appendTo(siteMenu);
        siteMenu.find(".dropDown").removeClass("active");
        siteMenu.removeData('width');
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
            $(".siteMenu").find(".dropDown, .underline").removeClass("active");
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
        // resizeFont();
        resizeSplits();
        resizeQuotes();
        resizeMobileMenuAndFooter();
        resizeFooterPadding();
        optionsNavOverflowCheck();
    },100)
}

function followLink(){
    if ($(this).data('target') != undefined){
        var t = $(this).data("target");
        window.location.href = t;        
    }else if ($(this).data('tab') != undefined){
        var t = $(this).data('tab');
        $(t).find(".title").click();
    }
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

function initializeLinks(){
    var links = filterUninitialized('.link');
    links.on("click",followLink);
    links.data('initialized');
}

function initializeNewContent(){
    resetEntireAppt();
    initializeNewMenus();
    initializeNewForms();
    initializeNewModelForms();
    initializeNewModelTables();
    initializeSettingsForm();
    initializeApptForms();
    initializeLinks();
    initializeScheduleForms();
    checkNotifications();
    activateServiceSelection();
    masterStyle();
}

var loadingRing = "<div class='lds-ring dark'><div></div><div></div><div></div><div></div></div>", loadingRingCSS = {top:"50%",transform:"translate(-50%,-50%)"};

$(document).ready(function(){
    resizeElements();
    if ($("#LoggedOut").length>0){
        setTimeout(function(){
            slideFadeOut($("#LoggedOut"));
        },2000)
    }
    usertype = getUsertype();
    if (usertype == 'patient'){
        systemModalList.push("createAppointment","editAppointment","SelectServices","SelectPractitioner","SelectDateTime","ApptDetails","ServiceListModal","PractitionerListModal");
        systemModals = systemModals.add($("#createAppointment, #editAppointment, #SelectServices, #SelectPractitioner, #SelectDateTime, #ApptDetails, #ServiceListModal, #PractitionerListModal"));
    }
    initializeLinks();
    $(".booknow").addClass("link").data("target","/booknow");
    $(document).on('click','.cancel',unblurTopMost);
})
