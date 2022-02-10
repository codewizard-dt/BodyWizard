<?php

namespace App\Observers;

use App\User;
use App\StaffMember;

class StaffMemberObserver
{
    public function deleting(StaffMember $staffMember)
    {
        $roles = [];
        $current = $staffMember->roles;
        foreach ($current['list'] as $role) {if ($role != 'staff member') {
            array_push($roles, $role);
        }
        }
        if (empty($roles)) {
            $staffMember->user->delete();
        } else {
            $current['list'] = $roles;
            $staffMember->user->roles = $current;
            $staffMember->user->save();
        }
    }
}
