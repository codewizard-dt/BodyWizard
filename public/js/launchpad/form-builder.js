// $(document).ready(function(){
//     var defaultDisplayCSS = {"inline":"false"};

//     // masterStyle();

//     // $("#UnlockFormBtn").on("click",unlockForm);
//     // $("#FormName").find(".input").show();
//     // $("#FormName").find(".save").css("display","inline-block");
//     // $("#FormName").find(".edit").hide();
//     // $("#PreviewFormBtn").on('click',liveFormPreview);
//     // $("#AddSection").on("click",".add",addSection);
//     // $("#Sections").on("click",'.addQuestion, .addText',showAddItem);
//     // $("#Sections").on('click','.insertQuestion, .insertText',showInsertItem);
//     $(".summernote").summernote({
//         height: 200,
//         placeholder: 'Enter your text here',
//         toolbar: [
//           ['style', ['style']],
//           ['font', ['bold', 'underline', 'italic', 'strikethrough', 'clear']],
//           ['fontname', ['fontname']],
//           ['fontsize'],
//           ['color', ['color']],
//           ['para', ['ul', 'ol', 'paragraph', 'height']],
//           ['insert', ['link', 'picture','hr']],
//           ['view', ['fullscreen', 'codeview', 'undo', 'redo', 'help']],
//         ],
//     });
//     // $("#Sections").on("click",".deleteSection",deleteSection);
//     // $("#FormBuilder").on("click",".toggle",toggleClick);
//     // $("#FormBuilder").on("click",".addFollowUp",showAddFollowUp);
//     // $("#FormBuilder").on('click',".addFollowUpText",showAddFollowUpText);
//     // $("#FormBuilder").on("click",".addSectionBtn",function(){
//     //     blur($("body"),"#AddSection");
//     // });
//     // $("#Type").on("change",resetType);
//     // $("#Type").change();
//     // $("#Options").on("click",".add",addOption);
//     // $("#Options").on("keyup","input",optionsEnterKey); 
//     // $("#AddItem, #AddText").on("click",".save",saveItem);
//     // $("#AddItem").on("click",".cancel",addItemCancel)

//     // $("#AddText").on("click",".cancel",resetAddText);
//     // $(".TimeRestrict").find("li").filter("[data-value='allow any time']").on("click",masterCheckbox);
//     // $(".TimeRestrict").find("li").on('click',toggleTimeOptions);
//     // $("#TimeList").find(".flexbox").children().hide();
        
//     // $("#NoRestriction").on("click",toggleDateRestrictions);
//     // $("#NoRestriction").click();
    
//     // $("#FormBuilder").on("click",".hideFUs",toggleItemList);

//     // $("#SectionOptions").on("click","li",scrollToSection);
//     // $("#SectionOptions").on('click',".up, .down",updateSecOrder);

//     // var sizeOption = $("#BodyClickList").find(".imageClickSize");
//     // sizeOption.find('li').data('target',$("#BodyClickOptions").find(".bodyClickSample"));
//     // sizeOption.on('click','li',toggleImageClickSize);
//     // sizeOption.find('li').filter("[data-value='medium']").click();
        
//     // if ($("#formdata").data("json")!=undefined){loadFormData();}
// })
// function liveFormPreview(){
//     var uid = $("#formdata").data('formuid');
//     blur($("body"),"#loading");
//     $("#FormPreview").load("/forms/"+uid+"/preview",function(){
//         initializeNewForms();
//         blur($('body'),"#FormPreview");
//         $("#FormPreview").find(".cancel").text("close");
//     })
// }
// function addSection(){
//     log(`use forms.create.display.section instead`);
//     return;
//     var name = $.sanitize($("#SectionName").val());
//     var names = $("#Sections").find(".section").find(".sectionName").find("span");
//     var nameArray = [];
//     names.each(function(){
//         nameArray.push($(this).text().toLowerCase());
//     })        
    
//     if (name==""){
//         alertBox("type in section name",$("#SectionName"),"after","fade","-4em,-50%");
//         return false;
//     }else if ($.inArray(name.toLowerCase(),nameArray)>-1){
//         alertBox("name already in use",$("#SectionName"),"after","fade","-4em,-50%");
//         return false;
//     }
//     var sections = $("#Sections").find(".section");
//     if (sections.length==0){
//         $(sectionNode).appendTo("#Sections");
//     }else{
//         $(sectionNode).insertAfter(sections.last());
//     }
//     var sections = $("#Sections").find(".section");
//     var num = sections.length;
//     var secStr = "";
    
//     // if (num>1){
//         section = sections.last();
//     // }

//     section.find(".sectionName").find('span').text(name);
//     // section.find(".showByDefault").find('span').text(show);
//     section.find(".selectMultiple").find(".show").on("click",multiItemOptions);
//     section.find(".selectMultiple").find(".hide").on("click",hideMultiItemOptions);
//     section.find(".selectMultiple").find(".copy").on("click",copyMultiple);
//     section.find(".selectMultiple").find(".delete").on("click",deleteMultiple);

//     slideFadeIn(section);
    
//     var Items = [];
//     section.data("items",Items);
    
//     $("#SectionName").val("");
//     // slideFadeOut($("#AddSection"));
//     // unblur($("body"));
    
