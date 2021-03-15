<?php 
$options = [
	'json' => $details,
	'key_css' => ['color'=>'var(--purple)','fontWeight'=>'normal','marginBottom'=>'3px'],
	'key_class' => 'purple light',
	'value_css' => ['alignSelf'=>'unset'],
	'transform_fx' => 'Table.model_details_display',
	'header' => 'General Info',
	'header_options' => ['css'=> ['margin'=>'0.5em 0 0.25em','padding'=>'0 1em','borderBottom'=>'2px solid var(--purple30)','fontSize'=>'1.5em','color'=>'var(--purple)']],
	'header_toggle' => true,
	'headers_to_hide' => ['Settings'],
];
?>
<div class="KeyValueBox" data-options='{{json_encode($options)}}'></div>