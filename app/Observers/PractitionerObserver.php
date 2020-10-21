<?php

namespace App\Observers;
use App\User;
use App\Practitioner;


class PractitionerObserver
{
	public function deleting (Practitioner $practitioner) {
			$roles = []; $current = $practitioner->roles;
			foreach($current['list'] as $role) {if ($role != 'practitioner') array_push($roles, $role);}
			if (empty($roles)) {
				$practitioner->user->delete();
			} else {
				$current['list'] = $roles;
				$practitioner->user->roles = $current;
				$practitioner->user->save();
			}
	}
}
