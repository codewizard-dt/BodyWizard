$(document).ready(function () {
    masterStyle();

    var answerList = $('.answer.radio, .answer.checkboxes');

    $("input").on("keyup",function(e){
        if (!e){
            return false;
        }
        var k = e.keyCode;
        var f = $(this).closest("form");
        if (f.length>0){
            if (k == 13){
                f.find(".submit").click();
            }
        }
    })

    var fullscreenBtn = filterUninitialized(".btn-fullscreen");
    fullscreenBtn.on('click',function(){
        var p = modalOrBody($(this));
        p.scrollTo($(this).closest(".note-editor"),200);
    })
    fullscreenBtn.data('initialized',true);
    
    

    // INITIALIZING ITEMS
        items = filterUninitialized($(".formDisp").find(".item, .itemFU"));
        items.each(function(i,item){
            UpdateCss($(item));
        });
        items.data('initialized',true);
            
        var checkboxes = filterUninitialized(".checkboxes");
        var plzSelectNode = $("<div class='plzselect'>(select as many as apply)</div>");
        checkboxes.each(function(){
            plzSelectNode.clone().insertBefore($(this));
        })
        checkboxes.on("click","li",checkbox);
        checkboxes.data("initialized",true);
        
        var radios = filterUninitialized(".radio");
        radios.on("click","li",radio);
        radios.data("initialized",true);

        var dropdowns = filterUninitialized(".dropdown");
        dropdowns.on("change","select",function(){
            var response = $(this).val();
            var item = $(this).closest(".item, .itemFU");
            if (item.is(".item")){
                showFollowUps(response,item);
            }
        })
        dropdowns.data("initialized",true);

        var datepickers = filterUninitialized(".datepicker");
        datepickers.each(function(){
            $(this).on("focus",function(e){
                e.preventDefault();
            })
            var r = $(this).data("yearrange");
            var min = $(this).data("mindate");
            var max = $(this).data("maxdate");
            
            var options = {};
            options['yearRange'] = r;
            if (min!="" && max!=""){
                options['minDate']=min;
                options['maxDate']=max;
            }
            
            $(this).datepick(options);
        })
        datepickers.data("initialized",true);

        var signatures = filterUninitialized(".signature");
        signatures.each(function(){
            $(this).jSignature();
            $(this).on("click",".clear",function(){
                $(this).parent().jSignature("reset");
            })
        })
        signatures.data("initialized",true);

        var times = filterUninitialized(".time");
        times.each(function(){
            var i = $(this).find("input"), o = i.data('options');
            i.timepicker(o);
        })
        times.data("initialized",true);

        var pointerEventToXY = function (e) {
            var out = {x: 0, y: 0};
            if (e.type === 'touchstart' || e.type === 'touchmove' || e.type === 'touchend' || e.type === 'touchcancel') {
                var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
                out.x = touch.pageX;
                out.y = touch.pageY;
            } else if (e.type === 'mousedown' || e.type === 'mouseup' || e.type === 'mousemove' || e.type === 'mouseover' || e.type === 'mouseout' || e.type === 'mouseenter' || e.type === 'mouseleave') {
                out.x = e.pageX;
                out.y = e.pageY;
            }
            return out;
        };
           
        var sliderXPos;
        
        var scales = filterUninitialized(".scale");
        scales.on("mouseenter",function(){
            var item = $(this).closest('.item');
            
            clearTimeout(item.data("timeoutId"));
            changeSliderValue(item);
        });    
        scales.on("mouseleave touchend", function(){
            var item = $(this).closest('.item');
            var timeoutId = setTimeout(function(){
                hideSliderValue(item);
            }, 1000);
            
            clearInterval(item.data('updateId'));
            item.data("updateId","clear");
            item.data('timeoutId', timeoutId); 
            var response = item.find("input").val();
            showFollowUps(response,item);
        });
        scales.data("initialized",true);


        var sliders = filterUninitialized(".slider");
        sliders.closest(".item").data("updateId","clear");
        sliders.on("mousedown touchstart",function(){
            var item = $(this).closest('.item');
            if (item.data("updateId")=="clear"){
                var updateId = setInterval(function(){
                    changeSliderValue(item);
                },100);
                showSliderValue(item);
                item.data('updateId',updateId);
            }
        });
        sliders.data("initialized",true);
        

        
        $(".SliderValue").css("opacity",1);
    
    
        var submitBtns = filterUninitialized(".submitForm");
        submitBtns.on('click',submitForm);
        submitBtns.data("initialized",true);
        
        
        var numbers = filterUninitialized(".number");
        numbers.on("mousedown touchstart",".change",startChange);
        numbers.on("mouseup touchend",".change",stopChange);
        numbers.on('keyup',"input",inputNum);
        numbers.data("initialized",true);

        $(".clearTableFilters").off("click",clearTableFilters);
        $(".clearTableFilters").on("click",clearTableFilters);

        var loadDxFormBtns = filterUninitialized($("#load_dx_form").find("li"));
        loadDxFormBtns.on("click",loadDxForm);
        loadDxFormBtns.data("initialized",true);

})

