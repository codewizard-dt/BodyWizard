<?php 
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;
use App\Form;

// include_once app_path("/php/functions.php");
$ctrl = new Form;
// $practiceId = session('practiceId');
$practice = \App\Practice::getFromSession();
// $calSettings = $practice->calendar_settings;
// $practiceSched = $practice->practice_schedule;
// // $practiceSched = json_decode(Storage::disk('local')->get("/calendar/$practiceId/practice-schedule.json"),true);
// $practiceSched = scheduleToEvents($practiceSched);
// $earliest = Carbon::parse($practiceSched['earliest']);
// $latest = Carbon::parse($practiceSched['latest']);

// $times = [];
// while ($earliest->isBefore($latest)){
// 	$times[] = ['carbon' => $earliest->toTimeString(),'display' => $earliest->format('g:i a')];
// 	$earliest->addMinutes($calSettings['interval']);
// }

// $practitionerSched = json_decode(Storage::disk('local')->get("/calendar/$practiceId/practitioner-schedule.json"),true);
$times = $practice->time_slots;
$dateOptions = [
	'yearRange' => 'c+0:c+1',
	'minDate' => '-0d',
	'maxDate' => '+6m',
	'name' => 'DateSelector'
];
?>

<div id="SelectDateTime" class='progressiveSelection selector toModalHome'>
	<div class="progressBar">
		<div class='back'></div>
	</div>
	<div id="SelectDate" class='step' data-order='1' data-details="">
		<h3 data-default='Select Date'>Select Date</h3>
		{{$ctrl->answerDisp('date',$dateOptions)}}
		<br><div class="button small pink disabled next" data-target='#DateSelector' data-targettype='input' data-defaulttext='Availability For %VAL%'>next ></div>
	</div>
	<div id="SelectTime" class='step' data-order='2' data-details="">
		<h3 data-default='Times'>Times</h3>
		<ul id='TimeSelector' class='answer radio'>
			@foreach ($times as $time)
				<li data-value="{{$time['carbon']}}">{{$time['display']}}</li>
			@endforeach
		</ul>
		<br><div class="button small pink disabled next" data-target='#TimeSelector' data-targettype='ul' data-defaulttext='%PrevVAL% at %VAL%'>next ></div>
	</div>
</div>
