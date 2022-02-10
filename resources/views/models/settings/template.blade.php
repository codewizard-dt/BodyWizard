<?php
$mode = (isset($mode) ? $mode : $request->has('mode')) ? $request->mode : null;
$isProxy = $instance->proxy == true;
$is_multi = $instance->multi != null;
$close = $isProxy ? 'cancel' : 'close';
$blade = $model == 'Form' ? 'form' : 'generic';
$name = $isProxy ? $model : $instance->name;
?>

<div id='Settings' class='box' data-plural='{{ plural($model) }}' data-is_proxy='{{ $isProxy ? 'true' : 'false' }}'
    data-is_multi="{{ json_encode($instance->multi) }}" data-initial='{{ json_encode($instance->settings) }}'>
    @if (!$isProxy)
        <h1 class='settings_header'>{{ $instance->name }}</h1>
    @endif
    @includeIf('models.settings.'.$blade, compact('instance','request','mode'))
    @if ($is_multi)
        <div class="button submit">APPLY TO ALL</div>
    @endif
</div>