//update defaultDisplayCSS in form-builder.js to reflect any changes here
var itemCss = getDefaultCSS('item');
function UpdateCss(item){
    var type = (item.is(".item, .itemFU")) ? 'item' : 'section',
        dispObj = (item.data('display') != null) ? item.data('display') : getDefaultCSS(type);
    if (type == 'item'){
        var inline = dispObj.inline,
            dispClass = inline.includes("true") ? "inline" : "ownLine";
        
        dispClass = (item.is(".itemFU") && item.closest(".item").data('display').inline.includes("true")) ? "ownLine" : dispClass;
        item.removeClass('ownLine inline');
        item.addClass(dispClass);
        
        if (inline.includes("BR")){
            $("<div/>",{
                class:"break"
            }).insertBefore(item);
        }else{
            if (item.prev().hasClass("break")){
                item.prev().remove();
            }
        }
    }else{
        var dispNum = (dispObj.displayNumbers == "true") ? true : false;
        if (dispNum){item.removeClass("noNums")}
        else{item.addClass("noNums")}
    }
    $("#FormPreview").find(".break").text("new line break - only visible in preview").css({
        borderBottom:"1px solid var(--pink)",
        fontSize:"0.8em",
        color:"var(--pink)"
    })
    // item.css(cssObj);
}


function followup() {
    var response = $(this).data('value'), item = $(this).closest(".item, .itemFU");
    if (item.is(".item")){
        showFollowUps(response,item);
    }
}

function inputNum(){
    var v = $(this).val(), r = v.replace(/[^0-9.-]/g, "");
    if (v != r){
        alertBox("numbers only",$(this),"below","fade");
        $(this).val(r);
        return false;
    }
    var i = $(this).closest(".number");
    setTimeout(function(){
        checkNum(i);
    },3000)
    if ($(this).closest(".item, .itemFU").is('.item')){
        showFollowUps(v,$(this).closest('.item'));
    }
}
var mag = 1;
function Adj2(item,val,step,direction){
    var newStep = step;
    
    while(newStep<1){
        mag *= 10;
        newStep = step * mag;
    }
    step = step * mag;
    val = val * mag;
    
    if (direction == "down"){
        val = val - step;
    }else if (direction == "up"){
        val = val + step;
    }
    item.find("input").val((val/mag).toString());
    
    checkNum(item);
    var numInt = setInterval(function(){
        if (direction == "down"){
            val = val - step;
        }else if (direction == "up"){
            val = val + step;
        }
        item.find("input").val((val/mag).toString());
        checkNum(item);
    },100)
    
    item.data("numAdj",numInt);
}
function startChange(){
    var item = $(this).closest(".number");
    var step = item.find("input").data("step");
    var val = item.find("input").val(), direction;
    step = Number(step);
    val = Number(val);
    if ($(this).hasClass("down")){direction = "down"}
    else if ($(this).hasClass("up")){direction = "up"}
    Adj2(item,val,step,direction);
}
function stopChange(){
    var item = $(this).closest(".number");
    clearInterval(item.data("numAdj"));
    mag = 1;
    var response = item.find("input").val();
    if ($(this).closest(".item, .itemFU").is('.item')){
        showFollowUps(response,$(this).closest(".item"));
    }
}
function checkNum(target){
    //target is .number
    var i = target.find("input");
    var min = i.data("min"), max = i.data("max");
    var val = i.val();
    min = Number(min);
    max = Number(max);
    val = Number(val);        
    if (val < min){
        alertBox(min + " is the minimum",i,"below","fade");
        i.val(min);
        clearInterval(target.data('numAdj'));
    }else if (val > max){
        alertBox(max + " is the maximum",i,"below","fade");
        i.val(max);
        clearInterval(target.data('numAdj'));
    }
}

