<?php
namespace App;

use App\Traits\TrackChanges;

use App\Message;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Arr;

class Appointment extends Model
{
    use TrackChanges;
    use SoftDeletes;

    public $tableValues;
    public $optionsNavValues;
    public $connectedModels;
    public $auditOptions;

    protected $casts = [
        'status' => 'array',
        'date_time' => 'datetime'
    ];
    protected $hidden = ['full_json'];

    public function __construct($attributes = []){
        parent::__construct($attributes);
        $this->auditOptions = [
            'audit_table' => 'appointments_audit',
            'includeFullJson' => false
        ];

	    $this->tableValues = array(
	    	'tableId' => 'AppointmentList',
	    	'index' => 'id',
            'model' => "Appointment",
	    	'columns' => [
                        [
                            "label" => 'Patient',
                            "className" => 'patient',
                            "attribute" => 'name'
                        ],
                        [
                            'label' => 'Date + Time',
                            'className' => 'time',
                            'attribute' => 'date_time'
                        ],
                        [
                            'label' => 'Services',
                            'className' => 'services',
                            'attribute' => 'services'
                        ]
                    ],
	    	'hideOrder' => "",
	    	'filtersColumn' => array(),
	    	'filtersOther' => array(),
            'destinations' => array(
                'edit','delete'
            ),
            'btnText' => array(
                'edit','delete'
            ),
            'extraBtns' => []
	    );
        $this->optionsNavValues = array(
            'model' => "Appointment",
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
            ['Service','many','morphToMany'],
            ['Patient','one','morphedByMany'],
            ['Practitioner','one','belongsTo']
        );
    }

    public function moreOptions(){

    }

    static function allApptsStartingBetween(Carbon $min, Carbon $max, $eagerLoad = false){
        if ($eagerLoad){
            $appts = Appointment::orderBy('date_time')->with($eagerLoad)->get()->filter(function($appt) use ($min, $max){
                return $appt->date_time->isBetween($min, $max);
            });
        }else{
            $appts = Appointment::orderBy('date_time')->get()->filter(function($appt) use ($min, $max){
                return $appt->date_time->isBetween($min,$max);
            });
        }
        return $appts;
    }
    static function allApptsStartingAfter(Carbon $start, $eagerLoad = false){
        if ($eagerLoad){
            $appts = Appointment::orderBy('date_time')->with($eagerLoad)->get()->filter(function($appt) use ($start){
                return $appt->date_time->isAfter($start);
            });
        }else{
            $appts = Appointment::orderBy('date_time')->get()->filter(function($appt) use ($start){
                return $appt->date_time->isAfter($start);
            });
        }
        return $appts;        
    }
    static function allApptsStartingWithin24hr($eagerLoad = false){
        $start = Carbon::now()->addDay();
        $end = Carbon::now()->addDay()->addMinutes(15);
        return Appointment::allApptsStartingBetween($start,$end,$eagerLoad);
    }
    static function allApptsStartingWithin48hr($eagerLoad = false){
        $start = Carbon::now()->addDays(2);
        $end = Carbon::now()->addDays(2)->addMinutes(15);
        return Appointment::allApptsStartingBetween($start,$end,$eagerLoad);
    }
    static function allApptsStartingWithin72hr($eagerLoad = false){
        $start = Carbon::now()->addDays(3);
        $end = Carbon::now()->addDays(3)->addMinutes(15);
        return Appointment::allApptsStartingBetween($start,$end,$eagerLoad);
    }
    static function allApptsNeedingReminder(){
        $appts = Appointment::allApptsStartingWithin24hr('patients.userInfo')
                ->filter(function($appt){
                    $requested = $appt->patients->first()->settings['reminders']['appointments'];
                    $lastReminder = lastInArray($appt->status['reminders']['sentAt']);
                    if (!$lastReminder && $requested){return true;}
                    elseif ($lastReminder){
                        $lastReminder = new Carbon($lastReminder);
                        $failsafe = Carbon::now()->subMinutes(30);
                        return $lastReminder->isBefore($failsafe);
                    }
                    return true;
                });
        return $appts;
    }
    static function recentAppointmentsWithoutNotes($daysBack = 30){
        $midnight = Carbon::now()->setTime(23,59,0);  $start = Carbon::now()->subDays($daysBack);
        $appts = Appointment::allApptsStartingBetween($start, $midnight, 'chartNote')->filter(function($appt){
            return !$appt->chartNote;
        });
        return $appts;
    }
    static function recentAppointmentsWithUnsignedNotes($daysBack = 30){
        $midnight = Carbon::now()->setTime(23,59,0);  $start = Carbon::now()->subDays($daysBack);
        $appts = Appointment::allApptsStartingBetween($start, $midnight, 'chartNote')->filter(function($appt){
            return $appt->chartNote && $appt->chartNote->signed_at === 'not signed';
        });
        return $appts;
    }
    static function recentAppointmentsWithoutInvoices($daysBack = 30){
        $midnight = Carbon::now()->setTime(23,59,0);  $start = Carbon::now()->subDays($daysBack);
        $appts = Appointment::allApptsStartingBetween($start, $midnight, 'invoice')->filter(function($appt){
            return !$appt->invoice;
        });
        return $appts;
    }
    static function recentAppointmentsWithUnpaidInvoices($daysBack = 30){
        $midnight = Carbon::now()->setTime(23,59,0);  $start = Carbon::now()->subDays($daysBack);
        $appts = Appointment::allApptsStartingBetween($start, $midnight, 'invoice')->filter(function($appt){
            return $appt->invoice && $appt->invoice->settled_at !== 'pending';
        });
        return $appts;
    }

