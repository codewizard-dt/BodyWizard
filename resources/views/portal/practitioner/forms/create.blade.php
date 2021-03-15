<?php

Use App\Form;

if (isset($form)){
    // dd($form);
  $formUID = $form->getkey();
  $formId = $form->form_id;
  $data = json_encode($form->full_json);
  $sections = json_encode($form->sections);
  $form_name = $form->form_name;
}else{
  $form_name = "";
}

$inputs = [];
  set($inputs, 'number.min', new_input('number',
      ['min', 'max', 'start', 'step', 'units', 'preLabel'], 
      [-99999, 99999, 0, 1, '', 'Minimum:']),
    'number.max',  new_input('number', 
      ['min', 'max', 'start', 'step', 'units', 'preLabel'], 
      [-99999, 99999, 0, 1, '', 'Maximum:']),
    'number.start',  new_input('number', 
      ['min', 'max', 'start', 'step', 'units', 'preLabel'], 
      [-99999, 99999, 0, 1, '', 'Initial:']),
    'number.step',  new_input('number', 
      ['min', 'max', 'start', 'step', 'units', 'preLabel'], 
      [-99999, 99999, 1, 0.1, 'units', 'Increment:']),
    'number.units',  new_input('text', 
      ['preLabel','placeholder'], 
      ['Units:','eg days, weeks, times/day, meals, etc']),
    'number.units.settings.required','false',
    'number.preLabel',  new_input('text', 
      ['preLabel','placeholder'], 
      ['Text label:','optional']),
    'number.preLabel.settings.required','false');
  set($inputs, 'text.placeholder', new_input('text',
      ['placeholder','preLabel'],
      ['(optional) disappears when you type','Placeholder text:']),
    'text.placeholder.settings.required','false');
  set($inputs, 'textbox.placeholder', new_input('textbox',
      ['placeholder','preLabel'],
      ['(optional) disappears when you type','Placeholder text:']),
    'textbox.placeholder.settings.required','false');
  set($inputs, 'date.limit',  new_input('list', 
      ['list', 'listLimit', 'preLabel'], 
      [['one','two','three','five','ten','no limit'], 1, 'Limit selection to']),
    'date.min.num',  new_input('number', 
      ['min', 'max', 'start', 'step', 'units', 'preLabel', 'labelClass'], 
      [0, 100, 0, 1, '', 'FROM', 'pink']),
    'date.min.num.settings.required','false',
    'date.min.type',  new_input('dropdown', 
      ['list'], 
      [['days','weeks','months','years']]),
    'date.min.type.settings.required','false',
    'date.min.dir',  new_input('dropdown', 
      ['list','postLabel'], 
      [['before','after'],'current date']),
    'date.min.dir.settings.required','false',
    'date.max.num',  new_input('number', 
      ['min', 'max', 'start', 'step', 'units', 'preLabel', 'labelClass'], 
      [0, 100, 0, 1, '', 'UNTIL', 'pink']),
    'date.max.num.settings.required','false',
    'date.max.type',  new_input('dropdown', 
      ['list'], 
      [['days','weeks','months','years']]),
    'date.max.type.settings.required','false',
    'date.max.dir',  new_input('dropdown', 
      ['list','postLabel'], 
      [['before','after'],'current date']),
    'date.max.dir.settings.required','false');
  set($inputs, 'bodyclick.size',  new_input('list', 
      ['listLimit','list','preLabel'], 
      ['1',['small','medium','large','x-large'],'Image size:']), 
    'bodyclick.bodyclickSample',  new_input('bodyclick', 
      ['size'], 
      ['small']));
  set($inputs, 'scale.dispVal',  new_input('dropdown', 
      ['list','preLabel'], 
      [['yes','no'],'Show current value?']), 
    'scale.dispLabel',  new_input('dropdown', 
      ['list','preLabel'], 
      [['yes','no'],'Show end values?']), 
    'scale.leftLabel', new_input('text',
      ['placeholder','preLabel'],
      ['appears to left of scale','Left-side text:']), 
    'scale.rightLabel', new_input('text',
      ['placeholder','preLabel'],
      ['appears to right of scale','Right-side text:']), 
    'scale.min', new_input('number',
      ['min','max','start','step','preLabel'],
      [-1000,1000,0,1,'Minimum value:']), 
    'scale.max', new_input('number',
      ['min','max','start','step','preLabel'],
      [-1000,1000,100,1,'Maximum value:']), 
    'scale.start', new_input('number',
      ['min','max','start','step','preLabel'],
      [-1000,1000,50,1,'Initial value:']));
  set($inputs, 
    // 'time.range', new_input('checkboxes', 
    //   ['preLabel','list','on_change_action'],
    //   ['Allow range:',['yes, select two times'],'Toggle.ele:#time2'],
    // ),
    // 'time.range.settings.required','false',
    // 'time.range.settings.save_as_bool','true',
    'time.min', new_input('time',
      ['preLabel'],
      ['Earliest allowed:']),
    'time.min.settings.required','false',
    'time.max', new_input('time',
      ['preLabel'],
      ['Latest allowed:']),
    'time.max.settings.required','false',
    'time.step', new_input('number',
      ['min','max','start','step','units','preLabel'],
      [1,1000,15,1,'minutes','Time increment:']),
    'time.step.settings.required','false');
  set($inputs, 'time2.min2', new_input('time',
      ['preLabel'],
      ['Earliest allowed:']),
    'time2.min2.settings.required','false',
    'time2.max2', new_input('time',
      ['preLabel'],
      ['Latest allowed:']),
    'time2.max2.settings.required','false',
    'time2.step2', new_input('number',
      ['min','max','start','step','units','preLabel'],
      [1,1000,15,1,'minutes','Time increment:']),
    'time2.step2.settings.required','false');
  set($inputs, 'SectionName', new_input('text',
      ['placeholder', 'no_shift', 'html_tag', 'input_css'],
      ['Section Name', true, 'h2', ['textAlign'=>'center']]), 
    'SectionName.settings.placeholder_shift', 'false');
