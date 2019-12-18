<?php

namespace App;

use App\Image;
use App\Appointment;
use App\Submission;
use App\Patient;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

class Form extends Model
{
    //
    protected $fillable = [
        'form_id','version_id','form_name','questions','settings','has_submissions','full_json','locked','current'
    ];
    protected $primaryKey = 'form_uid';
    
    public $tableValues;
    public $optionsNavValues;
    public $nameAttr;
    public $connectedModels;

    protected $casts = [
        'settings' => 'array',
    ];

    public function __construct(){
        $this->nameAttr = 'form_name';
	    $this->tableValues = array(
	    	'tableId' => 'FormList',
	    	'index' => 'form_id',
	    	'columns' => array(
                        array(
                            "label" => 'Form Name',
                            "className" => 'name',
                            "attribute" => 'form_name'
                        ),
                        array(
                            "label" => 'Version',
                            "className" => 'version',
                            "attribute" => 'version_id'
                        ),
                        array(
                            "label" => 'Created On',
                            "className" => 'created',
                            "attribute" => 'created_at'
                        ),
                        array(
                            "label" => 'Updated On',
                            "className" => 'updated',
                            "attribute" => 'updated_at'
                        )
                    ),
	    	'hideOrder' => "created,updated,version",
	    	'filtersColumn' => array(),
	    	'filtersOther' => array(
                            array(
                                "label" => 'Form Type',
                                "filterName" => 'type',
                                "attribute" => 'form_type',
                                "markOptions" => null,
                                "filterOptions" => array(
                                    array("label" => 'practitioner',"value" => 'practitioner'),
                                    array("label" => 'patient',"value" => 'patient'),
                                    array("label" => 'admin',"value" => 'admin'),
                                    array("label" => 'system',"value" => 'system')
                                )
                            ),
                            [
                                "label" => 'Hide',
                                "filterName" => 'hide',
                                'attribute' => null,
                                'reverseFilter' => true,
                                "markOptions" => null,
                                "filterOptions" => [
                                    [
                                        "label" => 'previous versions',
                                        "value" => 'current:0',
                                        'attribute'=>'current'
                                    ],
                                    ["label" => 'system forms',"value" => 'form_type:system','attribute'=>'form_type'],
                                    ["label" => 'locked forms',"value" => 'locked:1','attribute'=>'locked']
                                ]
                            ]
                        ),
            'destinations' => array("forms-settings","form-preview","forms-edit","forms-delete","forms-create"),
            'btnText' => array("settings","preview","edit","delete","create new form"),
            'orderBy' => [
                ['form_name',"asc"],
                ['version_id',"desc"]
            ]
	    );
        // $this->optionsNavValues = array(
        //     'destinations' => array("settings","form-preview","forms-edit","delete","forms-create"),
        //     'btnText' => array("settings","preview","edit","delete","create new form")
        // );
        $this->connectedModels = [
            ['Service','many','morphToMany']
        ];
    }
    static function tableValues(){
        $usertype = Auth::user()->user_type;
        $commonArr = [
            'tableId' => 'FormList',
            'index' => 'form_id'
        ];
        if ($usertype == 'practitioner'){
            $arr = [
                        'columns' => 
                        [
                            ["label" => 'Form Name',
                            "className" => 'name',
                            "attribute" => 'form_name'],
                            ["label" => 'Version',
                            "className" => 'version',
                            "attribute" => 'version_id'],
                            ["label" => 'Created On',
                            "className" => 'created',
                            "attribute" => 'created_at'],
                            ["label" => 'Updated On',
                            "className" => 'updated',
                            "attribute" => 'updated_at']
                        ],
                        'hideOrder' => "created,updated,version",
                        'filtersColumn' => [],
                        'filtersOther' => [
                            [
                                "label" => 'Form Type',
                                "filterName" => 'type',
                                "attribute" => 'form_type',
                                "markOptions" => null,
                                "filterOptions" => [
                                    ["label" => 'practitioner',"value" => 'practitioner'],
                                    ["label" => 'patient',"value" => 'patient'],
                                    ["label" => 'admin',"value" => 'admin'],
                                    ["label" => 'system',"value" => 'system']
                                ]
                            ],
                            [
                                "label" => 'Hide',
                                "filterName" => 'hide',
                                'attribute' => null,
                                'reverseFilter' => true,
                                "markOptions" => null,
                                "filterOptions" => [
                                    [
                                        "label" => 'previous versions',
                                        "value" => 'current:0',
                                        'attribute'=>'current'
                                    ],
                                    ["label" => 'system forms',"value" => 'form_type:system','attribute'=>'form_type'],
                                    ["label" => 'locked forms',"value" => 'locked:1','attribute'=>'locked']
                                ]
                            ]
                        ],
                        'optionsNavValues' => [
                            'destinations' => ["settings","form-preview","forms-edit","delete","forms-create"],
                            'btnText' => ["settings","preview","edit","delete","create new form"]
                        ],
                        'orderBy' => [
                            ['form_name',"asc"],
                            ['version_id',"desc"]
                        ]
            ];
        }elseif ($usertype == 'patient'){
            $arr = 
            [
                'columns' => 
                [
                    ["label" => 'Form Name',
                    "className" => 'name',
                    "attribute" => 'form_name'],
                    ["label" => 'Submitted',
                    "className" => 'submitted',
                    "attribute" => 'last_submitted'],
                    ["label" => 'Status',
                    "className" => 'status',
                    "attribute" => 'status']
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
    public static function alwaysAvailable(){
        return Form::where([['settings->portal_listing','yes, for all patients'],['current','1'],['hidden','0']])->orderBy('display_order')->get();
    }
    public static function neededByAnyAppointment($patientId = null){
        if (Auth::user()->user_type == 'patient'){
            $patient = Auth::user()->patientInfo;
            $formIds = [];
            $forms = Form::all()->filter(function($form, $f) use ($patient){
                $appts = $patient->appointments->filter(function($appt, $a) use ($patient, $form){
                    $timeCheck = $appt->date_time->isAfter(Carbon::now()->subMonths(1));
                    if (!$timeCheck){return false;} // don't bother if appt over a month ago;
                    foreach($appt->services as $service){
                        if ($service->forms->count() > 0){
                            foreach($service->forms as $reqForm){
                                if ($reqForm->form_id == $form->form_id){
                                    $submission = Submission::where([['patient_id',$patient->id],['form_id',$form->form_id],['appointment_id',$appt->id]])->get();
                                    if ($submission->count() == 0){return true;}
                                }
                            }
                        }
                        return false;
                    }
                });
                // Log::info($appts);
                return ($appts->count() != 0);
            });
            return $forms;
        }elseif (session('uidList') != null && session('uidList')['Patient'] != null){
            Log::info("2");
            // $patientId = session('uidList')['Patient'];
            // $patient = Patient::with(['appointments.services.forms' => function ($query){
            //     $query->where('date_time','>',Carbon::now()->subMonths(1));
            // }])->where('id',$patientId);
            // Log::info(\App\Appointment::where(where('date_time','>',Carbon::now()->subMonths(1))));
            // Log::info($patient->appointments);
        }elseif (!$patientId){
            Log::info('1');
        }
    }
    public static function hasSubmissions($patientId = null){
        if (Auth::user()->user_type == 'patient'){
            $patient = Auth::user()->patientInfo;
            // $patientId = $patient->id;
            $formIds = [];
            $forms = Form::all()->filter(function($form, $f) use ($patient){
                $submissions = $patient->submissions->where('form_id',$form->form_id);
                return ($submissions->count() != 0);
            });
            return $forms;
        }elseif (session('uidList') != null && session('uidList')['Patient'] != null){
            Log::info("2");
            // $patientId = session('uidList')['Patient'];
            // $patient = Patient::with(['appointments.services.forms' => function ($query){
            //     $query->where('date_time','>',Carbon::now()->subMonths(1));
            // }])->where('id',$patientId);
            // Log::info(\App\Appointment::where(where('date_time','>',Carbon::now()->subMonths(1))));
            // Log::info($patient->appointments);
        }elseif (!$patientId){
            Log::info('1');
        }
    }
    public static function defaultSettings(){
        return ["form_type" => "any user type", "admin_only" => "yes, admins only", "portal_listing" => "never"];
    }
    public static function checkApptFormStatus(Appointment $appt, Patient $patient){
        Log::info("Check Appt Form Status");
        $submission = Submission::where([["appointment_id",$appt->id],['patient_id',$patient->id]])->get();
        return ($submission->count() > 0);
    }

    public function getNameAttribute(){
        return $this->form_name;
    }
    public function getLastSubmittedAttribute(){
        $submissions = $this->submissions();

        if (Auth::user()->user_type == "patient"){
            $id = Auth::user()->patientInfo->id;
            $submission = $submissions->get()->filter(function($sub,$s) use($id){
                return $sub->patient_id == $id;
            })->last();
        }elseif(session('uidList') !== null && isset(session('uidList')['Patient'])){
            $id = session('uidList')['Patient'];
            $submission = $submissions->get()->filter(function($sub,$s) use($id){
                return $sub->patient_id == $id;
            })->last();
        }else{
            $submission = $submissions->last();
        }

        if ($submission){
            return $submission->created_at;
        }else{
            return 'never';
        }
    }
    public function getStatusAttribute(){
        $requiredByAppointment = $this->neededByAnyAppointment()->map(function($form,$f){
            return $form->form_id;
        })->toArray();
        $formCheck = in_array($this->form_id, $requiredByAppointment);

        $timeperiod = isset($this->settings['required']) ? $this->settings['required'] : false;

        if ($timeperiod){
            if ($timeperiod == 'never'){
                if (!$formCheck){
                    Log::info('1 '.$this->name);
                    return ($this->last_submitted == 'never') ? 'incomplete' : 'completed';
                }else{
                    $requiredByTime = false;
                }
            }elseif(contains($timeperiod,'registration')){
                if (!$formCheck){
                    Log::info('2 '.$this->name);
                    return ($this->last_submitted == 'never') ? 'required' : 'completed';                    
                }else{
                    $requiredByTime = false;
                }
            }else{
                if (contains($timeperiod,'12 months')){$months = 12;}
                elseif (contains($timeperiod,'6 months')){$months = 6;}
                elseif (contains($timeperiod,'3 months')){$months = 3;}
                elseif (contains($timeperiod,'2 months')){$months = 2;}
                elseif (contains($timeperiod,'every month')){$months = 1;}
                if ($this->last_submitted == 'never'){
                    $requiredByTime = true;
                }else{
                    $requiredByTime = ($this->last_submitted->isBefore(Carbon::now()->subMonths($months)));
                }                
            }
        }else{
            $requiredByTime = false;
        }

        Log::info('3 '.$this->name." time:$requiredByTime appt:$formCheck");
        Log::info($requiredByAppointment);

        return ($requiredByTime || $formCheck) ? "required" : "completed";
    }

    public function lastSubmittedBy(Patient $patient){
        $submissions = $this->submissions();

        $id = $patient->id;
        $submission = $submissions->get()->filter(function($sub,$s) use($id){
            return $sub->patient_id == $id;
        })->last();

        if ($submission){
            return dateOrTimeIfToday($submission->created_at->timestamp);
        }else{
            return 'never';
        }
    }
    public function services(){
        return $this->morphedByMany('App\Service', 'formable', null, 'form_id');
    }
    public function images(){
        return $this->morphToMany('App\Image', 'imageable');
    }
    public function submissions(){
        return $this->hasMany('App\Submission', "form_id", 'form_id');
    }

    public function moreOptions(){
    }



   
    //form functionality
        public function formDisplay($modal = false, $allowSubmit = true){
            $form = json_decode($this->full_json,true);
            // $sections = json_decode($this->questions,true);
            $sections = $form['sections'];            
            $uid = $this->form_uid;
            $formID = $this->form_id;
            $formName = $this->form_name;
            $formNameAbbr = str_replace(" ", "", $formName);
            $settings = $this->settings;
            // var_dump($settings);
            echo '<form id="'.$formNameAbbr.'" data-formname="'.$formNameAbbr.'" data-formid="'.$formID.'" data-uid="'.$uid.'" class="formDisp">';
            for ($x=0;$x<count($sections);$x++){
                $section = $sections[$x];
                $name = $section['sectionName'];
                $items = $section['items'];
                if (isset($section['displayOptions'])){
                    $sectionDisplayOptions = $section['displayOptions'];
                    $optStr = json_encode($section['displayOptions']);
                    $nums = $sectionDisplayOptions['displayNumbers'];
                }else{
                    $nums = 'false';
                    $optStr = "";
                }
                $nums = ($nums == 'true') ? "" : "noNums"; 

                $secSettings = isset($section['settings']) ? $section['settings'] : "";
                if ($secSettings != "" && isset($secSettings['dynamic']) && $secSettings['dynamic'][0] == 'only display to admins'){
                    if (!Auth::check()){
                        $show = false;
                    }elseif(Auth::user()->is_admin){
                        $show = true;
                    }else{
                        $show = false;
                    }
                }else{
                    $show = true;
                }
                $secSettings = json_encode($secSettings);
                if ($show){
                    echo "<div class='section display $nums' data-display='$optStr' data-settings='$secSettings'><h2 class='purple'>$name</h2><div class='requireSign'>* <i>required</i></div>";
                    $n = 0;
                    for ($i=0;$i<count($items);$i++){
                        $item = $items[$i];
                        $question = $item['question'];
                        $type = $item['type'];
                        $key = $item['key'];
                        $options = isset($item['options']) ? $item['options'] : [];
                        // $required = isset($item['required']) ? $item['required'] : true;
                        if ($type == 'narrative'){
                            $required = false;
                        }elseif (isset($item['required'])){
                            $required = $item['required'];
                        }else{
                            $required = true;
                        }
                        $requireStar = $required ? "*" : "";
                        $disp = $item['displayOptions'];
                        $dispStr = json_encode($item['displayOptions']);
                        // $inline = $disp['inline'];
                        $inline = (strpos($disp['inline'],"true") > -1) ? "inline" : "" ;
                        $newline = (strpos($disp['inline'],"BR") > -1) ? true : false;
                        $followups = $item['followups'];
                        // echo "<div class='item $inline' data-display='$dispStr' data-type='$type' data-required='$required' data-key='$key'>";
                        echo "<div class='item $inline' data-display='$dispStr' data-type='$type' data-required='$required' data-key='$i'>";
                        // echo "<div class='item$inline' data-disp='$dispStr' data-type='$type'>";
                        if ($type !== "narrative"){
                            $n++;
                            echo "<div class='question'><p><span class='n'>$n.</span><span class='q'>$question</span><span class='requireSign'>$requireStar</span></p></div><br>";
                        }
                        // include_once app_path("/php/functions.php");
                        $name = removepunctuation(replacespaces(strtolower(cleaninput($question))));
                        if (in_array($type, ['radio','checkboxes','dropdown'])){
                            array_push($options,"ID*".$name);
                        }else{
                            $options['name'] = $name;
                        }
                        $this->answerDisp($type,$options);
                        if (count($followups)>0){
                            echo "<div class='itemFUList' data-condition='title'>";
                                for ($f=0;$f<count($followups);$f++){
                                    $itemFU = $followups[$f];
                                    $question = $itemFU['question'];
                                    $FUkey = $itemFU['key'];
                                    $type = $itemFU['type'];
                                    if ($type == 'narrative'){
                                        $required = false;
                                    }elseif (isset($itemFU['required'])){
                                        $required = $itemFU['required'];
                                    }else{
                                        $required = true;
                                    }
                                    $requireStar = $required ? "*" : "";
                                    $options = isset($itemFU['options']) ? $itemFU['options'] : [];
                                    $disp = json_encode($itemFU['displayOptions']);
                                    $condition = $itemFU['condition'];
                                    $condition = str_replace("'","&apos;",$condition);
                                    $condition = join("***",$condition);
                                    $name = removepunctuation(replacespaces(strtolower(cleaninput($question))));
                                    if (in_array($type, ['radio','checkboxes','dropdown'])){
                                        array_push($options,"ID*".$name);
                                    }else{
                                        $options['name'] = $name;
                                    }
                                    // echo "<div class='itemFU' data-type='$type' data-required='$required' data-disp='$disp' data-condition='$condition' data-key='$FUkey'>";
                                    echo "<div class='itemFU' data-type='$type' data-required='$required' data-disp='$disp' data-condition='$condition' data-key='$f'>";
                                    if ($type != "narrative"){
                                        echo "<div class='question'><p><span class='q'>$question</span><span class='requireSign'>$requireStar</span></p></div><br>";
                                    }
                                    // echo "<div class='question'><span class='q'>$question</span></div><br>";
                                    // echo "<div class='itemFU' data-type='$type' data-disp='$disp' data-condition='$condition'><div class='question'><span class='q'>$question</span></div><br>";
                                    $this->answerDisp($type,$options);
                                    echo "</div>";
                                }
                            echo "</div>";
                        }
                        echo "</div>";
                    }
                    echo "</div>";
                }

            }
            echo "<div class='wrapper'>";
                if ($allowSubmit){
                    echo "<div class='button small submitForm pink' data-formName='$formNameAbbr' data-submission='true'>submit</div>";
                }
                if ($modal){
                    echo "<div class='button small cancel'>dismiss</div>";
                } 
            echo "</form>";
            echo "</div>";
            echo "<script type='text/javascript' src='/js/launchpad/forms.js'></script>";
        }
        public function radio($options){
            unset($name);
            for ($i=0;$i<count($options);$i++){
                if (strpos($options[$i],"ID*")!==false){
                    $name = str_replace("ID*","",$options[$i]);
                    unset($options[$i]);
                }
            }
            $options = array_values($options);
            $name = isset($name) ? $name : "";
            echo "<ul class='answer radio' id='$name' data-name='$name'>";
            for ($i=0;$i<count($options);$i++){
                echo '<li data-value="'.$options[$i].'">'.$options[$i].'</li>';
            }
            echo '</ul>';
        }
        public function text($options){
            if (isset($options) and isset($options['name'])){
                $name = $options['name'];
                $placeholder = isset($options['placeholder'])?"placeholder='".$options['placeholder']."' ":"";
                echo "<div class='answer text'>
                <input id='$name' name='$name' $placeholder type='text' required>
                </div>";
            }else{
                echo "<div class='answer text'>
                <input type='text' required>
                </div>";
            }
        }
        public function textbox($options){
            if (isset($options) and isset($options['name'])){
                $name = $options['name'];
                $placeholder = isset($options['placeholder'])?"placeholder='".$options['placeholder']."' ":"";
                echo "<div class='answer textbox'>
                <textarea required id='$name' name='$name' $placeholder type='text' required></textarea>
                </div>";
            }else{
                echo '<div class="answer textbox">
                <textarea required></textarea>
                </div>';
            }
        }
        public function datePick($options){
            $dataStr = null;
            foreach ($options as $key => $option){
                $dataStr .= "data-$key='$option' ";
            }
            $name = (isset($options['name'])) ? $options['name'] : "";
            echo "<div class='answer date'><input id='$name' readonly placeholder='tap to pick date' class='datepicker' $dataStr></div>";
        }
        public function number($options){
            $dataStr = null;
            foreach ($options as $key => $option){
                $dataStr .= "data-$key='$option' ";
            }
            $label = isset($options['units']) ? $options['units'] : "";
            $initial = $options['initial'];
            $name = (isset($options['name'])) ? $options['name'] : "";
            echo "<div class='answer number' ><input size='5' id='$name' name='$name' type='text' $dataStr value='$initial'><span class='label'>$label</span>
            <div class='numberUpDown'><div class='change up'></div><div class='change down'></div></div></div>";
        }
        public function checkboxes($options){
            unset($name);
            for ($i=0;$i<count($options);$i++){
                if (strpos($options[$i],"ID*")!==false){
                    $name = str_replace("ID*","",$options[$i]);
                    unset($options[$i]);
                }
            }
            $options = array_values($options);
            $name = isset($name) ? $name : "";
            echo '<ul class="answer checkboxes" id="'.$name.'" data-name="'.$name.'">';
            for ($i=0;$i<count($options);$i++){
                echo '<li data-value="'.$options[$i].'">'.$options[$i].'</li>';
            }
            echo '</ul>';
        }
        public function dropdown($options){
            unset($name);
            for ($i=0;$i<count($options);$i++){
                if (strpos($options[$i],"ID*")!==false){
                    $name = str_replace("ID*","",$options[$i]);
                    unset($options[$i]);
                }
            }
            $options = array_values($options);
            $name = isset($name) ? $name : "";
            echo '<div class="answer dropdown"><select id="'.$name.'" data-name="'.$name.'">';
            echo '<option value="">----</option>';
            for ($i=0;$i<count($options);$i++){
                echo '<option value="'.$options[$i].'">'.$options[$i].'</option>';
            }
            echo '</select></div>';
        }
        public function scale($options){
            $min = $options['min'];
            $max = $options['max'];
            $initial = $options['initial'];
            $minLabel = $options['minLabel'];
            $maxLabel = $options['maxLabel'];
            $displayValue = ($options['displayValue'] == "yes") ? true:false;
            $displayLabel = ($options['displayLabels'] == "yes") ? true:false;
            $name = (isset($options['name'])) ? $options['name'] : "";

            if ($displayLabel){
                $minLabelStr = "($min) $minLabel";
                $maxLabelStr = "$maxLabel ($max)";
            }elseif (!$displayLabel){
                $minLabelStr = "$minLabel";
                $maxLabelStr = "$maxLabel";
            }
            $class="";
            if ($displayValue){$class="showValue";}
            // echo "<div class='answer scale' $x>
            echo "<div class='answer scale'>
            <span class='left'>$minLabelStr</span>
            <input class='slider targetInput $class' data-name='$name' value='$initial' id='$name' type='range' min='$min' max='$max'>
            <span class='right'>$maxLabelStr</span><div class='SliderValue' style='opacity:0;'></div></div>";
        }
        public function signature($options){
            $printed = ($options['typedName']=='yes') ? "<span class='printed'>Type your full legal name here: <span class='text'><input type='text'></span></span>":"";
            echo "<div class='answer signHere'>$printed Sign your name in the box below
            <div class='signature'><div class='clear'>reset</div></div>
            </div>";
        }
        public function timePick($options){
            $default['scrollDefault'] = 'now';
            $default['forceRoundTime'] = 'true';
            $default['step'] = 15;
            foreach ($default as $key => $option){
                if (!isset($options[$key])){
                    $options[$key] = $default[$key];
                }
            }
            $name = $options['name'];
            $optJSON = json_encode($options);
            $initial = isset($options['setTime'])?$options['setTime']:"";
            echo "<div class='answer time'><input id='$name' class='timePick' size='8' placeholder='HH:MM' value='$initial' data-options='$optJSON' type='text'></div>";
        }
        public function narrative($options){
            $id = isset($options['name'])?$options['name']:"";
            $html = $this->checkForImgs($options['markupStr']);
            
            echo "<div id='$id' class='narrative'>$html</div>";
        }
        public function checkForImgs($markup){
            $n = preg_match_all('/src="%%EMBEDDED:([^%]*)%%"/', $markup, $imgs, PREG_PATTERN_ORDER);
            $newMarkup = false;
            if ($n!==false && $n > 0){
                for ($i = 0; $i < count($imgs[1]); $i++){
                    $fullMatch = $imgs[0][$i];
                    $uuid = $imgs[1][$i];
                    $img = Image::find($uuid);
                    $mimeType = $img->mime_type; 
                    $dataStr = $img->data_string;
                    $fileName = $img->file_name;
                    $imgStr = 'src="data:'.$mimeType.';'.$dataStr.'" data-uuid="'.$uuid.'" data-filename="'.$fileName.'"';
                    $newMarkup = $newMarkup ? $newMarkup : $markup;
                    $newMarkup = str_replace($fullMatch,$imgStr,$newMarkup);
                }
                $markup = $newMarkup;
            }
            return $markup;
        }
        
        public function answerDisp($type,$options){
            if ($type != "narrative"){
                foreach ($options as &$option){
                    $option = e($option);
                }
                unset($option);
            }
            if ($type=='radio'){
                $this->radio($options);
            }
            elseif ($type=="narrative"){
                $this->narrative($options);
            }
            elseif ($type=='number'){
                $this->number($options);
            }
            elseif ($type=='checkboxes'){
                $this->checkboxes($options);
            }
            elseif ($type=='dropdown'){
                $this->dropdown($options);
            }
            elseif ($type=='scale'){
                $this->scale($options);
            }
            elseif ($type=='date'){
                $this->datePick($options);
            }
            elseif ($type=='text'){
                $this->text($options);
            }
            elseif ($type=='text box'){
                $this->textbox($options);
            }
            elseif ($type=='signature'){
                $this->signature($options);
            }
            elseif ($type=='time'){
                $this->timePick($options);
            }
        }
    	public function displaySettings($json){
            return "saved settings";
    	}


}
