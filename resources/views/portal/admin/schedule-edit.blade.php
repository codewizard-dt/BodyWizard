<?php
require_once app_path("php/functions.php");
Use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

$scheduleForm = App\Form::where('form_id', 19)->orderBy('version_id','desc')->first();
$breakForm = App\Form::where('form_id', 20)->orderBy('version_id','desc')->first();
$practiceId = session('practiceId');

if ($model == 'Practice'){
	$exists = Storage::disk('local')->exists('/calendar/'.$practiceId.'/practice-schedule.json');
	if ($exists){$schedule = json_decode(Storage::get('/calendar/'.$practiceId.'/practice-schedule.json'),true);}
	else{$schedule = [];}
	$exceptions = [];
	$nospaces = $model;
	$uid = null;
}else{
	$nospaces = removespaces($model);
	$class = "App\\$nospaces";
	$scheduledUser = $class::find($uid);
	$schedule = isset($scheduledUser->schedule) ? $scheduledUser->schedule : [];
	$exceptions = isset($scheduledUser->schedule_exceptions) ? $scheduledUser->schedule_exceptions : [];
}

// $schedule = json_decode(Storage::disk('local')->get("/calendar/test/breakup-blocks.json"),true);
$events = scheduleToEvents($schedule, $exceptions);
$eventBlocks = $events['eventBlocks'];
$earliest = $events['earliest'];
$latest = $events['latest'];
$today = Carbon::now();
$todayNumerical = numericalWeekday($today);


?>
@if ($model == "Practice")
	<h1 class="purple">Business Hours</h1>
@else
	<h1 class="purple">Current Schedule</h1>
@endif
<div id="CurrentSchedule" data-schedulejson='{{ json_encode($schedule) }}' data-schedulearray='{{ json_encode($eventBlocks) }}' data-exceptions='{{ json_encode($exceptions) }}'>
</div>
<div id="miniSchedule" class="miniCal" data-today="{{ $todayNumerical }}" data-earliest='{{ $earliest->subMinute()->subUnitNoOverflow("minute",60,"hour")->toTimeString() }}' data-latest='{{ $latest->addUnitNoOverflow("minute",60,"hour")->toTimeString() }}'></div>

<h5>click table or calendar to edit <div class="little">*overlapping hours will use the fewest "services offered" as indicated below*</div></h5>
@include ('schedules.table',[
	"model" => $nospaces,
	'uid' => $uid,
	'schedule' => $schedule,
	'exceptions' => $exceptions
])	

@if ($model == "Practice")
	<div class="button small pink" id="AddTimeBlockBtn">add business hours</div>
@else
	<div class="button small pink" id="AddTimeBlockBtn">add to schedule</div>
	<div class="button small pink" id="AddBreakBtn">add break</div>
	<div class="button small cancel">dismiss</div>
@endif

<div id='AddTimeBlock' class='modalForm' data-break='false'>{{ $scheduleForm->formDisplay(true) }}</div>
<div id='EditTimeBlock' class='modalForm' data-break='false'>{{ $scheduleForm->formDisplay(true) }}</div>
<div id='AddBreak' class='modalForm' data-break='true'>{{ $breakForm->formDisplay(true) }}</div>
<div id='EditBreak' class='modalForm' data-break='true'>{{ $breakForm->formDisplay(true) }}</div>
<div id="editOrDeleteBlock" class="modalForm prompt">
	<div class="message">
		<h1 class='purple'>Time Block Details</h1>
		<div class="split50KeyValues">
			<div class="days">
				<div class='label'>Scheduled Days:</div>
				<span class='value'></span>
			</div>
			<div class="times">
				<div class='label'>Scheduled Times:</div>
				<span class='value'></span>
			</div>
			@if ($model != 'StaffMember')
			<div class="services">
				<div class='label'>Services Offered:</div>
				<span class='value'></span>
			</div>
			@endif
		</div>
	</div>
	<div class="options">
		<div class="button medium pink" id="editBlockBtn">edit block</div>
		<div class="button medium pink" id="deleteBlockBtn">delete block</div>
		<div class="button medium cancel">dismiss</div>
	</div>
</div>
<div id="editOrDeleteBreak" class="modalForm prompt">
	<div class="message">
		<h1 class='purple'>Scheduled Break Details</h1>
		<div class="split50KeyValues">
			<div class="days">
				<div class='label'>Scheduled Days:</div>
				<span class='value'></span>
			</div>
			<div class="times">
				<div class='label'>Scheduled Times:</div>
				<span class='value'></span>
			</div>
		</div>
	</div>
	<div class="options">
		<div class="button medium pink" id="editBreakBtn">edit break</div>
		<div class="button medium pink" id="deleteBreakBtn">delete break</div>
		<div class="button medium cancel">dismiss</div>
	</div>
</div>

@include('models.table-modal', [
	'model' => "Service",
	'number' => "many",
	'relationship' => "morphToMany",
	'connectedTo' => "Schedule"
])

@include ('schedules.scripts')
<script src="{{ asset('/js/launchpad/schedules.js') }}"></script>
