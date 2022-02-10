<?php

namespace App;

use App\Traits\IsUser;
use App\Traits\TableAccess;
use App\Traits\TrackChanges;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Patient extends Model
{
    use IsUser;
    use TrackChanges;
    use TableAccess;
    use SoftDeletes;

    protected $casts = [
        'settings' => 'array',
    ];
    protected $guarded = [];
    protected $visible = ['id', 'user_id', 'roles'];
    protected $with = ['User'];

    public static $instance_actions = [];
    public static $static_actions = [];

    public static function table()
    {
        $columns = [
            'Name' => 'name',
            'Phone' => 'phone',
            'Email' => 'email',
        ];
        $filters = [];
        $buttons = [];
        $data = [];
        return compact('columns', 'filters', 'buttons', 'data');
    }
    public function details()
    {
        $instance = [
            'Legal Name' => $this->legal_name,
            'Username' => $this->username,
            'Email' => $this->email,
            'Phone' => $this->phone,
            'Birth Date' => $this->date_of_birth,
        ];
        return $instance;
    }
    public function basic_info()
    {
        return [
            'name' => $this->name,
            'first_name' => $this->preferred_name,
            'last_name' => $this->last_name,
            'uid' => $this->getKey(),
        ];
    }

    public function complaints()
    {
        return $this->morphToMany('App\Complaint', 'complaintable');
    }
    public function appointments()
    {
        return $this->hasMany('App\Appointment');
    }
    public function submissions()
    {
        return $this->hasMany("App\Submission");
    }

}
