<?php 

$ctrl = new App\Form;
$practitioners = App\Practitioner::all()->map(function($p){
	return getNameFromUid('Practitioner',$p->id);
})->toArray();
$practitioners = App\Practitioner::where('schedule',"!=",null)->get();
$names = $practitioners->map(function($p){
	return getNameFromUid('Practitioner',$p->id);
})->toArray();
// $nameAndId = $practitioners->map(function($p){
// 	return [getNameFromUid('Practitioner',$p->id) => $p->id];
// })->toArray();
$nameAndId = [];
foreach ($practitioners as $p){
	$nameAndId[getNameFromUid('Practitioner',$p->id)] = $p->id;
}
$names[] = "ID*practitionerRadio";
?>
<div id="SelectPractitioner" class='progressiveSelection'>
	<div class="progressBar">
		<div class='back'></div>
	</div>
	<div id="SelectOrRandom" class='open'>
		<div class="button xsmall pink openBtn" data-type='practitioner'>select practitioner</div>
		<div class="button xsmall pink70 closeBtn" data-type='practitioner'>any practitioner</div>
	</div>
	<div id="PractitionerSelector" class='step' data-order='1' data-details="{{json_encode($nameAndId)}}">
		<h3 data-default='Practitioner'>Practitioner</h3>
		{{$ctrl->answerDisp('radio',$names)}}
		<br><div class="button xsmall pink disabled closeBtn" data-target='#practitionerRadio' data-targettype='ul'>confirm</div>		
	</div>
</div>
