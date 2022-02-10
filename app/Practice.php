<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

use App\Service;

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
use App\Traits\TableAccess;
use App\Traits\HasSettings;

class Practice extends Model
{
    use Encryptable;
    use TableAccess;
    use HasSettings;

    protected $casts = [
        // 'contact_info' => 'array',
        // 'cal_webhook' => 'array',
        // 'anon_appt_feed' => 'array',
        'settings' => 'array',
        'schedule' => 'array',
    ];
    protected $guarded = [];

    public static $instance_actions = [];
    public static $static_actions = [];
    // public static $list_attributes = ['duration', 'price'];
    public static function table()
    {
        $columns = [
            'Host Address' => 'host',
            'Active' => 'setting:active:false:active',
        ];
        $bool_cols = ['active'];
        $filters = [];
        $data = [
        ];
        return compact('columns', 'filters', 'data', 'bool_cols');
    }
    public function details()
    {
        $instance = [
        ];
        return $instance;
    }

    public function getTimezoneAttribute()
    {
        return $this->get_setting('Business Contact Info.Address.tz', 'America/Chicago');
    }
    public function getBusinessHoursAttribute()
    {
        return $this->get_setting('Business Hours', []);
    }
    public function getFullCalBizHoursAttribute()
    {
        $array = [];
        function time($str)
        {
            return (new \Carbon\Carbon($str))->toTimeString();
        }
        collect($this->business_hours)->each(function ($hours, $day) use (&$array) {
            $val = [];
            if ($day == 'Sunday') {set($val, 'daysOfWeek', [0], 'startTime', time($hours[0]), 'endTime', time($hours[1]));} else if ($day == 'Monday') {set($val, 'daysOfWeek', [1], 'startTime', time($hours[0]), 'endTime', time($hours[1]));} else if ($day == 'Tuesday') {set($val, 'daysOfWeek', [2], 'startTime', time($hours[0]), 'endTime', time($hours[1]));} else if ($day == 'Wednesday') {set($val, 'daysOfWeek', [3], 'startTime', time($hours[0]), 'endTime', time($hours[1]));} else if ($day == 'Thursday') {set($val, 'daysOfWeek', [4], 'startTime', time($hours[0]), 'endTime', time($hours[1]));} else if ($day == 'Friday') {set($val, 'daysOfWeek', [5], 'startTime', time($hours[0]), 'endTime', time($hours[1]));} else if ($day == 'Saturday') {set($val, 'daysOfWeek', [6], 'startTime', time($hours[0]), 'endTime', time($hours[1]));}
            if (!empty($val)) {
                array_push($array, $val);
            }

        });
        return $array;
    }

    public function navBarInfo()
    {
        return [
            'currency' => $this->currency,
            'tz' => $this->timezone,
        ];
    }

    public function getAppointmentsAttribute()
    {
        throw new \Exception('appointmnts booo');
        // $user = Auth::user();
        // $usertype = $user->user_type;
        // $userId = $user->id;
        // $practice = Practice::getFromSession();
        // $appointments = $practice->appointments_enc;
        // if (!$appointments || empty($appointments) || $appointments == '[]'){
        //   return [];
        // }
        // $appointments = array_values($appointments);
        // if ($usertype == 'patient'){
        //   $appointments = collect($appointments)->filter(function($appt){
        //     return $user->patient->id == $appt['extendedProps']['patient']['id'];
        //   })->toArray();
        // }
        // return $appointments;
    }
    public function getAvailablePaymentMethodsAttribute()
    {
        $settings = $this->settings;
        return ($settings && isset($settings['paymentMethods'])) ? $settings['paymentMethods'] : ['cash', 'check'];
    }
    public function getCurrencyAttribute()
    {
        $settings = $this->settings;
        $abbr = ($settings && isset($settings['currency'])) ? $settings['currency'] : 'usd';
        $symbolMap = [
            'dollars' => '$',
        ];
        $map = [
            'usd' => ['currency' => 'dollars', 'symbol' => '$', 'abbr' => 'usd'],
        ];
        try {
            if (!isset($map[$abbr])) {
                throw new \Exception("Currency abbreviation not found: '$abbr'");
            }

            $currency = $map[$abbr];
        } catch (\Exception $e) {
            reportError($e, 'Practice.php 184');
            $currency = $map['usd'];
        }
        return $currency;
    }

    public function reconnectDB()
    {
        throw new \Exception('Dont use reconnectDB');
        return;
        // $dbname = $this->dbname;
        // config(['database.connections.mysql.database' => $dbname]);
        // DB::reconnect();
    }

