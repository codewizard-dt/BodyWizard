<?php 
	use App\Appointment;
	use App\Submission;
	use App\Form;
	use App\Practice;
	if (!isset($apptId)){dd('no appointment selected');}

	$appt = Appointment::find($apptId);
	$patient = $appt->patient;
	$practice = Practice::getFromSession();
	setUid('Patient',$patient->id);
	$services = $appt->services;
	if ($appt->invoice){
		$invoiceAutoSave = $appt->invoice->autosave;
		$invoiceId = $appt->invoice->id;
	}else{
		$invoiceAutoSave = "";
		$invoiceId = "new";
	}
	$paymentInfoForm = Form::find(42);
	$paymentMethodOptions = $practice->available_payment_methods;
	$invoice = $appt->invoice;
	$data = [
		'appointment_id' => $apptId,
		'uid' => $invoice ? $invoice->id : 'null',
		'autosave' => $invoice ? json_encode($invoice->autosave) : 'null',
		'invoiced_to_user_id' => $patient->user->id,
		'patient_id' => $patient->id,
		'notes' => $invoice ? $invoice->notes : 'null',
	];
	// $dataAttrStr = dataAttrStr(collect($data));
?>

<h3 id='ApptInfo' class='pink' {!!$dataAttrStr!!}>{{$patient->name}}<br>{{$appt->name}}</h3>
<div id="LineItemsModal" class='prompt'>
	<div class="message">
		<h2 class='purple'>Line Items</h2>
		<div>
			<h3 class="purple p-y-50 topOnly">Currently Loaded</h3>
			<div id="LoadedForms"></div>
		</div>
		<div>
			<h3 class="purple p-y-50 topOnly">Click-To-Load</h3>
			<div id="AvailableLineItems" class='flexbox styled'>
			</div>
		</div>		
	</div>
	<div class="options">
		<div class="button xsmall cancel">close</div>
	</div>
</div>
<div id="Services">
	<h3 class="invoiceHeader marginXBig topOnly purple">Services</h3>
	<div class="dottedSideBorders">
		@include ('layouts.invoices.line-item-header',['type'=>'service'])
		@foreach ($services as $service)
			@include('layouts.invoices.service-line-item',['service'=>$service])
		@endforeach		
	</div>
</div>
<div id="Products">
	<h3 class="invoiceHeader marginXBig topOnly purple">Prescriptions + Products</h3>
	@include ('layouts.invoices.line-item-header',['type'=>'product'])
	<div class="button xsmall yellow70" id="LineItemsModalBtn">add/remove items</div>
</div>
@include('layouts.forms.additional-notes')
<div id="PaymentDetails" data-currency='{{json_encode($practice->currency)}}'>
	<h3 class="invoiceHeader marginXBig topOnly purple">Payment Details</h3>
	<div class="split3366KeyValues" id="CurrentAppt">
		<div class="label">Patient</div>
		<div class="value" id='PatientName'>{{$patient->name}}</div>
		<div class="label">Total Charge</div>
		<div class="value" id='TotalCharge'></div>
		<div class="label">Payments</div>
		<div class="value" id="PartialPayments">
			<div id="Remainder" class="pink">none</div>
		</div>

		<div class="label" id='AddPaymentLabel'>Add Payment</div>
		<div class="value" id='PaymentMethod' data-paymentmethods='{{json_encode($paymentMethodOptions)}}'>
			{{$paymentInfoForm->formDisplay(false,false)}}
		</div>
	</div>
</div>
@include ('portal.user.stripe-modal')
<div class="button pink" id="SaveInvoiceBtn">settle invoice</div>