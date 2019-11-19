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
	    $this->tableValues = array(
	    	'tableId' => 'ServiceList',
	    	'index' => 'id',
            'model' => "Service",
	    	'columns' => array(
                        array(
                            "label" => 'Service Name',
                            "className" => 'name',
                            "attribute" => 'name'
                        ),
                        array(
                            "label" => 'Category',
                            "className" => 'group',
                            "attribute" => 'service_category_id',
                            "fetchNamesFrom" => 'ServiceCategory'
                        ),
                        array(
                            "label" => 'Duration',
                            "className" => 'duration',
                            "attribute" => 'duration'
                        ),
                        array(
                            "label" => 'Price',
                            "className" => 'price',
                            "attribute" => 'price'
                        )
                    ),
	    	'hideOrder' => "price,category,duration",
	    	'filtersColumn' => array(),
	    	'filtersOther' => array(),
            'destinations' => array(
                'edit','settings','delete'
            ),
            'btnText' => array(
                'edit','delete','settings', 'delete'
            ),
            'extraBtns' => [
                ['manage categories','/ServiceCategory/index']
            ]
	    );
        $this->optionsNavValues = array(
            'model' => "Service",
            'destinations' => array(
                'edit','settings','delete'
            ),
            'btnText' => array(
                'edit','settings', 'delete'
            )
        );

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

    public function optionsNav(){

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
    // public function services(){
    //     return $this->morphToMany('App\Service','serviceable');
    // }
}
