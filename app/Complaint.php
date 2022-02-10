<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\TableAccess;
use App\Traits\HasCategory;
use App\Traits\HasSettings;

class Complaint extends Model
{
    use TableAccess;
    use HasCategory;
    use HasSettings;

    protected $guarded = [];
    protected $with = ['Category'];

    public static $alternate_name = 'Chief Complaint';
    // static public $list_columns = ['complaint_category_id'];
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
            'Complaint' => $this->name,
            'Category' => $this->category->name,
            'Description' => $this->description,
            'Applicable ICD Codes' => $this->icd_code_names,
        ];
        return $instance;
    }

    public function getIcdCodeNamesAttribute()
    {
        $icd_codes = $this->icd_codes;
        return $icd_codes->count() ? $icd_codes->map(function ($code) {return $code->name;})->join("<br>") : 'none listed';
    }

    // public function category() {
    //     return $this->belongsTo('App\ComplaintCategory','complaint_category_id');
    // }
    public function icd_codes()
    {
        return $this->morphToMany('\App\IcdCode', 'icd_codeable');
    }
}
