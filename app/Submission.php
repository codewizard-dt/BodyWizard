<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;
use App\Traits\Encryptable;


class Submission extends Model
{
    use Encryptable;
    //
    public $tableValues;
    public $optionsNavValues;
    public $connectedModels;

    protected $with = ['form'];

    public function __construct($attributes = []){
        parent::__construct($attributes);

        $this->connectedModels = [  
        ];
    }
    static function tableValues(){
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
                            ["label" => 'Completed',
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
                            ["label" => 'Submitted',
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
    public function detailClick(){
        $model = getModel($this);
        $uid = $this->getKey();
        return "<span class='link' data-model='$model' data-uid='$uid'>" . $this->form_name . "</span>";
    }

    public function getNameAttribute(){
    	return "{$this->form->form_name} ({$this->patient->name}, {$this->created_at->format("M j")})";
    }
    public function setResponsesAttribute($value){
        $this->attributes['responses'] = $this->encryptKms($value);
    }
    public function getResponsesAttribute($value){
        return $this->decryptKms($value);
    }
    public function setAutosaveAttribute($value){
        $this->attributes['autosave'] = $this->encryptKms($value);
    }
    public function getAutosaveAttribute($value){
        return $this->decryptKms($value);
    }
    public function getSubmittedAtAttribute(){
        $created = Carbon::parse($this->created_at);
        return $created->format('g:ia \o\n n/j/y');
    }
    public function moreOptions(){
        $options = [
            'Submitted' => $this->created_at->format('g:ia \o\n n/j/Y'),
            'Related Appointment' => ($this->appointment) ? $this->appointment->name : 'none',
        ];
        echo '<div class="split3366KeyValues">';
        foreach($options as $attr => $val){
            if (is_array($val)){
                echo "<div class='label'>$attr</div><div class='value little'>";
                foreach ($val as $k => $v){
                    echo "<h4>$k</h4>";
                    if (is_string($v)){echo "<div>$v</div>";}else{var_dump($v);}
                }
                echo "</div>";                
            }else{echo "<div class='label'>$attr</div><div class='value'>$val</div>";}
        }
        echo "</div>";
    }
    public function patient(){
        return $this->belongsTo('App\Patient', 'patient_id');
    }
    public function form(){
        return $this->belongsTo('App\Form', 'form_uid');
    }
    public function appointment(){
        return $this->belongsTo('App\Appointment', 'appointment_id');
    }
    public function chartNotes(){
        return $this->morphedByMany('App\ChartNote','submissionable');
    }

}
