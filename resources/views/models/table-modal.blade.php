<?php
    unset($collection);
    $class = "App\\$model";
    $ctrl = new $class;
    $models = title(pluralSpaces($model));

    // setting table options and getting collection
    try{
        $tableOptions = $class::tableValues();
    }catch(\Exception $e){
        reportError($e, 'table modal 19');
        dd($e);
    } 
	$orderBy = isset($tableOptions['orderBy']) ? $tableOptions['orderBy'] : null;
	$where = isset($tableOptions['where']) ? $tableOptions['where'] : null;

    // SPECIAL STEP FOR DIAGNOSIS
        if ($model=='Diagnosis'){
            if (isset($request->type)){
                $arr = ['medicine_type','=',$request->type];
                session(['diagnosisType'=>$request->type]);
                if (!$where){
                    $where = [$arr];
                }else{
                    array_push($where,$arr);
                }
            }else{
                session()->forget('diagnosisType');
            }
        }

    if ($where){
        $collection = $class::where($where);
    }
    if ($orderBy){
        foreach ($orderBy as $method){
            $attr = $method[0];
            $dir = $method[1];
            if (!isset($collection)){
                $collection = $class::orderBy($attr, $dir);
            }else{
                $collection->orderBy($attr, $dir);
            }
        }
    }
    try{
        if (!isset($collection)){
            $collection = $class::all();
        }else{
            $collection = $collection->get();
        }
    }catch(\Exception $e){
        reportError($e,'table-modal.blade 60');
    }
    if (!isset($collection)) dd($class);

    $tableOptions['collection'] = $collection;
    $modalId = $tableOptions['tableId']."Modal";
    $tableOptions['createBtnText'] = isset($tableOptions['createBtnText']) ? $tableOptions['createBtnText'] : "Add New $model";
    $tableOptions['displayName'] = isset($tableOptions['displayName']) ? $tableOptions['displayName'] : "$model";
    $tableOptions['modal'] = true;
    $tableOptions['connectedTo'] = $connectedTo;
    $tableOptions['nospaces'] = removespaces($model);
    $tableOptions['tableType'] = 'secondary';


    $skip = false;
    if ($connectedTo == $model){
        $skip = true;
    }elseif ($model == 'Patient' && \Auth::user()->user_type == 'patient'){
        $skip = true;
    }

?>
@if (!$skip)
    <div id='{{ $modalId }}' class='modalForm connectedModel' data-model='{{ $model }}' data-relationship='{{ $relationship }}' data-connectedto='{{ $connectedTo }}' data-number='{{ $number }}'>
        <h2>Available {{ $models }}</h2>
        @include('models.table-new',$tableOptions)
    </div>
@endif
