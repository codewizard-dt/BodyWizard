$(document).ready(function(){
	var submitBtn = $("#AddNewCode").find(".submitForm");
	submitBtn.off('click',submitForm);
	submitBtn.on('click', saveCode);

	var formData = $(".formData");
	if (formData.length>0){
		var json = formData.data('json');
		// console.log(json);
		$("h2").text("Edit Code Information");
		fillForm(json,$("#AddNewCode"));
	}
})

function saveCode(){
	var obj = checkForm($("#AddNewCode"));
	if (obj){
		// var codeType = obj['Sections'][0]['Items'][0]['response'];
		var codeType = justResponse($("#code_type"));
		var submitObj = {
			code_type: codeType,
			key_words: $("#keywords").val(),
			name: $("#code_as_used_for_billing_and_invoicing").val(),
			code_description: $("#code_description").val(),
			full_json: JSON.stringify(obj)
		}
		if (codeType == "ICD"){
			submitObj['icd_version']  = justResponse($("#which_version_of_icd"));
		}
		blurElement($("body"),"#loading");
		var mode = ($(this).closest(".formData").attr('id') == "EditCode") ? "edit" : "new";
		if (mode == "edit"){
			var uid = JSON.parse($("#uidList").text())['code_id'];
			var url = "/codes/"+uid, method = "PATCH";
		}else{
			var url = "/codes", method = "POST";			
		}
		$.ajax({
			url:url,
			method:method,
			data: submitObj,
			success:function(data){
				if (data=="checkmark"){
					blurElement($("body"),"#checkmark");
					setTimeout(function(){
						$("#codes-index").find(".title").click();
						unblurElement($("body"));
					},1000)
				}else{
					unblurElement($("body"));
					console.log("ERROR");
					console.log(data);
				}
			},
			error:function(e){
				console.log(e);
				unblurElement($("body"));
			}
		})
	}
}