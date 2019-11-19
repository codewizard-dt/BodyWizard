$(document).ready(function(){
	$('#PasswordCheck').find('.button').on('click',function(){
		if (checkField()){
			blurElement($("#PasswordCheck"),"#loading");
			var next = $("#PasswordCheck").data('next'), target = $("#PasswordCheck").data('target');
			console.log(target);
			if (target == 'parent'){
				target = $("#PasswordCheck").parent();
			}else{
				target = $(target);
			}
			$.ajax({
				url: "/password/check",
				data: {"password":$("#CheckPassword").val()},
				method: "POST",
				success:function(data){
					if (data == 'checkmark'){
						target.load(next);
					}else if (data == 'mismatch'){
						unblurElement($("#PasswordCheck"));
						setTimeout(function(){
					        $("#Feedback").find('.message').html("<h2>Mismatch</h2><div>Password does not match record. Try again.</div>");
					        blurElement($("body"),"#Feedback");   
						},150);
					}
				}
			});			
		}
	})
	var firstOnPage = $(".confirmPw").filter(function(){
		return $(this).parent().is("body");
	});
	var reason = firstOnPage.data('reason');
	$("<h1/>",{
		css: {
			paddingTop: "3em"
		},
		class: 'purple',
		text: 'Required '+reason
	}).insertBefore(firstOnPage);
	$("#CheckPassword").on('keyup',function(e){
	    if (e.keyCode=="13"){
	        $("#PasswordCheck").find('.button').click();
	    }
	})
});

function checkField(){
	var val = $("#CheckPassword").val();
	if (val != $.sanitize(val)){
		feedback('Error','Field cannot contain html');
		return false;
	}else{
		return true;
	}
}