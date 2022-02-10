<?php
$inputs = [];
set($inputs, 'name', new_input('text', ['placeholder'], ['Category Name']));
set($inputs, 'description', new_input('textbox', ['placeholder'], ['Description (used for forms + reports)']));
$initial = collect($inputs)
    ->mapWithKeys(function ($input, $attr) use ($instance) {
        return [$attr => isset($instance) && $instance != null ? $instance->$attr : null];
    })
    ->toArray();
?>
<div id="CreateComplaintCategory" class='central fit-content left'>
    <div class="section">
        <h2>Basic Information</h2>
        @include('layouts.forms.display.answer',array_merge($inputs['name'],['name'=>'name']))
        @include('layouts.forms.display.answer',array_merge($inputs['description'],['name'=>'description']))
    </div>
</div>
