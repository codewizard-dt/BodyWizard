<?php

namespace App;

use App\Image;
use App\Appointment;
use App\Submission;
use App\Patient;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use App\Traits\HasSettings;

class Form extends Model
{
  use HasSettings;

  protected $primaryKey = 'form_uid';
  protected $visible = ['form_uid','form_id','version_id','form_name','settings','sections'];
  protected $guarded = [];

  protected $casts = [
    'sections' => 'array',
    'settings' => 'array',
    // 'full_json' => 'json',
  ];

  public static function DefaultCollection(){
    $forms = Form::whereNull('settings->system')->orWhere('settings->system','false');
    if (Auth::user()->is_superuser) $forms = Form::orWhere('settings->system','true');
    return $forms;
  }
  public static function TableOptions(){
    $usertype = Auth::user()->user_type;
    $commonArr = [
      'tableId' => 'FormList',
      'index' => 'form_id'
    ];
    if ($usertype == 'practitioner'){
      $arr = [
        'columns' => 
        [
          'Form Name' => 'name_with_version',
          'Type' => 'form_type',
          'For' => 'user_type',
          'Chart Usage' => 'charting_value_for_table',
        ],
        'hideOrder' => ['Type','Chart Usage','For'],
        'filters' => [],
        'extraData' => [
          'submissions' => 'has_submissions',
        ],
        'orderBy' => [
          ['form_name',"asc"],
          ['version_id',"desc"]
        ]
      ];
      if (Auth::user()->is_superuser) set($arr,'columns.System','is_system');
    }elseif ($usertype == 'patient'){
      $arr = 
      [
        'columns' => 
        [
          ["label" => 'Form Name',
          "className" => 'name',
          "attribute" => 'form_name'],
          ["label" => 'Submitted',
          "className" => 'submitted',
          "attribute" => 'last_submitted'],
          ["label" => 'Status',
          "className" => 'status',
          "attribute" => 'status']
        ],
        'hideOrder' => "",
        'filtersColumn' => [],
        'filtersOther' => [
        ],
        'optionsNavValues' => [
          'destinations' => ['loadForm'],
          'btnText' => ['open form']
        ],
        'orderBy' => [
          ['form_name',"asc"]
        ]
      ];
    }
    return array_merge($commonArr,$arr);
  }
  public static function alwaysAvailable(){
    return Form::where([['settings->default_patient_portal_access','for all patients'],['active','1'],['hidden','0']])->orderBy('display_order')->get();
  }
  public static function neededByAnyAppointment($patientId = null){
    if (Auth::user()->user_type == 'patient') $patientId = Auth::user()->patient->id;
    if (!$patientId) return false;

    $patient = Patient::find($patientId);
    $appts = $patient->appointments->filter(function($appt,$a){
      return $appt->date_time->isAfter(Carbon::now()->subMonths(1));
    });
    $formIds = [];
    foreach ($appts as $appt){
      $forms = $appt->forms('patient');
      foreach ($forms as $form){
        $submissions = Submission::where([
          ['patient_id',$patientId],
          ['form_id',$form->form_id],
          ['appointment_id',$appt->id]
        ])->get();
        if ($submissions->count() == 0){
          $formIds[] = $form->form_id;
        }
      }
    }
    $forms = Form::whereIn('form_id',$formIds)->where('active',true)->get();
    return $forms;
  }
  public static function hasSubmissions($patientId = null){
    if (Auth::user()->user_type == 'patient'){
      $patient = Auth::user()->patient;
      $formIds = [];
      $forms = Form::all()->filter(function($form, $f) use ($patient){
        $submissions = $patient->submissions->where('form_id',$form->form_id);
        return ($submissions->count() != 0);
      });
      return $forms;
    }elseif (session('uidList') != null && session('uidList')['Patient'] != null){
      Log::info("2");
    }elseif (!$patientId){
      Log::info('1');
    }
  }
  public static function defaultSettings(){
    return [
      "chart_inclusion" => false
    ];
  }
  public static function periodicFormsRequiredNow(Patient $patient){
    $forms = Form::where('settings->require_periodically',true)->get()->filter(function($form) use($patient){
      $now = Carbon::now(); $period = $form->required_interval;
      $then = $now->subMonths($period);
      $submissions = Submission::where([['patient_id',$patient->id],['created_at','>',$then]])->get();
      return $submissions->count() == 0;
    });
  }
  public static function successResponse(){
    $form = Form::find(getUid('Form'));
    return ['form_uid'=>$form->form_uid,'form_id'=>$form->form_id,'version_id'=>$form->version_id];
  }
  public static function nextFormId(){
    $max = Form::orderBy('form_id','desc')->limit(1)->get()->first();
    $next = $max ? $max->form_id + 1 : 1;
    return $next;
  }
  public function nextVersionId(){
    $max = Form::where('form_id', $this->form_id)->orderBy('version_id','desc')->limit(1)->get()->first();
    $next = $max ? $max->version_id + 1 : 1;
    return $next;
  }