    public static function createCalendar($name)
    {
        $service = app('GoogleCalendar');
        $calendar = new \Google_Service_Calendar_Calendar();
        $calendar->setSummary($name . " EHR");
        $calendar->setTimeZone('America/Chicago');

        try {
            $createdCalendar = $service->calendars->insert($calendar);
            $calendarId = $createdCalendar->getId();
        } catch (\Exception $e) {
            reportError($e, 'Practice.php 381');
        }
        return isset($e) ? $e : $calendarId;
    }
    public function shareCalendar($email)
    {
        $service = app('GoogleCalendar');
        $rule = new \Google_Service_Calendar_AclRule();
        $scope = new \Google_Service_Calendar_AclRuleScope();

        $scope->setType("user");
        $scope->setValue($email);
        $rule->setScope($scope);
        $rule->setRole("owner");

        $calId = $this->calendar_id;

        try {
            $createdRule = $service->acl->insert($calId, $rule);
        } catch (\Exception $e) {
            reportError($e, 'Practice.php 401');
        }
        return isset($e) ? $e : $calId;
    }
    public function newCalWebHook()
    {
        $calendarId = $this->calendar_id;
        $client = app('GoogleClient');
        $service = app('GoogleCalendar');
        $channel = new \Google_Service_Calendar_Channel();
        $channel->setId(uuid());
        $channel->setAddress('https://bodywizard.ngrok.io/push/google/calendar');
        $channel->setType('web_hook');
        try {
            $watch = $service->events->watch($calendarId, $channel);
            $newConfig = ["id" => $watch->getId(), "expires" => $watch->getExpiration()];
        } catch (\Exception $e) {
            reportError($e, 'Practice.php 417');
        }
        return isset($e) ? $e : $newConfig;
    }
    public static function checkCalWebHook($practiceId)
    {
        $client = app('GoogleClient');
        $service = app('GoogleCalendar');
        $webhook = config("practices.$practiceId.app.webhooks.calendar");
        $expires = Carbon::createFromTimestampMs($webhook['expires']);
        $cutoff = Carbon::now()->addHours(26);
        $needNew = $expires->isBefore($cutoff);
        return $needNew;
    }
    // public function createDatabase($dbname){
    //   $client = app('GoogleClient');
    //   $client->addScope("https://www.googleapis.com/auth/sqlservice.admin");
    //   $service = new \Google_Service_SQLAdmin($client);
    //   $database = new \Google_Service_SQLAdmin_Database();
    //   $database->setName($dbname);
    //   $database->setCharset('utf8');
    //   $database->setCollation('utf8_general_ci');
    //   $project = config('google.project_id');
    //   $instance = config('google.sql_instance');
    //   try{
    //     $result = $service->databases->insert($project, $instance, $database);
    //     config(['database.connections.mysql.database' => $dbname]);
    //     Artisan::call("migrate");
    //   }catch(\Exception $e){
    //     reportError($e,'Practice.php 447');
    //   }
    //   return isset($e) ? $e : true;
    // }
    public function refreshUsers()
    {
        $practiceId = $this->practice_id;
        try {
            Artisan::call("refresh:users $practiceId --factory");
        } catch (\Exception $e) {
            reportError($e, 'Practice.php 457');
        }
        return isset($e) ? $e : true;
    }
    public function makeCryptoKey()
    {
        $kms = app('GoogleKMS');
        $keyRing = config('google.kms_keyring');
        $key = new CryptoKey();
        $keyName = $this->practice_id;

        $duration = new Duration;
        $duration->setSeconds(90 * 24 * 60 * 60);
        $nextRotation = new Timestamp;
        $nextRotation->fromDateTime(Carbon::now()->addDays(90));

        $key->setPurpose(CryptoKeyPurpose::ENCRYPT_DECRYPT);
        $key->setRotationPeriod($duration);
        $key->setNextRotationTime($nextRotation);
        $keyRing = config('google.kms_keyring');

        try {
            $key = $kms->createCryptoKey($keyRing, $keyName, $key);
        } catch (\Exception $e) {
            reportError($e, 'Practice.php 481');
        }

        return isset($e) ? false : $key->getName();
    }
    public function reinstallBasicForms()
    {
        Form::truncate()->get();
        return $this->installBasicForms();
    }
    public function installBasicForms()
    {
        try {
            $forms = json_decode(Storage::get('/basicEhr/forms.json'), true);
            foreach ($forms as $form) {Form::create($form);}
        } catch (\Exception $e) {
            reportError($e, 'Practice.php 492');
        }
        return isset($e) ? $e : true;
    }
    public function clearCalendar($calendarId = null)
    {
        if (!$calendarId) {$calendarId = $this->calendar_id;}
        $service = app('GoogleCalendar');
        try {
            $events = $service->events->listEvents($calendarId);
            foreach ($events->getItems() as $event) {
                $eventId = $event->getId();
                $service->events->delete($calendarId, $eventId);
            }
            return true;
        } catch (\Exception $e) {
            Log::info($e);
            return false;
        }
    }

}