//     updateSections();
// }
// function showAddItem(){
//     var addNode = $(this).is(".addQuestion") ? "#AddItem" : "#AddText",
//         t = $(this).closest(".section").find(".itemOptions");
//     $("#AddItemProxy").insertBefore(t);
//     // $("#NarrativeOptions").show();
//     if (addNode == '#AddText'){
//         $("#NarrativeOptions").show();
//     }else{
//         $("#NarrativeOptions").hide();
//         $("#FollowUpOptions").hide();
//         resetAddItem();
//     }
//     blur($("body"),addNode);
// }
// function showInsertItem(){
//     var addNode = $(this).is(".insertQuestion") ? "#AddItem" : "#AddText";
//     var t = $(this).closest(".insertProxy"), item;
//     if (t.parent().data('contains') == 'item'){
//         $("#FollowUpOptions").hide();
//     }else{
//         $("#FollowUpOptions").appendTo($(addNode).find(".message")).show();
//         item = $(this).closest('.item');
//         showConditionOptions(item);
//         if (!item.find(".targetFUs").is(":visible")){
//             item.find(".hideFUs").click();
//         }
//     }
//     if (addNode == '#AddText'){$("#NarrativeOptions").show();}else{$("#NarrativeOptions").hide();}
//     $("#AddItemProxy").appendTo(t);
//     resetAddItem();
//     blur($("body"),addNode);
// }
// function deleteSection(){
//     var target = $(this).closest(".section"), name = target.find('.sectionName').find(".value").text();
//     $("#Warn").find(".message").html('<h2>Warning!</h2><div>Are you sure you want to delete "'+name+'"? This will delete all of the questions and followups it contains.</div>');
//     $("#Warn").find(".submit").text("Delete section and its questions");
//     blur($("body"),"#Warn");
//     var check = setInterval(function(){
//         if (confirmBool == true){
//             slideFadeOut(target)
//             setTimeout(function(){
//                 $(target).remove();
//                 updateSections();
//                 autoSaveForm();
//             },600);
//             confirmBool = undefined;
//             clearInterval(check);
//             unblur($("body"));
//         }else if (confirmBool == false){
//             confirmBool = undefined;
//             clearInterval(check);                
//         }
//     },100)
// }
// function toggleClick(){
//     var toggle = $(this), p = toggle.closest('.editable, .question');
//     if (p.hasClass("editable")){
//         editableToggleClick(toggle);
//     }
//     else if (p.hasClass("question")){
//         questionToggleClick(toggle);
//     }
// }
// function questionToggleClick(toggle){
//     log(`don't use questionToggleClick`);
//     return;
//     var p = toggle.closest('.editable, .question');
//     var question = p.data("question"), k = p.data("key"), type = p.data("type"), options = p.data("options"), condition = p.data("condition"), required =p.data('required'), section = toggle.closest(".section"), item = p.closest(".item, .itemFU");

//     if (required === undefined){required = "true"}
//     else{required = (required === true) ? "true" : "false";}

//     if (toggle.hasClass("edit")){
//         var proxy = $("#AddItemProxy"), addNode = (type == 'narrative') ? "#AddText" : "#AddItem";

//         if (item.is(".itemFU")){
//             addNode = (item.find(".question").data('type') == 'narrative') ? "#AddText" : "#AddItem";

//             proxy.appendTo(item);
//             blur($("body"),addNode);
//             showConditionOptions($(item).closest(".item"));
//             $("#FollowUpOptions").appendTo($(addNode).find(".message")).show();
//         }else if (item.is(".item")){
//             $("#FollowUpOptions").hide();
//             item = item.find(".ItemsFU");
//             proxy.insertBefore(item);
//             blur($("body"),addNode);
//         }

//         if (type != 'narrative'){
//             $("#Text").val(question);
//             $("#Type").val(type);
//             $("#Type").change();
//             $("#Required").val(required);          
//             if (options.placeholder != undefined){
//                 $(".textPlaceholder, .textAreaPlaceholder").val(options.placeholder);
//             }
//         }else{
//             slideFadeIn($("#NarrativeOptions"));
//             var markup = options.markupStr;
//             $("#NarrativeOptions").find(".note-placeholder").hide();
//             $("#NarrativeOptions").find(".note-editable").html(markup);
//         }
        
//         t = toggle.closest(".item").find(".question").data('type');
        
//         if (condition != undefined && (t == "number" || t == "scale")){
//             condition = condition[0]
//             var arr = condition.split(" "), num = arr[2], dir = arr[0]+" "+arr[1];
//             $("#FollowUpOptions").find("input").val(num);
//             $("#FollowUpOptions").find("select").val(dir);
//         }else{
//             $("#FollowUpOptions").resetActives();
//             var matches = $("#FollowUpOptions").find("li").filter(function(){
//                 return ($.inArray($(this).data('value'),condition) > -1);
//             });
//             matches.addClass('active');
//         }

