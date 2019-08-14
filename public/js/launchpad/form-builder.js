$(document).ready(function(){
    var defaultDisplayCSS = {"inline":"false"};

    masterStyle();

    $("#UnlockFormBtn").on("click",unlockForm);
    $("#FormName").find(".input").show();
    $("#FormName").find(".save").css("display","inline-block");
    $("#FormName").find(".edit").hide();

    var sectionNode = "<div class='section'><h2 class='sectionName editable'><div class='pair'><input type='text' class='input'> <span class='value'></span></div><div class='toggle edit'>(edit section name)</div><div class='toggle save'>(save)</div><div class='toggle cancel'>(cancel)</div></h2>  <div class='Items'>  <div class='selectMultiple'> <div class='show button xxsmall yellow70'>select multiple items</div><div class='hide button xxsmall'>cancel selection</div><div class='delete button pink70 xxsmall'>delete items</div><div class='copy button pink70 xxsmall'>duplicate items</div> </div>   <p class='hideTarget'><span class='down'></span>No questions yet</p><div class='target' data-contains='item'><div style='padding:0.5em 1em;'>Add some questions!</div></div></div>  <div class='itemOptions'><div class='addQuestion button pink xsmall'>add question</div><div class='addText button pink xsmall'>add text</div><div class='button xsmall deleteSection'>delete section</div></div> </div>",
        itemNode = "<div class='item'><div class='question'></div><div class='answer'></div> <div class='ItemsFU'>  <div class='selectMultiple'> <div class='show button xxsmall yellow70'>select multiple followup items</div><div class='hide button xxsmall'>cancel selection</div><div class='delete button xxsmall pink70'>delete items</div><div class='copy button pink70 xxsmall'>duplicate items</div> </div>  <p class='hideFUs'><span class='right'></span>Follow up based on response</p><div class='targetFUs' data-contains='itemFU'></div></div>   <div class='newFollowUp'><div class='button pink70 xxsmall addFollowUp'>add followup question</div><div class='button pink70 xxsmall addFollowUpText'>add followup text</div></div> <div class='UpDown'><div class='up'></div><div class='down'></div></div> </div>",
        itemFUNode = "<div class='itemFU'><div class='question'></div><div class='condition'></div><div class='answer'></div> <div class='UpDown'><div class='up'></div><div class='down'></div></div> </div>";

    $("#PreviewFormBtn").on('click',function(){
        var uid = $("#formdata").data('formuid');
        blurElement($("body"),"#loading");
        $("#FormPreview").load("/forms/"+uid+"/preview",function(){
            blurElement($('body'),"#FormPreview");
            $("#FormPreview").find(".cancel").text("close");
        })
    })
    
    $("#AddSection").on("click",".add",function(){
        var name = $.sanitize($("#SectionName").val());
        var names = $("#Sections").find(".section").find(".sectionName").find("span");
        var nameArray = [];
        names.each(function(){
            nameArray.push($(this).text().toLowerCase());
        })        
        
        if (name==""){
            alertBox("type in section name",$("#SectionName"),"after","fade","-4em,-50%");
            return false;
        }else if ($.inArray(name.toLowerCase(),nameArray)>-1){
            alertBox("name already in use",$("#SectionName"),"after","fade","-4em,-50%");
            return false;
        }
        var sections = $("#Sections").find(".section");
        if (sections.length==0){
            $(sectionNode).appendTo("#Sections");
        }else{
            $(sectionNode).insertAfter(sections.last());
        }
        var sections = $("#Sections").find(".section");
        var num = sections.length;
        var secStr = "";
        
        // if (num>1){
            section = sections.last();
        // }

        section.find(".sectionName").find('span').text(name);
        // section.find(".showByDefault").find('span').text(show);
        section.find(".selectMultiple").find(".show").on("click",multiItemOptions);
        section.find(".selectMultiple").find(".hide").on("click",hideMultiItemOptions);
        section.find(".selectMultiple").find(".copy").on("click",copyMultiple);
        section.find(".selectMultiple").find(".delete").on("click",deleteMultiple);

        slideFadeIn(section);
        
        var Items = [];
        section.data("items",Items);
        
        $("#SectionName").val("");
        // slideFadeOut($("#AddSection"));
        unblurElement($("body"));
        
        updateSections();
        // autoSave();
    })
    $("#AddSection").on("click",".clear",function(){
        slideFadeOut($("#AddSection"));
    })
    $("#Sections").on('click',".addQuestion",function(){
        var t = $(this).closest(".section").find(".itemOptions");
        $("#FollowUpOptions").hide();
        resetAddItem();
        $("#AddItemProxy").insertBefore(t);
        blurElement($("body"),"#AddItem");
    })
    $("#Sections").on("click",'.addText',function(){
        var t = $(this).closest(".section").find(".itemOptions");
        $("#AddItemProxy").insertBefore(t);
        $("#NarrativeOptions").show();
        blurElement($("body"),"#AddText");
    })
    $("#Sections").on('click','.insertQuestion',function(){
        var t = $(this).closest(".insertProxy"), item;
        if (t.parent().data('contains') == 'item'){
            $("#FollowUpOptions").hide();
        }else{
            $("#FollowUpOptions").show();
            item = $(this).closest('.item');
            showConditionOptions(item);
            if (!item.find(".targetFUs").is(":visible")){
                item.find(".hideFUs").click();
            }
        }
        $("#AddItemProxy").appendTo(t);
        resetAddItem();
        blurElement($("body"),"#AddItem");
    })
    $("#Sections").on('click','.insertText',function(){
        
    })
    $(".summernote").summernote({
        height: 200,
        placeholder: 'Enter your text here',
        toolbar: [
          ['style', ['style']],
          ['font', ['bold', 'underline', 'clear']],
          ['fontname', ['fontname']],
          ['color', ['color']],
          ['para', ['ul', 'ol', 'paragraph']],
          ['insert', ['link', 'picture']],
          ['view', ['fullscreen', 'codeview', 'help']],
        ],
    });

    $("#Sections").on("click",".deleteSection",function(){
        // var targetType = $(this).data('target');
        var target = $(this).closest(".section"), name = target.find('.sectionName').find(".value").text();
        // confirm(target.find(".sectionName"),"ontop","115%,-70%");
        $("#Warn").find(".message").html('<h2>Warning!</h2><div>Are you sure you want to delete "'+name+'"? This will delete all of the questions and followups it contains.</div>');
        $("#Warn").find(".submit").text("Delete section and its questions");
        blurElement($("body"),"#Warn");
        var check = setInterval(function(){
            if (confirmBool == true){
                slideFadeOut(target)
                setTimeout(function(){
                    $(target).remove();
                    updateSections();
                },600);
                confirmBool = undefined;
                clearInterval(check);
                unblurElement($("body"));
            }else if (confirmBool == false){
                confirmBool = undefined;
                clearInterval(check);                
            }
        },100)
    })
    
    $("#FormBuilder").on("click",".toggle",function(){
        var p = $(this).parent();
                
        if (p.hasClass("editable")){
            if ($(this).hasClass("edit")){
                var target = $(this).closest(".editable");
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
            else if ($(this).hasClass("save")){
                var target = $(this).closest(".editable");
                var pairs = target.find(".pair");
                
                for (x=0;x<pairs.length;x++){
                    var pair = pairs[x];
                    var input = $(pair).find(".input"), text;
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
            }
            else if ($(this).hasClass("cancel")){
                var target = $(this).closest(".editable");
                var pairs = target.find(".pair");
                target.find(".value, .edit").css("display","inline");
                target.find(".input, .save, .cancel").hide();
            }  
        }
        else if (p.hasClass("question")){
            var q = p.data("question"), k = p.data("key"), t = p.data("type"), o = p.data("options"), c = p.data("condition");
            var section = $(this).closest(".section");
            
            var item = p.parent();

            if ($(this).hasClass("edit")){
                var type = $(this).closest('.item').find('.question').data('type'), d,
                    addNode = (type == 'narrative') ? "#AddText" : "#AddItem";

                P = $(addNode).parent();
                d = $("#AddItemProxy");
                if (P.is(".item") && $("#AddItem, #AddText").is(":visible")){
                    P.find(".toggle").filter(".cancel, .save").hide();
                    P.find(".toggle").filter(".edit, .delete").show();
                }

                var target = $(this).closest(".itemFU");
                if (target.length==0){
                    target = $(this).closest(".item");
                }
                if (target.is(".itemFU")){
                    d.appendTo(target);
                    blurElement($("body"),addNode);
                    showConditionOptions($(item).closest(".item"));
                    $("#FollowUpOptions").show();
                }else if (target.is(".item")){
                    $("#FollowUpOptions").hide();
                    target = target.find(".ItemsFU");
                    d.insertBefore(target);
                    blurElement($("body"),addNode);
                }

                if (type != 'narrative'){
                    $("#Text").val(q);
                    $("#Type").val(t);
                    $("#Type").change();                    
                }else{
                    slideFadeIn($("#NarrativeOptions"));
                    var markup = o.markupStr;
                    $("#NarrativeOptions").find(".note-placeholder").hide();
                    $("#NarrativeOptions").find(".note-editable").html(markup);
                }
                
                t = $(this).closest(".item").find(".question").data('type');
                
                if (c != undefined && (t == "number" || t == "scale")){
                    c = c[0];
                    c = c.split("less than ").join("");
                    c = c.split("greater than ").join("");
                    c = c.split("equal to ").join("");
                    $("#FollowUpOptions").find("input").val(c);
                }else{
                    $("#FollowUpOptions").find(".active").removeClass('active');
                    $("#FollowUpOptions").find("li").each(function(){
                        var active = ($.inArray($(this).data('value'),c) > -1);
                        if (active){$(this).addClass('active')} 
                    })
                }

                if ($.isPlainObject(o)){
                    var items = $("#AddItem").find("input").filter(":visible");
                    items = items.add($("#AddItem").find("select").filter(":visible"));
                    if (t == "time"){
                        $("#TimeList").find("li").each(function(){
                            if ($(this).hasClass("active")){$(this).click();}
                        })
                        $.each(o,function(key, val){
                            var obj = {
                                all:"allow any time",
                                minTime:"set range",
                                step:"set interval",
                                setTime:"set initial value"
                            }
                            $("#TimeOptions").find("#"+key).val(val);
                            $("#TimeOptions").find("li").filter("[data-value='"+obj[key]+"']").click();
                        })
                    }else if(t == 'date'){
                        var beginYear = o.yearRange.split(':')[0], endYear = o.yearRange.split(':')[1],
                            minDate = o.minDate, maxDate = o.maxDate, minNum, minType, maxNum, maxType, currentYear = new Date().getFullYear(),
                            nextYear = currentYear + 1;
                        beginYear = (beginYear == "c+0") ? currentYear : beginYear;
                        endYear = (endYear == "c+0") ? currentYear : endYear;
                        endYear = (endYear == "c+1") ? nextYear : endYear;
                        $("#begin").val(beginYear);
                        $("#end").val(endYear);
                        if (minDate != null){
                            minNum = o.minDate.substring(1,o.minDate.length - 1);
                            maxNum = o.maxDate.substring(1,o.maxDate.length - 1);
                            minType = o.minDate.substring(o.minDate.length - 1,o.minDate.length);
                            maxType = o.maxDate.substring(o.maxDate.length - 1,o.maxDate.length);
                            var guide = {"m":"months","d":"days","w":"weeks","y":"years"};
                            // console.log(minType + maxType);
                            minType = guide[minType];
                            maxType = guide[maxType];
                            // console.log(minType + maxType);
                            $("#minNum").val(minNum);
                            $("#maxNum").val(maxNum);
                            $("#minType").val(minType).change();
                            $("#maxType").val(maxType).change();
                            if ($("#NoRestriction").is(":checked")){$("#NoRestriction").click();}                            
                        }else{
                            if (!$("#NoRestriction").is(":checked")){$("#NoRestriction").click();}
                        }
                    }else if (t == 'scale'){
                        $("#scalemin").val(o['min']);
                        $("#scalemax").val(o['max']);
                        $("#initial").val(o['initial']);
                        $("select").filter('[name="dispVal"]').val(o['displayValue']).change();
                        $("select").filter('[name="dispLabel"]').val(o['displayLabels']).change();
                        for (var prop in o){
                            var val = o[prop];
                            items.filter(function(){
                                return $(this).attr("name") == prop;
                            }).val(val);
                        }
                    }else if (t == 'text'){
                        var placeholder = (o != undefined && o['placeholder'] != undefined) ? o['placeholder'] : "";
                        $("#textPlaceholder").val(placeholder);
                    }else if (t == 'text box'){
                        var placeholder = (o != undefined && o['placeholder'] != undefined) ? o['placeholder'] : "";
                        $("#textBoxPlaceholder").val(placeholder);
                    }
                    else{
                        for (var prop in o){
                            var val = o[prop];
                            items.filter(function(){
                                return $(this).attr("name") == prop;
                            }).val(val);
                        }
                    }
                }
                else if ($.isArray(o)){
                    var n = o.length, c = n - 2;
                    for (x=0;x<c;x++){
                        $("#OptionsList").find(".add").click();
                    }
                    var inputs = $("#OptionsList").find("input");
                    for (x=0;x<n;x++){
                        var val = o[x];
                        $(inputs[x]).val(val);
                    }
                }
                
            }
            else if ($(this).hasClass("delete")){
                var target = p, itemOrFU = $(this).closest(".itemFU, .item"), countFUs = itemOrFU.find(".itemFU").length,
                    warningText = (countFUs == 1) ? "There is currently <u>1 followup</u> under this question." : "There are currently <u>"+countFUs+" followups</u> under this question.";
                if (itemOrFU.is(".item") && countFUs > 0){
                    $("#Warn").find(".message").html("<h2>ATTENTION</h2><div>Deleting this question will also delete all of the followup questions attached to it. "+warningText+" This cannot be undone.</div>");
                    $("#Warn").find(".confirmY").text("delete question and followups");
                    blurElement($("body"),"#Warn");
                }else{
                    warn($(this),"below","","you want to delete this");
                    blurElement($(this).closest(".itemFU, .item"),".a");
                }
                var check = setInterval(function(){
                    if (confirmBool == true){
                        slideFadeOut(item);
                        setTimeout(function(){
                            $("#AddItem").appendTo("#FormBuilder").hide();
                            var Items = section.data("items");
                            if (item.is(".itemFU")){
                                var kP = p.closest(".item").find(".question").data('key');
                                Items = Items[kP].followups;
                            }
                            Items.splice(k,1);
                            updateItems(section);
                            autoSave();
                        },500);
                        $(".zeroWrap.a").remove();
                        confirmBool = undefined;
                        clearInterval(check);
                    }else if (confirmBool == false){
                        unblurElement(item);
                        $(".zeroWrap.a").remove();
                        confirmBool = undefined;
                        clearInterval(check);                
                    }
                },100)
            }
            else if ($(this).hasClass("copy")){
                var Items = section.data("items");
                if (item.is(".itemFU")){
                    var kP = p.closest(".item").find(".question").data('key');
                    Items = Items[kP].followups;
                }
                var copy = {};
                $.extend(true,copy,Items[k]);
                copy.question = copy.question + " COPY";
                // console.log(copy);
                Items.splice(k+1,0,copy);
                updateItems(section);
                autoSave();
            }
            
            
        }
    })
    $("#FormBuilder").on("click",".addFollowUp",function(){
        $("#AddItemProxy").insertBefore($(this));
        $("#Type").val("text");
        $("#Type").change();
        $("#FollowUpOptions").show();
        // slideFadeIn($("#AddItem"));
        blurElement($("body"),"#AddItem");
        var item = $(this).closest(".item");
        $("#FollowUpOptions").appendTo($("#AddItem").find(".message"));
        $("#FollowUpOptions").find(".switch").text("Ask this question");
        showConditionOptions(item);
        if (!item.find(".targetFUs").is(":visible")){
            item.find(".hideFUs").click();
        }
    });
    $("#FormBuilder").on('click',".addFollowUpText",function(){
        $("#AddItemProxy").insertBefore($(this));
        resetAddText();
        blurElement($("body"),"#AddText");
        var item = $(this).closest(".item");
        $("#FollowUpOptions").insertAfter($("#NarrativeOptions"));
        $("#FollowUpOptions").find(".switch").text("Display this text");
        showConditionOptions(item);
        if (!item.find(".targetFUs").is(":visible")){
            item.find(".hideFUs").click();
        }
    })
    $("#FormBuilder").on("click",".addSectionBtn",function(){
        $("#FormName").find(".save").click();
        blurElement($("body"),"#AddSection");
    });
    $("#FormBuilder").on("click",".sectionOrderBtn",function(){
        $("#SectionOrder").appendTo($(this).closest(".sectionOptions"));
        slideFadeIn($("#SectionOrder"));
        slideFadeOut($("#AddSection"));
        var sections = $(".section").not("#examples");
        $("#SectionList").html('');
        sections.each(function(i,section){
            var name = $(section).find(".sectionName").find("span").text();
            var node = $("<div class='secName' data-key='"+i+"'><span>"+name+"</span><div class='UpDown'><div class='up'></div><div class='down'></div></div></div>");
            $("#SectionList").append(node);
        })
        if (sections.length==0){
            $("#SectionList").html("<span style='padding:0.5em 1em;'>Add some sections first!</span>");
        }
    })
    
    $("#Type").on("change",function(){
        var needOptions = ['radio','checkboxes','dropdown'], value = $(this).val();
        if ($.inArray(value,needOptions)>-1){slideFadeIn($("#Options"));}else{slideFadeOut($("#Options"));}
        if (value == "number"){slideFadeIn($("#NumberOptions"));}else{slideFadeOut($("#NumberOptions"));}
        if (value == "date"){slideFadeIn($("#DateOptions"));}else{slideFadeOut($("#DateOptions"));}
        if (value == "text"){slideFadeIn($("#TextOptions"));}else{slideFadeOut($("#TextOptions"));}
        if (value == "text box"){slideFadeIn($("#TextBoxOptions"));}else{slideFadeOut($("#TextBoxOptions"));}
        if (value == 'time'){slideFadeIn($("#TimeOptions"));}else{slideFadeOut($("#TimeOptions"));}
        if (value == "scale"){slideFadeIn($("#ScaleOptions"));}else{slideFadeOut($("#ScaleOptions"));}
        if (value == "signature"){slideFadeIn($("#SignatureOptions"));}else{slideFadeOut($("#SignatureOptions"));}
    })
    $("#Type").change();
    $("#Text").on("keyup",function(){
        var text = $(this).val();
        if (text!=''){
            $("#examples").find(".question").text(text);
        }else{
            $("#examples").find(".question").text("What is your question?");
        }
    })    
    $("#Options").on("click",".add",function(){
        var newOpt = "<div class='option'><input type='text'><div class='UpDown'><div class='up'></div><div class='down'></div></div></div>";
        $(newOpt).insertBefore($(this));
        $(".option").off("click",".up",updateOptionOrder);
        $(".option").off("click",".down",updateOptionOrder);
        $(".option").on("click",".up",updateOptionOrder);
        $(".option").on("click",".down",updateOptionOrder);
        $("#Options").find("input").last().focus();
    })
    $("#Options").on("keyup","input",function(ev){
        if (ev.keyCode == 13){
            var options = $("#Options").find(".option"), current = $(this).closest(".option");
            var l = options.last();
            if (current.is(l)==false){
                current.next().find("input").focus();
            }else{
                $("#OptionsList").find(".add").click();
            }
        }
    })
    $("#NumberOptions").on("keyup","input",function(){
        var numeric = ["min","max","initial","step"];
        var id = $(this).attr("name");
        
        if ($.inArray(id,numeric)>-1){
            var v = $(this).val(), r = v.replace(/[^0-9.]/g, "");
            if (v != r){
                alertBox("numbers only",$(this),"after","fade");
                $(this).val(r);
            }
        }
    })
        
    $("#AddItem, #AddText").on("click",".save",saveItem);
    $("#AddItem").on("click",".cancel",function(){
        slideFadeOut($("#AddItem"));
        var p = $("#AddItem").parent();
        if (p.hasClass("item") || p.hasClass("itemFU")){
            p.children(".question").find(".toggle").filter(".cancel").click();
        }
        setTimeout(function(){
            resetAddItem();
        },500)
    })

    $("#AddText").on("click",".cancel",function(){
        slideFadeOut($("#AddText"));
        var p = $("#AddText").parent();
        if (p.hasClass("item") || p.hasClass("itemFU")){
            p.children(".question").find(".toggle").filter(".cancel").click();
        }
        setTimeout(function(){
            $("#NarrTitle, #NarrText").val("");
        },500)
    })
    // RANDOM OPTION HANDLERS
        $('.signHere').on("click",".reset",function(e){
            $(this).parent().find(".signature").jSignature("reset");
        })
        $(".time").each(function(){
            var i = $(this).find("input"), o = i.data('options');
            i.timepicker(o);
        })
        $("#TimeRestrict").find("li").filter("[data-value='allow any time']").on("click",masterCheckbox);
        $("#TimeRestrict").find("li").on('click',function(){
            if ($(this).hasClass("disabled")){return false;}
            var c = $(this).data('value'), divs = $("#TimeList").children("div").filter("[data-condition='"+c+"']");
            if (divs.length==0 && !$(this).hasClass("active")){
                divs = $("#TimeList").children("div").not("#TimeRestriction");
                slideFadeOut(divs);
            }else{
                if ($(this).hasClass("active")){
                    slideFadeOut(divs);
                }else{
                    slideFadeIn(divs);
                }
            }
        })
        $("#TimeList").children("div").not("#TimeRestriction").hide();
        $("#NarrText").css({
            maxWidth:"100%",
            height:"6em"
        })
        $("#currentYearBegin").on("click",function(){
            var currentYear = new Date().getFullYear(), nextYear = currentYear + 1, p = $(this).closest("div");
            if ($(this).is(":checked")){
                $("#begin").attr("readonly",true).val(currentYear);
                p.find(".answer").css("opacity","0.5");
                p.find(".number").off("mousedown touchstart",'.change',startChange);
            }else{
                $("#begin").removeAttr("readonly");
                p.find(".answer").css("opacity","1");
                p.find(".number").off("mousedown touchstart",'.change',startChange);
                p.find(".number").on("mousedown touchstart",'.change',startChange);
            }
        })
        $("#currentYearEnd").on("click",function(){
            var currentYear = new Date().getFullYear(), nextYear = currentYear + 1, p = $(this).closest("div").parent("div");
            if ($(this).is(":checked")){
                $("#end").attr("readonly",true).val(currentYear);
                if ($("#nextYearEnd").is(":checked")){$("#nextYearEnd").click();}
                p.find(".answer").css("opacity","0.5");
                p.find(".number").off("mousedown touchstart",'.change',startChange);
            }else{
                $("#end").removeAttr("readonly");
                p.find(".answer").css("opacity","1");
                p.find(".number").off("mousedown touchstart",'.change',startChange);
                p.find(".number").on("mousedown touchstart",'.change',startChange);
            }
        })
        $("#nextYearEnd").on("click",function(){
            var currentYear = new Date().getFullYear(), nextYear = currentYear + 1, p = $(this).closest("div").parent("div");
            if ($(this).is(":checked")){
                $("#end").attr("readonly",true).val(nextYear);
                if ($("#currentYearEnd").is(":checked")){$("#currentYearEnd").click();}
                p.find(".answer").css("opacity","0.5");
                p.find(".number").off("mousedown touchstart",'.change',startChange);
            }else{
                $("#end").removeAttr("readonly");
                p.find(".answer").css("opacity","1");
                p.find(".number").off("mousedown touchstart",'.change',startChange);
                p.find(".number").on("mousedown touchstart",'.change',startChange);
            }
        })
        
        $("#SectionOrder").on('click',".up",updateSecOrder);
        $("#SectionOrder").on('click',".down",updateSecOrder);
        $("#SectionOrder").on('click',".save",saveSecOrder);
        $("#SectionOrder").on('click',".cancel",function(){
            slideFadeOut($("#SectionOrder"));
        });
        // $("#ItemFUOrder").on('click',".up",updateItemFUOrder);
        // $("#ItemFUOrder").on('click',".down",updateItemFUOrder);
        // $("#ItemFUOrder").on('click',".save",saveItemFUOrder);
        // $("#ItemFUOrder").on('click',".cancel",function(){
        //     slideFadeOut($("#ItemFUOrder"))
        // });
        
        $("#NoRestriction").on("click",function(){
            var block = $("<div class='block selected disabled' style='border-radius:5px;'></div>");
            if ($(this).is(":checked")){
                slideFadeOut($("#DateOptions").find(".blockable"));
            }else{
                slideFadeIn($("#DateOptions").find(".blockable"));
            }
        })
        $("#NoRestriction").click();
    
    $("#FormBuilder").on("click",".hideFUs",function(){
        var target = $(this).parent().children(".targetFUs");
        var span = $(this).find('span'), valuebox = target.find(".SliderValue");
        var itemKey = $(this).closest(".item").find(".question").data('key');
        var items = $(this).closest(".section").data('items');
        var toggleFUs = items[itemKey].toggleFUs;
        if (toggleFUs == "hide"){
            toggleFUs = "show";
            if ($(this).closest(".ItemsFU").find(".itemFU").length>1){
                $(this).closest(".ItemsFU").find(".selectMultiple").fadeIn();
            }
        }
        else if (toggleFUs == "show"){toggleFUs = "hide";$(this).closest(".ItemsFU").find(".selectMultiple").fadeOut();}
        items[itemKey].toggleFUs = toggleFUs;
        valuebox.hide();
        span.toggleClass("right").toggleClass("down");
        target.slideToggle();
    })

    $("#SectionOptions").on("click","li",function(){
        var name = $(this).find(".name").text().toLowerCase();
        var section = $(".section").filter(function(){
            return $(this).find(".sectionName").find(".value").text().toLowerCase() == name;
        });
        $.scrollTo(section);
    })
    
    function saveItem(){
        var i = $("#AddItemProxy");
        var p = i.parent();
        var section = i.closest(".section");
        var item = i.closest(".item");
                
        var obj = createItemObj(), saved = false;
            if (obj == false){return false;}
            if (p.is(".section")){
                saved = saveItemObj(obj,section,"save");
            }else if (p.is(".item")){
                var k = p.find(".question").data("key");
                saved = saveItemObj(obj,section,"update",k);
            }else if (p.is(".newFollowUp")){
                var k = item.children(".question").data("key");
                saved = saveItemObj(obj,item,"save",k);
            }else if (p.is(".itemFU")){
                var k = item.children(".question").data("key");
                var fk = p.find(".question").data("key");
                saved = saveItemObj(obj,section,"update",k,fk);
            }else if (p.is(".insertProxy")){
                var type = p.parent().data('contains'), kP;
                k = p.data('key');
                if (type == 'item'){
                    saved = saveItemObj(obj,section,'insert',k);
                }else if (type == 'itemFU'){
                    kP = p.closest(".item").find(".question").data('key');
                    saved = saveItemObj(obj,item,'insert',kP,k);
                }
            }else{
                console.log('fail');
            }
        if (saved){
            setTimeout(function(){
                resetAddItem();
                resetOptions();
            },500);

            $("#AddItemProxy").appendTo('#modalHome');
            $(".section").each(function(){updateItems($(this));});
            autoSave();
            unblurElement($("body"));
        }
    }
    var autoSaveCount;
    function autoSave(){
        var form = createFormObj();
        var jsonStr = JSON.stringify(form);
        // var mode = $("#formdata").data("mode");
        var formId = $("#formdata").data("formid") === undefined ? "none" : $("#formdata").data("formid"),
            uid = $("#formdata").data("formuid") === undefined ? "none" : $("#formdata").data("formuid");
        var dataObj = {
            form_id: formId,
            form_uid: uid,
            form_name: form["formName"],
            questions: JSON.stringify(form['sections']),
            full_json: jsonStr
        };
        $.ajax({
            method:"POST",
            url:"/forms",
            data: dataObj,
            success:function(data){
                if (data!=false){
                    clearTimeout(autoSaveCount);
                    var formUID = data[0], formID = data[1], wrap = $("#AutoSaveWrap");
                    $("#formdata").data("formuid",formUID);
                    $("#formdata").data("formid",formID);
                    var t = new Date();
                    var timeStr = t.toLocaleTimeString();
                    $("#formdata").text("Autosaved at "+timeStr);
                    if (wrap.is(":visible")){
                        wrap.fadeOut(400);
                        setTimeout(function(){
                            $("#AutoConfirm").find(".message").text("Autosaved at " + timeStr);
                            wrap.fadeIn();
                        },1000)
                        autoSaveCount = setTimeout(function(){
                            slideFadeOut(wrap);
                        },2500);
                        // autoSaveCount = setTimeout(function(){
                        //     slideFadeOut(wrap);
                        // },2500)
                    }else{
                        $("#AutoConfirm").find(".message").text("Autosaved at " + timeStr);
                        slideFadeIn(wrap);
                        autoSaveCount = setTimeout(function(){
                                slideFadeOut(wrap);
                        },2500);
                    }
                    // var last = $('.menuBar').last();
                    // $("<div/>",{
                    //     html:"form autosaved<span style='margin-left:10px' class='checkmark'>✓</span>",
                    //     class:"confirm",
                    //     id:"AutoConfirm"
                    // }).insertAfter(last).wrap("<div id='AutoSaveWrap' class='wrapper'></div>");
                    // slideFadeIn($("#AutoSaveWrap"));
                    // setTimeout(function(){
                    //     slideFadeOut($("#AutoSaveWrap"),800,function(){
                    //         // $("#AutoSaveWrap").remove()
                    //     })
                    // },3000)
                }
                else{
                    // $("#formdata").text(data);
                    alert("There was an error saving the form. Your changes have NOT been saved.");
                }
            }
        })
    }
    function createFormObj(){
        var sections = $("#FormBuilder").find(".section");
        var sectionArr = [];
        sections.each(function(i,section){
            var items = $(section).data('items');
            var name = $(section).find(".sectionName").find("span").text();
            var obj = {
                "sectionName":name,
                "items":items
            };
            obj['displayOptions'] = ($(section).data('display') != undefined) ? $(section).data('display') : getDefaultCSS('section');
            sectionArr.push(obj);
        })
        var formName = $("#FormName").find(".value").text();
        var formID = $("#formdata").data("formid");
        var form = {
            "formName":formName,
            "formID":formID,
            "versionID":"",
            "sections":sectionArr,
            "numbers":{
                "sections":sections.length,
                "items":sections.find('.item').length+sections.find(".itemFU").length,
                "followups":sections.find(".itemFU").length
            }
        }
        //var str = JSON.stringify(form);
        return form;
    }
    function createItemObj(){
        if ($("#Text").val()=='' && !$("#AddText").is(":visible")){
            alertBox("type a question",$("#Text"),"after","fade");
            $.scrollTo($("#Text"));
            return false;
        }
        
        var ItemObj = {};
        
        var q = $.sanitize($("#Text").val());
        var t = ($("#AddText").is(":visible")) ? "narrative" : $("#Type").val();
        // console.log(t);
        var o;
        
        // DEFINE OPTIONS BASED ON TYPE
            var options = $("#Options").find("input").filter(":visible");
            if (options.length!=0){
                optionsY = options.filter(function(){
                    return $(this).val() != "";
                })
                optionsN = options.not(optionsY);
                if (optionsY.length < 2){
                    alertBox("must have at least two options",optionsN.first(),"after","fade");
                    return false;
                }
                
                var options = [];
                for (x=0;x<optionsY.length;x++){
                    var check = $.sanitize($(optionsY[x]).val());
                    check = check.split("\"").join("");
                    if ($.inArray(check,options)>-1){
                        alertBox("duplicate options not allowed",$(optionsY[x]),"after","fade");
                        return false;
                    }else{
                        options[x] = check;
                    }
                }
            }
            else {options=undefined;}
            
            var numberOptions = $("#NumberOptions").find("input").filter(":visible");
            if (numberOptions.length!=0){
                for (x=0;x<numberOptions.length;x++){
                    var i = $(numberOptions[x]);
                    if (i.val() == ""){
                        alertBox("required",i,"after","fade");
                        return false;
                    }
                }
                var min = Number(numberOptions.filter("[name='min']").val());
                var max = Number(numberOptions.filter("[name='max']").val());
                var inital = Number(numberOptions.filter("[name='initial']").val());
                var step = Number(numberOptions.filter("[name='step']").val());
                var units = numberOptions.filter("[name='units']").val();
                
                if (min>max){
                    alertBox("must be lesser than max",numberOptions.filter("[name='min']"),"after","2500");
                    return false;
                }
                if (inital>max || inital<min){
                    alertBox("must be between min and max",numberOptions.filter("[name='initial']"),"after","2500");
                    return false;
                }
                numberOptions = {
                    "min":min,
                    "max":max,
                    "initial":inital,
                    "step":step,
                    "units":units
                };
            }
            else {numberOptions = undefined;}
            
            var dateOptions = $("#DateOptions").find("input").filter(":visible");
            if (dateOptions.length!=0){
                var beginCurrent = $("#currentYearBegin").is(":checked"), endCurrent = $("#currentYearEnd").is(":checked"),
                    endNext = $("#nextYearEnd").is(":checked"), 
                    dateBegin = beginCurrent ? "c+0" : dateOptions.filter("[data-name='begin']").val(),
                    dateEnd = endCurrent ? "c+0" : dateOptions.filter("[data-name='end']").val(),
                    dateEnd = endNext ? "c+1" : dateEnd,
                    yearRange = dateBegin+":"+dateEnd;
                // console.log(yearRange);
                dateOptions = {
                    "yearRange":yearRange
                }
                if ($("#NoRestriction").is(":checked")==false){
                    var stop = $("#DateOptions").find("select").filter(function(){
                        return $(this).find("option:selected").val() == "";
                    });
                    if (stop.length > 0){
                        alertBox("required if you want to restrict dates",stop.first(),"after");
                        return false;
                    }
                    var minDate = "-"+$("[data-name='minNum']").val() + $("[data-name='minType']").val().charAt(0);
                    var maxDate = "+"+$("[data-name='maxNum']").val() + $("[data-name='maxType']").val().charAt(0);
                    dateOptions["minDate"] = minDate;
                    dateOptions["maxDate"] = maxDate;
                }else{
                    dateOptions["minDate"] = null;
                    dateOptions["maxDate"] = null;
                }
                console.log(dateOptions);
            }
            else{dateOptions=undefined;}
            
            var timeOptions = $("#TimeList").is(":visible");
            if (timeOptions){
                if ($("#TimeRestriction").find(".active").length==0){
                    alertBox("required",$("#TimeRestrict"));
                    $.scrollTo($("#TimeRestrict"));
                    return false;
                }
                var r = $("#TimeRestriction").find(".active");
                timeOptions = {};
                r.each(function(){
                    var v = $(this).data('value');
                    if (v == "allow any time"){
                        timeOptions['all'] = "default";
                    }else if (v == 'set range'){
                        timeOptions['minTime'] = $("#minTime").val();
                        timeOptions['maxTime'] = $("#maxTime").val();
                    }else if (v == 'set interval'){
                        timeOptions['step'] = $("#TimeOptions").find("#step").val();
                    }else if (v == 'set initial value'){
                        timeOptions['setTime'] = $("#setTime").val();
                    }
                })
            }
            else{timeOptions=undefined;}

            var textOptions = $("#TextOptions").is(":visible");
            if (textOptions){
                textOptions = {
                    'placeholder':$("#textPlaceholder").val()
                }
            }else{textOptions=undefined}
            var textBoxOptions = $("#TextBoxOptions").is(":visible");
            if (textBoxOptions){
                textBoxOptions = {
                    'placeholder':$("#textAreaPlaceholder").val()
                }
            }else{textBoxOptions=undefined}

            var sigOptions = $("#SignatureOptions").find("select").filter(":visible");
            if (sigOptions.length!=0){
                var printBool = $("#typedName").val();
                sigOptions = {
                    "typedName":printBool
                }
            }
            else{sigOptions=undefined;}
            
            var scaleOptions = $("#ScaleOptions").find("input, select").filter(":visible");
            if (scaleOptions.length!=0){
                var min = scaleOptions.filter("[data-name='scalemin']").val();
                var max = scaleOptions.filter("[data-name='scalemax']").val();
                var initial = scaleOptions.filter("[data-name='initial']").val();
                var minL = scaleOptions.filter("[name='minLabel']").val();
                var maxL = scaleOptions.filter("[name='maxLabel']").val();
                var dispL = scaleOptions.filter("[name='dispLabel']").val();
                var dispV = scaleOptions.filter("[name='dispVal']").val();
                            
                min = Number(min);
                max = Number(max);
                initial = Number(initial);
                if (min>max || min==max){
                    alertBox("must be less than max value",scaleOptions.filter("[name='scalemin']"),"after","fade");
                    return false;
                }
                if (inital < min || initial > max){
                    alertBox("must be within min and max values",scaleOptions.filter("[name='initial']"),"after","fade");
                    return false;
                }
                for (x=0;x<scaleOptions.length;x++){
                    var v = $(scaleOptions[x]).val();
                    if (v==""){
                        alertBox("required",$(scaleOptions[x]),"after","fade");
                        return false;
                    }
                }
            
                scaleOptions = {
                    "min":min,
                    "max":max,
                    "initial":initial,
                    "minLabel":minL,
                    "maxLabel":maxL,
                    "displayValue":dispV,
                    "displayLabels":dispL
                };
            }
            else{scaleOptions=undefined;}
            
            var narrativeOptions = $("#NarrativeList").filter(":visible");
            if (narrativeOptions.length!=0){
                narrativeOptions={
                    "markupStr":$("#NarrativeList").find(".summernote").summernote('code')
                };
            }
            else{narrativeOptions = undefined;}

            
            var followUpOptions = $("#FollowUpOptions").find("input, select");
            if ($("#FollowUpOptions").is(":visible")){
                if ($("#condition").find(".checkboxes").length>0){
                    if ($("#condition").find(".active").length==0){
                        var t = $("#condition").find(".answer");
                        alertBox("required",t,"after","fade");
                        return false;
                    }else{
                        var conditions=[];
                        $("#condition").find(".active").each(function(){
                            conditions.push($(this).data("value"));
                        });
                        followUpOptions = conditions;
                    }
                }
                else{
                    var conditionInputs=[];
                    for (x=0;x<followUpOptions.length;x++){
                        var i = $(followUpOptions[x]);
                        if (i.val() == ""){
                            alertBox("required",i.closest(".answer"),"after","fade");
                            return false;
                        }else{
                            conditionInputs.push(i.val());
                        }
                    }
                    followUpOptions = [conditionInputs.join(" ")];
                }
            }
            else{followUpOptions=undefined;}
        
        if (options!=undefined){o=options}
        else if (numberOptions!=undefined){o=numberOptions}
        else if (dateOptions!=undefined){o=dateOptions}
        else if (textOptions!=undefined){o=textOptions}
        else if (textBoxOptions!=undefined){o=textBoxOptions}
        else if (timeOptions!=undefined){o=timeOptions}
        else if (scaleOptions!=undefined){o=scaleOptions}
        else if (sigOptions!=undefined){o=sigOptions}
        else if (narrativeOptions!=undefined){o=narrativeOptions}
        
        ItemObj={
            "question":q,
            "type":t,
            "options":o
        };

        if (followUpOptions!=undefined){
            ItemObj["condition"] = followUpOptions;
            section = $("#AddItemProxy").closest(".item");
        }        
        return ItemObj;
                
        

        // if (section.is(".section")){
            //     var Items = section.data('items');
            //     if (mode=="update"){
            //         if (checkItem(ItemObj,section)){
            //             ItemObj["followups"] = Items[itemKey].followups;
            //             ItemObj['toggleFUs'] = Items[itemKey].toggleFUs;
            //             ItemObj['key'] = itemKey;
            //             ItemObj['displayOptions'] = (Items[itemKey].displayOptions!==undefined) ? Items[itemKey].displayOptions : defaultDisplayCSS ;
            //             Items[itemKey] = ItemObj;

            //             // updateItems(section);
            //             // slideFadeOut($("#AddItem"));
            //             setTimeout(function(){
            //                 resetAddItem();
            //                 resetOptions();
            //             },500);
            //         }        
            //     }
            //     else if (mode=="save"){
            //         if (checkItem(ItemObj,section)){
            //             ItemObj["followups"] = [];
            //             ItemObj['toggleFUs'] = 'hide';
            //             ItemObj['key'] = Items.length;
            //             ItemObj['displayOptions'] = defaultDisplayCSS;
            //             Items.push(ItemObj);
            //             // updateItems(section);
            //             // slideFadeOut($("#AddItem"));
            //             setTimeout(function(){
            //                 resetAddItem();
            //                 resetOptions();
            //             },500);
            //         }        
            //     }            
            // }
            // else if (section.is('.item')){
            //     if (mode=='save'){
            //         if (checkItem(ItemObj,section)){
            //             var Items = section.closest(".section").data('items');
            //             var FUs = Items[itemKey].followups;
            //             ItemObj['key'] = FUs.length;
            //             ItemObj['displayOptions'] = defaultDisplayCSS;
                    
            //             FUs.push(ItemObj);
            //             // updateItems(section.closest(".section"));
            //             // slideFadeOut($("#AddItem"));
            //             setTimeout(function(){
            //                 resetAddItem();
            //                 resetOptions();
            //             },500);
            //         }
            //     }
            //     else if (mode=='update'){
            //         if (checkItem(ItemObj,section)){
            //             var Items = section.closest(".section").data('items');
            //             var FUs = Items[itemKey].followups;
            //             ItemObj['key'] = FUkey;
            //             ItemObj['displayOptions'] = (FUs[FUkey].displayOptions!=undefined) ? FUs[FUkey].displayOptions : defaultDisplayCSS ;

            //             FUs[FUkey] = ItemObj;
            //             // updateItems(section.closest(".section"));
            //             // slideFadeOut($("#AddItem"));
            //             setTimeout(function(){
            //                 resetAddItem();
            //                 resetOptions();
            //             },500);
            //         }
            //     }
            // }
            // console.log(ItemObj);
            // $(".section").each(function(){
            //     updateItems($(this));
            // })
            // autoSave();
    }
    function saveItemObj(ItemObj,section,mode,itemKey,FUkey){
        if (section.is(".section")){
            var Items = section.data('items');
            if (mode=="update"){
                if (checkItem(ItemObj,section)){
                    ItemObj["followups"] = Items[itemKey].followups;
                    ItemObj['toggleFUs'] = Items[itemKey].toggleFUs;
                    ItemObj['key'] = itemKey;
                    ItemObj['displayOptions'] = (Items[itemKey].displayOptions!==undefined) ? Items[itemKey].displayOptions : getDefaultCSS('item') ;
                    Items[itemKey] = ItemObj;
                    Items.forEach(function(item, i){
                        item['key'] = i;
                    })

                }else{
                    return false;
                }
            }
            else if (mode=="save"){
                if (checkItem(ItemObj,section)){
                    ItemObj["followups"] = [];
                    ItemObj['toggleFUs'] = 'hide';
                    ItemObj['key'] = Items.length;
                    ItemObj['displayOptions'] = getDefaultCSS('item');
                    Items.push(ItemObj);
                }else{
                    return false;
                }
            }   
            else if (mode=='insert'){
                if (checkItem(ItemObj,section)){
                    ItemObj["followups"] = [];
                    ItemObj['toggleFUs'] = 'hide';
                    // ItemObj['key'] = Items.length;
                    ItemObj['displayOptions'] = getDefaultCSS('item');
                    Items.splice(itemKey+1,0,ItemObj);
                    Items.forEach(function(item, i){
                        item['key'] = i;
                    })
                }else{
                    return false;
                }
            }         
        }
        else if (section.is('.item')){
            if (mode=='save'){
                if (checkItem(ItemObj,section)){
                    var Items = section.closest(".section").data('items');
                    var FUs = Items[itemKey].followups;
                    ItemObj['key'] = FUs.length;
                    ItemObj['displayOptions'] = getDefaultCSS('item');
                    FUs.push(ItemObj);
                }else{
                    return false;
                }
            }
            else if (mode=='update'){
                if (checkItem(ItemObj,section)){
                    var Items = section.closest(".section").data('items');
                    var FUs = Items[itemKey].followups;
                    ItemObj['displayOptions'] = (FUs[FUkey].displayOptions!=undefined) ? FUs[FUkey].displayOptions : getDefaultCSS('item') ;
                    FUs[FUkey] = ItemObj;
                    FUs.forEach(function(FU, f){
                        FU['key'] = f;
                    })
                }else{
                    return false;
                }
            }else if (mode=='insert'){
                if (checkItem(ItemObj,section)){
                    var Items = section.closest(".section").data('items');
                    var FUs = Items[itemKey].followups;
                    ItemObj['displayOptions'] = getDefaultCSS('item');
                    FUs.splice(FUkey+1,0,ItemObj);
                    FUs.forEach(function(FU, f){
                        FU['key'] = f;
                    })
                }else{
                    return false;
                }
            }
        }
        return true;
    }
    
    function resetAddItem(){
        var clear = $("#AddItem").find("#Options").find("input");
        // clear = clear.add($("#NumberOptions").find("input"));
        clear.add("#Text").add($("#FollowUpOptions").find("input")).val("");
        $("#Type").val("text");
        $("#Type").change();
        $("#NumberOptions").find("#min").val("0");
        $("#NumberOptions").find("#max").val("100");
        $("#NumberOptions").find("#initial").val("5");
        $("#NumberOptions").find("#step").val("1");
        $("#NumberOptions").find("#units").val("");
    }
    function resetOptions(){
        var o = $("#OptionsList").find(".option");
        var n = o.length;
        if (n>2){
            for (x=2;x<n;x++){
                $(o[x]).remove();
                //$("#OptionsList").find("br").last().remove();
            }
        }
        o.val("");
    }
    function resetAddText(){$("#NarrTitle, #NarrText").val("");}
        
    if ($("#formdata").data("json")!=undefined){loadFormData();}
    function loadFormData(){
        var data = $("#formdata").data("json");
        var sections = data['sections'];
        var formName = data['formName'];
        var formID = data['formID'];
        $("#formdata").data("formid",formID);
        $("#FormName").find("input").val(formName);
        $("#FormName").find(".save").click();
        sections.forEach(function(section,i){
            var name = section.sectionName, items = section.items, showByDefault = section.showByDefault;
            $("#SectionName").val(name);
            $("#AddSection").find(".add").click();
            var newSec = $(".section").not("#examples").last();
            newSec.data('items',items);
            updateItems(newSec);
            //console.log(newSec.data("items"));
        })
    }
    
    function updateSections(){
        var sections = $("#Sections").find(".section"), sectionHeight = $("#Sections").height();
        var sectionCount = sections.length;
        var names = $("#Sections").find(".section").find(".sectionName").find("span");
        var nameArr = [], sectionLists, 
            node = $('<li><span class="name"></span><span class="details">loading . . .</span></li>'), Qs, FUs, name, newNode, headerText;
    
        $("#SectionOptions").find("li").remove();
        sections.each(function(s, section){
            name = $(section).find(".sectionName").find("span").text();
            newNode = node.clone();
            newNode.find(".name").text(name);
            $("#SectionOptions").find("ul").append(newNode);
        });
        setTimeout(function(){
            updateSecItemCount();
        },100)

        if (sectionCount == 0){
            headerText = "No Sections Yet";
            $("#SectionOptions").find("ul").hide();
        }else{
            headerText = "Sections";
            $("#SectionOptions").find("ul").show();
        }
        var text = (sectionCount != 0) ? "Sections" : "No Sections Yet";
        $("#SectionOptions").find("h3").text(text);
    }
    function updateSecItemCount(){
        var Qs, FUs, sections = $(".section"), node, wName = 0, wDetails = 0;
        sections.each(function(s,section){
            Qs = $(section).find(".item").not(".narrative").length;
            FUs = $(section).find(".itemFU").not(".narrative").length;
            Qs = (Qs == 1) ? Qs + " question" : Qs + " questions";
            FUs = (FUs == 1) ? FUs + " followup" : FUs + " followups";
            node = $("#SectionOptions").find("li").filter(function(){
                wName = (wName < $(this).find(".name").width()) ? $(this).find(".name").width() : wName;
                return $(this).find('.name').text().toLowerCase() == $(section).find(".sectionName").find(".value").text().toLowerCase();
            }).find(".details").text(Qs + ", " + FUs);
            $(".details").each(function(){
                wDetails = (wDetails < $(this).width()) ? $(this).width() : wDetails;
            })
        })
        $("#SectionOptions").find(".name").width(wName);
        $("#SectionOptions").find(".details").width(wDetails);
    }
    function updateSecOrder(){
        if ($(this).hasClass('up')){
            var d = 'up';
        }else if ($(this).hasClass("down")){
            var d = 'down';
        }
        var sections = $(".secName");
        var currentSec = $(this).closest(".secName");
        var n = sections.length, k = Number($(this).closest(".secName").data("key"));
        if ((k == 0 && d == "up") || (k == n -1 && d == "down")){
            return false;
        }
        if (d == "up"){
            var change = $(sections[k-1]);
            currentSec.insertBefore(change);            
        }else if (d == "down"){
            var change = $(sections[k+1])
            currentSec.insertAfter(change);
        }
        
        currentSec.animate({
            "height":"-=30px",
            "opacity":0.2
        },100,function(){
            currentSec.animate({
                "height":"+=30px",
                "opacity":1
            },400)
        })
        change.animate({
            "height":"+=30px",
            "opacity":0.2
        },100,function(){
            change.animate({
                "height":"-=30px",
                "opacity":1
            },400)
        })
        
        sections = $(".secName");
        for (x=0;x<n;x++){
            $(sections[x]).data("key",x);
        }
    }
    function saveSecOrder(){
        var newSecOrder = $(".secName");
        var sections = $(".section").not("#examples");
        for (x=0;x<newSecOrder.length;x++){
            var name = $(newSecOrder[x]).find("span").text();
            sections.filter(function(){
                return $(this).find(".sectionName").find("span").text() == name;
            }).appendTo("#Sections");
        }
        slideFadeOut($("#SectionOrder"));
        updateSections();
        if ($(".sectionOptions").length==2){
            $(".sectionOptions").last().appendTo("#Sections");
        }
        autoSave();
    }
    
    function checkItem(i,section){
        var q = i.question, big, little ;
        if (i.type == 'narrative'){
            return true;
        }
        if ($(section).is(".section")){
            big = ".Items";
            little = ".item";
        }else if ($(section).is(".item")){
            big = ".ItemsFU";
            little = ".itemFU";
        }
        var items = $(section).find(big).find(little).find(".question");
        var qArr = [];
                
        // console.log(q);
        // console.log(big);
        // console.log(little);
        // console.log(items);

        items.each(function(i,item){
            var t = $(item).data("question");
            qArr.push(t);
        })
        
        if ($("#AddItemProxy").parent().is(little)){
            var itemKey = $("#AddItemProxy").parent().find(".question").data("key");
        }
                
        if ($.inArray(q.toLowerCase(),qArr)>-1){
            if ($("#AddItemProxy").parent().is(little) && itemKey == $.inArray(q.toLowerCase(),qArr)){
                return true;
            }
            var t = $("#AddItem").find("#Text");
            alertBox("question already exists",$(t),"after","2500");
            return false;
        }else{
            return true;
        }
    }
    
    function updateItems(section){
        var Items = section.data("items");
        var big = ".Items";
        var little = ".item";
        var ItemsList = $(section).find(".Items").find(".target"), n = Items.length;

        $("#AddItem, #AddText, #AddItemProxy").hide().appendTo("#FormBuilder");
        ItemsList.html("");
        Items.forEach(function(i,x){
            var t = i.type, q = i.question, o = i.options, c = i.condition, ItemsFU = i.followups, tFUs = i.toggleFUs;
            $(itemNode).appendTo(ItemsList);
            var newItem = ItemsList.find(".item").last();
            
            if (t == "narrative"){q = "Rich Text Block";}
            newItem.find(".question").html(q + "<div class='toggle edit'>(edit)</div><div class='toggle copy'>(duplicate)</div><div class='toggle delete'>(delete)</div><div class='toggle save'>(save)</div><div class='toggle cancel'>(cancel edit)</div>").data({"question":q, "key":x, "type":t, "options":o, "toggleFUs":tFUs});
            
            var r = (t == "narrative") ? ".narrative" : ".answer",
                template = $(".template").filter("[data-type='"+t+"']").find(r).clone();

            template.removeAttr('id');
            newItem.find(".answer").replaceWith(template);
            activateItem(newItem,t,o);
                        
            CurrentItem = newItem;
            
            var ItemsFUList = CurrentItem.find(".ItemsFU").find(".targetFUs");
            
            if (ItemsFU.length>0){
                ItemsFU.forEach(function(f,xFU){
                    var tFU = f.type, qFU = f.question, oFU = f.options, cFU = f.condition, cStr = "is <span class='bold underline'>";
                    $(itemFUNode).appendTo(ItemsFUList);
                    var newItemFU = ItemsFUList.find(".itemFU").last();
                    if (tFU == "narrative"){qFU = "Rich Text Block";}
                    newItemFU.find(".question").html(qFU + "<div class='toggle edit'>(edit)</div><div class='toggle copy'>(duplicate)</div><div class='toggle delete'>(delete)</div><div class='toggle save'>(save)</div><div class='toggle cancel'>(cancel edit)</div>").data({"question":qFU, "key":xFU, "type":tFU, "options":oFU, "condition":cFU});
                    
                    var rFU = (tFU == "narrative") ? ".narrative" : ".answer",
                        template = $(".template").filter("[data-type='"+tFU+"']").find(rFU).clone();

                    template.removeAttr('id');
                    newItemFU.find(".answer").replaceWith(template);
                    // cFU = cFU.join(", or ");
                    // console.log(cFU.length);

                    if (cFU.length == 1){
                        cStr = "is <span class='bold underline'>"+cFU+"</span>";
                    }else if (cFU.length == 2){
                        cStr = "is <span class='bold underline'>"+cFU.join(" or ")+"</span>";
                    }else{
                        for (c = 0;c < cFU.length; c++){
                            var add = (c == cFU.length - 1) ? " or " + cFU[c] + "</span>" : " " + cFU[c] + ",";
                            cStr += add;
                        }
                    }
                    newItemFU.find(".condition").html("Condition: <span class='bold underline'>"+q+"</span> "+cStr);
                    activateItem(newItemFU,tFU,oFU);
                })
            }
            
            var nFU = ItemsFU.length;
            var s = CurrentItem.find(".ItemsFU").children("p").find("span").clone();
            var text;
            if (nFU == 0){
                text = "Follow up based on response";
            }else if (nFU==1){
                text = "1 followup";
            }else {
                text = nFU + " followups";
            }
            CurrentItem.find(".ItemsFU").children("p").html(text).prepend(s);


            if ($(ItemsFUList).text() == ""){
                $(ItemsFUList).html("<div style='padding:0.5em 1em;'>Add some followup questions!</div>");
            }
            
            var toggleFUs = CurrentItem.find(".question").data("toggleFUs");
            if (toggleFUs == "show"){
                CurrentItem.find(".targetFUs").show();
                CurrentItem.find(".hideFUs").find("span").removeClass("right").addClass("down");
            }
            
            var noFUs = ['text','date','signature','narrative','text box','time'];
            if ($.inArray(t,noFUs)>-1){
                $(CurrentItem).find(".ItemsFU").hide();
                $(CurrentItem).find(".newFollowUp").hide();
            }
        })
        
        
        var s = $(section).find(".Items").children("p").find("span").clone();
        var text;
        if (n == 0){
            text = "No questions";
        }else if (n==1){
            text = "1 question";
        }else {
            text = n + " questions";
        }
        n = $(section).find(".itemFU").length;
        if (n == 0){
            text += "";
        }else if (n==1){
            text += " with 1 followup question";
        }else {
            text += " with " + n + " followup questions";
        }
        
        $(section).find(".Items").children("p").html(text).prepend(s);
        
        updateSections();
                
        if ($(ItemsList).text() == ""){
            $(ItemsList).html("<div style='padding:0.5em 1em;'>Add some questions!</div>");
        }

        
        var itemOrder = $(".item").children(".UpDown").find(".up, .down");
        itemOrder.off("click",updateItemOrder);
        itemOrder.on("click",updateItemOrder);
        var itemFUOrder = $(".itemFU").children(".UpDown").find(".up, .down");
        itemFUOrder.off("click",updateItemFUOrder);
        itemFUOrder.on("click",updateItemFUOrder);
        
        $(section).find('.Items').find('.target').find(".selectMultiple").find(".show").on("click",multiItemOptions);
        $(section).find('.Items').find('.target').find(".selectMultiple").find(".hide").on("click",hideMultiItemOptions);
        $(section).find('.Items').find('.target').find(".selectMultiple").find(".copy").on("click",copyMultiple);
        $(section).find('.Items').find('.target').find(".selectMultiple").find(".delete").on("click",deleteMultiple);
        
        $(".ItemsFU").each(function(){
            if (!$(this).find(".targetFUs").is(":visible")){
                $(this).find(".selectMultiple").hide();
            }
        })
        updatedInsertProxies();
    }

    function updatedInsertProxies(){
        var insertNode = $("<div/>",{
            class: "insertProxy",
            html:"<div class='insertBtns'><div class='button white xxsmall insertQuestion'>insert question</div><div class='button white xxsmall insertText'>insert text</div></div><div class='plus'>+</div>"
        });
        $(".insertProxy").remove();
        $(".target, .targetFUs").each(function(t, target){
            var items = $(target).children().not($(target).children().last()), k;
            items.each(function(){
                // console.log($(this).children(".question").data('key'));
                k = $(this).children(".question").data('key');
                insertNode.clone().insertAfter($(this)).data('key',k);
            })
        })
    }
    
    var stickyCSS = {position:"sticky",top:"11em",right:"0",display:"inline-block",margin:"0 1em"}, 
        notStickyCSS = {position:"relative",margin:"-1em 1em",top:"1em",right:"0"},
        centerCSS = {position: "absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)"},
        rightAlignCSS = {position: "absolute",right:'0',top:"50%",transform:"translateY(-50%)"};
    
    function multiItemOptions(){
        var section = $(this).closest(".Items, .ItemsFU");
        $(this).hide();
        $(this).parent().css(stickyCSS);
        $(".selectMultiple").find(".hide").filter(":visible").click();
        $(this).parent().find(".hide").show();
        if (section.is(".Items")){
            var items = section.find(".target").children(".item");
            items.each(function(i,item){
                if ($(item).find(".targetFUs").is(":visible")){$(item).find(".hideFUs").click();}
                $(item).find(".ItemsFU").find(".selectMultiple").fadeOut();
            })
        }
        else if (section.is(".ItemsFU")){var items = section.find(".targetFUs").children(".itemFU");}
        items.children('.question').find(".toggle").fadeOut();
        items.children(".UpDown").html("<input class='selectChkBx' type='checkbox'>");
        items.each(function(i,item){
            $("<div/>",{class:"block multiItem"}).prependTo($(item))
                .on("mouseenter",hoverItem)
                .on("mouseleave",unhoverItem)
                .on("click",selectItem);
        })
    }
    function selectItem(){
        $(this).addClass("selected");
        var item = $(this).closest(".item, .itemFU");
        item.find(".selectChkBx").attr("checked",true);
        $(this).off("click",selectItem).on("click",unselectItem);
        var section = $(this).closest(".Items, .ItemsFU");
        section.children(".selectMultiple").find(".copy, .delete").css(stickyCSS);
    };
    function unselectItem(){
        $(this).removeClass("selected");
        var item = $(this).closest(".item, .itemFU");
        item.find(".selectChkBx").attr("checked",false);
        $(this).off("click",unselectItem).on("click",selectItem);
        var section = item.closest(".Items, .ItemsFU");
        if (section.find(".block").filter(".selected").length == 0){
            section.children(".selectMultiple").find(".delete, .copy").fadeOut();
        }
    };
    function hoverItem(){$(this).addClass("hover");};
    function unhoverItem(){$(this).removeClass("hover");};

    function copyMultiple(){
        var optBox = $(this).closest(".selectMultiple"),
            itemList = $(this).closest(".Items, .ItemsFU"),
            section = $(this).closest(".section");

        var Items = section.data("items"), selected = section.find(".block").filter(".selected").closest(".item, .itemFU"),
            confirmText = (selected.length == 1) ? "Duplicating 1 item" : "Duplicating " + selected.length + " items";

        $("#Confirm").clone().attr('id','MultiCopy').appendTo("#ModalHome");
        $("#MultiCopy").find(".message").html("<h2>"+confirmText+"</h2><div>Where would you like to put the new copies?</div>");
        $("#MultiCopy").find(".options").find(".submit").remove();
        $("#MultiCopy").find(".options").find(".cancel").text("cancel").addClass('multiCopyOption');
        $("<div/>",{
            class:"multiCopyOption button small pink",
            data:{
                value:"asBlock"
            },
            text:"end of section"
        }).prependTo($("#MultiCopy").find(".options"));
        $("<div/>",{
            class:"multiCopyOption button small pink",
            data:{
                value:"afterOriginal"
            },
            text:"after each original"
        }).prependTo($("#MultiCopy").find(".options"));
        blurElement($("body"),"#MultiCopy");

        $(".multiCopyOption").on("click",function(){
            var opt = $(this).data("value"), section = $(".section").filter(function(){
                    return $(this).find(".selectMultiple").find(".hide").is(":visible");
                }), Items = section.data("items"), selected = section.find(".block").filter(".selected").closest(".item, .itemFU");
            if (opt=="asBlock"){
                selected.each(function(i,x){
                    var item = $(x), k = item.find('.question').data('key');
                    if (item.is(".itemFU")){
                        Items = section.data("items");
                        var kP = item.closest(".item").find(".question").data('key');
                        Items = Items[kP].followups;
                    }
                    var copy = {};
                    $.extend(true,copy,Items[k]);
                    copy.question = copy.question + " COPY";
                    Items.push(copy);
                })
                updateItems(section);
                autoSave();
                $(".zeroWrap").remove();
                optBox.find(".hide").click();
                unblurElement($("body"));
                $("#MultiCopy").removeAttr("id").remove();
            }
            else if (opt=="afterOriginal"){
                var Items = section.data("items"), selected = section.find(".block").filter(".selected").closest(".item, .itemFU");
                selected.each(function(i,x){
                    var item = $(x), k = item.find('.question').data('key');
                    if (item.is(".itemFU")){
                        Items = section.data("items");
                        var kP = item.closest(".item").find(".question").data('key');
                        Items = Items[kP].followups;
                    }
                    var copy = {};
                    $.extend(true,copy,Items[k+i]);
                    copy.question = copy.question + " COPY";
                    Items.splice(k+1+i,0,copy);
                })
                updateItems(section);
                autoSave();
                optBox.find(".hide").click();
                unblurElement($("body"));
                $("#MultiCopy").removeAttr("id").remove();
            }
        })    
    }
    function deleteMultiple(){
        var section = $(this).closest(".section"), optBox = $(this).closest(".selectMultiple");
        var Items = section.data("items"), selected = section.find(".block").filter(".selected").closest(".item, .itemFU"),
            warningText = (selected.length == 1) ? "DELETE 1 ITEM" : "DELETE " + selected.length + " ITEMS";

        $("#Warn").find(".message").html("<h2 class='pink'>"+warningText+"?</h2><div>Are you sure you want to do this? It <u>cannot be undone.</u></div>");
        $("#Warn").find(".submit").text(warningText);
        blurElement($("body"),"#Warn");
        var wait = setInterval(function(){
            if (confirmBool!=undefined){
                if (confirmBool==true){
                    selected.each(function(i,x){
                        var item = $(x), k = item.find('.question').data('key');
                        if (item.is(".itemFU")){
                            Items = section.data("items");
                            var kP = item.closest(".item").find(".question").data('key');
                            Items = Items[kP].followups;
                        }
                        Items.splice(k-i,1);
                    })
                    updateItems(section);
                    optBox.find(".hide").click();
                    autoSave();
                    confirmBool=undefined;
                    unblurElement($("body"));
                    clearInterval(wait);
                }
                else if (confirmBool==false){
                    confirmBool=undefined;
                    clearInterval(wait);
                }
            }
        },100);
    }
    function hideMultiItemOptions(){
        var section = $(this).closest(".Items, .ItemsFU");
        section.find(".block").remove();
        $(this).parent().css(notStickyCSS);
        $(this).parent().find(".show").show();
        $(this).parent().find(".delete, .copy, .hide").hide();
        if (section.is(".Items")){
            var items = section.find(".target").children(".item");
        }
        else if (section.is(".ItemsFU")){var items = section.find(".targetFUs").children(".itemFU");}
        items.children('.question').find(".toggle").filter(".edit, .copy, .delete").fadeIn();
        items.children(".UpDown").html("<div class='up'></div><div class='down'></div>");
        //items.find('.ItemsFU').find(".selectMultiple").fadeIn();
        
        if (section.is(".Items")){
            items.children(".UpDown").find(".up, .down").on("click",updateItemOrder);
        }else{
            items.children(".UpDown").find(".up, .down").on("click",updateItemFUOrder);
        }
    }
    
    function updateItemOrder(){
        if ($(this).hasClass('up')){
            var d = 'up';
        }else if ($(this).hasClass("down")){
            var d = 'down';
        }
        var items = $(this).closest(".section").find(".item");
        var ItemArr = $(this).closest(".section").data("items");
        var currentItem = $(this).closest(".item");
        var n = items.length, k = Number($(this).closest(".item").find(".question").data("key"));
        if ((k == 0 && d == "up") || (k == n -1 && d == "down")){
            return false;
        }
        if (d == "up"){
            var change = $(items[k-1]);
            change.find(".question").data("key",k);
            currentItem.find(".question").data("key",k-1);
            ItemArr[k].key = k -1;
            ItemArr[k-1].key = k;
            currentItem.insertBefore(change);            
        }else if (d == "down"){
            var change = $(items[k+1]);
            change.find(".question").data("key",k);
            currentItem.find(".question").data("key",k+1);
            ItemArr[k].key = k +1;
            ItemArr[k+1].key = k;
            currentItem.insertAfter(change);
        }
        ItemArr.sort(function(a,b){
            return a.key-b.key;
        });
        updatedInsertProxies();

        currentItem.animate({
            "height":"-=30px",
            "opacity":0.2
        },100,function(){
            currentItem.animate({
                "height":"+=30px",
                "opacity":1
            },400,function(){
                currentItem.css("height","auto");
            })
        })
        change.animate({
            "height":"+=30px",
            "opacity":0.2
        },100,function(){
            change.animate({
                "height":"-=30px",
                "opacity":1
            },400,function(){
                change.css("height","auto");
                updateItems($(this).closest('.section'));
            })
        })        

        autoSave();
    }
    function updateOptionOrder(){
        if ($(this).hasClass('up')){
            var d = 'up';
        }else if ($(this).hasClass("down")){
            var d = 'down';
        }
        var options = $("#OptionsList").find(".option");
        var currentOption = $(this).closest(".option");
        var n = options.length;//, k = Number($(this).closest(".itemName").data("key"));
        var f = options.first(), l = options.last();
        if ((currentOption.is(f) && d == 'up') || (currentOption.is(l) && d == 'down')){
            return false;
        }
        if (d == "up"){
            var change = currentOption.prev();
            currentOption.insertBefore(change);            
        }else if (d == "down"){
            var change = currentOption.next();
            currentOption.insertAfter(change);
        }
        
        currentOption.animate({
            "height":"-=30px",
            "opacity":0.2
        },100,function(){
            currentOption.animate({
                "height":"+=30px",
                "opacity":1
            },400)
        })
        change.animate({
            "height":"+=30px",
            "opacity":0.2
        },100,function(){
            change.animate({
                "height":"-=30px",
                "opacity":1
            },400)
        })
        
        /*items = $(".itemName");
        for (x=0;x<n;x++){
            $(items[x]).data("key",x);
        }*/
    }
    function updateItemFUOrder(){
        if ($(this).hasClass('up')){
            var d = 'up';
        }else if ($(this).hasClass("down")){
            var d = 'down';
        }
        
        var itemsFU = $(this).closest(".item").find(".itemFU"), f = itemsFU.first(), l = itemsFU.last();
        var currentItemFU = $(this).closest(".itemFU");
        var nFU = itemsFU.length, kFU = Number($(this).closest(".itemFU").find(".question").data("key"));
        var k = Number($(this).closest(".item").find(".question").data("key"));
        var ItemArr = $(this).closest(".section").data("items");
        var ItemFUArr = ItemArr[k]['followups'];

        if ((currentItemFU.is(f) && d == "up") || (currentItemFU.is(l) && d == "down")){
            return false;
        }
        if (d == "up"){
            var change = $(itemsFU[kFU-1]);
            change.find(".question").data("key",kFU);
            currentItemFU.find(".question").data("key",kFU-1);
            ItemFUArr[kFU].key = kFU -1;
            ItemFUArr[kFU-1].key = kFU;
            currentItemFU.insertBefore(change);            
        }else if (d == "down"){
            var change = $(itemsFU[kFU+1]);
            change.find(".question").data("key",kFU);
            currentItemFU.find(".question").data("key",kFU+1);
            ItemFUArr[kFU].key = kFU +1;
            ItemFUArr[kFU+1].key = kFU;
            currentItemFU.insertAfter(change);
        }
        ItemFUArr.sort(function(a,b){
            return a.key-b.key;
        });
        updatedInsertProxies();

        currentItemFU.animate({
            "height":"-=30px",
            "opacity":0.2
        },100,function(){
            currentItemFU.animate({
                "height":"+=30px",
                "opacity":1
            },400,function(){
                currentItemFU.css("height","auto");
            })
        });
        change.animate({
            "height":"+=30px",
            "opacity":0.2
        },100,function(){
            change.animate({
                "height":"-=30px",
                "opacity":1
            },400,function(){
                change.css("height","auto");
                updateItems($(this).closest('.section'));
            })
        });
        currentItemFU.add(change).css("height","auto");
        
        autoSave();
    }
    function updateItemData(){

    }
    // function saveItemFUOrder(){
    //     var s = $(this).closest(".section");
    //     var items = s.data('items');
    //     var K = $(this).closest(".item").find(".question").data('key');
    //     var itemsFU = items[K].followups;        
    //     var qArr = [], newArr =[];
    //     var newItemFUOrder = $("#ItemFUList").find(".itemFUName");
        
    //     itemsFU.forEach(function(item,i){
    //         qArr.push(item.question);
    //     })
    //     for (x=0;x<newItemFUOrder.length;x++){
    //         var q = $(newItemFUOrder[x]).find("span").text();
    //         var k = $.inArray(q,qArr);
    //         newArr.push(itemsFU[k]);
    //     }
    //     items[K].followups = newArr;
    //     $("#ItemFUOrder").appendTo("#FormBuilder").hide();
    //     updateItems(s);
    //     autoSave();
    // }
    
    function showConditionOptions(item){
        var k = item.find(".question").data('key');
        var Items = item.closest(".section").data('items');
        var currentItem = Items[k];
        var o = currentItem.options, t = currentItem.type, q = currentItem.question;
        var oStr = '';
        
        $("#condition").find(".answer").remove();
        
        if (t == "radio" || t == 'checkboxes' || t == 'dropdown'){
            var oNode = $("<ul class='answer'></ul>");
            oNode.prependTo($("#condition"));
            oNode = $("#FollowUpList").find(".answer");
            $("#DisplayQ").text(q);
            $("#Conditionality").text("one of the following responses (select as many as you want)");
            
            for (x=0;x<o.length;x++){
                var escapedStr = o[x].split("\"").join("&quot;");
                escapedStr = escapedStr.split("'").join("&apos;");
                oStr += "<li data-value='"+escapedStr+"'>"+escapedStr+"</li>";
            }
            oNode.addClass("checkboxes").html(oStr);
            oNode.append("<input class='targetInput' name='condition' type='hidden'>");
            oNode.on("click","li",checkbox);
       }
        else if (t == "number" || t == "scale"){
            var oNode = $("<div class='answer'></div>");
            oNode.prependTo($("#condition"));
            oNode = $("#FollowUpList").find(".answer");
            $("#DisplayQ").text(q);
            $("#Conditionality").text("the following conditions");
            
            var conditionNode = "<span>Response is </span><select><option value='less than'>less than</option><option value='equal to'>equal to</option><option value='greater than'>greater than</option></select><div class='answer number'><input size='10' type='text' data-min='1920' data-max='2028' value='2018' data-step='1'><span class='label'></span><div><div class='change up'></div><div class='change down'></div></div></div>";
            
            var min = o.min, max = o.max, initial = o.initial, step = o.step, units = o.units;
            oNode.html(conditionNode);
            $("#condition").find("input").data({
                min: min,
                max: max,
                step: step
            });
            $("#condition").find('input').val(initial);
            $("#condition").find(".label").text(units);
            $("#condition").off("mousedown touchstart",".change",startChange);
            $("#condition").off("mouseup touchend",".change",stopChange);
            $("#condition").on("mousedown touchstart",".change",startChange);
            $("#condition").on("mouseup touchend",".change",stopChange);
        }
        else if (t == "scale"){
            //var oNode = $("<input type='slider'>")
        }
        
        p = $("#AddItemProxy").parent();
        if (p.is(".itemFU")){
            c = p.find(".question").data("condition");
            //c = c.split(", ");
            for (x=0;x<c.length;x++){
                p.find("li").filter(function(){
                    return $(this).data("value") == c[x];
                }).click();
            }            
        }
    }
    
    function activateItem(item,type,options){
        var target;
        if (type == "radio"){
            target = item.find("ul");
            target.find("li").remove();
            $.each(options,function(i,value){
                $("<li data-value='"+value+"'>"+value+"</li>").appendTo(target).on("click",radio);
            });
        }
        else if (type == "narrative"){
            target = item.find(".narrative");
            var str = options.markupStr.replace(/<img src="%%EMBEDDED:([^>]*)>/g,"<div class='loadImg'>click to load images</div>");
            target.html(str);
            item.on("click",".loadImg",function(){
                blurElement(item,"#loading");
                $.ajax({
                    url: "/narrativeImgData",
                    method: "POST",
                    data: options,
                    success: function(data){
                        var markup = $(data).html();
                        target.html(markup);
                        // UPDATE ITEM FOR EDITING PURPOSES
                        options['markupStr'] = markup;
                        item.find('.question').data('options',options);
                        target.css('min-height','unset');
                        unblurElement(item);
                    }
                })
            })
        }
        else if (type == "number"){
            target = item.find('.number').find("input");
            target.data(options);
            target.val(options['initial']);
            item.find('.number').find(".label").text(options['units']);
            item.find('.number').on("mousedown touchstart",".change",startChange);
            item.find('.number').on("mouseup touchend",".change",stopChange);
            item.find('.number').on('keyup',"input",inputNum);
            item.data('options',options);
        }
        else if (type == "checkboxes"){
            target = item.find("ul");
            target.find("li").remove();
            $.each(options,function(i,value){
                $("<li data-value='"+value+"'>"+value+"</li>").appendTo(target).on("click",checkbox);
            });
        }
        else if (type == "dropdown"){
            target = item.find("select");
            target.find("li").remove();
            $.each(options,function(i,value){
                $("<option value='"+value+"'>"+value+"</option>").appendTo(target).on("click",radio);
            });
        }
        else if (type == "scale"){
            target = item;
            var displayValue = (options['displayValue'] == "yes") ? true:false,
                displayLabel = (options['displayLabels'] == "yes") ? true:false,
                minLabelStr, maxLabelStr,
                min = options['min'], max = options['max'], initial = options['initial'],
                minLabel = options['minLabel'], maxLabel = options['maxLabel'],
                scale = item.find(".scale"), slider = item.find(".slider"),
                showValue = (options['displayValue'] == 'yes') ? true : false;
            if (displayLabel){
                minLabelStr = "("+min+") " + minLabel;
                maxLabelStr = maxLabel + " ("+max+")";
            }else if (!displayLabel){
                minLabelStr = minLabel;
                maxLabelStr = maxLabel;
            }
            target.find(".answer").find(".left").text(minLabelStr);
            target.find(".answer").find(".right").text(maxLabelStr);
            target.find(".slider").attr({
                "value":initial, "min":min, "max":max
            });

            scale.on("mouseenter",function(){
                var item = $(this).closest('.item');
                
                clearTimeout(item.data("timeoutId"));
                changeSliderValue(item);
            });    
            scale.on("mouseleave touchend", function(){
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
            slider.closest(".item").data("updateId","clear");
            slider.on("mousedown touchstart",function(){
                var item = $(this).closest('.item');
                if (item.data("updateId")=="clear"){
                    var updateId = setInterval(function(){
                        changeSliderValue(item);
                    },100);
                    showSliderValue(item);
                    item.data('updateId',updateId);
                }
            });
            if (showValue){slider.addClass('showValue');}
            else {slider.removeClass('showValue');}
        }
        else if (type == "date"){
            target = item.find("input");
            target.on("focus",function(e){
                e.preventDefault();
            });
            target.removeAttr('id');
            target.removeClass('is-datepick');
            target.datepick(options);
        }
        else if (type == "text"){
            target = item.find('input');
            t = (options != undefined && options['placeholder'] != undefined) ? options['placeholder'] : "";
            target.attr('placeholder',t);
        }
        else if (type == "text box"){
            target = item.find('textarea');
            t = (options != undefined && options['placeholder'] != undefined) ? options['placeholder'] : "";
            target.attr('placeholder',t);
        }
        else if (type == "signature"){
            target = item.find(".signature");
            target.find(".jSignature").remove();
            target.jSignature();
            target.on("click",".clear",function(){
                target.parent().jSignature("reset");
            });
            if (options['typedName'] == 'yes'){item.find(".printed").show();}else{item.find(".printed").hide();}
        }
        else if (type == "time"){
            target = item.find('input');
            target.removeAttr('id').removeClass('ui-timepicker-input').val(options['setTime']);
            target.timepicker(options);
            // console.log(options);
        }
    }
})