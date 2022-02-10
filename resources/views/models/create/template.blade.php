<?php
$mode = request()->has('mode') ? request()->mode : null;
$instance = isset($instance) ? $instance : null;
$index = isset($index) ? $index : false;
$class = "App\\$model";
$display_name = isset($class::$display_name) ? $class::$display_name : $model;
$initial = $instance ? $instance->toArray() : [];
// logger(compact('initial'));
$view = 'models.create.' . camel($model);

?>
<div id="{{ toKeyString($model) }}" class="createModel form p-medium white-bg w-huge w-max-95"
    data-model='{{ $display_name }}' data-initial='{{ json_encode($initial) }}'>
    <h1>{{ $instance ? $instance->name : "New $display_name" }}</h1>
    @includeIf('models.create.'.camel($model), compact('instance','mode','index'))
    <div class='button pink submit model {{ $instance ? 'edit' : 'create' }}' data-model='{{ $model }}'>
        {{ $instance ? 'save changes' : "Add $display_name" }}</div>
</div>
