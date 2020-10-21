
<div class='paddedBig'>
	<h1>New Practitioner</h1>
	<div id='CreatePractitioner' class='central large left'>
		@include('models.create.user')
	</div>
	<div class='button pink submit create' data-model='Practitioner'>add practitioner</div>	
	@if(isset($mode) && $mode == 'modal')<div class='button cancel'>cancel</div>@endif
</div>
