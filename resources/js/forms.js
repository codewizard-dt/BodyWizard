import {system, practice, log, Features} from './functions';
import {model, Models} from './models';

class FormEle {
  constructor(proxy) {
    let options = $(proxy).data(), json = options.json;
    this.mode = ifu(options.mode, 'display');
    this.json = ifu(options.json, {});
    this.action = ifu(options.action, null);
    for (let attr in this.json){
      this[attr] = this.json[attr];
    }
    if (this.settings === null) this.settings = {};
    this.ele = $(`<div/>`,{class:'form central full',id: (this.form_name || '').toKeyString()});
    $(proxy).replaceWith(this.ele);
    this.ele.data('class_obj',this);
    this.section_list = new Features.List({header:'Sections'});
    this.section_array = [];
    let form = this;
    this.add_header();
    this.section_ele = $(`<div/>`,{class:'sections'}).appendTo(this.ele);
    this.add_buttons();
    blur(this.ele,'loading');
    if (this.json.sections && this.json.sections.notEmpty()) this.json.sections.forEach(section => this.section_add(section));
    forms.initialize.signatures();
    this.waiting = setInterval(this.linked_answer_check.bind(this),200);

    if (this.mode == 'settings') {
      this.settings_manager = new Models.SettingsManager({
        obj: this,
        save: this.autosave_send.bind(this),
        callback: this.autosave_callback.bind(this),
      }, 'edit');
      this.settings_icons_create();
      this.section_array.forEach(section => section.settings_icons_create());
    }
    this.settings_apply();
    if (this.mode == 'build') this.autosave = new Autosave({
      ele: $("#FormBuilder"),
      delay: 10000,
      send: this.autosave_send.bind(this),
      callback: this.autosave_callback.bind(this)
    });

    // log({form:this}, `new FormEle`);
  }

  add_header () {
    let form = this;
    if (this.mode == 'build') {
      this.header_editable = new Editable({
        name: 'form name',
        html_tag: 'h1',
        initial: this.form_name,
        callback: (ev, value) => {this.form_name = value; form.autosave.trigger()},
      });
      this.ele.removeClass('central full');
      this.header = this.header_editable.ele.appendTo(this.ele);
      this.section_options = new Features.OptionBox();
      this.section_options.ele.appendTo(this.ele);
      this.section_options.add_button({text: 'add section',action: blurTop.bind(null, '#AddSection'),class_list: 'pink xsmall'});
      this.section_options.add_button({text: 'preview form', class_list: 'pink70 xsmall', 
          action: function(){Form.preview_by_uid(form.form_uid)}});
      this.section_list.ele.appendTo(this.section_options.body);
    }else if (this.mode == 'preview') {
      this.label = $(`<h1>Preview</h1>`).insertBefore(this.ele);
      this.header = $(`<h1 class='center'><span>${form.form_name}</span></h1>`).appendTo(this.ele);
      this.blurb = $(`<div class='blurb flexbox inline purple marginBig bottomOnly'><div>The form will be displayed to those filling it out as currently displayed within the yellow border.</div></div>`).insertAfter(this.label);
      this.ele.css({border:'2px solid var(--yellow70)',marginTop:'1em',padding:'1em',borderRadius:'3px'});      
    }else if (this.mode == 'settings'){
      this.header = $(`<h1 class='center'><span>${form.form_name}</span></h1>`).appendTo(this.ele);
      this.blurb = $(`<div class='blurb flexbox inline purple marginBig bottomOnly'><div>The form is displayed within the yellow border with its current settings.<br>Changes are saved automatically</div></div>`).insertBefore(this.header);
      this.ele.css({border:'2px solid var(--yellow70)',marginTop:'1em',padding:'1em',borderRadius:'3px'});
    }else {
      this.header = $(`<h1 class='center'><span>${form.form_name}</span></h1>`).appendTo(this.ele);
    }
  }
  add_buttons () {
    if (this.mode == 'modal') {
      this.modal = new Features.OptionBox({css:{width:'100%',border:'0',maxWidth:'unset'}});
      this.modal.ele.insertBefore(this.ele);
      this.modal.add_info(this.ele);
      this.submit_btn = this.modal.add_button({text:'save',action:this.action});
      this.modal.add_button({text:'dismiss',class_list:'cancel small'});
    } else if (this.mode == 'preview') {
      this.submit_btn = new Features.Button({text:'save',action:null,class_list:'pink',tooltip:{message:'Submit not available in preview mode'}});
      this.ele.append(this.submit_btn.ele);
    } else if (this.mode == 'settings') {
      this.submit_btn = new Features.Button({text:'save',action:null,class_list:'pink',tooltip:{message:'Submit not available in preview mode'}});
      this.ele.append(this.submit_btn.ele);
    } else if (this.mode != 'build') {
      this.submit_btn = new Features.Button({text:'save', action:this.action, class_list:'pink'});
      this.ele.append(this.submit_btn.ele);
    } 
  }

  settings_apply (time = 0) {
    if (this.mode == 'build') return;
    let manager = this.settings_manager || new Models.SettingsManager({obj:this});
    let get = function (name) {return manager.get_setting(name)};
    if (get('display.HideFormTitle')) this.header.slideFadeOut(time);
    else this.header.slideFadeIn(time);
    // let submit_btn = this.submit_btn.ele || this.submit_btn;
    if (get('display.SubmitButton') == 'hide') this.submit_btn.ele.slideFadeOut(time);
    else this.submit_btn.ele.slideFadeIn(time);
  }
  settings_icons_create () {
    let manager = this.settings_manager,
      general = manager.popup_create(),
      submit_btn_hide = manager.popup_create();
    general.icon.css({width:'3em',height:'3em'}).appendTo(this.blurb);
    general.add({name: 'display', type: 'checkboxes',
      options: {
        list: ['Hide Form Title','Minify','Show Question Numbers'],
        save_as_bool: true,
      },
    });
    if (user.isSuper()) {
      general.add({name: 'system', type: 'dropdown',
        options:{
          list: ['true','false'],
          listLimit: 1,
          preLabel: 'System Form:',
          labelHtmlTag: 'h4',
          save_as_bool: true,
        }, initial: 'false'
      });      
    }
    this.submit_btn.ele.wrap(`<div class='flexbox'></div>`);    
    submit_btn_hide.icon.css({width:'3em',height:'3em'}).insertAfter(this.submit_btn.ele);    
    submit_btn_hide.add({name: 'display', type: 'list',
      options: {
        list: ['auto (recommended)','hide'],
        listLimit: 1,
        preLabel: 'Submit Button',
        usePreLabel: true,
      },
    });
  }

  linked_answer_check () {
    let form = this;
    if (this.answer_objs.every(answer => !answer.waiting_for_list)) {
      clearInterval(form.waiting);
      unblur({ele:form.ele});
    }
  }
  section_add (options) {
    let section = new Section(options, this.mode);
    this.section_array.push(section);
    this.section_ele.append(section.ele);

    let list_item = this.section_list.add_item({
      text: section.name,
      class_list: 'flexbox',
      action: function() {section.ele.smartScroll()},
    });
    if (this.mode == 'build') {
      let arrows = new Features.UpDown({
        action:'change_order',
        selector: 'li',
        callback: this.section_sort_callback.bind(this),
        css:{fontSize:'1.1em',margin:'0.2em 0.4em 0.2em 0.4em'}}),
        remove_icon = new Image;
      remove_icon.src = `/images/icons/red_x.png`;
      $(remove_icon).css({
        width:'1.1em',height:'1.1em',marginLeft:'0.1em',opacity:0.6,cursor:'pointer'
      }).on('click', section.delete.bind(section)).addOpacityHover();
      let section_options = $("<span class='flexbox'></span>").append(arrows.ele, remove_icon);
      list_item.addClass('spread').append(section_options);
    }
    section.settings_apply();
  }
  section_sort_callback (ev) {
    let form = this, sections = this.section_ele.children('.section'), new_order = this.section_list.values, section_eles = this.section_ele;
    // log({this:this,sections,new_order});
    this.section_array = [];
    new_order.forEach(section_name => {
      let ele = sections.filter((s,section) => $(section).getObj().name == section_name);
      section_eles.append(ele);
      form.section_array.push(ele.getObj());
    })
    form.autosave.trigger();
  }
  item_search (text = null, allow_multiple = false) {
    let matches = [];
    try {
      let search_array = text.split("."), sections = [], section_name = search_array.notSolo() ? search_array.shift() : null;
      if (section_name) sections = this.section_search(section_name,true);
      else sections = this.section_array;
      if (search_array.length > 1) throw new Error(`too many search keys ${search_array}`);
      sections.forEach(section => {
          let section_match = section.item_search(search_array[0], {allow_multiple:true, form_search:true});
          if (section_match) matches.push(...section_match);
      })
      if (matches.isEmpty()) throw new Error(`no item matching '${search_array[0]}'`);
      else if (!matches.isSolo() && !allow_multiple) throw new Error(`search returned ${matches.length} items, limited to one`);
    } catch (error) {
      log({error});
      matches = [];
    }
    return matches.isEmpty() ? null : allow_multiple ? matches : matches[0];
  }
  section_search (name = null, allow_multiple = false) {
    let matches = [];
    try {
      if (!name) throw new Error('no name given for search');
      let name_search = name.toKeyString();
      this.section_array.forEach(section => {
        if (section.name.toKeyString() == name_search) matches.push(section);
      })
      if (matches.isEmpty()) throw new Error(`no section matching '${name}'`);
      else if (!matches.isSolo() && !allow_multiple) throw new Error(`search returned ${matches.length} sections, limited to one`);
    } catch (error) {
      log({error});
      matches = [];
    }
    return matches.isEmpty() ? null : allow_multiple ? matches : matches[0];
  }
  get form_db () {
    let obj = {sections: []};
    ['form_id', 'form_name', 'form_uid', 'settings', 'version_id'].forEach(attr => obj[attr] = this[attr]);
    for (let section of this.section_array){
      obj.sections.push(section.section_db);
    }
    return obj;
  }
  get response () {
    let sections = {}, all_pass = true;
    this.section_array.forEach(section => {
      sections[section.name.toKeyString()] = section.response;
    })
    for (let section in sections) {
      if (sections[section] === false) all_pass = false;
    }
    return all_pass ? sections : false;
  }
  get answer_objs () {
    let answers = [];
    this.section_array.forEach(section => {
      section.items.forEach(item => {
        answers.push(...item.answer_objs_recursive);
      })
    })
    return answers;
  }
  reset_answers () {
    Answer.reset_all();
    // this.ele.find('.answer').each((a,answer) => $(answer).data('class_obj').to_initial_value());
  }
  fill_by_response (json) {
    this.followup_time = 0;
    try {
      this.section_array.forEach(section => {
        let response = json[section.name.toKeyString()];
        if (response) section.fill_by_response(response);
      })
    } catch (error) {
      log({error});
    }
    this.followup_time = undefined;
  }
  fill_by_key_value_object (json) {
    this.reset_answers();
    for (let search_str in json) {
      let value = json[search_str];
      try {this.item_search(search_str).value = value}
      catch (error) {log({error})}
    }
  }
  static submit (ev) {
    log({ev});
  }
  static waiting_for_list (ele) {
    let answers = ele.find('.answer');
    if (answers.dne()) return false;
    return answers.get().some(answer => {
      let obj = $(answer).getObj('answer',false);
      if (!obj || $(answer).closest('.form').exists()) return false;
      return obj.waiting_for_list || false;
    });
  }
  async autosave_send () {
    let data = {
      uid: this.form_uid,
      columns: this.form_db,
    }
    if (this.settings_manager) {
      this.settings_manager.has_changes = false;
      this.section_array.forEach(section => section.has_changes_reset());      
    }
    log(data,'form autosave send data');
    return $.ajax({
      url:'/save/Form',
      method: 'POST',
      data: data,
    })    
  }
  async autosave_callback (data) {
    if (data.form_uid) {
      this.form_uid = data.form_uid;
      this.form_id = data.form_id;
      this.version_id = data.version_id;
    }
  }
}
class FormResponse {
  constructor (json = null) {
    try {
      if (!json || typeof json != 'object') throw new Error('json not valid');
      this.json = json;
    } catch (error) {
      log({error,json});
    }
  }
  section_search (name = null) {
    let section = null;
    try {
      if (!name) throw new Error('no name given for search');
      let name_search = name.toKeyString();
      section = this.json[name_search];
      if (section == undefined) {
        let sections = [];
        for (let section_name in this.json) {
          if (section_name.includes(name_search)) sections.push(this.json[section_name]);
        }
        if (sections.notSolo()) throw new Error(`multiple (${sections.length}) sections found matching '${name}'`);
        else if (sections.isEmpty()) throw new Error(`no sections found matching ${name}`);
        else section = sections[0];
      }
    } catch (error) {
      log({error});
      section = null;
    }
    return section == null ? null : section;
  }
  item_search (text = null, options = {}) {
    let item = null, items = [], sections = [],
      exact_match = options.exact_match || false;
    try {
      let search_array = text.split('.');
      if (search_array.isSolo()) sections = this.all_sections;
      else {
        let section_name = search_array.shift().toKeyString(), section = this.section_search(section_name);
        if (section) sections.push(section);
      }
      let text_search = search_array[0];
      sections.forEach(section => {
        items.push(...this.item_search_recursive(text_search, section));
      })
      if (items.notSolo()) throw new Error(`multiple items (${items.length} found matching ${text_search}`);
      else if (items.isEmpty()) item = null;
      else item = items[0];
    } catch (error) {
      log({error,items});
      item = null;
    }
    return item;
  }
  item_search_recursive (text, items, exact_match = false) {
    let matches = [];
    try {
      let search_array = text.toLowerCase().split(' '), form_response = this;
      for (let item_name in items) {
        if (exact_match && item_name.toLowerCase().includes(text.toLowerCase().replace(/ /g,''))) matches.push(items[item_name]);
        else if (search_array.every(str => item_name.toLowerCase().includes(str))) matches.push(items[item_name]);
        let followups = items[item_name].items;
        if (followups) matches.push(...form_response.item_search_recursive(text, followups, exact_match));
      }
      // items.forEach(item => {
      //   if (exact_match && item.options.text.toLowerCase.includes(text.toLowerCase())) matches.push(item);
      //   else if (search_array.every(str => item.options.text.toLowerCase().includes(str))) matches.push(item);
      //   if (item.items && item.items.notEmpty()) matches.push(...form_response.item_search_recursive(text, item.items, exact_match));
      // })
    } catch (error) {
      log({error});
    }
    return matches;

    // let matches = [];
    // for (let item_name in items) {
    //   if (exact_match) 
    //   if (item_name.includes(text)) matches.push(items[item_name]);
    //   let followups = items[item_name].items;
    //   if (followups) matches.push(...this.item_search_recursive(text, followups));
    // }
    // return matches;
  }
  response_for (text = null) {
    let item = this.item_search(text), answer = item ? item.answer : null;
    return answer;
  }
  set_response_for (text, value) {
    let item = this.item_search(text);
    item.answer = value;
    // log({item,value});
  }
  get all_sections () {
    let sections = [];
    for (let section_name in this.json) {
      sections.push(this.json[section_name]);
    }
    return sections;
  }
}
class Section {
  constructor(options, mode = 'display') {
    this.mode = mode;
    this.name = ifu(options.name, '');
    this.settings = options.settings || {};
    this.ele = $(`<div class='section'></div>`);
    this.ele.data('class_obj',this);
    this.add_header();
    this.item_list = $(`<div/>`,{class:'Items flexbox'}).appendTo(this.ele);

    this.items = [];
    if (this.mode == 'build') this.item_list.append(`<div class='no_items item'>No items</div>`);
    // if (this.mode == 'settings') {
    //   this.settings_icons_create();
    // }
    this.add_buttons();
    if (options.items) options.items.forEach(item_obj => this.add_item(item_obj));
  }

