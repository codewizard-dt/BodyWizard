<?php
	use App\Practice;
	use Illuminate\Http\Request;
	use Illuminate\Support\Facades\Auth;
	use Illuminate\Support\Facades\Log;
	use Illuminate\Support\Facades\Storage;
	use Illuminate\Support\Carbon;

	$usertype = Auth::user()->user_type;
	$id = Auth::user()->id;
    $practice = Practice::getFromSession();
    
    // Log::info(session()->all(),['location'=>'ScheduleController 29']);
    // PRACTITIONER SCHEDULE

    // $exists = Storage::disk('local')->exists('/calendar/'.$practiceId.'/practitioner-schedule.json');
    // $practitionerSched = $exists ? Storage::disk('local')->get('/calendar/'.$practiceId.'/practitioner-schedule.json') : '';
    $practitionerSched = $practice->practitioner_schedule;

    //BUSINESS HOURS

    // $exists = Storage::disk('local')->exists('/calendar/'.$practiceId.'/practice-schedule.json');

    // if ($exists){
    //     $bizHourSched = Storage::disk('local')->get('/calendar/'.$practiceId.'/practice-schedule.json');
    //     $bizHourEvents = scheduleToEvents(json_decode($bizHourSched,true),[]);
    //     $earliest = new Carbon($bizHourEvents['earliest']);
    //     $latest = new Carbon($bizHourEvents['latest']);
    //     $earliest = $earliest->subMinute()->subUnitNoOverflow("minute",60,"hour")->toTimeString();
    //     $latest = $latest->addUnitNoOverflow("minute",60,"hour")->toTimeString();
    // }else{
    //     $bizHourSched = '';
    //     $earliest = "08:00:00";
    //     $latest = "21:00:00";
    // }
    $bizHourSched = $practice->practice_schedule;
    $bizHourEvents = scheduleToEvents($bizHourSched);
    $earliest = new Carbon($bizHourEvents['earliest']);
    $latest = new Carbon($bizHourEvents['latest']);
    $earliest = $earliest->subMinute()->subUnitNoOverflow("minute",60,"hour")->toTimeString();
    $latest = $latest->addUnitNoOverflow("minute",60,"hour")->toTimeString();

    // DE-IDENTIFIED FEED OF ALL EVENTS
    // $anonFeed = Practice::anonApptEventFeed();
    $anonFeed = $practice->anon_appt_feed;
    $bizHours = $practice->business_hours;
    $appts = $practice->appointments;
    $nonEhr = $practice->other_events_enc;

    // $appts = Practice::appointmentEventFeed();
    // $nonEhr = Practice::nonEhrEventFeed();

    // $exists = Storage::disk('local')->exists('/calendar/'.$practiceId.'/business-hours.json');
    // $bizHours = $exists ? Storage::disk('local')->get('/calendar/'.$practiceId.'/business-hours.json') : '';

?>

<div id='BizHours' data-fullcal='{{json_encode($bizHours)}}' data-schedule='{{json_encode($bizHourSched)}}' data-earliest='{{$earliest}}' data-latest='{{$latest}}'></div>
<div id='Practitioners' data-schedule='{{json_encode($practitionerSched)}}'></div>
<div id='AppointmentsFullCall' data-schedule='{{json_encode($appts)}}'></div>
<div id='NonEhr' data-schedule='{{json_encode($nonEhr)}}'></div>
<div id='AnonFeed' data-schedule='{{json_encode($anonFeed)}}'></div>