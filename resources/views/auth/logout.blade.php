@extends('layouts.portal')

@section('content')
<div class='splash top' id='shelf-2' style='min-height: 83vh;position: relative;'>
	<div id="Centered">
		<div id="LoginForm" style='margin-top:7em;'>
			<h3>Logging Out</h3>
			<div id="logoutForm" style='display:none' action="/logout" method="POST">
				@csrf
			</div>
		</div>
		<div id='LoggingOut' style='height:10em;position: relative;'>
			
		</div>
	</div>
</div>
@endsection

@section('scripts')
<script type="text/javascript" src="{{ asset('/js/logout.js') }}"></script>
@endsection