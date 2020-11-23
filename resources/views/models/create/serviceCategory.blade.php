<?php 
// $attrs = ['name','description_calendar','description_admin','service_category_id','duration','price'];
// $initial = collect($attrs)->map(function($attr) use ($instance){
// 	return isset($instance) ? $instance->$attr : null;
// })->toArray();
$inputs = [];
  set($inputs, 'name', new_input('text',
    ['placeholder'], 
    ['Category Name']));
  set($inputs, 'description', new_input('textbox',
    ['placeholder'], 
    ['Description (used for calendar + scheduling']));
  // set($inputs, 'description_admin', new_input('textbox',
  //   ['placeholder'], 
  //   ['Short Description (used for billing + invoicing)']));
  // set($inputs, 'service_category_id', new_input('text',
  //   ['placeholder','linked_to'], 
  //   ['Service Category','service_category']));
  // set($inputs, 'duration', new_input('number',
  //   ['min', 'max', 'initial', 'step', 'units', 'preLabel','labelHtmlTag','labelClass'], 
  //   [0, 60*8, 60, 5, 'minutes', 'Duration:','h4','pink']));
  // set($inputs, 'price', new_input('number',
  //   ['min', 'max', 'initial', 'step', 'units', 'fixed_decimals', 'preLabel','labelHtmlTag','labelClass'], 
  //   [0, 1000, 60, 5, App\Practice::getFromSession()->currency['currency'], 2, 'Price:','h4','pink']));
$initial = collect($inputs)->mapWithKeys(function($input,$attr) use ($instance){
	return [$attr => isset($instance) && $instance != null ? $instance->$attr : null];
})->toArray();
?>
<div class='paddedBig'>
	<h1>Create Service Category</h1>
	<div id="CreateServiceCategory" class='central large left'>
		<div class="section">
			<h2>Basic Information</h2>
			@include('layouts.forms.display.answer',array_merge($inputs['name'],['name'=>'name']))		
			@include('layouts.forms.display.answer',array_merge($inputs['description'],['name'=>'description']))		
		</div>
	</div>
	<div class='button pink submit create' data-model='ServiceCategory'>add service</div>	
	@if(isset($mode) && $mode == 'modal')<div class='button cancel'>cancel</div>@endif
</div>
