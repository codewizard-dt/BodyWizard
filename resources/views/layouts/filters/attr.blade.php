<div class="filter_proxy" data-type="attribute" data-target='{{$target}}' data-options="{{json_encode(compact('name','attribute','item_html_tag'))}}">
	@include('layouts.forms.display.answer',array_merge($input,compact('name')))
</div>