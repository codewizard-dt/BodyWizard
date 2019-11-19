// $(document).ready(function(){
//     var confirmBool = undefined;
//     var defaultDisplayCSS = {"inline":"false"};
//     $(".wrapMe").each(function(){
//         wrapAndCenter($(this));
//     });
//     $(".manageOverflow").each(function(i,ele){
//         checkOverflow(ele);
//     })
//     $("#UnlockFormBtn").on("click",unlockForm);
//     $("#FormName").find(".input").show();
//     $("#FormName").find(".save").css("display","inline-block");
//     $("#FormName").find(".edit").hide();
//     $("#CurrentForm").on("click",".button",function(){
//         if ($(this).hasClass('formList')){
//             setSessionVar({"formUID":"unset"});
//             $(this).addClass("disabled");
//             setTimeout(function(){
//                 $("#formList").find(".title").click();
//             },500);
//         }
//         if ($(this).hasClass('hide')){
//             slideFadeOut($("#CurrentForm"));
//         }
//     })
    
//     $(".optionsNav").on("click",".button",optionsNavBtnClick);
    
        
//     var sectionNode = "<div class='section'><div class='sectionName editable'>Section: <div class='pair'><input type='text' class='input'> <span class='value'></span></div><div class='toggle edit'>(edit)</div><div class='toggle save'>(save)</div><div class='toggle cancel'>(cancel)</div></div>  <div class='showByDefault editable'>Show By Default: <div class='pair'><select class='input'><option value='yes'>yes</option><option value='no'>no</option></select><span class='value'>No</span></div><div class='toggle edit'>(edit)</div><div class='toggle save'>(save)</div><div class='toggle cancel'>(cancel)</div></div><div class='Items'>  <div class='selectMultiple'> <div class='show button xsmall'>select multiple items</div><div class='hide button xsmall'>cancel selection</div><div class='delete button xsmall'>delete items</div><div class='copy button xsmall'>duplicate items</div> </div>   <p class='hideTarget'><span class='down'></span>No questions yet</p><div class='target'><div style='padding:0.5em 1em;'>Add some questions!</div></div></div>  <div class='itemOptions'><div class='addQuestion button xsmall'>add question</div><div class='addParagraph button xsmall'>add text</div></div>  <div class='clear' data-target='.section'>(delete)</div></div>";
    
//     $("#AddSection").on("click",".add",function(){
//         var name = cleanStr($("#SectionName").val());
//         var show = $("#ShowByDefault option:selected").val();
//         var names = $("#Sections").find(".section").find(".sectionName").find("span");
//         var nameArray = [];
//         names.each(function(){
//             nameArray.push($(this).text().toLowerCase());
//         })        
        
//         if (name==""){
//             alertBox("type in section name",$("#SectionName"),"after","fade","-4em,-50%");
//             return false;
//         }else if ($.inArray(name.toLowerCase(),nameArray)>-1){
//             alertBox("name already in use",$("#SectionName"),"after","fade","-4em,-50%");
//             return false;
//         }
//         var section = $("#Sections").find(".section").not("#examples");
//         if (section.length==0){
//             $(sectionNode).appendTo("#Sections");
//         }else{
//             $(sectionNode).insertAfter(section.last());
//         }
//         var section = $("#Sections").find(".section").not("#examples");
//         var num = section.length;
//         var secStr = "";
        
//         if (num>1){
//             section = section.last();
//         }

//         section.find(".sectionName").find('span').text(name);
//         section.find(".showByDefault").find('span').text(show);
//         section.find(".selectMultiple").find(".show").on("click",multiItemOptions);
//         section.find(".selectMultiple").find(".hide").on("click",hideMultiItemOptions);
//         section.find(".selectMultiple").find(".copy").on("click",copyMultiple);
//         section.find(".selectMultiple").find(".delete").on("click",deleteMultiple);

//         slideFadeIn(section);
        
//         var Items = [];
//         section.data("items",Items);
        
//         $("#SectionName").val("");
//         slideFadeOut($("#AddSection"));
        
//         updateSections();
//     })
//     $("#AddSection").on("click",".clear",function(){
//         slideFadeOut($("#AddSection"));
//     })
    
//     $("#Sections").on('click',".addQuestion",function(){
//         var c = $(this).closest(".section").find(".Items").find(".toggle").filter(function(){
//             return $(this).hasClass("cancel") == true && $(this).is(":visible") == true;
//         });
//         var t = $(this).closest(".section").find(".itemOptions");
//         $("#FollowUpOptions").hide();
//         if (c.length > 0){
//             c.click();
//             setTimeout(function(){
//                 resetAddItem();
//                 $("#AddItem").insertBefore(t);
//                 slideFadeIn($("#AddItem"));
//             },801);
//         }else{
//             resetAddItem();
//             $("#AddItem").insertBefore(t);
//             slideFadeIn($("#AddItem"));
//         }
//         slideFadeOut($("#ItemOrder"));
//     })
//     $("#Sections").on("click",'.addParagraph',function(){
//         var t = $(this).closest(".section").find(".itemOptions");
//         $("#AddText").insertBefore(t);
//         $("#NarrativeOptions").show();
//         slideFadeIn($("#AddText"));
//     })
//     $("#Sections").on("click",".clear",function(){
//         var targetType = $(this).data('target');
//         var target = $(this).closest(targetType);
//         confirm(target.find(".sectionName"),"ontop","115%,-70%");
        
//         var check = setInterval(function(){
//             if (confirmBool == true){
//                 slideFadeOut(target)
//                 setTimeout(function(){
//                     $("#AddItem").appendTo("#FormBuilder");
//                     $(target).remove();
//                     if (targetType==".section"){
//                         updateSections();
//                     }
//                 },600);
//                 $(".zeroWrap.c").remove();
//                 confirmBool = undefined;
//                 clearInterval(check);
//             }else if (confirmBool == false){
//                 $(".zeroWrap.c").remove();
//                 confirmBool = undefined;
//                 clearInterval(check);                
//             }
//         },100)
//     })
    
//     var toggleBool = false;
//     $("#FormBuilder").on('click',".confirmY",function(){
//         confirmBool = true;
//     })    
//     $("#FormBuilder").on('click',".confirmN",function(){
//         confirmBool = false;
//     })    
//     $("#FormBuilder").on("click",".toggle",function(){
//         var p = $(this).parent();
        
//         if ($(this).data('target')=="#examples"){
//             $("#AddItem").find("input").keyup();
//             if ($("#Type").val()=='signature'){
//                 setTimeout(function(){
//                     $("#signaturePreview").jSignature();
//                 },100)
//             }
//         }
        
//         if (p.hasClass("editable")){
//             if ($(this).hasClass("edit")){
//                 var target = $(this).closest(".editable");
//                 target.find(".value, .edit").hide();
//                 target.find(".input").show();
//                 target.find(".save, .cancel").css("display","inline");

//                 var pairs = target.find(".pair");
//                 pairs.each(function(i, pair){
//                     var input = $(pair).find(".input"), text = $(pair).find(".value").text();
//                     if (input.is("select")){
//                         input.find("option").removeAttr("selected");
//                         input.val(text);
//                     }else{
//                         input.val(text);
//                     }
//                     $(pair).find(".value").text(text);
//                 })
//             }
//             else if ($(this).hasClass("save")){
//                 var target = $(this).closest(".editable");
//                 var pairs = target.find(".pair");
                
//                 for (x=0;x<pairs.length;x++){
//                     var pair = pairs[x];
//                     var input = $(pair).find(".input"), text;
//                     if (input.is("select")){
//                         text = input.find(":selected").val();
//                     }else{
//                         text = cleanStr(input.val());
//                         if (text == ""){
//                             alertBox("enter a value",target.find('.input'),"after","fade");
//                             return false;
//                         }
//                     }
//                     $(pair).find(".value").text(text);
//                 }
//                 target.find(".value, .edit").css("display","inline");
//                 target.find(".input, .save, .cancel").hide();
//                 if (p.hasClass("sectionName")){
//                     updateSections();
//                 }
//                 toggleBool = true;
//             }
//             else if ($(this).hasClass("cancel")){
//                 var target = $(this).closest(".editable");
//                 var pairs = target.find(".pair");
//                 target.find(".value, .edit").css("display","inline");
//                 target.find(".input, .save, .cancel").hide();
//             }
            
//         }
        
//         else if (p.hasClass("question")){
//             var all = p.find(".toggle");
//             var v = all.filter(function(){return $(this).is(":visible") == true;});
//             var h = all.filter(function(){return $(this).is(":visible") == false});
//             var q = p.data("question"), k = p.data("key"), t = p.data("type"), o = p.data("options"), c = p.data("condition");
//             var section = $(this).closest(".section");
            
//             var item = p.parent();

//             if ($(this).hasClass("edit")){
//                 var P = $("#AddItem").parent();
//                 if (P.is(".item") && $("#AddItem").is(":visible")){
//                     P.find(".toggle").filter(".cancel, .save").hide();
//                     P.find(".toggle").filter(".edit, .delete").show();
//                 }
//                 v.hide();
//                 h.css("display","inline-block");
//                 var target = $(this).closest(".itemFU");
//                 if (target.length==0){
//                     target = $(this).closest(".item");
//                 }
//                 if (target.is(".itemFU")){
//                     $("#AddItem").appendTo(target);
//                     slideFadeIn($("#AddItem"));
//                     showConditionOptions($(item).closest(".item"));
//                     $("#FollowUpOptions").show();
//                 }else if (target.is(".item")){
//                     $("#FollowUpOptions").hide();
//                     target = target.find(".ItemsFU");
//                     $("#AddItem").insertBefore(target);
//                     slideFadeIn($("#AddItem"));
//                 }

//                 $("#Text").val(q);
//                 $("#Type").val(t);
//                 $("#Type").change();
                
//                 t = $(this).closest(".item").find(".question").data('type');
                
//                 if (c != undefined && (t == "number" || t == "scale")){
//                     c = c[0];
//                     c = c.split("less than ").join("");
//                     c = c.split("greater than ").join("");
//                     c = c.split("equal to ").join("");
//                 }
//                 $("#FollowUpOptions").find("input").val(c);

