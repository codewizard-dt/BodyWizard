<?php
use App\Appointment;
use App\Submission;
use App\ChartNote;
use App\Form;
if (!isset($apptId)) {
    dd('no appointment selected');
}

// $appt = Appointment::find($apptId);
$appt = Appointment::with(['patient', 'services.forms', 'chartNote'])
    ->where('id', $apptId)
    ->first();

$patient = $appt->patient;
$practitioner = $appt->practitioner;
$forms = $appt->forms();
$patientForms = $forms->filter(function ($form) {
    return $form->user_type == 'patient';
});
$practitionerForms = $forms->filter(function ($form) {
    return $form->user_type == 'practitioner';
});
$availableForms = Form::where([['settings->chart_inclusion', true], ['user_type', 'practitioner'], ['active', true]])->get();
$submissions = [];
$missingSubmissions = [];
foreach ($patientForms as $form) {
    $submitted = Submission::where([['patient_id', $patient->id], ['form_id', $form->form_id], ['appointment_id', $appt->id]])->get();
    if ($submitted->count() == 1) {
        $submissions[] = $submitted->first();
    } elseif ($submitted->count() == 0) {
        $missingSubmissions[] = $form;
    }
}
$ctrl = new Form();
$signOptions = ['typedName' => 'no', 'name' => 'PractitionerSignature'];
if ($appt->chartNote) {
    $missingSubmissionFormIds = collect($missingSubmissions)
        ->map(function ($form) {
            return $form->form_id;
        })
        ->toArray();
    $autosavedForms = $appt->chartNote->autosave;
    $noteId = $appt->chartNote->id;
    $notes = $appt->chartNote->notes;
    $practitionerFormIds = $practitionerForms
        ->map(function ($form) {
            return $form->form_id;
        })
        ->toArray();
    if ($autosavedForms) {
        foreach ($autosavedForms as $formuid => $info) {
            if (!in_array($info['FormID'], $practitionerFormIds) && !in_array($info['FormID'], $missingSubmissionFormIds)) {
                $practitionerForms->push(Form::find($formuid));
            }
        }
    }
    $lastChartNote = ChartNote::where([['patient_id', $patient->id], ['id', '!=', $noteId]])
        ->orderBy('created_at', 'desc')
        ->first();
} else {
    $autosavedForms = '';
    $noteId = 'new';
    $notes = '';
    $lastChartNote = ChartNote::where('patient_id', $patient->id)
        ->orderBy('created_at', 'desc')
        ->first();
}
if ($lastChartNote) {
    $notesFromLastChartNote = $lastChartNote->notes;
    $lastNoteDate = $lastChartNote->signed_on ?: $lastChartNote->created_at;
    $lastNoteDate = $lastNoteDate;
} else {
    $notesFromLastChartNote = '';
}
$data = [
    'appointment_id' => $appt->id,
    'uid' => $appt->chartNote ? $appt->chartNote->id : 'null',
    'patient_id' => $appt->patient->id,
    'practitioner_id' => $appt->practitioner->id,
    'autosave' => $appt->chartNote ? json_encode($autosavedForms) : 'null',
    'notes' => $appt->chartNote ? json_encode($notes) : 'null',
];
// $dataStr = dataAttrStr(collect($data));
?>

<h3 id='ApptInfo' class='pink' {!! $dataStr !!}>{{ $patient->name }}<br>{{ $appt->name }}</h3>
<div id="ChartFormsModal" class='prompt'>
    <div class="message">
        <h2 class='purple'>Charting Forms</h2>
        <div>
            <h3 class="purple p-y-xsmall topOnly">Currently Loaded</h3>
            <div id="LoadedForms"></div>
        </div>
        <div>
            <h3 class="purple p-y-xsmall topOnly">Click-To-Load</h3>
            <div id="AvailableChartingForms" class='flexbox styled'>
                @forelse ($availableForms as $form)
                    <div class="availableChartForm" data-formid='{{ $form->form_id }}'><span
                            class="label">{{ $form->form_name }}</span></div>
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
@if ($lastChartNote)
    <div id="NotesFromLastTime" class='left'>
        <h3 class="chartNoteHeader marginXBig topOnly purple">Pinned Notes From {{ $lastNoteDate }}</h3>
        @forelse ($notesFromLastChartNote as $note)
            <div class='left paddedSides small p-y-xsmall'>
                @if (isset($note['title']))<h4>{{ $note['title'] }}</h4>@endif
                <div>{{ $note['text'] }}</div>
            </div>
        @empty
            <h4 class='left paddedSides small p-y-xsmall'>None</h4>
        @endforelse
    </div>
@endif
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
        <div class='pink left' id="NoDefaultForms">No default forms set for the following services:
            {{ $appt->service_list }}<br>You can change this in the settings for these services</div>
    @endforelse
    <div class="button xsmall yellow70" id="ChartFormsModalBtn">add/remove forms</div>
</div>
<div id="PinnedNotes">
    @include ('layouts.forms.additional-notes',[
    'header'=>'Notes for Next Time',
    'context'=>'these will be pinned to the top of the next chart note for this patient'
    ])
</div>
<div id="ChartSignature">
    <h3 class="chartNoteHeader marginXBig topOnly purple">Practitioner Signature</h3>
    {{ $ctrl->signature($signOptions) }}
</div>
<div class="button pink" id="SignChartBtn">sign chart</div>
