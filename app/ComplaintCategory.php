<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use App\Complaint;
use App\Code;


class ComplaintCategory extends Model
{
    protected $casts = [
        'settings' => 'array',
    ];
    public $connectedModels;

    public function __construct($attributes = []){
        parent::__construct($attributes);

        // [Model, number, relationship ]
        $this->connectedModels = array(
            // ['Complaint','many','hasMany'],
        );
    }

    static function tableValues(){
        $usertype = Auth::user()->user_type;
        $commonArr = [
            'tableId' => 'ComplaintCategoryList',
            'index' => 'id'
        ];
        $arr = [
            'columns' => 
            [
                ["label" => 'Category Name',
                "className" => 'name',
                "attribute" => 'name'],
                ["label" => 'Complaints',
                "className" => 'complaints',
                "attribute" => 'complaint_list'],
            ],
            'hideOrder' => "type,usertype,charting",
            'filtersColumn' => [],
            'filtersOther' => [],
            'optionsNavValues' => [
                'destinations' => ["settings","form-preview","forms-edit","delete"],
                'btnText' => ["settings","preview","edit","delete"]
            ],
            'orderBy' => [
                // ['complaint_category_id',"asc"],
            ],
            'extraBtns' => [
                ['back to complaints',"/Complaint/index"]
            ]
        ];
        return array_merge($commonArr,$arr);
    }
    public function navOptions(){
        $dataAttrs = [
            [
                'key' => 'json',
                'value' => str_replace("'","\u0027",$this->full_json)
            ],
        ];
        $extraClasses = "";
        $buttons = [
            [
                'text' => 'edit',
                'destination' => 'edit'
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
        return [
            'Category' => $this->name,
            'Description' => $this->description,
            'Related Complaints' => $this->complaints ? $this->complaints->map(function($complaint){return $complaint->name;})->toArray() : 'none'
        ];
    }

    public function complaints(){
    	return $this->morphToMany('App\Complaint','complaintable');
    }
    public function getComplaintListAttribute(){
        $arr = $this->complaints ? $this->complaints->map(function($complaint){return $complaint->name;})->toArray() : null;
        return $arr ? implode(', ',$arr) : 'none';
    }

}
