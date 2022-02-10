<?php
use App\Form;
use App\User;
$form = Form::firstWhere('name', 'Recurring Appointment');
$inputs = [];
set($inputs, 'patient_id', new_input('text', ['placeholder', 'autofill_model', 'preLabel', 'labelHtmlTag'], ['Patient', 'Patient', 'Patient', 'h2']), 'practitioner_id', new_input('text', ['placeholder', 'autofill_model', 'preLabel', 'labelHtmlTag'], ['Practitioner', 'Practitioner', 'Practitioner', 'h2']), 'services', new_input('list', ['autofill_model', 'listLimit', 'linked_columns', 'preLabel', 'labelHtmlTag', 'after_change_action'], ['Service', 'no limit', ['price', 'duration', 'settings'], 'Services', 'h2', 'Appointment.update_duration']), 'date', new_input('date', ['date_limit', 'preLabel', 'labelHtmlTag'], [1, 'Date', 'h2']), 'time', new_input('time', ['date_limit', 'preLabel', 'labelHtmlTag'], [1, 'Time', 'h2']), 'duration', new_input('number', ['min', 'max', 'start', 'step', 'units', 'preLabel', 'labelHtmlTag', 'after_change_action'], [0, 600, 0, 1, 'minutes', 'Duration', 'h2', 'Answer.hold']));
$RecurOptions = [];
set($RecurOptions, 'header', 'Edit a Recurring Appointment', 'message', 'placeholder', 'buttons', [['text' => 'this appointment only', 'action' => 'Appointment.EditThisOnly'], ['text' => 'all future appointments', 'action' => 'Appointment.EditAllFuture'], ['text' => 'cancel', 'class_list' => 'cancel']]);
$patient = User::IsPatient();
?>

<div id="CreateAppointment" class='central fit-content'>
    <div class='body'>
        <div class="section left">
            <div class="flexbox left">
                @if (!$patient)
                    @include('layouts.forms.display.answer',array_merge($inputs['patient_id'],['name'=>'patient_id']))
                @endif
                @include('layouts.forms.display.answer',array_merge($inputs['practitioner_id'],['name'=>'practitioner_id']))
            </div>
            <div class="flexbox left">
                @include('layouts.forms.display.answer',array_merge($inputs['date'],['name'=>'date']))
                @include('layouts.forms.display.answer',array_merge($inputs['time'],['name'=>'time']))
            </div>
            <div class="flexbox left">
                @include('layouts.forms.display.answer',array_merge($inputs['services'],['name'=>'services']))
                @include('layouts.forms.display.answer',array_merge($inputs['duration'],['name'=>'duration']))
            </div>
        </div>
        @if (!$patient)
            <div class="section">
                <h3 id="RecurToggle" class='toggle_proxy' data-initial_state='hidden' data-attribute='recurrence'
                    data-target_ele='RecurringAppointment'>Recurring Settings</h3>
                @include('layouts.forms.display.form', compact('form'))
            </div>
        @endif
    </div>
</div>

@if (!$patient)
    <div id="RecurringOptions" class="modalForm OptionBox" {!! dataAttrStr($RecurOptions) !!}>
    </div>
@endif