  get section_db() {
    let items = [];
    for (let item of this.items){
      items.push(item.item_db);
    }
    return {
      name: this.name,
      items: items,
      settings: this.settings,
    }
  }
  get item_count () {return this.items.length}
  get item_eles () {return this.item_list.children('.item').not('.no_items')}
  item_ele (index) {return $(this.item_eles.get(index))}
  get no_items_ele () {return this.item_list.children('.no_items')}
  get response() {
    let items = {}, all_pass = true;
    this.items.forEach(item => {
      items[item.text_key] = item.response;
    })
    for (let item in items) {
      if (items[item] === false) all_pass = false;
    }
    return all_pass ? items : false;
  }
  get form() {return this.ele.getObj('form')}
  
  settings_icons_create () {
    this.settings_manager = new Models.SettingsManager({
      obj: this,
      autosave: this.form.settings_manager.autosave,
    }, 'edit');
    let header = this.settings_manager.popup_create();
    this.header.wrap(`<div class='flexbox left'></div>`);    
    header.icon.css({width:'3em',height:'3em',marginRight:'0.5em'}).insertBefore(this.header);    
    header.add({name: 'display', type: 'checkboxes',
      options: {
        list: ['Hide Section Title'],
        save_as_bool: true,
      },
    });
    header.add({name: 'display', type: 'list', 
      options: {
        preLabel: 'Item Alignment',
        labelHtmlTag: 'h4',
        usePreLabel: true,
        list: ['left','center','right','justify'],
        listLimit: 1,
      }, initial: 'justify'});
    header.add({name: 'display', type: 'list', 
      options: {
        preLabel: 'Item Height',
        labelHtmlTag: 'h4',
        usePreLabel: true,
        list: ['auto','stretch'],
        listLimit: 1,
      }, initial: 'stretch'});
    this.ele.find('.item').not('.no_items').get().forEach(item => $(item).getObj().settings_icons_create());
  }
  settings_apply (time = 0) {
    if (this.mode == 'build') return;
    let manager = this.settings_manager || new Models.SettingsManager({obj:this});
    let get = function (name) {return manager.get_setting(name)};
    if (get('display.HideSectionTitle')) this.header.slideFadeOut(time);
    else this.header.slideFadeIn(time);
    if (get('display.ItemAlignment')) this.item_list.removeClass('left right center justify').addClass(get('display.ItemAlignment'));
    if (get('display.ItemHeight')) this.item_list.removeClass('autoItemHeight stretchItemHeight').addClass(`${get('display.ItemHeight')}ItemHeight`);
  }

  add_header () {
    if (this.mode == 'build'){
      let name_input = new Editable({
        name: 'section name',
        initial: this.name,
        html_tag: 'h2',
        callback: (ev,value) => {this.name = value; this.form.autosave.trigger()}
      });
      this.header = name_input.ele.appendTo(this.ele);
    }else this.header = $(`<h2>${this.name}</h2>`).appendTo(this.ele);
  }
  add_buttons () {
    if (this.mode == 'build'){
      this.buttons = $(`<div class='flexbox left'></div>`).insertAfter(this.item_list);
      new Button ({
        text: 'add question', 
        class_list: 'pink xsmall addQuestion', 
        action: this.item_create.bind(this), 
        appendTo: this.buttons
      });
      new Button ({
        text: 'add text', 
        class_list: 'pink xsmall addText', 
        action: function(){alert('nope')}, 
        appendTo: this.buttons
      });
    }
  }

  item_index (indices = null) {
    let item = null;
    try {
      if (typeof indices == 'string') indices = indices.split('.');
      else if (typeof indices == 'number') indices = [indices];
      else if (!Array.isArray(indices)) throw new Error('indices requires an array or a string of indices separated by "."');
      let items = this.items;
      while (!indices.isEmpty()) {
        let i = indices.shift();
        item = items[i];
        if (!item) throw new Error(`Item index ${i} does not exist`);
        items = item.items;
      }
    } catch (error) {
      log({error});
      item = null;
    }
    return item;
  }
  item_search (text = null, options = {}) {
    let allow_multiple = options.allow_multiple || false,
      form_search = options.form_search || false,
      exact_match = options.exact_match || false;
    let matches = [], items = this.items;
    try {
      if (!text) throw new Error('no search text given');
      matches.push(...this.item_search_recursive(text, items, exact_match));
      if (matches.isEmpty()) throw new Error(`no item matching '${text}'`);
      else if (!matches.isSolo() && !allow_multiple) throw new Error(`search returned ${matches.length} items, restricted to one`);
    } catch (error) {
      if (!form_search) log({error});
      matches = [];
    }
    return matches.isEmpty() ? null : allow_multiple ? matches : matches[0];
  }
  item_search_recursive (text, items, exact_match = false) {
    let matches = [];
    try {
      let search_array = text.toLowerCase().split(' '), section = this;
      items.forEach(item => {
        if (exact_match && item.options.text.toLowerCase.includes(text.toLowerCase())) matches.push(item);
        else if (search_array.every(str => item.options.text.toLowerCase().includes(str))) matches.push(item);
        if (item.items && item.items.notEmpty()) matches.push(...section.item_search_recursive(text, item.items, exact_match));
      })
    } catch (error) {
      log({error});
    }
    return matches;
  }
  add_item (item_obj, action = 'append', index = null) {
    let new_item = new Item(item_obj, this, this.mode);
    try {
      if (action == 'append') {
        this.items.push(new_item);
        this.item_list.append(new_item.ele);
      } else if (action == 'insert') {
        log({new_item,action});
        this.items.splice(index, 0, new_item);
        new_item.ele.insertAfter(this.item_list.children('.item').get(index));
      } else if (action == 'edit') {
        this.items[index].ele.replaceWith(new_item.ele);
        this.items.splice(index, 1, new_item);
      }

      if (this.item_list.children('.item').not('.no_items').length > 0) this.item_list.children('.no_items').hide();
      else this.item_list.children('.no_items').show();

      forms.initialize.signatures();
    } catch (error) {
      log({error,item_obj,action,index});
      return false;
    }
    return new_item;
  }
  item_count_check () {
    let none = this.item_list.children('.no_items');
    if (this.item_count == 0) none.slideFadeIn();
    else none.slideFadeOut();
  }
  fill_by_response (json) {
    try {
      this.items.forEach(item => {
        let response = json[item.text_key];
        if (response) item.fill_by_response(response);
        else item.value = null;
      })
    } catch (error) {
      log({error});
    }
  }
  delete () {
    let section = this, form = this.ele.getObj('form'), index = form.section_array.indexOf(this);
    confirm({
      header: `Delete "${this.name}"?`,
      message: `This cannot be undone and will include all ${this.item_count} items.`,
      callback_affirmative: function(){
        unblur();
        form.section_list.remove_by_index(index);
        form.section_array.splice(index,1);
        section.ele.slideFadeOut(function(){$(this).remove()});
        form.autosave.trigger()
      }
    })
  }
  item_create () {
    let modal = $('#AddItem');
    $('#FollowUpOptions').hide();
    log({this:this});
    blurTop(modal).data({'item':null,'parent':this,'form':this.form});
  }
  item_delete (item) {
    log(`section delete item`);
  }

