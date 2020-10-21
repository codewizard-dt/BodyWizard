<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\TrackChanges;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
  use TrackChanges;
  use SoftDeletes;

  public $tableValues;
  public $optionsNavValues;
  public $connectedModels;
  public $nameAttr;
  public $auditOptions;

  protected $casts = [
    'settings' => 'array'
  ];
  protected $hidden = [
    'settings_json'
  ];
  protected $guarded = [];
  protected $visible = ['user_id','name','email','username','date_of_birth','roles'];
  protected $appends = ['name'];

  public function __construct($attributes = []){
    parent::__construct($attributes);
    $this->auditOptions = [
      'audit_table' => 'patients_audit',
      'includeFullJson' => false
    ];
  }

  public static function returnUserIds($array){
    $userIds = Patient::find($array)->map(function($patient){
      return $patient->user->id;
    })->toArray();
    return $userIds;
  }
  public static function tableValues(){
    return array(
      'tableId' => 'PatientList',
      'index' => 'id',
      'model' => "Patient",
      'with' => 'appointments',
      'columns' => [
        'Name' => 'name',
        'Phone' => 'phone',
        'Email' => 'email',
        'Last Seen' => 'last_seen',
      ],
      'hideOrder' => ['Email','Phone','Last Seen'],
      'filters' => [],
      'extraBtns' => [],
      'extraData' => [
        'isnewpatient' => 'is_new_patient',
      ],
    );
  }
  public function nav_options(){
    return [];
  }
  public function navOptions(){
    $dataAttrs = [
      [
        'key' => 'json',
        'value' => str_replace("'","\u0027",$this->user->full_json)
      ],
      [
        'key' => 'isNewPatient',
        'value' => $this->isNewPatient()
      ],
    ];
    $buttons = [
      [
        'text' => 'edit info',
        'destination' => 'edit'
      ],
      [
        'text' => 'portal settings',
        'destination' => 'settings'
      ],
    ];
    $extraClasses = "";
    $data = [
      'dataAttrs' => $dataAttrs,
      'extraClasses' => $extraClasses,
      'buttons' => $buttons,
      'instance' => $this,
      'model' => getModel($this)
    ];
    return $data;
  }
  public function modelDetails(){
    $upcoming = $this->upcoming_appointments;
    $recent = $this->prev_appointments;
    return [
      'Legal Name' => $this->legal_name,
      'Pronouns' => $this->pronouns,
      'Phone' => $this->phone,
      'Email' => $this->email,
      'Username' => $this->username,
      'Upcoming Appointments' => $upcoming->count() > 0 ? $upcoming->map(function($appt){return $appt->detailClick();})->toArray() : 'none',
      'Recent Appointments' => $recent->count() > 0 ? $recent->map(function($appt){return $appt->detailClick();})->toArray() : 'none'
    ];
  }
  public function detailClick(){
    $model = getModel($this);
    $uid = $this->getKey();
    return "<div class='link patient' data-model='$model' data-uid='$uid'>" . $this->name . "</div>";
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

  public function getNextAppointmentAttribute(){
    return $this->upcoming_appointments ? $this->upcoming_appointments->first() : null;
  }
  public function getUpcomingAppointmentsAttribute(){
    $appts = $this->appointments()->where('date_time','>=',Carbon::now())->orderBy('date_time','asc')->take(5)->get();
    return $appts ? $appts : null;
  }
  public function getLastAppointmentAttribute(){
    return $this->prev_appointments ? $this->prev_appointments->first() : null;
  }
  public function getPrevAppointmentsAttribute(){
    $appts = $this->appointments()->where('date_time','<=',Carbon::now())->orderBy('date_time','desc')->take(5)->get();
    return $appts ? $appts : null;
  }
  public function getLastSeenAttribute(){
    $last = $this->last_appointment; 
    return $last ? $last->date_time->format('n/j/y') : 'never';
  }

  public function isNewPatient(){
    $appts = $this->appointments()->where("status->completed",true)->get();
    return (count($appts) == 0);
  }
  public function getIsActiveAttribute(){
    $appts = $this->appointments()->where([
      ['date_time','>',Carbon::now()->subUnit('month',6)->toDateTimeString()],
      ['date_time','<',Carbon::now()->addUnit('month',1)->toDateTimeString()]
    ])->get();
    return (count($appts) != 0);
  }
  public function getIsInactiveAttribute(){
    return !$this->is_active;
  }

  public function getHasApptsThisWeekAttribute(){
    $appts = $this->appointments()->where([
      ['date_time','>',Carbon::now()->subUnitNoOverflow('week',1,'week')->toDateTimeString()],
      ['date_time','<',Carbon::now()->addUnitNoOverflow('week',1,'week')->toDateTimeString()]
    ])->get();
    return (count($appts) != 0);
  }
  public function getHasApptsThisMonthAttribute(){
    $appts = $this->appointments()->where([
      ['date_time','>',Carbon::now()->subUnitNoOverflow('month',1,'month')->toDateTimeString()],
      ['date_time','<',Carbon::now()->addUnitNoOverflow('month',1,'month')->toDateTimeString()]
    ])->get();
    return (count($appts) != 0);
  }
  public function getHasApptsTodayAttribute(){
    $appts = $this->appointments()->where([
      ['date_time','>',Carbon::now()->subUnitNoOverflow('day',1,'day')->toDateTimeString()],
      ['date_time','<',Carbon::now()->addUnitNoOverflow('day',1,'day')->toDateTimeString()]
    ])->get();
    return (count($appts) == 0);
  }
  public function lastPractitioner(){
    $lastAppt = $this->appointments()->where("status->completed")->orderBy("date_time","desc")->get();
        // dd($lastAppt);
    return $lastAppt;
  }
  public function lastServices(){

  }
  public function lastCompletedAppt(){
    $lastAppt = $this->appointments()->where("status->completed")->orderBy("date_time","desc")->get();
    return $lastAppt;
  }
  public function moreOptions(){
  }


  public function appointments(){
    return $this->morphToMany('App\Appointment','appointmentable');
  }
  public function submissions(){
    return $this->hasMany("App\Submission");
  }
}
