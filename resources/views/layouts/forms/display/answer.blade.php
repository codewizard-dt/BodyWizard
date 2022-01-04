<?php
// attr: type options
if (isset($name) && !isset($options['name'])) {
    $options['name'] = $name;
}
$settings = isset($settings) ? json_encode($settings) : 'null';
$value = isset($initial) && isset($initial[$name]) ? $initial[$name] : 'null';
if (isset($initial) && isset($initial[$name])) {
    $value = $initial[$name];
    $options['initial'] = $value;
} elseif (isset($options['initial'])) {
    $value = $options['initial'];
}
try {
    if (is_array($value)) {
        throw new \Exception("value for '$name' is array -- string required");
    }
} catch (\Exception $e) {
    handleError($e, 'Answer blade');
    $value = '';
}
?>


<div class='answer_proxy' data-type='{{ $type }}' data-initial='{{ $value }}'
    data-options='{{ json_encode($options) }}' data-settings='{{ $settings }}'><input /></div>
