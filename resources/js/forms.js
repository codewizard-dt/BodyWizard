import {system, practice, log, Features} from './functions';
import {model, Models, class_map_linkable, linkable_lists} from './models';
import {DateTime as LUX} from 'luxon';
import * as ICD from '@whoicd/icd11ect';
window.ICD = ICD;
const EMBEDDED_ICD_SETTINGS = {
    apiServerUrl: "https://id.who.int",   
    apiSecured: true,
    language: "en",
    autoBind: false,
    sourceApp: 'ClinicWizard',
};
const EMBEDDED_ICD_CALLBACKS = {
  searchStartedFunction: () => {
    log('start');
  },
  searchEndedFunction: () => {
    log('stop');
  },
  selectedEntityFunction: (entity) => {
    log({entity});
    let form = Models.IcdCode.form, info_ele = form.find('#IcdCodeInfo'), code = info_ele.find('.value.Code'), desc = info_ele.find('.value.Description');
    Models.IcdCode.entity = entity;
    code.text(entity.code);
    desc.text(`${entity.title} (${entity.bestMatchText})`);
  },
  getNewTokenFunction: async () => {
    const url = '/icd-api/token';
    try {
        const response = await fetch(url);
        const result = await response.json();
        const token = result.token;
        return token; // the function return is required 
    } catch (e) {
        console.log("Error during the request");
    }

  }
}
const map_api_key = 'AIzaSyBTwPirwcUTFAZEvsmV401YeSY-1ub-5pg';
window.EMBEDDED_ICD_SETTINGS = EMBEDDED_ICD_SETTINGS;
window.EMBEDDED_ICD_CALLBACKS = EMBEDDED_ICD_CALLBACKS;

class FormEle {
  constructor(proxy) {
    let options = $(proxy).data(), json = options.json;
    this.is_proxy = $('#Settings').exists() && $('#Settings').data('is_proxy');
    this.mode = ifu(options.mode, 'display');
    if (this.mode == 'chart') { this.mode = 'display'; this.charting = true; }
    this.json = ifu(options.json, {});
    this.action = ifu(options.action, null);
    for (let attr in this.json){
      this[attr] = this.json[attr];
    }
    if (this.settings === null) this.settings = {};
    this.ele = $(`<div/>`,{class:'form',id: (this.form_name || '').toKeyString()});
    this.ele.data({uid:this.form_uid});
    $(proxy).replaceWith(this.ele);
    this.ele.data('class_obj',this);
    this.section_list = new Features.List({
      id: 'SectionList',
      header:'Sections',
      entire_li_clickable: false,
      li_class: 'flexbox spread',
      li_selectable: false,
    });
    this.section_array = [];
    let form = this;
    this.add_header();
    this.section_ele = $(`<div/>`,{class:'sections'}).appendTo(this.ele);
    if (this.charting) this.section_ele.hide();
    this.add_buttons();
    if (!this.charting && this.ele.is(':visible')) {
      blur(this.ele,'loading');
      this.waiting = setInterval(this.linked_answer_check.bind(this),200);
    }
    log({form:this,spinners:this.ele.find('.spinner')},`new FormEle ${this.form_name}`);
    if (this.json.sections && this.json.sections.notEmpty()) this.json.sections.forEach(section => this.section_add(section));
    forms.initialize.signatures();



    if (this.mode == 'settings' && !this.is_proxy) {
      this.settings_manager = new Models.SettingsManager({
        obj: this,
        save: this.autosave_send.bind(this),
        callback: this.autosave_callback.bind(this),
      }, 'edit');
      log({settings:this.settings},`FormEle SETTINGS`);
      FormEle.current_settings_manager = this.settings_manager;
      this.settings_icons_create();
      this.section_array.forEach(section => section.settings_icons_create());
    }
    this.settings_apply();
    if (this.mode == 'build') this.autosave = new Features.Autosave({
      show_status: true,
      delay: 10000,
      send: this.autosave_send.bind(this),
      callback: this.autosave_callback.bind(this),
      obj: this,
      message: `form changes saved`,
    });

    if (this.is_proxy) log('proxy');
    else if (this.form_name == 'Form Settings' && this.mode == 'display') FormEle.current_settings_manager.form_ele = this.ele;
    if (Item.clipboard_history && Item.clipboard_history.notEmpty()) Item.ClipboardBanner.show();
    if (this.charting) this.add_charting_features();
  }

