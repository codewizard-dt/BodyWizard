<?php 
$settings = isset($settings) ? json_encode($settings) : null;
?>
<div class="section" data-settings='{{$settings}}'>
	<h2>{{$name}}</h2>
	@forelse ($items as $item)
	@include ('layouts.forms.display.item', $item)
	@empty
	<div>Items is empty</div>
	@endforelse
</div>