  has_changes_reset () {
    this.settings_manager.has_changes = false;
    this.items.forEach(item => item.has_changes_reset());
  }
  static create () {
    let name = $('#AddSection').find('input').verify('Section Name Required!');
    if (!name) return false;
    forms.current.section_add({name});
    unblur();
    return true;
  }
}
class Item {
  constructor(options, parent, mode = 'display') {
    this.options = options;
    this.mode = mode;
    this.parent = parent;
    this.question = $(`<div/>`,{class:'question',text:options.text});
    this.text_key = options.text.toKeyString();
    // if (this.text_key == "EndDateOptional") log({item:this,settings:options.settings})
    this.answer = new Answer(options, mode);
    this.type = options.type;
    this.settings = options.settings || {};
    this.ele = $('<div/>',{class:`item ${this.type}`});
    this.ele.append(this.question,this.answer.ele).data(options);
    this.question.wrap(`<div/>`);
    this.ele.data('class_obj',this);
    this.items = [];
    let existing_items = options.followups || options.items || [], editor = forms.create.editor;
    delete this.options.followups;
    if (['number','list','checkboxes','dropdown','scale','time'].includes(options.type)) {
      this.item_list = $(`<div/>`,{class:'Items flexbox'}).appendTo(this.ele);
      if (this.mode == 'build') this.item_list.append(`<div class='no_items item'>No items</div>`);
      // else this.item_list.hide();
      if (existing_items.notEmpty()) existing_items.forEach(item_obj => this.add_item(item_obj, 'append'));
      if (mode != 'build') this.item_list.find('.item').hide();
    }
    if (mode == 'build') this.add_build_options();
    this.settings_apply();
  }
  add_build_options () {
    let edit_options = $(`<span/>`).appendTo(this.question);
    $(`<div/>`,{class:'toggle edit',text:'(edit)'}).on('click',this.edit.bind(this)).appendTo(this.question);
    $(`<div/>`,{class:'toggle copy',text:'(copy)'}).on('click',this.copy.bind(this)).appendTo(this.question);
    $(`<div/>`,{class:'toggle delete',text:'(delete)'}).on('click',this.delete.bind(this)).appendTo(this.question);
    if (this.options.condition) {
      $('<div/>',{class:'condition',text: `Condition: ${this.condition_str}`}).insertAfter(this.question);
    }
    let insert_btns = [
      {text:'new item', class_list:'addQuestion', action: function(){
        let modal = $("#AddItem"), item = $(this).getObj('item'), parent = item.parent, form = item.form, action = 'insert';
        if (parent instanceof Item) parent.show_followup_options();
        blurTop(modal).data({item,parent,form,action});
      }},
      {text:'copied item', class_list:'paste disabled', action: function(){
        alert("paste");
      }},
    ];
    let insert_options = new InsertOptions({buttons:insert_btns});
    insert_options.ele.prependTo(this.ele);
    this.arrows = new Features.UpDown({
      action:'change_order',
      selector: '.item',
      callback: this.sort_callback,
      css:{margin:'2px 0.3em',position:'absolute',top:'0.5em',right:'0.5em'},
      preLabel:'change item order'
    });
    this.ele.append(this.arrows.ele);
    let current_item = this, item_list = this.item_list;
    if (item_list) {
      this.item_list_wrapper = $(`<div/>`,{class:'toggleWrap'}).css({margin:'0.75em 0',padding:'1em',borderRadius:'5px',border:'1px solid var(--purple30)'}).insertBefore(item_list);
      this.item_list_wrapper_header = $(`<h4>Follow Up Items <span class='count'>(${this.item_count})</span></h4>`);
      let wrapper = this.item_list_wrapper, btn_wrap = $('<div class="buttonWrapper"></div>');
      let callback_hide = function(){wrapper.children('.buttonWrapper').slideFadeOut();}, 
        callback_show = function(){wrapper.children('.buttonWrapper').slideFadeIn();}, 
        btn_item = new Button ({text: 'add question', class_list: 'pink70 xsmall addQuestion', action: function(){
            let modal = $("#AddItem"), item = null, parent = current_item, action = 'append', index = null,form = parent.form;
            log({item,parent,action,index,form});
            current_item.show_followup_options();
            blurTop(modal).data({item,parent,action,index,form});
          }, css: {marginBottom:'0'}
        });
      wrapper.append(this.item_list_wrapper_header,item_list, btn_wrap.append(btn_item.ele));
      this.item_list_toggle = new Toggle({
        toggle_ele: this.item_list_wrapper_header,
        target_ele: item_list,
        initial_state: 'hidden',
        callback_hide,
        callback_show,
      });
      item_list.css({marginTop:'0.75em'});

    }
    // })
  }
  show_followup_options (condition = null) {
    let type = this.type, all = $('#FollowUpOptions').slideFadeIn().find('.condition'), match = all.filter((c,cond) => $(cond).data('parent') == type || $(cond).data('parent').includes(type)), info = $('#FollowUpOptions').find('.parentInfo');
    all.not(match).slideFadeOut(0);
    match.slideFadeIn();
    info.html(`Which response(s) to <i>'${this.options.text}'</i> should prompt this question?`);
    let answers = Answer.get_all_within(match,false);
    if (['list','checkboxes','dropdown'].includes(type)) {
      match.find('li').remove()
      this.answer.options.list.forEach(option => {
        let split = Answer.split_values_and_text(option);
        match.find('ul').append(`<li data-value='${split.value}'>${split.text}</li>`);
      })
    } else if (type == 'number') {
      Answer.find(answers, {name:'conditionNumberVal'}).update_obj(this.answer);
    } else log(`${type} not found for followups`);
    log({match,condition});
    if (condition) {
      answers.forEach(answer => {
        log({answer})
        answer.value = condition[answer.name];
      })      
    }
  }
  settings_icons_create () {
    this.settings_manager = new Models.SettingsManager({
      obj: this,
      autosave: this.form.settings_manager.autosave,
    }, 'edit');
    let popup = this.settings_manager.popup_create();
    this.question.wrap(`<div class='flexbox left'></div>`);    
    popup.icon.css({width:'1.5em',height:'1.5em',marginRight:'0.5em'}).insertAfter(this.question);    
    popup.add({name: 'display', type: 'checkboxes',
      options: {
        list: ['Condensed','Start New Line'],
        save_as_bool: true,
      },
    });
    popup.add({name: 'display', type: 'list', 
      options:{
        list: ['auto', 'full', 'half', 'third'],
        preLabel: 'Width',
        usePreLabel: true,
        labelHtmlTag: 'h4',
        listLimit: 1,
      }})
  }
  settings_apply() {
    if (this.mode == 'build') return;
    let manager = this.settings_manager || new Models.SettingsManager({obj:this});
    let get = function (name) {return manager.get_setting(name)};
    if (get('display.Condensed')) this.ele.addClass('condensed');
    else this.ele.removeClass('condensed');
    if (get('display.StartNewLine') && !this.ele.prev().hasClass('newLine')) $(`<div class='newLine'></div>`).insertBefore(this.ele);
    else if (this.ele.prev().hasClass('newLine')) this.ele.prev().remove();
    if (get('display.Width')) {
      this.ele.removeClass('auto full half third');
      this.ele.addClass(get('display.Width'));
    }
  }

  bg_flash (time = 2000) {
    let i = this;
    i.ele.addClass('pink10BgFlash');
    setTimeout(function(){i.ele.removeClass('pink10BgFlash')},time);
  }
  item_count_check () {
    let none = this.item_list.children('.no_items');
    if (this.item_count == 0) none.slideFadeIn();
    else none.slideFadeOut();
  }
  sort_callback (ev) {
    let parent = $(ev.target).parents('.Items').first(), items = parent.children('.item').not('.no_items'), insert_eles = parent.children('.insert_item_options'), parent_obj = parent.getObj();
    parent_obj.items = [];
    items.each((i,item) => {
      $(insert_eles.get(i)).insertBefore(item);
      parent_obj.items.push($(item).getObj());
    });
    parent_obj.form.autosave.trigger();
    // log({parent:parent_obj});
  }
  get answer_objs_recursive () {
    let answers = [];
    answers.push(this.answer);
    if (this.items && this.items.notEmpty()) this.items.forEach(item => answers.push(...item.answer_objs_recursive));
    return answers;
  }
  get condition_str () {
    let str = 'null', c = this.options.condition;
    if (['number','scale'].includes(c.type)) {
      str = `${c.conditionNumberComparator.smartJoin({str:'or'})} ${c.conditionNumberVal}`;
    }
    else if (["list","dropdown","checkboxes"].includes(c.type)) {
      // log({c});
      if (this.parent.options.linked_to) {
        log({c});
      }
      str = c.conditionList.map(condition => Answer.split_values_and_text(condition).text).smartJoin({str:'or'});
    }
    else if (c.type == 'time') {
      str = `${c.conditionTimeComparator.smartJoin({str:'or'})} ${c.conditionTime}`;
    }
    if (str == 'null') log(this,`condition type not found`);
    return str;
  }
  get item_count () {return this.items.length}
  get item_eles () {return this.item_list.children('.item').not('.no_items')}
  get items_visible () {return this.item_eles.filter(':visible')}
  get items_visible_count () {return this.item_eles.filter(':visible').length}
  item_ele (index) {return $(this.item_eles.get(index))}
  get no_items_ele () {return this.item_list.children('.no_items')}

  get form () {return this.ele.closest('.form').getObj()}
  get followup_count () {
    let count = 0;
    count += this.items.length;
    this.items.forEach(item => {count+=item.followup_count});
    return count;
  }
  followup_count_update () {
    this.ele.children('.toggleWrap').children('.toggle_ele').children('.toggleText').text(`Follow Up Items (${this.followup_count})`);
  }
  get followup_json () {
    let array = [];
    for (let followup of this.items) {
      array.push(followup.options);
    }
    return array;
  }
  get item_db() {
    let items = [];
    for (let item of this.items){
      items.push(item.item_db);
    }
    this.options.items = items;
    return this.options;
  }
  get response() {
    let answer = this.answer.verify();
    if (answer === false) return false;
    let items = {}, all_pass = true;
    this.items.forEach(item => {
      if (item.ele.is(':visible')) items[item.text_key] = item.response;
    })
    for (let item in items) {
      if (items[item] === false) all_pass = false;
    }
    return all_pass ? {
      question: this.options.text,
      answer: answer,
      items: items
    } : false;
  }
  get index () {return this.parent.items.indexOf(this)}
  fill_by_response (json) {
    try {
      this.value = json.answer;
      this.items.forEach(item => {
        let response = json.items ? json.items[item.text_key] : null;
        if (response) item.fill_by_response(response);
        else item.to_initial_value();
      })
    } catch (error) {
      log({error});
    }
  }
  to_initial_value () {
    this.answer.to_initial_value();
  }
  set value (value) {
    this.answer.value = value;
  }
  edit () {
    let modal = $('#AddItem'), item = this, parent = this.parent, form = this.form, action = 'edit', options = item.options;
    blurTop(modal).data({item, parent,form, action});
    let text = options.text, required = options.settings.required, type = options.type;
    $('#AddItemType').find('select').val(type).change();
    $("#AddItemText").find('input').val(text);
    log({required});
    $('#AddItemRequired').getObj().value = required;
    log({options});
    if (parent instanceof Item) {
      parent.show_followup_options(options.condition);
      // log({condition:options.condition});
    } else $('#FollowUpOptions').hide();
    let answers = Answer.get_all_within(modal.find('.itemOptionList'));
    function named () {let name = [...arguments]; return Answer.find(answers, {name})};
    for (name in options.options) {
      if (name == 'list') {
        let list = options.options.list;
        forms.create.editor.options.list.reset();
        forms.create.editor.options.list.fill(list);
      } else {
        let match = named(name);
        if (match) match.value = options.options[name];        
      }
    }
    let linked_to = options.options.linked_to || null;
    modal.data({linked_to});
    if (linked_to) {
      forms.create.editor.options.linked_text_update_editor(linked_to);
      log(`linked to ${linked_to}`);
      alert('update linked-to');
    }
  }
  copy () {
    log('copy item');
  }
  delete () {
    log('delete item');
    let index = this.index, parent = this.parent;
    parent.items.splice(index, 1);
    parent.item_ele(index).slideFadeOut(function(){$(this).remove()});
    if (parent instanceof Item && this.mode == 'build') {
      parent.followup_count_update();
      if (parent.item_count == 0) parent.no_items_ele.slideFadeIn();
      else parent.no_items_ele.slideFadeOut();
    }
    // this.item_list_wrapper_header.find('.toggleText').text(`Follow Up Items (${this.item_count})`);

    this.form.autosave.trigger();
    log({index,parent});

    // autosave.trigger();
  }
  add_item (item_obj, action = null, index = null){
    let new_item = new Item(item_obj, this, this.mode);
    try {
      if (action == 'append') {
        this.items.push(new_item);
        this.item_list.append(new_item.ele);
      } else if (action == 'insert') {
        this.items.splice(index, 0, new_item);
        new_item.ele.insertAfter(this.item_list.children('.item').get(index));
      } else if (action == 'edit') {
        this.items[index].ele.replaceWith(new_item.ele);
        this.items.splice(index, 1, new_item);
      }

      if (this.item_list.children('.item').not('.no_items').length > 0) this.item_list.children('.no_items').hide();
      else this.item_list.children('.no_items').show();
      this.followup_count_update();

      forms.initialize.signatures();
    } catch (error) {
      log({error,item_obj,action,index});
      return false;
    }
    return new_item;
  }

