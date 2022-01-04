<?php
$mode = request()->has('mode') ? request()->mode : null;
$instance = isset($instance) ? $instance : null;
$index = isset($index) ? $index : false;
$class = "App\\$model";
$display_name = isset($class::$display_name) ? $class::$display_name : $model;
?>
<div id="{{ $model }}" class="createModel form p-medium white-bg w-medium w-max-95"
    data-model='{{ $display_name }}'>
    @include('models.create.'.camel($model), compact('instance','mode','index'))
</div>
