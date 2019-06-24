$(document).ready(function(){
    var timeframeDropDowns = $("select").filter("[name='Length'], [name*='interval'], [name*='duration']");
    var timeOptions = timeframeDropDowns.find("option");
    timeOptions.each(function(){
        var val = $(this).val();
        val = val.split(".");
        var num = val[0];
        val = val.join(" ");
        if (num!="1"){val = val+"s";}
        else if (num=="1" && $(this).parent().attr("name")=="Services.interval"){val = "week"}
        $(this).data("weeks",num);
        $(this).text(val);
    })
    
    var InlineItems = $(".item").filter("[data-inline='true']");
    InlineItems.css({"display":"inline-block"});
    var FollowUpItems = $(".item").filter("[data-followup='followup']");
    FollowUpItems.hide();
    var firstServiceFollowUp = $(".item").filter("[data-name*='Services.']").first();
    firstServiceFollowUp.css("padding-right","15px");
        
    var PatternFollowUpItems = $(".item").filter("[data-name*='PatternDx.']");
    var IndentedItems = firstServiceFollowUp.add(PatternFollowUpItems);
    IndentedItems.css({
        "marginLeft":"10%",
        "maxWidth":"70%"
    });
    
    var AllFollowUpItems = $(".item").filter("[data-followup='followup']");
    AllFollowUpItems.css({
        "fontSize":"0.85em"
    })
    
    var a = $("select").filter("[name='Length']");
    var PlanLengthStr="1.week";
    var NumWeeks="1", numA=1, numB=1, numC=1;
    var b = $("select").filter("[name='Services.duration']");
    var c = $("select").filter("[name='Services.interval']");
    a.on("change",function(){
        PlanLengthStr = a.val();
        NumWeeks = PlanLengthStr.split(".")[0];
        b.find("option").removeAttr("selected");
        b.val(PlanLengthStr);
    })
    b.on("change",function(){
        PlanLengthStr = a.val();
        NumWeeks = PlanLengthStr.split(".")[0];
        numA = parseInt(NumWeeks);
        numB = parseInt($(this).val().split(".")[0]);
        if (numB>numA){
            alertBox("<span style='font-size:1.3em;'>Cannot be longer than treatment plan<br><span id='setPlan'>(set plan to "+numB+" weeks)</span></span>",b,"above","2000","0,-40px");
            b.find("option").removeAttr("selected");
            b.val(PlanLengthStr);
        }
    })
    c.on("change",function(){
        PlanLengthStr = a.val();
        NumWeeks = PlanLengthStr.split(".")[0];
        numA = parseInt(NumWeeks);
        numC = parseInt($(this).val().split(".")[0]);
        if (numC>numA){
            alertBox("<span style='font-size:1.3em;'>Cannot be longer than treatment plan</span>",c,"above","fade");
            c.find("option").removeAttr("selected");
            c.val(PlanLengthStr);
        }
    })
    
    $(".section").on("click","#setPlan",function(){
        var str = numB+".week";
        a.val(str);
        b.val(str);
    })
    
    var NeedButtons = new Array();
    NeedButtons.push("Services");
    NeedButtons.push("PatternDx");
    for (x=0;x<NeedButtons.length;x++){
        var str = NeedButtons[x], dispStr;
        if (str=="Services"){dispStr="service"}
        else if (str=="PatternDx"){dispStr="pattern"}
        
        $(".gather").find(".item").filter("[data-name*='"+str+"']").last().after("<div data-condition='all' data-section='"+str+"' data-followup='followup' data-section='"+str+".btn' style='max-width:20%;margin:0 0 2em 10%;' class='button xsmall add'>add "+dispStr+" to plan</div><div class='list' data-section='"+str+"' style='margin: 0 0 2em 10%;'></div>");
    }
    
    var Services = new Array, PatternDx = new Array;
    
    $(".button.add").on("click",function(){
        var section = $(this).data('section'), subItemNameArray = new Array;
        var data = $("input, select").filter("[name*='"+section+"']");
        var mainItem = $('.item').filter("[data-name='"+section+"']");
        var button = $(this), ok = true;
        
        if (mainItem.data("conditional")=='y'){
            var condition = mainItem.children('.answer').find('.active').data('value');
            var conditional = true;
        }
        else{
            var conditional = false;
        }
        
        var dataArray = new Array;
        data.each(function(){
            var subItem = $(this).closest(".item");
            var subCondition = subItem.data('condition');
            var subName = $(this).attr('name').split(".")[1];
            if (subName==undefined){subName=$(this).attr('name');}
            
            if (subItem.is(":visible") && $(this).val()==""){
                var q = subItem.find(".question").text();
                alertBox("Select "+q,button,"above","800","x:-50px,y:0");
                ok = false;
                return false;
            }

            if (conditional==false){
                subItemNameArray.push(subName) ;
                dataArray.push($(this).val());
            }
            else{
                if (subCondition==condition || subCondition=='all' || subItem.is(mainItem)){
                    subItemNameArray.push(subName) ;
                    dataArray.push($(this).val());                
                }
            }
        })
        
        if (ok==false){
            return false;
        }
        
        var Obj = {};
        for (x=0;x<dataArray.length;x++){
            var subName = subItemNameArray[x], subData = dataArray[x];
            Obj[subName] = subData;
        }
        
        if (section=="Services"){
            Services.push(Obj);
        }
        else if (section =="PatternDx"){
            PatternDx.push(Obj);
        }        
        
        if (UpdatePlan()){
            var items = $(".item").filter("[data-name*='"+section+"']");
            items.find(".active").removeClass('active');
            items.filter("[data-followup='followup']").add($(this)).slideUp(800);
            items.find("li").css({
                "opacity":"1"
            })
        }
        
    })
    
    function UpdatePlan(){
        var serviceStr = '', patternStr = '';
        for (x=0;x<Services.length;x++){
            var service = Services[x].Services;
            var occurence = Services[x].occurences;
            var interval = Services[x].interval;
            var duration = Services[x].duration;
            serviceStr += "<div id='Services-" + x + "'>" + service + ": " + occurence + " every " + interval + " for " + duration + "<span class='clear'>(remove)</span></div>";
        }
        for (x=0;x<PatternDx.length;x++){
            var theory = PatternDx[x].PatternDx;
            if (theory=="apply zang fu theory"){
                var pattern = PatternDx[x].patternZF;
                var organs = PatternDx[x].organs;
                var depth = PatternDx[x].depth;
                patternStr += "<div id='PatternDx-" + x + "'>ZangFu " + depth + ": " + pattern + " affecting " + organs + "<span class='clear'>(remove)</span></div>";
            }
            else if (theory=="apply channel theory"){
                var pattern = PatternDx[x].patternCH;
                var channels = PatternDx[x].channels;
                var depth = PatternDx[x].depth;
                patternStr += "<div id='PatternDx-" + x + "'>Channel " + depth + ": " + pattern + " affecting " + channels + "<span class='clear'>(remove)</span></div>";
            }
        }
        
        serviceStr = serviceStr.split(".").join(" ")
            .split("week").join("weeks")
            .split("1 weeks").join("1 week")
            .split("every 1").join("every") ;
        $('.list').filter("[data-section='Services']").html(serviceStr);
        $('.list').filter("[data-section='PatternDx']").html(patternStr);
        
        if (CheckPlan()){
            return true;
        }
    }
    
    function CheckPlan(){
        var length = $('select').filter("[name='Length']").val().split(".")[0] ;
        var prescribedArray = [];
        var countingArray = [];
        var check = true;
        
        length = parseInt(length);

        $(Services).each(function(i,service){
            var x = service.Services;
            var d = service.duration;
            d = d.split(".")[0];
            d = parseInt(d);
                        
            if ($.inArray(x,prescribedArray) == -1){
                prescribedArray.push(x);
                var obj = {name:x,duration:d};
                countingArray.push(obj);
            } 
            else {
                var k = $.inArray(x,prescribedArray);
                countingArray[k].duration = countingArray[k].duration + d;
                if (countingArray[k].duration > length){
                    var btn = $(".button.add").filter("[data-section='Services']");
                    removeFromPlan("Services",i);
                    alertBox("Adding this would extend " + x + " services past " + length + " weeks",btn,"after","3000","0,-10em");
                    check = false;
                    return false;
                }
            }
        })
                
        if (check==false){
            return false;
        }
        
        return true;
    }

    $(".summary").hide();
    
    $(".button.save").on("click",function(){
        displayPlan();
    })
    
    function displayPlan(){
        var startDate = $("#StartDate").val();
        var length = $("select").filter("[name='Length']").val();
        var ServLength = Services.length;
        var PattLength = PatternDx.length;
        var MedDx = $("#RelatedMedDx").val();
        var target = $(".section.summary");
        target.slideDown(1200);
    }

    
    var serviceLIs = $('.item').filter("[data-name='Services']").find("li");
    var patternLIs = $('.item').filter("[data-name='PatternDx']").find("li");
    serviceLIs.on("click",blurOthers);
    patternLIs.on("click",blurOthers);
                  
    function blurOthers(){
        $(this).parent().find("li").css({
            "opacity":"1",
        });
        $(this).parent().find("li").not($(this)).css({
            "opacity":"0.5"
        });
    }
    
    $(".section").on("click",".clear",function(){
        var id = $(this).parent().attr("id").split("-");
        var section = id[0];
        var key = id[1];
        removeFromPlan(section,key);
    })
    
    function removeFromPlan(section,key){
        if (section=="Services"){Services.splice(key,1);}
        else if (section=="PatternDx"){PatternDx.splice(key,1);}
        UpdatePlan();
    }
    
})