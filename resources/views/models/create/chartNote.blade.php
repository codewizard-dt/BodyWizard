<?php 
use Illuminate\Support\Carbon;
use App\Appointment;

$appointment = Appointment::where('id',$request->where['appointment_id'])->with(['Patient','Practitioner','Services.Forms'])->first();
if (!$appointment) throw new \Exception('Appointment not found');
if ($instance) {

} else {
	
}

?>

<div id='ChartNote' class='central large'>
	<div class="body">
		<h1>New Chart Note</h1>
		<h1 class='purple'>{{$appointment->patient->name}}</h1>
	</div>
	<div class="options">
		<div class="button cancel">close</div>
	</div>
</div>