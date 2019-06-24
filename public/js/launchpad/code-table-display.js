$(document).ready(function(){
    //$(".codeListFilter").on("change",filterCodeList);
    //$('.codeListSearch').on("keyup",filterCodeList);
    //$("#CodeList").width($("#CodeList").innerWidth());
    //$(".tableFilter, .tableSearch").each(function(){$(this).closest(".filterType").css("display","inline-block")})
    masterStyle();
    
    //TABLE STUFF
    //$("#CodeList").width($("#CodeList").innerWidth());
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
    var table = $("#CodeList");
    filterTableList(table);
    ///TABLE STUFF END
    
})

function CPTOnly(){
    var cpt = $(".tableFilter").filter("[data-filter='type:cpt']"), icd = $(".tableFilter").filter("[data-filter='type:icd10']");
    if (!cpt.is(":checked")){cpt.click();}
    if (icd.is(":checked")){icd.click();}
}
function ICDOnly(){
    var cpt = $(".tableFilter").filter("[data-filter='type:cpt']"), icd = $(".tableFilter").filter("[data-filter='type:icd10']");
    if (cpt.is(":checked")){cpt.click();}
    if (!icd.is(":checked")){icd.click();}
}