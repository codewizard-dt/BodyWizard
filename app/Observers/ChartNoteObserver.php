<?php

namespace App\Observers;

use App\ChartNote;
use Illuminate\Support\Facades\Log;

class ChartNoteObserver
{
	public function saved(ChartNote $note){
		if ($note->appointment) $note->appointment->saveToFullCal();
		setUid('Appointment',$note->appointment->id);
	}
	public function deleting(ChartNote $note){
		unsetUid('ChartNote');
	}
}
