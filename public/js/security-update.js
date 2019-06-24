$(document).ready(function(){
    
/*    $('#SecurityBox').on('focusout','#changePW', function(){
        var pw1=$('#changePW').val();
        if (checkPWChars(pw1)){
            CheckMark($(this));
        }
    })*/
    $('#changePW').on('focusout', function(){
        var pw1=$('#changePW').val();
        if (checkPWChars(pw1)){
            CheckMark($(this));
        }
    })
    $('#changePW').on('focusin', function(){
        $('#changePW').parent().find('.checkmark').remove();
    })
    $('#changePW2').on('keyup', function(){
        if (checkPW()){
            CheckMark($(this));
        }else{
            $(this).parent().find('.checkmark').remove();
        }
    })
    
    $("#UpdatePW, #UpdateSecQ").find(".submit").on("click",function(){
        if ($(this).hasClass("disabled")==false){
            submitUpdate();
            alert("HI");
        }
    })
    
    var checkA1=false, checkA2=false, checkedPW=false;
    $('#answer1').on('focusout', function(){
        if (checkQChars($("#answer1"))){
            CheckMark($("#answer1"));
        }
    })
    $('#answer1').on('focusin', function(){
        $('#answer1').parent().find('.checkmark').remove();
    })
    $('#answer1v').on('keyup', function(){
        var pw1=$('#answer1').val(), pw2=$('#answer1v').val();
        if (checkQs(pw1,pw2,"1")==true){
            CheckMark($(this));
        }else{
            $(this).parent().find('.checkmark').remove();
            if (pw2.length>=pw1.length){
                alertBox("Answers do not match",$("#answer1v"));
            }
        }
        if (checkA1=='y' && checkA2=='y'){
            $(this).closest('.modalForm').find('.submit').removeClass("disabled");
        }else{
            $(this).closest('.modalForm').find(".submit").addClass("disabled");
        }
    })
    $('#answer2').on('focusout', function(){
        if (checkQChars($("#answer2"))){
            CheckMark($(this));
        }
    })
    $('#answer2').on('focusin', function(){
        $('#answer2').parent().find('.checkmark').remove();
    })
    $('#answer2v').on('keyup', function(){
        var pw1=$('#answer2').val(), pw2=$('#answer2v').val();
        if (checkQs(pw1,pw2,"2")==true){
            CheckMark($(this));
        }else{
            $(this).parent().find('.checkmark').remove();
            if (pw2.length>=pw1.length){
                alertBox("Answers do not match",$("#answer2v"));
            }
        }
        if (checkA1=='y' && checkA2=='y'){
            $(this).closest('.modalForm').find('.submit').removeClass("disabled");
        }else{
            $(this).closest('.modalForm').find(".submit").addClass("disabled");
        }

    })
    $(".link").on('click',function(){
        var link = $(this).data("target");
        window.location.href = link;
    })

    function checkPWChars(pw1){
        var pwU = /[A-Z]/.test(pw1);
        var pwN = /[0-9]/.test(pw1);
        if (pw1.length<8){
            alertBox("at least 8 characters",$("#changePW"));
            return false;
        }
        if (pwU==false){
            alertBox("must include uppercase",$("#changePW"));
            return false;
        }
        if (pwN==false){
            alertBox("must include a number",$("#changePW"));
            return false;
        }
        return true;
    }
    function checkQChars(Q){
        if ($(Q).val().length<5){
            alertBox("at least 5 characters",$(Q));
            return false;
        }
        return true;
    }
    function checkPW(){
        var pw1 = $("#changePW").val(), pw2 = $("#changePW2").val();
        if (pw2.length>=pw1.length){
            if (pw1==pw2 && pw1.length>=8){
                checkedPW=true;
                checkAll();
                return true;
            }else {
                checkedPW=false;
                alertBox("passwords don't match",$("#changePW2"));
                checkAll();
                return false;
            }
        }else{
            checkedPW=false;
            checkAll();
            return false;
        }
    }
    function checkQs(Q,QV,check){
        if (Q==QV && Q.length>=5){
            if (check=="1"){checkA1=true}
            else if (check=="2"){checkA2=true}
            checkAll();
            return true;
        }else {
            if (check=="1"){checkA1=false}
            else if (check=="2"){checkA2=false}
            checkAll();
            return false;
        }
    }
    function checkAll(){
        if ($("#PW").is(":visible") && !checkedPW){
            $(".submit").addClass("disabled");
            return false;
        }
        if ($("#SecQ").is(":visible") && (!checkA1 || !checkA2)){
            $(".submit").addClass("disabled");
            return false;
        }
        $(".submit").removeClass("disabled");
    }
    function submitUpdate(){
        var form = $(this).closest(".modalForm");
        console.log(form);
        if (checkForm(form)){
            var inputs = $("input").filter(function(){
                return $(this).attr("name")!=undefined && $(this).is(":visible")==true;
            });
            var data={};
            inputs.each(function(i,input){
                var id = $(input).attr("name"), val = $(input).val() ;
                data[id]=val;
            })
            console.log(data);
            blurModal(form,"#loading");
            var successNode = "<h3>Successfully updated</h3><div class='button xsmall link' data-target='/portal/launchpad'>continue to portal</div>";
            var failNode = "<h3>Update failed</h3><div class='button xsmall link' data-target='/portal/launchpad'>continue to portal</div>";
            var errorNode = "<h3>Error updating</h3><div class='button xsmall link' data-target='/portal/launchpad'>continue to portal</div>";
            $.ajax({
                url:"/php/membership/security-update.php",
                method:"POST",
                data:data,
                success:function(data){
                    if (data){
                        unblurModal(form);
                        form.html(successNode);
                    }else{
                        unblurModal(form);
                        form.prepend(failNode);
                        //$.scrollTo("#SecurityBox");
                    }
                },
                error:function(){
                    unblurElement(form);
                    form.prepend(errorNode);
                    //$.scrollTo("#SecurityBox");
                }
            })
        }
    }
})