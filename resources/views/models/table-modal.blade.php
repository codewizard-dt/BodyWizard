<?php
    // requires $model such that App\model resolves
    // retrieves all other necessary variables from App\model
    // called by http GET /{model}/display/modal
    // called by include('models.modal', ['model' => 'Example'])

    include_once app_path("/php/functions.php");

    // dd($model);
    unset($collection);
    $class = "App\\$model";
    $ctrl = new $class;
    $models = title(pluralSpaces($model));

    // setting table options and getting collection
    $tableOptions = $ctrl->tableValues;
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

    if (!isset($collection)){
        $collection = $class::all();
    }else{
        $collection = $collection->get();
    }

    $tableOptions['collection'] = $collection;
    $modalId = $tableOptions['tableId']."Modal";

    $tableOptions['modal'] = true;
    $tableOptions['connectedTo'] = $connectedTo;

    if ($connectedTo == $model){
        dd("KILLIN IT");
    }

?>
<div id='{{ $modalId }}' class='modalForm connectedModel' data-model='{{ $model }}' data-relationship='{{ $relationship }}' data-connectedto='{{ $connectedTo }}' data-number='{{ $number }}'>
    <h2>Available {{ $models }}</h2>
    @include('models.table',$tableOptions)
</div>

<script src="{{ asset('/js/launchpad/forms.js') }}"></script>
