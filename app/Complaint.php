<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    public $tableValues;
    public $optionsNavValues;
    public $connectedModels;
    public $complaintTypeArr;

    public function __construct($attributes = []){
        parent::__construct($attributes);

        $this->complaintTypeArr = [
            "headaches and migraines","chronic pain (including flare ups)","acute pain (30 days or less)","musculoskeletal, non-pain-related","neurological","sleep disorders","energy and metabolism disorders","skin conditions","reproductive, sexual, and fertility disorders","vision and hearing disorders","respiratory, non-infectious","infections"
        ];

        $this->tableValues = array(
	    	'tableId' => 'ComplaintList',
	    	'index' => 'id',
            'model' => "Complaint",
	    	'columns' => array(
                        array(
                            "label" => 'Complaint',
                            "className" => 'name',
                            "attribute" => 'name'
                        ),
                        array(
                            "label" => 'Category',
                            "className" => 'category',
                            "attribute" => 'complaint_type'
                        )
                    ),
	    	'hideOrder' => "category",
	    	'filtersColumn' => array(),
	    	'filtersOther' => array(),
            'destinations' => array(
                'edit','settings','delete'
            ),
            'btnText' => array(
                'edit','settings', 'delete'
            ),
            'orderBy' => [
                ['complaint_type','asc'],
                ['name','asc']
            ]
	    );
        $this->optionsNavValues = array(
            'model' => "Complaint",
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
            ['Code','many','morphToMany'],
            // ['Form','many','morphToMany']
            ['Diagnosis','many','morphToMany']
        );
    }

    public function optionsNav(){

    }

    public function codes(){
        return $this->morphToMany('App\Code', 'codeable');
    }
    public function diagnoses(){
    	return $this->morphToMany('App\Diagnosis', 'diagnosisable');
    }
}
