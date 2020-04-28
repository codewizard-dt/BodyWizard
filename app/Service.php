<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    public $tableValues;
    public $optionsNavValues;
    public $connectedModels;

    protected $casts = [
        'is_addon' => 'boolean',
        'addon_only' => 'boolean',
        'addon_services' => 'array',
        'new_patients_ok' => 'boolean',
        'new_patients_only' => 'boolean'
    ];

    public function __construct(){

        // This will load a resource table for each connected model
        // into the create.blade view for THIS model, creating modals that
        // automatically popped up when required.
        // [Model, relationship]
        $this->connectedModels = array(
            ['Code','many','morphToMany'],
            ['ServiceCategory','one','belongsTo'],
            ['Form','many','morphToMany']
            // ['Service','many','morphToMany']
        );
    }
    public static function tableValues(){
        return [
            'tableId' => 'ServiceList',
            'index' => 'id',
            'model' => "Service",
            'columns' => [
                'Service Name' => 'name',
                'Category' => 'category',
                'Duration' => 'duration',
                'Price' => 'display_price',
            ],
            'hideOrder' => ['Price','Category','Duration'],
            'filters' => [],
            'extraBtns' => [
                'manage categories' => '/ServiceCategory/index'
            ],
        ];
    }
    public function navOptions(){
        return 'nothing';
    }
    public function modelDetails(){
        return 'nothing';
    }
    public function detailClick(){
        return 'nothing';
    }
    public function getCategoryAttribute(){
        return $this->servicecategory->name;
    }
    public function getDisplayPriceAttribute(){
        $practice = Practice::getFromSession();
        return $practice->currency['symbol'].$this->price;
    }

    public function moreOptions(){

    }

    public function codes(){
        return $this->morphToMany('App\Code', 'codeable');
    }
    public function servicecategory(){
        return $this->belongsTo('App\ServiceCategory','service_category_id');
    }
    public function forms(){
        return $this->morphToMany('App\Form','formable','formables',null,'form_id');
    }
}
