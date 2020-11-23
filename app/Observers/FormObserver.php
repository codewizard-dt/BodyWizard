<?php

namespace App\Observers;
use App\Form;
use Illuminate\Support\Facades\Log;


class FormObserver
{
	public function creating(Form $form){
		if (!$form->form_id) {
			$form->form_id = Form::nextFormId();
			$form->version_id = 1;
		}
	}
	public function updating(Form $form){
		// foreach (request()->columns as $attr => $value){
		// 	$form->$attr = $value;
		// }
		// Log::info(request()->all());		
		if ($form->has_submissions) reportError("We haven't set up version id with has_submissions yet",'Form observer');
	}
}
