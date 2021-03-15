@extends("layouts.portal")

@push('metadata')
<title>Body Wizard Patient Portal</title>
<meta name='description' content="Bringing Scientific Rigor to the Practice of Chinese Medicine">
<meta property='og:url' content="https://bodywizardmedicine.com/portal">
<meta property='og:title' content="Body Wizard Patient Portal">
<meta property='og:description' content="Bringing Scientific Rigor to the Practice of Chinese Medicine">
@endpush

@section('content')
	<?php 
	$usertype = usertype();
	?>

	@if ($usertype)
		<?php session(['usertype' => $usertype]); ?>
		@include("portal.$usertype.home")
	@else
		<div id="RoleSelector" class='flexbox' style='padding-top:40vh;align-content: center'>
			@include('layouts.forms.display.answer',[
				'type'=>'list',
				'name'=>'selected_role',
				'options'=>[
					'list'=>Auth::user()->roles['list'],
					'listLimit'=>1,
					'preLabel'=>'Log in as:',
					'ele_css'=>'{"fontSize":"1.3em"}',
					'eleClass'=>'!left',
				]
			])
			@include('layouts.forms.display.answer',[
				'type'=>'checkboxes',
				'name' => 'options',
				'options'=>[
					'list'=>['save as default'],
					'save_as_bool' => true,
				]
			])
			<div class='button pink disabled'>continue</div>
		</div>
	@endif

@endsection
