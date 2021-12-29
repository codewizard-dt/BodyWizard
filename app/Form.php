<?php

namespace App;

use App\Image;
use App\Appointment;
use App\Submission;
use App\Patient;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use App\Traits\TableAccess;
use App\Traits\HasSettings;

class Form extends Model
{
  use TableAccess;
  use HasSettings;

  // protected $primaryKey = 'form_uid';
  protected $visible = ['id','name','sections','form_id','version_id','settings'];
  protected $guarded = [];

  protected $casts = [
    'sections' => 'array',
    'settings' => 'array',
  ];

  // static public $display_name = 'Chief Complaint';
  // static public $name_attr = 'name_with_version_plus';
  static public $instance_actions = [
    [
      'text' => 'preview',
      'action' => 'Form.preview',
      'class_list' => 'xsmall yellow',
    ]
  ];
  static public $static_actions = [];

  static public function table() {
    $columns = [
      'Usage' => 'setting:Availability + Usage.GeneralUsage:not set:usage',
      'Filled By' => 'setting:Availability + Usage.FilledOutBy:not set:filled_by',
    ];
    $bool_cols = ['charting'];
    if (Auth::user()->is_superuser) {
      $columns['System'] = 'setting:system:not set:system';
      $bool_cols[] = 'system';
    }
    $filters = [
      new_input('checkboxes',
        ['name', 'list','ele_css','preLabel','labelHtmlTag','labelClass'],
        ['usage', ['clinical','administrative'], ['textAlign' => 'left'],'<i>Filter</i> - Form Usage','h3','purple'],
      ),
      new_input('checkboxes',
        ['name', 'list','ele_css','preLabel','labelHtmlTag','labelClass'],
        ['filled_by', ['patient','practitioner'], ['textAlign' => 'left'],'<i>Filter</i> - Filled By','h3','purple'],
      )
    ];
    $buttons = [];
    $data = [];

    return compact('columns', 'filters', 'buttons', 'data', 'bool_cols');
  }
  public function details() {
    $instance = [
    ];
    return $instance;
  }

  protected static function boot()  {
    parent::boot();

    static::addGlobalScope('sys', function (Builder $builder) {
      if (Auth::check() && !Auth::user()->is_superuser) $builder->where('settings->system','!=','true');
    });
  }

  public static function successResponse(){
    $form = Form::find(getUid('Form'));
    return ['uid'=>$form->id,'form_id'=>$form->form_id,'version_id'=>$form->version_id];
  }
  public static function nextFormId(){
    $max = Form::select('form_id')->orderBy('form_id','desc')->limit(1)->get()->first();
    $next = $max ? $max->form_id + 1 : 1;
    return $next;
  }
  public function nextVersionId(){
    $max = Form::where('form_id', $this->form_id)->orderBy('version_id','desc')->limit(1)->get()->first();
    $next = $max ? $max->version_id + 1 : 1;
    return $next;
  }

  public function scopeCharting($query){
    // logger(session('usertype','no usertype'));
    $usertype = session('usertype');
    return $query->whereJsonContains("settings->Availability + Usage->FilledOutBy",$usertype)
                 ->whereJsonContains("settings->Availability + Usage->GeneralUsage",'clinical');
    // return $query->where("settings->Availability + Usage->UsedForPatientCharts",'true');
  }

  // public function table_nav_options() {
  //   // defines any additional non-standard nav options
  //   // buttons, extraClasses, dataAttr
  //   $data = [
  //     'buttons' => [
  //       'preview' => 'preview'
  //     ],
  //   ];
  //   return $data;
  // }
  // public function navOptions(){
  //   $user = Auth::user();
  //   $dataAttrs = [
  //     [
  //       'key' => 'json',
  //       'value' => json_encode($this->full_json),
  //     ],
  //   ];
  //   $extraClasses = '';
  //   $buttons = [
  //     [
  //       'text' => 'edit form',
  //       'destination' => 'forms-edit'
  //     ],
  //     [
  //       'text' => 'portal settings',
  //       'destination' => 'settings'
  //     ],
  //     [
  //       'text' => 'preview',
  //       'destination' => 'form-preview'
  //     ],
  //     [
  //       'text' => 'delete',
  //       'destination' => 'delete'
  //     ],
  //   ];
  //   if (!$this->active) $buttons[] = ['text'=>'use this version','destination'=>'setAsActiveForm'];
  //   $data = [
  //     'dataAttrs' => $dataAttrs,
  //     'extraClasses' => $extraClasses,
  //     'buttons' => $buttons,
  //     'instance' => $this,
  //     'model' => getModel($this)
  //   ];
  //   return $data;
  // }
  // public function modelDetails(){
  //   return [
  //     'Name + Version' => $this->name_with_version,
  //     'Sections' => implodeAnd($this->section_names),
  //     'Settings' => $this->settings
  //   ];
  // }
  // public function detailClick(Appointment $appt = null, Patient $patient = null){
  //   $model = getModel($this);
  //   $uid = $this->getKey();
  //   $form_id = $this->form_id;
  //   if ($patient && $appt){
  //     $hasSubmission = $this->apptHasSubmission($appt, $patient);
  //     $subValue = $hasSubmission ? 'hasSubmission' : 'noSubmission';
  //     return "<div class='link form $subValue' data-model='$model' data-uid='$uid' data-formid='$form_id' data-submission='$subValue'>" . $this->name . checkOrX($hasSubmission)."</div>";
  //   }else{
  //     return "<div class='link form' data-model='$model' data-uid='$uid' data-formid='$form_id'>" . $this->name . "</div>";
  //   }
  // }
  // public function getRequiredIntervalAttribute(){
  //   if (!$this->settings['require_periodically']) return null;
  //   $period = $this->settings['periodicity'];
  //   if ($period == 'every month') {
  //     return 1;
  //   }else{
  //     // returns number portion of 'every X months'
  //     return explode(" ",$period)[2];
  //   }
  // }
  // public function apptHasSubmission(Appointment $appt, Patient $patient){
  //   $submissionId = $this->checkApptFormStatus($appt, $patient);
  //   return $submissionId !== false;
  // }
  // public function checkApptFormStatus(Appointment $appt, Patient $patient){
  //   // Log::info("Check Appt Form Status");
  //   $submission = Submission::where([["appointment_id",$appt->id],['patient_id',$patient->id],['form_id',$this->form_id]])->get();
  //   return ($submission->count() == 0) ? false : $submission->first()->id;
  // }
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
  public function getSectionNamesAttribute(){
    return collect($this->sections)->transform(function($section){return $section['name'];})->all();
  }
  // public function getNameAttribute(){
  //   return $this->form_name;
  // }
  // public function getNameWithVersionAttribute(){
  //   return $this->form_name." (v".$this->version_id.")";
  // }
  // public function getNameWithVersionPlusAttribute(){
  //   return $this->version_id === 1 ? $this->form_name : $this->form_name." (v".$this->version_id.")";
  // }  
  // public function getChartingValueForTableAttribute(){
  //   if ($this->settings && isset($this->settings['chart_inclusion'])){
  //     return $this->settings['chart_inclusion'] ? "yes" : "no";
  //   }else{
  //     return 'no';
  //   }
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