    static function firstThatNeedsForm($formId, $patientId = null){
        if (!$patientId && session('uidList') !== null && isset(session('uidList')['Patient'])){
            $patientId = session('uidList')['Patient'];
        }
        if ($patientId){
            $appointments = Patient::find($patientId)->appointments->filter(function($appt,$a) use($formId){
                return $appt->requiresForm($formId);
            });
        }else{
            $appointments = Appointment::allApptsStartingAfter(Carbon::now()->subMonths(1),"patients")->filter(function($appt,$a) use($formId){
                return $appt->requiresForm($formId);
            });
        }
        $appt = $appointments->first();
        return $appt;
    }
    static function defaultStatus(){
        return [
                    'scheduled_at' => Carbon::now()->toDateTimeString(),
                    'rescheduled_at' => false,
                    'reminders' => ['sentAt' => []],
                    'confirmed' => ['calendar' => [], 'sms' => []],
                    'canceled' => false,
                    'completed' => false,
                    'invoiced' => false,
                    'paid' => false
                ];
    }

    ////////
    public function forms($usertype = null){
        foreach ($this->services as $service){
            if ($usertype){
                $forms = $service->forms->filter(function($form) use ($usertype){
                    return $form->user_type == $usertype;
                });
            }else{
                $forms = $service->forms;
            }
            $allForms = !isset($allForms) ? $forms : $allForms->merge($forms);
        }
        return $allForms;
    }
    public function services(){
        return $this->morphToMany('App\Service', 'serviceable');
    }
    public function chartNote(){
        return $this->hasOne('App\ChartNote');
    }
    public function patients(){
        return $this->morphedByMany("App\Patient", 'appointmentable');
    }
    public function patient(){
        return $this->patients->first();
    }
    public function practitioner(){
        return $this->belongsTo("App\Practitioner", 'practitioner_id');
    }
    public function submissions(){
        return $this->hasMany('App\Submission');
    }
    public function invoice(){
        return $this->hasOne('App\Invoice');
    }

    public function checkFormSubmission($formId){
        $submission = $this->submissions->filter(function($submission) use($formId){
            return $submission->form_id = $formId;
        });
        return ($submission->count() == 0) ? false : true;
    }

    public function getPatientUserModelsAttribute(){
        return $this->patients->map(function($patient){
            return $patient->userInfo;
        });
    }
    public function getLongDateTimeAttribute(){
        return $this->date_time->format('h:ia \o\n D n/j/y');
    }
    public function getDateAttribute(){
        return $this->date_time->format('n/j/y');        
    }
    public function getServiceListAttribute(){
        $services = $this->services->map(function($service){
            return $service->name;
        })->toArray();
        return implode(", ",$services);
    }
    public function getPatientListAttribute(){
        $patients = $this->patients->map(function($patient){
            return $patient->name;
        })->toArray();
        return implode(", ",$patients);
    }
    public function getNameAttribute(){
        return $this->service_list." (".$this->date_time->format('n/j/y').")";
    }

