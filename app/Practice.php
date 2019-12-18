<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Google\ApiCore\ApiException;
use Google\Cloud\Kms\V1\CryptoKey;
use Google\Cloud\Kms\V1\CryptoKey\CryptoKeyPurpose;
use Google\Cloud\Kms\V1\KeyRing;
use Google\Protobuf\Duration;
use Google\Protobuf\Timestamp;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Str;


class Practice extends Model
{
    //
    public $practiceId;
    public $calendarId;
    public $database;
    public $practitioners;

    public function __construct(){
    	// $this->practiceId = $practiceId;
    	// $this->calendarId = config('practices')['app']['calendarId'];
    	// $this->database = config('practices')['app']['database'];
    	// // $this->practitioners = 
    }
	public static function createCalendar($name,$email){
	    $service = app('GoogleCalendar');
	    // $calendarId = config('google')['calendar_id'];
	    $calendar = new \Google_Service_Calendar_Calendar();
	    $calendar->setSummary($name." EHR");
	    $calendar->setTimeZone('America/Chicago');

	    try{
	      $createdCalendar = $service->calendars->insert($calendar);
	      $calendarId = $createdCalendar->getId();
	    }catch(\Exception $e){
	      Log::info($e);
	    }

	    if (isset($calendarId)){
	      Practice::shareCalendar($calendarId, $email);
	    }

	    return isset($calendarId) ? $calendarId : false;
	}
	public static function shareCalendar($calendarId, $email){
	    $service = app('GoogleCalendar');
	    $rule = new \Google_Service_Calendar_AclRule();
	    $scope = new \Google_Service_Calendar_AclRuleScope();

	    $scope->setType("user");
	    $scope->setValue($email);
	    $rule->setScope($scope);
	    $rule->setRole("owner");

	    try{
	      $createdRule = $service->acl->insert($calendarId, $rule);
	    }catch(\Exception $e){
	      Log::info($e);
	    }
	    return isset($calendarId) ? $calendarId : false;
	}
	public static function watchCalendar($practiceId, $calendarId, $updateConfig = false){
        // include_once app_path("/php/functions.php");
	    $client = app('GoogleClient');
	    $service = app('GoogleCalendar');
	    $channel = new \Google_Service_Calendar_Channel();
	    $channel->setId(uuid());
	    $channel->setAddress('https://bodywizard.ngrok.io/push/google/calendar');
	    $channel->setType('web_hook');
	    try{
	      $watch = $service->events->watch($calendarId, $channel);
          $newConfig = ["id" => $watch->getId(), "expires" => $watch->getExpiration()];
          addToConfig('webhooks',$watch->getId(),$practiceId);
          if ($updateConfig){
            addToConfig("practices.$practiceId.app.webhooks",'calendar',$newConfig);
          }
	    }catch (\Exception $e){
	      Log::info($e);
	    }
	    return isset($e) ? false : $newConfig;
	}
    public static function checkCalWebHook($practiceId){
        $client = app('GoogleClient');
        $service = app('GoogleCalendar');
        $webhook = config("practices.$practiceId.app.webhooks.calendar");
        $expires = Carbon::createFromTimestampMs($webhook['expires']);
        $cutoff = Carbon::now()->addHours(26);
        $needNew = $expires->isBefore($cutoff);
        // Log::info($expires);
        // Log::info($cutoff);
        return $needNew;
    }
	public static function createDatabase($dbname){
	    $client = app('GoogleClient');
	    $client->addScope("https://www.googleapis.com/auth/sqlservice.admin");
	    $service = new \Google_Service_SQLAdmin($client);
	    $database = new \Google_Service_SQLAdmin_Database();
	    $database->setName($dbname);
	    $database->setCharset('utf8');
	    $database->setCollation('utf8_general_ci');
	    $project = config('google.project_id');
	    $instance = config('google.sql_instance');
	    try{
	      $result = $service->databases->insert($project, $instance, $database);
	    }catch(\Exception $e){
	      Log::info($e);
	    }
	    config(['database.connections.mysql.database' => $dbname]);
	    Artisan::call("migrate");
	    Artisan::call("refresh:users");
	    return isset($result) ? $dbname : false;
	}
	public static function makeCryptoKey($practiceId, $practiceName){
	    $kms = app('GoogleKMS');
	    $keyRing = config('google.kms_keyring');
	    $key = new CryptoKey();
	    $keyName = snake($practiceName)."_".$practiceId;

	    $duration = new Duration;
	    $duration->setSeconds(90*24*60*60);
	    $nextRotation = new Timestamp;
	    $nextRotation->fromDateTime(Carbon::now()->addDays(90));

	    $key->setPurpose(CryptoKeyPurpose::ENCRYPT_DECRYPT);
	    $key->setRotationPeriod($duration);
	    $key->setNextRotationTime($nextRotation);
	    $keyRing = config('google.kms_keyring');
	    
	    try{
	      $key = $kms->createCryptoKey($keyRing, $keyName, $key);  
	    }catch(\Exception $e){
	      Log::info($e);
	    }
	    
	    return isset($e) ? false : $key->getName();
	}
	public static function installBasicForms($dbname){
	    try{
	      $forms = json_decode(Storage::get('/basicEhr/forms.json'),true);
	      // Log::info($forms);
	      config(['database.connections.mysql.database' => $dbname]);
	      DB::table('forms')->insert($forms);
	    }catch(\Exception $e){
	      Log::info($e);
	    }
	    return isset($e) ? false : true;
	}
	public static function refreshUsers($dbname = null){
	    if ($dbname){
            config(['database.connections.mysql.database' => $dbname]);
            DB::reconnect();
        }
	    Artisan::call("refresh:users");
	}
    public static function clearCalendar($calendarId){
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
    public static function updateEntireEventFeed($practiceId = null){
        // include_once app_path("/php/functions.php");
		if (!$practiceId){
			if (session()->has('practiceId')){
				$practiceId = session('practiceId');
			}else{return false;}
		}
        $calendarId = config('practices')[$practiceId]['app']['calendarId'];
        $calendar = app('GoogleCalendar');
        try{
            $optParams = [
                'maxResults' => 250
            ];
            $results = $calendar->events->listEvents($calendarId, $optParams);
            $events = [];
            while(true) {
                foreach ($results->getItems() as $event) {
                    $events[] = $event;
                }
                $pageToken = $results->getNextPageToken();
                if ($pageToken) {
                    $optParams = array('pageToken' => $pageToken);
                    $results = $calendar->events->listEvents($calendarId, $optParams);
                } else {
                    break;
                }
            }
        }
        catch(\Exception $e){
            Log::info($e);
            $events = null;
        }

        $ehrArr = [];
        $nonEhrArr = [];
        $recurringEventExceptions = [];

        if (!empty($events)) {
            $apptIds = [];
            foreach ($events as $event) {
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
                        // Log::info($rrule);
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
            }

            // EXCLUDE MODIFIED DATES FOR RECURRING EVENTS
            foreach ($recurringEventExceptions as $id => $exDate){
                if (isset($nonEhrArr[$id])){
                    $time = $nonEhrArr[$id]['extendedProps']['exTime'];
                    $nonEhrArr[$id]['rrule'] .= "\nEXDATE:".$exDate.$time;
                }
            }

            $appointmentData = Appointment::whereIn('uuid',$apptIds)->with('services','patients','practitioner')->get()->map(function($appt){
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
                $extProps = isset($ehrArr[$uuid]['extendedProps']) ? array_merge($ehrArr[$uuid]['extendedProps'],$apptDetails) : $apptDetails;
                $ehrArr[$uuid]['extendedProps'] = $extProps;
            }
        }
        Storage::disk('local')->put('calendar/'.$practiceId.'/practitioner/ehr-feed.json',json_encode($ehrArr));
        Storage::disk('local')->put('calendar/'.$practiceId.'/practitioner/non-ehr-feed.json',json_encode($nonEhrArr));
        return isset($e) ? false : true;
    }    	
	public static function savePractitionerSchedules($practiceId = null){
		if (!$practiceId){
			if (session()->has('practiceId')){
				$practiceId = session('practiceId');
			}else{return false;}
		}
	    $practitionerArr = [];

	    foreach (Practitioner::where('schedule','!=','null')->get() as $practitioner){
	        $user_id = $practitioner->userInfo->id;
	        $practitionerInfo = [
	            'user_id' => $user_id,
	            'practitioner_id' => $practitioner->id,
	            'name' => getNameFromUid('User',$user_id),
	            'schedule' => $practitioner->schedule,
	            'exceptions' => $practitioner->schedule_exceptions
	        ];
	        $practitionerArr[] = $practitionerInfo;
	    }
	    Storage::disk('local')->put('calendar/'.$practiceId.'/practitioner-schedule.json',json_encode($practitionerArr));
	    return true;
	}
    public static function anonApptEventFeed($practiceId = null){
        if (!$practiceId){$practiceId = session('practiceId');}
        $exists = Storage::disk('local')->exists('/calendar/'.$practiceId.'/practitioner/ehr-feed.json');
        if ($exists){
            $events = json_decode(Storage::disk('local')->get('/calendar/'.$practiceId.'/practitioner/ehr-feed.json'),true);
            $array = [];
            foreach($events as $id => $event){
                $array[] = 
                    [
                        'start' => $event['start'],
                        'end' => $event['end'],
                        'practitionerId' => $event['extendedProps']['practitionerId'],
                        'overlap' => null
                    ];
            }
            $result = json_encode($array);
        }else{
            $result = '';
        }
        return $result;
    }
}
