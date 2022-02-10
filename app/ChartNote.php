<?php

namespace App;

use App\Traits\TrackChanges;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Encryptable;
use App\Traits\HasManyJson;
use App\Traits\TableAccess;
// use App\AppModel;

class ChartNote extends Model
{
    use TableAccess;
    use TrackChanges;
    use Encryptable;
    use HasManyJson;

    protected $casts = [
        'signature' => 'array',
        // 'signed_at' => 'datetime',
        'date_time_start' => 'datetime',
        'date_time_end' => 'datetime',
        // 'icd_codes' => 'array',
        // 'cpt_codes' => 'array',
    ];
    protected $with = ['appointment.services', 'patient'];
    // protected $fillable = ['patient_id', 'practitioner_id', 'appointment_id', 'notes', 'signature', 'signed_at', 'date_time_start', 'date_time_end'];
    protected $appends = ['name'];
    protected $guarded = [];
    protected $hidden = ['autosave'];

    public function details()
    {
        return [

        ];
    }

    public function getNameAttribute()
    {
        return $this->patient_name . " - " . $this->date_time_start->format(MONTH_DAY_TIME);
    }
    public function getPatientNameAttribute()
    {
        return $this->patient->name;
    }
    public function getPatientSubmissionsAttribute()
    {
        $submissions = $this->submissions()->where('submitted_by', 'patient')->get();
        return ($submissions->count() != 0) ? $submissions : null;
    }
    public function getAppointmentDateAttribute()
    {
        return $this->appointment->date;
    }
    public function getAppointmentNameAttribute()
    {
        return $this->appointment->name;
    }
    // public function getSignedAtAttribute($value)
    // {
    //     $date = $value ? new Carbon($value) : null;
    //     return $date ? $date->format('n/j/y g:ia') : null;
    // }
    // public function getSignedOnAttribute()
    // {
    //     $signedAt = $this->signed_at;
    //     $date = ($signedAt != 'not signed') ? explode(' ', $signedAt)[0] : 'not signed';
    //     return $date;
    // }

    public function patient()
    {
        return $this->belongsTo('App\Patient', 'patient_id');
    }
    public function practitioner()
    {
        return $this->belongsTo('App\Practitioner', 'practitioner_id');
    }
    public function appointment()
    {
        return $this->belongsTo('App\Appointment', 'appointment_id');
    }
    public function forms()
    {
        // return $this->morphToMany('App\Form', 'formable');

        return $this->hasManyJson('App\Form', 'id', 'forms');
    }
    public function submissions()
    {
        return $this->hasMany('App\Submission');
    }
    public function complaints()
    {
        return $this->morphToMany('App\Complaint', 'complaintable');
    }
    public function icdCodes()
    {
        // return $this->morphToMany('App\IcdCode', 'icd_codeable');
        return $this->hasManyJson('App\IcdCode', 'id', 'icd_codes');
    }
    // public function getIcdCodesAttribute($value)
    // {
    //     return $this->icdCodes()->getResults();
    // }
    public function cptCodes()
    {
        // return $this->morphToMany('App\CptCode', 'cpt_codeable');
        return $this->hasManyJson('App\CptCode', 'id', 'cpt_codes');
    }
}
