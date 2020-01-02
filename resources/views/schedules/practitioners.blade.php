<?php 

$ctrl = new App\Form;
$practitioners = App\Practitioner::all()->map(function($p){
	return getNameFromUid('Practitioner',$p->id);
})->toArray();
$practitioners = App\Practitioner::where('schedule',"!=",null)->get();
$names = $practitioners->map(function($p){
	return getNameFromUid('Practitioner',$p->id);
})->toArray();
$nameAndId = [];
foreach ($practitioners as $p){
	$nameAndId[getNameFromUid('Practitioner',$p->id)] = $p->id;
}
$names[] = "ID*practitionerRadio";
?>
<div id="SelectPractitioner" class='progressiveSelection selector'>
	<div id="PractitionerSelector" class='step' data-details="{{json_encode($nameAndId)}}">
		<h3 data-default='Practitioner'>Practitioner</h3>
		{{$ctrl->answerDisp('radio',$names)}}
<!-- 		<div class="options">
			<div class="button xsmall pink closeBtn" data-target='#practitionerRadio' data-targettype='ul'>confirm</div>		
			<div class="button xsmall yellow">date</div>		
			<div class="button xsmall yellow">services</div>					
		</div> -->
	</div>
</div>
