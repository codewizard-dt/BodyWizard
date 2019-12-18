var autoSaveTimer = null;
$(document).ready(function(){
	$(".displayOrder").find('ul').each(function(u, ul){
		resizeLIs(ul);
		if ($(ul).find('.empty').length > 0){
			$(ul).find('li').not('.empty').hide();
		}
	})
	$(".up, .down").on('click',reorder);
	$("li").filter(function(){
		return $(this).data('target') != undefined;
	}).on('click',loadTarget);
	$("#ServiceList").sortEle("li");
})
function reorder(){
    var d, currentLI = $(this).closest("li"), name = currentLI.find(".name").text(), changeLI, allLIs = $(this).closest('ul').find("li:visible"), current, change, n = allLIs.length, k, ul = currentLI.closest("ul");
    if ($(this).hasClass('up')){
        d = 'up';
    }else if ($(this).hasClass("down")){
        d = 'down';
    }

    allLIs.each(function(x,li){
    	if ($(li).is(currentLI)){k = x;}
    })

    if ((k == 0 && d == "up") || (k == n -1 && d == "down")){
        return false;
    }

    if (d == "up"){
        changeLI = $(allLIs[k-1]);
        currentLI.insertBefore(changeLI);            
    }else if (d == "down"){
        changeLI = $(allLIs[k+1]);
        currentLI.insertAfter(changeLI);            
    }
    
    currentLI.animate({
        "height":"-=30px",
        "opacity":0.2
    },100,function(){
        currentLI.animate({
            "height":"+=30px",
            "opacity":1
        },400,function(){
            currentLI.css("height","auto");
        })
    })
    changeLI.animate({
        "height":"+=30px",
        "opacity":0.2
    },100,function(){
        changeLI.animate({
            "height":"-=30px",
            "opacity":1
        },400,function(){
            changeLI.css("height","auto");
        })
    })

    if (autoSaveTimer != null){
    	clearTimeout(autoSaveTimer);
    }
    autoSaveTimer = setTimeout(function(){
    	autoSaveOrder();
    },5*1000)
}
function autoSaveOrder(){
	var obj = {};
	$(".displayList").each(function(u, ul){
		var model = $(ul).data('model');
		obj[model] = {};
		$(ul).find("li").not('.empty').each(function(l, li){
			var uid = $(li).data('uid');
			obj[model][uid] = l + 1;
		})
	})
	$("#AutoConfirm").find(".message").text("Autosaving...");
	$("#AutoConfirm").find('.checkmark').hide();
	slideFadeIn($("#AutoSaveWrap"));
	$.ajax({
		url:"/portal/settings/display-order",
		method: "POST",
		data: obj,
		success:function(data){
			if (data == 'checkmark'){
	            var wrap = $("#AutoSaveWrap");
	            var t = new Date();
	            var timeStr = t.toLocaleTimeString();
	            $("#AutoConfirm").find(".message").text("Autosaved at " + timeStr);
				$("#AutoConfirm").find('.checkmark').show();
	            setTimeout(function(){
	            	slideFadeOut(wrap);
	            },2500);				
			}else{
				console.log(data);
			}
		}
	})
}
function loadTarget(ev){
	var t = $(ev.target);
	if (t.hasClass('up') || t.hasClass('down')){return;}

	var target = $(this).data('target'), LIs = $("li").filter("."+target), name = $(this).find(".name").text(), ul = LIs.first().closest('ul')[0];
	$(this).addClass('active');
	$(this).siblings().removeClass('active');
	LIs.each(function(l, li){
		if ($(li).data('condition') == name){
			$(li).show();
		}else{
			$(li).hide();
		}
	})
	resizeLIs(ul);
}
function resizeLIs(ul){
	var spans = $(ul).first('li').find("span"), spanCount = spans.length, lis = $(ul).find("li"), liCount = lis.length, w = 0;
	lis.find('span').css('width','auto');
	spans.each(function(s, span){
		lis.each(function(l, li) {
			// console.log(li);
			if ($(li).is(":visible")){
				// console.log('yes');
	            var thisSpan = $($(li).find('span').get(s)), thisWidth = thisSpan.width();
	            w = (w < thisWidth) ? thisWidth : w;				
			}
		})
		$($(ul).find('li').find('span').get(s)).width(w);
	})
}