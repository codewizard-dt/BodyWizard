<?php

Use App\Form;

if (isset($form)){
    // dd($form);
    $formUID = $form->getkey();
    $formId = $form->form_id;
    $data = str_replace("'","\u0027",$form->full_json);
}

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
    
    
    <div id="AddItem" class='prompt'>
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
                <div class="toggle" data-target='#examples'>(<span>show</span> preview)</div>
            </div>
            <div id="examples" class='section'>
                <?php 
                
                $example = new Form();

                $ID = "textPreview";
                unset($options);
                $options = [];
                $options['name'] = $ID;
                echo "<div class='example'><div class='exampleType'><span>Text</span> type question</div>";
                echo '<div class="item"><div class="question">What is your question?</div><br>';
                $example->text($options);
                echo "</div>";
                echo '</div>'; 

                $options['name'] = "textboxPreview";
                echo "<div class='example'><div class='exampleType'><span>Text box</span> type question</div>";
                echo '<div class="item"><div class="question">What is your question?</div><br>';
                $example->textbox($options);
                echo "</div>";
                echo '</div>'; 

                $ID = "datePreview";
                echo "<div class='example'><div class='exampleType'><span>Date</span> type question</div>";
                echo '<div class="item"><div class="question">What is your question?</div><br>';
                $options = array("yearRange"=>"2017:2019","minDate"=>"null","maxDate"=>"null","name"=>"datePreview");
                $example->datePick($options);
                echo "</div>";
                echo "<div class='toggle refresh'>(update preview with the settings below)</div>";
                echo '</div>'; 

                $ID = "timePreview";
                echo "<div class='example'><div class='exampleType'><span>Time</span> type question</div>";
                echo '<div class="item"><div class="question">What is your question?</div><br>';
                $options = array('name'=>"timePreview");
                $example->timePick($options);
                echo "</div>";
                echo "<div class='toggle refresh'>(update preview with the settings below)</div>";
                echo '</div>'; 

                $ID = "numberPreview";
                echo "<div class='example'><div class='exampleType'><span>Number</span> type question</div>";
                echo '<div class="item"><div class="question">What is your question?</div><br>';
                $options = array("min"=>"0", "max"=>"5", "initial"=>"3", "step"=>"0.1", "units"=>"units","name"=>"numberPreview");
                $example->number($options);
                echo "</div>";
                echo "<div class='toggle refresh'>(update preview with the settings below)</div>";
                echo '</div>'; 

                
                $ID = "radioPreview";
                echo "<div class='example'><div class='exampleType'><span>Radio</span> type question (1 response only)</div>";
                echo '<div class="item"><div class="question">What is your question?</div><br>';
                $options = array("option 1", "option 2", "option 3", "etc");
                $example->radio($options);
                echo "</div>";
                echo "<div class='toggle refresh'>(update preview with the options below)</div>";
                echo '</div>'; 

                $ID = "checkboxesPreview";
                echo "<div class='example'><div class='exampleType'><span>Checkboxes</span> type question (1 or more response)</div>";
                echo '<div class="item"><div class="question">What is your question?</div><br>';
                $example->checkboxes($options);
                echo "</div>";
                echo "<div class='toggle refresh'>(update preview with the options below)</div>";
                echo '</div>'; 

                $ID = "dropdownPreview";
                echo "<div class='example'><div class='exampleType'><span>Dropdown</span> type question</div>";
                echo '<div class="item"><div class="question">What is your question?</div><br>';
                $example->dropdown($options);
                echo "</div>";
                echo "<div class='toggle refresh'>(update preview with the options below)</div>";
                echo '</div>'; 

                echo "<div class='example'><div class='exampleType'><span>Scale</span> type question</div>";
                echo '<div class="item"><div class="question">What is your question?</div><br>';
                $options = array("min"=>"0", "max"=>"100", "initial"=>"50", "minLabel"=>"label", "maxLabel"=>"label", "displayValue"=>"yes", "displayLabels"=>"yes","name"=>"scalePreview");
                $example->scale($options);
                echo "</div>";
                echo "<div class='toggle refresh'>(update preview with the settings below)</div>";
                echo '</div>'; 

                echo "<div class='example'><div class='exampleType'><span>Signature</span> type question</div>";
                echo '<div class="item"><div class="question">What is your question?</div><br>';
                $options = array("typedName"=>"yes");
                $example->signature($options);
                echo "</div>";
                echo "<div class='toggle refresh'>(update preview with the settings below)</div>";
                echo '</div>'; 
                
                ?>
                <div class='button hide xsmall'>hide preview</div>
            </div>

            <div id='Options' class='itemOptionList'>
                <span>Options:</span>
                <div id='OptionsList' class='optionsList'>
                    <div class='option'><input type='text'><div class="UpDown"><div class="up"></div><div class="down"></div></div></div>
                    <div class='option'><input type='text'><div class="UpDown"><div class="up"></div><div class="down"></div></div></div>
                    <div class='button xsmall add'>add option</div>
                </div>
            </div>
            <div id='NumberOptions' class='itemOptionList'>
                <span>Options:</span>
                <div id='NumberList'  class='optionsList'>
                    <?php
                    $option = new Form();
                    echo "<span>Minimum: </span>";
                    unset($options);
                    $options['min'] = "-9999";
                    $options['max'] = "9999";
                    $options['initial'] = "1";
                    $options['step'] = "1";
                    $options['units'] = "";
                    $options['name'] = 'min';
                    //$option->number($options);
                    // var_dump($options); 
                    $option->answerDisp("number",$options);
                    echo "<br>";
                    echo "<span>Maximum: </span>";
                    $options = array("min"=>"-9999", "max"=>"9999", "initial"=>"0", "step"=>"1", "units"=>"","name"=>"max");
                    $option->number($options);
                    echo "<br>";
                    echo "<span>Initial: </span>";
                    $options = array("min"=>"-9999", "max"=>"9999", "initial"=>"0", "step"=>"1", "units"=>"","name"=>"initial");
                    $option->number($options);
                    echo "<br>";
                    echo "<span>Step size: </span>";
                    $options = array("min"=>"-100", "max"=>"100", "initial"=>"1", "step"=>"0.1", "units"=>"","name"=>"step");
                    $option->number($options);
                    echo "<br>";
                    ?>
                    <span>Units: </span><input name='units' type="text"><br>
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
                    //$x = "1920, $D, $v, 1, ";
                    echo "<div data-settings='yearRange'><span>Displayed Date Range</span><br>";
                    unset($options);
                    $options['min'] = "1920";
                    $options['max'] = $D;
                    $options['initial'] = $v;
                    $options['step'] = "1";
                    $options['units'] = "";
                    $options['name'] = 'begin';
                    $example->answerDisp("number",$options);
                    $ID = "begin";
                    //$example->number($x,$ID);
                    echo "first year displayed<br>";
                    $options['initial'] = $d;
                    $options['name'] = 'end';
                    $example->answerDisp("number",$options);
                    echo "last year displayed</div>";

                    $x = "1, 100, 1, 1, ";
                    $ID = "minNum";
                    $t = "days, weeks, months, years";
                    echo "<br><div data-settings='minMax'><span>Selectable Date Range</span><br><label><input id='NoRestriction' type='checkbox'>no restrictions</label><br><div class='blockable'>";
                    unset($options);
                    $options['min'] = "1";
                    $options['max'] = "100";
                    $options['initial'] = "1";
                    $options['step'] = "1";
                    $options['units'] = "";
                    $options['name'] = 'minNum';
                    $example->answerDisp("number",$options);
                    $ID = "minType";
                    unset($options);
                    $options = array("days", "weeks", "months", "years","ID*minType");
                    $example->answerDisp("dropdown",$options);
                    echo " before current date<br>";
                    unset($options);
                    $options['min'] = "1";
                    $options['max'] = "100";
                    $options['initial'] = "1";
                    $options['step'] = "1";
                    $options['units'] = "";
                    $options['name'] = 'maxNum';
                    $ID = "maxNum";
                    $example->answerDisp("number",$options);
                    unset($options);
                    $options = array("days", "weeks", "months", "years","ID*maxType");
                    $example->answerDisp("dropdown",$options);
                    echo " after current date</div></div>";
                    
                    echo "<br><div id='DateTimeOptions'>
                    <span>Include time of day?</span><br>";
                    $options = ["yes","no","ID*IncludeTime"];
                    $example->answerDisp("radio",$options);
                    unset($options);
                    echo "</div>";
                    
                    ?>
                </div>
            </div>
            <div id='TimeOptions' class='itemOptionList'>
                <span>Options:</span>
                <div id="TimeList" class='optionsList'>
                <?php
                    echo "<div id='TimeRestriction' data-condition='yes'><span>Time restrictions</span><br>";
                    $options = ["allow any time","set range","set interval",'set initial value',"ID*TimeRestrict"];
                    $example->answerDisp("checkboxes",$options);
                    echo "</div>";
                    echo "<div id='TimeRange' data-condition='set range'><span>Allowed Range:</span><br>";
                    unset($options);
                    $options['setTime'] = "8:00am";
                    $options["name"] = 'minTime';
                    $example->answerDisp("time",$options);
                    $options['setTime'] = "8:00pm";
                    $options["name"] = 'maxTime';
                    echo "<span style='display:inline-block;transform:translateY(-90%);'>to</span>";
                    $example->answerDisp("time",$options);
                    echo "</div>";
                    echo "<div id='TimeIntervalBox' data-condition='set interval'><span>Interval:</span>";
                    unset($options);
                    $options['min'] = "0";
                    $options['max'] = "180";
                    $options['initial'] = "5";
                    $options['step'] = "5";
                    $options['units'] = "minutes";
                    $options['name'] = 'step';
                    $example->answerDisp("number",$options);
                    echo "</div>";
                    echo "<div id='TimeValue' data-condition='set initial value'><span>Initial time displayed:</span><br>";
                    unset($options);
                    $options['setTime'] = "8:00am";
                    $options['name'] = 'setTime';
                    $example->answerDisp("time",$options);
                    echo "</div>";
                ?>
                </div>
            </div>
            <div id='ScaleOptions' class='itemOptionList'>
                <span>Settings:</span>
                <div id="ScaleList" class='optionsList'>
                    <span style='width:6em;'>Minimum:</span>
                    <?php
                    unset($options);
                    $options['min'] = "-100";
                    $options['max'] = "100";
                    $options['initial'] = "0";
                    $options['step'] = "1";
                    $options['units'] = "";
                    $options['name'] = 'scalemin';
                    $example->answerDisp("number",$options);
                    ?>
                    <br>
                    <span style='width:6em;'>Maximum:</span>
                    <?php
                    $options['min'] = "-100";
                    $options['max'] = "100";
                    $options['initial'] = "100";
                    $options['step'] = "1";
                    $options['units'] = "";
                    $options['name'] = 'scalemax';
                    $example->answerDisp("number",$options);
                    $ID = "scalemax";
                    ?>
                    <br>
                    <span style='width:6em;'>Initial value:</span>
                    <?php
                    $options['min'] = "-100";
                    $options['max'] = "100";
                    $options['initial'] = "50";
                    $options['step'] = "1";
                    $options['units'] = "";
                    $options['name'] = 'initial';
                    $example->answerDisp("number",$options);
                    $ID = "initial";
                    ?>
                    <br>
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
        <div id='NarrativeOptions' class='itemOptionList'>
            <div id='NarrativeList' class='optionsList'>
                <div class='summernote'></div>
            </div>
        </div>
        <div class="button xsmall save">save text</div>
        <div class='button xsmall cancel'>cancel</div>
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

<script type="text/javascript" src="{{ asset('/js/launchpad/forms.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/jquery.datepick.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/jSignature.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/launchpad/form-builder.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/summernote-lite.min.js') }}"></script>
@if (isset($form))
<script src="{{ asset('/js/launchpad/form-edit.js') }}"></script>
@endif
