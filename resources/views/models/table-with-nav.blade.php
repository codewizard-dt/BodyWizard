<?php
    Use Illuminate\Support\Str;
    include_once app_path("/php/functions.php");

    // called by GET /{model}/display/list
    $nospaces = removespaces($model);
    $class = "App\\$nospaces";
    $ctrl = new $class;
    // $models = plural($model);
    $models = Str::plural($model);

    // setting table options and getting collection
    $tableOptions = $ctrl->tableValues;
    $orderBy = isset($tableOptions['orderBy']) ? $tableOptions['orderBy'] : [];
    $orderBy = isset($request->order_by) ? array_merge($orderBy,$request->order_by) : null;

    $where = isset($tableOptions['where']) ? $tableOptions['where'] : [];
    $where = isset($request->where) ? array_merge($where,$request->where) : null;

    // SPECIAL STEP FOR DIAGNOSIS / USERS
        if ($model=='Diagnosis'){
            if (!isset($request->type)){
                session()->forget('diagnosisType');
            }else{
                $arr = ['medicine_type','=',$request->type];
                session(['diagnosisType'=>$request->type]);
                session(['subCollection'=>session('diagnosisType')]);
                if (!$where){
                    $where = [$arr];
                }else{
                    array_push($where,$arr);
                }                
            }
        }elseif ($model == 'User'){
            if (!isset($request->type)){
                session()->forget('userType');
            }else{
                $arr = ['user_type','=',$request->type];
                session(['userType'=>$request->type]);
                session(['subCollection'=>session('userType')]);
                if (!$where){
                    $where = [$arr];
                }else{
                    array_push($where,$arr);
                }
            }
        }else{
            session()->forget('subCollection');
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

    // setting optionsNav variables
    $navOptions = $ctrl->optionsNavValues;
    $uid = session($nospaces);
    $navOptions['uid'] = $uid;

?>

<div class="central large">
    @if ($model == 'Diagnosis' && session('diagnosisType') !== null)
        <h2 class='purple paddedSmall'>{{ session('diagnosisType') }} {{ $models }}</h2>
    @elseif ($model == 'User' && session('userType') !== null)
        <h2 class='purple paddedSmall'>Current {{ ucfirst(session('userType')) }}s</h2>
    @elseif ($model == 'Message')
        <h2 class='purple paddedSmall'>{{ $model }} Center</h2>
    @else
        <h2 class='purple paddedSmall'>Available {{ $models }}</h2>
    @endif
    @include('models.optionsNav',$navOptions)
    @include('models.table',$tableOptions)
</div>

@if ($model != 'Form')
    @include('models.create-modal',['model'=>$nospaces,'request'=>$request])
    @include('models.edit-modal',['model'=>$nospaces,'request'=>$request])
    <script type='text/javascript' src='{{ asset("js/launchpad/save-model.js") }}'></script>
@endif

<div id="delete{{ $nospaces }}" class='modalForm prompt'>
    <div>
        <h3 class='pink'>Are you sure you want to delete the {{ strtolower($model) }} <span class='name'></span>?<br>This cannot be undone.</h3>    
    </div>
    <div class="options">
        <div class='button delete pink medium' data-model='{{ $nospaces }}'>Delete</div>
        <div class='button cancel medium'>Cancel</div>   
    </div>
</div>


<script src="{{ asset('/js/launchpad/forms.js') }}"></script>
