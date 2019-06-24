$(document).ready(function(){
    history.replaceState({},'Create Herbal Formula','/portal/medicalforms/createherbalformula');
    var FName=$("#FName").text(), LName=$("#LName").text(), DateStr = $("#Date").text();
    var form = $('<form action="/portal/medicalforms/formulasuccess" method="post" style="display:none;">' +
        '<input type="text" name="FName" value="' + FName + '" />' + 
        '<input type="text" name="LName" value="' + LName + '" />' +
        '<input type="text" name="Date" value="' + DateStr + '" />' +
        '</form>');
    $('#notnav').append(form);
    setTimeout(function(){
        form.submit();
    },1500);
})