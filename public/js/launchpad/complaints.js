$(document).ready(function(){
    masterStyle();
    
    $(".modalForm").each(function(){
        if ($(this).find(".cancel").length==0){
            $(this).append($("<div/>",{class:"button small cancel",text:"dismiss"}));
        }
    }).find(".submitForm").off("click",submitForm);
    
    $("#NewComplaint").find(".submitForm").on("click",saveComplaint);
    $("#NewComplaintBtn").on('click',function(){
        blurElement($("body"),"#NewComplaint");
        ItemICD.find('textarea').val("none");
    });
    $("#EditComplaint").find(".formDisp").attr("id","EditChiefComplaint");
    $("#EditComplaint").find(".submitForm").on("click",editComplaint);
    
    $(".modalForm").each(function(){
        if ($(this).find(".cancel").length==0){
            $("<div class='cancel button small'>dismiss</div>").insertAfter($(this).find(".submitForm"));
        }
    })
    
    var ItemICD = $(".item, .itemFU").filter(function(){
        return $(this).children(".question").find(".q").text().toLowerCase().includes("applicable icd codes");
    });
    
    ItemICD.append($("<br>")).append($("<div/>",{
        class:"button xsmall codeListBtn",
        text:"select code(s)",
        css:{display:"inline-block"}
    })).find("textarea").attr("readonly","true").on("focus",function(){$(this).closest('.item').find(".codeListBtn").click();}).val("none");
    $(".codeListBtn").on("click",function(){
        blurModal($(this).closest(".modalForm"),"#CodeListModal");
        ICDOnly();
        if (ItemICD.find("textarea").val()!=""){
            var codes = ItemICD.find('textarea').val().split(", ");
            $("#CodeListCLM").find("tr").removeClass('active');
            $("#CodeListCLM").find("tr").filter(function(){
                return $.inArray($(this).data('code'),codes)>-1;
            }).click();
        }
    })
    if ($("#CodeListModal").length===0){
        addNewCodeModal();
    }
    
    var complaintTypes = $(".item, .itemFU").filter(function(){
        return $(this).children(".question").find(".q").text().toLowerCase().includes("type of complaint");
    }).first().children(".answer").find("li");
    
    var complaints = [], complaintStr = "";
    complaintTypes.each(function(d,Dx){complaints.push($(Dx).text());})
    complaints.forEach(function(Dx,d){
        complaintStr += "<label><input type='checkbox' class='tableFilter' data-filter='type:"+Dx+"'>"+Dx+"</label>";
    })
    $("#ComplaintType").html(complaintStr);

    
    //TABLE STUFF
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
    }).on("click",".switch",function(){
        var list = $(this).closest(".filterType").find(".list"), showing = list.is(":visible");
        if (showing){
            $(this).text("show filters");
            slideFadeOut(list);
            list.find(".tableFilter").each(function(){
                if ($(this).is(":checked")){$(this).click();}
            })
            filterTableList(table);
        }else{
            $(this).text("hide filters");
            slideFadeIn(list);
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
        table = $(this).closest(".filterType").data('target');
        table = $(table);
        filterTableList(table);
    })
    var table = $("#ComplaintList");
    //table.width(table.innerWidth());
    filterTableList(table);
    $("#ClearTableFilters").on("click",function(){
        $(".tableSearch").val("");
        $(".tableFilter").each(function(){
            if ($(this).is(":checked")){
                $(this).click();
            }
        })
    })
    ///TABLE STUFF END
    $("#ComplaintList").find("tr").not(".head").on("click",loadComplaint);
})


function saveComplaint(){
    var details = createSubmitObject($("#NewComplaint"));
    if (details){
        $(this).addClass("disabled");
        $(loadingRing).appendTo($(this)).css({top:"50%",transform:"translate(-50%,-50%)"});
        $(this).off("click",saveComplaint);
        
        $.ajax({
            url:"/php/launchpad/practitioner/save-complaint-POST.php",
            method:"POST",
            data:{
                SaveOrUpdate:"save",
                info: JSON.stringify(details)
            },
            success:function(data){
                console.log(details);
                $("#NewComplaint").append(data);
                location.reload(true);
            },
            error:function(){
                console.log("ERROR YO");
            }
        })
    }
}
function editComplaint(){
    var details = createSubmitObject($("#EditChiefComplaint")),id=$("#CurrentComplaint").find(".name").data('complaintid');
    if (details){
        $(this).addClass("disabled");
        $(loadingRing).appendTo($(this)).css({top:"50%",transform:"translate(-50%,-50%)"});
        $(this).off("click",editComplaint);
        
        $.ajax({
            url:"/php/launchpad/practitioner/save-complaint-POST.php",
            method:"POST",
            data:{
                SaveOrUpdate:"update",
                ComplaintID:id,
                info: JSON.stringify(details)
            },
            success:function(data){
                console.log(details);
                $("#EditComplaint").append(data);
                location.reload(true);
            },
            error:function(){
                console.log("ERROR YO");
            }
        })
    }
}
function loadComplaint(){
    if ($(this).text().toLowerCase().includes("no match")){return false;}
    blurElement($("#CurrentComplaint"),"#loading");
    $.ajax({
        url:"/php/launchpad/practitioner/complaint-option-display.php",
        method:"POST",
        data:{
            ComplaintID:$(this).data('complaintid')
        },
        success:function(data){
            $("#loading").appendTo("body").hide();
            $("#CurrentComplaint").html(data);
            checkOverflow(document.getElementById("CurrentComplaint"));
            allowButtonFocus();
        }
    })
    $("#CurrentComplaint")
}