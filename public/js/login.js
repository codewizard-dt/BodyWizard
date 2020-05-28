
$(document).ready(function(){
    masterStyle();
    $(".submitForm").off("click",submitForm);
    
    var login = $("#LoginForm");
    login.on("keyup",function(e){
        var k = e.keyCode;
        if (k==13){
            login.find("input").blur();
            login.find(".submit").click();
        }
    })
    login.find(".submit").on('click',function(){
        if (checkLogin(login)){
            submitLogin();
        }
    })

    $("#NewUser").load("/register",function(){
        var emailItems = $("#NewUser").find(".item").filter(function(){
            return $(this).children(".question").text().toLowerCase().includes("email");
        });
        emailItems.find("input").on("keyup",validateEmail);

        var phoneItems = $("#NewUser").find(".item").filter(function(){
            return $(this).children(".question").text().toLowerCase().includes("phone");
        });
        phoneItems.find("input").on("keyup",validatePhone);

        var username = $("#NewUser").find("#username");
        username.on("keyup",validateUsername);

        var passwordItems = $("#NewUser").find(".item").filter(function(){
            return $(this).children(".question").text().toLowerCase().includes("password");
        });
        passwordItems.find("input").attr("type","password");
        $("#NewUser").find(".submitForm").on("click",submitRegistration);
    })


})

function submitRegistration(){
    var obj = forms.retrieve($("#NewUser")), form = $("#NewUser"), u = form.find("#username"), e = form.find("#email_address"), p = form.find("#phone_number");
    if (!obj){return false;}
    if (finalizePhone(p) && finalizeEmail(e) && finalizeUsername(u)){
        blur(form,"#loading");
    }else{
        return false;
    }
    var data = {
            username : form.find(".email_address").val(),
            first_name : form.find(".first_name").val(),
            middle_name : (form.find(".middle_name").val() != "") ? form.find(".middle_name").val() : null,
            last_name : form.find(".last_name").val(),
            preferred_name : (form.find(".preferred_name").val() != "") ? form.find(".preferred_name").val() : null,
            password : form.find(".password").val(),
            password_confirmation : form.find(".confirm_password").val(),
            date_of_birth: justResponse(form.find(".date_of_birth")),
            full_json: JSON.stringify(obj),
            phone: form.find(".phone_number").val(),
            email: form.find(".email_address").val(),
            username: (form.find(".username").val() != "") ? form.find(".username").val() : form.find(".email_address").val()
        };
        console.log(data);
    $.ajax({
        url:"/register",
        method:"POST",
        data: data,
        success:function(data){
            console.log(data);
            if (data=='checkmark'){
                blur(form,"#checkmark");
                setTimeout(function(){
                    location.reload();
                },1000)
            }else{
                unblur($("body"));
                unblur(form);                
            }
        },
        error:function(data){
            console.log(data);
            $("#Error").html(data.reponseText + "<br><div class='button cancel'>cancel</div>").css("max-height","10em");
            // form.html(data.responseText);
            unblur(form);
            blur($("body"),"#Error");
        }
    })
}
function checkLogin(){
    if ($("#LoginForm").find("#username").val()==""){
        // alertBox("required",$("#username"),"after");
        feedback('Username is required','Please enter your username.')
        return false;
    }else if ($("#LoginForm").find("#pw").val()==""){
        feedback('Password is required','Please enter your password.')
        // alertBox("required",$("#pw"),"after");
        return false;
    }else{
        return true;
    }
}
function submitLogin(){
    var login = $("#LoginForm");
    blur(login,"#loading");
    //var un = $("#username").val(), pw = $("#pw").val(), recaptcha = $("#recaptchaResponseLogin").val();
    var data = {}, inputs = login.find("input");
    inputs.each(function(i,input){
        data[$(input).attr('name')] = $(input).val();
    })
    //console.log(recaptcha);
    $.ajax({
        url:"/login",
        method:"POST",
        data:data,
        success:function(data){
            blur(login,"#checkmark");
            setTimeout(function(){
                window.location.href = "/portal/launchpad";
            },1000)
        },
        error:function(data){
            unblur()
        }
    })
}

