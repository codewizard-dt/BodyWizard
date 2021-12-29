<?php 
$mode = isset($mode) ? $mode : $request->has('mode') ? $request->mode : null;
$isProxy = $instance->proxy == true;
$is_multi = $instance->multi != null;
// logger(compact('isProxy','is_multi'));
$close = $isProxy ? 'cancel' : 'close';
$blade = $model == 'Form' ? 'form' : 'generic';
$name = $isProxy ? $model : $instance->name;
?>

<div id='Settings' class='box purple full' data-plural='{{plural($model)}}' data-is_proxy='{{$isProxy ? "true" : "false"}}' data-is_multi="{{json_encode($instance->multi)}}" data-initial='{{json_encode($instance->settings)}}'></div>
@includeIf('models.settings.'.$blade, compact('instance','request','mode'))
