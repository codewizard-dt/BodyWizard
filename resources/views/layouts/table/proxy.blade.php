<?php
$class = "App\\$model";
$uid = !isset($uid) || $uid == '' ? null : $uid;
// logger(compact('class','uid'));
try {
    $query = request('query', []);
    $index = isset($is_index) ? $is_index : false;
    $table_access = method_exists($class, 'table_json');
    $table_str = $table_access ? $class::table_json($query) : null;
} catch (\Exception $e) {
    reportError($e, "Table View - $model");
    $index = false;
    $table_str = '';
}
// $instance = isset($uid) ? $class::find($uid) : null;
?>

@if (!isset($table_access))
    <h2 class='pink' data-errcode="1">{{ proper($model) }} access not fully configured</h2>
@elseif (!$table_access)
    <h2 class='pink' data-errcode="2">{{ proper($model) }} access not fully configured</h2>
@elseif ($table_str === null)
    <h2 class='pink' data-errcode="3">{{ proper($model) }} access not fully configured</h2>
@else
    <div id="Select{{ $model }}Table" class="Table" data-is_index='{{ $index ? 'true' : 'false' }}'
        {!! $table_str !!}>
        @if ($index)
            @include('layouts.table.details', compact('class','uid'))
        @endif
    </div>


    @if ($index && $model != 'Form' && $model != 'ChartNote')
        <div class="hidden">
            @include("models.create.template",compact('model','index'))
        </div>
    @endif
@endif
