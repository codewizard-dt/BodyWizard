<?php
use Illuminate\Support\Carbon;
use App\Appointment;
use App\Form;
use App\ChartNote;
use App\IcdCode;
use App\CptCode;

$appt_id = get(request('where', []), 'appointment_id', null);
$appointment = null;
if ($instance) {
    $appointment = $instance->appointment;
} elseif ($appt_id) {
    $appointment = Appointment::where('id', $appt_id)
        ->with(['Patient', 'Practitioner', 'Services.Forms'])
        ->first();
}

if (!$appointment) {
    echo "<div class='button pink'>Select an appointment to continue</div>";
    exit();
    // return;
    // throw new \Exception('Please select an appointment first.');
}

$creating = $instance === null;
$columns = [
    'patient_id' => $appointment->patient->id,
    'practitioner_id' => $appointment->practitioner->id,
];

smart_merge($columns, request('where', []));
if (!$instance) {
    $instance = ChartNote::create($columns);
}

$complaints = $instance->patient->complaints;
$complaint_toggle = [
    'color' => 'yellow',
    'target_ele' => 'ComplaintInfo',
    'toggle_ele_class_list' => 'lined filled',
];
$complaint_plus = [
    'type' => 'plus_sign',
    'color' => 'yellow',
    'size' => 0.8,
    'css' => ['marginLeft' => '0.5em'],
    'action' => 'Complaint.selection_modal_open',
    'action_data' => ['action' => 'ChartNote.add_complaints'],
];
$form_plus = [
    'type' => 'plus_sign',
    'color' => 'pink',
    'size' => 0.8,
    'css' => ['marginLeft' => '0.5em'],
    'action' => 'blurTop',
    'action_data' => '#ChartFormList',
];
$default_forms = $appointment->chart_forms;
$submissions = $instance
    ->submissions()
    ->select('id', 'form_id', 'autosave', 'responses')
    ->get();
while ($submissions->count()) {
    $submission = $submissions->pop();
    $form = $default_forms->firstWhere('id', $submission->form_id);
    if (!$form) {
        $default_forms->push($submission->form);
        $form = $submission->form;
    }
    $form->responses = $submission->responses;
    $form->autosave = $submission->autosave;
    $form->submission_id = $submission->id;
}

$all_chart_forms = Form::charting()
    ->select('id', 'name')
    ->get()
    ->map(function ($form) {
        return ['text' => $form->name, 'value' => $form->id];
    })
    ->all();
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
    'initial' => $default_forms->pluck('form_id')->toArray(),
];
set($columns, 'uid', $instance->getKey(), 'name', $instance->name, 'signed_at', $instance->signed_at);
// logger($columns);
?>

<div id="ModelId" data-id="{{ $instance->id }}"
    class='central max w-max-xlarge {{ $instance->signed_at ? 'signed' : 'unsigned' }}'>

    <h2 class='yellow subtitle'>{{ $appointment->service_list }}</h2>

    <div id="ChartComplaints" class='central full left module'>
        <h2 class="header yellow flexbox left lined">Today's Chief Complaints<div class="Icon"
                {!! dataAttrStr($complaint_plus) !!}>
            </div>
        </h2>
        @include('layouts.forms.display.answer',[
        'type' => 'list',
        'name' => 'complaints',
        'options' => [
        'id' => 'complaints',
        'preLabel'=>'Previous complaints:',
        'preLabelClass'=>'yellow left basis-100',
        'labelHtmlTag'=>'h4',
        'list' => $complaints->mapForListComponent(),
        'listLimit' => 'none',
        'initial'=> $instance->complaints->modelKeys(),
        'ele_css' => ['marginTop'=>'0'],
        ], 'settings' => ['required' => true],
        ])
    </div>
    <div id="IcdCodes" class='central full left module'>
        @include('layouts.forms.display.answer',[
        'type' => 'text',
        'name' => 'icd_codes',
        'options' => [
        'id' => 'icd_codes',
        'autofill_model'=>'IcdCode',
        'preLabel'=>'ICD11 Codes:',
        'preLabelClass'=>'yellow left basis-100',
        'labelHtmlTag'=>'h4',
        // 'list' => $complaints->mapForListComponent(),
        'listLimit' => 'none',
        'initial'=> $instance->icdCodes->modelKeys(),
        'ele_css' => ['marginTop'=>'0'],
        ], 'settings' => ['required' => true],
        ])
    </div>
    <div id="CptCodes" class='central full left module'>
        @include('layouts.forms.display.answer',[
        'type' => 'text',
        'name' => 'cpt_codes',
        'options' => [
        'id' => 'cpt_codes',
        'autofill_model'=>'CptCode',
        'preLabel'=>'CPT Codes:',
        'preLabelClass'=>'yellow left basis-100',
        'labelHtmlTag'=>'h4',
        // 'list' => $complaints->mapForListComponent(),
        'listLimit' => 'none',
        'initial'=> $instance->cptCodes->modelKeys(),
        'ele_css' => ['marginTop'=>'0'],
        ], 'settings' => ['required' => true],
        ])
    </div>
    <div id="ChartForms" class="central full left module">
        <div id='ChartFormList' class='List modalForm' data-options="{{ json_encode($form_list_options) }}"></div>
        <h2 class="header pink flexbox left lined">Charting Forms<div class="Icon" {!! dataAttrStr($form_plus) !!}>
            </div>
        </h2>
        @forelse ($default_forms as $form)
            @include('layouts.forms.display.form',array_merge(compact('form'),[
            'mode'=> 'chart',
            'action'=> null,
            ]))
        @empty
            <h4 class="pink">No default forms for {{ $appointment->service_list }}</h4>
        @endforelse
    </div>
    <div id="Signature">
        @include('layouts.forms.display.answer',[
        'type'=>'signature',

        'options'=>['initial'=> json_encode($instance->signature)],
        'name'=>'signature',
        'settings'=>['required'=>true]
        ])
    </div>
</div>
