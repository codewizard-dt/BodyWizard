<?php
Use App\Form;
$today = date("m/d/Y");
$form = Form::find($uid);
$formId = $form->form_id;
$formJSON = $form->full_json;
?>

<h1 class='purple'>
    <div id='formdata' data-mode='view' data-formuid='{{ $uid }}' data-formid='{{ $formId }}' data-json='{{ $formJSON }}'></div>
    {{ $form->form_name }} (preview)<br>{{ $today }}
</h1>
<div class="button xxsmall yellow" id="ShowAllDispOpt">edit display and layout options</div>
<?php 
$form->formDisplay(true);
?>

<script src="{{ asset('/js/launchpad/form-preview.js') }}"></script>
