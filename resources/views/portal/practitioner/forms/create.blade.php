<?php

Use App\Form;

if (isset($form)){
    // dd($form);
    $formUID = $form->getkey();
    $formId = $form->form_id;
    $data = str_replace("'","\u0027",$form->full_json);
}

$ctrl = new Form; 

?>

<div id='FormBuilder'>
    @if (isset($form))
        <div id='formdata' data-mode='edit' data-formuid='{{ $formUID }}' data-formid='{{ $formId }}' data-json='{{ $data }}'></div>
    @else
        <div id="formdata"></div>
    @endif
    <div id='FormInfo'>
        <div id='FormName' class='editable'>
            <span>Form Name: </span>
            <div class='pair'>
                <input class='input' id='FormName' type='text'>
                <span class='value'></span>
            </div>
            <div class='toggle edit'>(edit)</div>
            <div class='toggle save'>(save)</div>
            <div class='toggle cancel'>(cancel)</div>
        </div>
        <div id="Sections">
            <div class='sectionOptions'>
                <h4>No Sections Yet</h4>
                <div class="addSectionBtn button xsmall">add section</div>
                <div class="sectionOrderBtn button xsmall">change section order</div><br>
            </div>

            <div id='AddSection'>
                <h4>New Section</h4>
                <div>
                    <span>Section Name:</span>
                    <input id="SectionName" type='text'>
                </div>
                <div class="xs-pad"></div>
                <div class='button xsmall add'>add to form</div>
                <div class="clear">(cancel)</div>
            </div>

        </div> 
    </div>
    
    
    <div id="AddItem">
        <div>
            <div>
                <span>Question:</span>
                <input id='Text' type='text'>
            </div>
            <div>
                <span>Type:</span>
                <select id='Type'>
                    <option value='text'>text</option>
                    <option value='text box'>text box</option>
                    <option value='number'>number</option>
                    <option value='radio'>radio</option>
                    <option value='checkboxes'>checkboxes</option>
                    <option value='dropdown'>dropdown</option>
                    <option value='scale'>scale</option>
                    <option value='date'>date</option>
                    <option value='time'>time</option>
                    <option value='signature'>signature</option>
                </select>
            </div>

            <div id='Options' class='itemOptionList'>
                <span>Options:</span>
                <div id='OptionsList' class='optionsList'>
                    <div class='option'><input type='text'><div class="UpDown"><div class="up"></div><div class="down"></div></div></div>
                    <div class='option'><input type='text'><div class="UpDown"><div class="up"></div><div class="down"></div></div></div>
                    <div class='button xsmall add'>add option</div>
                </div>
            </div>
            <div id='TextOptions' class='itemOptionList'>
                <?php $option = new Form(); 
                $optionsText = ['name'=>'textPlaceholder','placeholder'=>'(optional) disappears when you start typing'];
                $optionsTextBox = ['name'=>'textAreaPlaceholder','placeholder'=>'(optional) disappears when you start typing'];
                ?>
                <span>Placeholder text:</span>{{ $option->answerDisp('text',$optionsText) }}
            </div>
            <div id='TextBoxOptions' class='itemOptionList'>
                <span>Placeholder text:</span>{{ $option->answerDisp('text box',$optionsTextBox) }}
            </div>
            <div id='NumberOptions' class='itemOptionList'>
                <span>Options:</span>
                <div id='NumberList'  class='optionsList'>
                    <?php
                    $optionsMin = ["min"=>"-9999", "max"=>"9999", "initial"=>"0", "step"=>"1", "units"=>"","name"=>"min"];
                    $optionsMax = ["min"=>"-9999", "max"=>"9999", "initial"=>"0", "step"=>"1", "units"=>"","name"=>"max"];
                    $optionsInitial = ["min"=>"-9999", "max"=>"9999", "initial"=>"0", "step"=>"1", "units"=>"","name"=>"initial"];
                    $optionsStep = ["min"=>"-9999", "max"=>"9999", "initial"=>"0", "step"=>"0.1", "units"=>"","name"=>"step"];
                    $optionsUnits = ['name'=>'units','placeholder'=>'eg days, weeks, times/day, meals, etc'];
                    ?>
                    <div><span>Minimum: </span> {{ $option->answerDisp('number',$optionsMin) }}</div>
                    <div><span>Maximum: </span> {{ $option->answerDisp('number',$optionsMax) }}</div>
                    <div><span>Initial: </span> {{ $option->answerDisp('number',$optionsInitial) }}</div>
                    <div><span>Increment size: </span> {{ $option->answerDisp('number',$optionsStep) }}</div>
                    <div><span>Units: </span> {{ $option->answerDisp('text',$optionsUnits) }}</div>
                </div>
            </div>
            <div id='DateOptions' class='itemOptionList'>
                <span>Options:</span>
                <div id='DateList' class='optionsList'>

                    <?php 
                    $d = date('Y');
                    $m = $d + 1;
                    $D = $d +10;
                    $v = $d -10;
                    unset($options);
                    $optionsBegin = ['min'=>'1920','max'=>$D,'initial'=>$v,'step'=>'1','units'=>'','name'=>'begin'];
                    $optionsEnd = ['min'=>'1920','max'=>$D,'initial'=>$d,'step'=>'1','units'=>'','name'=>'end'];
                    $optionsMinNum = ['min'=>'1','max'=>'100','initial'=>'1','step'=>'1','units'=>'','name'=>'minNum'];
                    $optionsMinType = ['days','weeks','months','years','ID*minType'];
                    $optionsMaxNum = ['min'=>'1','max'=>'100','initial'=>'1','step'=>'1','units'=>'','name'=>'maxNum'];
                    $optionsMaxType = ['days','weeks','months','years','ID*maxType'];
                    ?>
                    <div>
                        <div data-settings='yearRange'>
                            <h5>Which Years should be Available?<br><span>(always opens on current month)<span></h5>
                            <div><span>beginning with</span> {{ $option->answerDisp('number',$optionsBegin) }} 
                                <label><input type='checkbox' id='currentYearBegin'>always use current year</label>
                            </div>
                            <div><span>ending with</span> {{ $option->answerDisp('number',$optionsEnd) }} 
                                <div>
                                    <label><input type='checkbox' id='currentYearEnd'>always use current year</label><br>
                                    <label><input type='checkbox' id='nextYearEnd'>always use next year</label>
                                </div>
                            </div>
                        </div>
                        <div data-settings='minMax'>
                            <h5>Which Dates should be Available?<br><span>(ex: 1 week before/after current date)<span></h5>
                            <label><input id='NoRestriction' type='checkbox'>no restrictions</label><br>
                            <div class='blockable'>
                                <div style='transform:unset;'>
                                    {{ $option->answerDisp("number",$optionsMinNum) }}
                                    {{ $option->answerDisp("dropdown",$optionsMinType) }}
                                    <span>before current date</span>
                                </div>
                                <div style='transform:unset;'>
                                    {{ $option->answerDisp("number",$optionsMaxNum) }}
                                    {{ $option->answerDisp("dropdown",$optionsMaxType) }}
                                    <span>after current date</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id='TimeOptions' class='itemOptionList'>
                <span>Options:</span>
                <div id="TimeList" class='optionsList'>
                <?php
                $optionsRestrict = ["allow any time","set range",'set initial value',"set interval","ID*TimeRestrict"];
                $optionsMinTime = ['setTime'=>"8:00am",'name'=>'minTime'];
                $optionsMaxTime = ['setTime'=>"8:00pm",'name'=>'maxTime'];
                $optionsInterval = ['min'=>'0','max'=>'180','initial'=>'5','step'=>'5','units'=>'minutes','name'=>'step'];
                $optionsInitial = ['setTime'=>'8:00am','name'=>'setTime'];
                ?>
                <div id='TimeRestriction' data-condition='yes'><span>Time restrictions</span><br>
                    {{ $ctrl->answerDisp("checkboxes",$optionsRestrict) }}
                </div>
                <div id='TimeRange' data-condition='set range'><span>Allowed Range:</span><br>
                    {{ $ctrl->answerDisp("time",$optionsMinTime) }}
                    {{ $ctrl->answerDisp("time",$optionsMaxTime) }}
                </div>
                <div id='TimeValue' data-condition='set initial value'><span>Initial time displayed:</span><br>
                    {{ $ctrl->answerDisp("time",$optionsInitial) }}
                </div>
                <div id='TimeIntervalBox' data-condition='set interval'><span>Displayed intervals:</span><br>
                    {{ $ctrl->answerDisp("number",$optionsInterval) }}
                </div>
                </div>
            </div>
            <div id='ScaleOptions' class='itemOptionList'>
                <span>Settings:</span>
                <div id="ScaleList" class='optionsList'>
                    <?php
                    $optionsMin = ['min'=>'-9999','max'=>'9999','initial'=>'0','step'=>'1','units'=>'','name'=>'scalemin'];
                    $optionsMax = ['min'=>'-9999','max'=>'9999','initial'=>'0','step'=>'1','units'=>'','name'=>'scalemax'];
                    $optionsInitial = ['min'=>'-9999','max'=>'9999','initial'=>'0','step'=>'1','units'=>'','name'=>'initial'];
                    ?>
                    <span style='width:6em;'>Minimum:</span>{{ $ctrl->answerDisp("number",$optionsMin) }}<br>
                    <span style='width:6em;'>Maximum:</span>{{ $ctrl->answerDisp("number",$optionsMax) }}<br>
                    <span style='width:6em;'>Initial value:</span>{{ $ctrl->answerDisp("number",$optionsInitial) }}<br>
                    <span style='width:16em;'>Label for minimum end of scale:</span><input name="minLabel" type="text"><br>
                    <span style='width:16em;'>Label for maximum end of scale:</span><input name="maxLabel" type="text"><br>
                    <span style='width:16em;'>Show current value to patient?</span><select name='dispVal'><option value="yes">yes</option><option value="no">no</option></select><br>
                    <span style='width:16em;'>Show min/max values to patient?</span><select name='dispLabel'><option value="yes">yes</option><option value="no">no</option></select>
                </div>
            </div>
            <div id="FollowUpOptions" class='itemOptionList'>
                <span>Condition:</span>
                <div id='FollowUpList' class='optionsList'>
                    <span>This followup question will only be asked when your patient responds to <span id="DisplayQ"></span> with <span id="Conditionality"></span>: </span><div id='condition'></div>
                </div>
            </div>
            <div id='SignatureOptions' class='itemOptionList'>
                <span>Settings:</span>
                <div id='SignatureList' class='optionsList'>
                    <span>Ask for typed name as well as signature?</span>
                    <select name='typedName' id='typedName'>
                        <option value='yes'>yes</option>
                        <option value='no'>no</option>
                    </select>

                </div>
            </div>  
        </div>
        
        <div class="wrapper options">
	        <div class="button xsmall save">save question</div>
	        <div class='button xsmall cancel'>cancel</div>
        </div>
    </div>
    <div id='AddText'>
        <div>
            <div id='NarrativeOptions' class='itemOptionList'>
                <h3>Enter text and images as you'd like them displayed</h3>
                <div id='NarrativeList' class='optionsList'>
                    <div class='summernote'></div>
                </div>
            </div>            
        </div>
        <div class="options">
            <div class="button xsmall save">save text</div>
            <div class='button xsmall cancel'>cancel</div>
        </div>
    </div>
    
    <div id="AddFollowUp">
    </div>
    
    <div id="SectionOrder">
        <div style='display:inline-block'>
            <span>Section Order</span><div class='toggle save'>(save)</div><div class="toggle cancel">(cancel)</div>
            <div id="SectionList"></div>
        </div>
    </div>
        
    <div id="ItemFUOrder">
        <div style='display:inline-block'>
            <span>FollowUp Order</span><div class='toggle save'>(save)</div><div class="toggle cancel">(cancel)</div>
            <div id="ItemFUList"></div>
        </div>
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
            'markupStr' => "<div class='lds-ring dark' style='position:relative;top:50%,transform:translate(-50%,-50%)'><div></div><div></div><div></div><div></div></div>"
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

<script type="text/javascript" src="{{ asset('/js/launchpad/forms.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/jquery.datepick.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/jSignature.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/launchpad/form-builder.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/summernote-lite.min.js') }}"></script>
@if (isset($form))
<script src="{{ asset('/js/launchpad/form-edit.js') }}"></script>
@endif
