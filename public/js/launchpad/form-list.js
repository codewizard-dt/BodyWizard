$(document).ready(function(){
    var allForms = $(".form").not("#FormListHeader");
    var autoSavedForms = allForms.filter(function(){
        return $(this).data("autosaved") == "1";
    })
    
    // if ($("#formStats").data('uniqueid')!=""){
    //     $("tr").not(".head").filter(function(){
    //         return $(this).data("uid") == $("#formStats").data('uniqueid');
    //     }).addClass("active");
    // }
    // alert("hi");
    masterStyle();
               
    function formatDate(date) {

          var day = date.getDate();
          var monthIndex = date.getMonth() +1;
          var year = date.getFullYear();

          return monthIndex + "/"+ day + '/' + year;
    }
    
    // var confirmBool = undefined;
    // function confirm(target,where,offset){
    //     var str = "are you sure? this cannot be undone <span class='confirmY'>yes</span><span class='confirmN'>no</span>";
    //     confirmBox(str,target,where,"nofade",offset);
    // }
    
 
})

function filterFormList(){
    var filterObj = {};
    $(".formListFilter").filter(":checked").each(function(f,ele){
        var filter = $(ele).data('filter').split(":")[0], value = $(ele).data('filter').split(":")[1];
        if (filterObj[filter]==undefined){
            filterObj[filter] = [value];
        }else{
            filterObj[filter].push(value);
        }
    });
    var AllForms = $("#AvailFormList").find("tr").not('.head'), forms = AllForms;
    var noMatch = $("#AvailFormList").find("tr").filter(function(){
        return $(this).find(".name").text() == "No matching forms";
    });

    $(".filter").filter(function(){
        return $(this).find("input").filter(":checked").length>0;
    }).addClass("active");
    $(".filter").filter(function(){
        return $(this).find("input").filter(":checked").length==0;
    }).removeClass("active");
    
    if ($.isEmptyObject(filterObj)){
        AllForms.hide();
        noMatch.show();
        return false;
    }
    
    $.each(filterObj,function(filter,values){
        forms = forms.filter(function(){
            return $.inArray($(this).data(filter),values)>-1;
        })
    })
    AllForms.hide();
    forms.show();
    if (forms.length==0){noMatch.show();}else{noMatch.hide();}
}
