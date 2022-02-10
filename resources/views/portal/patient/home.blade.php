<?php
$patient = Auth::user()->patient;
// $patient = [
//     'id' => $patient->id,
//     'isNewPatient' => $patient->isNewPatient() == 'true',
//     'name' => $patient->name,
// ];

// $items = ['appointments-home'];
?>
<div class='splash vhIndicator' id='needle_tray_1'>
    <h1 class='purple shaded70'>Welcome {{ $patient->name }}</h1>
</div>
@include('layouts.menus.portal-menu',[
'menuName'=>'launchpadMenu',
'items'=>['appointments-calendar','chart-notes-index','invoices-index']
])
