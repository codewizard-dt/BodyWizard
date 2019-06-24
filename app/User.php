<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable
{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
        protected $fillable = [
            'name', 'email', 'password', 'first_name', 'middle_name', 'last_name', 'preferred_name', 'username', 'phone'
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
        ];

    public $tableValues;
    public $optionsNavValues;
    public $nameAttr;
    public $connectedModels;

    public function __construct(){
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
        
    }
}