    public function requiresForm($formId, $usertype = null){
        $required = false;
        if (!$usertype){$usertype = Auth::user()->user_type;}
        $apptId = $this->id;
        $this->services->each(function($service,$s) use($formId, $apptId, &$required, $usertype){
            $formIds = $service->forms->map(function($form, $f) use($apptId, $usertype){
                $submission = Submission::where('appointment_id',$apptId)->get();
                $formType = isset($form->settings['form_type']) ? $form->settings['form_type'] : 'any user type';
                $usertypeMatch = in_array($formType, ['any user type',$usertype]);
                if ($submission->count() == 0 && $usertypeMatch){
                    return $form->form_id;
                }
            })->toArray();
            $required = in_array($formId, $formIds);
            if ($required){return;}
        });
        return $required;
    }
    public function saveToGoogleCal($method = 'POST', $calendarId = null){
        // $practiceId = session('practiceId');

        $calendar = app('GoogleCalendar');
        $practice = Practice::getFromSession();
        $calendarId = isset($calendarId) ? $calendarId : $practice->calendar_id;
        $start = Carbon::parse($this->date_time);
        $end = Carbon::parse($this->date_time)->addMinutes($this->duration);

        $services = $this->services;
        $serviceDesc = $services->first()->description_calendar;

        $formArr = $this->forms()->filter(function($form){
            return $form->user_type == 'patient';
        })->map(function($form){
            return 
            [
                'form_id' => $form->form_id,
                'name' => $form->form_name
            ];
        })->toArray();

        // $attendees = $this->patients;
        $attendeeArr = $this->patients->map(function($patient){
            return 
            [
                'displayName' => $patient->name,
                'email' => $patient->email
            ];
        })->toArray();

        $event = new \Google_Service_Calendar_Event([
            'start' => ['dateTime' => $start->toRfc3339String()],
            'end' => ['dateTime' => $end->toRfc3339String()],
            'summary' => $this->service_list,
            'description' => $serviceDesc,
            'attendees' => $attendeeArr,
            'location' => '1706 S Lamar Blvd',
            'id' => $this->uuid,
            // 'organizer', $organizer,
            'guestsCanSeeOtherGuests' => false,
            'guestsCanInviteOthers' => false,
            'extendedProperties' => [
                'private' => [
                    'type' => 'EHR:appointment',
                    'forms' => json_encode($formArr)
                ]
            ]
        ]);

        try{
            if ($method == 'POST'){
                $event = $calendar->events->insert($calendarId, $event);
                $this->appt_link = $event->htmlLink;
                $this->save();
            }
            elseif ($method == 'PATCH'){
                $event = $calendar->events->patch($calendarId, $this->uuid, $event);
            }
            return true;
        }catch(\Exception $e){
            return $e;
        }
    }
    public function removeFromGoogleCal($calendarId = null, $eventId = null){
        try{
            $calendarId = isset($calendarId) ? $calendarId : session('calendarId');
            $eventId = isset($eventId) ? $eventId : $this->uuid;
            $service = app('GoogleCalendar');
            $service->events->delete($calendarId, $eventId);
            return true;
        }catch(\Exception $e){
            // Log::info($e);
            reportError($e,'Appointment.php 329');
            return false;
        }
    }
    public function saveToFullCal(){
        $practice = Practice::getFromSession();
        $calendarId = $practice->calendar_id;
        $eventId = $this->uuid;
        $cal = app("GoogleCalendar");
        $event = $cal->events->get($calendarId, $eventId);

        $ehrArr = [];
        $nonEhrArr = [];
        $recurringEventExceptions = [];
        $apptIds = [];

        $newEvent = [];
        unset($start, $end, $allDay, $id, $title, $extendedProperties);

        $start = $event->start->dateTime;
        $allDay = false;
        if (empty($start)) {
            $start = $event->start->date;
            $allDay = true;
        }
        $end = $event->end->dateTime;
        if (empty($end)) {
            $end = $event->end->date;
        }
        $id = $event->id;
        $title = $event->summary;

        // DEFINE EVENT DATETIME DETAILS
            if (isset($event->recurrence)){
                $start = Carbon::parse($start);
                $end = Carbon::parse($end);
                $duration = $start->diff($end)->format("%H:%I");
                $dtstart = "DTSTART:".$start->format('Ymd\THis');
                $rrule = $dtstart."\n".$event->recurrence[0];
                $newEvent = array(
                    "id" => $id,
                    "title" => $title,
                    "allDay" => $allDay,
                    'rrule' => $rrule,
                    'duration' => $duration,
                    'extendedProps' => [
                        'exTime' => $start->format('\THis')
                    ]
                );
            }elseif (isset($event->recurringEventId)){
                $startCarbon = Carbon::parse($start);
                $endCarbon = Carbon::parse($end);
                $duration = $startCarbon->diff($endCarbon)->format("%H:%I");
                $exDate = $startCarbon->format('Ymd');

                $newEvent = array(
                    "start" => $start,
                    "end" => $end,
                    "allDay" => $allDay,
                    "id" => $id,
                    "title" => $title,
                    'extendedProps' => [
                        'recurringEventId' => $event->recurringEventId
                    ]
                );
                $recurringEventExceptions[$event->recurringEventId] = $exDate;
            }else{
                $newEvent = array(
                    "start" => $start,
                    "end" => $end,
                    "allDay" => $allDay,
                    "id" => $id,
                    "title" => $title
                );
            }

        // DEFINE EVENT TYPE
                $type = (isset($event->extendedProperties) && isset($event->extendedProperties->private['type'])) ? $event->extendedProperties->private['type'] : 'nonEHR';
                if ($type == "EHR:appointment"){
                    $ehrArr[$id] = $newEvent;
                    $apptIds[] = $id;
                }elseif($type == "nonEHR"){
                    $newEvent['extendedProps']['type'] = 'nonEHR';
                    $nonEhrArr[$id] = $newEvent;
                }

        // EXCLUDE MODIFIED DATES FOR RECURRING EVENTS
            foreach ($recurringEventExceptions as $id => $exDate){
                if (isset($nonEhrArr[$id])){
                    $time = $nonEhrArr[$id]['extendedProps']['exTime'];
                    $nonEhrArr[$id]['rrule'] .= "\nEXDATE:".$exDate.$time;
                }
            }
        
        $appointmentData = Appointment::where('uuid',$apptIds)->with('services.forms','patients','practitioner')->get()->map(function($appt){
            // Log::info($appt,['location'=>'appointment.php 463']);
            return $appt->getDetailsForFullCal();
        });
        foreach ($appointmentData as $apptDetails){
            $uuid = $apptDetails['googleUuid'];
            $extProps = isset($ehrArr[$uuid]['extendedProps']) ? array_merge_recursive($ehrArr[$uuid]['extendedProps'],$apptDetails) : $apptDetails;
            $ehrArr[$uuid]['extendedProps'] = $extProps;
        }
        if (!empty($ehrArr)){
            $feed = $practice->appointments_enc;
            $feed[$eventId] = $ehrArr[$eventId];
            $practice->appointments_enc = $feed;
        }
        if (!empty($nonEhrArr)){
            $feed = $practice->other_events_enc;
            $feed[$eventId] = $nonEhrArr[$eventId];
            $practice->other_events_enc = $feed;
        }
        $practice->save();
        return isset($e) ? false : true; 
    }
    public function getDetailsForFullCal(){
        $appt = $this;
        $formArr = [];
        foreach ($appt->services as $service){
            $forms = $service->forms->filter(function($form){
                return $form->user_type == 'patient';
            })->map(function($form) use($appt){
                $patient = $appt->patients->first();
                return [
                    'form_id' => $form->form_id,
                    'name' => $form->form_name,
                    'completed' => $appt->checkFormSubmission($form->form_id)
                ];
            })->toArray();
            $formArr = array_merge($formArr,$forms);
        }
        $chartNote = $appt->chartNote;
        $noteInfo = $chartNote ? [
            'status' => $chartNote->signed_at,
            'id' => $chartNote->id
        ] : null;   
        $invoice = $appt->invoice;
        $invoiceInfo = $invoice ? [
            'status' => $invoice->status,
            'id' => $invoice->id
        ] : null;   
        $arr = [
            'services' => implode(", ",$appt->services->map(function($service){return $service->name;})->toArray()),
            'patients' => implode(", ",$appt->patients->map(function($patient){return $patient->name;})->toArray()),
            'serviceIds' => $appt->services->modelKeys(),
            'patientIds' => $appt->patients->modelKeys(),
            'noteInfo' => $noteInfo,
            'invoiceInfo' => $invoiceInfo,
            'forms' => $formArr,
            'status' => $appt->status,
            'bodywizardUid' => $appt->id,
            'googleUuid' => $appt->uuid,
            'practitioner' => $appt->practitioner->name,
            'practitionerId' => $appt->practitioner->id,
            'type' => "EHR:appointment"
        ];
        return $arr;
    }
    public function removeFromFullCal($practiceId = null, $eventId = null){
        $practice = isset($practiceId) ? Practice::find($practiceId) : Practice::getFromSession();
        $calendarId = $practice->calendarId;
        $eventId = isset($eventId) ? $eventId : $this->uuid;
        $feed = $practice->appointments_enc;
        unset($feed[$eventId]);
        $practice->appointments_enc = $feed;
        $practice->save();
    }
}
