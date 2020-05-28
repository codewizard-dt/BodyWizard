<?php

namespace App\Observers;
use App\Appointment;
use Illuminate\Support\Facades\Log;


class AppointmentObserver
{
  public function deleting(Appointment $appt){
  	try{
			$appt->gcal('delete');
			$appt->fcal('delete');
			$note = $appt->chartNote;
			if ($note) $note->delete();
			unsetUid('Appointment');
  	}catch(\Exception $e){
  		reportError($e,'AppointmentObserver');
  	}
	}
	public function creating(Appointment $appt){
		try{
			$appt->uuid = uuidNoDash();
			$appt->status = Appointment::defaultStatus();
		}catch(\Exception $e){
			reportError($e,'AppointmentObserver 18');
		}
	}
	public function created(Appointment $appt){
		Log::info("CREATED event");
    foreach(request()->sync as $relationship => $ids){
       $appt->$relationship()->sync($ids);
    }
		$appt->gcal('create');
		$appt->fcal('create');
		// SEND NEW APPOINTMENT EMAIL / NOTIFICATIONS
	}
	public function updating(Appointment $appt){
    Log::info("UPDATING event");
	}
	public function updated(Appointment $appt){
    Log::info("UPDATED event");
    Log::info(request()->toArray());
    foreach(request()->sync as $relationship => $ids){
     	$appt->$relationship()->sync($ids);
    }
		$appt->gcal('update');
		$appt->fcal('update');
  	$appt->saveDirtyChanges(request()->changes);
    // event(new AppointmentSaved($appt, $changes, $practice->practice_id, Auth::user()->user_type));
	}

}