//         if ($.isPlainObject(options)){
//             var items = $("#AddItem").find("input").filter(":visible");
//             items = items.add($("#AddItem").find("select").filter(":visible"));
//             if (t == "time"){
//                 $("#TimeList").find("li").each(function(){
//                     if (toggle.hasClass("active")){toggle.click();}
//                 })
//                 $.each(options,function(key, val){
//                     var obj = {
//                         all:"allow any time",
//                         minTime:"set range",
//                         step:"set interval",
//                         setTime:"set initial value"
//                     }
//                     $("#TimeOptions").find("#"+key).val(val);
//                     $("#TimeOptions").find("li").filter("[data-value='"+obj[key]+"']").click();
//                 })
//             }else if(t == 'date'){
//                 // var beginYear = options.yearRange.split(':')[0], endYear = options.yearRange.split(':')[1],
//                 var minDate = options.minDate, maxDate = options.maxDate, minNum, minType, maxNum, maxType, minDir, maxDir;
//                 if (minDate != null){
//                     minNum = options.minDate.substring(1,options.minDate.length - 1);
//                     maxNum = options.maxDate.substring(1,options.maxDate.length - 1);
//                     minType = options.minDate.substring(options.minDate.length - 1,options.minDate.length);
//                     maxType = options.maxDate.substring(options.maxDate.length - 1,options.maxDate.length);
//                     minDir = options.minDate.charAt[0] == '-' ? 'before' : 'after';
//                     maxDir = options.maxDate.charAt[0] == '-' ? 'before' : 'after';
//                     var guide = {"m":"months","d":"days","w":"weeks","y":"years"};
//                     minType = guide[minType];
//                     maxType = guide[maxType];
//                     $("#DateOptions").find(".minNum").val(minNum);
//                     $("#DateOptions").find(".maxNum").val(maxNum);
//                     $("#DateOptions").find(".minType").val(minType).change();
//                     $("#DateOptions").find(".maxType").val(maxType).change();
//                     $("#DateOptions").find(".minDir").val(minDir).change();
//                     $("#DateOptions").find(".maxDir").val(maxDir).change();
//                     if ($("#NoRestriction").is(":checked")){$("#NoRestriction").click();}                            
//                 }else{
//                     if (!$("#NoRestriction").is(":checked")){$("#NoRestriction").click();}
//                 }
//             }else if (t == 'scale'){
//                 $("#scalemin").val(options['min']);
//                 $("#scalemax").val(options['max']);
//                 $("#initial").val(options['initial']);
//                 $("select").filter('[name="dispVal"]').val(options['displayValue']).change();
//                 $("select").filter('[name="dispLabel"]').val(options['displayLabels']).change();
//                 for (var prop in options){
//                     var val = options[prop];
//                     items.filter(function(){
//                         return $(this).attr("name") == prop;
//                     }).val(val);
//                 }
//             }else if (t == 'text'){
//                 var placeholder = (options != undefined && options['placeholder'] != undefined) ? options['placeholder'] : "";
//                 $(".textPlaceholder").val(placeholder);
//             }else if (t == 'text box'){
//                 var placeholder = (options != undefined && options['placeholder'] != undefined) ? options['placeholder'] : "";
//                 $(".textAreaPlaceholder").val(placeholder);
//             }else if (t == 'bodyclick'){
//                 var size = findObjKey(imageSizeDecode, options.height);
//                 size = size.split("x").join("x-");
//                 $("#BodyClickList").find("li").filter("[data-value='"+size+"']").click();
//             }
//             else{
//                 // if (t == 'number'){console.log(options)}
//                 for (var prop in options){
//                     var val = options[prop];
//                     items.filter(function(){
//                         return $(this).attr("name") == prop;
//                     }).val(val);
//                 }
//             }
//         }
//         else if ($.isArray(options)){
//             var optionCount = options.length, 
//                 inputCount = $("#OptionsList").find(".option").length,
//                 dif = optionCount - inputCount,
//                 extraCount = -dif;
//             for (x = 0; x < dif; x++){$("#OptionsList").find(".add").click();}
//             for (x = 0; x < extraCount; x++){$("#OptionsList").find(".option").last().remove();}
//             var inputs = $("#OptionsList").find("input");
//             for (x = 0; x < optionCount; x++){
//                 var val = options[x];
//                 $(inputs[x]).val(val);
//             }
//         }
//     }
//     else if (toggle.hasClass("delete")){
//         var target = p, itemOrFU = toggle.closest(".itemFU, .item"), countFUs = itemOrFU.find(".itemFU").length,
//             warningText = (countFUs == 1) ? "There is currently <u>1 followup</u> under this question." : "There are currently <u>"+countFUs+" followups</u> under this question.";
//         if (itemOrFU.is(".item") && countFUs > 0){
//             $("#Warn").find(".message").html("<h2>ATTENTION</h2><div>Deleting this question will also delete all of the followup questions attached to it. "+warningText+" This cannot be undone.</div>");
//             $("#Warn").find(".confirmY").text("delete question and followups");
//             blur($("body"),"#Warn");
//         }else{
//             $("#Warn").find(".message").html("<h2>ATTENTION</h2><div>Are you sure you want to delete this question?</div>");
//             $("#Warn").find(".confirmY").text("delete question");
//             blur($("body"),"#Warn");
//         }
//         var check = setInterval(function(){
//             if (confirmBool == true){
//                 slideFadeOut(item);
//                 setTimeout(function(){
//                     $("#AddItem").appendTo("#FormBuilder").hide();
//                     var Items = section.data("items");
//                     if (item.is(".itemFU")){
//                         var kP = p.closest(".item").find(".question").data('key');
//                         Items = Items[kP].followups;
//                     }
//                     Items.splice(k,1);
//                     updateItems(section);
//                     autoSaveForm();
//                 },500);
//                 $(".zeroWrap.a").remove();
//                 confirmBool = undefined;
//                 unblurAll();
//                 clearInterval(check);
//             }else if (confirmBool == false){
//                 unblur(item);
//                 // $(".zeroWrap.a").remove();
//                 confirmBool = undefined;
//                 clearInterval(check);                
//             }
//         },100)
//     }
//     else if (toggle.hasClass("copy")){
//         var Items = section.data("items");
//         if (item.is(".itemFU")){
//             var kP = p.closest(".item").find(".question").data('key');
//             Items = Items[kP].followups;
//         }
//         var copy = {};
//         $.extend(true,copy,Items[k]);
//         copy.question = copy.question + " COPY";
//         // console.log(copy);
//         Items.splice(k+1,0,copy);
//         updateItems(section);
//         autoSaveForm();
//     }  
// }
// function showAddFollowUp(){
//     $("#AddItemProxy").insertBefore($(this));
//     $("#Type").val("text");
//     $("#Type").change();
//     $("#FollowUpOptions").show();
//     blur($("body"),"#AddItem");
//     var item = $(this).closest(".item"), question = item.find(".q").text();
//     // console.log(question);
//     $("#AddItem").find("h2").first().html('"'+question+'" - ' + "<span class='pink'>Follow Up Question</span>");
//     $("#FollowUpOptions").appendTo($("#AddItem").find(".message"));
//     $("#FollowUpOptions").find(".switch").text("When To Ask This Question");
//     showConditionOptions(item);
//     if (!item.find(".targetFUs").is(":visible")){
//         item.find(".hideFUs").click();
//     }
// }
// function showAddFollowUpText(){
//     $("#AddItemProxy").insertBefore($(this));
//     resetAddText();
//     blur($("body"),"#AddText");
//     var item = $(this).closest(".item");
//     $("#FollowUpOptions").insertAfter($("#NarrativeOptions")).show();
//     $("#FollowUpOptions").find(".switch").text("When To Display This Text");
//     showConditionOptions(item);
//     if (!item.find(".targetFUs").is(":visible")){
//         item.find(".hideFUs").click();
//     }
// }
// // function resetType(){
// //     var needOptions = ['radio','checkboxes','dropdown'], value = $(this).val();
// //     if ($.inArray(value,needOptions)>-1){slideFadeIn($("#Options"));}else{slideFadeOut($("#Options"));}
// //     if (value == "number"){slideFadeIn($("#NumberOptions"));}else{slideFadeOut($("#NumberOptions"));}
// //     if (value == "date"){slideFadeIn($("#DateOptions"));}else{slideFadeOut($("#DateOptions"));}
// //     if (value == "text"){slideFadeIn($("#TextOptions"));}else{slideFadeOut($("#TextOptions"));}
// //     if (value == "bodyclick"){slideFadeIn($("#BodyClickOptions"));}else{slideFadeOut($("#BodyClickOptions"));}
// //     if (value == "text box"){slideFadeIn($("#TextBoxOptions"));}else{slideFadeOut($("#TextBoxOptions"));}
// //     if (value == 'time'){slideFadeIn($("#TimeOptions"));}else{slideFadeOut($("#TimeOptions"));}
// //     if (value == "scale"){slideFadeIn($("#ScaleOptions"));}else{slideFadeOut($("#ScaleOptions"));}
// //     if (value == "signature"){slideFadeIn($("#SignatureOptions"));}else{slideFadeOut($("#SignatureOptions"));}
// // }
// // function toggleTimeOptions(){
// //     if ($(this).hasClass("disabled")){return false;}
// //     var c = $(this).data('value'), divs = $("#TimeList").find('.flexbox').children("div"), match = divs.filter("[data-condition='"+c+"']");
// //     if (match.length==0 && !$(this).hasClass("active")){
// //         slideFadeOut(divs);
// //     }else{
// //         if ($(this).hasClass("active")){
// //             slideFadeOut(match);
// //         }else{
// //             slideFadeIn(match);
// //         }
// //     }
// // }
// // function toggleDateRestrictions(){
// //     if ($(this).is(":checked")){
// //         $("#DateOptions").find(".blockable").slideFadeOut();
// //     }else{
// //         $("#DateOptions").find(".blockable").slideFadeIn();
// //     }
// // }
// function toggleItemList(){
//     log(`don't use toggleItemList`);
//     return;
//     var target = $(this).parent().children(".targetFUs");
//     var span = $(this).find('span'), valuebox = target.find(".sliderValue");
//     var itemKey = $(this).closest(".item").find(".question").data('key');
//     var items = $(this).closest(".section").data('items');
//     var toggleFUs = items[itemKey].toggleFUs;
//     if (toggleFUs == "hide"){
//         toggleFUs = "show";
//         if ($(this).closest(".ItemsFU").find(".itemFU").length>1){
//             $(this).closest(".ItemsFU").find(".selectMultiple").fadeIn();
//         }
//     }
//     else if (toggleFUs == "show"){toggleFUs = "hide";$(this).closest(".ItemsFU").find(".selectMultiple").fadeOut();}
//     items[itemKey].toggleFUs = toggleFUs;
//     valuebox.hide();
//     span.toggleClass("right").toggleClass("down");
//     target.slideToggle();
// }
// function scrollToSection(e){
//     if ($(e.target).is(".up, .down")){;return false;}
//     var name = $(this).find(".name").text().toLowerCase();
//     var section = $(".section").filter(function(){
//         return $(this).find(".sectionName").find(".value").text().toLowerCase() == name;
//     });
//     $.scrollTo(section);
// }
// function saveItem(){
//     log(`use forms.create.item`);
//     return;
//     var i = $("#AddItemProxy");
//     var p = i.parent();
//     var section = i.closest(".section");
//     var item = i.closest(".item");
            