  add_header () {
    let form = this;
    if (this.mode == 'build') {
      this.header_editable = new Features.Editable({
        name: 'form name',
        html_tag: 'h1',
        initial: this.form_name,
        callback: (ev, value) => {this.form_name = value; form.autosave.trigger()},
      });
      this.ele.removeClass('central full');
      this.header = this.header_editable.ele.appendTo(this.ele);
      this.section_options = new Features.OptionBox({body_css:{padding:'0.5em 1.5em'}});
      this.section_options.ele.appendTo(this.ele);
      this.section_options.add_button({text: 'add section',action: blurTop.bind(null, '#AddSection'),class_list: 'pink xsmall'});
      this.Model = new Models.Form({uid:form.form_uid});
      this.preview_btn = new Features.Button({text: 'preview', class_list: 'yellow70 xsmall', 
          action: () => this.Model.preview() });
      this.preview_btn.ele.prependTo(this.section_options.option_list).wrap('<div/>');
      this.settings_btn = new Features.Button({text: 'settings', class_list: 'yellow70 xsmall', 
          action: () => this.Model.settings() });
      this.settings_btn.ele.insertAfter(this.preview_btn.ele);
      this.section_options.option_list.find('.button').css({margin:'0.3em'});
      this.section_list.ele.appendTo(this.section_options.body);
    }else if (this.mode == 'preview') {
      this.label = $(`<div/>`,{class:'box boxPink central'}).insertBefore(this.ele);
      $(`<h1>Preview</h1>`).appendTo(this.label);
      $(`<div>"${form.form_name}" will be displayed as you see below (minus this box).</div>`).appendTo(this.label);
      $(`<div><b>Tip:</b> To change header or item display options go to form settings</div>`).appendTo(this.label);
      this.header = $(`<h1 class='center'><span>${form.form_name}</span></h1>`).appendTo(this.ele);
      this.followup_toggle = $(`<div/>`).appendTo(this.label);
      this.followup_show_all = $(`<span/>`,{text: 'show all followups',css:{textDecoration:'underline',cursor:'pointer',padding:'0 5px'}});
      this.followup_hide_all = $(`<span/>`,{text: 'hide all followups',css:{textDecoration:'underline',cursor:'pointer',padding:'0 5px'}});
      this.followup_toggle.append(this.followup_show_all, '|', this.followup_hide_all);
    }else if (this.mode == 'settings'){
      this.label = $(`<div/>`,{class:'box boxPink central'}).prependTo(this.ele);
      this.header = $(`<h1 class='center'><span>${form.form_name}</span></h1>`).appendTo(this.ele);
      $(`<div>"${form.form_name}" is displayed below with current settings.</div>`).appendTo(this.label);
      this.followup_toggle = $(`<div/>`).appendTo(this.label);
      this.followup_show_all = $(`<span/>`,{text: 'show all followups',css:{textDecoration:'underline',cursor:'pointer',padding:'0 5px'}});
      this.followup_hide_all = $(`<span/>`,{text: 'hide all followups',css:{textDecoration:'underline',cursor:'pointer',padding:'0 5px'}});
      this.followup_toggle.append(this.followup_show_all, '|', this.followup_hide_all);
    }else {
      this.header = $(`<h1 class='center'><span>${form.form_name}</span></h1>`).appendTo(this.ele);
    }
    if (this.followup_show_all) this.followup_show_all.on('click',() => {this.ele.find('.item').find('.item').slideFadeIn()})
    if (this.followup_hide_all) this.followup_hide_all.on('click',() => {this.ele.find('.item').find('.item').slideFadeOut()})
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
    } else if (this.mode != 'build' && !this.charting) {
      this.submit_btn = new Features.Button({text:'save', action:this.action, class_list:'pink'});
      this.ele.append(this.submit_btn.ele);
    }
  }
  add_charting_features() {
    // this.header.css({borderTop:'2px solid var(--pink30)'});
    // this.ele.css({margin:'0.2em auto 2em'});
    this.form_toggle = new Features.Toggle({
      toggle_ele: this.header,
      toggle_ele_class_list: 'lined filled',
      target_ele: this.section_ele,
      color: 'pink',
      initial_state: 'hidden'
    })
  }

  settings_apply (time = 0) {
    if (this.mode == 'build') return;
    let manager = this.settings_manager || new Models.SettingsManager({obj:this});
    let get = function (name) {return manager.get_setting(name)};
    if (get('display.HideFormTitle')) this.header.slideFadeOut(time);
    else this.header.slideFadeIn(time);
    if (this.submit_btn) {
      if (get('display.SubmitButton') == 'hide') this.submit_btn.ele.slideFadeOut(time);
      else this.submit_btn.ele.slideFadeIn(time);    
    }
  }
  settings_icons_create () {
    if (this.is_proxy) return;

    let manager = this.settings_manager,
      general = manager.popup_create(),
      submit_btn_hide = manager.popup_create();
    general.icon.css({width:'3em',height:'3em'}).appendTo(this.label);
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
        }, initial: false
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
    if (this.answer_objs.every(answer => !answer.waiting_for_list)) {
      clearInterval(this.waiting);
      this.waiting = null;
      log({ele:this.ele},`ALL LINKED ANSWERS READY`);
      unblur({ele:this.ele});
    }
  }
  section_add (options) {
    let section = new Section(options, this.mode);
    this.section_array.push(section);
    this.section_ele.append(section.ele);

    let list_item = this.section_list.add_item({
      text: section.name,
      action: function() {section.ele.smartScroll({force:true})},
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
      list_item.append(section_options);
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
      // log({sections});
      if (search_array.length > 1) throw new Error(`too many search keys ${search_array}`);
      sections.forEach(section => {
          let section_match = section.item_search(search_array[0], {allow_multiple:true, form_search:true});
          if (section_match) matches.push(...section_match);
      })
      if (matches.isEmpty()) throw new Error(`no item matching '${search_array[0]}'`);
      else if (!matches.isSolo() && !allow_multiple) throw new Error(`search returned ${matches.length} items, limited to one`);
    } catch (error) {
      log({error,texts:text,allow_multiple});
      matches = [];
    }
    return matches.isEmpty() ? null : allow_multiple ? matches : matches[0];
  }
  copy_item_callback () {
    let eles = this.ele.find('.insert_item_options');
    eles.addClass('opacity100Flash');
    setTimeout(function(){eles.removeClass('opacity100Flash')},5000);
    this.ele.find('.button.paste').removeClass('disabled');
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
  reset_answers () { Answer.reset_all(this.ele); }
  fill_by_response (json) {
    this.followup_time = 0;
    console.groupCollapsed(`FORM FILL ${this.form_name}`);
    log({form:this,response:json});
    try {
      this.section_array.forEach(section => {
        let response = json[section.name.toKeyString()];
        if (response) section.fill_by_response(response);
      })
    } catch (error) {
      log({error});
    }
    console.groupEnd();
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
    log({data,form:this},'form autosave send data from FormEle');
    return $.ajax({
      url:'/save/Form',
      method: 'POST',
      data: data,
    })    
  }
  async autosave_callback (data) {
    log(data, 'AUTOSAVE RESPONSE & CALLBACK');
    if (data.form_uid) {
      this.form_uid = data.form_uid;
      this.form_id = data.form_id;
      this.version_id = data.version_id;
    }
  }

  static model_edit (ele, edit = true) {
    try {
      // log({ele});
      ele = $(ele);
      let form = ele.is('.createModel') ? ele : ele.find('.createModel'), model = form.data('model');
      if (form.dne()) throw new Error('cannot find .createModel');
      let header = form.find('h1').first(), submit_btn = form.find('.button.submit'), text = header.text();
      if (!edit) {
        header.text(text.replace('Edit','Create'));
        let btn_text = `create ${model}`;
        submit_btn.text(btn_text);
      } else {
        header.text(text.replace(/(Create|New)/,'Edit'));
        let btn_text = `save changes to ${model}`;
        submit_btn.text(btn_text);
      }    
    } catch (error) {
      log({error,ele,edit});
    }
  }
  static simple_fill (ele, json = {}) {
    try {
      let form = $(ele),
          answers = Forms.Answer.get_all_within(form, false),
          find = name => Forms.Answer.find(answers,{name});
      answers.forEach(a => a.reset());
      let toggles = form.find('.Toggle').get().map(t => $(t).getObj())
      toggles.forEach(t => t.to_initial_state(0));
      log({answers,json});
      for (let name in json) {
        let answer = find(name);
        if (answer) answer.value_change = json[name];
        else if ($(`#${name}`).exists()) {
          let sub_form = $(`#${name}`).getObj('form',false);
          if (sub_form) {
            log({sub_form});
            sub_form.fill_by_response(json[name]);
            let toggle = toggles.find(t => t.target_ele.is(`#${name}`));
            log({toggle});
            if (toggle) toggle.show(0);
          }
        }
      }

    } catch (error) {
      log({error,ele,json});
    }
  }
}
class SubmissionJson {
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
    } catch (error) {
      log({error});
    }
    return matches;
  }
  find (text = null) {
    let item = this.item_search(text), answer = item ? item.answer : null;
    return answer;
  }
  set (text, value) {
    let item = this.item_search(text);
    item.answer = value;
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
    if (this.mode == 'build') this.add_build_options();
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
  get followup_count () {return this.items.map(i => i.followup_count).reduce((accumulator, currentValue) => accumulator + currentValue)}
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
    if (this.form.is_proxy) return;
    this.settings_manager = new Models.SettingsManager({
      obj: this,
      autosave: this.form.settings_manager.autosave,
    }, 'edit');
    let header = this.settings_manager.popup_create();
    this.header.wrap(`<div class='flexbox left'></div>`);    
    header.icon.css({width:'3em',height:'3em',marginRight:'0.5em'}).insertBefore(this.header);    
    header.add({name: 'display', type: 'checkboxes',
      options: {
        list: ['Hide Section Title','Minify'],
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
    let items = this.ele.find('.item').not('.no_items');
    // log({items});
    items.get().forEach(item => $(item).getObj().settings_icons_create());
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
      let name_input = new Features.Editable({
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
      new Features.Button ({
        text: 'add question', 
        class_list: 'pink xsmall addQuestion', 
        action: this.item_create.bind(this), 
        appendTo: this.buttons
      });
      new Features.Button ({
        text: 'add text', 
        class_list: 'pink xsmall addText', 
        action: function(){alert('nope')}, 
        appendTo: this.buttons
      });
    }
  }
  add_build_options () {
    this.item_list.append(`<div class='no_items item no_sort'><span>No items</span></div>`);
    let parent = this, class_list = !Item.clipboard ? 'paste disabled' : 'paste';
    let insert_btns = [
      {text:'new item', class_list:'addQuestion', action: function(){
        let modal = $("#AddItem"), item = null, form = parent.form, action = 'append';
        Item.reset_modal();
        if (parent instanceof Item) parent.show_followup_options();
        else $('#FollowUpOptions').slideFadeOut()
        Item.current = {item,parent,form,action};
        blurTop(modal)
      }},
      {text:'copied item', class_list, action: function(){
        if (this.hasClass('disabled')) {
          feedback('Nothing to paste','Copy an item first in order to use this button.');
          return;
        }
        let item = null, form = parent.form, action = 'append';
        Item.paste(parent, action);
        // Item.clipboard.text = Item.clipboard.text + ' COPY';
        // parent.add_item(Item.clipboard, action);
        form.autosave.trigger();
      }},
    ];
    let insert_options = new InsertOptions({buttons:insert_btns});
    insert_options.ele.prependTo(this.item_list.find('.no_items'));
    // creating Confirmation prompts
    if (!Section.Delete) Section.Delete = confirm({
      header: 'Delete Section',
      affirm: data => {
        let section = data.section, form = data.form, index = data.index;
        form.section_list.remove_by_index(index);
        form.section_array.splice(index,1);
        section.ele.slideFadeOut(function(){$(this).remove()});
        form.autosave.trigger();
      }
    });    
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
        this.no_items_ele.exists() ? new_item.ele.insertBefore(this.no_items_ele) : this.item_list.append(new_item.ele);
      } else if (action == 'insert') {
        this.items.splice(index, 0, new_item);
        new_item.ele.insertBefore(this.item_list.children('.item').get(index));
      } else if (action == 'edit') {
        this.items[index].ele.replaceWith(new_item.ele);
        this.items.splice(index, 1, new_item);
      }

      this.update_summary();

      forms.initialize.signatures();
    } catch (error) {
      log({error,item_obj,action,index});
      return false;
    }
    return new_item;
  }
  update_summary () {
    let text = this.items.length === 0 ? 'No items' : `Summary: ${this.items.length} items and ${this.followup_count} follow up items in the "${this.name}" section`;
    this.item_list.children('.no_items').find('span').text(text);
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
    Section.Delete.prompt({
      header: `Delete "${this.name}"?`,
      message: `This cannot be undone and will include all ${this.item_count} items.`,
      section, index, form
    });
  }
  item_create () {
    let modal = $('#AddItem');
    $('#FollowUpOptions').hide();
    Item.reset_modal();
    Item.current = {item:null, parent:this, form:this.form, action:'append'};
    blurTop(modal);
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
    this.question_wrap = $(`<div/>`,{class:'question_wrap'});
    this.question = $(`<div/>`,{class:'question',text:options.text}).appendTo(this.question_wrap);
    this.text_key = options.text.toKeyString();
    // log({options: options.options},`${this.text_key}`);
    if (options.options.linked_to) this.new_proxy();
    // this.linked_proxy = 
    this.type = options.type;
    this.settings = options.settings || {};
    this.ele = $('<div/>',{class:`item flexbox left ${this.type}`});
    this.answer = new Answer(options, mode);
    if (this.answer.time2) this.ele.addClass('range');    
    this.ele.append(this.question_wrap,this.answer.ele).data(options);
    this.ele.data('class_obj',this);
    this.items = [];
    let existing_items = options.followups || options.items || [], editor = forms.create.editor;
    delete this.options.followups;
    if (['number','list','checkboxes','dropdown','scale','time'].includes(options.type)) {
      this.item_list = $(`<div/>`,{class:'Items flexbox'}).appendTo(this.ele);

      if (existing_items.notEmpty()) existing_items.forEach(item_obj => this.add_item(item_obj, 'append'));
      if (mode != 'build') this.item_list.find('.item').hide();
      else this.item_list.find('.no_items').show();
    }
    if (mode == 'build') this.add_build_options();
    this.settings_apply();
    if (this.item_list) this.update_summary();
  }

  add_build_options () {

    let edit_options = $(`<span/>`).appendTo(this.question);
    $(`<div/>`,{class:'toggle edit',text:'(edit)'}).on('click',this.edit.bind(this)).appendTo(this.question);
    $(`<div/>`,{class:'toggle copy',text:'(copy)'}).on('click',this.copy.bind(this)).appendTo(this.question);
    $(`<div/>`,{class:'toggle delete',text:'(delete)'}).on('click',this.delete.bind(this)).appendTo(this.question);
    if (this.options.condition) {
      this.condition_ele = $('<div/>',{class:'condition',text: `Condition: ${this.condition_str}`}).insertAfter(this.question);
    }
    let paste_class_list = Item.clipboard ? 'paste' : 'paste disabled';
    let insert_btns = [
      {text:'new item', class_list:'addQuestion', action: function(){
        let modal = $("#AddItem"), item = $(this).getObj('item'), parent = item.parent, form = item.form, action = 'insert';
        Item.current = {item,parent,form,action};
        if (parent instanceof Item) parent.show_followup_options();
        else $('#FollowUpOptions').slideFadeOut();
        Item.reset_modal();        
        Item.LinkedTo = null;
        Item.linked_to_fill();
        blurTop(modal)
      }},
      {text:'copied item', class_list:paste_class_list, action: function(){
        if (this.hasClass('disabled')) {
          feedback('Nothing to paste','Copy an item first in order to use this button.');
          return;
        }
        let item = $(this).getObj('item'), parent = item.parent, form = item.form, action = 'insert';
        let index = parent.items.indexOf(item);
        let new_item = Item.paste(parent, action, index);

        // log({item,new_item});
        if (parent instanceof Item && new_item.parent != Item.current.parent) {
          Item.Paste.prompt({new_item});
        } else form.autosave.trigger();
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
    this.ele.on('click', this.select.bind(this))
    let current_item = this, item_list = this.item_list;
    if (item_list) {
      this.item_list_wrapper = $(`<div/>`,{class:'toggleWrap'}).insertBefore(item_list);
      this.item_list_wrapper_header = $(`<h4>Follow Up Items <span class='count'>(${this.item_count})</span></h4>`);
      let wrapper = this.item_list_wrapper, btn_wrap = $('<div class="buttonWrapper"></div>');
      let callback_hide = function(){wrapper.children('.buttonWrapper').slideFadeOut();}, 
        callback_show = function(){wrapper.children('.buttonWrapper').slideFadeIn();}, 
        btn_item = new Features.Button ({text: 'add question', class_list: 'pink70 xsmall addQuestion', action: function(){
            let modal = $("#AddItem"), item = null, parent = current_item, action = 'append', index = null,form = parent.form;
              current_item.show_followup_options();
              Item.current = {item,parent,action,index,form};
              Item.LinkedTo = null;
              Item.linked_to_fill();
              blurTop(modal);
          }, css: {marginBottom:'0'}
        });
      wrapper.append(this.item_list_wrapper_header,item_list, btn_wrap.append(btn_item.ele));
      this.item_list_toggle = new Features.Toggle({
        toggle_ele: this.item_list_wrapper_header,
        target_ele: item_list,
        initial_state: 'hidden',
        callback_hide,
        callback_show,
      });
      item_list.css({marginTop:'0.75em'});

      // NO ITEMS ELEMENT
      this.item_list.append(`<div class='no_items item no_sort'><span>No items</span></div>`);
      let parent = this, class_list = !Item.clipboard ? 'paste disabled' : 'paste';
      let insert_btns = [
        {text:'new item', class_list:'addQuestion', action: function(){
          let modal = $("#AddItem"), item = null, form = parent.form, action = 'append';
          log({item,parent,form,action});
          Item.current = {item,parent,form,action};
          if (parent instanceof Item) parent.show_followup_options();
          blurTop(modal);
        }},
        {text:'copied item', class_list, action: function(){
          if (this.hasClass('disabled')) {
            feedback('Nothing to paste','Copy an item first in order to use this button.');
            return;
          }
          let item = null, form = parent.form, action = 'append';
          let new_item = Item.paste(parent, action);
          if (parent instanceof Item && new_item.parent != Item.current.parent) {
            Item.Paste.prompt({new_item});
          } else form.autosave.trigger();
        }},
      ];
      let insert_options = new InsertOptions({buttons:insert_btns});
      insert_options.ele.prependTo(this.item_list.find('.no_items'));
    }
  }
  select (ev) {
    ev.stopPropagation();
    let item = $(ev.target).getObj('item');
    if (!ev.metaKey) {
      if (!item.ele.hasClass('active')) $('.item').removeClass('active');
    } else item.ele.toggleClass('active');
    // log({item});
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
    // log({match,condition});
    if (condition) {
      answers.forEach(answer => {
        // log({answer})
        answer.value = condition[answer.name];
      })      
    }
  }
  settings_icons_create () {
    if (this.form.is_proxy) return;

    this.settings_manager = new Models.SettingsManager({
      obj: this,
      autosave: this.form.settings_manager.autosave,
    }, 'edit');
    let popup = this.settings_manager.popup_create();
    this.question.wrap(`<div class='flexbox left'></div>`);    
    popup.icon.css({width:'1.5em',height:'1.5em',marginRight:'0.5em'}).insertAfter(this.question);    
    popup.add({name: 'display', type: 'checkboxes',
      options: {
        // usePreLabel: true,
        list: ['Condensed','Start New Line','Minify'],
        save_as_bool: true,
      },
    });
    popup.add({name: 'display', type: 'list', 
      options:{
        usePreLabel: true,
        list: ['auto', 'full', 'half', 'third'],
        preLabel: 'Width',
        usePreLabel: true,
        labelHtmlTag: 'h4',
        listLimit: 1,
      }
    });
    if (user.isSuper()) {
      popup.add({name: 'settings', type: 'checkboxes', 
        options:{
          usePreLabel: false,
          list: ['save_as_bool'],
          preLabel: 'Super User Settings',
          save_as_bool: true,
          // listLimit: 1,
          keys_as_is: true,
          labelHtmlTag: 'h4',
          // listLimit: 1,
        }
      });      
    }
    // let items = this.ele.find('.item').not('.no_items');
    // log({items});
    // items.get().forEach(item => $(item).getObj().settings_icons_create());
  }
  settings_apply() {
    // log(`form is in ${this.mode} mode`);
    if (this.mode == 'build') return;
    // console.groupCollapsed('apply');
    let manager = this.settings_manager || new Models.SettingsManager({obj:this});
    let get = name => manager.get_setting(name);
    let condense = get('display.Condensed'), 
      new_line = get('display.StartNewLine'), 
      width = get('display.Width'),
      minify = get('display.Minify');
    // log({condense,new_line,width});
    if (condense) this.ele.addClass('condensed');
    else this.ele.removeClass('condensed');
    
    if (new_line && !this.ele.prev().hasClass('newLine')) $(`<div class='newLine'></div>`).insertBefore(this.ele);
    else if (this.ele.prev().hasClass('newLine')) this.ele.prev().remove();
    
    if (minify) this.ele.addClass('minify');
    else this.ele.removeClass('minify');

    if (width) {
      this.ele.removeClass('auto full half third');
      this.ele.addClass(get('display.Width'));
    }
    // console.groupEnd();
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
    if (!c) {
      log({error:new Error(`trying to get condition for non-followup ${this.text_key}`)});
    }
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
  followup_update_check (warning = true) {
    if (this.mode != 'build') return;
    let parent = this, options = parent.options.options, update_required = function(item) {
      let condition = item.options.condition;
      if (options.list) {
        // log({parent,list:options.list,condition});
        return condition.conditionList.some(l => !options.list.includes(l));
      } else if (['number','scale'].includes(parent.type)) {
        log({min:options.min,max:options.max,condition});
      } else throw new Error('followup update check not performed');
    };
    let needs_update = this.items.filter(i => update_required(i));
    if (needs_update.notEmpty()) {
      let update_count = needs_update.length;
      this.item_list_toggle.add_message({message:`Warning: ${update_count} follow up item(s) in this list no longer have valid conditions`,position:'before_toggle',class_list:'box boxPink followup_update'});
      let message = $('<div/>',{text:`There are ${update_count} follow up item(s) that now require updating because their conditions are no longer valid:`});

      needs_update.forEach(i => {
        message.append(`<div><span class='bold'>${i.options.text}</span> => <span class='bold strikethrough'>${i.condition_str}</span></div>`);
        i.condition_ele.addClass('box boxPink strikethrough');
      });
      if (warning) feedback('Follow Up Warning',message);
    } else this.ele.find('.followup_update').remove();
    return needs_update.notEmpty() ? needs_update : null;
  }
  followup_count_update () {
    this.ele.children('.toggleWrap').children('.toggle_ele').children('.toggleText').text(`Follow Up Items (${this.followup_count})`);
  }

  get is_followup () { return this.ele.isInside('.item',false) }
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
      log({answer:json.answer},`FILL ${this.text_key}`);
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
  next_is_null () {
    let i = this.index, next = this.parent.items[this.index + 1];
    return next ? next.answer.get() === null : false;
  }
  get next_item_ele () {
    let i = this.index, next = this.parent.items[this.index + 1];
    return next ? next.ele : null;
  }
  set value (value) {
    this.answer.value = value;
  }
  edit () {
    let modal = $('#AddItem'), item = this, parent = this.parent, form = this.form, action = 'edit', data = item.options;
    Item.current = {item, parent,form, action};
    if (!Item.proxy) {}
    blurTop(modal);
    let text = data.text, required = data.settings.required, type = data.type;
    $('#AddItemType').find('select').val(type);
    Item.option_list_show(0, type);

    $("#AddItemText").find('input').val(text);
    $('#AddItemRequired').getObj().value = required;
    if (parent instanceof Item) parent.show_followup_options(data.condition);
    else $('#FollowUpOptions').hide();

    Item.LinkedTo = data.options.linked_to || null;
    Item.LinkedToSettings = data.options.linked_to_settings || null;
    Item.linked_to_fill(data.options.list);
    Item.option_list_reset();
    let answers = Answer.get_all_within(modal);
    log({data,options:data.options,answers,linked:Item.LinkedTo},`editing ${data.text}`);
    function named () {let name = [...arguments]; return Answer.find(answers, {name})};
    for (name in data.options) {
      if (name == 'list') {
        this.option_list_fill();
      } else {
        let match = named(name);
        if (match && !match.is_array()) match.value = data.options[name];
        else if (match && match.is_array()) match.forEach(m => m.value = data.options[name]);
      }
    }
  }
  async copy () {
    log({item:this.options},'copy item');
    let item = this, clipboard_add = () => {
      let fu_length = this.followup_count;
      Item.ClipboardList.add_item({
        text: `<b>${Item.clipboard.text}</b> (w /${Item.clipboard.items ? `${Item.clipboard.items.length > 0 ? fu_length : 0} followups` : '0 followups'})`,
        value: {}.merge(Item.clipboard),
        action: function() {Item.clipboard = $(this).data('value')},
      })
    };
    Item.clipboard = {}.merge(this.options);
    Item.current = {item,parent:this.parent};
    if (this.items && this.items.notEmpty()) {
      await Item.Copy.prompt({item});
    }
    if (Item.clipboard_history) {
      let found = Item.clipboard_history.find(i => (
        i.options.name === Item.clipboard.options.name &&
        ( (!i.items && !Item.clipboard.items) || (i.items.length === Item.clipboard.items.length) )
      ));
      if (found){
        let index = Item.clipboard_history.indexOf(found);
        Item.clipboard_history.splice(index, 1);
        Item.ClipboardList.remove_by_index(index);
      } 
      Item.clipboard_history.smartPush(Item.clipboard);
      clipboard_add();
    } else {
      Item.clipboard_history = [Item.clipboard];
      clipboard_add();
    }
    log({q:this.question,box:this.question[0].getBoundingClientRect()});
    let box = this.question[0].getBoundingClientRect(), top = [box.top, box.bottom].reduce((a, b) => a + b) / 2;
    Item.JustCopied.flash({position: {position: 'fixed', top:top, left: box.right + 5, transform: 'translateY(-50%)'}});
    Item.ClipboardBanner.show();
    this.form.copy_item_callback();
  }
  async delete () {
    Item.Delete.prompt({
      header: `Delete "${this.options.text}"?`,
      message: `This cannot be undone and will include all ${this.followup_count} followup questions.`,
      yes_text: 'DELETE',
      no_text: 'CANCEL',
      item: this
    })
  }
  add_item (item_obj, action = null, index = null){
    let new_item = new Item(item_obj, this, this.mode);
    try {
      if (action == 'append') {
        this.items.push(new_item);
        this.no_items_ele.exists() ? new_item.ele.insertBefore(this.no_items_ele) : new_item.ele.appendTo(this.item_list);
      } else if (action == 'insert') {
        this.items.splice(index, 0, new_item);
        new_item.ele.insertBefore(this.item_list.children('.item').get(index));
      } else if (action == 'edit') {
        this.items[index].ele.replaceWith(new_item.ele);
        this.items.splice(index, 1, new_item);
      }

      this.update_summary();

      forms.initialize.signatures();
    } catch (error) {
      log({error,item_obj,action,index});
      return false;
    }
    return new_item;
  }
  update_summary () {
    let text = this.items.length === 0 ? 'No items' : `Summary: ${this.item_count} direct follow up(s) and ${this.followup_count} total follow up(s) related to "${this.options.text}"`;
    this.item_list.children('.no_items').find('span').text(text);
    this.followup_count_update();
    if (this.parent & this.parent.update_summary) this.parent.update_summary();
  }
  has_changes_reset () {
    // log({item:this,manager:this.settings_manager},`reset ${this.options.text}`);
    this.settings_manager.has_changes = false;
    this.items.forEach(item => item.has_changes_reset());
  }  
  static create () {
    let modal = $("#AddItem"), working = Item.current, 
      item = working.item, parent = working.parent, form = working.form,
      index = item ? parent.items.indexOf(item) : working.index || null, action = working.action;
    log({working,item,parent,form,index,action});

    try{
      let required = $("#AddItemRequired").verify(), obj = {
          text: $("#AddItemText").verify('Question text is required'),
          type: $("#AddItemType").verify('Answer type is required'),
          settings: {required},
          options: {}
        };
      if (!obj.text || !obj.type || !obj.settings.required) return;
      if (parent instanceof Item) obj.condition = {type: parent.type};
      let all_pass = true, list = [], answers = Answer.get_all_within($('.itemOptionList'));
      answers.forEach(answer => {
        let name = answer.options.name, response = answer.verify('required');
        if (response == null && answer.settings.required) all_pass = false;
        if (name == 'listOption') {
          if (response != null)list.push(`${$(answer).data('value')?`${$(answer).data('value')}%%`:''}${response}`);
        }
        else if (name.includes('condition')) obj.condition[name] = response;
        else obj.options[name] = response;
      })

      if (list.notEmpty()) obj.options.list = list;
      if (Item.LinkedInfo && Item.LinkedInfo.is(':visible')) {
        obj.options.linked_to = Item.LinkedTo;
        obj.options.linked_to_settings = Item.LinkedToSettings;
        let limit_obj = answers.find(a => a.name == 'listLimit');
        log({limit_obj,answers});
        let limit = limit_obj.verify('required');
        if (!limit) return;
        obj.options.listLimit = limit;
      }
      let check = Item.check_obj(obj);
      if (!all_pass || !check) return;

      if (action == 'edit') {
        obj.followups = item.followup_json;
        obj.settings = item.settings.merge({required});
        // if (obj.followups.notEmpty()) {
        //   log({toggle:item.item_list_toggle});
        // }
      }
      obj.options.name = obj.text.toKeyString();

      let added = parent.add_item(obj, action, index);
      if (added) {
        form.autosave.trigger();
        unblur();
        if (added.item_count > 0) added.followup_update_check();
        if (parent instanceof Item) parent.followup_update_check(false);
      }
    }catch(error){
      log({error},'item add error');
    }
  }
  static paste (parent, action, index = null) {
    Item.clipboard.text = Item.clipboard.text + ' COPY';
    let paste_me = {}.merge(Item.clipboard);
    if (parent instanceof Section) delete paste_me.condition;
    // log({parent,action,index,paste_me},'pasting!');
    let new_item = parent.add_item(paste_me, action, index);
    return new_item;
  }
  static check_obj (obj) {
    // log({obj});
    let options = obj.options, type = obj.type, answers = Answer.get_all_within($('.itemOptionList')); 
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
  static reset_modal () {
    let modal = $('#AddItem');
    Answer.reset_all(modal);
    // modal.resetActives().find('.text, .textbox').find('input,textarea').val('');
    // modal.find('.checkbox_list').find('input').filter()
    $("#AddItemText").focus();
    Item.LinkedTo = null;
    Item.linked_to_fill();
    Item.option_list_reset();
  }
  static option_list_reset () {
    let list = $("#OptionsList"), options = list.find('.answer.text');
    if (options.length < 2) Item.option_list_add();
    options.each((o,option) => {
      $(option).removeData('value').find('input').val('');
      $(option).find('input').removeAttr('readonly');
      if (options.index(option) > 1) option.remove()
    });    
  }
  static option_list_add () {
    let last = $("#OptionsList").find('.answer').last(), o = last.getObj(), options = o.options, settings = o.settings;
    let option = new Answer({options,settings,type:'text'});
    let arrows = new Features.UpDown({
      css: {fontSize: '1em',marginLeft:'0.5em'},
      action: 'change_order',
      postLabel: 'change option order'
    });
    option.ele.find('span').replaceWith(arrows.ele);
    option.ele.addClass('flexbox inline').insertAfter(last);
    return option;
  }
  static option_list_fill (list = []) {
    let inputs = $("#OptionsList").find('.answer.text');
    list.forEach((item,i) => {
      let answer = inputs.get(i);
      if (answer) answer = $(answer).getObj();
      else answer = Item.option_list_add();
      answer.value = item;
    })    
  }
  static option_list_show (time = 400, type = null) {
    if (!type) return;
    let option_lists = $('.itemOptionList').not('#FollowUpOptions, #LinkedOptions'),
        match = option_lists.get().find(list => ($(list).data('type') == type || $(list).data('type').includes(type)));
    // log({option_lists,match});
    if (type){
      $(match).slideFadeIn(time);
      option_lists.not(match).slideFadeOut(time);
      if (['list','checkboxes','dropdown'].includes(type)) {
        let listLimit = $(match).findAnswer({name:'listLimit'}).ele;
        if (type == 'dropdown') listLimit.hide();
        else listLimit.show();
      }
    }    
  }
  new_proxy (options = {}) {
    let info = this.options.options, model = options.model || info.linked_to, settings = info.linked_to_settings || {};
    this.linked_model = new Models[model]({uid:'proxy'});
    if (this.mode == 'build') {
      this.linked_model.settings_manager = new Models.SettingsManager({
        obj: this.linked_model,
        initial_override: settings,
        autosave_on_form_change: true,
        autosave: new Features.Autosave({
          send: _ => {
            return new Promise(resolve => {
              let settings = Item.LinkedProxy.settings_manager.settings_obj;
              resolve(this.linked_model.attr_list.settings);
              Item.LinkedProxySettings = Item.LinkedProxy.settings_manager.settings_obj;
            })
          },
          obj: this.linked_model,
          delay: 50,
        }),
        update_callback: (options = {}) => {
          let answer = options.answer, key = options.key, value = options.value;
          let is_linked = answer.options.linked_to || null, is_number = answer.type == 'number';
          Item.LinkedSettingsAdjustMe = Item.LinkedSettingsAdjustMe || {};
          if (is_linked) {
            log({answer,key,value,is_linked,is_number,adjusted},`ADJUST ME ${key}`);
          } else if (is_number) { 
            let adjusted = value;
            if (answer.options.preLabel) adjusted = `${answer.options.preLabel} ${value}`;
            if (answer.options.units) adjusted += ` ${answer.options.units}`;
            Item.LinkedSettingsAdjustMe[key] = adjusted;
          }
        },
        mode: 'edit'
      });
      Item.LinkedToSettings = $.isEmptyObject(settings) ? null : settings;
    } else {
      this.linked_model.settings_manager = new Models.SettingsManager({
        obj: this.linked_model,
        initial_override: settings,
      });   
    }
    log({proxy:this.linked_model,item:this},this.text_key);
  }
  async open_proxy_settings () {
    // let model = Item.LinkedTo, settings = Item.LinkedProxySettings = Item.LinkedToSettings;
    
    blurTop('loading');
    // let settings = this.linked_model.settings_manager.settings_obj;
    // if ($.isEmptyObject(settings)) settings = null;
    let settings = Item.LinkedToSettings;
    log({linkedto:Item.LinkedToSettings,thisproxy:settings});
    Item.LinkedProxy = this.linked_model;
    Item.LinkedProxySettings = settings;
    await this.linked_model.settings({in_background:true});
    this.proxy_form = $('#SettingsModal');
    let modal = $("#SettingsModal");
    modal.save_btn = new Features.Button({
      text:'use these settings for autofill',
      class_list: 'pink small',
      action: function(){
        Item.linked_to_settings_update();
        Item.LinkedSettingsOptionBox.toggle(false);
        blurTop(Item.LinkedSettingsOptionBox.ele);
      }
    });
    modal.save_btn.ele.insertBefore(modal.find('.button.cancel').on('click', _ => {
      let settings = Item.LinkedToSettings == null ? {} : Item.LinkedToSettings;
      this.linked_model.settings_manager.settings_obj = settings;
    }));    
    await Item.linked_to_settings_update();
    Item.LinkedSettingsOptionBox.toggle(true);
    blur($('#AddItem'), Item.LinkedSettingsOptionBox.ele);
  }
  set proxy_form (form) {
    if (!form.is('.form')) form = form.find('.form').first();
    this.linked_model.settings_manager.form_ele = form;
  }

  static linked_to_fill (item_has_list = false) {
    if (Item.LinkedTo) {
      Item.LinkedEle.show();
      Item.LinkedLabel.text(`Autofill By ${Item.LinkedTo}`);
      Item.LinkedInfo.html('').append(`<b>Linked to '${Item.LinkedTo.addSpacesToKeyString()}' category.</b>`,
        $(`<span class='little'>unlink</span>`).css({cursor:'pointer',padding:'0.5em',textDecoration:'underline'}).on('click', function(){Item.LinkedTo = null; Item.LinkedToSettings = null; Item.linked_to_fill(); Item.option_list_reset()}), `<div>This question will always be populated with an up-to-date list.</div>`);
      if (Item.LinkedToSettings){
        // let view = $(`<span class='little'>view</span>`).css({cursor:'pointer',padding:'0.5em',textDecoration:'underline'}).on('click', Item.LinkedSettingsOpen), clear = $(`<span class='little'>clear</span>`).css({cursor:'pointer',padding:'0.5em',textDecoration:'underline'}).on('click', function(){Item.LinkedToSettings = null; Item.linked_to_fill(); Item.option_list_reset()});
        let view = $(`<span class='little'>view</span>`).css({cursor:'pointer',padding:'0.5em',textDecoration:'underline'}).on('click', _ => { Item.current.item.open_proxy_settings() }), clear = $(`<span class='little'>clear</span>`).css({cursor:'pointer',padding:'0.5em',textDecoration:'underline'}).on('click', function(){Item.LinkedToSettings = null; Item.linked_to_fill(); Item.option_list_reset()});
        Item.LinkedInfo.append('<b>Has autofill restrictions.</b>', view, clear);
      } else {
        Item.LinkedSettingsOptionBox.reset();
      }
      $("#OptionsList").find('.answer.text').find('input').attr('readonly',true);    
      item_has_list ? Item.LinkedLimit.ele.hide() : Item.LinkedLimit.ele.show();
    } else {
      Item.LinkedEle.hide();
    }
  }
  static linked_to_reset () { Item.LinkedEle.hide(); Item.LinkedTo = null; Item.LinkedToSettings = null;}
  static linked_to_show_linkable () {
    if (!Item.LinkedModal || Item.LinkedModal.dne()) {
      Item.LinkedModal = $(`<div/>`,{class:'modalForm center'});
      let list = new Features.List({header:'Available for Linking',li_selectable:false});
      Item.LinkedModal.append(`<h3>Select a Category</h3><div class='central medium'>Linking a question to a category will allow the user to select from an up-to-date list of that category. There will be no need to update the question if you add to the category</div>`,list.ele);
      for (let model in class_map_linkable) {
        if (model != 'list') list.add_item({
          text:model.addSpacesToKeyString(),
          action: async function(){
            try{
              blurTop('loading');
              let list = linkable_lists[model] || await Models.Model.get_list({model}), list_ele = $("#OptionsList");
              // Item.linked_to_fill();
              Item.option_list_reset();
              log({list});
              Item.option_list_fill(list.map(l => l.name));
              Item.LinkedTo = model;
              Item.current.item.new_proxy({model});
              Item.linked_to_fill();
              unblur(2);
            }catch (error) {
              log({error});
            }
          }
        });
      }
    }
    blurTop(Item.LinkedModal);
  }
  static async linked_to_settings_update () {
    let proxy = Item.LinkedProxy;
    let icon_options = {size: 1, css: {margin: '0 0.2em'}};
    let manager = Item.LinkedProxy.settings_manager;
    let settings = Item.LinkedProxySettings, skip_me = [], skip_condition_icon = [];;
    
    if (settings == null) {
      Item.LinkedSettingsOptionBox.reset();
      // alert('hi');
      return;
    }
    if (settings.Conditions) {
      for (let name in settings.Conditions) {
        let info = settings.Conditions[name], parent_value = manager.get_setting(info.key), condition = info.condition;
        if (typeof parent_value == 'object' && !parent_value.is_array()) parent_value = Models.SettingsManager.obj_to_bool_array(parent_value);
        let matched = Answer.condition_matches_parent(parent_value, condition);
        if (!matched) skip_me.push(name);
        if (parent_value && ['list','checkboxes'].includes(condition.type) && parent_value.isSolo()) skip_condition_icon.smartPush(info.key);
      }      
    }

    let format_value = (key, value) => {
      if (value === null) return null;
      if (skip_me.includes(key)) return null;
      let ele = $('<div/>',{class: 'flexbox column left'});
      let condition_label = null;
      let get_icons = (key, value) => {
        let icons = [];
        let is_false = (value === false || (typeof value == 'string' && value.includes('*'))), exact_match = manager.get_setting(`ExactMatch.${key}`), condition = manager.get_setting(`Conditions.${key}`), is_exact = (exact_match === true || exact_match === undefined);
        if (is_false && is_exact) icons.push(new Features.Icon({type:'styled_x'}.merge(icon_options)));
        else if (!is_false && is_exact) icons.push(new Features.Icon({type:'checkmark'}.merge(icon_options)));
        else if (is_false && !is_exact) icons.push(new Features.Icon({type:'styled_x',color:'yellow'}.merge(icon_options)));
        else if (!is_false && !is_exact) icons.push(new Features.Icon({type:'checkmark',color:'yellow'}.merge(icon_options)));
        if (condition !== undefined) ele.data({condition});
        return icons.map(i => i.img);
      }

      let type = typeof value, icons = get_icons(key, value);
      if (Item.LinkedSettingsAdjustMe && Item.LinkedSettingsAdjustMe[key]) {
        ele.append(Item.LinkedSettingsAdjustMe[key], ...icons).addClass('value_option');
      } else if (value.is_array()) {
        value.forEach(v => ele.append(format_value(key, v).removeClass('column').addClass('value_option')));
        ele.removeClass('value_option');
      } else if (typeof value == 'object') {
        let array = Models.SettingsManager.obj_to_bool_array(value);
        array.forEach(v => ele.append(format_value(key, v).removeClass('column').addClass('value_option')));
        ele.removeClass('value_option');
      } else if (typeof value == 'string') {
        ele.append(value.replace('*',''), ...icons).addClass('value_option');
      } else if (type == 'boolean') {
        ele.append(value ? 'true' : 'false', ...icons).removeClass('column').addClass('value_option');
      } else {
        log({value},`not transformed ${key} (${type})`);
      }
      if (ele.find('.flexbox').dne()) ele.removeClass('column');
      return ele;
    };

    Item.LinkedKeyValues = new Features.KeyValueBox({
      transform_fx: format_value,
    });

    let header = $('<div/>',{text:`Any ${Item.LinkedTo} matching these settings will autofill the question`});
    let c_g = new Features.Icon({type:'checkmark',color:'green',size:1.3}), 
        c_y = new Features.Icon({type:'checkmark',color:'yellow',size:1.3}), 
        x_r = new Features.Icon({type:'styled_x',color:'red',size:1.3,css:{marginRight:'3px'}}), 
        x_y = new Features.Icon({type:'styled_x',color:'yellow',size:1.3,css:{marginRight:'3px'}}), 
        q = new Features.Icon({type:'question_mark',size:1.3,css:{marginRight:'3px',opacity:0.7}});
    let css = {margin:'0 3px',border:'1px solid var(--gray70)',padding:'2px 5px',borderRadius:'3px'},
      separator = $('<span/>',{text:'/',css:{color:'var(--gray)',fontSize:'1.4em',margin:'-0.5em -0.05em -0.5em -0.2em'}});
    let exact_legend = $(`<div/>`,{css,class:'flexbox'}).append(c_g.img,separator.clone(),x_r.img,'exact match'), 
        partial_legend = $(`<div/>`,{css,class:'flexbox'}).append(c_y.img,separator.clone(),x_y.img,'loose match'), 
        conditional_legend = $(`<div/>`,{css,class:'flexbox'}).append(q.img,'conditional match');
    let legend_toggle = $(`<span>icon legend</span>`).appendTo(header), legend = $('<div/>',{class: 'flexbox spacey box  boxPadReverse'}).append(exact_legend,partial_legend,conditional_legend);
    new Features.ToolTip({message:legend,target:legend_toggle});
    Item.LinkedSettingsOptionBox.reset_info(header);
    Item.LinkedSettingsOptionBox.add_info(Item.LinkedKeyValues.ele);
    for (let section_name in settings) {
      if (!['ExactMatch','Conditions','DisplayValues'].includes(section_name)) {
        // let display_name = $('h2').get().find(h => h.textContent.toKeyString() == section_name).textContent;
        let section_data = settings[section_name];
        log({section_data},`${section_name}`);
        Item.LinkedKeyValues.add_header(section_name, {html_tag: 'h4',css: {marginTop:'0.5em'}});
        Item.LinkedKeyValues.new_pairs = section_data || {};
      }
    }
    Item.LinkedKeyValues.unused_header_clear();

    let multi_eles = Item.LinkedKeyValues.items.filter(e => $(e).find('.value').find('.value_option').length > 1),
      single_eles = Item.LinkedKeyValues.items.filter(e => !multi_eles.includes(e));
    let to_optional = (ele) => {
      let green_checkmarks = $(ele).find('.checkmark.green'), yellow_checkmarks = $(ele).find('.checkmark.yellow'),
        red_xs = $(ele).find('.styled_x.red'), yellow_xs = $(ele).find('.styled_x.yellow');
      if (yellow_checkmarks.dne()) green_checkmarks.each((c,checkmark) => {
        let yellow = new Features.Icon({type:'checkmark',color:'yellow'}.merge(icon_options));
        yellow.img.insertAfter($(checkmark).hide());
      }); else {green_checkmarks.hide(); yellow_checkmarks.show();}
      if (yellow_xs.dne()) red_xs.each((x,red_x) => {
        let yellow = new Features.Icon({type:'styled_x',color:'yellow'}.merge(icon_options));
        yellow.img.insertAfter($(red_x).slideFadeOut());
      }); else {red_xs.hide(); yellow_xs.show();}
    }, to_exact = (ele) => { 
      let green_checkmarks = $(ele).find('.checkmark.green'), yellow_checkmarks = $(ele).find('.checkmark.yellow'),
        red_xs = $(ele).find('.styled_x.red'), yellow_xs = $(ele).find('.styled_x.yellow');
      if (green_checkmarks.dne()) yellow_checkmarks.each((c,checkmark) => {
        let green = new Features.Icon({type:'checkmark',color:'green'}.merge(icon_options));
        green.img.insertAfter($(checkmark).hide());
      }); else {yellow_checkmarks.hide(); green_checkmarks.show();}
      if (red_xs.dne()) yellow_xs.each((x,red_x) => {
        let red = new Features.Icon({type:'styled_x',color:'red'}.merge(icon_options));
        red.img.insertAfter($(red_x).slideFadeOut());
      }); else {yellow_xs.hide(); red_xs.show();}
    };
    if (multi_eles.notEmpty()) {
      multi_eles.forEach(e => {
        let key = $(e).find('.key');
        let name = key.text();
        let key_str = name.toKeyString();
        let setting_name = `ExactMatch.${key_str}`;
        let value_and_str = $(e).find('.value_option').get().map(v => $(v).text()).smartJoin('<b>AND</b>'),
            value_or_str = $(e).find('.value_option').get().map(v => $(v).text()).smartJoin('<b>OR</b>');

        let exact_match = {
          type: 'list',
          options: {
            list: ['yes, exact match', 'no, loose match'],
            listLimit:1,
            after_change_action: function() {
              let args = [...arguments];
              let answer = args[0], value = answer.get();
              log({tt:answer.ele.getObj('tooltip')});
              if (value === true) {
                to_exact(e);
                answer.str_display.html(`<u>Only matches when</u><br><b>"${name}"</b><br>is exactly<br><b>"${value_and_str}"</b>`);
              }
              else if (value === false) {
                to_optional(e);
                answer.str_display.html(`<u>Matches any time</u><br><b>"${name}"</b><br>includes<br><b>"${value_or_str}"</b>`);
              }
              else if (value === null && answer.ele.is(':visible')) {
                null_warning.show({ele:answer.ele,message:'response required, default selected'});
                answer.value = true;
              };
            },
          },
          settings: {save_as_bool:true},
          ele_css: {minWidth: '20em'},
          initial: true,
          setting_name
        };
        let popup = manager.popup_create({header:`Require Exact Match for <u>${name}</u>?`});
        let answer = popup.add(exact_match);
        answer.str_display = $(`<div/>`).insertAfter(answer.ele);
        answer.options.on_change_action(answer);
        answer.options.after_change_action(answer);
        key.append(popup.icon);
      })
      Item.LinkedKeyValues.realign();      
    }
    single_eles.forEach(e => {
      let key = $(e).find('.key');
      let name = key.text();
      let key_str = name.toKeyString();
      // let setting_name = `ExactMatch.${key_str}`;
      manager.delete_setting('ExactMatch',key_str);
      to_exact(e);
    })
    let conditional_eles = Item.LinkedKeyValues.items.filter(
      e => $(e).find('.value_option').get().some(v_ele => $(v_ele).data('condition') !== undefined )
    );
    if (conditional_eles.notEmpty()) {
      conditional_eles.forEach(e => {

        let info = $(e).find('.value_option').first().data('condition'), condition_str = info.condition_str;
        let icon = new Features.Icon({type:'question_mark',size:1.2,css:{opacity:0.7}});
        if (!skip_condition_icon.includes(info.key)) {
          let setting_name = info.key.split('.').pop();
          let str = `<u>Only matters when</u><br><b>"${setting_name.addSpacesToKeyString()}"</b><br>includes<br><b>"${condition_str}"</b>`;
          let key = $(e).children('.key').first();
          new Features.ToolTip({
            target: icon.img.appendTo(key),
            message: str,
            css: {maxWidth: 'min(15em, 90vh'}
          })
        }
      })
    }
  }
  static editor_setup () {
    Item.Delete = confirm({
      header: 'Delete Item',
      affirm: data => {
        let item = data.item;
        let index = item.index, parent = item.parent;
        parent.items.splice(index, 1);
        parent.item_ele(index).slideFadeOut(function(){$(item).remove()});
        parent.update_summary();
        item.form.autosave.trigger();
      }
    });
    Item.Paste = confirm({
      header: 'Confirm Follow Up Options',
      message: `Since you pasted this as a follow up, you'll need to update the conditions for "When To Ask This Question".<br>Click continue and scroll to the bottom.`,
      yes_text: 'continue',
      force_yes: true,
      affirm: data => { data.new_item.edit(data.new_item) },
      negate: () => { form.autosave.trigger() },
    });
    Item.Copy = confirm({
      header: 'Copy Item with Followups?',
      message: 'Would you like to copy this question with all of it accompanying followup questions?',
      yes_text: 'with all followups',
      no_text: 'without followups',
      affirm: function(data) { Item.clipboard.items = data.item.followup_json; },
      negate: function(){ Item.clipboard.items = []; },
      callback_no_response: function(data) { Item.clipboard.items = data.item.followup_json; },
    });
    Item.JustCopied = new Features.Banner({text:'copied!', color:'green', time_stay:1000});
    
    if ($('#ItemClipboard').dne()) {
      let list_icon = new Image();
      list_icon.src = '/images/icons/copy_icon_green.png';
      $(list_icon).css({width:'2em',height:'2em',opacity:0.7,cursor:'pointer'}).addOpacityHover();
      Item.ClipboardBanner = new Features.Banner({
        id: 'ItemClipboard',
        message: list_icon,
        color: 'green',
        hide_onclick: false,
        css: {padding: '0.5em'},
        position: {position: 'fixed', left:'0.5em', top:'50%',transform:'translateY(-50%)'},
      });
      Item.ClipboardList = new Features.List({
        header: 'Recently Copied',
        header_html_tag: 'h4',
        color: 'green',
        limit: 1,
        li_css: {textAlign:'left'},
      })
      Item.ClipboardBanner.ele.on('mouseleave',function(){ Item.ClipboardList.ele.slideFadeOut(); });
      Item.ClipboardList.ele.appendTo(Item.ClipboardBanner.ele).hide();
      $(list_icon).on('click',function(){Item.ClipboardList.ele.slideFadeIn()});
      $(`<div/>`,{text:'hide this until I copy something again',css:{cursor:'pointer',textDecoration:'underline',fontSize:'0.8em'}}).insertAfter(Item.ClipboardList.header).on('click',function(){Item.ClipboardBanner.hide()});
    }

    Item.LinkedEle = $(`<div id='LinkedOptions' class='wrapper itemOptionList'/>`).insertBefore('#FollowUpOptions');
    Item.LinkedInfo = $(`<div/>`,{class: 'box boxPink',css: {margin:'0.5em auto', display:'inline-block'}});
    Item.LinkedLabel = $('<div/>',{class:'settingsLabel pink',text:'Dynamic Linking'});
    Item.LinkedLimit = new Answer({
      type:'list', listLimit: 1, list: ['1','2','3','4','5','10','no limit'], name: 'listLimit', preLabel:'Selection Limit:', ele_css: {margin: '5px auto'}, eleClass: '!left'
    });
    Item.LinkedSettingsConfirm = confirm({
      affirm: data => { 
        let item = Item.LinkedProxy, settings = Item.LinkedProxySettings;
        alert('yeah');
        log({item,settings});
      }
    });      
    Item.LinkedSettingsOpen = async () => {
      // let item = 
      // let model = Item.LinkedTo, settings = Item.LinkedProxySettings = Item.LinkedToSettings;
      log({'current item':Item.current.item,proxy:Item.current.linked_proxy});
      // blurTop('loading');
      // let proxy = await Item.new_proxy({model,settings});
      // await Item.linked_to_settings_update();
      // Item.LinkedSettingsOptionBox.toggle(true);
      // blur($('#AddItem'), Item.LinkedSettingsOptionBox.ele);      
    }
    Item.LinkedSettingsOpenBtn = new Features.Button({
      text: 'autofill restrictions',
      class_list: 'pink70 xsmall',
      css: {marginTop:0},
      action: _ => { Item.current.item.open_proxy_settings() },
    })
    Item.LinkedSettingsOptionBox = new Features.OptionBox({
      header: 'Confirm Settings',
      message: 'Confirm meeee',
      css: {width: 'max-content'},
      toggle: function (no_changes = false) {
        if (no_changes) {
          this.save_btn.ele.hide();
          this.change_btn.ele.show();
          this.reset_header('Current Autofill Settings');
        } else {
          this.save_btn.ele.show();
          this.change_btn.ele.hide();
          this.reset_header('Confirm Settings');            
        }
      },
      reset: function () {
        log({this:this});
        this.reset_header(`${Item.LinkedTo} Autofill Settings`);
        this.reset_info(`No restrictions. All available items will be loaded.`);

      }
    });
    Item.LinkedSettingsOptionBox.hide();
    Item.LinkedSettingsOptionBox.save_btn = Item.LinkedSettingsOptionBox.add_button({text:'Confirm',class_list:'pink',action: () => {
      Item.LinkedToSettings = Item.LinkedProxySettings;
      Item.linked_to_fill();
      unblur({repeat:2});
    }});
    Item.LinkedSettingsOptionBox.change_btn = Item.LinkedSettingsOptionBox.add_button({text:'Make Changes',class_list:'pink',action: () => {
      let modal = '#SettingsModal';
      log({linkedto:Item.LinkedToSettings,currentproxysettings:Item.current.item.linked_model.attr_list.settings})
      // Item.LinkedToSettings = Item.LinkedProxySettings;
      // Item.linked_to_fill();
      Item.current.item.linked_model.settings_manager.form_fill(Item.LinkedToSettings == null ? {} : Item.LinkedToSettings);
      blur($('#AddItem'), modal);
    }});
    Item.LinkedSettingsOptionBox.add_button({text:'go back',class_list:'cancel'});
    log({ele:Item.LinkedEle});
    Item.LinkedEle.append(Item.LinkedLabel, Item.LinkedInfo, Item.LinkedLimit.ele, Item.LinkedSettingsOpenBtn.ele);
    Item.LinkedSettingsOpenBtn.ele.wrap(`<div class='wrapper'/>`);
  }
  static async linked_to_settings_modal () {
    let model = Item.LinkedTo, settings = Item.LinkedToSettings;
    log({settings},`LINKED SETTINGS MODAL: ${model}`);
    Item.LinkedProxy = new Models[model]({uid:'proxy'});
    await Item.LinkedProxy.settings();
    let proxy = Item.LinkedProxy, modal = $('#SettingsModal'), form = modal.find('.form');
    $("#Settings").html(`"${Item.current.item.options.text}"<br>${$('#Settings').text()} (for autofill)`);
    proxy.settings_manager = new Models.SettingsManager({
      obj: proxy,
      form: form,
      initial_override: Item.LinkedToSettings,
      autosave_on_form_change: true,
      autosave: new Features.Autosave({
        send: function() {
          return new Promise(resolve => {
            resolve(proxy.attr_list.settings);
            Item.LinkedProxySettings = proxy.attr_list.settings;
          })
        },
        // callback: Item.linked_to_settings_update,
        obj: proxy,
        delay: 50,
      }),
      update_callback: (options = {}) => {
        let answer = options.answer, key = options.key, value = options.value;
        let is_linked = answer.options.linked_to || null, is_number = answer.type == 'number';
        Item.LinkedSettingsAdjustMe = Item.LinkedSettingsAdjustMe || {};
        if (is_linked) {

          log({answer,key,value,is_linked,is_number,adjusted},`ADJUST ME ${key}`);
        } else if (is_number) { 
          let adjusted = value;
          if (answer.options.preLabel) adjusted = `${answer.options.preLabel} ${value}`;
          if (answer.options.units) adjusted += ` ${answer.options.units}`;
          Item.LinkedSettingsAdjustMe[key] = adjusted;
          // log({answer,key,value,is_linked,is_number,adjusted},`ADJUST ME ${key}`);
        }
      },
      mode: 'edit'
    });
    proxy.save_btn = new Features.Button({
      text:'use these settings for autofill',
      class_list: 'pink small',
      action: function(){
        Item.linked_to_settings_update();
        blurTop(Item.LinkedSettingsOptionBox.ele);
        // Item.LinkedSettingsOptionBox.realign();
      }
    });
    proxy.save_btn.ele.insertBefore(modal.find('.button.cancel'));
    // proxy.settings_manager.autosave();
    Item.LinkedProxySettings = proxy.attr_list.settings
  }
  option_list_fill () {
    Item.option_list_fill(this.options.options.list);
    if (this.options.linkedTo) {
      Item.LinkedTo = this.options.linkedTo;
      Item.linked_to_fill();
    }
  }
}
class Answer {
  constructor(data, mode = 'display'){
    this.type = data.type;
    this.mode = mode;
    if (!this[this.type]) throw new Error(`'${this.type}' not defined in class Answer`);
    this.options = data.options || data;
    this.name = this.options.name || '';
    this.setting_name = data.setting_name || this.name;
    this.settings = {required: true, warning: true, autocomplete: false}.merge(data.settings);
    this.save_as_bool = this.options.save_as_bool || this.settings.save_as_bool || false;
    this.initial = ifu(data.initial, null);
    for (let s in this.settings){
      if (typeof this.settings[s] == 'string') this.settings[s] = this.settings[s].toBool();
    }
    let html_tag = ifu(this.options.html_tag, 'div');
    this.ele = $(`<${html_tag} class='answer ${this.type}'></${html_tag}>`);
    if (this.options.id) this.ele.attr('id',this.options.id);
    this.ele.data('class_obj',this);
    if (['date','number','time'].includes(this.type)) this.ele.addClass('flexbox left');
    this[this.type]();
    if (this.options.name && this.input) { this.input.addClass(this.options.name); }

    let label_css = system.validation.json(this.options.labelCss);
    if (this.options.preLabel) {
      this.preLabel = $(`<${this.options.labelHtmlTag || 'span'}/>`,{
        class:`${this.options.labelClass || ''} preLabel`,
        html:this.options.preLabel
      }).prependTo(this.nowrap || this.ele);
      this.ele.addClass('flexbox left');
      if (label_css) this.preLabel.css(label_css);
    }
    if (this.options.postLabel) {
      this.postLabel = $(`<${this.options.labelHtmlTag || 'span'}/>`,{
        class:`${this.options.labelClass || ''} postLabel`,
        html:this.options.postLabel
      }).appendTo(this.nowrap || this.ele);
      this.ele.addClass('flexbox left');
      if (label_css) this.postLabel.css(label_css);
    }

    this.input.css(system.validation.json(data.input_css || this.options.input_css) || {});
    // this.ele.css(system.validation.json(data.ele_css || this.options.ele_css) || {});
    if (this.options.linked_to_settings) Models.SettingsManager.convert_obj_values_to_bool(this.options.linked_to_settings);
    if (!this.settings.autocomplete) this.input.attr('autocomplete','off');
    if (this.options.eleClass) {
      let classes = this.options.eleClass.split(' ');
      classes.forEach(c => {
        if (c.includes('!')) this.ele.removeClass(c.replace('!',''));
        else this.ele.addClass(c);
      })
    }
    if (this.options.inputClass) {
      let classes = this.options.inputClass.split(' ');
      classes.forEach(c => {
        if (c.includes('!')) this.input.removeClass(c.replace('!',''));
        else this.input.addClass(c);
      })
    }
    if (this.options.on_change_action && typeof this.options.on_change_action == 'string') this.options.on_change_action = this.options.on_change_action.to_fx;
    if (this.options.after_change_action && typeof this.options.after_change_action == 'string') {
      this.options.after_change_action = this.options.after_change_action.to_fx;
    }
    this.to_initial_value();
    
    if (data.proxy) {
      $(data.proxy).replaceWith(this.ele);
      if (!this.ele.isInside('.item') && !this.ele.isInside('#AddItem') && !this.has_label && this.settings.placeholder_shift !== false && !this.options.ele_css) {
        this.ele.css({marginTop:'1.5em'});
      }
    }
    
    if (this.options.after_load_action) this.options.after_load_action.to_fx();
  }

  verify (string = null) {
    let str = string || this.if_null_str || 'this question is required', i = this.input, value = this.get();
    if (value == null && this.settings.required) {
      i.smartScroll({
        offset: get_rem_px() * 4,
        callback: function(){i.warn(str);}
      });
      return false;
    }
    return value;
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
    if (this.time2 && value && value.is_array()) {
      this.time2.value = value[1];
      value = value[0];
    }

    if (['text', 'email','phone','textbox', 'number', 'dropdown', 'time', 'date'].includes(this.type)) {
      if (typeof value == 'string') {
        let split = Answer.split_values_and_text(value);
        this.input.val(split.text).data('value',split.value);        
      } else this.input.val(value);
    }
    else if (this.type == 'list'){
      this.input.resetActives();
      if (value === null) return;
      this.input.find('li').filter((l,li) => {
        if (!value.is_array()) value = [value];
        return value.some(v => {
          let li_v = $(li).data('value');
          if (typeof v == 'string') return li_v == v || li_v.toKeyString() == v.toKeyString();
          else if (typeof v == 'number') return l == v;
        });
      }).addClass('active');
    } else if (this.type == 'checkboxes') {
      let boxes = this.input.find('input');
      boxes.attr('checked',false);
      if (value === null) return;
      boxes.filter((b,box) => {
        if (!value.is_array()) value = [value];
        return value.some(v => {
          if (typeof v == 'string') return $(box).attr('value').toKeyString() == v.toKeyString();
          else if (typeof v == 'number') return b == v;
        });
      }).attr('checked',true);
    } else if (this.type == 'address') {
      if (!value) this.ele.find('input').val('');
      else {
        let str = this.parse(value.duplicate().merge({include_unit:false})).join(', ');
        this.components = value.components;
        this.unit = value.unit;
        this.input.val(str);
        this.unit_ele.val(value.unit);
        this.display.html(this.display_html());
      }
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
    this.followup_show(0);
  }
  set value_change (value) {
    this.value = value;
    this.on_change();
  }
  get has_filter () {return this.ele.isInside('.filter')}
  get has_label () {return this.options.preLabel || this.options.postLabel || false;}
  get filter () {return this.ele.closest('.filter').getObj()}
  get linked_uids () {
    let selection = this.linked_selection;
    if (!selection) return null;
    let uids = selection.get().map(s => $(s).data('value'));

    return this.linked_limit == 1 ? uids[0] : uids;
  }
  get linked_selection () {
    let selected = null;
    if (this.linked_list) {
      selected = this.linked_list.active;
    }
    return selected;
  }
  get item () { return this.ele.getObj('item'); }

  on_change (ev) {
    // log({answer:this, value:this.get({literal:true})},`${this.name || 'no name'}`);
    this.placeholder_shift();
    this.followup_show();
    if (this.has_filter) this.filter.update();
    if (this.options.on_enter_action && ev.keyCode && ev.keyCode === 13) this.options.on_enter_action.to_fx(this, ev);
    if (this.type == 'time' && this.ele.parent().is('.answer.time')) {
      this.ele.parent().getObj().on_change(ev);
      return;
    }
    if (this.options.on_change_action) this.options.on_change_action.to_fx(this, ev);
    if (this.options.after_change_action) this.options.after_change_action.to_fx(this, ev);
  }
  static condition_matches_parent (value, condition) {
    let c = condition, matched = false;
    try {
      if (['number','scale'].includes(c.type)){
        if (c.conditionNumberComparator.includes('less than') && value < c.conditionNumberVal) matched = true;
        if (c.conditionNumberComparator.includes('greater than') && value > c.conditionNumberVal) matched = true;
        if (c.conditionNumberComparator.includes('equal to') && value == c.conditionNumberVal) matched = true;
      }else if (c.type == 'time'){
        let time_to_check = moment(value,'h:mma'), time = moment(c.conditionTime, 'h:mma');
        if (c.conditionTimeComparator.includes('before') && time_to_check.isBefore(time)) matched = true;
        if (c.conditionTimeComparator.includes('exactly') && time_to_check.isSame(time)) matched = true;
        if (c.conditionTimeComparator.includes('after') && time_to_check.isAfter(time)) matched = true;
      }else if (['list','checkboxes'].includes(c.type)){
        if (value) {
          if (typeof value == 'string') value = [value];
          if (value.some(v => c.conditionList.map(l => l.toLowerCase()).includes(v.toLowerCase()))) matched = true;
        }
      }else if (c.type == 'dropdown'){
        if (c.conditionList.includes(value)) matched = true;
      }else log(`condition type not found: ${c.type} `);
    } catch (error) {
      log({error, value, condition},`Condition match error`);
    }
    return matched;
  }
  followup_show (time = 400) {
    let item_ele = this.ele.closest('.item');
    if (item_ele.dne() || this.mode == 'build') return;
    let followup_time = this.ele.getObj('form').followup_time, item = item_ele.getObj();
    time = ifu(followup_time, time);
    let items = item.items, value = this.get({literal:true});
    let toggle_me = [], hide_me = [], show_me = items;
    if (items && items.notEmpty()) {
      if (value === null) {
        let hide_all = show_me.map(i => i.ele[0]);
        $(hide_all).slideFadeOut();
      } else {
        show_me = items.filter(followup => {
          let show_me = Answer.condition_matches_parent(value, followup.options.condition), already_showing = ifu(followup.showing,false);
          if (!show_me) hide_me.push(followup.ele[0]);
          if (show_me !== already_showing) toggle_me.push(followup.ele[0]);
          followup.showing = show_me;
          return show_me;
        }).map(i => i.ele[0]);
        $(show_me).slideFadeIn(time);
        $(hide_me).slideFadeOut(time);        
      }
      let blur = item.ele.closest('.blur');
      if (blur.exists() && toggle_me.notEmpty()) {
        let parent = blur.parent(), child = blur.children().first();
        // fit_to_size(parent,child,500);
      }
    }
    // if (value && items && items.notEmpty()) log({items,value,show_me,hide_me,toggle_me,time},`${show_me.length} FOLLOWUPS for ${this.options.name || this.name || 'nameless'}`)
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
  async linked_list_get(model) {
    this.waiting_for_list = true;
    let list = (await Models.ModelList.get(model, this)).list;

    if (this.options.linked_to_settings) {
      // console.groupCollapsed(`Linked SETTINGS ${this.setting_name}`);
      // log({options:this.options,settings:this.options.linked_to_settings});
      list = list.filter(l => {
        // console.groupCollapsed(`${l.name}`);
        let match = Models.SettingsManager.compare_settings({
          match_to: this.options.linked_to_settings, 
          match_me: l.settings
        });
        // if (match) log({settings:l.settings},`MATCH ${l.name} settings`);
        // console.groupEnd();
        return match;
      })
      log({list});
      console.groupEnd();
    }
    this.waiting_for_list = false;
    return list;
  }
  async linked_popup_create () {
    this.waiting_for_list = true;
    let model = this.options.linked_to, answer = this;
    let disp_model = model.toKeyString(true).replace('Icd ','ICD ').replace('Cpt ','CPT ');
    this.linked_limit = this.options.listLimit || 1;
    this.linked_list = new Features.List({
      header: `${disp_model} List`,
      header_html_tag: 'h3',
      header_class: 'bold',
      with_search: true,
      cssLiOnly: {width:'max-content',maxWidth:'20em'},
      filter: this,
      limit: this.linked_limit,
      post_select_fx: _ => {
        if (this.linked_list.limit == 1 && this.linked_list.active.length == 1) this.linked_list.tt.hide();
      }
    });
    this.linked_tt = new Features.ToolTip({
      message: this.linked_list.ele,
      target: this.input,
      with_arrow: false,
      // class_list: 'linked_popup'
    });
    if (this.options.list_separator == 'line break') this.options.list_separator = '\n';
    let list = this.linked_list, columns = this.options.linked_columns || [], data_list = await this.linked_list_get(this.options.linked_to, columns);
    
    data_list.forEach(option => {
      list.add_item({text:option.name, value:option.uid, entire_li_clickable:true, action:answer.linked_select_click.bind(answer)});
    })
    this.input.on('keyup', this.on_change.bind(this));
  
    model = model.toKeyString();
    this.linked_tt.ele.append(Models.Model.popup_links(model));
    this.waiting_for_list = false;
  }
  async linked_list_update () {
    let answer = this, list = this.linked_list, data_list = await Models.Model.get_list({model:this.options.linked_to,obj:this,columns:[]});
    list.remove_all();
    data_list.forEach(option => {
      list.add_item({text:option.name, value:option.uid, entire_li_clickable:true, action:this.linked_select_click.bind(this)});
    })
  }
  linked_select_click (ev) {
    let target = $(ev.target).closest('li'), val = target.data('value');
    this.linked_text_update();
    this.on_change(ev);
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
      if (this.type == 'list') {
        this.ele.resetActives();
        if (!uids) return;
        this.ele.find('li').filter((l,li) => uids.some(uid => $(li).data('value') == uid)).addClass('active');
      } else if (this.type == 'checkboxes') {
        let checkboxes = this.input.find('input');
        checkboxes.removeAttr('checked');
        if (!uids) return;
        checkboxes.filter((c,checkbox) => uids.some(id => $(checkbox).attr('value') == id)).attr('checked',true);
      } else {
        this.linked_text_update(uids);
      }
    } catch (error) {
      log({error,uids});
    }
  }
  linked_text_update (uids = null) {
    if (uids) {
      if (!uids.is_array()) uids = [uids];
      this.linked_list.ele.resetActives();
      this.linked_list.items.filter((i,item) => uids.some(u => $(item).data('value') == u)).addClass('active');
    }
    setTimeout(_ => {
      let selection = this.linked_selection, value = '';
      if (selection) {
        value = selection.get().map(item => $(item).text());
        if (this.options.list_separator) value = value.join(this.options.list_separator);
        else value = value.smartJoin();
      }
      this.input.val(value);
      this.placeholder_shift();
    },50);
  }

  password () {
    this.type = 'text';
    this.text();
    this.ele.addClass('text');
    this.input.attr('type','password');
  }
  disable (options) { 
    this.is_disabled = true; 
    if (this.disable_unique) this.disable_unique(options); 
    // let tooltip = options.tooltip || null;
    // if (tooltip) new Features.ToolTip(tooltip.merge({target:this.input}));
    // log({input:this.input})
  }
  enable (options) { this.is_disabled = true; if (this.enable_unique) this.enable_unique(); }
  async text () {
    this.input = $(`<input>`).appendTo(this.ele).on('keyup',this.on_change.bind(this));
    if (this.options.placeholder) this.input.attr('placeholder', this.options.placeholder);
    this.get = () => {
      if (this.linked_list) return this.linked_uids;
      let v = $.sanitize(this.input.val().trim());
      return (v != '') ? v : null;
    }
    this.disable_unique = () => { this.input.attr('disabled',true)};
    this.enable_unique = () => { this.input.removeAttr('disabled')}
    this.placeholder_visible = false;
    if (this.options.name == 'username') system.validation.input.username(this.input);
    if (this.options.placeholder) this.input.on('keyup blur',this.placeholder_shift.bind(this));
    if (this.options.linked_to) await this.linked_popup_create();
  }
  async phone () {
    this.text();
    this.ele.addClass('text');
    this.input.on('focusout',this.on_change.bind(this));
    system.validation.input.phone(this.input.attr({placeholder:'(       )       -'}));
  }
  async email () {
    this.text();
    this.ele.addClass('text');
    this.input.on('focusout',this.on_change.bind(this));
    system.validation.input.email(this.input);
  }
  async textbox () {
    this.input = $(`<textarea/>`).appendTo(this.ele).on('keyup',this.on_change.bind(this));
    if (this.options.placeholder) this.input.attr('placeholder', this.options.placeholder);
    this.if_null_str = 'boxxy';
    this.get = () => {
      if (this.linked_list) return this.linked_uids;      
      let v = $.sanitize(this.input.val());
      return (v != '') ? v : null;
    }    
    this.placeholder_visible = false;
    if (this.options.placeholder) this.input.on('keyup blur',this.placeholder_shift.bind(this));    
    if (this.options.linked_to) await this.linked_popup_create();
  }
  address_format (components, unit = null) {
  }
  async address () {
    let answer = this;
    let display = this.display = $('<div/>',{class:'address_display'}).appendTo(this.ele);
    let parse = this.parse = system.validation.address.parse;

    this.reset = (warn = true) => { 
      this.components = this.init('components'); 
      this.unit = this.init('unit'); 
      this.tz = this.init('tz');
      display.html(this.display_html()); 
      this.on_change();
    }
    this.display_html = () => parse({components:this.components, unit:this.unit}).map(line => `<div>${line}</div>`);
    this.init = attr => { return this.initial ? this.initial[attr] : null }
    // this.init_components = () => { return this.initial ? this.initial.components : null}
    // this.init_unit = () => { return this.initial ? this.initial.unit : null}
    this.db = () => {return this.components ? {components:this.components, unit:this.unit, tz:this.tz} : null};
    this.components = this.init('components');
    this.unit = this.init('unit');
    this.tz = this.init('tz');
    // log({c:this.components,u:this.unit,this:this});

    let search = this.input = $(`<input/>`,{class:'search'}).appendTo(this.ele).on('focusout', _ => { if (this.input.val() != '') this.autocomplete.place_changed(); else this.reset(false); });
    let unit = this.unit_ele = $(`<input/>`,{class:'unit',attr:{placeholder:'Unit'}}).appendTo(this.ele).on('focusout', _ => { if (this.input.val() != '') this.autocomplete.place_changed(); else this.reset(false); });
    let options = {
      fields: ['formatted_address','address_components','geometry'],
      place_changed: async function() { 
        let place = this.getPlace(), n = $.sanitize(unit.val());
        n = n != '' ? n : null;
        answer.unit = n;

        // if (!place || !place.geometry) { return db; }
        if (place && place.address_components) {
          let addy = place.formatted_address;
          search.val(place.formatted_address);
          answer.components = place.address_components;
        }
        if (place && place.geometry) {
          let lat = place.geometry.location.lat(), lng = place.geometry.location.lng();
          
          let location = `${lat},${lng}`,
            timestamp = now().toSeconds(),
            key = map_api_key,
            rest = `https://maps.googleapis.com/maps/api/timezone/json?location=${location}&timestamp=${timestamp}&key=${key}`;
          let tz = await new Promise((resolve,reject) => {
            var request = new XMLHttpRequest();
            request.responseType = 'json';
            request.addEventListener("load", _ => {resolve(request.response.timeZoneId)});
            request.open("GET", rest);
            request.send();
          })
          log({rest,location,timestamp,key,tz});
          answer.tz = tz; 
        }
        let db = answer.db();
        log({place,db,n});
        answer.on_change();
        if (db) display.html(answer.display_html());
        // let db = {components:answer.components,unit:answer.unit};
        return db;
      },
    };
    this.autocomplete = new google.maps.places.Autocomplete(this.input[0],options);
    this.autocomplete.setComponentRestrictions({
      country: ["us"],
    });
    unit.on('keyup', _ => { this.autocomplete.place_changed() });
    this.input.attr('placeholder', this.options.placeholder || 'Type to begin');
    // this.input.removeClass('Address');
    this.get = () => {
      return this.db();
    }    
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
    ['min','max','start','step'].forEach(attr => {if (num[attr]==undefined) throw new Error(`${attr} is required`)})
    this.change = {
      start: (ev) => {
        let arrow = $(ev.target);
        ev.preventDefault();
        this.change.count = 0;
        this.change.error = null;
        this.change.direction = arrow.hasClass('up') ? 'up' : 'down';
        this.change.interval = 300;
        this.change.current = this.get();
        if (this.change.current === null) {
          this.change.decimals = this.step.countDecimals();
        }
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
        // let i = this.input.getObj('item');
        // if (i && this.two_part && i.next_is_null()) {
        //   let ele = i.next_item_ele.children('.answer');
        //   new Warning({ele,message:'How often?'})
        //   this.border_flash = setTimeout( _ => ele.removeClass('borderFlash'), 4000);
        //   // this.animate_arrow();
        // }
      },
      adjust: () => {
        this.change.next = this.change.current;
        if (this.change.next === null) this.change.next = Number(this.options.start);
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
        if (this.change.current === null) return true;
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
        }else if (Number.isNaN(Number(this.change.next))){
          this.change.error = `numbers only`;
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
    this.input.data(this.options).attr('placeholder',this.options.start);
    this.input.allowKeys('0123456789/.-');
    this.input.on('keydown',function(){clearTimeout(num.followup_timeout)})
    this.input.on('keyup',function(ev){
      num.change.current = num.get();
      num.change.next = num.change.current;
      num.change.check();
      num.followup_timeout = setTimeout(num.on_change.bind(num),1000);
    });

    this.get = () => {
      let v = $.sanitize(this.input.val()), fixed = this.options.fixed_decimals ? Number(this.options.fixed_decimals) : null;
      if (v === '') return null;
      return (v !== '') ? (fixed ? Number(v).toFixed(fixed) : Number(v)) : null;
    }
    this.update = (new_obj) => {
      ['min','max','start','step'].forEach(attr => {
        if (attr == 'step') this[attr] = new_obj[attr] || 1;
        else this[attr] = new_obj[attr]
      });
      this.input.attr('placeholder',new_obj.options.start);
      this.value = new_obj.options.start;
      let t = new_obj.options.units || null;
      this.ele.children('span').text(t);
    }
  }
  async icd_code () {
    this.input = $(`<input>`).appendTo(this.ele);
    this.options.linked_to = 'ICDCodes';
    await this.linked_popup_create();
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
  async checkboxes () {
    let i = this;
    let handle_click = function(ev) {
      let limit = !Number.isNaN(i.options.listLimit) ? Number(i.options.listLimit) : null, active = i.get({literal:true}),
        is_active = $(this).closest('label').find('input').is(':checked');
      if (limit) {
        let at_limit = active && active.length == limit + 1;
        if (at_limit) {
          let text = limit == 1 ? `Limited to ${limit} response` : `Limited to ${limit} responses`
          $(this).closest('.answer').warn(text); ev.preventDefault();
        } else i.on_change.bind(i,ev)();
      } else i.on_change.bind(i,ev)();
      i.reset_active();
    }
    this.reset_active = _ => {
      this.input.resetActives();
      this.input.find('input').filter(':checked').closest('label').addClass('active');
    }
    this.input = $(`<div/>`,{class:'checkbox_list'}).on('click','input', handle_click).appendTo(this.ele);
    let list = this.options.list;
    if (this.options.linked_to) {
      list = await this.linked_list_get(this.options.linked_to);
      log({model:this.options.linked_to, list});
      list = list.map(model => `${model.uid}%%${model.name}`);
    }
    list.forEach(option => {
      option = Answer.split_values_and_text(option);      
      $(`<label class='flexbox inline nowrap'><input type='checkbox' value="${option.value}"><span>${option.text}</span></label>`).appendTo(this.input);
    });
    // log({html:this.input.html()},`${this.name || this.options.name}`);
    this.get = (options = {}) => {
      let keys_from_text = ifu(options.keys_from_text, false), literal = ifu(options.literal, false), as_text = ifu(options.as_text, false);
      let input = this, values = null, as_is = this.options.keys_as_is || this.settings.keys_as_is || false;
      if (this.save_as_bool && !literal) {
        let checked = this.input.find('input:checked');
        if (this.options.listLimit === 1) return checked.dne() ? false : checked.first().val().toBool();
        if (checked.dne()) return null;
        values = {};
        this.input.find('label').get().forEach(l => {
          let i = $(l).find('input'), s = $(l).find('span');
          let key = keys_from_text ? s.text() : as_is ? i.attr('value') : i.attr('value').toKeyString();
          values[key] = i.is(':checked');
        });
      } else {
        values = this.input.find(':checked').get().map(i => as_text ? $(i).closest('label').text() : $(i).val()); 
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
      this.options.list = this.options.list.map(option => `${option.uid}%%${option.name}`);
    };
    this.options.list.forEach(option => {
      option = Answer.split_values_and_text(option);
      $(`<li data-value='${option.value}'>${option.text}</li>`).appendTo(this.input)
    });
    this.active = () => {return this.input.find('.active').get().map(li => $(li).data('value'))};
    this.get = (options = {}) => {
      let keys_from_text = ifu(options.keys_from_text, false), literal = ifu(options.literal, false);      
      let active = this.input.find('.active'), values = active.get().map(li => $(li).data('value'));
      if (this.save_as_bool && !literal) {
        // log({active,input:this.input,values});
        let label = `${this.options.usePreLabel ? this.options.preLabel : this.name}`.toKeyString(), obj = {};
        if (this.options.listLimit == 1) {
          if (label !== '') values[0] ? obj[label] = values[0].toBool() : obj = null;
          else obj = values[0] ? values[0].toBool() : null;
        } else {
          obj[label] = {};
          this.input.find('li').each((l,li) => obj[label][$(li).data('value')] = $(li).data('value').toBool());
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
    this.get = (options = {}) => {
      let literal = ifu(options.literal, false);
      let val = this.input.val(), response = val != '----' ? val : null;
      if (response && this.save_as_bool && !literal) response = response.toBool();
      return  response;
    }
  }
  async scale () {
    this.input = $(`<div/>`, {class:'flexbox'}).appendTo(this.ele);
    let left = $(`<span/>`,{class:'left',html:`<span class='value'>${this.options.min}</span><br><span class='label bold'>${this.options.leftLabel}</span>`}),
        right = $(`<span/>`,{class:'right',html:`<span class='value'>${this.options.max}</span><br><span class='label bold'>${this.options.rightLabel}</span>`}),
        slider = $(`<input type='range' class='slider' min='${this.options.min}' max='${this.options.max}' start='${this.options.start}'>`),
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
    // let selection_limit = 2;
    let css = {width:`${selection_limit ? `${selection_limit*8}em` : '40em'}`,maxWidth:'calc(100% - 3em)'};
    this.input = $(`<input placeholder='MM/DD/YYYY'>`).css(css).appendTo(this.ele);
    system.validation.input.date(this.input);
    let cal_icon = new Image();
    cal_icon.src = `/images/icons/cal_icon_yellow.png`;
    $(cal_icon).css({height:'2em',width:'2em',opacity:'60%',marginLeft:'0.5em',cursor:'pointer'});
    let d = this, i = this.input, options = {
      showTrigger:$(cal_icon),
      onClose: function(dates){
        $('.datepick-trigger').animate({opacity:0.6})
        let min = LUX.String.datepick.shorthand(d.options.minDate), 
          max = LUX.String.datepick.shorthand(d.options.maxDate),
          valid = LUX.String.datepick.validate(i.val(), min, max);
        if (valid !== true) i.warn(valid);
      },
      onShow: function(picker,instance){
        if (selection_limit && selection_limit != 1 && instance.selectedDates.length == selection_limit) {
          i.warn('Maximum number selected');
        }
        instance.elem.parent().find('.datepick-trigger').animate({opacity:1})
      },
      showAnim: 'fadeIn',
      dateFormat: 'm/d/yyyy',
      multiSeparator: ', ',
    };

    if (selection_limit != 1) options.multiSelect = selection_limit ? selection_limit : 999;
    // options.multiSelect = 2;
    if (this.options.minDate) options.minDate = this.options.minDate;
    if (this.options.maxDate) options.maxDate = this.options.maxDate;
    if (this.options.yearRange) options.yearRange = this.options.yearRange;
    this.input.datepick(options);
    this.ele.find('.datepick-trigger').on('mouseenter',function(){$(this).animate({opacity:1})})
      .on('mouseleave',function(){if ($('.datepick-popup').dne()) $(this).animate({opacity:0.6})});
    this.input = this.input.add(cal_icon);
    this.get = () => {
      let v = this.input.val();
      let sorted = v !== '' ? LUX.Sort(v) : null;
      let value = sorted ? sorted.map(d => d.date_num).join(', ') : null;
      return value;
    }

    this.disable_unique = (options = {}) => { 
      this.input.datepick('disable'); 
      let fontSize = get_em_px(this.ele);
      if (options.tooltip) new Features.ToolTip(options.tooltip.merge({
        target:this.ele,
        css:{backgroundColor:'var(--pink10o)',color:'var(--pink)',borderColor:'var(--pink50)'},
        translate: {y: fontSize * 2}
      }));
    };
    this.enable_unique = () => { 
      this.input.datepick('enable');
      let tt = this.ele.data('tooltip');
      if (tt) tt.ele.remove();
    };
  }
  async time () {
    this.input = $(`<input placeholder='H:MM A'>`).appendTo(this.ele);
    let i = this;
    // if (this.options.minTime) this.options.maxTime = this.options.maxTime || '12:00 AM';
    system.validation.input.time(this.input).on('change', function(){
      setTimeout(i.on_change.bind(i),100);
    }).on('blur',function(){
      // log(i.options);
      setTimeout(function(){
        let min = LUX.From.time(i.options.minTime), max = LUX.From.time(i.options.maxTime);
        let valid = LUX.String.time.validate(input.val(), min, max);
        if (valid !== true) input.warn(valid);          
      },100)
    })
    let input = this.input, clock_icon = new Image();
    clock_icon.src = `/images/icons/clock_icon_yellow.png`;
    $(clock_icon).css({height:'2em',width:'2em',opacity:'60%',marginLeft:'0.5em',cursor:'pointer'})
    $(clock_icon).on('mouseenter',function(){$(this).animate({opacity:1})}).on('mouseleave',function(){if (!input.is(':focus')) $(this).animate({opacity:0.6})}).on('click',function(){i.input.focus()}).insertAfter(this.input);
    this.input.on('blur',function(){$(clock_icon).animate({opacity:0.6})});
    this.options.scrollDefault = 'now';
    this.options.timeFormat = 'g:i A';
    if (this.options.min !== null) this.options.minTime = this.options.min;
    else delete this.options.min;
    if (this.options.max !== null) this.options.maxTime = this.options.max;
    else delete this.options.max;
    if (this.options.step == null) this.options.step = 15;
    this.input.timepicker(this.options);

    if (this.options.range) {
      this.time2 = new Answer({type:'time',options:{
        min: this.options.min2,
        max: this.options.max2,
        step: this.options.step2,
      }});
      this.tween_ele = $('<div/>',{text:'to',css:{fontSize:'1.2em',margin:'0 1em'}});
      this.ele.append(this.tween_ele, this.time2.ele.addClass('nowrap')).addClass('range');
    }

    this.get = () => {
      let v = $.sanitize(this.input.val());
      v = v != '' ? v : null;
      let response = v;
      if (this.time2) response = [v, this.time2.get()];
      log({response},'TIME RESPONSE');
      return response;

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
  static reset_all(ele = null) {
    let answers = Answer.get_all_within(ele || 'body', false);
    answers.forEach(a => a.reset());
  }
  static get_all_within (ele, visible_only = true) {
    let eles = $(ele).find('.answer'); 
    if (visible_only) eles = eles.filter(':visible');
    return eles.get().map(answer => $(answer).getObj('answer',false));
  }
  static find (array, options) {
    let match = Answer.find_all(array,options);
    if (match.length > 1) {
      log({error: new Error('WARNING multiple answers found matching options'),array,options,match},); 
      return match;
    }
    return match[0] ? match[0] : null;
  }
  static find_all (array, options) {
    try {
      let matches = array.filter(answer => {
        if (answer === null) return false;
        for (let attr in options) { 
          if (answer[attr] === undefined) return false;
          if (options[attr].is_array()) {let some = options[attr].some(o => answer[attr] == o); if (!some) return false;}
          else if (answer[attr] != options[attr]) return false;
        }
        return true;
      })
      return matches;
    } catch (error) {
      log({error, array, options});
      return [];
    }
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
    let buttons = ifu(options.buttons, null), button_wrap = this.buttons;
    if (buttons){
      buttons.forEach(button => {
        button.class_list += ' white xsmall';
        new Features.Button($.extend(button,{appendTo:button_wrap, css: {margin:'0.2em 0.3em',fontWeight:'bold'}}));
      })
    }
    this.ele.append(this.plus_sign).on('mouseenter',this.show.bind(this)).on('mouseleave',this.hide.bind(this));
    $(this.plus_sign).on('click',this.click.bind(this));
  }
  get button_width () {
    let w = this.buttons.find('.button').get().map(b => b.offsetWidth).reduce((sum,current) => sum + current, 0);
    w += get_rem_px() * 2;
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

export const Forms = {FormEle, SubmissionJson, Section, Item, Answer};

var forms = {
  current: null,
  reset: () => {
    forms.current = null;
  },
  create: {
    editor: {
      options: {
        reset: () => {
          $("#AddItem, #AddText").resetActives().find('input,textarea').val('');
          $("#AddItemText").focus();
          forms.create.editor.options.list.reset();
          forms.create.editor.options.show();
        },
        list: {
          reset: () => {
            throw new Error('dont use this dummy');
            let list = $("#OptionsList"), options = list.find('.answer.text');
            $('#linked_to').parent().hide();
            if (options.length < 2) forms.create.editor.options.list.add_option();
            options.each((o,option) => {
              $(option).removeData('value').find('input').val('');
              $(option).find('input').removeAttr('readonly');
              if (options.index(option) > 1) option.remove()
            });
          },
          fill: list => {
            throw new Error('dont use this dummy');
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
            throw new Error('dont use this dummy');
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
          throw new Error(`dont use this dummy`);
          let option_lists = $('.itemOptionList'),
            match = option_lists.not("#FollowUpOptions").get().find(list => $(list).data('type') && ($(list).data('type') == type || $(list).data('type').includes(type)));
          if (type){
            $(match).slideFadeIn(time);
            option_lists.not(match).slideFadeOut(time);
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
          throw new Error('dummy dont use');
          let link_modal = $(`<div/>`,{class:'modalForm center'});
          let list = new Features.List({header:'Available for Linking',li_selectable:false});
          link_modal.append(`<h3>Select a Category</h3><div>Linking a question to a category will allow the user to select from an up-to-date list of that category. There will be no need to update the question if you add to the category</div>`,list.ele);
          for (let model in class_map_linkable) {
            if (model != 'list') list.add_item({
              text:model.addSpacesToKeyString(),
              action: async function(){
                try{
                  blurTop('loading');
                  let list = linkable_lists[model] || await Models.Model.get_list({model}), list_ele = $("#OptionsList");
                  Item.reset_modal();
                  Item.option_list_fill(list);
                  Item.LinkedTo = model;
                  Item.linked_to_fill();
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
          let answer = new Answer(data.merge({proxy:proxy}));
        }catch(error){
          log({error,proxy});
        }
      })
    },
    submit_buttons: () => {
      init('.submit.create',function(){
        $(this).on('click', async function(){
          try{
            let instance = null;
            let model_name = $(this).data('model');
            if ($(this).hasClass('create')){
              instance = model_name.to_class_obj();
            } else if ($(this).hasClass('edit')) {
              instance = Models[model_name].editing;
              if (!instance.update_attr_by_form()) throw new Error('form error');
            }
            if ($(this).data('wants_checkmark')) instance.wants_checkmark = true;
            if ($(this).data('clear_count')) instance.clear_count = $(this).data('clear_count');
            if ($(this).data('save_callback')) instance.save_callback = $(this).data('save_callback');
            log({instance},'pre-save instance');
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
          Item.option_list_show(400, type);
        });
        $('#AddItem').on('click', '.save', Item.create)

        $('#AddSection').on('click', '.add', function(){
          let section = Section.create();
          if (section) forms.current.autosave.trigger();
        });
        let form_name = new Features.Editable({
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
                let option = Item.option_list_add(), input = option.ele.find('input');
                input.val(''); input.focus();
              }
              else next.find('input').focus();
            }
          })
        arrow_proxy.replaceWith(arrows.ele);
        options_list.find('.answer').removeClass('left').addClass('inline');
        forms.create.autofill();
        Item.editor_setup();
      });
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
    embedded_icd: () => {
      // if (!ICD.Settings.apiSecured) ICD.Handler.configure(EMBEDDED_ICD_SETTINGS,EMBEDDED_ICD_CALLBACKS);
      let new_input = system.initialize.find('.ctw-input');
      if (new_input && new_input.length > 0) {
        ICD.Handler.configure(EMBEDDED_ICD_SETTINGS,EMBEDDED_ICD_CALLBACKS);
        $('.ctw-input').each(function(){
          $(this).attr('autocomplete','off');
          let n = $(this).data('ctw-ino');
          ICD.Handler.bind(n);
        })
      }
    }
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