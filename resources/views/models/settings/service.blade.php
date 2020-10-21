<?php 
$form = App\Form::firstWhere('form_name','like','Service Settings');
$mode = 'display';
?>

@include('layouts.forms.display.form',compact('form','mode'))