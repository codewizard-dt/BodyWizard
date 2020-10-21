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
    ['min', 'max', 'initial', 'step', 'units', 'preLabel'], 
    [-99999, 99999, 0, 1, '', 'Minimum:']));
  set($inputs, 'number.max',  new_input('number', 
    ['min', 'max', 'initial', 'step', 'units', 'preLabel'], 
    [-99999, 99999, 0, 1, '', 'Maximum:']));
  set($inputs, 'number.initial',  new_input('number', 
    ['min', 'max', 'initial', 'step', 'units', 'preLabel'], 
    [-99999, 99999, 0, 1, '', 'Initial:']));
  set($inputs, 'number.step',  new_input('number', 
    ['min', 'max', 'initial', 'step', 'units', 'preLabel'], 
    [-99999, 99999, 1, 0.1, 'units', 'Increment:']));
  set($inputs, 'number.units',  new_input('text', 
    ['preLabel','placeholder'], 
    ['Units:','eg days, weeks, times/day, meals, etc']));
  set($inputs,'number.units.settings.required','false');
  set($inputs, 'number.preLabel',  new_input('text', 
    ['preLabel','placeholder'], 
    ['Text label:','optional']));
  set($inputs,'number.preLabel.settings.required','false');
  set($inputs, 'text.placeholder', new_input('text',
    ['placeholder','preLabel'],
    ['(optional) disappears when you type','Placeholder text:']));
  set($inputs,'text.placeholder.settings.required','false');
  set($inputs, 'textbox.placeholder', new_input('textbox',
    ['placeholder','preLabel'],
    ['(optional) disappears when you type','Placeholder text:']));
  set($inputs,'textbox.placeholder.settings.required','false');
  set($inputs, 'date.limit',  new_input('list', 
    ['list', 'listLimit', 'preLabel'], 
    [['one','two','three','five','ten','no limit'], 1, 'Limit selection to']));
  set($inputs, 'date.min.num',  new_input('number', 
    ['min', 'max', 'initial', 'step', 'units', 'preLabel', 'labelClass'], 
    [0, 100, 0, 1, '', 'FROM', 'pink']));
  set($inputs,'date.min.num.settings.required','false');
  set($inputs, 'date.min.type',  new_input('dropdown', 
    ['list'], 
    [['days','weeks','months','years']]));
  set($inputs,'date.min.type.settings.required','false');
  set($inputs, 'date.min.dir',  new_input('dropdown', 
    ['list','postLabel'], 
    [['before','after'],'current date']));
  set($inputs,'date.min.dir.settings.required','false');
  set($inputs, 'date.max.num',  new_input('number', 
    ['min', 'max', 'initial', 'step', 'units', 'preLabel', 'labelClass'], 
    [0, 100, 0, 1, '', 'UNTIL', 'pink']));
  set($inputs,'date.max.num.settings.required','false');
  set($inputs, 'date.max.type',  new_input('dropdown', 
    ['list'], 
    [['days','weeks','months','years']]));
  set($inputs,'date.max.type.settings.required','false');
  set($inputs, 'date.max.dir',  new_input('dropdown', 
    ['list','postLabel'], 
    [['before','after'],'current date']));
  set($inputs,'date.max.dir.settings.required','false');
  set($inputs, 'bodyclick.size',  new_input('radio', 
    ['list','preLabel'], 
    [['small','medium','large','x-large'],'Image size:']));
  set($inputs, 'bodyclick.bodyclickSample',  new_input('bodyclick', 
    ['size'], 
    ['small']));
  set($inputs, 'scale.dispVal',  new_input('dropdown', 
    ['list','preLabel'], 
    [['yes','no'],'Show current value?']));
  set($inputs, 'scale.dispLabel',  new_input('dropdown', 
    ['list','preLabel'], 
    [['yes','no'],'Show end values?']));
  set($inputs, 'scale.leftLabel', new_input('text',
    ['placeholder','preLabel'],
    ['appears to left of scale','Left-side text:']));
  set($inputs, 'scale.rightLabel', new_input('text',
    ['placeholder','preLabel'],
    ['appears to right of scale','Right-side text:']));
  set($inputs, 'scale.min', new_input('number',
    ['min','max','initial','step','preLabel'],
    [-1000,1000,0,1,'Minimum value:']));
  set($inputs, 'scale.max', new_input('number',
    ['min','max','initial','step','preLabel'],
    [-1000,1000,100,1,'Maximum value:']));
  set($inputs, 'scale.initial', new_input('number',
    ['min','max','initial','step','preLabel'],
    [-1000,1000,50,1,'Initial value:']));
  set($inputs, 'time.min', new_input('time',
    ['preLabel'],
    ['Earliest available:']));
  set($inputs,'time.min.settings.required','false');
  set($inputs, 'time.max', new_input('time',
    ['preLabel'],
    ['Latest available:']));
  set($inputs,'time.max.settings.required','false');
  set($inputs, 'time.step', new_input('number',
    ['min','max','initial','step','units','preLabel'],
    [1,1000,15,1,'minutes','Time increment:']));
  set($inputs,'time.step.settings.required','false');
  set($inputs, 'SectionName', new_input('text',
    ['placeholder', 'no_shift', 'html_tag', 'inputCss'],
    ['Section Name', true, 'h2', ['textAlign'=>'center']]));
  set($inputs, 'SectionName.settings.placeholder_shift', 'false');
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
            'inputCss' => '{"width":"20em"}',
            'labelClass' => 'black nowrap',
            'labelCss' => '{"width":"6em","textAlign":"right"}',
            'html_tag' => 'h3'
          ]
        ])
        @include('layouts.forms.display.answer',[
          'type' => 'dropdown',
          'name' => 'type',
          'options' => [
            'id' => 'AddItemType',
            'preLabel' => 'Answer Type:',
            'labelClass' => 'black nowrap',
            'labelCss' => '{"width":"7.8em","textAlign":"right"}',
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
            'labelCss' => '{"width":"7.8em","textAlign":"right"}',
            'html_tag' => 'h4',
            'list' => [
              'yes, required',
              'no, optional',
            ]
          ]
        ])

      <div id='Options' class='itemOptionList' data-type='["list","checkboxes","dropdown"]'>
        <span class="settingsLabel">List the Answers to Choose From</span>
        <span class='little'>add as many as you'd like. use enter key to move down. use arrows to rearrange</span>
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
              'eleCss' => ['flexWrap' => 'nowrap'],
              'inputCss' => ['width' => '20em'],
            ]
          ])<br>
          <div class='button xxsmall pink70 add'>add more</div>
          <div class='button xxsmall yellow' data-action='forms.create.editor.options.link_to_model'>link to category</div>
        </div>
      </div>

      <div id='TextOptions' class='itemOptionList' data-type='text'>
        <span class="settingsLabel">Options</span>
        <div class="optionsList">
          <div>
            @foreach($inputs['text'] as $name => $options)
            @include('layouts.forms.display.answer', array_merge($options,compact('name')))
            @endforeach
          </div>
        </div>
        <div class='button xxsmall yellow' data-action='forms.create.editor.options.link_to_model'>link to category</div>
      </div>

      <div id='TextBoxOptions' class='itemOptionList' data-type='textbox'>
        <span class="settingsLabel">Options</span>
        <div class="optionsList">
          @foreach($inputs['textbox'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach
        </div>        
        <div class='button xxsmall yellow' data-action='forms.create.editor.options.link_to_model'>link to category</div>
      </div>

      <div id='NumberOptions' class='itemOptionList' data-type='number'>
        <span class="settingsLabel">Options</span>
        <div id='NumberList'  class='optionsList'>
          @foreach($inputs['number'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach
        </div>
      </div>

      <div id='BodyClickOptions' class='itemOptionList' data-type='bodyclick'>
        <span class="settingsLabel">Options</span>
        <div id="BodyClickList" class="optionsList">
          @foreach($inputs['bodyclick'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach
        </div>
      </div>

      <div id='ScaleOptions' class='itemOptionList' data-type='scale'>
        <span class="settingsLabel">Options</span>
        <span class='little'>Labels will always show on each side, but you can choose to show the values or not.<br>To approximate a 'visual analog scale', hide the values and set the range to '0 to 100'.</span>
        <div id="ScaleList" class='optionsList'>
          @foreach($inputs['scale'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach
        </div>
      </div>

      <div id='TimeOptions' class='itemOptionList' data-type='time'>
        <span class="settingsLabel">Options</span>
        <div class='purple'>These optional settings will restrict which times are available.</div>
        <div id="TimeList" class='optionsList'>
          @foreach($inputs['time'] as $name => $options)
          @include('layouts.forms.display.answer', array_merge($options,compact('name')))
          @endforeach
        </div>
      </div>

      <div id='SignatureOptions' class='itemOptionList' data-type='signature'>
        <span class="settingsLabel">Options</span>
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
        <span class="settingsLabel">Options</span>
        <h5>Which Dates should be Available?<br><span>(ex: 1 week before/after current date)</span>
        </h5>
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

      <div id="FollowUpOptions" class='itemOptionList followupOptionList' data-type='followup'>
        <span class="settingsLabel switch">When To Ask This Question</span>
        <div>
          <div>
            This question will only be asked when its parent question has a specific response.
          </div>
        </div>
        <div id='FollowUpList' class='optionsList'>
          <div class='parentInfo'></div>
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
              'options' => ['min'=>0,'max'=>5,'initial'=>2,'step'=>1,'units'=>'units'],
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

  <script type="text/javascript" src="{{ asset('/js/launchpad/form-builder.js') }}"></script>
