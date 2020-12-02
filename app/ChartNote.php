<?php

namespace App;

use App\Traits\TrackChanges;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Encryptable;

class ChartNote extends Model
{
  use TrackChanges;
  use Encryptable;


  public $TableOptions;
  public $optionsNavValues;
  public $connectedModels;
  public $nameAttr;
  public $auditOptions;

  protected $casts = [
    'signature' => 'array',
    'signed_at' => 'datetime',
    'date_time_start' => 'datetime',
    'date_time_end' => 'datetime',
  ];
  protected $with = ['appointment','patient'];
  protected $fillable = ['patient_id','practitioner_id','appointment_id','notes','signature','signed_at'];
  protected $hidden = ['autosave'];

  static public function successResponse(){
    $uid = getUid('ChartNote');
    try{
      $note = ChartNote::findOrFail($uid);
      $response = ['uid'=>$note->id, 'status'=>$note->signed_at];
    }catch(\Exception $e){
      reportError($e,'chartnote successResponse');
      $response = $e;
    }
    return $response;
  }
  
  static function TableOptions(){
    return [
      'tableId' => 'ChartNoteList',
      'index' => 'id',
      'columns' => 
      [
        'Patient' => 'patient_name',
        'Appointment' => 'appointment_name',
        'Signed' => 'signed_at',
      ],
      'hideOrder' => ['Appointment'],
      'filters' => [],
      'optionsNavValues' => [
        'destinations' => ["view"],
        'btnText' => ["view"]
      ],
      'orderBy' => [
        ['created_at',"desc"],
      ]
    ];
  }
  public function navOptions(){
    $dataAttrs = [
      [
        'key' => 'status',
        'value' => $this->signed_at
      ],
    ];
    $buttons = ($this->signed_at == 'not signed') ? 
    [
      [
        'text' => 'continue chart note',
        'destination' => 'edit'
      ],
      [
        'text' => 'pinned notes',
        'destination' => 'addNote'
      ],
    ] : 
    [
      [
        'text' => 'view full chart',
        'destination' => 'view'
      ],
      [
        'text' => 'pinned notes',
        'destination' => 'addNote'
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
    $isSigned = ($this->signed_at != 'not signed');
    $details = $isSigned ? 
    [
      'Signed' => $this->signed_at.' by '.$this->practitioner->name.checkOrX($isSigned),
      'Patient' => $this->patient->name,
      'Appointment' => $this->appointment->detailClick(),
      'Chief Complaints' => 'Fix this soon',
      'Pinned Notes' => $this->notes ?: 'none',
      'Patient Submissions' => $this->patient_submissions ? $this->patient_submissions->map(function($sub){return $sub->detailClick();})->toArray() : 'none',
      'Chart Forms' => $this->chart_forms ? $this->chart_forms->map(function($sub){return $sub->detailClick();})->toArray() : 'none',
    ] : [
      'Signed' => 'not signed'.checkOrX($isSigned),
      'Patient' => $this->patient->name,
      'Appointment' => $this->appointment->detailClick(),
      'Chief Complaints' => 'Fix this soon',
      'Pinned Notes' => $this->notes ?: 'none',
      'Required Submissions' => $this->patient_forms ? $this->patient_forms->map(function($form){return $form->detailClick();})->toArray() : 'none',
      'Default Chart Forms' => $this->practitioner_forms ? $this->practitioner_forms->map(function($form){return $form->detailClick();})->toArray() : 'none',
    ];
    return $details;
  }

  public function getNameAttribute(){
    return $this->patient_name . " (".$this->appointment_date.")";
  }
  public function getPatientNameAttribute(){
    return $this->patient->name;
  }
  public function getPatientSubmissionsAttribute(){
    $submissions = $this->submissions()->where('form_user_type','patient')->get();
    return ($submissions->count() != 0) ? $submissions : null;
  }
  public function getChartFormsAttribute(){
    $submissions = $this->submissions()->where('form_user_type','practitioner')->get();
    return ($submissions->count() != 0) ? $submissions : null;
  }
  public function getFormsAttribute(){
    return $this->appointment->forms();
  }
  public function getPatientFormsAttribute(){
    $forms = $this->forms->filter(function($form){return $form->user_type == 'patient';});
    return ($forms->count() != 0) ? $forms : null;
  }
  public function getPractitionerFormsAttribute(){
    $forms = $this->forms->filter(function($form){return $form->user_type == 'practitioner';});
    return ($forms->count() != 0) ? $forms : null;
  }
  public function getAppointmentDateAttribute(){
    return $this->appointment->date;
  }
  public function getAppointmentNameAttribute(){
    return $this->appointment->name;
  }
  public function getSignedAtAttribute($value){
    $date = $value ? new Carbon($value) : null;
    return $date ? $date->format('n/j/y g:ia') : 'not signed';
  }
  public function getSignedOnAttribute(){
    $signedAt = $this->signed_at;
    $date = ($signedAt != 'not signed') ? explode(' ', $signedAt)[0] : 'not signed';
    return $date;
  }
  public function setAutosaveAttribute($value){
    $this->attributes['autosave'] = $this->encryptKms($value);
  }
  public function getAutosaveAttribute($value){
    $val = $this->decryptKms($value);
    return $val;
  }
  public function setNotesAttribute($value){
    $this->attributes['notes'] = $this->encryptKms($value);
  }
  public function getNotesAttribute($value){
    $val = $this->decryptKms($value);
    return $val ?: [];
  }
  public function patient(){
    return $this->belongsTo('App\Patient','patient_id');
  }
  public function practitioner(){
    return $this->belongsTo('App\Practitioner','practitioner_id');
  }
  public function appointment(){
    return $this->belongsTo('App\Appointment','appointment_id');
  }
  public function submissions(){
    return $this->morphToMany('App\Submission','submissionable');
  }
}
