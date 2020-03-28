<?php 
use App\Form;
use App\Practice;
$practice = isset($practice) ? $practice : Practice::getFromSession();
$currencyInfo = $practice->currency;
$currency = $currencyInfo['currency'];
$s = $currencyInfo['symbol'];

$ctrl = new Form;
$priceOptions = [
	'min' => 0,
	'max' => 99999,
	'initial' => $price,
	'step' => 1,
	'units' => $currency
];
$discountOptions = [
	'0%','-5%','-10%','-15%','-20%','-30%','-40%','-50%','-75%','-100%',
	'-'.$s.'5','-'.$s.'10','-'.$s.'15','-'.$s.'20','-'.$s.'30','-'.$s.'40','-'.$s.'50','-'.$s.'75','-'.$s.'100','ID*Discount'
];
$taxOptions = [
	'0%','8.25%','ID*Tax'
];
$classes = isset($classes) ? implode(" ",$classes) : "";
?>
<div class="lineItem flexbox {{$classes}}" data-type="{{$type}}" @foreach ($data_attributes as $data) data-{{$data[0]}}='{{$data[1]}}'@endforeach>
	<div class="description editable">
		<div class="pair">
			<input type="text" class="input"><span class="value">{{$description}}</span>
		</div>
		<div class="toggle edit">(edit description)</div>
		<div class="toggle save">(save)</div>
		<div class="toggle cancel">(cancel)</div>
	</div>
	<div class="price" data-value="{{$price}}" data-symbol="{{$s}}">
		{{$s.$price}}
	</div>
	<div class="discount editable">
		<div class="pair">
			{{$ctrl->dropdown($discountOptions)}}<span class="value">0%</span>
		</div>
		<div class="toggle edit">(edit)</div>
		<div class="toggle save">(save)</div>
		<div class="toggle cancel">(cancel)</div>
	</div>
	<div class="tax editable">
		<div class="pair">
			{{$ctrl->dropdown($taxOptions)}}<span class="value">0%</span>
		</div>
		<div class="toggle edit">(edit)</div>
		<div class="toggle save">(save)</div>
		<div class="toggle cancel">(cancel)</div>
	</div>	
	<div class="lineTotal">total</div>
</div>