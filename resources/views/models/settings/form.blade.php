<?php 
$form = App\Form::firstWhere('form_name','like','Form Settings');
$is_proxy = ($instance->id == 'proxy');
$mode = 'display';
?>
@if ($instance->is_system)
	<h2>Showing Settings for System forms only</h2>
@endif
@if (!$is_proxy)
	<div id="DisplayOptions" class='section central full'>
		<h2 class='toggle_proxy' data-target_ele='{{toKeyString($instance->name)}}' data-arrow_position='below' data-initial_state='hidden'>Display + Formatting Options</h2>
		@include('layouts.forms.display.form',[
			'form' => $instance,
			'mode' => 'settings'
		])		
	</div>
@endif
@if (!$instance->is_system)
	@include('layouts.forms.display.form',compact('form','mode'))
@endif