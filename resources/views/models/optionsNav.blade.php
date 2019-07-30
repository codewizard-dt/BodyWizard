<?php    	
include_once app_path("/php/functions.php");
use Illuminate\Support\Str;


$nospaces = removespaces($model);
$class = "App\\$nospaces";
$count = $class::all()->count();
$navId = "Current".$nospaces;
// $tabStr = replacespaces(strtolower(plural($model)));
$tabStr = Str::snake($model);
$hideClass = $uid ? "" : " hide";

$type = (session('diagnosisType')!==null) ? session('diagnosisType') : "";
$dxTypeStr = ($type=="") ? "" : " data-dxtype='$type'";
if ($model == 'Diagnosis' && $uid != null){
	$instanceType = $class::find($uid)->medicine_type;
	$uid = ($instanceType != $type) ? null : $uid;
}

echo "<div id='$navId' class='optionsNav wrapMe$hideClass' data-model='$model' data-tabanchor='$tabStr' data-uid='$uid'$dxTypeStr>";
if ($uid===null and $count > 0){
	//instance not selected and no instances
	echo "<div class='navHead'>";
    echo "<span class='name'>No ".strtolower($model)." selected</span><br>";
    optionButtons($destinations, $btnText);
    echo "</div>";
}
elseif ($count === 0){
	//instance not selected, many instances
	echo "<div class='navHead'>";
    echo "<span class='name'>No ".strtolower(plural($model))." available</span><br>";
    optionButtons($destinations, $btnText);
    echo "</div>";
}
elseif ($uid != null){
	// select instance and set session uid
	$instance = $class::find($uid);
	$uidLabel = $instance->getKeyName();
    session([$nospaces => $uid]);
    
    // update uidList in session
	if (session('uidList')===null){
		session(['uidList' => array()]);
	}
	$uidList = session('uidList');
	$uidList[$nospaces] = $uid;
	session(['uidList' => $uidList]);

	// replace image id references with data strings
	embeddedImgsToDataSrc($instance,$nospaces);
	// get Display name of instance
	$name = (isset($instance->nameAttr)) ? complexAttr($instance->nameAttr,$instance) : $instance->name;
	// include submission data if available
	$jsonStr = isset($instance->full_json) ?  str_replace("'","\u0027",$instance->full_json) : null;
	// include summernote data if available
	$markupStr = isset($instance->markup) ?  e($instance->markup) : null;

	if (isset($instance->connectedModels)){
		$connectedModels = $instance->connectedModels;
		$modelArr = [];
		foreach($connectedModels as $connectedModel){
			$cModel = checkAliases($instance, $connectedModel[0]);
			$cModels = checkAliases($instance, plural($cModel));
			$cmodel = checkAliases($instance, strtolower($cModel));
			$cmodels = checkAliases($instance, strtolower($cModels));
			// dd($connectedModels);
			$number = $connectedModel[1];
			try{
				if ($number == 'one'){
					$connectedInstance = $instance->$cmodel;
					if ($connectedInstance!== null){
						$key = $connectedInstance->getKey();
						$modelArr[$cModel] = [$key];						
					}
				}elseif ($number == 'many'){
					$keyArr = [];
					$connectedInstances = $instance->$cmodels;
					if ($connectedInstances!==null){
						foreach ($connectedInstances as $cinstance){
							$keyArr[] = $cinstance->getKey();
						}
						$modelArr[$cModel] = $keyArr;
					}
				}
			}
			catch(\Exception $e){
				dd($e);
			}
		}
	}else{unset($modelArr);}
	$connectedModelStr = (isset($modelArr)) ? json_encode($modelArr) : "";

	echo "<div class='navHead'>";
    echo "<span class='optionsBar'><span class='name' data-json='$jsonStr' data-markup='$markupStr' data-uid='$uid' data-connectedmodels='$connectedModelStr'>$name</span><br>";
    optionButtons($destinations,$btnText);
    echo "</span>";
	echo "</div>";
	echo "<div class='navDetails'>";
	$instance->optionsNav($uid);
	echo "</div><div class='toggleDetails down'>".strtolower($model)." details<div class='arrow'></div></div>";
}

echo "</div>";
?>
