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
    <span class='vertCent'>event display: </span>
{{$ctrl->answerDisp('radio',$changeTitleOptions)}}    
</div>
<div id="TimezoneWrap"></div>

<div id="PractitionerCalendar" class='calendar practitioner' data-location='Austin, TX' data-timezone='{{date_default_timezone_get()}}'>
    <div class='lds-ring dark'><div></div><div></div><div></div><div></div></div>
</div>
<div id='ScheduleFeedTarget'></div>
<div id="ApptInfo" class="modalForm prompt">
    <div class="message">
        <h1 class='purple'>Appointment Details</h1>
        <div class='split3366KeyValues'>
            <div>
                <span class="label">Patient:</span>
                <span class='value' id="PatientName"></span>
            </div>
            <div>
                <span class="label">Practitioner:</span>
                <span class='value' id="PractitionerName"></span>
            </div>
            <div>
                <span class="label">Date + Time:</span>
                <span class='value' id="ApptDateTime"></span>
            </div>
            <div>
                <span class="label">Services:</span>
                <span class='value' id="ServiceInfo"></span>
            </div>
            <div>
                <span class="label">Required Forms:</span>
                <span class='value' id="FormInfo"></span>
            </div>
        </div>
    </div>
    <div class="options">
        <div class="button medium pink" id="EditApptBtn">edit details</div>
        <div class="button medium pink70" id="DeleteApptBtn">delete</div>
        <div class="button medium yellow" id="ChartNoteBtn">chart note</div>
        <div class="button medium yellow70" id="PaymentBtn">payment</div>
        <div class="button medium cancel">dismiss</div>
    </div>
</div>
<div id="NonEhrInfo" class="modalForm prompt">
    <div class="message">
        <h1 class='purple'>Non-EHR Event</h1>
        <div class='split50KeyValues'>
            <div>
                <span class="label">Title:</span>
                <span class='value' id="NonEhrTitle"></span>
            </div>
            <div>
                <span class="label">Date:</span>
                <span class='value' id="NonEhrDate"></span>
            </div>
            <div>
                <span class="label">Start Time:</span>
                <span class='value' id="NonEhrStart"></span>
            </div>
            <div>
                <span class="label">End Time:</span>
                <span class='value' id="NonEhrEnd"></span>
            </div>
        </div>
    </div>
    <div class="options">
        <div class="button medium pink" id="EditApptBtn">block schedule</div>
        <div class="button medium pink70" id="DeleteApptBtn">delete</div>
        <div class="button medium cancel">dismiss</div>
    </div>
</div>
@include ('models.create-modal',["model" => "Appointment"])
@include ('models.edit-modal',["model" => "Appointment"])

@include ('schedules.services')
@include ('schedules.practitioners')
@include ('schedules.times')
@include ('schedules.details')
@include ('schedules.feeds')

@include('portal.list-update')