var userNameAvailable=undefined;
// function newUser(){
//     var details = createSubmitObject($("#AddNewPatient"));
//     if (details){
//         var btn = $(this);
//         btn.addClass("disabled");
//         btn.off("click",newUser);
//         blurModal($("#NewUser"),"#loading");
        
//         var usernameItem = $("#NewUser").find(".item").filter(function(){
//             return $(this).children(".question").text().toLowerCase().includes("email");
//         }), username = usernameItem.find("input").val(), recaptchaResponse = $("#recaptchaResponseNewUser").val() ;
//         checkUserName(username);
//         var wait = setInterval(function(){
//             if (userNameAvailable!=undefined){
//                 console.log(userNameAvailable);
//                 clearInterval(wait);
//                 if (userNameAvailable === true){
//                     $.ajax({
//                         url:"/php/launchpad/patient/save-user-SELF-POST.php",
//                         method:"POST",
//                         data:{
//                             SaveOrUpdate:"save",
//                             info: JSON.stringify(details),
//                             recaptcha_response: recaptchaResponse
//                         },
//                         success:function(data){
//                             blurModal($("#NewUser"),"#checkmark");
//                             console.log(data);
//                             /*setTimeout(function(){
//                                 location.reload(true);
//                             },1000)*/
//                         },
//                         error:function(){
//                             console.log("ERROR YO");
//                         }
//                     })
//                 }else{
//                     btn.removeClass("disabled");
//                     btn.find(".lds-ring").remove();
//                     btn.on("click",newUser);
//                     $("#Error").html("<h4>Email Address Already In Use</h4><p>You can use another email, or login to your current account and customize your username. Customizing your name will allow multiple users per email.</p><div class='button xsmall cancel'>dismiss</div>");
//                     blurModal($("#NewUser"),"#Error");
//                 }
//                 userNameAvailable=undefined;
//             }
//         },50)
//     }
// }
// function checkUserName(username){
//     var check = undefined;
//     $.ajax({
//         url:"/php/checkUserName.php",
//         method:"POST",
//         data:{
//             Username:username
//         },
//         success:function(data){
//             if (data=="true"){
//                 userNameAvailable = true;
//             }else{
//                 userNameAvailable = data;
//             }
//         }
//     })
// }

// function validateEmail(){
//     var val = $(this).val(), i = $(this);
//     var m = val.match(/[^a-zA-Z0-9@._\-]/);
//     val = val.replace(/[^a-zA-Z0-9@._\-]/g,"");
//     if ($(this).val()!=val){
//         i.off("keyup",validateEmail);
//         $(this).val(val);
//         alertBox(m+" is an invalid character",$(this).closest('.answer'),"after",800);
//         setTimeout(function(){
//             i.on("keyup",validateEmail);
//         },801)
//     }
// }
// function finalizeEmail(){
//     var i = $(this), val = i.val();
//     var pattern = /[a-zA-Z0-9._\-]*@[a-zA-Z0-9._\-]*\.[a-zA-Z0-9.]*/;
//     if (!pattern.test(val)){
//         i.off("keyup",validateEmail);
//         $(this).val(val);
//         alertBox('enter a valid email',$(this).closest('.answer'),"after",800);
//         setTimeout(function(){
//             i.on("keyup",validateEmail);
//         },801)
//     }
// }
// function validatePhone(){
//     var i = $(this), val = i.val();
//     var m = val.match(/[^0-9.()-]/);
//     val = val.replace(/[^0-9.()-]/g,"");
//     if ($(this).val()!=val){
//         i.off("keyup",validatePhone);
//         $(this).val(val);
//         alertBox(m+" is an invalid character",$(this).closest('.answer'),"after",800);
//         setTimeout(function(){
//             i.on("keyup",validatePhone);
//         },801)
//     }
// }
// function finalizePhone(){
//     var i = $(this), val = i.val();
//     var digits = val.match(/\d/g);
//     if (digits.length!=10){
//         i.off("keyup",validatePhone);
//         alertBox("invalid phone number",$(this).closest('.answer'),"after",800);
//         setTimeout(function(){
//             i.on("keyup",validatePhone);
//         },801)
//     }else{
//         var ph = digits[0]+digits[1]+digits[2]+"-"+digits[3]+digits[4]+digits[5]+"-"+digits[6]+digits[7]+digits[8]+digits[9];
//         i.val(ph);
//     }
// }