//                 if ($.isPlainObject(o)){
//                     if (t == "time"){
//                         //$("#TimeList").children("div").not("#TimeRestriction").hide();
//                         $("#TimeList").find("li").each(function(){
//                             if ($(this).hasClass("active")){$(this).click();}
//                         })
//                         $.each(o,function(key, val){
//                             var obj = {
//                                 all:"allow any time",
//                                 minTime:"set range",
//                                 step:"set interval",
//                                 setTime:"set initial value"
//                             }
//                             $("#TimeOptions").find("#"+key).val(val);
//                             $("#TimeOptions").find("li").filter("[data-value='"+obj[key]+"']").click();
//                         })
//                     }else{
//                         var items = $("#AddItem").find("input").filter(":visible");
//                         items = items.add($("#AddItem").find("select").filter(":visible"));
//                         for (var prop in o){
//                             var val = o[prop];
//                             items.filter(function(){
//                                 return $(this).attr("name") == prop;
//                             }).val(val);
//                         }
//                     }
//                 }
//                 else if ($.isArray(o)){
//                     var n = o.length, c = n - 2;
//                     for (x=0;x<c;x++){
//                         $("#OptionsList").find(".add").click();
//                     }
//                     var inputs = $("#OptionsList").find("input");
//                     for (x=0;x<n;x++){
//                         var val = o[x];
//                         $(inputs[x]).val(val);
//                     }
//                 }
                
//             }
//             else if ($(this).hasClass("save")){
//                 saveItem();
//             }
//             else if ($(this).hasClass("delete")){
//                 var target = p;
//                 confirm($(this),"below","");
//                 blurElement($(this).closest(".itemFU, .item"),".c");
//                 var check = setInterval(function(){
//                     if (confirmBool == true){
//                         slideFadeOut(item);
//                         setTimeout(function(){
//                             $("#AddItem").appendTo("#FormBuilder").hide();
//                             var Items = section.data("items");
//                             if (item.is(".itemFU")){
//                                 var kP = p.closest(".item").find(".question").data('key');
//                                 Items = Items[kP].followups;
//                             }
//                             Items.splice(k,1);
//                             updateItems(section);
//                             autoSave();
//                         },500);
//                         $(".zeroWrap.c").remove();
//                         confirmBool = undefined;
//                         clearInterval(check);
//                     }else if (confirmBool == false){
//                         unblurElement(item);
//                         $(".zeroWrap.c").remove();
//                         confirmBool = undefined;
//                         clearInterval(check);                
//                     }
//                 },100)
//             }
//             else if ($(this).hasClass("cancel")){
//                 var v = all.filter(function(){return $(this).is(":visible") == true;});
//                 var h = all.filter(function(){return $(this).is(":visible") == false});
//                 v.hide();
//                 h.css("display","inline-block");
//                 slideFadeOut($("#AddItem"));
//                 setTimeout(function(){
//                     resetAddItem();
//                     resetOptions();
//                 },500);
//             }
//             else if ($(this).hasClass("copy")){
//                 var Items = section.data("items");
//                 if (item.is(".itemFU")){
//                     var kP = p.closest(".item").find(".question").data('key');
//                     Items = Items[kP].followups;
//                 }
//                 var copy = {};
//                 $.extend(true,copy,Items[k]);
//                 copy.question = copy.question + " COPY";
//                 console.log(copy);
//                 Items.splice(k+1,0,copy);
//                 updateItems(section);
//                 autoSave();
//             }
            
            
//         }
//     })
//     $("#FormBuilder").on("click",".addFollowUp",function(){
//         $("#AddItem").insertBefore($(this));
//         slideFadeOut($("#ItemFUOrder"));
//         $("#Type").val("text");
//         $("#Type").change();
//         $("#FollowUpOptions").show();
//         slideFadeIn($("#AddItem"));
//         var item = $(this).closest(".item");
//         showConditionOptions(item);
//         if (!item.find(".targetFUs").is(":visible")){
//             item.find(".hideFUs").click();
//         }
//     })
//     $("#FormBuilder").on("click",".addSectionBtn",function(){
//         $("#FormName").find(".save").click();
//         if (toggleBool){
//             toggleBool = false;
//         }else{
//             return false;
//         }
//         $("#AddSection").appendTo($(this).closest(".sectionOptions"));
//         slideFadeIn($("#AddSection"));
//         slideFadeOut($("#SectionOrder"));
//         $("#AddSection").find("option").removeAttr("selected");
//         $("#AddSection").find("select").find("option").first().attr("selected","true");
//     });
//     $("#FormBuilder").on("click",".sectionOrderBtn",function(){
//         $("#SectionOrder").appendTo($(this).closest(".sectionOptions"));
//         slideFadeIn($("#SectionOrder"));
//         slideFadeOut($("#AddSection"));
//         var sections = $(".section").not("#examples");
//         $("#SectionList").html('');
//         sections.each(function(i,section){
//             var name = $(section).find(".sectionName").find("span").text();
//             var node = $("<div class='secName' data-key='"+i+"'><span>"+name+"</span><div class='UpDown'><div class='up'></div><div class='down'></div></div></div>");
//             $("#SectionList").append(node);
//         })
//         if (sections.length==0){
//             $("#SectionList").html("<span style='padding:0.5em 1em;'>Add some sections first!</span>");
//         }
//     })
    
//     $("#Type").on("change",function(){
//         var needOptions = ['radio','checkboxes','dropdown'];
//         var value = $(this).val();
//         if ($.inArray(value,needOptions)>-1){
//             slideFadeIn($("#Options"));
//         }
//         else{
//             slideFadeOut($("#Options"));
//         }
        
//         if (value == "number"){
//             slideFadeIn($("#NumberOptions"));
//         }
//         else{
//             slideFadeOut($("#NumberOptions"));
//         }
        
//         if (value == "date"){
//             slideFadeIn($("#DateOptions"));
//         }
//         else{
//             slideFadeOut($("#DateOptions"));
//         }
                
//         if (value == 'time'){
//             slideFadeIn($("#TimeOptions"));
//         }else{
//             slideFadeOut($("#TimeOptions"));
//         }
        
//         if (value == "scale"){
//             slideFadeIn($("#ScaleOptions"));
//         }
//         else{
//             slideFadeOut($("#ScaleOptions"));
//         }
//         if (value == "signature"){
//             slideFadeIn($("#SignatureOptions"));
//         }
//         else{
//             slideFadeOut($("#SignatureOptions"));
//         }
        
//         slideFadeOut($(".example"));
//         var currentExample = $(".example").filter(function(){
//             return $(this).find(".exampleType").find("span").text().toLowerCase() == value;
//         });
//         slideFadeIn(currentExample);
//     })
//     $("#Type").change();
//     $("#Text").on("keyup",function(){
//         var text = $(this).val();
//         if (text!=''){
//             $("#examples").find(".question").text(text);
//         }else{
//             $("#examples").find(".question").text("What is your question?");
//         }
        
//     })    
//     $("#Options").on("click",".add",function(){
//         var newOpt = "<div class='option'><input type='text'><div class='UpDown'><div class='up'></div><div class='down'></div></div></div>";
//         $(newOpt).insertBefore($(this));
//         $(".option").off("click",".up",updateOptionOrder);
//         $(".option").off("click",".down",updateOptionOrder);
//         $(".option").on("click",".up",updateOptionOrder);
//         $(".option").on("click",".down",updateOptionOrder);
//         $("#Options").find("input").last().focus();
//     })
//     $("#Options").on("keyup","input",function(ev){
//         if (ev.keyCode == 13){
//             var options = $("#Options").find(".option"), current = $(this).closest(".option");
//             var l = options.last();
//             if (current.is(l)==false){
//                 current.next().find("input").focus();
//             }else{
//                 $("#OptionsList").find(".add").click();
//             }
//         }
//     })
//     $("#NumberOptions").on("keyup","input",function(){
//         var numeric = ["min","max","initial","step"];
//         var id = $(this).attr("name");
        
//         if ($.inArray(id,numeric)>-1){
//             var v = $(this).val(), r = v.replace(/[^0-9.]/g, "");
//             if (v != r){
//                 alertBox("numbers only",$(this),"after","fade");
//                 $(this).val(r);
//             }
//         }
//     })
        
//     $("#AddItem, #AddText").on("click",".save",saveItem);
//     $("#AddItem").on("click",".refresh",updatePreview);
//     $("#AddItem").on("click",".cancel",function(){
//         slideFadeOut($("#AddItem"));
//         var p = $("#AddItem").parent();
//         if (p.hasClass("item") || p.hasClass("itemFU")){
//             p.children(".question").find(".toggle").filter(".cancel").click();
//         }
//         setTimeout(function(){
//             resetAddItem();
//         },500)
//     })
//     //$("#AddText").on("click",".save",saveText);
//     $("#AddText").on("click",".refresh",updatePreview);
//     $("#AddText").on("click",".cancel",function(){
//         slideFadeOut($("#AddText"));
//         var p = $("#AddText").parent();
//         setTimeout(function(){
//             $("#NarrTitle, #NarrText").val("");
//         },500)
//     })
    
//     $("#examples").on("click",".hide",function(){
//         $(".toggle").filter(function(){
//             return $(this).data("target") == "#examples";
//         }).click();
//     })
//     $('.signHere').on("click",".reset",function(e){
//         $(this).parent().find(".signature").jSignature("reset");
//     })
//     $(".time").each(function(){
//         var i = $(this).find("input"), o = i.data('options');
//         i.timepicker(o);
//     })
//     $("#IncludeTime").find("li").on("click",function(){
//         if ($(this).data("value")=="yes"){
//             slideFadeIn($("#TimeRestriction"));
//             $("#TimeRestriction").find(".active").each(function(){
//                 var c = $(this).data('value'), divs = $("#TimeOptions").children("div").filter("[data-condition='"+c+"']");
//                 slideFadeIn(divs);
//             })
//         }else{
//             slideFadeOut($("#TimeRestriction"));
//             slideFadeOut($("#TimeOptions").children("div"));
//         }
//     })
//     $("#TimeRestrict").find("li").filter("[data-value='allow any time']").on("click",masterCheckbox);
//     $("#TimeRestrict").find("li").on('click',function(){
//         if ($(this).hasClass("disabled")){return false;}
//         var c = $(this).data('value'), divs = $("#TimeList").children("div").filter("[data-condition='"+c+"']");
//         if (divs.length==0 && !$(this).hasClass("active")){
//             divs = $("#TimeList").children("div").not("#TimeRestriction");
//             slideFadeOut(divs);
//         }else{
//             if ($(this).hasClass("active")){
//                 slideFadeOut(divs);
//             }else{
//                 slideFadeIn(divs);
//             }
//         }
//     })
//     $("#TimeList").children("div").not("#TimeRestriction").hide();
//     $("#NarrText").css({
//         maxWidth:"100%",
//         height:"6em"
//     })
    
