$(document).ready(function(){
    var blurTablePairs, none = $(".table").find(".value:contains('none')"), notgiven = $(".table").find(".value:contains('not given')");
    blurTablePairs = none.add(notgiven);
    blurTablePairs.addClass("blurred");
    
    $(".scriptBlock").on('click', '.clickToEdit', addInputFields) ;
    $(".scriptBlock").on("click",".clickToSave",function(){
        var target = $(this).data("target"), table = $(this).data("table"), db = $(this).data("database");
        var cancel = $(".clickToCancel").filter("[data-target='#LoginDetails']") ;
        cancel.html("(checking availability)");
        setTimeout(function(){
            saveData(target,table,db);
        },100);
    });
    $(".scriptBlock").on("click", ".clickToCancel", cancelInputFields);
    
    function addInputFields(){
        var target = $(this).data("target");
        var values = $(target).find(".value");
        $(target).find(".value").removeClass("blurred");
        $(this).text("(cancel)");
        $(this).clone().insertBefore($(this)).removeClass("clickToEdit").addClass("clickToSave").text("(save)");
        $(this).off("click",addInputFields);
        
        values.each(function(i,x){
            var text = $(x).text();
            var ID = $(x).closest(".pair").attr("id");
            var data = getDataByName(formFieldData,ID)[0];
            if (data.type == "text"){
                $(x).html("<input name='"+data.name+"'>");
            }
            else if (data.type == "dropdown"){
                $(x).html("<select name='"+data.name+"'><option value='not given'>not given</option></select>");
                $(data.options).each(function(z,opt){
                    $(x).find("select").append("<option value='"+opt+"'>"+opt+"</option>");
                })
                var currentVal = $(x).find("option").filter("[value='"+text+"']");
                if (currentVal.length==1){
                    currentVal.attr("selected",true);
                }
            }
            else if (data.type == "date"){
                $(x).html("<input readonly placeholder='tap to pick date' name='"+data.name+"' class='datepicker'>");
            }
            $(x).find("input").val(text);
            $(x).data("originalData",text);
            
            var h = $(x).height();
            $(x).find("select").height(h);
        })
        
        $(".datepicker").each(function(){
            $(this).on("focus",function(e){
                e.preventDefault();
            })
            $(this).datepick({yearRange: '1900:2020'});
        })
        
        var link = $(this);
        setTimeout(function(){
            link.removeClass("clickToEdit").addClass("clickToCancel");
        },500);
    }
    
    function cancelInputFields(){
        var target = $(this).data("target");
        var inputs = $(target).find("input, select, textarea");
        
        $(inputs).each(function(){
            var text = $(this).closest(".value").data("originalData");
            var pair = $(this).closest(".pair");
            $(pair).find(".value").html(text);
        });
        
        $(this).text("(edit)");
        var link = $(this);
        setTimeout(function(){
            link.removeClass("clickToCancel").addClass("clickToEdit");
        },500);
        $(this).parent().find(".clickToSave").remove();
    }
    
    function saveData(container,formName,database){
        
        var items = $(container).find("input, select, textarea");
        var names = new Array();
        var values = new Array();
        var dataObj;
        
        blurElement(container,"#loading");
        
        if ($(container).attr("id")=="LoginDetails"){
            var email = $(container).find("[name='Email']").val();
            var username = $(container).find("[name='Username']").val();
            
            
            //var check = checkAvailability(email,username);
            checkAvailability(email,username);
            
            var availInt = setInterval(function(){
                if (availCheck!=undefined){
                    availCheck = undefined;
                    clearInterval(availInt);
                    if(availCheck=="username"){
                        alertBox("Username already registered",$(container).find("[name='Username']"),"above","fade");
                        $(".clickToCancel").filter("[data-target='#LoginDetails']").html("(cancel)");
                        unblurElement(container);
                        return false;
                    }
                    else if (availCheck=="email"){
                        alertBox("Email already registered",$(container).find("[name='Email']"),"above","fade");
                        $(".clickToCancel").filter("[data-target='#LoginDetails']").html("(cancel)");
                        unblurElement(container);
                        return false;
                    }else{
                        $(items).each(function(i,ele){
                            var name = $(ele).attr("name"), value = $(ele).val();
                            if (name == "NickName" && value == "none"){
                                value = "";
                            }
                            names.push(name);
                            values.push(value);
                        })

                        dataObj = {
                            "formName":formName,
                            "database":database,
                            "names":names.join(),
                            "values":values.join()
                        };
                        
                        $(".clickToCancel").filter("[data-target='#LoginDetails']").html("(saving)");
                        $.ajax({
                            url: "/php/update-form-data.php",
                            method: "POST",
                            data: dataObj,
                            success: function(data){
                                if (data==="true"){
                                    window.location.reload(true);                
                                }else{
                                    $(container).html("Error saving data");
                                }

                            }
                        })
                    }
                }
            },100)
        }else{
            $(items).each(function(i,ele){
                var name = $(ele).attr("name"), value = $(ele).val();
                if (name == "NickName" && value == "none"){
                    value = "";
                }
                names.push(name);
                values.push(value);
            })

            dataObj = {
                "formName":formName,
                "database":database,
                "names":names.join(),
                "values":values.join()
            };

            $.ajax({
                url: "/php/update-form-data.php",
                method: "POST",
                data: dataObj,
                success: function(data){
                    if (data==="true"){
                        window.location.reload(true);                
                    }else{
                        $(container).html("Error saving data");
                    }

                }
            })
        }
    }
    
    var availCheck = undefined;
    function checkAvailability(email,un){
        var dataObj = {
            email : email,
            username : un
        }
        var result; 
        
        $.ajax({
            url: "/php/checkAvailability.php",
//            async: false,
            method: "POST",
            data : dataObj,
            success : function(data){
                availCheck = data;
            }
        })
    }
    
    var formFieldData;
    $.getJSON("/json/formFields.json",function(data){
            formFieldData = data.AccountDetails;
    });
    
    function getDataByName(JSONdata,name) {
        return JSONdata.filter(function(data){
            return data.name == name
        }) ;
    }

})