  item_create () {
    log('item create item');
  }
  item_delete (item) {
    log('item delete item');
  }
  has_changes_reset () {
    this.settings_manager.has_changes = false;
    this.items.forEach(item => item.has_changes_reset());
  }  
  static create () {
    let modal = $("#AddItem"), working = modal.data(), 
      item = working.item, parent = working.parent, form = working.form,
      index = item ? parent.items.indexOf(item) : null, action = working.action;
    log({working});
    log({item,parent,form,index,action});

    try{
      let required = $("#AddItemRequired").verify(), obj = {
          text: $("#AddItemText").verify('Question text is required'),
          type: $("#AddItemType").verify('Answer type is required'),
          settings: {required},
          options: {}
        };
      if (!obj.text || !obj.type || !obj.settings.required) return;
      if (parent instanceof Item) obj.condition = {type: parent.type};
      let all_pass = true, list = [], answers = Answer.get_all_within($('.optionsList')), linked_to = $('#OptionsList').data('linked_to');
      answers.forEach(answer => {
        let name = answer.options.name, response = answer.verify('required');
        if (response == null && answer.settings.required) all_pass = false;
        if (name == 'listOption' && response != null) list.push(`${$(answer).data('value')?`${$(answer).data('value')}%%`:''}${response}`);
        else if (name.includes('condition')) obj.condition[name] = response;
        else obj.options[name] = response;
      })

      if (list.notEmpty()) obj.options.list = list;
      if (linked_to) obj.options.linked_to = linked_to;
      let check = Item.check_obj(obj);
      log({all_pass,check});
      if (!all_pass || !check) return;

      if (action == 'edit') {
        obj.followups = item.followup_json;
        obj.settings = item.settings.merge({required});
      }
      obj.options.name = obj.text.toKeyString();

      let added = parent.add_item(obj, action, index);
      if (added) {
        form.autosave.trigger();
        unblur();
      }
    }catch(error){
      log({error},'item add error');
    }
  }
  static check_obj (obj) {
    // log({obj});
    let options = obj.options, type = obj.type, answers = Answer.get_all_within($('.optionsList')); 
    function named () {let name = [...arguments]; return Answer.find_inputs(answers, {name})};
    
    try {
      if (type == 'number') {
        if (options.min > options.max) throw new Warning({message: `Min must be less than Max`,ele: named('min','max')});
        if (options.initial < options.min || options.initial > options.max) throw new Warning({message:`Initial must be between min and max`,ele: named('min','max','initial')});
      }
    } catch (error) {
      if (error instanceof Warning) error.show();
      else log({error,obj});
      return false;
    }
    return true;
  }
}
class Answer {
  constructor(data, mode = 'display'){
    this.type = data.type;
    this.mode = mode;
    if (!this[this.type]) throw new Error(`'${this.type}' not defined in class Answer`);
    this.options = data.options;
    this.name = data.options.name || data.name;
    // if (this.name == "EndDateOptional") log({data,settings:data.settings});
    this.settings = {required: true, warning: true, autocomplete: false}.merge(data.settings || {});
    this.save_as_bool = this.options.save_as_bool || this.settings.save_as_bool || false;
    this.initial = data.initial || null;
    for (let s in this.settings){
      if (typeof this.settings[s] == 'string') this.settings[s] = this.settings[s].toBool();
    }
    let html_tag = ifu(this.options.html_tag, 'div');
    this.ele = $(`<${html_tag} class='answer ${this.type}'></${html_tag}>`);
    if (this.options.id) this.ele.attr('id',this.options.id);
    this.ele.data('class_obj',this);
    if (['date','number','time'].includes(this.type)) this.ele.addClass('flexbox left');
    this[this.type]();
    if (this.options.name && this.input) {
      this.input.attr('name',this.options.name);
      this.input.addClass(this.options.name);
    }

    let label_css = system.validation.json(this.options.labelCss);
    if (this.options.preLabel) {
      this.preLabel = $(`<${this.options.labelHtmlTag || 'span'}/>`,{
        class:this.options.labelClass || '',
        text:this.options.preLabel
      }).css({padding:'0 0.5em'}).prependTo(this.nowrap || this.ele);
      this.ele.addClass('flexbox left');
      if (label_css) this.preLabel.css(label_css);
    }
    if (this.options.postLabel) {
      this.postLabel = $(`<${this.options.labelHtmlTag || 'span'}/>`,{
        class:this.options.labelClass || '',
        text:this.options.postLabel
      }).css({padding:'0 0.5em'}).appendTo(this.nowrap || this.ele);
      this.ele.addClass('flexbox left');
      if (label_css) this.postLabel.css(label_css);
    }

    // if (this.options.inputCss) {
    //   let validCss = this.options.inputCss.json_if_valid();
    //   if (validCss) this.input.css(validCss);
    //   else log(this,'invalid css');
    // }
    this.input.css(system.validation.json(this.options.inputCss) || {});
    this.ele.css(system.validation.json(this.options.eleCss) || {});
    if (!this.settings.autocomplete) this.input.attr('autocomplete','off');
    // if (this.options.eleCss) {
    //   let validCss = this.options.eleCss.json_if_valid();
    //   if (validCss) this.ele.css(validCss);
    //   else log(this,'invalid css');
    // }
    if (this.options.eleClass) {
      let classes = this.options.eleClass.split(' ');
      classes.forEach(c => {
        if (c.includes('!')) this.ele.removeClass(c.replace('!',''));
        else this.ele.addClass(c);
      })
    }
    if (this.options.on_change_action && typeof this.options.on_change_action == 'string') this.options.on_change_action = this.options.on_change_action.to_fx();
    if (this.options.after_change_action && typeof this.options.after_change_action == 'string') {
      this.options.after_change_action = this.options.after_change_action.to_fx();
      // log({fx:this.options.after_change_action});
    }
    if (['date','time'].includes(this.type) || this.options.linked_to) this.input.attr('autocomplete','off');
    this.to_initial_value();
  }

  verify (string = null) {
    let str = string || this.if_null_str || 'this question is required', i = this.input;
    if (this.get() == null && this.settings.required) {
      i.smartScroll({
        offset: getEm() * 4,
        callback: function(){i.warn(str);}
      });
      return false;
    }
    // if (this.linked_selection && this.linked_selection.notEmpty()) return this.linked_uids;
    return this.get();
  }
  to_initial_value () {
    this.value = this.initial;
    this.hold = false;
    if (this.type == 'number' && this.initial && !this.options.initial) this.value = null;
  }
  set value (value) {
    if (value === null) this.hold = false;
    if (this.options.linked_to) {
      if (this.waiting_for_list) {
        let answer = this;
        setTimeout(function(){answer.value = value;},100);
        return;
      }
      this.linked_select_uid(value);
      return;
    }
    if (value === 'true') value = true;
    if (value === 'false') value = false; 
    if (['text', 'textbox', 'number', 'dropdown', 'time', 'date'].includes(this.type)) {
      if (typeof value == 'string') {
        let split = Answer.split_values_and_text(value);
        this.input.val(split.text).data('value',split.value);        
      } else this.input.val(value);
    }
    else if (this.type == 'list'){
      this.input.resetActives();
      this.input.find('li').filter((l,li) => {
        if (Array.isArray(value)) {
          return value.some(v => {
            if (typeof v == 'string') return $(li).data('value') == v || $(li).data('value').toKeyString() == v;
            else if (typeof v == 'number') return l == v;
          });
        } else {
          if (typeof value == 'string') return $(li).data('value') == value || $(li).data('value').toKeyString() == value;
          else if (typeof value == 'number') return l == value;
        }
      }).addClass('active');
    } else if (this.type == 'checkboxes') {
      let boxes = this.input.find('input');
      boxes.attr('checked',false);
      boxes.filter((b,box) => {
        if (Array.isArray(value)) {
          return value.some(v => {
            if (typeof v == 'string') return $(box).attr('value') == v;
            else if (typeof v == 'number') return b == v;
          });
        } else {
          if (typeof value == 'string') return $(box).attr('value') == value;
          else if (typeof value == 'number') return b == value;
        }
      }).attr('checked',true);
    }
    if (value === true || value === false) {
      let values_true = ['yes','true'], values_false = ['no','false'], values = value ? values_true : values_false;
      let match = this.input.find('option, li').filter((i,input) => {
        return values.some(v => $(input).text().includes(v));
      });
      if (match.is('li')) match.addClass('active');
      else this.input.val(match.text());
    }
    this.placeholder_shift();
    this.followup_show();
  }
  get has_filter () {return this.ele.isInside('.filter')}
  get has_label () {return this.options.preLabel || this.options.postLabel || false;}
  get filter () {return this.ele.closest('.filter').getObj()}
  get linked_uids () {
    let uids = this.linked_selection.map(selection => selection.uid);
    return this.linked_limit == 1 ? uids[0] : uids;
  }

  on_change (ev) {
    this.followup_show();
    if (this.has_filter) this.filter.update();
    if (this.options.on_change_action) this.options.on_change_action(this, ev);
    if (this.options.after_change_action) this.options.after_change_action(this, ev);
  }
  followup_show (time = 400) {
    let item_ele = this.ele.closest('.item');
    if (item_ele.dne() || this.mode == 'build') return;
    let followup_time = this.ele.getObj('form').followup_time, item = item_ele.getObj();
    time = followup_time != undefined ? followup_time : time;
    let items = item.items, value = this.get(), show_me_eles = $();
    if (items && items.notEmpty()) {
      items.forEach(followup => {
        let c = followup.options.condition, show_me = false;
        if (['number','scale'].includes(c.type)){
          if (c.conditionNumberComparator.includes('less than') && value < c.conditionNumberVal) show_me = true;
          if (c.conditionNumberComparator.includes('greater than') && value > c.conditionNumberVal) show_me = true;
          if (c.conditionNumberComparator.includes('equal to') && value == c.conditionNumberVal) show_me = true;
        }else if (c.type == 'time'){
          let time_to_check = moment(value,'h:mma'), time = moment(c.conditionTime, 'h:mma');
          if (c.conditionTimeComparator.includes('before') && time_to_check.isBefore(time)) show_me = true;
          if (c.conditionTimeComparator.includes('exactly') && time_to_check.isSame(time)) show_me = true;
          if (c.conditionTimeComparator.includes('after') && time_to_check.isAfter(time)) show_me = true;
        }else if (['list','checkboxes'].includes(c.type)){
          if (value) {
            if (typeof value == 'string') value = [value];
            if (value.some(v => c.conditionList.includes(v))) show_me = true;
          }
        }else if (c.type == 'dropdown'){
          if (c.conditionList.includes(value)) show_me = true;
        }else log(`c.type not found ${c.type} `);
        if (show_me) followup.ele.slideFadeIn(time);
        else followup.ele.slideFadeOut(time);
      })
      // if (show_me_eles.exists()) item.item_list.add(show_me_eles).slideFadeIn(time);
      // else item.item_list.slideFadeOut(time);
    }
  }
  update_obj (new_obj) {
    // this.options = new_obj.options;
    this.update(new_obj);
  }
  list_update (new_obj) {
    let i = this.input;
    i.children('li').remove();
    new_obj.options.list.forEach(o => i.append(`<li>${o}</li>`));
  }
  placeholder_shift () {
    if (this.ele.closest('#AddItem').exists() || this.ele.isInside('.item') || !this.options.placeholder || this.options.preLabel || this.settings.placeholder_shift === false) return;
    let i = this;
    if (!this.placeholder_label) this.placeholder_label = $('<span/>',{text:this.options.placeholder}).css({opacity:0,position:'absolute',left:'0.75em',top:'0.5em',color:'var(--purple)',width:'100%',whiteSpace:'nowrap',overflow:'hidden'}).insertBefore(this.input);
    if (this.get() != null && !this.placeholder_visible) {
      this.placeholder_label.css({zIndex:2}).animate({opacity:1,left:0,top:'-1.5em'});
      this.placeholder_visible = true;
    }
    else if (this.get() == null && this.placeholder_visible) {
      this.placeholder_label.animate({opacity:0,left:'0.75em',top:'0.5em'},function(){$(this).css({zIndex:0})});
      this.placeholder_visible = false;
    }
  }
  async linked_list_get(model, columns = []) {
    this.waiting_for_list = true;
    let list = await Models.Model.get_list({model,obj:this,columns});
    this.waiting_for_list = false;
    return list;
  }
  async linked_popup_create () {
    this.waiting_for_list = true;
    let model = this.options.linked_to, answer = this;
    this.linked_ele = $(`<div/>`).css({
      display:'inline-block', position:'absolute', top: '100%', left: 0, zIndex: 50, backgroundColor: 'var(--white97)', outline: 'none'
    }).attr('tabindex',0).appendTo(this.ele).hide().on('blur',function(ev){
      let within_answer = answer.ele.find(ev.relatedTarget).exists();
      if (!within_answer) answer.linked_ele.slideFadeOut();
    })
    this.linked_list = new Features.List({
      header: 'Type to search',
      header_html_tag: 'h5',
      css: {backgroundColor:'var(--white97)',border:'2px solid var(--gray97)',borderRadius:'5px',padding:'0.5em 1em'},
      cssLiOnly: {width:'max-content',maxWidth:'20em'},
      filter: this,
    });
    this.linked_limit = this.options.listLimit || 1;
    this.linked_list.ele.appendTo(this.linked_ele);
    let list = this.linked_list, columns = this.options.linked_columns || [], data_list = await this.linked_list_get(this.options.linked_to, columns);
    data_list.forEach(option => {
      list.add_item({text:option.name, value:option.uid, entire_li_clickable:true, action:answer.linked_select_click.bind(answer)});
    })
    this.input.on('keyup', this.on_change.bind(this))
    .on('focus',function(){ answer.linked_ele.slideFadeIn() }).on('blur',function(ev){
      let within_answer = answer.ele.find(ev.relatedTarget).exists();
      if (!within_answer) {
        answer.followup_show();
        answer.linked_ele.slideFadeOut();
      }
    })
    this.waiting_for_list = false;
  }
  linked_select_click (ev) {
    let target = $(ev.target).closest('li'), val = target.data('value'), text = target.find('span').text();
    let selection = this.linked_selection || [];
    if (this.linked_limit == 1) {
      selection = [{uid:val,text:text}];
      this.linked_popup_hide();
    }
    this.linked_selection = selection;
    this.linked_text_update();
  }
  linked_find_item_by_uid (uid) {
    let list = this.linked_list;
    if (!list) {
      log({answer:this,list}, `answer: ${this.name}`); return;
    }
    return this.linked_list.items.filter((i,item) => {
      return Number($(item).data('value')) == Number(uid);
    });
  }
  linked_find_data_by_uid (uid) {
    if (typeof uid != 'number') uid = Number(uid);
    let list = Models.Model.list(this.options.linked_to), item = list.find(m => m.uid == uid);
    return {uid:item.uid,text:item.name};
  }
  linked_select_uid (uids) {
    try {
      if (uids == null) this.linked_selection = null;
      else {
        if (!uids.is_array()) uids = [uids];
        this.linked_selection = uids.map(uid => this.linked_find_data_by_uid(uid));
      }
      if (this.type == 'list') {
        this.ele.resetActives();
        if (uids) this.ele.find('li').filter((l,li) => uids.some(uid => $(li).data('value') == uid)).addClass('active');
      } else if (this.type == 'checkboxes') {
        alert('help');
      } else {
        this.linked_text_update(); this.placeholder_shift();  
      }
    } catch (error) {
      log({error,uids});
    }
  }
  linked_text_update () {
    let value = this.linked_selection ? system.validation.array.join(this.linked_selection.map(selected => selected.text)) : null;
    this.input.val(value);
  }
  linked_popup_hide () {this.linked_ele.slideFadeOut(this.placeholder_shift.bind(this));}
  linked_filter () {
    let value = this.get();
    if (value) {

    } else this.linked_list;
  }
  linked_update_editor () {
    let model = this.options.linked_to;
    log({model});
    forms.create.editor.options.linked_text_update_editor(model);
  }

