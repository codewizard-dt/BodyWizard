<?php 
	use App\Appointment;
	use App\Submission;
	use App\Form;
	if (!isset($apptId)){dd('no appointment selected');}

	$appt = Appointment::find($apptId);
	$patient = $appt->patient();
	$forms = $appt->forms();
	$patientForms = $forms->filter(function($form){return $form->user_type == 'patient';});
	$practitionerForms = $forms->filter(function($form){return $form->user_type == 'practitioner';});
	$availableForms = Form::where([['settings->chart_inclusion',true],['user_type','practitioner'],['active',true]])->get();
	$submissions = []; $missingSubmissions = [];
	foreach ($patientForms as $form){
		$submitted = Submission::where([['patient_id',$patient->id],['form_id',$form->form_id],['appointment_id',$appt->id]])->get();
		if ($submitted->count() == 1){
			$submissions[] = $submitted->first();
		}elseif ($submitted->count() == 0){
			$missingSubmissions[] = $form;
		}
	}
	$ctrl = new Form;
	$signOptions = ['typedName'=>'no','name'=>'PractitionerSignature'];
	if ($appt->chartNote){
		$missingSubmissionFormIds = collect($missingSubmissions)->map(function($form){return $form->form_id;})->toArray();
		$noteAutoSave = $appt->chartNote->autosave;
		$noteId = $appt->chartNote->id;
		$practitionerFormIds = $practitionerForms->map(function($form){return $form->form_id;})->toArray();
		foreach ($noteAutoSave as $formuid => $info){
			if (!in_array($info['FormID'], $practitionerFormIds)
				&& !in_array($info['FormID'], $missingSubmissionFormIds)){
				$practitionerForms->push(Form::find($formuid));
			}
		}
	}else{
		$noteAutoSave = "";
		$noteId = "new";
	}
?>

<h3 id='ApptInfo' class='pink' data-id='{{$apptId}}' data-noteid='{{$noteId}}' data-autosave='{{json_encode($noteAutoSave)}}'>{{$patient->name}}<br>{{$appt->name}}</h3>
<div id="ChartFormsModal" class='prompt'>
	<div class="message">
		<h2 class='purple'>Charting Forms</h2>
		<div>
			<h3 class="purple paddedSmall topOnly">Currently Loaded</h3>
			<div id="LoadedForms"></div>
		</div>
		<div>
			<h3 class="purple paddedSmall topOnly">Click-To-Load</h3>
			<div id="AvailableChartingForms" class='flexbox styled'>
				@forelse ($availableForms as $form)
					<div class="availableChartForm" data-formid='{{$form->form_id}}'><span class="label">{{$form->form_name}}</span></div>
				@empty
					<div class="availableChartForm" data-formid='null'>No Available Charting Forms</div>
				@endforelse		
			</div>
		</div>		
	</div>
	<div class="options">
		<div class="button xsmall cancel">close</div>
	</div>
</div>

<div id="Submissions">
	<h3 class="chartNoteHeader marginXBig topOnly purple">Patient Submissions</h3>
	@foreach ($submissions as $completed)
		@include('portal.practitioner.chart_notes.submission',['submission'=>$completed])
	@endforeach
	@foreach ($missingSubmissions as $missed)
		@include('portal.practitioner.chart_notes.missing-submission',['form'=>$missed])
	@endforeach
	@if (count($submissions) == 0 && count($missingSubmissions) == 0)
		<div class="pink">No Submissions Required</div>
	@endif
</div>
<div id="ChartNoteForms">
	<h3 class="chartNoteHeader marginXBig topOnly purple">Charting Forms</h3>
	@forelse ($practitionerForms as $form)
		@include('portal.practitioner.chart_notes.chart-form',['form'=>$form])
	@empty
		<div class='pink' id="NoDefaultForms">No default forms set for the following services: {{$appt->service_list}}<br>You can change this in the settings for these services</div>
	@endforelse
	<div class="button xsmall yellow70" id="ChartFormsModalBtn">add/remove forms</div>
</div>
<div id="ChartSignature">
	<h3 class="chartNoteHeader marginXBig topOnly purple">Practitioner Signature</h3>
	{{$ctrl->signature($signOptions)}}
</div>
@include ('layouts.forms.autosave-wrap')
<div class="button pink" id="SignChartBtn">sign chart</div>