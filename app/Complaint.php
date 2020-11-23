<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    //
	protected $guarded = [];
  protected $with = ['Category'];

	static public function displayName() { return 'Chief Complaint'; }
	static public function TableOptions() {
    $filters = [];
    set($filters, 'category.input', new_input(
      'checkboxes',
      ['preLabel','linked_to'], 
      ['Category Filter:','ComplaintCategory']
    ), 'category.attribute', 'complaint_category_id');
    
    return [
      'columns' => [
        'Name' => 'name',
        'Category' => 'category_name',
        'Description' => 'description',
      ],
      'hideOrder' => ['Email','Phone','Last Seen'],
      'filters' => $filters,
      'extraBtns' => [
          'manage categories' => '/ComplaintCategory/index'
      ],
      'extraData' => [],
    ];
	}
  static public function DefaultCollection() {
    $complaints = Complaint::addSelect(['category_order' => ComplaintCategory::select('settings->display->order')->whereColumn('id','complaints.complaint_category_id')->limit(1)])
      ->addSelect(['category_name' => ComplaintCategory::select('name')->whereColumn('id','complaints.complaint_category_id')->limit(1)])
      ->orderBy('category_order')->orderBy('category_name')->orderBy('settings->display->order')->orderBy('name');
    return $complaints;
  }

  public function table_nav_options(){
    return [];
  }
  public function modelDetails(){
    return [
      'Complaint' => $this->name,
      'Category' => $this->category->name,
      'Description' => $this->description,
      'Applicable ICD Codes' => $this->icd_code_names,
    ];
  }
  public function detailClick(){
    $model = getModel($this);
    $uid = $this->getKey();
    return "<div class='link $model' data-model='$model' data-uid='$uid'>" . $this->name . "</div>";
  }
  public function getIcdCodeNamesAttribute () {
    $icd_codes = $this->icd_codes;
    return $icd_codes->count() ? $icd_codes->map(function($code){ return $code->name; })->join("<br>") : 'none listed';    
  }
  public function getCategoryNameAttribute () {
    return $this->category->name;
  }
 	public function category() {
 		return $this->belongsTo('App\ComplaintCategory','complaint_category_id');
 	}
  public function icd_codes() {
    return $this->morphToMany('\App\IcdCode','icd_codeable');
  }
}
