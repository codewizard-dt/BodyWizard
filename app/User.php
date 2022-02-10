<?php

namespace App;

use Illuminate\Support\Facades\Auth;
use App\Traits\HasSettings;
use App\Traits\TableAccess;
use App\Traits\TrackChanges;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
// use Laravel\Cashier\Billable;

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable;
    use TrackChanges;
    // use Billable;
    use SoftDeletes;
    use TableAccess;
    use HasSettings;

    protected $guarded = [];

    protected $visible = [
        'first_name', 'middle_name', 'last_name', 'preferred_name', 'name', 'legal_name', 'full_name',
    ];
    protected $appends = ['name'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'date_of_birth' => 'date',
        'roles' => 'json',
        'address_mailing' => 'json',
        'address_billing' => 'json',
    ];

    public static function Role()
    {
        return session('usertype');
    }
    public static function IsPatient()
    {
        return session('usertype') === 'patient';
    }
    public static function PatientId()
    {
        return Auth::user()->patient->id;
    }

    public static function admins()
    {
        return User::where('email', 'david@codewizard.app')->get();
    }
    public function navbarInfo()
    {
        $role = User::Role();
        $relationId = snake($role) . '_id';
        $relation = camel($role);
        $info = [
            'id' => $this->id,
            'role' => $role,
            'is_admin' => $this->is_admin,
            'is_superuser' => $this->is_superuser,
            'name' => $this->name,
            $relationId => $this->$relation->id,
        ];
        return $info;
    }

    public function is($type)
    {
        return $this->user_type === $type;
    }
    public function setDateOfBirthAttribute($value)
    {
        $this->attributes['date_of_birth'] = Carbon::parse($value);
    }
    public function getDateOfBirthAttribute($value)
    {
        return Carbon::parse($value)->format('n/j/Y');
    }
    public function getDefaultRoleAttribute()
    {
        $roles = $this->roles['list'];
        $default = $this->roles['default'];
        if (count($roles) == 1) {
            return $roles[0];
        } else if ($default) {
            return $default;
        } else {
            return false;
        }

    }

    public function getNameAttribute()
    {
        return $this->preferred_or_first . " " . $this->last_name;
    }
    public function getPreferredOrFirstAttribute()
    {
        return $this->preferred_name ? $this->preferred_name : $this->first_name;
    }
    public function getFullNameAttribute()
    {
        $name = $this->preferred_or_first;
        if ($this->middle_name) {
            $name .= ' ' . $this->middle_name;
        }

        $name .= ' ' . $this->last_name;
        return $name;
    }
    public function getLegalNameAttribute()
    {
        $name = [$this->first_name];
        if ($this->middle_name) {
            array_push($name, $this->middle_name);
        }
        array_push($name, $this->last_name);
        return implode(' ', $name);
        // return $this->first_name . " " . $this->middle_name . " " . $this->last_name;
    }
    public function getIsSuperuserAttribute()
    {
        $supers = ['david@codewizard.app'];
        return in_array($this->email, $supers);
    }
    public function getUserTypeAttribute()
    {
        return session('usertype');
    }
    public function getIsAdminAttribute()
    {
        return true;
    }
    public function details()
    {
        $type = camel(request('usertype', $this->default_role));
        return $this->$type->details();
    }
    public function patient()
    {
        return $this->hasOne('App\Patient');
    }
    public function practitioner()
    {
        return $this->hasOne('App\Practitioner');
    }
    public function staffMember()
    {
        return $this->hasOne('App\StaffMember');
    }
}
