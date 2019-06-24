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
                            "label" => 'Recipients',
                            "className" => 'name',
                            "attribute" => 'recipients',
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
            'destinations' => array(
                'expand','reply'
            ),
            'btnText' => array(
                'expand','reply'
            )
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
            ['User','many','morphToMany']
            // ['ServiceCategory','one','belongsTo'],
            // ['Form','many','morphToMany']
            // ['Service','many','morphToMany']
        );
        $this->connectedModelAliases = [
            'users' => 'recipients',
            'user' => 'sender'
        ];
    }

    public function optionsNav(){

    }

    public function recipients(){
    	return $this->morphToMany('App\User', 'userable');
    }
    public function sender(){
    	return $this->belongsTo('App\User','user_id');
    }
}
