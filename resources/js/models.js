import { system, practice, log, Features, menu } from './functions';
import { forms, Forms } from './forms';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import luxonPlugin from '@fullcalendar/luxon'
import rrulePlugin from '@fullcalendar/rrule';
import { DateTime as LUX, Duration as LUXDur } from 'luxon';

class Table {
  constructor(options = {}) {
    try {
      this.define_by(options);
      this.ele.removeAttr('data-rows');
      this.ele.data({ class_obj: this });
      this.table = $(`<table/>`, { class: 'styled-table' });
      this.wrap = $(`<div/>`, { class: 'table-container' }).appendTo(this.ele).append(this.table);
      this.head_row_create();
      this.rows.forEach(row => this.add_row(row));
      this.selectable = ifu(options.selectable, true);
      this.show_selection = ifu(options.selectable, true);
      this.limit = Number.isNaN(Number(this.limit || 1)) ? null : Number(this.limit || 1);
      this.limit_warning = new Features.Warning({
        message: `Limited to ${this.limit} ${this.limit == 1 ? this.display_name : this.header}`,
      });
      this.filter_box = $(`<div/>`, { class: 'filter_box' }).insertBefore(this.wrap);
      if (this.header) this.header_ele = $(`<${this.header_html_tag || 'h1'}/>`, { text: this.header, class: this.header_class || 'purple' }).appendTo(this.filter_box);
      this.filters.forEach(f => this.add_filter(f));

      if (this.selectable && this.show_selection) {
        this.button_box = $('<div/>', { class: 'button_box m-none' }).appendTo(this.filter_box);
        this.selection_list = new Features.List(this.selection_list_options());
        this.selection_list.ele.appendTo(this.filter_box);
        if (this.buttons) this.buttons = this.buttons.map(options => {
          let button = new Features.Button({ disabled_message: 'none selected', table: this, ...options });
          button.ele.appendTo(this.button_box);
          return button;
        });
        else this.button_box.hide();
      }

      if (this.is_index) this.add_index_options();
      if (this.list_update) ModelList.set(this.model, this.list_update);
      this.reload_warning = new Features.Warning({
        color: 'pink',
        message: 'reload to reflect recent changes',
        action: Http.reload_tab,
        target: this.wrap,
        persist: true,
        fade: null,
      })
      if (this.model === 'Form') {
        this.change_button_actions({
          "button-add-new": () => $('#forms-create').find('.title').trigger('click'),
          "button-edit": () => $('#forms-edit').find('.title').trigger('click'),
        })
      }
      // log({ this: this, options }, 'new TABLE!!');
      // window.table = this;
    } catch (error) {
      log({ error, table: this, options });
    }
  }
  change_button_actions(buttonChanges = {}) {
    const button = (nameString) => this.filter_box.find(`.${nameString}`).getObj();
    for (let name in buttonChanges) {
      button(name).action = buttonChanges[name];
    }
  }
  selection_list_options() {
    let options = {
      header: `Selected ${this.header}`,
      header_html_tag: 'h4',
      ul_class: 'horizontal',
      post_add_fx: _ => {
        if (!this.continue_btn) return;
        if (this.active.dne()) this.continue_btn.ele.addClass('disabled');
        else this.continue_btn.ele.removeClass('disabled');
      }
    };
    if (this.is_index) options.merge({
      header: `Selected ${this.header} (0)`,
      ul_class: 'horizontal',
      no_item_text: 'none selected',
      selectable: true,
      action: ev => {
        this.update_selection(ev);
      }
    });
    return options;
  }

  update_selection(ev) {
    const model = this.model, list = this.selection_list;
    if (ev) {
      const li = $(ev.target).closest('li'), uid = li.data('value');
      const active = li.hasClass('active');
      if (this.details) {
        if (active) this.details.load(model, uid);

      }
    }
    const count = list.active.length, uids = list.active_values;
    list.header.text(`Selected ${this.header} (${count})`);
    this.active = uids;
    this.update_buttons();

  }

  update_buttons() {
    const buttons = this.button_box.find('.button.requires-selection');
    const uids = this.selection_list.active_values, count = uids.length;
    if (count === 0) buttons.addClass('disabled');
    else if (count === 1) buttons.removeClass('disabled');
    else {
      buttons.removeClass('disabled');
      buttons.filter('.select-1').addClass('disabled');
    }
  }


  add_index_options() {
    Table.CurrentIndex = this;
    let ele = this.ele.find('.Details');

    this.details = new Details(ele.data().merge({ ele, table: this }));
    this.details.ele.insertAfter(this.filter_box);

    this.option_dots = new Features.Icon({ type: 'option_dots', size: 1.75, color: 'purple' });
    this.option_tooltip = new Features.ToolTip({ target: this.option_dots.img, message: this.options_ele, click_toggle: true, color: 'purple' });
    this.wrap.append(this.option_dots.img);
    let description = info => { let name = info.Name; if (info.Category) { name += `<div class='smaller italic'>${info.Category}</div>` }; return name; }
    let json = this.rows.map(r => {
      return {
        append: `<div class='left'>${description(r)}</div>`,
        value: r.data.uid,
      }
    })
    let subheader = `${this.has_category ? `Default order is by category name, and then ${this.model} name.` : `Default order is by ${this.model} name.`}<br>This will affect how all users see these ${this.header} throughout the portal.`;
    let order_autosave = new Features.Autosave({ send: _ => this.change_order(), show_status: true, delay: 1000 });
    let arrow_callback = _ => order_autosave.trigger();
    this.order_list = new Features.List({ header: `Change Display Order`, subheader, json, selectable: false, class_list: 'box', has_arrows: true, arrow_callback });
    this.reset_order_btn = new Features.Button({
      text: 'reset to default', class_list: 'pink xsmall', button_box: true, action: _ => {
        this.reset_order();
      }
    });
    this.order_list.ele.append($('<div/>', { class: 'button_box' }).append(this.reset_order_btn.ele));
  }
  change_order() {
    let order = this.order_list.items.get().map(i => $(i).data('value'));
    return $.ajax({
      url: `/${this.model}/display_order/update`,
      method: 'POST',
      data: { order },
      success: response => {
        log({ response });
      }
    });
    // return new Promise(resolve => {resolve(values)});
  }
  reset_order() {
    blurTop('loading');
    return $.ajax({
      url: `/${this.model}/display_order/update`,
      method: 'POST',
      data: { order: 'reset' },
      success: response => {
        blurTop('checkmark', { on_undo_fx: Http.reload_tab, auto_undoall_timeout: 1000 });
        // setTimeout(Http.reload_tab, 200);
      }
    });
  }
  get options_ele() {
    let category = Models[`${this.model}Category`];
    let has_category = category ? true : false;
    let wrap = $('<div/>', { class: 'TableOptions flexbox column' });
    this.multi_action_confirm = new Features.Confirm({
      header: 'Confirm multi action',
      // affirm: _ => { this.settings_multi() }
    });
    let buttons = [
      { text: 'display order', class_list: 'pink xsmall', action: _ => blurTop(this.order_list.ele) },
      {
        text: 'edit settings', class_list: 'pink xsmall', action: _ => {
          let active = this.active;
          if (active.length == 1) Model.find(this.model, this.uids[0]).settings();
          else this.multi_action_confirm.prompt({
            header: "Edit Settings for All Selected Forms?",
            message: $(`<div/>`, { html: this.names.join('<br>') }),
            affirm: _ => { Model.settings_multi(this.model, this.uids) }
          })
        }
      },
    ];
    return wrap.append(buttons.map(btn => (new Features.Button(btn)).ele));
  }


  head_row_create() {
    this.head = $(`<tr/>`, { class: 'head' }).appendTo(this.table);
    for (let text in this.columns) {
      if (text == 'Category') this.has_category = true;
      $('<th/>', { text }).appendTo(this.head);
    }
  }
  add_row(json) {
    this.create_row(json).appendTo(this.table);
  }
  append_row(row) {
    row.appendTo(this.table);
  }
  prepend_row(row) {
    row.insertAfter(this.table.find('tr.head').first());
  }
  create_row(json) {
    let row = $(`<tr/>`, { class: 'body clickable' }).addHoverClassToggle()
      .on('click', ev => { this.row_click(ev) }).data({ info: json });
    let is_bool = (col) => this.bool_cols ? this.bool_cols.includes(col) : false;
    let style = (col, val) => {
      if (val === 'not set') val = is_bool(col) ? '' : '<i class="smaller gray">not set</i>';
      else if (['true', 'false'].includes(val)) {
        let icon = new Features.Icon({
          type: val === 'true' ? 'checkmark' : 'styled_x', size: 1, css: { marginLeft: '0.25em' }
        });
        // val = $(`<div/>`,{class:'flexbox left'}).append(icon);
        val = icon.img;
      }
      return val;
    };
    for (let key in this.columns) {
      let val = style(this.columns[key], json[key]);
      let td = $('<td/>', { class: `${this.columns[key]} all`, data: json.data })
      let td_size = $(`<div/>`, { class: 'td_size_control flexbox left' }).append(val, Table.td_indicator());
      if (val instanceof jQuery && val.is('img')) td_size.removeClass('left');
      row.append(td.append(td_size));
      td.hover(
        _ => { this.table.find(`.${this.columns[key]}`).addClass('hover') },
        _ => { this.table.resetClass(`hover`) },
      );
    }
    return row;
  }
  update_or_add_row(json) {
    const { data: { uid } } = json;
    const newRow = this.create_row(json), existingRow = this.find_by_uid(uid);
    log(`Adding ${this.model}:${uid}`, { json, existingRow, uid, newRow });
    if (existingRow.exists()) existingRow.replaceWith(newRow);
    else this.prepend_row(newRow);
    return newRow;
  }
  remove_rows(uids) {
    this.find_by_uid(uids).remove();
    if (this.selection_list) {
      this.selection_list.remove_by_value(uids, 0);
    }
    if (this.details) this.details.hide();
    this.update_selection();
  }

  async row_click(ev) {
    let row = $(ev.target).closest('tr'), info = row.data('info'), was_active = row.is('.active'), uid = info.data.uid;
    let meta = ev.metaKey, ctrl = ev.ctrlKey, alt = ev.altKey;
    Model.set_uid(this.model, uid);
    if (this.action) this.action.to_fx({ ev, row, info });
    if (this.selectable && !this.is_index) {
      if (this.limit == 1) {
        this.table.resetActives();
        row.addClass('active');
      } else if (this.at_limit && !was_active) this.limit_warning.show({ ele: row });
      else row.toggleClass('active');

      this.selection_list.values.forEach(uid => {
        if (!this.uids.includes(uid)) this.selection_list.remove_by_value(uid, null);
      });
      active.get().forEach(r => {
        let info = $(r).data('info'), list_items = this.selection_list.values, on_list = list_items.includes(uid), is_active = $(r).is('.active');
        if (is_active && !on_list) this.selection_list.add_item({ value: uid, text: info.Name });
        else if (!is_active && on_list) this.selection_list.remove_by_value(uid, null);
      });
    } else if (this.is_index && meta) {
      row.toggleClass('active');
      if (this.selection_list.find_by_value(uid).dne()) {
        this.selection_list.add_item({ value: uid, text: info.Name });
        // this.selection_list.find_by_value(uid).addClass('active');
        let instance = Model.find(this.model, uid);
        Model.current = Models[this.model].current = instance;
      }
    } else if (this.is_index) {
      this.table.resetActives();
      row.addClass('active');
      const item = this.selection_list.find_by_value(uid);
      if (item.dne()) {
        this.selection_list.add_item({ value: uid, text: info.Name });
      }
      this.details.load(this.model, uid);
    }

    let active = this.active;
    if (active.dne()) {
      if (this.selection_list) this.selection_list.ele.resetActives();
    } else {
      if (this.selection_list) {
        this.selection_list.ele.resetActives();
        this.selection_list.find_by_value(this.uids).addClass('active');
      }
    }
    this.selection_list.update_list();
  }
  get_filter_type(filter) {
    if (filter.options.name == 'text_search') return 'text';
    let is_column = false, is_data = this.data.includes(filter.options.name);
    for (let name in this.columns) { if (this.columns[name] == filter.options.name) is_column = true }
    return is_column ? 'column' : is_data ? 'data' : 'no_match';
  }
  add_filter(json) {
    let filter_type = this.get_filter_type(json), is_search_bar = filter_type === 'text';
    json.merge({
      target: this,
      selector: 'tr.body',
      filter_type,
    });
    if (filter_type !== 'text') json.options.merge({ eleClass: 'column' });
    let filter = new Features.Filter(json);
    filter.ele.appendTo(this.filter_box)
  }

  disable_buttons() { this.button_box.find('.button.requires-selection').addClass('disabled') }
  enable_buttons() { this.button_box.find('.button.requires-selection').removeClass('disabled') }

  get all_rows() { return this.table.find('tr.body') }
  get active() { return this.table.find('tr.active') }
  set active(uids) {
    this.table.resetActives();
    this.find_by_uid(uids).addClass('active');
  }
  get names() { return this.active.get().map(row => $(row).data('info').Name) }
  get uids() { return this.active.get().map(row => $(row).data('info').data.uid) }
  get info() { return this.active.get().map(row => $(row).data('info')) }
  get at_limit() {
    if (!this.limit) return false;
    else return this.limit === this.active.length;
  }
  find_by_uid(uids = []) {
    if (!uids.is_array()) uids = [uids];
    uids = uids.map(uid => parseInt(uid));
    const match = this.all_rows.get().filter(row => uids.includes($(row).data('info').data.uid));
    // log(`Find rows ${uids.join(',')}`, { uids, match });
    return $(match);
  }
  static td_indicator() { return $(`<div/>`, { class: 'td_indicator', text: '...' }); }

