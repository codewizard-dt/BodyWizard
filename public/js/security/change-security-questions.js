$(document).ready(function(){
	$("#SecQuestionUpdate").find("input").attr('type','password');
	$("#SecQuestionUpdate").find(".submit").on('click',function(){
		if (checkForMismatch()){
			submitUpdate();
		}
	})
	if ($("#CurrentQuestions").length > 0){
		$(".secQ, .submit").hide();
		$("#CurrentQuestions").find(".change").on('click',function(){
			var Qs = $("#CurrentQuestions").find("h3");
			$(".secQ").each(function(s,secQ){
				$(this).find("select").val($(Qs[s]).text());
			})
			$("#CurrentQuestions").hide();
			$(".secQ, .submit").show();
		})
	}
});

function checkForMismatch(){
	var pass = true, mismatch = [];
	$(".secQ").each(function(s, secQ){
		var a1 = $(this).find('input').first(), a2 = $(this).find('input').last(), q = $(this).find("select").val();
		var n = s+1;
		if (q == ""){
			pass = false;
			mismatch.push("You must select an option for Question "+n+".");
		}
		if (!checkField(a1) || !checkField(a2)){
			pass = false;
			return false;
		}
		if (a1.val().toLowerCase() != a2.val().toLowerCase()){
			mismatch.push("Answers for Question "+n+" do not match.");
			a1.val('');
			a2.val('');
			pass = false;
		}
		if (a1.val() == '' || a2.val() == ''){
			mismatch.push("A response field for Question "+n+" is blank.");
			pass = false;
		}
	});
	if (mismatch.length != 0){
		feedback("Error",mismatch.join("<br>"))
	}
	return pass;
}
function checkField(input){
	var val = input.val();
	if (val != $.sanitize(val)){
		feedback('Error','Fields cannot contain html');
		return false;
	}else{
		return true;
	}
}
function submitUpdate(){
	var Qs = [], A1s = [], questions = {}, pass = true;
	$(".secQ").each(function(s, secQ){
		var a1 = $(this).find('input').first().val().toLowerCase(), q = $(this).find("select").val();
		if (questions[q] == undefined){
			questions[q] = a1;
		}else{
			pass = false;
		}
	});
	if (!pass){
		feedback("Error","You must pick three different questions.");
		return false;
	}
	blurTopMost("#loading");
	$.ajax({
		url: "/security-questions/update",
		method: "POST",
		data: {
			questions: JSON.stringify(questions)
		},
		success: function(data){
			if (data == 'checkmark'){
				blurTopMost("#checkmark");
				delayedReloadTab();
			}else{
				$("#Error").find(".message").html("<h2>Error</h2><div>"+data+"</div>");
			}
		}
	})
}