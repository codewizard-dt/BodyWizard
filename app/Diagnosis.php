<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Diagnosis extends Model
{
    public $tableValues;
    public $optionsNavValues;
    public $connectedModels;

    public function __construct(){
	    $this->tableValues = array(
	    	'tableId' => 'DiagnosisList',
	    	'index' => 'id',
            'model' => "Diagnosis",
	    	'columns' => array(
                        array(
                            "label" => 'Diagnosis',
                            "className" => 'name',
                            "attribute" => 'name'
                        ),
                        array(
                            "label" => 'Type',
                            "className" => 'type',
                            "attribute" => 'medicine_type'
                        ),
                        array(
                            "label" => 'Category',
                            "className" => 'category',
                            "attribute" => 'category'
                        ),
                        array(
                            "label" => 'Can Affect',
                            "className" => 'affects',
                            "attribute" => 'affects'
                        )
                    ),
	    	'hideOrder' => "category,affects",
	    	'filtersColumn' => [
                [
                    "label" => 'Medicine Type',
                    "filterName" => 'type',
                    "attribute" => 'medicine_type',
                    "markOptions" => null,
                    "filterOptions" => array(
                        array("label" => 'Western',"value" => 'Western'),
                        array("label" => 'Chinese',"value" => 'Chinese')
                    )
                ]
            ],
	    	'filtersOther' => array(),
            'destinations' => array(
                'edit','settings','delete'
            ),
            'btnText' => array(
                'edit','settings', 'delete'
            ),
            'orderBy' => [
                ['name','asc']
            ]
	    );
        $this->optionsNavValues = array(
            'model' => "Diagnosis",
            'destinations' => array(
                'edit','settings','delete'
            ),
            'btnText' => array(
                'edit','settings', 'delete'
            )
        );

        // This will load a resource table for each connected model
        // into the create.blade view for THIS model, creating modals that
        // automatically popp up when required.
        // [Model, number, relationship ]
        $this->connectedModels = array(
            ['Code','many','morphToMany']
            // ['Form','many','morphToMany']
            // ['Diagnosis','many','morphToMany']
        );
    }

    public function moreOptions(){

    }

    public function codes(){
        return $this->morphToMany('App\Code', 'codeable');
    }
}
