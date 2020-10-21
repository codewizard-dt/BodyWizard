<?php 
// attr: type options 
if (isset($name) && !isset($options['name'])) $options['name'] = $name;
$settings = isset($settings) ? json_encode($settings) : 'null';
$value = isset($initial) && isset($initial[$name]) ? $initial[$name] : 'null';
if (isset($initial) && isset($initial[$name])) {
	$value = $initial[$name];
	$options['initial'] = $value;
}
// Log::info($initial);
// if (isset($options['linked_to'])) {
// 	$list = basicList($options['linked_to']);
// 	$options['list'] = collect($list)->map(function($item){
// 		return $item['uid'].'%%'.$item['name'];
// 	})->toArray();
// }
?>
<span class='answer_proxy' data-type='{{$type}}' data-initial='{{$value}}' data-options='{{json_encode($options)}}' data-settings='{{$settings}}'></span>