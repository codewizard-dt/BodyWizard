<?php 
use Illuminate\Support\Facades\Auth;
use App\Form;

$ctrl = new Form;
$practice = \App\Practice::getFromSession();

$times = $practice->time_slots;
if (Auth::user()->user_type == 'patient'){
	$dateOptions = [
		'minDate' => '+1d',
		'maxDate' => '+6m',
		'name' => 'DateSelector'
	];	
}else{
	$dateOptions = [
		'minDate' => '-1w',
		'maxDate' => '+1y',
		'name' => 'DateSelector'
	];	
}
?>

<div id="SelectDate" class='progressiveSelection selector toModalHome'>
	<h2 class='purple center' style='text-align: center;' data-default='Select Date'>Select Date</h2>
	{{$ctrl->answerDisp('date',$dateOptions)}}
</div>

<div id="SelectTime" class='progressiveSelection selector toModalHome'>
	<h2 class='purple center' style='text-align: center;' data-default='Times'>Times</h2>
	<div id='ServiceWarning' class='pink'><div class="message">availability may change when services are added</div><div id='ServiceWarningLink' class='button xxsmall pink70'>select services now</div></div>
	<ul id='TimeSelector' class='answer radio'>
		@foreach ($times as $time)
			<li data-value="{{$time['carbon']}}">{{$time['display']}}</li>
		@endforeach
	</ul>
</div>
