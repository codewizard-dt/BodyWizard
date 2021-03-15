<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Form;
use App\Message;
use App\Template;
use App\Attachment;
use App\Image;
use App\Practice;
use App\Appointment;
use App\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Events\OutgoingMessage;
use App\Events\AppointmentSaved;
use App\Events\AppointmentCancelled;
use App\Events\BugReported;
use Google\Cloud\ErrorReporting\V1beta1\ReportErrorsServiceClient;
use Google\Cloud\ErrorReporting\V1beta1\ReportedErrorEvent;


class BaseModel extends Controller
{
    // private $currentInstance;

  public function __construct(){
    $this->middleware('auth');
  }

  public function table_index($model = 'Practice', Request $request, $uid = null){
    if ($uid){setUid($model,$uid);}
    return view('layouts.table.proxy', [
      'model' => $model,
      'is_index' => true,
      'uid' => $uid,
    ]);
  }
  public function details($model, Request $request, $uid) {
    $class = "App\\$model";
    try {
      $details = $class::instance_details(isset($uid) ? $uid : null, true);
      return $details;
    } catch (\Exception $e) {
      $error = handleError($e);
      return compact('error');
    }
  }
  public function list (Request $request) {
    try {
      $models = request('models', null);
      if ($models == null) throw new \Exception('request must include models');
      return collect($models)->mapWithKeys(function($model){
        $class = "App\\$model";
        if (!method_exists($class, 'list')) return [$model => [['uid'=>'0','name'=>'enable TableAccess']]];
        return [$model => $class::list()];
      })->toArray();
    } catch (\Exception $e) {
      $error = handleError($e);
      return compact('error');
    }
  }


  // public function ListAsModal($model, Request $request){
  //   $data = [
  //     'model'=>$model,
  //     'number'=>$request->number,
  //     'relationship'=>$request->relationship,
  //     'connectedTo'=>$request->connectedTo
  //   ];
  //   if (isset($request->type)){
  //     $data['type'] = $request->type;
  //   }
  //   return view('models.table-modal',$data);
  // }
  public function createNewModel($model, Request $request){
    return view('models.create.template',compact('model','request'));
  }
  public function save ($model, $columns, $relationships, $uid = null) {
    $class = "App\\$model";
    try{
      if ($uid != null){
        $instance = $class::findOrFail($uid);
        $none_updated = true;
        if ($relationships) {
          foreach ($relationships as $rel => $info) {
            $uids = $info['uids']; $method = $info['method'];
            if ($method == 'sync') $sync = $instance->$rel()->sync($uids);
            else throw new \Exception("Relationship method ($method) not defined");
            if ($sync['attached'] || $sync['detached'] || $sync['updated']) $none_updated = false;
          }
        } else $none_updated = false;
        $instance->fill($columns);
        if (!$instance->isDirty() && $none_updated) throw new \Exception('no changes');
        $instance->update($columns);
        session(['model_action' => 'update']);
      }else{
        $instance = new $class();
        $instance->fill($columns);
        $instance->save();
        session(['model_action' => 'create']);
        if ($relationships) {
          foreach ($relationships as $rel => $info) {
            $uids = $info['uids']; $method = $info['method'];
            if ($method == 'sync') $instance->$rel()->sync($uids);
            else throw new \Exception("Relationship method ($method) not defined");
          }
        }
      }
      $uid = $instance->getKey();
      setUid($model, $uid);

      return compact('uid');
      // if (request()->has('wants_checkmark')) $response = 'checkmark';
      // else $response = method_exists($class, 'successResponse') ? $class::successResponse() : successResponse($model);
    }catch(\Exception $e){
      $error = handleError($e,'scriptcontroller save 100');
      $request = request()->all();
      logger(compact('request'));
      $response = compact('error');
    }
    return $response;
  }
  public function save_single($model, Request $request){
    $class = "App\\$model";
    $columns = $request->input('columns', null);
    $relationships = $request->input('relationships', null);
    $uid = $request->input('uid', null);
    $save_result = $this->save($model, $columns, $relationships, $uid);
    // $model_list_update = basicList($model);
    $notification_update = Auth::user()->unreadNotifications->toJson();
    // return compact('save_result','model_list_update','notification_update');
    return compact('save_result','notification_update');
  }
  public function save_multi (Request $request) {
    try {
      $models = collect($request->models);
      $response = $models->map(function($model) {
        $columns = get($model,'columns',[]);
        $relationship = get($model,'relationships',[]);
        $uid = get($model,'uid',null);
        return $this->save($model['type'],$columns,$relationship,$uid);
      })->toArray();
      throw new \Exception('Update BaseModel save_multi to include list_update and notification_update');
    } catch (\Exception $e) {
      $error = handleError($e,'scriptcontroller save 100');
      $response = compact('error');
    }
    return $response;
  }
  public function retrieve_single($model, Request $request) {
    $class = "App\\$model"; $collection = null;
    try {
      $attrs = $request->attrs;
      $collection = $class::where($attrs)->get();
      if ($collection->count() == 0) throw new \Exception('not found');
      else if ($collection->count() > 1) throw new \Exception('more than one found');
      $response = $collection->first();
    } catch (\Exception $e) {
      $error = handleError($e,'scriptcontroller retrieve_single');
      return compact('error');
    }
    return $response;
  }
  public function retrieve_multi (Request $request) {
    return 'hello';
  }
  public function create_or_edit ($model, Request $request) {
    $class = "App\\$model"; $collection = null; $limit = $request->limit || 1;
    try {
      Log::info("CREATEorEDIT $model",['request'=>$request->all()]);
      $collection = $class::where($request->where)->limit($limit + 1)->get();
      if ($collection->count() > $limit) throw new \Exception("more than $limit found");
      $instance = $collection->count() == 1 ? $collection->first() : null;
      return view('models.create.template',compact('model','instance','request'));
    } catch (\Exception $e) {
      $error = handleError($e,'scriptcontroller create_or_edit');
      return compact('error');
    }
    // return $response;
  }
  public function edit($model, $uid, Request $request){
    try{
      $class = "App\\$model";
      $instance = $class::findOrFail($uid);
      return view("models.create.template",compact('model','instance','request'));
    }catch (\Exception $e) {
      handleError($e,"edit $model");
    }
  }
  public function delete($model, $uid) {
    try{
      $class = "App\\$model";
      $instance = $class::destroy($uid);
      return 'checkmark';
    }catch (\Exception $e) {
      $error = handleError($e,"delete $model");
      return compact('error');
    }
  }
  public function schedule($model, $uid, Request $request){
    try{
      $class = "App\\$model";
      $instance = $class::find($uid);
      return view("models.create.schedule",compact('instance','model','uid'));
    }catch (\Exception $e) {
      $error = handleError($e,"edit $model");
      return compact('error');
    }
  }
  
