<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\TrackChanges;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Log;

class Patient extends Model
{
    use TrackChanges;

    public $tableValues;
    public $optionsNavValues;
    public $connectedModels;
    public $nameAttr;
    public $auditOptions;

    public function __construct($attributes = []){
        parent::__construct($attributes);
        $this->auditOptions = [
            'audit_table' => 'patients_audit',
            'includeFullJson' => false
        ];
        $this->nameAttr = ['preferred_name!!%preferred_name% %last_name%!!%first_name% %last_name%','userInfo'];
	    $this->tableValues = array(
	    	'tableId' => 'PatientList',
	    	'index' => 'id',
            'model' => "Patient",
            'with' => 'appointments',
	    	'columns' => array(
                        array(
                            "label" => 'Preferred Name',
                            "className" => 'name',
                            "attribute" => 'preferred_name!!preferred_name!!first_name',
                            "hasThrough" => 'userInfo'
                        ),
                        array(
                            "label" => 'Last Name',
                            "className" => 'LName',
                            "attribute" => 'last_name',
                            "hasThrough" => 'userInfo'
                        ),
                        [
                            'label' => 'Email',
                            'className' => 'email',
                            'attribute' => 'email',
                            'hasThrough' => 'userInfo'
                        ]
                    ),
            'displayName' => "%name% %LName%",
	    	'hideOrder' => "",
	    	'filtersColumn' => array(),
	    	'filtersOther' => 
            [
                [
                    'label' => 'New Patient',
                    'filterName' => 'patientInfo',
                    'showFilter' => false,
                    'attribute' => null,
                    'method' => 'isNewPatient',
                    'markOptions' => null,
                    'filterOptions' => [
                        [
                            'label' => 'newPatient',
                            'value' => "isNewPatient:true",
                            'attribute' => 'method',
                            'method' => 'isNewPatient'
                        ]
                        //, [
                        //     'label' => 'newPatient',
                        //     'value' => "isNewPatient:true",
                        //     'attribute' => 'method',
                        //     'method' => 'lastPractitioner'
                        // ]
                    ]
                ],
                [
                    'label' => 'Appointments',
                    'filterName' => 'appts',
                    'attribute' => null,
                    'markOptions' => null,
                    'filterOptions' => [
                        [
                            'label' => 'today',
                            'value' => "hasApptsToday:true",
                            'attribute' => 'method',
                            'method' => 'hasApptsToday'
                        ],
                        [
                            'label' => 'this week',
                            'value' => "hasApptsThisWeek:true",
                            'attribute' => 'method',
                            'method' => 'hasApptsThisWeek'
                        ]
                    ]
                ]
            ],
            'destinations' => array(
                'edit','delete'
            ),
            'btnText' => array(
                'edit','delete'
            ),
            'extraBtns' => []
	    );
        $this->optionsNavValues = array(
            'model' => "Patient",
            'destinations' => array(
                'edit','delete'
            ),
            'btnText' => array(
                'edit','delete'
            )
        );



        // This will load a resource table for each connected model
        // into the create.blade view for THIS model, creating modals that
        // automatically popped up when required.
        // [Model, relationship]
        $this->connectedModels = array(
            // ['Service','many','morphToMany'],
            // ['Patient','one','belongsTo']
        );
    }

    public static function returnUserIds($array){
        $userIds = Patient::find($array)->map(function($patient){
            return $patient->userInfo->id;
        })->toArray();
        return $userIds;
    }
    public function userInfo(){
        return $this->belongsTo('App\User','user_id');
    }
    public function isNewPatient(){
        $appts = $this->appointments()->where("status->completed",true)->get();
        return (count($appts) == 0) ? "true" : "false";
    }
    public function hasApptsThisWeek(){
        $appts = $this->appointments()->where([
            ['date_time','>',Carbon::now()->subUnitNoOverflow('week',1,'week')->toDateTimeString()],
            ['date_time','<',Carbon::now()->addUnitNoOverflow('week',1,'week')->toDateTimeString()]
        ])->get();
        return (count($appts) == 0) ? "false" : "true";
    }
    public function hasApptsToday(){
        $appts = $this->appointments()->where([
            ['date_time','>',Carbon::now()->subUnitNoOverflow('day',1,'day')->toDateTimeString()],
            ['date_time','<',Carbon::now()->addUnitNoOverflow('day',1,'day')->toDateTimeString()]
        ])->get();
        return (count($appts) == 0) ? "false" : "true";
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
    public function optionsNav(){
    }
    public function appointments(){
        return $this->morphToMany('App\Appointment','appointmentable');
    }
}