//     $("#SectionOrder").on('click',".up",updateSecOrder);
//     $("#SectionOrder").on('click',".down",updateSecOrder);
//     $("#SectionOrder").on('click',".save",saveSecOrder);
//     $("#SectionOrder").on('click',".cancel",function(){
//         slideFadeOut($("#SectionOrder"));
//     });
//     $("#ItemFUOrder").on('click',".up",updateItemFUOrder);
//     $("#ItemFUOrder").on('click',".down",updateItemFUOrder);
//     $("#ItemFUOrder").on('click',".save",saveItemFUOrder);
//     $("#ItemFUOrder").on('click',".cancel",function(){
//         slideFadeOut($("#ItemFUOrder"))
//     });
    
//     $("#NoRestriction").on("click",function(){
//         var block = $("<div class='block selected disabled' style='border-radius:5px;'></div>");
//         if ($(this).is(":checked")){
//             slideFadeOut($("#DateOptions").find(".blockable"));
//         }else{
//             slideFadeIn($("#DateOptions").find(".blockable"));
//         }
//     })
//     $("#NoRestriction").click();
    
//     $("#FormBuilder").on("click",".hideFUs",function(){
//         var target = $(this).parent().children(".targetFUs");
//         var span = $(this).find('span'), valuebox = target.find(".SliderValue");
//         var itemKey = $(this).closest(".item").find(".question").data('key');
//         var items = $(this).closest(".section").data('items');
//         var toggleFUs = items[itemKey].toggleFUs;
//         if (toggleFUs == "hide"){
//             toggleFUs = "show";
//             if ($(this).closest(".ItemsFU").find(".itemFU").length>1){
//                 $(this).closest(".ItemsFU").find(".selectMultiple").fadeIn();
//             }
//         }
//         else if (toggleFUs == "show"){toggleFUs = "hide";$(this).closest(".ItemsFU").find(".selectMultiple").fadeOut();}
//         items[itemKey].toggleFUs = toggleFUs;
//         valuebox.hide();
//         span.toggleClass("right").toggleClass("down");
//         target.slideToggle();
//     })
    
//     function saveItem(){
//         var i = $(this).closest("#AddItem, #AddText");
// /*        var p = $("#AddItem").parent();
//         var section = $("#AddItem").closest(".section");
//         var item = $("#AddItem").closest(".item");*/
//         var p = i.parent();
//         var section = i.closest(".section");
//         var item = i.closest(".item");
        
//         i.off("click",".save",saveItem);
//         setTimeout(function(){
//             i.on("click",".save",saveItem);
//         },1600);
                
//         if (p.is(".section")){
//             createItemObj(section,"save");
//         }else if (p.is(".item")){
//             var k = p.find(".question").data("key");
//             createItemObj(section,"update",k);
//         }else if (p.is(".newFollowUp")){
//             var k = item.children(".question").data("key");
//             createItemObj(item,"save",k);
//         }else if (p.is(".itemFU")){
//             var k = item.children(".question").data("key");
//             var fk = p.find(".question").data("key");
//             createItemObj(section,"update",k,fk);
//         }
//     }
//     $(".saveForm").on("click",function(){
//         saveType = $(this).data('type');
//     })
//     function saveForm(){
//         $(".saveForm").addClass("disabled");
//         $(".saveForm").off("click",saveForm);
//         var form = createFormObj();
//         form['autosaved']="0";
//         var str = JSON.stringify(form);
//         var mode = $("#formdata").data("mode");
//         $.ajax({
//             method:"POST",
//             url:"/php/launchpad/practitioner/save-form-POST.php",
//             data:{
//                 "JSON":str,
//                 "type":"clicksave",
//                 "mode":mode,
//                 "version":saveType
//             },
//             success: function(data){
//                 if (data!=false){
//                     var formUID = data.split(":")[0];
//                     var formID = data.split(":")[1];
//                     $("#formdata").data("formuid",formUID);
//                     $("#formdata").data("formid",formID);
//                     $("#formList").find('.title').click();
//                 }
//                 else{
//                     $("#formdata").text(data);
//                     alert("save error:"+data);
//                     $(".saveForm").on("click",saveForm);
//                 }
//             },
//             error:function(data,status,error){
//                 $("#formdata").text("Not saved: "+status+","+error);
//                 $(".saveForm").on("click",saveForm);
//             }
//         })
//     }
//     function autoSave(){
//         var form = createFormObj();
//         form['autosaved']="1";
//         var str = JSON.stringify(form);
//         var mode = $("#formdata").data("mode");
//         $.ajax({
//             method:"POST",
//             url:"/php/launchpad/practitioner/save-form-POST.php",
//             data:{
//                 "JSON":str,
//                 "type":"autosave",
//                 "mode":mode
//             },
//             success:function(data){
//                 if (data!=false){
//                     var formUID = data.split(":")[0];
//                     var formID = data.split(":")[1];
//                     $("#formdata").data("formuid",formUID);
//                     $("#formdata").data("formid",formID);
//                     //console.log(data);
//                     var t = new Date();
//                     var timeStr = t.toLocaleTimeString();
//                     $("#formdata").text("Autosaved at "+timeStr);
//                     $("<div/>",{
//                         html:"form autosaved<span style='margin-left:10px' class='checkmark'>✓</span>",
//                         class:"confirm",
//                         id:"AutoConfirm",
//                         css:{
//                             position:"fixed",
//                             top:"8em",
//                             right:"6em",
//                             zIndex:9999
//                         }
//                     }).appendTo("#FormBuilder");
//                     setTimeout(function(){
//                         $("#AutoConfirm").fadeOut(400,function(){$("#AutoConfirm").remove()});
//                     },3000)
//                 }
//                 else{
//                     $("#formdata").text(data);
//                     alert("autosave error"+data);
//                 }
//             },
//             error:function(data,status,error){
//                 $("#formdata").text("Not saved: "+status+","+error);
//             }
//         })
//     }
//     function saveText(){
//         var p = $("#AddText").parent();
//         var section = $("#AddText").closest(".section");
//         var item = $("#AddText").closest(".item");
        
//         $("#AddText").off("click",".save",saveText);
//         setTimeout(function(){
//             $("#AddText").on("click",".save",saveText);
//         },1600);

        
//         if (p.is(".section")){
//             createTextObj(section,"save");
//         }else if (p.is(".item")){
//             var k = p.find(".question").data("key");
//             createTextObj(section,"update",k);
//         }else if (p.is(".newFollowUp")){
//             var k = item.children(".question").data("key");
//             createTextObj(item,"save",k);
//         }else if (p.is(".itemFU")){
//             var k = item.children(".question").data("key");
//             var fk = p.find(".question").data("key");
//             createTextObj(section,"update",k,fk);
//         }
        
//     }
    
    
//     function createFormObj(){
//         var sections = $("#FormBuilder").find(".section").not("#examples");
//         var sectionArr = [];
//         sections.each(function(i,section){
//             var items = $(section).data('items');
//             var name = $(section).find(".sectionName").find("span").text();
//             var showByDefault = $(section).find(".showByDefault").find(".value").text();
//             var obj = {
//                 "sectionName":name,
//                 "showByDefault":showByDefault,
//                 "items":items
//             };
//             sectionArr.push(obj);
//         })
//         var formName = $("#FormName").find(".value").text();
//         var formID = $("#formdata").data("formid");
//         var form = {
//             "formName":formName,
//             "formID":formID,
//             "versionID":"",
//             "sections":sectionArr,
//             "numbers":{
//                 "sections":sections.length,
//                 "items":sections.find('.item').length+sections.find(".itemFU").length,
//                 "followups":sections.find(".itemFU").length
//             }
//         }
//         //var str = JSON.stringify(form);
//         return form;
//     }
//     function createItemObj(section,mode,itemKey,FUkey){
//         if ($("#Text").val()=='' && !$("#AddText").is(":visible")){
//             alertBox("type a question",$("#Text"),"after","fade");
//             $.scrollTo($("#Text"));
//             return false;
//         }
        
//         var ItemObj = {};
        
//         var q = cleanStr($("#Text").val());
//         var t = $("#Type").val();
//         var o;
        
//         console.log(q + t + o);
        
//         var options = $("#Options").find("input").filter(":visible");
//         if (options.length!=0){
//             optionsY = options.filter(function(){
//                 return $(this).val() != "";
//             })
//             optionsN = options.not(optionsY);
//             if (optionsY.length < 2){
//                 alertBox("must have at least two options",optionsN.first(),"after","fade");
//                 return false;
//             }
            
//             var options = [];
//             for (x=0;x<optionsY.length;x++){
//                 var check = cleanStr($(optionsY[x]).val());
//                 check = check.split("\"").join("");
//                 if ($.inArray(check,options)>-1){
//                     alertBox("duplicate options not allowed",$(optionsY[x]),"after","fade");
//                     return false;
//                 }else{
//                     options[x] = check;
//                 }
//             }
//         }
//         else {options=undefined;}
        
//         var numberOptions = $("#NumberOptions").find("input").filter(":visible");
//         if (numberOptions.length!=0){
//             for (x=0;x<numberOptions.length;x++){
//                 var i = $(numberOptions[x]);
//                 if (i.val() == ""){
//                     alertBox("required",i,"after","fade");
//                     return false;
//                 }
//             }
//             var min = Number(numberOptions.filter("[name='min']").val());
//             var max = Number(numberOptions.filter("[name='max']").val());
//             var inital = Number(numberOptions.filter("[name='initial']").val());
//             var step = Number(numberOptions.filter("[name='step']").val());
//             var units = numberOptions.filter("[name='units']").val();
            
//             if (min>max){
//                 alertBox("must be lesser than max",numberOptions.filter("[name='min']"),"after","2500");
//                 return false;
//             }
//             if (inital>max || inital<min){
//                 alertBox("must be between min and max",numberOptions.filter("[name='initial']"),"after","2500");
//                 return false;
//             }
//             numberOptions = {
//                 "min":min,
//                 "max":max,
//                 "initial":inital,
//                 "step":step,
//                 "units":units
//             };
//         }
//         else {numberOptions = undefined;}
        