//     var obj = createItemObj(), saved = false;
//     if (obj == false){return false;}
//     if (p.is(".section")){
//         saved = saveItemObj(obj,section,"save");
//     }else if (p.is(".item")){
//         var k = p.find(".question").data("key");
//         saved = saveItemObj(obj,section,"update",k);
//     }else if (p.is(".newFollowUp")){
//         var k = item.children(".question").data("key");
//         saved = saveItemObj(obj,item,"save",k);
//     }else if (p.is(".itemFU")){
//         var k = item.children(".question").data("key");
//         var fk = p.find(".question").data("key");
//         // saved = saveItemObj(obj,section,"update",k,fk);
//         saved = saveItemObj(obj,item,"update",k,fk);
//     }else if (p.is(".insertProxy")){
//         var type = p.parent().data('contains'), kP;
//         k = p.data('key');
//         if (type == 'item'){
//             saved = saveItemObj(obj,section,'insert',k);
//         }else if (type == 'itemFU'){
//             kP = p.closest(".item").find(".question").data('key');
//             saved = saveItemObj(obj,item,'insert',kP,k);
//         }
//     }else{
//         console.log('fail');
//     }
//     if (saved){
//         setTimeout(function(){
//             resetAddItem();
//             resetOptions();
//         },500);

//         $("#AddItemProxy").appendTo('#modalHome');
//         $("#FormBuilder").find(".section").each(function(){updateItems($(this));});
//         autoSaveForm();
//         unblur($("body"));
//     }
// }
// var autoSaveFormCount;
// var autosaveFormTimer = null, autosaveFormXHR = null;
// function updateSecItemCount(){
//     var Qs, FUs, sections = $(".section"), node, wName = 0, wDetails = 0;
//     sections.each(function(s,section){
//         Qs = $(section).find(".item").not(".narrative").length;
//         FUs = $(section).find(".itemFU").not(".narrative").length;
//         Qs = (Qs == 1) ? Qs + " question" : Qs + " questions";
//         FUs = (FUs == 1) ? FUs + " followup" : FUs + " followups";
        
//         node = $("#SectionOptions").find("li").filter(function(){
//             wName = (wName < $(this).find(".name").width()) ? $(this).find(".name").width() : wName;
//             return $(this).find('.name').text().toLowerCase() == $(section).find(".sectionName").find(".value").text().toLowerCase();
//         }).find(".details").text(Qs + ", " + FUs);
        