  public function table_nav_options() {
    // defines any additional non-standard nav options
    // buttons, extraClasses, dataAttr
    $data = [
      'buttons' => [
        'preview' => 'preview'
      ],
    ];
    return $data;
  }
  public function navOptions(){
    $user = Auth::user();
    $dataAttrs = [
      [
        'key' => 'json',
        'value' => json_encode($this->full_json),
      ],
    ];
    $extraClasses = '';
    $buttons = [
      [
        'text' => 'edit form',
        'destination' => 'forms-edit'
      ],
      [
        'text' => 'portal settings',
        'destination' => 'settings'
      ],
      [
        'text' => 'preview',
        'destination' => 'form-preview'
      ],
      [
        'text' => 'delete',
        'destination' => 'delete'
      ],
    ];
    if (!$this->active) $buttons[] = ['text'=>'use this version','destination'=>'setAsActiveForm'];
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
    return [
      'Form Name' => $this->form_name,
      'Version' => $this->version_id
    ];
  }
  public function detailClick(Appointment $appt = null, Patient $patient = null){
    $model = getModel($this);
    $uid = $this->getKey();
    $form_id = $this->form_id;
    if ($patient && $appt){
      $hasSubmission = $this->apptHasSubmission($appt, $patient);
      $subValue = $hasSubmission ? 'hasSubmission' : 'noSubmission';
      return "<div class='link form $subValue' data-model='$model' data-uid='$uid' data-formid='$form_id' data-submission='$subValue'>" . $this->name . checkOrX($hasSubmission)."</div>";
    }else{
      return "<div class='link form' data-model='$model' data-uid='$uid' data-formid='$form_id'>" . $this->name . "</div>";
    }
  }
  public function getRequiredIntervalAttribute(){
    if (!$this->settings['require_periodically']) return null;
    $period = $this->settings['periodicity'];
    if ($period == 'every month') {
      return 1;
    }else{
      // returns number portion of 'every X months'
      return explode(" ",$period)[2];
    }
  }
  public function apptHasSubmission(Appointment $appt, Patient $patient){
    $submissionId = $this->checkApptFormStatus($appt, $patient);
    return $submissionId !== false;
  }
  public function checkApptFormStatus(Appointment $appt, Patient $patient){
    // Log::info("Check Appt Form Status");
    $submission = Submission::where([["appointment_id",$appt->id],['patient_id',$patient->id],['form_id',$this->form_id]])->get();
    return ($submission->count() == 0) ? false : $submission->first()->id;
  }
  public function newestVersion(){
    return Form::where('form_id',$this->form_id)->orderBy('version_id','desc')->limit(1)->get()->first();
  }
  public static function getActiveVersion($formId){
    return Form::where([['form_id',$formId],['active',1]])->limit(1)->get()->first();        
  }
  public function activeVersion(){
    return Form::where([['form_id',$this->form_id],['active',1]])->limit(1)->get()->first();
  }

