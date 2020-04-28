<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

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
use App\Traits\Encryptable;


class Practice extends Model
{
    use Encryptable;

    protected $connection = 'practices';
    protected $table = 'practice_info';
    protected $casts = [
        'contact_info' => 'array',
        'cal_webhook' => 'array',
        'anon_appt_feed' => 'array',
        'settings' => 'array',
        'schedule' => 'array'
    ];
    protected $primaryKey = 'practice_id';
    public $incrementing = false;

    public $practiceId;
    public $calendarId;
    public $database;
    public $practitioners;

    public static function getFromRequest(Request $request){
        $host = $request->getHost();
        $practices = Practice::where('host',$host)->get();
        $practice = ($practices->count() == 0) ? Practice::find('body_wizard_medicine_8f935c6718b4402') : $practices->first();
        if ($practices->count() > 1) reportError('Multiple practices with the same host: '.$practice->host,['location'=>'Practice.php 49']);
        return $practice ? $practice : null;
    }
    public static function getFromSession(){
        if (app()->runningInConsole()){
            $practiceId = getActiveStorage('Practice');
            $practice = Practice::find($practiceId);
        }elseif (session('practiceId') !== null){
            $practice = Practice::find(session('practiceId'));
        }else{
            $practice = null;
        }
        return $practice;
    }

    public function navBarInfo(){
        return [
            'currency' => $this->currency,
        ];
    }

    public function setAppointmentsEncAttribute($value){
        $this->attributes['appointments_enc'] = $this->encryptKms($value);
    }
    public function getAppointmentsEncAttribute($value){
        return $this->decryptKms($value);
    }
    public function setOtherEventsEncAttribute($value){
        $this->attributes['other_events_enc'] = $this->encryptKms($value);
    }
    public function getOtherEventsEncAttribute($value){
        return $this->decryptKms($value);
    }
    public function getCalendarSettingsAttribute(){
        $settings = $this->settings;
        if (!$settings || !isset($settings['calendar'])){
            return [
                "interval" => 30,
                "overlap" => false,
                "maxSlotsDisplayed" => 3
            ];
        }
        else{
            return $settings['calendar'];
        }
    }
    public function getPracticeScheduleAttribute(){
        $schedule = $this->schedule;
        if (!$schedule || !isset($schedule['practice'])){
            return [
                [
                    "days" => ["Sunday" => false,"Monday" => true,"Tuesday" => true,"Wednesday" => true,"Thursday" => true,"Friday" => true,"Saturday" => false],
                    "start_time" => "9:00am",
                    "end_time" => "5:00pm",
                    "break" => false
                ]
            ];
        }
        else{
            return $schedule['practice'];;
        }
    }
    public function getPractitionerScheduleAttribute(){
        $schedule = $this->schedule;
        if (!$schedule || !isset($schedule['practitioner'])){
            return [];
        }
        else{
            return $schedule['practitioner'];;
        }
    }
    public function getBusinessHoursAttribute(){
        $schedule = $this->schedule;
        if (!$schedule || !isset($schedule['business_hours'])){
            return [
                ["daysOfWeek"=>[1,2,3,4,5],"startTime"=>"09:00:00","endTime"=>"17:00:00","rendering"=>"background"]
            ];
        }
        else{
            return $schedule['business_hours'];;
        }
    }
    public function getTimeSlotsAttribute(){
        $calSettings = $this->calendar_settings;
        $practiceSched = $this->practice_schedule;
        $practiceSched = scheduleToEvents($practiceSched);
        $earliest = Carbon::parse($practiceSched['earliest']);
        $latest = Carbon::parse($practiceSched['latest']);

        $times = [];
        while ($earliest->isBefore($latest)){
            $times[] = ['carbon' => $earliest->toTimeString(),'display' => $earliest->format('g:i a')];
            $earliest->addMinutes($calSettings['interval']);
        }
        return $times;
    }
    public function getAppointmentsAttribute(){
        $user = Auth::user();
        $usertype = $user->user_type;
        $userId = $user->id;
        $practice = Practice::getFromSession();
        $appointments = $practice->appointments_enc;
        if (!$appointments || empty($appointments) || $appointments == '[]'){
            return [];
        }
        if ($usertype == 'practitioner'){
            $array = [];
            foreach ($appointments as $id => $event){
                $array[] = $event;
            }
            return $array;
        }
        elseif ($usertype == 'patient'){
            $array = [];
            $userPatientId = $user->patientInfo->id;
            foreach($appointments as $id => $event){
                // RETURNS ONLY THIS PATIENT'S APPOINTMENTS
                $apptPatientId = $event['extendedProps']['patient']['id'];
                // $patientUserIds = Patient::returnUserIds($patientIds);
                if ($userPatientId == $apptPatientId){
                    $array[] = $event;
                }
            }
            return $array;
        }
    }
    public function getAvailablePaymentMethodsAttribute(){
        $settings = $this->settings;
        return ($settings && isset($settings['paymentMethods'])) ? $settings['paymentMethods'] : ['cash','check'];
    }
    public function getCurrencyAttribute(){
        $settings = $this->settings;
        $abbr = ($settings && isset($settings['currency'])) ? $settings['currency'] : 'usd';
        $symbolMap = [
            'dollars' => '$'
        ];
        $map = [
            'usd' => ['currency'=>'dollars','symbol'=>'$','abbr'=>'usd']
        ];
        try{
            if (!isset($map[$abbr])) throw new \Exception("Currency abbreviation not found: '$abbr'");
            $currency = $map[$abbr];
        }catch(\Exception $e){
            reportError($e, 'Practice.php 184');
            $currency = $map['usd'];
        }
        return $currency;
    }
    public function getTaxOptionsAttribute(){
        $settings = $this->settings;
        $taxOptions = ($settings && isset($settings['taxOptions'])) ? $settings['taxOptions'] : [];
        return $taxOptions;
    }

