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
        $this->connectedModels = [
            ['Service','many','morphToMany']
        ];
    }
    public static function tableValues(){
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
                            "attribute" => 'name_with_version'],
                            ["label" => 'Type',
                            "className" => 'type',
                            "attribute" => 'form_type'],
                            ["label" => 'For',
                            "className" => 'usertype',
                            "attribute" => 'user_type'],
                            ["label" => 'Chart Use',
                            "className" => 'charting',
                            "attribute" => 'charting_value_for_table'],
                        ],
                        'hideOrder' => "type,usertype,charting",
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
                                        "label" => 'inactive',
                                        "value" => 'active:0',
                                        'attribute'=>'active'
                                    ],
                                    ["label" => 'system forms',"value" => 'form_type:system','attribute'=>'form_type'],
                                    ["label" => 'locked forms',"value" => 'locked:1','attribute'=>'locked']
                                ]
                            ]
                        ],
                        'optionsNavValues' => [
                            'destinations' => ["settings","form-preview","forms-edit","delete"],
                            'btnText' => ["settings","preview","edit","delete"]
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
        return Form::where([['settings->default_patient_portal_access','for all patients'],['active','1'],['hidden','0']])->orderBy('display_order')->get();
    }
    public static function neededByAnyAppointment($patientId = null){
        if (Auth::user()->user_type == 'patient') $patientId = Auth::user()->patientInfo->id;
        if (!$patientId) return false;

        $patient = Patient::find($patientId);
        $appts = $patient->appointments->filter(function($appt,$a){
            return $appt->date_time->isAfter(Carbon::now()->subMonths(1));
        });
        $formIds = [];
        foreach ($appts as $appt){
            $forms = $appt->forms('patient');
                foreach ($forms as $form){
                    $submissions = Submission::where([
                        ['patient_id',$patientId],
                        ['form_id',$form->form_id],
                        ['appointment_id',$appt->id]
                    ])->get();
                    if ($submissions->count() == 0){
                        $formIds[] = $form->form_id;
                    }
                }
        }
        $forms = Form::whereIn('form_id',$formIds)->where('active',true)->get();
        return $forms;
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
        return [
            "chart_inclusion" => false
        ];
    }
    public static function createItemNameAttr($string){
        return hyphentounderscore(replacespaces(removepunctuation(strtolower(cleaninput($string)))));
    }
    public static function periodicFormsRequiredNow(Patient $patient){
        $forms = Form::where('settings->require_periodically',true)->get()->filter(function($form) use($patient){
            $now = Carbon::now(); $period = $form->required_interval;
            $then = $now->subMonths($period);
            $submissions = Submission::where([['patient_id',$patient->id],['created_at','>',$then]])->get();
            return $submissions->count() == 0;
        });
    }
    public function getRequiredIntervalAttribute(){
        if (!$this->settings['require_periodically']) return null;
        $period = $this->settings['periodicity'];
        if ($period == 'every month') {
            return 1;
        }else{
            // returns number portion of 'every X months'
            return explode(" ",$period)[2];
        }
    }
    public function checkApptFormStatus(Appointment $appt, Patient $patient){
        // Log::info("Check Appt Form Status");
        $submission = Submission::where([["appointment_id",$appt->id],['patient_id',$patient->id],['form_id',$this->form_id]])->get();
        return ($submission->count() == 0) ? false : $submission->first()->id;
    }
    public function newestVersion(){
        return Form::where('form_id',$this->form_id)->orderBy('version_id','desc')->limit(1)->get()->first();
    }
    public static function getActiveVersion($formId){
        return Form::where([['form_id',$formId],['active',1]])->limit(1)->get()->first();        
    }
    public function activeVersion(){
        return Form::where([['form_id',$this->form_id],['active',1]])->limit(1)->get()->first();
    }

    public function getNameAttribute(){
        return $this->form_name;
    }
    public function getNameWithVersionAttribute(){
        return $this->version_id === 1 ? $this->form_name : $this->form_name." (v".$this->version_id.")";
    }
    public function getChartingValueForTableAttribute(){
        if (isset($this->settings['chart_inclusion'])){
            return $this->settings['chart_inclusion'] ? "for charts" : "no";
        }else{
            return 'no';
        }
    }
    public function getNameAbbrAttribute(){
        return str_replace(" ", "", $this->name);
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
                    // Log::info('1 '.$this->name);
                    return ($this->last_submitted == 'never') ? 'incomplete' : 'completed';
                }else{
                    $requiredByTime = false;
                }
            }elseif(contains($timeperiod,'registration')){
                if (!$formCheck){
                    // Log::info('2 '.$this->name);
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

        // Log::info('3 '.$this->name." time:$requiredByTime appt:$formCheck");
        // Log::info($requiredByAppointment);

        return ($requiredByTime || $formCheck) ? "required" : "completed";
    }
    public function getHasSubmissionsAttribute(){
        $submissions = Submission::where('form_uid',$this->form_uid)->get();
        if ($submissions->count() > 0){return true;
        }else{return false;}
    }
    public function getNewestVersionIdAttribute(){
        return $this->newestVersion()->version_id;
    }
    public function getNewestAttribute(){
        return $this->newest_version_id == $this->version_id;
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
        public function formDisplay($modal = false, $allowSubmit = true, $edit = false, $usertype = false, $display = true){
            $form = json_decode($this->full_json,true);
            // $sections = json_decode($this->questions,true);
            $sections = $form['sections'];
            $uid = $this->form_uid;
            $formID = $this->form_id;
            $formName = $this->form_name;
            $formNameAbbrOriginal = str_replace(" ", "", $formName);
            if ($edit){
                $formNameAbbrReflectEdit = str_replace("New", "Edit", $formNameAbbrOriginal);
                $formNameAbbrReflectEdit = str_replace("Add", "Edit", $formNameAbbrReflectEdit);
            }else{$formNameAbbrReflectEdit = $formNameAbbrOriginal;
            }
            if ($usertype){$formNameAbbrReflectEdit = str_replace("User", $usertype, $formNameAbbrReflectEdit);}
            $settings = $this->settings;
            // var_dump($settings);
            $displayStr = $display ? "" : "style='display:none;'";
            echo '<form id="'.$formNameAbbrReflectEdit.'" '.$displayStr.' data-formname="'.$formNameAbbrOriginal.'" data-formid="'.$formID.'" data-uid="'.$uid.'" data-filled="false" class="formDisp">';
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
                        $inline = (strpos($disp['inline'],"true") > -1) ? " inline" : "" ;
                        $newline = (strpos($disp['inline'],"BR") > -1) ? true : false;
                        $followups = $item['followups'];
                        // echo "<div class='item $inline' data-display='$dispStr' data-type='$type' data-required='$required' data-key='$key'>";
                        echo "<div class='item$inline' data-display='$dispStr' data-type='$type' data-required='$required' data-key='$i'>";
                        if ($type !== "narrative"){
                            $n++;
                            echo "<div class='question'><p><span class='n'>$n.</span><span class='q'>$question</span><span class='requireSign'>$requireStar</span></p></div><br>";
                        }
                        // include_once app_path("/php/functions.php");
                        $name = Form::createItemNameAttr($question);
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
                                    
                                    $name = Form::createItemNameAttr($question);
                                    if (in_array($type, ['radio','checkboxes','dropdown'])){
                                        array_push($options,"ID*".$name);
                                    }else{
                                        $options['name'] = $name;
                                    }
                                    echo "<div class='itemFU' data-type='$type' data-required='$required' data-disp='$disp' data-condition='$condition' data-key='$f'>";
                                    if ($type != "narrative"){
                                        echo "<div class='question'><p><span class='q'>$question</span><span class='requireSign'>$requireStar</span></p></div><br>";
                                    }
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
                    echo "<div class='button small submitForm pink' data-formName='$formNameAbbrOriginal' data-submission='true'>submit</div>";
                }
                if ($modal){
                    echo "<div class='button small cancel'>dismiss</div>";
                } 
            echo "</form>";
            echo "</div>";
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
            // echo "<ul class='answer radio' id='$name' data-name='$name'>";
            echo "<ul class='answer radio $name' data-name='$name'>";
            for ($i=0;$i<count($options);$i++){
                echo '<li tabindex="0" data-value="'.$options[$i].'">'.$options[$i].'</li>';
            }
            echo '</ul>';
        }
        public function text($options){
            if (isset($options)){
                $name = isset($options['name']) ? $options['name'] : "";
                $placeholder = isset($options['placeholder'])?"placeholder='".$options['placeholder']."' ":"";
                echo "<div class='answer text'>
                <input class='$name' name='$name' $placeholder type='text' required>
                </div>";
            }else{
                echo "<div class='answer text'>
                <input type='text' required>
                </div>";
            }
        }
        public function imageClick($options){
            echo view('layouts.forms.image-click',$options);
        }
        public function textbox($options){
            if (isset($options) and isset($options['name'])){
                $name = $options['name'];
                $placeholder = isset($options['placeholder'])?"placeholder='".$options['placeholder']."' ":"";
                echo "<div class='answer textbox'>
                <textarea required class='$name' name='$name' $placeholder type='text' required></textarea>
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
            echo "<div class='answer date'><input class='$name datepicker' readonly placeholder='tap to pick date' $dataStr></div>";
        }
        public function number($options){
            $dataStr = null;
            foreach ($options as $key => $option){
                $dataStr .= "data-$key='$option' ";
            }
            $label = isset($options['units']) ? $options['units'] : "";
            $initial = $options['initial'];
            $name = (isset($options['name'])) ? $options['name'] : "";
            echo "<div class='answer number' ><input size='5' class='$name' name='$name' type='text' $dataStr placeholder='$initial'><span class='label'>$label</span>
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
            // echo '<ul class="answer checkboxes" id="'.$name.'" data-name="'.$name.'">';
            echo '<ul class="answer checkboxes '.$name.'" data-name="'.$name.'">';
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
            echo '<div class="answer dropdown"><select class="'.$name.'" data-name="'.$name.'">';
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
            $displayValue = ($options['displayValue'] == "yes");
            $displayLabel = ($options['displayLabels'] == "yes");
            $name = (isset($options['name'])) ? $options['name'] : "";

            if ($displayLabel){
                $minLabelStr = "$min<br><b>$minLabel</b>";
                $maxLabelStr = "$max<br><b>$maxLabel</b>";
            }elseif (!$displayLabel){
                $minLabelStr = "<b>$minLabel</b>";
                $maxLabelStr = "<b>$maxLabel</b>";
            }
            $class="";
            if ($displayValue){$class="showValue";}
            echo "<div class='answer scale flexbox'>
            <span class='left'>$minLabelStr</span>
            <input class='slider targetInput $class $name' data-name='$name' value='$initial' type='range' min='$min' max='$max'>
            <span class='right'>$maxLabelStr</span><div class='SliderValue' style='display:none;'></div></div>";
        }
        public function signature($options){
            // Log::info($options);
            $printed = ($options['typedName']=='yes') ? "<span class='printed'>Type your full legal name here: <span class='text'><input type='text'></span></span>":"";
            $name = (isset($options['name'])) ? $options['name'] : "";
            echo "<div id='$name' data-name='$name' class='answer signHere'>$printed Sign your name in the box below
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
            $name = isset($options['name']) ? $options['name'] : "";
            $optJSON = json_encode($options);
            $initial = isset($options['setTime'])?$options['setTime']:"";
            // echo "<div class='answer time'><input id='$name' class='timePick' size='8' placeholder='HH:MM' value='$initial' data-options='$optJSON' type='text'></div>";
            echo "<div class='answer time'><input class='timePick $name' size='8' placeholder='HH:MM' value='$initial' data-options='$optJSON' type='text'></div>";
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
            elseif ($type=='bodyclick'){
                // $bodyClickOptions = [
                //     'image' => '/images/body/rsz_body12.png',
                //     'height' => '50em',
                //     'name' => 'bodyClick'
                // ];
                $options['image'] = '/images/body/rsz_body12.png';
                $this->imageClick($options);
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
