<h2 class="chartNoteTitle purple marginSmall topOnly hideTarget" data-target='{{$submission->form->name_abbr}}' data-formname='{{$submission->form->name}}' data-id='{{$submission->id}}' data-type='submission'><span class="arrow right"></span><span class="label">{{$submission->form->name}}</span></h2>
<div class="submissionInfo pink left paddedSides p-y-25 topOnly">Submitted at {{$submission->submitted_at}}</div>
<div class="formWrap submission">
{{$submission->form->formDisplay(false, false, false, false, false)}}<div class='responses' data-target='{{$submission->form->name_abbr}}' data-json='{{json_encode($submission->responses)}}'></div>
</div>