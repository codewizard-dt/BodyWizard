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
	</div>
@endsection

@section('title', 'Portal Launchpad')
@section('description', "Bringing Scientific Rigor to the Practice of Chinese Medicine")
@section('path', "https://bodywizardmedicine.com")