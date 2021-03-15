<?php
unset($collection);
$nospaces = removespaces($model);
$class = "App\\$nospaces";

$displayName = method_exists($class,'displayName') ? $class::displayName() : title(singularSpaces($model));
$models = plural($displayName);

try{ $tableOptions = $class::TableOptions(); }
catch(\Exception $e){ $tableOptions = ['columns'=>['Name'=>'name']]; } 


$tableOptions['displayName'] = $displayName;
$tableOptions['modal'] = false;

$collection = method_exists($class,'DefaultCollection') ? $class::DefaultCollection(true)->get() : $class::all();
$tableOptions['collection'] = $collection;
$tableOptions['tableType'] = 'primary';
$tableOptions['tableId'] = $nospaces.'List';
$tableOptions['index'] = isset($tableOptions['index']) ? $tableOptions['index'] : 'id';

?>

<div id='{{ $modalId }}' class='modalForm connectedModel' data-model='{{ $model }}' data-relationship='{{ $relationship }}' data-connectedto='{{ $connectedTo }}' data-number='{{ $number }}'>
    <h2>Available {{ $models }}</h2>
    @include('models.table-new',$tableOptions)
</div>
