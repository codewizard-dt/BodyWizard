class ModelTable {
    constructor(element, selectionLimit){
        this.element = element;
        this.name = element.attr('id');
        this.model = element.data('model');
        this.hideorder = element.data('hideorder');
        this.limit = selectionLimit;
        this.rows = this.element.find('tr').not('.head, .noMatch');
        this.nomatch = this.element.find('tr').filter('.noMatch');
        element.wrap("<div class='tableWrapper'/>");
        this.rows.addHoverClassToggle();

        let filters = [];
        initialize.ele({
            select: $(".filter").filter(function(f,filter){return $(filter).data('target') == element.attr('id')}),
            function: function(){
                filters.push(new Filter($(this)));
            }
        })
        this.filters = filters;

        this.significance = this.element.data('significance');
        if (this.significance == 'primary') {
            this.rows.on('click', {model:this.model}, this.loadModelDetails);
            this.connectedModels = {};
        }
        else if (this.significance == 'secondary') {
            this.modal = element.closest('.connectedModel');
            this.rows.on('click', {table:this}, this.selectModel);
            this.connectedto = this.modal.data('connectedto');
            this.modal.find('.selectData').on('click', {modelTable:this}, this.assignSelection);
        }

        this.resizetimer = null;

        this.element.data('ClassObject',this);
        this.filter();
    }

    get width(){
        return this.element.parent().width();
    }
    get isTooWide(){
        let wrap = this.element.parent().parent();
        return this.width > wrap.width();
    }
    showAllColumns(){
        this.element.find('td, th').show();
    }

    get activeFilters(){return this.filters.filter(function(filter){return filter.isActive});}
    get matches(){
        let matches = this.activeFilters.map(function(filter){return filter.matches});
        let truematch = this.rows.map(function(){return $(this).data('uid')}).get();
        if (!matches.isEmpty()) {
            truematch = matches[0];
            if (matches.length > 1){
                for (let x = 1; x < matches.length; x++){
                    truematch = truematch.filter(uid => matches[x].includes(uid));
                }
            }            
        }
        return truematch;
    }
    filter(){
        if (this.matches.isEmpty()){
            this.rows.hide();
            this.nomatch.show();
        }else{
            this.rows.hide();
            let matches = this.matches;
            this.rows.filter(function(){
                return matches.includes($(this).data('uid'));
            }).show();
            this.nomatch.hide();
        }
    }

    get selected(){return this.rows.filter('.active')}
    get selectedIds(){
        let idArr = this.selected.map((r,row) => $(row).data('uid')).get();
        return this.limit == 1 ? idArr[0] : idArr;
    }
    get selectedNames(){
        return this.selected.map((r,row) => this.getRowName(row)).get().join(', ');
    }
    get selectedData(){
        let dataArr = this.selected.map((r,row) => $(row).data()).get();
        return this.limit == 1 ? dataArr[0] : dataArr;
    }
    getDataById(uids){
        if (typeof uids == 'number'){
            let match = this.rows.filter((r,row) => $(row).data('uid') == uids);
            return match.data();
        }else{
            let fx = this.getDataById, modelTable = this;
            return uids.map(uid => fx.bind(modelTable, uid)());
        }
    }
    getNameById(uids){
        if (typeof uids == 'number'){
            let match = this.rows.filter((r,row) => $(row).data('uid') == uids);
            return this.getRowName(match);
        }else{
            let fx = this.getNameById, modelTable = this;
            return uids.map(uid => fx.bind(modelTable, uid)());
        }
    }
    getRowName(row){return $(row).find('.name').text().replace("...","").trim()}
    loadModelDetails(ev){
        $.scrollTo('.optionsNav');
        if ($(this).hasClass('active')) {
            return;
        }else{
            $(this).closest('table').resetActives();
            $(this).addClass('active');
            table.optionsNav.load(ev.data.model, $(this).data('uid'));
        }
    }
    selectModel(ev){
        let table = ev.data.table, limit = table.limit, model = table.model;
        if (limit == 1) {
            if ($(this).hasClass('active')) {
                $(this).removeClass('active');
            }else{
                table.element.resetActives();
                $(this).addClass('active');                
            }
        }else if (table.selected.length < limit){
            $(this).addClass('active');
        }else{
            $(this).removeClass('active');
        }
        table.updateSelectedDisplay();
    }
    selectByUid(uids){
        if (typeof uids == 'number'){
            let match = this.rows.filter((r,row) => $(row).data('uid') == uids);
            $(match).click();
        }else{
            uids.forEach(uid => this.selectByUid(uid));
        }
    }
    updateSelectedDisplay(){
        let name = this.getRowName, text = this.selected.map((r,row) => name(row)).get().join(', '),
            form = this.element.closest('.modalForm'), display = form.find('.displaySelection'), btn = form.find('.selectData');
        if (text == "") {
            btn.addClass('disabled');
            display.text('none selected');
        }
        else {
            display.text(text);
            display.show()
            btn.removeClass('disabled');
        }
    }
    assignSelection(ev){
        if ($(this).hasClass('disabled')) return;
        let modelTable = ev.data.modelTable, connectedTo = modelTable.connectedto, ids = modelTable.selectedIds, names = modelTable.selectedNames;
        if (connectedTo == 'Appointment'){
            let model = modelTable.model.charAt(0).toLowerCase() + modelTable.model.slice(1), obj = {};
            obj[model] = ids;
            appointment.set(obj);
            appointment.update.detail(model, names);
        }
        if (modelTable.element.is(':visible')) unblurTopMost();
    }
}

