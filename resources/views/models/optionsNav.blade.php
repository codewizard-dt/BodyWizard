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
	try{
		if (!$uid){$extraClasses[] = 'hide';}

		if (session("diagnosisType") !== null){
			$extraData[] = ['dxtype',session('diagnosisType')];
		}
		if ($model == 'Diagnosis' && $uid != null){
			$instanceType = $class::find($uid)->medicine_type;
			$uid = (isset($type) && $instanceType != $type) ? null : $uid;
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
			if ($instance === null) throw new \Exception('$instance ===  null, optionsNav 34');
			$uidLabel = $instance->getKeyName();
			$uidList = (session('uidList')!==null) ? session('uidList') : [];
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
				$markupStr = isset($instance->markup) ?  $instance->markup : null;
			}
			if ($model == "Form" && Auth::user()->user_type == "patient"){
				$submission = $instance->submissions()->get()->last();
				if ($submission){$extraData[] = ['lastsubmission',$submission->id];}
			}

			// ADDING OPTIONSNAV BUTTONS BASED ON ATTRIBUTES
				if ($model == 'ChartNote'){
					if ($instance->signed_at == 'not signed'){
						$destinations = ['edit'];
						$btnText = ['continue note'];
					}else {
						$destinations = ['view','addNote'];
						$btnText = ['view','add addendum'];
					}
				}
				if ($model == 'Form'){
					if (!$instance->active) {
						$destinations[] = 'setAsActiveForm';
						$btnText[] = 'use this version';
					}
				}

			if ($markupStr){$extraData[] = ['markup',$markupStr];}
			if ($jsonStr){$extraData[] = ['json',$jsonStr];}

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
						reportError($e,'optionsNav 109');
					}
				}
			}
			if ($modelArr){
				$extraData[] = ['connectedmodels',json_encode($modelArr)];
			}
		}
	}
	catch(\Exception $e){
		reportError($e,'optionsNav 120');
	}
?>

<div class="optionsNavWrapper">
	@if (!isset($e))
		<h3 class="optionsNavHeader purple paddedSmall topOnly">{{$nameText}}</h3>
		<div id="Current{{$nospaces}}" class="optionsNav {{implode(' ', $extraClasses)}}" data-model="{{$model}}" data-uid="{{$uid}}">
			<div class="navHead">
				<span class="optionsBar">
					<span class="name" data-uid="{{$uid}}" 
					@foreach ($extraData as $data) data-{{$data[0]}}='{{$data[1]}}'@endforeach
					></span>
				</span>
			</div>
			<div class="navDetails">
				{{optionButtons($destinations,$btnText)}}
				@if (isset($instance))
				{{$instance->moreOptions()}}
				@endif
			</div>
			<div class="toggleDetails down">
				<span class="label">more</span>
				<div class="arrow"></div>
			</div>
		</div>
		@include ('portal.list-update')
	@else
		<h3 class="optionNavHeader purple paddedSmall topOnly">Error Loading Options</h3>
		<div>We notified a team member about this.</div>
	@endif
</div>
