@foreach ($models as $model)
	<?php $class = "App\\$model"; ?>
	<div class="list_update" data-model="{{$model}}" data-list="{{$class::list(true)}}"></div>
@endforeach