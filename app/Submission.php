<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use App\Traits\Encryptable;
use App\Traits\TableAccess;

class Submission extends Model
{
    // use Encryptable;
    //
    // public $TableOptions;
    // public $optionsNavValues;
    // public $connectedModels;
    use TableAccess;

    protected $guarded = [];
    protected $casts = [
        'autosave' => 'array',
        'responses' => 'array',
        'submitted_at' => 'datetime',
    ];

    public function getNameAttribute()
    {
        return "{$this->form->form_name} ({$this->patient->name}, {$this->created_at->format("M j")})";
    }
    public function getSubmittedAtAttribute($value)
    {
        $date = $value ? new Carbon($value) : null;
        return $date ? $date->format('n/j/y g:ia') : null;
    }

    public function details()
    {
        return [];
    }

    public function patient()
    {
        return $this->belongsTo('App\Patient');
    }
    public function form()
    {
        return $this->belongsTo('App\Form');
    }
    public function appointment()
    {
        return $this->belongsTo('App\Appointment');
    }
    public function chartNote()
    {
        return $this->belongsTo('App\ChartNote');
    }

}
