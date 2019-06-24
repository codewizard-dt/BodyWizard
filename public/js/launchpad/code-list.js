$(document).ready(function(){
	masterStyle();
    var formLoadXHR = undefined;
    $("tr").on("click",function(){
        if ($(this).hasClass("head")){return false;}
        var uid = $(this).data('uid');
        if ($("#CurrentCode").data("uid")==uid && formLoadXHR==undefined){
            alertBox("already selected",$("#CurrentCode").find(".name"),"after","fade");
            $(this).addClass('active');
            return false;
        }

        $("tr").removeClass('active');
        $(this).addClass("active");
        // setSessionVar({"formUID":uid});

        blurElement($("#CurrentCode"),"#loading");
        $.scrollTo($("#CurrentCode"),1500);
        
        if (formLoadXHR!=undefined){
            formLoadXHR.abort();
        }
        slideFadeIn($("#CurrentCode"));

        formLoadXHR = $.ajax({
            url:"/Code/optionsNav/"+uid,
            method: "POST",
            data:{
                destinations : ["codes-edit","codes-delete","codes-create"],
                btnText : ["edit","delete","create new code"]
            },
            success: function(data){
                //clearInterval(count);
                // $("#CurrentCode").html(data).css("display","inline-block") ;
                // return false;
                $("#CurrentCode").replaceWith(data);
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
    })
})