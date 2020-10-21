<?php

namespace App\Observers;
use App\User;
use App\Patient;
use App\Practitioner;
use App\StaffMember;
use Illuminate\Support\Facades\Log;
use App\Practice;


class UserObserver
{
  public function created(User $user){
  	if (in_array('patient',$user->roles['list'])) {
  		$sub = Patient::create(['user_id'=>$user->id]);
  		setUid('Patient', $sub->id);
  	}
  	if (in_array('practitioner',$user->roles['list'])) {
  		$sub = Practitioner::create(['user_id'=>$user->id]);
  		setUid('Practitioner', $sub->id);
  	}
  	if (in_array('staff member',$user->roles['list'])) {
  		$sub = StaffMember::create(['user_id'=>$user->id]);
  		setUid('StaffMember', $sub->id);
  	}
    $practice = Practice::getFromSession();
    $options = [
      'name' => $user->name,
      'metadata' => ['practice_id' => $practice->practice_id]
    ];
    $stripeCustomer = $user->createAsStripeCustomer($options);

  }
  public function creating(User $user){
  	// Log::info($user);
  	if (!$user->password && request()->password == null) $user->password = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
  	if (!$user->roles && request()->roles == null) $user->roles = ['list'=>['patient'],'default'=>null];
  }
}