import { system, practice, log, Features } from './functions';
import { model, Models, linkable_models, linkable_lists } from './models';
import { DateTime as LUX } from 'luxon';
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
    log({ entity });
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
    let options = $(proxy).data();
    this.is_proxy = $('#Settings').exists() && $('#Settings').data('is_proxy');
    this.define_by(options);
    this.define_by(this.json);

    if (this.mode == 'chart') { this.mode = 'use'; this.charting = true; }

    if (this.settings === null) this.settings = {};
    if (this.mode == 'use' && this.name == 'Form Settings') this.ele_id = 'Form Settings Display';

    this.ele = $(`<div/>`, { class: 'form', id: (this.ele_id || this.name || '').toKeyString() });
    $(proxy).replaceWith(this.ele);
    this.ele.data({ class_obj: this, uid: this.id }).addClass(this.mode);
    if (this.charting) this.ele.addClass('charting');

    this.header = $(`<h1/>`, { text: this.name, class: 'form_header center' }).appendTo(this.ele);

    this.section_list = new Features.List({
      id: 'SectionList',
      header: 'Sections',
      entire_li_clickable: false,
      li_class: 'flexbox spread',
      selectable: false,
    });

    this.section_array = [];
    this.section_ele = $(`<div/>`, { class: 'sections' }).appendTo(this.ele);
    if (this.charting) this.section_ele.hide();
    if (this.sections && typeof this.sections == 'string') this.sections = JSON.parse(this.sections);
    if (this.sections && this.sections.notEmpty()) this.sections.forEach(section => this.section_add(section));
    forms.initialize.signatures();
    // this.add_buttons();

    if (this.autosave) {
      // log(this.autosave);
      this.fill_by_key_value_object(this.autosave);
    } else if (this.responses) {
      this.fill_by_response(this.responses);
      this.disable();
    }

    this[`${this.mode}_mode`]();
    if (this.charting) this.chart_mode();


    if (this.mode != 'build') {
      if (!this.settings_manager) this.settings_manager = new Models.SettingsManager({ obj: this });
      this.settings_apply();
    }

    // if (this.mode == 'build' && Item.clipboard_history && Item.clipboard_history.notEmpty()) Item.ClipboardBanner.show();
    // if (this.charting) this.add_charting_features();

    log(`FormEle (${this.mode.toUpperCase()}) "${this.name}" `, { form: this });

  }

  build_mode() {
    this.header_editable = new Features.Editable({
      name: 'form name',
      html_tag: 'h1',
      initial: this.name,
      callback: (ev, value) => { this.name = value; this.autosave.trigger() },
    });
    this.header.replaceWith(this.header_editable.ele);
    // this.header = this.header_editable.ele;

    this.Model = Models.Model.find_or_create('Form', this.id, { name: this.name });

    this.section_options = new Features.OptionBox({
      message: this.section_list.ele,
      buttons: [
        {
          text: 'add section',
          action: _ => { blurTop('#AddSection'); $('#AddSection').find('.SectionName').focus(); },
          class_list: 'pink'
        },
        {
          text: 'preview',
          action: _ => { this.Model.preview() },
          class_list: 'yellow'
        },
      ],
    });
    this.section_options.ele.insertAfter(this.header_editable.ele);

    if (Item.clipboard_history && Item.clipboard_history.notEmpty()) Item.ClipboardBanner.show();

    this.autosave = new Features.Autosave({
      show_status: true,
      delay: 10000,
      send: this.autosave_send,
      callback: this.autosave_callback,
      obj: this,
      message: `"${this.name}" saved`,
    });
  }
  chart_mode() {
    this.form_toggle = new Features.Toggle({
      toggle_ele: this.header,
      toggle_ele_class_list: 'lined filled form_header m-small-bottom',
      target_ele: this.section_ele,
      color: 'pink',
      initial_state: 'hidden'
    });
    this.autosave = new Features.Autosave({
      send: () => {
        // const { patient_id, appointment_id } = Models.ChartNote.Current.attr_list;
        // const chart_note_id = Models.ChartNote.Current.uid;
        const { uid: chart_note_id, attr_list: { patient_id, appointment_id } } = Models.ChartNote.Current;
        return this.autosave_submission({ patient_id, appointment_id, chart_note_id });
      },
      callback: ({ uid, error }) => {
        log({ uid, error });
        // const { uid, error } = response.save_result;
        if (error) Features.Banner.error(error)
        else if (uid) this.submission_id = uid;
      },
      delay: 5000
    });
    Answer.get_all_within(this.ele, false).forEach(answer => {
      answer.options.on_change_action = () => this.autosave.trigger();
    })
    this.header.removeClass('center');
    this.section_ele.addClass('indent');
  }
  preview_mode() {
    this.use_mode();
  }
  use_mode() {
    if (this.is_multi) this.multi_model_settings();
    // else if (this.form_name == 'Form Settings' && this.mode == 'display') FormEle.current_settings_manager.form_ele = this.ele;
  }
  settings_mode() {
    if (this.is_proxy) return;
    this.settings_manager = new Models.SettingsManager({
      obj: this,
      save: this.autosave_send,
      callback: this.autosave_callback,
    }, 'edit');
    FormEle.current_settings_manager = this.settings_manager;
    this.settings_manager.form_ele = $('#FormSettingsDisplay');
    this.ele.find('.item').slideFadeIn(0);
    this.section_array.forEach(section => section.settings_icons_create());
    // $('.settings_label').get().forEach(l => $('<div/>',{class:'new_line'}).insertAfter(l));

    this.form_label = $(`<div/>`, { class: 'form_settings_label settings_label box yellow light central m-y-25' }).prependTo(this.ele)
    // this.settings_apply();

    this.settings_header = $(`<h3/>`, { class: 'flexbox left', html: `<i>Form Options</i>` });
    this.settings_info = $('<div/>', { html: `Click the yellow settings icons to change the display of headers, labels, and items` });
    this.settings_list = $(`<ul class='indent'/>`).appendTo(this.settings_info);
    [`<u>Form Options</u> apply to the entire form, including all items in all sections`,
      `<u>Section Options</u> apply to that section only, and override Form Options`,
      `<u>Item Options</u> apply to that item only, and override all other options`,
    ].forEach(str => this.settings_list.append(`<li/>${str}</li>`));

    this.option_btns = new Features.ButtonBox({
      color: 'yellow',
      margin: 50,
      full_width: true,
      btn_class_list: 'xsmall',
      buttons: [
        {
          text: 'show all followups', action: ev => {
            let items = this.ele.find('.item').find('.item').not(':visible'), count = items.length;
            items.slideFadeIn();
            this.followup_msg.show({ target: $(ev.target), message: `Now showing ${count} hidden follow up items` });
          }
        },
        {
          text: 'hide all followups', action: ev => {
            let items = this.ele.find('.item').find('.item').filter(':visible'), count = items.length;
            items.slideFadeOut();
            this.followup_msg.show({ target: $(ev.target), message: `Now hiding ${count} visible follow up items` });
          }
        },
        {
          text: 'reset all display options', color: 'pink', action: _ => {
            this.settings_display_reset(true);
          }
        }
      ]
    });
    this.followup_msg = new Features.Warning({ color: 'yellow', target: this.option_btns.ele, position: 'center' });
    this.form_label.append(this.settings_header, this.settings_info, this.option_btns.ele);

    this.settings_icons_create();
  }

  multi_model_settings() {
    this.settings_manager = Models.Model.settings_manager_multi = new Models.SettingsManager({
      obj: this,
      autosave_on_form_change: false,
      save: Models.Model.settings_multi_save.bind(this),
      initial_override: null,
    }, 'edit');
    FormEle.current_settings_manager = this.settings_manager;
    this.settings_manager.form_ele = $('#FormSettingsDisplay');
    if (user.isSuper() && this.is_multi) this.settings_icons_superuser({ save_on_change: false });
  }
  settings_display_reset(recursive = false) {
    this.settings_manager.delete_setting('display');
    if (recursive) {
      this.section_array.forEach(s => s.settings_manager.delete_setting('display'));
      this.ele.find('.item').get().map(i => $(i).getObj()).forEach(i => i.settings_manager.delete_setting('display'));
    }
    log({ manager: this.settings_manager, settings: this.settings_manager.settings_obj });
    // return;
    this.settings_manager.autosave.trigger({ delay: 0, message: 'Display settings reset', callback: _ => { unblur(); Models.Model.find('Form', this.id).settings() } });
  }
  settings_apply_unique(time = 0) {


  }
  settings_icons_superuser(options = {}) {
    let manager = this.settings_manager;
    let sys = manager.popup_create(options);
    sys.icon.appendTo('#SuperUserSettings');
    sys.add({
      name: 'system', type: 'checkboxes',
      options: {
        list: ['true'],
        listLimit: 1,
        preLabel: 'System Form:',
        labelHtmlTag: 'h4',
        save_as_bool: true,
      }
    });
    sys.add({
      name: 'display.submit_button', type: 'list',
      options: {
        list: ['true', 'false'],
        listLimit: 1,
        preLabel: 'Show Submit Button:',
        labelHtmlTag: 'h4',
        save_as_bool: true,
        // setting_name: 'submit_button',
      }, initial: true
    });
    // log(sys);
  }
  settings_icons_create() {
    if (this.is_proxy && !this.is_multi) return;

    let toggle_ele = $(`<div/>`, { text: 'hide options', id: 'HideSettingsLabels' }).insertAfter(this.form_label);
    this.settings_label_toggle = new Features.Toggle({
      id: 'HideSettingsLabels',
      target_ele: '.settings_label',
      toggle_ele,
      toggle_ele_class_list: 'filled lined max bold half_pad m-y-25 sticky top_0',
      allow_multi: true,
      color: 'yellow',
      arrow_position: 'below',
      hidden_text: 'show all display options',
      visible_text: 'hide all display options',
    });

    let manager = this.settings_manager,
      display_options = manager.popup_create({ header: 'Form Options' });
    display_options.icon.appendTo(this.settings_header);

    let form_display_settings = [
      {
        name: 'display.hide_titles',
        type: 'checkboxes',
        options: {
          preLabel: 'Hide Titles',
          labelHtmlTag: 'h4',
          list: ['form', 'section'],
        }
      },
      {
        name: 'display.width.form',
        type: 'list',
        options: {
          list: ['auto', 'full'],
          preLabel: 'Form Width',
          labelHtmlTag: 'h4',
          listLimit: 1,
        }, default: 'auto'
      },
      {
        name: 'display.height.item',
        type: 'list',
        options: {
          preLabel: 'Item Height',
          list: ['auto', 'stretch %% fill row'],
          labelHtmlTag: 'h4',
          listLimit: 1,
        }, default: 'auto'
      },
      {
        name: 'display.width.item',
        type: 'list',
        options: {
          list: ['full', 'half', 'third', 'auto'],
          preLabel: 'Item Width',
          labelHtmlTag: 'h4',
          listLimit: 1,
        }, default: 'full'
      },
      {
        name: 'display.justification',
        type: 'list',
        options: {
          preLabel: 'Item Alignment',
          list: ['left', 'center', 'right'],
          labelHtmlTag: 'h4',
          listLimit: 1,
        }, default: 'left'
      }
    ];

    form_display_settings.forEach(setting => display_options.add(setting));

    let reset_all_btn = new Features.Button({ text: 'reset form display options', action: _ => { this.settings_display_reset() }, class_list: 'pink70 small' });
    display_options.tooltip.message_ele.append(reset_all_btn.ele);
    if (user.isSuper()) this.settings_icons_superuser();
  }

  linked_answer_check() {
    if (this.answer_objs.every(answer => !answer.waiting_for_list)) {
      clearInterval(this.waiting);
      this.waiting = null;
      log({ ele: this.ele }, `ALL LINKED ANSWERS READY`);
      unblur({ ele: this.ele });
    }
  }
  section_add(options) {
    let section = new Section(options, this.mode);
    this.section_array.push(section);
    this.section_ele.append(section.ele);

    let list_item = this.section_list.add_item({
      text: section.name,
      action: function () { section.ele.smartScroll({ force: true }) },
    });
    if (this.mode == 'build') {
      let arrows = new Features.UpDown({
        action: 'change_order',
        selector: 'li',
        callback: this.section_sort_callback.bind(this),
        css: { fontSize: '1.1em', margin: '0.2em 0.4em 0.2em 0.4em' }
      }),
        remove_icon = new Image;
      remove_icon.src = `/images/icons/red_x.png`;
      $(remove_icon).css({
        width: '1.1em', height: '1.1em', marginLeft: '0.1em', opacity: 0.6, cursor: 'pointer'
      }).on('click', section.delete.bind(section)).addOpacityHover();
      let section_options = $("<span class='flexbox'></span>").append(arrows.ele, remove_icon);
      list_item.append(section_options);
    }
    // section.settings_apply();
  }
  section_sort_callback(ev) {
    let form = this, sections = this.section_ele.children('.section'), new_order = this.section_list.values, section_eles = this.section_ele;
    // log({this:this,sections,new_order});
    this.section_array = [];
    new_order.forEach(section_name => {
      let ele = sections.filter((s, section) => $(section).getObj().name == section_name);
      section_eles.append(ele);
      form.section_array.push(ele.getObj());
    })
    form.autosave.trigger();
  }

  item_search(text = null, allow_multiple = false) {
    let matches = [];
    try {
      let search_array = text.split("."), sections = [], section_name = search_array.notSolo() ? search_array.shift() : null;
      if (section_name) sections = this.section_search(section_name, true);
      else sections = this.section_array;
      // log({sections});
      if (search_array.length > 1) throw new Error(`too many search keys ${search_array}`);
      sections.forEach(section => {
        let section_match = section.item_search(search_array[0], { allow_multiple: true, form_search: true });
        if (section_match) matches.push(...section_match);
      })
      if (matches.isEmpty()) throw new Error(`no item matching '${search_array[0]}'`);
      else if (!matches.isSolo() && !allow_multiple) throw new Error(`search returned ${matches.length} items, limited to one`);
    } catch (error) {
      log({ error, texts: text, allow_multiple });
      matches = [];
    }
    return matches.isEmpty() ? null : allow_multiple ? matches : matches[0];
  }
  copy_item_callback() {
    let eles = this.ele.find('.insert_options');
    eles.addClass('opacity100Flash');
    setTimeout(function () { eles.removeClass('opacity100Flash') }, 5000);
    this.ele.find('.button.paste').removeClass('disabled');
  }
  section_search(name = null, allow_multiple = false) {
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
      log({ error });
      matches = [];
    }
    return matches.isEmpty() ? null : allow_multiple ? matches : matches[0];
  }

  autosave_submission({ patient_id, appointment_id, chart_note_id }) {
    const submission = this.db_obj;
    const autosave = {};
    for (let answer of this.answer_objs) {
      autosave[answer.options.name] = answer.get();
    }

    submission.columns = { ...submission.columns, autosave, patient_id, appointment_id, chart_note_id };
    if (this.submission_id) submission.uid = this.submission_id;
    // log({ submission });
    return $.ajax({
      url: '/save/Submission',
      data: submission,
      method: "POST",
    })
  }

  submit({ patient_id, appointment_id, chart_note_id, responses }) {
    const submission = this.db_obj;

    submission.columns = { ...submission.columns, responses, patient_id, appointment_id, chart_note_id };
    if (this.submission_id) submission.uid = this.submission_id;

    return $.ajax({
      url: '/save/Submission',
      data: submission,
      method: "POST",
    })
  }


  get db_obj() {
    // db_obj for SUBMISSIONS
    return {
      columns: {
        form_id: this.id,
        form_name: this.name,
        submitted_by: user.current.attr_list.type,
        submitted_by_user_id: user.current.attr_list.id,
        // autosave: this.response
      },
    }
  }
  get response() {
    let sections = {}, all_pass = true;
    this.section_array.forEach(section => {
      sections[section.name.toKeyString()] = section.response;
    })
    for (let section in sections) {
      if (sections[section] === false) all_pass = false;
    }
    return all_pass ? sections : false;
  }
  get answer_objs() {
    let answers = [];
    this.section_array.forEach(section => {
      section.items.forEach(item => {
        answers.push(...item.answer_objs_recursive);
      })
    })
    return answers;
  }
  reset_answers() { Answer.reset_all(this.ele); }
  fill_by_response(json) {
    this.followup_time = 0;
    console.groupCollapsed(`FORM FILL ${this.name}`);
    log({ form: this, response: json });
    try {
      this.section_array.forEach(section => {
        let response = json[section.name.toKeyString()];
        if (response) section.fill_by_response(response);
      })
    } catch (error) {
      log({ error });
    }
    console.groupEnd();
    this.followup_time = undefined;
  }
  fill_by_key_value_object(json) {
    this.reset_answers();
    for (let search_str in json) {
      let value = json[search_str];
      try { this.item_search(search_str).value = value }
      catch (error) { log({ error }) }
    }
  }

  // submit(ev) {
  //   log({ ev });
  // }
  static waiting_for_list(ele) {
    let answers = ele.find('.answer');
    if (answers.dne()) return false;
    return answers.get().some(answer => {
      let obj = $(answer).getObj('answer', false);
      if (!obj || $(answer).closest('.form').exists()) return false;
      return obj.waiting_for_list || false;
    });
  }

  get form_db() {
    let obj = { sections: [] };
    ['form_id', 'name', 'settings', 'version_id'].forEach(attr => obj[attr] = this[attr]);
    for (let section of this.section_array) {
      obj.sections.push(section.section_db);
    }
    return obj;
  }
  autosave_send = async () => {
    let data = {
      uid: this.id,
      columns: this.form_db,
    }
    // log({data,this:this});
    // return;
    if (this.settings_manager) {
      this.settings_manager.has_changes = false;
      this.section_array.forEach(section => section.has_changes_reset());
    }
    log('form autosave send data from FormEle', { data, form: this });
    if ($.isEmptyObject(data.columns.settings)) data.columns.settings = 'null';
    return $.ajax({
      url: '/save/Form',
      method: 'POST',
      data: data,
    })
  }
  autosave_callback = async (data) => {
    log('AUTOSAVE RESPONSE & CALLBACK', data);
    const { uid, error } = data;
    if (uid) this.id = uid;
    else if (error) {
      log({ error });
    }
    // if (data.form_uid) {
    //   this.form_uid = data.form_uid;
    //   this.form_id = data.form_id;
    //   this.version_id = data.version_id;
    // }
  }

  static simple_fill(ele, json = {}) {
    try {
      let form = $(ele),
        answers = Forms.Answer.get_all_within(form, false),
        find = name => Forms.Answer.find(answers, { name });
      answers.forEach(a => a.reset());
      let toggles = form.find('.Toggle').get().map(t => $(t).getObj())
      toggles.forEach(t => t.to_initial_state(0));
      // log({ answers, json });
      for (let name in json) {
        let answer = find(name);
        const value = json[name];
        if (name == 'services') log(`${name} ${value}`, { answer, name, value });
        if (answer) answer.value_change = value;
        else if ($(`#${name}`).exists()) {
          let sub_form = $(`#${name}`).getObj('form', false);
          if (sub_form) {
            // log({ sub_form, name, toggles });
            sub_form.fill_by_response(value);
            let toggle = toggles.find(t => t.target.is(`#${name}`));
            // log({ toggle });
            if (toggle) toggle.show(0);
          }
        }
      }

    } catch (error) {
      log({ error, ele, json });
    }
  }
}

