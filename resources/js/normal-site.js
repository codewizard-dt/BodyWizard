$(document).ready(function(){
    $(".booknow").addClass("link").data("target","/booknow");
    
    $(".link").on("click",followLink);
})

function followLink(){
    var t = $(this).data("target");
    window.location.href = t;
}