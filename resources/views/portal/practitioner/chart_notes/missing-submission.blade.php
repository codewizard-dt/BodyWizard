<?php 
$activeVersion = $form->activeVersion();
?>
<h2 class="chartNoteTitle purple marginSmall topOnly hideTarget" data-target='{{$activeVersion->name_abbr}}' data-formname='{{$activeVersion->name}}' data-type='missingSubmission'><span class="arrow right"></span><span class="label">{{$activeVersion->name}}</span></h2>
<h3 class="submissionInfo pink left paddedSides paddedXSmall topOnly">*still required, not submitted by patient*</h3>
<div class="formWrap">
{{$activeVersion->formDisplay(false, false, false, false, false)}}	
</div>
