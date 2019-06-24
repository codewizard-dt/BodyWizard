<?php
Use App\Service;
Use App\Form;
$services = Service::all();
$uid = session('service_id')!==null ? session('service_id') : null;
// dd(session('form_uid'));
?>

<h2 class="paddedSmall">Available Services</h2>

	<?php 
	$destinations = array('services-select');
	$btnText = array('select a service');
	if ($uid){
		$destinations = array("services-settings","service-preview","services-edit","services-delete","services-create");
		$btnText = array("settings","preview","edit","delete","create new service");
	}
	?>
	@include('models.optionsNav',[
		'destinations'=>$destinations,
		'btnText'=>$btnText,
		'model'=>'service'
	])
<?php
$serviceCtrl = new Service;
$options = $serviceCtrl->tableValues;
$options['collection'] = Service::all();
// dd(Form::all()->first());
?>
@include('models.table', $options)

<div id="ModalHome">
	<div id="FormTableModal">
	</div>
</div>

    
<script src="{{ asset('/js/launchpad/forms.js') }}"></script>
<script src="{{ asset('/js/launchpad/form-list.js') }}"></script>
