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
    
    $practitionerSched = $practice->practitioner_schedule;

    $bizHourSched = $practice->practice_schedule;
    $bizHourEvents = scheduleToEvents($bizHourSched);
    $earliest = new Carbon($bizHourEvents['earliest']);
    $latest = new Carbon($bizHourEvents['latest']);
    $earliest = $earliest->subMinute()->subUnitNoOverflow("minute",60,"hour")->toTimeString();
    $latest = $latest->addUnitNoOverflow("minute",60,"hour")->toTimeString();

    $anonFeed = $practice->anon_events;
    $bizHours = $practice->business_hours;
    $appts = $practice->appointments;
    $nonEhr = $practice->other_events_enc;
?>

<div id='BizHours' data-fullcal='{{json_encode($bizHours)}}' data-schedule='{{json_encode($bizHourSched)}}' data-earliest='{{$earliest}}' data-latest='{{$latest}}'></div>
<div id='Practitioners' data-schedule='{{json_encode($practitionerSched)}}'></div>
<div id='AppointmentsFullCall' data-schedule='{{json_encode($appts)}}'></div>
<div id='NonEhr' data-schedule='{{json_encode($nonEhr)}}'></div>
<div id='AnonFeed' data-schedule='{{json_encode($anonFeed)}}'></div>