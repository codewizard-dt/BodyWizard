<?php
namespace App;

use App\Traits\TrackChanges;
use App\Traits\Encryptable;

use App\Message;
use \DateTime;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Support\Arr;
use App\Events\AppointmentSaved;

class Appointment extends Model
{
  use TrackChanges;
  use Encryptable;

  protected $casts = [
    'status' => 'array',
    'recurrence' => 'array',
    'exclusions' => 'array',
    'date_time_start' => 'datetime',
    'date_time_end' => 'datetime',
  ];
  protected $guarded = [];
  protected $visible = ['id','uuid','patient_id','practitioner_id','date_time','duration','status'];

  public function moreOptions(){

  }
  public function detailClick(){
    $model = getModel($this);
    $uid = $this->getKey();
    $chartnote = $this->chartNote ? $this->chartNote->signed_at : 'none';
    $invoice = $this->invoice ? $this->invoice->settled_at : 'none';
    return "<span class='link appointment' data-model='$model' data-uid='$uid' data-chartnote='$chartnote' data-invoice='$invoice'>" . $this->name . "</span>";
  }
  static public function successResponse(){
    $appt = Appointment::find(getUid('Appointment'));
    return ['google_id'=>$appt->google_id,'uid'=>$appt->id,'recurring_id'=>$appt->recurring_id];
  }

  // static function allApptsStartingBetween(Carbon $min, Carbon $max, $eagerLoad = false){
  //   if ($eagerLoad){
  //     $appts = Appointment::orderBy('date_time')->with($eagerLoad)->get()->filter(function($appt) use ($min, $max){
  //       return $appt->date_time->isBetween($min, $max);
  //     });
  //   }else{
  //     $appts = Appointment::orderBy('date_time')->get()->filter(function($appt) use ($min, $max){
  //       return $appt->date_time->isBetween($min,$max);
  //     });
  //   }
  //   return $appts;
  // }
  // static function allApptsStartingAfter(Carbon $start, $eagerLoad = false){
  //   if ($eagerLoad){
  //     $appts = Appointment::orderBy('date_time')->with($eagerLoad)->get()->filter(function($appt) use ($start){
  //       return $appt->date_time->isAfter($start);
  //     });
  //   }else{
  //     $appts = Appointment::orderBy('date_time')->get()->filter(function($appt) use ($start){
  //       return $appt->date_time->isAfter($start);
  //     });
  //   }
  //   return $appts;        
  // }
  // static function allApptsStartingWithin24hr($eagerLoad = false){
  //   $start = Carbon::now()->addDay();
  //   $end = Carbon::now()->addDay()->addMinutes(15);
  //   return Appointment::allApptsStartingBetween($start,$end,$eagerLoad);
  // }
  // static function allApptsStartingWithin48hr($eagerLoad = false){
  //   $start = Carbon::now()->addDays(2);
  //   $end = Carbon::now()->addDays(2)->addMinutes(15);
  //   return Appointment::allApptsStartingBetween($start,$end,$eagerLoad);
  // }
  // static function allApptsStartingWithin72hr($eagerLoad = false){
  //   $start = Carbon::now()->addDays(3);
  //   $end = Carbon::now()->addDays(3)->addMinutes(15);
  //   return Appointment::allApptsStartingBetween($start,$end,$eagerLoad);
  // }
  // static function allApptsNeedingReminder(){
  //   $appts = Appointment::allApptsStartingWithin24hr('patient.user')
  //   ->filter(function($appt){
  //     $requested = $appt->patient->settings['reminders']['appointments'];
  //     $lastReminder = lastInArray($appt->status['reminders']['sentAt']);
  //     if (!$lastReminder && $requested){return true;}
  //     elseif ($lastReminder){
  //       $lastReminder = new Carbon($lastReminder);
  //       $failsafe = Carbon::now()->subMinutes(30);
  //       return $lastReminder->isBefore($failsafe);
  //     }
  //     return true;
  //   });
  //   return $appts;
  // }
  // static function recentAppointmentsWithoutNotes($daysBack = 30){
  //   $midnight = Carbon::now()->setTime(23,59,0);  $start = Carbon::now()->subDays($daysBack);
  //   $appts = Appointment::allApptsStartingBetween($start, $midnight, 'chartNote')->filter(function($appt){
  //     return !$appt->chartNote;
  //   });
  //   return $appts;
  // }
  // static function recentAppointmentsWithUnsignedNotes($daysBack = 30){
  //   $midnight = Carbon::now()->setTime(23,59,0);  $start = Carbon::now()->subDays($daysBack);
  //   $appts = Appointment::allApptsStartingBetween($start, $midnight, 'chartNote')->filter(function($appt){
  //     return $appt->chartNote && $appt->chartNote->signed_at === 'not signed';
  //   });
  //   return $appts;
  // }
  // static function recentAppointmentsWithoutInvoices($daysBack = 30){
  //   $midnight = Carbon::now()->setTime(23,59,0);  $start = Carbon::now()->subDays($daysBack);
  //   $appts = Appointment::allApptsStartingBetween($start, $midnight, 'invoice')->filter(function($appt){
  //     return !$appt->invoice;
  //   });
  //   return $appts;
  // }
  // static function recentAppointmentsWithPendingInvoices($daysBack = 30){
  //   $midnight = Carbon::now()->setTime(23,59,0);  $start = Carbon::now()->subDays($daysBack);
  //   $appts = Appointment::allApptsStartingBetween($start, $midnight, 'invoice')->filter(function($appt){
  //     if ($appt->invoice) Log::info($appt->invoice->settled_at);
  //     return $appt->invoice && $appt->invoice->settled_at == 'pending';
  //   });
  //   return $appts;
  // }

