<?php

namespace App\Traits;

trait UpdateLinkedForms
{
  public static function bootUpdateLinkedForms() {
    static::saving(function($model){
    	$class = getModel($model);
    	
    });
  }

}
