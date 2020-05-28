<?php 
if (!isset($filters)){
	$filters = [];
	reportError("Define tableValue[filters] for $model",'table-new.blade 4');
}
if (!isset($extraData)) $extraData = [];
if (!isset($extraBtns)) $extraBtns = [];
if (!isset($nameColumn)) $nameColumn = array_key_first($columns);
$nameColumn = camel($nameColumn);
if ($tableType == 'secondary'){
	$extraBtns = ["manage ".plural($model) =>  "/$nospaces/index"];
	$extraBtnColor = 'yellow70';
}else{
	$extraBtnColor = 'yellow';
}


?>
<div class='wrapMe marginBig bottomOnly' style='display:inline-block'>
	<div id="TableButtons">
		@if (Auth::user()->is_admin && findFormId($model) && $tableType == 'primary')
	    	<div class='button xsmall createNew pink70' data-model='{{$nospaces}}' data-target='#{{$tableId}}'>{{$createBtnText}}</div>    
	    @endif
	    @if ($modal)
	    	<h3 class="displaySelection pink nodisplay"></h3>
	    	<div class='button xsmall selectData pink disabled'>confirm</div>
	    @endif
    	@foreach ($extraBtns as $text => $uri)
			<div class='button xsmall {{$extraBtnColor}} loadInTab' data-uri='{{$uri}}'>{{$text}}</div>
    	@endforeach
	</div>
	@include ('layouts.table.filters', compact('filters','tableId'))
	<div class="TableNav flexbox">
    	<div class="tableArrow left disabled"></div>
    	<div class='label'>Most Recent {{title(pluralSpaces($model))}}</div>
    	<div class="tableArrow right disabled"></div>
	</div>
	<div>
		<table id='{{$tableId}}' class='styledTable clickable modelTable' data-index="{{$index}}" data-display='{{$displayName}}' data-target="#Current{{$nospaces}}" data-model='{{$nospaces}}' data-hideorder='{{json_encode(camel($hideOrder))}}' data-significance='{{$tableType}}' data-namecolumn='{{$nameColumn}}'>
			@include ('layouts.table.header', compact('columns'))
	        @foreach ($collection as $instance)
	        	@include('layouts.table.row')
	        @endforeach
	        @include ('layouts.table.nomatch-row', compact('columns'))
			</tr>
		</table>
	</div>
	@if ($modal)
	    <div class='button xsmall cancel'>dismiss</div>
    @endif
</div>