//         $(".details").each(function(){
//             wDetails = (wDetails < $(this).width()) ? $(this).width() : wDetails;
//         })
//     })
//     $("#SectionOptions").find(".name").width(wName);
//     $("#SectionOptions").find(".details").width(wDetails);
// }
// function updateSecOrder(){
//     var d, currentLI = $(this).closest("li"), name = currentLI.find(".name").text(), currentSec, changeSec, changeLI, sections = $(".section"), n = sections.length, currentSec, k = currentLI.data('key'), allLIs = $("#SectionOptions").find("li"), current, change;
//     if ($(this).hasClass('up')){
//         d = 'up';
//     }else if ($(this).hasClass("down")){
//         d = 'down';
//     }
//     currentSec = $(".section").filter(function(){
//         return $(this).find(".sectionName").find(".value").text() == name;
//     })

//     if ((k == 0 && d == "up") || (k == n -1 && d == "down")){
//         return false;
//     }

//     if (d == "up"){
//         changeSec = $(sections[k-1]);
//         currentSec.insertBefore(changeSec);            
//         changeLI = $(allLIs[k-1]);
//         currentLI.insertBefore(changeLI);            
//     }else if (d == "down"){
//         changeSec = $(sections[k+1])
//         currentSec.insertAfter(changeSec);
//         changeLI = $(allLIs[k+1]);
//         currentLI.insertAfter(changeLI);            
//     }
    
//     current = currentSec.add(currentLI);
//     change = changeSec.add(changeLI);
//     currentSec.animate({
//         "height":"-=30px",
//         "opacity":0.2
//     },100,function(){
//         currentSec.animate({
//             "height":"+=30px",
//             "opacity":1
//         },400,function(){
//             currentSec.css("height","auto");
//         })
//     })
//     changeSec.animate({
//         "height":"+=30px",
//         "opacity":0.2
//     },100,function(){
//         changeSec.animate({
//             "height":"-=30px",
//             "opacity":1
//         },400,function(){
//             changeSec.css("height","auto");
//         })
//     })
//     currentLI.animate({
//         "height":"-=30px",
//         "opacity":0.2
//     },100,function(){
//         currentLI.animate({
//             "height":"+=30px",
//             "opacity":1
//         },400,function(){
//             currentLI.css("height","auto");
//         })
//     })
//     changeLI.animate({
//         "height":"+=30px",
//         "opacity":0.2
//     },100,function(){
//         changeLI.animate({
//             "height":"-=30px",
//             "opacity":1
//         },400,function(){
//             changeLI.css("height","auto");
//         })
//     })

//     allLIs = $("#SectionOptions").find("li");
//     allLIs.each(function(l,LI){
//         $(LI).data('key',l);
//     });
//     autoSaveForm();         
// }
// function updatedInsertProxies(){
//     var insertNode = $("<div/>",{
//         class: "insertProxy",
//         html:"<div class='insertBtns'><div class='button white xxsmall insertQuestion'>insert question</div><div class='button white xxsmall insertText'>insert text</div></div><div class='plus'>+</div>"
//     });
//     $(".insertProxy").remove();
//     $(".target, .targetFUs").each(function(t, target){
//         var items = $(target).children().not($(target).children().last()), k;
//         items.each(function(){
//             // console.log($(this).children(".question").data('key'));
//             k = $(this).children(".question").data('key');
//             insertNode.clone().insertAfter($(this)).data('key',k);
//         })
//     })
// }
// function updateItemOrder(){
//     if ($(this).hasClass('up')){
//         var d = 'up';
//     }else if ($(this).hasClass("down")){
//         var d = 'down';
//     }
//     var items = $(this).closest(".section").find(".item");
//     var ItemArr = $(this).closest(".section").data("items");
//     var currentItem = $(this).closest(".item");
//     var n = items.length, k = Number($(this).closest(".item").find(".question").data("key"));
//     if ((k == 0 && d == "up") || (k == n -1 && d == "down")){
//         return false;
//     }
//     if (d == "up"){
//         var change = $(items[k-1]);
//         change.find(".question").data("key",k);
//         currentItem.find(".question").data("key",k-1);
//         ItemArr[k].key = k -1;
//         ItemArr[k-1].key = k;
//         currentItem.insertBefore(change);            
//     }else if (d == "down"){
//         var change = $(items[k+1]);
//         change.find(".question").data("key",k);
//         currentItem.find(".question").data("key",k+1);
//         ItemArr[k].key = k +1;
//         ItemArr[k+1].key = k;
//         currentItem.insertAfter(change);
//     }
//     ItemArr.sort(function(a,b){
//         return a.key-b.key;
//     });
//     updatedInsertProxies();

//     currentItem.animate({
//         "height":"-=30px",
//         "opacity":0.2
//     },100,function(){
//         currentItem.animate({
//             "height":"+=30px",
//             "opacity":1
//         },400,function(){
//             currentItem.css("height","auto");
//         })
//     })
//     change.animate({
//         "height":"+=30px",
//         "opacity":0.2
//     },100,function(){
//         change.animate({
//             "height":"-=30px",
//             "opacity":1
//         },400,function(){
//             change.css("height","auto");
//             updateItems($(this).closest('.section'));
//         })
//     })        

//     autoSaveForm();
// }
// function updateOptionOrder(){
//     if ($(this).hasClass('up')){
//         var d = 'up';
//     }else if ($(this).hasClass("down")){
//         var d = 'down';
//     }
//     var options = $("#OptionsList").find(".option");
//     var currentOption = $(this).closest(".option");
//     var n = options.length;//, k = Number($(this).closest(".itemName").data("key"));
//     var f = options.first(), l = options.last();
//     if ((currentOption.is(f) && d == 'up') || (currentOption.is(l) && d == 'down')){
//         return false;
//     }
//     if (d == "up"){
//         var change = currentOption.prev();
//         currentOption.insertBefore(change);            
//     }else if (d == "down"){
//         var change = currentOption.next();
//         currentOption.insertAfter(change);
//     }
    
