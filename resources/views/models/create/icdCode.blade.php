<?php 
$json = ['Code:' => 'none selected', 'Description:' => 'none selected'];
$key_css = ['fontWeight'=>400];
$options = compact('json','key_css');
?>

<h2 id='IcdCodeInfo' class='KeyValueBox purple' data-options="{{json_encode($options)}}"></h2>
<h4 class='black'>Start typing to search ICD Database:</h4><input type="text" class="ctw-input" autocomplete="off" data-ctw-ino="1" > 
<div class="ctw-window" data-ctw-ino="1"></div>  
<div class='button pink submit small create' data-model='IcdCode'>save code</div>	
