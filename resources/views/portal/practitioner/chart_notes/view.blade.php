<?php 
$submissions = $note->appointment->submissions;
$patientSubmissions = $submissions->filter(function($submission){
	return $submission->form->user_type == 'patient';
});
$practitionerSubmissions = $submissions->filter(function($submission){
	return $submission->form->user_type == 'practitioner';
});
$ctrl = new \App\Form;
$signOptions = ['typedName'=>'no','name'=>'PractitionerSignature'];
?>
<h1 class='purple'>Signed Chart Note</h1>
<h2 class="pink">{{$note->name}}</h2>
<h3 class="chartNoteHeader marginXBig topOnly purple">Patient Submissions</h3>
@forelse ($patientSubmissions as $submission)
	@include ('portal.practitioner.chart_notes.submission',['submission'=>$submission])
@empty
	<h2>None</h2>
@endforelse

<h3 class="chartNoteHeader marginXBig topOnly purple">Chart Forms</h3>
@forelse ($practitionerSubmissions as $submission)
	@include ('portal.practitioner.chart_notes.submission',['submission'=>$submission])
@empty
	<h2>None</h2>
@endforelse

<div id="ChartSignature" data-type='signature' data-signature='{{json_encode($note->signature)}}'>
	<h3 class="chartNoteHeader marginXBig topOnly purple">Practitioner Signature</h3>
	<div class="answer">{{$ctrl->signature($signOptions)}}</div>
</div>

<div class="button cancel">close</div>