class SubmissionJson {
  constructor(json = null) {
    try {
      if (!json || typeof json != 'object') throw new Error('json not valid');
      this.json = json;
    } catch (error) {
      log({ error, json });
    }
  }
  section_search(name = null) {
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
      log({ error });
      section = null;
    }
    return section == null ? null : section;
  }
  item_search(text = null, options = {}) {
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
      log({ error, items });
      item = null;
    }
    return item;
  }
  item_search_recursive(text, items, exact_match = false) {
    let matches = [];
    try {
      let search_array = text.toLowerCase().split(' '), form_response = this;
      for (let item_name in items) {
        if (exact_match && item_name.toLowerCase().includes(text.toLowerCase().replace(/ /g, ''))) matches.push(items[item_name]);
        else if (search_array.every(str => item_name.toLowerCase().includes(str))) matches.push(items[item_name]);
        let followups = items[item_name].items;
        if (followups) matches.push(...form_response.item_search_recursive(text, followups, exact_match));
      }
    } catch (error) {
      log({ error });
    }
    return matches;
  }
  find(text = null) {
    let item = this.item_search(text), answer = item ? item.answer : null;
    return answer;
  }
  set(text, value) {
    let item = this.item_search(text);
    item.answer = value;
  }
  get all_sections() {
    let sections = [];
    for (let section_name in this.json) {
      sections.push(this.json[section_name]);
    }
    return sections;
  }
}
class Section {
  constructor(options, mode = 'use') {
    this.mode = mode;
    this.name = ifu(options.name, '');
    this.settings = options.settings || {};
    this.ele = $(`<div class='section'></div>`);
    this.ele.data('class_obj', this);
    this.header = $(`<h2 class='section_header'>${this.name}</h2>`).appendTo(this.ele);

    this.item_list = $(`<div/>`, { class: 'Items flexbox' }).appendTo(this.ele);
    this.items = [];

    // log({ section: this, mode });
    this[`${this.mode}_mode`]();

    if (!this.settings_manager) this.settings_manager = new Models.SettingsManager({ obj: this });
    this.settings_apply();

    if (options.items) options.items.forEach(item_obj => this.add_item(item_obj));
  }
  build_mode() {
    let name_input = new Features.Editable({
      name: 'section header',
      initial: this.name,
      html_tag: 'h2',
      callback: (ev, value) => { this.name = value; this.form.autosave.trigger() }
    });
    this.header.replaceWith(name_input.ele);

    this.item_list.append(`<div class='no_items item no_sort'><span>No items</span></div>`);
    this.buttons = new Features.ButtonBox({
      buttons: [
        {
          text: 'add item to section',
          class_list: 'pink addQuestion small',
          action: _ => { this.item_create() },
        },
      ]
    });
    this.item_list.append(this.buttons.ele);

    let insert_btns = [
      {
        text: 'insert new', class_list: 'addQuestion', action: _ => {
          let modal = $("#AddItem"), item = null, form = this.form, action = 'append';
          Item.reset_modal();
          if (this instanceof Item) this.show_followup_options();
          else $('#FollowUpOptions').slideFadeOut()
          Item.Current = { item, parent: this, form, action };
          blurTop(modal)
        }
      },
      {
        text: 'insert copied', class_list: !Item.clipboard ? 'paste disabled' : 'paste', action: _ => {
          if (this.hasClass('disabled')) {
            feedback('Nothing to paste', 'Copy an item first in order to use this button.');
            return;
          }
          let item = null, form = this.form, action = 'append';
          Item.paste(this, action);
          form.autosave.trigger();
        }
      },
    ];
    let insert_options = new InsertOptions({ buttons: insert_btns });
    insert_options.ele.prependTo(this.item_list.find('.no_items'));
    if (!Section.Delete) Section.Delete = confirm({
      header: 'Delete Section',
      affirm: data => {
        let section = data.section, form = data.form, index = data.index;
        form.section_list.remove_by_index(index);
        form.section_array.splice(index, 1);
        section.ele.slideFadeOut(function () { $(this).remove() });
        form.autosave.trigger();
      }
    });
  }
  preview_mode() {
    this.use_mode();
  }
  use_mode() {

  }
  settings_mode() {

  }

  get section_db() {
    let items = [];
    for (let item of this.items) {
      items.push(item.item_db);
    }
    return {
      name: this.name,
      items: items,
      settings: this.settings,
    }
  }
  get item_count() { return this.items.length }
  get followup_count() { return this.items.map(i => i.followup_count).reduce((accumulator, currentValue) => accumulator + currentValue) }
  get item_eles() { return this.item_list.children('.item').not('.no_items') }
  item_ele(index) { return $(this.item_eles.get(index)) }
  get no_items_ele() { return this.item_list.children('.no_items') }
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
  get form() { return this.ele.getObj('form') }

  settings_icons_create() {
    if (this.form.is_proxy) return;

    this.settings_header = $(`<h3/>`, { class: 'flexbox left', html: `<i>Section Options</i>` });
    this.settings_info = $('<div/>', { html: `` });
    this.section_label = $(`<div/>`, { class: 'settings_label box yellow light m-y-25' }).prependTo(this.ele).append(this.settings_header, this.settings_info);

    this.settings_manager = new Models.SettingsManager({
      obj: this,
      autosave: this.form.settings_manager.autosave,
    }, 'edit');
    let display_options = this.settings_manager.popup_create({ header: 'Section Display Options' });
    this.settings_header.append(display_options.icon);

    let section_display_settings = [
      {
        name: 'display.height.item',
        type: 'list',
        options: {
          preLabel: 'Item Height',
          list: ['auto', 'stretch %% fill row'],
          labelHtmlTag: 'h4',
          listLimit: 1,
        }
      },
      {
        name: 'display.width.item',
        type: 'list',
        options: {
          list: ['full', 'half', 'third', 'auto'],
          preLabel: 'Item Width',
          labelHtmlTag: 'h4',
          listLimit: 1,
        }
      },
      {
        name: 'display.justification',
        type: 'list',
        options: {
          preLabel: 'Item Alignment',
          list: ['left', 'center', 'right'],
          labelHtmlTag: 'h4',
          listLimit: 1,
        }
      }
    ];

    section_display_settings.forEach(setting => display_options.add(setting));

    let items = this.ele.find('.item').not('.no_items');

    items.get().forEach(item => $(item).getObj().settings_icons_create());
  }
  // settings_apply (time = 0) {
  //   if (this.mode == 'build') return;
  //   let manager = this.settings_manager || new Models.SettingsManager({obj:this});
  //   // let get = function (name) {return manager.get_setting(name)};
  //   // if (get('display.HideSectionTitle')) this.header.slideFadeOut(time);
  //   // else this.header.slideFadeIn(time);
  //   // if (get('display.ItemAlignment')) this.item_list.removeClass('left right center justify').addClass(get('display.ItemAlignment'));
  //   // if (get('display.ItemHeight')) this.item_list.removeClass('autoItemHeight stretchItemHeight').addClass(`${get('display.ItemHeight')}ItemHeight`);
  // }

  item_index(indices = null) {
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
      log({ error });
      item = null;
    }
    return item;
  }
  item_search(text = null, options = {}) {
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
      if (!form_search) log({ error });
      matches = [];
    }
    return matches.isEmpty() ? null : allow_multiple ? matches : matches[0];
  }
  item_search_recursive(text, items, exact_match = false) {
    let matches = [];
    try {
      let search_array = text.toLowerCase().split(' '), section = this;
      items.forEach(item => {
        if (exact_match && item.options.text.toLowerCase.includes(text.toLowerCase())) matches.push(item);
        else if (search_array.every(str => item.options.text.toLowerCase().includes(str))) matches.push(item);
        if (item.items && item.items.notEmpty()) matches.push(...section.item_search_recursive(text, item.items, exact_match));
      })
    } catch (error) {
      log({ error });
    }
    return matches;
  }
  add_item(item_obj, action = 'append', index = null) {
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
      log({ error, item_obj, action, index });
      return false;
    }
    return new_item;
  }
  update_summary() {
    // let text = this.items.length === 0 ? 'No items' : `Summary: ${this.items.length} items and ${this.followup_count} follow up items in the "${this.name}" section`;
    let text = this.items.length === 0 ? 'No items' : `<b>"${this.name}" summary:</b> ${this.items.length} item(s) and ${this.followup_count} follow up item(s)`;
    // log({this:this,text,items:this.items,list:this.item_list});
    this.item_list.children('.no_items').find('span').html(`<i>${text}</i>`);
  }
  // item_count_check () {
  //   let none = this.item_list.children('.no_items');
  //   if (this.item_count == 0) none.slideFadeIn();
  //   else none.slideFadeOut();
  // }
  fill_by_response(json) {
    try {
      this.items.forEach(item => {
        let response = json[item.text_key];
        if (response) item.fill_by_response(response);
        else item.value = null;
      })
    } catch (error) {
      log({ error });
    }
  }
  delete() {
    let section = this, form = this.ele.getObj('form'), index = form.section_array.indexOf(this);
    Section.Delete.prompt({
      header: `Delete "${this.name}"?`,
      message: `This cannot be undone and will include all ${this.item_count} items.`,
      section, index, form
    });
  }
  item_create() {
    let modal = $('#AddItem');
    $('#FollowUpOptions').hide();
    Item.reset_modal();
    Item.Current = { item: null, parent: this, form: this.form, action: 'append' };
    blurTop(modal);
    // $('#AddItemText').find('input').focus();
  }

  has_changes_reset() {
    this.settings_manager.has_changes = false;
    this.items.forEach(item => item.has_changes_reset());
  }
  static create() {
    let name = $('#AddSection').find('input').verify('Section Name Required!');
    if (!name) return false;
    forms.current.section_add({ name });
    unblur();
    forms.current.autosave.trigger();
    return true;
  }
}
class Item {
  constructor(options, parent, mode = 'use') {
    try {
      this.options = options;
      this.mode = mode;
      this.parent = parent;
      this.question_wrap = $(`<div/>`, { class: 'question_wrap' });
      this.question = $(`<div/>`, { class: 'question', text: options.text }).appendTo(this.question_wrap);
      this.text_key = options.text.toKeyString();
      // log({options: options.options},`${this.text_key}`);
      if (options.options.autofill_model) this.new_proxy();
      this.type = options.type;
      this.settings = options.settings || {};
      this.ele = $('<div/>', { class: `item flexbox left top ${this.type}` });
      if (this.parent instanceof Item) this.ele.addClass('followup');
      this.answer = new Answer(options, mode);
      if (this.answer.time2) {
        this.is_range = true;
        this.ele.addClass('range');
      }
      this.ele.append(this.question_wrap, this.answer.ele).data(options);
      this.answer.ele.removeClass('has-placeholder');
      this.ele.data('class_obj', this);
      this.items = [];
      let existing_items = options.followups || options.items || [], editor = forms.create.editor;
      delete this.options.followups;
      if (['number', 'list', 'checkboxes', 'dropdown', 'scale', 'time'].includes(options.type) && !this.is_range) {
        this.item_list = $(`<div/>`, { class: 'Items flexbox' }).appendTo(this.ele);
        if (existing_items.notEmpty()) existing_items.forEach(item_obj => this.add_item(item_obj, 'append'));
      }
      this[`${this.mode}_mode`]();

      if (!this.settings_manager) this.settings_manager = new Models.SettingsManager({ obj: this });
      this.settings_apply();
      // log({display: this.get_setting('display').dot_notation_flatten('_')});

    } catch (error) {
      log({ error, options, parent });
    }

  }

