<?php 
use Illuminate\Support\Facades\Auth;
?>

<div class='wrapMe marginBig bottomOnly' style='display:inline-block'>
    @forelse ($filtersColumn as $filter)
	    <div class='filterType' data-target='#{{ $tableId }}' data-type='column'>{{ $filter['label'] }}: 
	    	@foreach ($filter['filterOptions'] as $option)
		    	<label><input type='checkbox' class='tableFilter' data-filter='{{ $filter["filterName"] }}:{{ $option["value"] }}'>{{ $option["label"] }}</label>
	    	@endforeach
		</div>
    @empty
    @endforelse

    @forelse ($filtersOther as $filter)
    	@if (!isset($filter['showFilter']) || $filter['showFilter'] !== false)
	    <div class='filterType' data-target='#{{ $tableId }}' data-filter='{{ $filter["filterName"] }}' data-type='data'>{{ $filter['label'] }}: 
	    	@foreach ($filter['filterOptions'] as $option)

		    	<label><input type='checkbox' class='tableFilter' data-filter='{{ $filter["filterName"] }}:{{ $option["value"] }}'>{{ $option["label"] }}</label>
	    	@endforeach
		</div>
		@endif
    @empty
    @endforelse

    <div class='filterType' data-target='#{{ $tableId }}' data-options='{"wholeWords":"false","separateWords":"true"}'><input class='tableSearch' type='text' data-filter='all' placeholder='Search'></div>
	<?php 
		$nospaces = str_replace(" ", "", $model); 
		$modal = isset($modal) ? $modal : false;
		if (session('subCollection') !== null){
			if ($model == 'User'){
				$btnDispText = "Add New ".ucfirst(session('subCollection'));
			}
		}elseif($model == "Message"){
			$btnDispText = "Send New Message";
		}else{
			$btnDispText = "Add New ".proper($model);
		}
		$btnDispText = isset($btnDispText) ? $btnDispText : "Add New ".proper($model);
		$displayName = isset($displayName) ? $displayName : "";
	?>

	@if (Auth::user()->is_admin)
    	<div class='button xsmall createNew pink70' data-model='{{ $nospaces }}' data-target='#{{ $tableId }}'>{{ $btnDispText }}</div>    
    @endif

    @if ($modal)
    <div class='button xsmall selectData pink disabled'>update {{ $connectedTo }}</div>
    @elseif (isset($extraBtns))
    	@foreach ($extraBtns as $btn)
			<div class='button xsmall yellow loadInTab' data-uri='{{ $btn[1] }}'>{{ $btn[0] }}</div>
    	@endforeach
    @endif
	<br>

	@if ($modal)
	    <table id='{{ $tableId }}' class='styledTable clickable modelTable' data-index="{{ $index }}" data-display='{{$displayName}}' data-model='{{ $nospaces }}' data-hideOrder='{{ $hideOrder }}'>
	@else
	    <table id='{{ $tableId }}' class='styledTable clickable modelTable' data-index="{{ $index }}" data-display='{{$displayName}}' data-target="#Current{{ $nospaces }}" data-model='{{ $nospaces }}' data-hideOrder='{{ $hideOrder }}' data-destinations="{{ implode(',',$destinations) }}" data-btnText="{{ implode(',',$btnText) }}">
	@endif

        <tr class='head'>
        	@foreach ($columns as $column)
	            <th class='{{ $column["className"] }}'>{{ $column['label'] }}</th>
            @endforeach
        </tr>
        @foreach ($collection as $instance)
        	<?php 
        	$hiddenFiltersAdded = false;
        	?>
            <tr data-uid='{{ $instance->getKey() }}' data-{{ $index }}='{{ $instance->$index }}'>

				@foreach ($columns as $column)
				<?php 
					$attr = $column['attribute'];

					$val = ($attr == "created_at" or $attr == "updated_at") ? date("n/j/Y",strtotime($instance->$attr)) : $instance->$attr;
					if ($attr ==  "created_at" or $attr == "updated_at"){
						// $val = date("n/j/Y",strtotime($instance->$attr));
						$val = dateOrTimeIfToday(strtotime($instance->$attr));
						// $val = $instance->$attr;
					}elseif(strpos($attr,"%") > -1 or strpos($attr,"!!") > -1){
						$val = complexAttr($attr,$instance);
					}elseif ($attr == 'affects'){
						try{
							$val = implode(", ", json_decode($instance->$attr));
						}catch(\Exception $e){
							$val = $val;
						}
					}elseif ($model == 'Message' && $attr == 'status'){
						$val = decodeStatus($instance->$attr);
					}
					if (isset($column['fetchNamesFrom'])){
						if (isCollection($val)){
							$ids = [];
							foreach ($val as $v){
								$id = $v->getKey();
								array_push($ids,$id);
								// dd($ids, $id);
							}
						}else{
							$ids = explode(",",$val);
						}
						$vals = [];
						foreach ($ids as $id){
							$vals[] = getNameFromUid($column['fetchNamesFrom'],$id);
						}
						$val = implode(", ",$vals);
					}
					if (isset($column['hasThrough'])){
						$relationship = $column['hasThrough'];
						if(strpos($attr,"%") > -1 or strpos($attr,"!!") > -1){
							$val = complexAttr($attr,$instance,$relationship);
						}else{
							$val = $instance->$relationship->$attr;
						}
					}
					$val = ($attr !== 'duration') ? $val : $val." min";
					$val = ($attr !== 'price') ? $val : '$'.$val;
				?>
	            <td class='{{ $column["className"] }} all'><div class='tdSizeControl'>{{ $val }}<div class='indicator'>...</div></div>
	            	@if ($column["className"] != 'name' && !$hiddenFiltersAdded)
		            	@forelse ($filtersOther as $filter)
		            		<?php 
		            		$attr = $filter['attribute']; 
		            		if (!$attr){
		            			$options = $filter['filterOptions'];
		            			$valArr = [];
		            			foreach ($options as $option){
		            				if ($option['attribute'] == 'method'){
		            					$method = $option['method'];
		            					$valArr[] = $method.":".$instance->$method();
		            				}else{
			            				$attr = $option['attribute'];
			            				$valArr[] = $attr.":".$instance->$attr;            					
		            				}
		            			}
		            		}elseif($attr == 'method'){
		            			$method = $filter['method'];
		            			$valArr = [$instance->$method()];
		            		}else{
			            		$valArr = [$instance->$attr];
		            		}
		            		?>
	
			            	<div class='filter {{ $filter["filterName"] }}'>{{ implode(", ",$valArr) }}</div>
			            @empty
			            @endforelse
			            <?php $hiddenFiltersAdded = true; ?>
		            @endif
		        </td>
	            @endforeach
            </tr>
        @endforeach
		
		<tr>
    	@foreach ($columns as $column)
           	@if ($column["className"] == 'name')
	            <td class='{{ $column["className"] }} all'>No matches</td>
           	@else
	            <td class='{{ $column["className"] }} all'></td>
           	@endif
        @endforeach
		</tr>
	</table>
	<br>
    <div class='button xsmall clearTableFilters' data-target='#{{ $tableId }}'>Show All</div>

	@if ($modal)
    <div class='button xsmall cancel'>dismiss</div>
    @endif
</div>

<script type='text/javascript' src="{{ asset('js/launchpad/model-table.js') }}"></script>
<script type='text/javascript' src="{{ asset('js/launchpad/save-model.js') }}"></script>