class Filter {
    constructor(element){
        this.element = $(element);
        this.tableId = this.element.data('target');
        this.table = $("#"+this.element.data('target'));
        this.name = this.element.data('filter');
        this.type = this.element.data('type');
        if (this.type == 'data') {
            this.triggers = 'change';
            this.input = this.element.find('input');
        }else if (this.type == 'text'){
            this.triggers = 'keyup';
            this.input = this.element.find('input').first();
        }
        this.element.on(this.triggers, this.input, this.updateMatches.bind(this));
    }

    get tableObj(){return table.get(this.tableId)}
    get values(){return this.input.filter(":checked").map(function(){return $(this).data('value')}).get();}
    get searchTerm(){return this.input.val() != "" ? this.input.val() : null;}
    get isActive(){return (this.type == 'data') ? this.values.notEmpty() : this.searchTerm;}

    updateMatches(){
        let rows = this.tableObj.rows;
        if (this.type == 'data'){
            let name = this.name;
            let filterValues = this.values;
            rows = rows.filter(function(){
                var rowValues = $(this).data(name);
                return rowValues.some(v => $.inArray(v, filterValues) > -1);
            });
        }else if (this.type == 'text'){
            rows.unmark();
            if (this.searchTerm) rows.mark(this.searchTerm);
            rows = rows.filter(function(){return $(this).find('mark').exists()});
        }
        let uids = rows.map(function(r,row){
            return $(row).data('uid');
        }).get();
        this.matches = uids;
        if (this.isActive) this.element.addClass('active');
        else this.element.removeClass('active');
        this.tableObj.filter();
    }
}

var table = {
    list: [],
    get: function(name){
        let found = table.list.find(modelTable => modelTable.name == name);
        return found == undefined ? null : found;
    },
    initialize: {
        all: function(){
            if (!initialize.find('.modelTable')) return;
            $.each(table.initialize, function(name, initFunc){
                if (name != 'all' && typeof initFunc === 'function') initFunc();
            });
            if (!table.initialize.tableResize){
                $(window).on('resize', table.width.check);
                table.initialize.tableResize = true;
            }
            // console.log(table.list);
        },
        tableResize: false,
        newTables: function(){
            initialize.ele({
                select: ".modelTable",
                function: function(){
                    let id = $(this).attr('id');
                    table.list.push(new ModelTable($(this),1));
                }
            });
        },
        optionsNav: function(){
            initialize.ele({
                select:'.optionsNavWrapper',
                function: function(){
                    $(this).on('click','.navOptionsToggle', table.optionsNav.toggle);
                    $('.optionBtnWrap').on('click','.button', table.optionsNav.btn.click);
                }
            })
        },
    },
    width: {
        timer: null,
        check: function(){
            clearTimeout(table.width.timer);
            table.width.timer = setTimeout(table.width.adjust, 300);
        },
        adjust: function(){
            $.each(table.list, function(t,modelTable){
                modelTable.showAllColumns();
                let hideMe = [...modelTable.hideorder];
                while (modelTable.isTooWide) {
                    let hideNow = hideMe.shift();
                    modelTable.element.find('.'+hideNow).hide();
                }
            })
        }
    },
    optionsNav: {
        load: function(model, uid){
            blurElement($('.optionsNavWrapper'),'#loading');
            $.ajax({
                url: "/options-nav/" + model.replace(" ","") + "/" + uid,
                method: 'GET',
                success: function(modeldata){
                    $('.optionsNavWrapper').replaceWith(modeldata);
                    table.initialize.optionsNav();
                }
            })
        },
        btn: {
            click: function(){
                console.log({btn:$(this),data:$(this).data()});
            },
            map: {}
        },
        toggle: function(){
            var showNow = $(this).hasClass('down'), label = $(this).find('.label'), text = label.text(),
                allToggles = $('.optionsNav').find(".navOptionsToggle"), allLabels = allToggles.find(".label");
            if (showNow){
                slideFadeIn($(".navDetails"));
                allToggles.each(function(){$(this).find(".arrow").prependTo($(this));})
                allLabels.each(function(){$(this).text($(this).text().replace("more","less"));});
            }else{
                slideFadeOut($(".navDetails"));
                allToggles.each(function(){$(this).find(".arrow").appendTo($(this));})
                allLabels.each(function(){$(this).text($(this).text().replace("less","more"));});
            }
            allToggles.toggleClass('down up');
        }
    }
};

