<?php

namespace App\Http\Controllers;

use App\Practitioner;
use App\Patient;
use App\Practice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;


class ScheduleController extends Controller
{
    public function __construct(){
        $this->middleware('auth');
    }

    public function scheduleFeed(){
        include_once app_path("/php/functions.php");

    	$usertype = Auth::user()->user_type;
    	$id = Auth::user()->id;
        $practiceId = session('practiceId');
        $exists = Storage::disk('local')->exists('/calendar/'.$practiceId.'/practitioner-schedule.json');
        $practitionerSched = $exists ? Storage::disk('local')->get('/calendar/'.$practiceId.'/practitioner-schedule.json') : '';
        $exists = Storage::disk('local')->exists('/calendar/'.$practiceId.'/practice-schedule.json');
        if ($exists){
            $bizHourSched = Storage::disk('local')->get('/calendar/'.$practiceId.'/practice-schedule.json');
            $bizHourEvents = scheduleToEvents(json_decode($bizHourSched,true),[]);
            $earliest = new Carbon($bizHourEvents['earliest']);
            $latest = new Carbon($bizHourEvents['latest']);
            $earliest = $earliest->subMinute()->subUnitNoOverflow("minute",60,"hour")->toTimeString();
            $latest = $latest->addUnitNoOverflow("minute",60,"hour")->toTimeString();
        }else{
            $bizHourSched = '';
            $earliest = "08:00:00";
            $latest = "21:00:00";
        }
        $anonFeed = Practice::anonApptEventFeed();
        
        $exists = Storage::disk('local')->exists('/calendar/'.$practiceId.'/business-hours.json');
        $bizHours = $exists ? Storage::disk('local')->get('/calendar/'.$practiceId.'/business-hours.json') : '';
		return "<div id='BizHours' data-fullcal='$bizHours' data-schedule='$bizHourSched' data-earliest='$earliest' data-latest='$latest'></div>
                    <div id='Practitioners' data-schedule='$practitionerSched'></div>
                    <div id='AnonFeed' data-schedule='$anonFeed'></div>";
    }
    public function appointmentEventFeed(){
        $usertype = Auth::user()->user_type;
        $userId = Auth::user()->id;
        $practiceId = session('practiceId');
        if ($usertype == 'practitioner'){
            $exists = Storage::disk('local')->exists('/calendar/'.$practiceId.'/practitioner/ehr-feed.json');
            if ($exists){
                $events = json_decode(Storage::disk('local')->get('/calendar/'.$practiceId.'/practitioner/ehr-feed.json'),true);
                $array = [];
                foreach($events as $id => $event){
                    $array[] = $event;
                }
                $result = json_encode($array);
            }else{
                $result = '';
            }
            return $result;
        }
        elseif ($usertype == 'patient'){
            $exists = Storage::disk('local')->exists('/calendar/'.$practiceId.'/practitioner/ehr-feed.json');
            if ($exists){
                $events = json_decode(Storage::disk('local')->get('/calendar/'.$practiceId.'/practitioner/ehr-feed.json'),true);
                $array = [];
                foreach($events as $id => $event){
                    // RETURNS ONLY THIS PATIENT'S APPOINTMENTS
                    $patientIds = $event['extendedProps']['patientIds'];
                    $patientUserIds = Patient::returnUserIds($patientIds);
                    if (in_array($userId, $patientUserIds)){
                        $array[] = $event;
                    }
                }
                $result = json_encode($array);
            }else{
                $result = '';
            }
            return $result;
        }
    }
    public function anonApptEventFeed(){
        $practiceId = session('practiceId');
        $exists = Storage::disk('local')->exists('/calendar/'.$practiceId.'/practitioner/ehr-feed.json');
        if ($exists){
            $events = json_decode(Storage::disk('local')->get('/calendar/'.$practiceId.'/practitioner/ehr-feed.json'),true);
            $array = [];
            foreach($events as $id => $event){
                $array[] = $event;
            }
            $result = json_encode($array);
            Log::info($array);
        }else{
            $result = '';
        }
    }
    public function nonEhrEventFeed(){
        $usertype = Auth::user()->user_type;
        $id = Auth::user()->id;
        $practiceId = session('practiceId');
        if ($usertype == 'practitioner'){
            $exists = Storage::disk('local')->exists('/calendar/'.$practiceId.'/practitioner/non-ehr-feed.json');
            if ($exists){
                $events = json_decode(Storage::disk('local')->get('/calendar/'.$practiceId.'/practitioner/non-ehr-feed.json'),true);
                $array = [];
                foreach($events as $id => $event){
                    $array[] = $event;
                }
                $result = json_encode($array);
            }else{
                $result = '';
            }
            return $result;
        }        
    }


    //SCHEDULES
        public function EditUserSchedule($model, $uid){
            return view('portal.admin.schedule-edit',[
                'model' => $model,
                "uid" => $uid
            ]);            
        }
        public function EditPracticeSchedule(){
            return view('portal.admin.schedule-edit',[
                'model' => 'Practice',
            ]);
        }
        public function SavePracticeSchedule(Request $request){
            include_once app_path("/php/functions.php");
            $practiceId = session('practiceId');
            $schedule = revertJsonBool($request->schedule);
            $bizHours = scheduleToFullCalBizHours($schedule);
            Storage::disk('local')->put('calendar/'.$practiceId.'/practice-schedule.json',json_encode($schedule));
            Storage::disk('local')->put('calendar/'.$practiceId.'/business-hours.json',json_encode($bizHours));
            return 'checkmark';
        }
}
