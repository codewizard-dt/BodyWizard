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
		if ($form->has_submissions) reportError("We haven't set up version id with has_submissions yet",'Form observer');
	}
	// public function saved(Form $form){
	// 	if (contains($form->form_name,'Settings')) 
	// }
}
