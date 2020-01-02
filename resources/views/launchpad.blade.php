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
	?>

	@if (Auth::user()->require_new_pw)
		@include('portal.user.password')
	@elseif (Auth::user()->security_questions == null && !Auth::user()->is_admin)
		@include('portal.user.security-questions')
	@else
		@include("portal.$usertype.home")
	@endif

@endsection
