<?php
	Use App\Form;

    // include_once app_path("/php/functions.php");

	// Display a form that can create new Models
	// REQUIRES $model such that App\$model resolves

	if ($model == 'Form'){
		$form = null;
	}else{
		// dd($model);
		$form = Form::where('form_id', findFormId($model))->orderBy('version_id','desc')->first();
	}
	
	$class = "App\\$model";
	$ctrl = new $class;
	$connectedModels = isset($ctrl->connectedModels) ? $ctrl->connectedModels : [];
	$modal = isset($modal) ? $modal : false;
	if ($modal && $model == 'Diagnosis' && session('diagnosisType') == null){
		$options = ['Western','Chinese',"ID*load_dx_form"];
	}
	if (in_array($model, ['User','Patient','Practitioner','StaffMember'])){
		$noPW = Auth::check() ? 'noPW' : "";
		$user = $model;
	}else{
		$noPW = "";
		$user = false;
	}
	$admin = (Auth::user()->is_admin) ? "admin" : "";
?>

@if ($form)
	@if ($modal && $model == 'Diagnosis' && session('diagnosisType') == null)
	<div id='create{{ $model }}' class='central large createNew modalForm' data-model='{{ $model }}'>
		<h2 class='purple paddedSmall'>Which Type of Diagnosis?<br>
		{{ $form->radio($options) }}
		</h2>
		<div id='dxFormLoadTarget'></div>
	</div>
	@elseif ($modal)
	<div id='create{{ $model }}' class='central large createNew modalForm {{$noPW}} {{$admin}}' data-model='{{$model}}'>
		<h1 class='purple paddedSmall'>{{ $form->form_name }}</h1>
		{{ $form->formDisplay(true,true,false,$user) }}
	</div>
	@else
	<div id='create{{ $model }}' class='central large createNew {{$noPW}} {{$admin}}' data-model='{{$model}}'>
		<h1 class='purple paddedSmall'>{{ $form->form_name }}</h1>
		{{ $form->formDisplay(false,true,false,$user) }}
	</div>
	@endif

	@foreach ($connectedModels as $includeModel)
		@include('models.table-modal', [
			'model' => $includeModel[0],
			'number' => $includeModel[1],
			'relationship' => $includeModel[2],
			'connectedTo' => $model
		])
	@endforeach
@endif
