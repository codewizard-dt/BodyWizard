<?php 
$addNoteForm = \App\Form::find(43);
$context = isset($context) ? $context : null;
$header = isset($header) ? $header : 'Additional Notes';
?>
<div id="Notes">
	<h3 class="invoiceHeader marginXBig topOnly purple">{{$header}}</h3>
	@if ($context)<div class="pink left paddedSides small paddedXSmall topOnly">{{$context}}</div>@endif
	<div id="NoteList" class="left paddedSides small paddedSmall">
		<h4 id="NoNotes">none</h4>	
	</div>
	{{$addNoteForm->formDisplay(false,false)}}
	<div id='AddNoteBtn' class="button xsmall pink">add note</div>
</div>