//         var dateOptions = $("#DateOptions").find("input").filter(":visible");
//         if (dateOptions.length!=0){
//             var dateBegin = dateOptions.filter("[data-name='begin']").val();
//             var dateEnd = dateOptions.filter("[data-name='end']").val();
//             var yearRange = dateBegin+":"+dateEnd;
//             dateOptions = {
//                 "yearRange":yearRange
//             }
//             if ($("#NoRestriction").is(":checked")==false){
//                 var stop = $("#DateOptions").find("select").filter(function(){
//                     console.log($(this).find("option:selected").val()) ;
//                     return $(this).find("option:selected").val() == "";
//                 });
//                 if (stop.length > 0){
//                     alertBox("required if you want to restrict dates",stop.first(),"after");
//                     return false;
//                 }
//                 var minDate = "-"+$("[data-name='minNum']").val() + $("[data-name='minType']").val().charAt(0);
//                 var maxDate = "+"+$("[data-name='maxNum']").val() + $("[data-name='maxType']").val().charAt(0);
//                 dateOptions["minDate"] = minDate;
//                 dateOptions["maxDate"] = maxDate;
//             }else{
//                 dateOptions["minDate"] = null;
//                 dateOptions["maxDate"] = null;
//             }
//         }
//         else{dateOptions=undefined;}
        
//         var timeOptions = $("#TimeList").is(":visible");
//         if (timeOptions){
//             if ($("#TimeRestriction").find(".active").length==0){
//                 alertBox("required",$("#TimeRestrict"));
//                 $.scrollTo($("#TimeRestrict"));
//                 return false;
//             }
//             var r = $("#TimeRestriction").find(".active");
//             timeOptions = {};
//             r.each(function(){
//                 var v = $(this).data('value');
//                 if (v == "allow any time"){
//                     timeOptions['all'] = "default";
//                 }else if (v == 'set range'){
//                     timeOptions['minTime'] = $("#minTime").val();
//                     timeOptions['maxTime'] = $("#maxTime").val();
//                 }else if (v == 'set interval'){
//                     timeOptions['step'] = $("#TimeOptions").find("#step").val();
//                 }else if (v == 'set initial value'){
//                     timeOptions['setTime'] = $("#setTime").val();
//                 }
//             })
//         }
//         else{timeOptions=undefined;}

//         var sigOptions = $("#SignatureOptions").find("select").filter(":visible");
//         if (sigOptions.length!=0){
//             var printBool = $("#typedName").val();
//             sigOptions = {
//                 "typedName":printBool
//             }
//         }
//         else{sigOptions=undefined;}
        
//         var scaleOptions = $("#ScaleOptions").find("input, select").filter(":visible");
//         if (scaleOptions.length!=0){
//             var min = scaleOptions.filter("[data-name='scalemin']").val();
//             var max = scaleOptions.filter("[data-name='scalemax']").val();
//             var initial = scaleOptions.filter("[data-name='initial']").val();
//             var minL = scaleOptions.filter("[name='minLabel']").val();
//             var maxL = scaleOptions.filter("[name='maxLabel']").val();
//             var dispL = scaleOptions.filter("[name='dispLabel']").val();
//             var dispV = scaleOptions.filter("[name='dispVal']").val();
                        
//             min = Number(min);
//             max = Number(max);
//             initial = Number(initial);
//             if (min>max || min==max){
//                 alertBox("must be less than max value",scaleOptions.filter("[name='scalemin']"),"after","fade");
//                 return false;
//             }
//             if (inital < min || initial > max){
//                 alertBox("must be within min and max values",scaleOptions.filter("[name='initial']"),"after","fade");
//                 return false;
//             }
//             for (x=0;x<scaleOptions.length;x++){
//                 var v = $(scaleOptions[x]).val();
//                 if (v==""){
//                     alertBox("required",$(scaleOptions[x]),"after","fade");
//                     return false;
//                 }
//             }
        
//             scaleOptions = {
//                 "min":min,
//                 "max":max,
//                 "initial":initial,
//                 "minLabel":minL,
//                 "maxLabel":maxL,
//                 "displayValue":dispV,
//                 "displayLabels":dispL
//             };
//         }
//         else{scaleOptions=undefined;}
        
//         var narrativeOptions = $("#NarrativeOptions").find("input, textarea").filter(":visible");
//         if (narrativeOptions.length!=0){
//             var title = $("#NarrTitle").val();
//             var text = $("#NarrText").val();
                        
//             if (text == ""){
//                 alertBox("required",$("#NarrText"),"after","fade");
//                 return false;
//             }
            
//             narrativeOptions={
//                 "title":title,
//                 "text":text
//             };
//         }

        
//         var followUpOptions = $("#FollowUpOptions").find("input, select");
//         if ($("#FollowUpOptions").is(":visible")){
//             if ($("#condition").find(".checkboxes").length>0){
//                 if ($("#condition").find(".active").length==0){
//                     var t = $("#condition").find(".answer");
//                     alertBox("required",t,"after","fade");
//                     return false;
//                 }else{
//                     var conditions=[];
//                     $("#condition").find(".active").each(function(){
//                         conditions.push($(this).data("value"));
//                     });
//                     followUpOptions = conditions;
//                 }
//             }
//             else{
//                 var conditionInputs=[];
//                 for (x=0;x<followUpOptions.length;x++){
//                     var i = $(followUpOptions[x]);
//                     if (i.val() == ""){
//                         alertBox("required",i.closest(".answer"),"after","fade");
//                         return false;
//                     }else{
//                         conditionInputs.push(i.val());
//                     }
//                 }
//                 followUpOptions = [conditionInputs.join(" ")];
//             }
//         }
//         else{followUpOptions=undefined;}
        
        
//         if (options!=undefined){o=options}
//         else if (numberOptions!=undefined){o=numberOptions}
//         else if (dateOptions!=undefined){o=dateOptions}
//         else if (timeOptions!=undefined){o=timeOptions}
//         else if (scaleOptions!=undefined){o=scaleOptions}
//         else if (sigOptions!=undefined){o=sigOptions}
        
//         ItemObj={
//             "question":q,
//             "type":t,
//             "options":o
//         };
                
//         if (followUpOptions!=undefined){
//             ItemObj["condition"] = followUpOptions;
//             section = $("#AddItem").closest(".item");
//         }        
        

//         if (section.is(".section")){
//             var Items = section.data('items');
//             if (mode=="update"){
//                 if (checkItem(ItemObj,section)){
//                     ItemObj["followups"] = Items[itemKey].followups;
//                     ItemObj['toggleFUs'] = Items[itemKey].toggleFUs;
//                     ItemObj['key'] = itemKey;
//                     ItemObj['displayOptions'] = (Items[itemKey].displayOptions!==undefined) ? Items[itemKey].displayOptions : defaultDisplayCSS ;
//                     Items[itemKey] = ItemObj;

//                     updateItems(section);
//                     slideFadeOut($("#AddItem"));
//                     setTimeout(function(){
//                         resetAddItem();
//                         resetOptions();
//                     },500);
//                 }        
//             }
//             else if (mode=="save"){
//                 if (checkItem(ItemObj,section)){
//                     ItemObj["followups"] = [];
//                     ItemObj['toggleFUs'] = 'hide';
//                     ItemObj['key'] = Items.length;
//                     ItemObj['displayOptions'] = defaultDisplayCSS;
//                     Items.push(ItemObj);
//                     updateItems(section);
//                     slideFadeOut($("#AddItem"));
//                     setTimeout(function(){
//                         resetAddItem();
//                         resetOptions();
//                     },500);
//                 }        
//             }            
//         }
//         else if (section.is('.item')){
//             if (mode=='save'){
//                 if (checkItem(ItemObj,section)){
//                     var Items = section.closest(".section").data('items');
//                     var FUs = Items[itemKey].followups;
//                     ItemObj['key'] = FUs.length;
//                     ItemObj['displayOptions'] = defaultDisplayCSS;
                
//                     FUs.push(ItemObj);
//                     updateItems(section.closest(".section"));
//                     slideFadeOut($("#AddItem"));
//                     setTimeout(function(){
//                         resetAddItem();
//                         resetOptions();
//                     },500);
//                 }
//             }
//             else if (mode=='update'){
//                 if (checkItem(ItemObj,section)){
//                     var Items = section.closest(".section").data('items');
//                     var FUs = Items[itemKey].followups;
//                     ItemObj['key'] = FUkey;
//                     ItemObj['displayOptions'] = (FUs[FUkey].displayOptions!=undefined) ? FUs[FUkey].displayOptions : defaultDisplayCSS ;

//                     FUs[FUkey] = ItemObj;
//                     updateItems(section.closest(".section"));
//                     slideFadeOut($("#AddItem"));
//                     setTimeout(function(){
//                         resetAddItem();
//                         resetOptions();
//                     },500);
//                 }
//             }
//         }
//         autoSave();

//     }
//     function createTextObj(section,mode,itemKey,FUkey){
//         var narrativeOptions = $("#NarrativeOptions").find("input, textarea").filter(":visible");
//         if (narrativeOptions.length!=0){
//             var title = $("#NarrTitle").val();
//             var text = $("#NarrText").val();
                        
//             if (text == ""){
//                 alertBox("required",$("#NarrText"),"after","fade");
//                 return false;
//             }
            
//             narrativeOptions={
//                 "title":title,
//                 "text":text
//             };
//             //console.log(ItemObj);
//             //return false;
//         }
        
//         ItemObj={
//             "type":"narrative",
//             "options":narrativeOptions
//         };

//         if (section.is(".section")){
//             var Items = section.data('items');
//             if (mode=='save'){
//                 ItemObj["followups"] = [];
//                 ItemObj['toggleFUs'] = 'hide';
//                 ItemObj['key'] = Items.length;
//                 ItemObj['displayOptions'] = defaultDisplayCSS;
//                 Items.push(ItemObj);
//                 updateItems(section);
//                 slideFadeOut($("#AddText"));
//                 setTimeout(function(){
//                     resetAddText();
//                 },500);
//             }
//             else if (mode=='update'){}
//         }
//         else if (section.is(".item")){
//             if (mode=='save'){}
//             else if (mode=='update'){}            
//         }
        
//     }
    
//     function resetAddItem(){
//         var clear = $("#AddItem").find("#Options").find("input");
//         clear = clear.add($("#NumberOptions").find("input"));
//         clear.add("#Text").add($("#FollowUpOptions").find("input")).val("");
//         $("#Type").val("text");
//         $("#Type").change();
//     }
//     function resetOptions(){
//         var o = $("#OptionsList").find(".option");
//         var n = o.length;
//         if (n>2){
//             for (x=2;x<n;x++){
//                 $(o[x]).remove();
//                 //$("#OptionsList").find("br").last().remove();
//             }
//         }
//         o.val("");
//     }
//     function resetAddText(){
//         $("#NarrTitle, #NarrText").val("");
//     }
        
