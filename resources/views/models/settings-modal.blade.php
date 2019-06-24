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

?>

<div id='{{ $model }}SettingsForm' class='central large settingsForm modalForm' data-model='{{ $model }}' data-uid='{{ $uid }}' data-settings='{{ $settings }}'>
	<h1 class='purple paddedSmall'>'{{ $instance->$nameAttr }}' Settings</h1>
	{{ $settingsForm->formDisplay(true) }}
</div>

<script type='text/javascript' src='{{ asset("js/launchpad/model-settings.js")}}'></script>
<script type='text/javascript' src='{{ asset("js/launchpad/model-table.js")}}'></script>