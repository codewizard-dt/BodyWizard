<?php 
$mode = isset($mode) ? $mode : $request->has('mode') ? $request->mode : null;
$isProxy = $instance->id == 'proxy';
$close = $isProxy ? 'cancel' : 'close';
$blade = $model == 'Form' ? 'form' : 'generic';
?>
	<h1 id='Settings' data-is_proxy='{{$isProxy ? "true" : "false"}}' data-initial='{{json_encode($instance->settings)}}'><div class='bold'>{{$instance->name ? $instance->name : ''}}</div> {{$model}} Settings</h1>
	@includeIf('models.settings.'.$blade, compact('instance','request','mode'))
	<div>
		@if($mode == 'modal') <div class="button cancel small">{{$close}}</div>@endif	
	</div>	
