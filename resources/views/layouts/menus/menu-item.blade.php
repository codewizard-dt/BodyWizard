<?php 
	// $allTabs = $
	$uri = !$dropdown ? $uri : null;
	$divide = ($id == 'divide') ? " divide" : "";
?>
<div id="{{ $id }}" class="tab{{$divide}}">
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
