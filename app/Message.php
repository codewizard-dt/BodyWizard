<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    public $tableValues;
    public $optionsNavValues;
    public $connectedModels;
    public $connectedModelAliases;
    public $nameAttr;

    public function __construct(){
	    $this->tableValues = array(
	    	'tableId' => 'MessageList',
	    	'index' => 'id',
            'model' => "Message",
	    	'columns' => array(
                        array(
                            "label" => 'Recipient',
                            "className" => 'name',
                            "attribute" => 'recipient_id',
                            "fetchNamesFrom" => 'User'
                        ),
                        array(
                            "label" => 'Message',
                            "className" => 'message',
                            "attribute" => 'subject!!subject!!message'
                        ),
                        array(
                            "label" => 'Type',
                            "className" => 'type',
                            "attribute" => 'type'
                        ),
                        array(
                            "label" => 'Sent At',
                            "className" => 'sent',
                            "attribute" => 'created_at'
                        ),
                        array(
                            "label" => 'Status',
                            "className" => 'status',
                            "attribute" => 'status'
                        )
                    ),
	    	'hideOrder' => "type,opened,sent,message",
	    	'filtersColumn' => array(),
	    	'filtersOther' => array(),
            'orderBy' => [
                ['updated_at','desc']
            ],
            'destinations' => array(
                'expand','reply'
            ),
            'btnText' => array(
                'expand','reply'
            ),
            'extraBtns' => [
                ['manage templates',"/Template/index"]
            ]
	    );
        $this->optionsNavValues = array(
            'model' => "Message",
            'destinations' => array(
                'expand','reply'
            ),
            'btnText' => array(
                'expand','reply'
            )
        );
        $this->nameAttr = "subject!!%type%: %subject%!!%type%: %message%";

        // This will load a resource table for each connected model
        // into the create.blade view for THIS model, creating modals that
        // automatically popped up when required.
        // [Model, relationship]
        $this->connectedModels = array(
            ['User','many','morphToMany'],
            ['Template','one','belongsTo']
            // ['Attachment','many','morphToMany']
            // ['Form','many','morphToMany']
            // ['Service','many','morphToMany']
        );
        $this->connectedModelAliases = [
            'user' => 'recipient',
            'user' => 'sender'
        ];
    }

    public function optionsNav(){

    }
    public function template(){
        return $this->belongsTo('App\Template', 'template_id');
    }
    public function attachments(){
        return $this->morphToMany('App\Attachment','attachmentable');
    }
    public function images(){
        return $this->morphToMany('App\Image','imageable');
    }
    public function recipient(){
    	return $this->belongsTo('App\User', 'recipient_id');
    }
    public function sender(){
    	return $this->belongsTo('App\User','sender_id');
    }
}
