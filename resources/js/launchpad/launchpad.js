// $(document).ready(function () {
//     var First, Last, StrMatch, AllNames = $("#PatientList").find(".name");
        
//     $("#PatientName").focus();
    
//     function UpdatePatientList() {
//         AllNames.hide();
//         First = $("#FNameLetter").find(".active").data("letter");
//         Last = $("#LNameLetter").find(".active").data("letter");
//         if (First !=undefined){var FName = ".FName"+First;}else{var FName = ".name";}
//         if (Last!=undefined){var LName = ".LName"+Last;}else{var LName = ".name";}
//         if (StrMatch==undefined){
//             AllNames.filter(FName).filter(LName).show();
//             if (FName==LName){AllNames.hide()}
//         }else{
//             StrMatch.filter(FName).filter(LName).show();
//         }
//         $("#PatientList").show();
//         $(".name.active").show();
//         if ($(".name:visible").length==0){
//             $("#PatientList").find("#empty").show().text("No matches");
//         }else{
//             $("#empty").hide().text('');
//         }
//     }
//     function UpdateFiltersList() {
//         First = $("#FNameLetter").find(".active").data("letter");
//         Last = $("#LNameLetter").find(".active").data("letter");
//         var String = $("#PatientName").val();
//         if (First != undefined){
//             $("#FLetterFilter").fadeIn().text("First Name starts with \""+First+"\"");
//         }
//         else{
//             //$("#FLetterFilter").text("");
//             $("#FLetterFilter").hide().text("");
//         }
//         if (Last != undefined){
//             $("#LLetterFilter").fadeIn().text("Last Name starts with \""+Last+"\"");
//         }
//         else{
//             $("#LLetterFilter").hide().text("");
//         }
//         if (String != ""){
//             $("#TextFilter").fadeIn().text("Name contains \""+String+"\"");
//         }
//         else{
//             $("#TextFilter").hide().text("");
//         }
//     }
      
//     $('#Letters').on("click", "li", function(){
//         var AllAnchors = $(this).closest("ul").find("li");
        
//         if ($(this).hasClass("active")){
//             AllAnchors.removeClass("active");
//         }else {
//             AllAnchors.removeClass("active");
//             $(this).addClass("active");
//         }
//         UpdatePatientList();
//         UpdateFiltersList();
//     });

//     $("#PatientName").on("keyup", function(){
//         var searchStr = $(this).val().trim().toLowerCase();
//         if (searchStr==""){StrMatch=undefined}
//         else {StrMatch = $('#PatientList').find('li[data-fullname*="'+searchStr+'"]');}
//         UpdatePatientList();
//         UpdateFiltersList();
//     });
//     $("#PatientList").on("click", "li", function(){
//         var FirstName = $(this).data("fname");
//         var LastName = $(this).data("lname");
//         var FullName= FirstName+" "+LastName;
//         var PatientID = $(this).data("id");
//         $("#FName").val(FirstName);
//         $("#LName").val(LastName);
//         if ($(this).hasClass("active")){
//             $(this).removeClass("active");
//             $("#FName, #LName").val("");
//             $('#demographics').html("");
//         }else{
//             $("#PatientList").find("li").removeClass("active");
//             $(this).addClass("active");
//             $("#demographics").html("Loading patient info<span>.</span>");
//             var dots;
//             var count = setInterval(function(){
//                 var dots = $("#demographics").find("span").text();
//                 if (dots=="..."){$("#demographics").find('span').text(".");}
//                 else if (dots=="."){$("#demographics").find('span').text("..");}
//                 else if (dots==".."){$("#demographics").find('span').text("...");}
//             },500);
//             $.post("/php/loadPatientInfo.php", {ID: PatientID},function(data){
//                 $("#demographics").html(data);
//                 clearInterval(count);
//             })
//         }
//         $(".FormLink").removeClass("active");
//     });
//     $("#PatientList").on("click",".clear",function(){
//         var type = $(this).data("filter");
//         if (type=="text"){$("#PatientName").val("");$("#PatientName").keyup();}
//         else if (type=="fletter"){$("#FNameLetter").find(".active").click();}
//         else if (type=="lletter"){$("#LNameLetter").find(".active").click();}
//         UpdatePatientList();
//         UpdateFiltersList();
//     })
        
//     $(".FormLink, .ReportLink").filter("[data-link='']").addClass("inactive");
//     $(".FormLink, .ReportLink").on("click", function(){
//         var links = $(".FormLink, .ReportLink");
//         if ($(this).hasClass("inactive")){return false;}
//         if ($('#FName').val()==""){
//             alertBox("select a patient first",$(this));
//             return false;
//         }
//         links.removeClass('active');
//         $(this).addClass('active');
//         var thelink = $(this).data("link"), theform = $(this).data("form"), formName = $(this).data("formname"), formInfo = $(this).data("info"), newtext = "<span>" + formName + ":</span>"+formInfo;
//         $("#LinkSelect").attr("action", thelink);
//         $("#formName").val(theform);
//         $('.importantFormInfo.launchpad').html(newtext);
//     });
    
//     $("#AddPatient").on("click",".submit",function(){
//         var FName, LName, Email;
//         FName = $("#AddFName").val();
//         LName = $("#AddLName").val();
//         Email = $("#Email").val();
//         $("#AddPatient").html("Adding new patient<span>.</span>");
//         var dots;
//         var count = setInterval(function(){
//             var dots = $("#AddPatient").find("span").text();
//             if (dots=="..."){$("#AddPatient").find('span').text(".");}
//             else if (dots=="."){$("#AddPatient").find('span').text("..");}
//             else if (dots==".."){$("#AddPatient").find('span').text("...");}
//         },500);
//         $.post("/php/addPatient.php", {AddFName: FName, AddLName: LName, Email: Email}, function(data){
//             $("#AddPatient").html(data);
//             clearInterval(count);
//         })
//         //$("#AddPatient").load("/php/addPatient.php");

//     })
    
// });