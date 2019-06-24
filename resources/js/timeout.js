$(document).ready(function(){
    var timeout = setInterval(function(){
        $.ajax({
            url:"/php/timeout.php",
            method:"POST",
            data:{activity:"check"},
            success:function(data){
                if (data=="active"){
                    reset();
                }else if (data=="timedout"){
                    ActivityPrompt();
                }
            }
        })
    },15*60*1000);
    
    var popup = $('<div id="ActivityPrompt">Are you still active?<br>You\'ll be logged out in <span>60</span> seconds.<br><br><div class="button xsmall" id="CloseActivityPrompt">stay logged in</div></div>'), count, active;
    popup.appendTo("body").hide();
    
    var pageTitle = $("head").find('title').text();
    $("#CloseActivityPrompt").on("click",function(){
        $("#ActivityPrompt").fadeOut(400,function(){
            $("#ActivityPrompt").appendTo("body");
        })
        unblurElement($("body"));
        clearInterval(titlePrompt);
        $("head").find("title").text(pageTitle);
    })
   
    $("#timerClear").on("click",function(){
        clearInterval(timeout);
        $(window).off("click mousedown touchstart scroll",reset);
        confirmBox("Timer has been deactivated for this page",$(this));
    })

    $(window).on("click mousedown touchstart scroll",reset);
    
    var defaultFalse = setInterval(function(){
        active="false";
    },2*60*1000)
    var sendTrue = setInterval(function(){
        if (active=="true"){
            $.ajax({
                url:"/php/timeout.php",
                method:"POST",
                data:{activity:"active"}
            })
        }
    },60*1000)
        
    function reset(){
        active = 'true';
        clearInterval(timeout);
        timeout = setInterval(function(){
            $.ajax({
                url:"/php/timeout.php",
                method:"POST",
                data:{activity:"check"},
                success:function(data){
                    if (data=="active"){
                        reset();
                    }else if (data=="timedout"){
                        ActivityPrompt();
                    }
                }
            })
        },15*60*1000);
    }
    var countdown, doublecheck, titlePrompt;
    function ActivityPrompt(){
        $("#ActivityPrompt").find("span").text("60");
        count = $("#ActivityPrompt").find('span').text();
        count = Number(count);
        blurElement($("body"),"#ActivityPrompt");
        clearInterval(countdown);
        clearInterval(doublecheck);
        clearInterval(titlePrompt);
        countdown = setInterval(function(){
            count--;
            $("#ActivityPrompt").find('span').text(count);
            if (count==0){
                clearInterval(countdown);
                if ($("#ActivityPrompt").is(":visible")){
                    location.replace('/portal/timed-out');                    
                }
            }
        },1000);
        doublecheck = setInterval(function(){
            $.ajax({
                url:"/php/timeout.php",
                method:"POST",
                data:{activity:"check"},
                success:function(data){
                    if (data=="active"){
                        $("#CloseActivityPrompt").click();
                        reset();
                    }
                }
            })
        },15*1000);
        titlePrompt = setInterval(function(){
            var currentTitle = $("head").find("title").text();
            if (currentTitle == pageTitle){
                $("head").find("title").text("*INACTIVE* "+pageTitle);
            }else{
                $("head").find("title").text(pageTitle);
            }
        },1000);
    }
    
})