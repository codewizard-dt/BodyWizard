<?php 
	$uri = !$dropdown ? $uri : null;
	$divide = ($name == 'divide') ? " divide" : "";
	$modal = isset($modal) && $modal ? 'true' : 'false';
?>
@if ($name == 'notifications')
	@include ('layouts.notifications')
@else
	<div id="{{ $name }}" class="tab{{$divide}}" data-uri="{{$uri}}" data-modal="{{$modal}}">
		<div class="title" @if(isset($image_url))data-image='{{$image_url}}' @endif data-uri="{{ $uri }}">{{ $text }}</div>
		<div class="underline"></div>
		@if ($dropdown)
		<?php unset($image_url); ?>		
		<div class="dropDown">
			@foreach ($dropdown as $name => $info)
				@include('layouts.menus.menu-item',$info)
			@endforeach		
		</div>
		@endif
	</div>
@endif