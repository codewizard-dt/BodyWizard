<?php 
try {
	$instance_str = $class::instance_details(isset($uid) ? $uid : null);
	$instance_buttons = $class::instance_buttons();
} catch (\Exception $e) {
	$instance_str = '';
	$instance_buttons = [];
	reportError($e);
}
?>

<div id='{{$model}}Details' class='Details' {!!$instance_str!!} data-buttons='{{json_encode($instance_buttons)}}'></div>
