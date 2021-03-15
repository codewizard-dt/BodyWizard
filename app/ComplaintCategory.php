<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use App\Traits\TableAccess;
use App\Traits\HasSettings;

class ComplaintCategory extends Model
{
  use TableAccess;
  use HasSettings;

	protected $guarded = [];

  static public function TableOptions() {
    return [
      'index' => 'id',
      'columns' => [
        'Name' => 'name',
        'Description' => 'description',
      ],
      'hideOrder' => [],
      'filters' => [],
      'extraBtns' => [
        'back to complaints' => '/Complaint/index'
      ],
      'extraData' => [],      
    ];    
  }
  static public function DefaultCollection() {
    return ComplaintCategory::orderBy('name');
  }
  public function table_nav_options(){
    return [];
  }
  public function modelDetails(){
    return [
      'Category Name' => $this->name,
      'Description' => $this->description,
    ];
  }
  public function detailClick(){
    $model = getModel($this);
    $uid = $this->getKey();
    return "<div class='link $model' data-model='$model' data-uid='$uid'>" . $this->name . "</div>";
  }
 	public function complaints() {
 		return $this->belongsTo('App\ComplaintCategory');
 	}
}
