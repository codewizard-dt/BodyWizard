$(".jump").on("click",function(){
    var target = "#"+$(this).data("target");
    $.scrollTo(target);
});
function checkNLog(){
    console.log($(this));
}
const user = {
    current: null,
    is: function(usertype){return user.current ? (user.current.type == usertype) : false;},
    isSuper: function(){return (user.current && user.current.is_super != undefined) ? user.current.is_super : false;},
    isAdmin: function(){return (user.current && user.current.is_admin != undefined) ? user.current.is_admin : false;},
    set: function(userData){
        if (Object.isFrozen(user)) return;
        user.current = userData;
        Object.freeze(user);
    }
};

const initialize = {
    selection: null,
    ele: function(options = {select:null, action: null}){
        try{
            let errors = {};
            if (typeof options != 'object') errors['initialize.ele() requires an options object'] = typeof options + ' given';
            if (!options.select) errors['options.select invalid'] = options.select;
            if (typeof options.function != 'function') errors['options.function must be a valid function'] = typeof options.function + ' given';
            if (!$.isEmptyObject(errors)) {
                errors['parameter given'] = options;
                throw (errors);
            }
            options.dataAttr = (typeof options.dataAttr == 'undefined') ? 'initialized' : options.dataAttr;
            options.searchValue = (typeof options.searchValue == 'undefined') ? false : options.searchValue;
            options.setValue = (typeof options.setValue == 'undefined') ? true : options.setValue;
            initialize.find(options.select, options.dataAttr, options.searchValue);
            if (!initialize.selection) throw ({error: 'no elements found',options:options});
            initialize.selection.each(function(e,element){
                try{
                    options.function.bind(element)();
                    $(element).data(options.dataAttr, options.setValue);
                }catch(error){
                    console.log(error);
                }
            });            
        }catch(error){ 
            if (user.isSuper()) console.log(error);
            return;
        }
        return initialize.selection;
    },
    find: function(selection, dataAttr = 'initialized', value = null){
        let elements = null;
        try{
            if (selection instanceof jQuery){elements = selection;}
            else if(typeof selection == 'string'){elements = $(selection);}
            else {
                throw({selection: selection, error: 'selection not string or jQuery'});
                return false;
            }
        }catch(error){
            console.log(error);
            return false;
        }
        found = elements.filter(function(){
            if ($.inArray(value,['unset','null',null,'undefined',undefined,"false",false]) > -1) return !$(this).data(dataAttr);
            else return $(this).data(dataAttr) === value;
        });
        if (found.length == 0) {
            initialize.selection = null;
        }else{
            initialize.selection = found;
        }
        return initialize.selection;
    },
};

var systemModalList = ['Confirm','Warn','Error','Feedback','Refresh','Notification','ErrorMessageFromClient','AutoSaveWrap'],
    systemModals = $('#Confirm, #Warn, #Error, #Feedback, #Refresh, #Notification, #ErrorMessageFromClient, #AutoSaveWrap'), usertype,
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

$.fn.addHoverClassToggle = function () {
    this.hover(function(){$(this).addClass('hover')},function(){$(this).removeClass('hover')});
    return this;
}
$.fn.slideFadeOut = function (time = 400, callback = null) {
    if (typeof time == 'function'){
        callback = time;
        time = 400;
    }
    if (callback) slideFadeOut(this, time, callback.bind(this));
    else slideFadeOut(this, time, callback);
    return this;
};
$.fn.slideFadeIn = function (time = 400, callback = null) {
    if (typeof time == 'function'){
        callback = time;
        time = 400;
    }
    slideFadeIn(this, time, callback);
    return this;
};
$.fn.resetActives = function (){
    this.find('.active').removeClass('active');
    return this;
}
$.fn.getHtml = function(){
    return this.get().map(function(v){return v.outerHTML}).join('');
}
$.fn.exists = function(){
    return this != undefined && this.length > 0;
}
$.fn.dne = function(){
    return this.length == 0;
}
$.fn.isSolo = function(){
    return this.exists() && this.length === 1;
}
$.fn.appendKeyValuePair = function (key,value) {
    $(this).append($("<div class='label'>"+key+"</div><div class='value'>"+value+"</div>"))
    return this;
};
Array.prototype.isSolo = function(){
    return this.length === 1;
}
Array.prototype.isEmpty = function(){
    return this.length === 0;
}
Array.prototype.notEmpty = function(){
    return this.length !== 0;
}
Number.prototype.countDecimals = function () {
    if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
    return this.toString().split(".")[1].length || 0; 
}

function jsonIfValid(data){
    var val;
    // console.log(data,typeof data);
    if (typeof data !== 'string'){return data;}
    try {
        var val = JSON.parse(data);
        if (val && typeof val === "object"){
            return val;
        }
    }catch (e) { 
        // console.log(e);
    }
    return false;
}

