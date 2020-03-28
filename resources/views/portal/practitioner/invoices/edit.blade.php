<?php 
	use App\Appointment;
	use App\Submission;
	use App\Form;
	use App\Practice;
	if (!isset($apptId)){dd('no appointment selected');}

	$appt = Appointment::find($apptId);
	$patient = $appt->patient();
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
	$paymentMethodOptions = Practice::getFromSession()->available_payment_methods;
?>

<h3 id='ApptInfo' class='pink' data-id='{{$apptId}}' data-invoiceid='{{$invoiceId}}' data-autosave='{{json_encode($invoiceAutoSave)}}'>{{$patient->name}}<br>{{$appt->name}}</h3>
<div id="LineItemsModal" class='prompt'>
	<div class="message">
		<h2 class='purple'>Line Items</h2>
		<div>
			<h3 class="purple paddedSmall topOnly">Currently Loaded</h3>
			<div id="LoadedForms"></div>
		</div>
		<div>
			<h3 class="purple paddedSmall topOnly">Click-To-Load</h3>
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
	<div class="split3366KeyValues" id="CurrentAppt" data-uid="1">
		<div class="label">Patient</div>
		<div class="value" id='PatientName' data-patientid='{{$patient->id}}' data-userid='{{$patient->user_id}}'>{{$patient->name}}</div>
		<div class="label">Total Charge</div>
		<div class="value" id='TotalCharge'></div>
		<div class="label" id='AddPaymentLabel'>Add Payment</div>
		<div class="value" id='PaymentMethod'>
			{{$paymentInfoForm->formDisplay(false,false)}}
		</div>
	</div>
</div>
@include ('portal.user.stripe-modal')
@include ('layouts.forms.autosave-wrap')
<div class="button pink" id="SaveInvoiceBtn">save invoice</div>