  password () {
    this.type = 'text';
    this.text();
    this.ele.addClass('text');
    this.input.attr('type','password');
  }
  async text () {
    this.input = $(`<input>`).appendTo(this.ele);
    if (this.options.placeholder) this.input.attr('placeholder', this.options.placeholder);
    this.get = () => {
      if (this.linked_selection && this.linked_selection.notEmpty()) return this.linked_uids;
      let v = $.sanitize(this.input.val());
      return (v != '') ? v : null;
    }
    this.placeholder_visible = false;
    if (this.options.name == 'phone') system.validation.input.phone(this.input);
    if (this.options.name == 'email') system.validation.input.email(this.input);
    if (this.options.name == 'username') system.validation.input.username(this.input);
    if (this.options.placeholder) this.input.on('keyup blur',this.placeholder_shift.bind(this));
    if (this.options.linked_to) await this.linked_popup_create();
  }
  async textbox () {
    this.input = $(`<textarea/>`).appendTo(this.ele);
    if (this.options.placeholder) this.input.attr('placeholder', this.options.placeholder);
    this.if_null_str = 'boxxy';
    this.get = () => {
      if (this.linked_selection && this.linked_selection.notEmpty()) return this.linked_uids;      
      let v = $.sanitize(this.input.val());
      return (v != '') ? v : null;
    }    
    this.placeholder_visible = false;
    if (this.options.placeholder) this.input.on('keyup blur',this.placeholder_shift.bind(this));    
    if (this.options.linked_to) await this.linked_popup_create();
  }
  async number () {
    this.input = $(`<input>`);
    if (this.options.units) this.units_ele = $(`<span/>`,{text:this.options.units,css:{padding: '0 0.5em'}});
    else this.units_ele = '';
    for (let attr in this.options){
      this[attr] = this.options[attr];
      if (!Number.isNaN(Number(this[attr]))) this[attr] = Number(this[attr]);
    }
    let num = this;
    ['min','max','initial','step'].forEach(attr => {if (num[attr]==undefined) throw new Error(`${attr} is required`)})
    this.change = {
      start: (ev) => {
        let arrow = $(ev.target);
        ev.preventDefault();
        this.change.count = 0;
        this.change.error = null;
        this.change.direction = arrow.hasClass('up') ? 'up' : 'down';
        this.change.interval = 300;
        this.change.current = Number(this.get());
        if (this.change.current === null) this.change.decimals = this.step.countDecimals();
        else {
          let step = this.step.countDecimals(), current = this.change.current.countDecimals();
          this.change.decimals = step >= current ? step : current;
        }
        this.change.timer = setInterval(this.change.adjust, this.change.interval);
        this.change.adjust();
        let change = this.change;
      },
      stop: (ev) => {
        if (this.change.timer) {
          this.on_change(ev);
          clearInterval(this.change.timer);
          this.change.timer = null;          
        }
      },
      adjust: () => {
        this.change.next = this.change.current;
        if (this.change.next == null) this.change.next = Number(this.input.attr('placeholder'));
        else this.change.next = (this.change.direction == 'up') ? this.change.next + this.step : this.change.next - this.step;
        if (this.change.check()) {
          this.change.current = this.change.next;
          this.change.count++;
          if (this.change.count == 5 || this.change.count % 10 == 0) this.change.faster();            
        }
        this.input.val(this.change.current.toFixed(this.change.decimals));
      },
      faster: () => {
        if (this.change.interval / 2 > 1) this.change.interval = this.change.interval / 2;
        clearInterval(this.change.timer);
        this.change.timer = setInterval(this.change.adjust, this.change.interval);
      },
      check: () => {
        if (this.change.next > this.max){
          this.change.current = this.max;
          this.input.val(this.max);
          this.change.error = `max value is ${this.max}`;
          clearInterval(this.change.timer);
        }else if (this.change.next < this.min){
          this.change.current = this.min;
          this.input.val(this.min);
          this.change.error = `min value is ${this.min}`;
          clearInterval(this.change.timer);
        }else this.change.error = null;
        if (this.change.error) {
          this.input.warn(this.change.error);
        }
        return this.change.error === null;
      },
      current: null,
      decimals: null,
      error: null,
      timer: null,
      interval: 300,
      count: 0,
    };
    this.arrows = new Features.UpDown({
      action: this.change.start,
      callback: this.change.stop,
      css: {fontSize:'1.2em',margin:'2px 0 2px 0.5em'}
    });
    this.nowrap = $(`<div/>`,{class:'flexbox left nowrap', css:{whiteSpace:'nowrap'}}).append(this.input,this.units_ele,this.arrows.ele).appendTo(this.ele);
    this.input.data(this.options).attr('placeholder',this.options.initial);
    this.input.allowKeys('0123456789/.-');
    this.input.on('keydown',function(){clearTimeout(num.followup_timeout)})
    this.input.on('keyup',function(ev){
      num.change.next = num.get();
      num.change.check();
      num.followup_timeout = setTimeout(num.on_change.bind(num),1000);
    });

    this.get = () => {
      let v = $.sanitize(this.input.val()), fixed = this.options.fixed_decimals ? Number(this.options.fixed_decimals) : null;
      return (v !== '') ? (fixed ? Number(v).toFixed(fixed) : Number(v)) : null;
    }
    this.update = (new_obj) => {
      ['min','max','initial','step'].forEach(attr => {
        if (attr == 'step') this[attr] = new_obj[attr] || 1;
        else this[attr] = new_obj[attr]
      });
      this.input.attr('placeholder',new_obj.options.initial);
      this.value = new_obj.options.initial;
      let t = new_obj.options.units || null;
      this.ele.children('span').text(t);
    }
  }
  async imageclick () {
    let height_map = {small: '25em', medium: '35em', large: '45em', x_large: '50em'};
    this.undo_btn = new Features.Button({
      text:'undo',
      class_list: 'pink xsmall undo',
    })
    this.image = new Image();
    this.image.src = this.options.image_url;
    $(this.image).css('height', height_map[this.options.size]);
    this.ratio = this.image.naturalWidth / this.image.naturalHeight;
    this.input = $(`<div/>`,{
      class: 'imageClick',
      css: {
        height: height_map[this.options.size]
      },
      html: `<div class='img_wrap' style='display:inline-block;position:relative'></div>`
    }).appendTo(this.ele);
    this.input.find('.img_wrap').append(this.image);
    this.input.append(this.undo_btn.ele.slideFadeOut()).on('mousedown touchstart','.img_wrap', function(ev){
      ev.preventDefault();
      let windowCoords = system.ui.pointer.to_xy_coords(ev), image = $(this).find('img'), imageRect = image[0].getBoundingClientRect(), newCircle = $("<div/>",{class: 'indicatorWrap', html:"<div class='indicator'></div>"}), imageCoords = {x:imageRect.left,y:imageRect.top},
        absCoords = {
          x: windowCoords.x - imageCoords.x,
          y: windowCoords.y - imageCoords.y - window.scrollY
        }, 
        percentCoords = {
          x: absCoords.x / imageRect.width * 100,
          y: absCoords.y / imageRect.height * 100
        };
      if (image.hasClass('disabled')) return false;
        newCircle.appendTo(image.parent()).css({left:percentCoords.x + "%",top:percentCoords.y + "%"});
        newCircle.data({coordinates:percentCoords});
      let img_wrap = $(this).closest('.imageClick').find('.img_wrap'),
        undo_btn = $(this).closest('.imageClick').find('.undo');
      let count = img_wrap.find('.indicatorWrap').length;
      if (count > 0) undo_btn.slideFadeIn();
      else undo_btn.slideFadeOut();
    }).on('click','.undo',function(){
      let img_wrap = $(this).closest('.imageClick').find('.img_wrap'),
        undo_btn = $(this).closest('.imageClick').find('.undo');
      img_wrap.find('.indicatorWrap').last().remove();
      let count = img_wrap.find('.indicatorWrap').length;
      if (count > 0) undo_btn.slideFadeIn();
      else undo_btn.slideFadeOut();
    })
    this.get = () => {
      let dots = this.input.find('.indicatorWrap');
      let dot_coords = dots.get().map(dot => {
        return $(dot).data('coordinates');
      })
      return (dot_coords.notEmpty()) ? dot_coords : null;
    }    
  }
  async bodyclick () {
    this.options.image_url = `/images/body/rsz_body12.png`;
    this.imageclick();
  }
  async radio () {
    this.input = $(`<ul/>`,{class:'radio'}).on('click','li',function(){
      $(this).parent().resetActives();
      $(this).addClass('active');
    }).appendTo(this.ele);
    this.options.list.forEach(option => $(`<li>${option}</li>`).appendTo(this.input));
    this.get = () => {
      let active = this.input.find('.active'), values = active.get().map(li => $(li).text());
      return values.notEmpty() ? values : null;
    }
    this.update = this.list_update;    
  }
  async checkboxes () {
    let i = this;
    this.input = $(`<div/>`,{class:'checkboxes'})
      .on('click','input',function(ev){
        let limit = !Number.isNaN(i.options.listLimit) ? Number(i.options.listLimit) : null, active = i.get(),
          is_active = $(this).closest('label').find('input').is(':checked');
        if (limit) {
          let at_limit = active && active.length == limit + 1;
          if (at_limit) {
            let text = limit == 1 ? `Limited to ${limit} response` : `Limited to ${limit} responses`
            $(this).closest('.answer').warn(text); ev.preventDefault();
          }
        }
        i.on_change.bind(i,ev)();
      }).on('mouseenter','label',function(){$(this).addClass('yellowBg20')})
        .on('mouseleave','label',function(){$(this).removeClass('yellowBg20')}).appendTo(this.ele);
    let list = this.options.list;
    if (this.options.linked_to) {
      list = await this.linked_list_get(this.options.linked_to, this.options.linked_columns || []);
      list = list.map(model => `${model.uid}%%${model.name}`);
    }
    list.forEach(option => {
      option = Answer.split_values_and_text(option);      
      $(`<label class='flexbox inline nowrap' style='margin:0 0.5em;transition:background-color 400ms;padding-left:0.5em;border-radius:5px'><input type='checkbox' value='${option.value}'><span style='padding:0 0.5em'>${option.text}</span></label>`).appendTo(this.input)
    });
    this.get = () => {
      let input = this, values = null;
      if (this.save_as_bool) {
        values = {};
        this.input.find('input').each((i,input) => {
          values[$(input).attr('value').toKeyString()] = $(input).is(':checked');
        });
      } else {
        values = this.input.find(':checked').get().map(i => $(i).val()); 
      }
      if (values.is_array() && values.isEmpty()) values = null; 
      return values;
    }    
    this.update = this.list_update;    
  }
  async list () {
    let i = this;
    this.input = $(`<ul/>`,{class:'radio'}).on('click','li',function(ev){
      let limit = !Number.isNaN(Number(i.options.listLimit)) ? Number(i.options.listLimit) : null, active = i.active(),
        is_active = $(this).hasClass('active');
      if (limit) {
        let at_limit = active && active.length == limit;
        if (at_limit && !is_active && limit != 1) {
          $(this).closest('ul').warn(`Limited to ${limit} responses`); return;
        }else{
          if (limit == 1 && !is_active) {$(this).closest('ul').resetActives(); $(this).addClass('active');}
          else $(this).toggleClass('active');
        }
      }else {
        $(this).toggleClass('active');
      }
      i.on_change(ev);
    }).appendTo(this.ele);
    if (this.options.linked_to) {
      this.options.list = await this.linked_list_get(this.options.linked_to, this.options.linked_columns || []);
      this.options.list = this.options.list.map(option => `${option.uid}%%${option.name}`)};
    this.options.list.forEach(option => {
      option = Answer.split_values_and_text(option);
      $(`<li data-value='${option.value}'>${option.text}</li>`).appendTo(this.input)
    });
    this.active = () => {return this.input.find('.active').get().map(li => $(li).data('value'))};
    this.get = () => {
      let active = this.input.find('.active'), values = active.get().map(li => $(li).data('value'));
      if (this.save_as_bool) {
        log({active,input:this.input,values});
        let attr = `${this.options.usePreLabel ? this.options.preLabel : this.name}`.toKeyString(), obj = {};
        if (this.options.listLimit == 1) {
          obj[attr] = values[0].toBool();
        } else {
          obj[attr] = {};
          this.input.find('li').each((l,li) => obj[attr][$(li).data('value')] = $(li).data('value').toBool());
        }
        return obj;
      } else if (this.options.usePreLabel) {
        let obj = {};
        obj[this.options.preLabel.toKeyString()] = (this.options.listLimit == 1) ? values[0] : values;
        return obj;
      }
      return values.notEmpty() ? values : null;
    }
    this.update = this.list_update;    
  }
  async dropdown () {
    this.input = $(`<select/>`).appendTo(this.ele);
    $(`<option value='----'>----</option>`).appendTo(this.input);
    this.options.list.forEach(option => {
      option = Answer.split_values_and_text(option);
      $(`<option value='${option.value}'>${option.text}</option>`).appendTo(this.input);
    });
    this.input.on('change', this.on_change.bind(this));
    this.get = () => {
      let val = this.input.val(), response = val != '----' ? val : null;
      if (response && this.save_as_bool) response = response.toBool();
      return  response;
    }
  }
  async scale () {
    this.input = $(`<div/>`, {class:'flexbox'}).appendTo(this.ele);
    let left = $(`<span/>`,{class:'left',html:`<span class='value'>${this.options.min}</span><br><span class='label bold'>${this.options.leftLabel}</span>`}),
        right = $(`<span/>`,{class:'right',html:`<span class='value'>${this.options.max}</span><br><span class='label bold'>${this.options.rightLabel}</span>`}),
        slider = $(`<input type='range' class='slider' min='${this.options.min}' max='${this.options.max}' initial='${this.options.initial}'>`),
        value_box = $(`<div/>`,{class:'sliderValue'}).slideFadeOut();
    this.input.append(left,slider,right);
    let i = this.input, a = this;
    if (this.options.dispVal.toBool()) {
      this.input.append(value_box);
      let scale = this.input;
      slider.on('mouseenter touchstart',function(){
        let input = $(this).closest('.scale').find('.slider');
        value_box.text(slider.val());
        value_box.slideFadeIn();
        let update_timer = setInterval(function(){value_box.text(slider.val());},100);
        input.data('update_timer',update_timer);
        clearTimeout(input.data('fade_timer'));
      })
      slider.on('mouseleave touchend',function(){
        let input = $(this).closest('.scale').find('.slider');
        let fade_timer = setTimeout(function(){value_box.slideFadeOut(800);},1000);
        input.data('fade_timer',fade_timer);
        clearInterval(input.data('update_timer'));
      })
    }
    slider.on('change',function(){a.followup_show()})
    this.get = () => {return slider.val()}
  }
  async date () {
    let limit = Array.isArray(this.options.date_limit) ? this.options.date_limit[0] : this.options.date_limit;
    let selection_limit = Number.isNaN(Number(limit)) ? null : Number(limit);
    let css = {width:`${selection_limit ? `${selection_limit*8}em` : '40em'}`,maxWidth:'calc(100% - 3em)'};
    this.input = $(`<input placeholder='MM/DD/YYYY'>`).css(css).appendTo(this.ele);
    system.validation.input.date(this.input);
    let cal_icon = new Image();
    cal_icon.src = `/images/icons/cal_icon_yellow.png`;
    $(cal_icon).css({height:'2em',width:'2em',opacity:'60%',marginLeft:'0.5em',cursor:'pointer'});
    let i = this.input, options = {
      showTrigger:$(cal_icon),
      onClose:function(dates){
        $('.datepick-trigger').animate({opacity:0.6})
        let datepick_options = i.data('datepick').options, 
          min = system.validation.date.datepick.shorthand.to_moment(datepick_options.minDate), 
          max = system.validation.date.datepick.shorthand.to_moment(datepick_options.maxDate),
          compare = system.validation.date.comparison;
        if (dates.isEmpty()) {
          let invalid = system.validation.date.is_invalid(i.val()), date = moment(i.val(),'MM/DD/YYYY',true);
          if (invalid) i.warn('Invalid Date',{callback:function(){i.focus()}});
          else if (min && compare(date,min).is_before) {
            i.warn(`Must be on or after ${min.format('M/D/YYYY')}`,{callback:function(){i.focus()}});
          } else if (max && compare(date,max).is_after) {
            i.warn(`Must be on or before ${max.format('M/D/YYYY')}`,{callback:function(){i.focus()}});
          }
        }
      },
      onShow:function(picker,instance){instance.elem.parent().find('.datepick-trigger').animate({opacity:1})},
      showAnim: 'fadeIn',
      multiSeparator: ', ',
    };

    options.multiSelect = selection_limit ? selection_limit : 999;
    if (this.options.minDate) options.minDate = this.options.minDate;
    if (this.options.maxDate) options.maxDate = this.options.maxDate;
    if (this.options.yearRange) options.yearRange = this.options.yearRange;
    // log({end:options.multiSelect,start: this.options.date_limit[0],nan:Number.isNaN(this.options.date_limit[0])});
    this.input.datepick(options);
    this.ele.find('.datepick-trigger').on('mouseenter',function(){$(this).animate({opacity:1})})
      .on('mouseleave',function(){if ($('.datepick-popup').dne()) $(this).animate({opacity:0.6})});
    this.input = this.input.add(cal_icon);
    this.get = () => {
      let v = this.input.val();
      return v != '' ? system.validation.date.sort(v) : null;
    }
  }
  async time () {
    this.input = $(`<input placeholder='HH:MMa'>`).css({width:'5.3em'}).appendTo(this.ele);
    let i = this;
    this.input.on('keydown',function(ev){
      let v = $(this).val(), l = v.length, k = ev.key;
      if (!k.key_is_allowed('0123456789:ampm')) ev.preventDefault();
    }).on('change', function(){
      setTimeout(i.followup_show.bind(i),100);
    });
    let input = this.input, clock_icon = new Image();
    clock_icon.src = `/images/icons/clock_icon_yellow.png`;
    $(clock_icon).css({height:'2em',width:'2em',opacity:'60%',marginLeft:'0.5em',cursor:'pointer'})
    $(clock_icon).on('mouseenter',function(){$(this).animate({opacity:1})}).on('mouseleave',function(){if (!input.is(':focus')) $(this).animate({opacity:0.6})}).on('click',function(){i.focus()}).insertAfter(this.input);
    this.input.on('blur',function(){$(clock_icon).animate({opacity:0.6})});
    this.options.scrollDefault = 'now';
    this.input.timepicker(this.options);
    this.get = () => {
      let v = this.input.val();
      return v != '' ? v : null;
    }    
  }
  async signature () {
    this.input = $(`<div/>`,{class:'j_sig'}).append(`<div class='clear'>reset</div>`).appendTo(this.ele);
    if (this.options.typedName.toBool()) this.ele.prepend('<div>Type your full legal name here: <input class="typed_name" type="text" style="width:20em"></div><span>Sign in the box below:</span>');
    this.input.jSignature();
    this.get = () => {
      let jsig_data = this.input.jSignature('getData','base30');
      return jsig_data[1] != '' ? jsig_data : null;
    }    
  }
  reset () {this.value = this.initial;}
  clone () {return new Answer(this.options)}
  static split_values_and_text (string) {
    let split = string.split('%%');
    return (split.length > 1) ? {value:split[0].trim(), text:split[1].trim()} : {value:string, text:string};
  }
  static reset_all() {
    $('.answer').each((a,answer) => {let obj = $(answer).getObj('answer',false); if (obj) obj.reset()})
  }
  static get_all_within (ele, visible_only = true) {
    let eles = $(ele).find('.answer'); 
    if (visible_only) eles = eles.filter(':visible');
    return eles.get().map(answer => $(answer).getObj('answer',false));
  }
  static find (array, options) {
    let match = Answer.find_all(array,options);
    // log({array,options,match});
    if (match.length > 1) {log({array,options});throw new Error('Multiple objects found, limit one');}
    return match[0] ? match[0] : null;
  }
  static find_all (array, options) {
    let matches = array.filter(answer => {
      for (let attr in options) { 
        if (answer[attr] === undefined) return false;
        if (options[attr].is_array()) {let some = options[attr].some(o => answer[attr] == o); if (!some) return false;}
        else if (answer[attr] != options[attr]) return false;
      }
      return true;
    })
    return matches;
  }
  static find_inputs (array, options) {
    let inputs = $();
    Answer.find_all(array, options).forEach(answer => {inputs = inputs.add(answer.input)});
    return inputs;
  }
  static hold (answer, ev) { answer.hold = true }
}
class InsertOptions {
  constructor (options) {
    this.ele = $(`<div/>`,{class:'insert_item_options flexbox'}).css({backgroundColor:'var(--pink)',position:'absolute',left:'-1px',top:'0',transform:'translateY(-50%)',paddingLeft:'-0.05em',opacity:'0.7',borderRadius:'0 1em 1em 0',border:'1px solid var(--pink)',zIndex:'1'});
    this.plus_sign = new Image();
    this.plus_sign.src = '/images/icons/plus_sign_white.png';
    $(this.plus_sign).css({height:'0.6em',width:'0.6em',padding:'0.3em',transition:'width 1600ms, height 1600ms, transform 1600ms',cursor:'pointer'});
    this.buttons = $(`<div class='flexbox'></div>`).css({width:'0',height:'0',transition:'width 400ms, height 400ms',overflow:'hidden',flexWrap:'nowrap'}).appendTo(this.ele);
    let buttons = ifu(options.buttons, null, true), button_wrap = this.buttons;
    if (buttons){
      buttons.forEach(button => {
        button.class_list += ' white xxsmall';
        new Features.Button($.extend(button,{appendTo:button_wrap, css: {margin:'0.2em 0.3em',fontWeight:'bold'}}));
      })
    }
    this.ele.append(this.plus_sign).on('mouseenter',this.show.bind(this)).on('mouseleave',this.hide.bind(this));
    $(this.plus_sign).on('click',this.click.bind(this));
  }
  get button_width () {
    let w = this.buttons.find('.button').get().map(b => b.offsetWidth).reduce((sum,current) => sum + current, 0);
    w += getEm() * 2;
    return w;
  }
  show () {
    if (this.is_visible) return; 
    this.ele.animate({opacity:1})
    this.buttons.animate({width:this.button_width,height:'2.5em'});
    // this.buttons.animate({width:'16em',height:'2.5em'});
    $(this.plus_sign).css({transform:'rotate(225deg)',height:'1em',width:'1em'});
    this.is_visible = true;
  }
  hide () {
    if (!this.is_visible) return;
    this.ele.animate({opacity:0.7});
    this.buttons.animate({width:'0',height:'0'});
    $(this.plus_sign).css({transform:'rotate(0)',height:'0.6em',width:'0.6em'});
    this.is_visible = false;
  }
  click () {
    if (this.is_visible) this.hide();
    else this.show();
  }
}
// $(document).ready(function(){class_map_all.merge({Answer,forms,FormEle,Section,Item})});

