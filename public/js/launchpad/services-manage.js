$(document).ready(function(){
    $("#NewServiceBtn").on("click",function(){
        blurElement($("body"),"#NewService");
    })
    $("#NewCodeBtn").on("click",function(){
        blurElement($("body"),"#NewCode");
    })
    $(".modalForm").append($("<div/>",{class:"button small cancel",text:"dismiss"}));
    
    masterStyle();
    
    $(".length").css("white-space","nowrap");
    
    $(".submitForm").off("click",submitForm);
    $("#NewService").find(".submitForm").on("click",saveService);
    $("#NewCode").find(".submitForm").on("click",saveCode);
    $("#EditService").find(".submitForm").on("click",editService);
    $("#EditService").insertAfter($("#CurrentService"));
    $("#EditCode").find(".submitForm").on("click",editCode);
    
    var noCodes = $("#CodeList").find(".code").filter(function(){
        return $(this).text() == "No matching codes listed";
    }).closest("tr");
    noCodes.hide();
    $(".codeToggle").find("input").on("change",function(){
        var type = $(this).val();
        var rows = $("#CodeList").find("tr").not(".head").filter(function(){
                return $(this).find(".type").text().toLowerCase().includes(type);
            }), visibleRows = $("#CodeList").find("tr").not(".head").filter(":visible");
        if ($(this).is(":checked") && rows.length>0){
            noCodes.hide();
            slideFadeIn(rows);
        }else{
            slideFadeOut(rows,function(){
                if (rows.length == visibleRows.length){
                    slideFadeIn(noCodes);
                }
            });
        }
    })
    
    $("#EditService").find("div").first().attr("id","EditServiceForm");
    $("#EditServiceForm").find("h2").text("Edit Form Details");
    $("#EditService").find(".submitForm").text("save changes");
    $("#EditCode").find("div").first().attr("id","EditCodeForm");
    $("#EditCodeForm").find("h2").text("Edit Code Details");
    $("#EditCode").find(".submitForm").text("save changes");
    
    var CPTCodes = [];
    $("#CodeList").find("tr").filter(function(){return $(this).find(".type").text() == "CPT";}).each(function(){CPTCodes.push($(this).find(".code").text());})
    var CPTItems = $("#NewService, #EditService").find(".item").filter(function(){
        return $(this).children(".question").find(".q").text().includes("CPT");
    });
    
    CPTItems.append($("<br>")).append($("<div/>",{
        class:"button xsmall codeListBtn",
        text:"select code(s)",
        css:{display:"inline-block"}
    })).find("textarea").attr("readonly","true").on("focus",function(){$(this).closest('.item').find(".codeListBtn").click();}).val("none");
    $(".codeListBtn").on("click",function(){
        blurModal($(this).closest(".modalForm"),"#CodeListModal");
        //CPTOnly();
        if (CPTItems.find("textarea").val()!=""){
            var codes = CPTItems.find('textarea').val().split(", ");
            $("#CodeList").find("tr").removeClass('active');
            $("#CodeList").find("tr").filter(function(){
                return $.inArray($(this).data('code'),codes)>-1;
            }).click();
        }
    })
    if ($("#CodeListModal").length==0){
        addNewCodeModal();
    }
    
    /*CPTItems.append("<ul class='answer CPT'></ul>");
    $("<li data-value='none'>none</li>").appendTo(CPTItems.find(".CPT"));
    CPTCodes.forEach(function(code,i){
        $("<li data-value='"+code+"'>"+code+"</li>").appendTo(CPTItems.find(".CPT"));
    })
    codes = CPTItems.find("li").filter(function(){return $(this).data('value') !== "none"});
    codes.on("click",checkbox);
    codes.on("click",updateCodeBox);
    CPTItems.find("li").filter(function(){return $(this).data('value') == "none"}).on("click",function(){
        var list = $(this).closest(".answer");
        if ($(this).hasClass("active")){
            $(this).removeClass("active");
            codes.on("click",checkbox);
            codes.on("click",updateCodeBox);
            codes.removeClass("disabled");
        }else{
            $(this).addClass("active");
            codes.removeClass("active");
            codes.off("click",checkbox);
            codes.off("click",updateCodeBox);
            codes.addClass("disabled");
        }
        
    });
    CPTItems.find("li").filter(function(){return $(this).data('value') == "none"}).on("click",updateCodeBox);*/
    /*function updateCodeBox(){
        var str = "";
        $(this).closest(".item").find(".active").each(function(i,t){
            if (i != 0){str = str + ", "}
            str = str + $(this).text();
        })
        console.log($(this).closest(".item").find(".active"));
        $(this).closest('.item').find("textarea").val(str);
    }*/
    
    var Services = [];
    $("#ServicesList").find("tr").not(".head").filter(function(){
        return $(this).find(".combine").text() == ("yes" || "only when combined");
    }).find(".name").each(function(){
        Services.push($(this).text());
    });
    var CombineItems = $("#NewService, #EditService").find(".item").filter(function(){
        return $(this).children('.question').find(".q").text() == "Available to combine with other services?";
    }), newQ = "<div class='itemFU' data-condition='yes***only available when combined' data-type='checkboxes'><div class='question'><span class='q'>Which services can this combine with?</span></div><br><ul class='answer combine checkboxes'></ul></div>";
    CombineItems.find(".itemFUList").append(newQ);
    var CombineFUs = CombineItems.find(".itemFU") ;
    $("<li data-value='All Other Combinable Services'>All Other Combinable Services</li>").appendTo(CombineItems.find(".combine"));
    Services.forEach(function(service,i){
        $("<li data-value='"+service+"'>"+service+"</li>").appendTo(CombineItems.find(".combine"));
    });
    CombineFUs.find("li").filter(function(){return $(this).data("value") !== "All Other Combinable Services";}).on("click",checkbox);
    CombineFUs.find("li").filter(function(){return $(this).data("value") == "All Other Combinable Services";}).on("click",function(){
        var list = $(this).closest(".itemFU"), services = list.find("li").not($(this));
        if ($(this).hasClass("active")){
            $(this).removeClass("active");
            services.on("click",checkbox);
            services.removeClass("disabled");
        }else{
            $(this).addClass("active");
            services.removeClass("active");
            services.off("click",checkbox);
            services.addClass("disabled");
        }
    })
        
    $("#ServicesList").find("tr").not(".head").on("click",loadService);
    $("#CodeList").find("tr").not(".head").on("click",loadCode);
    
    $("#NewService").find(".item").filter(function(){
        return $(this).children(".question").find(".q").text().includes("add on");
    }).find("li").filter("[data-value='yes']").on("click",function(){
        if ($(this).closest(".item").data("populated")=="yes"){
            return false;
        }
        console.log($(this).closest(".item").data());
        var i = $(this).closest(".item"), FUs = i.find(".itemFU");
        FUs.each(function(){
            var str = $(this).find(".q").text().split(" ")[0];
            var v = $(this).closest(".section").find(".item").filter(function(){
                return $(this).children(".question").find(".q").text().includes(str);
            }).find("input").val();
            console.log(v);
            $(this).find("input").val(v);
        })
    })
    
    $(".optionsNav").on("click",".button",optionsNavBtnClick);
    $("<div/>",{text:"(cancel edit)",class:"clear"}).appendTo($("#EditServiceForm")).on("click",function(){slideFadeOut($("#EditService"),600)});
    $("<div/>",{text:"(cancel edit)",class:"clear"}).appendTo($("#EditCodeForm")).on("click",function(){unblurElement($("body"))});
    $("<div/>",{text:"(discard new form)",class:"clear"}).appendTo($("#AddNewService")).on("click",function(){$("#NewServiceBtn").click()});
    $("<div/>",{text:"(discard new code)",class:"clear"}).appendTo($("#AddNewCode")).on("click",function(){$("#NewCodeBtn").click()});
})


