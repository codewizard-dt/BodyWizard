$(document).ready(function(){
    masterStyle();

    $("li").filter("[data-value='all organs']").on("click",masterCheckbox);
    $("li").filter("[data-value='all channels']").on("click",masterCheckbox);
    $('.submitForm').off("click",submitForm);
    
    $("#EditDiagnosis").find("div").first().attr("id","EditDiagnosisForm");
    $("#EditDiagnosisForm").find("h2").text("Edit Diagnosis Details");
    $("#EditDiagnosis").find(".submitForm").text("save changes");
    
    $("#NewDiagnosis").find(".submitForm").on("click",saveDiagnosis);
    $("#EditDiagnosis").find(".submitForm").on("click",editDiagnosis);
    $("#NewDiagnosis, #EditDiagnosis").find(".submitForm").each(function(){
        if ($(this).parent().find(".button.cancel").length==0){
            $("<div class='cancel button small'>dismiss</div>").insertAfter($(this));
        }
    })
    
    $("#DiagnosisList").find("tr").not(".head").on("click",loadDiagnosis);
    $("#EditDiagnosis").insertAfter("#CurrentDiagnosis");
    
    $("#NewDiagnosisBtn").on("click",function(){
        if ($("#NewDiagnosis").is(":visible")){
            unblurElement($("body"));
        }else{
            blurElement($("body"),"#NewDiagnosis");
        }
    })
    
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
    var table = $("#DiagnosisList");
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
    
})

function saveDiagnosis(){
    var details = createSubmitObject($("#NewDiagnosis"));
    if (details){
        $(this).addClass("disabled");
        $(loadingRing).appendTo($(this)).css({top:"50%",transform:"translate(-50%,-50%)"});
        $(this).off("click",saveDiagnosis);
        
        $.ajax({
            url:"/php/launchpad/practitioner/save-diagnosis-POST.php",
            method:"POST",
            data:{
                SaveOrUpdate:"save",
                info: JSON.stringify(details)
            },
            success:function(data){
                console.log(details);
                $("#NewDiagnosis").append(data);
                //location.reload(true);
            },
            error:function(){
                console.log("ERROR YO");
            }
        })
    }
}
function editDiagnosis(){
    var details = createSubmitObject($("#EditDiagnosis"));
    if (details){
        $(this).addClass("disabled");
        $(loadingRing).appendTo($(this)).css({top:"50%",transform:"translate(-50%,-50%)"});
        $(this).off("click",editDiagnosis);
        
        var id = $("#CurrentDiagnosis").find(".name").data("diagnosisid");
        $.ajax({
            url:"/php/launchpad/practitioner/save-diagnosis-POST.php",
            method:"POST",
            data:{
                SaveOrUpdate:"update",
                DiagnosisID: id,
                info: JSON.stringify(details)
            },
            success:function(data){
                console.log(details);
                $("#EditDiagnosis").append(data);
                location.reload(true);
            },
            error:function(){
                console.log("ERROR YO");
            }
        })
    }
}
function loadDiagnosis(){
    var diagnosisID = $(this).data("diagnosisid");
    if (diagnosisID==""){return false;}
    if ($(this).hasClass("active")){
        alertBox("already selected",$("#CurrentDiagnosis").find(".name"),"after","fade");
        return false;
    }
    $("#DiagnosisList").find("tr").removeClass("active");
    $(this).addClass("active");
    blurElement($("#CurrentDiagnosis"),"#loading");
    $.post({
        url: "/php/launchpad/practitioner/diagnosis-option-display.php",
        data: {
            DiagnosisID : diagnosisID,
            type:"tcm",
            destinations: "diagnosisEdit,diagnosisSettings,diagnosisDelete",
            btnText: "edit diagnosis,view settings,delete this diagnosis"
        },
        success:function(data){
            $("#loading").appendTo("body").hide();
            $("#CurrentDiagnosis").html(data);
            checkOverflow(document.getElementById("CurrentDiagnosis"));
            allowButtonFocus();
        },
        error:function(){
            $("#CurrentDiagnosis").html("Error");
        }
    })
}
