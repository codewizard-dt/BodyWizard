<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ServiceCategory extends Model
{
    //
    // protected $fillable = [
    //     'service_category_id','description'
    // ];

    public $tableValues;
    public $optionsNavValues;
    public $optionsNav;

    public function __construct(){
	    $this->tableValues = array(
	    	'tableId' => 'ServiceCategoryList',
	    	'index' => 'id',
            'model' => 'Service Category',
            'destinations' => array("service-categories-edit","service-categories-delete","service-categories-create"),
            'btnText' => array("edit","delete","create new category"),
	    	'columns' => array(
                        array(
                            "label" => 'Service Category',
                            "className" => 'name',
                            "attribute" => 'name'
                        ),
                        array(
                            "label" => 'Description',
                            "className" => 'description',
                            "attribute" => 'description'
                        )
                    ),
	    	'hideOrder' => "description",
	    	'filtersColumn' => array(),
	    	'filtersOther' => array(),
            'destinations' => array(
                'edit','delete','service-categories-create'
            ),
            'btnText' => array(
                'edit','delete','create new category'
            )
        );
        $this->optionsNavValues = array(
            'model' => "ServiceCategory",
            'destinations' => [
                'edit','delete','create'
            ],
            'btnText' => [
                'edit','delete','create new category'
            ]
        );
	}

    public function optionsNav(){

    }
    public function services(){
        return $this->hasMany('App\Service');
    }
}