  // static function firstThatNeedsForm($formId, $patientId = null){
  //   if (!$patientId && session('uidList') !== null && isset(session('uidList')['Patient'])){
  //     $patientId = session('uidList')['Patient'];
  //   }
  //   if ($patientId){
  //     $appointments = Patient::find($patientId)->appointments->filter(function($appt,$a) use($formId){
  //       return $appt->requiresForm($formId);
  //     });
  //   }else{
  //     $appointments = Appointment::allApptsStartingAfter(Carbon::now()->subMonths(1),"patient")->filter(function($appt,$a) use($formId){
  //       return $appt->requiresForm($formId);
  //     });
  //   }
  //   $appt = $appointments->first();
  //   return $appt;
  // }
  // static function defaultStatus(){
  //   return [
  //     'scheduled_at' => Carbon::now()->toDateTimeString(),
  //     'rescheduled_at' => false,
  //     'reminders' => [],
  //     'confirmed' => [],
  //     'canceled' => false,
  //     'completed' => false,
  //     'invoiced' => false,
  //     'paid' => false
  //   ];
  // }

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
    return $this->morphToMany('App\ChartNote', 'chart_noteable');
  }
  public function patient(){
    return $this->belongsTo('App\Patient', 'patient_id');
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

//   public function getPatientUserModelsAttribute(){
//     reportError("don't use patient_user_models",'Appointment 259');
// // return $this->patients->map(function($patient){
// //     return $patient->user;
// // });
//   }
//   public function getLongDateTimeAttribute(){
//     return $this->date_time->format('h:ia \o\n D n/j/y');
//   }
//   public function getDateAttribute(){
//     return $this->date_time->format('n/j/y');        
//   }
  public function getServiceListAttribute(){
    $services = $this->services->map(function($service){
      return $service->name;
    })->toArray();
    return implode(", ",$services);
  }
  public function getPatientListAttribute(){
    reportError("don't use patient_list",'Appointment 277');
// $patients = $this->patients->map(function($patient){
//     return $patient->name;
// })->toArray();
// return implode(", ",$patients);
  }
  public function getNameAttribute(){
    return $this->service_list." (".$this->date_time_start->format('n/j/y').")";
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

  //GOOGLE CALENDAR
    public function gcal($operation){
      try{
        if ($operation == 'create' || $operation == 'update') $this->saveToGoogleCal($operation);
        else if ($operation == 'delete') $this->removeFromGoogleCal();
      }catch(\Exception $e){
        reportError($e,'appointment 319');
      }
      return !isset($e);
    }
    public function getDetailsForGCal(){
      $start = Carbon::parse($this->date_time);
      $end = Carbon::parse($this->date_time)->addMinutes($this->duration);

      $description = $this->services->map(function($service,$s){
        return $service->description_calendar;
      })->toArray();
      $description = implode("\n",$description);

      $forms = $this->forms('patient')->map(function($form){
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
            'email' => $this->patient->email
          ]
        ],
        'location' => '1706 S Lamar Blvd',
        'id' => $this->uuid,
        'guestsCanSeeOtherGuests' => false,
        'guestsCanInviteOthers' => false,
        'extendedProperties' => [
          'private' => [
            'type' => 'EHR:appointment',
          ]
        ]
      ];
    }
    public function saveToGoogleCal($operation, $calendarId = null){
      $calendar = app('GoogleCalendar');
      $practice = Practice::getFromSession();
      $calendarId = isset($calendarId) ? $calendarId : $practice->calendar_id;

      $details = $this->getDetailsForGCal();
      $event = new \Google_Service_Calendar_Event($details);

      try{
        if ($operation == 'create'){
          $event = $calendar->events->insert($calendarId, $event);
          Appointment::where('id',$this->id)->update(['appt_link' => $event->htmlLink]);
        }
        elseif ($operation == 'update'){
          $event = $calendar->events->patch($calendarId, $this->uuid, $event);
        }
        return true;
      }catch(\Exception $e){
        reportError($e,'saveToGoogleCal 336');
        return false;
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
        reportError($e,'Appointment.php 329');
        return false;
      }
    }
  //FULLCALENDAR
    public function fcal($operation){
      try{
        if ($operation == 'create' || $operation == 'update') $this->saveToFullCal();
        else if ($operation == 'delete') $this->removeFromFullCal();
      }catch(\Exception $e){
        reportError($e,'appointment 404');
      }
      return !isset($e);
    }
    public function saveToFullCal(){
      $practice = Practice::getFromSession();
      $start = Carbon::parse($this->date_time);
      $end = Carbon::parse($this->date_time)->addMinutes($this->duration);

      $event = [
        'start' => $start,
        'end' => $end,
        'title' => $this->service_list,
        'allDay' => false,
        'classNames' => ['EHR','appointment'],
        'extendedProps' => $this->getDetailsForFullCal()
      ];
      $anonEvent = [
        'start' => $start,
        'end' => $end,
        'practitioner_id' => $this->practitioner->id,
        'uid' => $this->id,
        'uuid' => $this->uuid,
        'classNames' => ['EHR','appointment'],
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

    public function getDetailsForFullCal(){
      $appt = $this;
      $forms = $appt->forms('patient')->map(function($form) use ($appt){
        return [
          'form_id' => $form->form_id,
          'name' => $form->form_name,
          'completed' => $appt->checkFormSubmission($form->form_id)
        ];
      })->toArray();
      $chartNote = $appt->chartNote ? ['status' => $appt->chartNote->signed_at,'id' => $appt->chartNote->id] : ['id' => null];
      $invoice = $appt->invoice ? ['status' => $appt->invoice->status,'id' => $appt->invoice->id] : ['id' => null];
      $arr = [
        'services' => ['names' => implode(", ",$appt->services->map(function($service){return $service->name;})->toArray()),'ids' => $appt->services->modelKeys()],
        'patient' => ['name' => $appt->patient->name,'id' => $appt->patient->id],
        'chartNote' => $chartNote,
        'invoice' => $invoice,
        'forms' => $forms,
        'status' => $appt->status,
        'uid' => $appt->id,
        'googleUuid' => $appt->uuid,
        'practitioner' => ['name' => $appt->practitioner->name, 'id' => $appt->practitioner->id],
        'type' => "EHR:appointment"
      ];
      return $arr;
    }
    public function removeFromFullCal($practiceId = null, $eventId = null){
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
