<div id="Filters">
    @foreach ($filters as $name => $filter)
    	@include('layouts.filters.attr',array_merge($filter,compact('name'),['target'=>$tableId,'item_html_tag'=>'tr']))
    @endforeach
</div>
