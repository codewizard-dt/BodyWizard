<?php 
// $attrs = ['name','description_calendar','description_admin','service_category_id','duration','price'];
// $initial = collect($attrs)->map(function($attr) use ($instance){
// 	return isset($instance) ? $instance->$attr : null;
// })->toArray();
$inputs = [];
  set($inputs, 'name', new_input('text',
    ['placeholder'], 
    ['Service Name']));
  set($inputs, 'description_calendar', new_input('textbox',
    ['placeholder'], 
    ['Calendar Description (used for scheduling + website)']));
  set($inputs, 'description_admin', new_input('textbox',
    ['placeholder'], 
    ['Short Description (used for billing + invoicing)']));
  set($inputs, 'service_category_id', new_input('text',
    ['placeholder','autofill_model'], 
    ['Service Category','service_category']));
  set($inputs, 'duration', new_input('number',
    ['min', 'max', 'start', 'step', 'units', 'preLabel','labelHtmlTag','labelClass'], 
    [0, 60*8, 60, 5, 'minutes', 'Duration:','h4','pink']));
  set($inputs, 'price', new_input('number',
    ['min', 'max', 'start', 'step', 'units', 'fixed_decimals', 'preLabel','labelHtmlTag','labelClass'], 
    [0, 1000, 60, 5, App\Practice::getFromSession()->currency['currency'], 2, 'Price:','h4','pink']));
$initial = collect($inputs)->mapWithKeys(function($input,$attr) use ($instance){
	return [$attr => isset($instance) && $instance != null ? $instance->$attr : null];
})->toArray();
?>
<div class='p-y-150'>
	<h1>Create Service</h1>
	<div id="CreateService" class='central large left'>
		<div class="section">
			<h2>Basic Information</h2>
			@include('layouts.forms.display.answer',array_merge($inputs['name'],['name'=>'name']))		
			@include('layouts.forms.display.answer',array_merge($inputs['service_category_id'],['name'=>'service_category_id']))		
			@include('layouts.forms.display.answer',array_merge($inputs['description_calendar'],['name'=>'description_calendar']))		
			@include('layouts.forms.display.answer',array_merge($inputs['description_admin'],['name'=>'description_admin']))		
			<div class="flexbox leftSided">
				@include('layouts.forms.display.answer',array_merge($inputs['price'],['name'=>'price']))					
				@include('layouts.forms.display.answer',array_merge($inputs['duration'],['name'=>'duration']))					
			</div>
		</div>
	</div>
	<div class='button pink submit create' data-model='Service'>add service</div>	
	@if(isset($mode) && $mode == 'modal')<div class='button cancel'>cancel</div>@endif
</div>