  refresh = () => {

  }
  suggest_reload() { this.reload_warning.show() }
}
class Details {
  constructor(options = {}) {
    this.define_by(options);
    this.ele.removeAttr('data-buttons');
    this.ele.removeAttr('data-details');
    this.ele.data({ initialized: true, class_obj: this });
    this.header = $('<h3/>', { text: '' });
    this.body = $('<div/>');
    this.button_box = $('<div/>', { class: 'button_box low_margin box purple light' }).appendTo(this.body);
    if (this.buttons && this.buttons.length) this.buttons = this.buttons.map(b => {
      let button = new Features.Button(b);
      b.ele = button.ele.appendTo(this.button_box);
      return button;
    });
    else this.button_box.hide();
    this.key_values = new Features.KeyValueBox({
      header: 'loading',
      transform_fx: Details.model_details_display
    });
    this.key_values.ele.addClass('details');
    this.ele.append(this.header, this.body.append(this.key_values.ele)).slideFadeOut(0);
    this.toggle = new Features.Toggle({
      toggle_ele: this.header,
      target_ele: this.body,
      // arrow_size: 0.5,
      initial_state: 'hidden',
      arrow_position: 'below',
    });
    if (this.recent.notEmpty()) this.recent.forEach(m => this.table.selection_list.add_item({ value: m.uid, text: m.name || m.attr_list.name || 'no name' }));
    if (this.details) {
      const { model, selection_list } = this.table, { uid, name } = this.details;
      const instance = Model.find_or_create(model, uid, { name });
      instance.details = this.details;
      this.load(model, uid);
      if (selection_list.find_by_value(uid).dne()) {
        selection_list.add_item({ value: uid, text: name }).click();
      }
    }
    this.toggle.target_ele.hide();
    // log('DETAILS', { details: this });
    // window.details = this;
  }
  hide() {
    this.ele.slideFadeOut();
  }
  async load(model, uid, options = {}) {
    if (!uid) return;
    let request = {
      target: this.toggle.toggle_ele,
      blur: { size: 2 },
      url: `/${model}/details/${uid}`,
      is_html: false,
    };
    this.ele.slideFadeIn();

    let instance = Model.find(model, uid), details = null;
    // log({ model, uid, instance });
    if (instance && options.force_reload) details = await Http.fetch(request);
    else if (instance && instance.details) details = instance.details;
    else if (instance) details = await Http.fetch(request);
    else {
      details = await Http.fetch(request);
      instance = new Models[model]({ uid, name: details.name });
    }

    Model.current = Models[model].current = instance;
    instance.details = details;
    this.details = details;
    const { name } = details;
    this.toggle.text_ele.text(name);
    this.key_values.reset_all();
    for (let section_name in details) {
      if (['name', 'uid'].includes(section_name)) continue;
      let info = details[section_name];
      if (info) {
        this.key_values.add_header(section_name);
        this.key_values.new_pairs(info);
      }
    }
  }

  static load(model, uid, options = {}) {
    let details = $(`#${model}Details`);
    if (details.dne()) return;
    details.getObj().load(model, uid, options);
  }
  get recent() { return Model.filter({ type: this.table.model }) }
  static model_details_display(key, value, obj_to_bool_array = false) {
    try {
      if (typeof value == 'string') value = value.toBool();
      let type = typeof value;
      if (key == 'system' && !user.isSuper()) return null;
      else if (key == 'DisplayValues') {
        this.on_completion = () => {
          let all = this.ele.find('.setting_name');
          for (let name in value) {
            let match = all.filter((e, ele) => $(ele).text().toKeyString() == name);
            match.next().html(value[name]);
          }
        }
        return null;
      } else if (key == 'Business Hours') {
        this.on_completion = () => {
          let ele = this.ele.find(".value.BusinessHours");
          ele.find('.DaysOfTheWeek').remove();
          this.set_order(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], ele);
          ele.find('span').replaceText(', and ', ' - ');
        }
      } else if (key == 'display') return null;

      let span = $('<span/>');

      if (key == 'Settings') {
        this.add_header(`Settings`);
        if (value === null) this.add_header('no settings given');
        else this.new_pairs(value);
        return null;
      } else if (value == null) {
        return null;
      } else if (type == 'object' && value.is_array()) {
        return span.append(value.smartJoin('and'));
      } else if (type == 'object') {
        if (obj_to_bool_array) return span.append(SettingsManager.obj_to_bool_array(value).smartJoin('and'));
        let div = $('<div/>', { class: 'settings-section' });
        for (let k in value) {
          let inner_div = $('<div/>', { class: k }), key_span = $('<span/>', { class: `setting_name`, text: `${k.toKeyString(true)}:` }), value_k = Details.model_details_display(k, value[k], true);
          if (value_k == null) value_k = $('<span/>', { text: 'default', css: { display: 'inline-block' } })
          if (value_k instanceof jQuery) value_k.addClass('setting_value');
          div.append(inner_div.append(key_span, value_k));
        }
        return div;
      } else if (type == 'boolean') {
        let icon = new Features.Icon({ type: value ? 'checkmark' : 'styled_x', size: 1, css: { margin: '0.2em 0.3em', opacity: 0.9 } });
        let div = $('<div/>').append(value ? 'true' : 'false', icon.img);
        return div;
      } else {
        return span.append(value);
      }
    } catch (error) {
      log({ error, key, value });
    }
  }
}

class Model {
  valid = true;

  constructor(attr_list, type) {
    try {
      if (!attr_list || $.isEmptyObject(attr_list)) {
        this.valid = false;
        const error = new Error('attr_list not provided to Model constructor');
        log({ error });
      }
      this.attr_list = attr_list;
      this.type = type.toKeyString();
      if (this.attr_list.uid) this.uid = this.attr_list.uid;
      if (this.attr_list.name) this.name = this.attr_list.name;
      // this.name = this.attr_list.name || this.name || 'nameless';

      if (this.uid != 'proxy') Model.loaded.push(this);
      if (this.uid != 'proxy' && this.type != 'Appointment') log(`new ${type} : ${this.name}`, { list: Model.loaded, this: this, attr_list });
    } catch (error) {
      log({ error, attr_list, type });
    }
  }
  backup_attrs = [];
  backup_attr_values(array) {
    let model = this;
    array.forEach(value_str => {
      let values = value_str.split(':'), attr = values[0], backups = values.slice(1);
      while (model.attr_list[attr] == undefined && backups.length > 0) {
        model.attr_list[attr] = model.attr_list[backups.shift()];
      }
      if (model.attr_list[attr] == undefined) delete model.attr_list[attr];
    })
  }


  static get loaded() { return Model.loaded_array === undefined ? Model.loaded_array = [] : Model.loaded_array }
  static filter(options = {}) {
    return Model.loaded.filter(m => {
      for (let key in options) { if (m.dot_notation_get(key) != options[key]) return false; }
      return true;
    });
  }
  static find(type, uid, with_attr = []) {
    try {
      return Model.loaded.find(m => m.type == type && m.uid == uid && with_attr.every(a => m.a || m.attr_list.a));
    } catch (error) { log({ error, type, uid }) }
  }
  static find_or_create(type, uid, attr_list = {}) {
    try {
      let instance = Model.find(type, uid);
      if (instance) instance.attr_list.merge(attr_list);
      else instance = new Models[type](attr_list.merge({ uid }));
      return instance;
      // return Model.find(type, uid) || new Models[type](attr_list.merge({uid}));
    } catch (error) { log({ error, type, uid }) }
  }

  static active(type) { return Model.find(type, uids(type)) }

  static get uids() { return Model.uid_list === undefined ? Model.uid_list = {} : Model.uid_list }
  static get uid_str() { return JSON.stringify(Model.uids) }
  static uid(type) { return Model.uids[type.toKeyString()] || null }
  static set_uid(type, uid) { Model.uid_list[type] = uid; return Model.uids; }
  static set_uids(json) { (Model.uid_list || {}).merge(json); return Model.uids; }
  static unset_uid(type) { delete Model.uid_list[type]; return Model.uids; }

  static construct_from_form(selector) {
    let attr_list = {}, all_pass = true;;
    try {
      let form = $(selector);
      if (form.dne()) throw new Error(`${selector} not found`);
      if (form.length > 1) throw new Error('more than one form found');
      form.find('.answer').filter(':visible').each((a, answer) => {
        let obj = $(answer).getObj(), value = $(answer).verify('required'), name = obj.options.name;
        if (value === false) all_pass = false;
        attr_list[name] = value;
      })
      // this.wants_checkmark = true;
    } catch (error) {
      log({ error, selector });
      all_pass = false;
    }
    return all_pass ? attr_list : false;
  }
  update_attrs_by_form(options = {}) {
    let attr_list = this.attr_list, all_pass = true;
    try {
      let form = options.form || null, type = this.attr_list.model || this.usertype || this.type;
      if (!form) form = $(`#${type.toKeyString()}`);
      if (form.dne()) throw new Error(`Form #${type} not found`);
      if (form.length > 1) throw new Error(`Multiple forms #${type} found`);

      let answers = Forms.Answer.get_all_within(form);
      answers.forEach(answer => {
        let value = answer.verify('required'), name = answer.options.name;
        if (value === false) {
          all_pass = false;
          log(`Verify ${name} failed`, { answer, form });
        } else {
          attr_list[name] = value;
        }

      })
    } catch (error) {
      log({ error, options, all_pass });
      all_pass = false;
    }
    return all_pass;
  }
  clear_uid() {
    this.uid = null;
    this.attr_list.uid = null;
  }
  set_attributes(attributes = {}) {
    const form_values = this.form_values || {};
    const values = { ...this.attr_list, ...form_values, ...attributes };
    this.attr_list = values;
    return values;
  }
  get_attribute(key, value = null) {
    const attr = this[key] || this.attr_list[key];
    if (value === null) {
      return attr;
    } else {
      return attr === value;
    }
  }

  static async edit() { Model.current.edit() }
  edit = async () => {
    log(`Edit ${this.type}`, { current: Model.current });
    if (!this.edit_unique) {
      await Http.fetch({ url: `/edit/${this.type.toKeyString()}/${this.uid}`, target: `new_modal:EditModel` });
    } else {
      await this.edit_unique();
    }
    Models[this.type.toKeyString()].editing = this;

    let form = $('#EditModel'), initial = form.data('initial') || {};
    const values = this.set_attributes(initial);
    Forms.FormEle.simple_fill(form, values);
    log({ form, initial, values, model: this });

  }

  static async settings(options = {}) {
    const { model, selected, table } = options;
    const { uids, names } = table;
    if (uids.length == 1) Model.current.settings();
    else {
      log({ uids });
    }
  }
  static settings_icon(icon_css = { margin: '0.2em', cursor: 'pointer', opacity: 0.6 }) {
    let icon = new Features.Icon({ type: 'gears', size: '1.4' });
    // icon.img.css(icon_css).addOpacityHover();
    return icon.img;
  }
  static async settings_multi(model, uids) {
    try {
      await Http.fetch({
        target: 'new_modal:SettingsModal',
        url: `/settings/${model}/multi`,
        method: 'POST',
        data: { uids }
      })
      let modal = $('#SettingsModal'), header = modal.find('.form_header'), names = ModelList.find(model).names_by_id(uids), form = modal.find('.form');
      log({ modal, header, form });
      let manager = Model.settings_manager_multi;
      header.toggleClass('center left').text('Settings For:').append('<ul>');
      header.find('ul').addClass('text-xlarge-rem').append(names.map(name => `<li>${name}</li>`));
      log({ names: ModelList.find(model).names_by_id(uids) }, "MULTI SETTINGS");
      let kv_display = new Features.KeyValueBox({
        key_class: 'purple',
        transform_fx: Details.model_details_display,
      });
      kv_display.ele.addClass('settings');
      let confirmation = confirm({
        header: `Caution: Editing multiple ${Table.CurrentIndex.header.toLowerCase()}`,
        header_html_tag: 'h1',
        header_class_list: 'pink bold',
        // message: kv_display.ele.addClass('.settings'),
        affirm: _ => manager.autosave.trigger(),
      });
      confirmation.box.add_info(`<h3 class='box pink left'><div>This will overwrite the following settings for:</div><ul>${names.map(name => `<li>${name}</li>`).join('')}</ul><div>Any settings not listed will be unchanged</div>`).add_info(kv_display.ele.addClass('settings'));

      modal.find('.submit.button').getObj().action = _ => {
        // delete manager.settings_obj.display;
        kv_display.reset_all();
        kv_display.new_pairs(manager.settings_obj);
        confirmation.prompt();
      }
      Model.SettingsMulti = { model, header, names, uids, manager, confirmation };
    } catch (error) {
      log({ model, uids, error });
    }
  }
  static async settings_multi_save() {
    let models = {}, info = Model.SettingsMulti, settings = info.manager.settings_obj
    try {
      models = [];
      for (let index in info.uids) {
        models.push({
          uid: info.uids[index],
          type: info.model,
          columns: { settings }
        })
      }

      try {
        console.groupCollapsed('MULTI save');
        log({ models, settings });
        let result = await $.ajax({
          url: `/save/multi`,
          method: 'POST',
          data: { models, wants_checkmark: true, fully_replace: false },
          success: async function (response) {
            if (system.validation.xhr.error.exists(response)) return;
            blurTop('checkmark');
            Http.reload_tab();
            setTimeout(_ => {
              unblurAll(1000);
              // Table.CurrentIndex.suggest_reload();
            }, 2000)
            // log({response});
            // return
            // await Model.save_multi_callback(model_array, response);
            // if (blur_ele) unblur({ele:blur_ele});
            // else unblurAll();
          }
        });
        log({ models, result });
        console.groupEnd();
        return result;
      } catch (error) {
        log({ error });
        return false;
      }
    } catch (error) {
      log({ error, models, info });
    }
  }

