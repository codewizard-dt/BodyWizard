<?php 
$general = [
	'target' => $tableId,
	'item_html_tag' => 'tr',
	'type' => 'attribute',
];
$text_search_box = array_merge($general, 
	[
		'name'=>$model."_search",
		'type'=>'text', 
		'input'=>new_input('text',
			['placeholder','eleCss'],
			['Type to search',['width'=>'calc(100% - 1em)']])
	]);
set($text_search_box,'input.settings',['placeholder_shift'=>'false']);
?>

<div id="Filters">
	@include('layouts.filters.text', $text_search_box)
  @foreach ($filters as $name => $filter)
  	@include('layouts.filters.attr', array_merge( $general, $filter, compact('name') ))
  @endforeach
</div>
