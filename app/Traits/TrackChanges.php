<?php

namespace App\Traits;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;

trait TrackChanges
{
    //
    public function checkForChanges($instance, Request $request, $includeFullJson = false){
    	// $auditTable = $instance->auditTable;
        // $columns = (isset($request->columnObj) && $request->columnObj !== 'null') ? json_decode($request->columnObj,true) : [];
        if (isset($request->columnObj) && $request->columnObj !== 'null'){
            $columns = is_array($request->columnObj) ? $request->columnObj : json_decode($request->columnObj,true);
        }else{
            $columns = [];
        }
        $settings = (isset($request->settings)) ? json_decode($request->settings,true) : null;
        $changes = [];
        $datesArr = dateFieldsArray();
        $dateTimesArr = dateTimeFieldsArray();
        foreach ($columns as $key => $value){
            if (in_array($key,$datesArr)){
                $value = Carbon::parse($value)->format("Y-m-d");
                $old = $instance->$key->format("Y-m-d");
            }elseif(in_array($key,$dateTimesArr)){
                $value = Carbon::parse($value)->format("Y-m-d H:i:s");
                $old = $instance->$key->format("Y-m-d H:i:s");
            }else{
                $old = $instance->$key;
            }
        	if ($value != $old){
        		$change = [$key => ["old" => $old, "new" => $value]];
                $changes[] = $change;
        	}
        }
        if ($settings){
            $existingSettings = isset($instance->settings) ? $instance->settings : [];
            if (!is_array($existingSettings)){$existingSettings = json_decode($existingSettings,true);}
            if (!$this->recursiveArrayMatch($settings,$existingSettings)){
                $change = ['settings' => ["old" => $existingSettings, "new" => $settings]];
                $changes[] = $change;
            }
            if ($instance->settings_json == null){
                $change = ['settings' => ["old" => 'default', "new" => $settings]];
                $changes[] = $change;                
            }
        }
        if ($includeFullJson){
	        $fullJson = isset($request->full_json) ? $request->full_json : null;
	        if ($fullJson && $fullJson != $instance->full_json){
	        	$change = ["full_json" => ["old"=>$instance->full_json,"new"=>$fullJson]];
                $changes[] = $change;
	        }        	
        }
        $connectedModels = isset($request->connectedModels) ? json_decode($request->connectedModels,true) : [];
        foreach ($connectedModels as $connectedModel){
            $model = $connectedModel['model'];
            $rel = $connectedModel['relationship'];
            $num = $connectedModel['number'];
            $uids = isset($connectedModel['uidArr']) ? $connectedModel['uidArr'] : null;
            if ($rel == 'belongsTo'){
                $method = checkAliases($instance, strtolower($model));
                $connectedInstance = $instance->$method()->get();
                // Log::info($connectedInstance);
                $oldId = $connectedInstance ? $connectedInstance->modelKeys()[0] : null;
                $newId = $uids ? $uids[0] : null;
                if ($oldId != $newId){
                    $change = [$model => ["old" => $oldId, "new" => $newId]];
                    $changes[] = $change;
                }
            }elseif ($rel == 'morphToMany' || $rel == 'morphedByMany'){
                $method = checkAliases($instance, strtolower(plural($model)));
                $connectedInstances = $instance->$method()->get();
                $oldIds = $connectedInstances ? $connectedInstances->modelKeys() : null;
                $newIds = $uids ? $uids : null;
                if ($newIds){
                    $d1 = array_diff($newIds,$oldIds);
                    $d2 = array_diff($oldIds,$newIds);
                    if ($d1 != [] || $d2 != []){
                        $change = [$model => ["old" => $oldIds, "new" => $newIds]];
                        $changes[] = $change;
                    }                    
                }
            }

        }
    	return ($changes != []) ? $changes : null;
    }
    public function saveTrackingInfo($instance, $changes, $ip){
        $affectedRecord = $instance->getKey();
        $userId = Auth::id();
        $table = $instance->auditOptions['audit_table'];
        DB::insert('insert into '.$table.' (user_id, affected_record, ip_address, changes, changed_at) values (?, ?, ?, ?, ?)', [$userId, $affectedRecord, $ip, json_encode($changes), Carbon::now()]);
    }
    public function recursiveArrayMatch($arr1, $arr2){
        $pass = true;
        foreach($arr1 as $key => $value1){
            if (isset($arr2[$key])){
                $value2 = $arr2[$key];
                if (is_array($value1) && is_array($value2)){
                    if (!$this->recursiveArrayMatch($value1, $value2)){$pass = false;}
                }elseif(!is_array($value1) && !is_array($value2)){
                    if ($value1 !== $value2){$pass = false;}
                }else{
                    $pass = false;
                }
            }else{
                $pass = false;
            }
        }
        foreach($arr2 as $key => $value1){
            if (isset($arr1[$key])){
                $value2 = $arr1[$key];
                if (is_array($value1) && is_array($value2)){
                    if (!$this->recursiveArrayMatch($value1, $value2)){$pass = false;}
                }elseif(!is_array($value1) && !is_array($value2)){
                    if ($value1 !== $value2){$pass = false;}
                }else{
                    $pass = false;
                }
            }else{
                $pass = false;
            }
        }
        return $pass;
    }
}