function showSliderValue(item){
    var showBool = $(item).find(".slider").hasClass("showValue");
    if (showBool){
        $(item).find(".SliderValue").fadeIn();
    }
}
function hideSliderValue(item){
    $(item).find(".SliderValue").fadeOut();
}
function changeSliderValue(item){
    var val = $(item).find('input').val();
    $(item).find(".SliderValue").text("Current Value: "+val);
}
        
function PainBox(xPos,yPos){
    var wrap = $('<div class="paincircle" data-left="'+xPos.toFixed(1)+'" data-top="'+yPos.toFixed(1)+'"></div>'),newBox;
    wrap.appendTo("#model");
    newBox = $("#model").find(".paincircle").last();
    newBox.css({
        "left": xPos+"px",
        "top": yPos+"px"            
    })
    updatePainBoxValue();
}
function updatePainBoxValue(){
    var paincircles = $(".paincircle"), values="", input = $("#painwrapper").closest(".item").find("#painLocation");
    paincircles.each(function(i,paincircle){
        var value = "X"+$(paincircle).data("left")+"_Y"+$(paincircle).data("top");
        if (values===""){
            values=value;
        }else{
            values= values +", "+ value;
        }
    })
    input.val(values);
}


function loadDxForm(){
    var target = $("#dxFormLoadTarget"), type = $(this).data("value"), uri = "/loadDxForm/"+type;
    blurElement($("#createDiagnosis"),"#loading");
    console.log(uri);
    target.load(uri,function(){
        unblurElement($("#createDiagnosis"));
    });
    attachConnectedModelInputs($("#createDiagnosis"));
}

