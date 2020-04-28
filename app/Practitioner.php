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
        // $this->nameAttr = ['preferred_name!!%preferred_name% %last_name%!!%first_name% %last_name%','userInfo'];
        $this->connectedModels = array(
            // ['Service','many','morphToMany']
        );
    }

    public static function tableValues(){
        return [
            'tableId' => 'PractitionerList',
            'index' => 'id',
            'model' => "Practitioner",
            'columns' => [
                'Name' => 'name',
                'Phone' => 'phone',
            ],
            'hideOrder' => [],
            'filters' => [],
            'extraBtns' => [
                // ['manage categories','/PractitionerCategory/index']
            ]
        ];

    }
    public function navOptions(){
        return 'nav options';
    }
    public function modelDetails(){
        return 'model details';
    }
    public function detailClick(){
        return 'detail click';
    }

    public function userInfo(){
        return $this->belongsTo('App\User','user_id');
    }
        public function getNameAttribute(){
            return $user = $this->userInfo->name;
        }
        public function getPhoneAttribute(){
            return $user = $this->userInfo->phone;
        }
        public function getEmailAttribute(){
            return $user = $this->userInfo->email;
        }
        public function getDateOfBirthAttribute(){
            return $user = $this->userInfo->date_of_birth;
        }

    public function moreOptions(){

    }
}
