<?php 
$options = compact('name','attribute','item_html_tag');
set($options,'type','attribute');
?>
<div class="filter" data-type="attribute" data-target='{{$target}}' data-options="{{json_encode($options)}}">
	@include('layouts.forms.display.answer',array_merge($input,compact('name')))
</div>