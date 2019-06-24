var jQuery, $ = jQuery, document, window;
$(document).ready(function () {
    $(".hideAllItems").on("change", "input", function () {
        var countBoxes = $(this).closest(".section").find(".hideAllItems").find("input:checked").length;
        var allItemsInSection = $(this).closest(".section").find(".item");
//        var allInputsInSection = allItemsInSection.find(".Answer").find("input");
  //      var allRadioNoInputsInSection = allItemsInSection.find(".Answer").find("input[type='radio'][data-value='No']");
    //    var allRadioYesInputsInSection = allItemsInSection.find(".Answer").find("input[type='radio'][data-value='Yes']");
      //  var allTextInputsInSection = allItemsInSection.find(".Answer").find("input[type='text']");

        if (countBoxes>0){
            allItemsInSection.slideUp(1000); 
            //var reason = $(this).data('reason');
            //allInputsInSection.val(reason);
        } else {
            allItemsInSection.slideDown(1000);
            //allTextInputsInSection.val('');
            //allRadioNoInputsInSection.val('No');
            //allRadioYesInputsInSection.val('Yes');
        }
    });
    
    $("#model").on("change", ".painhere", function (){
        $(this).parent().find(".paincircle").toggle();
        var bodypart = $(this).data("bodypart");
        $('#'+bodypart).slideToggle();
    });
    
    $(".SeparateRating").on("change",".checkToRate", function(){
        var scale = $(this).closest(".SeparateRating").find(".Item"); 
        if ($(this).is(":checked")){
            scale.slideDown();
            scale.find("input[type='radio']").prop("required", true);
        }else{
            scale.slideUp();
            scale.find("input[type='radio']").prop("required", false);
        }
    });
    
    $("#painratings").on("change","#showIndividualRatings", function(){
        $("#IndividualRatings").slideToggle();
    });
    
    $('.painScale.overall').find("input[type='radio']").prop("required", true);
    
    $(".PainQ").on("change", function () {
        var NoPainBoxes = $(this).closest(".Item.Master").find("input[value='NoPain']");
        if ($(this).is(":checked") === true){
            $('#painwrapper').slideUp(1000);
            $('.painScale.overall').find("input[type='radio']").prop("required", false);
            NoPainBoxes.prop("checked", true);
        }else if ($(this).is(":checked")===false){
            $('#painwrapper').slideDown(1000);
            $('.painScale.overall').find("input[type='radio']").prop("required", true);
            NoPainBoxes.prop("checked", false);     
        }
    });
        
    $(".Item").on("change",".hideInput",function(){
        $(this).closest(".Item").find("input[type='text']").slideToggle();
    });
    
    var AnswerCount = 0;
    var PopUp = $('<div style="position=absolute;top:-3em;" id="required" class="button xsmall">required</div>');
    $(".Item").on("change",".showInput",function(){
        $(this).closest(".Item").find(".Answer").slideToggle(200);
        if ($(this).is(":checked")){
            $(this).closest(".Item").find("input.frequency").prop("required", true);
            if (AnswerCount<6){
                $(this).closest(".Item").find(".Answer").append(PopUp);               
                $("#required").css({
                    "position":"absolute",
                    "top":"-2.2em",
                    "left":"0",
                    "background-color":"rgb(189, 48, 40)",
                });
                $(this).closest(".Item").find("input.frequency").delay(200).css({
                    "background-color":"rgb(189,48,40)",
                    "color":"white",
                })
            }
            AnswerCount=AnswerCount+1;
        }else {
            $(this).closest(".Item").find("input.frequency").prop("required", false);
        }
    });
    
    function DeactivateShowScale($this){
        var ThisCCItem = $this.closest(".CCItem");
        var ShowScale = ThisCCItem.find('.showScale');
        ShowScale.find('input[type="checkbox"]').prop("checked",false);
        ThisCCItem.find(".scale").hide();
        ShowScale.removeClass("active");
        ThisCCItem.css('width','auto');
        ThisCCItem.find('input[type="radio"]').prop('checked',false);
    }
    
    function ActivateShowScale($this){
        var ThisCCItem = $this.closest(".CCItem");
        var ShowScale = ThisCCItem.find('.showScale');
        ShowScale.find('input[type="checkbox"]').prop("checked",true);
        ThisCCItem.find('.scale').fadeIn(1000).css('display','inline-block');
        ThisCCItem.css('width','100%');
    }
    
    var RemoveNow = $('<input type="hidden" class="RemoveNow">');
    
    function DeactivateRemoveCC($this){
        var ThisCCItem = $this.closest(".CCItem");
        var RemoveCC = ThisCCItem.find('.RemoveCC');
        RemoveCC.find('input[type="checkbox"]').prop("checked",false);
        RemoveCC.removeClass('active');
        ThisCCItem.find('.RemoveNotice').hide();
        ThisCCItem.remove(".RemoveNow");
    }
    
    function ActivateRemoveCC($this){
        var ThisCCItem = $this.closest(".CCItem");
        var RemoveCC = ThisCCItem.find('.RemoveCC');
        var Complaint = ThisCCItem.data('complaint');
        var NewName = 'CC'+Complaint+'_close';
        RemoveCC.find('input[type="checkbox"]').prop("checked",true);
        ThisCCItem.find('.RemoveNotice').fadeIn();
        //ThisCCItem.append(RemoveNow);
        //RemoveNow.attr('name',NewName).val('remove');
        RemoveNow.clone().appendTo(ThisCCItem).attr('name',NewName).val('remove');
    }
    
    $(".CCItemGroup").on("click",".showScale", function(){
        var ThisCCItem = $(this).closest(".CCItem");
        var $this = $(this);
        $(this).toggleClass("active");
        if ($(this).hasClass("active")){
            ActivateShowScale($this);
            DeactivateRemoveCC($this);
        }else {
            DeactivateShowScale($this);
        }
    });

    $(".RemoveCC").on("click",function(){
        var ThisCCItem = $(this).closest(".CCItem");
        var $this = $(this);
        $(this).toggleClass("active");        
        if ($(this).hasClass("active")){
            ActivateRemoveCC($this);
            DeactivateShowScale($this);
        }else {
            DeactivateRemoveCC($this);
        }
    });
    
    
    $(".hideSectionOnLoad").closest(".section").hide();
    $("input[value='No']").prop("checked", true);
    $("input[value='Neutral']").prop("checked", true);
    $("input[value='0']").prop("checked", true);
    $("input[type='checkbox']").prop("checked", false);
    $('input[type=range]').on('input', function () {
        $(this).trigger('change');
    });
    
    $(".CCItem").find("input[value='0']").prop("checked", false);
    $(".Item.Exit").find("input").prop("checked", false);
    $(".Item.Exit").find("input").prop("required", true);
    $(".Item.Exit").find("input[type='checkbox']").prop("required", false);
    
    $("#painwrapper").find("input[value='0']").prop("checked", false);
    $(".range.show").show();
    $(".PainQ").closest(".Item").find(".Question").addClass("boldfont");
    $(".PainQ").closest("label").addClass("redfont");
    $(".PrevDateList > span:odd").addClass("light");
    $(".PrevDateList > span:even").addClass("dark");
    $(".PrevDateList").children("span").on("click", function(){
        $(this).toggleClass("opaque");
    });

            
    $(".Item").on("change","input[type='radio']",function(){
        var CommentBox = $(this).closest(".Item").find(".comment");
        if ($(this).parent().find("input[value='No']").is(":checked")){
            CommentBox.slideUp();
            CommentBox.val('');
        }else if ($(this).parent().find("input[value='Neutral']").is(":checked")) {
            CommentBox.slideUp();
            CommentBox.val('');
        }else{
            CommentBox.slideDown();
        }
    })
    
    $(".PulseSide").on("change", ".Qual", function(){
       var quality = $(this).val();
        var matchingBoxes = $(this).closest(".PulseSide").find(".QualInd").find("input[value='"+quality+"']");
        if ($(this).is(":checked")){
            matchingBoxes.prop("checked", true);
        }else {
            matchingBoxes.prop("checked", false);
        }
    });
    
    $(".QualInd").on("click", ".showBoxes", function(){
        $(this).closest(".QualInd").find(".QualIndBoxes").show();
    })
    
    $(".Answer").on("change", ".showRange", function(){
        if ($(this).parent().closest(".Item").find("input[value='Yes']").is(":checked")){
            $(this).closest(".Item").find(".range").slideDown();
        }else if ($(this).parent().closest(".Item").find("input[value='No']").is(":checked")){
            $(this).closest(".Item").find(".range").slideUp();
        }
    });
    
    $("input[type='range']").on("change", function(){
        var value = $(this).val();
        var valuebox = '<div id="SliderValue">'+value+'</div>';
//        if (value == -5){var valStr = "Significantly Worse (-50%)";} 
  //      else if (value == -4){var valStr = "Much Worse (-40%)";} 
    //    else if (value == -3){var valStr = "Worse (-30%)";} 
      //  else if (value == -2){var valStr = "Mildly Worse (-20%)";} 
//        else if (value == -1){var valStr = "Barely Worse (-10%)";} 
  //      else if (value == 0){var valStr = "No Change";} 
    //    else if (value == 1){var valStr = "Barely Better (10%)";} 
      //  else if (value == 2){var valStr = "Mildly Better (20%)";} 
//        else if (value == 3){var valStr = "Better (30%)";} 
  //      else if (value == 4){var valStr = "Much Better (40%)";} 
    //    else if (value == 5){var valStr = "Significantly Better (50%)";}
      //  else if (value == 6){var valStr = "Significantly Better + (60%)";}
//        else if (value == 7){var valStr = "Significantly Better ++ (70%)";}
  //      else if (value == 8){var valStr = "Significantly Better +++ (80%)";} 
    //    else if (value == 9){var valStr = "Almost Gone (90%)";} 
      //  else if (value == 10){var valStr = "Completely Gone (100%)";}
        //$(this).closest(".range").find(".current").html("Current Rating: \""+value+"\"<br>"+valStr);
    });
    
    //prevents enter submitting form
//    $(window).keydown(function(event){
  //      if(event.keyCode == 13) {
    //        event.preventDefault();
      //      return false;
//        }
  //  });    
});