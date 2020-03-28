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


    public $tableValues;
    public $optionsNavValues;
    public $connectedModels;
    public $nameAttr;
    public $auditOptions;

    protected $casts = [
        'signature' => 'array',
        'signed_at' => 'datetime'
    ];
    protected $hidden = ['autosave'];

    public function __construct($attributes = []){
        parent::__construct($attributes);
        $this->auditOptions = [
            'audit_table' => 'chart_notes_audit',
            'includeFullJson' => false
        ];

    }

    static function tableValues(){
        $usertype = Auth::user()->user_type;
        $commonArr = [
            'tableId' => 'ChartNoteList',
            'index' => 'id'
        ];
        if ($usertype == 'practitioner'){
            $arr = [
                        'columns' => 
                        [
                            ["label" => 'Patient',
                            "className" => 'patient',
                            "attribute" => 'patient_name'],
                            ["label" => 'Appointment',
                            "className" => 'appointment',
                            "attribute" => 'appointment_name'],
                            ["label" => 'Signed',
                            "className" => 'signedAt',
                            "attribute" => 'signed_at'],
                        ],
                        'hideOrder' => "category,location,reported",
                        'filtersColumn' => [],
                        'filtersOther' => [],
                        'optionsNavValues' => [
                            'destinations' => ["view"],
                            'btnText' => ["view"]
                        ],
                        'orderBy' => [
                            ['created_at',"desc"],
                        ]
            ];
        }elseif ($usertype == 'patient'){
            $arr = [
                        'columns' => 
                        [
                            ["label" => 'Bug',
                            "className" => 'description',
                            "attribute" => 'description'],
                            ["label" => 'Category',
                            "className" => 'category',
                            "attribute" => 'category'],
                            ["label" => 'Location',
                            "className" => 'location',
                            "attribute" => 'location'],
                            ["label" => 'Reported At',
                            "className" => 'reported',
                            "attribute" => 'created_at']
                        ],
                        'hideOrder' => "category,location,reported",
                        'filtersColumn' => [],
                        'filtersOther' => [],
                        'optionsNavValues' => [
                            'destinations' => ["details"],
                            'btnText' => ["details"]
                        ],
                        'orderBy' => [
                            ['created_at',"desc"],
                        ]
            ];
        }
        return array_merge($commonArr,$arr);
    }
    static function moreOptions(){

    }

    public function getNameAttribute(){
        return $this->patient_name . " (".$this->appointment_date.")";
    }
    public function getPatientNameAttribute(){
        return $this->patient->name;
    }
    public function getAppointmentDateAttribute(){
        return $this->appointment->date;
    }
    public function getAppointmentNameAttribute(){
        return $this->appointment->name;
    }
    public function getSignedAtAttribute($value){
        $date = $value ? new Carbon($value) : null;
        return $date ? $date->format('n/j g:ia') : 'not signed';
    }
    public function setAutosaveAttribute($value){
        $this->attributes['autosave'] = $this->encryptKms($value);
    }
    public function getAutosaveAttribute($value){
        $val = $this->decryptKms($value);
        return $val;
    }
    public function patient(){
    	return $this->belongsTo('App\Patient','patient_id');
    }
    public function appointment(){
        return $this->belongsTo('App\Appointment','appointment_id');
    }
    public function submissions(){
        return $this->morphToMany('App\Submission','submissionable');
    }
}
