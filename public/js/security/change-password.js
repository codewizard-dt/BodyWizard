$(document).ready(function(){
	$("#ChangePassword").find("input").attr('type','password');
	$("#ChangePassword").attr('autocomplete','off');
	$("#ChangePassword").find(".submitForm").off('click',submitForm);
	$("#ChangePassword").find(".submitForm").on('click',submitPassword);
	if ($("#ChangePassword").parent().parent().is("body")){
		$("<h1/>",{
			css: {
				paddingTop: "3em"
			},
			class: 'purple',
			text: 'Required Password Update'
		}).insertBefore("#ChangePassword");
	}
});

function submitPassword(){
	var obj = forms.retrieve($("#ChangePassword"));

	if (!obj){return false;}

	var oldpw = $("#enter_your_old_password").val(), newpw = $("#enter_a_new_password").val(), confirmpw = $("#re-enter_your_new_password").val();
	if (newpw != $.sanitize(newpw)){
		$("#enter_a_new_password").val('');
		$("#re-enter_your_new_password").val('');
		feedback('Error','Illegal password. Cannot contain html.');
		return false;
	}else if (!checkPasswordStrength($("#enter_a_new_password"))){
		return false;
	}else if (newpw !== confirmpw){
		$("#enter_a_new_password").val('');
		$("#re-enter_your_new_password").val('');
		feedback('Mismatch','Your new password and confirmation do not match. Please re-enter.');
		return false;
	}
	blurElement($("body"),"#loading");
	$.ajax({
		url: "/password/update",
		method: 'POST',
		data:{
			old_password: $("#enter_your_old_password").val(),
			new_password: $("#enter_a_new_password").val()
		},
		success:function(data){
			console.log(data);
			if (data == 'mismatch'){
				feedback('Mismatch',"Old password does not match record.");
			}else if (data == 'no changes'){
				setTimeout(function(){
					$("#Feedback").find(".message").html("<h2>Password update failed</h2><div>New password matches old password.</div>")
				},100)
			}else if (data == 'checkmark'){
				blurTopMost("#checkmark");
				delayedReloadTab(1500);
			}
		}

	})
}