<?php
	Use App\Form;

    // include_once app_path("/php/functions.php");

	// Display a form that can create new Models
	// REQUIRES $model such that App\$model resolves
	$form = Form::where('form_id', findFormId($model))->orderBy('version_id','desc')->first();
	$class = "App\\$model";
	$ctrl = new $class;
	$connectedModels = isset($ctrl->connectedModels) ? $ctrl->connectedModels : [];
	$includeConnectedModals = isset($includeConnectedModals) ? $includeConnectedModals : false;

	if (in_array($model, ['User','Patient','Practitioner','StaffMember'])){
		$noPW = Auth::check() ? 'noPW' : "";
		$user = $model;
	}else{
		$noPW = "";
		$user = false;
	}
	$admin = (Auth::user()->is_admin) ? "admin" : "";
?>

@if ($modal)
<div id='edit{{ $model }}' class='central large editExisting modalForm {{ $noPW }} {{ $admin }}' data-model='{{ $model }}'>
	<h1 class='purple paddedSmall'>{{ $form->form_name }}</h1>
	{{ $form->formDisplay(true,true,true,$user) }}
</div>
@else
<div id='edit{{ $model }}' class='central large editExisting {{ $noPW }} {{ $admin }}' data-model='{{ $model }}'>
	<h1 class='purple paddedSmall'>{{ $form->form_name }}</h1>
	{{ $form->formDisplay(false,true,true,$user) }}
</div>
@endif

@if ($includeConnectedModals)
	@foreach ($connectedModels as $includeModel)
		@include('models.table-modal', [
			'model' => $includeModel[0],
			'number' => $includeModel[1],
			'relationship' => $includeModel[2],
			'connectedTo' => $model
		])
		@if (Auth::user()->user_type == 'practitioner')
			@include('models.create-modal', [
				'model' => $includeModel[0]
			])
		@endif
	@endforeach
@endif
