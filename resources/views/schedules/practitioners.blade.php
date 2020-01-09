<?php 

$ctrl = new App\Form;

$practitioners = App\Practitioner::where('schedule',"!=",null)->get();
$names = $practitioners->map(function($p){return $p->name;})->toArray();
$names[] = "ID*practitionerRadio";
$nameAndId = [];
foreach ($practitioners as $p){$nameAndId[$p->name] = $p->id;}
?>
<div id="SelectPractitioner" class='progressiveSelection selector toModalHome'>
	<div id="PractitionerSelector" class='step' data-details="{{json_encode($nameAndId)}}">
		<h3 data-default='Practitioner'>Practitioner</h3>
		{{$ctrl->answerDisp('radio',$names)}}
	</div>
</div>
