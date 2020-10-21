<?php 
$options = isset($options) && is_array($options) ? $options : ['empty'=>true];
?>
<div class="item" data-settings='{{json_encode($settings)}}'>
	<div class="question">{{$text}}@if($settings['required'])<div class="requireSign">*</div>@endif</div><br>
	@include("layouts.forms.display.answer", $options)
</div>