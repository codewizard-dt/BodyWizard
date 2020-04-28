<?php

namespace App;

use App\Traits\TrackChanges;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Model;
use App\Traits\Encryptable;

class Invoice extends Model
{
    use TrackChanges;
    use Encryptable;

    protected $casts = [
        'status' => 'array',
        'settled_at' => 'datetime',
        'updated_at' => 'datetime',
        'created_at' => 'datetime'
    ];
    protected $hidden = ['autosave'];

    public function __construct($attributes = []){
        parent::__construct($attributes);
    }
    public static function tableValues(){
        $usertype = Auth::user()->user_type;
        $commonArr = [
            'tableId' => 'InvoiceList',
            'index' => 'id'
        ];
        if ($usertype == 'practitioner'){
            $arr = [
                        'columns' => 
                        [
                            ["label" => 'Invoicee',
                            "className" => 'name',
                            "attribute" => 'invoicee_name'],
                            ["label" => 'Created',
                            "className" => 'date',
                            "attribute" => 'created_at'],
                            ["label" => 'Total',
                            "className" => 'total',
                            "attribute" => 'total_charge_formatted'],
                            ["label" => 'Status',
                            "className" => 'status',
                            "attribute" => 'status'],
                        ],
                        'hideOrder' => "date,status",
                        'filtersColumn' => [],
                        'filtersOther' => [],
                        'optionsNavValues' => [
                            'destinations' => ["details"],
                            'btnText' => ["details"]
                        ],
                        'orderBy' => [
                            ['updated_at',"desc"],
                        ]
            ];
        }elseif ($usertype == 'patient'){
            $arr = 
            [
                'columns' => 
                [
                    // ["label" => 'Form Name',
                    // "className" => 'name',
                    // "attribute" => 'form_name'],
                    // ["label" => 'Submitted',
                    // "className" => 'submitted',
                    // "attribute" => 'last_submitted'],
                    // ["label" => 'Status',
                    // "className" => 'status',
                    // "attribute" => 'status']
                ],
                'hideOrder' => "",
                'filtersColumn' => [],
                'filtersOther' => [
                ],
                'optionsNavValues' => [
                    'destinations' => ['loadForm'],
                    'btnText' => ['open form']
                ],
                'orderBy' => [
                    ['form_name',"asc"]
                ]
            ];

        }
        return array_merge($commonArr,$arr);
    }
    public function navOptions(){
        $dataAttrs = [
            [
                'key' => 'status',
                'value' => $this->status
            ],
        ];
        $extraClasses = "";
        $buttons = ($this->status == 'settled') ? [
            [
                'text' => 'view',
                'destination' => 'view'
            ],
            [
                'text' => 'email',
                'destination' => 'email'
            ],
            [
                'text' => 'notes',
                'destination' => 'addNote'
            ],
        ] : [
            [
                'text' => 'edit',
                'destination' => 'edit'
            ],
            [
                'text' => 'notes',
                'destination' => 'addNote'
            ],
        ];
        $data = [
                    'dataAttrs' => $dataAttrs,
                    'extraClasses' => $extraClasses,
                    'buttons' => $buttons,
                    'instance' => $this,
                    'model' => getModel($this)
                ];
        return $data;
    }
    public function modelDetails(){
        $isSettled = ($this->status == 'settled');
        return [
            'Status' => $this->status.checkOrX($isSettled),
            'Appointment' => $this->appointment->detailClick(),
            'Pinned Notes' => $this->notes ?: 'none',
            'Total Charge' => $this->total_charge_formatted,
        ];
    }

    public function invoicee(){
        return $this->belongsTo('App\User','invoiced_to_user_id');
    }
    public function appointment(){
        return $this->belongsTo('App\Appointment','appointment_id');
    }
    public function getNameAttribute(){
        return $this->invoicee->name.' '.$this->created_at;
    }
    public function getInvoiceeNameAttribute(){
        return $this->invoicee->name;
    }
    public function getTotalChargeFormattedAttribute(){
        $practice = Practice::getFromSession();
        $currency = $practice->currency;
        return $currency['symbol'].number_format($this->total_charge,2);
    }
    public function getCreatedAtAttribute($value){
        $date = new Carbon($value);
        return $date->format('n/j g:ia');
    }
    public function getSettledAtAttribute($value){
        $date = $value ? new Carbon($value) : null;
        return $date ? $date->format('n/j g:ia') : 'pending';
    }
    public function getStatusAttribute(){
        return ($this->settled_at == 'pending') ? 'pending' : 'settled';
    }
    // public function getCurrentStatusAttribute(){
        
    // }
    public function getLineItemsAttribute($value){
        return $this->decryptKMS($value);
    }
    public function setLineItemsAttribute($value){
        $this->attributes['line_items'] = $this->encryptKms($value);
    }
    public function getPaymentsAttribute($value){
        return $this->decryptKMS($value);
    }
    public function setPaymentsAttribute($value){
        $this->attributes['payments'] = $this->encryptKms($value);
    }
    public function getNotesAttribute($value){
        return $this->decryptKMS($value);
    }
    public function setNotesAttribute($value){
        $this->attributes['notes'] = $this->encryptKms($value);
    }
    public function getAutosaveAttribute($value){
        return $this->decryptKMS($value);
    }
    public function setAutosaveAttribute($value){
        $this->attributes['autosave'] = $this->encryptKms($value);
    }


}
