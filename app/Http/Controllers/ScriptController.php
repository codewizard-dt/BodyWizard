<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Form;
use App\Message;
use App\Attachment;
use App\Image;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Events\OutgoingMessage;

class ScriptController extends Controller
{
    // private $currentInstance;

    public function __construct(){
        $this->middleware('auth');
    }

    // RANDO FUNCTIONS
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
    		     $request->session()->put($key, $val);
    		    if ($val == "unset"){
    				$request->session()->forget($key);
    		    }
    		}
        	// return true;
        }

        public function CalFeed(){
        	$usertype = Auth::user()->user_type;
        	$id = Auth::user()->id;
        	if ($usertype == 'practitioner')
        	{
        		return "<div id='calfeed' data-events='".file_get_contents(storage_path('app/calendar/'.$usertype."-feed.php"))."'></div>";
        	}
        	else if ($usertype == 'patient')
        	{

        	}
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

            $options = $ctrl->optionsNavValues;

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
        public function ListWithNav($model, Request $request){
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
            include_once app_path("php/functions.php");
            $class = "App\\$model";
            // Log::info($newModel);
            // Log::info($request);

            $recipient_ids = json_decode($request->recipient_ids);
            if ($model == "Message"){
                $connectedArr = $request->connectedModels;
                // Log::info($connectedArr);
                $request->message_id = uuid();
                foreach ($recipient_ids as $id){
                    $newModel = new $class;
                    $request->recipient_id = $id;
                    $result = $this->saveModel($model, $newModel, $request);
                    if ($result === true){
                        event(new OutgoingMessage($newModel));
                    }else{
                        break;
                    }
                }
            }else{
                $newModel = new $class;
                $result = $this->saveModel($model, $newModel, $request);
            }

            if ($result === true){
                return "checkmark";
            }else{
                return $result;
            }
        }
        public function UpdateModel($model, $uid, Request $request){
            include_once app_path("php/functions.php");
            $class = "App\\$model";
            $existingInstance = $class::find($uid);

            $result = $this->saveModel($model, $existingInstance, $request);
            // Log::info($result);
            if ($result === true){
                return "checkmark";
            }else{
                return $result;
            }
        }
        public function saveModel($model, $instance, Request $request){
            $models = strtolower(plural($model));
            $columns = isset($request->columnObj) ? json_decode($request->columnObj,true) : [];

            // SPECIAL STEP FOR USER / MESSAGE
                if ($model == "User"){
                    $validator = Validator::make($columns, [
                        'email' => ['required', 'string', 'email', 'max:255'],
                        'username' => ['unique:users','min:5','max:255']
                    ]);
                    if ($validator->fails()){
                        return ["errors"=>$validator->errors()];
                    }
                    if (isset($instance->password)){
                        return "YES PW";
                    }else{
                        $randomPw = Str::random(12);
                        return $randomPw;
                    }
                }elseif ($model == 'Message'){
                    $instance->sender_id = Auth::user()->id;
                    $instance->recipient_id = $request->recipient_id;
                    $instance->message_id = $request->message_id;
                }

            // TAKES EACH COLUMN FROM THE REQUEST AND ASSIGNS VALUES TO THE OBJECT
            foreach($columns as $key => $value){
                if (($model == 'Message' && $key == 'message') || ($model == 'Template' && $key == 'markup')){
                    // RETURNS ARRAY OR FALSE IF NO IMGS ARE EMBEDDED OR IF IMGS ARE ALREADY SAVED
                    // ALSO SETS ATTR MATCHING $KEY
                    $embeddedImgs = extractEmbeddedImages($columns[$key],$instance,$key);
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
                
                // SAVES EMBEDDED IMAGES SYNC INSTANCE
                if (isset($embeddedImgs) && $embeddedImgs != false){
                    $instance->images()->sync($embeddedImgs);
                }

            }
            catch(\Exception $e){
                return $e;
            }

            // // return $instance;
            // if ($model == 'Message'){
            //     event(new OutgoingMessage($instance));
            // }

            $connectedModels = isset($request->connectedModels) ? json_decode($request->connectedModels,true) : null;
            if (isset($connectedModels)){
                $result = $this->updateRelationships($instance,$connectedModels);
                if ($result !== true){
                    return $result;
                }
            }
            // $this->currentInstance = $instance;
            return true;

        }
        public function deleteModel($model, $uid, Request $request){
            include_once app_path("php/functions.php");
            $class = "App\\$model";
            try{
                $class::destroy($uid);
                $uidList = session('uidList');
                unset($uidList[$model]);
                session(['uidList'=>$uidList]);
                session()->forget($model);
                return "checkmark";
            }
            catch(\Exception $e){
                return $e;
            }
        }

        // public function extractEmbeddedImages($string,$instance,$attr){
        //     $embeddedImgs = [];
        //     $newImgs = preg_match_all('/src="data:([^;.]*);([^".]*)" data-filename="([^"]*)"/', $string, $newImgMatches, PREG_PATTERN_ORDER);
        //     $oldImgs = preg_match_all('/src="data:([^;.]*);([^".]*)" data-uuid="([^"]*)" data-filename="([^"]*)"/', $string, $oldImgMatches, PREG_PATTERN_ORDER);
        //     if ($newImgs!==false && $newImgs > 0){
        //         for ($x = 0; $x < count($newImgMatches[1]); $x++){
        //             $uuid = uuid();
        //             $fullMatch = $newImgMatches[0][$x];
        //             $mimeType = $newImgMatches[1][$x];
        //             $dataStr = $newImgMatches[2][$x];
        //             $fileName = $newImgMatches[3][$x];
        //             $embedStr = 'src="%%EMBEDDED:'.$uuid.'%%"';
        //             array_push($embeddedImgs,[$uuid,$mimeType,$fileName,$dataStr]);
        //             // Log::info($uuid.$mimeType.$fileName.$embedStr);
        //             $string = str_replace($fullMatch,$embedStr,$string);
        //         }
        //     }
        //     if ($oldImgs!==false && $oldImgs > 0){
        //         for ($x = 0; $x < count($oldImgMatches[1]); $x++){
        //             $fullMatch = $oldImgMatches[0][$x];
        //             $uuid = $oldImgMatches[3][$x];
        //             $embedStr = 'src="%%EMBEDDED:'.$uuid.'%%"';
        //             // array_push($embeddedImgs,[$uuid,$mimeType,$fileName,$dataStr]);
        //             // Log::info($uuid.$mimeType.$fileName.$embedStr);
        //             $string = str_replace($fullMatch,$embedStr,$string);
        //         }
        //     }
        //     $instance->$attr = $string;
        //     $returnVal = ($embeddedImgs == []) ? false : $embeddedImgs;
        //     return $returnVal;
        // }

    // EDIT / SAVE SETTINGS
        public function EditSettings($model, $uid){
            return view('models.settings-modal',[
                'model' => $model,
                "uid" => $uid
            ]);
        }
        public function SaveSettings($model, $uid, Request $request){
            include_once app_path("php/functions.php");
            $class = "App\\$model";
            $existingInstance = $class::find($uid);
            // return $existingInstance;

            $columns = isset($request->columnObj) ? json_decode($request->columnObj,true) : null;
            // return $columns;
            if ($columns) {
                foreach($columns as $key => $value){
                    $existingInstance->$key = $value;
                }
            }
            // return $existingInstance;

            try{
                $existingInstance->settings_json = $request->settings_json;
                if (isset($request->settings)){
                    $existingInstance->settings = $request->settings;
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
            // $this->currentInstance = $instance;
            return 'checkmark';
        }

    public function fetchModel($model, $uid, Request $request){
        include_once app_path("php/functions.php");
        $class = "App\\$model";
        $existingInstance = $class::find($uid);
        embeddedImgsToDataSrc($existingInstance,$model);
        return $existingInstance;
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
