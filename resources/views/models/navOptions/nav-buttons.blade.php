<?php $buttons = array_merge($buttons,[
	'edit info' => 'edit',
	'settings' => 'settings',
	'delete' => 'delete',
]); 
?>
<div class='optionBtnWrap'>
    @forelse ($buttons as $text => $destination)
  		<div class='button xsmall purple70' data-action='model.actions.{{$destination}}'>{{$text}}</div>
  	@empty
  		<div class='button xsmall black70'>no options</div>
    @endforelse
</div>