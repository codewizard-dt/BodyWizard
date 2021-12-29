<?php
namespace App\Traits;

use App\User;
// use App\Patient;
use Illuminate\Database\Eloquent\Builder;

trait IsUser
{
    public function initializeIsUser()
    {
        $user_attrs = ["first_name", "middle_name", "last_name", "preferred_name", "name", 'phone', 'email', 'username', 'date_of_birth'];
        $this->append($user_attrs);
        $this->makeVisible($user_attrs);
    }
    public static function bootIsUser()
    {
        static::addGlobalScope('named', function (Builder $builder) {
            $builder->with('user')->join('users', static::query()->getQuery()->from . '.id', '=', 'users.id');
        });
    }
    public function getFirstNameAttribute()
    {return $this->user->first_name;}
    public function getMiddleNameAttribute()
    {return $this->user->middle_name;}
    public function getLastNameAttribute()
    {return $this->user->last_name;}
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

    public static function creating($user)
    {
        logger('Sub-User', compact('user'));
        unset($user->user_attrs);
    }
}