function saveService(){
    var details = createSubmitObject($("#AddNewService"));
    if (details){
        $(this).addClass("disabled");
        $(loadingRing).appendTo($(this)).css({top:"50%",transform:"translate(-50%,-50%)"});
        $(this).off("click",saveService);
        
        $.ajax({
            url:"/php/launchpad/practitioner/save-service-POST.php",
            method:"POST",
            data:{
                SaveOrUpdate:"save",
                info: JSON.stringify(details)
            },
            success:function(data){
                //console.log(details);
                //$("#AddNewService").append(data);
                location.reload(true);
            },
            error:function(){
                console.log("ERROR YO");
            }
        })
    }
}
function editService(){
    var details = createSubmitObject($("#EditServiceForm"));
    if (details){
        $(this).addClass("disabled");
        $(loadingRing).appendTo($(this)).css({top:"50%",transform:"translate(-50%,-50%)"});
        $(this).off("click",editService);
        var id = $("#CurrentService").find(".name").data("serviceid");
        $.ajax({
            url:"/php/launchpad/practitioner/save-service-POST.php",
            method:"POST",
            data:{
                SaveOrUpdate:"update",
                ServiceID: id,
                info: JSON.stringify(details)
            },
            success:function(data){
                //console.log(details);
                //$("#EditServiceForm").append(data);
                location.reload(true);
            },
            error:function(){
                console.log("ERROR YO");
            }
        })
    }
}
function loadService(){
    var serviceID = $(this).data("serviceid");
    if (serviceID==""){return false;}
    if ($(this).hasClass("active")){
        alertBox("already selected",$("#CurrentService").find(".name"),"after","fade");
        return false;
    }
    $("#ServicesList").find("tr").removeClass("active");
    $(this).addClass("active");
    blurElement($("#CurrentService"),"#loading");
    $.post({
        url: "/php/launchpad/practitioner/service-option-display.php",
        data: {
            ServiceID : serviceID,
            destinations: "serviceEdit,serviceSettings,serviceDelete",
            btnText: "edit service,view settings,delete this service"
        },
        success:function(data){
            $("#CurrentService").html(data);
            $("#CurrentService").css("max-height","10em");
            checkOverflow(document.getElementById("CurrentService"));
            allowButtonFocus();
        },
        error:function(){
            $("#CurrentService").html("Error");
        }
    })
}

