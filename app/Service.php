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
    // protected $hidden = ['full_json'];
    protected $visible = ['name','description_calendar','description_admin','service_category_id','duration','price'];
    protected $guarded = [];

    // public function __construct(){
    //     $this->connectedModels = array(
    //         ['Code','many','morphToMany'],
    //         ['ServiceCategory','one','belongsTo'],
    //         ['Form','many','morphToMany']
    //     );
    // }
    public static function tableValues(){
        return [
            'tableId' => 'ServiceList',
            'index' => 'id',
            'nameColumn' => 'Service Name',
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
        return [
          'service name' => $this->name,
          'category' => $this->category,
          'description' => $this->description_calendar,
          'duration' => $this->duration . ' minutes',
          'price' => Practice::getFromSession()->currency['symbol'].$this->price,
        ];
    }
    public function detailClick(){
        return 'nothing';
    }
    public function getCategoryAttribute(){
        return $this->servicecategory? $this->servicecategory->name : 'none';
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
