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

class ScriptController extends Controller
{
    // private $currentInstance;

    public function __construct(){
        $this->middleware('auth');
    }

    // SESSION FUNCTIONS
        public function GetVar(Request $request){
            $key = $request->getVar;
            if (is_array(session($key))) {
                return json_encode(session($key));
            }else{
                return session($key);
            }
        }
        public function SetVar(Request $request){	
        	$variables = $request->all();
    		foreach($variables as $key => $val){
                if ($key == 'setUID'){
                    $uidList = session('uidList');
                    foreach ($val as $model => $uid){
                        $uidList[$model] = $uid;
                        session([$model => $uid]);
                    }
                    session(['uidList' => $uidList]);
                    // return $uidList;
                }else{
                    $request->session()->put($key, $val);
                    // return session($key);
                }
    		    if ($val == "unset"){
    				$request->session()->forget($key);
                    // return null;
    		    }
    		}
        	return listReturn('checkmark',$request->path());
            // return response()->withLists('checkmark');
        }
        // public function notificationCheck(Request $request){
        //     $user = Auth::user();
        //     if ($request->category == 'unread'){
        //         $notifications = $user->unreadNotifications;
        //     }elseif ($request->category == 'all'){
        //         $notfications = $user->notifications;
        //     }
        //     return $notifications;
        // }

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
        public function ResourceTable($model){
            include_once app_path("php/functions.php");
            unset($collection);
            $class = "App\\$model";
            $ctrl = new $class;
            $models = plural($model);

            // setting table options and getting collection
            if (method_exists($ctrl,'tableValues')){
                $tableOptions = $class::tableValues();
            }else{
                $tableOptions = $ctrl->tableValues;
            }
            $tableOptions = $ctrl->tableValues;
            if (!isset($orderBy)){
                $orderBy = isset($tableOptions['orderBy']) ? $tableOptions['orderBy'] : null;
            }
            if (!isset($where)){
                $where = isset($tableOptions['where']) ? $tableOptions['where'] : null;
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
            return view('models.table',$tableOptions);
        }
        public function ListWithNav($model, Request $request, $uid = null){
            // Log::info("\n\n".$request->path()." uid:". $uid);
            if ($uid){setUid($model,$uid);}
            return view('models.table-with-nav',['model'=>$model,'request'=>$request]);
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
            // $model = (in_array($model,['Patient','Practitioner','StaffMember'])) ? "User" : $model;
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
                $apptFeeds = [
                    'appointments' => Practice::AppointmentEventFeed(),
                    'anon' => Practice::anonApptEventFeed()
                ];
                return listReturn($apptFeeds, $request->path());
            }elseif ($result === true){
                return listReturn("checkmark",$request->path());
            }else{
                return $result;
            }
        }
        public function UpdateModel($model, $uid, Request $request){
            // include_once app_path("php/functions.php");
            $class = "App\\$model";
            $existingInstance = $class::find($uid);

            $result = $this->saveModel($model, $existingInstance, $request);

            if ($model == 'Appointment' && $result === true){
                $apptFeeds = [
                    'appointments' => Practice::AppointmentEventFeed(),
                    'anon' => Practice::anonApptEventFeed()
                ];
                return listReturn($apptFeeds, $request->path());
            }elseif ($result === true){
                return listReturn("checkmark",$request->path());
            }else{
                return $result;
            }
        }
        public function saveModel($model, $instance, Request $request){
            $models = strtolower(plural($model));
            $columns = isset($request->columnObj) ? $request->columnObj : [];
            $trackChanges = usesTrait($instance,"TrackChanges");

            if ($trackChanges && $request->isMethod('patch')){
                $includeFullJson = isset($instance->auditOptions['includeFullJson']) ? $instance->auditOptions['includeFullJson'] : false;
                $changes = $instance->checkForChanges($instance,$request,$includeFullJson);
                if (!$changes){return "no changes";}
            }

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
                // return $columns;
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
                $instance->save();
                $uidList = session('uidList');
                $newId = $instance->getKey();
                $uidList[$model] = $newId;
                session([
                    'uidList' => $uidList,
                    $model => $newId
                ]);

                $connectedModels = isset($request->connectedModels) ? json_decode($request->connectedModels,true) : null;
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
                    if ($usertype == 'patient'){
                    }
                    $user = new $userClass;
                    $user->user_id = $newId;
                    $user->save();
                }

                if ($trackChanges && $request->isMethod('patch')){
                    $instance->saveTrackingInfo($instance, $changes, $request->getClientIp());
                }

                if ($model == 'Appointment'){
                    $method = $request->method();
                    $result = $instance->saveToGoogleCal($method);
                    if ($result !== true){return $result;}
                    $result = $instance->saveToFullCal();
                    // if ($request->isMethod('post')){
                    // $returnMe = Practice::AppointmentEventFeed();
                    // if ($method == 'post'){
                    //     $changes = null;
                    // }
                    $changes = isset($changes) ? $changes : null;
                    event(new AppointmentSaved($instance, $changes, session('practiceId'), Auth::user()->user_type));
                }

                // IF THE PRACTITIONER HAS A SCHEDULE, UPDATE SCHEDULES
                if ($model == 'Practitioner' && isset($columns['schedule'])){
                    Practice::savePractitionerSchedules();
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
                    $instance->images()->sync($embeddedImgs);
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
                    Log::info($appt,['location'=>'387','uid'=>$uid]);
                    event(new AppointmentCancelled($appt, session('practiceId'), Auth::user()->user_type, $request));
                    $appt->delete();
                }else{
                    $class::destroy($uid);
                }
                $uidList = session('uidList');
                unset($uidList[$model]);
                session(['uidList'=>$uidList]);
                session()->forget($model);
                return ($model == 'Appointment') ? [
                    'appointments' => Practice::AppointmentEventFeed(),
                    'anon' => Practice::anonApptEventFeed()
                ] : "checkmark";
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
            include_once app_path("php/functions.php");
            $class = "App\\$model";
            $existingInstance = $class::find($uid);
            
            $trackChanges = usesTrait($existingInstance,"TrackChanges");
            if ($trackChanges){
                $includeFullJson = isset($existingInstance->auditOptions['includeFullJson']) ? $existingInstance->auditOptions['includeFullJson'] : false;
                $changes = $existingInstance->checkForChanges($existingInstance,$request,$includeFullJson);
                if (!$changes){return "no changes";}
            }

            $columns = isset($request->columnObj) ? json_decode($request->columnObj,true) : null;
            if ($columns) {
                foreach($columns as $key => $value){
                    $existingInstance->$key = $value;
                }
            }

            try{
                $existingInstance->settings_json = $request->settings_json;
                if (isset($request->settings)){
                    $existingInstance->settings = json_decode($request->settings,true);
                }
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

            if ($trackChanges){
                $existingInstance->saveTrackingInfo($existingInstance, $changes, $request->getClientIp());
            }

            return 'checkmark';
        }

    public function fetchModel($model, $uid, Request $request){
        include_once app_path("php/functions.php");
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
                    }elseif ($rel == 'morphToMany'){
                        $method = checkAliases($instance, strtolower(plural($connectedModelName)));
                        $instance->$method()->sync($uids);
                    }elseif ($rel == 'morphedByMany'){
                        $method = checkAliases($instance, strtolower(plural($connectedModelName)));
                        $instance->$method()->sync($uids);
                    }
                }
                catch(\Exception $e){
                    return $e;
                }
            }
        }
        return true;
    }
}
