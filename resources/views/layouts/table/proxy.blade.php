<?php
$class = "App\\$model";
$uid = !isset($uid) || $uid == '' ? null : $uid;
// logger(compact('class','uid'));
try {
    $query = request('query', []);
    $index = isset($is_index) ? $is_index : false;
    $table_access = method_exists($class, 'table_json');
    $table_str = $table_access ? $class::table_json($query, $index) : null;
} catch (\Exception $e) {
    reportError($e);
    $index = false;
    $table_str = '';
}
// $instance = isset($uid) ? $class::find($uid) : null;
?>

<div id="Select{{ $model }}Table" class="Table" data-is_index='{{ $index ? 'true' : 'false' }}'
    {!! $table_str !!}>
    @if (!isset($table_access) || !$table_access)
        <div>Table access not set up</div>
    @elseif ($table_str === null)
        <div>Error retrieving table data</div>
    @endif
    @if ($index)
        @include('layouts.table.details', compact('class','uid'))
    @endif
</div>

@if ($index)
    @include("models.create.template",compact('model','index'))
@endif
