<?php

namespace App;

use App\Traits\TrackChanges;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;

// use Google\Service\Calendar;

class Appointment extends Model
{
    use TrackChanges;

    public $tableValues;
    public $optionsNavValues;
    public $connectedModels;
    public $auditOptions;

    protected $casts = [
        'status' => 'array'
    ];

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

    public function optionsNav(){

    }

    public function services(){
        return $this->morphToMany('App\Service', 'serviceable');
    }
    public function patients(){
        return $this->morphedByMany("App\Patient", 'appointmentable');
    }
    public function practitioner(){
        return $this->belongsTo("App\Practitioner", 'practitioner_id');
    }
    public function saveToGoogleCal($method = 'POST', $calendarId = null){
        include_once app_path("/php/functions.php");

        $calendar = app('GoogleCalendar');
        $calendarId = isset($calendarId) ? $calendarId : session('calendarId');
        $start = Carbon::parse($this->date_time);
        $end = Carbon::parse($this->date_time)->addMinutes($this->duration);

        $services = $this->services;
        $serviceNames = $services->map(function($service){
            return $service->name;
        })->toArray();

        $serviceDesc = $services->first()->description_calendar;
        $serviceNames = implode(", ", $serviceNames);

        $attendees = $this->patients;
        $attendeeArr = $attendees->map(function($attendee){
            return 
            [
                'displayName' => getNameFromUid("Patient",$attendee->id),
                'email' => $attendee->userInfo->email
            ];
        })->toArray();

        $event = new \Google_Service_Calendar_Event([
            'start' => ['dateTime' => $start->toRfc3339String()],
            'end' => ['dateTime' => $end->toRfc3339String()],
            'summary' => $serviceNames,
            'description' => $serviceDesc,
            'attendees' => $attendeeArr,
            'location' => '1706 S Lamar Blvd',
            'id' => $this->uuid,
            // 'organizer', $organizer,
            'guestsCanSeeOtherGuests' => false,
            'guestsCanInviteOthers' => false,
            'extendedProperties' => [
                'private' => [
                    'type' => 'EHR:appointment'
                ]
            ]
        ]);

        try{
            if ($method == 'POST'){$event = $calendar->events->insert($calendarId, $event);}
            elseif ($method == 'PATCH'){$event = $calendar->events->patch($calendarId, $this->uuid, $event);}
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
            Log::info($e);
            return false;
        }
    }
    public function clearCalendar($calendarId){
        $service = app('GoogleCalendar');
        try{
            $events = $service->events->listEvents($calendarId);
            foreach($events->getItems() as $event){
                $eventId = $event->getId();
                $service->events->delete($calendarId,$eventId);
            }
            return true;
        }catch(\Exception $e){
            Log::info($e);
            return false;
        }
    }
    public function updateEventFeed($practiceId = null, $eventId = null){
        $practiceId = isset($practiceId) ? $practiceId : session('practiceId');
        $calendarId = config("practices.$practiceId.app.calendarId");
        $eventId = isset($eventId) ? $eventId : $this->uuid;
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

        $appointmentData = Appointment::where('uuid',$apptIds)->with('services','patients','practitioner')->get()->map(function($appt){
            $arr = [
                'services' => implode(", ",$appt->services->map(function($service){return getNameFromUid("Service",$service->id);})->toArray()),
                'patients' => implode(", ",$appt->patients->map(function($patient){return getNameFromUid("Patient",$patient->id);})->toArray()),
                'serviceIds' => $appt->services->modelKeys(),
                'patientIds' => $appt->patients->modelKeys(),
                'status' => $appt->status,
                'bodywizardUid' => $appt->id,
                'googleUuid' => $appt->uuid,
                'practitioner' => getNameFromUid("Practitioner",$appt->practitioner->id),
                'practitionerId' => $appt->practitioner->id,
                'type' => "EHR:appointment"
            ];
            return $arr;
        });
        foreach ($appointmentData as $apptDetails){
            $uuid = $apptDetails['googleUuid'];
            $extProps = isset($ehrArr[$uuid]['extendedProps']) ? array_merge_recursive($ehrArr[$uuid]['extendedProps'],$apptDetails) : $apptDetails;
            $ehrArr[$uuid]['extendedProps'] = $extProps;
        }
        if (!empty($ehrArr)){
            // Log::info($ehrArr);
            $feed = json_decode(Storage::disk('local')->get('calendar/'.$practiceId.'/practitioner/ehr-feed.json'),true);
            $feed[$eventId] = $ehrArr[$eventId];
            Storage::disk('local')->put('calendar/'.$practiceId.'/practitioner/ehr-feed.json',json_encode($feed));
        }
        if (!empty($nonEhrArr)){
            // Log::info($nonEhrArr);
            $feed = json_decode(Storage::disk('local')->get('calendar/'.$practiceId.'/practitioner/non-ehr-feed.json'),true);
            $feed[$eventId] = $nonEhrArr[$eventId];
            Storage::disk('local')->put('calendar/'.$practiceId.'/practitioner/non-ehr-feed.json',json_encode($feed));
        }
        return isset($e) ? false : true; 
    }
}
