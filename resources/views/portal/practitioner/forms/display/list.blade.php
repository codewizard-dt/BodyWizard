<?php
Use App\Service;
Use App\Form;
$forms = Form::all();

$uid = session('form_uid')!==null ? session('form_uid') : null;
// dd(session('form_uid'));
?>

<h2 class="paddedSmall">Available Forms</h2>

	<?php 
	$destinations = array('forms-select');
	$btnText = array('select a form');
	if ($uid){
		$destinations = array("forms-settings","form-preview","forms-edit","forms-delete","forms-create");
		$btnText = array("settings","preview","edit","delete","create new form");
	}
	?>
	@include('models.optionsNav',[
		'destinations'=>$destinations,
		'btnText'=>$btnText,
		'model'=>'Form'
	])

<?php
$formCtrl = new Form;
$options = $formCtrl->tableValues;
$options['collection'] = Form::all();
$options['model'] = "Form";
// dd(Form::all()->first());
?>
@include('models.table', $options)

    
<script src="{{ asset('/js/launchpad/forms.js') }}"></script>
<script src="{{ asset('/js/launchpad/form-list.js') }}"></script>
