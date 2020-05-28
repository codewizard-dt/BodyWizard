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
		<h2 class='purple center' style='text-align: center;' data-default='Practitioner'>Practitioner</h2>
		{{$ctrl->answerDisp('radio',$names)}}
	</div>
</div>