//     currentOption.animate({
//         "height":"-=30px",
//         "opacity":0.2
//     },100,function(){
//         currentOption.animate({
//             "height":"+=30px",
//             "opacity":1
//         },400)
//     })
//     change.animate({
//         "height":"+=30px",
//         "opacity":0.2
//     },100,function(){
//         change.animate({
//             "height":"-=30px",
//             "opacity":1
//         },400)
//     })
    
//     /*items = $(".itemName");
//     for (x=0;x<n;x++){
//         $(items[x]).data("key",x);
//     }*/
// }
// function updateItemFUOrder(){
//     if ($(this).hasClass('up')){
//         var d = 'up';
//     }else if ($(this).hasClass("down")){
//         var d = 'down';
//     }
    
//     var itemsFU = $(this).closest(".item").find(".itemFU"), f = itemsFU.first(), l = itemsFU.last();
//     var currentItemFU = $(this).closest(".itemFU");
//     var nFU = itemsFU.length, kFU = Number($(this).closest(".itemFU").find(".question").data("key"));
//     var k = Number($(this).closest(".item").find(".question").data("key"));
//     var ItemArr = $(this).closest(".section").data("items");
//     var ItemFUArr = ItemArr[k]['followups'];

//     if ((currentItemFU.is(f) && d == "up") || (currentItemFU.is(l) && d == "down")){
//         return false;
//     }
//     if (d == "up"){
//         var change = $(itemsFU[kFU-1]);
//         change.find(".question").data("key",kFU);
//         currentItemFU.find(".question").data("key",kFU-1);
//         ItemFUArr[kFU].key = kFU -1;
//         ItemFUArr[kFU-1].key = kFU;
//         currentItemFU.insertBefore(change);            
//     }else if (d == "down"){
//         var change = $(itemsFU[kFU+1]);
//         change.find(".question").data("key",kFU);
//         currentItemFU.find(".question").data("key",kFU+1);
//         ItemFUArr[kFU].key = kFU +1;
//         ItemFUArr[kFU+1].key = kFU;
//         currentItemFU.insertAfter(change);
//     }
//     ItemFUArr.sort(function(a,b){
//         return a.key-b.key;
//     });
//     updatedInsertProxies();

//     currentItemFU.animate({
//         "height":"-=30px",
//         "opacity":0.2
//     },100,function(){
//         currentItemFU.animate({
//             "height":"+=30px",
//             "opacity":1
//         },400,function(){
//             currentItemFU.css("height","auto");
//         })
//     });
//     change.animate({
//         "height":"+=30px",
//         "opacity":0.2
//     },100,function(){
//         change.animate({
//             "height":"-=30px",
//             "opacity":1
//         },400,function(){
//             change.css("height","auto");
//             updateItems($(this).closest('.section'));
//         })
//     });
//     currentItemFU.add(change).css("height","auto");
    
//     autoSaveForm();
// }
// function showConditionOptions(item){
//     var k = item.find(".question").data('key');
//     var Items = item.closest(".section").data('items');
//     var currentItem = Items[k];
//     var o = currentItem.options, t = currentItem.type, q = currentItem.question;
//     var oStr = '';
    
//     $("#condition").find(".answer").remove();
    
//     if (t == "radio" || t == 'checkboxes' || t == 'dropdown'){
//         var oNode = $("<ul class='answer'></ul>");
//         oNode.prependTo($("#condition"));
//         oNode = $("#FollowUpList").find(".answer");
//         $("#DisplayQ").text(q);
//         $("#Conditionality").text("matches one of the following (select as many as you want)");
        
//         for (x=0;x<o.length;x++){
//             var escapedStr = o[x].split("\"").join("&quot;");
//             escapedStr = escapedStr.split("'").join("&apos;");
//             oStr += "<li data-value='"+escapedStr+"'>"+escapedStr+"</li>";
//         }
//         oNode.addClass("checkboxes").html(oStr);
//         oNode.append("<input class='targetInput' name='condition' type='hidden'>");
//         oNode.on("click","li",checkbox);
//    }
//     else if (t == "number" || t == "scale"){
//         var oNode = $("<div class='answer'></div>");
//         oNode.prependTo($("#condition"));
//         oNode = $("#FollowUpList").find(".answer");
//         $("#DisplayQ").text(q);
//         $("#Conditionality").text("matches the following condition");
        
//         var conditionNode = "<span>Response is </span><select><option value='less than'>less than</option><option value='equal to'>equal to</option><option value='greater than'>greater than</option></select><div class='answer number'><input size='10' type='text' data-min='1920' data-max='2028' value='2018' data-step='1'><span class='label'></span><div><div class='change up'></div><div class='change down'></div></div></div>";
        
//         var min = o.min, max = o.max, initial = o.initial, step = o.step, units = o.units;
//         oNode.html(conditionNode);
//         $("#condition").find("input").data({
//             min: min,
//             max: max,
//             step: step
//         });
//         $("#condition").find('input').val(initial);
//         $("#condition").find(".label").text(units);
//         $("#condition").off("mousedown touchstart",".change",startChange);
//         $("#condition").off("mouseup touchend",".change",stopChange);
//         $("#condition").on("mousedown touchstart",".change",startChange);
//         $("#condition").on("mouseup touchend",".change",stopChange);
//     }
    
