<?php 
$form = App\Form::firstWhere('name','like','Form Settings');
$is_proxy = ($instance->proxy == true);
$is_multi = $instance->multi != null;
$mode = 'display';

$form_display = compact('form','is_proxy','is_multi','mode');

$display_toggle_options = [
  'toggle_ele_class_list' => 'lined filled',
  'target_ele' => toKeyString($instance->name),
  'extra_targets' => ['#HideSettingsLabels'],
  'initial_state' => 'hidden',
];
// logger($instance->proxy);
$a = compact('is_proxy','is_multi','mode');
?>

@include('layouts.forms.display.form', $form_display)
@if (Auth::user()->is_superuser) 
  <h2 id='SuperUserSettings' class="central full pink left flexbox settings_label">Super User Settings</h2>
@endif

@if (!$is_proxy)
  <div id="FormDisplayOptions" class='central full'>
    <h2 class='toggle_proxy' data-options='{{json_encode($display_toggle_options)}}'>Display Options</h2>
    @include('layouts.forms.display.form',[
      'form' => $instance,
      'mode' => 'settings'
    ])    
  </div>
@endif
