<?php 
$mode = isset($mode) ? $mode : $request->has('mode') ? $request->mode : null;
?>
<h1 id='Settings' data-initial='{{json_encode($instance->settings)}}'><span class='bold'>{{$instance->name}}:</span> {{$model}} Settings</h1>
@include('models.settings.'.$model,compact('instance','request','mode'))
<div>
	@if($mode == 'modal') <div class="button cancel small">close</div>@endif	
</div>