function radio() {
    if ($(this).hasClass("active")===false) {
        $(this).closest(".radio").find("li").removeClass("active");
        $(this).addClass("active");
    } 
    var item = $(this).closest(".item, .itemFU");
    if (item.is(".item")){
        showFollowUps($(this).data("value"),item);
    }
}
function checkbox() {
    if ($(this).hasClass('disabled')){return false;}
    $(this).toggleClass("active");
    var item = $(this).closest(".item, .itemFU");
    if (item.is(".item") && item.find(".itemFU").length>0){
        var responses = $(this).closest(".answer").find(".active");
        var respArr=[];
        responses.each(function(){
            respArr.push($(this).data("value"));
        })
        responses = respArr.join("***");
        console.log(responses);
        showFollowUps(responses,$(this).closest(".item"));
    }
}  
function masterCheckbox(){
    var others = $(this).closest(".answer").find("li").not($(this));
    if (!$(this).hasClass("active")){
        others.removeClass('active').addClass("disabled");
    }else{
        others.removeClass("disabled");
    }
}
function showFollowUps(responseStr,item){
    if (item.is(".itemFU")){
        return false;
    }
    var FUs = $(item).find(".itemFU");
    var type = $(item).data("type");
    if ($.inArray(type,['radio','checkboxes','dropdown'])>-1){
        var responses = responseStr.split("***");
        FUs.each(function(i, FU){
            var dispBool = false;
            var conditions = $(FU).data("condition").split("***");
            for (var r=0;r<responses.length;r++){
                if ($.inArray(responses[r],conditions)>-1){
                    dispBool=true;
                }
            }
            if (dispBool){
                slideFadeIn($(FU));
            }else{
                slideFadeOut($(FU));
            }
        })
    }
    else if ($.inArray(type,['scale','number'])>-1){
        FUs.each(function(i,FU){
            var cond = $(FU).data("condition");
            cond = cond[0];
            var n, r = Number(responseStr);
            if (cond.includes("greater than")){
                n = Number(cond.substr(13));
                if (r>n){
                    slideFadeIn($(FU));
                }else{
                    slideFadeOut($(FU));
                }
            }else if (cond.includes("less than")){
                n = Number(cond.substr(10));
                if (r<n){
                    slideFadeIn($(FU));
                }else{
                    slideFadeOut($(FU));
                }
            }else if (cond.includes("equal to")){
                n = Number(cond.substr(9));
                if (r==n){
                    slideFadeIn($(FU));
                }else{
                    slideFadeOut($(FU));
                }
            }
        })
    }
    var showing = FUs.filter(function(){
        return $(this).css("display")!="none";
    })
    if (showing.length>0){
        setTimeout(function(){
            slideFadeIn(item.find(".itemFUList"));
        },500)
    }
    setTimeout(function(){
        showing = FUs.filter(function(){
            return $(this).css("display")!="none";
        })
        if (showing.length==0){
            slideFadeOut(item.find(".itemFUList"));
        }
    },550)
}

function checkForm(form){
    var obj = createSubmitObject(form);
    if (obj){
        return obj;
    }else{
        return false;
    }
}
function submitForm(){
    var formID = $(this).data("formname");
    if (createSubmitObject($("#"+formID))){
        return true;
    }else{
        return false;
    }
}
function createSubmitObject(form){
    var SubmitObj = {};
    SubmitObj['Sections'] = [];
    SubmitObj['UID'] = form.data('uid');
    SubmitObj['FormID'] = form.data('formid');
    SubmitObj['FormName'] = form.data('formname');
    var sections = form.find(".section").filter(":visible"), uid = form.data("uid"), check = false;
    sections.each(function(s, section){
        section = $(section), secName = section.find("h2").text();
        var ItemsArr = [], items = section.find(".item").filter(":visible");
        items.each(function(i, item){
            item = $(item);
            if (validateItem(item)){
                ItemsArr.push(getResponse(item));
                check = true;
            }
            else {
                check = false;
                var p = modalOrBody(item), m = parentModalOrBody(item);
                p.scrollTo(item);
                $.scrollTo("#Block",0);
                return false;
            }
        })
        if (check==false){return false;}
        var secObj = {
            Name: secName,
            Items: ItemsArr
        }
        SubmitObj['Sections'].push(secObj);
    })
    if (check){
        return SubmitObj;
    }else{
        return false;
    }
}
function scrollToInvalidItem(target){
    var p = modalOrBody(target), m = parentModalOrBody(target);
    p.scrollTo(target);
    $.scrollTo("#Block",0);
}
function validateItem(item){
        var t = item.data("type"), pass = true;

        if (!item.children(".question").find(".q").text().toLowerCase().includes("optional")){
            if (t==="text" && item.find("input").val().length==0){
                    alertBox("required",item.find(".answer"),"after","fade");
                    // $.scrollTo(item.find(".answer"));
                    scrollToInvalidItem(item.find('.answer'));
                    return false;
            }
            else if (t==="text box" && item.find("textarea").val().length==0){
                    alertBox("required",item.find(".answer"),"ontop","fade","2em,-1em");
                    scrollToInvalidItem(item.find('.answer'));
                    return false;
            }
            else if (t==="date" && item.find("input").val().length==0){
                    alertBox("required",item.find(".answer"),"after","fade");
                    scrollToInvalidItem(item.find('.answer'));
                    return false;
            }
            else if (t==="number" && item.find("input").val().length==0){
                    alertBox("required",item.find(".answer"),"after","fade");
                    scrollToInvalidItem(item.find('.answer'));
                    return false;
            }
            else if (t==="radio" && item.find(".active").length==0){
                    alertBox("required",item.find(".answer"),"after","fade");
                    scrollToInvalidItem(item.find('.answer'));
                    return false;
            }
            else if (t==="checkboxes" && item.find(".active").length==0){
                    alertBox("required",item.find(".answer"),"after","fade");
                    scrollToInvalidItem(item.find('.answer'));
                    return false;
            }
            else if (t==="dropdown" && item.find("option").filter(":selected").length>0 && item.find("option").filter(":selected").val()==""){
                    alertBox("required",item.find(".answer"),"after","fade");
                    scrollToInvalidItem(item.find('.answer'));
                    return false;
            }
            else if (t==="scale"){
                // no real reason to ever return false;
            }
            else if (t==="signature"){
                var sig = item.find(".signature"), sigData = sig.jSignature("getData","base30"), printedName = item.find(".printed").find("input") ;
                
                if (printedName.length>0 && printedName.val().length==0){
                    $.scrollTo(printedName);
                    alertBox("required",printedName,"after","fade","600%,-150%");
                    return false;
                }
                if (sigData[1]==""){
                    $.scrollTo(sig);
                    alertBox("required",sig,"ontop","fade","20%,-50%");
                    return false;
                }
            }
            
            var FUs = item.find(".itemFU").filter(":visible");
            FUs.each(function(i,FU){
                if (!validateItem($(FU))){
                    // console.log($(FU));
                    pass = false;
                }
            })
        }

        if (!pass){return false;}
        else{return true;}
    }
