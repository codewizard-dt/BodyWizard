<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\TableAccess;
use App\Traits\HasSettings;
use App\Traits\IsCategory;
use App\Traits\UsePractice;

class ServiceCategory extends Model
{
    use UsePractice;
    use TableAccess;
    use HasSettings;
    use IsCategory;

    protected $guarded = [];
    protected $visible = ['name', 'description', 'service_names'];
    protected $appends = ['service_names'];

    public static function table()
    {
        return [
            'columns' => [
                'Name' => 'name',
                'Description' => 'description',
                'Services' => 'service_names',
            ],
            'buttons' => [],
            'filters' => [],
            'data' => [],
        ];
    }

    public function details()
    {
        return [
            'Description' => $this->description,
        ];
    }

    public function services()
    {
        return $this->hasMany('App\Service');
    }
    public function getServiceNamesAttribute()
    {
        return collect($this->services)->map(function ($service) {
            return $service->name;
        })->toArray();
    }
}
