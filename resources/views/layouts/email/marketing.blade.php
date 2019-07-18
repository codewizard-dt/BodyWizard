@extends(layouts.email.basic)

@section('disclaimer')
	<div id="disclaimer">
		This message was sent by or on behalf of Body Wizard Integrative Medicine.<br>This email was sent to: {{ $recipient->email }}<br>To change your communication preferences, including unsubscribing from further marketing or commercial communications from Body Wizard, please %UNSUBSCRIBE%.	
	</div>
@endsection