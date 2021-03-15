<?php 

$attrs = ['date_of_birth','first_name','middle_name','last_name','preferred_name','phone','email','address_mailing','address_billing','username'];
$initial = collect($attrs)->mapWithKeys(function($attr) use ($instance){
	return [$attr => isset($instance) ? $instance->$attr : null];
})->toArray();

?>
<div class="section">
	<h2>Personal Information</h2>
	@include('layouts.forms.display.answer',[
		'type' => 'date',
		'name' => 'date_of_birth',
		'options' => ['preLabel' => 'Date of Birth:','yearRange' => 'c-110:c+0','date_limit'=>1]
	])
	<div class="flexbox leftSided">
		@include('layouts.forms.display.answer',[
			'type' => 'text',
			'name' => 'first_name',
			'options' => ['placeholder' => 'Legal First Name']
		])
		@include('layouts.forms.display.answer',[
			'type' => 'text',
			'name' => 'middle_name',
			'options' => ['placeholder' => 'Middle Name'],
			'settings' => ['required' => false]
		])		
		@include('layouts.forms.display.answer',[
			'type' => 'text',
			'name' => 'last_name',
			'options' => ['placeholder' => 'Last Name']
		])
	</div>
	@include('layouts.forms.display.answer',[
		'type' => 'text',
		'name' => 'preferred_name',
		'options' => ['placeholder' => 'Preferred First Name'],
		'settings' => ['required' => false]
	])
</div>
<div class="section">
	<h2>Contact Information</h2>
	<div class='flexbox leftSided'>
		@include('layouts.forms.display.answer',[
			'type' => 'phone',
			'name' => 'phone',
			'options' => ['placeholder' => 'Phone Number']
		])
		@include('layouts.forms.display.answer',[
			'type' => 'email',
			'name' => 'email',
			'options' => ['placeholder' => 'Email Address']
		])
	</div>
	<div class='flexbox leftSided'>
		@include('layouts.forms.display.answer',[
			'type' => 'address',
			'name' => 'address_mailing',
			'options' => ['placeholder' => 'Mailing Address']
		])		
		@include('layouts.forms.display.answer',[
			'type' => 'address',
			'name' => 'address_billing',
			'options' => ['placeholder' => 'Billing Address (leave blank if same as Mailing Address)'],
			'settings' => ['required' => false]
		])		
	</div>
</div>
<div class="section">
	<h2>Optional Username</h2>
	<div>If username is blank, email will be used. </div>
	@include('layouts.forms.display.answer',[
		'type' => 'text',
		'name' => 'username',
		'options' => ['placeholder' => 'Username'],
		'settings' => ['required' => false]
	])			
</div>			