//     if ($("#formdata").data("json")!=undefined){
//         loadFormData();
//     }
//     function loadFormData(){
//         var data = $("#formdata").data("json");
//         var sections = data['sections'];
//         var formName = data['formName'];
//         var formID = data['formID'];
//         $("#formdata").data("formid",formID);
//         $("#FormName").find("input").val(formName);
//         $("#FormName").find(".save").click();
//         sections.forEach(function(section,i){
//             var name = section.sectionName, items = section.items, showByDefault = section.showByDefault;
//             $("#ShowByDefault").val(showByDefault);
//             $("#SectionName").val(name);
//             $("#AddSection").find(".add").click();
//             var newSec = $(".section").not("#examples").last();
//             newSec.data('items',items);
//             updateItems(newSec);
//             //console.log(newSec.data("items"));
//         })
//     }
    
//     if ($("#formdata").data("mode")=="new"){
//         $(".saveForm").filter("[data-type='keepVersionID']").hide();
//     }
    
//     function updateSections(){
//         var section = $("#Sections").find(".section").not("#examples");
//         var num = section.length;
//         var secStr = "";
//         var names = $("#Sections").find(".section").find(".sectionName").find("span");
//         var nameStr = "";
//         for (x=0;x<names.length;x++){
//             nameStr += $(names[x]).text();
//             if (x<names.length-1){nameStr += ", ";}
//         }

//         if (num>1){
//             section = section.last();
//             secStr = num + " Sections";
//         }else if (num == 1){
//             secStr = "1 Section";
//         }else if (num == 0){
//             secStr = "No Sections Yet";
//         }
                
//         if (nameStr != ""){secStr += ": "+nameStr;}
        
//         soNum = $(".sectionOptions").length;
//         if (num==0 && soNum==2){
//             $("#AddSection").appendTo("#FormBuilder");
//             $("#SectionOrder").appendTo("#FormBuilder");
//             $(".sectionOptions").last().remove();
//         }else if (num>1 && soNum==1){
//             $("#AddSection").appendTo("#FormBuilder");
//             $("#SectionOrder").appendTo("#FormBuilder");
//             $(".sectionOptions").clone().appendTo("#Sections");
//         }
//         $(".sectionOptions").children("h4").text(secStr);


//     }
//     function updateSecOrder(){
//         if ($(this).hasClass('up')){
//             var d = 'up';
//         }else if ($(this).hasClass("down")){
//             var d = 'down';
//         }
//         var sections = $(".secName");
//         var currentSec = $(this).closest(".secName");
//         var n = sections.length, k = Number($(this).closest(".secName").data("key"));
//         if ((k == 0 && d == "up") || (k == n -1 && d == "down")){
//             return false;
//         }
//         if (d == "up"){
//             var change = $(sections[k-1]);
//             currentSec.insertBefore(change);            
//         }else if (d == "down"){
//             var change = $(sections[k+1])
//             currentSec.insertAfter(change);
//         }
        
//         currentSec.animate({
//             "height":"-=30px",
//             "opacity":0.2
//         },100,function(){
//             currentSec.animate({
//                 "height":"+=30px",
//                 "opacity":1
//             },400)
//         })
//         change.animate({
//             "height":"+=30px",
//             "opacity":0.2
//         },100,function(){
//             change.animate({
//                 "height":"-=30px",
//                 "opacity":1
//             },400)
//         })
        
//         sections = $(".secName");
//         for (x=0;x<n;x++){
//             $(sections[x]).data("key",x);
//         }
//     }
//     function saveSecOrder(){
//         var newSecOrder = $(".secName");
//         var sections = $(".section").not("#examples");
//         for (x=0;x<newSecOrder.length;x++){
//             var name = $(newSecOrder[x]).find("span").text();
//             sections.filter(function(){
//                 return $(this).find(".sectionName").find("span").text() == name;
//             }).appendTo("#Sections");
//         }
//         slideFadeOut($("#SectionOrder"));
//         updateSections();
//         if ($(".sectionOptions").length==2){
//             $(".sectionOptions").last().appendTo("#Sections");
//         }
//         autoSave();
//     }
    
//     function checkItem(i,section){
//         var q = i.question, big, little ;
//         if ($(section).is(".section")){
//             big = ".Items";
//             little = ".item";
//         }else if ($(section).is(".item")){
//             big = ".ItemsFU";
//             little = ".itemFU";
//         }
//         var items = $(section).find(big).find(little).find(".question");
//         var qArr = [];
                
//         items.each(function(i,item){
//             var t = $(item).data("question");
//             qArr.push(t);
//         })
        
//         if ($("#AddItem").parent().is(little)){
//             var itemKey = $("#AddItem").parent().find(".question").data("key");
//         }
                
//         if ($.inArray(q.toLowerCase(),qArr)>-1){
//             if ($("#AddItem").parent().is(little) && itemKey == $.inArray(q.toLowerCase(),qArr)){
//                 return true;
//             }
//             var t = $("#AddItem").find("#Text");
//             alertBox("question already exists",$(t),"after","2500");
//             return false;
//         }else{
//             return true;
//         }
//     }
    
//     function updateItems(section){
//         var Items = section.data("items");
//         var big = ".Items";
//         var little = ".item";
//         var itemNode = "<div class='item'><div class='question'></div><div class='type'></div><div class='details'></div> <div class='ItemsFU'>  <div class='selectMultiple'> <div class='show button xsmall'>select multiple items</div><div class='hide button xsmall'>cancel selection</div><div class='delete button xsmall'>delete items</div><div class='copy button xsmall'>duplicate items</div> </div>  <p class='hideFUs'><span class='right'></span>No followups</p><div class='targetFUs'></div></div>   <div class='newFollowUp'><div class='button xsmall addFollowUp'>add followup question</div></div> <div class='UpDown'><div class='up'></div><div class='down'></div></div> </div>";
//         var textNode = "HEYYYY";
//         var ItemsList = $(section).find(".Items").find(".target"), n = Items.length;
//         var itemFUNode = "<div class='itemFU'><div class='question'></div><div class='type'></div><div class='details'></div><div class='condition'></div> <div class='UpDown'><div class='up'></div><div class='down'></div></div> </div>";

//         $("#AddItem, #AddText").hide().appendTo("#FormBuilder");
//         ItemsList.html("");
//         Items.forEach(function(i,x){
//             var t = i.type, q = i.question, o = i.options, c = i.condition, ItemsFU = i.followups, tFUs = i.toggleFUs;
//             $(itemNode).appendTo(ItemsList);
//             var newItem = ItemsList.find(".item").last();
            
//             if (t == "narrative" && o.title == ""){
//                 q = "Text block w/o header";
//             }else if (t == "narrative"){
//                 q = o.title;
//             }
//             newItem.find(".question").html(q + "<div class='toggle edit'>(edit)</div><div class='toggle copy'>(duplicate)</div><div class='toggle delete'>(delete)</div><div class='toggle save'>(save)</div><div class='toggle cancel'>(cancel edit)</div>").data({"question":q, "key":x, "type":t, "options":o, "toggleFUs":tFUs});
            
//             var tTxt = (i.type == "narrative") ? "Text block" : "Answer type: " + t;
//             newItem.find(".type").html(tTxt);
            
//             if (o==undefined){
//                 newItem.find(".details").text("");
//             }
//             else if ($.isArray(o)){
//                 var oStr = "Options: ";
//                 for (z=0;z<o.length;z++){
//                     oStr += '"'+o[z]+'"';
//                     if (z<o.length-1){oStr+=", ";}
//                 }
//                 newItem.find(".details").text(oStr);
//             }
//             else if ($.isPlainObject(o)){
//                 var oStr = "Settings: ";
//                 var pArr = [];
//                 for (var p in o) {
//                     if (o.hasOwnProperty(p)) {
//                         var v = o[p];
//                         pArr.push("("+p+":"+v+")");                        
//                     }
//                 }
//                 oStr += pArr.join(", ");
//                 newItem.find(".details").text(oStr);
//             }
            
            
// /*            var CurrentItem = $(section).find(".question").filter(function(){
//                 //return $(this).data("question") == q;
//                 return $(this).data("key") == x;
//             }).closest(".item");  */
            
//             CurrentItem = newItem;
            
//             var ItemsFUList = CurrentItem.find(".ItemsFU").find(".targetFUs");
            
//             if (ItemsFU.length>0){
//                 ItemsFU.forEach(function(f,xFU){
//                     var tFU = f.type, qFU = f.question, oFU = f.options, cFU = f.condition;
//                     $(itemFUNode).appendTo(ItemsFUList);
//                     var newItemFU = ItemsFUList.find(".itemFU").last();
//                     newItemFU.find(".question").html(qFU + "<div class='toggle edit'>(edit)</div><div class='toggle copy'>(duplicate)</div><div class='toggle delete'>(delete)</div><div class='toggle save'>(save)</div><div class='toggle cancel'>(cancel edit)</div>").data({"question":qFU, "key":xFU, "type":tFU, "options":oFU, "condition":cFU});
//                     newItemFU.find(".type").html("Answer type: "+tFU);
//                     if (oFU==undefined){
//                         newItemFU.find(".details").text("");
//                     }
//                     else if ($.isArray(oFU)){
//                         var oFUStr = "Options: ";
//                         for (y=0;y<oFU.length;y++){
//                             oFUStr += '"'+oFU[y]+'"';
//                             if (y<oFU.length-1){oFUStr+=", ";}
//                         }
//                         newItemFU.find(".details").text(oFUStr);
//                     }
//                     else if ($.isPlainObject(oFU)){
//                         var oFUStr = "Properties: ";
//                         var pFUArr = [];
//                         for (var p in oFU) {
//                             if (oFU.hasOwnProperty(p)) {
//                                 var v = oFU[p];
//                                 pFUArr.push("("+p+":"+v+")");                        
//                             }
//                         }
//                         oFUStr += pFUArr.join(", ");
//                         newItemFU.find(".details").text(oFUStr);
//                     }
//                     cFU = "\""+cFU.join("\", \"")+"\"";
//                     newItemFU.find(".condition").text("Condition: "+cFU);
//                 })
                

