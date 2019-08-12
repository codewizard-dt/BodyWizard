$(document).ready(function(){
    //TABLE FILTER STUFF
        var defaultFilterOptions = {
            "highlight":"true",
            "separateWords":"false",
            "wholeWords":"true"
        };
        
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
        })
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


    var extraBtns = $(".loadInTab").filter(function(){
        return !$(this).data('initialized');
    });
    extraBtns.on('click',function(){
        var t = $(this).closest(".loadTarget"), uri = $(this).data('uri');
        LoadingContent(t, uri);
    })
    extraBtns.data('initialized',true);

    // INITIALIZING TABLES
        var tables = $(".styledTable.clickable").filter(function(){
        	return !$(this).data('initialized');
        });
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

            if (!modal){
                var model = $(table).data('model');
                trs.on('click',rowClickLoadModel);
                $("#delete"+model).find(".delete").on("click",deleteModel);
            }else{
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

        tables.data("initialized",true);

    
})

var formLoadXHR = undefined;
function rowClickLoadModel(){
    var uid = $(this).data('uid'), 
    	table = $(this).closest(".styledTable"),
    	target = $(table).data('target'), 
    	model = $(table).data('model'),
    	destinations = $(table).data('destinations').split(","),
    	btnText = $(table).data('btntext').split(",");

    if ($(target).data("uid")==uid && formLoadXHR==undefined){
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
    }
    
    slideFadeIn($(target),1500);
    $.scrollTo($(target),1500);
    
    if (formLoadXHR!=undefined){
        formLoadXHR.abort();
    }

    formLoadXHR = $.ajax({
        url: "/optionsNav/" + model.replace(" ","") + "/" + uid,
        method: "GET",
        success: function(data){
            $(target).replaceWith(data);
            $(".optionsNav").removeClass("hide");
            $(target).closest(".wrapper").show();
            resetOptionsNavBtns();
            updateUriUids();
            allowButtonFocus();
            formLoadXHR = undefined;
        },
        error: function(e){
            console.log(e);
        }
    })
    $("tr").each(reverseHighlight);
}
function selectInputFromTable(){
	var table = $(this).closest("table"), modal = $(this).closest(".connectedModel"), relationship = modal.data('relationship'),
        number = modal.data('number'), selectBtn = modal.find('.selectData');
    var count = table.find(".active").length;
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
    if (count > 0){
        selectBtn.removeClass('disabled');
    }else{
        selectBtn.addClass('disabled');
    }
}
function updateInputFromTable(){
    if ($(this).hasClass('disabled')){return false;}
    var table = $(this).closest("table"), modal = $(this).closest('.connectedModel'), selection = modal.find("tr").filter(".active"),
        uidArr = [], text = [], model = modal.data('model'), target = $(".target"), connectedTo = modal.data('connectedto');
    
    selection.each(function(){
        uidArr.push($(this).data('uid'));
        text.push($(this).find('.name').text().trim().replace("...",""));
        console.log(model);
    });
    modal.data('uidArr',uidArr);
    target.data('uidArr',uidArr);
    target.val(text.join(", "));
    target.removeClass('target');
    table.find(".active").removeClass('active');

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
                // console.log(e);
            }
        })
    }

    var p = modalOrBody($(this)), m = parentModalOrBody($(this));
    unblurElement(m);
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
    // console.log(input);
    // console.log(modalId);
    // console.log(uidArr);

    input.attr('readonly',true);
    input.data('modal',modalId);
    input.data('cModels',uidArr);
    input.data('defaultFilters',filterArr);
    input.on("focus",openConnectedModelModal);
}
function openConnectedModelModal(){
    var p = modalOrBody($(this)), modalId = $(this).data('modal'), table = $(modalId).find("table"), currentVals = $(this).val(),
        cModelIds = $(modalId).data('uidArr'), defaultFilters = $(this).data('defaultFilters');
    blurElement(p,modalId);
    console.log($(this).data());

    $(this).addClass('target');
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
    checkHorizontalTableFit(table);
}
function selectRowsById(idArr, table){
    // console.log(idArr);
    table.find('tr').removeClass('active');
    $.each(idArr,function(i,id){
        table.find('tr').filter(function(){
            return $(this).data('uid') == id;
        }).addClass('active');
    })
}
function selectRowsByName(string,table){
    var arr = string.split(", ");
    $.each(arr,function(i,a){
        table.find("tr").filter(function(){
            console.log($(this).find(".name"));
            return $(this).find(".name").text().includes(a);
        }).click();
        // console.log(a);
    })
}
function alternateRowColor(table){
    var index = table.data('index');
    var trs = table.find("tr").not(".head, .noMatch").filter(":visible");
    trs.removeClass('a b');
    trs.each(function(i, tr){
        var id = $(tr).data(index), c;
        if (i == 0){c = "a"}
        else if (id == prevID){c = ($(trs[i-1]).hasClass("a")) ? "a" : "b";}
        else if (id != prevID){c = ($(trs[i-1]).hasClass("a")) ? "b" : "a";}
        $(tr).addClass(c);
        prevID = id;
    })
}
