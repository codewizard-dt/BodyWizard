<?php
use App\Form;
$alwaysAvailable = Form::alwaysAvailable();
$neededByAppt = Form::neededByAnyAppointment();
$hasSubmission = Form::hasSubmissions();
$forms = $alwaysAvailable->merge($neededByAppt)->merge($hasSubmission);
?>

@include('models.table-with-nav',[
	'model' => 'Form',
	'collection' => $forms
])