<div class="filter" data-type="text" data-target='{{$target}}' data-options="{{json_encode(compact('name','item_html_tag'))}}">
	@include('layouts.forms.display.answer',array_merge($input,compact('name')))
</div>