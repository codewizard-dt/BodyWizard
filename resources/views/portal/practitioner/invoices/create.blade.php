<?php 
use App\Appointment;
use App\Invoice;
$apptId = getUid('Appointment');
if ($apptId){
	$appt = Appointment::find($apptId);
	// Log::info($appt->invoice,['create invoice'=>7]);
	$appt = (!$appt->invoice || $appt->invoice->paid_at == 'not paid') ? $appt : null;
}else{
	$appt = null;
}
if ($appt){
	$btnText = ($appt->invoice && $appt->invoice->autosave) ? 'edit invoice' : 'create invoice';
}else{
	$btnText = 'start note';
}
$apptsWithoutInvoices = Appointment::recentAppointmentsWithoutInvoices();
$apptsWithUnpaidInvoices = Appointment::recentAppointmentsWithUnpaidInvoices();
$allAppts = $apptsWithoutInvoices->merge($apptsWithUnpaidInvoices)->sortBy('date_time');

?>
<div id='NewInvoice' class="central large">
	<h1 class='purple'>Quick Invoice Access</h1>
	<div id="ConfirmApptForInvoice">
		@if ($appt)
			<div class="split3366KeyValues" id='CurrentAppt' data-uid='{{$appt->id}}'>
				<div class="label">Appointment</div>
				<div class="value">{{$appt->name}}</div>
				<div class="label">Patient</div>
				<div class="value">{{$appt->patient_list}}</div>
			</div>
		@endif
		<div class="button small pink confirmApptBtn">{{$btnText}}</div>
		<div class="button small pink70 selectNewAppt">select different appointment</div>
		<div id="ApptLegend" class='flexbox styled'><div class="appt hasNote">unsigned note</div><div class="appt noNote">no note</div></div>
		<div id="ApptsWithoutNotes" class='flexbox styled'>
			@forelse ($allAppts as $appt)
				<?php $paidIndicator = $appt->invoice ? 'hasInvoice' : 'noInvoice'; ?>
				<div class="appt {{$paidIndicator}}" data-uid='{{$appt->id}}' data-services='{{$appt->service_list}}'>{{$appt->patient_list}}<br>{{$appt->date}}</div>
			@empty
				<div id="NoEligibleApptsBtn">no eligible appointments</div>
			@endforelse
		</div>
		<h2 class='purple' id="ApptSummary"></h2>		
	</div>
</div>
<div id="Invoice" class='central large'></div>

@include ('portal.list-update')