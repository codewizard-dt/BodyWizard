<?php 
$activeVersion = $form->activeVersion();
?>
<h2 class="chartNoteTitle purple marginSmall topOnly hideTarget" data-target='{{$activeVersion->name_abbr}}' data-formname='{{$activeVersion->name}}' data-type='form'><span class="arrow right"></span><span class="label">{{$activeVersion->name}}</span></h2>
<div class="formWrap">
{{$activeVersion->formDisplay(false, false, false, false, false)}}	
</div>
