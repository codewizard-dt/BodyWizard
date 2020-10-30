<?php 
$practitioners = App\Practitioner::where('schedule','!=',null)->get();
$practice = App\Practice::getFromSession();
?>
<div class="calendar">


	@foreach($practitioners as $practitioner)
	<div class="schedule" data-display='none' data-modal='ScheduleBlock' data-model='Practitioner' data-uid='{{$practitioner->getKey()}}' data-responses="{{$practitioner->schedule ? json_encode($practitioner->schedule,true) : 'null'}}"></div>
	@endforeach
	<div class="schedule" data-display='background' data-modal='ScheduleBlock' data-model='Practice' data-uid='{{$practice->getKey()}}' data-responses="{{$practice->schedule ? json_encode($practice->schedule,true) : 'null'}}"></div>
	<div class="schedule" data-active='true' data-modal='Appointment' data-model='Practice' data-uid='{{$practice->getKey()}}' data-db_attr='appointments_enc' data-models="{{$practice->appointments_enc ? json_encode($practice->appointments_enc,true) : 'null'}}"></div>
</div>
<div id="Appointment" class='modalForm'>
@include('models.create.template',['model'=>'Appointment'])	
</div>
