<?php

Use App\Form;

  $inputs = [];
    set($inputs, 'number.min', new_input('number',
        ['min', 'max', 'start', 'step', 'units', 'preLabel', 'initial'], 
        [-99999, 99999, 0, 1, '', 'Minimum:', 0]),
      'number.max',  new_input('number', 
        ['min', 'max', 'start', 'step', 'units', 'preLabel', 'initial'], 
        [-99999, 99999, 0, 1, '', 'Maximum:', 10]),
      'number.start',  new_input('number', 
        ['min', 'max', 'start', 'step', 'units', 'preLabel', 'initial'], 
        [-99999, 99999, 0, 1, '', 'Initial:', 5]),
      'number.step',  new_input('number', 
        ['min', 'max', 'start', 'step', 'units', 'preLabel', 'initial'], 
        [0, 99999, 1, 0.1, 'units', 'Increment:', 1]),
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
    set($inputs, 'bodyclick.bodyclickSample.settings.required','false');
    set($inputs, 'scale.dispVal',  new_input('dropdown', 
        ['list','preLabel'], 
        [['yes','no'],'Show current value']), 
      'scale.dispLabel',  new_input('dropdown', 
        ['list','preLabel'], 
        [['yes','no'],'Show min/max labels']), 
      'scale.leftLabel', new_input('text',
        ['placeholder','preLabel'],
        ['appears to left of scale','Left text label']), 
      'scale.rightLabel', new_input('text',
        ['placeholder','preLabel'],
        ['appears to right of scale','Right text label']), 
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
        ['placeholder', 'on_enter_action', 'html_tag', 'input_css'],
        ['Section Name', 'Section.create', 'h2', ['textAlign'=>'center']]), 
      'SectionName.settings.placeholder_shift', 'false');
  $categories = collect(["Patient","Practitioner","Staff Member","Service","Form","Complaint","Complaint Category"])
    ->map(function($model){ return ['text' => $model, 'value' => toKeyString($model), 'data' => ['plural' => plural($model)]]; })->toArray();

  $AutofillSettingsPrompt_buttons = [
    [ 'text' => 'change settings',
      'class_list' => 'pink',
      'action' => 'Item.AutofillSettingsModal',
    ],
    [ 'text' => 'reset', 
      'class_list' => 'pink70',
      'action' => 'Item.AutofillSettingsReset',
    ],
    [ 'text' => 'close', 
      'class_list' => 'cancel',
    ],
  ];
  $AutofillSettingsPrompt_kv_options = [
    'transform_fx' => "Item.AutofillSettingsDisplay"
  ];
?>

<div id='FormBuilder'>
  <div id="FormBuildProxy" @if(isset($form)) data-json='{{$form->toJson()}}' @endif data-mode='build'></div>

  <div id='AddSection' class='prompt'>
    <div class="message">
      <h1>New Section</h1>
      @include('layouts.forms.display.answer',array_merge($inputs['SectionName'],['name'=>'SectionName']))
    </div>
    <div class="options">
      <div class='button medium pink add' data-action="Section.create">add to form</div>
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
            'preLabel' => 'Question Type:',
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
            ],
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
              'true %% yes, required',
              'false %% no, optional',
            ],
            'save_as_bool' => true
          ],

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
              'options' => [],
            ])
          </div>
        </div>
      </div>

      <div id="AutofillOptions" class='itemOptionList' data-type='autofill'>
        <div id="AutofillModel" class='settingsLabel'>Autofill Options</div>
        <div id="AutofillInfo" class='settingsInfo'>none</div>
        <div class="ButtonBox">
          <div id='AutofillSettingsBtn' class="button pink xsmall" data-action="Item.AutofillSettingsPrompt">autofill restrictions</div>
          <div class='button xsmall pink70' data-action='Item.ShowAutofillList'>change category</div>            
          <div class='button xsmall pink70' data-action='Item.AutofillProxyReset'>clear</div>
        </div>
        @include('layouts.forms.display.answer',[
          'type' => 'list',
          'name' => 'listLimit',
          'options' => [
            'list' => ['1','2','3','5','10','no limit'],
            'listLimit' => 1,
            'preLabel' => 'Limit selection to:',
            'eleClass' => '!left max',
          ],
        ])
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
              'preLabel' => 'Limit selection to:',
              'eleClass' => '!left',
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
          ])
          <div class="button_box">
            <div class='button small pink70 add'>add more</div>
            <div class='button small yellow' data-action='Item.ShowAutofillList'>autofill with category</div>            
          </div>
        </div>
      </div>

      <div id='TextOptions' class='itemOptionList' data-type='["text","phone"]'>
        <div class="settingsLabel">Single Line Text Options</div>
        <div class="optionsList">
          <div>
            @foreach($inputs['text'] as $name => $options)
            @include('layouts.forms.display.answer', array_merge($options,compact('name')))
            @endforeach
          </div>
        </div>
        <div class='button small yellow' data-action='Item.ShowAutofillList'>add category popup</div>
      </div>

      <div id='TextBoxOptions' class='itemOptionList' data-type='textbox'>
        <div class="settingsLabel">Text Box Options</div>
        <div class="optionsList">
          @foreach($inputs['textbox'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach
        </div>        
        <div class='button small yellow' data-action='Item.ShowAutofillList'>add category popup</div>
      </div>


      <div id='NumberOptions' class='itemOptionList' data-type='number'>
        <div class="settingsLabel">Number Options</div>
        <div id='NumberList'  class='optionsList'>
          @foreach($inputs['number'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach
        </div>
      </div>

      <div id='BodyClickOptions' class='itemOptionList' data-type='bodyclick'>
        <div class="settingsLabel">Body Click Options</div>
        <div id="BodyClickList" class="optionsList">
          @foreach($inputs['bodyclick'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach
        </div>
      </div>

      <div id='ScaleOptions' class='itemOptionList' data-type='scale'>
        <div class="settingsLabel">Scale Options</div>
        <div class='settingsInfo'>Labels will always show on each side, but you can choose to show the values or not.<br>To approximate a 'visual analog scale', hide the values and set the range to '0 to 100'.</div>
        <div id="ScaleList" class='optionsList'>
          @foreach($inputs['scale'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach
        </div>
      </div>

      <div id='TimeOptions' class='itemOptionList' data-type='time'>
        <div class="settingsLabel">Time Options</div>
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
        <div class="settingsLabel">Signature Options</div>
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
        <div class="settingsLabel">Date Options</div>
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
      <div class="button medium pink save" data-action="Item.create">save item</div>
      <div class='button medium cancel'>cancel</div>
    </div>
  </div>

  <div id="LinkedItem" class="modalForm">
    <div id="AutofillList" class='modalForm center max'>
      <div class='box pink m-bottom_100'>
        <h3 class='bold m-y-25'>Select a Category to Use</h3>
        <div>This will provide a list of the chosen category for the user to select from.</div>
      </div>
      <div class="List" data-header='Available Categories' data-action="Item.SelectAutofillModel" data-json='{{json_encode($categories)}}' data-ul_class='horizontal center box'></div>
    </div>
    <div id="AutofillSettingsPrompt" class='OptionBox' data-header="Current Autofill Settings" data-message="No restrictions. All available items will be loaded." data-buttons="{{json_encode($AutofillSettingsPrompt_buttons)}}" data-key_value_options="{{json_encode($AutofillSettingsPrompt_kv_options)}}"></div>
  </div>
</div>
