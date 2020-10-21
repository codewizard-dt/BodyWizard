<?php 
$form = \App\Form::where('form_name','Add Availability / Block Time')->first();
$action = 'model.actions.schedule_save';
$responses = $instance->schedule ? json_encode($instance->schedule,true) : 'null';
$mode = 'modal';
?>
<div id="EditSchedule">
	<h1>Edit Schedule</h1>
	<div class='calendar' data-form='#ScheduleBlock'>
		<div class="schedule" data-modal='ScheduleBlock' data-model='{{$model}}' data-uid='{{$uid}}' data-db_attr='schedule' data-responses='{{$responses}}'></div>
	</div>
	<div id="ScheduleBlock" class='prompt large' style='display:none;'>
		@include('layouts.forms.display.form',compact('form','action','mode'))
	</div>
</div> 