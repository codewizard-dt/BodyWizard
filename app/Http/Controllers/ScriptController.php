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


class ScriptController extends Controller
{
    // private $currentInstance;

  public function __construct(){
    $this->middleware('auth');
  }

    // TABLE AND NAV VIEWS
  public function OptionsNav($model, $uid){
    $class = "App\\$model";
    $ctrl = new $class;

    if ($model == 'ServiceCategory'){
      $model = "Service Category";
    }elseif ($model == "TreatmentPlan"){
      $model = "Treatment Plan";
    }

    if (method_exists($ctrl,'tableValues')){
      $options = $class::tableValues()['optionsNavValues'];
    }else{
      $options = $ctrl->optionsNavValues;
    }

    return view('models.optionsNav',[
      'model' => $model,
      'uid' => $uid,
      'destinations' => $options['destinations'],
      'btnText' => $options['btnText']
    ]);
  }
  public function OptionsNavNew($model, $uid){
    $class = "App\\$model";
    setUid($model,$uid);
    try{
      $instance = $class::findOrFail($uid);
      $navOptions = [];
      if ($instance && method_exists($instance, 'nav_options')) $navOptions = $instance->nav_options();
      return view('models.navOptions.options-nav',array_merge($navOptions,['instance'=>$instance]));
    }catch(\Exception $e){
      reportError($e,'scriptcontroller 106');
      return view('models.navOptions.empty-nav',['header'=>explode("Stack",$e)[0]]);
    }              
  }
  public function ListWithNav($model = 'Practice', Request $request, $uid = null){
    if ($uid){setUid($model,$uid);}
    $data = ['model'=>$model,'request'=>$request];
    return view('models.table-with-nav',$data);
  }
  public function ListAsModal($model, Request $request){
    $data = [
      'model'=>$model,
      'number'=>$request->number,
      'relationship'=>$request->relationship,
      'connectedTo'=>$request->connectedTo
    ];
    if (isset($request->type)){
      $data['type'] = $request->type;
    }
    return view('models.table-modal',$data);
  }

    // SAVE / UPDATE / DELETE MODEL
  public function createNewModel($model, Request $request){
    return view('models.create.template',compact('model','request'));
  }
  public function save ($model, $columns, $relationships, $uid = null) {
    $class = "App\\$model";
    try{
      if ($uid != null){
        $instance = $class::findOrFail($uid);
        $instance->fill($columns);
        if (!$instance->isDirty()) throw new \Exception('no changes');
        $instance->update($columns);
        session(['model_action' => 'update']);
      }else{
        $instance = $class::create($columns);
        session(['model_action' => 'create']);
      }

      if ($relationships) {
        foreach ($relationships as $rel => $info) {
          $uids = $info['uids']; $method = $info['method'];
          if ($method == 'sync') $instance->$rel()->sync($uids);
          else throw new \Exception("Relationship method ($method) not defined");
        }
      }

      setUid($model, $instance->getKey());

      $response = method_exists($class, 'successResponse') ? $class::successResponse() : successResponse($model);
      if (request()->has('wants_checkmark')) $response = 'checkmark';
    }catch(\Exception $e){
      $error = handleError($e,'scriptcontroller save 100');
      $response = compact('error');
    }
    return $response;
  }
  public function save_single($model, Request $request){
    $class = "App\\$model";
    $columns = $request->input('columns', null);
    $relationships = $request->input('relationships', null);
    $uid = $request->input('uid', null);
    return $this->save($model, $columns, $relationships, $uid);
    // try{
    //   if ($request->uid != null){
    //     $instance = $class::findOrFail($request->uid);
    //     $instance->fill($request->columns);
    //     if (!$instance->isDirty()) throw new \Exception('no changes');
    //     $instance->update($request->columns);
    //     session(['model_action' => 'update']);
    //   }else{
    //     $instance = $class::create($request->columns);
    //     Log::info('relationships!',['relationships'=>$request->relationships]);
    //     session(['model_action' => 'create']);
    //   }
    //   setUid($model, $instance->getKey());

    //   $response = method_exists($class, 'successResponse') ? $class::successResponse() : successResponse($model);
    //   if ($request->has('wants_checkmark')) $response = 'checkmark';
    // }catch(\Exception $e){
    //   $error = handleError($e,'scriptcontroller save 100');
    //   $response = compact('error');
    // }
    return $response;
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
    } catch (\Exception $e) {
      $error = handleError($e,'scriptcontroller save 100');
      $response = compact('error');
    }
    return $response;
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
      $instance = $class::find($uid);
      return view("models.settings.template",compact('instance','model','uid','request'));
    }catch (\Exception $e) {
      $error = handleError($e,"edit $model");
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
      reportError($e,'ScriptController 419');
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

  // public function updateRelationships($instance, $connectedModels){
  //       // return $connectedModels;
  //   $trackChanges = usesTrait($instance,"TrackChanges");
  //   foreach($connectedModels as $connectedModel){
  //     $rel = $connectedModel['relationship'];
  //     $connectedModelName = $connectedModel['model'];
  //     $connectedTo = $connectedModel['connectedto'];
  //     $class = "App\\$connectedModelName";
  //     $uids = isset($connectedModel['uidArr']) ? $connectedModel['uidArr'] : null;
  //     if ($connectedModelName == 'User' && $connectedTo == 'Message'){$skip = true;}
  //     else {$skip = false;}
  //     if ($uids && !$skip){
  //       try{
  //         if ($rel == 'belongsTo'){
  //           $uid = $uids[0];
  //                       // CHECKS IF THE NAME OF THE RELATIONSHIP (ie METHOD) IS ALSO THE NAME OF THE MODEL
  //           $method = checkAliases($instance, strtolower($connectedModelName));
  //           $connectedInstance = $class::find($uid);
  //           $instance->$method()->associate($connectedInstance);
  //           $instance->save();
  //                   // }elseif ($rel == 'morphToMany'){
  //         }elseif (in_array($rel,['morphToMany','morphedByMany'])){
  //           $method = checkAliases($instance, strtolower(plural($connectedModelName)));
  //           if ($trackChanges){
  //             $instance->trackableSync($method,$uids);
  //           }else{
  //             $instance->$method()->sync($uids);
  //           }
  //                       // $instance->$method()->sync($uids);
  //         }
  //                   // elseif ($rel == 'morphedByMany'){
  //                   //     $method = checkAliases($instance, strtolower(plural($connectedModelName)));
  //                   //     if ($trackChanges){
  //                   //         $instance->trackableSync($method,$uids);
  //                   //     }else{
  //                   //         $instance->$method()->sync($uids);
  //                   //     }
  //                       // $instance->$method()->sync($uids);
  //                   // }
  //       }
  //       catch(\Exception $e){
  //         reportError($e,'ScriptController 561');
  //       }
  //     }
  //   }
  //   return true;
  // }
}