// var defaultFilterOptions = {
//     "highlight":"true",
//     "separateWords":"false",
//     "wholeWords":"true"
//     };
// function initializeNewModelTables(){
//     var filters = filterUninitialized('.filter'), tableFilters = filterUninitialized('.tableFilter'), tableSearches = filterUninitialized('.tableSearch');
//     $(".filter").each(function(){
//         if ($(this).data('options')==undefined){
//             $(this).data('options',defaultFilterOptions);
//         }else{
//             var optObj = $(this).data('options');
//             $.each(defaultFilterOptions,function(key,value){
//                 if (optObj[key]==undefined){
//                     optObj[key] = defaultFilterOptions[key];
//                 }
//             })
//             $(this).data("options",optObj);
//         }
//     });
//     $(".tableFilter").on("change",function(){
//         table = $(this).closest(".filter").data("target");
//         table = $(table);
//         var f = $(this).data('filter'), fT = $(".filter").filter("[data-condition='"+f+"']");
//         if ($(this).is(":checked")){
//             slideFadeIn(fT);
//         }else{
//             slideFadeOut(fT);
//             fT.find(".tableFilter").each(function(){
//                 if ($(this).is(":checked")){$(this).click();}
//             })
//         }
//         filterTableList(table);
//     });
//     $(".tableSearch").on("keyup",function(){
//         table = $(this).closest(".filter").data("target");
//         table = $(table);
//         filterTableList(table);
//     });
//     filters.add(tableFilters).add(tableSearches).data('initialized',true);

//     var extraBtns = filterUninitialized(".loadInTab");
//     extraBtns.on('click',function(){
//         var t = $(this).closest(".loadTarget"), uri = $(this).data('uri');
//         LoadingContent(t, uri);
//     })
//     extraBtns.data('initialized',true);

//     $(".connectedModel").on('click','.cancel',function(){
//         $(".targetInput").removeClass("targetInput");
//     })

//     // INITIALIZING TABLES
//         var tables = filterUninitialized(".styledTable.clickable");
//         $("tr").filter(function(){
//             return $(this).text().includes("No matches");
//         }).addClass("noMatch");
        
//         tables.each(function(t,table){
//             var modal = ($(this).closest(".connectedModel").length > 0) ? true : false;
            // filterTableList($(table));
//             var prevID = 0, 
//                 trs = $(table).find("tr").not(".head"), 
//                 index = $(table).data('index'),
//                 target = $(table).data("target"),
//                 current = ($(target).data('uid')!=undefined) ? $(table).find("tr").filter("[data-uid='"+$(target).data('uid')+"']") : null;
//             if (current){current.addClass("active");}
//             alternateRowColor($(table));

//             var formLoadXHR = undefined;
//             trs = $(table).find("tr").not(".head, .noMatch");

//             if (!modal && $(table).hasClass('modelTable')){
//                 var model = $(table).data('model');
//                 trs.on('click',rowClickLoadModel);
//                 $("#delete"+model).find(".delete").on("click",deleteModel);
//             }else if ($(table).hasClass('modelTable')){
//                 var model = $(table).data('model'), modal = $(this).closest('.connectedModel'), 
//                     connectedTo = modal.data('connectedto'), modalId = "#"+modal.attr("id");

//                 var createForm = $(".modalForm").filter(function(){
//                     return $(this).hasClass('createNew') && $(this).data('model') == model;
//                 });

//                 var item = $(".modalForm").filter('[data-model="'+connectedTo+'"]').find(".item, .itemFU").filter(function(){
//                     var question = $(this).children(".question").text().toLowerCase().replace(" ","");
//                     if (model == 'User'){
//                         return chkStrForArrayElement(question,['user','recipient']);
//                     }else if (model == 'Diagnosis'){
//                         return chkStrForArrayElement(question,['diagnosis','diagnoses']);
//                     }else{
//                         return chkStrForArrayElement(question,[model.toLowerCase()]);
//                     }
//                 }), input = item.find("input, textarea"), selectBtn = modal.find(".selectData");

//                 var uidArr = $("#Current"+connectedTo).find(".name").data('connectedmodels');

//                 if (uidArr != undefined){
//                     uidArr = (uidArr[model] == undefined) ? [] : uidArr[model];
//                 }else{
//                     uidArr = [];
//                 }

//                 activateInput(input,modalId,uidArr);
//                 trs.on("click", selectInputFromTable);
//                 selectBtn.on('click',updateInputFromTable);
//             }