export const Forms = {FormEle, FormResponse, Section, Item, Answer};

var forms = {
  current: null,
  reset: () => {
    forms.current = null;
  },
  retrieve: function(form, includeInvisible = false, forceAutoSave = false){
    throw new Error('using forms.retrieve which is deprecated');
  },
  disable: function(form){
    form.find('input, textarea').attr('readonly',true);
    form.find('.signature').filter(":visible").each(function(){
      $(this).jSignature('disable');
    });
    form.find('.number').off("mousedown touchstart",".change",startChange);
    form.find('.number').off("mouseup touchend",".change",stopChange);
    form.find('.number').off('keyup',"input",inputNum);
    form.find('.signature').find('.clear').hide();
    form.find('.radio, .checkboxes, .imageClick, .number').addClass('disabled');
    form.find('.button.cancel').text("close");
    form.find('.slider, select').attr('disabled',true);
    form.find('.datepicker').each(function(){
      $(this).datepick('disable');
    })
    form.addClass('disabled');
  },
  create: {
    editor: {
      class_obj: null,
      working_obj: null,
      mode: null,
      index: null,
      clipboard: {
        item_json: null,
        item_obj: null,
        add_to_clipboard: (item_json, str) => {
          let editor = forms.create.editor, item = editor.class_obj;
          item.ele.warn(str);
          // item_json.text += ' copy';
          editor.clipboard.item_json = item_json;
          editor.clipboard.flash();
          editor.class_obj.bg_flash();
          $(".no_items").addClass('pink10BgFlash').css({cursor:'pointer'}).text('Click to Paste Item').on('click',editor.open);
        },
        copy: () => {
          let editor = forms.create.editor, item = editor.class_obj, index = editor.index, 
            parent = item.parent, has_followup = item.followup_count > 0;
          log({item,parent},`copy ${item.options.text}`);
          let item_json = item.item_db;
          if (has_followup){
            confirm({
              header: 'Include Followups?',
              message: `This will add all ${item.followup_count} nested followup items.`,
              btntext_yes: 'include followups',
              btntext_no: 'copy only this item',
              callback_affirmative: function(){
                unblur();
                editor.clipboard.add_to_clipboard(item_json,'Item + Follow-Ups added to clipboard');
              },
              callback_negative: function(){
                item_json.items = [];
                editor.clipboard.add_to_clipboard(item_json,'Item added to clipboard');
              }
            })
          }else {
            editor.clipboard.add_to_clipboard(item_json,'Item added to clipboard');
          }
        },
        // paste: () => {},
        flash: () => {
          $('.insert_item_options').addClass('opacity100Flash')
            .find('.paste').removeClass('disabled').addClass('opacity80Flash');
          setTimeout(forms.create.editor.clipboard.reset, 45*1000);
        },
        reset: () => {
          // forms.create.editor.clipboard.item_obj.ele.find('.edit').css({color:'rgb(190,190,190)'});
          $('.insert_item_options').removeClass('opacity100Flash')
            .find('.paste').removeClass('opacity80Flash');
          $(".no_items").removeClass('pink10BgFlash').css({cursor:'unset'}).text('No items').off('click',forms.create.editor.open);            
        },
      },
      followup: {
        state: false,
        parent: null,
        check: () => {
          let editor = forms.create.editor, obj = editor.class_obj, mode = editor.mode, 
            in_section = (mode == 'edit') ? obj.parent instanceof Section : obj instanceof Section;
          editor.followup.state = !in_section;
          editor.followup.parent = (mode == 'edit') ? obj.parent : obj;
          return !in_section;
        },
      },
      options: {
        reset: () => {
          // console.groupCollapsed('options reset');
          $("#AddItem, #AddText").resetActives().find('input,textarea').val('');
          $("#AddItemText").focus();
          forms.create.editor.options.list.reset();
          forms.create.editor.options.show();
          // console.groupEnd();
        },
        linked_text_update_editor: (model) => {
          let list_ele = $("#OptionsList");
          let link = $('#linked_to').exists() ? $('#linked_to') : $(`<div id='linked_to' class='pink'/>`).prependTo('#Options');
          link.html('');
          link.append(
            `<b>Linked to '${model.addSpacesToKeyString()}' category.</b>`,
            $(`<span class='little'>undo</span>`).css({cursor:'pointer',padding:'0.5em',textDecoration:'underline'}).on('click', forms.create.editor.options.list.reset),
            `<div>This question will always be populated with an up-to-date list.`);
          list_ele.find('.answer.text').find('input').attr('readonly',true);
          // link.html(`<b>Linked to '${model.addSpacesToKeyString()}' category.</b><br>Note: you will never have to update this list to keep it current.`);
        },

        list: {
          reset: () => {
            let list = $("#OptionsList"), options = list.find('.answer.text');
            $('#linked_to').remove();
            list.removeData('linked_to');
            if (options.length < 2) forms.create.editor.options.list.add_option();
            options.each((o,option) => {
              $(option).removeData('value').find('input').val('');
              $(option).find('input').removeAttr('readonly');
              if (options.index(option) > 1) option.remove()
            });
          },
          fill: list => {
            let inputs = $("#OptionsList").find('.answer.text');
            list.forEach((item,i) => {
              let answer = null;
              if (inputs.get(i)) answer = $(inputs.get(i)).getObj();
              else answer = forms.create.editor.options.list.add_option();
              // log({answer,item,i});
              answer.value = item;
            })
          },
          option: null,
          add_option: () => {
            let last = $("#OptionsList").find('.answer').last(), o = last.getObj(), options = o.options, settings = o.settings;
            let option = new Answer({options,settings,type:'text'}),
              arrows = new Features.UpDown({
                css: {fontSize: '1em',marginLeft:'0.5em'},
                action: 'change_order',
                postLabel: 'change option order'
              });
            // log({last,o,options,settings,arrows,spans:option.ele.find('span')});
            option.ele.find('span').replaceWith(arrows.ele);
            option.ele.addClass('flexbox inline').insertAfter(last);
            return option;
          }
        },
        show: (type = null, time = 400) => {
          let option_lists = $('.itemOptionList'),
              match = option_lists.get().find(list => ($(list).data('type') == type || $(list).data('type').includes(type))),
              followup_list = $("#FollowUpOptions");
          if (type){
            $(match).slideFadeIn(time);
            option_lists.not(match).not(followup_list).slideFadeOut(time);
            if (['list','checkboxes','dropdown'].includes(type)) {
              let listLimit = $(match).findAnswer({name:'listLimit'}).ele;
              if (type == 'dropdown') listLimit.hide();
              else listLimit.show();
            }
          }
        },
        followup: {
          load_options: () => {
            try{
              let list = $("#FollowUpOptions"), editor = forms.create.editor, mode = editor.mode;
              if (is_followup()){
                let parent = editor.followup.parent, current = editor.working_obj;
                  match = list.find('.condition').filter((c,cond) => $(cond).data('parent') === parent.type || $(cond).data('parent').includes(parent.type));
                list.find('.parentInfo').html('').append(`<b class='purple'>Response to:</b> "${parent.options.text}"<br><b class='pink'>Must be:</b>`);
                list.slideFadeIn(0);
                match.slideFadeIn(0)
                list.find('.condition').not(match).slideFadeOut(0);

                if (['radio','checkboxes','list','list1plus','dropdown'].includes(parent.type)) editor.options.followup.list();
                else editor.options.followup[parent.type]();
                if (editor.mode == 'edit'){
                  for (let condition in current.condition){
                    let answer = list.find(`.${condition}`).closest('.answer');
                    answer.set(current.condition[condition]);
                  }                  
                }
              }else list.slideFadeOut(0);
            }catch(error){
              log({error},`followup.load_options`)
            }
          },
          number: () => {
            let parent = forms.create.editor.followup.parent, list = $("#FollowUpOptions"),
              obj = list.find('.conditionNumberVal').closest('.answer').data('class_obj');
            log({parent,obj});
            obj.update_obj(parent.answer);
          },
          scale: () => {
            let parent = forms.create.editor.followup.parent, list = $("#FollowUpOptions"),
              obj = list.find('.conditionNumberVal').closest('.answer').data('class_obj');
            log({parent,obj});
            obj.update_obj(parent.answer);
          },
          list: () => {
            let parent = forms.create.editor.followup.parent, list = $("#FollowUpOptions"),
              obj = list.find('.conditionList').closest('.answer').data('class_obj');
            obj.update_obj(parent.answer);

          },
          date: () => {
            let parent = forms.create.editor.followup.parent, list = $("#FollowUpOptions");

          },
          time: () => {
            let parent = forms.create.editor.followup.parent, list = $("#FollowUpOptions");

          },
        },
        link_to_model: () => {
          let link_modal = $(`<div/>`,{class:'modalForm center'});
          let list = new Features.List({header:'Available for Linking'});
          link_modal.append(`<h3>Select a Category</h3><div>Linking a question to a category will allow the user to select from an up-to-date list of that category. There will be no need to update the question if you add to the category</div>`,list.ele);
          for (let model in class_map_linkable) {
            if (model != 'list') list.add_item({
              text:model.addSpacesToKeyString(),
              action: async function(){
                try{
                  blurTop('loading');
                  let list = linkable_lists[model] || await Models.Model.get_list({model}), list_ele = $("#OptionsList");
                  forms.create.editor.options.list.reset();
                  list.forEach((item,i) => {
                    let options = list_ele.find('.answer.text'), option = options.get(i);
                    if (!option) option = forms.create.editor.options.list.add_option().ele;
                    $(option).getObj().value = item.name;
                    $(option).data('value',item.uid);
                  });
                  forms.create.editor.options.linked_text_update_editor(model);
                  unblur(2);
                }catch (error) {
                  log({error});
                }
              }
            });
          }
          blurTop(link_modal);
        }
      },
    },
    autofill: () => {
      forms.reset();
      if ($("#FormBuilder").dne()) return;
      // let data = $("#formdata").data(), json = data.json;
      let form = new FormEle('#FormBuildProxy');
      forms.current = form;
      return;
    }
  },
  response: {
    all_answers_as_obj: (form_ele) => {
      let response = {};
      form_ele.find('.answer').filter(':visible').each((a,answer) => {
        let o = $(answer).getObj();
        response[o.options.name] = o.get();
      })
      return response;
    }
  },
  autosave: {
    send: () => {
      let data = {
        uid: forms.current.form_uid,
        columns: forms.current.form_db,
      }
      log(data,'form autosave send data');
      // return;
      return $.ajax({
        url:'/save/Form',
        method: 'POST',
        data: data,
      })    
    },
    callback: data => {
      log({data},'callback data');
      if (data.form_uid) {
        forms.current.form_uid = data.form_uid;
        forms.current.form_id = data.form_id;
        forms.current.version_id = data.version_id;
        // log(forms.current,'current form');
      } else log('no form_uid');
    },
  },
  initialize: {
    all: () => {
      $.each(forms.initialize, function(name, initFunc){
        if (name != 'all' && typeof initFunc === 'function') initFunc();
      });
    },
    answer_proxies: () => {
      $(".answer_proxy").each((t, proxy) => {
        try{
          let data = $(proxy).data();
          if (!data.options) throw new Error('data-options not defined');
          if (!data.type) throw new Error('data-type not defined');

          let answer = new Answer(data);
          $(proxy).replaceWith(answer.ele);
          if (!answer.ele.isInside('.item') && !answer.ele.isInside('#AddItem') && !answer.has_label && answer.settings.placeholder_shift !== false) {
            answer.ele.css({marginTop:'1.5em'});
          }
        }catch(error){
          log({error,proxy});
        }
      })
    },
    submit_buttons: () => {
      init('.submit.create',function(){
        $(this).on('click', async function(){
          try{
            let instance = null, data = $(this).data();
            if ($(this).hasClass('create')){
              let model_name = $(this).data('model')
              instance = model_name.to_class_obj();
            } else if ($(this).hasClass('edit')) {
              instance = model.current;
              if (!instance.update_attr_by_form()) throw new Error('form error');
              log({instance});
            }
            // log({data,type:}, 'save btn data');
            await instance.save();              
            system.initialize.newContent();
          }catch(error) {
            log({error,this:this});
          }
        })
      })
    },
    form_proxies: () => {
      init('.form_proxy',function(){
        let form = new FormEle($(this));
      })
    },
    signatures: () => {
      init($('.j_sig').filter(':visible'),function(){
        $(this).jSignature();
        $(this).find('.clear').on('click',function(){$(this).parent().jSignature('reset')});
      })      
    },
    builder: () => {
      init('#FormBuilder', function(){
        forms.reset();
        $(".itemOptionList").slideFadeOut();
        $("#AddItemType").on('change','select', function(){
          let type = $(this).val();
          forms.create.editor.options.show(type);
        });
        $('#AddItem').on('click', '.save', Item.create)

        $('#AddSection').on('click', '.add', function(){
          let section = Section.create();
          if (section) forms.current.autosave.trigger();
        });
        let form_name = new Editable({
          name: 'form name',
          id: 'FormName',
          replace: 'FormNameProxy',
          html_tag: 'h1',
          initial: $("#formdata").data('name'),
          callback: (ev, value) => {
            forms.current.name = value;
          }
        })
        let options_list = $('#OptionsList'),
          arrow_proxy = options_list.find('span').filter(function(){return $(this).text() == 'UpDownProxy'}),
          arrows = new Features.UpDown({
            css: {fontSize: '1em',marginLeft:'0.5em'},
            action: 'change_order',
            postLabel: 'change option order'
          }), option = options_list.find('.answer.text');
        options_list.on('click','.add',forms.create.editor.options.list.add_option)
          .on('keyup','input',function(ev){
            if (ev.keyCode == 13){
              let inputs = options_list.find('.answer.text'), i = options_list.find('input').index(this), next = $(inputs[i]).next('.answer');
              if (next.dne()) {
                let option = forms.create.editor.options.list.add_option(), input = option.ele.find('input');
                input.val(''); input.focus();
                // log({inputs,i,next,option});
              }
              else next.find('input').focus();
            }
          })
        arrow_proxy.replaceWith(arrows.ele);
        options_list.find('.answer').removeClass('left').addClass('inline');
        forms.create.autofill();
        // autosave.reset();
        // autosave.initialize({
        //   ajaxCall: forms.autosave.send,
        //   callback: forms.autosave.callback,
        //   delay: 10000
        // });
      });
      // if ($('#FormBuilder').dne()) forms.create.editor.mode = null;
    },
    calendars: () => {
      init('.calendar',function(){
        new Models.Calendar($(this));
      })      
    },
    toggles: () => {
      init('.toggle_proxy',function(){
        new Features.Toggle($(this));
      })
    },
  },
};

