<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\TrackChanges;


class Practitioner extends Model
{
    use TrackChanges;

    public $tableValues;
    public $optionsNavValues;
    public $connectedModels;
    public $auditOptions;
    public $nameAttr;

    protected $casts = [
        'schedule' => 'array'
    ];



    public function __construct($attributes = []){
        parent::__construct($attributes);
        $this->auditOptions = [
            'audit_table' => 'practitioners_audit',
            'includeFullJson' => false
        ];
        $this->nameAttr = ['preferred_name!!%preferred_name% %last_name%!!%first_name% %last_name%','userInfo'];
	    $this->tableValues = array(
	    	'tableId' => 'PractitionerList',
	    	'index' => 'id',
            'model' => "Practitioner",
	    	'columns' => array(
                        array(
                            "label" => 'Preferred Name',
                            "className" => 'name',
                            "attribute" => 'preferred_name!!preferred_name!!first_name',
                            "hasThrough" => 'userInfo'
                        ),
                        array(
                            "label" => 'Last Name',
                            "className" => 'lastName',
                            "attribute" => 'last_name',
                            "hasThrough" => 'userInfo'
                        )
                    ),
            'displayName' => "%name% %lastName%",
	    	'hideOrder' => "",
	    	'filtersColumn' => array(),
	    	'filtersOther' => array(),
            'destinations' => array(
                'edit','settings','delete'
            ),
            'btnText' => array(
                'edit','settings', 'delete'
            ),
            'extraBtns' => [
                // ['manage categories','/PractitionerCategory/index']
            ]
	    );
        $this->optionsNavValues = array(
            'model' => "Practitioner",
            'destinations' => array(
                'edit','schedule','delete'
            ),
            'btnText' => array(
                'edit info','edit schedule', 'delete'
            )
        );

        // This will load a resource table for each connected model
        // into the create.blade view for THIS model, creating modals that
        // automatically popped up when required.
        // [Model, relationship]
        $this->connectedModels = array(
            // ['Service','many','morphToMany']
        );
    }

    public function userInfo(){
        return $this->belongsTo('App\User','user_id');
    }

    public function name(){
        // return complexAttr()
    }

    public function optionsNav(){

    }
}