function getResponse(item){
    var t = item.data("type"), q = item.children(".question").find(".q").text(), r = [];

    if (t=="text"){
        r.push($.sanitize(item.children('.answer').find("input").val()));
    }
    else if (t=="text box"){
        r.push($.sanitize(item.children('.answer').find("textarea").val()));
    }
    else if (t=="date"){
        r.push(item.children('.answer').find("input").val());
    }
    else if (t=="number"){
        r.push(item.children('.answer').find("input").val() + " " + item.children('.answer').find(".label").text());
    }
    else if (t=="radio"){
        r.push(item.children('.answer').find('.active').data("value"));
    }
    else if (t=="checkboxes"){
        var Rs = item.children('.answer').find('.active');
        Rs.each(function(){
            r.push($(this).data("value"));
        })
    }
    else if (t=="dropdown"){
        r.push(item.children('.answer').find("option:selected").val());
    }
    else if (t=="scale"){
        r.push(item.children('.answer').find("input").val());
    }
    else if (t=="signature"){
        r.push(item.children('.answer').find(".signature").jSignature("getData","base30"));
        if (item.children('.answer').find(".printed").length>0){
            r.push(item.children('.answer').find(".printed").find("input").val());
        }
    }

    r = q.toLowerCase().includes("password") ? [] : r;
    // r = (r.length == 0) ? null : r;

    var ResponseObj = {
        type: t,
        question: q,
        response: r
    }
    var FUs = item.find(".itemFU").filter(":visible");
    if (FUs.length>0){
        var FUarr = [];
        FUs.each(function(){
            FUarr.push(getResponse($(this)));
        })
        ResponseObj['followups'] = FUarr;
    }
    return ResponseObj;
}
function justResponse(input){
    var r = getResponse(input.closest(".item, .itemFU"))['response']; 
    if (r.length == 0){
        return null;
    }
    else if (r.length > 1){
        return JSON.stringify(r);
    }else{
        return r[0];
    }
}

