<?php
    // called by GET /{model}/display/list
    $nospaces = removespaces($model);
    $class = "App\\$nospaces";
    $ctrl = new $class;
    // $models = plural($model);
    $models = title(pluralSpaces($model));

    // setting table options and getting collection
    try{
        $tableOptions = $class::tableValues();
    }catch(\Exception $e){
        reportError($e, 'table with nav 13');
        dd($e);
    } 

    $tableOptions['createBtnText'] = isset($tableOptions['createBtnText']) ? $tableOptions['createBtnText'] : "Add New $model";
    $tableOptions['displayName'] = isset($tableOptions['displayName']) ? $tableOptions['displayName'] : "$model";
    $tableOptions['modal'] = false;

    if (!isset($collection)){
        $orderBy = isset($tableOptions['orderBy']) ? $tableOptions['orderBy'] : [];
        $orderBy = isset($request->order_by) ? array_merge($orderBy,$request->order_by) : $orderBy;
        $orderBy = $orderBy != [] ? $orderBy : null;

        $where = isset($tableOptions['where']) ? $tableOptions['where'] : [];
        $where = isset($request->where) ? array_merge($where,$request->where) : $where;
        $where = $where != [] ? $where : null;

        $with = isset($tableOptions['with']) ? $tableOptions['with'] : null;

        // SPECIAL STEPS TO SELECT A SUBSET OF COLLECTION
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
            if ($with){
                $collection = $class::with($with);
            }
            if ($where){
                if (!isset($collection)){
                    $collection = $class::where($where);
                }else{
                    $collection->where($where);
                }
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
    }

    $tableOptions['collection'] = $collection;
    $tableOptions['tableType'] = 'primary';

    $uid = getUid($nospaces);
    $navOptions['uid'] = $uid;

    try{
        $instance = $class::findOrFail($uid);
        $navOptions = $instance->navOptions();
    }catch(\Exception $e){
        $navOptions = ['uid'=>null];
    }
    if ($model == 'User' && session('userType') !== null){
        $headerText = title(pluralSpaces(session('userType')));
    }else{
        $headerText = $models;
    }
?>

<h1 class="purple paddedXSmall">{{$headerText}}</h1>

@include('models.navOptions.options-nav',$navOptions)
<div class="central large">
    @include('models.table-new',$tableOptions)
</div>


@if (findFormId($nospaces))
    @include('models.create-modal',['model'=>$nospaces,'request'=>$request])
    @include('models.edit-modal',['model'=>$nospaces,'request'=>$request])
@endif

<div id="delete{{ $nospaces }}" class='modalForm prompt'>
    <div>
        <h3 class='pink central'>Are you sure you want to delete the {{ singularSpaces($model) }} <span class='name'></span>?</h3>
        <h3 class='pink marginSmall topOnly underlined'>This cannot be undone.</h3>
    </div>
    <div class="options">
        <div class='button delete pink medium' data-model='{{ $nospaces }}'>Delete</div>
        <div class='button cancel medium'>Cancel</div>   
    </div>
</div>

@include ('portal.list-update')
@include ('portal.user.notifications')