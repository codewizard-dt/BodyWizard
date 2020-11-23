<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\HasSettings;


class ServiceCategory extends Model
{

  use HasSettings;

  protected $guarded = [];
  protected $visible = ['name','description'];

  static public function TableOptions() {
    $filters = [];
    // set($filters, 'phone.input', new_input(
    //   'checkboxes',
    //   ['list', 'preLabel'], 
    //   [['512','213'], 'Area Code:']
    // ), 'phone.attribute', 'phone');
    return [
      'tableId' => 'ServiceCategoryList',
      'index' => 'id',
      'model' => "ServiceCategory",
      'columns' => [
        'Category' => 'name',
        'Description' => 'description',
      ],
      'hideOrder' => [],
      'filters' => $filters,
      'extraBtns' => [
        'back to services' => '/Service/index'
      ],
    ];
  }
  static public function DefaultCollection() {
    return ServiceCategory::orderBy('settings->display->order')->orderBy('name');
  }

  public function services(){
    return $this->hasMany('App\Service');
  }
}
