<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Form;
use Illuminate\Support\Facades\Validator;
// use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Events\OutgoingMessage;

app()->singleton('GoogleGmail',function(){
    $client = app('GoogleClient');
    $client->addScope("https://www.googleapis.com/auth/gmail.modify");
    $mail = new \Google_Service_Gmail($client);
    return $mail;
});

class ScriptController extends Controller
{
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
            $newModel = new $class;
            return $this->saveModel($model, $newModel, $request);
        }
        public function UpdateModel($model, $uid, Request $request){
            include_once app_path("php/functions.php");
            $class = "App\\$model";
            $existingInstance = $class::find($uid);

            return $this->saveModel($model, $existingInstance, $request);
        }
        public function saveModel($model, $instance, Request $request){
            $models = strtolower(plural($model));
            $columns = json_decode($request->columnObj,true);

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
                    $instance->user_id = Auth::user()->id;
                }

            foreach(json_decode($request->columnObj,true) as $key => $value){
                $instance->$key = $value;
            }

            if (isset($request->full_json)){
                $instance->full_json = $request->full_json;
            }
            try{
                $instance->save();
                $uidList = session('uidList');
                $uidList[$model] = $instance->getKey();
                session([
                    'uidList' => $uidList,
                    $model => $instance->getKey()
                ]);
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
                $updated = $this->updateRelationships($instance,$connectedModels);
                if ($updated !== true){
                    return $updated;
                }
            }

            if ($model == 'Message'){
                event(new OutgoingMessage($instance));
                Log::info("YEAHHHH");
            }

            return "checkmark";

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
                $existingInstance->settings = $request->settings;
                // return $existingInstance;
                $existingInstance->save();
            }catch(\Exception $e){
                return $e;
            }

            $connectedModels = isset($request->connectedModels) ? json_decode($request->connectedModels,true) : null;
            if (isset($connectedModels)){
                return $this->updateRelationships($existingInstance,$connectedModels);
            }else{
                return "checkmark";
            }
        }

    public function updateRelationships($instance, $connectedModels){
        // return $connectedModels;
        foreach($connectedModels as $connectedModel){
            $rel = $connectedModel['relationship'];
            $connectedModelName = $connectedModel['model'];
            $class = "App\\$connectedModelName";
            $uids = isset($connectedModel['uidArr']) ? $connectedModel['uidArr'] : null;
            if ($uids){
                try{
                    if ($rel == 'belongsTo'){
                        $uid = $uids[0];
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
