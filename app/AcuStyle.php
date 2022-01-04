<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\TableAccess;
// use App\Traits\HasCategory;
use App\Traits\HasSettings;

class AcuStyle extends Model
{
    use TableAccess;
    use HasSettings;

    protected $connection = 'practices';
    protected $guarded = [];
    // protected $with = ['Category'];

    public static $display_name = 'Acupuncture Style';
    public static $instance_actions = [];
    public static $static_actions = [];

    public static function table()
    {
        $columns = [
            'Description' => 'description',
        ];
        $filters = [];
        $buttons = [];
        $data = [];
        return compact('columns', 'filters', 'buttons', 'data');
    }
    public function details()
    {
        $instance = [
            'Category' => $this->category_name,
            'Description' => $this->description,
        ];
        return $instance;
    }
}
