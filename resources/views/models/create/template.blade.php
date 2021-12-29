<?php
$mode = request()->has('mode') ? request()->mode : null;
$instance = isset($instance) ? $instance : null;
$class = "App\\$model";
$display_name = isset($class::$display_name) ? $class::$display_name : $model;
?>
<div id="{{ $model }}" class="createModel p-medium white-bg w-medium w-max-95" data-model='{{ $display_name }}'>
    @include('models.create.'.camel($model), compact('instance','mode'))
</div>
