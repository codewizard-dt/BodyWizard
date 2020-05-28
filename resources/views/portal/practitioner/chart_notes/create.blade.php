<?php 
use App\Appointment;
use App\ChartNote;

$apptId = getUid('Appointment');
if ($apptId){
	$appt = Appointment::find($apptId);
	$appt = (!$appt->chartNote || $appt->chartNote->signed_at == 'not signed') ? $appt : null;
}else{
	$appt = null;
}
if ($appt){
	$btnText = ($appt->chartNote && $appt->chartNote->autosave) ? 'edit note' : 'start note';
}else{
	$btnText = 'start note';
}
$apptsWithoutNotes = Appointment::recentAppointmentsWithoutNotes();
$apptsWithUnsignedNotes = Appointment::recentAppointmentsWithUnsignedNotes();
$allAppts = $apptsWithoutNotes->merge($apptsWithUnsignedNotes)->sortBy('date_time');
?>
<div id='NewChartNote' class="central large">
	<h1 class='purple'>Quick Chart Note Access</h1>
	<div id="ConfirmApptForNote" class='confirmAppt' data-url='/appointment/apptId/edit-chart-note'>
		@if ($appt)
			<div class="split3366KeyValues" id='CurrentAppt' data-uid='{{$appt->id}}'>
				<div class="label">Appointment</div>
				<div class="value">{{$appt->name}}</div>
				<div class="label">Patient</div>
				<div class="value">{{$appt->patient->name}}</div>
			</div>
		@endif
		<div class="button small pink confirmApptBtn">{{$btnText}}</div>
		<div class="button small pink70 selectNewAppt">see other appointments</div>
		<div id="ApptLegend" class='flexbox styled'><div class="appt hasNote">unsigned note</div><div class="appt noNote">no note</div></div>
		<div id="ApptsList" class='flexbox styled'>
			@forelse ($allAppts as $appt)
				<?php $noteIndicator = $appt->chartNote ? 'hasNote' : 'noNote'; ?>
				<div class="appt {{$noteIndicator}}" data-uid='{{$appt->id}}' data-services='{{$appt->service_list}}'>{{$appt->patient->name}}<br>{{$appt->date}}</div>
			@empty
				<div id="NoEligibleApptsBtn">no eligible appointments</div>
			@endforelse
		</div>
		<h2 class='purple' id="ApptSummary"></h2>		
	</div>
</div>
<div id="ChartNote" class='central large'></div>

