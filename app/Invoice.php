<?php

namespace App;

use App\Traits\TrackChanges;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    public function __construct($attributes = []){
        parent::__construct($attributes);
        $this->auditOptions = [
            'audit_table' => 'patients_audit',
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
                            ["label" => 'Patient',
                            "className" => 'patient',
                            "attribute" => 'patient_name'],
                            ["label" => 'Date',
                            "className" => 'date',
                            "attribute" => 'date'],
                            ["label" => 'Charges',
                            "className" => 'charges',
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
                            // ['version_id',"desc"]
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
}
