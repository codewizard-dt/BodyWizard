$(document).ready(function(){
    
    var UID = $("#formdata").data("formuid");
    var FormID = $("#formdata").data("formid");
    var FormJSON = $("#formdata").data("json");
    
    $("#ShowAllDispOpt").on("click",function(){
        if ($(this).data("displaying")){
            $(".dispOptions").remove();
            $(this).data("displaying",false);
            $(this).text("show display and layout options");
            return false;
        }
        $("<div/>",{
            class:"button xsmall dispOptions",
            html:"+",
            css:{
                position:"absolute",
                fontSize:"0.6em",
                margin:"0.25em 1em",
                opacity:"0.5",
                transition:"opacity 0.5s, width 0.5s, height 0.5s"
            }
        }).insertAfter($(".question"));
        $(this).data("displaying",true);
        $(this).text("hide display and layout options");
        $(".dispOptions").hover(function(){
                                    $(this).css("opacity","1");
                                    $(".dispOptions").not($(this)).filter(function(){
                                        return $(this).hasClass("active")==false;
                                    }).css("opacity","0.5");
                                },
                                function(){if ($(this).hasClass("active")==false){$(this).css("opacity","0.5")}});
        $(".dispOptions").on("click",showDispOptions);
        if ($("#SaveDispOpt").text()=="saved"){
            $("#SaveDispOpt").remove();
            $(".zeroWrap").remove();
        }
        if ($("#SaveDispOpt").length==0){
            $("<div/>",{
                class:"button xsmall",
                id:"SaveDispOpt",
                html:"save display options"
            }).insertAfter($(this));
            $("#SaveDispOpt").on("click",saveDispOptions);
        }
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
        $(".dispOptions").not($(this)).css("opacity","0.5");
        var options = "<select data-name='inline'><option value='false'>display on own line</option><option value='true'>condensed display</option><option value='trueBR'>condensed on new line</option></select>";
        $(this).html(options).addClass("active").css("opacity","1");
        console.log($(this).closest(".item, .itemFU").data("type"));
        if ($(this).closest(".item, .itemFU").data("type")=="scale"){
            $(this).find("option").filter(function(){
                return $(this).val() != "false";
            }).remove();
        }
        $("<div/>",{
            class:"button xsmall",
            html:"x",
            css:{
                backgroundColor:"rgb(130,130,130)",
                margin:"0 1em 0.1em -0.5em"
            }
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
        console.log($(this).parent());
        var p = $(this).parent();
        p.removeClass("active").html("+");
        setTimeout(function(){
            p.on("click",showDispOptions);
        },100)
    }
    function updateDisp(){
        var item = $(this).closest(".itemFU, .item");
        var cssObj = {};
        var inline = item.find("[data-name='inline']").find(":selected").val();
        
        cssObj['display'] = (inline.includes("true")) ? "inline-block" : "block";
        cssObj['paddingRight'] = (inline.includes("true")) ? "2.5em" : "0";
        cssObj['width'] = (inline.includes("true")) ? "28%" : "100%";
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
        $("#SaveDispOpt").addClass("disabled");
        $("#SaveDispOpt").off("click",saveDispOptions);
        var formObj = $("#formdata").data("json"), sections = formObj['sections'];
        console.log(formObj);
        $(".section").each(function(s,section){
            var items = $(section).find(".item, .itemFU");
            //console.log($(section).find('h2').text());
            //console.log(sections[s]['sectionName']);
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
        
        console.log(formObj);
        var autosaved = formObj['autosaved'];
        if (autosaved=='1'){
            var PostObj = {
                    JSON:JSON.stringify(formObj),
                    type:"autosave",
                    mode:"edit"
            };
        }else if (autosaved=="0"){
            var PostObj = {
                    JSON:JSON.stringify(formObj),
                    type:"clicksave",
                    mode:"edit",
                    version:"keepVersionID"
            };
            
        }
        
        console.log(autosaved);
        
        console.log(PostObj);
        $.ajax({
            url:"/php/launchpad/practitioner/save-form-POST.php",
            method:"POST",
            data:PostObj,
            success:function(data){
                if (data=="false"){
                    alertBox("error saving",$("#SaveDispOpt"),"after","fade");
//                    unblurElement($("#SaveDispOpt"));
  //                  $("#loading").remove();
                }else{
                    CheckMark($("#SaveDispOpt"),"nofade");
                    $("#SaveDispOpt").text("saved");
                    $("#ShowAllDispOpt").click();
      //              unblurElement($("#SaveDispOpt"));
        //            $("#loading").remove();
                }
                console.log(data);
            },
            error:function(){
                alertBox("error saving",$("#SaveDispOpt"),"after","fade");
            }
        })
    }    
    
    
})