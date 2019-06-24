$(document).ready(function(){
    masterStyle();
    //TABLE STUFF
    var defaultFilterOptions = {
        "highlight":"true",
        "separateWords":"false",
        "wholeWords":"true"
    };
     
    $(".filterType").each(function(){
        if ($(this).data('options')==undefined){
            $(this).data('options',defaultFilterOptions);
        }else{
            var optObj = $(this).data('options');
            $.each(defaultFilterOptions,function(key,value){
                if (optObj[key]==undefined){
                    optObj[key] = defaultFilterOptions[key];
                }
            })
            $(this).data("options",optObj);
        }
    })
    $(".tableFilter").on("change",function(){
        table = $(this).closest(".filterType").data("target");
        table = $(table);
        var f = $(this).data('filter'), fT = $(".filterType").filter("[data-condition='"+f+"']");
        if ($(this).is(":checked")){
            slideFadeIn(fT);
        }else{
            slideFadeOut(fT);
            fT.find(".tableFilter").each(function(){
                if ($(this).is(":checked")){$(this).click();}
            })
        }
        filterTableList(table);
    });
    $(".tableSearch").on("keyup",function(){
        table = $(this).closest(".filterType").data("target");
        table = $(table);
        filterTableList(table);
    });
    var table = $("#PatientList2");
    checkHorizontalTableFit(table);
    $(window).off("resize",resizeCheckTableWidth);
    $(window).on("resize",resizeCheckTableWidth);
    //table.width(table.innerWidth());
    filterTableList(table);
    ///TABLE STUFF END
     
    $(".modalForm").find(".submitForm").off("click",submitForm);
    $("#NewPatient").find(".submitForm").on("click",savePatient);
    $("#EditPatient").find(".submitForm").on("click",editPatient);
    $("#EditPatient").children(".formDisp").attr("id","EditPatientForm");
    var emailItems = $("#NewPatient, #EditPatient").find(".item").filter(function(){
        return $(this).children(".question").text().toLowerCase().includes("email");
    });
    emailItems.find("input").on("keyup",validateEmail);
    emailItems.find('input').on("focusout",finalizeEmail);

    var phoneItems = $("#NewPatient, #EditPatient").find(".item").filter(function(){
        return $(this).children(".question").text().toLowerCase().includes("phone");
    });
    phoneItems.find("input").on("keyup",validatePhone);
    phoneItems.find('input').on("focusout",finalizePhone);

    $("#NewPatient, #EditPatient").find(".item").filter(function(){
        return $(this).children(".question").text().toLowerCase().includes("preferred name");
    }).find("input").attr("id","PreferredName");
    
    $("#NewPatient, #EditPatient").find(".item").filter(function(){
        return $(this).children(".question").text().toLowerCase().includes("last name");
    }).find("input").attr("id","LastName");
    
    $("tr").not(".head").on("click",loadPatient);
    $("#NewPatientBtn").on('click',function(){
        blurElement($("body"),"#NewPatient");
    });
    $("#ContestedUsernameBtn").on("click",function(){
        blurModal($("#Block2").parent(),"#ContestedUsername");
    })
    $("#SubmitUsernameChangeBtn").on("click",changeUserName);
    
    $("#ContestedUsernameInput, #ChangeUsernameInput").on('keyup',validateUsername);
    $("#ChangeContestedUsernameBtn").on("click",changeUserName);
    
    $("#PasswordReset").on("click",".submit",function(){
        SecurityReset($("#PasswordReset"),"password");
    })
    $("#SecurityQuestionReset").on("click",".submit",function(){
        SecurityReset($("#SecurityQuestionReset"),"securityQuestions");
    })
    
})

