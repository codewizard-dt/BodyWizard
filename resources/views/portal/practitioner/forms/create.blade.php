<?php

Use App\Form;

if (isset($form)){
    // dd($form);
    $formUID = $form->getkey();
    $formId = $form->form_id;
    $data = str_replace("'","\u0027",$form->full_json);
    $name = $form->form_name;
}else{
    $name = "";
}

$ctrl = new Form; 
$requiredOptions = ['required','optional','ID*requiredbool'];

?>

<div id='FormBuilder'>
    @if (isset($form))
        <div id='formdata' data-mode='edit' data-formuid='{{ $formUID }}' data-formid='{{ $formId }}' data-json='{{ $data }}'></div>
    @else
        <div id="formdata"></div>
    @endif
    <div id='FormInfo'>
        <h2 id='FormName' class='editable'>
            <div class='pair'>
                <input class='input' id='FormName' type='text' placeholder='Form Name'>
                <span class='value purple'> {{ $name }} </span>
            </div>
            <div class='toggle edit'>(edit form name)</div>
            <div class='toggle save'>(save name)</div>
            <div class='toggle cancel'>(cancel)</div>
        </h2>
        <div id="Sections">
            <div id='SectionOptions' class='prompt displayOrder'>
                <div class="message whiteBG">
                    @if (isset($form))
                        <h3>Loading Sections</h3>
                    @else
                        <h3>No Sections Yet</h3>
                    @endif
                    <span class='little'>click to scroll</span><br>
                    <ul></ul>
                </div>
                <div class="options">
                    <div class="addSectionBtn button pink medium">add section</div>
                    <div id='PreviewFormBtn' class='button medium pink70'>preview form</div>
                </div>
            </div>

            <div id='AddSection' class='prompt'>
                <div class="message">
                    <h2>Create New Section</h2>
                    <h3><input id="SectionName" style='text-align: center;' type='text' placeholder='Enter Section Name'></h3>
                </div>
                <div class="options">
                    <div class='button medium pink add'>add to form</div>
                    <div class="button medium cancel">cancel</div>
                </div>
            </div>

        </div> 
    </div>
    
    
    <div id="AddItem" class='prompt'>
        <div id="AddItemProxy"></div>
        <div class='message'>
            <h2 class='purple'>New Question</h2>
            <div>
                <h3 class='black paddedXSmall'><span>Question Text: </span><input id='Text' type='text' placeholder='Ex: How are you today?'></h3>
            </div>
            <div>
                <h4 class='black paddedXSmall'>
                    <span>Answer Type:</span>
                    <select id='Type'>
                        <option value='text'>single line text</option>
                        <option value='text box'>text box</option>
                        <option value='number'>number</option>
                        <option value='bodyclick'>body click</option>
                        <option value='radio'>select one answer</option>
                        <option value='checkboxes'>select one or more answers</option>
                        <option value='dropdown'>dropdown menu</option>
                        <option value='scale'>slider scale</option>
                        <option value='date'>date</option>
                        <option value='time'>time</option>
                        <option value='signature'>signature</option>
                    </select>
                </h4>
                <h4 class="black paddedXSmall">
                    <span>Required:</span>
                    <select id='Required'>
                        <option value='true'>yes</option>
                        <option value='false'>no, optional</option>
                    </select>
                </h4>
            </div>

            <div id='Options' class='itemOptionList'>
                <span class="settingsLabel">List the Answers to Choose From</span>
                <span class='little'>add as many as you'd like. use enter key to move down. use arrows to rearrange</span>
                <div id='OptionsList' class='optionsList'>
                    <div class='option'><input type='text' placeholder='Ex: cold, warm, hot'><div class="UpDown"><div class="up"></div><div class="down"></div></div></div>
                    <div class='option'><input type='text' placeholder='Ex: cold, warm, hot'><div class="UpDown"><div class="up"></div><div class="down"></div></div></div>
                    <div class='button xxsmall pink70 add'>add more</div>
                </div>
            </div>
            <div id='TextOptions' class='itemOptionList'>
                <?php 
                $optionsText = ['name'=>'textPlaceholder','placeholder'=>'(optional) disappears when you type'];
                $optionsTextBox = ['name'=>'textAreaPlaceholder','placeholder'=>'(optional) disappears when you type'];
                ?>
                <span class="settingsLabel">Options</span>
                <div class="optionsList">
                    <div><span>Placeholder text:</span>{{ $ctrl->answerDisp('text',$optionsText) }}</div>
                </div>
            </div>
            <div id='TextBoxOptions' class='itemOptionList'>
                <span class="settingsLabel">Options</span>
                <div class="optionsList">
                    <div><span>Placeholder text:</span>{{ $ctrl->answerDisp('text box',$optionsTextBox) }}</div>
                </div>
            </div>
            <div id='NumberOptions' class='itemOptionList'>
                <span class="settingsLabel">Options</span>
                <div id='NumberList'  class='optionsList'>
                    <?php
                    $optionsMin = ["min"=>"-9999", "max"=>"9999", "initial"=>"0", "step"=>"1", "units"=>"","name"=>"min"];
                    $optionsMax = ["min"=>"-9999", "max"=>"9999", "initial"=>"0", "step"=>"1", "units"=>"","name"=>"max"];
                    $optionsInitial = ["min"=>"-9999", "max"=>"9999", "initial"=>"0", "step"=>"1", "units"=>"","name"=>"initial"];
                    $optionsStep = ["min"=>"-9999", "max"=>"9999", "initial"=>"0", "step"=>"0.1", "units"=>"","name"=>"step"];
                    $optionsUnits = ['name'=>'units','placeholder'=>'eg days, weeks, times/day, meals, etc'];
                    ?>
                    <div><span>Minimum: </span> {{ $ctrl->answerDisp('number',$optionsMin) }}</div>
                    <div><span>Maximum: </span> {{ $ctrl->answerDisp('number',$optionsMax) }}</div>
                    <div><span>Initial: </span> {{ $ctrl->answerDisp('number',$optionsInitial) }}</div>
                    <div><span>Increment size: </span> {{ $ctrl->answerDisp('number',$optionsStep) }}</div>
                    <div><span>Units: </span> {{ $ctrl->answerDisp('text',$optionsUnits) }}</div>
                </div>
            </div>
            <div id='DateOptions' class='itemOptionList'>
                <span class="settingsLabel">Options</span>
                <div id='DateList' class='optionsList'>

                    <?php 
                    $d = date('Y');
                    $m = $d + 1;
                    $D = $d +10;
                    $v = $d -10;
                    unset($options);
                    $optionsBegin = ['min'=>'1920','max'=>$D,'initial'=>$v,'step'=>'1','units'=>'','name'=>'begin'];
                    $optionsEnd = ['min'=>'1920','max'=>$D,'initial'=>$d,'step'=>'1','units'=>'','name'=>'end'];
                    $optionsMinNum = ['min'=>'0','max'=>'100','initial'=>'1','step'=>'1','units'=>'','name'=>'minNum'];
                    $optionsMinType = ['days','weeks','months','years','ID*minType'];
                    $optionsMinDir = ['before','after','ID*minDir'];
                    $optionsMaxNum = ['min'=>'0','max'=>'100','initial'=>'1','step'=>'1','units'=>'','name'=>'maxNum'];
                    $optionsMaxType = ['days','weeks','months','years','ID*maxType'];
                    $optionsMaxDir = ['before','after','ID*maxDir'];
                    ?>
                    <div>
                        <div data-settings='yearRange'>
                            <!-- <h5>Which Years should be Available?<br><span>(always opens on current month)<span></h5>
                            <div><span>beginning with</span> {{ $ctrl->answerDisp('number',$optionsBegin) }} 
                                <label><input type='checkbox' id='currentYearBegin'>always use current year</label>
                            </div>
                            <div><span>ending with</span> {{ $ctrl->answerDisp('number',$optionsEnd) }} 
                                <div>
                                    <label><input type='checkbox' id='currentYearEnd'>always use current year</label><br>
                                    <label><input type='checkbox' id='nextYearEnd'>always use next year</label>
                                </div>
                            </div> -->
                        </div>
                        <div data-settings='minMax'>
                            <h5>Which Dates should be Available?<br><span>(ex: 1 week before/after current date)<span></h5>
                            <label><input id='NoRestriction' type='checkbox'>no restrictions</label><br>
                            <div class='blockable'>
                                <span class='little'>to use current date, simply enter "0 days before current date"</span>
                                <div>
                                    <span class='pink'>from</span>
                                    {{ $ctrl->answerDisp("number",$optionsMinNum) }}
                                    {{ $ctrl->answerDisp("dropdown",$optionsMinType) }}
                                    {{ $ctrl->answerDisp("dropdown",$optionsMinDir) }}
                                    <span>current date</span>
                                </div>
                                <div>
                                    <span class='pink'>to</span>
                                    {{ $ctrl->answerDisp("number",$optionsMaxNum) }}
                                    {{ $ctrl->answerDisp("dropdown",$optionsMaxType) }}
                                    {{ $ctrl->answerDisp("dropdown",$optionsMaxDir) }}
                                    <span>current date</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id='TimeOptions' class='itemOptionList'>
                <span class="settingsLabel">Options</span>
                <div id="TimeList" class='optionsList'>
                    <?php
                    $optionsRestrict = ["allow any time","set range",'set initial value',"set interval","ID*TimeRestrict"];
                    $optionsMinTime = ['setTime'=>"8:00am",'name'=>'minTime'];
                    $optionsMaxTime = ['setTime'=>"8:00pm",'name'=>'maxTime'];
                    $optionsInterval = ['min'=>'0','max'=>'180','initial'=>'5','step'=>'5','units'=>'minutes','name'=>'step'];
                    $optionsInitial = ['setTime'=>'8:00am','name'=>'setTime','step'=>'5'];
                    ?>
                    <div id='TimeRestriction' data-condition='yes'><span>Time restrictions</span><br>
                        {{ $ctrl->answerDisp("checkboxes",$optionsRestrict) }}
                    </div>
                    <div class="flexbox">
                        <div id='TimeRange' data-condition='set range'><span>Allowed Range:</span>
                            {{ $ctrl->answerDisp("time",$optionsMinTime) }}<span>to</span>
                            {{ $ctrl->answerDisp("time",$optionsMaxTime) }}
                        </div>
                        <div id='TimeValue' data-condition='set initial value'><span>Initial time displayed:</span>
                            {{ $ctrl->answerDisp("time",$optionsInitial) }}
                        </div>
                        <div id='TimeIntervalBox' data-condition='set interval'><span>Selection intervals:</span>
                            {{ $ctrl->answerDisp("number",$optionsInterval) }}
                        </div>
                    </div>
                </div>
            </div>
            <div id='BodyClickOptions' class='itemOptionList'>
                <?php 
                    $imageClickOptions1 = [
                        'image' => '/images/body/rsz_body12.png',
                        'height' => '30em',
                        'name' => 'bodyClick1'
                    ];
                ?>
                <div>{{$ctrl->imageClick($imageClickOptions1)}}</div>
            </div>
            <div id='ScaleOptions' class='itemOptionList'>
                <span class="settingsLabel">Options</span>
                <span class='little'>Labels will always show on each side, but you can choose to show the values or not.<br>To approximate a 'visual analog scale', hide the values and set the max to at least 100.</span>
                <div id="ScaleList" class='optionsList'>
                    <?php
                    $optionsMin = ['min'=>'-9999','max'=>'9999','initial'=>'0','step'=>'1','units'=>'','name'=>'scalemin'];
                    $optionsMax = ['min'=>'-9999','max'=>'9999','initial'=>'100','step'=>'1','units'=>'','name'=>'scalemax'];
                    $optionsInitial = ['min'=>'-9999','max'=>'9999','initial'=>'50','step'=>'1','units'=>'','name'=>'initial'];
                    $optionsMinLabel = ['name'=>'minLabel','placeholder'=>'ex: no pain, none, bad'];
                    $optionsMaxLabel = ['name'=>'maxLabel','placeholder'=>'ex: excruciating, constant, good'];
                    ?>
                    <div><span>Show current value?</span><select name='dispVal'><option value="yes">yes</option><option value="no">no</option></select></div>
                    <div><span>Show left/right values?</span><select name='dispLabel'><option value="yes">yes</option><option value="no">no</option></select></div>
                    <div><span>Left-side Label:</span>{{ $ctrl->answerDisp("text",$optionsMinLabel) }}</div>
                    <div><span>Right-side Label:</span>{{ $ctrl->answerDisp("text",$optionsMaxLabel) }}</div>
                    <div><span>Left-side value:</span>{{ $ctrl->answerDisp("number",$optionsMin) }}</div>
                    <div><span>Right-side value:</span>{{ $ctrl->answerDisp("number",$optionsMax) }}</div>
                    <div><span>Initial value:</span>{{ $ctrl->answerDisp("number",$optionsInitial) }}</div>
                </div>
            </div>
            <div id="FollowUpOptions" class='itemOptionList'>
                <span class="settingsLabel switch">When To Ask This Question</span>
                <div id='FollowUpList' class='optionsList'>
                    <span>Only when reponse to <span id="DisplayQ"></span> <span id="Conditionality"></span>: </span><div id='condition' class='flexbox'></div>
                </div>
            </div>
            <div id='SignatureOptions' class='itemOptionList'>
                <span class="settingsLabel">Options</span>
                <div id='SignatureList' class='optionsList'>
                    <div>
                        <span>Ask for typed name as well as signature?</span>
                        <select name='typedName' id='typedName'>
                            <option value='yes'>yes</option>
                            <option value='no'>no</option>
                        </select>                        
                    </div>
                </div>
            </div>  
        </div>
        
        <div class="wrapper options">
	        <div class="button medium pink save">save question</div>
	        <div class='button medium cancel'>cancel</div>
        </div>
    </div>
    <div id='AddText' class='prompt'>
        <div class='message'>
            <div id='NarrativeOptions' class='itemOptionList'>
                <h2 class='purple'>Text and Image Display</h2>
                <div class='central'>You can display any explanatory, descriptive, or instructive information you like. It will be displayed exactly as you see here, including images, links, and formatting.</div>
                <div id='NarrativeList' class='optionsList'>
                    <div class='summernote'></div>
                </div>
            </div>            
        </div>
        <div class="options">
            <div class="button medium pink save">save text</div>
            <div class='button medium cancel'>cancel</div>
        </div>
    </div>
    
    <div id="SectionOrder">
        <div style='display:inline-block'>
            <span>Section Order</span><div class='toggle save'>(save)</div><div class="toggle cancel">(cancel)</div>
            <div id="SectionList"></div>
        </div>
    </div>
        