?>

<div id='FormBuilder'>
  <div id="FormBuildProxy" @if(isset($form)) data-json='{{$form->toJson()}}' @endif data-mode='build'></div>

  <div id='AddSection' class='prompt'>
    <div class="message">
      <h1>New Section</h1>
      @include('layouts.forms.display.answer',array_merge($inputs['SectionName'],['name'=>'SectionName']))
    </div>
    <div class="options">
      <div class='button medium pink add'>add to form</div>
      <div class="button medium cancel">cancel</div>
    </div>
  </div>

  <div id="AddItem" class='prompt'>
    <div class='message'>
      <h2 class='purple'>New Question</h2>
        @include('layouts.forms.display.answer',[
          'type' => 'text',
          'name' => 'text',
          'options' => [
            'id' => 'AddItemText',
            'placeholder' => 'Ex: How are you today?',
            'preLabel' => 'Question Text:',
            'input_css' => '{"width":"20em"}',
            'labelClass' => 'black nowrap',
            'html_tag' => 'h4'
          ]
        ])
        @include('layouts.forms.display.answer',[
          'type' => 'dropdown',
          'name' => 'type',
          'options' => [
            'id' => 'AddItemType',
            'preLabel' => 'Answer Type:',
            'labelClass' => 'black nowrap',
            'html_tag' => 'h4',
            'list' => [
              'text %% single line text',
              'textbox %% text box',
              'number %% number',
              'bodyclick %% body click',
              'list %% styled list',
              'checkboxes %% checkboxes',
              'dropdown %% dropdown menu',
              'scale %% slider scale',
              'date %% date',
              'time %% time',
              'phone %% phone number',
              'email %% email address',
              'address %% physical address',
              'signature %% signature',
            ]
          ]
        ])
        @include('layouts.forms.display.answer',[
          'type' => 'dropdown',
          'name' => 'required',
          'options' => [
            'id' => 'AddItemRequired',
            'preLabel' => 'Required:',
            'labelClass' => 'black nowrap',
            'html_tag' => 'h4',
            'list' => [
              'yes, required',
              'no, optional',
            ]
          ]
        ])

      <div id="FollowUpOptions" class='itemOptionList followupOptionList' data-type='followup'>
        <div class="settingsLabel pink">When To Ask This Question</div>
        <div class='settingsInfo parentInfo pink'>This question will only be asked when its parent question has a specific response.</div>
        <div id='FollowUpList' class='optionsList'>
          <div class='flexbox condition' data-parent='["number","scale"]'>
            @include('layouts.forms.display.answer', [
              'type' => 'list',
              'name' => 'conditionNumberComparator',
              'options' => [
                'list' => ['less than','equal to','greater than'],
                'listLimit' => 'no limit'
              ],
            ])
            @include('layouts.forms.display.answer',[
              'type' => 'number',
              'name' => 'conditionNumberVal',
              'options' => ['min'=>0,'max'=>5,'start'=>2,'step'=>1,'units'=>'units'],
              ])
          </div>
          <div class='flexbox condition' data-parent='["list","dropdown","checkboxes"]'>
            @include('layouts.forms.display.answer', [
              'type' => 'list',
              'name' => 'conditionList',
              'options' => [
                'list' => ['a','b'],
              ],
            ])
          </div>
          <div class='flexbox condition' data-parent='time'>
            @include('layouts.forms.display.answer', [
              'type' => 'list',
              'name' => 'conditionTimeComparator',
              'options' => [
                'list' => ['before','exactly','after'],
                'listLimit' => 'no limit'
              ],
            ])
            @include('layouts.forms.display.answer', [
              'type' => 'time',
              'name' => 'conditionTime',
            ])
          </div>
        </div>
      </div>

      <div id='Options' class='itemOptionList' data-type='["list","checkboxes","dropdown"]'>
        <div class="settingsLabel">List the Answers to Choose From</div>
        <div class='settingsInfo'>add as many as you'd like. use enter key to move down. use arrows to rearrange</div>
        <div id='OptionsList' class='optionsList'>

          @include('layouts.forms.display.answer',[
            'type' => 'list',
            'name' => 'listLimit',
            'options' => [
              'list' => ['1','2','3','5','10','no limit'],
              'listLimit' => 1,
              'preLabel' => 'Limit selection to:'
            ],
          ])
          @include('layouts.forms.display.answer',[
            'type' => 'text',
            'name' => 'listOption',
            'settings' => ['required' => 'false', 'warning' => 'false','placeholder_shift'=>'false'],
            'options' => [
              'placeholder' => 'Ex: cold, warm, hot',
              'postLabel' => 'UpDownProxy',
              'ele_css' => ['flexWrap' => 'nowrap'],
              'input_css' => ['width' => '20em'],
            ]
          ])<br>
          <div class='button xsmall pink70 add'>add more</div>
          <div class='button xsmall yellow' data-action='Item.linked_to_show_linkable'>link to category</div>
        </div>
      </div>

      <div id='TextOptions' class='itemOptionList' data-type='["text","phone"]'>
        <div class="settingsLabel">Options</div>
        <div class="optionsList">
          <div>
            @foreach($inputs['text'] as $name => $options)
            @include('layouts.forms.display.answer', array_merge($options,compact('name')))
            @endforeach
          </div>
        </div>
        <div class='button xsmall yellow' data-action='Item.linked_to_show_linkable'>link to category</div>
      </div>

      <div id='TextBoxOptions' class='itemOptionList' data-type='["textbox","address"]'>
        <div class="settingsLabel">Options</div>
        <div class="optionsList">
          @foreach($inputs['textbox'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach
        </div>        
        <div class='button xsmall yellow' data-action='Item.linked_to_show_linkable'>link to category</div>
      </div>

      <div id='NumberOptions' class='itemOptionList' data-type='number'>
        <div class="settingsLabel">Options</div>
        <div id='NumberList'  class='optionsList'>
          @foreach($inputs['number'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach
        </div>
      </div>

      <div id='BodyClickOptions' class='itemOptionList' data-type='bodyclick'>
        <div class="settingsLabel">Options</div>
        <div id="BodyClickList" class="optionsList">
          @foreach($inputs['bodyclick'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach
        </div>
      </div>

      <div id='ScaleOptions' class='itemOptionList' data-type='scale'>
        <div class="settingsLabel">Options</div>
        <div class='settingsInfo'>Labels will always show on each side, but you can choose to show the values or not.<br>To approximate a 'visual analog scale', hide the values and set the range to '0 to 100'.</div>
        <div id="ScaleList" class='optionsList'>
          @foreach($inputs['scale'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach
        </div>
      </div>

      <div id='TimeOptions' class='itemOptionList' data-type='time'>
        <div class="settingsLabel">Options</div>
        <div class='settingsInfo'>These optional settings will restrict which times are available.</div>
          @include('layouts.forms.display.answer',[
            'type' => 'checkboxes',
            'name' => 'range',
            'options' => [
              'preLabel' => 'Ask for "Start/End" times?',
              'list' => ['yes, I want start/end times'],
              'listLimit' => 1,
              'on_change_action' => 'Toggle.ele:.is_range',
              'eleClass' => '!left full'
            ],
            'settings' => ['save_as_bool' => 'true']
          ])
        <div id="TimeList" class='optionsList'>
          <div id="time1">
            <h4 class="is_range" style='display:none;'>Start Time</h4>
          @foreach($inputs['time'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach            
          </div>
          <div id="time2" class='is_range' style='display:none;'>
            <h4>End Time</h4>
          @foreach($inputs['time2'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach            
          </div>
            
        </div>
      </div>

      <div id='SignatureOptions' class='itemOptionList' data-type='signature'>
        <div class="settingsLabel">Options</div>
        <div id='SignatureList' class='optionsList'>
          @include('layouts.forms.display.answer',[
            'type' => 'dropdown',
            'name' => 'typedName',
            'options' => [
              'list' => ['yes','no'],
              'preLabel' => 'Require typed name?'
            ]
          ])
        </div>
      </div>  

      <div id='DateOptions' class='itemOptionList' data-type='date'>
        <div class="settingsLabel">Options</div>
        <div class='settingsInfo'>Which Dates should be Available?<br><span>(ex: 1 week before/after current date)</span>
        </div>
        <span class='pink'>Set 'From' date, 'Until' date, neither, or both</span><br>
        <span class='little pink'>For current date, enter "0 days before or after"</span>
        <div id='DateList' class='optionsList'>
          @include('layouts.forms.display.answer',[
            'type' => 'list',
            'options' => ['list' => ['1','2','3','5','10','no limit'], 'listLimit'=>1,
              'preLabel' => 'Limit selection to'],
            'name' => 'date_limit'
          ])
          <div class='flexbox'>
            @foreach($inputs['date']['min'] as $name => $options)
            @include('layouts.forms.display.answer', array_merge($options,['name'=>'min_'.$name]))
            @endforeach
          </div>
          <div class='flexbox'>
            @foreach($inputs['date']['max'] as $name => $options)
            @include('layouts.forms.display.answer', array_merge($options,['name'=>'max_'.$name]))
            @endforeach
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
      <div id='NarrativeOptions' class='itemOptionList' data-type='narrative'>
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

