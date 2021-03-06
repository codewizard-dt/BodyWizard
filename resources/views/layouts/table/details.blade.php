<?php
try {
    $details = $class::instance_details(isset($uid) ? $uid : null);
    $instance_buttons = $class::instance_buttons();
} catch (\Exception $e) {
    $instance_str = '';
    $instance_buttons = [];
    $error = handleError($e);
    return compact('error');
}
?>

<div id='{{ $model }}Details' class='Details' @if (isset($details)) data-details='{{ json_encode($details) }}' @endif
    data-buttons='{{ json_encode($instance_buttons) }}'></div>
