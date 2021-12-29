<?php

namespace App;


use Illuminate\Database\Eloquent\Model;
use App\Traits\TableAccess;
// use App\Traits\HasCategory;
use App\Traits\HasSettings;

class AcuStyle extends Model
{
  use TableAccess;
  // use HasCategory;
  use HasSettings;

  protected $connection = 'practices';
	protected $guarded = [];
  // protected $with = ['Category'];

  static public $display_name = 'Acupuncture Style';
  static public $instance_actions = [];
  static public $static_actions = [];

  static public function table() {
    $columns = [
      'Description' => 'description',
    ];
    $filters = [];
    $buttons = [];
    $data = [];
    return compact('columns', 'filters', 'buttons', 'data');
  }
  public function details() {
    $instance = [
      'Category' => $this->category_name,
      'Description' => $this->description,
    ];
    return $instance;
  }
}
