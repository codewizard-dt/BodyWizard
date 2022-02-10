<?php
if (isset($form)) {
    $formUID = $form->getkey();
    $formId = $form->form_id;
    $data = json_encode($form->full_json);
    $sections = json_encode($form->sections);
    $settings = $form->settings;
    // $name = $form->form_name;
} else {
    echo '<h4>Form not specified</h4>';
    // return;
    throw new \Exception('Form not specified: ' . request()->path() . ', ' . json_encode(request()->all()));
}

$mode = isset($mode) ? $mode : request('mode', 'use');
$action = isset($action) ? $action : request('action', 'FormEle.submit');
$is_proxy = isset($is_proxy) ? $is_proxy : request('is_proxy', 'false');
$is_multi = isset($is_multi) ? $is_multi : request('is_multi', 'false');

?>
<div class='form_proxy' data-json='{{ $form->toJson() }}' data-is_proxy='{{ $is_proxy }}'
    data-is_multi='{{ $is_multi }}' data-settings='{{ json_encode($settings) }}' data-mode='{{ $mode }}'
    data-action='{{ $action }}'></div>