  build_mode() {
    let edit_options = $(`<span/>`).appendTo(this.question);
    $(`<div/>`, { class: 'toggle edit', text: '(edit)' }).on('click', this.edit.bind(this)).appendTo(this.question);
    $(`<div/>`, { class: 'toggle copy', text: '(copy)' }).on('click', this.copy.bind(this)).appendTo(this.question);
    $(`<div/>`, { class: 'toggle delete', text: '(delete)' }).on('click', this.delete.bind(this)).appendTo(this.question);
    if (this.options.condition) {
      this.condition_ele = $('<div/>', { class: 'condition', text: `Condition: ${this.condition_str}` }).insertAfter(this.question);
    }
    let paste_class_list = Item.clipboard ? 'paste' : 'paste disabled';
    let insert_btns = [
      {
        text: 'insert new', class_list: 'addQuestion', action: function () {
          let modal = $("#AddItem"), item = $(this).getObj('item'), parent = item.parent, form = item.form, action = 'insert';
          Item.Current = { item, parent, form, action };
          if (parent instanceof Item) parent.show_followup_options();
          else $('#FollowUpOptions').slideFadeOut();
          Item.reset_modal();
          Item.AutofillModel = null;
          Item.linked_to_fill();
          blurTop(modal)
        }
      },
      {
        text: 'insert copied', disabled_message: 'Copy an item first', class_list: paste_class_list, action: function () {
          let item = $(this).getObj('item'), parent = item.parent, form = item.form, action = 'insert';
          let index = parent.items.indexOf(item);
          let new_item = Item.paste(parent, action, index);

          // log({item,new_item});
          if (parent instanceof Item && new_item.parent != Item.Current.parent) {
            Item.Paste.prompt({ new_item });
          } else form.autosave.trigger();
        }
      },
    ];
    let insert_options = new InsertOptions({ buttons: insert_btns });
    insert_options.ele.prependTo(this.ele);
    this.arrows = new Features.UpDown({
      action: 'change_order',
      selector: '.item',
      callback: this.sort_callback,
      css: { margin: '2px 0.3em', position: 'absolute', top: '0.5em', right: '0.5em' },
      preLabel: 'change item order'
    });
    this.ele.append(this.arrows.ele);
    this.ele.on('click', this.select.bind(this))
    if (this.autofill_proxy) {
      this.proxy_build_display();
    }
    let current_item = this, item_list = this.item_list;
    if (item_list) {
      this.item_list_wrapper = $(`<div/>`, { class: 'toggleWrap' }).insertBefore(item_list);
      this.item_list_wrapper_header = $(`<h4>Follow Up Items <span class='count'>(${this.item_count})</span></h4>`);
      let wrapper = this.item_list_wrapper, btn_wrap = $('<div class="buttonWrapper"></div>');
      // let callback_hide = _ => { log(`HIDE ${this.options.text}`) }, 
      //   callback_show = _ => { log(`SHOW ${this.options.text}`) }, 
      let btn_item = new Features.Button({
        text: 'add followup item', class_list: 'pink small addQuestion', action: function () {
          let modal = $("#AddItem"), item = null, parent = current_item, action = 'append', index = null, form = parent.form;
          Item.reset_modal();
          current_item.show_followup_options();
          Item.Current = { item, parent, action, index, form };
          Item.AutofillModel = null;
          Item.linked_to_fill();
          blurTop(modal);
        }, css: { marginBottom: '0' }
      });
      wrapper.append(this.item_list_wrapper_header, item_list);

      // NO ITEMS ELEMENT
      this.item_list.append(`<div class='no_items item no_sort'><span>No items</span></div>`);
      let parent = this, class_list = !Item.clipboard ? 'paste disabled' : 'paste';
      let insert_btns = [
        {
          text: 'new item', class_list: 'addQuestion', action: function () {
            let modal = $("#AddItem"), item = null, form = parent.form, action = 'append';
            log({ item, parent, form, action });
            Item.Current = { item, parent, form, action };
            if (parent instanceof Item) parent.show_followup_options();
            blurTop(modal);
          }
        },
        {
          text: 'copied item', class_list, action: function () {
            if (this.hasClass('disabled')) {
              feedback('Nothing to paste', 'Copy an item first in order to use this button.');
              return;
            }
            let item = null, form = parent.form, action = 'append';
            let new_item = Item.paste(parent, action);
            if (parent instanceof Item && new_item.parent != Item.Current.parent) {
              Item.Paste.prompt({ new_item });
            } else form.autosave.trigger();
          }
        },
      ];
      let insert_options = new InsertOptions({ buttons: insert_btns });
      insert_options.ele.prependTo(this.item_list.children('.no_items'));
      this.item_list.append(btn_item.ele);
      this.item_list_toggle = new Features.Toggle({
        toggle_ele: this.item_list_wrapper_header,
        target_ele: item_list,
        initial_state: 'hidden',
        // callback_hide,
        // callback_show,
      });
    }
    if (this.item_list) this.update_summary();
  }
  preview_mode() {
    this.use_mode();
  }
  use_mode() {
    // this.settings_apply();
    if (this.parent instanceof Item) this.ele.slideFadeOut(0);
  }
  settings_mode() {
    // console.log("SETTINGS");
  }

  select(ev) {
    ev.stopPropagation();
    let item = $(ev.target).getObj('item');
    if (!ev.metaKey) {
      if (!item.ele.hasClass('active')) $('.item').removeClass('active');
    } else item.ele.toggleClass('active');
    // log({item});
  }
  show_followup_options(condition = null) {
    let type = this.type, all = $('#FollowUpOptions').slideFadeIn().find('.condition'), match = all.filter((c, cond) => $(cond).data('parent') == type || $(cond).data('parent').includes(type)), info = $('#FollowUpOptions').find('.parentInfo');
    try {
      all.not(match).slideFadeOut(0);
      match.slideFadeIn();
      info.html(`Response to "${this.options.text}" is:`);
      let answers = Answer.get_all_within(match, false);
      if (['list', 'checkboxes', 'dropdown'].includes(type)) {
        match.find('li').remove()
        this.answer.options.list.forEach(option => {
          let split = Answer.split_values_and_text(option);
          match.find('ul').append(`<li data-value='${split.value}'>${split.text}</li>`);
        })
      } else if (['number', 'scale'].includes(type)) {
        Answer.find(answers, { name: 'conditionNumberVal' }).update_obj(this.answer);
      } else if (type == 'time') {
        Answer.find(answers, { name: 'conditionTime' }).update_obj(this.answer);
      } else throw new Error(`${type} not found for followups`);
      // log({match,condition});
      if (condition) {
        answers.forEach(answer => {
          // log({answer})
          answer.value = condition[answer.name];
        })
      }
    } catch (error) {
      log({ error, condition, answer: this });
    }

  }
  settings_icons_create() {
    if (this.form.is_proxy) return;

    this.settings_header = $(`<div/>`, { class: 'flexbox left', html: `<i>Item Options</i>` });
    this.settings_info = $('<div/>', { html: `` });
    this.item_label = $(`<div/>`, { class: 'settings_label box yellow light m-y-25' }).prependTo(this.ele).append(this.settings_header, this.settings_info);

    this.settings_manager = new Models.SettingsManager({
      obj: this,
      autosave: this.form.settings_manager.autosave,
    }, 'edit');
    let display_options = this.settings_manager.popup_create({ header: 'Item Display Options' });
    this.settings_header.append(display_options.icon);

    let item_display_settings = [
      {
        name: 'display.height',
        type: 'list',
        options: {
          preLabel: 'Item Height',
          list: ['auto', 'stretch %% fill row'],
          labelHtmlTag: 'h4',
          listLimit: 1,
        }
      },
      {
        name: 'display.width',
        type: 'list',
        options: {
          list: ['full', 'half', 'third', 'auto'],
          preLabel: 'Item Width',
          labelHtmlTag: 'h4',
          listLimit: 1,
        }
      },
      {
        name: 'display.justification',
        type: 'list',
        options: {
          preLabel: 'Item Alignment',
          list: ['left', 'center', 'right'],
          labelHtmlTag: 'h4',
          listLimit: 1,
        }
      },
    ];

    item_display_settings.forEach(setting => display_options.add(setting));

    if (user.isSuper()) {
      display_options.add({
        name: 'settings', type: 'checkboxes',
        options: {
          list: ['save_as_bool'],
          preLabel: 'Super User Settings',
          save_as_bool: true,
          keys_as_is: true,
          labelHtmlTag: 'h4',
        }
      });
    }
  }

  bg_flash(time = 2000) {
    let i = this;
    i.ele.addClass('pink10BgFlash');
    setTimeout(function () { i.ele.removeClass('pink10BgFlash') }, time);
  }
  sort_callback(ev) {
    let parent = $(ev.target).parents('.Items').first(), items = parent.children('.item').not('.no_items'), insert_eles = parent.children('.insert_options'), parent_obj = parent.getObj();
    parent_obj.items = [];
    items.each((i, item) => {
      $(insert_eles.get(i)).insertBefore(item);
      parent_obj.items.push($(item).getObj());
    });
    parent_obj.form.autosave.trigger();
    // log({parent:parent_obj});
  }
  get answer_objs_recursive() {
    let answers = [];
    answers.push(this.answer);
    if (this.items && this.items.notEmpty()) this.items.forEach(item => answers.push(...item.answer_objs_recursive));
    return answers;
  }
  get condition_str() {
    let str = 'null', c = this.options.condition;
    try {
      if (!c) log({ error: new Error(`trying to get condition for non-followup ${this.text_key}`) });
      if (['number', 'scale'].includes(c.type)) str = `${c.conditionNumberComparator.smartJoin({ str: 'or' })} ${c.conditionNumberVal}`;
      else if (["list", "dropdown", "checkboxes"].includes(c.type)) str = c.conditionList.map(condition => Answer.split_values_and_text(condition).text).smartJoin({ str: 'or' });
      else if (c.type == 'time') str = `${c.conditionTimeComparator.smartJoin({ str: 'or' })} ${c.conditionTime}`;
      if (str == 'null') throw new Error(`condition type ${c.type} not found`)
    } catch (error) {
      log({ error, str, c });
    }
    return str;
  }
  get item_count() { return this.items.length }
  get item_eles() { return this.item_list.children('.item').not('.no_items') }
  get items_visible() { return this.item_eles.filter(':visible') }
  get items_visible_count() { return this.item_eles.filter(':visible').length }
  item_ele(index) { return $(this.item_eles.get(index)) }
  get no_items_ele() { return this.item_list.children('.no_items') }

  get form() { return this.ele.closest('.form').getObj() }
  get followup_count() {
    let count = 0;
    count += this.items.length;
    this.items.forEach(item => { count += item.followup_count });
    return count;
  }
  followup_update_check(warning = true) {
    if (this.mode != 'build') return;
    let parent = this, options = parent.options.options, update_required = function (item) {
      let condition = item.options.condition;
      if (options.list) {
        // log({options:options.list, condition:condition.conditionList});
        return condition.conditionList.some(l => !options.list.includes(l));
      } else if (['number', 'scale'].includes(parent.type)) {
        let min = Number(options.min), max = Number(options.max), mid = Number(condition.conditionNumberVal);
        return mid < min || mid > max;
      } else if (parent.type == 'time') {
        log({ options, condition });
      } else throw new Error('followup update check not performed');
    };

    let needs_update = this.items.filter(i => update_required(i));

    try {
      if (needs_update.notEmpty()) {
        let update_count = needs_update.length;
        this.item_list_toggle.add_message({ message: `Warning: ${update_count} follow up item(s) in this list no longer have valid conditions`, position: 'before_toggle', class_list: 'box bold followup_update' });
        let message = $('<div/>', { text: `There are ${update_count} follow up item(s) that now require updating because their conditions are no longer valid:` });

        needs_update.forEach(i => {
          this.item_list_toggle.add_message({ message: `<div><span class='bold'>Item: ${i.options.text}</span> => when <span class='bold strikethrough'>${i.condition_str}</span></div>` });
          i.condition_ele.addClass('bold pink strikethrough');
        });
        // if (warning) feedback('Follow Up Warning',message);
      } else this.ele.find('.followup_update').remove();
    } catch (error) {
      log({ error, needs_update });
    }
    // log({needs_update});
    return needs_update.notEmpty() ? needs_update : null;
  }
  followup_count_update() {
    if (!this.item_list_toggle) return;
    // let toggle = this.ele.find('.toggle_ele').first().getObj(), text = 'Add follow up';
    // let text = 'Add follow up';
    if (this.followup_count) {
      // text = `Follow Up Items (${this.followup_count})`;
      this.item_list_toggle.toggle_ele_text = `Follow Up Items (${this.followup_count})`;
      this.item_list_toggle.show(0)
    } else {
      this.item_list_toggle.toggle_ele_text = 'Add follow up';
      this.item_list_toggle.hide(0);
    }

    // let text = this.followup_count ? `Follow Up Items (${this.followup_count})` : 'Add follow up';
    // if (this.followup_count) text += ` (${this.followup_count})`;
    // this.ele.children('.toggleWrap').children('.toggle_ele').children('.toggleText').text(text);
  }