    public function reconnectDB(){
        $dbname = $this->dbname;
        config(['database.connections.mysql.database' => $dbname]);
        DB::reconnect();
    }
    public function updateEntireEventFeed(){
        $calendarId = $this->calendar_id;
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
            reportError($e, 'Practice.php 223');
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

            $appointmentData = Appointment::whereIn('uuid',$apptIds)->with('services','patient','practitioner','chartNote')->get()->map(function($appt){
                return $appt->getDetailsForFullCal();
            });
            foreach ($appointmentData as $apptDetails){
                $uuid = $apptDetails['googleUuid'];
                $extProps = isset($ehrArr[$uuid]['extendedProps']) ? array_merge($ehrArr[$uuid]['extendedProps'],$apptDetails) : $apptDetails;
                $ehrArr[$uuid]['extendedProps'] = $extProps;
            }
        }
        $anonArr = [];
        foreach($ehrArr as $id => $event){
            $anonArr[$id] = 
                [
                    'start' => $event['start'],
                    'end' => $event['end'],
                    'practitionerId' => $event['extendedProps']['practitioner']['id'],
                    'overlap' => null,
                    'uuid' => $id
                ];
        }
        try{
            $this->appointments_enc = json_encode($ehrArr);
            $this->other_events_enc = json_encode($nonEhrArr);
            $this->anon_appt_feed = $anonArr;
            // Log::info($this);
            $this->save();
        }catch(Exception $e){
            reportError($e,'practice.php 341');
        }

