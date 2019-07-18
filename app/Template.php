<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    public $tableValues;
    public $optionsNavValues;
    public $connectedModels;
    public $connectedModelAliases;
    public $nameAttr;

    public function __construct(){
	    $this->tableValues = array(
	    	'tableId' => 'TemplateList',
	    	'index' => 'id',
            'model' => "Template",
	    	'columns' => array(
                        array(
                            "label" => 'Template Name',
                            "className" => 'name',
                            "attribute" => 'name'
                        )
                    ),
	    	'hideOrder' => "type,opened,sent,message",
	    	'filtersColumn' => array(),
	    	'filtersOther' => array(),
            'destinations' => array(
                'edit','preview','delete'
            ),
            'btnText' => array(
                'edit','preview','delete'
            ),
            'extraBtns' => [
                ['back to messages',"/Message/index"]
            ]
	    );
        $this->optionsNavValues = array(
            'model' => "Template",
            'destinations' => array(
                'edit','preview','delete'
            ),
            'btnText' => array(
                'edit','preview','delete'
            )
        );
        $this->nameAttr = "name";

        // This will load a resource table for each connected model
        // into the create.blade view for THIS model, creating modals that
        // automatically popped up when required.
        // [Model, relationship]
        $this->connectedModels = array(
            // ['User','many','morphToMany']
            // ['ServiceCategory','one','belongsTo'],
            // ['Form','many','morphToMany']
            // ['Service','many','morphToMany']
        );
        $this->connectedModelAliases = [
            // 'users' => 'recipients',
            // 'user' => 'sender'
        ];
    }

    public function optionsNav(){

    }
    public function attachments(){
        return $this->morphToMany('App\Attachment','attachmentable');
    }
    public function images(){
        return $this->morphToMany('App\Image','imageable');
    }

}
