<?php 
$form = App\Form::firstWhere('form_name','like','Form Settings');
$mode = 'display';
?>
<div id="DisplayOptions" class='section central full'>
	<h2 class='toggle_proxy' data-target_ele='{{toKeyString($instance->name)}}' data-arrow_position='below' data-initial_state='hidden'>Display Settings</h2>
	@include('layouts.forms.display.form',[
		'form' => $instance,
		'mode' => 'settings'
	])		
</div>
@if (!$instance->is_system)
	@include('layouts.forms.display.form',compact('form','mode'))
@endif