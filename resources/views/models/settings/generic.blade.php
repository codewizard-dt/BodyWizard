<?php 
$form = App\Form::firstWhere('name','like',$model.' Settings');
// $mode = $instance->proxy ? 'settings' : 'display';
// logger(compact('form'));
?>

@if ($form)
@include('layouts.forms.display.form',compact('form','mode'))
@endif