<?php

namespace App;
use App\Traits\TrackChanges;
use Illuminate\Support\Facades\Log;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable;
    use TrackChanges;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
        protected $fillable = [
            'first_name', 'last_name', 'username', 'date_of_birth', 'email', 'phone', 'password'
        ];

        /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
        protected $hidden = [
            'password', 'remember_token',
        ];

        /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
        protected $casts = [
            'email_verified_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'date_of_birth' => 'date',
            'security_questions' => 'array'
        ];

    public $tableValues;
    public $optionsNavValues;
    public $nameAttr;
    public $connectedModels;
    public $auditOptions;

    public function __construct($attributes = []){
        parent::__construct($attributes);

        $this->auditOptions = [
            'audit_table' => 'users_audit',
            'includeFullJson' => false
        ];
        $this->nameAttr = 'preferred_name!!%preferred_name% %last_name%!!%first_name% %last_name%';
        $this->tableValues = array(
            'tableId' => 'UserList',
            'index' => 'id',
            'columns' => array(
                        array(
                            "label" => 'Preferred Name',
                            "className" => 'name',
                            "attribute" => 'preferred_name!!preferred_name!!first_name'
                        ),
                        array(
                            "label" => 'Last Name',
                            "className" => 'lastName',
                            "attribute" => 'last_name'
                        ),
                        [
                            'label' => 'User Type',
                            'className' => 'userType',
                            'attribute' => 'user_type'
                        ],
                        array(
                            "label" => 'Email',
                            "className" => 'email',
                            "attribute" => 'email'
                        )
                    ),
            'hideOrder' => "email",
            'filtersColumn' => array(),
            'filtersOther' => array(),
            'destinations' => array("settings","edit","delete","create"),
            'btnText' => array("settings","edit","delete","add new patient"),
            'orderBy' => [
                ['last_name',"asc"],
                ['first_name',"asc"]
            ]
        );
        $this->optionsNavValues = array(
            'destinations' => array("settings","edit","delete","create"),
            'btnText' => array("settings","edit","delete","add new patient"),
        );
        $this->connectedModels = [  
            // ['Service','many','morphToMany']
        ];
    }
    public function optionsNav(){
        Log::info("optionsNav");
    }
    public function patientInfo(){
        return $this->hasOne('App\Patient');
    }
}
