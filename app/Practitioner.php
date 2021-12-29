<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\IsUser;
use App\Traits\TrackChanges;
use App\Traits\TableAccess;
use App\Traits\HasSettings;


class Practitioner extends Model
{
  use IsUser;
  use TrackChanges;
  use TableAccess;
  use HasSettings;

  protected $casts = [
    'schedule' => 'array'
  ];
  protected $guarded = [];
  protected $visible = ['id','user_id','roles'];
  protected $with = ['User'];

  static public $instance_actions = [];
  static public $static_actions = [];

  static public function table() {
    $columns = [
      'Name' => 'name',
      'Phone' => 'phone',
      'Email' => 'email',      
    ];
    $filters = [];
    $buttons = [];
    $data = [];
    return compact('columns','filters','buttons','data');
  }
  public function details() {
    $instance = [
      // 'Category' => $this->category_name,
      // 'Description' => $this->description,
    ];
    return $instance;
  }



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
  
  public function moreOptions(){

  }
}
