<?php 
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Carbon;
use App\Form;

include_once app_path("/php/functions.php");
$ctrl = new Form;
$practiceId = session('practiceId');
$calSettings = Storage::disk('local')->exists("/calendar/$practiceId/settings.json") ? Storage::disk('local')->get("/calendar/$practiceId/settings.json") : Storage::disk('local')->get("/basicEhr/calendar-settings.json");
$calSettings = json_decode($calSettings,true);
$practiceSched = json_decode(Storage::disk('local')->get("/calendar/$practiceId/practice-schedule.json"),true);
$practiceSched = scheduleToEvents($practiceSched,[]);
$earliest = Carbon::parse($practiceSched['earliest']);
$latest = Carbon::parse($practiceSched['latest']);
$times = [];
while ($earliest->isBefore($latest)){
	$times[] = ['carbon' => $earliest->toTimeString(),'display' => $earliest->format('g:i a')];
	$earliest->addMinutes($calSettings['interval']);
}

$practitionerSched = json_decode(Storage::disk('local')->get("/calendar/$practiceId/practitioner-schedule.json"),true);
$dateOptions = [
	'yearRange' => 'c+0:c+1',
	'minDate' => '-0d',
	'maxDate' => '+6m',
	'name' => 'DateSelector'
];
?>

<div id="SelectDateTime" class='progressiveSelection'>
	<div class="progressBar">
		<div class='back'></div>
	</div>
	<div class='open'>
		<div class="button small pink70 disabled openBtn" data-type='practitioner'>select time</div>
		<div class="button small pink closeBtn">confirm</div>
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
	<div id="ConfirmDateTime" class='step' data-order='3'>
		<h2 class='pink' style='text-align:center;font-weight:normal;'>Appointment Details</h2>
		<div class="target"></div>
		<div class="button submit pink xsmall closeBtn">confirm</div>
	</div>
</div>