  async settings(options = {}) {
    try {
      if (!this.settings_unique) {
        let type = this instanceof User ? this.usertype : this.type;
        await Http.fetch({
          url: `/settings/${type.toKeyString()}/${this.uid}`,
          target: 'new_modal:SettingsModal',
          in_background: options.in_background,
        });
        let model = this, settings_form = $("#SettingsModal").find('.form');
        // log({options,model,settings_form});
        if (settings_form.dne()) {
          $('<h4/>', { text: `${type} settings form not found` }).insertAfter('#Settings');
          throw new Error(`${type} settings form not found`);
          // return;
        }
        if (this.uid == 'proxy') return true;

        this.attr_list.settings = $("#Settings").data('initial');
        let manager_options = {
          obj: this,
          save: this.settings_autosave.bind(this),
          autosave_delay: 5000,
          callback: this.settings_autosave_callback.bind(this),
          form: settings_form,
          autosave_on_form_change: true,
        }.merge(options.settings_manager || {});
        this.settings_manager = new SettingsManager(manager_options, 'edit');
      } else {
        await this.settings_unique(options);
      }
      return true;
    } catch (error) {
      log({ error, options });
      return false;
    }
    // let settings_form = $("#SettingsModal").find('.form');
    // settings_form.getObj('blur').on_undo = _ => {
    //   if (this.settings_manager.has_changed) Http.reload_tab();
    // }
  }
  async settings_autosave() {
    if (this.uid == 'proxy') return;
    let type = this.type, db_settings_obj = {
      uid: this.uid,
      columns: {
        settings: this.settings_manager.settings_obj
      }, wants_checkmark: true
    };
    if (this.type == 'Practice') {
      log({ model: this, db_settings_obj }, 'settings_autosave');
    }
    return $.ajax({
      url: `/save/${type}`,
      method: 'POST',
      data: db_settings_obj,
      success: response => {
        if (system.validation.xhr.error.exists(response.save_result)) return;
        log({ response });
        // return;
        if (this.clear_on_success) {
          let blur_callback = function () {
            if (this.clear_count) unblur({ repeat: clear_count, fade: 400 });
            else unblurAll({ fade: 400 });
          }
          if (this.save_blur) blur(save_blur.ele, 'checkmark', { callback: blur_callback, delay: 500 });
          else blurTop('checkmark', { callback: blur_callback, delay: 500 });
        }
      }
    })
  }
  async settings_autosave_callback() {
    $('#SettingsModal').getObj('blur').on_undo_replace = Http.reload_tab;
  }

  save = async (options = {}) => {
    let type = this.type;
    let proceed = true;
    const { showProgress = true } = options;
    if (this.on_save) {
      proceed = await this.on_save();
    }
    if (!proceed) {
      console.groupEnd();
      return;
    }
    try {
      if (this.valid) {
        this.backup_attr_values(this.backup_attrs);
        const db_obj = this.db_save_obj;

        if (type == 'User') {
          db_obj.uid = this.attr_list.user_id;
          db_obj.usertype = this.usertype;
        }

        const save_blur = this.save_blur || false;
        if (save_blur) blur(save_blur.ele, 'loading', save_blur.options);
        else if (showProgress) blurTop('loading', { color: 'green' });

        console.group(`Save ${this.type}, ${this.name}`, { model: this, db_obj });

        const result = await $.ajax({
          url: `/save/${type}`,
          method: 'POST',
          data: db_obj,
          success: ({ save_result: result }) => {
            log('Save Response', { result });
            const { error, uid, type, details, list, table } = result;
            const index = Table.CurrentIndex;
            if (error) {
              const { header = "Error", message } = error;
              blurError({ header, message });
            } else {
              const listItem = ModelList.find(type, uid);
              this.uid = uid;
              this.details = details;
              log({ details, list, table, type, index });
              if (list && listItem) listItem.define_by(list);

              if (index && index.model === type) {
                log({ table, type, index });
                index.update_or_add_row(table).click();
              }
              if (this.save_callback) this.save_callback(result);
              if (showProgress) Features.Blur.Checkmark();
            }
            console.groupEnd();
          }
        })
        return result;
      } else throw new Error(`Invalid ${type}`);
    } catch (error) {
      // if (showProgress) unblur();
      const { message, responseJSON = {} } = error;
      if (message) Features.Banner.error({ message, inital_state: 'fadein' });
      // else if (responseJSON.message) {

      // }
      log({ error, message, responseJSON, instance: this });
    }
    console.groupEnd();
  }
  delete = async (name = null) => {
    if (!this.delete_unique) {
      let instance = this, callback = this.delete_callback || Http.reload;
      let name = this.attr_list.name || null;
      return new Promise(resolve => {
        confirm({
          header: `Delete ${this.type}${name ? `: '${name}'` : ''}?`,
          message: '<h3 class="pink">This cannot be undone!<br>Are you sure?</h3>',
          yes_text: 'permanently delete',
          no_text: 'cancel',
          immediate: true,
          affirm: async function () {
            blur('body', 'loading', { loading_color: 'var(--green)' });
            let result = $.ajax({
              url: `/delete/${instance.type}/${instance.uid}`,
              method: 'DELETE',
              success: function ({ deleted, error }) {
                if (error) {
                  const { header, message } = error;
                  Features.Banner.error({ header, message });
                } else {
                  Features.Blur.Checkmark();
                  const { uids } = deleted;
                  const index = Table.CurrentIndex;
                  if (index && index.model === instance.type) {
                    index.remove_rows(uids);
                  }
                }
                resolve(true);

                // if (response == 'checkmark') {
                //   blurTop('checkmark', { auto_undoall_timeout: 1000 })
                //   resolve(true);
                // } else resolve(false);
              }
            })
          }
        })

      })
    } else this.delete_unique();
  }
  static async delete(options = {}) {
    // log({ ev, data });
    const { model, selected, table } = options;
    const { uids, names } = table;
    const underline = (text) => `<u>${text}</u>`;
    confirm({
      header: `Delete ${names.smartJoin({ map: underline })}?`,
      message: '<h3 class="pink">This cannot be undone!<br>Are you sure?</h3>',
      yes_text: 'permanently delete',
      no_text: 'cancel',
      immediate: true,
      affirm: async function () {
        blur('body', 'loading', { loading_color: 'var(--green)' });
        const response = await $.ajax({
          url: `/delete/${model}`,
          method: 'POST',
          data: { uids },
          success: ({ deleted, error }) => {
            if (error) {
              const { header, message } = error;
              Features.Banner.error({ header, message });
            } else {
              Features.Blur.Checkmark();
              const { uids } = deleted;
              const index = Table.CurrentIndex;
              // log(`Deleted ${uids}`, { index, uids });
              if (index && index.model === model) {
                index.remove_rows(uids);
              }
            }
          }
        })
        // if (response === 'checkmark') {
        //   blurTop('checkmark', { auto_undoall_timeout: 1000 })
        // } else log({ error: response });
      }
    })


    // Model.current.delete()
  }

  get db_save_obj() {
    try {
      let model = this, columns = {}, relationships = {}, uid = this.save_uid || this.uid || this.attr_list.uid || null;
      const { attr_list } = this;
      if (!this.db_columns) throw new Error(`db_columns not defined for ${this.type}`);
      this.db_columns.forEach(column => {
        if (typeof model.attr_list[column] !== 'undefined') {
          let attr = model.attr_list[column];
          if (attr instanceof LUX) {
            // const dateColumns = ['datetime', 'date_time', 'signed_at'];
            // if (column.includes('datetime') || column.includes('date_time')) attr = attr.datetime_db;
            // if (dateColumns.find(d => column.includes(d))) attr = attr.datetime_db;
            attr = attr.datetime_db;
          }
          columns[column] = attr;
        }
      });
      if (this.db_relationships) {
        for (let model in this.db_relationships) {
          if (this.attr_list[model]) relationships[model] = { uids: this.attr_list[model], method: this.db_relationships[model] }
        }
      }
      return { uid, columns, relationships };

    } catch (error) {
      Features.Banner.error(error.message);
    }
  }
  dont_save(attrs) {
    let list = this.attrs_not_to_save || [];
    if (typeof attrs == 'string') list.push(attrs);
    else if (attrs.is_array()) list = [...list, ...attrs];
    this.attrs_not_to_save = list;
  }

  get Form() {
    const form = $(`#${this.type}`).closest('.form');
    if (form.dne()) throw new Error(`${this.type} Form not found`);
    return form;
  }
  static FormOpen(options = {}) {
    let { instance, data, model, type, fill = {} } = options;
    try {
      if (data && data.model) type = data.model;
      if (model) type = model;

      const form = instance ? instance.Form : $(`#${type}`);
      if (instance) {
        Model.IsEditing(instance);
        fill.merge(instance.form_values);
      } else {
        Model.IsCreating(type);
        Features.Toggle.get_all_within(form).forEach(t => t.reset_messages());
      }
      Forms.FormEle.simple_fill(form, fill);
      blurTop(form);
    } catch (error) {
      log({ error, options, type });
    }
  }

  static IsEditing(instance, options = {}) {
    try {
      const form = instance.Form;
      // log({ instance, form });
      const header = form.find('h1').first(), button = form.find('.button.submit.model');
      const { headerText = instance.name, buttonText = instance.submitButtonText || 'save changes' } = options;
      header.text(headerText);
      button.text(buttonText).removeClass('create').addClass('edit');
      Models[instance.type.toKeyString()].editing = instance;
    } catch (error) {
      log({ error, instance });
    }
  }
  static IsCreating(type, options = {}) {
    try {
      const form = $(`#${type}`);
      const header = form.find('h1').first(), button = form.find('.button.submit.model');
      const { headerText = `New ${type}`, buttonText = `create ${type}` } = options;
      header.text(headerText);
      button.text(buttonText).removeClass('edit').addClass('create');
      Models[type].editing = null;
    } catch (error) {
      log({ error, type });
    }
  }


  static popup_links(model) {
    let unique = Models[model].popup_links_unique;
    return unique ? unique() : [];
  }

  static names(model, uids) {
    try {
      let list = Model.list(model);
      if (!list) throw new Error('list not loaded');
      if (!uids.is_array()) uids = [uids];
      return uids.map(uid => list.find(m => m.uid == uid).name);
    } catch (error) {
      log({ error, model, uids });
      return [];
    }
  }


  static async save_multi_callback(model_arr, data_arr) {
    model_arr.forEach((model, m) => {
      log({ model, data: data_arr[m] });
      if (model.save_callback && !system.validation.xhr.error.exists(data_arr[m])) model.save_callback(data_arr[m], true);
    })
  }
  static async save_multi(model_array, options = {}) {
    let db_array = model_array.map(model => {
      return model.db_save_obj.merge({ type: model.type });
    }), blur_ele = options.blur_ele || null, loading_color = options.loading_color || 'var(--darkgray97)';
    if (blur_ele) blur(blur_ele, 'loading', { loading_color });
    else blurTop('loading', { loading_color });
    let data = { models: db_array };
    log({ data, model_array, options }, 'save MULTI');
    if (options.wants_checkmark) data.merge({ wants_checkmark: true });
    try {
      console.groupCollapsed('MULTI save');
      let result = await $.ajax({
        url: `/save/multi`,
        method: 'POST',
        data: data,
        success: async function (response) {
          if (system.validation.xhr.error.exists(response)) return;
          await Model.save_multi_callback(model_array, response);
          if (blur_ele) unblur({ ele: blur_ele });
          else unblurAll();
        }
      });
      log({ model_array, result });
      console.groupEnd();
      return result;
    } catch (error) {
      log({ error });
      return false;
    }
  }
  static async retrieve(attrs, type, options = {}) {
    let instance = await $.ajax({
      url: `/retrieve/${type}`,
      method: 'POST',
      data: { attrs }.merge(options),
      success: function (response) {
        if (system.validation.xhr.error.exists(response)) return null;
        return response;
      }
    })
    return instance;
  }
  static async create_or_edit(options = {}) {
    try {
      let { where, type, data = {} } = options;
      data = { ...data, where };
      await Http.fetch({
        url: `/create_or_edit/${type}`,
        target: `new_modal:${type}`,
        method: "POST",
        data
      });
      let modal = $(`#${type}`), attr_list = modal.exists() ? modal.data('initial') || {} : {};
      if (modal.find('#ModelId').exists()) attr_list.id = modal.find('#ModelId').data('id');
      const Type = Models[type];
      const { id: uid = null } = attr_list;
      log({ attr_list });
      // const instance = Model.find_or_create(type, uid, attr_list);
      const instance = Model.current = Type.current = Type.editing = Model.find_or_create(type, uid, attr_list);
      Model.IsEditing(instance);
      if (Type.autosave) Type.autosave(instance);
    } catch (error) {
      log({ error, options });
    }
  }
}