//     p = $("#AddItemProxy").parent();
//     if (p.is(".itemFU")){
//         var conditionArr = p.find(".question").data("condition"), conditionLIs = $("#condition").find("li");
//         var matches = conditionLIs.filter(function(){
//             var v = $(this).data('value');
//             return ($.inArray(v, conditionArr) > -1);
//         }).addClass('active');
//         console.log(matches);
//     }
//     $("#condition").find(".answer").addClass("flexbox");
// }
// function resetAddItem(){
//     var clear = $("#AddItem").find("#Options").find("input").add("#Text").add($("#FollowUpOptions").find("input"));
//     clear.val("");
//     $("#AddItem").find("h2").first().html("New Question");
//     $("#Text").css('border-color','rgba(210,210,210,0.8)');
//     $("#Type").val("text");
//     $("#Type").change();
//     $("#Required").val("true");
//     $(".textPlaceholder").val("");
//     $(".textAreaPlaceholder").val("");
//     $("#NumberOptions").find("#min").val("0");
//     $("#NumberOptions").find("#max").val("100");
//     $("#NumberOptions").find("#initial").val("5");
//     $("#NumberOptions").find("#step").val("1");
//     $("#NumberOptions").find("#units").val("");
// }
// function resetOptions(){
//     var o = $("#OptionsList").find(".option");
//     var n = o.length;
//     if (n>2){
//         for (x=2;x<n;x++){
//             $(o[x]).remove();
//         }
//     }
//     o.val("");
// }
// function resetAddText(){
//     var p = $("#AddText").parent();
//     if (p.hasClass("item") || p.hasClass("itemFU")){
//         p.children(".question").find(".toggle").filter(".cancel").click();
//     }
//     setTimeout(function(){
//         $("#NarrTitle, #NarrText").val("");
//     },500)
// }
    
// function loadFormData(){
//     log(`don't use loadFormData`);
//     return;
//     var data = $("#formdata").data("json");
//     var sections = data['sections'];
//     var formName = data['formName'];
//     var formID = data['formID'];
//     $("#formdata").data("formid",formID);
//     $("#FormName").find("input").val(formName);
//     $("#FormName").find(".save").click();
//     sections.forEach(function(section,i){
//         var name = section.sectionName, items = section.items, showByDefault = section.showByDefault;
//         $("#SectionName").val(name);
//         $("#AddSection").find(".add").click();
//         var newSec = $(".section").not("#examples").last();
//         newSec.data('items',items);
//         updateItems(newSec);
//         //console.log(newSec.data("items"));
//     })
// }
// var stickyCSS = {position:"sticky",top:"11em",right:"0",display:"inline-block",margin:"0 1em"}, 
//     notStickyCSS = {position:"relative",margin:"-1em 1em",top:"1em",right:"0"},
//     centerCSS = {position: "absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)"},
//     rightAlignCSS = {position: "absolute",right:'0',top:"50%",transform:"translateY(-50%)"};

// function multiItemOptions(){
//     var section = $(this).closest(".Items, .ItemsFU");
//     $(this).hide();
//     $(this).parent().css(stickyCSS);
//     $(".selectMultiple").find(".hide").filter(":visible").click();
//     $(this).parent().find(".hide").show();
//     if (section.is(".Items")){
//         var items = section.find(".target").children(".item");
//         items.each(function(i,item){
//             if ($(item).find(".targetFUs").is(":visible")){$(item).find(".hideFUs").click();}
//             $(item).find(".ItemsFU").find(".selectMultiple").fadeOut();
//         })
//     }
//     else if (section.is(".ItemsFU")){var items = section.find(".targetFUs").children(".itemFU");}
//     items.children('.question').find(".toggle").fadeOut();
//     items.children(".UpDown").html("<input class='selectChkBx' type='checkbox'>");
//     items.each(function(i,item){
//         $("<div/>",{class:"block multiItem"}).prependTo($(item))
//             .on("mouseenter",hoverItem)
//             .on("mouseleave",unhoverItem)
//             .on("click",selectItem);
//     })
// }
// function selectItem(){
//     $(this).addClass("selected");
//     var item = $(this).closest(".item, .itemFU");
//     item.find(".selectChkBx").attr("checked",true);
//     $(this).off("click",selectItem).on("click",unselectItem);
//     var section = $(this).closest(".Items, .ItemsFU");
//     section.children(".selectMultiple").find(".copy, .delete").css(stickyCSS);
// };
// function unselectItem(){
//     $(this).removeClass("selected");
//     var item = $(this).closest(".item, .itemFU");
//     item.find(".selectChkBx").attr("checked",false);
//     $(this).off("click",unselectItem).on("click",selectItem);
//     var section = item.closest(".Items, .ItemsFU");
//     if (section.find(".block").filter(".selected").length == 0){
//         section.children(".selectMultiple").find(".delete, .copy").fadeOut();
//     }
// };
// function hoverItem(){$(this).addClass("hover");};
// function unhoverItem(){$(this).removeClass("hover");};

// function copyMultiple(){
//     var optBox = $(this).closest(".selectMultiple"),
//         itemList = $(this).closest(".Items, .ItemsFU"),
//         section = $(this).closest(".section");

//     var Items = section.data("items"), selected = section.find(".block").filter(".selected").closest(".item, .itemFU"),
//         confirmText = (selected.length == 1) ? "Duplicating 1 item" : "Duplicating " + selected.length + " items";

//     $("#Confirm").clone().attr('id','MultiCopy').appendTo("#ModalHome");
//     $("#MultiCopy").find(".message").html("<h2>"+confirmText+"</h2><div>Where would you like to put the new copies?</div>");
//     $("#MultiCopy").find(".options").find(".submit").remove();
//     $("#MultiCopy").find(".options").find(".cancel").text("cancel").addClass('multiCopyOption');
//     $("<div/>",{
//         class:"multiCopyOption button small pink",
//         data:{
//             value:"asBlock"
//         },
//         text:"end of section"
//     }).prependTo($("#MultiCopy").find(".options"));
//     $("<div/>",{
//         class:"multiCopyOption button small pink",
//         data:{
//             value:"afterOriginal"
//         },
//         text:"after each original"
//     }).prependTo($("#MultiCopy").find(".options"));
//     blur($("body"),"#MultiCopy");

