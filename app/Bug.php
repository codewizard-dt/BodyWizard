<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


class Bug extends Model
{
    protected $casts = [
    	'details' => 'array',
    	'status' => 'array'
    ];
    public $connectedModels;
    public $createdByForm;

    public function __construct($attributes = []){
        parent::__construct($attributes);
        $createdByForm = false;
        $this->connectedModels = [];
	}

    static function tableValues(){
        $usertype = Auth::user()->user_type;
        $commonArr = [
            'tableId' => 'BugList',
            'index' => 'id'
        ];
        if ($usertype == 'practitioner'){
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
    public function moreOptions(){
        // $bug = $this->toArray();
        $bug = [
            'Category' => $this->category,
            'Description' => $this->description,
            'Location' => $this->location,
            'Reported At' => $this->created_at,
            'Details' => $this->details
        ];
        echo '<div class="split3366KeyValues">';
        foreach($bug as $attr => $val){
            if (is_array($val)){
                echo "<div class='label'>$attr</div><div class='value little'>";
                foreach ($val as $k => $v){
                    echo "<h4>$k</h4>";
                    echo "<div>$v</div>";
                }
                echo "</div>";                
            }else{
                echo "<div class='label'>$attr</div><div class='value'>$val</div>";
            }
        }
        echo "</div>";
    }
    public function getNameAttribute(){
    	return $this->description.": ".$this->location;
    }
}
