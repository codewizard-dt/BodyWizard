<?php

namespace App\Observers;
use App\Appointment;
use Illuminate\Support\Facades\Log;


class AppointmentObserver
{
  public function deleting(Appointment $appt){
	}
	public function creating(Appointment $appt){
		try{
			$appt->google_id = uuidNoDash();
			// if ($appt->recurrence && !$appt->recurring_id) $appt->recurring_id = $appt->id;
		}catch(\Exception $e){
			reportError($e,'AppointmentObserver 18');
		}
	}
	public function created(Appointment $appt){
		try{
			if ($appt->recurrence && !$appt->recurring_id) { $appt->recurring_id = $appt->id;	$appt->save(); }
		}catch(\Exception $e){
			reportError($e,'AppointmentObserver 18');
		}
	}
	public function updating(Appointment $appt){
	}
	public function updated(Appointment $appt){
	}

}
