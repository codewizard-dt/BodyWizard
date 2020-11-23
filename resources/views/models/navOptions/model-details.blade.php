<?php 
$options = [
	'json' => $details,
	'key_css' => ['color'=>'purple'],
	// 'box_css' => ['minWidth'=>'36em'],
];
?>
<div class="KeyValueBox" data-options='{{json_encode($options)}}'></div>