var notes = {
  targetObj: null,
  callback: null,
  allowRemoval: true,
  initialize: {
    soloModal: function(){
      log({loadingNotes:'doin it'},'notes soloModal');
      var noteForm = filterByData($("#AddNote"),'hasNoteFx',false);
      notes.initialize.basicFx();

      autosave.reset();
      autosave.initialize({
        saveBtn: $("#AddNoteBtn"),
        ajaxCall: notes.autosave,
        callback: notes.updateOptionsNav,
        delay: 2000
      })
      var modelInfo = $("#AddNoteModal").find('.instance').data();

      notes.allowRemoval = (modelInfo.allowRemoval === 'true');
      notes.autofill(modelInfo.notes);

      $("#AddNoteBtn").on('click', autosave.trigger);
      notes.targetObj = null;
      noteForm.data('hasNoteFx',true);
    },
    withModel: function(objectWithNotes = null, autosaveFx = null){
      log({loadingNotes:'doin it'},'notes withModel');
      if (objectWithNotes) notes.targetObj = objectWithNotes;
      if (autosaveFx && typeof autosaveFx == 'function') notes.callback = autosaveFx;
      notes.initialize.basicFx();
    },
    basicFx: function(){
      log({loadingNotes:'doin it'},'notes basicFx');
      var form = filterByData('#AddNote','hasDynamicFx',false), addBtn = $('#AddNoteBtn');
      if (form.dne()) return;
      $("#NoteList").on('click','.delete', notes.remove);
      addBtn.on('click', notes.add);
      form.data('hasDynamicFx',true);
    }
  },
  resetForm: function(){
    $("#AddNote").data('hasNoteFx',false);
    notes.targetObj = null;
    notes.callback = null;
  },
  getModelNotes: function(model,uid){
    blurTop('#loading');
    $.ajax({
      url:'/addNote/'+model+"/"+uid,
      method: "GET",
      success: function(data){
        if ($("#AddNoteModal").exists()){
          $("#AddNoteModal").html(data).data({model:model,uid,uid});
        }else{
          $("<div/>",{
            id: 'AddNoteModal',
            class: 'modalForm',
            data: {model:model,uid:uid},
            html: data
          }).appendTo("body");
        }
        notes.initialize.soloModal();
        minifyForm($("#AddNote"));
        var modelInfo = $("#AddNoteModal").find('.instance').data();
        blurTopMost('#AddNoteModal');
        notes.autofill(modelInfo.notes);
      }
    })
  },
  updateOptionsNav: function(){
    var pinnedNotes = $(".optionsNav").find(".value.pinnedNotes");
    if (pinnedNotes.dne()) return;
    pinnedNotes.html("");
    var currentNotes = notes.retrieve();
    if (currentNotes){
      $.each(currentNotes,function(n,note){
        if (note.title) pinnedNotes.append("<div><span><span class='bold'>"+note.title+"</span>: "+note.text+"</span></div>");
        else pinnedNotes.append("<div><span>"+note.text+"</span></div>");
      });
    }else{
      if (pinnedNotes.html() == "") pinnedNotes.html("<div class='bold'>None</div>");
    }
  },
  add: function(){
    var form = $("#AddNote");
    if (!forms.retrieve(form)) return false;
    var newNote = notes.create(), h4 = newNote.title ? "<h4>"+newNote.title+"</h4>" : "",
    newHtml = h4 + "<div>" + newNote.text + (notes.allowRemoval ? "<span class='delete'>x</span>" : "") + "</div>";
    $("<div/>",{
      class: 'note',
      html: newHtml,
      data: newNote
    }).appendTo("#NoteList");
    $("#NoNotes").slideFadeOut();
    resetForm(form);
    if (notes.callback) notes.callback();
    if (notes.targetObj) notes.targetObj.current.notes = notes.retrieve();
  },
  create: function(){
    var title = justResponse($("#AddNote").find('.note_title'));
    return {
      title: (title == '') ? null : title,
      text: justResponse($("#AddNote").find('.note_details'))
    };
  },
  remove: function(){
    $(this).closest('.note').slideFadeOut(400,function(){
      $(this).remove();
      if (notes.callback) notes.callback();
      if (notes.targetObj) notes.targetObj.current.notes = notes.retrieve();
    })
  },
  retrieve: function(){
    var notes = [];
    $("#NoteList").find(".note").each(function(){
      notes.push($(this).data());
    });
    return notes.length > 0 ? notes : null;
  },
  autofill: function(existingNotes){
    if (existingNotes == '""' || !existingNotes) return;
    $.each(existingNotes,function(n, note){
      $(".note_title").val(note.title);
      $('.note_details').val(note.text);
      notes.add();
    });
  },
  autosave: function(){
    console.log('saving pinned notes');
    var currentNotes = notes.retrieve(), model = $("#AddNoteModal").data('model'), uid = $("#AddNoteModal").data('uid');
    console.log(model, uid);
    $.ajax({
      url:'/savePinnedNotes/'+model+"/"+uid,
      method: "POST",
      data: {
        notes: currentNotes
      },
      success:function(data){
        if (data == 'checkmark'){
          autosave.success();
          notes.updateOptionsNav();
          notes.marksaved();
        }
      }
    })
  },
};

