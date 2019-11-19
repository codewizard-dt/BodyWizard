$(document).ready(function () {
    var sessionCheck = setInterval(function(){
        $.ajax({
            url:'/session-check',
            error:function(data){
                console.log(data);
            }
        });
    },1000*60);
});

