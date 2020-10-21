<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\TrackChanges;
use Illuminate\Database\Eloquent\SoftDeletes;


class Practitioner extends Model
{
  use TrackChanges;
  use SoftDeletes;

  public $tableValues;
  public $optionsNavValues;
  public $connectedModels;
  public $auditOptions;
  public $nameAttr;

  protected $casts = [
    'schedule' => 'array'
  ];
  protected $guarded = [];
  protected $visible = ['id','user_id','name','email','username','date_of_birth','roles'];
  protected $appends = ['name'];

  public function __construct($attributes = []){
    parent::__construct($attributes);
    $this->auditOptions = [
      'audit_table' => 'practitioners_audit',
      'includeFullJson' => false
    ];
    $this->connectedModels = array(
    );
  }

  public static function tableValues(){
    $filters = [];
    set($filters, 'phone.input', new_input(
      'checkboxes',
      ['list', 'preLabel'], 
      [['512','213'], 'Area Code:']
    ), 'phone.attribute', 'phone');
    return [
      'tableId' => 'PractitionerList',
      'index' => 'id',
      'model' => "Practitioner",
      'columns' => [
        'Name' => 'name',
        'Phone' => 'phone',
      ],
      'hideOrder' => [],
      'filters' => $filters,
      'extraBtns' => [],
    ];
  }
  public function nav_options() {
    $data = [];
    $data['buttons'] = [
      'schedule' => 'schedule_edit'
    ];
    return $data;
  }
  // public function navOptions(){
  //   return 'nav options';
  // }
  public function modelDetails(){
    return [
      'name' => $this->name,
      'email' => $this->email,
      'roles' => '<div>'.implodeAnd($this->roles['list']).'</div><div class="navOption" data-action="roles_edit">(add/remove)</div>',
    ];
  }
  public function detailClick(){
    return 'detail click';
  }

  public function user(){
    return $this->belongsTo('App\User','user_id');
  }
  public function __get($key) {
    if ($this->getAttribute($key)) return $this->getAttribute($key); 
    else if ($this->user->getAttribute($key)) return $this->user->getAttribute($key);
    else return null;
  }
  public function getNameAttribute(){
    return $this->user->name;
  }

  
  public function moreOptions(){

  }
}
