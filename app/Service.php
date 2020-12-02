<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\ServiceCategory;
use App\Traits\HasSettings;

class Service extends Model
{
  use HasSettings;

  protected $casts = [
    'is_addon' => 'boolean',
    'addon_only' => 'boolean',
    'addon_services' => 'array',
    'new_patients_ok' => 'boolean',
    'new_patients_only' => 'boolean'
  ];
  protected $visible = ['name','description_calendar','description_admin','service_category_id','duration','price'];
  // protected $visible = ['name','settings','category_id'];
  protected $guarded = [];

  public static function TableOptions(){
    return [
      'tableId' => 'ServiceList',
      'index' => 'id',
      'nameColumn' => 'Service Name',
      'model' => "Service",
      'columns' => [
        'Service Name' => 'name',
        'Category' => 'category',
        'Duration' => 'duration',
        'Price' => 'display_price',
      ],
      'hideOrder' => ['Price','Category','Duration'],
      'filters' => [],
      'extraBtns' => [
        'manage categories' => '/ServiceCategory/index'
      ],
    ];
  }
  public static function DefaultCollection() {
    $services = Service::addSelect(['category_order' => ServiceCategory::select('settings->display->order')->whereColumn('id','services.service_category_id')->limit(1)])
      ->orderBy('category_order')->orderBy('settings->display->order');
    return $services;
  }
  public static function BasicListAdditions() { return ['duration','price','settings']; }
  public function modelDetails(){
    return [
      'Service Name' => $this->name,
      'Category' => $this->category,
      'Description' => $this->description_calendar,
      'Duration' => $this->duration . ' minutes',
      'Price' => Practice::getFromSession()->currency['symbol'].$this->price,
    ];
  }
  public function detailClick(){
    return 'nothing';
  }
  public function getCategoryAttribute(){
    return $this->servicecategory? $this->servicecategory->name : 'none';
  }
  public function getDisplayPriceAttribute(){
    $practice = Practice::getFromSession();
    return $practice->currency['symbol'].$this->price;
  }

  public function codes(){
    return $this->morphToMany('App\Code', 'codeable');
  }
  public function servicecategory(){
    return $this->belongsTo('App\ServiceCategory','service_category_id');
  }
  public function forms(){
    return $this->morphToMany('App\Form','formable','formables',null,'form_id');
  }
}
