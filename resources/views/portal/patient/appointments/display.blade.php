<?php
namespace App;
use Carbon\Carbon;
use App\Form;
use App\Practitioner;
use App\Patient;
use App\Appointment;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Request;

$ctrl = new Form();

if (isset($_POST['OptParams'])) {
    // echo "opt params passed";
} else {
    // echo "no opt params passed";
}

$type = camel(Auth::user()->user_type);
if ($type == 'patient') {
    // $patient = Patient::find(Auth::user()->patient->id);
    // $patient = Auth::user()->patient;
    // $patient = [
    //     'id' => $patient->id,
    //     'isNewPatient' => ($patient->isNewPatient() == 'true'),
    //     // 'name' => getNameFromUid('Patient',$patient->id)
    //     'name' => $patient->name
    // ];
}
?>

<h2 class="purple p-y-xsmall">Your Appointments</h2>
<div id="TimezoneWrap"></div>
<div id="PatientCalendar" class='calendar patient' data-location='Austin, TX'
    data-timezone='{{ date_default_timezone_get() }}'>
    <div class='lds-ring dark'>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
</div>
<div id="Appointment" class="modalForm prompt">
    <div class="message">
        <h1 class='purple'>Appointment Details</h1>
        <div class='split3366KeyValues'>
            <span class="label">Practitioner:</span>
            <span class='value' id="PractitionerName"></span>
            <span class="label">Date + Time:</span>
            <span class='value' id="ApptDateTime"></span>
            <span class="label">Services:</span>
            <span class='value' id="ServiceInfo"></span>
            <span class="label">Required Forms:</span>
            <span class='value' id="FormInfo"></span>
        </div>
    </div>
    <div class="options">
        <div class="button medium pink" id="EditApptBtn">change appointment</div>
        <div class="button medium pink70" id="DeleteApptBtn">cancel appointment</div>
        <div class="button medium cancel">dismiss</div>
    </div>
</div>
