<?php 
$inputs = [];
  set($inputs, 'name', new_input('text',
    ['placeholder'], 
    ['Complaint Name']));
  set($inputs, 'description', new_input('textbox',
    ['placeholder'], 
    ['Description (used for forms + charting)']));
  set($inputs, 'complaint_category_id', new_input('text',
    ['placeholder','autofill_model'], 
    ['Complaint Category','ComplaintCategory']));
  set($inputs, 'icd_codes', new_input('textbox',
    ['placeholder','autofill_model','list_separator','listLimit','input_css'], 
    ['Applicable ICD Codes (used as suggestions when charting)','IcdCode','line break','none',['height'=>'10em']]));
$initial = collect($inputs)->mapWithKeys(function($input,$attr) use ($instance){
  return [$attr => getInitial($instance, $attr)];
})->toArray();
?>
	<h1>Create Chief Complaint</h1>
	<div id="CreateComplaint" class='central large left'>
		<div class="section">
			<h2>Basic Information</h2>
			@include('layouts.forms.display.answer',array_merge($inputs['name'],['name'=>'name']))		
			@include('layouts.forms.display.answer',array_merge($inputs['complaint_category_id'],['name'=>'complaint_category_id']))		
      @include('layouts.forms.display.answer',array_merge($inputs['description'],['name'=>'description']))    
      @include('layouts.forms.display.answer',array_merge($inputs['icd_codes'],['name'=>'icd_codes']))    

		</div>
	</div>
	<div class='button pink submit create' data-model='Complaint'>add service</div>	
	@if(isset($mode) && $mode == 'modal')<div class='button cancel'>cancel</div>@endif