// Elements must have data-order attributes already set
$.fn.sortEle = function sortEle(eleStr = "div", attr = 'order') {
    $("> "+eleStr, this[0]).sort(dec_sort).appendTo(this[0]);
    function dec_sort(a, b){ return ($(b).data(attr)) < ($(a).data(attr)) ? 1 : -1; }
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

// function getUsertype(){
//     var userData = $("#UserInfo").data(), type = userData.usertype;
//     if (type == undefined) type = $("#uidList").data('usertype');
//     return type;
// }

function filterUninitialized(selector,debug = false,msg = false){
    var uninitialized, elements;
    if (selector instanceof jQuery){elements = selector;}
    else if(typeof selector == 'string'){elements = $(selector);}
    else {return false;}
    uninitialized = elements.filter(function(){
        // if (selector == '.signature') console.log($(this).data());
        return !$(this).data('initialized');
    });
    if (debug){
        var alreadyInitialized = elements.not(uninitialized);
        if (alreadyInitialized.length > 0){
            console.log(msg ? msg : 'already initialized',elements.not(uninitialized),'uninitialized',uninitialized,'all elements',elements);
        }else{
            console.log(msg ? msg : 'already initialized',0);
        }
    }
    // if (selector == '.signature') console.log(elements,uninitialized,alreadyInitialized);
    return uninitialized;
}
function filterByData(selector,key,value){
    var matches, items;
    if (selector instanceof jQuery){items = selector;}
    else if(typeof selector == 'string'){items = $(selector);}
    else {return false;}
    if (value === 'max'){
        var max = null;
        items.each(function(){
            var num = Number($(this).data(key));
            if (max === null || num > max) {max = num;}
        });
        matches = items.filter(function(){
            return $(this).data(key) === max;
        })
    }else{
        matches = items.filter(function(){
            if ($.inArray(value,['unset','null',null,'undefined',undefined,"false",false]) > -1){
                return !$(this).data(key);
            }else{
                return $(this).data(key) === value;
            }
        });
    }
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
function findObjKey(obj,value){
    for (var key in obj){
        console.log(obj,key,value);
        if (obj[key] === value){
            return key;
        }
    }
    return null;
}
function toTitleCase(str) {
    return str.replace(/(?:^|\s)\w/g, function(match) {
        return match.toUpperCase();
    });
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
                // console.log(json);
                // if (json.uidList != undefined) $("#uidList").text(JSON.stringify(json.uidList));
                if (json.uidList != undefined) uids.set(json.uidList);
                if (json.tabList != undefined) tabs.set(json.tabList);
                if (json.user != undefined) user.set(json.user);
                if (json.message != undefined) returnData = JSON.stringify(json.message);
                if (json.notifications != undefined) {
                    $(json.notifications).appendTo('body');
                    checkNotifications();
                }
            }catch(e){
                // console.log(e);
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

$(document).on('click','.hideTarget',function(){
    var target = $(this).data('target'), showNow = $(this).find('.arrow').hasClass('right'), time;
    if ($(this).data('speed') != undefined){
        time = $(this).data('speed');
    }else{
        time = 400;
    }
    if (target == undefined){
        target = $(this).siblings('.target').first();
    }else if (!target.includes("#")){
        target = $("#"+target);
    }
    if (showNow){
        target.slideFadeIn(time);
        if (typeof initializeSignatures == 'function'){initializeSignatures();}
        // if (typeof fillImageClicks == 'function'){fillImageClicks();}
        resizeImageClicks();
        $(this).find('.arrow').toggleClass('right down');
    }else{
        target.slideFadeOut(time);
        $(this).find('.arrow').toggleClass('right down');
    }
    $(this).removeData('speed');
});
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
            alertBox('must be between 5 and 15 characters',i,"after",800);
            scrollToInvalidItem(i);
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
var confirmInterval = null;
function confirm(header, message, yesText = null, noText = null, delay = null, affirmative = null){
    confirmBool = undefined;
    if (typeof delay == 'function'){
        affirmative = delay;
        delay = null;
    }
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
    if (!affirmative || typeof affirmative != 'function') return;
    confirmInterval = setInterval(function(){
        if (confirmBool != undefined){
            clearInterval(confirmInterval);
            if (confirmBool === true){
                affirmative();
            }
            confirmBool = undefined;
        }
    },100)
}

function alertBox(message, ele, where = 'below', time = 1500, offset = null){
    var hEle = ele.outerHeight(), wEle = ele.outerWidth(), wrap, wAlert, hAlert, readonly = ele.attr('readonly'), css;
    if (ele.parent().is('.number')) hEle = ele.parent().outerHeight();
    if (ele.is('.radio, .checkboxes')){
        console.log(hEle);
        // time = 'nofade';
    }
    if (time=="nofade"){
        wrap = $('<span class="zeroWrap a"><span class="alert">'+message+'</span></span>');
        time = 2000;
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
        wrap.insertBefore(ele);
        css = {top:0.5*hEle,left:wEle+5};
    }else if (where=="ontop"){
        wrap.appendTo(ele);
        css = {top:0.5*hEle,left:0.5*wEle-0.5*wAlert};
    }else if (where=="before"){
        wrap.insertBefore(ele);
        css = {top:0.5*hEle,left:-wAlert-5};
    }else if (where=="above"){
        wrap.insertBefore(ele);
        css = {left:0.5*wEle,top:-hAlert-5};
    }else if (where=="below"){
        wrap.insertBefore(ele);
        css = {left:0.5*wEle,bottom:-1.05*hAlert};
    }
    console.log(where,ele,css);

    wrap.css(css);

    if (offset!==null){
        $(".alert").css("transform","translate("+offset+")");
    }
    
    // if (ele.is('ul')){
        // var bgColor = (ele.data('bgColor') != undefined) ? ele.data('bgColor') : ele.css('background-color');
        // ele.data('bgColor',bgColor);
        // ele.css('background-color','rgb(234,78,80)');
        // setTimeout(function(){
        //     ele.css("background-color",bgColor);
        // },time)
    // }else{
        var borderColor = (ele.data('borderColor') != undefined) ? ele.data('borderColor') : ele.css('border-color');
        ele.data('borderColor',borderColor);
        ele.css("border-color","rgb(234,78,80)").attr("readonly","true");
        setTimeout(function(){
            ele.css("border-color",borderColor);
            if (readonly != undefined){
                ele.attr('readonly',readonly);
            }else{
                ele.removeAttr("readonly");
                ele.focus();
            }
        },time)
    // }

    setTimeout(function(){
        $(".zeroWrap.a.f, .alert.f").slideFadeOut(600,function(){$(".zeroWrap.a.f, .alert.f").remove();})
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


// function setSessionVar(KeysValuesObj){
//     console.log('dont use this  setSessionVar!');
//     alert("fix me setSessionVar!");
//     // $.ajax({
//     //     url:"/setvar",
//     //     method:"POST",
//     //     data:KeysValuesObj,
//     //     success:function(data){
//     //         // console.log(data);
//     //     }
//     // })
// }
// var yourSessionVar = undefined;
// function getSessionVar(keyName){
//     $.ajax({
//         url:"/getvar",
//         method:"POST",
//         data:{"getVar":keyName},
//         success:function(data){
//             yourSessionVar = data;
//         },
//         error:function(e){
//             console.log(e);
//         }
//     })
// }

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
function blurElement(elem,modal,time = 400,callback = null){
    if (modal == "#Feedback"){
        console.log(elem, modal, $(modal));
    }
    // time = (time != undefined) ? time : "400";
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
        var classList = (modal === '#Confirm') ? 'cancel cancelX confirmN' : 'cancel cancelX';
        $("<div/>",{
            text: 'x',
            class: classList
        }).appendTo($(modal));
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
    if (elem.is('.optionsNavWrapper')){
        showCSS.backgroundColor = "rgba(255,255,255,0.6)";
        showCSS.boxShadow = "unset";
        showCSS.maxHeight = "6em";
        $("#loading").addClass('dark');
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
    if ($(modal).length == 0) {
        console.log(modal+ " modal not found");
        return false;
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

        // console.log(modal,$(modal));
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
    // if (callback!=undefined){
    //     setTimeout(callback,time+101);
    // }
    if (callback) {setTimeout(callback,time+101)}
}
function unblurElement(elem, callback = null,speed = 400){
    var n = $(".blur").length,
        block = (n == 1) ? $("#Block") : $("#Block"+n);
    // if ($(elem).is(".modalForm")){$(elem.removeClass('expanded'));}
    $(elem).css('height','auto');
    if ($(elem).data('resetWidth')){$(elem).css('width',$(elem).data('originalWidth'));}
    block = elem.children(".blur");
    block.fadeOut(speed,function(){
        var home = ($("#ModalHome").length==0) ? $("body") : $("#ModalHome");
        block.children().hide().appendTo(home);
        if (callback){callback();}
        block.remove();
    });
    block.parent().css({
        overflowX:"hidden",
        overflowY:"auto"
    });
    elem.find(".cancelX").remove();
}
function blurTopMost(modal,time = 400,callback = null){
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
    blurElement(ele,modal,time,callback);
}
function unblurTopMost(callback = null, speed = 100){
    if (callback && typeof callback !== 'function'){callback = null;}
    var ele = $(".blur").last().parent();
    // console.log(ele);
    unblurElement(ele, callback, speed);
}
var clearBlurs = null;
function unblurAll(speed = 500, callback = null){
    if (typeof speed == 'function'){
        callback = speed;
        speed = 500;
    }
    console.log('unblurall');
    var blocks = $(".blur"), eles = blocks.parent();
    blocks.fadeOut(speed,function(){
        var home = ($("#ModalHome").length==0) ? $("body") : $("#ModalHome");
        blocks.children().hide().appendTo(home);
        // console.log("callback");
        blocks.remove();
        eles.find('.cancelX').remove();
        eles.css({overflowX:'hidden',overflowY:'auto'});
    });
    if (callback) setTimeout(callback,speed+50);
}
function delayedUnblurAll(time = 800, callback = null){
    setTimeout(function(){
        unblurAll(callback);
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

// function highlightRow(){
//     if ($(this).find("th").length==0){
//         $(this).addClass("hover");
//     }
// }
// function reverseHighlight(){
//     $(this).removeClass("hover");
// }
// function stylizeTables(){
//     var tables = $(document).find(".styledTable").filter(function(){
//         return $(this).data("styled") == undefined;
//     });
//     tables.wrap("<div class='tableWrapper'/>");
//     tables.filter(".clickable").find("tr").not(".head").hover(highlightRow,reverseHighlight);
//     tables.each(function(){
//         if ($(this).hasClass('hideOverflow')){
//             var t = $(this).closest(".tableWrapper"), h = $(this).data('maxheight');
//             t.addClass('manageOverflow').data("maxHeight",h);
//             $("<div/>",{
//                 class:"showOverflow",
//                 text:"show all matches"
//             }).appendTo(t);
//         }
//     })
//     tables.data('styled',true);
// }

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

// function filterTableList(table){
//     $(".styledTable").removeClass("active");
//     table.addClass("active");
    
//     var filterObj = {}, 
//         filterList = [], 
//         AllRows = table.find("tr").not('.head, .noMatch'), 
//         noMatch = table.find(".noMatch");
//     $(".filter").removeClass("active").each(function(){
//         var checks = $(this).find(".tableFilter").filter(":checked").length,
//             searches = $(this).find(".tableSearch").filter(function(){return $(this).val()!=""}).length;
//         if (checks > 0 || searches > 0){
//             $(this).addClass("active");
//         }
//         if (searches > 0){
//             $(this).data('options','{"wholeWords":"false","separateWords":"true"}');
//         }
//     })
//     // console.log(AllRows);
    
//     //AllRows.removeClass("match").addClass("hide").unmark();
//     AllRows.unmark();
//     AllRows.unmark({element:"exclude"});
//     AllRows.show();

//     $(".tableFilter").filter(function(){
//         return table.is($(this).closest(".filter").data("target")) && $(this).is(":checked");
//     }).each(function(f,ele){
//         filterList.push($(ele).data('filter'));
//     })
    
//     $(".tableSearch").filter(function(){
//         return table.is($(this).closest(".filter").data("target")) && $(this).val()!="";
//     }).each(function(f,ele){
//         var filter = $(ele).data("filter") + ":" + $(ele).val();
//         filterList.push(filter);
//     })
        
//     filterList.forEach(function(filter,f){
//         var filterParts = filter.split(":"), type = filterParts[0], value = filterParts[1];
//         if (filterParts.length > 2){
//             value = filterParts[1] + ":" + filterParts[2];
//         }
//         if (filterObj[type]==undefined){
//             filterObj[type] = [value];
//         }else{
//             filterObj[type].push(value);
//         }
//     });
    
//     if ($.isEmptyObject(filterObj)){
//         AllRows.removeClass("hide");
//         if (AllRows.length==0){
//             noMatch.find(".name").text("None available").show();
//         }else{
//             noMatch.hide();
//         }
//         if (table.parent().hasClass("manageOverflow")){
//             checkOverflow(table.parent()[0]);
//         }

//         $('.clearTableFilters').filter('[data-target="#'+table.attr('id')+'"]').addClass('disabled');
//         return false;
//     }
    
//     $('.clearTableFilters').filter('[data-target="#'+table.attr('id')+'"]').removeClass('disabled');

//     AllRows.data("marks",0);
//     AllRows.data("match",0);
//     $.each(filterObj,function(type,values){
//         var options = $(".tableFilter, .tableSearch").filter(function(){
//             return table.is($(this).closest(".filter").data("target")) && $(this).data("filter").includes(type);
//         }).closest(".filter").data("options");

//         optionsObj = {};
//         // optionsObj['done'] = checkMatches;
//         optionsObj['done'] = function(){
//             // if (type != 'hide'){
//                 checkMatches();
//             // }
//         }
//         optionsObj['synonyms'] = {
//             "spleen":"spleen-pancreas",
//             "burner":"jiao"
//         };
        
//         if (options['highlight']=="false"){
//             optionsObj["className"] = "invis";
//         }
//         if (options['separateWords']=='false'){
//             optionsObj['separateWordSearch']=false;
//         }
//         if (options['wholeWords']=='true'){
//             optionsObj['accuracy']={value:"exactly",limiters:[",","."]};
//         }else{
//             optionsObj['accuracy']="partially";
//         }
//         if (type=='hide'){
//             optionsObj['element'] = 'exclude';
//         }
//         AllRows.find("."+type).mark(values,optionsObj);
//     })

//     if (filterObj.length == 1){
//         alert("HI");
//     }
//     AllRows.filter(function(){
//         return $(this).find("exclude").length > 0;
//     }).hide();

//     if (AllRows.filter(":visible").length==0){
//         noMatch.removeClass("hide").show();
//     }else{
//         noMatch.hide();
//     }
//     alternateRowColor(table);

//     if (table.parent().hasClass("manageOverflow")){
//         checkOverflow(table.parent()[0]);
//     }
    
//     checkHorizontalTableFit(table);
// }
function checkMatches(){
    var table = $(".styledTable").filter(".active");
    var filterCount = $(".filter").filter(function(){
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
// var tableCheck = undefined;
// function resizeCheckTableWidth(){
//     if (tableCheck!=undefined){
//         clearTimeout(tableCheck);
//     }
//     tableCheck = setTimeout(function(){
//         $(".styledTable").each(function(i,t){
//             if ($(t).data("hideorder")!=undefined){
//                 checkHorizontalTableFit($(t));
//             }
//         })
//         tableCheck = undefined;
//     },500)
// }
function clearTableFilters(){
    if ($(this).hasClass('disabled')){return false;}
    var t = $(this).data("target");
    // console.log(t);
    $(".filter").filter("[data-target='"+t+"']").find(".tableSearch").val("").keyup();
    $(".filter").filter("[data-target='"+t+"']").find(".tableFilter").each(function(){
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
    // resetOptionsNavBtns();
    $(".wrapMe").filter(function(){return !$(this).parent().is(".wrapper");}).each(function(){
        wrapAndCenter($(this));
    })
    allowButtonFocus();
    // stylizeTables();
    $(".manageOverflow").each(function(i,ele){checkOverflow(ele);})
    $("#scrollToBtm").on("click", function(){$.scrollTo("max");})
    $(".modalForm").each(function(){
        if ($(this).find(".cancel").length==0){
            $("<div class='cancel button small'>dismiss</div>").appendTo($(this));
        }
    })
    $(".modalLink").off("click",modalLinkClk);
    $(".modalLink").on("click",modalLinkClk);
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
    
    if (link.exists()) link.click();
    else if (dest == 'view'){
        if (model == 'ChartNote') chartnote.view(uid);
        else if (model == 'Invoice') invoice.view(uid);
    }else if (dest=='form-preview'){
        $("<div/>",{
            id: "FormPreview",
            class: "modalForm"
        }).appendTo("#ModalHome");
        blurElement($('body'),"#loading");
        $("#FormPreview").load("/forms/"+uid+"/preview",function(){
            blurElement($('body'),"#FormPreview");
        })
    }else if (dest=='schedule'){
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
    }else if (dest=='delete'){
        model = model.replace(" ","");
        var modal = '#delete'+model;
        // console.log(modal);
        $(modal).find(".name").text(optionsNav.find(".name").text());
        blurElement($("body"),modal);
    }else if (dest=='create'){
        var modal = '#create'+model;
        blurElement($("body"),modal);
    }else if (dest=='edit'){
        if (model == 'ChartNote'){
            editNoteFromOptionsNav();
            return;
        }
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

        console.log(modal, dispModel, name);
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
        // fillForm(json,form);
        forms.fill(form,json);
        blurElement($("body"),modal);
    }else if (dest=="settings"){
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
                        // fillForm(settings,form.find(".formDisp"));
                        forms.fill(form.find('.formDisp'),settings);
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
    }else if (dest=='loadForm'){
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
                        // fillForm(json,$("#LoadedSubmission"));
                        forms.fill($("#LoadedSubmission"),json);
                        forms.disable($("#LoadedSubmission"));
                    },500)
                    blurTopMost("#LoadedSubmission");
                })
            }
        })        
    }else if (dest=='setAsActiveForm'){
        blurTopMost('#loading');
        $.ajax({
            url: "/forms/"+uid+"/setAsActive",
            method: 'get',
            success: function(data){
                if (data=='checkmark') {
                    blurTopMost('#checkmark');
                    delayedUnblurAll(800,reloadTab);
                }
            }
        })
    }else if (dest=='markBugResolved'){
        blurTopMost('#loading');
        $.ajax({
            url: "/bugs/"+uid,
            method: 'PATCH',
            data: {
                status: 'resolved'
            },
            success: function(data){
                if (data=='checkmark') {
                    blurTopMost('#checkmark');
                    delayedUnblurAll(800,reloadTab);
                }else{console.log(data)}
            }
        })
    }else if (dest=='addNote'){
        blurTopMost("#loading");
        // getModelNotes(model,uid);
        notes.getModelNotes(model,uid);
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
function resizeFcCalendar(view){
    $(".fc-toolbar").each(function(){
        var toolbar = $(this), fullCal = toolbar.closest('.fc'), w = toolbar.width(), em = getEm(), realWidth = toolbar[0].scrollWidth, wLeft = toolbar.find('.fc-left')[0].scrollWidth, wCenter = toolbar.find('.fc-center')[0].scrollWidth, wRight = toolbar.find('.fc-right')[0].scrollWidth, wTotal = wLeft + wCenter + wRight, changed = false;
        if(toolbar.find('.fc-center').html() == ""){toolbar.find('.fc-center').css({padding:"0 1em"})}
        while (realWidth - w > 1){
            fullCal.css({fontSize:"-=0.05em"});
            w = toolbar.width(); realWidth = toolbar[0].scrollWidth;
            changed = true;
        }
        while (wTotal + (3*em) < w && em > getEm(fullCal)){
            fullCal.css({fontSize:"+=0.05em"});
            w = toolbar.width(); wLeft = toolbar.find('.fc-left').width(); wCenter = toolbar.find('.fc-center').width(); wRight = toolbar.find('.fc-right').width(); wTotal = wLeft + wCenter + wRight;        
            changed = true;
        }
        if (changed){
            calendar.updateSize();
        }
    })
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
function getEm(ele = null){
    if (ele == null){ele = $("body")}
    return Number(ele.css('font-size').split("px")[0]);
}
var menuWidth;
function resizeImageClicks(){
    $('.imageClick').each(function(){
        var height = $(this).data('height') != 'null' ? $(this).data('height') : '20em',
            ratio = $(this).data('ratio') != 'null' ? Number($(this).data('ratio')) : 1.5, width,
            parentRect = $(this).parent()[0].getBoundingClientRect(), parentWidth = parentRect.width, newWidth, newHeight, visible = $(this).is(":visible");
        $(this).css({height:height});
        var img = $(this);
        setTimeout(function(){
            var heightInPx = img.outerHeight(), newHeight;
            width = heightInPx * ratio;
            newWidth = width;
            // console.log(img,height);
            img.css({width:width});
            // console.log(img.css('width'));
            if (visible){
                while(newWidth > parentWidth){
                    newWidth = newWidth*0.95;
                }
                if (newWidth != width){
                    newHeight = newWidth / ratio;
                    img.css({width:newWidth,height:newHeight});
                }
            }
        },501)
    });
}

function resizeMobileMenuAndFooter(){
    var siteMenu = $(".siteMenu").first();
    var tabs = siteMenu.add("#MenuDisplay").children(".tab").not("#Notifications, #mobilePlaceholder, #MobileMenu"), hasPlaceholder = ($("#mobilePlaceholder").length == 1);
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
        if (hasPlaceholder){
            $("#mobilePlaceholder").replaceWith(tabs);
        }else{
            tabs.appendTo("#MenuDisplay");    
        }
    }else if (wideEnough){
        siteMenu.removeClass("mobile");
        tabs.appendTo(siteMenu);
        siteMenu.find(".dropDown").removeClass("active");
        siteMenu.removeData('width');
    }
    moveNotifications();

    if (w < 480){$("footer").find(".logo, .icons, .contact, .hours").addClass("mobile");}
    else if (w < 750){
        $("footer").find(".logo, .icons").addClass("mobile");
        $("footer").find(".contact, .hours").removeClass("mobile");
    }
    else {$("footer").find(".logo, .icons, .contact, .hours").removeClass("mobile");}
}
function moveNotifications(){
    var siteMenu = $(".siteMenu").first(), mobileNow = siteMenu.hasClass('mobile');
    if (mobileNow){
        $("#Notifications").prependTo(siteMenu);
    }else{
        $("#Notifications").insertBefore(siteMenu.find(".divide"));
    }
}
function listenMobileMenuExit(e){
    if (!$(e.target).is(".tab, .title, .dropdown, li, #MenuToggle")){
        $("#MenuToggle").click();
    }
}

var timer;
function resizeElements(ev){
    clearTimeout(timer);
    timer = setTimeout(function(){
        if (typeof ev !== 'undefined' && typeof ev === 'object'
            && typeof ev.type !== 'undefined' && ev.type === 'resize'
            && vhIndicatorHeight !== undefined && !inputHasFocus){
            // console.log(ev);
            vhIndicatorHeight = vhIndicator.height();
        }
        // if (vhIndicatorHeight !== undefined) console.log(vhIndicatorHeight);
        resizeSplits();
        resizeQuotes();
        resizeMobileMenuAndFooter();
        resizeFooterPadding();
        resizeImageClicks();
        resizeFcCalendar();
        optionsNavOverflowCheck();
    }.bind(null, ev),150)
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

var autosave = {
    settings: {
        saveBtn: null,
        btnText: null,
        timer: null,
        ajaxCall: null,
        callback: null,
        delay: 5000
    },
    initialize: function(options = autosave.settings){
        if (!options.ajaxCall || typeof options.ajaxCall != 'function'){
            console.log('autosave initialization failure',options); 
            return false;
        }
        autosave.settings.ajaxCall = options.ajaxCall;
        if (options.delay && typeof options.delay == 'number') autosave.settings.delay = options.delay;
        if (options.saveBtn && options.saveBtn instanceof jQuery){
            autosave.settings.saveBtn = options.saveBtn;
            autosave.settings.btnText = options.saveBtn.text();            
        }
        if (options.callback && typeof options.callback == 'function') autosave.settings.callback = options.callback;
    },
    reset: function(){
        console.log('reset');
        autosave.clearTimer();
        autosave.settings = {saveBtn: null, btnText: null, timer: null, ajaxCall: null, callback: null, delay: 5000};
    },
    clearTimer: function(){
        console.log('clear timer');
        clearTimeout(autosave.settings.timer);
    },
    trigger: function(){
        console.log('trigger');
        // console.log(this);
        clearTimeout(autosave.settings.timer);
        autosave.settings.timer = setTimeout(function(){
            autosave.settings.ajaxCall();
            autosave.inProgress();
        }, autosave.settings.delay);
    },
    inProgress: function(){
        console.log('in progress');
        if (autosave.settings.saveBtn){
            if (autosave.settings.saveBtn.parent(".autosaveSpan").dne()) autosave.settings.saveBtn.wrap("<span class='autosaveSpan'/>");
            var span = autosave.settings.saveBtn.parent(), margin = autosave.settings.saveBtn.css('margin');
            var disabled = autosave.settings.saveBtn.hasClass('disabled');
            autosave.settings.saveBtn.data('disabled',disabled);
            autosave.settings.saveBtn.addClass('disabled');
            console.log(autosave.settings.saveBtn, autosave.settings.saveBtn.data(),disabled);
            $("#BtnLoading").appendTo(span);
            $('#AutoStatus').html('autosaving').addClass('pink opacityFlash').slideFadeIn();
            $("#AutoStatus").appendTo(span).css('transform','translate(-50%, calc(100% - '+margin+'))');
        }
    },
    success: function(){
        // console.log('success');
        var t = new Date(), timeStr = t.toLocaleTimeString(), wrap = $("#AutoSaveWrap");
        $("#AutoConfirm").find(".message").text("Autosaved at " + timeStr);
        console.log(wrap);
        wrap.slideFadeIn(1200,setTimeout(function(){
            // wrap.slideFadeOut(1500);
        },3600));
        if (autosave.settings.saveBtn){
            var disabled = autosave.settings.saveBtn.data('disabled');
            if (!disabled) autosave.settings.saveBtn.removeClass('disabled');
            autosave.settings.saveBtn.removeData('disabled');
            $("#BtnLoading").appendTo('#AutoSaveWrap');
            $("#AutoStatus").html('<span>autosaved</span><span class="checkmark" style="position:relative">✓</span>').removeClass('pink opacityFlash');
            setTimeout(function(){
                $("#AutoStatus").slideFadeOut(400,function(){$("#AutoStatus").appendTo("#AutoSaveWrap")});
            },4000)
        }
        if (autosave.settings.callback) autosave.settings.callback();
    }
};

function showAutosaveTime(){
    console.log('update autosave');
    // var t = new Date(), timeStr = t.toLocaleTimeString(), wrap = $("#AutoSaveWrap");
    // $("#AutoConfirm").find(".message").text("Autosaved at " + timeStr);
    // console.log("Autosaved at " + timeStr);
    // wrap.slideFadeIn(400,setTimeout(function(){
    //     wrap.slideFadeOut(1500);
    // },3000));
}

function initializeEditables(){
    var newEditables = filterUninitialized(".editable");
    newEditables.on('click','.toggle',function(){
        editableToggleClick($(this));
    });
    newEditables.data('initialized',true);
}
function editableToggleClick(toggle){
    var p = toggle.closest('.editable, .question');
    if (toggle.hasClass("edit")){
        var target = toggle.closest(".editable");
        target.find(".value, .edit").hide();
        target.find(".input").show();
        target.find(".save, .cancel").css("display","inline");

        var pairs = target.find(".pair");
        pairs.each(function(i, pair){
            var input = $(pair).find(".input"), text = $(pair).find(".value").text();
            if (input.is("select")){
                input.find("option").removeAttr("selected");
                input.val(text);
            }else{
                input.val(text);
            }
            $(pair).find(".value").text(text);
        })
    }
    else if (toggle.hasClass("save")){
        var target = toggle.closest(".editable");
        var pairs = target.find(".pair");
        
        for (x=0;x<pairs.length;x++){
            var pair = pairs[x];
            var input = $(pair).find(".input"), text;
            if (input.is('.answer')) input = input.children('input, select').first();
            if (input.is("select")){
                text = input.find(":selected").val();
            }else{
                text = $.sanitize(input.val());
                if (text == ""){
                    alertBox("enter a value",target.find('.input'),"after","fade");
                    return false;
                }
            }
            $(pair).find(".value").text(text);
        }
        target.find(".value, .edit").css("display","inline");
        target.find(".input, .save, .cancel").hide();
        if (p.hasClass("sectionName")){
            updateSections();
        }
        if (toggle.closest('h2').is("FormName")){autoSaveForm();}
    }
    else if (toggle.hasClass("cancel")){
        var target = toggle.closest(".editable");
        var pairs = target.find(".pair");
        target.find(".value, .edit").css("display","inline");
        target.find(".input, .save, .cancel").hide();
    }
}

function initializeLinks(){
    var links = filterUninitialized('.link');
    links.on("click",followLink);
    links.data('initialized',true);
}

function initializeNewContent(){
    if (typeof notify !== 'undefined'){
        // resetEntireAppt();
        initializeNewForms();
        initializeNewModelForms();
        // initializeNewModelTables();
        table.initialize.all();
        initializeSettingsForm();
        // initializeApptForms();
        appointment.initialize.all();
        initializeScheduleForms();
        checkNotifications();
        // activateServiceSelection();
        // initializeChartNotePage();
        chartnote.initialize.all();
        // initializeInvoicePage();
        invoice.initialize.all();
    }
    initializeNewMenus();
    initializeEditables();
    initializeLinks();
    resizeElements();
    masterStyle();
}

var loadingRing = "<div class='lds-ring dark'><div></div><div></div><div></div><div></div></div>", loadingRingCSS = {top:"50%",transform:"translate(-50%,-50%)"}, vhIndicator, vhIndicatorHeight = undefined, inputHasFocus = false, rapidChangeTimer = null;
function checkRapidVhShrink(ev){
    inputHasFocus = true;
    input = $(ev.target), inputBoundaries = ev.target.getBoundingClientRect();
    // console.log(inputBoundaries);
    rapidChangeTimer = setTimeout(function(){
        // console.log(vhIndicator.height(), vhIndicatorHeight);
        if (vhIndicator.height() < vhIndicatorHeight * 0.85){
            console.log("SHRINK");
        }
    },250)
}
function checkRapidVhGrowth(){
    inputHasFocus = false;
    // rapidChangeTimer = setTimeout(function(){
    //     console.log(vhIndicator.height(), vhIndicatorHeight);
    //     if (vhIndicator.height() > vhIndicatorHeight * 0.85){
            // console.log("GROW");
    //     }
    // },250)
}

$(document).ready(function(){
    vhIndicator = $(".vhIndicator").first();
    if (vhIndicator.length > 0){
        vhIndicatorHeight = vhIndicator.length > 0 ? vhIndicator.height() : undefined;
        $('body').on('focusin','input[type="text"], textarea',checkRapidVhShrink);
        $('body').on('focusout','input[type="text"], textarea',checkRapidVhGrowth);        
    }
    resizeElements();
    if ($("#LoggedOut").length>0){
        setTimeout(function(){
            slideFadeOut($("#LoggedOut"));
        },2000)
    }
    // usertype = getUsertype();
    if (user && user.is('patient')){
        systemModalList.push("createAppointment","editAppointment","SelectServices","SelectPractitioner","SelectDateTime","ApptDetails","ServiceListModal","PractitionerListModal");
        systemModals = systemModals.add($("#createAppointment, #editAppointment, #SelectServices, #SelectPractitioner, #SelectDateTime, #ApptDetails, #ServiceListModal, #PractitionerListModal"));
    }
    initializeLinks();
    $(".booknow").addClass("link").data("target","/booknow");
    $(document).on('click','.cancel',unblurTopMost);
})