class ModelList {
  constructor(options = {}) {
    this.define_by(options);
    try {
      ModelList.all[this.model] = this;
      if (typeof this.list === 'string') this.list = JSON.parse(this.list);
    } catch (error) {
      log({ error, options, list: this.list, instance: this });
    }
  }
  find(options = {}) {
    try {
      return this.list.find(m => {
        for (let attr in options) { if (m[attr] != options[attr]) return false; }
        return true;
      });
    } catch (error) {
      log({ error, options });
    }
  }
  filter(options = {}) {
    try {
      return this.list.filter(m => {
        for (let attr in options) {
          let search_val = options[attr];
          search_val.is_array() ? search_val : [search_val];
          if (!search_val.includes(m[attr])) return false;
        }
        return true;
      });
    } catch (error) {
      log({ error, options, instance: this });
    }
  }
  get names() {
    return this.list.map(m => m.name);
  }
  names_by_id(ids = []) { return this.filter({ uid: ids.map(id => Number(id)) }).map(m => m.name); }
  static set(model, list) { new ModelList({ model, list }) }
  static async get(model, obj_waiting = null) {
    if (model.is_array()) {
      await Promise.all(model.map(m => ModelList.get(m, obj_waiting)));
      let obj = {};
      model.forEach(m => obj[m] = ModelList.find(m));
      return obj;
    }
    if (obj_waiting) obj_waiting.waiting_for_list = true;

    model = model.toKeyString();
    let list_obj = ModelList.find(model);
    if (!list_obj) ModelList.add_to_pending(model);
    else return list_obj;

    if (obj_waiting && obj_waiting.ele) {
      obj_waiting.ele.initial_opacity = obj_waiting.ele.css('opacity');
      obj_waiting.ele.css({ opacity: 0.2 });
    }
    return new Promise((resolve, reject) => {
      let waiting = setInterval(_ => {
        list_obj = ModelList.find(model);
        try {
          if (list_obj) {
            clearInterval(waiting);
            if (obj_waiting) obj_waiting.waiting_for_list = false;
            if (obj_waiting && obj_waiting.ele) obj_waiting.ele.css({ opacity: obj_waiting.ele.initial_opacity });
            if (list_obj.list[0].name == 'enable TableAccess') log({ error: new Error(`enable TableAccess for ${model}`) });
            resolve(list_obj);
          }
        } catch (error) {
          log({ error, model, list_obj });
        }
      }, 50);
    });
  }
  static get all() { return ModelList.master === undefined ? ModelList.master = {} : ModelList.master }
  static find(model, uid = null) {
    try {
      let attr = null, split = model.split('.');
      if (split.notSolo()) { model = split[0]; attr = split.slice(1).join('.') }
      const list = ModelList.all[model];
      if (!list) return;
      const instance = uid ? list.find({ uid }) : null;
      return !instance ? list : !attr ? instance : instance.dot_notation_get(attr);
    } catch (error) {
      log({ error, model, uid });
    }
  }
  static get pending() {
    return ModelList.pending_array === undefined ? ModelList.pending_array = [] : ModelList.pending_array
  }
  static add_to_pending(model) {

    if (model.includes('_')) {
      throw new Error(`model must be title case`);
    }
    ModelList.pending.smartPush(model);
    ModelList.retrieve_trigger();
  }
  static retrieve_trigger() {
    clearTimeout(this.retrieve_timer);
    this.retrieve_timer = setTimeout(ModelList.retrieve, 200);
  }
  static async retrieve() {
    let response = await $.ajax({
      url: `/retrieve/list`,
      method: 'POST',
      data: { models: ModelList.pending },
    });
    ModelList.pending.forEach(model => {
      const { list, plural } = response[model];
      if (list.error) {
        const { message = 'Error retrieving list' } = list.error;
        Features.Banner.error(message);
        log({ error: list.error });
      }
      new ModelList({ model, list: response[model].list, plural: response[model].plural })
    });
    ModelList.pending_array = [];
    // log({all:ModelList.all,pending:ModelList.pending},'LISTS');
  }
}
class SettingsManager {
  constructor(options, mode = 'display') {
    try {
      this.define_by(options);
      if (!this.obj) throw new Error('must supply an object');
      this.mode = this.mode || mode;

      if (this.obj instanceof Model) {
        if (!this.obj.attr_list.settings) this.obj.attr_list.settings = {};
        this.settings_obj = this.obj.attr_list.settings;
        // log(this, `new SETTINGS MANAGER ${this.obj.type}:${this.obj.uid}`);

      } else {
        if (!this.obj.settings) this.obj.settings = {};
        this.settings_obj = this.obj.settings;
      }
      // if (this.obj instanceof Forms.FormEle) log(this, `new SETTINGS MANAGER FormEle`);
      if (this.initial_override) this.settings_obj.merge(this.initial_override);
      else if (this.initial_override === null) this.settings_obj = {};
      SettingsManager.convert_obj_values_to_bool(this.settings_obj);
      if (this.mode == 'edit' && this.form) {
        this.form_ele = this.form;
      }
      if (!this.autosave && this.mode == 'edit') {
        if (!this.save || typeof this.save != 'function') throw new Error('Must supply a save function for Autosave');
        if (this.callback && typeof this.callback != 'function') throw new Error('Invalid callback function for Autosave');
        let settings_manager = this;
        this.autosave = new Features.Autosave({
          show_status: true,
          delay: this.autosave_delay || this.delay || 5000,
          send: function () {
            settings_manager.has_changes = false;
            return settings_manager.save();
          },
          message: 'Settings saved',
          callback: settings_manager.callback,
          obj: this.obj,
        })
      }
      this.obj.settings_apply = _ => { this.apply() }
      this.obj.get_setting = this.get_setting.bind(this);
      this.obj.set_setting = this.set_setting.bind(this);
      this.obj.delete_setting = this.delete_setting.bind(this);
      this.obj.settings_obj = this.settings_obj;
    } catch (error) {
      log({ error, options, mode });
    }
  }
  set form_ele(ele) {
    try {
      let settings_manager = this;
      if (ele.dne()) throw new Error('settings form ele dne');
      if (!ele.is('.form')) throw new Error('settings form is not .form');
      console.log("SETTING FORMELE FOR AUTOSAVE", { settings_manager, ele });
      this.form = { ele: ele, obj: ele.getObj() }
      this.form_fill();
      this.autosave_on_form_change = ifu(this.autosave_on_form_change, true);
      let answers = Forms.Answer.get_all_within(this.form.ele, false);
      answers.forEach(answer => {
        answer.options.after_change_action = settings_manager.update.bind(settings_manager, answer, true);
      });
    } catch (error) {
      log({ error, ele });
    }
  }
  get_setting(nested_dot, default_value = null) {
    try {
      if (nested_dot == 'settings') return this.settings_obj;
      let value = this.settings_obj.dot_notation_get(nested_dot);
      if (typeof value == 'undefined' && typeof default_value != 'undefined') return default_value;
      return typeof value == 'string' ? value.toBool() : value;
    } catch (error) {
      log({ error, nested_dot, default_value });
      return default_value;
    }
  }
  set_setting(nested_dot, value) {
    return this.settings_obj.dot_notation_set(nested_dot, value);
  }
  delete_setting(parent_nested_dot, setting_name = null, asterisk = true) {
    try {
      if (parent_nested_dot === '') {
        delete this.settings_obj[setting_name];
        if (asterisk) delete this.settings_obj[`${setting_name}*`];
        return;
      } else if (!setting_name) {
        delete this.settings_obj[parent_nested_dot];
        if (asterisk) delete this.settings_obj[`${parent_nested_dot}*`];
        return;
      }
      let parent = this.get_setting(parent_nested_dot);
      if (!parent) return;
      delete parent[setting_name];
      if (asterisk) delete parent[`${setting_name}*`];
      if (Object.keys(parent).length === 0) {
        let array = parent_nested_dot.split('.');
        let name = array.pop();
        // log({array,name});
        this.delete_setting(array.join('.'), name);
      }
    } catch (error) {
      log({ error, parent_nested_dot, setting_name });
    }
  }
  apply() {

    let display = this.get_setting('display');

    if (display && this.obj.ele) {
      let display_bools = display.dot_notation_flatten('_');
      for (let class_name in display_bools) {
        if (!display_bools.hasOwnProperty(class_name)) continue;
        const value = display_bools[class_name];
        const name = typeof value === 'boolean' ? class_name : `${class_name}_${value}`;
        if (value) this.obj.ele.addClass(name);
        else this.obj.ele.removeClass(name);
      }
    }
  }
  update(answer) {
    let value = undefined;
    try {
      let setting_name = answer.setting_name, dot_array = [];
      if (!setting_name) throw new Error(`answer.setting_name not defined for ${this.obj.constructor.name}`);
      let nested = answer.ele.parents('.item').length != 1;
      let section = answer.ele.getObj('section');
      if (section) dot_array.smartPush(section.name.replace(/\./g, ''));
      this.has_changes = true;
      value = answer.get();
      let item = answer.item;
      let limit_1 = answer.options.listLimit == 1, use_prelabel = answer.options.usePreLabel, is_bool = answer.settings.save_as_bool || (item && item.settings.save_as_bool), in_item = answer.item;
      // if (limit_1 && ( (use_prelabel && !in_item) || (in_item && answer.type == 'list'))) { 
      //   for (let key in value) { value = value[key]; } 
      // };
      dot_array.push(setting_name);
      if (dot_array[0] == 'settings') dot_array.shift();
      log(`SETTING ${setting_name}`, { value, settings: this.settings_obj, obj: this.obj });

      let is_linked = answer.options.autofill_model || null, is_number = answer.type == 'number', is_address = answer.type == 'address', adjusted = value;
      if (is_linked || is_number || is_address) {
        if (value === null) this.delete_setting('DisplayValues', setting_name);
        else {
          if (is_linked) {
            adjusted = ModelList.find(is_linked).names_by_id(value).smartJoin();
          } else if (is_number) {
            if (answer.options.preLabel) adjusted = `${answer.options.preLabel} ${value}`;
            if (answer.options.units) adjusted += ` ${answer.options.units}`;
          } else if (is_address) {
            adjusted = answer.parse(value).map(line => `<div>${line}</div>`).join('');
          }
          this.set_setting(`DisplayValues.${setting_name}`, adjusted);
        }
      }

      if (value === null || (setting_name == 'system' && value === false)) {
        let name = dot_array.pop();
        this.delete_setting(dot_array.join('.'), name);
      } else {
        let full_dot = dot_array.join(".");
        let result = this.set_setting(full_dot, value);
        if (result instanceof Error) log({ error: result, answer });
        if (in_item && item.is_followup && this.obj.uid === 'proxy') {
          let cond = item.options.condition, str = item.condition_str;
          item = item.ele.getObj('item', true, false);
          let key = `${section.name.toKeyString()}.${item.text_key}`;
          this.set_setting(`autofill.condition.${setting_name}`, { key, condition: cond, condition_str: str });
        }
      }
      // log({this:this,on_change: this.autosave_on_form_change});
      if (this.obj.settings_apply) this.obj.settings_apply(400);
      if (this.autosave_on_form_change && !answer.ele.isInside('.settings_popup')) this.autosave.trigger();
      if (this.update_callback) this.update_callback({ answer, key: setting_name, value });
      return value;
    } catch (error) {
      log({ error, answer, value });
    }
  }
  popup_create(options = {}) {
    let header = options.header || '',
      header_html_tag = options.header_html_tag || 'h3',
      header_ele = header instanceof jQuery ? header : $(`<${header_html_tag}>${header}</${header_html_tag}>`);
    let update = this.update.bind(this), manager = this;
    // let icon = Model.settings_icon(), 
    let icon = new Features.Icon({ type: 'gears', size: 1.4 }),
      tooltip = new Features.ToolTip({
        target: icon.img,
        color: 'yellow',
        class: 'flexbox column settings_popup',
        message: header_ele,
        match_target_color: false,
        click_toggle: true,
      });
    let update_active = _ => {
      if (Forms.Answer.get_all_within(tooltip.ele, false).some(a => a.get() !== null)) icon.img.addClass('active').removeClass('inactive');
      else icon.img.removeClass('active').addClass('inactive');
      // if (tooltip.ele.find('.active').exists()) icon.img.addClass('active').removeClass('inactive');
      // else icon.img.removeClass('active').addClass('inactive');
      tooltip.reposition_triangle();
    }
    let add = function (input) {
      let name = input.name;
      if (!input.setting_name) {
        if (!name) throw new Error('cannot add setting without input.name');
        input.setting_name = name;
      }
      let existing = ifn(manager.get_setting(input.setting_name), input.default, null);
      let initial = typeof existing === 'object' ? SettingsManager.obj_to_bool_array(existing) : existing;
      input.merge({
        options: {
          on_change_action: ans => {
            update(ans);
            update_active();
            if (ans.update_callback) ans.update_callback.to_fx.bind(ans)();
          }
        }, initial, settings: { save_as_bool: true }
      });
      let answer = new Forms.Answer(input);
      if (answer.update_callback) answer.update_callback.to_fx.bind(answer)();
      tooltip.message_append(answer.ele);
      // tooltip.message_append(answer.ele.addClass('flexbox left').css({width:'auto'}).wrap(`<div class='flexbox'></div>`));        
      update_active();
      return answer;
    };

    if (!this.obj.is_multi) tooltip.on_hide = _ => { if (this.has_changes) this.autosave.trigger() };
    return { icon: icon.img, tooltip, add };
  }
  async form_fill() {
    let m = this, form = this.form.obj;
    if (!form) return false;
    await new Promise(resolve => {
      m.waiting = setInterval(function () { if (form.waiting == null) { clearInterval(m.waiting); resolve(true); } }, 200)
    })
    let answers = Forms.Answer.get_all_within(this.form.ele, false), find = function (name) {
      return Forms.Answer.find(answers, { name });
    }, fill_with = obj => {
      for (let key in obj) {
        if (['autofill', 'ExactMatch', 'DisplayValues'].includes(key)) continue;
        let value = obj[key], answer = find(key);
        if (answer) {
          if (typeof value == 'object' && !value.is_array() && !['address', 'signature'].includes(answer.type)) value = SettingsManager.obj_to_bool_array(value);
          answer.value = value;
        } else if (value != null && typeof value == 'object' && !value.is_array()) fill_with(value);
      }
    }
    fill_with(this.settings_obj);

    return true;
  }
  static autofill_filter(list, autofill_settings) {
    let autofill_dot = autofill_settings.dot_notation_flatten();
    // log({ list, autofill_settings, autofill_dot });
    return list.filter(item => {
      const item_dot = item.settings.dot_notation_flatten();
      for (const setting_name in autofill_dot) {
        const value = autofill_dot[setting_name];
        // log({ text: setting_name });
        const match = SettingsManager.matches(value, item_dot[setting_name]);
        if (!match) return false;
      }
      return true;
    })

  }
  static matches(valueToMatch, testValue) {
    if (!testValue) return;
    const [v1, v2] = [valueToMatch, testValue].map(v => v.toBool());
    const t1 = typeof v1, t2 = typeof v2;
    // console.log(valueToMatch, testValue, v1, v2, t1, t2);
    if (t1 === 'object' && v1.is_array()) {
      if (!v2.is_array()) return false;
      if (!v1.every(v => v2.includes(v))) return false;
      if (!v2.every(v => v1.includes(v))) return false;
      return true;
    }
    // log({ v1, v2 });
    return v1 === v2;
  }
  // static obj_to_dot_notation (obj) {

