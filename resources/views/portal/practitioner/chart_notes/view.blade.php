<?php
use App\ChartNote;
$submissions = $note->appointment->submissions;
$patientSubmissions = $submissions->filter(function ($submission) {
    return $submission->form->user_type == 'patient';
});
$practitionerSubmissions = $submissions->filter(function ($submission) {
    return $submission->form->user_type == 'practitioner';
});
$ctrl = new \App\Form();
$signOptions = ['typedName' => 'no', 'name' => 'PractitionerSignature'];
$patient = $note->patient;
$lastChartNote = ChartNote::where([['patient_id', $patient->id], ['id', '!=', $note->id]])
    ->orderBy('created_at', 'desc')
    ->first();
if ($lastChartNote) {
    $notesFromLastChartNote = $lastChartNote->notes;
    $lastNoteDate = $lastChartNote->signed_on ?: $lastChartNote->created_at;
    $lastNoteDate = is_string($lastNoteDate) ? $lastNoteDate : $lastNoteDate->format('n/j/y');
} else {
    $notesFromLastChartNote = '';
}
$todaysNotes = $note->notes;
// dd($todaysNotes);
?>
<h1 class='purple'>Signed Chart Note</h1>
<h2 class="pink">{{ $note->name }}</h2>
@if ($lastChartNote)
    <div id="NotesFromLastTime" class='left'>
        <h3 class="chartNoteHeader marginXBig topOnly purple">Pinned Notes From {{ $lastNoteDate }}</h3>
        @forelse ($notesFromLastChartNote as $pinnedNote)
            <div class='left paddedSides small p-y-xsmall'>
                @if (isset($pinnedNote['title']))<h4>{{ $pinnedNote['title'] }}</h4>@endif
                <div>{{ $pinnedNote['text'] }}</div>
            </div>
        @empty
            <h4 class='left paddedSides small p-y-xsmall'>None</h4>
        @endforelse
    </div>
@endif
<div id="NotesFromThisTime" class='left'>
    <h3 class="chartNoteHeader marginXBig topOnly purple">Pinned Notes For Next Time</h3>
    @forelse ($todaysNotes as $pinnedNote)
        <div class='left paddedSides small p-y-xsmall'>
            @if (isset($pinnedNote['title']))<h4>{{ $pinnedNote['title'] }}</h4>@endif
            <div>{{ $pinnedNote['text'] }}</div>
        </div>
    @empty
        <h4 class='left paddedSides small p-y-xsmall'>None</h4>
    @endforelse
</div>

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

<div id="ChartSignature" data-type='signature' data-signature='{{ json_encode($note->signature) }}'>
    <h3 class="chartNoteHeader marginXBig topOnly purple">Practitioner Signature</h3>
    <div class="answer">{{ $ctrl->signature($signOptions) }}</div>
</div>

<div class="button cancel">close</div>