var userNameAvailable = undefined;
function loadPatient(){
    if ($(this).hasClass("active")){
        return false;
    }
    var id = $(this).data('patientid');
    $(this).closest("table").find(".active").removeClass("active");
    $(this).addClass('active');
    blurElement($("#CurrentPatient"),"#loading");
    $.ajax({
        url:"/php/launchpad/practitioner/patient-option-display.php",
        method: "POST",
        data:{
            PatientID:id,
            destinations:"patientEdit,apptNew",
            btnText:"edit,new appointment"
        },
        success:function(data){
            $("#CurrentPatient").html(data);
            checkOverflow(document.getElementById("CurrentPatient"));
        }
    })
}
function savePatient(){
    var details = createSubmitObject($("#AddNewPatient"));
    if (details){
        var btn = $(this);
        btn.addClass("disabled");
//        $(loadingRing).appendTo($(this)).css({top:"50%",transform:"translate(-50%,-50%)"});
        btn.off("click",savePatient);
        blurModal($("#NewPatient"),"#loading");
        
        var usernameItem = $("#AddNewPatient").find(".item").filter(function(){
            return $(this).children(".question").text().toLowerCase().includes("email");
        }), username = usernameItem.find("input").val();
        checkUserName(username);
        var wait = setInterval(function(){
            if (userNameAvailable!=undefined){
                console.log(userNameAvailable);
                clearInterval(wait);
                if (userNameAvailable === true){
                    $.ajax({
                        url:"/php/launchpad/practitioner/save-patient-POST.php",
                        method:"POST",
                        data:{
                            SaveOrUpdate:"save",
                            info: JSON.stringify(details)
                        },
                        success:function(data){
                            blurModal($("#NewPatient"),"#checkmark");
                            setTimeout(function(){
                                location.reload(true);
                            },1000)
                        },
                        error:function(){
                            console.log("ERROR YO");
                        }
                    })
                }else{
                    btn.removeClass("disabled");
                    btn.find(".lds-ring").remove();
                    btn.on("click",savePatient);
                    var contestedID = userNameAvailable.split(":")[0];
                    var contestedName = userNameAvailable.split(":")[1];
                    var currentName = $("#PreferredName").val() + " " + $("#LastName").val();
                    $("#UserNameClash").find("span").text(username);
                    $("#ContestedUsername").find(".contestedUsername").text(username);
                    $("#ContestedUsername").find(".contestedPatientName").text(contestedName);
                    $("#ContestedUsername").find(".currentPatientName").text(currentName);
                    $("#ChangeContestedUsernameBtn").data("userid",contestedID);
                    blurModal($("#NewPatient"),"#UserNameClash");
                }
                userNameAvailable=undefined;
            }
        },50)
    }
}
function editPatient(){
    var details = createSubmitObject($("#EditPatientForm")), id =  $("#CurrentPatient").find(".name").data("patientid"), emailcheck = $("#CurrentPatient").find(".name").data("checkemail");
    if (details){
        var btn = $(this);
        btn.addClass("disabled");
        //$(loadingRing).appendTo($(this)).css({top:"50%",transform:"translate(-50%,-50%)"});
        btn.off("click",editPatient);
        blurModal($("#EditPatient"),"#loading");
        
        var usernameItem = $("#EditPatientForm").find(".item").filter(function(){
            return $(this).children(".question").text().toLowerCase().includes("email");
        }), username = usernameItem.find("input").val();
        checkUserName(username);

        var wait = setInterval(function(){
            if (userNameAvailable!=undefined){
                clearInterval(wait);
                console.log(userNameAvailable);
                if (userNameAvailable===true){
                    $.ajax({
                        url:"/php/launchpad/practitioner/save-patient-POST.php",
                        method:"POST",
                        data:{
                            SaveOrUpdate:"update",
                            PatientID: id,
                            info: JSON.stringify(details)
                        },
                        success:function(data){
                            blurModal($("#EditPatient"),"#checkmark");
                            setTimeout(function(){
                                location.reload(true);
                            },1000)
                        },
                        error:function(){
                            console.log("ERROR YO");
                        }
                    })
                }
                else if (userNameAvailable.split(":")[0]==id){
                    $.ajax({
                        url:"/php/launchpad/practitioner/save-patient-POST.php",
                        method:"POST",
                        data:{
                            SaveOrUpdate:"update",
                            PatientID: id,
                            info: JSON.stringify(details)
                        },
                        success:function(data){
                            blurModal($("#EditPatient"),"#checkmark");
                            setTimeout(function(){
                                location.reload(true);
                            },1000)
                        },
                        error:function(){
                            console.log("ERROR YO");
                        }
                    })                    
                }
                else if (userNameAvailable.split(":")[0]!==id && emailcheck=="skip"){
                    $.ajax({
                        url:"/php/launchpad/practitioner/save-patient-POST.php",
                        method:"POST",
                        data:{
                            SaveOrUpdate:"update",
                            PatientID: id,
                            info: JSON.stringify(details)
                        },
                        success:function(data){
                            blurModal($("#EditPatient"),"#checkmark");
                            setTimeout(function(){
                                location.reload(true);
                            },1000)
                        },
                        error:function(){
                            console.log("ERROR YO");
                        }
                    })                    
                }
                else{
                    btn.removeClass("disabled");
                    btn.find(".lds-ring").remove();
                    btn.on("click",editPatient);
                    var contestedID = userNameAvailable.split(":")[0];
                    var contestedName = userNameAvailable.split(":")[1];
                    var currentName = $("#PreferredName").val() + " " + $("#LastName").val();
                    $("#UserNameClash").find("span").text(username);
                    $("#ContestedUsername").find(".contestedUsername").text(username);
                    $("#ContestedUsername").find(".contestedPatientName").text(contestedName);
                    $("#ContestedUsername").find(".currentPatientName").text(currentName);
                    $("#ChangeContestedUsernameBtn").data("userid",contestedID);
                    blurModal($("#EditPatient"),"#UserNameClash");
                }
                userNameAvailable=undefined;
            }
        },50)
    }    
}

