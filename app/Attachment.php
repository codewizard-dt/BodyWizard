<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    public $tableValues;
    public $optionsNavValues;
    public $connectedModels;
    public $connectedModelAliases;
    public $nameAttr;

    public function __construct(){
	    $this->tableValues = array(
	    	'tableId' => 'AttachmentList',
	    	'index' => 'id',
            'model' => "Attachment",
	    	'columns' => array(
                        array(
                            "label" => 'Attachment',
                            "className" => 'mimeType',
                            "attribute" => 'mime_type',
                        ),
                        array(
                            "label" => 'Message',
                            "className" => 'messageId',
                            "attribute" => 'message_id'
                        )
                    ),
	    	'hideOrder' => "",
	    	'filtersColumn' => array(),
	    	'filtersOther' => array(),
            'destinations' => array(
                'view'
            ),
            'btnText' => array(
                'view'
            ),
            'extraBtns' => [
                // ['manage templates',"/Template/index"]
            ]
	    );
        $this->optionsNavValues = array(
            'model' => "Attachment",
            'destinations' => array(
                'view'
            ),
            'btnText' => array(
                'view'
            ),
        );
        $this->nameAttr = "mime_type";

        // This will load a resource table for each connected model
        // into the create.blade view for THIS model, creating modals that
        // automatically popped up when required.
        // 
        // ONLY LIST MODELS THAT NEED MODAL TABLE POP UPS
        // [Model, number, relationship]
        $this->connectedModels = array(
            // ['User','many','morphToMany'],
            // ['Template','one','belongsTo'],
            // ['Attachment','many','hasMany']
            // ['Form','many','morphToMany']
            // ['Service','many','morphToMany']
        );
        $this->connectedModelAliases = [
            // 'users' => 'recipients',
            // 'user' => 'sender'
        ];
    }

    public function moreOptions(){

    }
    public function templates(){
        return $this->morphedByMany('App\Template','attachmentable');
    }
    public function messages(){
        return $this->morphedByMany('App\Message','attachmentable');
    }
    public function chartnotes(){
        return $this->morphedByMany('App\ChartNote','attachmentable');
    }
}
