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
                return listReturn(view('models.navOptions.options-nav',$instance->navOptions())->render());
            }catch(\Exception $e){
                reportError($e,'scriptcontroller 106');
                return listReturn(view('models.navOptions.empty-nav',['header'=>explode("Stack",$e)[0]])->render());
            }              
        }
        public function ListWithNav($model, Request $request, $uid = null){
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
        public function createNewModel($model){
            return view('models.create',['model'=>$model]);
        }
        public function saveNewModel($model, Request $request){
            // include_once app_path("php/functions.php");
            $model = (in_array($model,['Patient','Practitioner','StaffMember'])) ? "User" : $model;
            $class = "App\\$model";

            if ($model == "Message"){
                $recipient_ids = json_decode($request->recipient_ids);
                $connectedArr = $request->connectedModels;
                // Log::info($connectedArr);
                $request->message_id = uuid();
                foreach ($recipient_ids as $id){
                    $newModel = new $class;
                    $request->recipient_id = $id;
                    $newModel->type = $request->columnObj['type'];
                    $newModel->status = $newModel->defaultStatus();
                    $result = $this->saveModel($model, $newModel, $request);
                    if ($result === true){
                        $newModel->practice_id = session('practiceId');
                        // Log::info("PracticeId ".session('practiceId'));
                        event(new OutgoingMessage($newModel));
                    }else{
                        break;
                    }
                }
            }elseif ($model == "Appointment"){
                $newModel = new $class;
                $newModel->uuid = uuidNoDash();
                $newModel->status = Appointment::defaultStatus();
                $result = $this->saveModel($model, $newModel, $request);
            }else{
                $newModel = new $class;
                $result = $this->saveModel($model, $newModel, $request);
            }

            if ($model == 'Appointment' && $result === true){
                // $newModel->createdTasks
                $practice = Practice::getFromSession();
                $apptFeeds = [
                    'appointments' => $practice->appointments,
                    'anon' => $practice->anon_appt_feed
                ];
                return listReturn(json_encode($apptFeeds), $request->path());
            }elseif ($result === true){
                return listReturn("checkmark",$request->path());
            }else{
                // Log::error($result,['location'=>'ScriptController 216']);
                reportError($result,'ScriptController 217');
                return listReturn("error",$request->path());
            }
        }
        public function UpdateModel($model, $uid, Request $request){
            // include_once app_path("php/functions.php");
            $class = "App\\$model";
            $existingInstance = $class::find($uid);
            $result = $this->saveModel($model, $existingInstance, $request);

            if ($model == 'Appointment' && $result === true){
                $practice = Practice::getFromSession();
                $apptFeeds = [
                    'appointments' => $practice->appointments,
                    'anon' => $practice->anon_appt_feed
                ];
                return listReturn($apptFeeds, $request->path());
            }elseif ($result === true){
                return listReturn("checkmark",$request->path());
            }else{
                reportError($result,'ScriptController 235');
                // Log::error($result,['location'=>'ScriptController 235']);
                return ['errors' => ["Error saving $model details.","System admin has been notified."]];
            }
        }
        public function saveModel($model, $instance, Request $request){
            $practice = Practice::getFromSession();
            $models = strtolower(plural($model));
            $columns = isset($request->columnObj) ? $request->columnObj : [];
            $trackChanges = usesTrait($instance,"TrackChanges");

            // SPECIAL STEP FOR USER / MESSAGE
                if ($model == "User" && $request->isMethod('post')){
                    $validator = Validator::make($columns, [
                        'email' => ['required', 'string', 'email', 'max:255'],
                        'username' => ['unique:users','min:5','max:255']
                    ]);
                    if ($validator->fails()){
                        return ["errors"=>$validator->errors()];
                    }
                    if (!isset($instance->password)){
                        $randomPw = Str::random(10);
                        $instance->password = Hash::make($randomPw);
                    }
                }elseif ($model == 'Message'){
                    $instance->sender_id = Auth::user()->id;
                    $instance->recipient_id = $request->recipient_id;
                    $instance->message_id = $request->message_id;
                }

            // TAKES EACH COLUMN FROM THE REQUEST AND ASSIGNS VALUES TO THE OBJECT
                $datesArr = dateFieldsArray();
                foreach($columns as $key => $value){
                    if (($model == 'Message' && $key == 'message') || ($model == 'Template' && $key == 'markup')){
                        // RETURNS ARRAY OR FALSE IF NO IMGS ARE EMBEDDED OR IF IMGS ARE ALREADY SAVED
                        // ALSO SETS ATTR MATCHING $KEY
                        $embeddedImgs = extractEmbeddedImages($columns[$key],$instance,$key);
                    }elseif(in_array($key,$datesArr)){
                        $instance->$key = Carbon::parse($value)->toDateString();
                    }else{
                        $instance->$key = $value;
                    }
                }

                if (isset($request->full_json)){
                    $instance->full_json = $request->full_json;
                }

            try{
                // Save things
                $connectedModels = isset($request->connectedModels) ? json_decode($request->connectedModels,true) : null;
                // Log::info($connectedModels);
                foreach($connectedModels as $connectedModel){
                    if ($connectedModel['model'] == 'Practitioner' && $connectedModel['connectedto'] == 'Appointment'){
                        $instance->practitioner_id = $connectedModel['uidArr'][0];
                    }
                }
                // return true;
                $instance->save();
                $uidList = session('uidList');
                $newId = $instance->getKey();
                $uidList[$model] = $newId;
                session([
                    'uidList' => $uidList,
                    $model => $newId
                ]);

                if (isset($connectedModels)){
                    $result = $this->updateRelationships($instance,$connectedModels);
                    if ($result !== true){
                        return $result;
                    }
                }
                
                if ($model == 'User' && $request->isMethod('post')){
                    $usertype = isset($columns['user_type']) ? $columns['user_type'] : "patient";
                    $usertype = ucfirst(removespaces(camel($usertype)));
                    $userClass = "App\\$usertype";
                    $user = new $userClass;
                    $user->user_id = $newId;
                    $user->save();
                }

                // IF THE PRACTITIONER HAS A SCHEDULE, UPDATE SCHEDULES
                if ($model == 'Practitioner' && isset($columns['schedule'])){
                    $practice->savePractitionerSchedules();
                }

                // SENDS PASSWORD IF RANDOMLY GENERATED
                if (isset($randomPw)){
                    $msg = new Message;
                    $template = Template::find("3");
                    $body = $template->markup;
                    $body = str_replace("%%PASSWORD%%",$randomPw,$body);
                    $msg->sender_id = Auth::user()->id;
                    $msg->recipient_id = $instance->id;
                    $msg->message_id = uuid();
                    $msg->type = 'Email';
                    $msg->subject = "New User Login Information";
                    $msg->message = $body;
                    try{
                        $msg->save();
                        event(new OutgoingMessage($msg, session('practiceId')));
                    }
                    catch(\Exception $e){
                        event(new BugReported(
                            [
                                'description' => "Sending New User Login Info", 
                                'details' => $e, 
                                'category' => 'Messages', 
                                'location' => 'ScriptController.php',
                                'user' => null
                            ]
                        ));
                        return $e;
                    }
                }
                
                // SAVES EMBEDDED IMAGES SYNC INSTANCE
                if (isset($embeddedImgs) && $embeddedImgs != false){
                    if ($trackChanges){
                        $instance->trackableSync('images',$embeddedImgs);
                    }else{
                        $instance->images()->sync($embeddedImgs);
                    }
                }

            }
            catch(\Exception $e){
                return $e;
            }

            return true;
        }
        public function deleteModel($model, $uid, Request $request){
            // include_once app_path("php/functions.php");
            $class = "App\\$model";
            $practice = Practice::getFromSession();
            try{
                if (isUser($model) && $model != "User"){
                    $userId = $class::find($uid)->user_id;
                    User::destroy($userId);
                }elseif ($model == "User"){
                    $type = ucfirst(camel(User::find($uid)->user_type));
                    $typeClass = "App\\$type";
                    $typeClass::where('user_id',$uid)->delete();
                }
                if ($model == 'Appointment'){
                    $appt = $class::find($uid);
                    // Log::info($appt,['location'=>'387','uid'=>$uid]);
                    event(new AppointmentCancelled($appt, session('practiceId'), Auth::user()->user_type, $request));
                    $appt->delete();
                }else{
                    $class::destroy($uid);
                }
                $uidList = session('uidList');
                unset($uidList[$model]);
                session(['uidList'=>$uidList]);
                session()->forget($model);

                if ($model == 'Appointment'){
                    $practice = Practice::getFromSession();
                    $apptFeeds = [
                        'appointments' => $practice->appointments,
                        'anon' => $practice->anon_appt_feed
                    ];
                    return listReturn(json_encode($apptFeeds), $request->path());
                }else{
                    return listReturn("checkmark",$request->path());
                }


                // $message = ($model == 'Appointment') ? [
                //     'appointments' => $practice->appointments,
                //     'anon' => $practice->anon_appt_feed
                // ] : "checkmark";
                // // Log::info(json_encode($message),['location'=>'scriptcontroller 411']);
                // return listReturn($message);
            }
            catch(\Exception $e){
                event(new BugReported(
                    [
                        'description' => "Deleting Model", 
                        'details' => $e, 
                        'category' => 'Messages', 
                        'location' => 'ScriptController.php',
                        'user' => null
                    ]
                ));
                return "ewwww";
            }
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
            
            return isset($e) ? listReturn($e) : listReturn('checkmark');
        }

    // EDIT / SAVE SETTINGS / SCHEDULE
        public function EditSettings($model, $uid){
            if ($model == 'Patient' && Auth::user()->user_type == 'patient'){
                $modal = false;
            }else{
                $modal = true;
            }
            return view('models.settings-modal',[
                'model' => $model,
                "uid" => $uid,
                "modal" => $modal
            ]);
        }
        public function SaveSettings($model, $uid, Request $request){
            $class = "App\\$model";
            $existingInstance = $class::find($uid);
            
            // $trackChanges = usesTrait($existingInstance,"TrackChanges");
            // if ($trackChanges){
            //     $includeFullJson = isset($existingInstance->auditOptions['includeFullJson']) ? $existingInstance->auditOptions['includeFullJson'] : false;
            //     $changes = $existingInstance->checkForChanges($existingInstance,$request,$includeFullJson);
            //     if (!$changes){return "no changes";}
            // }

            $columns = isset($request->columnObj) ? json_decode($request->columnObj,true) : null;
            if ($columns) {
                foreach($columns as $key => $value){
                    $existingInstance->$key = $value;
                }
            }

            try{
                $existingInstance->settings_json = $request->settings_json;
                $existingInstance->save();
            }catch(\Exception $e){
                return $e;
            }

            $connectedModels = isset($request->connectedModels) ? json_decode($request->connectedModels,true) : null;
            if (isset($connectedModels)){
                $result = $this->updateRelationships($existingInstance,$connectedModels);
                if ($result !== true){
                    return $result;
                }
            }

            // if ($trackChanges){
            //     $existingInstance->saveTrackingInfo($existingInstance, $changes, $request->getClientIp());
            // }

            return 'checkmark';
        }

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

    public function updateRelationships($instance, $connectedModels){
        // return $connectedModels;
        $trackChanges = usesTrait($instance,"TrackChanges");
        foreach($connectedModels as $connectedModel){
            $rel = $connectedModel['relationship'];
            $connectedModelName = $connectedModel['model'];
            $connectedTo = $connectedModel['connectedto'];
            $class = "App\\$connectedModelName";
            $uids = isset($connectedModel['uidArr']) ? $connectedModel['uidArr'] : null;
            if ($connectedModelName == 'User' && $connectedTo == 'Message'){$skip = true;}
            else {$skip = false;}
            if ($uids && !$skip){
                try{
                    if ($rel == 'belongsTo'){
                        $uid = $uids[0];
                        // CHECKS IF THE NAME OF THE RELATIONSHIP (ie METHOD) IS ALSO THE NAME OF THE MODEL
                        $method = checkAliases($instance, strtolower($connectedModelName));
                        $connectedInstance = $class::find($uid);
                        $instance->$method()->associate($connectedInstance);
                        $instance->save();
                    // }elseif ($rel == 'morphToMany'){
                    }elseif (in_array($rel,['morphToMany','morphedByMany'])){
                        $method = checkAliases($instance, strtolower(plural($connectedModelName)));
                        if ($trackChanges){
                            $instance->trackableSync($method,$uids);
                        }else{
                            $instance->$method()->sync($uids);
                        }
                        // $instance->$method()->sync($uids);
                    }
                    // elseif ($rel == 'morphedByMany'){
                    //     $method = checkAliases($instance, strtolower(plural($connectedModelName)));
                    //     if ($trackChanges){
                    //         $instance->trackableSync($method,$uids);
                    //     }else{
                    //         $instance->$method()->sync($uids);
                    //     }
                        // $instance->$method()->sync($uids);
                    // }
                }
                catch(\Exception $e){
                    reportError($e,'ScriptController 561');
                }
            }
        }
        return true;
    }
}