  // }
  static obj_to_bool_array(obj, include_keyed_asterisk_false = false) {
    let array = [];
    try {
      for (let key in obj) {
        if (obj[key] === null) continue;
        if (obj[key].toBool() === true) array.push(key.addSpacesToKeyString());
        else if (include_keyed_asterisk_false && obj[key].toBool() === false && key.includes('*')) array.push(key.addSpacesToKeyString());
      }
    } catch (error) {
      log({ error, obj });
    }
    return array;
  }
  static convert_obj_values_to_bool(obj) {
    try {
      for (let attr in obj) {
        let type = typeof obj[attr];
        if (type == 'string') obj[attr] = obj[attr].toBool();
        else if (type == 'object' && !attr.is_array()) SettingsManager.convert_obj_values_to_bool(obj[attr]);
      }
    } catch (error) {
      log({ error, obj });
    }
    return obj;
  }
  static convert_obj_bools_to_array(obj, asterisk) {
    let dummy = {}.merge(obj);
    try {
      for (let attr in dummy) {
        let type = typeof dummy[attr];
        if (type == 'string') dummy[attr] = dummy[attr];
        else if (type == 'object' && !attr.is_array()) dummy[attr] = SettingsManager.obj_to_bool_array(dummy[attr], asterisk);
      }
    } catch (error) {
      log({ error, dummy, obj });
    }
    return dummy;
  }
  // static compare_settings (options = {}) {
  //   log({options},`COMPARE SETTINGS`);
  //   let matched = true;
  //   // let match_me = options.match_me || {}, match_to = options.match_to || {};
  //   // let compare = (setting, compare_to) => {
  //   //   let type = typeof compare_to, is_object = type == 'object', array = is_object ? setting.is_array() : false;
  //   //   let response = {};
  //   //   if (array) {
  //   //     response.merge({
  //   //       strict: compare_to.every(v => setting.includes(v)), 
  //   //       loose: compare_to.some(v => setting.includes(v))
  //   //     });
  //   //   } else if (is_object) {
  //   //     log({setting,type,is_object,array, error: new Error(`TYPE ${type}`)});        

  //   //   } else if (type == 'boolean') {
  //   //     let match = setting.toBool() === compare_to;
  //   //     response.merge({strict: match, loose: match});
  //   //   } else {
  //   //     log({setting,type,is_object,array, error: new Error('type not found')});
  //   //     // response.merge({strict: false})
  //   //   }
  //   //   return response;
  //   // };

  //   // let matched = true;
  //   // for (let section_name in match_to) {
  //   //   if (!['Conditions','ExactMatch','DisplayValues'].includes(section_name)) {
  //   //     let section_to = match_to[section_name], section_me = match_me.dot_notation_get(section_name);
  //   //     log({section_name,section_to,section_me},`SECTION ${section_name}`);

  //   //     if (section_me == undefined) return false;
  //   //     for (let setting_name in section_to) {
  //   //       let setting_to = section_to[setting_name], setting_me = section_me.dot_notation_get(setting_name);
  //   //       let cond_info = match_to.dot_notation_get(`Conditions.${setting_name}`), exact = match_to.dot_notation_get(`ExactMatch.${setting_name}`);
  //   //       if (cond_info) {
  //   //         let value = match_me.dot_notation_get(cond_info.key);
  //   //         let condition_match = Forms.Answer.condition_matches_parent(value,cond_info.condition);
  //   //         // log({cond_info,value,condition_match},`${condition_match?`COMPARE`:`IGNORE`} ${setting_name}`);
  //   //         if (!condition_match) continue;
  //   //       }
  //   //       if (setting_me == undefined) return false;
  //   //       let comparison = compare(setting_me, setting_to);
  //   //       log({comparison},`${section_name}`);
  //   //       if (typeof exact != 'undefined') {
  //   //         log({setting_to,setting_me,exact},`${exact?'EXACT':'LOOSE'} ${setting_name}`);
  //   //         if (exact && !comparison.exact) return false;
  //   //         else if (!comparison.loose) return false;
  //   //       } else {
  //   //         log({setting_to,setting_me,exact},`single ${setting_name}`);
  //   //         if (!comparison.exact) return false;
  //   //       }
  //   //       // log({setting_to,setting_me},`${setting_name}`);
  //   //     }
  //   //   }
  //   // }
  //   return matched;
  // }
}

class Practice extends Model {
  constructor(attr_list) {
    super(attr_list, 'Practice');
  }
  async schedule_edit() {
    await Http.fetch({ url: `/schedule/Practice/${this.uid}`, target: 'new_modal:EditSchedule' });
  }
  async schedule_save() {
    this.schedule.add_response();
  }
}
class User extends Model {
  db_columns = ['first_name', 'middle_name', 'last_name', 'preferred_name', 'phone', 'email', 'username', 'address_mailing', 'address_billing', 'date_of_birth'];
  backup_attrs = ['username:email'];

  constructor(attr_list) {
    super(attr_list, 'User');
    this.backup_attr_values(this.backup_attrs);
    // this.usertype = type;
    // if (!this.attr_list.roles) this.attr_list.roles = { list: [type], default: null };
    // this.save_uid = this.user_id;
  }

  static IsPatient() { return User.Auth.get_attribute('role', 'patient') }

  get is_superuser() { return this.attr_list.is_superuser || false }
  get is_admin() { return this.attr_list.is_admin || false }
  async delete_unique() {
    // log({ this: this });
    let instance = this;
    confirm({
      header: `Delete ${this.attr_list.model}: ${this.attr_list.name}?`,
      message: '<h3 class="pink">This cannot be undone!<br>Are you sure?</h3>',
      yes_text: 'permanently delete',
      no_text: 'cancel',
      affirm: async function () {
        blur('body', 'loading');
        let result = await $.ajax({
          url: '/delete/' + instance.attr_list.model + '/' + instance.uid,
          method: 'DELETE',
        })
        if (result == 'checkmark') {
          blurTop('checkmark', {
            callback: function () { unblurAll({ callback: Http.reload }) },
            delay: 500
          });
        }
      }
    })
  }
  async edit_unique() {
    const type = this.usertype.toKeyString();
    return Http.fetch({ url: `/edit/${type}/${this.uid}`, target: `new_modal:EditModel` });
  }

  async roles_edit() { log("EDITING") }
  async roles_save() { }

  async schedule_edit() {
    let UserType = this.usertype.toKeyString(), user = this;
    await Http.fetch({ url: `/schedule/${UserType}/${this.uid}`, target: 'new_modal:EditSchedule' });
    // let calendar = $('#EditSchedule').find('.calendar').getObj();
    // let schedule = $('#EditSchedule').find('.schedule').getObj();
    // init('.calendar.schedule',function(){
    //   user.schedule = new Schedule({ele:$(this),model:UserType,uid:user.uid});
    // })
  }

  async schedule_save() {
    this.schedule.add_response();
    // if (this.schedule.add_response()) {
    //   this.schedule.save(this.usertype.toKeyString(), this.uid);
    // }
  }
}
class Patient extends User {
  usertype = 'patient';
  constructor(attr_list = null) {
    let attrs = attr_list || Model.construct_from_form('#Patient');
    super(attrs, 'patient');
  }
}
class Practitioner extends User {
  usertype = 'practitioner';
  constructor(attr_list = null) {
    let attrs = attr_list || Model.construct_from_form('#Practitioner');
    super(attrs, 'practitioner');
  }
}
class StaffMember extends User {
  usertype = 'staffMember';
  constructor(attr_list = null) {
    let attrs = attr_list || Model.construct_from_form('#StaffMember');
    super(attrs, 'staff member');
  }
}

class Calendar {
  constructor(ele = null) {
    this.ele = $(ele);
    if (this.ele.dne()) throw new Error('Calendar requires an element');
    this.ele.data('class_obj', this);
    this.options = this.ele.data();
    this.form = this.options.form ? $(this.options.form) : null;
    this.form_obj = this.form ? this.form.find('.form').getObj() : null;
    let schedule_eles = this.ele.find('.schedule'), schedules = [];
    schedule_eles.each((s, schedule) => {
      let obj = new Schedule(schedule, s, this.ele);
      log({ scheduleNode: schedule, schedule: obj });
      schedules.push(obj);
      obj.calendar = this;
    })
    this.schedules = schedules;
    let calendar = this, fullcal_options = {
      plugins: [dayGridPlugin, listPlugin, timeGridPlugin, interactionPlugin, rrulePlugin, luxonPlugin],
      timeZone: tz,
      headerToolbar: {
        left: "title",
        center: "",
        right: "prev,today,next dayGridMonth,timeGridWeek,timeGridDay listWeek",
      },
      height: 'auto',
      initialView: "listWeek",
      slotMinTime: '08:00:00',
      slotMaxTime: '20:00:00',
      editable: true,
      eventDrop: async function (info) {
        let result = await calendar.event_drop(info);
        log({ result }, 'dropping event');
        if (!result) info.revert();
      },
      eventResize: async function (info) {
        let result = await calendar.event_resize(info);
        log({ result }, 'resize result');
        if (result != 'checkmark') info.revert();
      },
      eventClick: function (info) { calendar.event_click(info) },
      dateClick: function (info) { calendar.date_click(info) },
      eventMouseEnter: function (info) { calendar.event_mouseenter(info) },
      eventMouseLeave: function (info) { calendar.event_mouseleave(info) },
      eventDidMount: function (info) { calendar.event_mount(info) },
      eventSources: this.event_sources,
      eventOrder: "displayOrder,start,-duration,allDay,title",
      progressiveEventRendering: true,
    };
    if (this.options.fullcal) fullcal_options.merge(this.options.fullcal);
    this.fullcal = new FullCal(this.ele[0], fullcal_options);
    this.fullcal.render();

    const { form, options, schedule_active } = this;
    log(`New Calendar`, { ele, form, schedules, schedule_active, options });
  }
  get event_list() { return this.events ? this.events : [] }
  get event_sources() {
    let schedule_events = this.schedules.map(schedule => schedule.event_source);
    return schedule_events;
  }
  get schedule_active() { return this.schedules.isSolo() ? this.schedules[0] : this.schedules.find(s => s.active) }
  async event_drop(info) {
    let group_id = info.event.groupId, event_source_id = info.event.source.id, source = this.fullcal.getEventSourceById(event_source_id), schedule = this.find_schedule(event_source_id), response = schedule.response_by_group_id(group_id), delta = info.delta;
    console.groupCollapsed('EVENT DROP');
    log({ info, group_id, event_source_id, schedule, response });
    let result = null;
    if (schedule) {
      schedule.edit_recur = 'all';
      result = await schedule.update_by_delta(response, delta);
    }
    console.groupEnd();
    return result ? !system.validation.xhr.error.exists(result) : false;
  }
  async event_resize(info) {
    let group_id = info.event.groupId, event_source_id = info.event.source.id, source = this.fullcal.getEventSourceById(event_source_id), schedule = this.find_schedule(event_source_id), response = schedule.response_by_group_id(group_id), startDelta = info.startDelta, endDelta = info.endDelta;
    log({ info, group_id, event_source_id, schedule, response }, 'event resize');
    if (schedule) return schedule.update_by_delta(response, { startDelta, endDelta });
    else return false;
  }

  find_schedule(source_id) { return this.schedules.find(s => s.event_source_id == source_id) }
  schedule_by_event(event) {
    let source_id = event.source.id;
    return this.find_schedule(source_id);
  }
  source_by_group_id(group_id) {
    let sources = this.fullcal.getEventSources();
    log({ sources });
  }
  event_eles_by_group_id(group_id) {
    return this.ele.find('.fc-event').filter(`.${group_id}`);
  }

  event_mount(info) {
    let ele = $(info.el);
    ele.data({ class_obj: info.event, start: info.event.start }.merge(info.event.extendedProps));
    info.event.setExtendedProp('ele', ele);
    if (info.isMirror || ele.is('.fc-bg-event')) return;
    if (info.event.extendedProps.description) this.add_tooltip(info);
    if (this.after_next_mount_fx) {
      clearTimeout(this.post_mount);
      this.post_mount = setTimeout(_ => {
        this.after_next_mount_fx();
        this.after_next_mount_fx = null;
      }, 100)
    }
  }
  event_mouseenter(info) {
    if (info.event.display == 'background') return;
    let group_id = info.event.groupId;
    $(info.el).removeClass('bg_flash_pink');
    if (group_id && group_id != '') this.event_eles_by_group_id(group_id).addClass('hover');
  }
  event_mouseleave(info) {
    if (info.event.display == 'background') return;
    let group_id = info.event.groupId, jsEvent = info.jsEvent;
    let target = jsEvent ? $(info.jsEvent.relatedTarget) : null;
    if (target && !target.is('.tooltip') && group_id && group_id != '') this.event_eles_by_group_id(group_id).removeClass('hover');
  }

  event_find(options = {}) {
    try {
      let ele = $('.fc-event').get().find(e => {
        let ev = $(e).data();
        return ev.recurring_id == options.recurring_id && +ev.start == +options.dt;
      });
      return ele ? $(ele) : null;
    } catch (error) {
      log({ error, options });
    }
  }
  event_flash(options = {}) {
    try {
      let ele = options.ele || this.event_find(options);
      if (ele) ele.addClass('bg_flash_pink');
    } catch (error) {
      log({ error, ele })
    }
  }


  event_click(info) {
    log(`event click`, { info });
    let tt = $(info.el).data('tooltip');
    if (tt) tt.toggle();
    else {
      let uid = info.event.extendedProps.uid, schedule = this.schedule_by_event(info.event);
      if (schedule.is_background) return;
      schedule.current = schedule.model ? Model.find(schedule.model, uid) : schedule.find(uid);
      schedule.form_open();
    }
  }
  date_click(info) {
    let schedule = this.schedule_active;
    schedule.current = null;
    schedule.date_click_to_form(info);
  }

