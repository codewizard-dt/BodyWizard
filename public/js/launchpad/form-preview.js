$(document).ready(function(){
    
    var UID = $("#formdata").data("formuid");
    var FormID = $("#formdata").data("formid");
    var FormJSON = $("#formdata").data("json");

    $("#FormPreview").find(".submitForm").addClass("disabled");

    $("#ShowAllDispOpt").on("click",function(){
        if ($(this).data("displaying")){
            $(".dispOptions").remove();
            $(this).data("displaying",false);
            $(this).text("edit display and layout options");
            return false;
        }
        $("<div/>",{
            class:"button xsmall dispOptions"
        }).insertAfter($("#FormPreview").find(".question"));
        $(this).data("displaying",true);
        $(this).text("hide display and layout options");
        $(".dispOptions").on("click",showDispOptions);
        if ($("#SaveDispOpt").length==0){
            $("<div/>",{
                class:"button xxsmall yellow",
                id:"SaveDispOpt",
                html:"save display options"
            }).insertAfter($(this));
            $("#SaveDispOpt").on("click",saveDispOptions);
        }
        $("#SaveDispOpt").show();
    })
    
    $(".item, .itemFU").each(function(){
        if ($(this).data("disp")==undefined){
            $(this).data("disp",{});
        }
    })
    
    
    $(".wrapMe").each(function(){
        wrapAndCenter($(this));
    })
     
    function showDispOptions() {
        $(".dispOptions").find(".button").click();
        // $(".dispOptions").not($(this)).css("opacity","0.5");
        var options = "<select data-name='inline' style='font-size:1.4em;margin-right:10px'><option value='false'>display on own line</option><option value='true'>condensed display</option><option value='trueBR'>condensed on new line</option></select>";
        $(this).html(options).addClass("active");
        // console.log($(this).closest(".item, .itemFU").data("type"));
        if ($(this).closest(".item, .itemFU").data("type")=="scale"){
            $(this).find("option").filter(function(){
                return $(this).val() != "false";
            }).remove();
        }
        $("<div/>",{
            class:"button xsmall"
        }).prependTo($(this));
        $(this).off("click",showDispOptions);
        $(this).find("div").on("click",hideDispOptions);
        $(this).find("select").each(function(){
            var item = $(this).closest(".itemFU, .item"), optName = $(this).data('name');
            if (item.data("disp")[optName] != undefined){
                $(this).val(item.data('disp')[optName]);
            }
        })
        $(this).find("select").on('change',updateDisp);
    }
    function hideDispOptions() {
        // console.log($(this).parent());
        var p = $(this).parent();
        p.removeClass("active").children().remove();
        setTimeout(function(){
            p.on("click",showDispOptions);
        },100)
    }
    function updateDisp(){
        var item = $(this).closest(".itemFU, .item");
        var cssObj = {};
        var inline = item.find("[data-name='inline']").find(":selected").val();


        cssObj['display'] = (inline.includes("true")) ? "inline-block" : "block";
        cssObj['paddingRight'] = (inline.includes("true")) ? "0.2em" : "0";
        cssObj['width'] = (inline.includes("true")) ? "calc(33% - 0.2em)" : "100%";
        if (item.is(".itemFU") && inline.includes("true")){
            cssObj['width'] = item.closest(".item").data('disp').inline.includes("true") ? "100%" : "28%";
        }
        item.css(cssObj);
        if (inline.includes("BR")){
            $("<div/>",{
                class:"break"
            }).insertBefore(item);
        }else{
            if (item.prev().hasClass("break")){
                item.prev().remove();
            }
        }
        
        var obj = {};
        item.find('.dispOptions').find("select").each(function(i,select){
            var n = $(select).data('name'), o = $(select).find(":selected");
            if (o.length==0){
                console.log("not selected");
                o = $(select).find("option").first();
            }
            obj[n] = o.val();
        })
        item.data("disp",obj);
    }
    function saveDispOptions() {
        blurElement($("#FormPreview"),"#loading");
        $("#SaveDispOpt").addClass("disabled");
        $("#SaveDispOpt").off("click",saveDispOptions);
        var formObj = $("#formdata").data("json"), sections = formObj['sections'];
        $("#FormPreview").find(".section").each(function(s,section){
            var items = $(section).find(".item, .itemFU");
            items.each(function(i,item){
                if ($(item).is(".itemFU")){
                    var kFU = $(item).data('key');
                    var k = $(item).closest(".item").data('key');
                }else{
                    var k = $(item).data('key');
                }
                var defaultOpt = {
                    inline:"false"
                };
                var disp = $(item).data("disp");
                for (var prop in defaultOpt){
                    if (defaultOpt.hasOwnProperty(prop) && !disp.hasOwnProperty(prop)){
                        disp[prop] = defaultOpt[prop];
                    }
                }
                $(item).data('disp',disp);
                if ($(item).is(".item")){
                    formObj['sections'][s]['items'][k]['displayOptions'] = disp;
                }else if ($(item).is(".itemFU")){
                    formObj['sections'][s]['items'][k]['followups'][kFU]['displayOptions'] = disp;
                }
            })
        })
        
        var formJsonStr = JSON.stringify(formObj),
            questionsStr = JSON.stringify(formObj['sections']);

        var url = "/forms/" + $("#formdata").data("formuid");
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
                $("#ShowAllDispOpt").click();
                $("#SaveDispOpt").remove();
            }
        })
    }    
    
    
})