        return isset($e) ? $e : true;
    }
    public function savePractitionerSchedules(){
        $practitionerArr = [];
        foreach (Practitioner::where('schedule','!=','null')->get() as $practitioner){
            $user_id = $practitioner->userInfo->id;
            $practitionerInfo = [
                'user_id' => $user_id,
                'practitioner_id' => $practitioner->id,
                'name' => $practitioner->name,
                'schedule' => $practitioner->schedule,
                'exceptions' => $practitioner->schedule_exceptions
            ];
            $practitionerArr[] = $practitionerInfo;
        }
        $schedule = $this->schedule;
        if (!$schedule){
            $this->schedule = ['practitioner'=>$practitionerArr];
        }elseif (!isset($schedule['practitioner'])){
            $schedule['practitioner'] = $practitionerArr;
            $this->schedule = $schedule;
        }
        $this->save();
        return true;
    }

    // FOR INITIALIZING A NEW PRACTICE
    	public static function createCalendar($name){
    	    $service = app('GoogleCalendar');
    	    $calendar = new \Google_Service_Calendar_Calendar();
    	    $calendar->setSummary($name." EHR");
    	    $calendar->setTimeZone('America/Chicago');

    	    try{
    	      $createdCalendar = $service->calendars->insert($calendar);
    	      $calendarId = $createdCalendar->getId();
    	    }catch(\Exception $e){
              reportError($e,'Practice.php 381');
    	    }

    	    return isset($e) ? $e : $calendarId;
    	}
    	public function shareCalendar($email){
    	    $service = app('GoogleCalendar');
    	    $rule = new \Google_Service_Calendar_AclRule();
    	    $scope = new \Google_Service_Calendar_AclRuleScope();

    	    $scope->setType("user");
    	    $scope->setValue($email);
    	    $rule->setScope($scope);
    	    $rule->setRole("owner");
            
            $calId = $this->calendar_id;
    	    
            try{
    	      $createdRule = $service->acl->insert($calId, $rule);
    	    }catch(\Exception $e){
                reportError($e,'Practice.php 401');
    	    }
    	    return isset($e) ? $e : $calId;
    	}
    	public function newCalWebHook(){
            $calendarId = $this->calendar_id;
    	    $client = app('GoogleClient');
    	    $service = app('GoogleCalendar');
    	    $channel = new \Google_Service_Calendar_Channel();
    	    $channel->setId(uuid());
    	    $channel->setAddress('https://bodywizard.ngrok.io/push/google/calendar');
    	    $channel->setType('web_hook');
    	    try{
    	      $watch = $service->events->watch($calendarId, $channel);
              $newConfig = ["id" => $watch->getId(), "expires" => $watch->getExpiration()];
    	    }catch (\Exception $e){
              reportError($e,'Practice.php 417');
    	    }
    	    return isset($e) ? $e : $newConfig;
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
    	public function createDatabase($dbname){
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
                config(['database.connections.mysql.database' => $dbname]);
                Artisan::call("migrate");
    	    }catch(\Exception $e){
              reportError($e,'Practice.php 447');
    	    }

    	    return isset($e) ? $e : true;
    	}
        public function refreshUsers(){
            $practiceId = $this->practice_id;
            try{
                Artisan::call("refresh:users $practiceId --factory");
            }catch(\Exception $e){
                reportError($e,'Practice.php 457');
            }
            return isset($e) ? $e : true;
        }
    	public function makeCryptoKey(){
    	    $kms = app('GoogleKMS');
    	    $keyRing = config('google.kms_keyring');
    	    $key = new CryptoKey();
    	    // $keyName = snake($practiceName)."_".$practiceId;
            $keyName = $this->practice_id;

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
                reportError($e,'Practice.php 481');
    	    }
    	    
    	    return isset($e) ? false : $key->getName();
    	}
    	public function installBasicForms(){
            $this->reconnectDB();
    	    try{
    	      $forms = json_decode(Storage::get('/basicEhr/forms.json'),true);
    	      DB::table('forms')->insert($forms);
    	    }catch(\Exception $e){
                reportError($e,'Practice.php 492');
    	    }
    	    return isset($e) ? $e : true;
    	}
        public function clearCalendar($calendarId = null){
            if (!$calendarId){$calendarId = $this->calendar_id;}
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

}
