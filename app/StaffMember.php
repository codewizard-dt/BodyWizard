<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\TrackChanges;
use Illuminate\Database\Eloquent\SoftDeletes;

class StaffMember extends Model
{
  use TrackChanges;
  use SoftDeletes;

  protected $casts = [
    "schedule" => 'array',
    "schedule_exceptions" => "array"
  ];

  protected $guarded = [];
  protected $visible = ['id','name','email','username','date_of_birth','roles'];
  protected $appends = ['name'];


  public $TableOptions;
  public $optionsNavValues;
  public $nameAttr;
  public $connectedModels;
  public $auditOptions;

  public function __construct($attributes = []){
    parent::__construct($attributes);
    $this->auditOptions = [
      'audit_table' => 'staff_members_audit',
      'includeFullJson' => false
    ];
    $this->nameAttr = ['preferred_name!!%preferred_name% %last_name%!!%first_name% %last_name%','user'];
  }
  public function moreOptions(){

  }
  public function user(){
    return $this->belongsTo('App\User','user_id');
  }
  public function __get($key) {
    if ($this->getAttribute($key)) return $this->getAttribute($key); 
    else if ($this->user->getAttribute($key)) return $this->user->getAttribute($key);
    else return null;
  }
  public function getNameAttribute(){
    return $this->user->name;
  }

  

}