  add_tooltip(info) {
    let schedule = this.find_schedule(info.event.source.id);    // let recurring_description = 
    let description = info.event.extendedProps.description;
    let rr_description = schedule.recurring_description(info.event);
    if (rr_description) description.merge({ Recurring: rr_description });
    let message = description.to_key_value_html();
    message.prepend(this.datetime_info(info));
    message.append(schedule.recurring_links(info.event));
    ['Appointment'].filter(m => info.event.classNames.includes(m)).forEach(m => {
      let btn_box = $('<div/>', { class: 'button_box' });
      btn_box.append(Model.find(m, info.event.extendedProps.uid).event_btns);
      message.append(btn_box);
    });
    new Features.ToolTip({
      target: $(info.el),
      message: message,
      color: 'pink',
      shadow: true,
      // match_target_color: true,
    })
  }
  datetime_info(info) {
    let event = info.event, start = LUX.fromISO(event.startStr), end = LUX.fromISO(event.endStr);
    let description = `${start.date} ${start.time} - ${end.time}`;
    return `<div class='datetime'><b>${description}</b></div>`;
  }
}
class Schedule {
  constructor(schedule_ele, cal_index, cal_ele) {
    this.ele = $(schedule_ele);
    this.cal_index = cal_index;
    this.define_by(this.ele.data());
    this.ele.data('class_obj', this);

    this.db_attr = this.db_attr || this.feed_url ? null : 'schedule';

    this.model = ifu(this.model, null);
    this.uid = ifu(this.uid, null);
    // if (model.current) model.current.schedule = this;
    this.responses = ifu(this.responses, null);
    // this.models = ifu(this.models, null);

    this.modal = { id: this.modal, ele: this.modal ? ($(`#${this.modal}`).exists() ? $(`#${this.modal}`) : null) : null };
    this.form = this.modal.ele ? this.modal.ele.find('.form').getObj() : null;
    // this.is_background = this.form === null;
    this.is_background = !this.active;
    this.display = this.display || 'auto';
    // this.loading = (this.feed_url || this.events) ? false : true;
    // this.refresh_events();
    // log({ele:this.ele,schedule:this},`new SCHEDULE`);
  }
  get event_list() { return this.events ? this.events : [] }
  get event_source_id() { return `SCH_${this.cal_index}_${this.model}` }
  get event_source() {
    let id = this.event_source_id;
    let source = { id };
    if (this.feed_url) source.merge({
      url: this.feed_url,
      method: 'POST',
      eventDataTransform: event => {
        event.uid = event.id;
        return this.model_add(event).merge({ schedule: this });
      },
    });
    else source.merge({ events: this.event_list });
    if (this.is_background) source.display = 'background';
    return source;
  }
  // get 
  get models() { return this.model_array == undefined ? this.model_array = [] : this.model_array }
  model_add(event) {
    let model = Model.find_or_create(this.model, event.uid, event);
    let event_obj = model.event_obj;
    if (this.find(event.uid)) return event_obj;
    this.models.push(model);
    this.rrule_check(event_obj);
    return event_obj;
  }
  find(uid) { return (this.responses || this.models).find(x => x.uid == uid) || null }
  date_click_to_form(info) {
    let dt = LUX.From.js(info.date), fill = {};
    if (this.modal.id == 'ScheduleBlock') {
      fill.merge({
        'hours.from': dt.time,
        'hours.to': dt.plus({ hours: 1 }).time,
        'start date': dt.start_of_week.date_num,
        'days of week': dt.weekdayLong,
        'select dates': dt.date_num,
      });
    } else if (this.modal.id == 'Appointment') {
      fill.merge({
        date: dt.date_num,
        time: dt.time,
        SelectDates: dt.date_num,
        SelectWeekDays: dt.weekdayLong,
      })
    }
    this.form_open({ fill });
  }
  source_remove() {
    let source_data = this.event_source, source_id = this.event_source_id,
      event_source = this.calendar.fullcal.getEventSourceById(this.event_source_id);
    event_source.remove();
  }
  source_add() {
    let source_data = this.event_source, source_id = this.event_source_id,
      event_source = this.calendar.fullcal.getEventSourceById(this.event_source_id);
    if (event_source) {
      event_source.remove();
      this.calendar.fullcal.addEventSource(source_data);
    } else {
      log("EVENT SOURCE MISSING?!?!");
    }
    let view = this.calendar.ele.find('.fc-view');
    unblur({ ele: view });
  }
  add_response() {
    if (this.responses === null) this.responses = [];
    let response = this.form.response;
    if (response) {
      if (this.edit) this.replace_response(this.edit, response);
      else this.responses.push(response);
      this.refresh_events();
      unblur();
      this.save();
    }
    return response !== false;
  }

  async delete(response) {
    log({ response });
    if (this.models) {
      let model = this.find(response.uid), index = this.models.indexOf(model);
      // log({models:this.models,model,index},'pre delete');
      if (this.modal.id == 'Appointment') {
        let appt = new Appointment(response),
          delete_result = await appt.delete(``);
        log({ delete_result });
        if (delete_result) {
          this.models.splice(index, 1);
          // log({models:this.models,model,index},'post delete');
          this.refresh_events();
          this.save();
        }
      }
    }
  }
  async replace_response(response_old, response_new) {
    let index = this.responses.indexOf(response_old);
    this.responses.splice(index, 1, response_new);
  }
  async replace_model(model_old, model_new) {
    let index = this.models.indexOf(model_old);
    log({ index, old: model_old.recurrence, new: model_new.recurrence }, "REPLACE!");
    this.models.splice(index, 1, model_new);
  }
  async update_by_delta(response, delta_obj) {
    if (this.modal.id == 'ScheduleBlock') {
      let response_obj = this.response_to_obj(response);
      if (delta_obj.delta) {
        let delta = delta_obj.delta, time_start = response_obj.time_start, time_end = response_obj.time_end;
        if (delta.milliseconds != 0) {
          response.Hours.From.answer = LUX.From.time(response_obj.time_start).plus({ milliseconds: delta.milliseconds }).time;
          response.Hours.To.answer = LUX.From.time(response_obj.time_end).plus({ milliseconds: delta.milliseconds }).time;
        }
        if (delta.days != 0) {
          if (response_obj.dates) {
            response.Days.ApplyTheseHoursTo.items.SelectDates.answer = response_obj.dates.map(date => {
              return LUX.From.date(date).plus({ days: delta.days }).date_num;
            }).join(', ');
          }
          if (response_obj.days) {
            let start = response.Days.ApplyTheseHoursTo.items.StartDate.answer, end = response.Days.ApplyTheseHoursTo.items.EndDateOptional.answer, weekdays = response.Days.ApplyTheseHoursTo.items.SelectDaysOfWeek.answer, weekday_item = this.form.item_search('days of week');
            response.Days.ApplyTheseHoursTo.items.StartDate.answer = LUX.From.date(response_obj.date_start).plus({ days: delta.days }).date_num;
            if (end) response.Days.ApplyTheseHoursTo.items.EndDateOptional.answer = LUX.From.date(response_obj.date_end).plus({ days: delta.days }).date_num;
            response.Days.ApplyTheseHoursTo.items.SelectDaysOfWeek.answer = LUX.Weekdays.shift(weekdays, delta.days);
          }
        }
      }
      if (delta_obj.startDelta) {
        let delta = delta_obj.startDelta, time_start = response_obj.time_start;
        response.Hours.From.answer = LUX.From.time(response_obj.time_start).plus({ milliseconds: delta.milliseconds }).time;
      }
      if (delta_obj.endDelta) {
        let delta = delta_obj.endDelta, time_end = response_obj.time_end;
        response.Hours.To.answer = LUX.From.time(response_obj.time_end).plus({ milliseconds: delta.milliseconds }).time;
      }
      this.refresh_events();
      return this.save();
    } else if (this.modal.id == 'Appointment') {
      log({ response, delta_obj });
      let new_appointment = new Appointment(response);
      new_appointment.update_dtstart(delta_obj);
      new_appointment.update_dtend(delta_obj);
      new_appointment.save_blur = this.save_blur_model;
      this.edit = response;
      log({ response, delta_obj });
      return new_appointment.save();
    }
  }
  response_by_group_id(group_id) {
    try {
      let group = [...group_id.matchAll(/([a-zA-Z]+)(\d+)$/g)][0];
      let response = this[group[1]][group[2]];
      return response ? response : null;
    } catch (error) {
      log({ error, group_id });
      return null;
    }
  }
  form_open(options = {}) {
    if (this.modal.id === 'ScheduleBlock') {
      blurTop(this.modal.ele);
      let json = options.response || options.fill || this.current || null;
      this.edit = options.response ? options.response : null;
      if (this.edit) this.form.fill_by_response(this.edit);
      else if (options.fill) this.form.fill_by_key_value_object(options.fill);
    } else if (this.model) {
      // const { current, model } = this;
      // log({current,model,options});
      if (this.current) this.current.edit();
      else Models[this.model].FormOpen({ ...options, type: this.model });
    }
  }

  exclusion_click(ev, model, date) {
    log({ ev });
  }
  cache_clear(recurring_id) {
    try {
      if (this.upcoming_cache) delete this.upcoming_cache[recurring_id];
      if (this.recent_cache) delete this.recent_cache[recurring_id];
      if (this.rrule_cache) delete this.rrule_cache[recurring_id];
    } catch (error) {
      log({ error });
    }
  }
  get rrule_cache() { return this.rrule_cache_obj == undefined ? this.rrule_cache_obj = {} : this.rrule_cache_obj }
  rrule_check(event) {
    try {
      if (!event.recurring_id) return;
      let rrule = event.rrule, recurring_id = event.recurring_id;
      let master = this.rrule_cache[recurring_id];
      if (!master) this.rrule_cache[recurring_id] = { rrule: rrule, event_uids: [event.uid] };
      else if (master && !master.event_uids.includes(event.uid)) {
        master.rrule = LUX.RRule.Merge([master.rrule, rrule]);
        master.event_uids.push(event.uid);
        this.rrule_cache[recurring_id] = master;
      }

    } catch (error) {
      log({ error, event });
    }
  }

  get upcoming_cache() { return this.upcoming_cache_obj == undefined ? this.upcoming_cache_obj = {} : this.upcoming_cache_obj }
  get recent_cache() { return this.recent_cache_obj == undefined ? this.recent_cache_obj = {} : this.recent_cache_obj }

  date_link(dt, options) {
    let span = $('<span/>', { class: 'date_link link', html: `${dt.date_narrow}` });
    span.on('click', { dt }.merge(options), this.date_link_click.bind(this));
    return span[0];
  }
  date_link_click(ev) {
    let tt = $(ev.target).getObj('tooltip');
    tt.hide();
    let data = ev.data, recurring_id = data.recurring_id, dt = data.dt;
    let cal = this.calendar, ele = cal.event_find(data);
    if (ele) cal.event_flash({ ele });
    else {
      cal.fullcal.gotoDate(dt.toISO());
      cal.after_next_mount_fx = cal.event_flash.bind(cal, data);
    }
    log({ data, ele });
    return;
  }


  response_to_obj(json) {
    let responses = new Forms.SubmissionJson(json), get_response = responses.find.bind(responses), obj = {};
    if (this.modal.id == 'ScheduleBlock') {
      let dates_or_days = get_response('days.apply to'), available = get_response('add availability or block') == 'add availability', services = '';
      obj.merge({ time_start: get_response('hours.from'), time_end: get_response('hours.to') });
      if (available) {
        services = get_response('available services') == 'all services' ? 'All Services' : get_response('select services').smartJoin();
        obj.class_list = 'open';
        obj.title = `Available - ${services}`;
        obj.displayOrder = services == 'All Services' ? 0 : 1;
      } else {
        obj.class_list = 'blocked';
        obj.title = 'Blocked';
        obj.displayOrder = 99;
      }
      if (dates_or_days == 'specific dates') obj.dates = get_response('select dates').split(', ');
      else {
        obj.days = get_response('days of week');
        obj.interval = get_response('how often');
        obj.date_start = get_response('start date');
        obj.date_end = get_response('end date');
      }
    } else if (this.modal.id == 'Appointment') {

    }
    return obj;
  }
  form_responses_to_events(responses) {
    let events = [], source_id = this.event_source_id, schedule = this, display = this.display;
    responses.forEach((response, r) => {
      let obj = schedule.response_to_obj(response);
      let group_id = `${source_id}_responses${r}`, description = {};
      // log({obj});
      try {
        if (obj.dates) {
          if (obj.dates.notSolo()) description['Linked Dates'] = obj.dates.join(', ');
          obj.dates.forEach(date => {
            let start = LUX.From.datetime(date, obj.time_start), end = LUX.From.datetime(date, obj.time_end);
            events.push({
              title: display == 'background' ? '' : obj.title,
              classNames: `${obj.class_list} ${group_id}`,
              start: start.toISO(),
              end: end.toISO(),
              groupId: group_id,
              description,
              displayOrder: obj.displayOrder ? obj.displayOrder : 0,
              display,
            })
          })
        } else {
          let start = LUX.From.datetime(obj.date_start, obj.time_start),
            end = LUX.From.datetime(obj.date_start, obj.time_end);
          description[`${obj.interval == 1 ? 'Weekly' : `Every ${obj.interval} Weeks`}`] = obj.days.join(', ');
          description.merge({ Starting: obj.date_start, Ending: obj.date_end ? obj.date_end : 'never' });
          let rrule = {
            freq: RRule.WEEKLY,
            interval: obj.interval,
            dtstart: start.toISO(),
            byweekday: obj.days.map(day => RRule[day.substring(0, 2).toUpperCase()])
          }, duration = end.diff(start);
          if (obj.date_end) rrule.until = moment(`${obj.date_end} ${obj.time_end}`, 'MM-DD-YYYY hh:mma');
          events.push({
            title: display == 'background' ? '' : obj.title,
            classNames: `${obj.class_list} ${group_id}`,
            groupId: group_id,
            description,
            displayOrder: obj.displayOrder ? obj.displayOrder : 0,
            duration,
            rrule,
            display,
          })
        }
      } catch (error) {
        log({ error, response, obj });
      }
    });
    this.loading = false;
    return events;
  }
  upcoming_links(options = {}) {
    let upcoming_dts = LUX.RRule.Upcoming({ rrule: options.rrule, limit: options.limit + 1 });
    return upcoming_dts.map(dt => this.date_link(dt, options));
  }
  upcoming_ele(options = {}) {
    let div = $('<div/>', { class: 'upcoming smaller flexbox left' }).append(`<b style='width:5em'>Upcoming:</b>`);
    let limit = options.limit || 3, rrule = options.rrule;
    let links = this.upcoming_links(options);
    options.limit += 3;
    let limit_ele = $('<span/>', { class: 'date_link link pink smaller', text: '...see more' }).on('click', options, ev => {
      let tt = $(ev.target).getObj('tooltip');
      div.replaceWith(this.upcoming_ele(ev.data));
      tt.move();
    })[0];
    div.append(links.smartJoin({ joiner: '', as_array: true, limit, limit_ele }));
    return div;
  }
  recent_links(options = {}) {
    let recent_dts = LUX.RRule.Recent({ rrule: options.rrule, limit: options.limit + 1 });
    return recent_dts.map(dt => this.date_link(dt, options));
  }
  recent_ele(options = {}) {
    let div = $('<div/>', { class: 'recent smaller flexbox left' }).append(`<b style='width:5em'>Recent:</b>`);
    let limit = options.limit || 3, rrule = options.rrule;
    let links = this.recent_links(options);
    options.limit += 3;
    let limit_ele = $('<span/>', { class: 'date_link link pink smaller', text: '...see more' }).on('click', options, ev => {
      let tt = $(ev.target).getObj('tooltip');
      div.replaceWith(this.recent_ele(ev.data));
      log({ tt });
      tt.move();
    })[0];
    div.append(links.smartJoin({ joiner: '', as_array: true, limit, limit_ele }));
    return div;
  }
  recurring_links(event, limit = 3) {
    try {
      let recurring_id = event.recurring_id || event.extendedProps.recurring_id;
      if (!recurring_id) return null;
      let rrule = this.rrule_cache[recurring_id].rrule;
      if (!rrule) return null;
      let upcoming = this.upcoming_ele({ rrule, limit, recurring_id }),
        recent = this.recent_ele({ rrule, limit, recurring_id });
      return [upcoming, recent];
    } catch (error) {
      log({ error, event });
      return null;
    }
  }
  recurring_description(event) {
    try {
      let recurring_id = event.recurring_id || event.extendedProps.recurring_id;
      if (!recurring_id) return null;
      let rrule = this.rrule_cache[recurring_id].rrule;
      if (!rrule) return null;
      return LUX.RRule.toText(rrule);
    } catch (error) {
      log({ error, event });
      return null;
    }
  }


