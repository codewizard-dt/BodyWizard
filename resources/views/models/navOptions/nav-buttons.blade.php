<?php $buttons = array_merge($buttons,[
	'edit info' => 'edit',
	'settings' => 'settings',
	'delete' => 'delete',
]); 
?>
<div class='optionBtnWrap'>
    @forelse ($buttons as $text => $destination)
  		<div class='button xxsmall purple70' data-action='model.actions.{{$destination}}'>{{$text}}</div>
  	@empty
  		<div class='button xxsmall black70'>no options</div>
    @endforelse
</div>