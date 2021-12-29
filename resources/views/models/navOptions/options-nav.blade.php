@if (isset($instance))
	<?php 
	$buttons = isset($buttons) ? $buttons : [];
	$details = method_exists($instance, 'modelDetails') ? $instance->modelDetails() : $instance->attributesToArray();
	if (!isset($model)) $model = getModel($instance);
	$uid = $instance->getKey();
	$attrs = $instance->attributesToArray();
	$attrs = collect(array_merge($attrs,compact('model','uid')))->toJson();
	?>
	<div class="optionsNavWrapper">
		<h2 class="optionsNavHeader purple p-y-50 topOnly">{{$instance->name}}</h2>
		<div id="Current{{$model}}" class="optionsNav" data-uid="{{$uid}}" data-model="{{$model}}" data-options='{{$attrs}}'>
			<div class="navDetails">
				@include ('models.navOptions.nav-buttons',compact('buttons'))
				@include ('models.navOptions.model-details',compact('model','details'))
			</div>
		</div>
		<div class="toggle_proxy up" data-arrow_position='below' data-target_ele='Current{{$model}}'>
			<img class='arrow' style='width:2em;height:2em;opacity:0.6' src='/images/icons/arrow_down_purple.png'>
		</div>
		
	</div>
@else
	<div class="optionsNavWrapper empty">
		<h3 class="optionsNavHeader purple p-y-50 topOnly"></h3>
		<div class="optionsNav"></div>
	</div>
@endif