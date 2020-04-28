<?php 
$dataAttrs = [];
foreach($filters as $name => $options){
	$values = [];
	try{
		foreach($options as $key => $attr){
			if ($instance->$attr === true) $values[] = camel($key);
		}
	}catch(\Exception $e){
		reportError($e,'table.row 10');
	}
	$dataAttrs[] = ['key'=>camel($name),'value'=>json_encode($values)];
}
foreach ($extraData as $name => $attr){
	$dataAttrs[] = ['key'=>camel($name),'value'=>json_encode($instance->$attr)];
}
?>
<tr data-uid='{{$instance->getKey()}}' data-{{$index}}='{{$instance->$index}}' @foreach ($dataAttrs as $data) data-{{$data['key']}}="{{$data['value']}}"@endforeach>
	@foreach ($columns as $key => $attr)
	<?php 
		try{
			$val = $instance->$attr;
			if (in_array($attr,['date','datetime','created_at','updated_at'])) $val = dateOrTimeIfToday(strtotime($val));
		}catch(\Exception $e){
			reportError($e,'table.row 22 '.getModel($instance)." attr: ".json_encode($attr));
			$val = "ERROR";
		}
	?>
    <td class='{{camel($key)}} all'>
    	<div class='tdSizeControl'>{{$val}}<div class='indicator'>...</div></div>
    </td>
    @endforeach
</tr>
