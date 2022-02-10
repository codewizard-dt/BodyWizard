<?php
namespace App\Traits;

use App\User;
// use App\Patient;
use Illuminate\Database\Eloquent\Builder;

trait IsUser
{
    public function initializeIsUser()
    {
        $user_attrs = ["first_name", "middle_name", "last_name", "preferred_name", "name", 'phone', 'email', 'username', 'date_of_birth', 'address_mailing', 'address_billing', 'roles'];
        $this->append($user_attrs);
        $this->makeVisible($user_attrs);
    }
    public static function bootIsUser()
    {
        $table = static::query()->getQuery()->from;
        static::addGlobalScope('named', function (Builder $builder) use ($table) {
            $builder->with('user')->join('users', $table . '.id', '=', 'users.id');
        });
    }
    public function user()
    {return $this->belongsTo('App\User', 'user_id');}

    // public function __get($key)
    // {
    //     if ($this->getAttribute($key)) {
    //         return $this->getAttribute($key);
    //     } else if ($this->user->getAttribute($key)) {
    //         return $this->user->getAttribute($key);
    //     } else {
    //         return null;
    //     }
    // }

    public function getFirstNameAttribute()
    {return $this->user->first_name;}

    // public function getUserIdAttribute($value)
    // {return $this->user->id;}

    public function getMiddleNameAttribute()
    {return $this->user->middle_name;}

    public function getLastNameAttribute()
    {return $this->user->last_name;}

    public function getLegalNameAttribute()
    {return $this->user->legal_name;}

    public function getPreferredNameAttribute()
    {return $this->user->preferred_name;}

    public function getNameAttribute()
    {return $this->user->name;}

    public function getPhoneAttribute()
    {return $this->user->phone;}

    public function getEmailAttribute()
    {return $this->user->email;}

    public function getUsernameAttribute()
    {return $this->user->username;}

    public function getDateOfBirthAttribute()
    {return $this->user->date_of_birth;}

    public function getRolesAttribute()
    {return $this->user->roles;}

    public function getAddressMailingAttribute()
    {return $this->user->address_mailing;}

    public function getAddressBillingAttribute()
    {return $this->user->address_billing;}

    public function getUserSettingsAttribute()
    {return $this->user->settings;}

}
