<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\TrackChanges;


class Practitioner extends Model
{
  use TrackChanges;

  public $TableOptions;
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

  public static function TableOptions(){
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
  public function table_nav_options() {
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
