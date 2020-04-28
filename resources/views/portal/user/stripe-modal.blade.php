<?php 
use App\Form;
$options = ['yes','no'];
$name = 'Save Card Information?';
$default = $options[0];
?>
<div id="StripeModal" class="modalForm">
	<h2 id="StripePaymentDetails" class='purple'></h2>
	<form id="payment-form">
		<div id="card-element">
			<!-- Elements will create input elements here -->
		</div>
		<div id="card-errors" role="alert">
			<!-- We'll put the error messages in this element -->
		</div>
		<div class='flexbox'>
			<h3 class='pink paddedSides xsmall'>{{$name}}</h3>
			{{Form::radioBlade($options,$name,$default)}}		
		</div>
		<div id="submit-stripe" class='button xxsmall pink'>charge card</div>
	</form>
</div>
