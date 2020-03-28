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
        'notes' => 'array',
        'payments' => 'array',
        'line_items' => 'array',
        'paid_at' => 'datetime',
        'updated_at' => 'datetime',
        'created_at' => 'datetime'
    ];
    protected $hidden = ['autosave'];
    public $auditOptions;


    public function __construct($attributes = []){
        parent::__construct($attributes);
        $this->auditOptions = [
            'audit_table' => 'invoices_audit',
            'includeFullJson' => false
        ];
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
                            ["label" => 'Invoice',
                            "className" => 'name',
                            "attribute" => 'name'],
                            ["label" => 'Date',
                            "className" => 'date',
                            "attribute" => 'date'],
                            ["label" => 'Total',
                            "className" => 'total',
                            "attribute" => 'amount'],
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
    public static function moreOptions(){

    }
    public function invoicee(){
        return $this->belongsTo('App\User','invoiced_to_user_id');
    }
    public function appointment(){
        return $this->hasOne('App\Appointment');
    }
    public function getNameAttribute(){
        return $this->invoicee->name.' '.$this->created_at;
    }
    public function getCreatedAtAttribute($value){
        $date = new Carbon($value);
        return $date->format('n/j g:ia');
    }    
    public function getPaidAtAttribute($value){
        $date = $value ? new Carbon($value) : null;
        return $date ? $date->format('n/j g:ia') : 'not paid';
    }    
    public function getLineItemsAttribute($value){
        return $this->decryptKMS($value);
    }
    public function setLineItemsAttribute($value){
        $this->attributes['line_items'] = $this->encryptKms($value);
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
