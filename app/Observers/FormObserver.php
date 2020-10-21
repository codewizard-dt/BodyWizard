<?php

namespace App\Observers;
use App\Form;
use Illuminate\Support\Facades\Log;


class FormObserver
{
	public function creating(Form $form){
		foreach (request()->columns as $attr => $value){
			$form->$attr = $value;
		}
		if (!$form->form_id) {
			$form->form_id = Form::nextFormId();
			$form->version_id = 1;
		}
		if (!$form->full_json) $form->full_json = ['empty'=>true];
	}
	public function updating(Form $form){
		foreach (request()->columns as $attr => $value){
			$form->$attr = $value;
		}
		Log::info(request()->all());		
		if ($form->has_submissions) $form->version_id = $form->nextVersionId();
	}
}
