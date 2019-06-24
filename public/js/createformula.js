$(document).ready(function () {
    var Action, ActionHerbs, Symptom, SymptomHerbs, Category, CategoryHerbs, NameMatch, searchStr, StrMatchName, StrMatchAction, StrMatchSymptom, AllHerbs = $("#HerbNames").find(".herb"), AllSymptoms = $("#SymptomList").find(".symptom"), AllActions=$("#ActionList").find(".action") ;
    
    function UpdateHerbList(){
        AllHerbs.hide(); 
        Action = $("#ActionList").find(".active").data("action");
        Symptom = $("#SymptomList").find(".active").data("symptom");
        Category = $("#CategoryList").find(".active").data("category");
        NameMatch = $("#HerbNames").find(".match");

        if (Action==undefined){ActionHerbs="";}
        else {ActionHerbs='[data-actions*="'+Action+'"]'}
        if (Symptom==undefined){SymptomHerbs="";}
        else {SymptomHerbs='[data-symptoms*="'+Symptom+'"]'}
        if (Category==undefined){CategoryHerbs="";}
        else {CategoryHerbs='[data-categories*="'+Category+'"]'}
        var TripleFilter = ActionHerbs+SymptomHerbs+CategoryHerbs;
        if (ActionHerbs=="" && SymptomHerbs=="" && CategoryHerbs=="" && StrMatchName==AllHerbs){
            $("#HerbList").slideUp();
        }else {
            $("#HerbList").slideDown();
        }
        if (TripleFilter==""){NameMatch.show();}
        else if(NameMatch.length==0 && TripleFilter!=""){AllHerbs.filter(TripleFilter).show();}
        else {NameMatch.filter(TripleFilter).show();}
        var Count = $("#HerbNames").find(".herb:visible").length;
        if (Count==1){var CountStr = Count+" match";}
        else if(Count==0){
            var CountStr="no matches";
            $("#FormulaDesc").slideUp();
            $(".herb").removeClass('add');
        }
        else{var CountStr=Count+" matches";}
        $("#Count").text(CountStr);
        var name = $("#NameSearch").val();
        if (name!=""){
            $("#NameF").text("name: "+name);
            $("#NameF").show();
        }else{
            $("#NameF").hide();
        }
        if (Action!=undefined){
            $("#ActF").text("action: "+Action);
            $("#ActF").show();
        }else{
            $("#ActF").hide();
        }
        if (Category!=undefined){
            $("#CatF").text("category: "+Category);
            $("#CatF").show();
        }else{
            $("#CatF").hide();
        }
        if (Symptom!=undefined){
            $("#SympF").text("symptom: "+Symptom);
            $("#SympF").show();
        }else{
            $("#SympF").hide();
        }
        if ($("#Filters").find('span:visible').length==0){
            $("#NameF").show().text('none');
        }        
    }
    
    UpdateHerbList();
        
    $("#SymptomList, #ActionList").on("click", ".clear", function(){
        var list = $(this).data("list");
        var ListID = "#"+list+"List";
        var SearchID = "#"+list+"Search";
        $(ListID).find("li").removeClass("active");
        $(ListID).slideUp();
        $(SearchID).val("");
        UpdateHerbList();
    })
    
    $("#FormulaDesc").on("click",".clear", function(){
        $("#FormulaDesc").fadeOut(400);
        $(".herb.add").removeClass("add");
    })
    
    $("#HerbList").on("click",".clear.filters",function(){
        $("#SymptomList, #ActionList, #CategoryList").find('li').removeClass('active');
        $("#SymptomList, #ActionList").fadeOut();
        $(".herb").removeClass('match').removeClass('add');
        $("#SymptomSearch, #NameSearch, #ActionSearch").val("");
        $("#CategoryList").find("h4").html("<span>▶</span>Filter By Category")
        UpdateHerbList();
    })
    
    $("#NameSearch").on("keyup",function(){
        searchStr = $(this).val().trim().toLowerCase();
        AllHerbs.removeClass("match");
        if (searchStr==""){StrMatchName=undefined}
        else {
            StrMatchName= $("#HerbList").find('li[data-herbname*="'+searchStr+'"]');
            StrMatchName.addClass("match");
            StrMatchName= $("#HerbList").find('li[data-latin*="'+searchStr+'"]');
            StrMatchName.addClass("match");
            StrMatchName= $("#HerbList").find('li[data-common*="'+searchStr+'"]');
            StrMatchName.addClass("match");
        }
        UpdateHerbList();
    })
    $("#ActionSearch").on("keyup",function(){
        searchStr = $(this).val().trim().toLowerCase();
        if (searchStr==""){StrMatchAction=undefined}
        else {StrMatchAction = $("#ActionList").find('li[data-action*="'+searchStr+'"]');}
        if (StrMatchAction==undefined){
            $("#ActionList").hide();
            AllActions.removeClass("active").show();
        }
        else {
            AllActions.hide();
            StrMatchAction.show();
            $("#ActionList").slideDown();
        }
        UpdateHerbList();
    })
    
    $("#ActionList").on("click","li",function(){
        if ($(this).hasClass("active")){
            AllActions.removeClass("active");
        }else {
            AllActions.removeClass("active");
            AllHerbs.removeClass("active");
            $(this).addClass("active");
        }
        UpdateHerbList();        
    })
    $("#SymptomSearch").on("keyup",function(){
        searchStr = $(this).val().trim().toLowerCase();
        if (searchStr==""){StrMatchSymptom=undefined}
        else {StrMatchSymptom = $("#SymptomList").find('li[data-symptom*="'+searchStr+'"]');}
        if (StrMatchSymptom==undefined){
            $("#SymptomList").hide();
            AllSymptoms.removeClass("active").show();
        }
        else {
            AllSymptoms.hide();
            StrMatchSymptom.show();
            $("#SymptomList").slideDown();
        }
        UpdateHerbList();
    })
    $("#SymptomList").on("click","li",function(){
        var AllSymptoms = $(this).closest("ul").find("li");
        if ($(this).hasClass("active")){
            AllSymptoms.removeClass("active");
        }else {
            AllSymptoms.removeClass("active");
            AllHerbs.removeClass("active");
            $(this).addClass("active");
        }
        UpdateHerbList();        
    })

    $("#CategoryList").on("click","li",function(){
        var AllCategories = $(this).closest("ul").find("li"), NewCat = $(this).data('category');
        if ($(this).hasClass("active")){
            AllCategories.removeClass("active");
        }else {
            AllCategories.removeClass("active");
            AllHerbs.removeClass("active");
            $(this).addClass("active");
        }
        $("#CategoryList").find("h4").html("<span>▶</span>Filter By Category: "+NewCat);
        $("#CategoryList").find(".target").slideUp();
        $.scrollTo("#HerbList");
        UpdateHerbList();
    })

    $("#HerbNames").on("click","li",function(){
        var Actions = $(this).data("actions").split(",");
        var ActLen = Actions.length;
        var Symptoms = $(this).data("symptoms").split(",");
        var SymLen= Symptoms.length;
        var ActiveHerb = $(this).data("herbname");
        var Common = $(this).data("common");
        var Latin = $(this).data("latin");
        var i,li;
        $(this).toggleClass("add");
        if ($(this).hasClass("add")){
            $('.herb.add').removeClass('add');
            $(this).addClass('add');
            $("#FormulaDesc").find('li').remove();

            for (i=0;i<ActLen;i++){
                if (Actions[i]=="No actions added yet"){
                    li='<li class="action inactive" data-action="'+Actions[i].trim()+'">'+Actions[i].trim()+'</li>';
                }else{li = '<li class="action" data-action="'+Actions[i].trim()+'">'+Actions[i].trim()+'</li>';}
                
                $("#Actions").find('ul').append($(li));
            }
            for (i=0;i<SymLen;i++){
                if (Symptoms[i]=="No symptoms added yet"){
                    li = '<li class="symptom inactive" data-symptom="'+Symptoms[i].trim()+'">'+Symptoms[i].trim()+'</li>';
                }else{li = '<li class="symptom" data-symptom="'+Symptoms[i].trim()+'">'+Symptoms[i].trim()+'</li>';}
                
                $("#Symptoms").find('ul').append($(li));
            }
            $("#FormulaDesc").fadeIn(400);            
        } else {
            $("#FormulaDesc").fadeOut(400);
        }
        
    })
    
    var ActiveSymptoms= new Array, ActiveActions= new Array;
        
    $("#FormulaDesc").on("click","#addToFormula",function(){
        var NewHerb, ActivePinYin, AddNode, AddSymp, AddAction, ActiveHerbs = $(".HerbName"), skip;
        ActivePinYin=$(".herb.add").data('herbname').toLowerCase();
//        ActiveHerbs.each(function(i,herb){
  //          var herbname = $(herb).val()
    //        if (ActivePinYin==herbname){
      //          skip="yes";
        //        alertBox("herb already in formula",$("#addToFormula"));
          //  }else{skip="no";}
//        })
  //      if (skip=="yes"){
    //        return false;
      //  }
        if (checkHerb(ActivePinYin)){
            AddNode=$('<div class="ActiveHerb"><h4 class="inline hideTarget"></h4><input type="text" class="HerbName" name="herbs[]" hidden><span>amount (g): <input class="Amount" name="amounts[]" type="number" min="0"></span><span class="removeHerb">❌</span><span class="TotalG"></span><br><div class="HerbData target">Symptoms<ul class="ActiveSymptoms"></ul><input type="text" class="AddNewSymp" placeholder="Type in symptom"><div class="button xsmall AddNewSymp">add new</div><br>Actions<ul class="ActiveActions"></ul><input type="text" class="AddNewAct" placeholder="Type in action"><div class="button xsmall AddNewAct">add new</div></div></div>');
            AddNode.clone().insertBefore("#TotalG");
            NewHerb=$("#CurrentFormula").find(".ActiveHerb").last();
            NewHerb.find("input.HerbName").val(ActivePinYin);
            NewHerb.find("h4").html('<span class="down"></span>'+ActivePinYin);
            ActiveActions=$("#Actions").find("li").clone();
            ActiveSymptoms=$("#Symptoms").find("li").clone();
            NewHerb.find(".ActiveActions").append(ActiveActions);
            NewHerb.find(".ActiveSymptoms").append(ActiveSymptoms);
            CheckMark($("#addToFormula"),"fade");            
        }else{
            alertBox("herb already in formula",$("#addToFormula"));
        }
        var NumHerbs = $('.ActiveHerb').length;
        $('#HerbDesc').text(NumHerbs+" herbs in formula");
    })
    
    $("#CurrentFormula").on("keyup",".Amount",function(){
        var total=0, Amounts = $('.Amount');
        if ($(this).val()!==""){
            Amounts.each(function(i,Amount){
                total+=Number($(Amount).val());
            })
            var current = $(this).closest(".ActiveHerb").find(".TotalG");
            current.text(total+" g total").show();
            setTimeout(function(){
                current.fadeOut();
            },3000);            
        }
        $("#TotalG").text(total+" g total");
    })
                
    $("#CurrentFormula").on("click",".hideTarget",function(){
        var target = $(this).parent().find(".target");
        var span = $(this).find('span');
        if (target.is(":visible")){span.text("▶");}
        else {span.text("▼");}            
        target.fadeToggle(400);
    })
    
    
    $("#CurrentFormula").on("click","li",function(){
        if ($(this).hasClass('inactive')){
            var target = $(this);
            alertBox("Add new items using textbox",target);
        }else {$(this).toggleClass("active");}
        
    })  
    
    $('#CurrentFormula').on("click",".button.AddNewSymp",function(){
        var NewSymp = $(this).closest(".ActiveHerb").find("input.AddNewSymp").val().toLowerCase().trim(), inputBox = $(this).closest(".ActiveHerb").find("input.AddNewSymp");
        if (NewSymp==""){
            alertBox("type in a symptom",inputBox);
        }else{
            $(this).closest(".ActiveHerb").find(".ActiveSymptoms").append('<li class="new symptom active" data-symptom="'+NewSymp+'">'+NewSymp+'</li>');
            $(this).closest(".ActiveHerb").find("input.AddNewSymp").val("").focus();            
        }
    })

    $('#CurrentFormula').on("click",".button.AddNewAct",function(){
        var NewAct = $(this).closest(".ActiveHerb").find("input.AddNewAct").val().toLowerCase().trim(), inputBox = $(this).closest(".ActiveHerb").find("input.AddNewAct");
        if (NewAct==""){
            alertBox("type in a symptom",inputBox);
        }else{
            $(this).closest(".ActiveHerb").find(".ActiveActions").append('<li class="new action active" data-action="'+NewAct+'">'+NewAct+'</li>');
            $(this).closest(".ActiveHerb").find("input.AddNewAct").val("").focus();
        }
    })
    
    $("#CurrentFormula").on("click",".removeHerb",function(){
        $(this).closest(".ActiveHerb").remove();
        var NumHerbs = $('.ActiveHerb').length;
        $('#HerbDesc').text(NumHerbs+" herbs in formula");
    })
        
    $("#PrevFormulas").on("click","tr[data-herbname]", function(){
        $(this).toggleClass("active");
        var Formula = $(this).closest(".FormulaDisplay");
        var HerbRows = Formula.find("tr[data-herbname]"), Button = Formula.find(".AddPrevHerbs");
        HerbRows.each(function(){
            if ($(this).hasClass("active")){
                var c = $(this).find("td").last()
                CheckMark(c);
            }else{
                $(this).find(".zerowrap, .checkmark").remove();
            }
        })
        if (HerbRows.filter(".active").length>0){
            Button.removeClass("gray");
            Button.addClass("green");
        }else{
            Button.addClass("gray");
            Button.removeClass("green");            
        }
    })
    
    function checkHerb(HerbName){
        var ActiveHerbs = $("#CurrentFormula").find("input.HerbName"), HerbCount = ActiveHerbs.length;
        for (x=0;x<HerbCount;x++){
            var checkName = $(ActiveHerbs[x]).val();
            if (checkName==HerbName){
                return false;
            }
        }
        return true;
    }
    
    $(".AddPrevFormula").on("click",function(){
        var Formula = $(this).closest('.FormulaDisplay');
        var HerbRows = Formula.find("tr[data-herbname]"), HerbName, ActiveHerb, NewHerb, ActivePinYin, AddNode, AddSymp, AddAction, ActiveHerbs = $(".HerbName"), skip;
        HerbRows.each(function(i,row){
            HerbName = $(row).data("herbname");
            ActiveHerb=$(".herb").filter('[data-herbname="'+HerbName+'"]');
            
            if (checkHerb(HerbName)){
                AddNode=$('<div class="ActiveHerb"><h4 class="inline hideTarget"></h4><input type="text" class="HerbName" name="herbs[]" hidden><span>amount (g): <input class="Amount" name="amounts[]" type="number" min="0"></span><span class="removeHerb">❌</span><span class="TotalG"></span><br><div class="HerbData target">Symptoms<ul class="ActiveSymptoms"></ul><input type="text" class="AddNewSymp" placeholder="Type in symptom"><div class="button xsmall AddNewSymp">add new</div><br>Actions<ul class="ActiveActions"></ul><input type="text" class="AddNewAct" placeholder="Type in action"><div class="button xsmall AddNewAct">add new</div></div></div>');
                AddNode.clone().insertBefore("#TotalG");
                NewHerb=$("#CurrentFormula").find(".ActiveHerb").last();
                NewHerb.find("input.HerbName").val(HerbName);
                NewHerb.find("h4").html('<span>▼</span>'+HerbName);

                var Actions = ActiveHerb.data("actions").split(","), ActLen = Actions.length, Symptoms = ActiveHerb.data("symptoms").split(","), SymLen= Symptoms.length;
                var NewActions = $(row).data("actions").split(", "), NewSymptoms = $(row).data("symptoms").split(", ");

                for (i=0;i<ActLen;i++){
                    if (Actions[i]=="No actions added yet"){
                        li='<li class="action inactive" data-action="'+Actions[i].trim()+'">'+Actions[i].trim()+'</li>';
                    }else{li = '<li class="action" data-action="'+Actions[i].trim()+'">'+Actions[i].trim()+'</li>';}
                    NewHerb.find('ul.ActiveActions').append($(li));
                }
                for (i=0;i<SymLen;i++){
                    if (Symptoms[i]=="No symptoms added yet"){
                        li = '<li class="symptom inactive" data-symptom="'+Symptoms[i].trim()+'">'+Symptoms[i].trim()+'</li>';
                    }else{li = '<li class="symptom" data-symptom="'+Symptoms[i].trim()+'">'+Symptoms[i].trim()+'</li>';}
                    NewHerb.find('ul.ActiveSymptoms').append($(li));
                }          

                for (i=0;i<NewActions.length;i++){
                    NewHerb.find(".ActiveActions").find("li").filter('[data-action="'+NewActions[i]+'"]').addClass("active");
                }
                for (i=0;i<NewSymptoms.length;i++){
                    NewHerb.find(".ActiveSymptoms").find("li").filter('[data-symptom="'+NewSymptoms[i]+'"]').addClass("active");
                }

                CheckMark($(row).find("td").last(),"fade");
            }else{
                alertBox("already in formula",$(row),"ontop");
            }
            var NumHerbs = $('.ActiveHerb').length;
            $('#HerbDesc').text(NumHerbs+" herbs in formula");
        })
        CheckMark(Formula.find(".AddPrevFormula"),"fade");
    })
    
    $(".AddPrevHerbs").on("click",function(){
        var Formula = $(this).closest('.FormulaDisplay');
        var HerbRows = Formula.find("tr[data-herbname].active"), HerbName, ActiveHerb, NewHerb, ActivePinYin, AddNode, AddSymp, AddAction, ActiveHerbs = $(".HerbName");
        HerbRows.each(function(i,row){
            HerbName = $(row).data("herbname");
            ActiveHerb=$(".herb").filter('[data-herbname="'+HerbName+'"]');
            
            if (checkHerb(HerbName)){
                AddNode=$('<div class="ActiveHerb"><h4 class="inline hideTarget"></h4><input type="text" class="HerbName" name="herbs[]" hidden><span>amount (g): <input class="Amount" name="amounts[]" type="number" min="0"></span><span class="removeHerb">❌</span><span class="TotalG"></span><br><div class="HerbData target">Symptoms<ul class="ActiveSymptoms"></ul><input type="text" class="AddNewSymp" placeholder="Type in symptom"><div class="button xsmall AddNewSymp">add new</div><br>Actions<ul class="ActiveActions"></ul><input type="text" class="AddNewAct" placeholder="Type in action"><div class="button xsmall AddNewAct">add new</div></div></div>');
                AddNode.clone().insertBefore("#TotalG");
                NewHerb=$("#CurrentFormula").find(".ActiveHerb").last();
                NewHerb.find("input.HerbName").val(HerbName);
                NewHerb.find("h4").html('<span>▼</span>'+HerbName);

                var Actions = ActiveHerb.data("actions").split(","), ActLen = Actions.length, Symptoms = ActiveHerb.data("symptoms").split(","), SymLen= Symptoms.length;
                var NewActions = $(row).data("actions").split(", "), NewSymptoms = $(row).data("symptoms").split(", ");

                for (i=0;i<ActLen;i++){
                    if (Actions[i]=="No actions added yet"){
                        li='<li class="action inactive" data-action="'+Actions[i].trim()+'">'+Actions[i].trim()+'</li>';
                    }else{li = '<li class="action" data-action="'+Actions[i].trim()+'">'+Actions[i].trim()+'</li>';}
                    NewHerb.find('ul.ActiveActions').append($(li));
                }
                for (i=0;i<SymLen;i++){
                    if (Symptoms[i]=="No symptoms added yet"){
                        li = '<li class="symptom inactive" data-symptom="'+Symptoms[i].trim()+'">'+Symptoms[i].trim()+'</li>';
                    }else{li = '<li class="symptom" data-symptom="'+Symptoms[i].trim()+'">'+Symptoms[i].trim()+'</li>';}
                    NewHerb.find('ul.ActiveSymptoms').append($(li));
                }          

                for (i=0;i<NewActions.length;i++){
                    NewHerb.find(".ActiveActions").find("li").filter('[data-action="'+NewActions[i]+'"]').addClass("active");
                }
                for (i=0;i<NewSymptoms.length;i++){
                    NewHerb.find(".ActiveSymptoms").find("li").filter('[data-symptom="'+NewSymptoms[i]+'"]').addClass("active");
                }

                CheckMark($(row).find("td").last(),"fade");
            }else{
                alertBox("already in formula",$(row),"ontop");
            }
            var NumHerbs = $('.ActiveHerb').length;
            $('#HerbDesc').text(NumHerbs+" herbs in formula");
        })
        CheckMark(Formula.find(".AddPrevHerbs"),"fade");
    })
    
    $("#SubmitFormula").on("click",function(){
        if ( CheckInputs() && CheckAttr() ){
            UpdateAttr();
            $("#FormulaList").submit();
        }
    })
    
    $("#AddHerb").on("click",function(){
        $("#NewHerb").slideDown();
    })
    
    function CheckAttr(){
        var herbs = $(".ActiveHerb"), NumSymp, NumAct, check;
        herbs.each(function(index,herb){
            NumSymp = $(herb).find('.symptom.active').length;
            NumAct= $(herb).find('.action.active').length;
            if (NumSymp==0){
                $(herb).find(".HerbData").show();
                $.scrollTo(herb);
                var target = $(herb).find(".ActiveSymptoms").find("li").last();
                alertBox("select at least one symptom",target);
                $(herb).css("border-color","rgb(200,200,200)");
                $(herb).find(".ActiveSymptoms").css("background-color","rgb(200,200,200)");
                setTimeout(function(){
                    $(herb).css("border-color","rgba(200,200,200,0)");
                    $(herb).find(".ActiveSymptoms").css("background-color","rgb(230,230,230)");                    
                },2000)
                check = 'fail';
                return false;
            }else if (NumAct==0){
                $(herb).find(".HerbData").show();
                $.scrollTo(herb);
                var target = $(herb).find(".ActiveActions").find("li").last();
                alertBox("select at least one action",target);
                $(herb).find(".ActiveActions").css("background-color","rgb(200,200,200)");
                $(herb).css("border-color","rgb(200,200,200)");
                setTimeout(function(){
                    $(herb).css("border-color","rgba(200,200,200,0)");
                    $(herb).find(".ActiveActions").css("background-color","rgb(230,230,230)");
                },2000)
                check = 'fail';
                return false;
            }
        })
        if (check=='fail'){return false;}
        else{return true;}
    }
    
    function CheckInputs(){
        var herbs = $(".ActiveHerb"), check, inputList;
        inputList = $("#FormulaName, #PatternDx, #Format, #Dosage");
        
        inputList.each(function(index,inputbox){
            if ($(inputbox).val()==""){
                $.scrollTo(inputbox);
                alertBox("required",$(inputbox));
                check='fail';
                return false;
            }            
        })
        if (check=='fail'){return false;}
                
        herbs.each(function(index,herb){
            var amount = $(herb).find(".Amount");
            if ($(amount).val()==""){
                $.scrollTo(amount);
                alertBox("required",$(amount));
                check='fail';
                return false;
            }
        })
        if (check=='fail'){return false;}
        else{return true;}        
    }
    
    function UpdateAttr(){
        var herb, chkbx, symptom, action, arrayname, symptomList = $("#CurrentFormula").find(".symptom.active"), actionList = $("#CurrentFormula").find(".action.active");
        symptomList.each(function(index,li){
            herb = $(li).closest(".ActiveHerb").find(".HerbName").val();
            symptom = $(li).data('symptom');
            if ($(li).hasClass('new')){arrayname="NewSymptoms[]";}
            else {arrayname="symptoms[]";}
            chkbx = herb+'-'+symptom+'_s_<input type="checkbox" hidden value="'+herb+"-"+symptom+'" name="'+arrayname+'" checked>';
            $("#FormulaList").append(chkbx);
        })
        actionList.each(function(index,li){
            herb = $(li).closest(".ActiveHerb").find(".HerbName").val();
            action = $(li).data("action");
            if ($(li).hasClass('new')){arrayname="NewActions[]";}
            else {arrayname="actions[]";}
            chkbx = herb+'-'+action+'_a_<input type="checkbox" hidden value="'+herb+"-"+action+'" name="'+arrayname+'" checked>';
            $("#FormulaList").append(chkbx);
        })
    }
    
    $("#checkmark").hide();
    $(".close").on("click",function(){$(this).parent().fadeOut();})
    $("#NewHerb").insertBefore("#HerbSearch");    
    
    $("#NewHerb").on("click",".category",function(){
        $("#NewHerb").find(".category").removeClass("active");
        $(this).addClass("active").delay(500).parent().fadeOut();
        var category = $(this).data('category');
        $("#CategoryDisplay").text(category);
        $('input[name="category"]').val(category);
    })
    
    $("#SubmitHerb").on("click",function(){
        var pinyin = $("#pinyin").val(), common = $("#common").val(), latin=$("#latin").val(), category=$("#category").val();
        if (pinyin==""){
            alertBox("Pinyin name is required",$("#pinyin"));
            return false;
        }else if (common==""){
            alertBox("Common name is required",$("#common"));
            return false;
        }else if (latin==""){
            alertBox("Latin name is required",$("#latin"));
            return false;
        }else if (category==""){
            alertBox("Category is required",$("#CategorySelect"));
            $("#NewHerb").find('ul').slideDown();
            return false;
        }else{
            $(this).closest("form").submit();
        }
    })
    
    $("#CategorySelect").on('click',function(){
        $("#NewHerb").find('ul').slideDown();
    })
        
    $("#NameSearch").focus();
    
    checkName();
});