<?php

namespace App\Traits;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;


trait TrackChanges
{
  public function trackableSync($method, $newIdArray){
    reportError('do not use this trackableSync','trackchanges trackableSync');
    return;
    // try{
    //   $oldKeys = $this->$method->modelKeys();
    //   $newIdArray = array_map('makeNumeric', $newIdArray);
    //   if (!$this->keysExactlyMatch($oldKeys, $newIdArray)){
    //     $changes = [$method => ['old' => $oldKeys, 'new' => $newIdArray]];
    //     $this->saveDirtyChanges($changes);
    //     $this->$method()->sync($newIdArray);
    //     Log::info("SYNCED");
    //   }
    // }catch(\Exception $e){
    //   reportError($e,'trackableSync in TrackChanges.php 137');
    // }
  }
  public function keysExactlyMatch($arr1, $arr2){
    // sort($arr1, SORT_NUMERIC);
    // sort($arr2, SORT_NUMERIC);
    // $dif1 = array_diff($arr1, $arr2);
    // $dif2 = array_diff($arr2, $arr1);
    // return count($dif1) == 0 && count($dif2) == 0;
  }
  public function checkForDirtyAttributes(){
    // $attrToIgnore = ['full_json','autosave','updated_at'];
    // $valToIgnore = [null,[]];
    // $changes = [];
    // if ($this->isDirty()){
    //   foreach ($this->getDirty() as $attribute => $value){
    //     $oldValue = isset($this->original[$attribute]) ? $this->original[$attribute] : null;
    //     $ignoreAttr = in_array($attribute,$attrToIgnore);
    //     $ignoreOldVal = in_array($oldValue,$valToIgnore);
    //     if (!$ignoreAttr && !$ignoreOldVal) $changes[] = [$attribute => ['old' => $oldValue, 'new' => $value]];
    //   }
    //   // return count($changes) == 0 ? null : $changes;
    // }
    // // else{
    // //   return null;
    // // }
    // return $changes ?: null;
  }
  // public function checkForDirtyRelationships(){
  //   $changes = [];
  //   foreach(request()->sync as $relationship => $ids){
  //     $currentKeys = $this->$relationship->modelKeys();
  //     $newKeys = array_map('makeNumeric', $ids);
  //     Log::info(['current'=>$currentKeys,'new'=>$newKeys],['location'=>'trackChanges dirty relationship 82']);
  //     if (!$this->keysExactlyMatch($currentKeys,$newKeys)) $changes[] = [$relationship => ['old' => $currentKeys, 'new' => $newKeys]];
  //   }
  //   Log::info(['changes'=>$changes],['location'=>'trackChanges dirty relationship 85']);
  //   return $changes;
  // }
  public function saveDirtyChanges($changes){
    $table = $this->getAuditTableName();
    $encrypted = usesTrait($this,"Encryptable");
    $isLocal = (env('APP_ENV') == 'local');
    if ($encrypted && !$isLocal){
      $column = 'changes_enc';
      $changes = $this->encryptKms($changes);
    }else{
      $column = 'changes';
      $changes = json_encode($changes);
    }
    $column = ($encrypted && !$isLocal) ? 'changes_enc' : 'changes';
    if ($table){
      DB::insert('insert into '.$table.' (user_id, affected_record, ip_address, '.$column.', changed_at) values (?, ?, ?, ?, ?)', 
        [
          Auth::user()->id, 
          $this->getKey(), 
          request()->getClientIp(), 
          $changes,
          Carbon::now()
        ]);
    }
  }
  public function getAllChangesAttribute(){
    $entries = DB::table($this->getTable().'_audit')->where('affected_record',$this->getKey())->orderBy('changed_at','desc')->get();
    return $entries;
  }
  public function getLastChangeAttribute(){
    return $this->all_changes->first();
  }

  public function getAuditTableName(){
    $table = $this->getTable().'_audit';
    $hasTable = Schema::hasTable($table);
    if (!$hasTable){
      try{
        Schema::create($table, function (Blueprint $table) {
          $table->bigIncrements('id');
          $table->unsignedInteger('user_id');
          $table->unsignedInteger('affected_record');
          $table->string('ip_address');
          $table->json('changes')->nullable()->default(null);
          $table->longtext('changes_enc')->nullable()->default(null);
          $table->dateTime('changed_at');
        });
      }catch(\Exception $e){
        reportError($e,'TrackChanges 183');
      }
    }
    return isset($e) ? false : $table;
  }
  public function saveTrackingInfo($instance, $changes, $ip){
    $affectedRecord = $instance->getKey();
    $userId = Auth::id();
    $table = $instance->auditOptions['audit_table'];
    DB::insert('insert into '.$table.' (user_id, affected_record, ip_address, changes, changed_at) values (?, ?, ?, ?, ?)', [$userId, $affectedRecord, $ip, json_encode($changes), Carbon::now()]);
  }
  // public function recursiveArrayMatch($arr1, $arr2){
  //   $pass = true;
  //   foreach($arr1 as $key => $value1){
  //     if (isset($arr2[$key])){
  //       $value2 = $arr2[$key];
  //       if (is_array($value1) && is_array($value2)){
  //         if (!$this->recursiveArrayMatch($value1, $value2)){$pass = false;}
  //       }elseif(!is_array($value1) && !is_array($value2)){
  //         if ($value1 !== $value2){$pass = false;}
  //       }else{
  //         $pass = false;
  //       }
  //     }else{
  //       $pass = false;
  //     }
  //   }
  //   foreach($arr2 as $key => $value1){
  //     if (isset($arr1[$key])){
  //       $value2 = $arr1[$key];
  //       if (is_array($value1) && is_array($value2)){
  //         if (!$this->recursiveArrayMatch($value1, $value2)){$pass = false;}
  //       }elseif(!is_array($value1) && !is_array($value2)){
  //         if ($value1 !== $value2){$pass = false;}
  //       }else{
  //         $pass = false;
  //       }
  //     }else{
  //       $pass = false;
  //     }
  //   }
  //   return $pass;
  // }
}
