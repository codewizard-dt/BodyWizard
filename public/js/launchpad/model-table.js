var defaultFilterOptions = {
    "highlight":"true",
    "separateWords":"false",
    "wholeWords":"true"
    };
$(document).ready(function(){
})
function initializeNewModelTables(){
    var filterTypes = filterUninitialized('.filterType'), tableFilters = filterUninitialized('.tableFilter'), tableSearches = filterUninitialized('.tableSearch');
    $(".filterType").each(function(){
        if ($(this).data('options')==undefined){
            $(this).data('options',defaultFilterOptions);
        }else{
            var optObj = $(this).data('options');
            $.each(defaultFilterOptions,function(key,value){
                if (optObj[key]==undefined){
                    optObj[key] = defaultFilterOptions[key];
                }
            })
            $(this).data("options",optObj);
        }
    });
    $(".tableFilter").on("change",function(){
        table = $(this).closest(".filterType").data("target");
        table = $(table);
        var f = $(this).data('filter'), fT = $(".filterType").filter("[data-condition='"+f+"']");
        if ($(this).is(":checked")){
            slideFadeIn(fT);
        }else{
            slideFadeOut(fT);
            fT.find(".tableFilter").each(function(){
                if ($(this).is(":checked")){$(this).click();}
            })
        }
        filterTableList(table);
    });
    $(".tableSearch").on("keyup",function(){
        table = $(this).closest(".filterType").data("target");
        table = $(table);
        filterTableList(table);
    });
    filterTypes.add(tableFilters).add(tableSearches).data('initialized',true);

    var extraBtns = filterUninitialized(".loadInTab");
    extraBtns.on('click',function(){
        var t = $(this).closest(".loadTarget"), uri = $(this).data('uri');
        LoadingContent(t, uri);
    })
    extraBtns.data('initialized',true);

    $(".connectedModel").on('click','.cancel',function(){
        $(".targetInput").removeClass("targetInput");
    })

    // INITIALIZING TABLES
        var tables = filterUninitialized(".styledTable.clickable");
        $("tr").filter(function(){
            return $(this).text().includes("No matches");
        }).addClass("noMatch");
        
        tables.each(function(t,table){
            var modal = ($(this).closest(".connectedModel").length > 0) ? true : false;
            filterTableList($(table));
            var prevID = 0, 
                trs = $(table).find("tr").not(".head"), 
                index = $(table).data('index'),
                target = $(table).data("target"),
                current = ($(target).data('uid')!=undefined) ? $(table).find("tr").filter("[data-uid='"+$(target).data('uid')+"']") : null;
            if (current){current.addClass("active");}
            alternateRowColor($(table));

            var formLoadXHR = undefined;
            trs = $(table).find("tr").not(".head, .noMatch");

            if (!modal && $(table).hasClass('modelTable')){
                var model = $(table).data('model');
                trs.on('click',rowClickLoadModel);
                $("#delete"+model).find(".delete").on("click",deleteModel);
            }else if ($(table).hasClass('modelTable')){
                var model = $(table).data('model'), modal = $(this).closest('.connectedModel'), 
                    connectedTo = modal.data('connectedto'), modalId = "#"+modal.attr("id");

                var createForm = $(".modalForm").filter(function(){
                    return $(this).hasClass('createNew') && $(this).data('model') == model;
                });

                var item = $(".modalForm").filter('[data-model="'+connectedTo+'"]').find(".item, .itemFU").filter(function(){
                    var question = $(this).children(".question").text().toLowerCase().replace(" ","");
                    if (model == 'User'){
                        return chkStrForArrayElement(question,['user','recipient']);
                    }else if (model == 'Diagnosis'){
                        return chkStrForArrayElement(question,['diagnosis','diagnoses']);
                    }else{
                        return chkStrForArrayElement(question,[model.toLowerCase()]);
                    }
                }), input = item.find("input, textarea"), selectBtn = modal.find(".selectData");

                var uidArr = $("#Current"+connectedTo).find(".name").data('connectedmodels');

                if (uidArr != undefined){
                    uidArr = (uidArr[model] == undefined) ? [] : uidArr[model];
                }else{
                    uidArr = [];
                }

                activateInput(input,modalId,uidArr);
                trs.on("click", selectInputFromTable);
                selectBtn.on('click',updateInputFromTable);
            }

            var hideFilters = $(".filterType").filter(function(){
                return $(this).data("target") == "#"+$(table).attr("id") && $(this).data("filter") == "hide";
            });
            hideFilters.find("input").click();

            checkHorizontalTableFit($(table));
        })

        tables.find('tr').filter(function(){
            return trimCellContents($(this).find('.status')) == 'required'
        }).addClass('required');

        tables.data("initialized",true);
    if (!$(".optionsNav").first().hasClass("hide")){$(".optionsNavHeader").show();}
    var newHead = filterUninitialized(".optionsNavHeader");
    newHead.on('click','.hide',hideOptionsNav);
    newHead.data('initialized',true);
    var newNav = filterUninitialized(".optionsNav");
    newNav.on('click','.toggleDetails',toggleDetails);
    newNav.data('initialized',true);
}
function hideOptionsNav(){
    if ($(this).text() == 'hide'){
        slideFadeOut($(".optionsNav"));
        $(this).text($(".optionsNav").find(".name").text());
    }else{
        slideFadeIn($(".optionsNav"));
        $(this).text('hide');        
    }
}
function toggleDetails(){
    var showNow = $(this).hasClass('down'), label = $(this).find('.label'), text = label.text();
    if (showNow){
        slideFadeIn($(".navDetails"));
        $(this).find(".arrow").prependTo($(this));
        label.text(text.replace("more","less"));
    }else{
        slideFadeOut($(".navDetails"));
        $(this).find(".arrow").appendTo($(this));
        label.text(text.replace("less","more"));
    }
    $(this).toggleClass('down up');
}
var optionsLoadXHR = undefined;
function rowClickLoadModel(){
    var uid = $(this).data('uid'), 
    	table = $(this).closest(".styledTable"),
    	// target = $(table).data('target'), 
        target = '.optionsNavWrapper',
    	model = $(table).data('model'),
    	destinations = $(table).data('destinations').split(","),
    	btnText = $(table).data('btntext').split(",");

    if ($(target).data("uid")==uid && optionsLoadXHR==undefined){
        alertBox("already selected",$(target).find(".name"),"below","fade");
        $(this).addClass('active');
        return false;
    }

    $("tr").removeClass('active');
    $(this).addClass("active");

    $("#loading").remove();
    $("<div id='loading' class='lds-ring'><div></div><div></div><div></div><div></div></div>").appendTo("body");
    blurElement($(target),"#loading");
    if ($(target).hasClass("hide")){
    	$(target).removeClass('hide');
    	$(target).closest(".wrapper").show();
        $(".optionsNavHeader").show();
        $(".optionsNavHeader").find('.hide').text('hide');
    }
    
    slideFadeIn($(target),1500,function(){
        $(".optionsNavHeader").find('.hide').text('hide');
    });
    $.scrollTo($(target),1500);
    
    if (optionsLoadXHR!=undefined){
        optionsLoadXHR.abort();
    }
    // return;
    // target = $(target).closest(".optionsNavWrapper");
    optionsLoadXHR = $.ajax({
        url: "/optionsNav/" + model.replace(" ","") + "/" + uid,
        method: "GET",
        success: function(data){
            // console.log(data);
            $(target).replaceWith(data);
            var navWrapper = $(target).closest('.optionsNavWrapper');
            navWrapper.find(".optionsNavHeader").show();
            $(".optionsNav").removeClass("hide");
            $(target).closest(".wrapper").show();
            resetOptionsNavBtns();
            allowButtonFocus();
            optionsLoadXHR = undefined;
            $(target).on('click','.toggleDetails',toggleDetails);
            if (navWrapper.find(".listUpdate").length != 0){
                var lists = navWrapper.find(".listUpdate").data(), uids = lists.uids, tabs = lists.tabs;
                $("#uidList").text(JSON.stringify(uids));
                $("#tabList").text(JSON.stringify(tabs));
            }
        },
        error: function(e){
            console.log(e);
        }
    })
    $("tr").each(reverseHighlight);
}
function selectInputFromTable(){
	var table = $(this).closest("table"), modal = $(this).closest(".connectedModel"), relationship = modal.data('relationship'),
        number = modal.data('number'), selectBtn = modal.find('.selectData'),
        required = $(".targetInput").data("required");
    if (number == "one"){
        if ($(this).hasClass('active')){
            $(this).removeClass('active');
        }else{
            table.find(".active").removeClass('active')
            $(this).addClass('active');            
        }
    }else if (number == 'many'){
        $(this).toggleClass('active');
    }

    count = table.find(".active").length;
    if (count > 0 || !required){
        selectBtn.removeClass('disabled pink').addClass('pinkflash');
    }else{
        selectBtn.addClass('disabled pinkflash').addClass('pink');
    }
}
function updateInputFromTable(){
    if ($(this).hasClass('disabled')){return false;}
    var modal = $(this).closest('.connectedModel'), table = modal.find("table"), selection = modal.find("tr").filter(".active"),
        uidArr = [], text = [], model = modal.data('model'), target = $(".targetInput"), connectedTo = modal.data('connectedto');
    selection.each(function(){
        uidArr.push($(this).data('uid'));
        if ($(this).closest("table").data('display') != ""){
            var displayName = $(this).closest("table").data('display'), regex = /%([^%]*)%/g, attrs = displayName.match(regex), row = $(this);
            $.each(attrs,function(a, attr){
                var key = attr.replace(/%/g,"");
                displayName = displayName.replace(attr,trimCellContents(row.find("."+key)));
            })
            text.push(displayName);
        }else{
            text.push(trimCellContents($(this).find('.name')));
        }
    });
    modal.data('uidArr',uidArr);
    target.data('uidArr',uidArr);
    if (model == 'Patient' && connectedTo == 'Appointment'){
        appointmentDetails.patient = uidArr[0];
        updatePatientData();
        addDetail('patient',patientInfo.name);
    }
    target.val(text.join(", "));
    if (model == 'Template' && connectedTo == 'Message'){
        var id = uidArr[0], box = $("#createMessage").find(".summernote");
        blurElement(box.parent(),"#loading");
        $.ajax({
            url: '/retrieve/Template/' + id,
            success: function(data){
                // console.log(data);
                var m = data.markup;
                box.summernote('code',m);
                unblurElement(box.parent());
            },
            error: function(e){
                $("#Error").find(".message").text("Error loading template");
                blurElement(box.parent(),"#Error");
            }
        })
    }else if (model == 'Patient' && connectedTo == 'Appointment'){
        var uid = $("#PatientList").find(".active").data('uid');
        setUid('Patient',uid);
    }

    var p = modalOrBody(target);
    unblurElement(p);

    $(".targetInput").removeClass('targetInput');
    table.find(".active").removeClass('active');
}
function updateInputByUID(input,uids){
    var modal = $(input.data('modal')), table = modal.find('table'), selectBtn = modal.find(".selectData");
    if (uids === null){
        modal.removeData('uidArr');
        input.val("");
    }else{
        input.addClass('targetInput');
        selectRowsById(uids,table);
        selectBtn.click();        
    }
}
function trimCellContents(td){
    return td.find(".tdSizeControl").text().trim().replace("...","");
}
function attachConnectedModelInputs(form){
    var connectedModels = $(".connectedModel");
    connectedModels.each(function(){
        var table = $(this).find("table"), model = $(table).data('model'), modal = $(this), 
            connectedTo = modal.data('connectedto'), modalId = "#"+modal.attr("id");

        var createForm = $(".modalForm").filter(function(){
            return $(this).hasClass('createNew') && $(this).data('model') == model;
        });

        var item = form.find(".item, .itemFU").filter(function(){
            var question = $(this).children(".question").text().toLowerCase().replace(" ","");
            if (model == 'User'){
                return chkStrForArrayElement(question,['user','recipient']);
            }else if (model == 'Diagnosis'){
                return chkStrForArrayElement(question,['diagnosis','diagnoses']);
            }else{
                return chkStrForArrayElement(question,[model.toLowerCase()]);
            }
        }), input = item.find("input, textarea");
        var uidArr = $("#Current"+connectedTo).find(".name").data('connectedmodels');
        if (uidArr != undefined){
            uidArr = (uidArr[model] == undefined) ? [] : uidArr[model];
        }else{
            uidArr = [];
        }

        activateInput(input, modalId, uidArr);
    })
}
function activateInput(input,modalId,uidArr){
    var question = input.closest(".item, .itemFU").children(".question").find(".q").text(),
        filters = $(modalId).find(".filterType").filter("[data-filter!='hide']"), filterArr = [];

    input.addClass("connectedModelItem");
    filters.find("label").filter(function(){
        return question.includes($(this).text());
    }).each(function(){
        filterArr.push($(this));
    })

    input.attr('readonly',true);
    input.data('modal',modalId);
    input.data('cModels',uidArr);
    input.data('defaultFilters',filterArr);
    input.on("focus",openConnectedModelModal);
}
function openConnectedModelModal(){
    var p = modalOrBody($(this)), modalId = $(this).data('modal'), table = $(modalId).find("table"), currentVals = $(this).val(),
        cModelIds = $(modalId).data('uidArr'), defaultFilters = $(this).data('defaultFilters'), 
        required = ($(this).closest(".item, .itemFU").data('required') === 1) ? true : false,
        selectBtn = $(modalId).find('.selectData');
    blurElement(p,modalId);
    // console.log($(this).closest('.item, .itemFU').data());

    $(this).addClass('targetInput').data('required',required);
    table.find("tr.active").removeClass('active');
    if (currentVals != ""){
        selectRowsById(cModelIds,table);
    }else{
        table.find("tr.active").removeClass('active');
    }
    // console.log(defaultFilters);
    $.each(defaultFilters,function(f, filter){
        if (!filter.find("input").is(":checked")){
            filter.find("input").click();
        }
    })
    count = table.find(".active").length;
    if (count > 0 || !required){
        selectBtn.removeClass('disabled pink').addClass('pinkflash');
    }else{
        selectBtn.addClass('disabled pinkflash').addClass('pink');
    }

    checkHorizontalTableFit(table);
}
function selectRowsById(ids, table){
    table.find('tr').removeClass('active');
    if ($.isArray(ids)){
        $.each(ids,function(i,id){
            table.find('tr').filter(function(){
                return $(this).data('uid') == id;
            }).click();
        })        
    }else{
        table.find('tr').filter(function(){
            return $(this).data('uid') == ids;
        }).click();
    }
}
function selectRowsByName(string,table){
    var arr = string.split(", ");
    $.each(arr,function(i,a){
        table.find("tr").filter(function(){
            return $(this).find(".name").text().includes(a);
        }).click();
    })
}
function alternateRowColor(table){
    var index = table.data('index');
    var trs = table.find("tr").not(".head, .noMatch").filter(":visible");
    trs.removeClass('a b');
    trs.each(function(i, tr){
        var id = $(tr).data(index), c;
        if (i == 0){c = "a"}
        else if (id == prevID){
            c = ($(trs[i-1]).hasClass("a")) ? "a" : "b";
            $(tr).css('border-color-top','transparent');
        }
        else if (id != prevID){c = ($(trs[i-1]).hasClass("a")) ? "b" : "a";}
        $(tr).addClass(c);
        prevID = id;
    })
}
function getColumnById(model, ids, columnName = 'name'){
    var arr = [], table = $("#"+model+"List");
    $.each(ids, function(i,id){
        arr.push(trimCellContents(table.find('tr').filter('[data-uid="'+id+'"]').find("."+columnName)));
    })
    return arr;
}
