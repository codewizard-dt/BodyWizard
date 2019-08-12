@extends("layouts.portal")

@push('metadata')
<title>Body Wizard Patient Portal</title>
<meta name='description' content="Bringing Scientific Rigor to the Practice of Chinese Medicine">
<meta property='og:url' content="https://bodywizardmedicine.com/portal">
<meta property='og:title' content="Body Wizard Patient Portal">
<meta property='og:description' content="Bringing Scientific Rigor to the Practice of Chinese Medicine">
@endpush

@section('content')
	<?php 
	$usertype = Auth::user()->user_type; 
	$tabs = json_encode(session('CurrentTabs'));
	$uids = json_encode(session('uidList'));
	?>
	<div id="tabList"> {{ $tabs }} </div>
	<div id="uidList"> {{ $uids }} </div>
	@include("portal.$usertype.home")
	<div id='ModalHome'>
		<div id="Error" class='prompt'>
			<div class='message'></div>
			<div class='options'>
				<div class='button small submit pink'>send us an error report</div>
				<div class='button small cancel'>dismiss</div>
			</div>
		</div>
		<div id="Warn" class='prompt'>
			<div class='message'></div>
			<div class='options'>
				<div class='button large submit pink confirmY'>YES</div>
				<div class='button large cancel confirmN'>cancel</div>
			</div>
		</div>
		<div id="Confirm" class='prompt'>
			<div class='message'></div>
			<div class='options'>
				<div class='button small submit pink confirmY'>confirm</div>
				<div class='button small cancel confirmN'>dismiss</div>
			</div>
		</div>
		<div id="Refresh" class='prompt'>
			<div class="message">
				<h2>Session Timeout</h2>
				<div>It's been too long! Let's log in again.</div>
			</div>
			<div class="options">
				<div class="button pink70 medium">automatically refreshing</div>
			</div>
		</div>
	</div>
@endsection
