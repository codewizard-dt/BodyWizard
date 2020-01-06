<?php    	
	use Illuminate\Support\Str;
	use Illuminate\Support\Facades\Log;

	$nospaces = removespaces($model);
	$class = "App\\$nospaces";
	$count = $class::all()->count();
	$extraClasses = [];
	$extraData = [];
	$jsonStr = "";
	$markupStr = "";
	if (!$uid){$extraClasses[] = 'hide';}

	if (session("diagnosisType") !== null){
		$extraData[] = ['dxtype',session('diagnosisType')];
	}
	if ($model == 'Diagnosis' && $uid != null){
		$instanceType = $class::find($uid)->medicine_type;
		$uid = ($instanceType != $type) ? null : $uid;
	}

	if ($uid===null and $count > 0){
		//instance not selected and no instances
	    $nameText = "No ".strtolower($model)." selected";
	}
	elseif ($count === 0){
		//instance not selected, many instances
	    $nameText = "No ".strtolower(plural($model))." available";
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
		if (isset($instance->nameAttr)){
			$name = $instance->nameAttr;
			if (is_array($name)){$nameText = complexAttr($name[0],$instance,$name[1]);}
			else{$nameText= complexAttr($name,$instance);}
		}elseif (isset($instance->name)){
			$nameText = $instance->name;
		}else{
			$nameText = "NO NAME";
		}
		if (isUser($model)){
			$jsonStr = str_replace("'","\u0027",$instance->userInfo->full_json);
			$userType = $instance->userInfo->user_type;
			$isAdmin = $instance->userInfo->is_admin;
			$userId = $instance->user_id;
		}else{
			$jsonStr = isset($instance->full_json) ?  str_replace("'","\u0027",$instance->full_json) : null;
			$userType = isset($instance->user_type) ? $instance->user_type : null;
			$isAdmin = isset($instance->is_admin) ? $instance->is_admin : null;
			$userId = isset($instance->user_id) ? $instance->userInfo->user_id : null;
			$markupStr = isset($instance->markup) ?  $instance->markup : null;
		}
		if ($model == "Form" && Auth::user()->user_type == "patient"){
			$submission = $instance->submissions()->get()->last();
			if ($submission){$extraData[] = ['lastsubmission',$submission->id];}
		}

		if ($markupStr){$extraData[] = ['markup',$markupStr];}
		if ($jsonStr){$extraData[] = ['json',$jsonStr];}
		if ($userType){$extraData[] = ['usertype',$userType];}
		if ($isAdmin){$extraData[] = ['isadmin',$isAdmin];}
		if ($userId){$extraData[] = ['userid',$userId];}

		$modelArr = null;
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
		}
		if ($modelArr){
			$extraData[] = ['connectedmodels',json_encode($modelArr)];
		}
	}
	$currentTabs = (session('CurrentTabs') !== null) ? session('CurrentTabs') : [];
	$uids = (session('uidList') !== null) ? session('uidList') : [];

?>

<div class="optionsNavWrapper">
	<h2 class="optionsNavHeader purple paddedSmall">
		Currently Selected {{$model}}<br>
		<span class='hide'>hide</span>
	</h2>
	<div id="Current{{$nospaces}}" class="optionsNav wrapMe {{implode(' ', $extraClasses)}}" data-model="{{$model}}" data-uid="{{$uid}}">
		<div class="navHead">
			<span class="optionsBar">
				<span class="name" data-uid="{{$uid}}" 
				@foreach ($extraData as $data) data-{{$data[0]}}='{{$data[1]}}'@endforeach
				>{{$nameText}}</span><br>
				{{optionButtons($destinations,$btnText)}}
			</span>
		</div>
		<div class="navDetails">
			@if (isset($instance))
			{{$instance->moreOptions()}}
			@endif
		</div>
		<div class="toggleDetails down">
			<span class="label">more {{strtolower(proper($model))}} details</span>
			<div class="arrow"></div>
		</div>
	</div>
	<div class="listUpdate" data-tabs='{{json_encode($currentTabs)}}' data-uids='{{json_encode($uids)}}'></div>
</div>
