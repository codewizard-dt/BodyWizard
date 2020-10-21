<?php
    // called by GET /{model}/display/list
$nospaces = removespaces($model);
$class = "App\\$nospaces";
$ctrl = new $class;
$models = title(pluralSpaces($model));

try{
  $tableOptions = $class::tableValues();
}catch(\Exception $e){
  reportError($e, 'table with nav 13');
  dd($e);
} 

$tableOptions['createBtnText'] = isset($tableOptions['createBtnText']) ? $tableOptions['createBtnText'] : "Add New $model";
$tableOptions['displayName'] = isset($tableOptions['displayName']) ? $tableOptions['displayName'] : "$model";
$tableOptions['modal'] = false;

$collection = method_exists($class,'defaultCollection') ? $class::defaultCollection() : $class::all();
$tableOptions['collection'] = $collection;
$tableOptions['tableType'] = 'primary';

$uid = getUid($nospaces);

$instance = $class::find($uid);
$navOptions = [];
if ($instance && method_exists($instance, 'nav_options')) $navOptions = $instance->nav_options();
elseif ($instance) {
  $navOptions = [];
}

?>

<h1 class="purple paddedXSmall">{{$models}}</h1>

@include('models.navOptions.options-nav', array_merge($navOptions,['instance'=>$instance]))
<div class="central large">
  @include('models.table-new',$tableOptions)
</div>