<div id='Templates'>
    <?php 
        $textOptions = [
            'name'=>'textTemplate',
            'placeholder'=>null
        ];
        $textboxOptions = [
            'name'=>'textboxTemplate',
            'placeholder'=>null
        ];
        $numberOptions = [
            'min' => 0,'max' => 100,'initial' => 60,'step' => 1,'units' => 'units','name' => 'numberTemplate'
        ];
        $radioOptions = ["ID*radioTemplate"];
        $checkboxesOptions = ["ID*checkboxesTemplate"];
        $dropdownOptions = ["ID*dropdownTemplate"];
        $scaleOptions = [
            "min" => 0,"max" => 100,"initial" => 50,"minLabel" => "none","maxLabel" => "a lot","displayValue" => "yes","displayLabels" => "yes","name" => "scaleTemplate"
        ];
        $currentYear = date("Y");
        $tenPast = $currentYear - 10;
        $dateOptions = [
            "yearrange" => $tenPast.":".$currentYear,
            'name' => "dateTemplate"
        ];
        $timeOptions = [
            'minTime' => "8:00am",'maxTime' => '8:00pm','setTime' => '3:00pm','step' => '15','name' => 'timeTemplate'
        ];
        $signatureOptions = [
            'typedName' => 'yes'
        ];
        $narrativeOptions = [
            'name' => 'narrativeTemplate',
            'markupStr' => "demo"
        ];
    ?>
    <div class='template' data-type="narrative" data-defaultoptions="{{ json_encode($narrativeOptions) }}">{{ $ctrl->answerDisp('narrative',$narrativeOptions) }}</div>
    <div class='template' data-type="text" data-defaultoptions="{{ json_encode($textOptions) }}">{{ $ctrl->answerDisp('text',$textOptions) }}</div>
    <div class='template' data-type="text box" data-defaultoptions="{{ json_encode($textboxOptions) }}">{{ $ctrl->answerDisp('text box',$textboxOptions) }}</div>
    <div class='template' data-type="number" data-defaultoptions="{{ json_encode($numberOptions) }}">{{ $ctrl->answerDisp('number',$numberOptions) }}</div>
    <div class='template' data-type="radio" data-defaultoptions="{{ json_encode($radioOptions) }}">{{ $ctrl->answerDisp('radio',$radioOptions) }}</div>
    <div class='template' data-type="checkboxes" data-defaultoptions="{{ json_encode($checkboxesOptions) }}">{{ $ctrl->answerDisp('checkboxes',$checkboxesOptions) }}</div>
    <div class='template' data-type="dropdown" data-defaultoptions="{{ json_encode($dropdownOptions) }}">{{ $ctrl->answerDisp('dropdown',$dropdownOptions) }}</div>
    <div class='template' data-type="scale" data-defaultoptions="{{ json_encode($scaleOptions) }}">{{ $ctrl->answerDisp('scale',$scaleOptions) }}</div>
    <div class='template' data-type="date" data-defaultoptions="{{ json_encode($dateOptions) }}">{{ $ctrl->answerDisp('date',$dateOptions) }}</div>
    <div class='template' data-type="time" data-defaultoptions="{{ json_encode($timeOptions) }}">{{ $ctrl->answerDisp('time',$timeOptions) }}</div>
    <div class='template' data-type="signature" data-defaultoptions="{{ json_encode($signatureOptions) }}">{{ $ctrl->answerDisp('signature',$signatureOptions) }}</div>
</div>
<div id="FormPreview" class="modalForm">
</div>
<div id="AutoSaveWrap" class="wrapper">
    <div id="AutoConfirm"><span class='message'>form autosaved</span><span style="margin-left:10px" class="checkmark">✓</span></div>
</div>
<script type="text/javascript" src="{{ asset('/js/launchpad/form-builder.js') }}"></script>
