<?php
Use App\Form;
$today = date("m/d/Y");
$form = Form::find($uid);
$formId = $form->form_id;
$formJSON = str_replace("'","\u0027",$form->full_json);
?>

<h1 class='purple'>
    <div id='formdata' data-mode='view' data-formuid='{{ $uid }}' data-formid='{{ $formId }}' data-json='{{ $formJSON }}'></div>
    {{ $form->form_name }} (preview)<br>{{ $today }}
</h1>
<div class="button xxsmall yellow70 optionBtn" data-type='section' id="SectionOptionsBtn">section options</div>
<div class="button xxsmall yellow70 optionBtn" data-type='item' id="ItemOptionsBtn">item options</div>
<div class="button xxsmall pink disabled" id="SaveDisplayOptions">save changes</div>
<?php 
$form->formDisplay(true);
?>
<div class='template displayOptions' data-type='item'>
	<div class='showOptions'>+</div>
	<div class='options'>
		<select name="inline"><option value="false">display on own line</option><option value="true">condense</option><option value="trueBR">condense, begin new line</option></select>
	</div>
</div>
<div class='template displayOptions' data-type='section'>
	<div class='showOptions'>+</div>
	<div class='options'>
		<select name="displayNumbers"><option value="true">display item numbers</option><option value="false">hide item numbers</option></select>
	</div>
</div>
<script src="{{ asset('/js/launchpad/form-preview.js') }}"></script>
