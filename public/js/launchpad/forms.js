$(document).ready(function () {
    masterStyle();
})

function initializeNewForms(){
    initializeInputs();
    initializeFullScreenBtns();
    initializeItemCss();
    initializeCheckboxes();
    initializeRadios()
    initializeDropdowns();
    initializeImageClicks();
    initializeDatepickers();
    initializeSignatures();
    initializeTimes();
    initializeNumbers();
    initializeScales();
    initializeSliders();
    initializeSubmitBtns();
    initializeDxFormBtns();
    
    $(".clearTableFilters").off("click",clearTableFilters);
    $(".clearTableFilters").on("click",clearTableFilters);    
}
function initializeAdditionalNoteForm(autosaveType = null){
    var btn = filterByData('#AddNoteBtn','hasDynamicFx',false);
    btn.on('click',function(){
        addNote(autosaveType);
    });
    btn.data('hasDynamicFx',true);
}
function addNote(autosaveType = null){
    var form = $("#AddNote");
    if (!checkForm(form)) return false;
    var newNote = createNoteObj(), h4 = newNote.title ? "<h4>"+newNote.title+"</h4>" : "";
    $("<div/>",{
        class: 'note',
        html: h4+"<div>"+newNote.text+"</div>",
        data: newNote
    }).appendTo("#NoteList");
    $("#NoNotes").slideFadeOut();
    resetForm(form);
    if (autosaveType){
        if (autosaveType == 'Invoice') autoSaveInvoice();
        if (autosaveType == 'Note') autoSaveNote();
    }
}
function createNoteObj(){
    var title = justResponse($("#AddNote").find('.note_title'));
    return {
        title: (title == '') ? null : title,
        text: justResponse($("#AddNote").find('.note_details'))
    };
}
function initializeInputs(target = null, options = null){
    var inputs = filterUninitialized('input');
    inputs.on("keyup",function(e){
        if (!e){
            return false;
        }
        var k = e.keyCode;
        var f = $(this).closest("form");
        if (f.length>0){
            if (k == 13){
                f.find(".submitForm").click();
            }
        }
    });
    inputs.data('initialized',true);
}
function initializeFullScreenBtns(target = null, options = null){
    var fullscreenBtn = filterUninitialized(".btn-fullscreen");
    fullscreenBtn.on('click',function(){
        var p = modalOrBody($(this));
        p.scrollTo($(this).closest(".note-editor"),200);
    })
    fullscreenBtn.data('initialized',true);
}
function initializeItemCss(target = null, options = null){
    var items = filterUninitialized($(".formDisp").find(".item, .itemFU"));
    items.each(function(i,item){
        UpdateCss($(item));
    });
    items.data('initialized',true);
}
function initializeCheckboxes(target = null, options = null){
    var checkboxes = filterUninitialized(".checkboxes");
    var plzSelectNode = $("<div class='plzselect'>(select as many as apply)</div>");
    checkboxes.each(function(){
        plzSelectNode.clone().insertBefore($(this));
    })
    checkboxes.attr('tabindex','0').on("click","li",checkbox);
    checkboxes.find('li').filter(function(){
        return $.inArray($(this).data('value'),['no','none','never']) > -1;
    }).on('click',masterCheckbox);
    checkboxes.data("initialized",true);
}
function initializeRadios(target = null, options = null){
    var radios = filterUninitialized(".radio");
    // radios.attr('tabindex','0').on("click","li",radio);
    radios.on('click','li',radio);
    radios.data("initialized",true);
}
function initializeDropdowns(target = null, options = null){
    var dropdowns = filterUninitialized(".dropdown");
    dropdowns.on("change","select",function(){
        var response = $(this).val();
        var item = $(this).closest(".item, .itemFU");
        if (item.is(".item")){
            showFollowUps(response,item);
        }
    })
    dropdowns.data("initialized",true);
}
function initializeImageClicks(target = null, options = null){
    var imageclicks = filterUninitialized('.imageClick');
    imageclicks.on('touchstart mousedown', imageClick);
    imageclicks.each(function(){
        // var width = $(this).data('width') !== undefined ? $(this).data('width') : '10em', 
        var height = $(this).data('height') !== undefined ? $(this).data('height') : '10em';
        $(this).css({height:height});
        $(this).find('.undo').slideFadeOut();
    });
    imageclicks.data('initialized',true);
}
function initializeDatepickers(target = null, options = null){
    var datepickers = filterByData(".datepicker",'hasDatePicker',false);
    datepickers.each(function(){
        $(this).on("focus",function(e){
            e.preventDefault();
        })
        var min = $(this).data("mindate"), max = $(this).data("maxdate");
        
        var options = {};
        if (min!="" && max!=""){
            options['minDate']=min;
            options['maxDate']=max;
        }else{
            options['yearRange'] = "1920:c+1";
        }
        
        $(this).datepick(options);
    })
    datepickers.data("hasDatePicker",true);
}
function initializeSignatures(target = null, options = null){
    var signatures = $(".signature").filter(function(){
        return $(this).is(":visible") && $(this).find('.jSignature').length == 0;
    })
    signatures.each(function(){
        var inSubmission = $(this).closest('.submission').length == 1;
        $(this).jSignature();
        $(this).on("click",".clear",function(){
            $(this).parent().jSignature("reset");
        });
        if ($(this).closest('.answer').data('response') != undefined){
            fillAnswer($(this).closest('.item'),$(this).closest('.answer').data('response'));
            $(this).closest('.answer').removeData('response');
        }
        if (inSubmission) $(this).jSignature('disable');
    });
}
function initializeTimes(target = null, options = null){
    var times = filterUninitialized(".time");
    times.each(function(){
        var i = $(this).find("input"), o = i.data('options');
        i.timepicker(o);
        i.on('focus',function(){
            $(this).blur();
        })
    })
    times.data("initialized",true);
}
function initializeNumbers(target = null, options = null){
    var numbers = filterUninitialized(".number");
    numbers.on("mousedown touchstart",".change",startChange);
    numbers.on("mouseup touchend",".change",stopChange);
    numbers.on('keyup',"input",inputNum);
    currency = numbers.filter(function(){
        return $.inArray($(this).find('.label').text().trim(),currencyLabels) > -1;
    });
    
    numbers.data("initialized",true);
}
function initializeScales(target = null, options = null){
    var scales = filterUninitialized(".scale");
    scales.on("mouseenter",scaleMouseEnter);    
    scales.on("mouseleave touchend", scaleMouseLeave);
    scales.data("initialized",true);
}
function initializeSliders(target = null, options = null){
    var sliders = filterByData(".slider",'hasSliderFx',false);
    sliders.closest(".item, .itemFU").data("updateId","clear");
    sliders.on("mousedown touchstart",sliderStart);
    sliders.on("mouseup touchend",sliderStop);
    $(".SliderValue").css("opacity",1);
    hideSliderValue(sliders);
    sliders.data("hasSliderFx",true);
}
function initializeSubmitBtns(target = null, options = null){
    var submitBtns = filterUninitialized(".submitForm");
    submitBtns.on('click',submitForm);
    submitBtns.data("initialized",true);
}
function initializeDxFormBtns(target = null, options = null){
    var loadDxFormBtns = filterUninitialized($("#load_dx_form").find("li"));
    loadDxFormBtns.on("click",loadDxForm);
    loadDxFormBtns.data("initialized",true);
}

