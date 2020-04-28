<div class='optionBtnWrap'>
    @forelse ($buttons as $button)
  		<div class='button xsmall purple70' data-destination='{{$button["destination"]}}'>{{$button["text"]}}</div>
  	@empty
  		<div class='button xsmall black70'>no options</div>
    @endforelse
</div>