$(document).ready(function(){
    $("#UpdatePW").find(".submit").on("click",submitPW);
    $("#changePW").on("focusout",validatePW1);
    $("#answer1, #answer2").on('focusout',validateSecA1);
    $("#answer1v, #answer2v").on("focusout",validateSecAs);
    $("#UpdateSecQ").find(".submit").on("click",submitSecQ);
})

function submitPW(){
    if ($("#changePW").val()==""){
        alertBox("enter a password",$("#changePW"),"above",1500);
        return false;
    }
    if (validatePW2()){
        blurModal($("#UpdatePW"),"#loading");
        $.ajax({
            url:"/php/membership/updatePW.php",
            method:"POST",
            data:{
                NewPW:$("#changePW").val()
            },
            success:function(data){
                console.log(data);
                if (data){
                    var security = JSON.parse(data);
                    if (security.UpdateSecQs){
                        blurElement($("body"),"#UpdateSecQ");
                    }else{
                        blurModal($("#UpdatePW"),"#checkmark");
                        setTimeout(function(){
                            window.location.href = "/portal/launchpad";
                        },1000)
                    }
                }
            }
        })
    }
}
function submitSecQ(){
    if ($("#answer1").val()==""){
        alertBox("enter a password",$("#answer1"),"above",1500);
        return false;
    }
    if ($("#answer2").val()==""){
        alertBox("enter a password",$("#answer2"),"above",1500);
        return false;
    }
    if (validateSecAs()){
        blurModal($("#UpdateSecQ"),"#loading");
        $.ajax({
            url:"/php/membership/updateSecQ.php",
            method:"POST",
            data:{
                securityQuestion1:$("#question1").val(),
                securityAnswer1:$("#answer1").val(),
                securityQuestion2:$("#question2").val(),
                securityAnswer2:$("#answer2").val()
            },
            success:function(data){
                console.log(data);
                if (data){
                    var security = JSON.parse(data);
                    if (security.UpdateSecQ){
                        blurElement($("body"),"#UpdateSecQ");
                    }else{
                        blurModal($("#UpdateSecQ"),"#checkmark");
                        console.log(security);
                        setTimeout(function(){
                            window.location.href = "/portal/launchpad";
                        },1000)
                    }
                }
            }
        })
    }
}

function validatePW1(){
    var pw1input = $("#changePW"), pw1 = pw1input.val();
    var matchLengh = (pw1.length >= 8),
        matchDisallowed = pw1.match(/[^A-Za-z0-9!?@#$%^&*]/g),
        matchUpper = pw1.match(/[A-Z]/),
        matchLower = pw1.match(/[a-z]/),
        matchNumber = pw1.match(/[0-9]/);
           
    if (!matchLengh){
        alertBox('enter 8 or more characters',pw1input,"above", 1500);
        return false;
    }else if (matchDisallowed!=null){
        alertBox(matchDisallowed.join("")+" not allowed",pw1input,"above", 1500);
        return false;
    }else if (matchUpper==null){
        alertBox("uppercase required",pw1input,"above", 1500);
        return false;
    }else if (matchLower==null){
        alertBox("lowercase required",pw1input,"above", 1500);
        return false;
    }else if (matchNumber==null){
        alertBox("number required",pw1input,"above", 1500);
        return false;
    }else{
        CheckMark(pw1input,"nofade");
        return true;
    }
}
function validatePW2(){
    var pw2input = $("#changePW2"), pw2 = pw2input.val(), pw1input = $("#changePW"), pw1 = pw1input.val();
    if (pw1!=pw2){
        alertBox("mismatch! re-enter please",pw2input,"above",1500);
        return false;
    }else{
        return true;
    }
}
function validateSecA1(){
    var i = $(this), v = $("#"+i.attr("id")+"v");
    var matchLength = (i.val().length >=5 ),
        matchDisallowed = i.val().match(/[^A-Za-z0-9!?@#$%^&*]/g);
    if (!matchLength){
        alertBox("enter 5 or more characters",i,"above",1500);
        return false;
    }else if (matchDisallowed!=null){
        alertBox(matchDisallowed.join("")+" not allowed",i,"above", 1500);
        return false;
    }else{
        CheckMark(i,"nofade");
        return true;
    }
}
function validateSecAs(){
    var a1 = $("#answer1"), a1v = $("#answer1v"), a2 = $("#answer2"), a2v = $("#answer2v");
    var matchDisallowedA1V = a1v.val().match(/[^A-Za-z0-9!?@#$%^&*]/g),
        matchDisallowedA2V = a2v.val().match(/[^A-Za-z0-9!?@#$%^&*]/g),
        a1match = (a1.val() == a1v.val()),
        a2match = (a2.val() == a2v.val());
    if (!a1match && a1.val()!=""){
        alertBox("mismatch! please re-enter",a1v);
        return false;
    }else if (matchDisallowedA1V!=null){
        alertBox(matchDisallowedA1V.join("")+" not allowed",a1v,"above", 1500);
        return false;
    }else if (matchDisallowedA2V!=null){
        alertBox(matchDisallowedA2V.join("")+" not allowed",a2v,"above", 1500);
        return false;
    }else if (a1match && a1.val()!=""){
        CheckMark(a1v,"nofade");
    }
    if (!a2match && a2.val()!=""){
        alertBox("mismatch! please re-enter",a2v);
        return false;
    }else if (a2match && a2.val()!=""){
        CheckMark(a2v,"nofade");
    }
    return true;
}