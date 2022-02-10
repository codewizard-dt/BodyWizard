<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
// use Illuminate\Database\Eloquent\SoftDeletes;

use App\Traits\IsUser;
use App\Traits\TrackChanges;
use App\Traits\TableAccess;
use App\Traits\HasSettings;
use Illuminate\Database\Eloquent\SoftDeletes;

class StaffMember extends Model
{
    use IsUser;
    use TrackChanges;
    use TableAccess;
    use HasSettings;
    use SoftDeletes;

    protected $casts = [
        "schedule" => 'array',
        "schedule_exceptions" => "array",
    ];

    protected $guarded = [];
    protected $visible = ['id', 'name', 'email', 'username', 'date_of_birth', 'roles'];
    protected $appends = ['name'];

    // static public $display_name = 'Staff Member';
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
            // 'Category' => $this->category_name,
            // 'Description' => $this->description,
        ];
        return $instance;
    }

    public function moreOptions()
    {

    }
    public function user()
    {
        return $this->belongsTo('App\User', 'user_id');
    }

}
