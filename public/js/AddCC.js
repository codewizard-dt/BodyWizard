$(document).ready(function(){
    
    $(".CCItem").children(".answer").addClass("target");

    $(".question.CC.hideTarget").on("click",function(){
        var item = $(this).parent();
        item.toggleClass("open");
        item.toggleClass("closed");
    })
    
    $(".button.CCAdd").on("click",function(){
        $("#CCAdd").modal();
        $("#CCAdd").find("input").val("");
        $("#CCAdd").find("input").focus();
    })
    
    $(".CCItem").filter(":visible").last().css("border-width",0);
    
    $("#CCAdd").on("click",".button",function(){
        var newissue = $("#CCAdd").find("input").val();
        var ccitem = $(".CCItem.new").filter(":hidden").first();
        ccitem.find(".question").html("new issue: "+newissue);
        $(".CCItem").css("border-width","0 0 1px 0");
        ccitem.css("border-width",0);
        ccitem.data("complaint",newissue);
        ccitem.addClass("open");
        ccitem.find(".targetInput").attr("name","CCNew"+newissue);
        ccitem.find(".hideTarget").unbind('click');
        ccitem.show();
        $("#noIssues").hide();
    })
});