<?php 
	$uri = !$dropdown ? $uri : null;
	$divide = ($id == 'divide') ? " divide" : "";
?>
@if ($id == 'notifications')
	@include ('portal.user.notification-nav')
@else
	<div id="{{ $id }}" class="tab{{$divide}}" data-uri="{{$uri}}">
		<div class="title" data-uri="{{ $uri }}">{{ $text }}</div>
		<div class="underline"></div>
		@if ($dropdown)
		<div class="dropDown">
			@foreach ($dropdown as $name => $info)
				@include('layouts.menus.menu-item',$info)
			@endforeach		
		</div>
		@endif
	</div>
@endif