export {forms, notes};


function initializeAdditionalNoteForm(targetObj = null, callback = null){
  console.log('use notes.initialize');
  return false;
  if (targetObj) notes.targetObj = targetObj;
  if (callback && typeof callback == 'function') notes.callback = callback;
  var form = filterByData('#AddNote','hasDynamicFx',false), addBtn = $('#AddNoteBtn');
  if (form.dne()) return;
  $("#NoteList").on('click','.delete', notes.remove);
  addBtn.on('click', notes.add);
  form.data('hasDynamicFx',true);
}
function autoSavePinnedNotes(){
  console.log('use notes.autosave');
}
function updatePinnedNotesOptionsNav(notes){
  var pinnedNotes = $(".optionsNav").find(".value.pinnedNotes");
  if (pinnedNotes.dne()) return;
  pinnedNotes.html("");
  $.each(notes,function(n,note){
    if (note.title) pinnedNotes.append("<div><span><span class='bold'>"+note.title+"</span>: "+note.text+"</span></div>");
    else pinnedNotes.append("<div><span>"+note.text+"</span></div>");
  });
  if (pinnedNotes.html() == "") pinnedNotes.html("None");
}
function fillNotes(notes){
  console.log('use notes.autofill');
}
function initializeNoApptsBtn(message){
  var btn = filterUninitialized("#NoEligibleApptsBtn");
  btn.on('click',function(){
    confirm('No Eligible Appointments',message,'create new appointment','dismiss',null,function(){clickTab("appointments-index");unblurAll();})
  });
  btn.data('initalized',true);
}
function initializeSelectNewApptBtns(fadeTheseIn = null){
  log('use appointments.initialize');
  return; 
  var selectBtn = filterUninitialized('.selectNewAppt');
  selectBtn.on('click',function(){
    showOtherAppts(fadeTheseIn);
  });
  selectBtn.data('initialized',true);
}
function showOtherAppts(fadeTheseIn = null){
  log('use appointments.initialize');
  return; 
  $(".selectNewAppt").hide();
  fadeTheseIn = fadeTheseIn ? $(fadeTheseIn).add("#ApptLegend") : $("#ApptLegend");
  fadeTheseIn.slideFadeIn();
  $("#CurrentAppt").slideFadeOut();
  $('.confirmApptBtn').addClass('disabled');
}
function selectThisAppt(){
  log('use appointment.initialize.externalSeleCtAndLoad');
  return;
  if ($(this).hasClass('active') || $(this).closest("#ApptLegend").length == 1){
    return;
  }else{
    $(".appt").removeClass('active');
    $(this).addClass('active');     
    $("#ApptSummary").html($(this).html().split("<br>").join(", ") + "<br>" + $(this).data('services'));
    $('.confirmApptBtn').removeClass('disabled');
    var newText;
    if ($(this).hasClass('hasNote')){newText = 'finish note';}
    else if ($(this).hasClass('noNote')){newText = 'start note';}
    else if ($(this).hasClass('hasInvoice')){newText = 'finish invoice';}
    else if ($(this).hasClass('noInvoice')){newText = 'create invoice';}
    $(".confirmApptBtn").text(newText);
  }
}
function initializeApptClicks(){
  var appts = filterUninitialized('.appt');
  if (appts.dne()) return;
  appts.on('click',selectThisAppt);
  appts.data('initialized');
}



function getModelNotes(model,uid){
  $.ajax({
    url:'/addNote/'+model+"/"+uid,
    method: "GET",
    success: function(data){
      if ($("#AddNoteModal").exists()){
        $("#AddNoteModal").html(data).data({model:model,uid,uid});
      }else{
        $("<div/>",{
          id: 'AddNoteModal',
          class: 'modalForm',
          data: {model:model,uid:uid},
          html: data
        }).appendTo("body");
      }
      minifyForm($("#AddNote"));
      var modelInfo = $("#AddNoteModal").find('.instance').data();
      initializeAdditionalNoteForm(autoSavePinnedNotes);
      blurTopMost('#AddNoteModal');
      notes.autofill(modelInfo.notes);
    }
  })
}