  async save() {
    if (!this.model) { feedback('No Model', 'Cannot save schedule, no instance attached'); return; }
    if (!this.uid) { feedback('No ID', 'Cannot save schedule, no instance attached'); return; }
    if (!this.db_attr) log({ error: new Error('saving with db_attr') });
    console.groupCollapsed('SCHEDULE SAVE');
    let columns = {}, model = this.model, uid = this.uid, view = this.calendar.ele.find('.fc-view');
    columns[this.db_attr] = this.responses || this.models;
    if (columns[this.db_attr].is_array() && columns[this.db_attr].isEmpty()) columns[this.db_attr] = null;
    if (!this.autosave) blur(view, 'loading', { loading_color: 'var(--pink)' });
    let result = $.ajax({
      url: `/save/${model}`,
      method: 'POST',
      data: { uid, columns, wants_checkmark: true },
      success: function (response) {
        if (system.validation.xhr.error.exists(response)) return;
        if (!this.autosave) unblur({ ele: view });
      }
    })
    log({ result, columns, edit: this.edit });
    console.groupEnd();
    return result;
  }
  async refresh_events() {
    // this.loading = true; this.events = [];
    return;
    if (this.feed_url) return;
    // log({models:this.models,responses:this.responses,loading:this.loading});
    this.events = this.form_responses_to_events(this.responses);
    // // else if (this.models) this.events = await this.models_to_events(this.models);
    // else this.loading = false;
    if (this.calendar && this.calendar.fullcal) this.source_add();
  }
}
class Appointment extends Model {
  type = 'Appointment';

  constructor(attr_list = null) {
    attr_list = attr_list || Model.construct_from_form('#Appointment') || {};
    super(attr_list, 'Appointment');

    log(`Appointment`, { model: this, attr_list });
    this.calendar = $('.calendar').getObj();
    this.schedule = this.calendar ? this.calendar.schedules.find(s => s.modal.id == 'Appointment') : null;
  }

  get rrule() { return this.rrule_obj.toString(); }
  get rrule_obj() {
    if (!this.attr_list.recurrence) return null;
    let recur_obj = new Forms.SubmissionJson(this.attr_list.recurrence),
      dates = recur_obj.find('SelectDates'), days = recur_obj.find('SelectWeekDays'),
      until_date = recur_obj.find('EndDateOptional'), rrule_set = new RRuleSet(),
      start = this.start_lux, end = this.end_lux,
      interval = recur_obj.find('HowOften');
    if (!start || !end) {
      log({ start, end, recur_obj, appt: this });
      throw new Error('Insufficient info for dtstart');
    }
    let date = start.date_num, exclusions = this.attr_list.exclusions, time_start = start.time, time_end = end.time;
    try {
      if (dates) {
        if (!dates.is_array()) dates = dates.split(', ');
        dates.smartPush(date);
        let time_start = start.time;
        dates.forEach(date => { rrule_set.rdate(LUX.From.datetime(date, time_start).rrule) });
      } else {
        let jsdate = start.toJSDate(), rrdate = start.rrule;
        let rrule = {
          freq: RRule.WEEKLY,
          interval: interval,
          dtstart: start.rrule,
          byweekday: days.map(day => RRule[day.substring(0, 2).toUpperCase()]),
          tzid: tz
        };
        if (until_date) rrule.until = LUX.From.datetime(until_date, time_end).toUTC().rrule;
        rrule_set.rrule(new RRule(rrule));
      }
      if (exclusions) {
        exclusions.forEach(date => {
          let exdate = LUX.From.datetime(date, time_start).rrule;
          rrule_set.exdate(exdate);
        });
      }
      rrule_set.tzid(tz);
      return rrule_set;
    } catch (error) {
      log({ error, start, attr_list: this.attr_list });
      return null;
    }
  }
  rrule_exclude(date_str) {
    let recur_obj = new Forms.SubmissionJson(this.attr_list.recurrence), dates = recur_obj.find('SelectDates');
    let exclusions = this.attr_list.exclusions || [];
    exclusions.smartPush(date_str);
    if (dates) {
      dates = dates.split(', ');
      let d = dates.indexOf(date_str);
      dates.splice(d, 1);
      recur_obj.set('SelectDates', dates.join(', '))
    }
    this.attr_list.exclusions = exclusions;
  }
  update_dtstart(delta) {
    this.attr_list.date_time_start = this.start_lux.plus(delta);
    if (this.attr_list.recurrence) {
      let recurrence = new Forms.SubmissionJson(this.attr_list.recurrence), dates = recurrence.find('SelectDates'), days = recurrence.find('SelectWeekDays');
      log({ dates, days });
      if (dates) {
        recurrence.set('SelectDates', LUX.DateShift(dates.split(', '), delta.days).join(', '));
      } else if (days) {
        recurrence.set('SelectWeekDays', LUX.Weekdays.shift(days, delta.days));
      }
      this.attr_list.recurrence = recurrence.json;
    }
  }
  update_dtend(delta) {
    log({ delta });
    this.attr_list.date_time_end = this.end_lux.plus(delta);
  }
  get start_lux() {

    let start = this.attr_list.date_time_start || this.attr_list.start;
    if (!start) return null;
    let iso = LUX.fromISO(start), db = LUX.From.db(start);
    return !iso.invalid ? iso : !db.invalid ? db : null;
  }
  get end_lux() {
    let end = this.attr_list.date_time_end || this.attr_list.end;
    if (!end) return null;
    let iso = LUX.fromISO(end), db = LUX.From.db(end);
    return !iso.invalid ? iso : !db.invalid ? db : null;
  }

  get form_values() {
    let values = {};
    try {
      const start = this.start_lux || {};
      values = {
        patient_id: this.attr_list.patient_id,
        practitioner_id: this.attr_list.practitioner_id,
        date: start.date_num,
        time: start.time,
        services: this.attr_list.service_ids,
      };
      let sub_forms = Appointment.sub_forms || {};
      for (let attr in sub_forms) {
        let form_name = sub_forms[attr];
        if (this.attr_list[attr]) values[form_name] = this.attr_list[attr];
      }

    } catch (error) {
      log({ error, values, appointment: this });
    }
    return values;
  }
  static get sub_forms() {
    return { recurrence: 'RecurringAppointment' };
  }

  edit = async () => {
    Model.current = this;
    Appointment.editing = this;
    //   if (this.attr_list.recurrence) {
    //     blurTop('#RecurringOptions');
    //   } else {
    Appointment.EditNonRecurring();
    Model.FormOpen({ instance: this });
    //   }
  }

  static get RecurToggle() { return $('#Appointment').find('#RecurToggle').getObj() }
  static RecurringForm(enable = true, message = null) {
    let toggle = Appointment.RecurToggle;
    if (!toggle) return;
    if (enable) toggle.enable({ message });
    else toggle.disable({ message, color: 'pink' })
  }
  static EditNonRecurring() {
    Appointment.RecurringForm();
    // Model.FormOpen({ instance: this });
  }
  static EditThisOnly() {
    unblur();
    Appointment.RecurringForm(false, `Unavailable When Editing A Single Instance of a Recurring Appointment`);
    Model.FormOpen({ instance: Appointment.current });
    alert('update current date field to match actually clicked date')
    Appointment.EditMode = { recurring: true, edit: 'single' };
  }
  static EditAllFuture() {
    unblur();
    let instance = Appointment.current;
    Model.FormOpen({ instance });
    Appointment.RecurringForm(true, `This will only affect appointments from ${instance.start_lux.date_num} onward`);
    alert('update current date field to match actually clicked date')
    Appointment.EditMode = { recurring: true, edit: 'future' };
  }

  static async update_duration(services, ev) {
    let service_list = await ModelList.get('Service'), duration = 0, duration_obj = $('#Appointment').find('.duration').getObj();
    if (services instanceof Forms.Answer) services = services.get();
    if (services) {
      services.forEach(uid => { duration += Number(service_list.find({ uid }).duration); });
    }
    if (duration_obj) duration_obj.value = duration;
    return duration;
  }
  retrieve_chart_note = async () => {
    const where = { appointment_id: this.uid, date_time_start: this.attr_list.date_time_start };
    const type = 'ChartNote';
    await Model.create_or_edit({ where, type });
  }

  get event_obj() {
    try {
      // let obj = {type:'Appointment',uid:this.uid};
      let id = `Appt${this.uid}`;
      let obj = { id };
      let services = this.attr_list.services || this.attr_list.service_ids, group_id = `${this.event_source_id}_${this.uid}`, patient_id = this.attr_list.patient_id, practitioner_id = this.attr_list.practitioner_id;
      let start = this.start_lux, end = this.end_lux;
      let service_names = ModelList.find('Service').names_by_id(services);
      obj.merge({
        start: start.toISO(),
        end: end.toISO(),
        groupId: id,
        classNames: `${service_names.join(' ')} ${obj.id} Appointment`,
        title: service_names.join(', '),
        description: {
          Patient: ModelList.find('Patient.name', patient_id),
          Practitioner: ModelList.find('Practitioner.name', practitioner_id),
          Services: service_names.smartJoin()
        },
        uid: this.uid,
        recurring_id: this.attr_list.recurring_id,
      })
      if (this.attr_list.recurrence) {
        // let Recurring = Schedule.recurring_description({recurrence:this.attr_list.recurrence}); 
        // log({rrule:this.rrule});
        obj.merge({
          duration: end.diff(start),
          rrule: this.rrule,
          // description: {Recurring}
        });
      }
      // log({obj},`${id}`);
      return obj;
    } catch (error) {
      log({ error });
      return {};
    }
  }
  get event_btns() {
    let where = { appointment_id: this.uid, date_time_start: this.attr_list.date_time_start };
    let chartnote_btn = new Features.Button({
      text: 'chart note',
      class_list: 'xsmall yellow',
      action: this.retrieve_chart_note
    });
    // let invoice_btn = new Features.Button({
    //   text: 'invoice',
    //   class_list: 'xsmall yellow',
    //   action: async function () {
    //     await Model.create_or_edit({ where, type: 'Invoice' });
    //   }
    // });
    let edit_btn = new Features.Button({
      text: 'edit',
      class_list: 'xsmall pink70',
      action: this.edit
    });
    let delete_btn = new Features.Button({
      text: 'delete',
      class_list: 'xsmall pink70',
      action: _ => {
        // log({ this: this });
        this.delete();
      }
    });
    // return [chartnote_btn, invoice_btn, edit_btn, delete_btn].map(btn => btn.ele);
    return [chartnote_btn, edit_btn, delete_btn].map(btn => btn.ele);
  }

  get db_columns() {
    return ['patient_id', 'practitioner_id', 'date_time_start', 'date_time_end', 'recurrence', 'exclusions', 'recurring_id'];
  }
  get db_relationships() {
    return { services: 'sync' };
  }
  get service_names() {
    return Model.names('service', this.attr_list.services || []);
  }
  get patient_name() {
    return Model.names('patient', this.attr_list.patient_id)[0];
  }

  async on_save() {
    let sched = this.schedule, edit = sched.edit, edit_recur = sched.edit_recur;
    const Auth = User.Auth, IsPatient = User.IsPatient();

    if (IsPatient) this.set_attributes({ patient_id: Auth.get_attribute('patient_id') });
    // log({ Auth, IsPatient, appt: this });
    // return false;

    if (!this.attr_list) throw new Error(`Invalid ${this.type}`);

    if (this.attr_list.date && this.attr_list.time) {
      this.attr_list.date_time_start = LUX.From.datetime(this.attr_list.date, this.attr_list.time);
      let duration = LUXDur.fromObject({ minutes: this.attr_list.duration });
      this.attr_list.date_time_end = this.attr_list.date_time_start.plus(duration);
    }

    if (this.attr_list.WhenWillThisAppointmentRepeat) {
      const recur_form = $('#RecurringAppointment').getObj(), recurrence = recur_form.response;
      log({ recur_form, recurrence });
      this.attr_list.recurrence = recurrence;
    }
    if (this.attr_list.recurrence && !this.attr_list.recurring_id) {
      this.attr_list.recurring_id = this.uid;
      this.attr_list.rrule = this.rrule;
    }
    this.event_in_schedule = this.uid ? this.schedule.find(this.uid) : null;

    if (edit && edit_recur) {
      if (edit_recur == 'all') return true;

      let existing = Appointment.original, date = this.attr_list.date;
      if (edit_recur == 'this') {
        existing.rrule_exclude(date);
        this.attr_list.recurrence = null;
      } else if (edit_recur == 'future') {
        let recurrence_old = existing.attr_list.recurrence, recurrence_new = this.attr_list.recurrence;
        // this.attr_list.recurrence = recurrence_new;
        let recur_old = new Forms.SubmissionJson(recurrence_old), recur_new = new Forms.SubmissionJson(recurrence_new);
        let dates = recur_old.find('SelectDates'), days = recur_old.find('SelectWeekDays');
        if (dates) {
          let time = now(), break_at = LUX.From.date(date, undefined, time);
          dates = dates.split(', ');
          let before_dates = dates.filter(d => LUX.From.date(d, undefined, time) < break_at),
            after_dates = dates.filter(d => LUX.From.date(d, undefined, time) >= break_at);
          recur_old.set('SelectDates', before_dates.join(', '));
          recur_new.set('SelectDates', after_dates.join(', '));
          // existing.attr_list.recurrence = recur_old.json;
          // this.attr_list.recurrence = recur_new.json;
          // log({recur_old,recur_new,recurrence_new,recurrence_old});
        }
      }
      this.attr_list.recurring_id = existing.attr_list.recurring_id;
      this.clear_uid();
      let appts = [this, existing];
      log({ appts });
      // return false;
      let result_arr = await Model.save_multi(appts);
      return false;
    }
    return true;
  }
  save_callback = async (data) => {
    this.uid = data.uid;
    log({ data, this: this });
    // blurTop('checkmark');
    if (this.schedule && this.schedule.calendar) {
      let top = $('.blur_body').getObj();
      if (top) top.on_undo = () => { this.schedule.calendar.fullcal.updateSize() }
      this.schedule.calendar.fullcal.refetchEvents();
    }
  }
  async delete_callback() {
    // defined to prevent default  
  }
}

