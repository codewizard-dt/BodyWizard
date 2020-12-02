<?php
    // called by GET /{model}/display/list
$nospaces = removespaces($model);
$class = "App\\$nospaces";
// $ctrl = new $class;
$displayName = method_exists($class,'displayName') ? $class::displayName() : title(singularSpaces($model));
$models = plural($displayName);

try{ $tableOptions = $class::TableOptions(); }
catch(\Exception $e){ $tableOptions = ['columns'=>['Name'=>'name']]; } 

// $tableOptions['createBtnText'] = isset($tableOptions['createBtnText']) ? $tableOptions['createBtnText'] : "Add New $displayName";
$tableOptions['displayName'] = $displayName;
$tableOptions['modal'] = false;

$collection = method_exists($class,'DefaultCollection') ? $class::DefaultCollection(true)->get() : $class::all();
$tableOptions['collection'] = $collection;
$tableOptions['tableType'] = 'primary';
$tableOptions['tableId'] = $nospaces.'List';
$tableOptions['index'] = isset($tableOptions['index']) ? $tableOptions['index'] : 'id';

$uid = getUid($nospaces);

$instance = $class::find($uid);
$navOptions = [];
if ($instance && method_exists($instance, 'table_nav_options')) $navOptions = $instance->table_nav_options();
elseif ($instance) {
  $navOptions = [];
}

?>

<h1 class="purple paddedXSmall">{{$models}}</h1>

@include('models.navOptions.options-nav', array_merge($navOptions,['instance'=>$instance]))
<div class="central large">
  @include('models.table-new',$tableOptions)
</div>
