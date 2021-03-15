<?php 
$form = App\Form::firstWhere('form_name','like',$model.' Settings');
$mode = 'display';
// logger(compact('form'));
?>

@if ($form)
@include('layouts.forms.display.form',compact('form','mode'))
@endif