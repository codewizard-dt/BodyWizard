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

    protected $casts = [
        'settings' => 'array'
    ];
    protected $hidden = [
        'settings_json'
    ];

    public function __construct($attributes = []){
        parent::__construct($attributes);
        $this->auditOptions = [
            'audit_table' => 'patients_audit',
            'includeFullJson' => false
        ];

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
            'filters' => [
                'Appointments' => [
                    'today' => 'has_appts_today',
                    'this week' => 'has_appts_this_week',
                    'this month' => 'has_appts_this_month'
                ],
                'Status' => [
                    'active' => 'is_active',
                    'inactive' => 'is_inactive',
                ],
            ],
            'extraBtns' => [],
            'extraData' => [
                'isnewpatient' => 'is_new_patient',
            ],
        );
    }
    public function navOptions(){
        $dataAttrs = [
            [
                'key' => 'json',
                'value' => str_replace("'","\u0027",$this->userInfo->full_json)
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
            'Name' => ($this->full_name == $this->legal_name) ? $this->full_name : $this->full_name.'<span class="little">'.$this->legal_name.'</span>',
            'Pronouns' => $this->pronouns,
            'Phone' => $this->phone,
            'Email' => $this->email,
            'Upcoming Appointments' => $upcoming->count() > 0 ? $upcoming->map(function($appt){return $appt->detailClick();})->toArray() : 'none',
            'Recent Appointments' => $recent->count() > 0 ? $recent->map(function($appt){return $appt->detailClick();})->toArray() : 'none'
        ];
    }
    public function detailClick(){
        $model = getModel($this);
        $uid = $this->getKey();
        return "<div class='link patient' data-model='$model' data-uid='$uid'>" . $this->name . "</div>";
    }

    public function userInfo(){
        return $this->belongsTo('App\User','user_id');
    }
        public function getNameAttribute(){
            return $this->userInfo->name;
        }
        public function getFullNameAttribute(){
            return $this->userInfo->full_name;
        }
        public function getLegalNameAttribute(){
            return $this->userInfo->legal_name;
        }
        public function getPhoneAttribute(){
            return $this->userInfo->phone;
        }
        public function getEmailAttribute(){
            return $this->userInfo->email;
        }
        public function getDateOfBirthAttribute(){
            return $this->userInfo->date_of_birth;
        }
        public function getPreferredNameAttribute(){
            return $this->userInfo->preferred_name;
        }

    public function getSettingsAttribute($value){
        if ($value == null){
            return 
            [
                "reminders" => 
                [
                    "forms" => 
                    [
                        "24hr" => true, "48hr" => true, "72hr" => true, "text" => true, "email" => true
                    ], 
                    "appointments" => 
                    [
                        "text" => true, "email" => true
                    ]
                ], 
                "cancellations" => true, 
                "confirmations" => true
            ];
        }else{
            return $value;
        }
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
