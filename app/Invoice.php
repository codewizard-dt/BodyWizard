<?php

namespace App;

use App\Traits\TrackChanges;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Encryptable;
use App\Traits\TableAccess;

class Invoice extends Model
{
    use TableAccess;
    use TrackChanges;
    use Encryptable;

    protected $casts = [
        'status' => 'array',
        'settled_at' => 'datetime',
        'updated_at' => 'datetime',
        'created_at' => 'datetime',
    ];
    protected $hidden = ['autosave'];
    protected $fillable = ['invoiced_to_user_id', 'created_by_user_id', 'appointment_id', 'notes', 'autosave', 'total_charge', 'settled_at'];

    public function invoicee()
    {
        return $this->belongsTo('App\User', 'invoiced_to_user_id');
    }
    public function appointment()
    {
        return $this->belongsTo('App\Appointment', 'appointment_id');
    }
    public function getNameAttribute()
    {
        return $this->invoicee->name . ' ' . $this->created_at;
    }
    public function getInvoiceeNameAttribute()
    {
        return $this->invoicee->name;
    }
    public function getTotalChargeFormattedAttribute()
    {
        $practice = Practice::getFromSession();
        $currency = $practice->currency;
        return $currency['symbol'] . number_format($this->total_charge, 2);
    }
    public function getCreatedAtAttribute($value)
    {
        $date = new Carbon($value);
        return $date->format('n/j g:ia');
    }
    public function getSettledAtAttribute($value)
    {
        $date = $value ? new Carbon($value) : null;
        return $date ? $date->format('n/j g:ia') : 'pending';
    }
    public function getStatusAttribute()
    {
        return ($this->settled_at == 'pending') ? 'pending' : 'settled';
    }
    // public function getCurrentStatusAttribute(){

    // }
    public function getLineItemsAttribute($value)
    {
        return $this->decryptKMS($value);
    }
    public function setLineItemsAttribute($value)
    {
        $this->attributes['line_items'] = $this->encryptKms($value);
    }
    public function getPaymentsAttribute($value)
    {
        return $this->decryptKMS($value);
    }
    public function setPaymentsAttribute($value)
    {
        $this->attributes['payments'] = $this->encryptKms($value);
    }
    public function getNotesAttribute($value)
    {
        return $this->decryptKMS($value);
    }
    public function setNotesAttribute($value)
    {
        $this->attributes['notes'] = $this->encryptKms($value);
    }
    public function getAutosaveAttribute($value)
    {
        return $this->decryptKMS($value);
    }
    public function setAutosaveAttribute($value)
    {
        $this->attributes['autosave'] = $this->encryptKms($value);
    }

}