function fillAnswer(item,response){
    var t = $(item).data("type"), answer = $(item).children('.answer');
    if (!$.isArray(response)){
        response = response.split("***");
    }
    if ($.isArray(response) && response.length==1){
        response = response[0];
    }
    
    if ($.inArray(t,['radio','checkboxes'])>-1){
        $(item).find(".active").removeClass("active");
        if (!$.isArray(response)){
            answer.find("li").filter("[data-value='"+response+"']").click();
        }else{
            //console.log(response);
            for (x=0;x<response.length;x++){
                answer.find("li").filter("[data-value='"+response[x]+"']").click();
                //console.log(response[x]);
            }
        }
    }
    else if (t == 'text'){
        answer.find("input").val(response);
    }
    else if (t == 'text box'){
        answer.find("textarea").val(response);
    }
    else if (t == 'number'){
        var r = response.split(" ")[0];
        answer.find("input").val(r);
    }
    else if (t == 'date'){
        answer.find('input').val(response);
    }
    else if (t == "dropdown"){
        answer.find('select').val(response);
    }
    else if (t == 'signature'){
        if ($.isArray(response)){
            answer.find(".signature").jSignature("setData",response[0]);
            answer.find(".printed").find("input").val(response[1]);
        }else{
            answer.find(".signature").jSignature("setData",response);
        }
    }
    else if (t == 'scale'){
        answer.find("input").val(response);
    }
}

function unlockForm(){
    if ($("#UnlockForm").length==0){
        $("<div id='UnlockForm'><h4>Enter Unlock Phrase</h4><input><br><br><div class='button xsmall submit'>unlock</div><div class='button xsmall cancel'>cancel</div></div>").appendTo($("body"));
        $("#UnlockForm").on("click",".submit",checkPhrase);
        $("#UnlockForm").on("keyup","input",function(e){
            if (e.keyCode == "13"){$("#UnlockForm").find(".submit").click();}
        })
    }
    blurElement($("body"),"#UnlockForm");
    $("#UnlockForm").find("input").focus();
};
function checkPhrase(){
    var unlockPhrase, inputPhrase = $("#UnlockForm").find("input").val();
    if (inputPhrase===""){
        alertBox("required",$("#UnlockForm").find("input"));
        return false;
    }
    $(this).addClass("disabled");
    $("#UnlockForm").off("click",".submit",checkPhrase);
    blurModal($("#UnlockForm"),"#loading");
    getSessionVar('UnlockPassphrase');
    var check = setInterval(function(){
        if (yourSessionVar!==undefined){
            unlockPhrase = yourSessionVar;
            yourSessionVar=undefined;
            clearInterval(check);
            if (inputPhrase==unlockPhrase){
                slideFadeOut($("#loading, #UnlockFormBtn"));
                $("#loading").remove();
                $("#UnlockForm").html("<h4>Form Unlocked Temporarily</h4>If you would like to permanently unlock this form, you can do so in Form Settings.<br><br>") ;
                $("<div/>",{class:"button xsmall",text:"dismiss"}).appendTo($("#UnlockForm")).on("click",function(){unblurElement($("body")); $("#UnlockForm").remove()});
                slideFadeIn($(".locked"));
            }else{
                $("#loading").remove();
                alertBox("incorrect phrase",$("#UnlockForm").find("input"),"ontop","1500");
                unblurModal($("#UnlockForm"),1500,function(){
                    $("#UnlockForm").on("click",".submit",checkPhrase);
                    $("#UnlockForm").find(".submit").removeClass("disabled");
                });
            }
        }
    },50)
}


function fillForm(json,form){
    var sections = json['Sections'], itemObj = {};
    $.each(sections,function(s,section){
        $.each(section['Items'],function(i,item){
            if (item.type !== 'narrative'){
                itemObj[item.question] = item.response;
            }
            if (item.followups != undefined){
                $.each(item.followups,function(f,FU){
                    itemObj[FU.question] = FU.response;
                })
            }
        })
    })
    $.each(itemObj,function(question,answer){
        var i = form.find(".item, .itemFU").filter(function(){
            return $(this).children(".question").find(".q").text() == question;
        })
        fillAnswer(i,answer);
    })
}
function resetForm(form){
    form.find("input, textarea").val("");
    form.find(".radio, .checkboxes").find(".active").removeClass("active");
}

