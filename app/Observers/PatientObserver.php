<?php

namespace App\Observers;

use App\User;
use App\Patient;

class PatientObserver
{
    public function deleting(Patient $patient)
    {
        $roles = [];
        $current = $patient->roles;
        foreach ($current['list'] as $role) {if ($role != 'patient') {
            array_push($roles, $role);
        }
        }
        if (empty($roles)) {
            $patient->user->delete();
        } else {
            $current['list'] = $roles;
            $patient->user->roles = $current;
            $patient->user->save();
        }
    }
}