  get is_followup() { return this.ele.isInside('.item', false) }
  get followup_json() {
    let array = [];
    for (let followup of this.items) {
      array.push(followup.options);
    }
    return array;
  }
  get item_db() {
    let items = [];
    for (let item of this.items) {
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
  get index() { return this.parent.items.indexOf(this) }
  fill_by_response(json) {
    try {
      // log(`FILL ${this.text_key}`, { answer: json.answer });
      this.value = json.answer;
      this.items.forEach(item => {
        let response = json.items ? json.items[item.text_key] : null;
        if (response) item.fill_by_response(response);
        else item.to_initial_value();
      })
    } catch (error) {
      log({ error });
    }
  }
  to_initial_value() {
    this.answer.to_initial_value();
  }
  next_is_null() {
    let i = this.index, next = this.parent.items[this.index + 1];
    return next ? next.answer.get() === null : false;
  }
  get next_item_ele() {
    let i = this.index, next = this.parent.items[this.index + 1];
    return next ? next.ele : null;
  }
  set value(value) {
    this.answer.value = value;
  }

  edit() {
    let modal = $('#AddItem'), item = this, parent = this.parent, form = this.form, action = 'edit', answer = item.options;
    Item.Current = { item, parent, form, action };
    // if (!Item.proxy) { Item.AutofillProxyReset() }
    blurTop(modal);
    let text = answer.text, required = answer.settings.required, type = answer.type;
    $('#AddItemType').find('select').val(type);
    Item.option_list_show(0, type);

    $("#AddItemText").find('input').val(text);
    $('#AddItemRequired').getObj().value = required;
    if (parent instanceof Item) parent.show_followup_options(answer.condition);
    else $('#FollowUpOptions').hide();

    Item.option_list_reset();
    let answers = Answer.get_all_within(modal);

    let model = Item.AutofillModel = answer.options.autofill_model || null;
    let settings = Item.AutofillSettings = answer.options.autofill_settings || null;
    // log({ model, settings });
    Item.proxy_option_fill(this.autofill_proxy);
    // if (answer.options.autofill_model) this.autofill_option_fill();
    // else $('#AutofillOptions').slideFadeOut(0);
    log(`editing ${answer.text}`, { answer, options: answer.options, answers, linked: Item.AutofillModel });

    function named(name) { return Answer.find(answers, { name }) };
    for (name in answer.options) {
      if (name == 'list') {
        this.option_list_fill();
      } else {
        let match = named(name);
        if (match && !match.is_array()) match.value = answer.options[name];
        else if (match && match.is_array()) match.forEach(m => m.value = answer.options[name]);
      }
    }

  }
  async copy() {
    log({ item: this.options }, 'copy item');
    let item = this, clipboard_add = () => {
      let fu_length = this.followup_count;
      Item.ClipboardList.add_item({
        text: `<b>${Item.clipboard.text}</b> (w /${Item.clipboard.items ? `${Item.clipboard.items.length > 0 ? fu_length : 0} followups` : '0 followups'})`,
        value: {}.merge(Item.clipboard),
        action: function () { Item.clipboard = $(this).data('value') },
      })
    };
    Item.clipboard = {}.merge(this.options);
    Item.Current = { item, parent: this.parent };
    if (this.items && this.items.notEmpty()) {
      await Item.Copy.prompt({ item });
    }
    if (Item.clipboard_history) {
      let found = Item.clipboard_history.find(i => (
        i.options.name === Item.clipboard.options.name &&
        ((!i.items && !Item.clipboard.items) || (i.items.length === Item.clipboard.items.length))
      ));
      if (found) {
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
    log({ q: this.question, box: this.question[0].getBoundingClientRect() });
    let box = this.question[0].getBoundingClientRect(), top = [box.top, box.bottom].reduce((a, b) => a + b) / 2;
    Item.JustCopied.flash({ position: { position: 'fixed', top: top, left: box.right + 5, transform: 'translateY(-50%)' } });
    Item.ClipboardBanner.show();
    this.form.copy_item_callback();
  }
  async delete() {
    Item.Delete.prompt({
      header: `Delete "${this.options.text}"?`,
      message: `This cannot be undone and will include all ${this.followup_count} followup questions.`,
      yes_text: 'DELETE',
      no_text: 'CANCEL',
      item: this
    })
  }
  add_item(item_obj, action = null, index = null) {
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
      log({ error, item_obj, action, index });
      return false;
    }
    return new_item;
  }

  update_summary() {
    // let text = this.items.length === 0 ? 'No items' : `Summary: ${this.item_count} direct follow up(s) and ${this.followup_count} total follow up(s) related to "${this.options.text}"`;
    let text = this.items.length === 0 ? 'No items' : `<b>"${this.options.text}" summary:</b> ${this.item_count} direct follow up item(s) and ${this.followup_count} total follow up item(s)`;
    this.item_list.children('.no_items').find('span').html(`<i>${text}</i>`);
    this.followup_count_update();
    if (this.parent & this.parent.update_summary) this.parent.update_summary();
  }
  has_changes_reset() {
    // log({item:this,manager:this.settings_manager},`reset ${this.options.text}`);
    this.settings_manager.has_changes = false;
    this.items.forEach(item => item.has_changes_reset());
  }

  static create() {
    // log("HI");
    let modal = $("#AddItem"), working = Item.Current,
      item = working.item, parent = working.parent, form = working.form,
      index = item ? parent.items.indexOf(item) : working.index || null, action = working.action;

    try {
      let required = $("#AddItemRequired").verify(), obj = {
        text: $("#AddItemText").verify(),
        type: $("#AddItemType").verify(),
        settings: { required: $('#AddItemRequired').verify() },
        options: {}
      };
      // if (!obj.text || !obj.type || !obj.settings.required) return;
      if (parent instanceof Item) obj.condition = { type: parent.type };

      let all_pass = true, list = [], answers = Answer.get_all_within($('.itemOptionList'));
      answers.forEach(answer => {
        let name = answer.name || answer.options.name, response = answer.verify();
        if (response === null && answer.settings.required) all_pass = false;
        if (name == 'listOption') {
          if (response != null) list.push(`${$(answer).data('value') ? `${$(answer).data('value')}%%` : ''}${response}`);
        }
        else if (name.includes('condition')) obj.condition[name] = response;
        else obj.options[name] = response;
      })
      if (list.notEmpty()) obj.options.list = list;

      if (Item.AutofillProxy) {
        obj.options.autofill_model = Item.AutofillModel;
        obj.options.autofill_settings = Item.AutofillSettings;
        let limit_obj = answers.find(a => a.name == 'listLimit');
        let limit = limit_obj.verify('required');
        if (!limit) return;
        obj.options.listLimit = limit;

      }

      let check = Item.check_obj(obj);
      log({ answers, all_pass, check, obj });
      // return;
      if (!all_pass || !check) return;

      if (action == 'edit') {
        obj.followups = item.followup_json;
        obj.settings = item.settings.merge({ required });
      }
      obj.options.name = obj.text.toKeyString();

      let added = parent.add_item(obj, action, index);
      if (added) {
        form.autosave.trigger();
        unblur();
        if (added.item_count > 0) added.followup_update_check();
        if (parent instanceof Item) parent.followup_update_check(false);
      }
    } catch (error) {
      log({ error }, 'item add error');
    }
  }
  static paste(parent, action, index = null) {
    Item.clipboard.text = Item.clipboard.text + ' COPY';
    let paste_me = {}.merge(Item.clipboard);
    if (parent instanceof Section) delete paste_me.condition;
    // log({parent,action,index,paste_me},'pasting!');
    let new_item = parent.add_item(paste_me, action, index);
    return new_item;
  }
  static check_obj(obj) {
    // log({obj});
    let options = obj.options, type = obj.type, answers = Answer.get_all_within($('.itemOptionList'));
    function named() { let name = [...arguments]; return Answer.find_inputs(answers, { name }) };

    try {
      if (type == 'number') {
        if (options.min > options.max) throw new Warning({ message: `Min must be less than Max`, ele: named('min', 'max') });
        if (options.initial < options.min || options.initial > options.max) throw new Warning({ message: `Initial must be between min and max`, ele: named('min', 'max', 'initial') });
      }
    } catch (error) {
      if (error instanceof Warning) error.show();
      else log({ error, obj });
      return false;
    }
    return true;
  }
  static reset_modal() {
    // let modal = $('#AddItem');
    let answers = Answer.reset_all('.itemOptionList');
    // log({modal, answers});
    // modal.resetActives().find('.text, .textbox').find('input,textarea').val('');
    // modal.find('.checkbox_list').find('input').filter()
    Item.AutofillModel = null;
    Item.linked_to_fill();
    Item.option_list_reset();
    $("#AddItemText").find('input').val('');
  }
  static option_list_reset(new_items = []) {
    let list = $("#OptionsList"), options = list.find('.answer.text');
    if (options.length < 2) Item.option_list_add();
    options.each((o, option) => {
      $(option).removeData('value').find('input').val('');
      $(option).find('input').removeAttr('readonly');
      if (options.index(option) > 1) option.remove()
    });
    if (new_items.notEmpty()) Item.option_list_fill(new_items);
  }
  static option_list_add() {
    let last = $("#OptionsList").find('.answer').last(), o = last.getObj(), options = o.options, settings = o.settings;
    let option = new Answer({ options, settings, type: 'text' });
    let arrows = new Features.UpDown({
      css: { fontSize: '1em', marginLeft: '0.5em' },
      action: 'change_order',
      postLabel: 'change option order'
    });
    option.ele.find('span').replaceWith(arrows.ele);
    option.ele.addClass('flexbox inline').insertAfter(last);
    return option;
  }
  static option_list_fill(list = []) {
    let inputs = $("#OptionsList").find('.answer.text');
    list.forEach((item, i) => {
      let answer = inputs.get(i);
      if (answer) answer = $(answer).getObj();
      else answer = Item.option_list_add();
      answer.value = item;
    })
  }
  static option_list_show(time = 400, type = null) {
    if (!type) return;
    let option_lists = $('.itemOptionList').not('#FollowUpOptions, #LinkedOptions'),
      match = option_lists.get().find(list => ($(list).data('type') == type || $(list).data('type').includes(type)));
    // log({option_lists,match});
    if (type) {
      $(match).slideFadeIn(time);
      option_lists.not(match).slideFadeOut(time);
      if (['list', 'checkboxes', 'dropdown'].includes(type)) {
        let listLimit = $(match).findAnswer({ name: 'listLimit' }).ele;
        if (type == 'dropdown') listLimit.hide();
        else listLimit.show();
      }
    }
  }
  new_proxy(options = {}) {
    try {

      let info = this.options.options, model = options.model || info.autofill_model, settings = info.autofill_settings || {};
      this.autofill_proxy = new Models[model]({ uid: 'proxy' });
      if (this.mode == 'build') {

        this.autofill_proxy.settings_manager = new Models.SettingsManager({
          obj: this.autofill_proxy,
          initial_override: settings,
          autosave_on_form_change: true,
          autosave: new Features.Autosave({
            send: _ => {
              return new Promise(resolve => {
                let settings = Item.AutofillProxy.settings_manager.settings_obj;
                let settings2 = this.autofill_proxy.attr_list.settings;
                log({ settings, settings2 });
                resolve(this.autofill_proxy.attr_list.settings);
                Item.AutofillSettings = Item.AutofillProxy.settings_manager.settings_obj;
              })
            },
            obj: this.autofill_proxy,
            delay: 50,
          }),
          update_callback: (options = {}) => {
            let answer = options.answer, key = options.key, value = options.value;
            let is_linked = answer.options.autofill_model || null, is_number = answer.type == 'number';
            Item.LinkedSettingsAdjustMe = Item.LinkedSettingsAdjustMe || {};
            if (is_linked) {
              log({ answer, key, value, is_linked, is_number, adjusted }, `ADJUST ME ${key}`);
            } else if (is_number) {
              let adjusted = value;
              if (answer.options.preLabel) adjusted = `${answer.options.preLabel} ${value}`;
              if (answer.options.units) adjusted += ` ${answer.options.units}`;
              Item.LinkedSettingsAdjustMe[key] = adjusted;
            }
          },
          mode: 'edit'
        });
        Item.AutofillSettings = $.isEmptyObject(settings) ? null : settings;
        log('new ' + model + ' BUILD PROXY', { item: this, settings, info, model });
      } else {
        this.autofill_proxy.settings_manager = new Models.SettingsManager({
          obj: this.autofill_proxy,
          initial_override: settings,
        });
      }
    } catch (error) {
      log({ error, options });
    }

    // log({proxy:this.autofill_proxy,item:this},this.text_key);
  }
  async proxy_build_display() {
    const instance = this.autofill_proxy, { type, settings_obj: settings } = instance;
    log({ instance, options: this.options });
    const { plural } = await Models.ModelList.get(type);
    const text = $.isEmptyObject(settings) ? `a complete list of ${plural}` : `a filtered list of ${plural}`;
    $(`<div class='linked-settings'></div>`).insertAfter(this.question_wrap)
      .append(`<div class='info'>Autopopulated with ${text}`);
  }
  static async proxy_option_fill(proxy) {
    log({ proxy });
    if (!proxy) {
      Item.AutofillProxyReset();
      $("#AutofillOptions").hide();
      $('.NewLinkBtn').show();
      return;
    }
    $("#AutofillOptions").slideFadeIn();
    $('.NewLinkBtn').hide();
    const { type, settings_obj: settings } = proxy;
    const { plural = 'items' } = await Models.ModelList.get(type);
    const text = $.isEmptyObject(settings) ? `A <u>complete list of ${plural.toLowerCase()}</u>` : `A <u>filtered list of ${plural.toLowerCase()}</u>`;
    let info = `${text} will autofill the list options`, header = `${type.addSpacesToKeyString()} Autofill Options`, btn_text = `autofill settings`;
    console.log({ text, settings, type });
    const ItemType = $('#AddItemType').getObj().get();
    // if (Item.Current.item.type.includes('text')) {
    if (ItemType.includes('text')) {
      info = `${text} in a pop up format`;
      header = `${type.addSpacesToKeyString()} Pop Up Options`;
      btn_text = 'pop up settings';
    }
    Item.AutofillInfo = { header, btn_text, info, plural };
    $('#AutofillOptions').find('.settingsLabel').text(header);
    $("#AutofillInfo").html(info);
    $('#AutofillSettingsBtn').text(btn_text);
    Item.AutofillProxy = proxy;
    let limit = $('#AutofillOptions').find('.listLimit').first().getObj('answer');
    // console.log({ model, this: this, limit });
    const ProxyLimit = Item.Current.item ? Item.Current.item.answer.options.listLimit : 'no limit';
    limit.value = ProxyLimit;

  }
  // async open_proxy_settings() {
  //   blurTop('loading');

  //   let settings = Item.AutofillSettings;
  //   log({ linkedto: Item.AutofillSettings, thisproxy: settings });
  //   Item.AutofillProxy = this.autofill_proxy;
  //   Item.AutofillProxySettings = settings;

  //   let fetch = await this.autofill_proxy.settings({
  //     in_background: true,
  //     settings_manager: {
  //       obj: this.autofill_proxy,
  //       initial_override: settings,
  //       autosave_on_form_change: true,
  //       autosave: new Features.Autosave({
  //         send: _ => {
  //           return new Promise(resolve => {
  //             let settings = Item.AutofillProxy.settings_manager.settings_obj;
  //             resolve(this.autofill_proxy.attr_list.settings);
  //             Item.AutofillProxySettings = Item.AutofillProxy.settings_manager.settings_obj;
  //           })
  //         },
  //         obj: this.autofill_proxy,
  //         delay: 50,
  //       }),
  //       update_callback: (options = {}) => {
  //         let answer = options.answer, key = options.key, value = options.value;
  //         let is_linked = answer.options.autofill_model || null, is_number = answer.type == 'number';
  //         Item.LinkedSettingsAdjustMe = Item.LinkedSettingsAdjustMe || {};
  //         if (is_linked) {
  //           log({ answer, key, value, is_linked, is_number, adjusted }, `ADJUST ME ${key}`);
  //         } else if (is_number) {
  //           let adjusted = value;
  //           if (answer.options.preLabel) adjusted = `${answer.options.preLabel} ${value}`;
  //           if (answer.options.units) adjusted += ` ${answer.options.units}`;
  //           Item.LinkedSettingsAdjustMe[key] = adjusted;
  //         }
  //       },
  //       mode: 'edit'
  //     },
  //   });
  //   if (fetch) {
  //     this.proxy_form = $('#SettingsModal');
  //     let modal = $("#SettingsModal");
  //     modal.save_btn = new Features.Button({
  //       text: 'use these settings for autofill',
  //       class_list: 'pink small',
  //       action: function () {
  //         Item.autofill_settings_update();
  //         Item.LinkedSettingsOptionBox.toggle(false);
  //         blurTop(Item.LinkedSettingsOptionBox.ele);
  //       }
  //     });
  //     modal.save_btn.ele.appendTo(modal).on('click', _ => {
  //       let settings = Item.AutofillSettings == null ? {} : Item.AutofillSettings;
  //       this.autofill_proxy.settings_manager.settings_obj = settings;
  //     });
  //     await Item.autofill_settings_update();
  //     Item.LinkedSettingsOptionBox.toggle(true);
  //     blur($('#AddItem'), Item.LinkedSettingsOptionBox.ele);
  //   } else {
  //     $("#SettingsModal").append(`<h1 class='box pink'>You can't restrict this category because there are not appropriate settings by which to filter it</h1>`);
  //     blur('#AddItem', '#SettingsModal');
  //   }
  // }
  // set proxy_form(form) {
  //   if (!form.is('.form')) form = form.find('.form').first();
  //   log({ form });
  //   this.autofill_proxy.settings_manager.form_ele = form;
  // }

  static linked_to_fill(item_has_list = false) {
    if (Item.AutofillModel) {
      Item.LinkedEle.show();
      Item.LinkedLabel.text(`Autofill By ${Item.AutofillModel}`);
      Item.LinkedInfo.html('').append(`<b>Linked to '${Item.AutofillModel.addSpacesToKeyString()}' category.</b>`,
        $(`<span class='little'>unlink</span>`).css({ cursor: 'pointer', padding: '0.5em', textDecoration: 'underline' }).on('click', function () { Item.AutofillModel = null; Item.AutofillSettings = null; Item.linked_to_fill(); Item.option_list_reset() }), `<div>This question will always be populated with an up-to-date list.</div>`);
      if (Item.AutofillSettings) {
        // let view = $(`<span class='little'>view</span>`).css({cursor:'pointer',padding:'0.5em',textDecoration:'underline'}).on('click', Item.LinkedSettingsOpen), clear = $(`<span class='little'>clear</span>`).css({cursor:'pointer',padding:'0.5em',textDecoration:'underline'}).on('click', function(){Item.AutofillSettings = null; Item.linked_to_fill(); Item.option_list_reset()});
        let view = $(`<span class='little'>view</span>`).css({ cursor: 'pointer', padding: '0.5em', textDecoration: 'underline' }).on('click', _ => { Item.Current.item.open_proxy_settings() }), clear = $(`<span class='little'>clear</span>`).css({ cursor: 'pointer', padding: '0.5em', textDecoration: 'underline' }).on('click', function () { Item.AutofillSettings = null; Item.linked_to_fill(); Item.option_list_reset() });
        Item.LinkedInfo.append('<b>Has autofill restrictions.</b>', view, clear);
      } else {
        Item.LinkedSettingsOptionBox.reset();
      }
      $("#OptionsList").find('.answer.text').find('input').attr('readonly', true);
      item_has_list ? Item.LinkedLimit.ele.hide() : Item.LinkedLimit.ele.show();
    } else {
      Item.AutofillProxyReset();
    }
  }
  static linked_to_reset() { Item.LinkedEle.hide(); Item.AutofillModel = null; Item.AutofillSettings = null; }

  static ShowAutofillList() { blurTop('#AutofillList'); }
  static async SelectAutofillModel(ev) {
    let item = $(ev.target).closest('li'), model = item.data('value'), plural = item.data('plural');
    blurTop('loading');
    let list_obj = await Models.ModelList.get(model), list = list_obj.list;
    Item.AutofillModel = model;
    Item.option_list_reset(list.map(m => `${m.uid} %% ${m.name}`));
    $('#AutofillOptions').slideFadeIn();

    const proxy = new Models[model]({ uid: 'proxy' });
    Item.proxy_option_fill(proxy);

    unblur({ repeat: 1 });
  }
  static AutofillSettingsDisplay(key, value, obj_to_bool_array = false) {
    try {
      // if (typeof value == 'string') value = value.toBool();
      let type = typeof value;
      // log({ key, value, type });
      if (key == 'system' && !user.isSuper()) return null;
      else if (key == 'DisplayValues') {
        log({ key, value, this: this }, 'DisplayValues');
        this.on_completion = () => {
          let all = this.ele.find('.setting_name');
          for (let name in value) {
            let match = all.filter((e, ele) => $(ele).text().toKeyString() == name);
            match.next().html(value[name]);
          }
          log({ all }, 'update display values');
        }
        return null;
      } else if (key == 'Business Hours') {
        this.on_completion = () => {
          let ele = this.ele.find(".value.BusinessHours");
          ele.find('.DaysOfTheWeek').remove();
          this.set_order(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], ele);
          ele.find('span').replaceText(', and ', ' - ');
        }
      } else if (['display', 'autofill', 'conditions'].includes(key.toLowerCase())) return null;

      let flex = $('<div class="flexbox left"/>');

      if (value === null || value === false) {
        return null;
      } else if (Item.AutofillSettingsHeaders.includes(key)) {
        this.add_header(key);
        this.new_pairs(value);
        return null;
      } else if (type == 'object' && value.is_array()) {
        return flex.append(value.smartJoin('and'));
      } else if (type == 'object') {
        // if (obj_to_bool_array) return span.append(SettingsManager.obj_to_bool_array(value).smartJoin('and'));
        let div = $('<div/>');
        for (let k in value) {
          let inner_div = $('<div/>', { class: `${k} option flexbox left` }), key_span = $('<span/>', { text: `${k.toKeyString(true)}` }), value_k = Item.AutofillSettingsDisplay(k, value[k]);
          if (value_k == null) continue;
          // if (value_k instanceof jQuery) value_k.addClass('setting_value');
          div.append(inner_div.append(key_span, value_k));
        }
        // if (!div.children().isSolo()) div.css({paddingTop:'0.25em'});
        return div;
      } else if (type == 'boolean') {
        let icon = new Features.Icon({ type: value ? 'checkmark' : 'red_x', size: 1 });
        return flex.append(icon.img);
        // let div = $('<div/>').append(value ? 'true' : 'false', icon.img);
        // let div = $('<div/>').append(icon.img);
        // return div;
      } else {
        let icon = new Features.Icon({ type: 'checkmark', size: 1 });
        let icon_yellow = new Features.Icon({ type: 'checkmark', size: 1, color: 'yellow' });
        return flex.addClass('option').append(`<span>${value}</span>`, icon.img);
      }
    } catch (error) {
      log({ error, key, value });
    }
  }

  static editor_setup() {
    Item.Delete = confirm({
      header: 'Delete Item',
      affirm: data => {
        let item = data.item;
        let index = item.index, parent = item.parent;
        parent.items.splice(index, 1);
        parent.item_ele(index).slideFadeOut(function () { $(item).remove() });
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
      affirm: function (data) { Item.clipboard.items = data.item.followup_json; },
      negate: function () { Item.clipboard.items = []; },
      callback_no_response: function (data) { Item.clipboard.items = data.item.followup_json; },
    });
    Item.JustCopied = new Features.Banner({ text: 'copied!', color: 'green', time_stay: 1000 });

    if ($('#ItemClipboard').dne()) {
      let list_icon = new Image();
      list_icon.src = '/images/icons/copy_icon_green.png';
      $(list_icon).css({ width: '2em', height: '2em', opacity: 0.7, cursor: 'pointer' }).addOpacityHover();
      Item.ClipboardBanner = new Features.Banner({
        id: 'ItemClipboard',
        message: list_icon,
        color: 'green',
        hide_onclick: false,
        css: { padding: '0.5em' },
        position: { position: 'fixed', left: '0.5em', top: '50%', transform: 'translateY(-50%)' },
      });
      Item.ClipboardList = new Features.List({
        header: 'Recently Copied',
        header_html_tag: 'h4',
        color: 'green',
        limit: 1,
        li_css: { textAlign: 'left' },
      })
      Item.ClipboardBanner.ele.on('mouseleave', function () { Item.ClipboardList.ele.slideFadeOut(); });
      Item.ClipboardList.ele.appendTo(Item.ClipboardBanner.ele).hide();
      $(list_icon).on('click', function () { Item.ClipboardList.ele.slideFadeIn() });
      $(`<div/>`, { text: 'hide this until I copy something again', css: { cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8em' } }).insertAfter(Item.ClipboardList.header).on('click', function () { Item.ClipboardBanner.hide() });
    }

    // let categories = linkable_models.map(m => { return {
    //     text: m.addSpacesToKeyString(),
    //     action: async _ => {
    //       blurTop('loading');
    //       let obj = await Models.ModelList.get(m);
    //       let model_array = obj.list;
    //       unblur({repeat: 1});
    //     }
    //   } });

  }

  static AutofillSettingsChange() {
    Item.Current.item.autofill_proxy.settings_manager.form_fill(Item.AutofillSettings == null ? {} : Item.AutofillSettings);
    blur($('#AddItem'), '#SettingsModal');
  }
  static AutofillSettingsReset() {
    Item.AutofillProxy.attr_list.settings = null;
    Item.AutofillSettingsPrompt();
  }
  static AutofillProxyReset() {
    Item.AutofillProxy = null; Item.AutofillSettings = null;
    $('#AutofillOptions').slideFadeOut();
    $('.NewLinkBtn').slideFadeIn();
    // Item.AutofillSettingsPrompt();
  }

  static AutofillSettingsLegend() {
    let div = $('<div/>', { class: 'box yellow light max', html: '<h4>Icons</h4>' }),
      checkmark_green = new Features.Icon({ type: 'checkmark', size: 1.5 }),
      checkmark_yellow = new Features.Icon({ type: 'checkmark', size: 1.5, color: 'yellow' }),
      x_red = new Features.Icon({ type: 'styled_x', size: 1.5 }),
      x_yellow = new Features.Icon({ type: 'styled_x', size: 1.5, color: 'yellow' }),
      q_mark_yellow = new Features.Icon({ type: 'question_mark', size: 1.5 });

  }
  static async AutofillSettingsPrompt() {
    let ele = $('#AutofillSettingsPrompt'), option_box = ele.getObj();
    option_box.reset_header(Item.AutofillInfo.header);
    const settings = Item.AutofillProxy.settings_obj;
    if (!$.isEmptyObject(settings)) {
      Item.AutofillSettingsHeaders = [];

      let type = Item.AutofillProxy.type;
      for (let section_name in settings) { Item.AutofillSettingsHeaders.smartPush(section_name) }
      option_box.reset_info(settings);
      let key_values = option_box.ele.find('.KeyValueBox').getObj(), plural = await Models.ModelList.get(type);
      log({ settings, type, option_box, key_values });
      // log({ key_values });
      let sections = key_values.pairs_grouped_by_header;
      // log({ sections });
      key_values.keys.forEach(k => {
        // log({ k });
        let text = $(k).text(), strict_dot = `autofill.strict.${text.toKeyString()}`, condition_dot = `autofill.condition.${text.toKeyString()}`;
        let options = $(k).closest('.pair').find('.option').get().map(option => `<li>${$(option).text().replace(':', '')}</li>`);
        // log({ options, text, k });
        if (Item.AutofillProxy.get_setting(condition_dot)) {
          let condition = Item.AutofillProxy.get_setting(condition_dot);
          log({ condition });
          let q_mark = new Features.Icon({ type: 'question_mark', color: 'purple', size: 1, tooltip: { message: `Only applies to ${plural.toLowerCase()} when<br>"${condition.key.split('.').pop().addSpacesToKeyString()}" is<br>"${condition.condition_str}"` } });
          q_mark.img.appendTo(k);
        }

        if (options.notSolo()) {
          let popup = Item.AutofillProxy.settings_manager.popup_create({
            header: $(`<div/>`).append(`<h2 class='bold m-y-25'>Only include ${plural.toLowerCase()} that</h2>`),
          });

          popup.icon.appendTo(k);
          popup.add({
            name: strict_dot,
            type: 'dropdown',
            options: {
              list: ['true %% exactly match all options below', 'false %% match at least one option below'],
            },
            update_callback: function () {
              let strict = this.get();
              if (strict) {
                $(k).closest('.pair').find('.value').find('.Icon').get().forEach(i => { $(i).getObj().color_reset() });
              } else {
                $(k).closest('.pair').find('.value').find('.Icon').get().forEach(i => { $(i).getObj().color_change('yellow') });
              }
            },
            default: false
          });
          popup.tooltip.message_append(`<h3 class='m-top_25'>${text}</h3><h4><ul class="bold">${options.join('')}</ul></h4>`);
        }
      })
      // key_values.realign();
      // log({ settings });
    } else {
      option_box.reset_info(`All available ${Item.AutofillInfo.plural.toLowerCase()} will be loaded.`);
    }
    blur('#AddItem', '#AutofillSettingsPrompt');
  }
  static async AutofillSettingsConfirm() {
    Item.AutofillSettings = Item.AutofillProxy.settings_obj;
    Item.AutofillModel = Item.AutofillProxy.type;
    Item.proxy_option_fill(Item.AutofillProxy);
    unblur();
  }
  static async AutofillSettingsModal() {
    window.Item = Item;
    let model = Item.AutofillModel, settings = Item.AutofillSettings;
    log({ settings }, `LINKED SETTINGS MODAL: ${model}`);
    // Item.AutofillProxy = new Models[model]({uid:'proxy'});
    unblur();
    await Item.AutofillProxy.settings();
    let proxy = Item.AutofillProxy, modal = $('#SettingsModal'), form = modal.find('.form');
    // $("#Settings").html(`<h1 class='bold'>${Item.AutofillInfo.header}</h1><h2 class='italic'>${Models.Model.active('Form').name} :: ${Item.Current.item.options.text}</h2><h3 class='m-y-25'>Only ${Item.AutofillInfo.plural.toLowerCase()} that match the settings below will be included.`);
    modal.find('.form_header').toggleClass('center left').html(`${Item.AutofillInfo.header}<div class='text-xlarge-rem'>${Models.Model.active('Form').name} :: ${Item.Current.item.options.text}</div><div class='text-large-rem'>Only ${Item.AutofillInfo.plural.toLowerCase()} that match the settings below will be included.</div>`)
    proxy.settings_manager = new Models.SettingsManager({
      obj: proxy,
      form: form,
      initial_override: Item.AutofillProxy.attr_list.settings,
      autosave_on_form_change: true,
      autosave: new Features.Autosave({
        send: function () {
          return new Promise(resolve => {
            Item.AutofillProxySettings = proxy.attr_list.settings;
            Item.AutofillProxy.attr_list.settings = proxy.attr_list.settings;
            console.log('SAVE PROXY', { form, proxy });
            resolve(proxy.attr_list.settings);
          })
        },
        // callback: Item.autofill_settings_update,
        obj: proxy,
        delay: 50,
      }),
      update_callback: (options = {}) => {
        const { answer, key, value } = options;
        // let answer = options.answer, key = options.key, value = options.value;
        let is_linked = answer.options.autofill_model || null, is_number = answer.type == 'number';
        Item.LinkedSettingsAdjustMe = Item.LinkedSettingsAdjustMe || {};
        if (is_linked) {

          log({ answer, key, value, is_linked, is_number, adjusted }, `ADJUST ME ${key}`);
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
      text: 'Review changes',
      class_list: 'pink small',
      action: function () {
        // Item.AutofillProxy.attr_list.settings = proxy.attr_list.settings;
        // Item.AutofillProxySettings = proxy.attr_list.settings;
        // Item.AutofillSettings = proxy.attr_list.settings;
        // Item.autofill_settings_update();
        Item.proxy_option_fill(proxy);
        Item.AutofillSettingsPrompt();
        // blurTop(Item.LinkedSettingsOptionBox.ele);
        // Item.LinkedSettingsOptionBox.realign();
      }
    });
    proxy.save_btn.ele.appendTo(modal);
    Item.AutofillProxySettings = proxy.attr_list.settings
  }

  option_list_fill() {
    Item.option_list_fill(this.options.options.list);
    if (this.options.linkedTo) {
      Item.AutofillModel = this.options.linkedTo;
      Item.linked_to_fill();
    }
  }
  // autofill_option_fill() {
  //   let answer = this.answer;
  //   let model = answer.options.autofill_model;
  //   let plural = Models.ModelList.find(model).plural.toLowerCase(), info = `Autofill this item with a list of all ${plural}`, header = `${model.addSpacesToKeyString()} Autofill Options`, btn_text = `autofill settings`;

  //   if (this.type.includes('text')) {
  //     info = `Show a popup with a list of all ${plural.toLowerCase()}`;
  //     header = `${model.addSpacesToKeyString()} Pop Up Options`;
  //     btn_text = 'pop up settings';
  //   }
  //   Item.AutofillInfo = { header, btn_text, info, plural };
  //   $('#AutofillOptions').find('.settingsLabel').text(header);
  //   $("#AutofillInfo").html(info);
  //   $('#AutofillSettingsBtn').text(btn_text)
  //   Item.AutofillProxy = new Models[model]({ uid: 'proxy' });
  //   let limit = $('#AutofillOptions').find('.listLimit').first().getObj('answer');
  //   console.log({ model, this: this, limit });
  //   limit.value = answer.options.listLimit;
  //   $('#AutofillOptions').slideFadeIn();
  //   // if (this.options.autofill_settings) $('#AutofillInfo').text(`Show a popup with a list of ${this.auto}`);
  //   // else $("#AutofillInfo").text(`Show a popup with a list of all ${this.auto}`);
  // }
}
class Answer {
  constructor(data, mode = 'use') {
    try {
      this.mode = mode;
      this.define_by(data);
      if (!this.options) this.options = {}.merge(data);

      this.name = this.name || this.options.name || '';
      this.setting_name = this.setting_name || this.name;
      this.settings = { required: true, warning: true, autocomplete: false }.merge(this.settings || {});
      this.save_as_bool = this.options.save_as_bool || this.settings.save_as_bool || false;
      this.initial = ifu(this.initial, this.options.initial, this.default, this.options.default, null);

      for (let s in this.settings) {
        if (typeof this.settings[s] == 'string') this.settings[s] = this.settings[s].toBool();
      }

      let html_tag = ifu(this.options.html_tag, 'div');
      this.ele = $(`<${html_tag} class='answer ${this.type}'></${html_tag}>`);
      if (this.options.id) this.ele.attr('id', this.options.id);
      this.ele.data('class_obj', this);
      if (['date', 'number', 'time'].includes(this.type)) this.ele.addClass('flexbox left');
      this[`create_${this.type}`]();
      if (this.options.name && this.input) { this.input.addClass(this.options.name); }

      let label_css = system.validation.json(this.options.labelCss);
      if (this.options.preLabel) {
        this.preLabel = $(`<${this.options.labelHtmlTag || 'span'}/>`, {
          class: `${this.options.labelClass || ''} preLabel`,
          html: this.options.preLabel
        }).prependTo(this.nowrap || this.ele);
        this.ele.addClass('flexbox left');
        if (label_css) this.preLabel.css(label_css);
        if (this.options.preLabelClass) this.preLabel.addClass(this.options.preLabelClass);
      }
      if (this.options.postLabel) {
        this.postLabel = $(`<${this.options.labelHtmlTag || 'span'}/>`, {
          class: `${this.options.labelClass || ''} postLabel`,
          html: this.options.postLabel
        }).appendTo(this.nowrap || this.ele);
        this.ele.addClass('flexbox left');
        if (label_css) this.postLabel.css(label_css);
      }

      this.input.css(system.validation.json(data.input_css || this.options.input_css) || {});

      if (this.options.autofill_settings) Models.SettingsManager.convert_obj_values_to_bool(this.options.autofill_settings);
      if (!this.settings.autocomplete) this.input.attr('autocomplete', 'off');
      if (this.options.eleClass) {
        let classes = this.options.eleClass.split(' ');
        classes.forEach(c => {
          if (c.includes('!')) {
            this.ele.removeClass(c.replace('!', ''));
            // if (this.name == 'listLimit') log({ c, ele: this.ele, list: `${this.ele.attr('class')}` }, '1');

          }
          else {
            this.ele.addClass(c);
            // if (this.name == 'listLimit') log({ c }, '2');

          }
        })
      }
      if (this.options.inputClass) {
        let classes = this.options.inputClass.split(' ');
        classes.forEach(c => {
          if (c.includes('!')) this.input.removeClass(c.replace('!', ''));
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
        // if (!this.ele.isInside('.item') && !this.ele.isInside('#AddItem') && !this.has_label && this.settings.placeholder_shift !== false && !this.options.ele_css) {
        //   this.ele.css({ marginTop: '1.5em' });
        // }
      }

      if (this.options.after_load_action) this.options.after_load_action.to_fx();

      this.warning = new Features.Warning({ target: this.input, warning_class: 'border_flash_pink slow twice' });
    } catch (error) {
      log({ error, data, mode });
    }
  }
  // get warning() { return this.warning_obj == undefined ? this.warning_obj = new Features.Warning({ target: this.input, warning_class: 'border_flash_pink slow twice' }) : this.warning_obj }

  verify(string = null) {
    let message = string || this.if_null_str || 'required', value = this.get();
    if ((value === null || value === undefined) && this.settings.required) {
      log(`Verify '${this.name} failed`, { error: this });
      this.input.smartScroll({
        offset: 50,
        callback: () => this.warning.show({ message })
      });
      return false;
    }
    return value;
  }

  to_initial_value() {
    try {
      // log({initial:this.initial},`INITIAL: ${this.name}`);
      if (this.name == 'services') log(`initial services ${this.initial}`, { value: this.initial });
      this.value = this.initial;
      this.hold = false;
      if (this.type == 'number' && this.initial && !this.options.initial) this.value = null;
    } catch (error) {
      log({ error, initial: this.initial, answer: this });
    }
  }
  set value(value) {
    if (value === null) this.hold = false;
    if (this.options.autofill_model) {
      if (this.name == 'services') log(`services ${value}`, { value });
      if (this.waiting_for_list) {
        let answer = this;
        setTimeout(function () { answer.value = value; }, 100);
        return;
      }
      this.autofill_select_uid(value);
      return;
    }
    if (value === 'true' || value === true) { this.val_is_bool = true; value = true; }
    if (value === 'false' || value === false) { this.val_is_bool = true; value = false; }
    if (this.time2 && value && value.is_array()) {
      this.time2.value = value[1];
      value = value[0];
    }

    if (['text', 'email', 'phone', 'textbox', 'number', 'dropdown', 'time', 'date'].includes(this.type)) {
      // log({value,this:this,})
      if (typeof value == 'string') {
        let split = Answer.split_values_and_text(value);
        this.input.val(split.text).data('value', split.value);
      } else if (typeof value == 'boolean') {
        // log({ value, string: value.to_string(), answer: this });
        this.input.val(value.to_string());
      } else this.input.val(value);
    }
    else if (this.type == 'list') {
      this.input.resetActives();
      if (value === null) return;
      if (!value.is_array()) value = [value];
      let match = this.input.find('li').filter((l, li) => {
        return value.some(v => {
          let li_v = $(li).data('value');
          // log({ li_v, v, l });
          if (typeof li_v == 'number') return li_v == Number(v);
          if (typeof v == 'string' && typeof li_v == 'string') return li_v == v || li_v.toKeyString() == v.toKeyString();
          else if (typeof v == 'number') return li_v == v;
          else if (typeof v == 'boolean' && typeof li_v == 'boolean') return li_v === v;
          else if (typeof v == 'boolean') return li_v.bool_match(v);
        });
      });
      match.addClass('active');
    } else if (this.type == 'checkboxes') {
      let boxes = this.input.find('input');
      boxes.attr('checked', false);
      if (value === null) return;
      else if (typeof value == 'object' && !value.is_array()) {
        boxes.filter((b, box) => {
          let val = value[$(box).attr('value').toKeyString()];
          if (val === true) return true;
          else return false;
        }).attr('checked', true);
      } else {
        if (!value.is_array()) value = [value];
        boxes.filter((b, box) => {
          return value.some(v => {
            if (typeof v == 'string') return $(box).attr('value').toKeyString() == v.toKeyString();
            else if (typeof v == 'number') return b == v;
            else if (typeof v == 'boolean') return $(box).attr('value').toBool() == v;
            else throw new Error('type error setting checkbox value');
          });
        }).attr('checked', true);
      }

    } else if (this.type == 'address') {
      if (!value) this.ele.find('input').val('');
      else {
        let str = this.parse(value.duplicate().merge({ include_unit: false })).join(', ');
        this.components = value.components;
        this.unit = value.unit;
        this.input.val(str);
        this.unit_ele.val(value.unit);
        this.display.html(this.display_html());
      }
    } else if (this.type == 'signature') {
      if (value) {
        const data = `data:${value.join(',')}`;
        log('initial sig', { value, data, sig: this, input: this.input });
        this.input.jSignature('setData', data);
      }
    } else if (this.type == 'bodyclick') {

    } else {
      log({ error: `Answer type '${this.type} not listed`, answer: this });
    }

    this.placeholder_shift();
    this.followup_show(0);
  }
  set value_change(value) {
    this.value = value;
    this.on_change();
  }

  get has_filter() { return this.ele.isInside('.filter') }
  get has_label() { return this.options.preLabel || this.options.postLabel || false; }
  get filter() { return this.ele.closest('.filter').getObj() }
  get autofill_uids() {
    let selection = this.autofill_selection;
    if (!selection) return null;
    let uids = selection.get().map(s => $(s).data('value'));

    return this.autofill_limit == 1 ? uids[0] : uids;
  }
  get autofill_selection() {
    let selected = null;
    if (this.autofill_list) {
      selected = this.autofill_list.active;
    }
    return selected;
  }
  get item() { return this.ele.getObj('item'); }

  update_display() {
    this.input.removeClass('border_flash_pink');
    this.placeholder_shift();
    this.followup_show();

  }
  on_change(ev) {
    // log({answer:this, value:this.get({literal:true})},`${this.name || 'no name'}`);
    this.update_display();
    // this.input.removeClass('border_flash_pink');
    // this.placeholder_shift();
    // this.followup_show();
    // if (this.type == 'dropdown') {
    //   if (this.get() !== null) this.input.addClass('active');
    //   else this.input.removeClass('active');
    // }
    if (this.has_filter) this.filter.update();
    if (this.options.on_enter_action && ev.keyCode && ev.keyCode === 13) this.options.on_enter_action.to_fx(this, ev);
    if (this.type == 'time' && this.ele.parent().is('.answer.time')) {
      this.ele.parent().getObj().on_change(ev);
      return;
    }
    const change = this.on_change_action || this.options.on_change_action;
    const afterChange = this.after_change_action || this.options.after_change_action;
    if (change) change.to_fx(this, ev);
    if (afterChange) afterChange.to_fx(this, ev);
  }
  static condition_matches_parent(value, condition) {
    let c = condition, matched = false;
    try {
      if (['number', 'scale'].includes(c.type)) {
        if (c.conditionNumberComparator.includes('less than') && value < c.conditionNumberVal) matched = true;
        if (c.conditionNumberComparator.includes('greater than') && value > c.conditionNumberVal) matched = true;
        if (c.conditionNumberComparator.includes('equal to') && value == c.conditionNumberVal) matched = true;
      } else if (c.type == 'time') {
        let time_to_check = LUX.From.time(value), time = LUX.From.time(c.conditionTime);

        // let time_to_check = moment(value,'h:mma'), time = moment(c.conditionTime, 'h:mma');
        if (c.conditionTimeComparator.includes('before') && time_to_check < time) matched = true;
        if (c.conditionTimeComparator.includes('exactly') && time_to_check == time) matched = true;
        if (c.conditionTimeComparator.includes('after') && time_to_check > time) matched = true;
      } else if (['list', 'checkboxes'].includes(c.type)) {
        if (value) {
          if (typeof value == 'string') value = [value];
          if (value.some(v => c.conditionList.map(l => l.toLowerCase()).includes(v.toLowerCase()))) matched = true;
        }
      } else if (c.type == 'dropdown') {
        if (c.conditionList.includes(value)) matched = true;
      } else log(`condition type not found: ${c.type} `);
    } catch (error) {
      log({ error, value, condition }, `Condition match error`);
    }
    return matched;
  }
  followup_show(time = 400) {
    let item_ele = this.ele.closest('.item');
    if (item_ele.dne() || this.mode == 'build') return;
    let followup_time = this.ele.getObj('form').followup_time, item = item_ele.getObj();
    time = ifu(followup_time, time);
    let items = item.items, value = this.get({ literal: true });
    let toggle_me = [], hide_me = [], show_me = items;
    if (items && items.notEmpty()) {
      if (value === null) {
        let hide_all = show_me.map(i => i.ele[0]);
        $(hide_all).slideFadeOut();
      } else {
        show_me = items.filter(followup => {
          let show_me = Answer.condition_matches_parent(value, followup.options.condition), already_showing = ifu(followup.showing, false);
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
  update_obj(new_obj) {
    // this.options = new_obj.options;
    this.update(new_obj);
  }
  list_update(new_obj) {
    let i = this.input;
    i.children('li').remove();
    new_obj.options.list.forEach(o => i.append(`<li>${o}</li>`));
  }
  placeholder_shift() {
    if (this.ele.closest('#AddItem').exists() || this.ele.isInside('.item') || !this.options.placeholder || this.options.preLabel || this.settings.placeholder_shift === false) return;

    try {
      if (!this.placeholder_label) {
        this.ele.addClass('has-placeholder');
        this.placeholder_label = $('<span/>', { text: this.options.placeholder }).addClass('placeholder text-xlarge').insertBefore(this.input);
      }
      if (this.get() != null || this.autofill_list) this.placeholder_label.addClass('visible');
      else this.placeholder_label.removeClass('visible');

    } catch (error) {
      log({ error, this: this, arguments: arguments });
    }
  }
  async autofill_list_get(model) {
    this.waiting_for_list = true;
    let list = (await Models.ModelList.get(model, this)).list;

    if (this.options.autofill_settings) {
      // list = list.filter(l => this.settings_manager.match_autofill_settings(l));
      list = Models.SettingsManager.autofill_filter(list, this.options.autofill_settings);
      log({ list });
      // console.groupEnd();
    }
    this.waiting_for_list = false;
    return list;
  }
  async autofill_popup_create() {
    this.waiting_for_list = true;
    let model = this.options.autofill_model, answer = this;
    let disp_model = model.toKeyString(true).replace('Icd ', 'ICD ').replace('Cpt ', 'CPT ');
    this.autofill_limit = this.options.listLimit || 1;
    this.autofill_list = new Features.List({
      header: `${disp_model} List`,
      header_html_tag: 'h3',
      header_class: 'bold',
      with_search: true,
      // cssLiOnly: {width:'max-content',maxWidth:'20em'},
      filter: this,
      limit: this.autofill_limit,
      post_select_fx: _ => {
        if (this.autofill_list.limit == 1 && this.autofill_list.active.length == 1) this.autofill_list.tt.hide();
      }
    });
    this.linked_tt = new Features.ToolTip({
      message: this.autofill_list.ele,
      target: this.input,
      has_arrow: false,
      class_list: 'p-small purple'
    });
    if (this.options.list_separator == 'line break') this.options.list_separator = '\n';
    let list = this.autofill_list, columns = this.options.linked_columns || [], data_list = await this.autofill_list_get(this.options.autofill_model, columns);
    log(`autofill ${this.options.autofill_model}`, { data_list });
    const { error } = data_list;
    if (error) {
      Features.Banner.error(error);
      log({ error, data_list, model: this.options.autofill_model });
      return;
    }
    data_list.forEach(option => {
      list.add_item({ text: option.name, value: option.uid, entire_li_clickable: true, action: ev => { this.autofill_select_click(ev) } });
    })
    this.input.on('keyup', this.on_change.bind(this));

    model = model.toKeyString();
    this.linked_tt.ele.append(Models.Model.popup_links(model));
    this.waiting_for_list = false;
  }
  async autofill_list_update() {
    let answer = this, list = this.autofill_list, data_list = await Models.Model.get_list({ model: this.options.autofill_model, obj: this, columns: [] });
    list.remove_all();
    data_list.forEach(option => {
      list.add_item({ text: option.name, value: option.uid, entire_li_clickable: true, action: this.autofill_select_click.bind(this) });
    })
  }
  autofill_select_click(ev) {
    // let target = $(ev.target).closest('li'), val = target.data('value');
    this.autofill_text_update();
    this.on_change(ev);
  }
  // linked_find_item_by_uid (uid) {
  //   let list = this.autofill_list;
  //   if (!list) {
  //     log({answer:this,list}, `answer: ${this.name}`); return;
  //   }
  //   return this.autofill_list.items.filter((i,item) => {
  //     return Number($(item).data('value')) == Number(uid);
  //   });
  // }
  // linked_find_data_by_uid (uid) {
  //   if (typeof uid != 'number') uid = Number(uid);
  //   let list = Models.Model.list(this.options.autofill_model), item = list.find(m => m.uid == uid);
  //   return {uid:item.uid,text:item.name};
  // }
  autofill_select_uid(uids) {
    try {
      if (this.type == 'list') {
        this.ele.resetActives();
        if (uids) {
          const match = this.ele.find('li').filter((l, li) => uids.some(uid => $(li).data('value') == uid));
          match.addClass('active');
        }
      } else if (this.type == 'checkboxes') {
        let checkboxes = this.input.find('input');
        checkboxes.removeAttr('checked');
        if (uids) checkboxes.filter((c, checkbox) => uids.some(id => $(checkbox).attr('value') == id)).attr('checked', true);
      } else {
        this.autofill_text_update(uids);
      }
      // this.on_change();
      this.update_display();
    } catch (error) {
      log({ error, uids });
    }
  }
  autofill_text_update(uids = null) {
    if (uids) {
      if (!uids.is_array()) uids = [uids];
      this.autofill_list.ele.resetActives();
      this.autofill_list.items.filter((i, item) => uids.some(u => $(item).data('value') == u)).addClass('active');
    }
    setTimeout(_ => {
      let selection = this.autofill_selection, value = '';
      if (selection) {
        value = selection.get().map(item => $(item).text());
        if (this.options.list_separator) value = value.join(this.options.list_separator);
        else value = value.smartJoin();
      }
      this.input.val(value);
      this.placeholder_shift();
    }, 50);
  }


  disable(options) {
    this.is_disabled = true;
    if (this.disable_unique) this.disable_unique(options);
  }
  enable(options) { this.is_disabled = false; if (this.enable_unique) this.enable_unique(); }
  create_password() {
    this.type = 'text';
    this.create_text();
    // this.ele.addClass('text');
    this.input.attr('type', 'password');
    // let fx = this.on_enter || this.options.on_enter || null;
    // if (fx) this.input.on('keyup',)
  }
  async create_text() {
    this.input = $(`<input>`).appendTo(this.ele).on('keyup', this.on_change.bind(this));
    if (this.options.placeholder) this.input.attr('placeholder', this.options.placeholder);
    this.get = () => {
      if (this.autofill_list) return this.autofill_uids;
      let v = $.sanitize(this.input.val().trim());
      return (v != '') ? v : null;
    }
    this.disable_unique = () => { this.input.attr('disabled', true) };
    this.enable_unique = () => { this.input.removeAttr('disabled') }
    this.placeholder_visible = false;
    this.type = 'text';
    this.ele.addClass('text');
    if (this.options.placeholder) this.input.on('keyup blur', this.placeholder_shift.bind(this));
    if (this.options.autofill_model) await this.autofill_popup_create();
  }
  async create_username() {
    let validate = input => {
      input.allowKeys(/[a-zA-Z0-9_@.]/);
      input.on('blur', function () {
        let val = input.val();
        if (val.length < 5) input.warn('Must be at least 5 characters');
      });
      input.on('keydown', function (ev) {
        let v = $(this).val(), l = v.length, k = ev.key;
        if (l >= 25 && !['Backspace', 'Tab'].includes(k) && !k.includes('Arrow') && !$(this).hasSelectedText()) {
          ev.preventDefault();
          input.warn('Max length is 14');
        }
      })
      return input;
    }
    this.create_text();
    // this.ele.addClass('text');
    this.input.on('focusout', this.on_change.bind(this));
    validate(this.input);
  }
  async create_phone() {
    let validate = input => {
      input.allowKeys('0123456789-() ');
      input.attr({ placeholder: '(       )       -' })
      input.on('blur', function () {
        let val = input.val();
        val = val.replace(/[()\- ]/g, '');
        if (val.length < 10) { input.warn('Invalid phone number - too few digits'); return; }
        if (val.length > 10) { input.warn('Invalid phone number - too many digits'); return; }
        val = `(${val.substr(0, 3)}) ${val.substr(3, 3)}-${val.substr(6, 4)}`;
        input.val(val);
      });
      return input;
    }
    this.create_text();
    // this.ele.addClass('text');
    this.input.on('focusout', _ => { this.on_change() });
    validate(this.input);
  }
  async create_email() {
    let validate = input => {
      input.on('blur', function () {
        let val = input.val();
        if (!val.match(/.*@.*\..*/)) input.warn('Invalid email');
      });
      return input;
    }
    this.create_text();
    // this.ele.addClass('text');
    this.input.on('focusout', this.on_change.bind(this));
    validate(this.input);
  }
  async create_textbox() {
    this.input = $(`<textarea/>`).appendTo(this.ele).on('keyup', this.on_change.bind(this));
    if (this.options.placeholder) this.input.attr('placeholder', this.options.placeholder);
    // this.if_null_str = 'boxxy';
    this.get = () => {
      if (this.autofill_list) return this.autofill_uids;
      let v = $.sanitize(this.input.val());
      return (v != '') ? v : null;
    }
    this.placeholder_visible = false;
    if (this.options.placeholder) this.input.on('keyup blur', this.placeholder_shift.bind(this));
    if (this.options.autofill_model) await this.autofill_popup_create();
  }
  address_format(components, unit = null) {
  }
  async create_address() {
    let answer = this;
    let display = this.display = $('<div/>', { class: 'address_display' }).appendTo(this.ele);
    let parse = this.parse = system.validation.address.parse;

    this.reset = (warn = true) => {
      this.components = this.init('components');
      this.unit = this.init('unit');
      this.tz = this.init('tz');
      display.html(this.display_html());
      this.on_change();
    }
    this.display_html = () => parse({ components: this.components, unit: this.unit }).map(line => `<div>${line}</div>`);
    this.init = attr => { return this.initial ? this.initial[attr] : null }
    this.db = () => { return this.components ? { components: this.components, unit: this.unit, tz: this.tz } : null };
    this.components = this.init('components');
    this.unit = this.init('unit');
    this.tz = this.init('tz');

    let search = this.input = $(`<input/>`, { class: 'search' }).appendTo(this.ele).on('focusout', _ => { if (this.input.val() != '') this.autocomplete.place_changed(); else this.reset(false); });
    let unit = this.unit_ele = $(`<input/>`, { class: 'unit', attr: { placeholder: 'Unit' } }).appendTo(this.ele).on('focusout', _ => { if (this.input.val() != '') this.autocomplete.place_changed(); else this.reset(false); });
    let options = {
      fields: ['formatted_address', 'address_components', 'geometry'],
      place_changed: async function () {
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
          let tz = await new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.responseType = 'json';
            request.addEventListener("load", _ => { resolve(request.response.timeZoneId) });
            request.open("GET", rest);
            request.send();
          })
          log({ rest, location, timestamp, key, tz });
          answer.tz = tz;
        }
        let db = answer.db();
        // log({place,db,n});
        answer.on_change();
        if (db) display.html(answer.display_html());
        // let db = {components:answer.components,unit:answer.unit};
        return db;
      },
    };
    this.autocomplete = new google.maps.places.Autocomplete(this.input[0], options);
    this.autocomplete.setComponentRestrictions({
      country: ["us"],
    });
    unit.on('keyup', _ => { this.autocomplete.place_changed() });
    this.input.attr('placeholder', this.options.placeholder || 'Type to search');
    // this.input.removeClass('Address');
    this.get = () => {
      return this.db();
    }
  }
  async create_number() {
    this.input = $(`<input>`);
    // if (this.options.units) this.units_ele = $(`<span/>`,{text:this.options.units,css:{padding: '0 0.5em'}});
    // else this.units_ele = '';
    this.units_ele = $(`<span/>`, { text: this.options.units || '', css: { padding: '0 0.5em' } });
    for (let attr in this.options) {
      this[attr] = this.options[attr];
      if (!Number.isNaN(Number(this[attr]))) this[attr] = Number(this[attr]);
    }
    let num = this;
    ['min', 'max', 'start', 'step'].forEach(attr => { if (num[attr] == undefined) throw new Error(`${attr} is required`) })
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
        // let change = this.change;
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
        else this.change.next = (this.change.direction == 'up') ? Number(this.change.next) + this.step : Number(this.change.next) - this.step;
        const { next, direction, current } = this.change;
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
        if (this.change.next > this.max) {
          this.change.current = this.max;
          this.input.val(this.max);
          this.change.error = `max value is ${this.max}`;
          clearInterval(this.change.timer);
        } else if (this.change.next < this.min) {
          this.change.current = this.min;
          this.input.val(this.min);
          this.change.error = `min value is ${this.min}`;
          clearInterval(this.change.timer);
        } else if (Number.isNaN(Number(this.change.next))) {
          this.change.error = `numbers only`;
        } else this.change.error = null;
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
    });
    this.nowrap = $(`<div/>`, { class: 'flexbox left nowrap', css: { whiteSpace: 'nowrap' } }).append(this.input, this.units_ele, this.arrows.ele).appendTo(this.ele);
    this.input.data(this.options).attr('placeholder', this.options.start);
    this.input.allowKeys('0123456789/.-');
    this.input.on('keydown', function () { clearTimeout(num.followup_timeout) })
    this.input.on('keyup', function (ev) {
      num.change.current = num.get();
      num.change.next = num.change.current;
      num.change.check();
      num.followup_timeout = setTimeout(num.on_change.bind(num), 1000);
    });

    this.get = () => {
      let v = $.sanitize(this.input.val()), fixed = this.options.fixed_decimals ? Number(this.options.fixed_decimals) : null;
      if (v === '') return null;
      return (v !== '') ? (fixed ? Number(v).toFixed(fixed) : Number(v)) : null;
    }
    this.update = (new_obj) => {
      ['min', 'max', 'start', 'step'].forEach(attr => {
        if (attr == 'step') this[attr] = new_obj[attr] || 1;
        else this[attr] = new_obj[attr]
      });
      log({ new_obj });
      this.input.attr('placeholder', new_obj.options.start);
      this.value = new_obj.options.start;
      let t = new_obj.options.units || '';
      this.units_ele.text(t);
    }
  }
  async create_icd_code() {
    this.input = $(`<input>`).appendTo(this.ele);
    this.options.autofill_model = 'ICDCodes';
    await this.autofill_popup_create();
  }
  async create_imageclick() {
    // let height_map = {small: '25em', medium: '35em', large: '45em', x_large: '50em'};
    this.coordinate_array = this.coordinate_array || [];
    // this.indicatortor_array = this.indicator_array || [];
    // let indicator = _ => { return new Features.Icon({type: 'circle', color: 'pink'}) };
    let add_new = ev => {
      let win = system.ui.pointer.to_xy_coords(ev),
        box = this.image.getBoundingClientRect(),
        img = { x: box.left, y: box.top },
        abs = {
          x: win.x - img.x,
          y: win.y - img.y - window.scrollY
        },
        percent = {
          x: abs.x / box.width * 100,
          y: abs.y / box.height * 100
        };

      let dot = $('<div/>', { class: 'dot' }).appendTo(this.ele).css({ left: percent.x + "%", top: percent.y + "%" }).on('click', add_new);
      // let circle = new Features.Icon({type: 'circle', color: 'pink', size: 1, class_list: 'dot'});
      // let wrap = $('<div/>',{class: 'dot_wrap'}).appendTo(this.ele).append(circle.img).css({left:percent.x + "%",top:percent.y + "%"});
      // circle.img.appendTo(this.ele).css({left:percent.x + "%",top:percent.y + "%"});
      this.coordinate_array.push(percent);
      log({ coords: this.coordinate_array });
      // newCircle.data({coordinates:percent});

    };
    let undo = ev => { this.ele.children('.dot').last().remove(); this.coordinate_array.pop() };
    this.undo_btn = new Features.Button({
      text: 'undo',
      class_list: 'pink xsmall undo',
      action: _ => undo(),
    })

    this.image = new Image();
    this.image.src = this.options.image_url;
    // this.ratio = this.image.naturalWidth / this.image.naturalHeight;


    this.input = $(this.image).on('click', add_new);
    this.ele.addClass(`imageclick ${this.options.size}`);
    this.ele.append(this.input, this.undo_btn.ele);
    this.get = () => {
      return this.coordinate_array.notEmpty() ? this.coordinate_array : null;
    }
  }
  async create_bodyclick() {
    this.options.image_url = `/images/body/rsz_body12.png`;
    this.create_imageclick();
    // this.input.addClass('')
    // this.get = _ => this.bodyclick_dots;
  }
  async create_checkboxes() {
    // let i = this;

    this.reset_active = _ => {
      this.input.resetActives();
      this.input.find('input').filter(':checked').closest('label').addClass('active');
    }

    this.limit = !Number.isNaN(this.options.listLimit) ? Number(this.options.listLimit) : null;
    this.limit_text = this.limit == 1 ? `Limited to ${this.limit} response` : `Limited to ${this.limit} responses`;

    this.input = $(`<div/>`, { class: 'checkbox_list' }).on('click', 'input', ev => {
      let target = $(ev.target), active = this.get({ literal: true });
      if (this.limit && active && active.length == this.limit + 1) {
        log({ target, active });
        this.warning.show({ message: this.limit_text });
        ev.preventDefault();
      }
      setTimeout(_ => this.reset_active(), 50);
    }).on('change', 'input', ev => { this.on_change(ev) }).appendTo(this.ele);
    let list = this.options.list;
    if (this.options.autofill_model) {
      list = await this.autofill_list_get(this.options.autofill_model);
      // log({ model: this.options.autofill_model, list });
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
  async create_list() {
    let i = this;
    this.input = $(`<ul/>`, { class: 'radio' }).on('click', 'li', function (ev) {
      let limit = !Number.isNaN(Number(i.options.listLimit)) ? Number(i.options.listLimit) : null, active = i.active(),
        is_active = $(this).hasClass('active');
      if (limit) {
        let at_limit = active && active.length == limit;
        log({ limit, active, at_limit });
        if (at_limit && !is_active && limit != 1) {
          $(this).getObj('answer').warning.show({ message: `Limited to ${limit} responses` }); return;
          // $(this).closest('ul').warn(`Limited to ${limit} responses`); return;
        } else {
          if (limit == 1 && !is_active) { $(this).closest('ul').resetActives(); $(this).addClass('active'); }
          else $(this).toggleClass('active');
        }
      } else {
        $(this).toggleClass('active');
      }
      // this.on_change(ev);
      i.on_change(ev);
    }).appendTo(this.ele);
    if (this.options.autofill_model) {
      this.options.list = await this.autofill_list_get(this.options.autofill_model, this.options.linked_columns || []);
      log({ list: this.options.list });
      this.options.list = this.options.list.map(option => `${option.uid}%%${option.name}`);
    };
    this.options.list.forEach(option => {
      option = Answer.split_values_and_text(option);
      $(`<li data-value='${option.value}'>${option.text}</li>`).appendTo(this.input)
    });
    this.items = () => this.input.find('li');
    this.item_text_array = () => this.items().get().map(li => `${$(li).text()}`);
    this.item_value_array = () => this.items().get().map(li => `${$(li).data('value')}`);
    this.active = () => { return this.input.find('.active').get().map(li => `${$(li).data('value')}`) };
    this.get = (options = {}) => {
      // let keys_from_text = ifu(options.keys_from_text, false), 
      // let literal = ifu(options.literal, false);      
      let active = this.input.find('.active'), values = this.active();

      if (this.save_as_bool && !options.literal) {
        let obj = {};
        this.item_value_array().forEach(val => obj[val] = values.includes(val));
        return obj;
      } else {
        return values.notEmpty() ? values : null;
      }
    }
    this.update = this.list_update;
  }
  async create_dropdown() {
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
      // log({response,val,this:this});
      return response;
    }
  }
  async create_scale() {
    this.input = $(`<div/>`, { class: 'flexbox' }).appendTo(this.ele);
    this.left_label = $(`<div/>`, { class: 'flexbox column', html: `<span class='label bold'>${this.options.leftLabel}</span>` });
    this.right_label = $(`<div/>`, { class: 'flexbox column', html: `<span class='label bold'>${this.options.rightLabel}</span>` });
    this.slider = $(`<input type='range' class='slider' min='${this.options.min}' max='${this.options.max}' start='${this.options.start}'>`);
    this.input.append(this.left_label, this.slider, this.right_label);
    if (this.options.dispLabel.toBool()) {
      this.left_label.append(`<div>${this.options.min}</div>`);
      this.right_label.append(`<div>${this.options.max}</div>`);
    }
    if (this.options.dispVal.toBool()) {
      this.value_tt = new Features.ToolTip({
        target: this.slider,
        color: 'yellow',
        track_mouse: true,
        compact: true,
        message: this.options.start,
      });
      this.slider.on('mousedown touchstart', _ => {
        this.update_interval = setInterval(_ => { this.value_tt.message_reset(this.slider.val()); this.value_tt.move(); }, 100);
      }).on('mouseup touchend', _ => { clearInterval(this.update_interval) })
    }
    this.slider.on('change', _ => {
      this.followup_show();
      this.value_tt.message_reset(this.slider.val());
    })
    this.get = () => { return this.slider.val() }
  }
  async create_date() {
    let validate = input => {
      input.allowKeys('0123456789/ ,');
      input.on('keydown', function (ev) {
        let v = $(this).val(), l = v.length, k = ev.key;
        if (l == 0 & k == '/') ev.preventDefault();
        if (l == 1 & k == '/') $(this).val(`0${v}`);
        if (l == 3 & k == '/') ev.preventDefault();
        if (l == 4 & k == '/') $(this).val(`${v.slice(0, 3)}0${v.slice(3, 5)}`);
        if (l >= 6 & k == '/') ev.preventDefault();
        if (l >= 10 && !['Backspace', 'Tab'].includes(k) && !k.includes('Arrow') && !$(this).hasSelectedText()) ev.preventDefault();
      })
      input.on('keyup', function (ev) {
        let v = $(this).val(), l = v.length, k = ev.key;
        if (k == 'Backspace') return;
        if (l == 2) $(this).val(`${v}/`);
        if (l == 5) $(this).val(`${v}/`);
      })
      return input;
    }
    let limit = Array.isArray(this.options.date_limit) ? this.options.date_limit[0] : this.options.date_limit;
    let selection_limit = Number.isNaN(Number(limit)) ? null : Number(limit);
    let css = { width: `${selection_limit ? `${selection_limit * 8}em` : '40em'}`, maxWidth: 'calc(100% - 3em)' };
    this.input = $(`<input placeholder='MM/DD/YYYY'>`).css(css).appendTo(this.ele);
    validate(this.input);
    // let cal_icon = new Image();
    // cal_icon.src = `/images/icons/cal_icon_yellow.png`;
    // $(cal_icon).css({height:'2em',width:'2em',opacity:'60%',marginLeft:'0.5em',cursor:'pointer'});
    this.cal_icon = new Features.Icon({ type: 'cal', class_list: 'clickable' });
    // this.cal_icon.img.insertAfter(this.input);
    let d = this, i = this.input, options = {
      showTrigger: this.cal_icon.img,
      onClose: (dates) => {
        $('.datepick-trigger').animate({ opacity: 0.6 })
        let min = LUX.String.datepick.shorthand(d.options.minDate),
          max = LUX.String.datepick.shorthand(d.options.maxDate),
          valid = LUX.String.datepick.validate(i.val(), min, max);
        if (valid !== true) this.warning({ message: valid });
      },
      onShow: (picker, instance) => {
        if (selection_limit && selection_limit != 1 && instance.selectedDates.length == selection_limit) {
          this.warning({ message: 'Maximum number selected' });
        }
        instance.elem.parent().find('.datepick-trigger').animate({ opacity: 1 })
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
    this.cal_icon.img.data({ initialized: true });

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
        target: this.ele,
        css: { backgroundColor: 'var(--pink10o)', color: 'var(--pink)', borderColor: 'var(--pink50)' },
        translate: { y: fontSize * 2 }
      }));
    };
    this.enable_unique = () => {
      this.input.datepick('enable');
      let tt = this.ele.data('tooltip');
      if (tt) tt.ele.remove();
    };
  }
  async create_time() {
    let validate = input => {
      input.allowKeys('0123456789:ampm ');
      input.on('change', _ => setTimeout(_ => { this.on_change() }, 100))
        .on('blur', _ => setTimeout(_ => {
          let message = LUX.String.time.validate(input.val(), this.options.minTim, this.options.maxTime)
          if (message !== true) this.warning.show({ message })
        }, 100));
      return input;
    }
    this.input = $(`<input placeholder='H:MM A'>`).appendTo(this.ele);
    validate(this.input)
    this.clock = new Features.Icon({ type: 'clock', action: _ => { this.input.focus() } });
    this.clock.img.insertAfter(this.input);
    this.options.scrollDefault = 'now';
    this.options.timeFormat = 'g:i A';
    if (this.options.min !== null) this.options.minTime = this.options.min;
    else delete this.options.min;
    if (this.options.max !== null) this.options.maxTime = this.options.max;
    else delete this.options.max;
    if (this.options.step == null) this.options.step = 15;
    this.input.timepicker(this.options);

    if (this.options.range === 'true') {
      this.is_range = true;
      log({ range: this, options: this.options });
      this.time2 = new Answer({
        type: 'time', options: {
          min: this.options.min2,
          max: this.options.max2,
          step: this.options.step2,
        }
      });
      this.tween_ele = $('<div/>', { text: 'to', css: { fontSize: '1.2em', margin: '0 1em' } });
      this.ele.append(this.tween_ele, this.time2.ele.addClass('nowrap')).addClass('range');
    }

    this.get = () => {
      let v = $.sanitize(this.input.val());
      v = v != '' ? v : null;
      let response = v;
      if (this.time2) response = [v, this.time2.get()];
      return response;
    }
    this.update = new_obj => {
      // this.options.scrollDefault = 'now';
      // this.options.timeFormat = 'g:i A';
      // if (this.options.min !== null) this.options.minTime = this.options.min;
      // else delete this.options.min;
      // if (this.options.max !== null) this.options.maxTime = this.options.max;
      // else delete this.options.max;
      // if (this.options.step == null) this.options.step = 15;
      this.input.timepicker('remove');
      this.options.merge(new_obj.options);
      this.input.timepicker(this.options);

    }
  }
  async create_signature() {
    this.input = $(`<div/>`, { class: 'j_sig' }).appendTo(this.ele);
    this.clear_sig = _ => { this.input.jSignature('reset') };
    this.clear_btn = new Features.Button({ text: 'clear', class_list: 'clear pink70 xsmall', action: this.clear_sig });
    this.input.append(this.clear_btn.ele);
    const { typedName = false } = this.options;
    log('signature', { answer: this });
    if (typedName.toBool()) this.ele.prepend('<div>Type your full legal name here: <input class="typed_name" type="text" style="width:20em"></div><span>Sign in the box below:</span>');
    this.input.jSignature();
    this.get = () => {
      let jsig_data = this.input.jSignature('getData', 'base30');
      return jsig_data[1] != '' ? jsig_data : null;
    }

  }
  reset() {
    // if (this.options.name == 'required') log({initial:this.initial});
    this.value = this.initial;
  }
  clone() { return new Answer(this.options) }
  static split_values_and_text(string) {
    let split = `${string}`.split('%%');
    return (split.length > 1) ? { value: split[0].trim(), text: split[1].trim() } : { value: string, text: string };
  }
  static reset_all(ele = null) {
    let answers = Answer.get_all_within(ele || 'body', false);
    log({ ele, answers });
    answers.forEach(a => a.reset());
    return answers;
  }
  static get_all_within(ele, visible_only = true) {
    let eles = $(ele).find('.answer');
    if (visible_only) eles = eles.filter(':visible');
    return eles.get().map(answer => $(answer).getObj('answer', false));
  }
  static find(array, options) {
    let match = Answer.find_all(array, options);
    if (match.length > 1) {
      log({ error: new Error('WARNING multiple answers found matching options'), array, options, match },);
      return match;
    }
    return match[0] ? match[0] : null;
  }
  static find_all(array, options) {
    try {
      let matches = array.filter(answer => {
        if (answer === null) return false;
        for (let attr in options) {
          if (answer[attr] === undefined) return false;
          if (options[attr].is_array()) { let some = options[attr].some(o => answer[attr] == o); if (!some) return false; }
          else if (answer[attr] != options[attr]) return false;
        }
        return true;
      })
      return matches;
    } catch (error) {
      log({ error, array, options });
      return [];
    }
  }
  static find_inputs(array, options) {
    let inputs = $();
    Answer.find_all(array, options).forEach(answer => { inputs = inputs.add(answer.input) });
    return inputs;
  }
  static hold(answer, ev) { answer.hold = true }
}
class InsertOptions {
  constructor(options) {
    this.ele = $(`<div/>`, { class: 'insert_options flexbox' })
    // .css({backgroundColor:'var(--pink)',position:'absolute',left:'-1px',top:'0',transform:'translateY(-50%)',paddingLeft:'-0.05em',opacity:'0.7',borderRadius:'0 1em 1em 0',border:'1px solid var(--pink)',zIndex:'1'});
    this.plus_sign = new Image();
    this.plus_sign.src = '/images/icons/plus_sign_white.png';
    $(this.plus_sign).css({ height: '0.6em', width: '0.6em', padding: '0.3em', transition: 'width 1600ms, height 1600ms, transform 1600ms', cursor: 'pointer' });
    this.buttons = $(`<div class='flexbox'></div>`).css({ width: '0', height: '0', transition: 'width 400ms, height 400ms', overflow: 'hidden', flexWrap: 'nowrap' }).appendTo(this.ele);
    let buttons = ifu(options.buttons, null), button_wrap = this.buttons;
    if (buttons) {
      buttons.forEach(button => {
        button.class_list += ' white xsmall';
        new Features.Button($.extend(button, { appendTo: button_wrap, css: { margin: '0.2em 0.3em', fontWeight: 'bold' } }));
      })
    }
    this.ele.append(this.plus_sign).on('mouseenter', this.show.bind(this)).on('mouseleave', this.hide.bind(this));
    $(this.plus_sign).on('click', this.click.bind(this));
  }
  get button_width() {
    let w = this.buttons.find('.button').get().map(b => b.offsetWidth).reduce((sum, current) => sum + current, 0);
    w += get_rem_px() * 2;
    return w;
  }
  show() {
    if (this.is_visible) return;
    this.ele.animate({ opacity: 1 })
    this.buttons.animate({ width: this.button_width, height: '2.5em' });
    // this.buttons.animate({width:'16em',height:'2.5em'});
    $(this.plus_sign).css({ transform: 'rotate(225deg)', height: '1em', width: '1em' });
    this.is_visible = true;
  }
  hide() {
    if (!this.is_visible) return;
    this.ele.animate({ opacity: 0.7 });
    this.buttons.animate({ width: '0', height: '0' });
    $(this.plus_sign).css({ transform: 'rotate(0)', height: '0.6em', width: '0.6em' });
    this.is_visible = false;
  }
  click() {
    if (this.is_visible) this.hide();
    else this.show();
  }
}

export const Forms = { FormEle, SubmissionJson, Section, Item, Answer };

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
            options.each((o, option) => {
              $(option).removeData('value').find('input').val('');
              $(option).find('input').removeAttr('readonly');
              if (options.index(option) > 1) option.remove()
            });
          },
          fill: list => {
            throw new Error('dont use this dummy');
            let inputs = $("#OptionsList").find('.answer.text');
            list.forEach((item, i) => {
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
            let option = new Answer({ options, settings, type: 'text' }),
              arrows = new Features.UpDown({
                css: { fontSize: '1em', marginLeft: '0.5em' },
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
          if (type) {
            $(match).slideFadeIn(time);
            option_lists.not(match).slideFadeOut(time);
            if (['list', 'checkboxes', 'dropdown'].includes(type)) {
              let listLimit = $(match).findAnswer({ name: 'listLimit' }).ele;
              if (type == 'dropdown') listLimit.hide();
              else listLimit.show();
            }
          }
        },
        followup: {
          load_options: () => {
            try {
              let list = $("#FollowUpOptions"), editor = forms.create.editor, mode = editor.mode;
              if (is_followup()) {
                let parent = editor.followup.parent, current = editor.working_obj;
                match = list.find('.condition').filter((c, cond) => $(cond).data('parent') === parent.type || $(cond).data('parent').includes(parent.type));
                list.find('.parentInfo').html('').append(`<b class='purple'>Response to:</b> "${parent.options.text}"<br><b class='pink'>Must be:</b>`);
                list.slideFadeIn(0);
                match.slideFadeIn(0)
                list.find('.condition').not(match).slideFadeOut(0);

                if (['radio', 'checkboxes', 'list', 'list1plus', 'dropdown'].includes(parent.type)) editor.options.followup.list();
                else editor.options.followup[parent.type]();
                if (editor.mode == 'edit') {
                  for (let condition in current.condition) {
                    let answer = list.find(`.${condition}`).closest('.answer');
                    answer.set(current.condition[condition]);
                  }
                }
              } else list.slideFadeOut(0);
            } catch (error) {
              log({ error }, `followup.load_options`)
            }
          },
          number: () => {
            let parent = forms.create.editor.followup.parent, list = $("#FollowUpOptions"),
              obj = list.find('.conditionNumberVal').closest('.answer').data('class_obj');
            log({ parent, obj });
            obj.update_obj(parent.answer);
          },
          scale: () => {
            let parent = forms.create.editor.followup.parent, list = $("#FollowUpOptions"),
              obj = list.find('.conditionNumberVal').closest('.answer').data('class_obj');
            log({ parent, obj });
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
          let link_modal = $(`<div/>`, { class: 'modalForm center' });
          let list = new Features.List({ header: 'Available for Linking', selectable: false });
          link_modal.append(`<h3>Select a Category</h3><div>Linking a question to a category will allow the user to select from an up-to-date list of that category. There will be no need to update the question if you add to the category</div>`, list.ele);
          for (let model in linkable_models) {
            if (model != 'list') list.add_item({
              text: model.addSpacesToKeyString(),
              action: async function () {
                try {
                  blurTop('loading');
                  let list = linkable_lists[model] || await Models.Model.get_list({ model }), list_ele = $("#OptionsList");
                  Item.reset_modal();
                  Item.option_list_fill(list);
                  Item.AutofillModel = model;
                  Item.linked_to_fill();
                  unblur(2);
                } catch (error) {
                  log({ error });
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
      form_ele.find('.answer').filter(':visible').each((a, answer) => {
        let o = $(answer).getObj();
        response[o.options.name] = o.get();
      })
      return response;
    }
  },
  initialize: {
    all: () => {
      $.each(forms.initialize, function (name, initFunc) {
        if (name != 'all' && typeof initFunc === 'function') initFunc();
      });
    },
    answer_proxies: () => {
      $(".answer_proxy").each((t, proxy) => {
        try {
          let data = $(proxy).data();
          if (!data.options) throw new Error('data-options not defined');
          if (!data.type) throw new Error('data-type not defined');
          let answer = new Answer(data.merge({ proxy: proxy }));
        } catch (error) {
          log({ error, proxy });
        }
      })
    },
    submit_buttons: () => {
      init('.submit.model', function () {
        $(this).on('click', async function () {
          // try {
          let instance = null;
          let { model, action } = $(this).data();
          if ($(this).hasClass('create')) {
            log('Save Create', { instance, model });
            instance = model.to_class_obj();
          } else if ($(this).hasClass('edit')) {

            instance = Models[model].editing;
            instance = Models.Model.current;
            if (!instance) throw new Error('Models.Model.current not found');
            if (!instance.update_attrs_by_form()) throw new Error('Form Error');
            log('Save Edits', { instance, model });
          }
          log('pre-save instance', { instance, model, action });
          if (action) await action();
          else await instance.save();
          system.initialize.newContent();
          // } catch (error) {
          //   Features.Banner.error(error.message);
          //   log({ error, this: this });
          // }
        })
      })
    },
    form_proxies: () => {
      init('.form_proxy', function () {
        let form = new FormEle($(this));
      })
    },
    signatures: () => {
      init($('.j_sig').filter(':visible'), function () {
        $(this).jSignature();
        const answer = $(this).getObj('answer');
        if (answer.initial) answer.to_initial_value();
      })
    },
    builder: () => {
      init('#FormBuilder', function () {
        forms.reset();
        $(".itemOptionList").slideFadeOut();
        $("#AddItemType").on('change', 'select', function () {
          let type = $(this).val();
          Item.option_list_show(400, type);
        });
        // $('#AddItem').on('click', '.save', Item.create)

        // $('#AddSection').on('click', '.add', function(){
        //   let section = Section.create();
        //   if (section) forms.current.autosave.trigger();
        // });
        let name = new Features.Editable({
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
          arrow_proxy = options_list.find('span').filter(function () { return $(this).text() == 'UpDownProxy' }),
          arrows = new Features.UpDown({
            css: { fontSize: '1em', marginLeft: '0.5em' },
            action: 'change_order',
            postLabel: 'change option order'
          }), option = options_list.find('.answer.text');
        options_list.on('click', '.add', forms.create.editor.options.list.add_option)
          .on('keyup', 'input', function (ev) {
            if (ev.keyCode == 13) {
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
      init('.calendar', function () {
        new Models.Calendar($(this));
      })
    },
    toggles: () => {
      init('.toggle_proxy', function () {
        new Features.Toggle($(this));
      })
    },
    embedded_icd: () => {
      // if (!ICD.Settings.apiSecured) ICD.Handler.configure(EMBEDDED_ICD_SETTINGS,EMBEDDED_ICD_CALLBACKS);
      let new_input = system.initialize.find('.ctw-input');
      if (new_input && new_input.length > 0) {
        ICD.Handler.configure(EMBEDDED_ICD_SETTINGS, EMBEDDED_ICD_CALLBACKS);
        $('.ctw-input').each(function () {
          $(this).attr('autocomplete', 'off');
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
    soloModal: function () {
      log({ loadingNotes: 'doin it' }, 'notes soloModal');
      var noteForm = filterByData($("#AddNote"), 'hasNoteFx', false);
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
      noteForm.data('hasNoteFx', true);
    },
    withModel: function (objectWithNotes = null, autosaveFx = null) {
      log({ loadingNotes: 'doin it' }, 'notes withModel');
      if (objectWithNotes) notes.targetObj = objectWithNotes;
      if (autosaveFx && typeof autosaveFx == 'function') notes.callback = autosaveFx;
      notes.initialize.basicFx();
    },
    basicFx: function () {
      log({ loadingNotes: 'doin it' }, 'notes basicFx');
      var form = filterByData('#AddNote', 'hasDynamicFx', false), addBtn = $('#AddNoteBtn');
      if (form.dne()) return;
      $("#NoteList").on('click', '.delete', notes.remove);
      addBtn.on('click', notes.add);
      form.data('hasDynamicFx', true);
    }
  },
  resetForm: function () {
    $("#AddNote").data('hasNoteFx', false);
    notes.targetObj = null;
    notes.callback = null;
  },
  getModelNotes: function (model, uid) {
    blurTop('#loading');
    $.ajax({
      url: '/addNote/' + model + "/" + uid,
      method: "GET",
      success: function (data) {
        if ($("#AddNoteModal").exists()) {
          $("#AddNoteModal").html(data).data({ model: model, uid, uid });
        } else {
          $("<div/>", {
            id: 'AddNoteModal',
            class: 'modalForm',
            data: { model: model, uid: uid },
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
  updateOptionsNav: function () {
    var pinnedNotes = $(".optionsNav").find(".value.pinnedNotes");
    if (pinnedNotes.dne()) return;
    pinnedNotes.html("");
    var currentNotes = notes.retrieve();
    if (currentNotes) {
      $.each(currentNotes, function (n, note) {
        if (note.title) pinnedNotes.append("<div><span><span class='bold'>" + note.title + "</span>: " + note.text + "</span></div>");
        else pinnedNotes.append("<div><span>" + note.text + "</span></div>");
      });
    } else {
      if (pinnedNotes.html() == "") pinnedNotes.html("<div class='bold'>None</div>");
    }
  },
  add: function () {
    var form = $("#AddNote");
    if (!forms.retrieve(form)) return false;
    var newNote = notes.create(), h4 = newNote.title ? "<h4>" + newNote.title + "</h4>" : "",
      newHtml = h4 + "<div>" + newNote.text + (notes.allowRemoval ? "<span class='delete'>x</span>" : "") + "</div>";
    $("<div/>", {
      class: 'note',
      html: newHtml,
      data: newNote
    }).appendTo("#NoteList");
    $("#NoNotes").slideFadeOut();
    resetForm(form);
    if (notes.callback) notes.callback();
    if (notes.targetObj) notes.targetObj.current.notes = notes.retrieve();
  },
  create: function () {
    var title = justResponse($("#AddNote").find('.note_title'));
    return {
      title: (title == '') ? null : title,
      text: justResponse($("#AddNote").find('.note_details'))
    };
  },
  remove: function () {
    $(this).closest('.note').slideFadeOut(400, function () {
      $(this).remove();
      if (notes.callback) notes.callback();
      if (notes.targetObj) notes.targetObj.current.notes = notes.retrieve();
    })
  },
  retrieve: function () {
    var notes = [];
    $("#NoteList").find(".note").each(function () {
      notes.push($(this).data());
    });
    return notes.length > 0 ? notes : null;
  },
  autofill: function (existingNotes) {
    if (existingNotes == '""' || !existingNotes) return;
    $.each(existingNotes, function (n, note) {
      $(".note_title").val(note.title);
      $('.note_details').val(note.text);
      notes.add();
    });
  },
  autosave: function () {
    console.log('saving pinned notes');
    var currentNotes = notes.retrieve(), model = $("#AddNoteModal").data('model'), uid = $("#AddNoteModal").data('uid');
    console.log(model, uid);
    $.ajax({
      url: '/savePinnedNotes/' + model + "/" + uid,
      method: "POST",
      data: {
        notes: currentNotes
      },
      success: function (data) {
        if (data == 'checkmark') {
          autosave.success();
          notes.updateOptionsNav();
          notes.marksaved();
        }
      }
    })
  },
};

export { forms, notes };