  public function settings($model, $uid, Request $request){
    try{
      $class = "App\\$model";
      $instance = $uid === 'proxy' ? new $class(['id'=>'proxy']) : $class::find($uid);
      return view("models.settings.template",compact('instance','model','uid','request'));
    }catch (\Exception $e) {
      $error = handleError($e,"settings $model");
      return compact('error');
    }
  }
  public function schedulePractice(Request $request){
    try{
      $uid = getUid('Practice'); $model = 'Practice';
      $instance = Practice::findOrFail(getUid('Practice'));
      return view("models.create.schedule",compact('instance','model','uid'));
    }catch (\Exception $e) {
      $error = handleError($e,"edit $model");
      return compact('error');
    }
  }
  public function BasicList($model, Request $request) {
    $columns = $request->columns;
    return basicList($model, $columns);
  }
  public function saveSubmissions(Request $request){
    try{
      $submissions = collect($request->submissions);
      $apptId = $request->columns['appointment_id'];
      $appt = Appointment::findOrFail($apptId);
      $user = Auth::user();
      $shared = [
        'patient_id' => $appt->patient->id,
        'appointment_id' => $appt->id,
        'submitted_by' => $user->user_type,
        'submitted_by_user_id' => $user->id,
      ];
      $savedIds = $submissions->map(function($responses,$formId) use ($shared){
        $form = Form::findOrFail($formId);
        $submission = \App\Submission::create([
          'responses' => $responses,
          'form_uid' => $form->form_uid,
          'form_id' => $form->form_id,
          'form_name' => $form->form_name,
          'form_user_type' => $form->user_type,
          'patient_id' => $shared['patient_id'],
          'appointment_id' => $shared['appointment_id'],
          'submitted_by' => $shared['submitted_by'],
          'submitted_by_user_id' => $shared['submitted_by_user_id'],
        ]);
        return $submission->id;
      })->toArray();
      $result = $savedIds;
    }catch(\Exception $e){
      reportError($e,'script controller, save submissions');
      $result = null;
    }
    return $result;
  }
  public function AddNotes($model, $uid){
    return view('layouts.forms.add-note-modal',["model"=>$model,"uid"=>$uid]);
  }
  public function savePinnedNotes($model, $uid, Request $request){
    try{
      $class = "App\\$model";
      $instance = $class::find($uid);
      $instance->notes = $request->notes;

      if (array_key_exists('autosave',$instance->makeVisible('autosave')->attributesToArray())){
        if ($instance->autosave) {
          $data = $instance->autosave;
          $data['notes'] = $request->notes;
          $instance->autosave = $data;
        }else {
          $instance->autosave = ['notes'=>$request->notes];
        }
      }
      $instance->save();
    }catch(\Exception $e){
      reportError($e,'BaseModel 419');
    }

    return isset($e) ? $e : 'checkmark';
  }

    // EDIT / SAVE SETTINGS / SCHEDULE
  public function fetchModel($model, $uid, Request $request){
    $class = "App\\$model";
    if ($uid == 'default'){
      $existingInstance = $class::where('name','default')->first();
      if (!$existingInstance){return "not found";}
    }else{
      $existingInstance = $class::find($uid);
      if (!$existingInstance){return "not found";}
    }
        // $uid = ($uid == 'default') ? 2 : $uid;
    embeddedImgsToDataSrc($existingInstance,$model);
    if ($model == 'Form'){
      return $existingInstance->formDisplay(true);
    }elseif($model == "Submission"){
      return $existingInstance->form->formDisplay(true,false)."<div id='responses' data-json='".json_encode($existingInstance->responses)."'></div>";
    }else{
      return $existingInstance;
    }
  }
  public function selection_modal ($model, Request $request){
    return view('layouts.table.proxy', compact('model'));
  }

}
