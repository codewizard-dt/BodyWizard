<?php
$practitioners = App\Practitioner::where('schedule', '!=', null)->get();
$practice = App\Practice::first();
$models = ['Service', 'Patient', 'Practitioner', 'Appointment'];
$bizhours = $practice->full_cal_biz_hours;
?>
<div class="calendar">
    @foreach ($practitioners as $practitioner)
        <div class="schedule" data-display='none' data-modal='ScheduleBlock' data-model='Practitioner'
            data-uid='{{ $practitioner->getKey() }}'
            data-responses="{{ $practitioner->schedule ? json_encode($practitioner->schedule, true) : 'null' }}">
        </div>
    @endforeach
    <div class="schedule" data-display='background' data-events="{{ json_encode($bizhours, true) }}"></div>
    <div class="schedule" data-active='true' data-model='Appointment' data-modal='Appointment'
        data-feed_url="/appointment/feed"></div>
</div>
@include('models.list_update',compact('models'))
<div class="hidden">
    @include('models.create.template',['model'=>'Appointment'])
</div>