//             var hideFilters = $(".filter").filter(function(){
//                 return $(this).data("target") == "#"+$(table).attr("id") && $(this).data("filter") == "hide";
//             });
//             hideFilters.find("input").click();

//             checkHorizontalTableFit($(table));
//         })

//         tables.find('tr').filter(function(){
//             return trimCellContents($(this).find('.status')) == 'required'
//         }).addClass('required');

//         tables.data("initialized",true);
//     if (!$(".optionsNav").first().hasClass("hide")){$(".optionsNavHeader").show();}
//     var newHead = filterUninitialized(".optionsNavHeader");
//     newHead.on('click','.hide',hideOptionsNav);
//     newHead.data('initialized',true);
//     var newNav = filterUninitialized(".optionsNav");
//     newNav.on('click','.navOptionsToggle',navOptionsToggle);
//     newNav.data('initialized',true);
// }
// function hideOptionsNav(){
//     if ($(this).text() == 'hide'){
//         slideFadeOut($(".optionsNav"));
//         $(this).text($(".optionsNav").find(".name").text());
//     }else{
//         slideFadeIn($(".optionsNav"));
//         $(this).text('hide');        
//     }
// }
// function navOptionsToggle(){
//     var showNow = $(this).hasClass('down'), label = $(this).find('.label'), text = label.text(),
//         allToggles = $('.optionsNav').find(".navOptionsToggle"), allLabels = allToggles.find(".label");
//     if (showNow){
//         slideFadeIn($(".navDetails"));
//         allToggles.each(function(){$(this).find(".arrow").prependTo($(this));})
//         allLabels.each(function(){$(this).text($(this).text().replace("more","less"));});
//     }else{
//         slideFadeOut($(".navDetails"));
//         allToggles.each(function(){$(this).find(".arrow").appendTo($(this));})
//         allLabels.each(function(){$(this).text($(this).text().replace("less","more"));});
//     }
//     allToggles.toggleClass('down up');
// }
// var optionsLoadXHR = undefined;
// function rowClickLoadModel(){
    // var uid = $(this).data('uid'), 
    // 	table = $(this).closest(".styledTable"),
    // 	target = $(table).data('target'), 
    //     target = '.optionsNavWrapper',
    // 	model = $(table).data('model');
    // 	// destinations = $(table).data('destinations').split(","),
    // 	// btnText = $(table).data('btntext').split(",");

    // if ($(target).data("uid")==uid && optionsLoadXHR==undefined){
    //     alertBox("already selected",$(target).find(".name"),"below","fade");
    //     $(this).addClass('active');
    //     return false;
    // }

    // table.resetActives();
    // $(this).addClass("active");

    // // $("#loading").remove();
    // // $("<div id='loading' class='lds-ring'><div></div><div></div><div></div><div></div></div>").appendTo("body");
    // blurElement($(target),"#loading");
    // if ($(target).hasClass("hide")){
    // 	$(target).removeClass('hide');
    // 	$(target).closest(".wrapper").show();
    //     $(".optionsNavHeader").show();
    //     $(".optionsNavHeader").find('.hide').text('hide');
    // }
    
    // slideFadeIn($(target),1500,function(){
    //     $(".optionsNavHeader").find('.hide').text('hide');
    // });
    // $.scrollTo($(target),1500);
    
    // if (optionsLoadXHR!=undefined) optionsLoadXHR.abort();

    // optionsLoadXHR = $.ajax({
    //     // url: "/optionsNav/" + model.replace(" ","") + "/" + uid,
    //     url: "/options-nav/" + model.replace(" ","") + "/" + uid,
    //     method: "GET",
    //     success: function(data){
    //         // console.log(data);
    //         $(target).replaceWith(data);
    //         var navWrapper = $(target).closest('.optionsNavWrapper');
    //         navWrapper.find(".optionsNavHeader").show();
    //         $(".optionsNav").removeClass("hide");
    //         $(target).closest(".wrapper").show();
    //         // resetOptionsNavBtns();
    //         allowButtonFocus();
    //         optionsLoadXHR = undefined;
    //         $(target).on('click','.navOptionsToggle',navOptionsToggle);
    //         if (navWrapper.find(".listUpdate").length != 0){
    //             var lists = navWrapper.find(".listUpdate").data(), uids = lists.uids, tabs = lists.tabs;
    //             $("#uidList").text(JSON.stringify(uids));
    //             $("#tabList").text(JSON.stringify(tabs));
    //         }
    //     },
    //     error: function(e){
    //         console.log(e);
    //     }
    // })
    // $("tr").each(reverseHighlight);
// }
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
        filters = $(modalId).find(".filter").filter("[data-filter!='hide']"), filterArr = [];

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
    console.log('use table.connectemodels');
    return;
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
