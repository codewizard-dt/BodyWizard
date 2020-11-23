<?php 
$form = App\Form::firstWhere('form_name','Recurring Appointment');
$inputs = [];
  set($inputs, 'patient_id', new_input('text',
    ['placeholder','linked_to','preLabel','labelHtmlTag','labelCss'],
    ['Patient','Patient','Patient','h2',['width'=>'100%','marginTop'=>'0.2em','color'=>'var(--purple)']]),
  'practitioner_id', new_input('text',
    ['placeholder','linked_to','preLabel','labelHtmlTag','labelCss'],
    ['Practitioner','Practitioner','Practitioner','h2',['width'=>'100%','marginTop'=>'0.2em','color'=>'var(--purple)']]),
  'services', new_input('list',
  	['linked_to','listLimit','linked_columns','preLabel','labelHtmlTag','labelCss','after_change_action','eleCss'],
  	['Service','no limit',['price','duration','settings'],'Services','h2',['width'=>'100%','marginTop'=>'0.2em','color'=>'var(--purple)'],'Appointment.update_duration',['width'=>'min-content','marginRight'=>'1em']]),
  'date', new_input('date',
  	['date_limit','preLabel','labelHtmlTag','labelCss'],
  	[1,'Date','h2',['width'=>'100%','marginTop'=>'0.2em','color'=>'var(--purple)']]),
  'time', new_input('time',
  	['date_limit','preLabel','labelHtmlTag','labelCss'],
  	[1,'Time','h2',['width'=>'100%','marginTop'=>'0.2em','color'=>'var(--purple)']]),
  'duration', new_input('number',
  	['min','max','initial','step','units','preLabel','labelHtmlTag','labelCss','after_change_action'],
  	[0,600,0,1,'minutes','Duration','h2',['width'=>'100%','marginTop'=>'0.2em','color'=>'var(--purple)'],'Answer.hold']),
);
// $linkable_lists = [];
// set($linkable_lists,'Patient', basicList('Patient'))
?>
<div id="CreateAppointment" class='central large'>
	<div class='body'>
		<h1>New Appointment</h1>
		<div class="section left">
			<div class="flexbox left">
				@include('layouts.forms.display.answer',array_merge($inputs['patient_id'],['name'=>'patient_id']))
				@include('layouts.forms.display.answer',array_merge($inputs['practitioner_id'],['name'=>'practitioner_id']))		
			</div>
			<div class="flexbox left">
				@include('layouts.forms.display.answer',array_merge($inputs['date'],['name'=>'date']))
				@include('layouts.forms.display.answer',array_merge($inputs['time'],['name'=>'time']))				
			</div>
			<div class="flexbox left">
				@include('layouts.forms.display.answer',array_merge($inputs['services'],['name'=>'services']))
				@include('layouts.forms.display.answer',array_merge($inputs['duration'],['name'=>'duration']))								
			</div>
		</div>
		<div class="section">
			<h3 class='toggle_proxy' data-initial_state='hidden' data-target_ele='RecurringAppointment'>Recurring Settings</h3>
			@include('layouts.forms.display.form',compact('form'))			
		</div>
	</div>
	<div class='options'>
		<div class='button submit create pink' data-model='Appointment'>save</div>
		<div class='button cancel'>dismiss</div>
	</div>
</div>