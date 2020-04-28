$(document).ready(function(){
    
    var blurTablePairs, none = $(".table").find(".value:contains('none')"), notgiven = $(".table").find(".value:contains('not given')");
    blurTablePairs = none.add(notgiven);
    blurTablePairs.addClass("blurred");
        
    function addInputFields(){
        var values = $("#NewPatient").find(".value");
        $("#NewPatient").find(".value").removeClass("blurred");
        
        values.each(function(i,x){
            var text = $(x).text();
            var ID = $(x).closest(".pair").attr("id");
            var data = getDataByName(loginInfo,ID)[0];
            if (data.type == "text"){
                $(x).html("<input name='"+data.name+"' required>");
            }
        })
    }    
    function submit(){
        if (forms.retrieve($("#NewPatient"))){
            var FName = $("#FName").find("input").val();
            var LName = $("#LName").find("input").val();
            var Email = $("#Email").find("input").val();
            var data = {
                AddFName:FName,
                AddLName:LName,
                Email:Email
            }
            
            blurElement($("#NewPatient"),"#loading");
            
            $.ajax({
                url:"/php/addPatient.php",
                method:"POST",
                data:data,
                success:function(data){
                    
                    $("#Status").append(data);
                    unblurElement($("#NewPatient"));
                },
                error:function(data){
                    $("#Status").append(data);
                    unblurElement($("#NewPatient"));
                }
            })
        }
    }
    $(".submit").on("click",submit);
    
    var loginInfo;
    $.getJSON("/json/formFields.json",function(data){
        loginInfo = data.AccountDetails;
        addInputFields();
    });
    
    function getDataByName(JSONdata,name) {
        return JSONdata.filter(function(data){
            return data.name == name
        }) ;
    }
    
})