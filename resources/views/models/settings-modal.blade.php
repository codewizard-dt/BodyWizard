<?php
include_once app_path("php/functions.php");
$class = "App\\$model";
$instance = $class::find($uid);
$settingsForm = App\Form::where([
    ['form_name','LIKE',"%".$model." Settings%"]        
])->orderBy('version_id','desc')->first();

$settings = str_replace("'","\u0027",$instance->settings);
$nameAttr = isset($instance->nameAttr) ? $instance->nameAttr : "name";
$connectedModels = isset($instance->connectedModels) ? $instance->connectedModels : [];
$admin = (Auth::user()->is_admin) ? "admin" : "";
$settingsJson = isset($instance->settings_json) ? str_replace("'","\u0027",$instance->settings_json) : "";



if ($model == 'Form'){
	$ctrl = new App\Complaint;
	$complaintArr = $ctrl->complaintTypeArr;
	array_push($complaintArr,"ID*complaint_types");
	$dynamicOptions = ['always display','display based on complaint type','only display to admins',"ID*dynamic"];
	$formJson = str_replace("'","\u0027",$instance->full_json);
}elseif ($model == 'Service'){
	$services = App\Service::orderBy('service_category_id','asc')->orderBy('display_order','asc')->get();
	$serviceNames = ["ID*ServiceNames"];
	$serviceMap = [];
	foreach ($services as $service){
		$new = [
			"id" => $service->id,
			"name" => $service->name,
		];
		$serviceMap[$service->name] = $service->id;
		$serviceNames[] = $service->name;
	}
	$addonServices = json_decode($instance->addon_services);
	$addonServiceNames = [];
	if ($addonServices){
		foreach ($addonServices as $serviceId){
			$addonServiceNames[] = getNameFromUid("Service",$serviceId);
		}
		$addonServiceNames = json_encode($addonaddonServiceNames);
		unset($serviceId);		
	}else{
		$addonServiceNames = null;
	}
}

?>

@if ($model == 'Form')
	<div id='{{ $model }}SettingsForm' class='central large settingsForm modalForm {{ $admin }}' data-target='{{ removespaces($instance->$nameAttr) }}' data-model='{{ $model }}' data-uid='{{ $uid }}' data-settings='{{ $settings }}'>
		<h1 class='purple paddedSmall'>'{{ $instance->$nameAttr }}' Settings</h1>
		<div id="ModelSettings" data-settingsJson='{{ $settingsJson }}'>
			{{ $settingsForm->formDisplay(false) }}
		</div>
		<div id="SectionSettings" data-json='{{ $formJson }}'>
			{{ $instance->formDisplay(true) }}
		</div>
	</div>
	<div class='template displayOptions' data-type='section'>
		<div class='showOptions'>dynamic display settings</div>
		<div class='options'>
			{{ $instance->answerDisp('radio',$dynamicOptions) }}
			{{ $instance->answerDisp('checkboxes',$complaintArr) }}
		</div>
	</div>
@else
	<div id='{{ $model }}SettingsForm' class='central large settingsForm modalForm {{ $admin }}' data-model='{{ $model }}' data-uid='{{ $uid }}' data-settings='{{ $settings }}' data-settingsjson='{{ $settingsJson }}'>
		<h1 class='purple paddedSmall'>'{{ $instance->$nameAttr }}' Settings</h1>
		<div id="ModelSettings">
			{{ $settingsForm->formDisplay(true) }}
		</div>
	</div>
@endif

@if ($model == 'Service')
	<div id="ServiceMap" data-map='{{json_encode($serviceMap)}}' data-currentaddonservices="{{$addonServiceNames}}">
		{{$settingsForm->answerDisp('checkboxes',$serviceNames)}}	
	</div>
@endif

@foreach ($connectedModels as $includeModel)
	@include('models.table-modal', [
		'model' => $includeModel[0],
		'number' => $includeModel[1],
		'relationship' => $includeModel[2],
		'connectedTo' => $model
	])
	@include('models.create-modal', [
		'model' => $includeModel[0]
	])
@endforeach

<script type='text/javascript' src='{{ asset("js/launchpad/model-settings.js")}}'></script>
<script type='text/javascript' src='{{ asset("js/launchpad/model-table.js")}}'></script>