  public function getIsSystemAttribute(){
    return $this->get_setting_bool('system');
  }
  public function getNameAttribute(){
    return $this->form_name;
  }
  public function getNameWithVersionAttribute(){
    return $this->version_id === 1 ? $this->form_name : $this->form_name." (v".$this->version_id.")";
  }
  public function getChartingValueForTableAttribute(){
    if ($this->settings && isset($this->settings['chart_inclusion'])){
      return $this->settings['chart_inclusion'] ? "yes" : "no";
    }else{
      return 'no';
    }
  }
  // public function getNameAbbrAttribute(){
  //   return str_replace(" ", "", $this->name);
  // }
  // public function getLastSubmittedAttribute(){
  //   $submissions = $this->submissions();

  //   if (Auth::user()->user_type == "patient"){
  //     $id = Auth::user()->patient->id;
  //     $submission = $submissions->get()->filter(function($sub,$s) use($id){
  //       return $sub->patient_id == $id;
  //     })->last();
  //   }elseif(session('uidList') !== null && isset(session('uidList')['Patient'])){
  //     $id = session('uidList')['Patient'];
  //     $submission = $submissions->get()->filter(function($sub,$s) use($id){
  //       return $sub->patient_id == $id;
  //     })->last();
  //   }else{
  //     $submission = $submissions->last();
  //   }

  //   if ($submission){
  //     return $submission->created_at;
  //   }else{
  //     return 'never';
  //   }
  // }
  // public function getStatusAttribute(){
  //   $requiredByAppointment = $this->neededByAnyAppointment()->map(function($form,$f){
  //     return $form->form_id;
  //   })->toArray();
  //   $formCheck = in_array($this->form_id, $requiredByAppointment);

  //   $timeperiod = isset($this->settings['required']) ? $this->settings['required'] : false;

  //   if ($timeperiod){
  //     if ($timeperiod == 'never'){
  //       if (!$formCheck){
  //         // Log::info('1 '.$this->name);
  //         return ($this->last_submitted == 'never') ? 'incomplete' : 'completed';
  //       }else{
  //         $requiredByTime = false;
  //       }
  //     }elseif(contains($timeperiod,'registration')){
  //       if (!$formCheck){
  //         // Log::info('2 '.$this->name);
  //         return ($this->last_submitted == 'never') ? 'required' : 'completed';                    
  //       }else{
  //         $requiredByTime = false;
  //       }
  //     }else{
  //       if (contains($timeperiod,'12 months')){$months = 12;}
  //       elseif (contains($timeperiod,'6 months')){$months = 6;}
  //       elseif (contains($timeperiod,'3 months')){$months = 3;}
  //       elseif (contains($timeperiod,'2 months')){$months = 2;}
  //       elseif (contains($timeperiod,'every month')){$months = 1;}
  //       if ($this->last_submitted == 'never'){
  //         $requiredByTime = true;
  //       }else{
  //         $requiredByTime = ($this->last_submitted->isBefore(Carbon::now()->subMonths($months)));
  //       }                
  //     }
  //   }else{
  //     $requiredByTime = false;
  //   }
  //   return ($requiredByTime || $formCheck) ? "required" : "completed";
  // }
  // public function getHasSubmissionsAttribute(){
  //   $submissions = Submission::where('form_uid',$this->form_uid)->get();
  //   if ($submissions->count() > 0){return true;
  //   }else{return false;}
  // }
  // public function getNewestVersionIdAttribute(){
  //   return $this->newestVersion()->version_id;
  // }
  // public function getNewestAttribute(){
  //   return $this->newest_version_id == $this->version_id;
  // }

  public function lastSubmittedBy(Patient $patient){
    $submissions = $this->submissions();

    $id = $patient->id;
    $submission = $submissions->get()->filter(function($sub,$s) use($id){
      return $sub->patient_id == $id;
    })->last();

    if ($submission){
      return dateOrTimeIfToday($submission->created_at->timestamp);
    }else{
      return 'never';
    }
  }
  public function services(){
    return $this->morphedByMany('App\Service', 'formable', null, 'form_id');
  }
  public function images(){
    return $this->morphToMany('App\Image', 'imageable');
  }
  public function submissions(){
    return $this->hasMany('App\Submission', "form_id", 'form_id');
  }
  public function moreOptions(){
  }
}
