<?php 
$class = "App\\$model";
$instance = $class::find($uid);
$notes = $instance->notes;
if ($model == 'ChartNote') {
	$allowRemoval = $instance->signed_at == 'not signed';
	$context = $allowRemoval ? null : '*notes cannot be deleted from a signed chart';
}
elseif ($model == 'Invoice') {
	$allowRemoval = $instance->status == 'pending';
	$context = $allowRemoval ? null : '*notes cannot be deleted from a settled invoice';
}
else {$allowRemoval = true; $context = null;}
?>
<h1 class='purple'>Pinned Notes</h1>
<h2 class="pink instance" data-model='{{$model}}' data-uid='{{$uid}}' data-notes='{{json_encode($notes)}}' data-allowremoval='{{$allowRemoval ? "true" : "false"}}'>{{getModel($instance, true)}}: {{$instance->name}}</h2>
@include('layouts.forms.additional-notes', compact('context'))