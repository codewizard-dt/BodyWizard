<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\ServiceCategory;
use App\Form;
use App\Traits\TableAccess;
use App\Traits\HasSettings;
use App\Traits\HasCategory;

class Service extends Model
{
  use TableAccess;
  use HasSettings;
  use HasCategory;

  protected $casts = [
    'settings' => 'array',
  ];
  protected $visible = ['name','description_calendar','description_admin','settings','service_category_id','duration','price'];
  protected $guarded = [];
  protected $with = ['Category'];

  static public $instance_actions = [];
  static public $static_actions = [];
  static public $list_cols = ['duration','price'];
  static public function table() {
    $columns = [
      'Description' => 'description_admin',
    ];
    $filters = [];
    $buttons = [];
    $data = [];
    return compact('columns', 'filters', 'buttons', 'data');
  }
  public function details() {
    $instance = [
      'Category' => $this->category_name,
      'Description - Calendar' => $this->description_calendar,
      'Description - Admin' => $this->description_admin,
      'Duration' => $this->display_duration,
      'Price' => $this->display_price,
    ];
    $buttons = [];
    return compact('instance','buttons');
  }

  public function getDisplayPriceAttribute(){
    $practice = Practice::getFromSession();
    return $practice->currency['symbol'].$this->price;
  }
  public function getDisplayDurationAttribute(){
    return $this->duration . ' minutes';
  }
  public function getChartFormsAttribute(){
    $ids = $this->get_setting('Default Forms.AutoloadedChartForms');
    return Form::find($ids);
  }

  public function codes(){
    return $this->morphToMany('App\Code', 'codeable');
  }
  // public function category(){
  //   return $this->belongsTo('App\ServiceCategory','service_category_id');
  // }
  public function forms(){
    return $this->morphToMany('App\Form','formable','formables',null,'form_id');
  }
}
