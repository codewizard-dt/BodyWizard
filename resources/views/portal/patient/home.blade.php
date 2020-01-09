<?php 
$patient = Auth::user()->patientInfo;
$patientInfo = [
    'id' => $patient->id,
    'isNewPatient' => ($patient->isNewPatient() == 'true'),
    'name' => $patient->name
];
?>
<div class='splash top' id='needle-tray-1'>
    <h1 class='purple white10 paddedSmall'>Portal Home</h1>
</div>
<div id="PatientInfo" data-patient='{{json_encode($patientInfo)}}'></div>
<div id='ScheduleFeedTarget'>
	@include('schedules.feeds')
</div>

@include('layouts.menus.portal-menu',[
    'menuName'=>'launchpadMenu',
    'items'=>['appointments-index','forms+submissions','settings-patient']
])

@include('models.create-modal',['model' => 'Appointment'])
@include('models.edit-modal',['model' => 'Appointment'])
@include ('schedules.services')
@include ('schedules.practitioners')
@include ('schedules.times')
@include ('schedules.details')
