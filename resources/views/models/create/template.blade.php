<?php 
$mode = $request->has('mode') ? $request->mode : null;
$instance = isset($instance) ? $instance : null;
$class = "App\\$model";
$display_name = isset($class::$display_name) ? $class::$display_name : $model;
?>
<div class="createModel" data-model='{{$display_name}}'>
	@include('models.create.'.camel($model), compact('instance','mode','request'))
</div>