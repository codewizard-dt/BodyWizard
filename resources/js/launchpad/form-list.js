// $(document).ready(function(){
//     var allForms = $(".form").not("#FormListHeader");
//     var autoSavedForms = allForms.filter(function(){
//         return $(this).data("autosaved") == "1";
//     })
    
//     if ($("#formStats").data('uniqueid')!=""){
//         $("tr").not(".head").filter(function(){
//             return $(this).data("uid") == $("#formStats").data('uniqueid');
//         }).addClass("active");
//     }
    
//     masterStyle();
        
//     //TABLE STUFF
//     var defaultFilterOptions = {
//         "highlight":"true",
//         "separateWords":"false",
//         "wholeWords":"true"
//     };
    
//     $(".filterType").each(function(){
//         if ($(this).data('options')==undefined){
//             $(this).data('options',defaultFilterOptions);
//         }else{
//             var optObj = $(this).data('options');
//             $.each(defaultFilterOptions,function(key,value){
//                 if (optObj[key]==undefined){
//                     optObj[key] = defaultFilterOptions[key];
//                 }
//             })
//             $(this).data("options",optObj);
//         }
//     })
//     $(".tableFilter").on("change",function(){
//         table = $(this).closest(".filterType").data("target");
//         table = $(table);
//         var f = $(this).data('filter'), fT = $(".filterType").filter("[data-condition='"+f+"']");
//         if ($(this).is(":checked")){
//             slideFadeIn(fT);
//         }else{
//             slideFadeOut(fT);
//             fT.find(".tableFilter").each(function(){
//                 if ($(this).is(":checked")){$(this).click();}
//             })
//         }
//         filterTableList(table);
//     });
//     $(".tableSearch").on("keyup",function(){
//         table = $(this).closest(".filterType").data("target");
//         table = $(table);
//         filterTableList(table);
//     });
//     var table = $("#AvailFormList");
//     filterTableList(table);
//     $("#ClearTableFilters").on("click",function(){
//         $(".tableSearch").val("");
//         $(".tableFilter").each(function(){
//             if ($(this).is(":checked")){
//                 $(this).click();
//             }
//         })
//     })
//     ///TABLE STUFF END

        
//     //$("tr").hover(highlightRow,reverseHighlight);
//     $("tr").each(function(){
//         if ($(this).data("autosaved")){
//             var v = $(this).find(".versionid").html(), n = $(this).find(".name").html();
//             $(this).find(".versionid").html(v+"<span>a</span>");
//             $(this).find(".name").html(n+"<span>(autosaved)</span>");
//         }
//     })
//     var prevID = 0, trs = $("tr").not(".head");
//     trs.each(function(i, tr){
//         var id = $(tr).data("formid"), c;
//         if (i == 0){c = "a"}
//         else if (id == prevID){c = ($(trs[i-1]).hasClass("a")) ? "a" : "b";}
//         else if (id != prevID){c = ($(trs[i-1]).hasClass("a")) ? "b" : "a";}
//         $(tr).addClass(c);
//         prevID = id;
//     })
    
//     var formLoadXHR = undefined;
//     $("tr").on("click",function(){
//         if ($(this).hasClass("head")){return false;}
//         var uid = $(this).data("uid");
//         if ($("#formStats").data("uniqueid")==uid && formLoadXHR==undefined){
//             alertBox("already selected",$("#CurrentForm").find(".name"),"after","fade");
//             $(this).addClass('active');
//             return false;
//         }

//         $("tr").removeClass('active');
//         $(this).addClass("active");
//         setSessionVar({"formUID":uid});

//         blurElement($("#CurrentForm"),"#loading");
//         $.scrollTo($("#CurrentForm"),1500);
        
//         if (formLoadXHR!=undefined){
//             formLoadXHR.abort();
//         }

//         formLoadXHR = $.ajax({
//             url:"/php/launchpad/practitioner/form-option-display.php",
//             method: "POST",
//             data:{
//                 destinations : "formSettings,formPreview,formEdit,deleteForm,formNew",
//                 btnText : "settings,preview,edit,delete,create new form"
//             },
//             success: function(data){
//                 //clearInterval(count);
//                 if (data==""){console.log("EMPTY DATA")}
//                 $("#CurrentForm").html(data);
//                 $("#CurrentForm").css("max-height","10em");
//                 allowButtonFocus();
//                 formLoadXHR = undefined;
//                 checkOverflow(document.getElementById("CurrentForm"));
//             }
//         })
//         $("tr").each(reverseHighlight);
//     })
    
    

           
//     function formatDate(date) {

//           var day = date.getDate();
//           var monthIndex = date.getMonth() +1;
//           var year = date.getFullYear();

//           return monthIndex + "/"+ day + '/' + year;
//     }
    
//     var confirmBool = undefined;
//     function confirm(target,where,offset){
//         var str = "are you sure? this cannot be undone <span class='confirmY'>yes</span><span class='confirmN'>no</span>";
//         confirmBox(str,target,where,"nofade",offset);
//     }
    
 
// })

// function filterFormList(){
//     var filterObj = {};
//     $(".formListFilter").filter(":checked").each(function(f,ele){
//         var filter = $(ele).data('filter').split(":")[0], value = $(ele).data('filter').split(":")[1];
//         if (filterObj[filter]==undefined){
//             filterObj[filter] = [value];
//         }else{
//             filterObj[filter].push(value);
//         }
//     });
//     var AllForms = $("#AvailFormList").find("tr").not('.head'), forms = AllForms;
//     var noMatch = $("#AvailFormList").find("tr").filter(function(){
//         return $(this).find(".name").text() == "No matching forms";
//     });

//     $(".filterType").filter(function(){
//         return $(this).find("input").filter(":checked").length>0;
//     }).addClass("active");
//     $(".filterType").filter(function(){
//         return $(this).find("input").filter(":checked").length==0;
//     }).removeClass("active");
    
//     if ($.isEmptyObject(filterObj)){
//         AllForms.hide();
//         noMatch.show();
//         return false;
//     }
    
//     $.each(filterObj,function(filter,values){
//         forms = forms.filter(function(){
//             return $.inArray($(this).data(filter),values)>-1;
//         })
//     })
//     AllForms.hide();
//     forms.show();
//     if (forms.length==0){noMatch.show();}else{noMatch.hide();}
    
    
// }
