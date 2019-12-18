<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Code extends Model
{
    // protected $fillable = [
    //     'code','code_type','icd_version','code_description','service_id','diagnosis_id'
    // ];
    // protected $primaryKey = 'code_id';


    public $tableValues;
    public $optionsNavValues;

    public function __construct(){
	    $this->tableValues = array(
	    	'tableId' => 'CodeList',
	    	'index' => 'id',
            'model' => "Code",
	    	'columns' => array(
                        array(
                            "label" => 'Code',
                            "className" => 'name',
                            "attribute" => 'name'
                        ),
                        array(
                            "label" => 'Code Type',
                            "className" => 'type',
                            "attribute" => 'code_type'
                        ),
                        array(
                            "label" => 'Description',
                            "className" => 'description',
                            "attribute" => 'code_description'
                        ),
                        array(
                            "label" => 'Keywords',
                            "className" => 'keywords',
                            "attribute" => 'key_words'
                        )
            ),
	    	'hideOrder' => "type,description",
            'filtersColumn' => array(
                            array(
                                "label" => 'Code Type',
                                "filterName" => 'type',
                                "attribute" => 'code_type',
                                "markOptions" => null,
                                "filterOptions" => array(
                                    array("label" => 'CPT',"value" => 'CPT'),
                                    array("label" => 'ICD',"value" => 'ICD')
                                )
                            )
                        ),
            'filtersOther' => array(
                            array(
                                "label" => 'ICD Version',
                                "filterName" => 'icdVersion',
                                "attribute" => 'icd_version',
                                "markOptions" => null,
                                "filterOptions" => array(
                                    array("label" => 'ICD9',"value" => 'ICD9'),
                                    array("label" => 'ICD10',"value" => 'ICD10'),
                                    array("label" => 'ICD11',"value" => 'ICD11')
                                )
                            )
                        ),
            'orderBy' => array(
                ['name','asc']
            ),
            'destinations' => array(
                'codes-edit','codes-delete','codes-create'
            ),
            'btnText' => array(
                'edit','delete','create new code'
            )
	    );

	    $this->optionsNavValues = array(
            'destinations' => array("edit","delete","create"),
            'btnText' => array("edit","delete","create new code")
        );
    }

    public function services(){
        return $this->morphedByMany('App\Service','codeable');
    }
    public function diagnoses(){
        return $this->morphedByMany('App\Diagnosis','codeable');
    }
    public function moreOptions(){

    }
}
