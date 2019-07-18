$(document).ready(function(){
    $(".optionsNav").on("click",".button",optionsNavBtnClick);
    
    $(".wrapMe").each(function(){
        wrapAndCenter($(this));
    })
    $(".manageOverflow").each(function(i,ele){
        checkOverflow(ele);
    })
    allowButtonFocus();
    
    //$(".filterType").css("display","inline-block");
        
    $("#EditFormSettingsBtn").on('click',function(){
        if ($("#EditFormSettings").is(":visible")){
            //slideFadeOut($("#EditFormSettings"));
            unblurElement($("body"));
            $(this).text("edit settings");
        }else{
            //slideFadeIn($("#EditFormSettings"),1200);
            blurElement($("body"),"#EditFormSettings");
//            $.scrollTo("#EditFormSettings",1500);
            $(this).text("discard changes");
            var settingsObj = $("#formStats").data('settings');
            //console.log(settingsObj);
            if (settingsObj!=undefined){
                $.each(settingsObj,function(setting,value){
                    var i = $(".item, .itemFU").filter(function(){return $(this).children(".question").find('.q').text() == setting;});
                    fillAnswer(i,value);
                })
                
            }else{
                console.log("NO settings");
            }
        }
    })
    $("#EditFormSettings").find(".submitForm").off("click",submitForm);
    $("#EditFormSettings").find(".submitForm").on("click",saveSettings);
    
    $("#UnlockFormBtn").on('click',unlockForm);
    $("#UnlockForm").on("click",".submit",checkPhrase);
    
    var linkedServiceYN = $("#EditFormSettings").find(".itemFU").filter(function(){
        return $(this).find(".q").text() == "Link this form to a Service?";
    }), 
        linkedServiceList = $("#EditFormSettings").find(".itemFU").filter(function(){
        return $(this).find(".q").text() == "Link to which Services?";
    }), 
        linkedOption = $("#EditFormSettings").find(".itemFU").filter(function(){
        return $(this).find(".q").text() == "How should patient receive form?";
    }).find("option").filter(function(){
        return $(this).val() == "Make available on Portal after any Linked Service is scheduled";
    }), 
        Services = $("#AvailableServices").data("list").split("***");
    linkedServiceYN.find("li").on("click",function(){
        var v = $(this).data('value');
        if (v=='yes'){
            linkedServiceList.insertAfter(linkedServiceYN);
            slideFadeIn(linkedServiceList);
            linkedOption.show();
        }else if (v=='no'){
            slideFadeOut(linkedServiceList,function(){linkedServiceList.appendTo("body");});
            linkedOption.hide();
        }
    })
    linkedServiceList.find("ul").html("");
    Services.forEach(function(service,s){
        var str = "<li data-value='"+service.split(".")[1]+"'>"+service.split(".")[0]+"</li>";
        linkedServiceList.find("ul").append($(str));
    })
    
})

// function saveSettings(){
//     var obj = createSubmitObject($("#FormSettings")), settingsObj = {};
//     if (obj){
//         $(this).addClass("disabled");
//         $(loadingRing).appendTo($(this)).css({top:"50%",transform:"translate(-50%,-50%)"});
//         var items = obj['Sections'][0]['Items'];
//         items.forEach(function(item,i){
//             console.log(item);
//             var resp = (item['response'].length>1) ? item['response'] : item['response'][0];
//             settingsObj[item['question']] = resp;
//             if (item['followups']!==undefined){
//                 item['followups'].forEach(function(followup,f){
//                     resp = (followup['response'].length>1) ? followup['response'] : followup['response'][0];
//                     settingsObj[followup['question']] = resp;
//                 })
//             }
//         })
// //        console.log(settingsObj);
//         var jsonStr = JSON.stringify(settingsObj);
//         $.ajax({
//             method:"POST",
//             url:"/php/launchpad/practitioner/save-formSettings-POST.php",
//             data:{
//                 settingsJSON: jsonStr,
//                 formUID: $("#formStats").data("uniqueid")
//             },
//             success:function(data){
//                 if (data){
//                     //successful update
//                     console.log("WHOOOOOO!");
//                     location.reload();
//                 }else{
//                     //fail to update
//                     console.log("NOOOO");
//                 }
//             }
//         })
//     }
// }
