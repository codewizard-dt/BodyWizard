<?php

namespace App;

use App\Traits\TableAccess;
use Illuminate\Database\Eloquent\Model;

class CptCode extends Model
{
    use TableAccess;
    protected $guarded = [];
    //
    public function getNameAttribute()
    {
        // $text = $this->text === null ? $this->title : $this->text;
        return $this->code . ' - ' . $this->title;
    }
}
