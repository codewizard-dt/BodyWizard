<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


class Bug extends Model
{
    protected $casts = [
    	'details' => 'array',
    	'status' => 'array',
        'request' => 'array'
    ];
    public $connectedModels;
    public $createdByForm;

    public function __construct($attributes = []){
        parent::__construct($attributes);
        // $createdByForm = false;
        $this->connectedModels = [];
	}

    static function tableValues(){
        return [
            'tableId' => 'BugList',
            'index' => 'id',
            'columns' => 
            [
                'Bug' => 'description',
                'Category' => 'category',
                'Location' => 'location',
                'Reported At' => 'created_at',
                'Status' => 'status',
            ],
            'hideOrder' => ['Category','Location','Reported At'],
            'filters' => [],
            'orderBy' => [
                ['created_at',"desc"],
            ]
        ];
    }
    public function navOptions(){
        $resolved = ($this->status == 'resolved');
        $dataAttrs = [
            [
                'key' => 'status',
                'value' => $this->status
            ],
        ];
        $extraClasses = "";
        $buttons = [
            [
                'text' => 'delete',
                'destination' => 'delete'
            ]
        ];
        if (!$resolved) $buttons[] = ['text'=>'mark as resolved','destination' => 'markBugResolved'];
        $data = [
                    'dataAttrs' => $dataAttrs,
                    'extraClasses' => $extraClasses,
                    'buttons' => $buttons,
                    'instance' => $this,
                    'model' => 'Bug'
                ];
        return $data;
    }
    public function modelDetails(){
        $isResolved = ($this->status == 'resolved');
        return [
            'Status' => $this->status.checkOrX($isResolved),
            'Category' => $this->category,
            'Description' => $this->description,
            'Location' => $this->location,
            'Request' => $this->request,
            'Reported At' => $this->created_at,
            'Details' => $this->details
        ];
    }
    public function getNameAttribute(){
    	return $this->description.": ".$this->location;
    }
}
