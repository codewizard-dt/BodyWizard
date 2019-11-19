<div id="PasswordCheck" class='prompt' data-next='{{$loadNext}}' data-target='{{$target}}'>
	<div class="message">
		<h3>Enter your password to continue</h3>
		<input id='CheckPassword' type='password'>
	</div>
	<div class="options">
		<div class="button xs-btn pink">submit</div>
	</div>
</div>

<script type="text/javascript" src="{{ asset('/js/security/confirm-pw.js') }}"></script>
