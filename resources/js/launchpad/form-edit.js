$(document).ready(function(){
    $(".optionsNav").on("click",".button",optionsNavBtnClick);
    $(".wrapMe").each(function(){
        wrapAndCenter($(this));
    })
})