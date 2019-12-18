<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;


class Submission extends Model
{
    //
    public $tableValues;
    public $optionsNavValues;
    // public $nameAttr;
    public $connectedModels;
    // public $auditOptions;

    public function __construct($attributes = []){
        parent::__construct($attributes);

        // $this->auditOptions = [
        //     'audit_table' => 'users_audit',
        //     'includeFullJson' => false
        // ];
        // $this->nameAttr = 'preferred_name!!%preferred_name% %last_name%!!%first_name% %last_name%';
        // $this->tableValues = array(
        //     'tableId' => 'SubmisisonList',
        //     'index' => 'id',
        //     'columns' => [
        //                 [
        //                     "label" => 'Form',
        //                     "className" => 'name',
        //                     "attribute" => 'name'
        //                 ],
        //                 [
        //                     "label" => 'Submitted At',
        //                     "className" => 'submitted',
        //                     "attribute" => 'created_at'
        //                 ],
        //                 [
        //                     'label' => 'Submitted By',
        //                     'className' => 'userType',
        //                     'attribute' => 'user_type'
        //                 ],
        //                 [
        //                     "label" => 'Email',
        //                     "className" => 'email',
        //                     "attribute" => 'email'
        //                 ]
        //     ],
        //     'hideOrder' => "email",
        //     'filtersColumn' => array(),
        //     'filtersOther' => array(),
        //     'destinations' => array("settings","edit","delete","create"),
        //     'btnText' => array("settings","edit","delete","add new patient"),
        //     'orderBy' => [
        //         ['last_name',"asc"],
        //         ['first_name',"asc"]
        //     ]
        // );
        // $this->optionsNavValues = array(
        //     'destinations' => array("settings","edit","delete"),
        //     'btnText' => array("settings","edit","delete"),
        // );
        $this->connectedModels = [  
            // ['Service','many','morphToMany']
        ];
    }
    static function tableValues(){
        include_once app_path("php/functions.php");

        $usertype = \Auth::user()->user_type;
        $commonArr = [
            'tableId' => 'SubmisisonList',
            'index' => 'id',
            'orderBy' => [
                ['created_at','desc']
            ]
        ];
        if ($usertype == 'practitioner'){
            $arr = [
                        'columns' => 
                        [
                            ["label" => 'Patient',
                            "className" => 'patient',
                            "attribute" =>  'patient->name'],
                            ["label" => 'Form',
                            "className" => 'formName',
                            "attribute" => 'form->form_name'],
                            ["label" => 'Completed At',
                            "className" => 'submitted',
                            "attribute" => 'created_at']
                        ],
                        'hideOrder' => "",
                        'filtersColumn' => [],
                        'filtersOther' => [],
                        'optionsNavValues' => [
                            'destinations' => ["loadSubmission"],
                            'btnText' => ["view"]
                        ]
            ];
        }elseif ($usertype == 'patient'){
            $arr = [
                        'columns' => 
                        [
                            ["label" => 'Name of Form',
                            "className" => 'formName',
                            "attribute" => 'name'],                            
                            ["label" => 'Submitted At',
                            "className" => 'submitted',
                            "attribute" => 'created_at']
                        ],
                        'hideOrder' => "",
                        'filtersColumn' => [],
                        'filtersOther' => [],
                        'optionsNavValues' => [
                            'destinations' => ['loadSubmission'],
                            'btnText' => ['view']
                        ]
            ];
        }
        return array_merge($commonArr,$arr);
    }

    public function getNameAttribute(){
    	return "{$this->form->form_name} ({$this->patient->name}, {$this->created_at->format("M j")})";
    }
    public function setResponsesAttribute($value){
        $kms = app("GoogleKMS");
        $practiceId = session('practiceId');
        $cryptoKey = config("practices.$practiceId.app.cryptoKey");
        $encryptResponse = $kms->encrypt($cryptoKey,json_encode($value));
        // Log::info($encryptResponse->getCiphertext());
    	$this->attributes['responses'] = utf8_encode($encryptResponse->getCiphertext());
    }
    public function getResponsesAttribute($value){
        $kms = app("GoogleKMS");
        $practiceId = session('practiceId');
        $cryptoKey = config("practices.$practiceId.app.cryptoKey");
		$decryptResponse = $kms->decrypt($cryptoKey,utf8_decode($value));
		return json_decode($decryptResponse->getPlaintext(),true);
    }
    public function moreOptions(){
        Log::info("optionsNav");
    }
    public function patient(){
        return $this->belongsTo('App\Patient', 'patient_id');
    }
    public function form(){
    	return $this->belongsTo('App\Form', 'form_uid');
    }

}
