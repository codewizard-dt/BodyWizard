<?php
	use App\Practice;
	use Illuminate\Http\Request;
	use Illuminate\Support\Facades\Auth;
	use Illuminate\Support\Facades\Log;
	use Illuminate\Support\Facades\Storage;
	use Illuminate\Support\Carbon;
	// use Google\Cloud\Logging\LoggingClient;

	$usertype = Auth::user()->user_type;
	$id = Auth::user()->id;
    $practiceId = session('practiceId');
    
    // Log::info(session()->all(),['location'=>'ScheduleController 29']);
    // PRACTITIONER SCHEDULE
    $exists = Storage::disk('local')->exists('/calendar/'.$practiceId.'/practitioner-schedule.json');
    $practitionerSched = $exists ? Storage::disk('local')->get('/calendar/'.$practiceId.'/practitioner-schedule.json') : '';

    //BUSINESS HOURS
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
    // DE-IDENTIFIED FEED OF ALL EVENTS
    $anonFeed = Practice::anonApptEventFeed();

    $exists = Storage::disk('local')->exists('/calendar/'.$practiceId.'/business-hours.json');
    $bizHours = $exists ? Storage::disk('local')->get('/calendar/'.$practiceId.'/business-hours.json') : '';

    $appts = Practice::appointmentEventFeed();
    $nonEhr = Practice::nonEhrEventFeed();
?>

<div id='BizHours' data-fullcal='{{$bizHours}}' data-schedule='{{$bizHourSched}}' data-earliest='{{$earliest}}' data-latest='{{$latest}}'></div>
<div id='Practitioners' data-schedule='{{$practitionerSched}}'></div>
<div id='AppointmentsFullCall' data-schedule='{{$appts}}'></div>
<div id='NonEhr' data-schedule='{{$nonEhr}}'></div>
<div id='AnonFeed' data-schedule='{{$anonFeed}}'></div>