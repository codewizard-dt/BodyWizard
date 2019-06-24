<?php

Use App\Form;
Use App\Service;

// Display a form to create a New Service.

$CreateService = Form::where('form_id', 2)->orderBy('version_id','desc')->first();

$model = "Service";
// dd($model);
$class = "App\\$model";
$ctrl = new $class;
$connectedModels = isset($ctrl->connectedModels) ? $ctrl->connectedModels : [];
?>

<div id="CreateService" class='central large'>
	<h2>{{ $CreateService->form_name }}</h2>
	{{ $CreateService->formDisplay(false) }}
</div>

@foreach ($connectedModels as $includeModel)
	@include('models.modal', [
		'model' => $includeModel[0],
		'relationship' => $includeModel[1]
	])
@endforeach

<script type='text/javascript' src="{{ asset('/js/launchpad/forms.js') }}"></script>
