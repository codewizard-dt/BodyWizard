<?php 
// $dataAttrs = [];
// foreach ($extraData as $name => $attr){
// 	$dataAttrs[camel($name)] = json_encode($instance->$attr);
// }
// $dataStr = dataAttrStr(collect($dataAttrs));
$filterData = [];
collect($filters)->each(function($filter) use ($instance,&$filterData){
	$attr = $filter['attribute']; 
	$value = $instance->$attr;
	$filterData[$attr] = $value;
});
$getSetting = function ($string) use ($instance){
	$info = explode(':',$string);
	$dot = $info[1];
	$default = count($info) > 2 ? $info[2] : null;

	$setting = $instance->get_setting($dot, $default);
	if (is_array($setting)) $setting = implodeAnd($setting);
	return $setting;
};
?>
<tr data-uid='{{$instance->getKey()}}' data-{{$index}}='{{$instance->$index}}' data-filters='{{json_encode($filterData)}}'>
	@foreach ($columns as $key => $attr)
	<?php 
		try{
			$isSetting = strpos($attr, 'setting:') !== false;
			$val = $isSetting ? $getSetting($attr) : $instance->$attr;
			if (in_array($attr,['date','datetime','created_at','updated_at'])) $val = dateOrTimeIfToday(strtotime($val));
			if ($val === true) $val = "<img class='checkmark' src='/images/icons/checkmark_green.png'>";
			else if ($val === false) $val = "";
		}catch(\Exception $e){
			reportError($e,'table.row 22 '.getModel($instance)." attr: ".json_encode($attr));
			$val = "ERROR";
		}
	?>
    <td class='{{camel($key)}} all'>
    	<div class='td_size_control'>{!!$val!!}<div class='indicator'>...</div></div>
    </td>
    @endforeach
</tr>