function saveCode(){
    var details = createSubmitObject($("#AddNewCode"));
    if (details){
        $(this).addClass("disabled");
        $(loadingRing).appendTo($(this)).css({top:"50%",transform:"translate(-50%,-50%)"});
        $(this).off("click",saveCode);
        $.ajax({
            url:"/php/launchpad/practitioner/save-code-POST.php",
            method:"POST",
            data:{
                SaveOrUpdate:"save",
                info: JSON.stringify(details)
            },
            success:function(data){
                //$("#AddNewCode").append(data);
                location.reload();
            },
            error:function(){
                console.log("ERROR YO");
            }
        })
    }
}
function editCode(){
    var details = createSubmitObject($("#EditCode")), id =  $("#CurrentCode").find(".name").data("codeid");
    if (details){
        $(this).addClass("disabled");
        $(loadingRing).appendTo($(this)).css({top:"50%",transform:"translate(-50%,-50%)"});
        $(this).off("click",editCode);
        $.ajax({
            url:"/php/launchpad/practitioner/save-code-POST.php",
            method:"POST",
            data:{
                SaveOrUpdate:"update",
                CodeID: id,
                info: JSON.stringify(details)
            },
            success:function(data){
                //$("#EditCode").append(data);
                location.reload();
            },
            error:function(){
                console.log("ERROR YO");
            }
        })
    }    
}
function loadCode(){
    if ($(this).data("codeid")==""){return false;}
    $("#CodeList").find("tr").removeClass("active");
    $(this).addClass("active");
    blurElement($("#CurrentCode"),"#loading");
    $.post({
        url: "/php/launchpad/practitioner/code-option-display.php",
        data: {
            CodeID : $(this).data('codeid'),
            Description: $(this).find(".description").text(),
            Code: $(this).find(".code").text(),
            Type: $(this).find(".type").text()
        },
        success:function(data){
            $("#CurrentCode").html(data);
            checkOverflow(document.getElementById("CurrentCode"));
            allowButtonFocus();
        },
        error:function(){
            $("#CurrentCode").html("Error");
        }
    })
}