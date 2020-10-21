
// $(document).ready(function(){
//     masterStyle();
//     // $(".submitForm").off("click",submitForm);
    
//     var login = $("#LoginForm");
//     login.on("keyup",function(e){
//         var k = e.keyCode;
//         if (k==13){
//             login.find("input").blur();
//             login.find(".submit").click();
//         }
//     })
//     // login.find(".submit").on('click',function(){
//     //     if (checkLogin(login)){
//     //         submitLogin();
//     //     }
//     // })

//     // $("#NewUser").load("/register",function(){
//     //     var emailItems = $("#NewUser").find(".item").filter(function(){
//     //         return $(this).children(".question").text().toLowerCase().includes("email");
//     //     });
//     //     emailItems.find("input").on("keyup",validateEmail);

//     //     var phoneItems = $("#NewUser").find(".item").filter(function(){
//     //         return $(this).children(".question").text().toLowerCase().includes("phone");
//     //     });
//     //     phoneItems.find("input").on("keyup",validatePhone);

//     //     var username = $("#NewUser").find("#username");
//     //     username.on("keyup",validateUsername);

//     //     var passwordItems = $("#NewUser").find(".item").filter(function(){
//     //         return $(this).children(".question").text().toLowerCase().includes("password");
//     //     });
//     //     passwordItems.find("input").attr("type","password");
//     //     $("#NewUser").find(".submitForm").on("click",submitRegistration);
//     // })


// })

// function submitRegistration(){
//     var obj = forms.retrieve($("#NewUser")), form = $("#NewUser"), u = form.find("#username"), e = form.find("#email_address"), p = form.find("#phone_number");
//     if (!obj){return false;}
//     if (finalizePhone(p) && finalizeEmail(e) && finalizeUsername(u)){
//         blur(form,"#loading");
//     }else{
//         return false;
//     }
//     var data = {
//             username : form.find(".email_address").val(),
//             first_name : form.find(".first_name").val(),
//             middle_name : (form.find(".middle_name").val() != "") ? form.find(".middle_name").val() : null,
//             last_name : form.find(".last_name").val(),
//             preferred_name : (form.find(".preferred_name").val() != "") ? form.find(".preferred_name").val() : null,
//             password : form.find(".password").val(),
//             password_confirmation : form.find(".confirm_password").val(),
//             date_of_birth: justResponse(form.find(".date_of_birth")),
//             full_json: JSON.stringify(obj),
//             phone: form.find(".phone_number").val(),
//             email: form.find(".email_address").val(),
//             username: (form.find(".username").val() != "") ? form.find(".username").val() : form.find(".email_address").val()
//         };
//         console.log(data);
//     $.ajax({
//         url:"/register",
//         method:"POST",
//         data: data,
//         success:function(data){
//             console.log(data);
//             if (data=='checkmark'){
//                 blur(form,"#checkmark");
//                 setTimeout(function(){
//                     location.reload();
//                 },1000)
//             }else{
//                 unblur($("body"));
//                 unblur(form);                
//             }
//         },
//         error:function(data){
//             console.log(data);
//             $("#Error").html(data.reponseText + "<br><div class='button cancel'>cancel</div>").css("max-height","10em");
//             // form.html(data.responseText);
//             unblur(form);
//             blur($("body"),"#Error");
//         }
//     })
// }
// function checkLogin(){
//     if ($("#LoginForm").find("#username").val()==""){
//         // alertBox("required",$("#username"),"after");
//         feedback('Username is required','Please enter your username.')
//         return false;
//     }else if ($("#LoginForm").find("#pw").val()==""){
//         feedback('Password is required','Please enter your password.')
//         // alertBox("required",$("#pw"),"after");
//         return false;
//     }else{
//         return true;
//     }
// }
// function submitLogin(){
//     var login = $("#LoginForm");
//     blur(login,"#loading");
//     //var un = $("#username").val(), pw = $("#pw").val(), recaptcha = $("#recaptchaResponseLogin").val();
//     var data = {}, inputs = login.find("input");
//     inputs.each(function(i,input){
//         data[$(input).attr('name')] = $(input).val();
//     })
//     //console.log(recaptcha);
//     $.ajax({
//         url:"/login",
//         method:"POST",
//         data:data,
//         success:function(data){
//             blur(login,"#checkmark");
//             setTimeout(function(){
//                 window.location.href = "/portal/launchpad";
//             },1000)
//         },
//         error:function(data){
//             unblur()
//         }
//     })
// }

// var userNameAvailable=undefined;
