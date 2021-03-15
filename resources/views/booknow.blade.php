@extends("layouts.site")

@push('metadata')
<title>Booking | Body Wizard</title>
<meta name='description' content="Book an appointment with Body Wizard Integrative Medicine">
<meta property='og:url' content="https://bodywizardmedicine.com/booknow">
<meta property='og:title' content="Booking | Body Wizard">
<meta property='og:description' content="Book an appointment with Body Wizard Integrative Medicine">
@endpush

@section('content')
    <div id='acu_chin_1' class='splash'>
    	<div class="wrapper paddedBig topOnly shaded30">
	        <div class='logo'></div>
	        <h1 class='purple'>Online Booking</h1>    		
    	</div>
    </div>
    <!-- <div id='BookingDetails'> -->
        <iframe id='ScheduleWidget' src="https://acusimple.com/access2/1717/#/appointments_only/">
        </iframe>
    <!-- </div> -->
@endsection