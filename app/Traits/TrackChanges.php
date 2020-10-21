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
  public static function bootTrackChanges() {
    static::updating(function($model){
      if ($model->isDirty()) {
        try {
          $changes = collect($model->getDirty())->map(function($value, $attr) use ($model){
            return ['old' => $model->getOriginal($attr), 'new' => $model->getDirty()[$attr]];
          })->toArray();
          $model->saveDirtyChanges($changes);
        } catch (\Exception $e) {
          handleError($e,'track changes');
        }
      }
    });
  }
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
    if ($table){
      DB::insert('insert into '.$table.' (user_id, affected_record, ip_address, '.$column.', changed_at) values (?, ?, ?, ?, ?)', 
        [
          Auth::check() ? Auth::user()->id : 0, 
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
}
