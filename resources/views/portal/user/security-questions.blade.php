<div id="SecQuestionUpdate" class='confirmPw' data-reason='Security Question Update'>
	<h2 class='purple'>Security Questions</h2>
	<div id='SecurityQuestionProgress'>
		@include('auth.passwords.confirm',[
			'loadNext' => "/security-questions/confirmed",
			'target' => 'parent'
		])
	</div>
</div>
