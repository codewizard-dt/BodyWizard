<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use App\ComplaintCategory;
use App\Code;


class Complaint extends Model
{
    public $tableValues;
    public $optionsNavValues;
    public $connectedModelAliases;
    public $connectedModels;
    public $complaintTypeArr;

    public function __construct($attributes = []){
        parent::__construct($attributes);

        $this->complaintTypeArr = [
            "headaches and migraines",
            "chronic pain (including flare ups)",
            "acute pain (30 days or less)",
            "musculoskeletal, non-pain-related",
            "neurological",
            "sleep disorders",
            "energy and metabolism disorders",
            "skin conditions",
            "reproductive + sexual disorders",
            "vision and hearing disorders",
            "respiratory, non-infectious",
            "infections"
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
            ['ComplaintCategory','many','morphToMany'],
            ['Diagnosis','many','morphToMany']
        );
        $this->connectedModelAliases = [
            'complaintcategories' => 'categories',
            // 'user' => 'sender'
        ];
    }
    static function tableValues(){
        $usertype = Auth::user()->user_type;
        $commonArr = [
            'tableId' => 'FormList',
            'index' => 'form_id'
        ];
        if ($usertype == 'practitioner'){
            $arr = [
                'columns' => 
                [
                    ["label" => 'Complaint',
                    "className" => 'name',
                    "attribute" => 'name'],
                    ["label" => 'Categories',
                    "className" => 'categories',
                    "attribute" => 'category_names'],
                    ["label" => 'Codes',
                    "className" => 'codes',
                    "attribute" => 'code_list'],
                ],
                'hideOrder' => "type,usertype,charting",
                'filtersColumn' => [],
                'filtersOther' => [],
                'optionsNavValues' => [
                    'destinations' => ["settings","form-preview","forms-edit","delete"],
                    'btnText' => ["settings","preview","edit","delete"]
                ],
                'orderBy' => [
                    ['complaint_category_id',"asc"],
                ],
                'extraBtns' => [
                    ['manage categories',"/ComplaintCategory/index"]
                ]
            ];
        }elseif ($usertype == 'patient'){
            // $arr = 
            // [
            //     'columns' => 
            //     [
            //         ["label" => 'Form Name',
            //         "className" => 'name',
            //         "attribute" => 'form_name'],
            //         ["label" => 'Submitted',
            //         "className" => 'submitted',
            //         "attribute" => 'last_submitted'],
            //         ["label" => 'Status',
            //         "className" => 'status',
            //         "attribute" => 'status']
            //     ],
            //     'hideOrder' => "",
            //     'filtersColumn' => [],
            //     'filtersOther' => [
            //     ],
            //     'optionsNavValues' => [
            //         'destinations' => ['loadForm'],
            //         'btnText' => ['open form']
            //     ],
            //     'orderBy' => [
            //         ['form_name',"asc"]
            //     ]
            // ];
        }
        return array_merge($commonArr,$arr);
    }
    public function navOptions(){
        $dataAttrs = [
            [
                'key' => 'json',
                'value' => str_replace("'","\u0027",$this->full_json)
            ],
            [
                'key' => 'status',
                'value' => $this->status
            ],
        ];
        $extraClasses = "";
        $buttons = [
            [
                'text' => 'edit',
                'destination' => 'edit'
            ],
            [
                'text' => 'codes',
                'destination' => 'codes'
            ],
            [
                'text' => 'delete',
                'destination' => 'delete'
            ],
        ];
        $data = [
                    'dataAttrs' => $dataAttrs,
                    'extraClasses' => $extraClasses,
                    'buttons' => $buttons,
                    'instance' => $this,
                    'model' => getModel($this)
                ];
        return $data;
    }
    public function modelDetails(){
        // $indicator = ($this->status == 'resolved') ? "<span class='checkmark'>✓</span>" : "<span class='xMark'>x</span>";
        return [
            // 'Status' => $this->status.$indicator,
            // 'Category' => $this->category,
            // 'Description' => $this->description,
            // 'Location' => $this->location,
            // 'Reported At' => $this->created_at,
            // 'Details' => $this->details
        ];
    }

    public function getCategoryNamesAttribute(){
        $arr = $this->categories ? $this->categories->map(function($category){return $category->name;})->toArray() : null;
        return $arr ? implode(', ',$arr) : 'none';
    }
    public function getCodeListAttribute(){
        $arr = $this->codes ? $this->codes->map(function($category){return $code->name;})->toArray() : null;
        return $arr ? implode(', ',$arr) : 'none';
    }

    public function codes(){
        return $this->morphToMany('App\Code', 'codeable');
    }
    public function diagnoses(){
    	return $this->morphToMany('App\Diagnosis', 'diagnosisable');
    }
    public function categories(){
        return $this->morphedByMany('App\ComplaintCategory','complaintable');
    }
}
