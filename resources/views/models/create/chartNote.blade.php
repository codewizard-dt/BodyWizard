<?php 
use Illuminate\Support\Carbon;

$chartnote = $instance;
$appt = $chartnote ? $chartnote->appointment : \App\Appointment::find($request->where_array['appointment_id']);
$date = Carbon::parse($request->where_array['appointment_datetime']);

?>

<div id='ChartNote' class='central large'>
	<div class="body">
		<h1>New Chart Note - {{$date->format('n/j/y')}}</h1>
		<h1 class='purple'>{{$appt->patient->name}}</h1>
	</div>
	<div class="options">
		<div class="button cancel">close</div>
	</div>
</div>