class Service extends Model {
  constructor(attr_list = null) {
    if (!attr_list) attr_list = Model.construct_from_form('#CreateService');
    super(attr_list, 'Service');
  }

  get db_columns() { return ['name', 'service_category_id', 'description_calendar', 'description_admin', 'price', 'duration'] }
  get db_relationships() {
    return { forms: 'sync' };
  }

}
class ServiceCategory extends Model {
  constructor(attr_list = null) {
    if (!attr_list) attr_list = Model.construct_from_form('#CreateServiceCategory');
    super(attr_list, 'ServiceCategory');
  }

  get db_columns() { return ['name', 'description'] }
  // async settings_autosave () {
  //   log('hi');
  // }
}
class Complaint extends Model {
  constructor(attr_list = null) {
    let attrs = attr_list || Model.construct_from_form('#CreateComplaint');
    super(attrs, 'complaint');
  }
  get db_columns() {
    return ['name', 'description', 'complaint_category_id', 'settings'];
  }
  get db_relationships() {
    return { icd_codes: 'sync' };
  }
  static async selection_modal_open(options = {}) {
    options.merge({
      url: `/Complaint/select`,
      target: 'new_modal:SelectComplaint',
      method: 'POST',
      data: { table_selection_limit: 'none' }
    });
    await Http.fetch(options);
    let table = Complaint.table = $('#SelectComplaintTable').getObj(),
      continue_btn = Complaint.table.continue_btn = new Features.Button({
        text: 'use selected',
        class_list: 'xsmall pink70 disabled',
        action: options.action || function () { alert('no action given') },
        css: { margin: '0 0 1em 0' },
        disabled_message: `No ${table.header} selected`,
      });
    continue_btn.ele.appendTo(table.button_box);
  }
}
class ComplaintCategory extends Model {
  constructor(attr_list = null) {
    let attrs = attr_list || Model.construct_from_form('#CreateComplaintCategory');
    super(attrs, 'complaint category');
  }
  get db_columns() {
    return ['name', 'description', 'settings'];
  }
}

class IcdCode extends Model {
  constructor(attr_list = null) {
    let attrs = attr_list || IcdCode.construct_from_icd_tool();
    super(attrs, 'icd code');
    this.form = $('#CreateNewIcdCode');
  }
  static get form() { return $("#CreateNewIcdCode").exists() ? $("#CreateNewIcdCode") : null }
  static popup_links_unique() {
    let find_btn = new Features.Button({
      text: 'find new code',
      class_list: 'xsmall pink70',
      url: '/create/IcdCode',
      mode: 'load',
      target: 'new_modal:CreateNewIcdCode',
      callback: function () {
        let form = $('#CreateNewIcdCode'), btn = form.find('.button.create'), icd_codes = form.parentModal().find('.icd_codes').getObj('answer');
        log({ btn, icd_codes, form });
        btn.text('save and apply').data({
          wants_checkmark: true,
          clear_count: 2,
          save_callback: icd_codes.autofill_list_update.bind(icd_codes),
        });
      }
    });
    return find_btn.ele;
  }
  get db_columns() {
    return ['code', 'title', 'text', 'url'];
  }
  save_callback() {
    IcdCode.entity = null;
  }
  static construct_from_icd_tool() {
    if (!IcdCode.entity) {
      feedback('No Code Selected', 'Select a code by clicking on it.');
      return false;
    }
    return {
      code: IcdCode.entity.code,
      title: IcdCode.entity.title,
      text: IcdCode.entity.bestMatchText.ucFirst(),
      url: IcdCode.entity.uri,
    };
  }
}
class CptCode extends Model {
  type = 'CptCode';
  get db_columns() {
    return ['code', 'title', 'text'];
  }
}
class Form extends Model {
  constructor(attr_list) {
    super(attr_list, 'Form');
  }
  async preview() {
    log("PREVIEW?!");
    Http.fetch({ url: `/form/preview/${this.uid}`, target: 'new_modal:FormPreview' });
  }
  async get_form_ele(options = {}) {
    options.merge({ url: `/form/display/${this.uid}` });
    return Http.fetch(options);
  }
  async edit_unique() { Http.load('forms-edit') }
  async settings_unique(options = {}) {
    Form.settings_uid = this.uid;
    await Http.fetch({
      url: `/settings/Form/${this.uid}`,
      target: 'new_modal:SettingsModal',
      in_background: options.in_background,
    });
    // log('1');
    if (this.uid == 'proxy') return;
    let model = this, settings_form = $("#FormSettings");
    settings_form = settings_form.exists() ? settings_form : null;
    let form_obj = $('#SettingsModal').find('.form').first().getObj();

    if (form_obj.name == 'Form Settings') return;

    this.settings_manager = new SettingsManager({
      obj: this,
      initial_override: form_obj ? form_obj.settings : null,
      save: this.settings_autosave.bind(this),
      autosave_delay: 5000,
      callback: this.settings_autosave_callback.bind(this),
      autosave_on_form_change: true,
      form: settings_form,
    }, 'edit');
  }
  static async preview() { Form.preview_by_uid(Form.current.uid) }
  static async preview_by_uid(uid) { Http.fetch({ url: `/form/preview/${uid}`, target: 'new_modal:FormPreview' }); }
}
class ChartNote extends Model {
  submitButtonText = 'sign chart';

  constructor(attr_list = null) {
    attr_list = attr_list || Model.construct_from_form('#ChartNote');
    super(attr_list, 'ChartNote');
    ChartNote.Current = this;
  }
  static get ComplaintList() { return $('#complaints').getObj() }
  static ComplaintListValues() { return ChartNote.ComplaintList.get() }
  static get IcdList() { return $('#icd_codes').getObj() }
  static IcdListValues() { return ChartNote.IcdList.get() }
  static get CptList() { return $('#cpt_codes').getObj() }
  static CptListValues() { return ChartNote.CptList.get() }
  static get FormList() { return $('#ChartFormList').getObj() }
  static FormListValues() { return ChartNote.FormList.get() }

  static autosave(instance) {
    instance.autosave = new Features.Autosave({
      send: () => instance.save({ showProgress: false }),
      obj: instance,
      delay: 2000,
      show_status: false
    })
    instance.Form.find('.button.submit').data({ action: instance.sign });
    // log({ complaints: ChartNote.ComplaintList });
    ChartNote.ComplaintList.after_change_action = () => instance.autosave.trigger();
    ChartNote.IcdList.after_change_action = () => instance.autosave.trigger();
    ChartNote.CptList.after_change_action = () => instance.autosave.trigger();

  }
  static async toggle_form(info) {
    let was_active = info.was_active, uid = info.value, item = info.item,
      list = {
        obj: item.getObj('List'),
        find: uid => { return list.obj.items.filter((i, item) => $(item).data('value') == uid) }
      }, index = list.obj.items.index(item), is_last = list.obj.items.last().is(item);
    let forms = {
      eles: $('#ChartNote').find('.form'),
      find: uid => { return forms.eles.filter((f, form) => $(form).data('uid') == uid) }
    };

    let form = forms.find(uid);
    log({ forms, form, info });
    if (form.exists()) {
      if (was_active) form.slideFadeOut();
      else form.slideFadeIn();
    } else {
      let placeholder = $('<div/>', { class: 'toggle_ele', css: { position: 'relative', height: '1px', paddingTop: '1.5em' } });
      if (forms.eles.dne()) placeholder.appendTo('#ChartForms');
      else if (is_last) placeholder.insertAfter(forms.eles.last());
      else if (index == 0) placeholder.insertBefore(forms.eles.first());
      else {
        let next = { list: item.next(), form: forms.find(item.next().data('value')) };
        log({ next, form, item });
        while (next.list.exists() && next.form.dne()) {
          next.list = next.list.next();
          next.form = forms.find(next.list.data('value'));
          log({ next, form, item });
        }
        placeholder.insertBefore(next.form);
      }
      placeholder.animate({ height: '6em' });
      blur(placeholder, 'loading', { color: 'pink' });

      let form_obj = Model.find_or_create('Form', uid);
      form_obj.get_form_ele({ target: placeholder, replace_target: true, method: 'POST', data: { mode: 'chart' } });
    }
  }
  static add_complaints() {
    let complaints = Complaint.table.info, answer = ChartNote.ComplaintList, existing_ids = answer.find('li').get().map(li => $(li).data('value'));
    let eles = complaints.filter(c => !existing_ids.includes(c.data.uid)).map(c => `<li data-value="${c.data.uid}">${c.Name}</li>`);
    answer.append(eles);
    unblur();
  }

  update_attrs_by_form(options = {}) {
    let attr_list = this.attr_list, all_pass = true;
    try {
      // let form = options.form || null, type = this.attr_list.model || this.usertype || this.type;
      // if (!form) form = $(`#${type.toKeyString()}`);
      // if (form.dne()) throw new Error(`Form #${type} not found`);
      // if (form.length > 1) throw new Error(`Multiple forms #${type} found`);

      // const form = $('#ChartNote');

      // let answers = Forms.Answer.get_all_within(form);
      const answers = $('#ChartNote').find('.answer').get().filter(answerEle => !$(answerEle).isInside('#ChartForms')).map(answerEle => $(answerEle).getObj('answer', false));
      // log({ answers });
      answers.forEach(answer => {
        let value = answer.verify('required'), name = answer.options.name;
        if (value === false) {
          all_pass = false;
        } else {
          attr_list[name] = value;
        }

      })
    } catch (error) {
      log({ error, options, all_pass });
      all_pass = false;
    }
    return all_pass;
  }

  on_save() {
    this.set_attributes({
      complaints: ChartNote.ComplaintListValues(),
      icd_codes: ChartNote.IcdListValues(),
      cpt_codes: ChartNote.CptListValues(),
    });
    return true;
  }

  get db_columns() { return ['date_time_end', 'icd_codes', 'cpt_codes', 'signature', 'signed_at'] }
  get db_relationships() {
    return {
      complaints: 'sync'
    };
  }
  get forms() {
    return $('#ChartForms').find('.form').get().map(form => $(form).getObj());
  }
  get submissions() {
    return this.forms.map(form => ({ form, response: form.response }));
  }
  sign = async () => {
    const submissions = this.submissions;
    const invalid = submissions.find(({ response }) => response === false);
    if (invalid) return;

    const { patient_id, appointment_id, id: chart_note_id } = this.attr_list;
    blurTop('loading', { color: 'green' });
    const results = await Promise.all([...submissions.map(({ form, response: responses }) => form.submit({
      patient_id, appointment_id, chart_note_id, responses
    })), this.save({ showProgress: false })]).then(data => data.map(({ save_result }) => save_result));
    Features.Blur.Checkmark();
    log({ results });
  }
}

export const Models = { Table, Details, Model, ModelList, SettingsManager, Practice, User, Patient, Practitioner, StaffMember, Calendar, Schedule, Appointment, Service, ServiceCategory, Complaint, ComplaintCategory, IcdCode, CptCode, Form, ChartNote };

export const linkable_models = ['Patient', 'Practitioner', 'StaffMember', 'Service', 'Form', 'Complaint', 'ComplaintCategory'];
export const linkable_lists = {};
export const linkable_lists_pending = {};
window.linkable_lists = linkable_lists;

export const table = {
  list: () => $('.Table').get(),
  get: () => table.list().find(table => table.name == name) || null,
  initialize: {
    // all: function(){
    //   $.each(table.initialize, function(name, initFunc){
    //     if (name != 'all' && typeof initFunc === 'function') initFunc();
    //   });
    // },
    // Tables: function(){
    //   init('.Table', function(){
    //     let newTable = new Table({ele: $(this)});
    //   })
    // },
    // NewTables: function() {
    //   log('HIIIIII');
    //   init('.Table', function() {
    //     new Table($(this).data().merge({ele: $(this)}));
    //   })
    // },
    // Details: function() {
    //   log("HI");
    //   init('.Details', function() {
    //     new Details($(this).data().merge({ele: $(this)}));
    //   })
    // },
  },
  width: {
    timer: null,
    check: function () {
      clearTimeout(table.width.timer);
      table.width.timer = setTimeout(table.width.adjust, 300);
    },
    adjust: function () {
      $.each(table.list, function (t, Table) {
        Table.showAllColumns();
        let hideMe = [...Table.hideorder];
        while (Table.isTooWide) {
          let hideNow = hideMe.shift();
          Table.element.find('.' + hideNow).hide();
        }
      })
    }
  },
};
export const model = {
  initialize: _ => {
    init('.ModelDetails', function () {
      let info = $(this).data(), uid = info.uid
      Model.find_or_create(info.type, uid, info.attr_list);
    })
  },
  current: null,
  actions: (action) => {
    try {
      if (Models.Model.current[action] && typeof Models.Model.current[action] == 'function') Models.Model.current[action]();
      else throw new Error(`${Models.Model.current.type}.${action} is not a function`);
    } catch (error) {
      log({ error });
    }
  },
}

