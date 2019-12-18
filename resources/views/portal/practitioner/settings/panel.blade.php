<?php 
use App\Form;
$options = ['Display Settings','Calendar Settings','ID*SettingType'];
$ctrl = new Form;
?>
<h1 class='purple'>Settings Panel</h1>
{{$ctrl->answerDisp('radio',$options)}}