//     $(".multiCopyOption").on("click",function(){
//         var opt = $(this).data("value"), section = $("#FormBuilder").find(".section").filter(function(){
//                 return $(this).find(".selectMultiple").find(".hide").is(":visible");
//             }), Items = section.data("items"), selected = section.find(".block").filter(".selected").closest(".item, .itemFU");
//         if (opt=="asBlock"){
//             selected.each(function(i,x){
//                 var item = $(x), k = item.find('.question').data('key');
//                 if (item.is(".itemFU")){
//                     Items = section.data("items");
//                     var kP = item.closest(".item").find(".question").data('key');
//                     Items = Items[kP].followups;
//                 }
//                 var copy = {};
//                 $.extend(true,copy,Items[k]);
//                 copy.question = copy.question + " COPY";
//                 Items.push(copy);
//             })
//             updateItems(section);
//             autoSaveForm();
//             $(".zeroWrap").remove();
//             optBox.find(".hide").click();
//             unblur($("body"));
//             $("#MultiCopy").removeAttr("id").remove();
//         }
//         else if (opt=="afterOriginal"){
//             var Items = section.data("items"), selected = section.find(".block").filter(".selected").closest(".item, .itemFU");
//             selected.each(function(i,x){
//                 var item = $(x), k = item.find('.question').data('key');
//                 if (item.is(".itemFU")){
//                     Items = section.data("items");
//                     var kP = item.closest(".item").find(".question").data('key');
//                     Items = Items[kP].followups;
//                 }
//                 var copy = {};
//                 $.extend(true,copy,Items[k+i]);
//                 copy.question = copy.question + " COPY";
//                 Items.splice(k+1+i,0,copy);
//             })
//             updateItems(section);
//             autoSaveForm();
//             optBox.find(".hide").click();
//             unblur($("body"));
//             $("#MultiCopy").removeAttr("id").remove();
//         }
//     })    
// }
// function deleteMultiple(){
//     var section = $(this).closest(".section"), optBox = $(this).closest(".selectMultiple");
//     var Items = section.data("items"), selected = section.find(".block").filter(".selected").closest(".item, .itemFU"),
//         warningText = (selected.length == 1) ? "DELETE 1 ITEM" : "DELETE " + selected.length + " ITEMS";

//     $("#Warn").find(".message").html("<h2 class='pink'>"+warningText+"?</h2><div>Are you sure you want to do this? It <u>cannot be undone.</u></div>");
//     $("#Warn").find(".submit").text(warningText);
//     blur($("body"),"#Warn");
//     var wait = setInterval(function(){
//         if (confirmBool!=undefined){
//             if (confirmBool==true){
//                 selected.each(function(i,x){
//                     var item = $(x), k = item.find('.question').data('key');
//                     if (item.is(".itemFU")){
//                         Items = section.data("items");
//                         var kP = item.closest(".item").find(".question").data('key');
//                         Items = Items[kP].followups;
//                     }
//                     Items.splice(k-i,1);
//                 })
//                 updateItems(section);
//                 optBox.find(".hide").click();
//                 autoSaveForm();
//                 confirmBool=undefined;
//                 unblur($("body"));
//                 clearInterval(wait);
//             }
//             else if (confirmBool==false){
//                 confirmBool=undefined;
//                 clearInterval(wait);
//             }
//         }
//     },100);
// }
// function hideMultiItemOptions(){
//     var section = $(this).closest(".Items, .ItemsFU");
//     section.find(".block").remove();
//     $(this).parent().css(notStickyCSS);
//     $(this).parent().find(".show").show();
//     $(this).parent().find(".delete, .copy, .hide").hide();
//     if (section.is(".Items")){
//         var items = section.find(".target").children(".item");
//     }
//     else if (section.is(".ItemsFU")){var items = section.find(".targetFUs").children(".itemFU");}
//     items.children('.question').find(".toggle").filter(".edit, .copy, .delete").fadeIn();
//     items.children(".UpDown").html("<div class='up'></div><div class='down'></div>");
//     //items.find('.ItemsFU').find(".selectMultiple").fadeIn();
    
//     if (section.is(".Items")){
//         items.children(".UpDown").find(".up, .down").on("click",updateItemOrder);
//     }else{
//         items.children(".UpDown").find(".up, .down").on("click",updateItemFUOrder);
//     }
// }
// var sectionNode = "<div class='section'><h2 class='sectionName editable'><div class='pair'><input type='text' class='input'> <span class='value'></span></div><div class='toggle edit'>(edit section name)</div><div class='toggle save'>(save)</div><div class='toggle cancel'>(cancel)</div></h2>  <div class='Items'>  <div class='selectMultiple'> <div class='show button xxsmall yellow70'>select multiple items</div><div class='hide button xxsmall'>cancel selection</div><div class='delete button pink70 xxsmall'>delete items</div><div class='copy button pink70 xxsmall'>duplicate items</div> </div>   <p class='hideTarget'><span class='arrow down'></span>No questions yet</p><div class='target' data-contains='item'><div style='padding:0.5em 1em;'>Add some questions!</div></div><div class='requireSign'>* <i>required</i></div></div>  <div class='itemOptions'><div class='addQuestion button pink xsmall'>add question</div><div class='addText button pink xsmall'>add text</div><div class='button xsmall deleteSection'>delete section</div></div> </div>", itemNode = "<div class='item'><div class='question'></div><br><div class='answer'></div> <div class='ItemsFU'>  <div class='selectMultiple'> <div class='show button xxsmall yellow70'>select multiple followup items</div><div class='hide button xxsmall'>cancel selection</div><div class='delete button xxsmall pink70'>delete items</div><div class='copy button pink70 xxsmall'>duplicate items</div> </div>  <p class='hideFUs'><span class='right'></span>Follow up based on response</p><div class='targetFUs' data-contains='itemFU'></div></div>   <div class='newFollowUp'><div class='button pink70 xxsmall addFollowUp'>add followup question</div><div class='button pink70 xxsmall addFollowUpText'>add followup text</div></div> <div class='UpDown'><div class='up'></div><div class='down'></div></div> </div>", itemFUNode = "<div class='itemFU'><div class='question'></div><div class='condition'></div><div class='answer'></div> <div class='UpDown'><div class='up'></div><div class='down'></div></div> </div>";
