<?php

namespace App;
use App\Traits\TrackChanges;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use Illuminate\Database\Eloquent\SoftDeletes;

use Illuminate\Support\Carbon;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Cashier\Billable;
use Illuminate\Foundation\Auth\User as Authenticatable;

use App\Traits\TableAccess;
use App\Traits\HasSettings;


class User extends Authenticatable implements MustVerifyEmail
{
  use Notifiable;
  use TrackChanges;
  use Billable;
  use SoftDeletes;
  use TableAccess;
  use HasSettings;


  // protected $fillable = [
  //   'first_name', 'user_type','last_name', 'username', 'date_of_birth', 'email', 'phone', 'password','roles'
  // ];
  protected $guarded = [];

  // protected $hidden = [
  //   'password', 'remember_token','stripe_id','card_brand','card_last_four','trial_ends_at'
  // ];
  protected $visible = [
    'first_name','middle_name','last_name','preferred_name','name','legal_name','full_name'
  ];
  protected $appends = ['name'];

  protected $casts = [
    'email_verified_at' => 'datetime',
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
    'date_of_birth' => 'date',
    'roles' => 'json',
  ];

  public $TableOptions;
  public $optionsNavValues;
  public $nameAttr;
  public $connectedModels;
  public $auditOptions;

  public static function admins(){
    return User::where('email','david@bodywizardmedicine.com')->get();
  }
  // public static function TableOptions(){
  //   $usertype = Auth::user()->user_type;
  //   if ($usertype == 'practitioner'){
  //     return 
  //     [
  //       'tableId' => 'UserList',
  //       'index' => 'id',
  //       'columns' => array(
  //         array(
  //           "label" => 'Name',
  //           "className" => 'name',
  //           "attribute" => 'name'
  //         ),
  //         [
  //           'label' => 'User Type',
  //           'className' => 'userType',
  //           'attribute' => 'user_type'
  //         ],
  //         array(
  //           "label" => 'Email',
  //           "className" => 'email',
  //           "attribute" => 'email'
  //         )
  //       ),
  //       'hideOrder' => "email",
  //       'filtersColumn' => array(),
  //       'filtersOther' => array(),
  //       'destinations' => array("settings","edit","delete","create"),
  //       'btnText' => array("settings","edit","delete","add new patient"),
  //       'orderBy' => [
  //         ['user_type','asc'],
  //         ['last_name',"asc"],
  //         ['first_name',"asc"]
  //       ],
  //       'optionsNavValues' => array(
  //         'destinations' => array("settings","edit","delete"),
  //         'btnText' => array("settings","edit","delete"),
  //       )
  //     ];
  //   }
  // }
  // public function moreOptions(){
  //       // Log::info("optionsNav");
  // }
  public function navbarInfo(){
    if ($this->is('practitioner')){
      $info = [
        'id' => $this->id,
        'type' => $this->user_type,
        'is_admin' => $this->is_admin,
        'is_super' => $this->is_superuser,
        'practitioner_id' => $this->practitioner->id,
        'name' => $this->name
      ];
    }
    return $info;
  }

  static public function successResponse(){
    $user = User::find(getUid('User'));
    if (session('model_action') == 'create') $str = $user->full_name . ' successfully added as a new '.$user->roles['list'][0].'!';
    else $str = $user->full_name . ' information updated';
    $response = "<h1 class='paddedBig'>$str</h1>";
    foreach ($user->roles['list'] as $role) {
      $roles = plural($role);
      $response .= "<div class='button pink' data-mode='click' data-target='$role-index'>go to $roles</div>";
    }
    return $response;
  }

  public function is($type){
    return $this->user_type === $type;
  }
  public function setDateOfBirthAttribute($value){
    $this->attributes['date_of_birth'] = Carbon::parse($value);
  }
  public function getDateOfBirthAttribute($value){
    return Carbon::parse($value)->format('n/j/Y');
  }
  public function getDefaultRoleAttribute(){
    $roles = $this->roles['list']; $default = $this->roles['default'];
    if (count($roles) == 1) return $roles[0];
    else if ($default) return $default;
    else return false;
  }
  public function getNameAttribute(){
    return $this->preferred_name." ".$this->last_name;
  }
  public function getPreferredNameAttribute($value){
    return $value ? $value : $this->first_name;
  }
  public function getFullNameAttribute(){
    $name = $this->preferred_name;
    if ($this->middle_name) $name .= ' '.$this->middle_name;
    $name .= ' '.$this->last_name;
    return $name;
  }
  public function getLegalNameAttribute(){
    return $this->first_name." ".$this->middle_name." ".$this->last_name;
  }
  public function getIsSuperuserAttribute(){
    $supers = ['david@bodywizardmedicine.com'];
    return in_array($this->email, $supers);
  }
  public function getUserTypeAttribute(){
    return session('usertype');
  }
  public function getIsAdminAttribute(){
    return true;
  }
  public function patient(){
    return $this->hasOne('App\Patient');
  }
  public function practitioner(){
    return $this->hasOne('App\Practitioner');
  }
  public function staffMember(){
    return $this->hasOne('App\StaffMember');
  }
}
