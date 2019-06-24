$(document).ready(function(){
	// console.log('hi');
	masterStyle();
	$("#AddCategoryBtn").on("click",function(){
		blurElement($("body"),"#AddCategory");
	})
	$("#AddCategoryBtn").insertAfter($(".clearTableFilters[data-target='#ServiceCategoryList']"));
	$(".submitForm").off('click',submitForm);
	var id = $("#EditCategory").find(".formDisp").attr("id");
	$("#EditCategory").find(".formDisp").attr("id",id.replace("New","Edit"));
	$("#EditCategory").find("h2").each(function(){
		$(this).text($(this).text().replace("New","Edit"));
	})

	var editBtn = $(".button").filter("[data-destination='service-categories-edit']");
	editBtn.on("click",function(){
		var json = $("#CurrentServiceCategory").find(".name").data('json'),
			form = $("#EditCategory").find(".formDisp");
		blurElement($("body"),"#EditCategory");
		console.log(json);
		fillForm(json,form);
	})
	$("#NewServiceCategory").on("click",".submitForm",function(){
		var form = $("#NewServiceCategory");
		var obj = checkForm(form);
		if (obj){
			submitObj = {
				name: $("#category_name").val(),
				description: $("#description").val(),
				full_json: JSON.stringify(obj)
			}
			console.log(submitObj);
			blurModal($("#AddCategory"),"#loading");
			$.ajax({
				url:"/service-categories",
				method:"POST",
				data: submitObj,
				success:function(data){
					if (data=='checkmark'){
						blurModal($("#AddCategory"),"#checkmark");
						setTimeout(function(){
							unblurElement($("body"));
							$("#serviceTarget").html(loadingRing);
							$("#serviceTarget").load("/service-categories/home");
						},1000)
					}else{
						console.log(data);
						blurModal($("#AddCategory"),"#Error");
						$("#Error").text("Error saving category");
						setTimeout(function(){
							unblurModal($("AddCategory"));
						},1000)
					}
				}
			})
		}
	})
	$("#EditServiceCategory").on("click",".submitForm",function(){
		var form = $("#EditServiceCategory");
		var obj = checkForm(form);
		var uid = $("#CurrentServiceCategory").data('uid');
		if (obj){
			submitObj = {
				name: $("#category_name").val(),
				description: $("#description").val(),
				full_json: JSON.stringify(obj)
			}
			console.log(submitObj);
			blurModal($("#EditCategory"),"#loading");
			$.ajax({
				url:"/service-categories/"+uid,
				method:"PATCH",
				data: submitObj,
				success:function(data){
					if (data=='checkmark'){
						blurModal($("#EditCategory"),"#checkmark");
						setTimeout(function(){
							unblurElement($("body"));
							$("#serviceTarget").html(loadingRing);
							$("#serviceTarget").load("/service-categories/home");
						},1000)
					}else{
						console.log(data);
						blurModal($("#EditCategory"),"#Error");
						$("#Error").text("Error saving category");
						setTimeout(function(){
							unblurModal($("EditCategory"));
						},1000)
					}
				}
			})
		}
	})
})