<?php 
	use Illuminate\Support\Carbon;
	use App\Appointment;
	use App\Form;
	use App\ChartNote;
	// Log::info($request->where);
	$appointment = Appointment::where('id',$request->where['appointment_id'])->with(['Patient','Practitioner','Services.Forms'])->first();
	if (!$appointment) throw new \Exception('Appointment not found');
	$creating = $instance === null;
	$columns = [
		'patient_id'=>$appointment->patient->id,
		'practitioner_id'=>$appointment->practitioner->id,
	];
	smart_merge($columns,$request->where);
	if (!$instance) {	$instance = ChartNote::create($columns); }
	$complaints = $instance->patient->complaints;
	$complaint_toggle = [
		'color'=>'yellow',
		'target_ele'=>'ComplaintInfo',
		'toggle_ele_class_list'=>'lined filled'
	];
	$complaint_plus = [
		'type' => 'plus_sign',
		'color' => 'yellow',
		'size' => 0.8,
		'css' => ['marginLeft'=>'0.5em'],
		'action' => 'Complaint.selection_modal_open',
		'action_data' => ['action' => 'ChartNote.add_complaints'],
	];
	$form_plus = [
		'type' => 'plus_sign',
		'color' => 'pink',
		'size' => 0.8,
		'css' => ['marginLeft'=>'0.5em'],
		'action' => 'blurTop',
		'action_data' => '#ChartFormList',
	];
	$appointment_forms = $appointment->chart_forms;
	$all_chart_forms = Form::charting()->select('form_uid','form_name')->get()->map(function($form){
		return ['text' => $form->form_name, 'value' => $form->form_uid];
	})->all();
	$form_list_options = [
		'json' => $all_chart_forms,
		'header' => 'Available Charting Forms',
		'model' => 'Form',
		'limit' => 'none',
		'hidden' => true,
		'confirm_options' => [
			'affirm' => 'ChartNote.toggle_form',
			'message_active' => 'This form will be <u>removed</u> from the Chart Note.',
			'message_inactive' => 'This form will be <u>added</u> to the Chart Note.',
		],
		'initial' => $appointment_forms->map(function($form){return $form->getKey();})->toArray(),
	];
	set($columns, 'uid', $instance->getKey(), 'name', $instance->name);
?>

<div id='ChartNote' class='central large' data-attr_list='{{json_encode($columns)}}'>
	<div class="body">
		@include('models.instance-details',['instance' => $instance->patient])
		<div class="header box yellow">
			<h1 class='yellow bold max'>{{$instance->name}}</h1>
			<h2 class='yellow'>{{$appointment->service_list}}</h2>			
		</div>
		<div id="ChartComplaints" class='central full left'>
			<h1 class="toggle_proxy" {!!dataAttrStr($complaint_toggle)!!}>Chief Complaints</h1>
			<div id="ComplaintInfo">
				<h3 class="yellow flexbox left">Add new complaint<div class="Icon" {!!dataAttrStr($complaint_plus)!!}></div></h3>	
	      @include('layouts.forms.display.answer',[
	        'type' => 'list',
	        'name' => 'complaint_selection',
	        'options' => [
	        	'id' => 'complaint_selection',
	          'list' => $complaints->count() ? mapForList($complaints) : ['null%%None listed'],
	          'listLimit' => 'none',
	          'ele_css' => ['marginTop'=>'0'],
	        ], 'settings' => ['required' => true],
	      ])				
			</div>
		</div>
		<div id="ChartForms" class="central full left">
			<div id='ChartFormList' class='List modalForm' data-options="{{json_encode($form_list_options)}}"></div>
			<h2 class="pink flexbox left">Charting Forms<div class="Icon" {!!dataAttrStr($form_plus)!!}></div></h2>	
			@foreach ($appointment_forms as $form)
				@include('layouts.forms.display.form',array_merge(compact('form'),[
					'mode'=>'chart',
					'action'=>null,
				]))
			@endforeach			
		</div>
	</div>
	<div class="options">
		<div class="button cancel">close</div>
	</div>
</div>