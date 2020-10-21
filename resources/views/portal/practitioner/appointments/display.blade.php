<?php
    Namespace App;
    Use Carbon\Carbon;
    Use App\Form;
    Use App\Practitioner;
    Use App\Appointment;
    use Illuminate\Support\Facades\Storage;
    use Illuminate\Support\Facades\Log;
    use Illuminate\Support\Facades\Request;


    // include_once app_path("/php/functions.php");

    $ctrl = new Form;
    $changeTitleOptions = ['names','service','no label','ID*ChangeTitle'];

    if (isset($_POST['OptParams'])){
    	// echo "opt params passed";	
    }else{
    	// echo "no opt params passed";
    }
?>  

<h2 class="purple paddedSmall">Appointment Calendar</h2>
<div id="ChangeTitleWrap">
</div>
<div id="TimezoneWrap"></div>

<div id="PractitionerCalendar" class='calendar practitioner' data-location='Austin, TX' data-timezone='{{date_default_timezone_get()}}'>
    <div class='lds-ring dark'><div></div><div></div><div></div><div></div></div>
</div>
<div id='ScheduleFeedTarget'></div>
<div id="NonEhrInfo" class="modalForm prompt">
    <div class="message">
    </div>
    <div class="options">
    </div>
</div>
<div id="Appointment" class="modalForm prompt">

</div>

@include ('models.create.appointment')

@include ('schedules.practitioners')
@include ('schedules.times')
@include ('schedules.details')
@include ('schedules.feeds')