function scaleMouseEnter(){
    var item = $(this).closest('.item, .itemFU');
    clearTimeout(item.data("timeoutId"));
    changeSliderValue(item);
}
function scaleMouseLeave(){
    var item = $(this).closest('.item, .itemFU');
    var timeoutId = setTimeout(function(){
        hideSliderValue(item);
    }, 1000);
    
    clearInterval(item.data('updateId'));
    item.data("updateId","clear");
    item.data('timeoutId', timeoutId); 
    // var response = item.find("input").val();
    // showFollowUps(response,item);
}
function sliderStart(){
    var item = $(this).closest('.item, .itemFU');
    // console.log(item,item.data());
    if (item.data("updateId")=="clear"){
        var updateId = setInterval(function(){
            changeSliderValue(item);
        },100);
        showSliderValue(item);
        item.data('updateId',updateId);
    }
}
function sliderStop(){
    var item = $(this).closest('.item, .itemFU'), response = item.find("input").val();
    showFollowUps(response,item);
}

var pointerEventToXY = function (ev) {
    var out = {x: 0, y: 0};
    if (ev.type === 'touchstart' || ev.type === 'touchmove' || ev.type === 'touchend' || ev.type === 'touchcancel') {
        var touch = ev.originalEvent.touches[0] || ev.originalEvent.changedTouches[0];
        out.x = touch.pageX;
        out.y = touch.pageY;
    } else if (ev.type === 'mousedown' || ev.type === 'mouseup' || ev.type === 'mousemove' || ev.type === 'mouseover' || ev.type === 'mouseout' || ev.type === 'mouseenter' || ev.type === 'mouseleave') {
        out.x = ev.pageX;
        out.y = ev.pageY;
    }
    return out;
};
var imgClickCircle = $("<div/>",{
    class: 'indicatorWrap',
    html:"<div class='indicator'></div>"
});
function imageClick(ev){
    var windowCoords = pointerEventToXY(ev), image = $(ev.target).closest('.imageClick'), imageRect = image[0].getBoundingClientRect(), newCircle = imgClickCircle.clone(), imageCoords = {x:imageRect.left,y:imageRect.top},
        absCoords = {
            x: windowCoords.x - imageCoords.x,
            y: windowCoords.y - imageCoords.y - window.scrollY
        }, 
        percentCoords = {
            x: absCoords.x / imageRect.width * 100,
            y: absCoords.y / imageRect.height * 100
        }, count, undo = image.find('.undo');
    if (image.hasClass('disabled')) return false;
    if ($(ev.target).is('.undo')){
        var mostRecent = filterByData(image.find('.indicatorWrap'),'index','max');
        mostRecent.remove();
        count = image.find('.indicator').length;
    }else{
        newCircle.appendTo(image).css({left:percentCoords.x + "%",top:percentCoords.y + "%"});
        count = image.find('.indicator').length;
        newCircle.data({index:count,coordinates:percentCoords});
    }
    if (count > 0){undo.slideFadeIn();}
    else{undo.slideFadeOut();}
}

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
function adjustNumber(item,val,step,direction){
    // item is .number
    var newStep = step, d = item.data('forceDecimals'), decimals;
    if (d != undefined){
        decimals = d;
    }else{
        decimals = (val.countDecimals() > step.countDecimals()) ? val.countDecimals() : step.countDecimals();
    }
    
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
    item.find("input").val((val/mag).toFixed(decimals));
    
    checkNum(item);
    var numInt = setInterval(function(){
        if (direction == "down"){
            val = val - step;
        }else if (direction == "up"){
            val = val + step;
        }
        item.find("input").val((val/mag).toFixed(decimals));
        var count = item.data('changeCount');
        count++;
        item.data('changeCount',count);
        if (count > 20){
            setTimeout(function(){
                if (direction == "down"){
                    val = val - step;
                }else if (direction == "up"){
                    val = val + step;
                }
                item.find("input").val((val/mag).toFixed(decimals));
                var count = item.data('changeCount');
                count++;
                item.data('changeCount',count);
            },31)
            setTimeout(function(){
                if (direction == "down"){
                    val = val - step;
                }else if (direction == "up"){
                    val = val + step;
                }
                item.find("input").val((val/mag).toFixed(decimals));
                var count = item.data('changeCount');
                count++;
                item.data('changeCount',count);
            },93)
            setTimeout(function(){
                if (direction == "down"){
                    val = val - step;
                }else if (direction == "up"){
                    val = val + step;
                }
                item.find("input").val((val/mag).toFixed(decimals));
                var count = item.data('changeCount');
                count++;
                item.data('changeCount',count);
            },156)
            setTimeout(function(){
                if (direction == "down"){
                    val = val - step;
                }else if (direction == "up"){
                    val = val + step;
                }
                item.find("input").val((val/mag).toFixed(decimals));
                var count = item.data('changeCount');
                count++;
                item.data('changeCount',count);
            },218)
        }
        if (count > 10){
            setTimeout(function(){
                if (direction == "down"){
                    val = val - step;
                }else if (direction == "up"){
                    val = val + step;
                }
                item.find("input").val((val/mag).toFixed(decimals));
                var count = item.data('changeCount');
                count++;
                item.data('changeCount',count);
            },62)
            setTimeout(function(){
                if (direction == "down"){
                    val = val - step;
                }else if (direction == "up"){
                    val = val + step;
                }
                item.find("input").val((val/mag).toFixed(decimals));
                var count = item.data('changeCount');
                count++;
                item.data('changeCount',count);
            },188)
        }
        if (count > 4){
            setTimeout(function(){
                if (direction == "down"){
                    val = val - step;
                }else if (direction == "up"){
                    val = val + step;
                }
                item.find("input").val((val/mag).toFixed(decimals));
                var count = item.data('changeCount');
                count++;
                item.data('changeCount',count);
            },125)
        }
        checkNum(item);
    },250)
    
    item.data("numAdj",numInt);
}
function startChange(e){
    // alert(e.target);
    e.preventDefault();
    mag = 1;
    var item = $(this).closest(".number"), input = item.find('input'), step = input.data("step"), val = input.val(), direction;
    val = (val != "") ? val : input.attr('placeholder');
    item.data('changeCount',0);
    step = Number(step);
    val = Number(val);
    if ($(this).hasClass("down")){direction = "down"}
    else if ($(this).hasClass("up")){direction = "up"}
    adjustNumber(item,val,step,direction);
}
function stopChange(){
    var item = $(this).closest(".number");
    clearInterval(item.data("numAdj"));
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
    var showVal = $(item).find(".slider").hasClass("showValue");
    if (showVal){
        $(item).find(".SliderValue").slideFadeIn();
    }
}
function hideSliderValue(item){
    $(item).find(".SliderValue").slideFadeOut();
}
function changeSliderValue(item){
    var val = $(item).find('input').val();
    $(item).find(".SliderValue").text(val);
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
    var disabled = ($(this).hasClass("disabled") || $(this).parent().hasClass('disabled'));
    if (!disabled){
        if ($(this).hasClass("active")===false) {
            $(this).closest(".radio").find("li").removeClass("active");
            $(this).addClass("active");
        } 
        var item = $(this).closest(".item, .itemFU, .itemFUList");
        if (item.is(".item")){
            showFollowUps($(this).data("value"),item);
        }
        
    }
}
function checkbox() {
    var disabled = ($(this).hasClass("disabled") || $(this).parent().hasClass('disabled'));
    if (!disabled){
        $(this).toggleClass("active");
        var item = $(this).closest(".item, .itemFU, .itemFUList");
        if (item.is(".item") && item.find(".itemFU").length>0){
            var responses = $(this).closest(".answer").find(".active");
            var respArr=[];
            responses.each(function(){
                respArr.push($(this).data("value"));
            })
            responses = respArr.join("***");
            // console.log(responses);
            showFollowUps(responses,$(this).closest(".item"));
        }
    }else if ($(this).hasClass('disabled') && $(this).siblings().filter(".active").length > 0) {
        alertBox('current selection prevents more than one answer',$(this).closest('ul'),'below');
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
    if (item.is(".itemFU, .itemFUList")){
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
        // console.log(FUs);
        FUs.each(function(i,FU){
            var itemFU = $(FU), cond = itemFU.data("condition");
            var n = Number(cond.split(" ")[2]), r = Number(responseStr), dir = cond.split(" ")[0];

            if ((r > n && dir == 'greater')
                || (r == n && dir == 'equal')
                || (r < n && dir == 'less')){
                itemFU.slideFadeIn();
            }else{
                itemFU.slideFadeOut();
            }

            // if (cond.includes("greater than")){
            //     n = Number(cond.substr(13));
            //     if (r>n){
            //         slideFadeIn(itemFU);
            //     }else{
            //         slideFadeOut(itemFU);
            //     }
            // }else if (cond.includes("less than")){
            //     n = Number(cond.substr(10));
            //     if (r<n){
            //         slideFadeIn(itemFU);
            //     }else{
            //         slideFadeOut(itemFU);
            //     }
            // }else if (cond.includes("equal to")){
            //     n = Number(cond.substr(9));
            //     if (r==n){
            //         slideFadeIn(itemFU);
            //     }else{
            //         slideFadeOut(itemFU);
            //     }
            // }
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

function checkForm(form, includeInvisible = false, forceAutoSave = false){
    var obj = createSubmitObject(form, includeInvisible, forceAutoSave);
    // console.log(form);
    if (obj){
        return obj;
    }else{
        return false;
    }
}
function submitForm(){
    if (!$(this).data('submission') || $(this).hasClass('disabled')){
        return;
    }
    var formName = $(this).data("formname"), form = $(this).closest('.formDisp'), uid = form.data('uid'), formId = Number(form.data('formid'));
    var obj = checkForm(form);
    if (!obj){
        return false;
    }
    var dataObj = {
        jsonObj: obj
    };
    if ($.inArray(formId, [26]) > -1){
        dataObj = createSubmissionColumnObj(formId,form,dataObj);
    }
    // return false;
    blurTopMost("#loading");
    $.ajax({
        url: "/form/"+uid+"/submit",
        method: "POST",
        data: dataObj,
        success:function(data){
            if (data=='checkmark'){
                updateUidList();
                blurTopMost("#checkmark");
                delayedReloadTab(2000);
            }else{
                console.log(data);    
            }
            // console.log(data);
        }
    })
}
function createSubmissionColumnObj(formId, form, dataObj){
    if (formId == 26){
        var gender = (justResponse(form.find(".gender")) == 'other') ? justResponse(form.find(".gender").closest('.item').find(".other")) : justResponse(form.find(".gender")),
            sex = (justResponse(form.find(".biological_sex")) == 'other') ? justResponse(form.find(".biological_sex").closest('.item').find(".other")) : justResponse(form.find(".biological_sex")),
            pronouns = (justResponse(form.find(".preferred_pronouns")) == 'other') ? justResponse(form.find(".preferred_pronouns").closest('.item').find(".other")) : justResponse(form.find(".preferred_pronouns"));

        dataObj['model'] = "Patient";
        dataObj['uid'] = JSON.parse($("#uidList").text())['Patient'];
        dataObj['columnObj'] = 
        {
            gender: gender,
            sex: sex,
            pronouns: pronouns,
            mailing_address: justResponse(form.find(".mailing_address"))
        }
    }
    return dataObj;
}
function createSubmitObject(form, includeInvisible = false, forceAutoSave = false){
    var SubmitObj = {};
    SubmitObj['Sections'] = [];
    SubmitObj['UID'] = form.data('uid');
    SubmitObj['FormID'] = form.data('formid');
    SubmitObj['FormName'] = form.data('formname');
    var sections = includeInvisible ? form.find(".section") : form.find(".section").filter(":visible"), uid = form.data("uid"), check = false;
    sections.each(function(s, section){
        section = $(section), secName = section.find("h2").first().text();
        var ItemsArr = [], items = includeInvisible ? section.find(".item") : section.find(".item").filter(":visible");
        items.each(function(i, item){
            item = $(item);
            if (!forceAutoSave && validateItem(item)){
                ItemsArr.push(getResponse(item));
                check = true;
            }else if (forceAutoSave){
                ItemsArr.push(getResponse(item));
                check = true;
            }
            else {
                check = false;
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
function scrollToInvalidItem(item, type = null){
    console.log(item);
    var type = type ? type : item.data('type'), target, message = 'required', location = 'after';
    if ($.inArray(type,['text','date','time','number']) > -1){
        target = item.children('.answer').find('input');
    }else if (type == 'text box'){
        target = item.children('.answer').find('textarea');
        location = 'ontop';
    }else if ($.inArray(type,['radio','checkboxes']) > -1){
        target = item.children('ul');
        location = 'ontop';
    }else if (type == 'dropdown'){
        target = item.children('.answer').find('select');
    }else if (type == 'bodyclick'){
        target = item.children('.imageClick');
        location = 'ontop';
    }else if (type == 'signature'){
        target = item.is('.answer') ? item.children('.signature') :item.children('.answer').find('.signature');
        location = 'ontop';
    }
    alertBox(message,target,location,2500);
    var p = modalOrBody(target), m = parentModalOrBody(target),
        dif = Math.abs(p.outerHeight(true) - p[0].scrollHeight);

    p.scrollTo(target);
    // console.log(target);
    // if (!p.is("body") && dif > 10){
    //     p.scrollTo(target);
    // }else{
    //     p.scrollTo(target);
    // }
}
function validateItem(item, type = null){
    var t = (!type) ? item.data("type") : type, pass = true;

    if (item.data('required')){
        if ($.inArray(t,['text','date','time','number']) > -1 && item.find("input").val().length==0){
            scrollToInvalidItem(item);
            return false;
        }else if (t==="text box" && item.find("textarea").val().length==0){
            scrollToInvalidItem(item);
            return false;
        }else if ($.inArray(t,['radio','checkboxes']) > -1 && item.find(".active").length==0){
            scrollToInvalidItem(item);
            return false;
        }else if (t=='dropdown' && item.find("option:selected").val() == ""){
            scrollToInvalidItem(item);
            return false;
        }else if (t==="scale"){
            // no real reason to ever return false;
        }else if (t==="signature"){
            var sig = item.find(".signature"), sigData = sig.jSignature("getData","base30"), printedName = item.find(".printed").find("input") ;
            
            if ((printedName.length>0 && printedName.val().length==0) || sigData[1] == ""){
                scrollToInvalidItem(item,'signature');
                return false;
            }
        }else if (t==='bodyclick' && getImageClickData(item).length == 0){
            scrollToInvalidItem(item);
            return false;
        }
        
        var FUs = item.find(".itemFU").filter(":visible");
        FUs.each(function(i,FU){
            if (!validateItem($(FU))){
                pass = false;
            }
        })
    }

    if (!pass){return false;}
    else{return true;}
}
function getResponse(item, type = null){
    var t = type ? type : item.data("type"), 
        q = item.children(".question").find(".q").text(), r = [];

    if (t=="text" || t == 'time'){
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
        var val = item.children('.answer').find("option:selected").val();
        r.push(val);
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
    else if (t=='bodyclick'){
        r = getImageClickData(item);
        // console.log(r);
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
function getImageClickData(item){
    // console.log(item,item.find(".indicatorWrap"));
    var indicators = item.find('.indicatorWrap'), indicatorArr = [], image = item.find('.imageClick'), w = image.width(), h = image.height();
    indicators.each(function(){
        var l = Number($(this).css('left').replace("px","")), t = Number($(this).css('top').replace("px",""));
        if (isNaN(l) || isNaN(t)) return false;
        indicatorArr.push({
            left: l / w * 100 + "%",
            top: t / h * 100 + "%"
        });
    })
    console.log(indicatorArr);
    return indicatorArr;
}
function justResponse(input, asArray = false, type = null, allowInvisible = false){
    if (!input.is(":visible") && !allowInvisible){
        console.log("invis");
        return null;
    }
    var r;
    if (type){
        r = getResponse(input.parent(),type)['response'];
    }else{
        r = getResponse(input.closest(".item, .itemFU"))['response'];   
    }
    
    if (r.length == 0){
        console.log('none');
        return null;
    }
    else if (r.length > 1){
        return asArray ? r : JSON.stringify(r);
    }else{
        return asArray ? r : r[0];
    }
}
function matchingLI(answer,response){
    response = response.replace("'","");
    var match = answer.find("li").filter(function(){
        return $(this).data('value').replace("'","") == response;
    });
    // console.log(match.closest('ul'),match.closest('ul').hasClass('disabled'),response);
    return match;
}
function fillAnswer(item,response){
    // console.log(item,response);
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
            matchingLI(answer,response).click();
        }else{
            for (x=0;x<response.length;x++){
                matchingLI(answer,response[x]).click();
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
        var array = response.split(' '), r = !Number.isNaN(array[0]) ? Number(array[0]) : null;
        if (!r) return false;
        answer.find("input").val(r);
    }
    else if (t == 'date' || t == 'time'){
        answer.find('input').val(response);
    }
    else if (t == "dropdown"){
        answer.find('select').val(response);
    }
    else if (t == 'signature'){
        var hasPrintedName = ($.isArray(response) && typeof response[0] == 'string' && !response[0].includes('image/jsignature'));
        if (!hasPrintedName && response[1] == null) return;
        if (hasPrintedName){
            // console.log(response[0]);
            answer.find(".signature").jSignature("setData", "data:"+response[0].join(","));
            answer.find(".printed").find("input").val(response[1]);
        }else{
            answer.find(".signature").jSignature("setData","data:"+response.join(","));
        }
        answer.data('response',response);
    }
    else if (t == 'scale'){
        answer.find("input").val(response);
        answer.find('input').mouseup();
    }
    else if (t == 'bodyclick'){
        if (response.length == 0) return false;
        console.log("fill", response);
        var image = item.find('.imageClick'), undo = image.find('.undo');
        image.data('response',response);
        if (!image.is(":visible")) image.data('refresh',true);
        $.each(response,function(c,circle){
            var newCircle = imgClickCircle.clone();
            newCircle.appendTo(image);
            newCircle.data({index:c, css:circle});
            newCircle.css(circle);
            // imgClickCircle.clone().appendTo(image).css(circle).data('index',c);
        })
        undo.slideFadeIn();
    }
}
function disableForm(form){
    form.find('input, textarea').attr('readonly',true);
    form.find('.signature').filter(":visible").each(function(){
        $(this).jSignature('disable');
    });
    form.find('.number').off("mousedown touchstart",".change",startChange);
    form.find('.number').off("mouseup touchend",".change",stopChange);
    form.find('.number').off('keyup',"input",inputNum);
    form.find('.signature').find('.clear').hide();
    form.find('.radio, .checkboxes, .imageClick, .number').addClass('disabled');
    form.find('.button.cancel').text("close");
    form.find('.slider, select').attr('disabled',true);
    form.find('.datepicker').each(function(){
        $(this).datepick('disable');
    })
}
function enableForm(form){
    alert('enableForm in forms.js......not used much');
    // form.find('input, textarea').removeAttr('readonly');
    // form.find('.signature').filter(":visible").each(function(){
    //     $(this).jSignature();
    // });
    // form.find('.number').on("mousedown touchstart",".change",startChange);
    // form.find('.number').on("mouseup touchend",".change",stopChange);
    // form.find('.number').on('keyup',"input",inputNum);
    // form.find('.signature').find('.clear').show();
    // form.find('.radio, .checkboxes, .imageClick').removeClass('disabled');
    // form.find('.button.cancel').text("cancel");
    // form.find('.slider').removeAttr('disabled');

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
    if (json == undefined || form.data('filled')) return false;
    var sections = json['Sections'];
    $.each(sections,function(s,savedSection){
        var sectionOnForm = form.find(".section").filter(function(){
            
            var t = $(this).find("h2").first().text(), ot = t, otsplice = t;
            if ($(this).find("h2").first().data('originaltext') != undefined){
                ot = $(this).find("h2").first().data('originaltext');
                otsplice = $(this).find("h2").first().data('originalsplice')
            }
            return ((t == savedSection.Name) || (ot == savedSection.Name) || savedSection.Name.includes(otsplice)) ; 
        });
        $.each(savedSection['Items'],function(i,savedItem){
            // if (savedItem.type !== 'narrative' && savedItem.type !== 'signature'){
            if (savedItem.type !== 'narrative'){
                var itemOnForm = sectionOnForm.find(".item").filter(function(){return $(this).children(".question").find(".q").text().trim() == savedItem.question.trim();});
                if (savedItem.type == 'bodyClick') console.log(savedItem.response);
                if (savedItem.response != undefined) fillAnswer(itemOnForm,savedItem.response);
                if (savedItem.followups != undefined){
                    $.each(savedItem.followups,function(f,savedFU){
                        var fuOnForm = itemOnForm.find(".itemFU").filter(function(){return $(this).children(".question").find(".q").text().trim() == savedFU.question.trim();});
                        if (savedFU.response != undefined) fillAnswer(fuOnForm,savedFU.response);
                    })
                }
            }
        })
    })
    form.data('filled',true);
}
function minifyForm(form){
    form.addClass('minified');
    form.find('.item').children('br').remove();
}
function resetForm(form){
    form.find("input, textarea").val("");
    form.find(".radio, .checkboxes").find(".active").removeClass("active");
}

