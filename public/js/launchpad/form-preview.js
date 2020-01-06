$(document).ready(function(){
    
    var UID = $("#formdata").data("formuid");
    var FormID = $("#formdata").data("formid");
    var FormJSON = $("#formdata").data("json");

    $("#FormPreview").find(".submitForm").addClass("disabled");

    $("#ItemOptionsBtn").on("click",function(){
        var notTemplate = $(".displayOptions").filter("[data-type='item']").not(".template");
        var showing = (notTemplate.length > 0) ? true : false;
        if (!showing){
            $(".displayOptions").filter("[data-type!='item']").not(".template").remove();
            $(".optionBtn").not($(this)).removeClass('yellow').addClass('yellow70');
            var template = $(".template").filter("[data-type='item']");
            $("#FormPreview").find(".item, .itemFU").each(function(){
                template.clone().appendTo($(this)).removeClass("template").show().on("change",'select',updateItem);
            });
            $(".showOptions").on('click',showOptions);
            $(this).removeClass('yellow70').addClass('yellow');
        }else{
            notTemplate.remove();
            $(this).removeClass('yellow').addClass('yellow70');
        }
    })
    $("#SectionOptionsBtn").on("click",function(){
        var notTemplate = $(".displayOptions").filter("[data-type='section']").not(".template");
        var showing = (notTemplate.length > 0) ? true : false;
        if (!showing){
            $(".displayOptions").filter("[data-type!='section']").not(".template").remove();
            $(".optionBtn").not($(this)).removeClass('yellow').addClass('yellow70');

            var template = $(".template").filter("[data-type='section']");
            $("#FormPreview").find(".section").each(function(){
                template.clone().appendTo($(this)).removeClass("template").show().on("change",'select',updateItem);
            });
            $(".showOptions").on('click',showOptions);
            $(this).removeClass('yellow70').addClass('yellow');
        }else{
            notTemplate.remove();
            $(this).removeClass('yellow').addClass('yellow70');
        }
    })
    $("#SaveDisplayOptions").on('click',saveDisplayOptions);
    function updateItem(){
        var item = $(this).closest(".section, .item, .itemFU"),
            dispObj = item.data("display"),
            setting = $(this).attr('name');

        dispObj[setting] = $(this).val();
        item.data('display',dispObj);
        if (item.is(".section")){console.log(item.data())}
        UpdateCss(item);
        $("#SaveDisplayOptions").removeClass("disabled");
    }
    function showOptions(){
        var p = $(this).parent(), t = $(this), displayOptions = $(this).closest(".item, .itemFU, .section").data('display');
        $(".showOptions").filter(function(){return $(this).text() == 'close';}).click();
        // displayOptions.forEach(function(name,value){
        $.each(displayOptions,function(name,value){
            p.find('select').filter("[name='"+name+"'").val(value);
        })
        slideFadeIn(p.find(".options"));
        $(this).text('close');
        $(this).off('click',showOptions).on('click',hideOptions);
    }
    function hideOptions(){
        var p = $(this).parent(), t = $(this);
        slideFadeOut(p.find(".options"),400,function(){t.text('+');});
        $(this).off('click',hideOptions).on('click',showOptions);
    }
    $("#FormPreview").on("mousedown touchstart",function(e){
        var btn = $(".displayOptions").filter(function(){return $(this).find(".options").is(":visible");}).find(".showOptions"), t = $(e.target);
        if (btn.length > 0 && !t.is("select") && !t.hasClass("showOptions")){btn.click();}
    })
    $("#FormPreview").find(".item, .itemFU, .section").each(function(){
        var type = $(this).is(".item, .itemFU") ? 'item' : 'section';
        if ($(this).data("display")==undefined){
            $(this).data("display",getDefaultCSS(type));
        }
    })
    
    
    $(".wrapMe").each(function(){
        wrapAndCenter($(this));
    })
    function saveDisplayOptions() {
        if ($(this).hasClass('disabled')){return false;}
        blurElement($("#FormPreview"),"#loading");
        var formObj = $("#formdata").data("json"), sections = formObj['sections'];
        console.log(sections);
        $("#FormPreview").find(".section").each(function(s,section){
            var items = $(section).find(".item, .itemFU");
            formObj['sections'][s]['displayOptions'] = $(section).data('display');
            // console.log($(section).data());
            // console.log(formObj['sections'][s]);
            items.each(function(i,item){
                if ($(item).is(".itemFU")){
                    var kFU = $(item).data('key');
                    var k = $(item).closest(".item").data('key');
                }else{
                    var k = $(item).data('key');
                }
                console.log(formObj['sections'][s]['items'][k]);
                console.log(k);
                console.log(formObj['sections'][s]['items'][i]);
                console.log(i);
                console.log($(item));
                // console.log(kFU);
                // var defaultOptions = getDefaultCSS('item');
                var disp = $(item).data("display");
                $(item).data('display',disp);
                if ($(item).is(".item")){
                    formObj['sections'][s]['items'][k]['displayOptions'] = disp;
                }else if ($(item).is(".itemFU")){
                    formObj['sections'][s]['items'][k]['followups'][kFU]['displayOptions'] = disp;
                }
            })
        })
        
        var formJsonStr = JSON.stringify(formObj),
            questionsStr = JSON.stringify(formObj['sections']);

        console.log(formObj);
        var url = "/save/Form/" + $("#formdata").data("formuid");
        $.ajax({
            url: url,
            method:"PATCH",
            data:{
                full_json: formJsonStr
            },
            success:function(data){
                // console.log(data);
                blurElement($("#FormPreview"),"#checkmark");
                setTimeout(function(){
                    unblurElement($("#FormPreview"));
                },800)
                if ($(".displayOptions").filter(":visible").length > 0){
                    var t = $(".displayOptions").filter(":visible").first().data('type');
                    $(".optionBtn").filter("[data-type='"+t+"']").click();                    
                }
                $("#SaveDisplayOptions").addClass('disabled');
            }
        })
    }    
})