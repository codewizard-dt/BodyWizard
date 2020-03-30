<?php

namespace App;
use App\Traits\TrackChanges;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Cashier\Billable;
use Illuminate\Foundation\Auth\User as Authenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    use Notifiable;
    use TrackChanges;
    use Billable;

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
        // protected $hidden = [
        //     'password', 'remember_token',
        // ];
        protected $visible = [
            'id','first_name','middle_name','last_name','preferred_name','user_type','email','phone',
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
            'security_questions' => 'array',
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
                            "label" => 'Name',
                            "className" => 'name',
                            "attribute" => 'name'
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
                ['user_type','asc'],
                ['last_name',"asc"],
                ['first_name',"asc"]
            ]
        );
        $this->optionsNavValues = array(
            'destinations' => array("settings","edit","delete"),
            'btnText' => array("settings","edit","delete"),
        );
        $this->connectedModels = [  
            // ['Service','many','morphToMany']
        ];
    }
    public static function admins(){
        return User::where('is_admin','1')->get();
    }
    public static function tableValues(){
        $usertype = Auth::user()->user_type;
        if ($usertype == 'practitioner'){
            return 
            [
                'tableId' => 'UserList',
                'index' => 'id',
                'columns' => array(
                            array(
                                "label" => 'Name',
                                "className" => 'name',
                                "attribute" => 'name'
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
                    ['user_type','asc'],
                    ['last_name',"asc"],
                    ['first_name',"asc"]
                ],
                'optionsNavValues' => array(
                    'destinations' => array("settings","edit","delete"),
                    'btnText' => array("settings","edit","delete"),
                )
            ];
        }
    }
    public function moreOptions(){
        // Log::info("optionsNav");
    }
    public function getNameAttribute(){
        return $this->preferred_name." ".$this->last_name;
    }
    public function getPreferredNameAttribute($value){
        return $value ? $value : $this->first_name;
    }
    public function getFullNameAttribute(){
        return $this->preferred_name." ".$this->middle_name." ".$this->last_name;
    }
    public function getLegalNameAttribute(){
        return $this->first_name." ".$this->middle_name." ".$this->last_name;
    }
    public function getIsSuperuserAttribute(){
        $supers = ['david@bodywizardmedicine.com'];
        return in_array($this->email, $supers);
    }
    public function patientInfo(){
        return $this->hasOne('App\Patient');
    }
    public function practitionerInfo(){
        return $this->hasOne('App\Practitioner');
    }
    public function staffMemberInfo(){
        return $this->hasOne('App\StaffMember');
    }
}
