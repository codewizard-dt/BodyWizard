<?php

namespace App;

use App\Image;
use Illuminate\Database\Eloquent\Model;

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
                                    ["label" => 'previous versions',"value" => 'current:0','attribute'=>'current'],
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
        $this->optionsNavValues = array(
            'destinations' => array("settings","form-preview","forms-edit","delete","forms-create"),
            'btnText' => array("settings","preview","edit","delete","create new form")
        );
        $this->connectedModels = [
            ['Service','many','morphToMany']
        ];
    }

    public function services(){
        return $this->morphedByMany('App\Service', 'formable', null, 'form_id');
    }

    public function images(){
        return $this->morphToMany('App\Image', 'imageable');
    }

    public function optionsNav($uid){
        $formJSON = json_decode($this->full_json,true);
        $settingsJSON = json_decode($this->settings,true);
        // dd($settingsJSON);
        $formID = $this->form_id;
        $name = $this->form_name;
        
        $numbers = $formJSON['numbers'];
        $numSecs = $numbers['sections'];
        $numQs = $numbers['items'];
        $numFUs = $numbers['followups'];

        // $questions = json_decode($this->questions,true);
        $questions = $formJSON['sections'];

        $secStr = ($numSecs == 0 or $numSecs>1) ? $numSecs." sections" : $numSecs." section";
        $QStr = ($numQs == 0 or $numQs>1) ? $numQs." questions total" : $numQs." question total";
        $FUStr = ($numFUs == 0 or $numFUs>1) ? $numFUs." as followups" : $numFUs." as followup";
        
        $secNames = "";
        for ($x=0;$x<count($questions);$x++){
            $secNames .= $questions[$x]['sectionName'];
            if ($x!=count($questions)-1){
                $secNames .= ", ";
            }
        }
        $version = $this->version_id;
        $formid = $this->form_id;
        // dd($destinations,$btnText);
        $settings = ($settingsJSON !== null) ? $this->displaySettings($settingsJSON) : "no saved settings";
        $locked = $this->locked;
        $dataStr = str_replace("'","\u0027",$this->full_json);
        $settingsStr = str_replace("'","\u0027",$this->settings);

        echo "<div id='formStats' class='detail' 
        data-locked='$locked' 
        data-uniqueid='$uid'
        data-formdata='$dataStr'
        data-settings='$settingsStr'>
        <span>Version:</span>$version<br>
        <span>Sections:</span>$secNames<br>
        <span>Total Questions:</span>$QStr, $FUStr<br><br>
        <span>Settings:</span><div class='settings'>$settings</div>
        </div>";
        //form selected
        // optionButtons($destinations,$btnText);
    }

   
    //form functionality
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
            <div><div class='change up'></div><div class='change down'></div></div></div>";
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

        public function formDisplay($modal){
            $form = json_decode($this->full_json,true);
            // $sections = json_decode($this->questions,true);
            $sections = $form['sections'];            
            $uid = $this->form_uid;
            $formID = $this->form_id;
            $formName = $this->form_name;
            $formNameAbbr = str_replace(" ", "", $formName);
            $settings = json_decode($this->settings,true);
            // var_dump($settings);
            echo '<div id="'.$formNameAbbr.'" data-formname="'.$formNameAbbr.'" data-formid="'.$formID.'" data-uid="'.$uid.'" class="formDisp indent">';
            for ($x=0;$x<count($sections);$x++){
                $section = $sections[$x];
                $name = $section['sectionName'];
                $items = $section['items'];
                $formObj = new form();
                echo "<div class='section display'><h2 class='purple'>$name</h2>";
                $n = 0;
                for ($i=0;$i<count($items);$i++){
                    $item = $items[$i];
                    $question = $item['question'];
                    $type = $item['type'];
                    $key = $item['key'];
                    $options = isset($item['options']) ? $item['options'] : [];
                    $disp = $item['displayOptions'];
                    $dispStr = json_encode($item['displayOptions']);
                    // $inline = $disp['inline'];
                    $inline = (strpos($disp['inline'],"true") > -1) ? " inline" : "" ;
                    $newline = (strpos($disp['inline'],"BR") > -1) ? true : false;
                    $followups = $item['followups'];
                    if ($newline){echo "<br>";}
                    echo "<div class='item$inline' data-disp='$dispStr' data-type='$type' data-key='$key'>";
                    if ($type !== "narrative"){
                        $n++;
                        echo "<div class='question'><span class='n'>$n.</span><span class='q'>$question</span></div><br>";
                    }
                    include_once app_path("/php/functions.php");
                    $name = removepunctuation(replacespaces(strtolower(cleaninput($question))));
                    if (in_array($type, ['radio','checkboxes','dropdown'])){
                        array_push($options,"ID*".$name);
                    }else{
                        $options['name'] = $name;
                    }
                    $formObj->answerDisp($type,$options);
                    if (count($followups)>0){
                        echo "<div class='itemFUList' data-condition='title'>";
                            for ($f=0;$f<count($followups);$f++){
                                $itemFU = $followups[$f];
                                $question = $itemFU['question'];
                                $FUkey = $itemFU['key'];
                                $type = $itemFU['type'];
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
                                echo "<div class='itemFU' data-type='$type' data-disp='$disp' data-condition='$condition' data-key='$FUkey'><div class='question'><span class='q'>$question</span></div><br>";
                                $formObj->answerDisp($type,$options);
                                echo "</div>";
                            }
                        echo "</div>";
                    }
                    echo "</div>";
                }
                echo "</div>";
            }
            echo "<div class='wrapper'>";
                echo "<div class='button small submitForm pink' data-formName='$formNameAbbr'>submit</div>";
                if ($modal){
                    echo "<div class='button small cancel'>dismiss</div>";
                } 
            echo "</div>";
            echo "</div>";
            echo "<script type='text/javascript' src='/js/launchpad/forms.js'></script>";
        }

    	public function displaySettings($json){
            return "saved settings";
    	}


}