//             }
            
//             var nFU = ItemsFU.length;
//             var s = CurrentItem.find(".ItemsFU").children("p").find("span").clone();
//             var text;
//             if (nFU == 0){
//                 text = "No followups";
//             }else if (nFU==1){
//                 text = "1 followup";
//             }else {
//                 text = nFU + " followups";
//             }
//             CurrentItem.find(".ItemsFU").children("p").html(text).prepend(s);


//             if ($(ItemsFUList).text() == ""){
//                 $(ItemsFUList).html("<div style='padding:0.5em 1em;'>Add some followup questions!</div>");
//             }
            
//             var toggleFUs = CurrentItem.find(".question").data("toggleFUs");
//             if (toggleFUs == "show"){
//                 CurrentItem.find(".targetFUs").show();
//                 CurrentItem.find(".hideFUs").find("span").removeClass("right").addClass("down");
//             }
            
//             var noFUs = ['text','date','signature','narrative','text box','time'];
//             if ($.inArray(t,noFUs)>-1){
//                 $(CurrentItem).find(".ItemsFU").hide();
//                 $(CurrentItem).find(".newFollowUp").hide();
//             }
//         })
        
        
//         var s = $(section).find(".Items").children("p").find("span").clone();
//         var text;
//         if (n == 0){
//             text = "No questions";
//         }else if (n==1){
//             text = "1 question";
//         }else {
//             text = n + " questions";
//         }
//         n = $(section).find(".itemFU").length;
//         if (n == 0){
//             text += "";
//         }else if (n==1){
//             text += " with 1 followup question";
//         }else {
//             text += " with " + n + " followup questions";
//         }
        
//         $(section).find(".Items").children("p").html(text).prepend(s);
        
//         var qNum = $(".section").not("#examples").find(".item").length;
//         var soNum = $(".sectionOptions").length;
//         if (qNum > 4 && soNum ==1){
//             $("#SectionOrder").appendTo("#FormBuilder");
//             $("#AddSection").appendTo("#FormBuilder");
//             $(".sectionOptions").clone().appendTo("#Sections");
//         }else if (qNum < 5 && soNum==2){
//             $("#SectionOrder").appendTo("#FormBuilder");
//             $("#AddSection").appendTo("#FormBuilder");
//             $(".sectionOptions").last().remove();
//         }
        
        
//         if (qNum>0 && $(".saveForm").hasClass("disabled")==true){
//             $(".saveForm").removeClass('disabled');
//             $(".saveForm").on("click",saveForm);
//         }
//         else if (qNum == 0 && $(".saveForm").hasClass("disabled")==false){
//             $(".saveForm").addClass('disabled');
//             $(".saveForm").off("click",saveForm);
//         }
        
//         if ($(ItemsList).text() == ""){
//             $(ItemsList).html("<div style='padding:0.5em 1em;'>Add some questions!</div>");
//         }

        
//         var itemOrder = $(".item").children(".UpDown").find(".up, .down");
//         itemOrder.off("click",updateItemOrder);
//         itemOrder.on("click",updateItemOrder);
//         var itemFUOrder = $(".itemFU").children(".UpDown").find(".up, .down");
//         itemFUOrder.off("click",updateItemFUOrder);
//         itemFUOrder.on("click",updateItemFUOrder);
        
//         $(section).find('.Items').find('.target').find(".selectMultiple").find(".show").on("click",multiItemOptions);
//         $(section).find('.Items').find('.target').find(".selectMultiple").find(".hide").on("click",hideMultiItemOptions);
//         $(section).find('.Items').find('.target').find(".selectMultiple").find(".copy").on("click",copyMultiple);
//         $(section).find('.Items').find('.target').find(".selectMultiple").find(".delete").on("click",deleteMultiple);
        
//         $(".ItemsFU").each(function(){
//             if (!$(this).find(".targetFUs").is(":visible")){
//                 $(this).find(".selectMultiple").hide();
//             }
//         })
        
//     }
    
//     var stickyCSS = {position:"sticky",top:"11em",right:"0",display:"inline-block",margin:"0 1em"}, 
//         notStickyCSS = {position:"relative",margin:"-1em 1em",top:"1em",right:"0"},
//         centerCSS = {position: "absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)"},
//         rightAlignCSS = {position: "absolute",right:'0',top:"50%",transform:"translateY(-50%)"};
    
//     function multiItemOptions(){
//         var section = $(this).closest(".Items, .ItemsFU");
//         //$(this).text("cancel selection");
//         $(this).hide();
//         $(this).parent().css(stickyCSS);
//         $(".selectMultiple").find(".hide").filter(":visible").click();
//         $(this).parent().find(".hide").show();
//         if (section.is(".Items")){
//             var items = section.find(".target").children(".item");
//             items.each(function(i,item){
//                 if ($(item).find(".targetFUs").is(":visible")){$(item).find(".hideFUs").click();}
//                 $(item).find(".ItemsFU").find(".selectMultiple").fadeOut();
//             })
//         }
//         else if (section.is(".ItemsFU")){var items = section.find(".targetFUs").children(".itemFU");}
//         items.children('.question').find(".toggle").fadeOut();
//         items.children(".UpDown").html("<input class='selectChkBx' type='checkbox'>");
//         items.each(function(i,item){
// //            $(item).on("hover",hoverItem,unhoverItem).on("click",selectItem) ;
//             $("<div/>",{class:"block multiItem"}).prependTo($(item))
//                 .on("mouseenter",hoverItem)
//                 .on("mouseleave",unhoverItem)
//                 .on("click",selectItem);
//         })
//     }
//     function selectItem(){
//         $(this).addClass("selected");
//         var item = $(this).closest(".item, .itemFU");
//         item.find(".selectChkBx").attr("checked",true);
//         $(this).off("click",selectItem).on("click",unselectItem);
//         var section = $(this).closest(".Items, .ItemsFU");
//         section.children(".selectMultiple").find(".copy, .delete").css(stickyCSS);
//     };
//     function unselectItem(){
//         $(this).removeClass("selected");
//         var item = $(this).closest(".item, .itemFU");
//         item.find(".selectChkBx").attr("checked",false);
//         $(this).off("click",unselectItem).on("click",selectItem);
//         var section = item.closest(".Items, .ItemsFU");
//         if (section.find(".block").filter(".selected").length == 0){
//             section.children(".selectMultiple").find(".delete, .copy").fadeOut();
//         }
//     };
//     function hoverItem(){
//         $(this).addClass("hover");
//     };
//     function unhoverItem(){
//         $(this).removeClass("hover");
//     };
//     function copyMultiple(){
//         var optBox = $(this).closest(".selectMultiple"),
//             itemList = $(this).closest(".Items, .ItemsFU");
//         multiCopyOption(optBox,"append","0,0");
//         $(".multiCopyOption").on("click",function(){
//             var opt = $(this).data("value");
//             section = $(this).closest(".section");
//             if (opt=="asBlock"){
//                 var Items = section.data("items"), selected = section.find(".block").filter(".selected").closest(".item, .itemFU");
//                 selected.each(function(i,x){
//                     var item = $(x), k = item.find('.question').data('key');
//                     if (item.is(".itemFU")){
//                         Items = section.data("items");
//                         var kP = item.closest(".item").find(".question").data('key');
//                         Items = Items[kP].followups;
//                     }
//                     var copy = {};
//                     $.extend(true,copy,Items[k]);
//                     copy.question = copy.question + " COPY";
//                     Items.push(copy);
//                 })
//                 updateItems(section);
//                 autoSave();
//                 $(".zeroWrap").remove();
//                 optBox.find(".hide").click();
                
//             }
//             else if (opt=="afterOriginal"){
//                 var Items = section.data("items"), selected = section.find(".block").filter(".selected").closest(".item, .itemFU");
//                 selected.each(function(i,x){
//                     var item = $(x), k = item.find('.question').data('key');
//                     if (item.is(".itemFU")){
//                         Items = section.data("items");
//                         var kP = item.closest(".item").find(".question").data('key');
//                         Items = Items[kP].followups;
//                     }
//                     var copy = {};
//                     $.extend(true,copy,Items[k+i]);
//                     copy.question = copy.question + " COPY";
//                     Items.splice(k+1+i,0,copy);
//                 })
//                 updateItems(section);
//                 autoSave();
//                 $(".zeroWrap").remove();
//                 optBox.find(".hide").click();
//             }
//             else if (opt=="cancel"){
//                 $(".zeroWrap").remove();
//             }
            
//         })
        
//     }
//     function deleteMultiple(){
//         var section = $(this).closest(".section"), optBox = $(this).closest(".selectMultiple");
//         var Items = section.data("items"), selected = section.find(".block").filter(".selected").closest(".item, .itemFU");
//         confirm(optBox,"append","0,0");
//         $('.zeroWrap, .confirm').css(rightAlignCSS);
//         $(".confirm").html("delete "+selected.length+" items? this cannot be undone <span class='confirmY'>yes</span><span class='confirmN'>no</span>");
//         var wait = setInterval(function(){
//             if (confirmBool!=undefined){
//                 if (confirmBool==true){
//                     selected.each(function(i,x){
//                         var item = $(x), k = item.find('.question').data('key');
//                         if (item.is(".itemFU")){
//                             Items = section.data("items");
//                             var kP = item.closest(".item").find(".question").data('key');
//                             Items = Items[kP].followups;
//                         }
//                         Items.splice(k-i,1);
//                     })
//                     updateItems(section);
//                     $(".zeroWrap").remove();
//                     optBox.find(".hide").click();
//                     autoSave();
//                     confirmBool=undefined;
//                     clearInterval(wait);
//                 }
//                 else if (confirmBool==false){
//                     $(".zeroWrap").remove();
//                     confirmBool=undefined;
//                     clearInterval(wait);
//                 }
//             }
//         },100);
//     }

    
//     function hideMultiItemOptions(){
//         var section = $(this).closest(".Items, .ItemsFU");
//         section.find(".block").remove();
//         $(this).parent().css(notStickyCSS);
//         $(this).parent().find(".show").show();
//         $(this).parent().find(".delete, .copy, .hide").hide();
//         if (section.is(".Items")){
//             var items = section.find(".target").children(".item");
//         }
//         else if (section.is(".ItemsFU")){var items = section.find(".targetFUs").children(".itemFU");}
//         items.children('.question').find(".toggle").filter(".edit, .copy, .delete").fadeIn();
//         items.children(".UpDown").html("<div class='up'></div><div class='down'></div>");
//         //items.find('.ItemsFU').find(".selectMultiple").fadeIn();
        
