<?php
namespace App;

use App\Traits\TrackChanges;
use App\Traits\Encryptable;

use App\Message;
use \DateTime;
use Illuminate\Database\Eloquent\Model;
use App\User;
// use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Arr;
use App\Events\AppointmentSaved;
use App\Scopes\RoleSpecificScope;
use App\Traits\TableAccess;

class Appointment extends Model
{
    use TrackChanges;
    use Encryptable;
    use TableAccess;

    protected $casts = [
        'status' => 'array',
        'recurrence' => 'array',
        'exclusions' => 'array',
        'date_time_start' => 'datetime',
        'date_time_end' => 'datetime',
    ];
    protected $with = ['services'];
    protected $guarded = [];
    protected $hidden = ['services'];
    protected $appends = ['service_ids'];

    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope(new RoleSpecificScope);
    }

    public function details()
    {
        return ['Name' => $this->name];
    }
    public function services()
    {
        return $this->morphToMany('App\Service', 'serviceable');
    }
    public function chartNote()
    {
        return $this->morphToMany('App\ChartNote', 'chart_noteable');
    }
    public function patient()
    {
        return $this->belongsTo('App\Patient', 'patient_id');
    }
    public function practitioner()
    {
        return $this->belongsTo("App\Practitioner", 'practitioner_id');
    }
    public function submissions()
    {
        return $this->hasMany('App\Submission');
    }
    public function invoice()
    {
        return $this->hasOne('App\Invoice');
    }

    public function getChartFormsAttribute()
    {
        return $this->services->flatMap(function ($service) {
            return $service->chart_forms;
        })->unique();
    }
    public function getServiceListAttribute()
    {
        $services = $this->services->map(function ($service) {
            return $service->name;
        })->toArray();
        return implodeAnd($services);
    }
    public function getServiceIdsAttribute()
    {
        return $this->services->modelKeys();
    }
    public function getNameAttribute()
    {
        return $this->service_list . " (" . $this->date_time_start->format('n/j/y') . ")";
    }

    //GOOGLE CALENDAR
    public function gcal($operation)
    {
        try {
            if ($operation == 'create' || $operation == 'update') {
                $this->saveToGoogleCal($operation);
            } else if ($operation == 'delete') {
                $this->removeFromGoogleCal();
            }

        } catch (\Exception $e) {
            reportError($e, 'appointment 319');
        }
        return !isset($e);
    }
    public function getDetailsForGCal()
    {
        $start = Carbon::parse($this->date_time);
        $end = Carbon::parse($this->date_time)->addMinutes($this->duration);

        $description = $this->services->map(function ($service, $s) {
            return $service->description_calendar;
        })->toArray();
        $description = implode("\n", $description);

        $forms = $this->forms('patient')->map(function ($form) {
            return ['form_id' => $form->form_id, 'name' => $form->form_name];
        })->toArray();
        $forms = json_encode($forms);

        return [
            'start' => ['dateTime' => $start->toRfc3339String()],
            'end' => ['dateTime' => $end->toRfc3339String()],
            'summary' => $this->service_list,
            'description' => $description,
            'attendees' => [
                [
                    'displayName' => $this->patient->name,
                    'email' => $this->patient->email,
                ],
            ],
            'location' => '1706 S Lamar Blvd',
            'id' => $this->uuid,
            'guestsCanSeeOtherGuests' => false,
            'guestsCanInviteOthers' => false,
            'extendedProperties' => [
                'private' => [
                    'type' => 'EHR:appointment',
                ],
            ],
        ];
    }
    // public function saveToGoogleCal($operation, $calendarId = null){
    //   $calendar = app('GoogleCalendar');
    //   $practice = Practice::getFromSession();
    //   $calendarId = isset($calendarId) ? $calendarId : $practice->calendar_id;

    //   $details = $this->getDetailsForGCal();
    //   $event = new \Google_Service_Calendar_Event($details);

    //   try{
    //     if ($operation == 'create'){
    //       $event = $calendar->events->insert($calendarId, $event);
    //       Appointment::where('id',$this->id)->update(['appt_link' => $event->htmlLink]);
    //     }
    //     elseif ($operation == 'update'){
    //       $event = $calendar->events->patch($calendarId, $this->uuid, $event);
    //     }
    //     return true;
    //   }catch(\Exception $e){
    //     reportError($e,'saveToGoogleCal 336');
    //     return false;
    //   }
    // }
    public function removeFromGoogleCal($calendarId = null, $eventId = null)
    {
        try {
            $calendarId = isset($calendarId) ? $calendarId : session('calendarId');
            $eventId = isset($eventId) ? $eventId : $this->uuid;
            $service = app('GoogleCalendar');
            $service->events->delete($calendarId, $eventId);
            return true;
        } catch (\Exception $e) {
            reportError($e, 'Appointment.php 329');
            return false;
        }
    }
    //FULLCALENDAR
    public function fcal($operation)
    {
        try {
            throw new \Exception("FCAL???");
            if ($operation == 'create' || $operation == 'update') {
                $this->saveToFullCal();
            } else if ($operation == 'delete') {
                $this->removeFromFullCal();
            }

        } catch (\Exception $e) {
            reportError($e, 'appointment 404');
        }
        return !isset($e);
    }
    public function saveToFullCal()
    {
        logger("SAVE TO FULL CAL");
        $practice = Practice::getFromSession();
        $start = Carbon::parse($this->date_time);
        $end = Carbon::parse($this->date_time)->addMinutes($this->duration);

        $event = [
            'start' => $start,
            'end' => $end,
            'title' => $this->service_list,
            'allDay' => false,
            'classNames' => ['EHR', 'appointment'],
            'extendedProps' => $this->getDetailsForFullCal(),
        ];
        $anonEvent = [
            'start' => $start,
            'end' => $end,
            'practitioner_id' => $this->practitioner->id,
            'uid' => $this->id,
            'uuid' => $this->uuid,
            'classNames' => ['EHR', 'appointment'],
        ];
        // Log::info($event);
        $feed = $practice->appointments_enc;
        $feed[$this->uuid] = $event;
        $practice->appointments_enc = $feed;

        $feed = $practice->anon_appt_feed;
        $feed[$this->uuid] = $anonEvent;
        $practice->anon_appt_feed = $feed;

        $practice->save();
    }

    public function getDetailsForFullCal()
    {
        $appt = $this;
        $forms = $appt->forms('patient')->map(function ($form) use ($appt) {
            return [
                'form_id' => $form->form_id,
                'name' => $form->form_name,
                'completed' => $appt->checkFormSubmission($form->form_id),
            ];
        })->toArray();
        $chartNote = $appt->chartNote ? ['status' => $appt->chartNote->signed_at, 'id' => $appt->chartNote->id] : ['id' => null];
        $invoice = $appt->invoice ? ['status' => $appt->invoice->status, 'id' => $appt->invoice->id] : ['id' => null];
        $arr = [
            'services' => ['names' => implode(", ", $appt->services->map(function ($service) {return $service->name;})->toArray()), 'ids' => $appt->services->modelKeys()],
            'patient' => ['name' => $appt->patient->name, 'id' => $appt->patient->id],
            'chartNote' => $chartNote,
            'invoice' => $invoice,
            'forms' => $forms,
            'status' => $appt->status,
            'uid' => $appt->id,
            'googleUuid' => $appt->uuid,
            'practitioner' => ['name' => $appt->practitioner->name, 'id' => $appt->practitioner->id],
            'type' => "EHR:appointment",
        ];
        return $arr;
    }
    public function removeFromFullCal($practiceId = null, $eventId = null)
    {
        $practice = isset($practiceId) ? Practice::find($practiceId) : Practice::getFromSession();
        $calendarId = $practice->calendarId;
        $eventId = isset($eventId) ? $eventId : $this->uuid;

        $feed = $practice->appointments_enc;
        unset($feed[$this->uuid]);
        $practice->appointments_enc = $feed;

        $feed = $practice->anon_appt_feed;
        unset($feed[$this->uuid]);
        $practice->anon_appt_feed = $feed;

        $practice->save();
    }
}
