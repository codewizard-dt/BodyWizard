<?php
try {
    $attrs = $instance->basic_info();
} catch (\Exception $e) {
    $error = handleError($e);
    return compact('error');
}
?>
<div class='ModelDetails' data-type='{{ class_basename($instance) }}' data-attr_list='{!! json_encode($attrs) !!}'></div>
