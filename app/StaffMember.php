<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\TrackChanges;

class StaffMember extends Model
{
    use TrackChanges;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
        protected $fillable = [];

        /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
        protected $hidden = [];

        /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
        protected $casts = [
            "schedule" => 'array',
            "schedule_exceptions" => "array"
        ];

    public $tableValues;
    public $optionsNavValues;
    public $nameAttr;
    public $connectedModels;
    public $auditOptions;

    public function __construct($attributes = []){
        parent::__construct($attributes);
        $this->auditOptions = [
            'audit_table' => 'staff_members_audit',
            'includeFullJson' => false
        ];
        $this->nameAttr = ['preferred_name!!%preferred_name% %last_name%!!%first_name% %last_name%','userInfo'];
        $this->tableValues = array(
            'tableId' => 'StaffMemberList',
            'index' => 'id',
            'columns' => array(
                        array(
                            "label" => 'Preferred Name',
                            "className" => 'name',
                            "attribute" => 'preferred_name!!preferred_name!!first_name',
                            "hasThrough" => 'userInfo'
                        ),
                        array(
                            "label" => 'Last Name',
                            "className" => 'lastName',
                            "attribute" => 'last_name',
                            "hasThrough" => 'userInfo'
                        ),
                        array(
                            "label" => 'Email',
                            "className" => 'email',
                            "attribute" => 'email',
                            "hasThrough" => 'userInfo'
                        )
                    ),
            'hideOrder' => "email",
            'filtersColumn' => array(),
            'filtersOther' => array(),
            'destinations' => array("edit","schedule","delete"),
            'btnText' => array("edit info","edit schedule","delete"),
            'orderBy' => []
        );
        $this->optionsNavValues = array(
            'destinations' => array("edit","schedule","delete"),
            'btnText' => array("edit info","edit schedule","delete"),
        );
        $this->connectedModels = [
            // ['Service','many','morphToMany']
        ];
    }
    public function moreOptions(){
        
    }
    public function userInfo(){
        return $this->belongsTo('App\User','user_id');
    }

}
