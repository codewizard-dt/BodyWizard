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