//         if (section.is(".Items")){
//             items.children(".UpDown").find(".up, .down").on("click",updateItemOrder);
//         }else{
//             items.children(".UpDown").find(".up, .down").on("click",updateItemFUOrder);
//         }
//     }
    
//     function updateItemOrder(){
//         if ($(this).hasClass('up')){
//             var d = 'up';
//         }else if ($(this).hasClass("down")){
//             var d = 'down';
//         }
//         var items = $(this).closest(".section").find(".item");
//         var ItemArr = $(this).closest(".section").data("items");
//         var currentItem = $(this).closest(".item");
//         var n = items.length, k = Number($(this).closest(".item").find(".question").data("key"));
//         if ((k == 0 && d == "up") || (k == n -1 && d == "down")){
//             return false;
//         }
//         if (d == "up"){
//             var change = $(items[k-1]);
//             change.find(".question").data("key",k);
//             currentItem.find(".question").data("key",k-1);
//             ItemArr[k].key = k -1;
//             ItemArr[k-1].key = k;
//             currentItem.insertBefore(change);            
//         }else if (d == "down"){
//             var change = $(items[k+1]);
//             change.find(".question").data("key",k);
//             currentItem.find(".question").data("key",k+1);
//             ItemArr[k].key = k +1;
//             ItemArr[k+1].key = k;
//             currentItem.insertAfter(change);
//         }
//         ItemArr.sort(function(a,b){
//             return a.key-b.key;
//         });
//         console.log(ItemArr);
//         currentItem.animate({
//             "height":"-=30px",
//             "opacity":0.2
//         },100,function(){
//             currentItem.animate({
//                 "height":"+=30px",
//                 "opacity":1
//             },400,function(){
//                 currentItem.css("height","auto");
//             })
//         })
//         change.animate({
//             "height":"+=30px",
//             "opacity":0.2
//         },100,function(){
//             change.animate({
//                 "height":"-=30px",
//                 "opacity":1
//             },400,function(){
//                 change.css("height","auto");
//             })
//         })

        
// //        items = $(".itemName");
//   //      for (x=0;x<n;x++){
//     //        $(items[x]).data("key",x);
//       //  }
//         autoSave();
//     }
//     function updateOptionOrder(){
//         if ($(this).hasClass('up')){
//             var d = 'up';
//         }else if ($(this).hasClass("down")){
//             var d = 'down';
//         }
//         var options = $("#OptionsList").find(".option");
//         var currentOption = $(this).closest(".option");
//         var n = options.length;//, k = Number($(this).closest(".itemName").data("key"));
//         var f = options.first(), l = options.last();
//         if (currentOption.is(f) || currentOption.is(l)){
//             return false;
//         }
//         if (d == "up"){
//             var change = currentOption.prev();
//             currentOption.insertBefore(change);            
//         }else if (d == "down"){
//             var change = currentOption.next();
//             currentOption.insertAfter(change);
//         }
        
//         currentOption.animate({
//             "height":"-=30px",
//             "opacity":0.2
//         },100,function(){
//             currentOption.animate({
//                 "height":"+=30px",
//                 "opacity":1
//             },400)
//         })
//         change.animate({
//             "height":"+=30px",
//             "opacity":0.2
//         },100,function(){
//             change.animate({
//                 "height":"-=30px",
//                 "opacity":1
//             },400)
//         })
        
//         /*items = $(".itemName");
//         for (x=0;x<n;x++){
//             $(items[x]).data("key",x);
//         }*/
//     }
//     function saveItemOrder(){
//         var s = $(this).closest(".section");
//         var items = s.data('items');
//         var qArr = [], newArr =[];
//         var newItemOrder = $("#ItemList").find(".itemName");
        
//         items.forEach(function(item,i){
//             qArr.push(item.question);
//         })
//         for (x=0;x<newItemOrder.length;x++){
//             var q = $(newItemOrder[x]).find("span").text();
//             var k = $.inArray(q,qArr);
//             newArr.push(items[k]);
//         }
//         s.data("items",newArr);
//         updateItems(s);
//         slideFadeOut($("#ItemOrder"));
//         autoSave();
//     }
    
//     function updateItemFUOrder(){
//         if ($(this).hasClass('up')){
//             var d = 'up';
//         }else if ($(this).hasClass("down")){
//             var d = 'down';
//         }
        
//         var itemsFU = $(this).closest(".item").find(".itemFU"), f = itemsFU.first(), l = itemsFU.last();
//         var currentItemFU = $(this).closest(".itemFU");
//         var nFU = itemsFU.length, kFU = Number($(this).closest(".itemFU").find(".question").data("key"));
//         var k = Number($(this).closest(".item").find(".question").data("key"));
//         var ItemArr = $(this).closest(".section").data("items");
//         var ItemFUArr = ItemArr[k]['followups'];

//         if ((currentItemFU.is(f) && d == "up") || (currentItemFU.is(l) && d == "down")){
//             return false;
//         }
//         if (d == "up"){
//             var change = $(itemsFU[kFU-1]);
//             change.find(".question").data("key",kFU);
//             currentItemFU.find(".question").data("key",kFU-1);
//             ItemFUArr[kFU].key = kFU -1;
//             ItemFUArr[kFU-1].key = kFU;
//             currentItemFU.insertBefore(change);            
//         }else if (d == "down"){
//             var change = $(itemsFU[kFU+1]);
//             change.find(".question").data("key",kFU);
//             currentItemFU.find(".question").data("key",kFU+1);
//             ItemFUArr[kFU].key = kFU +1;
//             ItemFUArr[kFU+1].key = kFU;
//             currentItemFU.insertAfter(change);
//         }
//         ItemFUArr.sort(function(a,b){
//             return a.key-b.key;
//         });
        
//         currentItemFU.animate({
//             "height":"-=30px",
//             "opacity":0.2
//         },100,function(){
//             currentItemFU.animate({
//                 "height":"+=30px",
//                 "opacity":1
//             },400,function(){
//                 currentItemFU.css("height","auto");
//             })
//         })
//         change.animate({
//             "height":"+=30px",
//             "opacity":0.2
//         },100,function(){
//             change.animate({
//                 "height":"-=30px",
//                 "opacity":1
//             },400,function(){
//                 change.css("height","auto");
//             })
//         })
//         currentItemFU.add(change).css("height","auto");
        
// //        items = $(".itemFUName");
//   //      for (x=0;x<n;x++){
//     //        $(items[x]).data("key",x);
//       //  }
        
//         autoSave();
//     }
//     function saveItemFUOrder(){
//         var s = $(this).closest(".section");
//         var items = s.data('items');
//         var K = $(this).closest(".item").find(".question").data('key');
//         var itemsFU = items[K].followups;        
//         var qArr = [], newArr =[];
//         var newItemFUOrder = $("#ItemFUList").find(".itemFUName");
        
//         itemsFU.forEach(function(item,i){
//             qArr.push(item.question);
//         })
//         for (x=0;x<newItemFUOrder.length;x++){
//             var q = $(newItemFUOrder[x]).find("span").text();
//             var k = $.inArray(q,qArr);
//             newArr.push(itemsFU[k]);
//         }
//         items[K].followups = newArr;
//         $("#ItemFUOrder").appendTo("#FormBuilder").hide();
//         updateItems(s);
//         autoSave();
//     }
    
//     function updatePreview(){
//         var t = $("#Type").val();
//         var ex = $("#AddItem").find(".example").filter(function(){
//             return $(this).find(".exampleType").find("span").text().toLowerCase() == t;
//         })
        
//         var options = $("#Options").find("input").filter(":visible");
//         if (options.length!=0){
//             optionsY = options.filter(function(){
//                 return $(this).val() != "";
//             })
//             optionsN = options.not(optionsY);
//             if (optionsY.length < 2){
//                 alertBox("must have at least two options",optionsN.first(),"after","fade");
//                 return false;
//             }
            
//             var options = [];
//             for (x=0;x<optionsY.length;x++){
//                 var check = cleanStr($(optionsY[x]).val());
//                 if ($.inArray(check,options)>-1){
//                     alertBox("duplicate options not allowed",$(optionsY[x]),"after","fade");
//                     return false;
//                 }else{
//                     options[x] = check;
//                 }
//             }
//             if (t == "radio" || t == "checkboxes"){
//                 var optionStr = "";
//                 for (x=0;x<options.length;x++){
//                     optionStr += "<li value='"+options[x]+"'>"+options[x]+"</li>";
//                 }
//                 ex.find("ul").html(optionStr);
//             }
//             else if (t == "dropdown"){
//                 var optionStr = "";
//                 for (x=0;x<options.length;x++){
//                     optionStr += "<option value='"+options[x]+"'>"+options[x]+"</option>";
//                 }
//                 ex.find("select").html(optionStr);
//             }
//         }
 
//         var scaleOptions = $("#ScaleOptions").find("input, select").filter(":visible");
//         if (scaleOptions.length!=0){
//             var min = scaleOptions.filter("[data-name='scalemin']").val();
//             var max = scaleOptions.filter("[data-name='scalemax']").val();
//             var initial = scaleOptions.filter("[data-name='initial']").val();
//             var minL = scaleOptions.filter("[name='minLabel']").val();
//             var maxL = scaleOptions.filter("[name='maxLabel']").val();
//             var dispL = scaleOptions.filter("[name='dispLabel']").val();
//             var dispV = scaleOptions.filter("[name='dispVal']").val();
                        
//             min = Number(min);
//             max = Number(max);
//             initial = Number(initial);
//             if (min>max || min==max){
//                 alertBox("must be less than max value",scaleOptions.filter("[data-name='scalemin']"),"after","fade");
//                 return false;
//             }
//             if (initial < min || initial > max){
//                 alertBox("must be within min and max values",scaleOptions.filter("[data-name='initial']"),"after","fade");
//                 return false;
//             }
//             for (x=0;x<scaleOptions.length;x++){
//                 var v = $(scaleOptions[x]).val();
//                 if (v==""){
//                     alertBox("required",$(scaleOptions[x]),"after","fade");
//                     return false;
//                 }
//             }
//             $("#scalePreview").attr({
//                 "min":min,
//                 "max":max,
//                 "value":initial
//             })
//             if (dispV == "yes"){
//                 $("#scalePreview").addClass("showValue");
//             }else{
//                 $("#scalePreview").removeClass("showValue");
//             }
//             var minDisp='', maxDisp='';
//             if (dispL == "yes"){
//                 minDisp = " ("+min+")";
//                 maxDisp = " ("+max+")";
//             }
//             $("#scalePreview").parent().find(".left").text(minL+minDisp);
//             $("#scalePreview").parent().find(".right").text(maxL+maxDisp);
//         }
        
