<?php 
$addNoteForm = \App\Form::find(43);
?>
<div id="Notes">
	<h3 class="invoiceHeader marginXBig topOnly purple">Additional Notes</h3>
	<div id="NoteList" class="left paddedSides small paddedSmall">
		<h4 id="NoNotes">none</h4>	
	</div>
	{{$addNoteForm->formDisplay(false,false)}}
	<div id='AddNoteBtn' class="button xxsmall pink">add note</div>
</div>
