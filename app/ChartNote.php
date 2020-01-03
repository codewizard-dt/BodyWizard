<?php

namespace App;

use App\Traits\TrackChanges;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Model;

class ChartNote extends Model
{
    use TrackChanges;

    public $tableValues;
    public $optionsNavValues;
    public $connectedModels;
    public $nameAttr;
    public $auditOptions;

    public function __construct($attributes = []){
        parent::__construct($attributes);
        $this->auditOptions = [
            'audit_table' => 'chart_notes_audit',
            'includeFullJson' => false
        ];

    }

    static function tableValues(){
        $usertype = Auth::user()->user_type;
        $commonArr = [
            'tableId' => 'ChartNoteList',
            'index' => 'id'
        ];
        if ($usertype == 'practitioner'){
            $arr = [
                        'columns' => 
                        [
                            ["label" => 'Patient',
                            "className" => 'description',
                            "attribute" => 'description'],
                            ["label" => 'Appointment',
                            "className" => 'category',
                            "attribute" => 'category'],
                            ["label" => 'Signed',
                            "className" => 'location',
                            "attribute" => 'location'],
                        ],
                        'hideOrder' => "category,location,reported",
                        'filtersColumn' => [],
                        'filtersOther' => [],
                        'optionsNavValues' => [
                            'destinations' => ["details"],
                            'btnText' => ["details"]
                        ],
                        'orderBy' => [
                            ['created_at',"desc"],
                        ]
            ];
        }elseif ($usertype == 'patient'){
            $arr = [
                        'columns' => 
                        [
                            ["label" => 'Bug',
                            "className" => 'description',
                            "attribute" => 'description'],
                            ["label" => 'Category',
                            "className" => 'category',
                            "attribute" => 'category'],
                            ["label" => 'Location',
                            "className" => 'location',
                            "attribute" => 'location'],
                            ["label" => 'Reported At',
                            "className" => 'reported',
                            "attribute" => 'created_at']
                        ],
                        'hideOrder' => "category,location,reported",
                        'filtersColumn' => [],
                        'filtersOther' => [],
                        'optionsNavValues' => [
                            'destinations' => ["details"],
                            'btnText' => ["details"]
                        ],
                        'orderBy' => [
                            ['created_at',"desc"],
                        ]
            ];
        }
        return array_merge($commonArr,$arr);
    }

    public function patient(){
    	return $this->belongsTo('App\Patient','patient_id');
    }
}
