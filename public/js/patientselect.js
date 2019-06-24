$(document).ready(function(){
    var First, Last, StrMatch, AllNames = $("#PatientList").find(".name");
        
    //$("#PatientName").focus();
    
    $(".optionsNav").on("click",".button",optionsNavBtnClick);
    
    function UpdatePatientList() {
        AllNames.hide();
        First = $("#FNameLetter").find(".active").data("letter");
        Last = $("#LNameLetter").find(".active").data("letter");
        if (First !=undefined){var FName = ".FName"+First;}else{var FName = ".name";}
        if (Last!=undefined){var LName = ".LName"+Last;}else{var LName = ".name";}
        if (StrMatch==undefined){
            AllNames.filter(FName).filter(LName).show();
            if (FName==LName){AllNames.hide()}
        }else{
            StrMatch.filter(FName).filter(LName).show();
        }
        $("#PatientList").show().css({
            height:"auto",
            maxHeight:"10em",
        });
        $(".name.active").show();
        if ($(".name:visible").length==0){
            $("#PatientList").find("#empty").show().text("No matches");
            $("#PatientList").find("h4").find("span").text("Search for a patient below");
        }else{
            $("#empty").hide().text('');
            $("#PatientList").find("h4").find("span").text("Matching patients:");
        }
        checkOverflow(document.getElementById("PatientList"));
        
    }
    
    function UpdateFiltersList() {
        First = $("#FNameLetter").find(".active").data("letter");
        Last = $("#LNameLetter").find(".active").data("letter");
        var String = $("#PatientName").val();
        if (First != undefined){
            $("#FLetterFilter").fadeIn().html("First Name starts with \""+First+"\"<div class='x-out'>X</div>");
        }
        else{
            //$("#FLetterFilter").text("");
            $("#FLetterFilter").hide().text("");
        }
        if (Last != undefined){
            $("#LLetterFilter").fadeIn().html("Last Name starts with \""+Last+"\"<div class='x-out'>X</div>");
        }
        else{
            $("#LLetterFilter").hide().text("");
        }
        if (String != ""){
            $("#TextFilter").fadeIn().html("Name contains \""+String+"\"<div class='x-out'>X</div>");
        }
        else{
            $("#TextFilter").hide().text("");
        }
    }
    
    $("#PatientList").on("click",".clear",function(){
        var type = $(this).data("filter");
        if (type=="text"){$("#PatientName").val("");$("#PatientName").keyup();}
        else if (type=="fletter"){$("#FNameLetter").find(".active").click();}
        else if (type=="lletter"){$("#LNameLetter").find(".active").click();}
        UpdatePatientList();
        UpdateFiltersList();
    })
        
    $('#Letters').on("click", "li", function(){
        var AllAnchors = $(this).closest("ul").find("li");
        
        if ($(this).hasClass("active")){
            AllAnchors.removeClass("active");
        }else {
            AllAnchors.removeClass("active");
            $(this).addClass("active");
        }
        UpdatePatientList();
        UpdateFiltersList();
    });

    $("#PatientName").on("keyup", function(){
        var searchStr = $(this).val().trim().toLowerCase();
        if (searchStr==""){StrMatch=undefined}
        else {StrMatch = $('#PatientList').find('li[data-fullname*="'+searchStr+'"]');}
        UpdatePatientList();
        UpdateFiltersList();
    });
    
    $("#PatientList").on("click", "li", function(){
        //clearInterval(count);
        var FirstName = $(this).data("fname");
        var LastName = $(this).data("lname");
        var FullName= FirstName+" "+LastName;
        var PatientID = $(this).data("id");
        $("#FName").val(FirstName);
        $("#LName").val(LastName);
        if ($(this).hasClass("active")){
            $(this).removeClass("active");
            $("#FName, #LName").val("");
            //$('#CurrentPatient').html("");
        }else{
            $("#PatientList").find("li").removeClass("active");
            $(this).addClass("active");
            blurElement($("#CurrentPatient"),"#loading");
            $.ajax({
                url:"/php/loadPatientInfo.php",
                method: "POST",
                data:{ID: PatientID},
                success: function(data){
                    //clearInterval(count);
                    if (data.includes("No record")){
                        $("#CurrentPatient").html(data);
                    }
                    else {
                        $.ajax({
                            url:"/php/patient-option-display.php",
                            method: "POST",
                            data:{destinations:"patientDetails",btnText:"patient details"},
                            success: function(data){
                                $("#CurrentPatient").html(data);
                            }
                        })
                    }
                },
                error: function(){
                    $("#CurrentPatient").html("failure to load patient");
                }
            })
        }
    });
    
    $("#notnav").on("click","#addDemoRecord",function(){
        var PatientID = $("#PatientList").find('.active').data("id");
        var FName = $("#PatientList").find('.active').data("fname");
        var LName = $("#PatientList").find('.active').data("lname");
        
        $("#CurrentPatient").html("Adding record<span>.</span>");
        var dots;
        var currentName = $("#PatientList").find(".active");
        var count = setInterval(function(){
            var dots = $("#CurrentPatient").find("span").text();
            if (dots=="..."){$("#CurrentPatient").find('span').text(".");}
            else if (dots=="."){$("#CurrentPatient").find('span').text("..");}
            else if (dots==".."){$("#CurrentPatient").find('span').text("...");}
        },500);
        $.post("/php/addDemoRecord.php", {ID: PatientID, FName: FName, LName: LName},function(data){
            $("#CurrentPatient").html(data);
            clearInterval(count);
            currentName.click(); //removes active class and triggers associated events
            currentName.click(); //adds active class and triggers associated events
        })
    })
        
    $("#AddPatient").on("click",".submit",function(){
        var FName, LName, Email;
        FName = $("#AddFName").val();
        LName = $("#AddLName").val();
        Email = $("#Email").val();
        /*$("#AddPatient").html("Adding new patient<span>.</span>");
        var dots;
        var count = setInterval(function(){
            var dots = $("#AddPatient").find("span").text();
            if (dots=="..."){$("#AddPatient").find('span').text(".");}
            else if (dots=="."){$("#AddPatient").find('span').text("..");}
            else if (dots==".."){$("#AddPatient").find('span').text("...");}
        },500);*/
        if ($("#loading").length==0){
            $("<div id='loading' class='lds-ring'><div></div><div></div><div></div><div></div></div>").appendTo("body");
        }
        $("#loading").css({position: "absolute",left:"50%",top:"50%",transform:"translate(-50%,-50%)",}).addClass("dark");
        $("#AddPatient").html("").append($("#loading"));
        
        $.post("/php/addPatient.php", {AddFName: FName, AddLName: LName, Email: Email}, function(data){
            $("#AddPatient").html(data);
        })

    })
    
    $("#AddPatient").on('click',".cancel",function(){
        slideFadeOut($("#AddPatient"));
        unblurElement($("body"));
    })

    $("#AddPatientBtn").on("click", function(){
        $("#AddPatient").html("<h4>Add New Patient to Database</h4>First name: <input type=\"text\" id=\"AddFName\" name=\"AddFName\" required><br>Last name: <input type=\"text\" id=\"AddLName\" name=\"AddLName\" required><br>Email address: <input type=\"text\" id=\"Email\" name=\"email\" required><br><div class=\"xs-pad\"></div><div class=\"button submit xsmall gray\">add patient</div><div class='button xsmall cancel'>cancel</div>");
       //$("#AddPatient").modal();
        slideFadeIn($("#AddPatient"));
        blurElement($("body"),"#AddPatient");
    });
    
    UpdatePatientList();
    UpdateFiltersList();
    
})