//         var numberOptions = $("#NumberOptions").find("input").filter(":visible");
//         if (numberOptions.length!=0){
//             for (x=0;x<numberOptions.length;x++){
//                 var i = $(numberOptions[x]);
//                 if (i.val() == ""){
//                     alertBox("required",i,"after","fade");
//                     return false;
//                 }
//             }
//             var min = Number(numberOptions.filter("[name='min']").val());
//             var max = Number(numberOptions.filter("[name='max']").val());
//             var inital = Number(numberOptions.filter("[name='initial']").val());
//             var step = Number(numberOptions.filter("[name='step']").val());
//             var units = numberOptions.filter("[name='units']").val();
            
//             if (min>max){
//                 alertBox("must be lesser than max",numberOptions.filter("[data-name='min']"),"after","2500");
//                 return false;
//             }
//             if (inital>max || inital<min){
//                 alertBox("must be between min and max",numberOptions.filter("[data-name='initial']"),"after","2500");
//                 return false;
//             }
//             $("#numberPreview").data({
//                 "min":min,
//                 "max":max,
//                 "step":step
//             });
//             $("#numberPreview").closest(".item").find(".label").text(units);
//             $("#numberPreview").val(inital);
//         }

//         var dateOptions = $("#DateOptions").find("input").filter(":visible");
//         if (dateOptions.length!=0){
//             var dateBegin = dateOptions.filter("[data-name='begin']").val();
//             var dateEnd = dateOptions.filter("[data-name='end']").val();
//             var dateNode = $("<input readonly placeholder='tap to pick date' id='datePreview' name='datePreview' data-begin='"+dateBegin+"' data-end='"+dateEnd+"'>");
//             $("#datePreview").remove();
//             $(".example").filter(function(){
//                 return $(this).find('.exampleType').find("span").text().toLowerCase() == "date";
//             }).find(".answer").append(dateNode);
//             var optObj = {
//                 yearRange:dateBegin+":"+dateEnd
//             }
//             if ($("#NoRestriction").is(":checked")==false){
//                 var stop = $("#DateOptions").find("select").filter(function(){
//                     console.log($(this).find("option:selected").val()) ;
//                     return $(this).find("option:selected").val() == "";
//                 });
//                 if (stop.length > 0){
//                     alertBox("required if you want to restrict dates",stop.first(),"after");
//                     return false;
//                 }

//                 var min = "-" + $("#minNum").val() + $("#minType").val().charAt(0);
//                 var max = "+" + $("#maxNum").val() + $("#maxType").val().charAt(0);
//                 optObj['minDate'] = min;
//                 optObj['maxDate'] = max;
//             }
//             $("#datePreview").datepick(optObj);
//         }
        
//         var signOptions = $("#SignatureOptions").find("select").filter(":visible");
//         if (signOptions.length!=0){
//             var tn = $("#typedName").val(), t = $("#examples").find(".signHere").find("span");
//             if (tn == "yes"){
//                 t.show();
//             }else {
//                 t.hide();
//             }
//         }
//     }
    
//     function showConditionOptions(item){
//         var k = item.find(".question").data('key');
//         var Items = item.closest(".section").data('items');
//         var currentItem = Items[k];
//         var o = currentItem.options, t = currentItem.type, q = currentItem.question;
//         var oStr = '';
        
//         $("#condition").find(".answer").remove();
        
//         if (t == "radio" || t == 'checkboxes' || t == 'dropdown'){
//             var oNode = $("<ul class='answer'></ul>");
//             oNode.prependTo($("#condition"));
//             oNode = $("#FollowUpList").find(".answer");
//             $("#DisplayQ").text(q);
//             $("#Conditionality").text("one of the following responses (select as many as you want)");
            
//             for (x=0;x<o.length;x++){
//                 var escapedStr = o[x].split("\"").join("&quot;");
//                 escapedStr = escapedStr.split("'").join("&apos;");
//                 oStr += "<li data-value='"+escapedStr+"'>"+escapedStr+"</li>";
//             }
//             oNode.addClass("checkboxes").html(oStr);
//             oNode.append("<input class='targetInput' name='condition' type='hidden'>");
//             oNode.on("click","li",checkbox);
//        }
//         else if (t == "number" || t == "scale"){
//             var oNode = $("<div class='answer'></div>");
//             oNode.prependTo($("#condition"));
//             oNode = $("#FollowUpList").find(".answer");
//             $("#DisplayQ").text(q);
//             $("#Conditionality").text("the following conditions");
            
//             var conditionNode = "<span>Response is </span><select><option value='less than'>less than</option><option value='equal to'>equal to</option><option value='greater than'>greater than</option></select><div class='answer number'><input size='10' type='text' data-min='1920' data-max='2028' value='2018' data-step='1'><span class='label'></span><div><div class='change up'></div><div class='change down'></div></div></div>";
            
//             var min = o.min, max = o.max, initial = o.initial, step = o.step, units = o.units;
//             oNode.html(conditionNode);
//             $("#condition").find("input").data({
//                 min: min,
//                 max: max,
//                 step: step
//             });
//             $("#condition").find('input').val(initial);
//             $("#condition").find(".label").text(units);
//             $("#condition").on("mousedown touchstart",".change",startChange);
//             $("#condition").on("mouseup touchend",".change",stopChange);
//         }
//         else if (t == "scale"){
//             //var oNode = $("<input type='slider'>")
//         }
        
//         p = $("#AddItem").parent();
//         if (p.is(".itemFU")){
//             c = p.find(".question").data("condition");
//             //c = c.split(", ");
//             for (x=0;x<c.length;x++){
//                 p.find("li").filter(function(){
//                     return $(this).data("value") == c[x];
//                 }).click();
//             }            
//         }
//     }
    
//     function checkbox() {
//         $(this).toggleClass("active");
//         if ($(this).parent().hasClass('answer')){
//             var input = $(this).closest(".answer").find(".targetInput"), activeLIs = $(this).closest(".answer").find(".active"), values="";
//             activeLIs.each(function(i, activeLI){
//                 var value = $(activeLI).data("value");
//                 if (values==""){values=value;}else{
//                     values=values+", "+value;
//                 }
//             })
//             input.show();
//             input.val(values);
//         }
//     }  
    
//     function cleanStr(s){
//         var c = s.replace(/[^a-zA-z0-9,(). \-\"\'\?!\:]/g, "");
//         c = c.split("^").join("");
//         c = c.split('"').join("'");
// //        c = c.split("'").join("");
// //        c = c.split('"').join("\"");
//         return c;
//     }
    
//     function confirm(target,where,offset){
//         var str = "are you sure? this cannot be undone <span class='confirmY'>yes</span><span class='confirmN'>no</span>";
//         alertBox(str,target,where,"nofade",offset);
//     }
//     function multiCopyOption(target,where,offset){
//         var str = "Insert copies <span class='multiCopyOption' data-value='afterOriginal'>after each original</span><span data-value='asBlock' class='multiCopyOption'>as new block at end of list</span><span data-value='cancel' class='multiCopyOption'>cancel</span>";
//         var where = "append";
//         confirmBox(str,target,where,"nofade",offset);
//         $('.zeroWrap, .confirm').css(rightAlignCSS);
//     }
    
//     // function inputNum(){
//     //     var v = $(this).val(), r = v.replace(/[^0-9.]/g, "");
//     //     if (v != r){
//     //         alertBox("numbers only",$(this),"below","fade");
//     //         $(this).val(r);
//     //     }
//     //     var i = $(this).closest(".number");
//     //     setTimeout(function(){
//     //         checkNum(i);
//     //     },3000)
//     // }
    
//     // var mag = 1;
//     // function Adj2(item,val,step,direction){
//     //     var newStep = step;
        
//     //     while(newStep<1){
//     //         mag *= 10;
//     //         newStep = step * mag;
//     //     }
//     //     step = step * mag;
//     //     val = val * mag;
        
//     //     if (direction == "down"){
//     //         val = val - step;
//     //     }else if (direction == "up"){
//     //         val = val + step;
//     //     }
//     //     item.find("input").val((val/mag).toString());
        
//     //     checkNum(item);
//     //     var numInt = setInterval(function(){
//     //         if (direction == "down"){
//     //             val = val - step;
//     //         }else if (direction == "up"){
//     //             val = val + step;
//     //         }
//     //         item.find("input").val((val/mag).toString());
//     //         checkNum(item);
//     //     },100)
        
//     //     item.data("numAdj",numInt);
//     // }
//     // function startChange(){
//     //     var item = $(this).closest(".number");
//     //     var step = item.find("input").data("step");
//     //     var val = item.find("input").val(), direction;
//     //     step = Number(step);
//     //     val = Number(val);
//     //     if ($(this).hasClass("down")){direction = "down"}
//     //     else if ($(this).hasClass("up")){direction = "up"}
//     //     Adj2(item,val,step,direction);
//     // }
//     // function stopChange(){
//     //     var item = $(this).closest(".number");
//     //     clearInterval(item.data("numAdj"));
//     //     mag = 1;
//     // }
//     // function checkNum(target){
//     //     //target is .number
//     //     var i = target.find("input");
//     //     var min = i.data("min"), max = i.data("max");
//     //     var val = i.val();
//     //     min = Number(min);
//     //     max = Number(max);
//     //     val = Number(val);
//     //     if (val < min){
//     //         alertBox(min + " is the minimum",i,"below","fade");
//     //         i.val(min);
//     //         clearInterval(target.data('numAdj'));
//     //     }else if (val > max){
//     //         alertBox(max + " is the maximum",i,"below","fade");
//     //         i.val(max);
//     //         clearInterval(target.data('numAdj'));
//     //     }
//     // }
    
//     /*function slideFadeOut(elem) {
//         const fade = { opacity: 0, transition: 'opacity 0.5s' };
//         elem.css(fade).delay(100).slideUp();
//     }
//     function slideFadeIn(elem){
//         const solid = { opacity: 1, transition: 'opacity 0.5s'};
//         elem.css("opacity","0")
//         elem.slideDown().delay(100).css(solid);
//     }  */

// })