function validateEmail(){
    var val = $(this).val(), i = $(this);
    var m = val.match(/[^a-zA-Z0-9@._\-]/);
    val = val.replace(/[^a-zA-Z0-9@._\-]/g,"");
    if ($(this).val()!=val){
        i.off("keyup",validateEmail);
        $(this).val(val);
        alertBox(m+" is an invalid character",$(this).closest('.answer'),"after",800);
        setTimeout(function(){
            i.on("keyup",validateEmail);
        },801)
    }
}
function finalizeEmail(){
    var i = $(this), val = i.val();
    var pattern = /[a-zA-Z0-9._\-]*@[a-zA-Z0-9._\-]*\.[a-zA-Z0-9.]*/;
    if (!pattern.test(val)){
        i.off("keyup",validateEmail);
        $(this).val(val);
        alertBox('enter a valid email',$(this).closest('.answer'),"after",800);
        setTimeout(function(){
            i.on("keyup",validateEmail);
        },801)
    }
}
function validatePhone(){
    var i = $(this), val = i.val();
    var m = val.match(/[^0-9.()-]/);
    val = val.replace(/[^0-9.()-]/g,"");
    if ($(this).val()!=val){
        i.off("keyup",validatePhone);
        $(this).val(val);
        alertBox(m+" is an invalid character",$(this).closest('.answer'),"after",800);
        setTimeout(function(){
            i.on("keyup",validatePhone);
        },801)
    }
}
function finalizePhone(){
    var i = $(this), val = i.val();
    var digits = val.match(/\d/g);
    if (digits.length!=10){
        i.off("keyup",validatePhone);
        alertBox("invalid phone number",$(this).closest('.answer'),"after",800);
        setTimeout(function(){
            i.on("keyup",validatePhone);
        },801)
    }else{
        var ph = digits[0]+digits[1]+digits[2]+"-"+digits[3]+digits[4]+digits[5]+"-"+digits[6]+digits[7]+digits[8]+digits[9];
        i.val(ph);
    }
}

function validateUsername(){
    var val = $(this).val(), i = $(this);
    var m = val.match(/[^a-zA-Z0-9_]/);
    val = val.replace(/[^a-zA-Z0-9_]/g,"");
    if ($(this).val()!=val){
        i.off("keyup",validateUsername);
        $(this).val(val);
        alertBox(m+" invalid character",$(this).closest('.answer'),"after",800);
        setTimeout(function(){
            i.on("keyup",validateUsername);
        },801)
    }
}
function checkUserName(username){
    var check = undefined;
    $.ajax({
        url:"/php/checkUserName.php",
        method:"POST",
        data:{
            Username:username
        },
        success:function(data){
            if (data=="true"){
                userNameAvailable = true;
            }else{
                userNameAvailable = data;
            }
        }
    })
}
function changeUserName(){
    var username = $(this).parent().find("input").val(), user = $(this).data("user");
    var btn = $(this);
    if (user=='current'){
        var id = $("#CurrentPatient").find(".name").data("patientid");
    }else if (user=='contested'){
        var id = btn.data('userid');
    }
    $(this).addClass("disabled");
    $(this).off("click",changeUserName);
    $(this).parent().find("input").blur();
    loadBlurLight($(this).parent());
    console.log(user);
    console.log(username);
    console.log(id);
    checkUserName(username);
    var wait = setInterval(function(){
        if (userNameAvailable!=undefined){
            if (userNameAvailable===true){
                $.ajax({
                    url:"/php/launchpad/practitioner/save-username-POST.php",
                    method:"POST",
                    data:{
                        NewUsername:username,
                        UserID:id
                    },
                    success:function(data){
                        if (data=="true"){
                            $("#loading").remove();
                            CheckMark($(".loadBlock"),"nofade","-50%,-50%");
                            $(".zeroWrap").css({top:"0",left:"50%"});
                            $(".checkmark").css({fontSize:"4em"});
                            setTimeout(function(){
                                if (user=="current"){
                                    location.reload(true);
                                }else{
                                    unblurModal($("#Block2").parent());
                                }
                            },1000);
                        }else{
                            alert('fail');
                        }
                    }
                })
            }else{
                alertBox("username unavailable",btn.parent().find(".answer"),"above","1500");
                btn.parent().find(".loadBlock").remove();
                btn.removeClass("disabled");
                btn.on("click",changeUserName);
            }
            clearInterval(wait);
            userNameAvailable=undefined;
        }
    },50)
}

