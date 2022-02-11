import { forms, Forms } from './forms';
import { model, table, Models } from './models';
import { DateTime as LUX } from 'luxon';
import { Settings as LuxonSettings } from 'luxon';
import JankyStar from './karaoke';

export const debug = {
  get y() { return debug.bool },
  get d() { return debug.depth },
  level: function (depth) { return debug.bool && debug.depth >= depth },
  bool: false,
  depth: 0,
  set: function (bool, depth = 0) {
    if (user.isSuper()) {
      debug.bool = bool;
      debug.depth = depth;
    }
  }
};
window.debug = debug;
// export const log = function (info, text = null) {
export const log = function (text, info = {}) {
  if (typeof text === 'object') {
    info = { ...info, ...text };
    text = null;
  }
  // if (typeof info === 'string') {
  //   text = info;
  // }
  let error = ifu(info.error, info.errors, null);
  let data = {}, attrText = [];
  for (let attr in info) { data[attr] = info[attr]; attrText.push(attr); }
  attrText = attrText.join(', ');

  let stack_steps = (new Error()).stack.match(/at (.*) \((.*js):(.*):/g), stack_info = '', fx = '', file = '';
  if (stack_steps && stack_steps[1]) {
    let last_step = stack_steps[1].match(/at (.*) \((.*js):(.*):/);
    file = last_step[2].split('/').pop();
    fx = last_step[1];
    // console.log({ stack_steps });
    stack_info = ` - ${file}`;
  }

  let style = 'color: green; font-weight: bold;';
  text = ifn(text, info.text, attrText);
  if (error !== null || Array.isArray(error)) {
    if (error instanceof Error) text = error.message;
    style = 'color: red; font-weight: bold;'
  }

  delete data.text;
  console.groupCollapsed(`%c${text}\n ${file} @ ${fx}`, style);
  // console.log(`%c ${file} @ ${fx}`, style)
  error ? console.error(data) : console.log(data);
  if (error !== null && error.stack) console.log(error.stack);
  // console.groupCollapsed('trace');
  console.trace();
  // console.groupEnd();
  console.groupEnd();
};

class Button {
  constructor(options) {
    let errors = [];
    try {
      this.define_by(options);
      if (!this.ele) this.ele = $("<div/>", { text: this.text }).appendTo('body');
      this.ele.data('class_obj', this);
      // this.action_data = this.ele.data('action_data') || {};
      if (!this.class_list) this.class_list = 'button';
      else if (!this.class_list.includes('button')) this.class_list += ' button';
      if (this.action) this.action = this.action.to_fx;
      if (this.css) this.ele.css(this.css);
      if (this.id) this.ele.attr('id', this.id);
      // if (options.css) this.ele.css(options.css);
      this.ele.addClass(this.class_list).data({ action: this.action, target: this.target, mode: this.mode });
      this.ele.addClass(`button-${this.ele.text().removeSpaces('-')}`)
      this.ele.on('click', this.action_data, this.click.bind(this));
      this.ele.data('generic_fx', true);
      if (this.tooltip) new ToolTip({ target: this.ele, ...this.tooltip });
      this.relocate();
      this.disabled_warning = new Warning({
        target: this.ele, message: this.disabled_message || 'button disabled',
      })
      if (this.ele.text().toLowerCase().includes('sign chart')) {
        log(`Sign Chart Button`, { button: this, options });
      }
    } catch (error) {
      log({ error, options });
    }
  }
  relocate() {
    if (this.insertAfter) this.ele.insertAfter(this.insertAfter);
    else if (this.insertBefore) this.ele.insertBefore(this.insertBefore);
    else if (this.appendTo) this.ele.appendTo(this.appendTo);
  }
  text_update(string) { this.ele.text(string) }

  get action_data() {
    let data = {};
    if (this.model) data.model = this.model;
    if (this.table) data = { ...data, table: this.table, selected: this.table.uids };
    if (this.url) data.url = this.url;
    return data;
  }

  async click(ev) {
    if (this.ele.hasClass('cancel')) {
      Blur.undo(); return;
    }
    if (this.ele.hasClass('disabled')) {
      this.disabled_warning.show(); return;
    }

    // let action = this.action, target = this.target, mode = this.mode, callback = this.callback;
    const { action, target, mode, callback } = this;
    if (user.isSuper() && ev.metaKey) {
      log(`BTN ${this.ele.text()}`, { action, ev, button: this });
      ev.stopPropagation();
      return;
    }
    try {
      if (action) action.bind(this.ele)(this.action_data);
      if (mode && target) {
        if (!['same_tab', 'new_modal'].some(t => target.includes(t))) {
          if ($(target).dne()) target = `#${target}`;
          if ($(target).dne()) throw new Error(`Target not found`);
        }
        if (mode == 'modal') blurTop(target);
        else if (mode == 'scroll') $.scrollTo(target);
        else if (mode == 'click') $(target).click();
        else if (mode == 'load') {
          await Menu.fetch({ url: this.uri || this.url, target });
          if (typeof callback == 'function') callback();
        }
      } else if (mode && !target) throw new Error(`Target not defined for mode:${mode}`);
      else if (!mode && target) throw new Error(`Mode not defined for target:${target}`);
    } catch (error) {
      let options = { action, target, mode, callback };
      let message = 'BUTTON ERROR';
      log({ error, message, options });
    }
  }

};
class ButtonBox {
  constructor(options = {}) {
    this.define_by(options);
    let class_array = (this.class_list || '').split(' ');
    class_array.smartPush('button_box');
    if (this.color) class_array.smartPush(this.color);
    if (this.margin != undefined) class_array.smartPush(`m-y-${this.margin}`);
    if (this.full_width) class_array.smartPush('max');
    this.ele = $(`<div/>`, { class: class_array.join(' ') });
    if (this.buttons) this.buttons.forEach(btn => this.add_button(btn));
  }
  get button_list() { return this.button_array == undefined ? this.button_array = [] : this.button_array }
  add_button(options = {}) {
    let color = options.color || this.color;
    if (color && (this.active_toggle || this.active_toggle_reverse)) options.merge({ class_list: `${this.btn_class_list || null} ${color}70` });
    else if (color) options.merge({ class_list: `${this.btn_class_list || null} ${color}` });
    let btn = new Button(options);
    this.button_list.push(btn);
    this.ele.append(btn.ele);
    if (this.active_toggle) btn.ele.on('click', _ => { this.ele.resetActives(); btn.ele.addClass('active') })
    else if (this.active_toggle_reverse) btn.ele.on('click', _ => { this.ele.find('.button').addClass('active'); btn.ele.removeClass('active') })
  }
}
class Editable {
  constructor(options) {
    // attributes: name, html_tag, id, callback
    let name = ifu(options.name, 'no name'), class_list = name.snake() + ' editable',
      html_tag = ifu(options.html_tag, 'div'), id = ifu(options.id, null), callback = ifu(options.callback, null),
      replace = (options.replace && $(`#${options.replace}`).exists()) ? $(`#${options.replace}`) : null,
      initial = ifu(options.initial, null);
    this.ele = $(`<${html_tag}/>`, {
      class: class_list,
      id: id,
    });
    this.name = name;
    this.pair_ele = $(`<div class='pair'></div>`).append(`<input type='text' placeholder='${name.toTitleCase()}'>`).appendTo(this.ele);
    this.value_ele = $(`<span class='value'></span>`).appendTo(this.pair_ele);
    this.edit_toggle = $(`<div class ='toggle edit'>(edit ${name})<div>`).on('click', { obj: this }, this.edit.bind(this)).appendTo(this.ele);
    this.save_btn = $(`<div class ='toggle save'>(save)<div>`).on('click', { obj: this }, this.save.bind(this)).appendTo(this.ele);
    this.cancel_btn = $(`<div class ='toggle cancel'>(cancel)<div>`).on('click', { obj: this }, this.cancel.bind(this)).appendTo(this.ele);
    if (replace) replace.replaceWith(this.ele);
    if (initial) this.text = initial;
    else this.edit();
    this.ele.find('input').on('keyup', function (ev) {
      if (ev.keyCode == '13') this.save_btn.click();
    })
    this.callback = (callback && typeof callback == 'function') ? callback : null;
  }

  get value() {
    return $.sanitize(this.ele.find('input').val().trim());
  }
  get text() {
    return $.sanitize(this.ele.find('.value').text().trim());
  }
  set text(text) {
    this.ele.find('.value').text(text);
    this.ele.find('input, .save, .cancel').hide();
    this.ele.find('.edit, .value').show();
  }
  get verify() {
    return this.value !== '' ? this.value : null;
  }

  edit() {
    this.ele.find('input, .save, .cancel').show();
    this.ele.find('.edit, .value').hide();
    if (this.text != '') this.ele.find('input').val(this.text);
  }
  save(ev) {
    this.ele.find('input, .save, .cancel').hide();
    this.ele.find('.edit, .value').show();

    if (!this.verify) {
      feedback(`Invalid ${this.name.toTitleCase()}`, `You must enter a ${this.name}.`);
      this.edit();
      this.ele.find('input').addClass('borderFlash');
    } else {
      this.ele.find('.value').text(this.value);
      this.ele.find('input').removeClass('borderFlash');
      if (this.callback) this.callback(ev, this.value);
    }
  }
  cancel() {
    this.ele.find('input, .save, .cancel').hide();
    this.ele.find('.edit, .value').show();
    this.ele.find('input').val(this.ele.find('.value').text());
  }
};
class OptionBox {
  constructor(options = {}) {
    if (options instanceof jQuery && options.is('.OptionBox')) {
      let ele = options, data = options.data();
      options = { ele }.merge(data);
    }

    this.define_by(options);
    this.header_text = this.header || '';
    if (!this.header_html_tag) this.header_html_tag = 'h3';
    if (!this.button_header_html_tag) this.button_header_html_tag = this.header_html_tag;
    if (!this.ele) this.ele = $(`<div class='OptionBox'></div>`).appendTo('body');
    this.ele.data({ initialized: true, class_obj: this });
    // if (this.css) this.ele.css(this.css);
    this.ele.append(`<div class='body'><div class='info'></div></div>`, `<div class='options'></div>`);
    this.body = this.ele.find('.body');
    this.info = this.ele.find('.info');
    this.option_list = this.ele.find('.options');
    this.header = $(`<${this.header_html_tag} class='header'>${this.header_text}</${this.header_html_tag}>`).prependTo(this.body);
    if (this.header_class_list) this.header.addClass(this.header_class_list);

    this.button_array = [];
    if (this.buttons) this.buttons.forEach(b => this.add_button(b));
    if (this.id) this.ele.attr('id', this.id);
    if (this.class_list) this.ele.addClass(this.class_list);
    if (this.message) this.add_info(this.message);
    if (this.button_info) this.add_button_info(this.button_info);
    // this.ele.appendTo('body');
  }

  add_info(info) {
    let options = this;
    if (info instanceof Button) {
      let btn = info;
      this.info.append(btn.ele);
      btn.ele.on('click', btn.click.bind(btn));
    } else if (typeof info == 'string' || info instanceof jQuery) {
      this.info.append(info);
    } else if (typeof info == 'object') {
      let box = new KeyValueBox({ json: info }.merge(this.key_value_options || {}));
      this.info.append(box.ele);
    } else log({ error: new Error(`info type '${typeof info} not recognized`), info });
    return this;
  }
  reset_header(str = '') {
    this.header.html(str);
    return this;
  }
  reset_info(ele = null) {
    this.info.html('');
    if (ele) this.add_info(ele);
    return this;
  }
  reset_button_info(ele) {
    if (this.button_info_ele) this.button_info_ele.remove();
    this.add_button_info(ele);
  }
  add_button_info(ele) {
    if (typeof ele == 'string') ele = $(`<${this.button_header_html_tag}/>`, { text: ele, class: this.button_header_class_list || 'pink bold' });
    this.button_info_ele = ele.prependTo(this.option_list);
    return this;
  }
  remove_buttons() {
    // log({buttons:this.button_array});
    this.button_array.forEach(b => b.ele.remove());
    this.button_array = [];
    return this;
  }
  add_button(options) {
    let text = ifu(options.text, 'button'), action = ifu(options.action, null), class_list = ifu(options.class_list, 'pink small'), appendTo = this.option_list, tooltip = options.tooltip || null;
    if (!['small', 'xs', 'medium'].some(c => class_list.includes(c))) class_list += ' small';
    let btn = new Button({ text, action, class_list, appendTo });
    this.button_array.push(btn);
    if (tooltip) new ToolTip({ target: btn.ele }.merge(tooltip));
    return btn;
  }
  hide(time = 0) { this.ele.slideFadeOut(time) }
  blur(ele = null) {
    if (!ele) blurTop(this.ele);
    else blur(ele, this.ele);
  }
};
class KeyValueBox {
  constructor(options) {
    this.define_by(options);
    // this.options = options;
    this.keys = [];
    this.values = [];
    this.items = [];
    this.headers = [];
    this.wrap_ele_outer = $('<div/>', { css: { textAlign: 'center' } });
    let class_list = this.inline_values ? 'flexbox' : 'flexbox column';
    this.flex = $('<div/>', { class: class_list, css: this.box_css || {} });
    this.color = this.color || 'purple';
    this.ele = (this.ele || $('<div/>').appendTo('body')).addClass(`KeyValueBox ${this.color}`);
    if (this.id) this.ele.attr('id', this.id);
    this.ele.append(this.flex).wrap(this.wrap_ele_outer);
    if (this.header) this.add_header(this.header, this.header_options || {});
    this.new_pairs(this.json || {});
    this.include_null = this.include_null || false;
    this.ele.data({ initialized: true, class_obj: this });
    // if (this.headers_to_hide) this.on_completion = _ => { this.hide_initial_headers() };

    return this;
  }
  hide_initial_headers() {
    if (!this.ele.is(":visible") || !this.headers_to_hide) return;
    this.headers.forEach(h => {
      if (this.headers_to_hide.includes(h.textContent) && !$(h).hasClass('hiding')) {
        // log(`hiding KVbox header "${h.textContent}"`);
        KeyValueBox.header_toggle.bind($(h), 0)()
      }
    }
    )
  }
  realign() {
    return;
    if (!this.ele.is(':visible')) return;
    this.pairs_grouped_by_header.forEach(pairs => {
      if (!pairs.is(':visible')) return;
      let max_width = 0, keys = pairs.find('.key'), values = pairs.find('.value');
      keys.css({ minWidth: 'max-content' }).each((k, key_ele) => {
        if (key_ele.scrollWidth > max_width) { max_width = key_ele.scrollWidth }
      });
      keys.css({ minWidth: max_width + 2 });
      max_width = 0;
      values.css({ minWidth: 'min-content' }).each((k, value_ele) => {
        if (value_ele.scrollWidth > max_width) { max_width = value_ele.scrollWidth }
      });
      values.css({ minWidth: max_width + 2 });
      // if (this.value_css) values.css(this.value_css);
    })
    this.hide_initial_headers();
  }
  get pairs_grouped_by_header() {
    let groups = [], group = $(), next = this.ele.find('.pair').first(), header_name = next.prev().is('.kv_header') ? next.prev().text() : null;
    while (next.exists()) {
      if (next.is('.pair')) group = group.add(next);
      else if (next.is('.kv_header')) {
        groups.push(group.data({ header_name }));
        group = $();
        header_name = next.text();
      }
      next = next.next();
      if (next.dne()) groups.push(group);
    }
    return groups;
  }

  static realign(ele = null) {
    return;
    let boxes = $(ele || 'body').find('.KeyValueBox').get();
    boxes.forEach(kv => $(kv).getObj().realign());
    // log({ele,boxes});
  }
  reset_items(items, options) {
    $(this.items).remove();
    this.items = [];
    if (items) this.new_pairs(items, options);
  }
  reset_headers(header, options) {
    $(this.headers).remove();
    this.headers = [];
    if (header) this.add_header(header, options);
  }
  reset_all() { this.reset_items(); this.reset_headers(); }

  unused_header_clear() {
    this.headers.forEach(h => {
      if ($(h).next().is('h4')) {
        $(h).remove(); this.headers.splice(this.headers.indexOf(h), 1);
      }
    });
  }
  add_header(header, options = {}) {
    if (this.header_options) options = { ...this.header_options, ...options };
    const { tag = 'div', class_list = '' } = options;

    if (typeof header == 'string') header = $(`<${tag} class='kv_header ${this.color}'>${header}</${tag}>`);
    this.flex.append(header.addClass(class_list));
    this.headers.push(header[0]);
    let toggle = KeyValueBox.header_toggle.bind(header);
    if (this.header_toggle) {
      header.addClass('toggleable');
      header.on('click', toggle);
    }
  }
  new_pairs(items, options = {}) {
    let map = options.transform_fx || this.transform_fx || null;
    if (map) map = map.to_fx.bind(this);
    if (items.is_array()) {
      if (items.notEmpty()) {
        items.forEach((value, v) => {
          value = map ? map(v, value) : value;
          let is_jquery = value instanceof jQuery;
          if (this.include_null && value === null) value = 'null';
          if (value !== null) {
            if (typeof value == 'object' && !is_jquery) {
              // let transform_fx = this.inner ? this.inner.transform_fx
              this.add_header(`${this.array_label || 'Trace'} ${v + 1}`)
              this.new_pairs(value, this.inner || {});
              return;
            }
            // if (typeof value == 'object' && !is_jquery) value = system.display.format.readableJson(value);
            let value_ele = $('<div/>', { class: `value ${v.toKeyString()}` }).append(value),
              pair_ele = $('<div/>', { class: 'flexbox pair' }).append(value_ele);
            this.items.push(pair_ele[0]);
            this.values.push(value_ele[0]);
            this.flex.append(pair_ele);
          }
        })
      } else {
        let text = this.empty_array_placeholder || 'none';
        let value_ele = $('<div/>', { class: `value empty_array` }).append(text),
          pair_ele = $('<div/>', { class: 'flexbox pair' }).append(value_ele);
        this.items.push(pair_ele[0]);
        this.values.push(value_ele[0]);
        this.flex.append(pair_ele);
      }
    } else {
      let pairs = items;
      for (let key in pairs) {
        let value = map ? map(key, pairs[key]) : pairs[key], is_jquery = value instanceof jQuery;
        if (this.include_null && value === null) value = 'null';
        if (value !== null) {
          if (typeof value == 'object' && !is_jquery) {
            let map = this.inner && this.inner.transform_fx ? this.inner.transform_fx : null;
            // this.new_pairs(value, this.inner || {});
            value = system.display.format.indentedJson(value);
            // return;
          }
          let key_text = key.toTitleCase().addSpacesToKeyString();
          let key_span = $('<span/>', { text: key_text, class: this.key_class || null });
          let key_ele = $('<div/>', { class: `key flexbox right ${key.toKeyString()}` }).append(key_span),
            value_ele = $('<div/>', { class: `value ${key.toKeyString()}` }).append(value),
            pair_ele = $('<div/>', { class: 'flexbox pair' }).append(key_ele, value_ele).css(this.pair_css || {});
          this.items.push(pair_ele[0]);
          this.keys.push(key_ele[0]);
          this.values.push(value_ele[0]);
          this.flex.append(pair_ele);
        }
      }
    }
    if (this.key_class_list) this.keys.addClass(this.key_class_list);
    if (this.value_class_list) this.values.addClass(this.value_class_list);
    if (this.on_completion_array) this.on_completion_array.forEach(fx => fx());
    this.realign();
  }
  set on_completion(fx) {
    let array = this.on_completion_array == undefined ? this.on_completion_array = [] : this.on_completion_array;
    array.push(fx);
  }
  set_order(class_array, ele = null) {
    if (!ele) ele = this.ele;
    class_array.forEach(c => { ele.find(`.${c}`).appendTo(ele) });
  }
  static header_toggle(time = 400) {
    if (!this.is(':visible')) return;
    let eles = $(), next = this.next(), visible = !next.hasClass('hiding');
    while (next.is('.pair')) { eles = eles.add(next); next = next.next(); }
    if (visible) { eles.slideFadeOut(time); this.add(eles).addClass('hiding'); }
    else { eles.slideFadeIn(time); this.add(eles).removeClass('hiding'); }
  }
}

class Filter {
  constructor(options = {}) {
    this.define_by(options);
    // log({options});
    if (!this.ele) this.ele = $('<div/>', { class: 'Filter' });
    if (!this.answer) this.answer = new Forms.Answer(options);
    if (!this.filter_type) throw new Error('filter_type is required');
    this.ele.data({ initialized: true, class_obj: this });
    this.answer.options.after_change_action = this.filter.bind(this);
    this.answer.ele.addClass('purple').appendTo(this.ele);
    if (this.class_list) this.ele.addClass(this.class_list);
    if (this.target.filter_objs === undefined) this.target.filter_objs = [];
    this.target.filter_objs.push(this);
  }
  get items() { return this.target.ele.find(this.selector).not('.no_items, .no_selection') }
  // get items () { return this.target.ele.find(this.selector) }
  get no_items() { return this.target.ele.find(this.selector).filter('.no_items') }
  get no_selection() { return this.target.ele.find(this.selector).filter('.no_selection') }
  get column_filter_classes() {
    return this.target.filter_objs.filter(f => f.filter_type == 'column').map(f => `.${f.options.name}`);
  }
  get matches() {
    try {
      let items = this.items;
      let search = this.answer.get({ as_text: true }), matches = null;
      let class_name = this.name || this.options.name;
      let options = { className: class_name };
      if (search == null) {
        items.unmark(options);
        this.ele.removeClass('active');
        return null;
      } else if (this.filter_type == 'text') {
        items.unmark(options);
        options.merge({ accuracy: 'complementary', exclude: this.column_filter_classes });
        items.mark(search, options);
        matches = items.filter((i, item) => $(item).find(`mark.${class_name}`).exists());
      } else if (this.filter_type.includes('column')) {
        let columns = items.find(`.${class_name}`);
        columns.unmark(options);
        if (this.options.type != 'text') options.merge({ acrossElement: true, separateWordSearch: false });
        columns.mark(search, options);
        matches = items.filter((i, item) => $(item).find(`mark.${class_name}`).exists());
      } else if (this.filter_type == 'active') {
        matches = items.filter('.active');
      } else throw new Error(`filter_type = ${this.filter_type} not defined`)
      this.ele.addClass('active');
      log({ search, matches, options }, `filter ${class_name}`);
      return matches && matches.exists() ? matches.get() : [];
    } catch (error) {
      log({ error, filter: this });
    }
  }
  filter(answer, ev) {
    let items = this.items;
    let all_filters = this.target.filter_objs, match_arrays = all_filters.map(f => f.matches);
    if (match_arrays.every(a => a === null)) { items.show(); return; }
    let match_intersect = Array.intersect(...match_arrays);
    items.add(this.no_items).add(this.no_selection).hide();
    $(match_intersect).show();
    if (match_intersect.isEmpty()) {
      this.no_selection.show();
      log('hi');
    }
    log({ all_filters, match_arrays, match_intersect });
  }
}
class List {
  constructor(options = {}) {
    try {
      this.define_by(options);
      if (!this.ele) this.ele = $(`<div/>`, { class: 'List' });
      this.ele.removeAttr('data-options').addClass(this.class_list || null);
      if (this.id) this.ele.attr('id', this.id);
      let text = ifu(this.header, null), tag = this.header_html_tag || 'h3';
      if (text) this.header = $(`<${tag} class='list-header'>${text}</${tag}>`).appendTo(this.ele);
      if (this.header_class) this.header.addClass(this.header_class);
      if (this.subheader) this.subheader = $(`<div>${this.subheader}</div>`).appendTo(this.ele);
      if (this.subheader_class) this.subheader.addClass(this.subheader_class);
      this.ul = $(`<ul/>`).css({ display: 'inline-block' }).appendTo(this.ele);
      if (this.css) this.ele.css(this.css);
      this.selectable = ifu(this.selectable, true);
      // this.ul_css = this.ul_css || {}; 
      // this.ul.css(this.ul_css.merge({width:'max-content',maxWidth:'35em'}))
      if (this.ul_class) this.ul.addClass(this.ul_class);
      if (this.color) {
        this.ele.addClass(this.color);
        if (this.header) this.header.addClass(this.color);
        if (this.subheader) this.subheader.addClass(this.color);
        this.ul.addClass(this.color);
      }
      if (typeof this.action == 'string') this.action = this.action.to_fx;
      this.limit = Number.isNaN(Number.parseInt(this.limit)) ? null : Number.parseInt(this.limit);
      if (this.limit !== null) this.limit_warning = new Warning({ ele: this.ul, message: `Limited to ${this.limit}` });
      this.no_items = this.add_item({ text: this.no_item_text || 'none', class_list: 'no_items', skip_check: true }).hide()
      this.no_selection = this.add_item({ text: this.no_selection_text || 'no matches', class_list: 'no_selection', skip_check: true }).hide();

      if (this.json && this.json.is_array() && this.json.notEmpty()) this.json.forEach(i => this.add_item(i));
      else this.no_items.show();
      if (this.with_search) this.add_filters();
      if (this.header_toggle) {
        let toggle_options = {
          toggle_ele: this.header,
          target_ele: this.ul,
          arrow_position: 'below',
          arrow_css: { marginTop: '-0.2em' },
          initial_state: 'visible',
        }.merge(this.toggle_options || {});
        // log({toggle_options,options,this:this,this_toggle:this.toggle_options});
        this.toggle = new Toggle(toggle_options);
      }
      if (this.confirm_options) {
        this.confirm = new Confirm(this.confirm_options);
        this.items.addClass('clickable');
      }
      this.ele.data({ 'initialized': true, class_obj: this });

      // this.post_add_check();
    } catch (error) {
      log({ error, this: this, options });
    }
  }

  add_filters() {
    let target = this, selector = 'li';
    this.search_box = new Filter({
      target, selector,
      name: 'text', type: 'text', filter_type: 'text',
      placeholder: 'Type to search',
      settings: { placeholder_shift: false }
    });
    this.active_only = new Filter({
      target, selector,
      name: 'is_active', filter_type: 'active',
      type: 'checkboxes',
      list: ['only selected items']
    });
    this.filter_wrap = $(`<div/>`).insertBefore(this.ul).append(this.search_box.ele, this.active_only.ele);
  }

  post_add_check(item) {
    let items = this.items, visible = items.filter(':visible');
    if (items.dne()) { this.no_items.show(); this.no_selection.hide(); }
    else if (this.ul.is(':visible') && visible.dne()) { this.no_items.hide(); this.no_selection.show(); }
    else { this.no_items.hide(); this.no_selection.hide(); }
    if (this.post_add_fx) { this.post_add_fx.to_fx(item); }
  }
  post_select_check(item) {
    if (this.post_select_fx) this.post_select_fx.to_fx(item);
  }
  get ordered_list() { return this.ordered_list_array ? this.ordered_list_array : [] }
  add_to_list(item) {
    const list = this.ordered_list;
    const { value } = item.data();
    if (list.includes(value)) return;
    list.push(value);
    this.ordered_list_array = list;
  }
  remove_from_list(item) {
    const list = this.ordered_list;
    const { value } = item.data();
    this.ordered_list_array = list.filter(v => v != value);
  }
  update_list(triggerAction = true) {
    this.ordered_list_array = this.active_values || [];
    // console.log(this.ordered_list_array);
    if (triggerAction) this.action();
  }

  get items() { return this.ul.find('li').not('.no_items, .no_selection'); }
  get values() { return this.items.get().map(item => $(item).data('value')); }
  get active() { return this.items.filter('.active'); }
  get active_values() {
    let active = this.active;
    return active ? this.active.get().map(item => $(item).data('value')) : null;
  }
  get tt() { return this.ele.getObj('tooltip') }
  find_by_value(value_array = null) {
    if (value_array == null) return $();
    if (!value_array.is_array()) value_array = [value_array];
    return this.items.filter((i, item) => value_array.includes($(item).data('value')))
  }
  async item_select(ev) {
    if ($(ev.target).is('img') || !this.selectable) return;
    let pass = true;
    let has_limit = this.limit != null, item = $(ev.target).closest('li'), was_active = item.hasClass('active'),
      at_limit = !has_limit ? false : this.active.length == this.limit;
    if (item.hasClass('no_match') || item.hasClass('no_selection')) return;
    if (at_limit && this.limit != 1) {
      this.limit_warning.show();
      return;
    }
    let text = item.text();
    if (this.confirm) {
      let message = was_active ? 'You are un-selecting this item' : 'You are selecting this item';
      if (this.confirm.message_active && was_active) message = this.confirm.message_active;
      else if (this.confirm.message_inactive && !was_active) message = this.confirm.message_inactive;
      pass = await this.confirm.prompt({
        header: `${was_active ? 'Remove' : 'Add'} ${text}?`,
        message,
        yes_text: `${was_active ? 'remove' : 'add'} ${text}`,
        no_text: `cancel`,
        button_info: `Do you want to proceed?`,
        item, was_active, value: item.data('value'), text, model: this.model || null,
      })
    };
    if (!pass) return;
    if (!has_limit) item.toggleClass('active');
    else {
      if (this.limit == 1 && was_active) { item.removeClass('active') }
      else if (this.limit == 1) { this.ele.resetActives(); item.addClass('active') }
      else {
        if (was_active) item.removeClass('active');
        else item.addClass('active');
      }
    }
    if (item.hasClass('active')) this.add_to_list(item);
    else this.remove_from_list(item);
    // console.log(this.ordered_list);
    this.post_select_check();
  }
  add_item(options = {}) {
    if (this.transform_fx && !options.skip_check) options = this.transform_fx(options);
    if (options === null) return;
    let text = this.text_dot ? options.dot_notation_get(this.text_dot) : options.text || 'text ?',
      value = this.value_dot ? options.dot_notation_get(this.value_dot) : options.value || text;
    let action = options.action || this.action || null,
      item = $(`<li/>`, { class: options.class_list || this.li_class || '' }).appendTo(this.ul).show(),
      entire_li_clickable = ifu(options.entire_li_clickable, this.entire_li_clickable, true),
      clickable_ele = item,
      selectable = ifu(options.selectable, this.selectable, false),
      to_top = options.position ? options.position == 'top' ? true : false : false;

    if (options.data) item.data(options.data);
    if (this.initial && this.initial.is_array() && this.initial.includes(value)) item.addClass('active');
    item.append(options.append ? options.append : `<span>${text}</span>`);
    if (to_top) item.prependTo(this.ul);

    item.data({ value }.merge(options.data || {}));

    if (item.hasClass('no_selection') || item.hasClass('no_items')) return item;

    if (this.has_arrows) {
      let callback = this.arrow_callback || options.arrow_callback || null;
      let arrows = new UpDown({ action: 'change_order', selector: 'li', callback });
      item.addClass('flexbox spread').append(arrows.ele);
    }
    if (selectable) item.on('click', this.item_select.bind(this));
    if (action) {
      if (!entire_li_clickable) clickable_ele = item.children().first();
      clickable_ele.on('click', action.to_fx);
    }
    if (selectable || action) clickable_ele.addHoverClassToggle().addClass('clickable');
    if (!options.skip_check) this.post_add_check(item);
    else log({ options });
    return item;
  }
  remove_by_index(index) {
    let item = this.items.get(index);
    if (!item) throw new Error(`Index ${index} does not exist`);
    $(item).slideFadeOut(function () { $(this).remove() });
  }
  remove_by_value(value, time = 400) {
    if (value.is_array()) {

      for (const val of value) {
        log(`Remove from List ${val}`, { val, value, time });
        this.remove_by_value(val, time);
      }
    } else {
      let item = this.items.get().filter(i => $(i).data('value') == value);
      if (item.isEmpty()) throw new Error(`Value ${value} does not exist`);
      if (time) $(item).slideFadeOut(time, function () { $(this).remove() });
      else $(item).remove();
      setTimeout(_ => { this.post_add_check() }, time || 0);
    }
  }
  remove_all() { this.items.remove(); this.post_add_check(); }
};
class UpDown {
  constructor(options = {}) {
    this.ele = $("<div/>", { class: 'UpDown flexbox' }).css({ width: '1em', position: 'relative' }.merge(options.ele_css || {}));
    let has_label = options.preLabel || options.postLabel || null;
    let up = new Image(), down = new Image();
    this.src = up.src = down.src = `/images/icons/arrow_down_purple.png`;
    $(up).css({ transform: 'rotate(180deg)', opacity: 0.5, width: '1em', height: '1em', cursor: 'pointer' }).addClass('up');
    $(down).css({ opacity: 0.5, width: '1em', height: '1em', cursor: 'pointer' }).addClass('down');
    $(up).add(down).addOpacityHover();
    this.ele.append(up, down);
    let css = options.css || null, action = options.action || null, callback = options.callback || null;
    if (action) {
      if (typeof action == 'function') this.action = action;
      else if (this[action] && typeof this[action] == 'function') this.action = this[action].bind(this);
      else log({ error: 'invalid action', options: options });
    }
    if (callback) {
      if (typeof callback == 'function') this.callback = callback;
      else if (this[callback] && typeof this[callback] == 'function') this.callback = this[callback].bind(this);
      else log({ error: 'invalid callback', options: options });
    }
    let updown = this;
    // if (this.action == )
    if (this.action) {
      this.ele.on('mousedown touchstart', '.up, .down', function (ev) {
        if (updown.action) updown.action(ev);
      })
    }
    if (this.callback && action != 'change_order') {
      this.ele.on('mouseup mouseleave touchend', '.up, .down', function (ev) {
        if (updown.callback) updown.callback(ev);
      })
    }
    this.selector = options.selector || null;

    if (has_label) {
      let classes = 'arrowLabel', labelClass = ifu(options.labelClass, null);
      if (labelClass) classes += ` ${options.labelClass}`;
      this.label = $('<span/>', { class: classes }).css({
        padding: '0 0.5em',
        color: 'var(--purple)',
        opacity: 0,
        transition: 'opacity 400ms',
        position: 'absolute',
        whiteSpace: 'nowrap',
      });
      if (options.preLabel) this.label.css({ right: '100%' });
      else this.label.css({ left: '100%' });
      let label = this.label;
      $(up).add(down).on('mouseenter', function () { $(this).closest('.UpDownWrap').find('.arrowLabel').addClass('opacity80Flash').css({ opacity: 0.3 }) })
        .on('mouseleave', function () { $(this).closest('.UpDownWrap').find('.arrowLabel').removeClass('opacity80Flash').css({ opacity: 0 }) });
      this.wrapper = $('<div/>', { class: 'flexbox nowrap UpDownWrap' }).append(this.ele);
      if (options.labelCss && options.labelCss.json_if_valid()) this.label.css(options.labelCss.json_if_valid());
      if (options.preLabel) this.label.text(options.preLabel).prependTo(this.wrapper);
      else this.label.text(options.postLabel).appendTo(this.wrapper);
      this.ele = this.wrapper;
    }
    if (css) this.ele.css(css);
  }
  change_order(ev) {
    try {
      let arrow = $(ev.target), target = this.selector ? arrow.closest(this.selector) : arrow.closest('.UpDownWrap').parent(), parent = target.parent(), all_to_sort = this.selector ? parent.children(this.selector) : parent.children();
      if (target.dne()) throw new Error('cant resolve target for change order');
      log({ arrow, target, all_to_sort }, 'CHANGE ORDER');
      UpDown.set_indices(all_to_sort);
      if (arrow.hasClass('up')) UpDown.shift_index_up(target, all_to_sort);
      if (arrow.hasClass('down')) UpDown.shift_index_down(target, all_to_sort);
      UpDown.sort(all_to_sort);
      UpDown.unset_indices(all_to_sort);
    } catch (error) {
      log({ error, updown: this, ev });
    }
    if (this.callback) this.callback(ev);
  }
  static sort(all_to_sort) {
    let parent = all_to_sort.first().parent();
    all_to_sort.sort(UpDown.dec_sort).appendTo(parent);
  }
  static dec_sort(a, b) { return ($(b).data('index')) < ($(a).data('index')) ? 1 : -1; }
  static set_indices(all_to_sort, method = 'index') {
    if (method == 'index') all_to_sort.each((i, item) => $(item).data('index', i));
  }
  static unset_indices(all_to_sort) { all_to_sort.removeData('index'); }
  static shift_index_up(target, all_to_sort) {
    let prev = target.prev();
    if (prev.dne() || prev.is('.no_sort')) return;
    prev.data().index++;
    target.data().index--;
  }
  static shift_index_down(target, all_to_sort) {
    let next = target.next();
    if (next.dne() || next.is('.no_sort')) return;
    next.data().index--;
    target.data().index++;
  }
};
class Toggle {
  constructor(options = {}) {
    try {
      if (options instanceof jQuery && options.is('.toggle_proxy')) {
        let ele = options, data = options.data('options') || options.data();
        options = { toggle_ele: ele }.merge(data);
      }
      this.define_by(options);
      ['toggle_ele', 'target_ele'].forEach(o => { if (!this[o]) throw new Error(`.Toggle missing "${o}"`) });
      this.toggle_ele = $(options.toggle_ele).data({ class_obj: this })
      this.toggle_ele.addClass(`${this.toggle_ele_class_list || ''} Toggle`);
      // if (this.target.is('.form')) this.toggle_ele.addClass('lined');
      this.target.addClass('target_ele').data({ Toggle: this });

      this.callback_hide = options.callback_hide || null;
      this.callback_show = options.callback_show || null;
      this.initial_state = options.initial_state || 'visible';
      this.hover_text = ifu(options.hover_text, null);

      let color = this.color = this.color || 'purple';
      this.arrow_position = options.arrow_position || 'left';
      if (this.toggle_ele.find('.arrow').exists()) this.arrow = this.toggle_ele.find('.arrow')[0];
      else {
        const arrow_size = this.arrow_size || 1;
        this.arrow = new Icon({ type: 'arrow', size: arrow_size, color, dir: 'down' });
      }
      this.text = this.toggle_ele.text().trim();
      this.text_ele = $(`<div/>`, { text: this.text, class: 'toggleText' });

      $(this.toggle_ele).addClass(color).on('click', _ => {
        let hide_me = this.target.is(':visible');
        if (hide_me) this.hide();
        else this.show();
      });
      if (this.arrow_position == 'left') {
        this.toggle_ele.addClass('toggle_ele flexbox left').html('').prepend(this.arrow.img, this.text_ele);
        this.target.addClass('left');
      } else if (this.arrow_position == 'below') {
        this.toggle_ele.addClass('toggle_ele below').html('').prepend(this.text_ele, this.arrow.img);
        $(`<div>`, { class: 'flexbox' }).insertBefore(this.arrow.img).append(this.arrow.img);
      }
      if (this.wrap) {
        log({ error: new Error('wrapping a Toggle why??') });
        // let wrap = $(`<div/>`).css(this.wrap_css || {});
        // this.toggle_ele.wrap(wrap);
      }
      this.to_initial_state();
    } catch (error) {
      log({ error, options }, `toggle constructor error`);
    }
  }
  to_initial_state(time = 0) {
    if (this.initial_state == 'hidden') this.hide(time);
    else this.show(time);
  }
  get target() {
    try {
      let target = $(this.target_ele);
      if (target.dne()) target = $(`#${this.target_ele}`);
      if (target.dne()) target = $(`.${this.target_ele}`);
      if (target.dne()) throw new Error('toggle target not found;');
      else if (!target.isSolo() && !this.allow_multi) throw new Error(`${target.length} targets found, 'allow_multi' flag not enabled`);
      if (this.extra_targets) target = target.add(this.extra_targets);
      return target;
    } catch (error) {
      log({ target_ele: this.target_ele, this: this, error });
      return $();
    }
  }
  async show(time = 400) {
    if (this.is_disabled) return;
    let arrow_left = this.arrow_position == 'left', angle = 0;
    if (arrow_left) angle = '0';
    else angle = '180';
    this.target.slideFadeIn(time);
    this.toggle_ele.addClass('showing');
    if (this.visible_text) this.text_ele.text(this.visible_text);
    KeyValueBox.realign(this.target);
    $(this.arrow).css({ transform: `rotate(${angle}deg)` });
    if (this.callback_show && typeof this.callback_show == 'function') this.callback_show();
    await this.target.promise();
    return this;
  }
  async hide(time = 400) {
    let arrow_left = this.arrow_position == 'left', angle = 0;
    if (arrow_left) angle = '-90';
    this.target.slideFadeOut(time);
    this.toggle_ele.removeClass('showing');
    if (this.hidden_text) this.text_ele.text(this.hidden_text);
    $(this.arrow).css({ transform: `rotate(${angle}deg)` });
    if (this.callback_hide && typeof this.callback_hide == 'function') this.callback_hide();
    return this;
  }
  disable(options = {}) {
    let message = options.message;
    this.hide(0);
    this.is_disabled = true; this.toggle_ele.addClass('disabled');
    if (message) {
      let tt = this.tooltip;
      if (tt) tt.enable();
      else this.tooltip = new ToolTip({
        target: this.toggle_ele,
        click_toggle: true,
        color: this.color,
        with_arrow: false,
        no_clear_x: true,
        fade_timeout: 3000,
      }.merge(options));
    }
  }
  enable(options = {}) {
    this.is_disabled = false; this.toggle_ele.removeClass('disabled');
    if (this.tooltip) this.tooltip.disable();
    if (!options.dont_show) this.show(0);
    if (options.message) {
      if (this.message_enable) this.message_enable.remove();
      this.message_enable = this.add_message({ message: options.message });
    }
  }
  set toggle_ele_text(text) { this.text_ele.html(text) }
  get messages() { return this.message_array == undefined ? this.message_array = [] : this.message_array }
  add_message(options = {}) {
    let tag = options.message_tag || this.toggle_ele[0].nodeName, color = options.color || this.color || 'purple';
    let message = $(`<${tag}/>`, { html: options.message, class: `box ${color} toggle_msg` });
    let last = this.target.children('.toggle_msg').last();
    if (last.exists()) message.insertAfter(last);
    else message.prependTo(this.target);

    if (options.class_list) message.addClass(options.class_list);
    this.messages.push(message);
    return message;
  }
  reset_messages() {
    if (this.message_enable) {
      this.message_enable.remove();
      this.message_enable = null;
    }
    if (this.messages) this.messages.forEach(msg => msg.remove());
    this.message_array = [];
  }
  reset(time = 400) {
    this.enable();
    this.to_initial_state(time);
    this.reset_messages();
    if (this.tooltip) this.tooltip.ele.remove();
  }
  static get_all_within(ele) {
    return $(ele).find('.Toggle').get().map(t => $(t).getObj());
  }

  static ele() {
    let response = null;
    try {
      if (!this) throw new Error('must bind this function');
      let ele = $(this);
      if (ele.dne()) throw new Error('ele does not exist');
      let args = [...arguments];
      if (args[0] instanceof Forms.Answer) {
        response = args[0].get();
        if (response) ele.slideFadeIn();
        else ele.slideFadeOut();
        if (typeof response != 'boolean') throw new Error('caution: using non-bool value');
      } else ele.slideFadeToggle();
    } catch (error) {
      log({ error, response, this: this });
    }
  }
};

class ToolTip {
  constructor(options) {
    let tip = this;
    this.define_by(options);
    this.ele = $(`<div/>`).data({ class_obj: this }).addClass('tooltip hidden').appendTo('body');
    this.target = options.target || null;
    if (!this.target && !this.is_warning) throw new Error('target not provided');
    else if (!this.is_warning) {
      let existing = this.target.data('tooltip');
      if (existing) { existing.remove(); }
      this.target.data('tooltip', this);
    }
    if (this.compact) this.define_by({ shadow: 'small', has_arrow: false, no_clear_x: true });

    this.has_arrow = ifu(this.has_arrow, this.with_arrow, true);
    this.shadow = ifu(this.shadow, true);
    // this.hide_on = options.hide_on || '';
    this.translate = { x: 0, y: 0 }.merge(this.translate || {});
    this.mouse = { x: null, y: null };
    if (this.has_arrow) {
      this.triangle = new Icon({ type: 'triangle', size: 1, color: this.color || 'gray' });
      this.ele.append(this.triangle.img);
    }

    this.message_ele = $('<div/>', { class: 'message_ele' });
    this.ele.append(this.message_ele);

    const classList = this.class || this.class_list;
    if (classList) this.ele.addClass(classList);
    if (this.message) this.message_append(this.message);
    if (this.shadow == 'small') this.ele.addClass('shadow shadow_small');
    else if (this.shadow) this.ele.addClass('shadow');
    if (this.match_target_color) {
      let target_bg = this.target.css('background-color');
      this.ele.css({ borderColor: target_bg });
      if (this.has_arrow) {
        this.triangle.ele.setAttribute('fill', target_bg);
        this.triangle.ele.setAttribute('stroke', this.target.css('border-color'));
        this.triangle.ele.setAttribute('stroke-width', 6);
      }
    } else if (this.color) {
      this.ele.addClass(`${this.color}`);
      if (this.has_arrow) this.triangle.img.addClass(this.color);
    }

    if (!this.is_warning) {
      let drag = this.drag.bind(this),
        drag_start = ev => {
          this.drag_start_mouse = { x: ev.pageX, y: ev.pageY };
          this.drag_start_ele = this.pos;
          $(document).on('mousemove touchmove', drag);
        }, drag_stop = _ => { $(document).off('mousemove touchmove', drag) },
        track = this.track.bind(this),
        track_start = ev => {
          this.mouse_x = ev.pageX;
          $(document).on('mousemove touchmove', track);
        }, track_stop = _ => { $(document).off('mousemove touchmove', track) },

        show = ToolTip.show.bind(this),
        hide = ToolTip.hide.bind(this);

      this.ele_pair = this.ele.add(this.target);
      this.is_input = this.target.is('input, textarea') && this.target.attr('type') != 'range';
      if (this.click_toggle) {
        this.target.on('click', _ => { this.toggle() }).on('mouseleave', hide).addClass('clickable');
        this.ele.on('mouseenter', show).on('mouseleave', hide);
      } else if (this.is_input) {
        this.target.on('focus click', show);
        this.ele.on('mouseenter', show);
        this.ele_pair.on('mouseleave', hide);
      } else this.target.on('mousemove touchmove', show);

      if (!this.click_toggle && !this.is_input) this.ele_pair.on('mouseenter', show).on('mouseleave', hide);
      this.ele.on('mousedown touchstart', drag_start).on('mouseup touchend', drag_stop);
      if (this.track_mouse) {
        this.target.on('mousedown touchstart', track_start).on('mouseup touchend', track_stop);
        this.target.on('click', ev => {
          this.mouse_x = ev.pageX;
          this.move();
        })
      }

      this.remove = () => {
        if (this.target.is('input, textarea')) this.target.off('focus click', show).off('blur', hide);
        else this.target.off('mousemove touchmove', show);
        this.ele_pair.off('mouseenter', show).off('mouseleave', hide);
        this.ele.off('mousedown touchstart', drag_start).off('mouseup touchend', drag_stop);
        this.ele.remove();
        let i = ToolTip.list.findIndex(t => t == this);
        ToolTip.list.splice(i, 1);
      }

      if (!this.no_clear_x) {
        this.clear_x = new Icon({ type: 'styled_x', size: 0.75 });
        this.clear_x.img.addClass('tooltip_clear').on('click', hide).appendTo(this.ele);
      }
    }

    ToolTip.list.push(this);
  }


  get is_visible() { return this.ele.hasClass('visible') }
  get is_in_top_blur() { return this.target.isInside(Blur.top) }
  prevent_next_hide() { this.prevent_hide = true; return this; }
  message_append(msg) {
    if (typeof msg == 'object') {
      let is_jquery = msg instanceof jQuery;
      if (!is_jquery) msg = msg.to_key_value_html();
    }
    this.message_ele.append(msg);
  }
  message_reset(msg) { this.message_ele.html(''); this.message_append(msg) }
  disable() { this.disabled = true }
  enable() { this.disabled = false }
  move(animate = false, time = 100) {
    // if (this.dragged_to) return;
    let pos = this.position_new;
    if (animate) this.ele.animate(pos, time, _ => { this.reposition_triangle() });
    else {
      this.ele.css(pos);
      this.reposition_triangle();
    }
  }
  show(ev) {
    this.ele.removeClass('hidden').addClass('visible');
    if (this.target.isInside('.blur')) this.ele.addClass('tooltip_blur');
    else this.ele.removeClass('tooltip_blur');
    this.move();
  }
  hide(time = 800) {
    if (!this.is_visible || this.persist) return;
    this.ele.removeClass('visible');
    setTimeout(_ => { if (!this.ele.hasClass('visible')) this.ele.addClass('hidden') }, time)
    // log({tt:this});
    if (this.on_hide && typeof this.on_hide == 'function') this.on_hide();
  }
  toggle() {
    if (this.is_visible) { this.disable(); this.hide(); }
    else { this.enable(); this.show(); }
  }

  static show(ev) {
    if (this.disabled || !this.is_in_top_blur) return;
    clearTimeout(this.hide_timer);
    if ($('.tooltip.visible').exists()) return;
    if (this.is_visible) return;
    this.show();
  }
  static hide(ev, time = 800, delay = 250) {
    ToolTip.hide_me.push(this);
    this.hide_timer = setTimeout(_ => {
      this.hide(time);
    }, delay)
  }
  static get hide_me() { return ToolTip.hide_me_array == undefined ? ToolTip.hide_me_array = [] : ToolTip.hide_me_array; }

  drag(ev) {
    let mouse_start = this.drag_start_mouse, ele_start = this.drag_start_ele, mouse_now = { x: ev.pageX, y: ev.pageY },
      diff = { x: mouse_now.x - mouse_start.x, y: mouse_now.y - mouse_start.y };
    let box_ele = this.ele[0].getBoundingClientRect();
    let next = { x: ele_start.x + ele_start.width * 0.5 - box_ele.width * 0.5 + diff.x, y: ele_start.y + diff.y };
    if (Math.abs(diff.x) > 10 || Math.abs(diff.y) > 10) {
      this.dragged_to = next;
      this.ele.css({ left: next.x, top: next.y, right: 'unset' });
      this.reposition_triangle();
    }
  }
  track(ev) {
    let diff = this.mouse_x - ev.pageX;
    if (Math.abs(diff) > 10) {
      this.mouse_x = ev.pageX;
      this.move();
    }
  }
  input_blur(ev) { if (ev.relatedTarget && !$(ev.relatedTarget).isInside('.tooltip')) this.hide(ev) }
  get pos() { return this.ele[0].getBoundingClientRect() }
  get target_pos() { return this.target[0].getBoundingClientRect() }
  get is_above_target() { return this.pos.top < this.target_pos.top }
  get is_below_target() { return this.pos.bottom > this.target_pos.bottom }
  get is_fully_above_target() { return this.pos.bottom <= this.target_pos.top }
  get is_fully_below_target() { return this.pos.top >= this.target_pos.bottom }
  get diff_centers() {
    let ele = this.pos, ele_center = { x: ele.x + ele.width * 0.5, y: ele.y + ele.height * 0.5 },
      target = this.target_pos, target_center = { x: target.x + target.width * 0.5, y: target.y + target.height * 0.5 },
      x = target_center.x - ele_center.x, y = target_center.y - ele_center.y,
      top_to_center = target_center.y - ele.top;
    return { x, y, top_to_center };
  }
  get diff_edges() {
    let ele = this.pos, target = this.target_pos, pad = get_rem_px(), half_target_w = target.width * 0.5,
      to_right = ele.left + pad > target.right - half_target_w, to_left = ele.right - pad < target.left + half_target_w,
      far_right = ele.left > target.right, far_left = ele.right < target.left;
    let x = { right: ele.left - target.right, left: ele.right - target.left },
      y = { top: ele.bottom - target.top, bottom: ele.top - target.bottom };
    let cis = {};
    ['left', 'right', 'top', 'bottom'].forEach(s => cis[s] = ele[s] - target[s]);
    let within = {
      left: cis.left >= 0, top: cis.top >= 0, right: cis.right <= 0, bottom: cis.bottom <= 0
    };

    return { to_right, to_left, far_right, far_left, x, y, cis, within };
  }
  reposition_triangle(animate = false) {
    if (!this.has_arrow) return;
    let fully_above = this.is_fully_above_target, fully_below = this.is_fully_below_target, center = this.diff_centers, edges = this.diff_edges;
    let rotation_deg = 0, translateX = '-50%', translateY = '0', left, right, top, bottom, angle = { y: null, x: null, deg: null };
    left = right = top = bottom = 'unset';

    if (fully_above) { rotation_deg = 180; bottom = 0; angle.y = edges.y.top; }
    else if (fully_below) { translateY = '-100%'; top = 0; angle.y = edges.y.bottom; }
    else { if (center.y < 0) { rotation_deg = 180; top = -2; } else { bottom = 0; } }

    if (edges.far_right) {
      left = 0; angle.x = edges.x.right;
      if (angle.y === null) {
        rotation_deg -= center.y > 0 ? 90 : 270; top = `clamp(min(${Math.abs(edges.y.bottom)}px , calc(0.5em + 3px)), ${center.top_to_center}px, max(calc(100% - ${Math.abs(edges.y.top)}px), calc(100% - 0.5em - 3px)))`;
        translateY = '-100%';
      } else if (angle.y === 0) rotation_deg += 180;
    } else if (edges.to_right) { left = `min(${Math.abs(edges.x.right)}px , calc(0.5em + 3px))`; }
    else if (edges.far_left) {
      right = 0; angle.x = edges.x.left; translateX = '50%';
      if (angle.y === null) {
        rotation_deg += center.y > 0 ? 90 : 270; top = `clamp(min(${Math.abs(edges.y.bottom)}px , calc(0.5em + 3px)), ${center.top_to_center}px, max(calc(100% - ${Math.abs(edges.y.top)}px), calc(100% - 0.5em - 3px)))`;
        translateX = '50%'; translateY = '-100%';
      }
    } else if (edges.to_left) { right = `min(${Math.abs(edges.x.left)}px , calc(0.5em + 3px))`; translateX = '50%'; }
    else { this.triangle.img.css({ left: `calc(50% + ${center.x}px)` }); left = `calc(50% + ${center.x}px)`; }

    if (angle.x !== null && angle.y != null) {
      angle.deg = Math.atan(Math.abs(angle.x) / Math.abs(angle.y)) / Math.DEG_PER_RAD;
      let add_me = angle.x > 0 ? angle.y < 0 : angle.y > 0;
      rotation_deg = (add_me ? rotation_deg + angle.deg : rotation_deg - angle.deg).toFixed(2);
    }
    if (!fully_above && !fully_below && !edges.far_right && !edges.far_left) {
      let e = edges.cis, pos = 'NONE', abs = (a, b) => Math.abs(a) > Math.abs(b), w = edges.within, max = 1000;
      if (w.left) {
        if (w.top) pos = abs(e.left, e.top) ? 'left' : 'top';
        else if (w.bottom) pos = abs(e.left, e.bottom) ? 'left' : 'bottom';
        else pos = 'left';
      } else if (w.right) {
        if (w.top) pos = abs(e.right, e.top) ? 'right' : 'top';
        else if (w.bottom) pos = abs(e.right, e.bottom) ? 'right' : 'bottom';
        else pos = 'right';
      } else if (w.top) pos = 'top';
      else if (w.bottom) pos = 'bottom';
      else { ['left', 'right', 'top', 'bottom'].forEach(p => { if (abs(max, e[p])) { pos = p; max = e[p] } }); }

      if (pos == 'left') {
        left = 0; right = 'unset'; top = `clamp(min(${Math.abs(edges.y.bottom)}px , calc(0.5em + 3px)), ${center.top_to_center}px, max(calc(100% - ${Math.abs(edges.y.top)}px), calc(100% - 0.5em - 3px)))`; translateY = '-100%'; rotation_deg = 90;
      } else if (pos == 'right') {
        right = 0; left = 'unset'; top = `clamp(min(${Math.abs(edges.y.bottom)}px , calc(0.5em + 3px)), ${center.top_to_center}px, max(calc(100% - ${Math.abs(edges.y.top)}px), calc(100% - 0.5em - 3px)))`; translateX = '50%'; translateY = '-100%'; rotation_deg = -90;
      } else if (pos == 'top') {
        translateY = '-100%';
      }
    }

    if (animate) this.triangle.img.css({ transform: `translate(${translateX},${translateY}) rotate(${rotation_deg}deg)` }).aniamte({ left, right, top, bottom });
    else this.triangle.img.css({ left, right, top, bottom, transform: `translate(${translateX},${translateY}) rotate(${rotation_deg}deg)` });
  }
  get position_new() {
    let rem = get_rem_px();
    let pad_size = this.has_arrow ? rem + 2 : rem * .5, box_ele = this.ele[0].getBoundingClientRect(), box_target = this.target[0].getBoundingClientRect(), v = view(),
      border = {
        right: (box_target.x + box_target.width * 0.5) + box_ele.width * 0.5 + system.ui.scroll.bar_width() + this.translate.x,
        left: (box_target.x + box_target.width * 0.5) - box_ele.width * 0.5 + system.ui.scroll.bar_width() + this.translate.x,
        bottom: box_target.bottom + box_ele.height + pad_size + this.translate.y,
        top: box_target.top - box_ele.height - pad_size + this.translate.y,
      }, pos_adjusted = {
        top: (border.top > pad_size) ? border.top : (border.bottom > v.height - pad_size) ? pad_size : box_target.bottom + pad_size + this.translate.y
      };
    // log({pos_adjusted},`${pos_adjusted.top}`);
    let ideal = box_target.x + box_target.width * 0.5 - box_ele.width * 0.5 + this.translate.x;
    if (this.position == 'left') ideal = box_target.left;
    if (this.track_mouse && this.mouse_x) {
      ideal = this.mouse_x - box_ele.width * 0.5;
      if (ideal > box_target.right - box_ele.width) ideal = box_target.right - box_ele.width;
      if (ideal < box_target.left) ideal = box_target.left;
    }
    let max = v.width - pad_size - box_ele.width;
    let left = ideal <= pad_size ? pad_size : max < ideal ? max : ideal;
    pos_adjusted.left = left;
    this.ele_x = left;
    return pos_adjusted;
  }

  set_mouse_pos(ev) { this.mouse = { x: ev.pageX, y: ev.pageY }; }
  hide_all_others() { $('.tooltip').filter(':visible').not(this.ele).hide() }
  static get list() { return ToolTip.list_array == undefined ? ToolTip.list_array = [] : ToolTip.list_array }
  static hide_all() {
    let this_tt = this != undefined && this instanceof ToolTip ? this : null;
    ToolTip.list.filter(tt => tt.is_visible && tt != this_tt).forEach(tt => ToolTip.hide.bind(tt)(undefined, undefined, 0));
  }
};
class Warning {
  constructor(options = {}) {
    this.defaults = {};
    this.define_by(options);
    this.tooltip = new ToolTip({ is_warning: true, has_arrow: false, color: 'pink', position: 'left' }.merge(options));
  }
  show(options = {}) {
    if (options.message) this.tooltip.message_reset(options.message);
    if (options.target) this.tooltip.target = options.target;
    let class_list = options.warning_class || this.warning_class || null;
    // log({ class_list, tt: this.tooltip });
    this.tooltip.show();
    clearTimeout(this.hide_timer);
    if (class_list) this.target.addClass(class_list);
    if (!this.no_fade && !options.no_fade) {
      this.hide_timer = setTimeout(_ => {
        this.tooltip.hide();
      }, options.time || this.time || 3000);
    }
  }
};
class Banner {
  constructor(options = {}) {
    if (!Banner.Container || Banner.Container.dne()) {
      Banner.Container = $('<div/>', { id: 'BannerContainer' }).appendTo('body');
    }
    this.define_by(options);

    if (!this.ele) this.ele = $('<div/>', { class: 'Banner box' }).appendTo('body').hide();
    else this.ele.addClass('Banner box');
    if (!this.message) this.message = this.text || 'HELLO';
    if (this.id) this.ele.attr({ id: this.id });
    this.ele.append(this.message).data({ 'class_obj': this, initialized: true }).appendTo(Banner.Container);
    this.ele.css(this.css || {});
    this.hide_onclick = ifu(this.hide_onclick, true);
    this.position = this.position || null;
    if (this.position) this.ele.css(this.position);
    if (this.color) this.ele.addClass(this.color);
    if (this.class_list) this.ele.addClass(this.class_list);
    if (this.onclick) this.ele.on('click', this.onclick).css({ cursor: 'pointer' });
    if (this.hide_onclick) this.ele.on('click', this.hide).css({ cursor: 'pointer' });
    // if (this.message == 'HELLO') this.initial_state = 'hide';
    if (this.initial_state) {
      if (this.initial_state == 'hide') this.hide(0);
      else if (this.initial_state == 'fadein') this.show();
      else if (this.initial_state == 'show') this.show(0);
      else if (this.initial_state == 'flash') this.flash();
    }
  }
  static now(options = {}) {
    try {
      if (!options.message && !options.text) throw new Error('No message for banner');
      const banner = new Banner({ initial_state: 'flash', ...options });
      return banner;
    } catch (error) {
      log({ error, options });
    }

  }
  static error(options = {}) {
    if (typeof options === 'string') options = { message: options };
    log(`${options.message}`, { error: options });
    const banner = Banner.now({ initial_state: 'fadein', ...options, color: 'pink' });
    return banner;
  }
  // static get pink () { return {backgroundColor: 'var(--pink10o)',borderColor:'var(--pink70)',color:'var(--pink)'} }
  // static get green () { return {backgroundColor: 'var(--green10o)',borderColor:'var(--green70)',color:'var(--green)'} }
  color_change(color) {
    this.ele.removeClass('pink green yellow purple');
    this.ele.addClass(color);
  }
  color_reset() { if (this.color) this.color_change(this.color) }

  flash(options = {}) {
    let b = this, time = options.time_stay || this.time_stay || 5000,
      time_in = options.time_in || this.time_in || 400,
      time_out = options.time_out || this.time_out || 400,
      callback_show = options.callback_show || this.callback_show || null,
      callback_hide = options.callback_hide || this.callback_hide || null;
    this.show({ time: time_in, callback: callback_show, position: options.position || null });
    setTimeout(function () {
      b.hide({ time: time_out, callback: callback_hide });
    }, time_in + time);
  }
  show = async (options = {}, callback = null) => {
    if (typeof options == 'number') options = { time: options };
    else if (typeof options == 'function') options = { callback: options };

    if (options.position) {
      this.position = options.position;
      this.ele.css(this.position);
    }
    if (options.message) this.message_update(options.message);
    let time = options.time || this.time_in || 400, fx = callback || options.callback || this.callback_show || null;
    if (!this.position) this.ele.appendTo(Banner.ContainerRepo());
    this.ele.fadeIn(time, callback);
    return new Promise(resolve => setTimeout(_ => { resolve(true); }, time));
  }
  hide = (options = {}, callback = null) => {
    if (typeof options == 'number') options = { time: options };
    else if (typeof options == 'function') options = { callback: options };
    let time = options.time || this.time_out || 400;
    callback = callback || options.callback || this.callback_hide || null;
    if (this.ele.is(':visible')) this.ele.slideFadeOut(time, callback);
    else if (callback) callback();
  }
  message_update(message) { this.ele.html(''); this.ele.append(...arguments); return this; }
  message_append(message) { this.ele.append(...arguments); return this; }
  onclick_update(fx = null) {
    if (this.onclick) this.ele.off('click', this.onclick).css({ cursor: 'default' });
    if (fx) { this.onclick = fx; this.ele.on('click', this.onclick).css({ cursor: 'pointer' }); }
    return this;
  }
  static ContainerRepo() {
    if (!Banner.Container) return;
    try {
      let blur_top = Blur.top, rect = blur_top[0].getBoundingClientRect();
      if (blur_top.is('body')) Banner.Container.css({ right: '3em', top: '4em' });
      else {
        const { left: right, top } = rect;
        Banner.Container.css({ right: right + 30, top: top + 20 });
      }
    } catch (error) {
      log({ error })
    }
  }
}

class Notification {
  constructor(json, position = null) {
    if (Notification.List) {
      if (!Notification.List.json.find(n => n.id === json.id)) Notification.List.json.push(json);
      if (Notification.List.find_by_value(json.id).exists()) return;
    }
    this.define_by(json);
    this.lux = {
      created: LUX.From.db(this.created_at),
      read: this.read_at ? LUX.From.db(this.read_at) : null,
    };
  }
  open() {
    let modal = Notification.OptionBox, modal_ele = Notification.OptionBox.ele;

    modal.reset_header(`${this.data.type}<br>${this.data.description}`).reset_info();
    if (this.data.buttons) {
      modal.remove_buttons();
      this.data.buttons.forEach(b => modal.add_button(b));
    }
    let info = this.data.details || {};
    if (info.location) modal.header.append(`<br>${info.location}`);
    if (info.details) modal.add_info(info.details);
    this.mark_as_read();
    this.ele.addClass('active');
    blurTop(modal_ele);
  }
  mark_as_read() { Notification.mark_as_read([this.id]) }
  mark_as_unread() { Notification.mark_as_unread([this.id]) }
  delete() { Notification.delete([this.id]) }
  get list_transform() {
    try {
      this.title = $('<span/>', { text: this.data.type, css: { flexGrow: '1', margin: '0 1em 0 1.5em', textAlign: 'left' } });
      this.datetime = $('<span/>', { text: this.lux.created.date_or_time });
      this.icon_box = Notification.icon_box(this);
      this.indicator = $('<div/>', { class: 'indicator unread' });
      if (this.lux.read) this.indicator.removeClass('unread');
      Notification.last = this;
      let list_options = {
        value: this.id,
        append: [this.title, this.datetime, this.icon_box, this.indicator],
      };
      if (this.position == 'top') list_options.position = 'top';
      return list_options;
    } catch (error) {
      log({ error, this: this });
      return false;
    }
  }
  static list_transform(json) {
    let notification = new Notification(json);
    return notification.list_transform;
  }
  static post_add_fx(item) {
    Notification.check_height();
    // Notification.update_indicator();
    if (!item) return;
    Notification.last.ele = item;
  }
  static description_format(key, value) {
    value = system.validation.json(value)
    let type = typeof value;
    if (type == 'object' && value.is_array()) type = 'array';
    if (['string', 'number'].includes(type) || value instanceof jQuery) return value;
    // else if (type == 'array') {
    //   return $(`<div/>`,{class:'flexbox column left'}).append(...value);
    // }
    // else if (type == 'object') return value.to_key_value_html()

    else {
      // log({key,value});
      // if (typeof value == 'object' && )

      return Notification.description_format_recursive(value);
      // return (new KeyValueBox({
      //   json, include_null:true,
      //   empty_array_placeholder:'empty array',
      //   transform_fx:Notification.format_nest, 
      //   // value_css: {wordBreak:'break-word',minWidth:'clamp(50%, 40em, 85%)'},
      //   // pair_css: {padding:'0.1em'}
      // })).ele; 
    }
  }
  static description_format_recursive(key, value) {
    let json = system.validation.json(value);
    if (['string', 'number'].includes(typeof value) || json instanceof jQuery) return value;
    else {
      return (new KeyValueBox({
        json, include_null: true, inline_values: true,
        empty_array_placeholder: 'empty array',
        transform_fx: Notification.format_nest,
        // box_css: {justifyContent:'flex-start'},
        // key_css: {alignSelf:'center'},
        // value_css: {wordBreak:'break-word',borderRadius:'5px',border:'1px solid var(--gray50',margin:'2px',padding:'2px 4px'},
        // pair_css: {width:'unset',padding:'0.1em',border:'unset'}
      })).ele;
    }
  }

  static get all() { return Notification.List.items.not('.no_items') }
  static get selected_eles() { return Notification.List.active }
  static get selected_ids() { return Notification.List.active_values }
  static icon_box(notification) {
    let open = new Icon({
      type: 'open', size: 1.5, alt: 'open', title: 'open', action: _ => {
        notification.open();
      }
    }),
      del = new Icon({
        type: 'styled_x', size: 1.5, alt: 'delete', title: 'delete', action: _ => {
          notification.delete();
        }
      }),
      check = new Icon({
        type: 'checkmark', size: 1.5, alt: 'mark as read', title: 'mark as read', action: _ => {
          notification.mark_as_read();
        }
      });
    let box = $('<div/>', { class: 'flexbox notification_options' });
    return box.append(open.img, check.img, del.img);
    // return {indicator, open:open.img.addOpacityHover(), check:check.img.addOpacityHover(), del:del.img.addOpacityHover()};
  }
  static alert(count) {
    Notification.sound.play().catch(error => { });
  }
  static ele_by_ids(id_array) { return Notification.List.find_by_value(id_array) }
  static async mark_as_read(id_array = null) {
    let not_given = id_array === null || id_array instanceof jQuery.Event, n = Notification;
    let ids = not_given ? n.selected_ids : id_array, eles = not_given ? n.selected_eles : n.ele_by_ids(id_array);
    // log({ids});
    if (!ids) return;
    if (ids.is_array() && ids.isEmpty()) {
      Notification.none_selected.show({ ele: $(this) });
      return;
    }
    eles.find('.unread').removeClass('unread');
    let result = await $.ajax({
      method: 'POST',
      url: '/notification-update',
      data: { status: 'read', ids },
      success: function (result) {
        if (result != 'checkmark') {
          eles.find('.indicator').addClass('unread');
          feedback('Error', 'There was an error updating the selected notifications');
        }
      },
      error: function () {
        eles.find('.indicator').addClass('unread');
        feedback('Error', 'There was an error updating the selected notifications');
      }
    })
    n.update();
  }
  static async mark_as_unread(id_array = null) {
    let not_given = id_array === null || id_array instanceof jQuery.Event, n = Notification;
    let ids = not_given ? n.selected_ids : id_array, eles = not_given ? n.selected_eles : n.ele_by_ids(id_array);
    if (!ids) return;
    if (ids.is_array() && ids.isEmpty()) {
      Notification.none_selected.show({ ele: $(this) });
      return;
    }
    eles.find('.indicator').addClass('unread');
    let result = await $.ajax({
      method: 'POST',
      url: '/notification-update',
      data: { status: 'unread', ids },
      success: function (result) {
        if (result != 'checkmark') {
          eles.find('.indicator').removeClass('unread');
          feedback('Error', 'There was an error updating the selected notifications');
        }
      },
      error: function () {
        eles.find('.indicator').removeClass('unread');
        feedback('Error', 'There was an error updating the selected notifications');
      }
    })
    n.update_indicator(false);
  }
  static async delete(id_array = null) {
    let not_given = id_array === null || id_array instanceof jQuery.Event, n = Notification;
    let ids = not_given ? n.selected_ids : id_array, eles = not_given ? n.selected_eles : n.ele_by_ids(id_array);
    if (!ids) return;
    if (ids.is_array() && ids.isEmpty()) {
      Notification.none_selected.show({ ele: $(this) });
      return;
    }
    eles.slideFadeOut();
    n.dropdown.data('hold', true);
    setTimeout(function () { n.dropdown.removeData('hold') }, 500);
    let result = await $.ajax({
      method: 'POST',
      url: '/notification-delete',
      data: { ids },
      success: function (result) {
        if (result != 'checkmark') {
          eles.slideFadeIn();
          feedback('Error', 'There was an error deleting the selected notifications');
        } else {
          eles.remove();
          if (n.all.dne()) n.list.ele.find('.no_items').show();
        }
      },
      error: function () {
        eles.slideFadeIn();
        feedback('Error', 'There was an error deleting the selected notifications');
      }
    })
    log({ all: n.all });
    n.check_height();
  }
  static trigger_retrieve() {
    if (Notification.retrieve_timer) clearTimeout(Notification.retrieve_timer);
    Notification.retrieve_timer = setTimeout(Notification.retrieve, 2000);
  }
  static async retrieve() {
    let ids = Notification.List.json.map(json => json.id);
    Notification.retrieve_xhr = $.ajax({
      method: 'POST',
      url: '/notification-retrieve',
      data: { ids },
      success: function (response) {
        response.forEach(json => new Notification(json));
      },
      complete: function () {
        clearInterval(Notification.retrieve_interval);
        Notification.retrieve_interval = setInterval(Notification.retrieve, 3 * 60 * 1000);
      }
    })
  }
  static select_all() { Notification.List.items.not('.no_items').addClass('active') }
  static unselect_all() { Notification.List.items.removeClass('active') }
  static check_height() {
    if (!Notification.List) return;
    let up = Notification.up_arrow.img, down = Notification.down_arrow.img, both = up.add(down);
    if (Notification.too_tall) {
      both.show();
    } else both.hide();
  }
  static get too_tall() { return Notification.list_ele.scrollHeight > Notification.list_ele.clientHeight }
  static get at_top() { return Notification.list_ele.scrollTop == 0 }
  static get at_bottom() { return Notification.list_ele.scrollTop == Notification.list_ele.scrollHeight - Notification.list_ele.clientHeight }

  static scroll_up() {
    let top = Notification.List.ul[0].scrollTop, half = Notification.List.ul.height() / 2;
    Notification.List.ul.scrollTo(top - half, 400, { onAfter: Notification.check_height });
  }
  static scroll_down() {
    let top = Notification.List.ul[0].scrollTop, half = Notification.List.ul.height() / 2;
    Notification.List.ul.scrollTo(top + half, 400, { onAfter: Notification.check_height });
  }
  static update() {
    clearTimeout(Notification.update_timeout);
    Notification.update_timeout = setTimeout(Notification.update_indicator, 100);
  }
  static update_indicator(flash_banner = true) {
    let current = Notification.indicator_span.text() || 0,
      count = Notification.dropdown.find('.unread').length,
      diff = count - Number(current);
    if (diff > 0 && flash_banner) {
      Notification.alert();
      let message = `${diff} new messages`, onclick = null;
      if (diff == 1) {
        message = Notification.last.data.type;
        onclick = Notification.last.open.bind(Notification.last);
        if (['Bug', 'Error'].some(t => message.includes(t))) Notification.banner.color_change('pink');
      } else Notification.banner.color_reset();
      Notification.banner.message_update(message).onclick_update(onclick);
      Notification.banner.flash();
    }
    Notification.indicator_span.text(count);
    Notification.header_count.text(`(${count} unread)`);
    if (count == 0) Notification.indicator.addClass('zero');
    else Notification.indicator.removeClass('zero');
    // if (Notification.menu_tab.hasClass('hover') || count == 0) Notification.indicator.removeClass('active');
    // else Notification.indicator.addClass('active');
  }
  static update_list(json) {
    log({ json }, `Notification update`);
  }
  static set menu_ele(ele) {
    // let n = Notification;
    Notification.sound = new Audio('/sounds/notification_1.mp3');
    let tab = Notification.menu_tab = $(ele);
    Notification.dropdown = $(ele).find('.dropdown');
    ele = Notification.dropdown.find('.List');
    Notification.List = new List(ele.data('options').merge({
      ele,
      transform_fx: Notification.list_transform,
      post_add_fx: Notification.post_add_fx,
      no_item_text: 'No notifications',
    }));
    Notification.list_ele = Notification.List.ul[0];
    Notification.header_count = $('<h4/>', { class: 'pink' }).insertAfter(Notification.List.header);
    Notification.update();
    Notification.retrieve_interval = setInterval(Notification.retrieve, 3 * 60 * 1000);
    Notification.indicator = $('<div/>', { class: 'indicator' }).appendTo(Notification.menu_tab);
    Notification.indicator_span = $('<span/>').appendTo(Notification.indicator);
    Notification.banner = new Banner({ color: 'green' });
    Notification.OptionBox = new OptionBox({
      id: 'NotificationInfo',
      header_html_tag: 'h1',
      key_value_options: {
        inner: {
          include_null: true,
        }
      },
    });
    Notification.OptionBox.ele.hide();
    Notification.none_selected = new Warning({ text: 'No notifications selected', justified: 'center' });
    Notification.up_arrow = new Icon({ type: 'arrow', size: 1, dir: 'up', class_list: 'max', action: Notification.scroll_up });
    Notification.down_arrow = new Icon({ type: 'arrow', size: 1, dir: 'down', class_list: 'max', action: Notification.scroll_down });
    Notification.up_arrow.img.insertBefore(Notification.List.ul);
    Notification.down_arrow.img.insertAfter(Notification.List.ul);
    Notification.check_height();
    // Notification.List.up = up.img.insertBefore(Notification.List.ul);
    // Notification.List.down = down.img.insertAfter(Notification.List.ul);
  }
}
class Autosave {
  constructor(options = {}) {
    try {
      this.define_by(options);
      if (!this.send) throw new Error(`Autosave must have a 'send' ajax call or a function that returns a promise`);
      // if (!this.obj) log({error: new Error(`Autosave usually has an obj associated with it`)});

      this.show_status = this.show_status || false;
      this.banner = new Banner({
        color: 'green',
        class_list: 'Autosave flexbox',
        initial_state: 'hide'
      });
      this.delay = ifu(this.delay, 10000);
      this.size = this.size || 2;
      this.message = this.message || 'changes saved';
      if (this.obj) this.name = this.obj.attr_list ? this.obj.attr_list.name : this.obj.name || 'nameless';
    } catch (error) {
      log({ error });
    }
  }

  async trigger(options = {}) {
    // console.log('TRIGGER!');
    // log(`Trigger!`, { autosave: this });
    let is_autosave = this instanceof Autosave;
    if (!is_autosave) throw new Error(`'this' must be Autosave but it's not!`);
    let delay = ifu(options.delay, this.delay);
    let pre_countdown_delay = (delay > 5000) ? delay - 5000 : 0;
    let countdown_time = Math.min(5000, delay);
    let start_countdown = async _ => {
      if (!this.circle) this.circle = this.new_circle();
      else this.banner.message_update(this.circle.img);
      this.circle.countdown(countdown_time, false, _ => {
        this.circle.spin();
      });
      this.banner.show(countdown_time);
    }
    let send = async _ => {
      // log({ send: this.send });
      this.result = await this.send();
      if (!this.result) return;
      if (this.show_status) {
        this.circle.clearIntervals();
        if (this.result.error) this.error_x();
        else this.checkmark(options);
        this.hide_timer = setTimeout(_ => { this.banner.hide() }, 5000);
      }

      this.handle_result(options);
    }

    clearTimeout(this.waiting);
    clearTimeout(this.countdown_timer);
    clearTimeout(this.send_timer);
    clearTimeout(this.hide_timer);

    this.banner.color_reset();

    if (this.show_status) {
      if (pre_countdown_delay > 0) {
        this.countdown_timer = setTimeout(start_countdown, pre_countdown_delay);
      } else start_countdown();
    }

    this.send_timer = setTimeout(send, delay);

    return;
  }
  new_circle() {
    let circle = new Icon({ type: 'circle', size: this.size, color: 'green' });
    this.banner.message_update(circle.img);
    return circle;
  }
  checkmark(options = {}) {
    let text = options.message || this.message;
    let message = $(`<span/>`, { text }).css({ fontSize: `${this.size / 2}em`, marginRight: '5px' });
    this.checkmark_ele = new Icon({ type: 'checkmark', size: this.size });
    this.banner.message_update(message, this.checkmark_ele.img);
  }
  error_x(error_message = null) {
    let message = $(`<span/>`, { text: error_message || this.result.error.message }).css({ fontSize: `${this.size / 2}em`, marginRight: '5px' });
    this.error_x = new Icon({ type: 'styled_x', size: this.size });
    this.banner.color_change('pink');
    this.banner.message_update(message, this.error_x.img);
  }
  handle_result(options = {}) {
    if (this.result.list_update && this.obj && this.obj instanceof Models.Model) {
      Models.Model.update_list(this.obj.type, this.result.list_update);
    }
    let callback = options.callback || this.callback;
    if (callback) {
      if (this.result.save_result) callback(this.result.save_result);
      else callback(this.result);
    }
  }
};
class Icon {
  constructor(options) {
    try {
      if (!options.type) throw new Error('type must be given');
      if (!Icon[options.type]) throw new Error(`Icon.${options.type} does not exist`);
      this.define_by(options);
      this.define_by(Icon[this.type](options));
      if (this.class_list) this.img.addClass(this.class_list);
      if (this.proxy) this.proxy.replaceWith(this.img);
      this.img.addClass(`Icon ${options.type}`).data({ initialized: true, class_obj: this });
      if (this.css) this.img.css(this.css);
      if (this.action) {
        this.img.addClass('clickable');
        this.img.on('click', _ => { this.action.to_fx(this.action_data) });
      }
      if (this.tooltip) {
        this.tooltip = new ToolTip(this.tooltip.merge({ target: this.img }));
        this.img.addClass('clickable');
      }

      this.img.attr('alt', this.alt || this.type);
      if (this.title) this.img.attr('title', this.title);
    } catch (error) {
      log({ error, options });
    }
  }
  color_reset() {
    if (this.img.is('img')) this.img.attr('src', `/images/icons/${this.type}_${this.color}.png`);
    this.img.removeClass('purple yellow pink gray green').addClass(this.color);
  }
  color_change(color) {
    if (this.img.is('img')) this.img.attr('src', `/images/icons/${this.type}_${color}.png`);
    this.img.removeClass('purple yellow pink gray green').addClass(color);
  }
  static option_dots(options) {
    let size = options.size || 2, color = options.color || 'gray', position = options.position || 'right';

    // let g = document.createElementNS("http://www.w3.org/2000/svg", "g");

    let wrap = $(`<svg viewBox='0 0 ${size * 12} ${size * 16}'/>`).addClass(`${color} ${position}`).css({ width: `${size * 0.75}em`, height: `${size}em` });
    // options.size = size / 4; options.color = color;
    let dots = [
      Icon.circle(options.merge({ size: size / 4, color, cx: '50%', cy: '15%' })),
      Icon.circle(options.merge({ size: size / 4, color, cx: '50%', cy: '50%' })),
      Icon.circle(options.merge({ size: size / 4, color, cx: '50%', cy: '85%' })),
    ];
    wrap.append(dots.map(c => c.circle));
    return { img: wrap, color };
  }
  static circle(options) {
    let size = options.size || 4;
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
      circle = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
      g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    let color = options.color || 'purple';
    svg.setAttribute('width', `${size}em`);
    svg.setAttribute('height', `${size}em`);
    circle.setAttribute('r', `${size / 2}em`);
    circle.setAttribute('cx', ifu(options.cx, `${size / 2}em`));
    circle.setAttribute('cy', ifu(options.cy, `${size / 2}em`));
    $(svg).addClass(color);
    $(svg).append($(g).append(circle));

    return { img: $(svg), color, circle };
  }
  static clock(options) {
    let size = options.size || 2, color = options.color || 'yellow';
    let clock = new Image();
    clock.src = `/images/icons/clock_${color}.png`;
    $(clock).css({ width: `${size}em`, height: `${size}em` }).addClass(color);
    return { img: $(clock), color };
  }
  static cal(options) {
    let size = options.size || 2, color = options.color || 'yellow';
    let cal = new Image();
    cal.src = `/images/icons/cal_${color}.png`;
    $(cal).css({ width: `${size}em`, height: `${size}em` }).addClass(color);
    return { img: $(cal), color };
  }
  static triangle(options) {
    let size = options.size || 3, color = options.color || 'gray';
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
      poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    svg.setAttribute('width', `${size}em`);
    svg.setAttribute('height', `${size}em`);
    svg.setAttribute('viewBox', '0 0 100 100');
    poly.setAttribute('points', '0,100 50,0 100,100');
    // poly.setAttribute('fill',color);
    $(svg).append(poly);
    return { img: $(svg), ele: poly, color };
  }
  static checkmark(options) {
    let size = options.size || 5, color = options.color || 'green';
    let checkmark = new Image();
    checkmark.src = `/images/icons/checkmark_${color}.png`;
    $(checkmark).css({ width: `${size}em`, height: `${size}em` }).addClass(color);
    return { img: $(checkmark), color };
  }
  static styled_x(options) {
    let size = options.size || 5, color = options.color || 'red';
    let x = new Image();
    x.src = `/images/icons/x_styled_${color}.png`;
    $(x).css({ width: `${size}em`, height: `${size}em` }).addClass(color);
    return { img: $(x), color };
  }
  static x(options) {
    let size = options.size || 5, color = options.color || 'red';
    let x = new Image();
    x.src = `/images/icons/red_x.png`;
    $(x).css({ width: `${size}em`, height: `${size}em` }).addClass(color);
    return { img: $(x), color };
  }
  static plus_sign(options) {
    let size = options.size || 2, color = options.color || 'yellow';
    let plus_sign = new Image();
    plus_sign.src = `/images/icons/plus_sign_${color}.png`;
    $(plus_sign).css({ width: `${size}em`, height: `${size}em` }).addClass(color);
    return { img: $(plus_sign), color };
  }
  static gears(options) {
    let size = options.size || 5, color = options.color || 'yellow';
    let x = new Image();
    x.src = `/images/icons/settings_icon_${color}.png`;
    $(x).css({ width: `${size}em`, height: `${size}em` });
    return { img: $(x), color };
  }
  static question_mark(options) {
    let size = options.size || 5, color = options.color || 'yellow';
    let q = new Image();
    q.src = `/images/icons/question_mark_${color}.png`;
    $(q).css({ width: `${size}em`, height: `${size}em` });
    return { img: $(q), color };
  }
  static reload(options) {
    let size = options.size || 5, color = options.color || 'yellow';
    let reload = new Image();
    reload.src = `/images/icons/reload_${color}.png`;
    $(reload).css({ width: `${size}em`, height: `${size}em` }).addClass(color);
    return { img: $(reload), color };
  }
  static arrow(options) {
    let size = options.size || 5, color = options.color || 'purple';
    let arrow = new Image();
    arrow.src = `/images/icons/arrow_${options.dir || 'up'}_${color}.png`;
    $(arrow).css({ width: `${size}em`, height: `${size}em` }).addClass(color);
    if (options.dir) $(arrow).addClass(options.dir);
    return { img: $(arrow), color };
  }
  static open(options) {
    let size = options.size || 5, color = options.color || 'yellow';
    let open = new Image();
    open.src = `/images/icons/open_arrow_${color}.png`;
    $(open).css({ width: `${size}em`, height: `${size}em` }).addClass(color);
    if (options.dir) $(open).addClass(options.dir);
    return { img: $(open), color };
  }

  get box() { return this.img[0].getBoundingClientRect() }

  clearIntervals() {
    // log({circle:this},`clearing intervals c=${this.count}`);
    clearInterval(this.spinner);
    clearInterval(this.countdown_interval);
  }
  // static get spin_count () { return Icon.spinner_count == undefined ? Icon.spinner_count = 0 : Icon.spinner_count; }
  spin() {
    if (this.type != 'circle') throw new Error(`Trying to spin a ${this.type}!`);
    this.img.removeClass('countdown');
    this.img.addClass('spin');
    setTimeout(_ => {
      if (this.img.exists() && this.img.is(':visible')) {
        if (this.img.parent().is('.blur.loading')) {
          let msg = $(`<div/>`, {
            class: `blur_msg ${this.color}`,
            text: 'this seems to be taking a long time, please hold on'
          });
          this.img.parent().append(msg);
        }
      }
    }, 20 * 1000)
    return;
  }
  countdown(time = 5000, fadein = true, callback = null) {
    clearTimeout(this.callback_timeout);
    this.img.removeClass('spin');
    this.img.addClass(`countdown timer${time}`);
    this.callback_timeout = setTimeout(_ => {
      if (this.img.exists() && this.img.is(':visible') && callback) callback.to_fx();
    }, time);
  }
};
class Confirm {
  constructor(options = {}) {
    this.define_by(options);
    this.box = new OptionBox({ class_list: 'confirmation' }.merge(options));
    this.yes_btn = this.box.add_button({
      text: this.yes_text || 'yes', class_list: 'pink yes', action: _ => { this.result = true }
    });
    this.no_btn = this.box.add_button({
      text: this.no_text || 'no', class_list: 'no', action: _ => { log({ this: this }); this.result = false }
    });
    if (this.hide_no_btn || this.force_yes) this.no_btn.ele.hide();
    this.unblur_after_resolve = ifu(this.unblur_after_resolve, true);
    this.unblur_after_no_response = ifu(this.unblur_after_no_response, true);
    this.box.ele.hide();
    if (this.immediate) this.prompt();
  }
  async callbacks(response, options) {
    try {
      // log('CALLBACKS'{ response, options });

      if (this.unblur_after_resolve && [true, false].includes(response)) unblur();
      if (this.unblur_after_no_response && response === null) unblur();
      clearInterval(this.interval);
      let affirm = options.affirm || this.affirm || null,
        negate = options.negate || this.negate || null,
        no_response = options.no_response || this.no_response || null;
      if (response === true && affirm) affirm.to_fx(options);
      else if (response === false && negate) negate.to_fx(options);
      else if (response === null && no_response) no_response.to_fx(options);
      return response;
    } catch (error) {
      log({ error, response, options, confirm: this });
    }
  }
  async prompt(options = {}) {
    // log(options,'PROMPT');
    if (options.header) this.box.reset_header(options.header);
    if (options.message) this.box.reset_info(options.message);
    if (options.button_info) this.box.reset_button_info(options.button_info);
    if (options.yes_text) this.yes_btn.text_update(options.yes_text);
    if (options.no_text) this.no_btn.text_update(options.no_text);
    if (options.hide_no_btn) this.no_btn.ele.hide();
    else if (options.show_no_btn) this.no_btn.ele.show();

    let target = ifu(options.target, this.target, null);
    if (target) blur(target, this.box.ele);
    else blurTop(this.box.ele);
    KeyValueBox.realign(this.box.ele);

    this.result = null;
    this.promise = await new Promise(resolve => {
      this.waiting = setInterval(_ => { if (this.result != null) resolve(this.result); }, 50);
      setTimeout(_ => { let r = this.force_yes ? true : null; resolve(r) }, options.timeout || this.timeout || 30000)
      if (this.interval_fx) this.interval = setInterval(_ => this.interval_fx(), options.interval_time || this.interval_time || 1000);
    }).then(response => { clearInterval(this.waiting); this.callbacks(response, options); return response; });
    return this.promise;
  }
  add_info(info) {
    this.box.add_info(info);
  }
}
class Blur {
  constructor(options = {}) {
    ToolTip.hide_all();
    try {
      this.define_by(options);
      this.block = $('<div/>', { class: 'blur', data: { class_obj: this } });
      this.blurred_ele.prepend(this.block.append(this.modal_ele));
      if (!['checkmark', 'loading'].includes(this.modal)) {
        this.block.on('click', Blur.undo_by_click);
        this.add_x();
      } else if (this.modal == 'loading') {
        let max = view().height, count = 0, bottom = this.icon.box.bottom;
        while (this.icon.box.bottom + 5 > max && count < 100) {
          this.icon.img.moveUp(10); count++;
        }
      }
      this.resize();
      if (this.on_undo_fx) this.on_undo = this.on_undo_fx;
      if (this.callback) {
        if (this.callback_delay) setTimeout(this.callback, this.callback_delay);
        else this.callback();
      }


      if (this.auto_undo_timeout) setTimeout(_ => { this.undo() }, this.auto_undo_timeout);
      else if (this.auto_undoall_timeout) setTimeout(_ => { Blur.undo_all() }, this.auto_undoall_timeout);
      Blur.list.push(this);
    } catch (error) {
      // log({ error, options })
    }
  }
  get grandparent() { return this.block.parent().parent(); }
  get is_chained() { return this.grandparent.is('.blur') }
  get is_at_top() { return this.block.is('.blur_body') || this.grandparent.is('.blur_body') }
  get is_fully_chained() {
    if (this.block.is('.blur_body')) return true;
    let is_chained = false, blur = this;
    while (blur.is_chained) {
      if (blur.is_at_top) return true;
      blur = blur.grandparent.getObj();
    }
    return false;
  }

  get blurred_ele() {
    let ele = this.ele || Blur.top;
    ele = $(ele);
    if (ele.is('#Error')) {
      unblur();
      ele = this.ele || Blur.top;
    }
    if (ele.dne() || !ele.is(':visible')) throw new Error('blur ele dne');
    // else if (!ele.is(':visible')) throw new Error('blur ele not visible');
    else if (ele.is('body')) {
      this.is_body = true;
      let top = `${(window.pageYOffset || document.scrollTop) - (document.clientTop || 0)}px`;
      this.block.addClass('blur_body').css({ top });
      ele.addClass('blurred');
    } else {
      let blur = ele.children('.blur').first().getObj();
      if (blur) blur.undo();
      if (Blur.is_scrollable(ele, 2)) {
        ele.addClass('blurred');
        let top = `${ele[0].scrollTop}px`;
        this.block.css({ top });
      }
    }
    if (this.ele) this.block.addClass('blur_ele');
    return ele;
  }
  get modal_ele() {
    if (!this.modal) throw new Error('modal not given');
    let modal = $(this.modal);
    if (this.modal == 'loading') { this.blurred_by_icon = true; modal = this.load_ele; }
    else if (this.modal == 'checkmark') { this.blurred_by_icon = true; modal = $('#CheckmarkBlur'); }

    if (modal.dne()) throw new Error('modal ele dne');

    // modal.find('.blur_x').remove();
    if (!modal.data('tt_scroll_hide')) {
      modal.data({ tt_scroll_hide: true });
      modal.on('scroll', ToolTip.hide_all);
    }
    return modal;
  }
  get load_ele() {
    let circle = new Icon({ type: 'circle', size: this.size || 4, color: this.color || 'purple' });
    this.block.addClass('loading');
    this.icon = circle;
    circle.spin();
    return circle.img;
  }
  get child() { return this.block.children().first() }
  get parent() { return this.block.parent() }

  set on_undo(fx) {
    let undo_fx_array = this.undo_fx_array == undefined ? this.undo_fx_array = [] : this.undo_fx_array;
    this.undo_fx_array.push(fx);
  }
  set on_undo_replace(fx) { this.undo_fx_array = [fx] }
  fade_undo = (time = null) => {
    try {
      log({ this: this });
      if (!time) this.undo();
      else this.block.fadeOut(time, _ => { this.undo() })

    } catch (error) {
      log({ error });
    }
  }
  undo() {
    if (this.is_chained) Blur.reset_dimensions(this.parent);
    this.block.children().off('scroll', ToolTip.hide_all).appendTo("#ModalHome");
    this.block.parent().removeClass('blurred');
    this.block.remove();
    this.remove_from_list();
    if (this.undo_fx_array) this.undo_fx_array.forEach(fx => fx());
    Banner.ContainerRepo();
  }
  remove_from_list() {
    let i = Blur.list.indexOf(this);
    Blur.list.splice(i, 1);
  }

  add_x() {
    this.block.children('.blur_x').remove();
    let cancel_x = new Icon({ type: 'x', size: 1, class_list: 'blur_x', action: _ => { this.undo() } });
    this.block.children().first().append(cancel_x.img);
  }

  get child_overflows() { return Blur.is_scrollable(this.child) }
  get child_width() { return this.child.width() }
  get child_height() { return this.child.height() }
  get parent_width() { return this.parent.outerWidth() }
  get parent_height() { return this.parent.outerHeight() }
  // set initial_width () 
  // get initial_width () { return this.width || this.child}
  async resize() {
    // KeyValueBox.realign(this.block);
    const child = this.child.get()[0];
    if (!this.child_overflows || this.is_body) return;
    let width_increase = () => { let width = this.parent_width + 10; this.parent.css({ width }, 50) }
    let height_increase = () => { let height = this.parent_height + 10; this.parent.css({ height }, 50) }
    let child_width = 0, child_height = 0;
    while (this.child_overflows && child_width != this.child_width) {
      child_width = this.child_width;
      width_increase();
      // log(`w+ child:${child_width} parent:${this.parent_width}`);
    }
    while (this.child_overflows && child_height != this.child_height) {
      child_height = this.child_height;
      height_increase();
      // log(`h+ child:${child_height} parent:${this.parent_height}`);
    }
  }

  static is_scrollable(ele, margin = 0) {
    const height_overflow = ele[0].scrollHeight > ele[0].clientHeight + margin;
    const width_overflow = ele[0].scrollWidth > ele[0].clientWidth + margin;
    return height_overflow || width_overflow;
  }
  static reset_dimensions(ele) {
    let style = ele.attr('style');
    if (!style) return;
    style = style.replace(/width: .*px;/, '').replace(/height: .*px;/, '');
    ele.attr({ style });
  }
  static get list() { return Blur.list_array === undefined ? Blur.list_array = [] : Blur.list_array }
  static get top() {
    let blur = [...Blur.list].reverse().find(b => b.is_fully_chained);
    if (blur && blur.blurred_by_icon) { blur.undo(); blur = [...Blur.list].reverse().find(b => b.is_fully_chained); }
    let ele_to_blur = blur ? blur.child : $('body');
    return ele_to_blur;
  }

  static undo(options = {}) {
    let last = null;
    if (options.ele) last = $(options.ele).children('.blur').first().getObj();
    else last = Blur.list.last();
    // log({options,last});
    if (!last) return;
    else if (last.modal == 'loading' && options.exclude_loading) return;
    if (last && options.time) last.fade_undo(options.time);
    else if (last) last.undo();
    if (options.repeat) {
      options.repeat--;
      Blur.undo(options);
    }
  }
  static undo_by_click(ev) {
    ev.stopPropagation();

    if ($(ev.target).is('.blur')) {
      log({ ev });
      Blur.undo({ time: 500, exclude_loading: true });
    }
  }
  static undo_all(time = 500) {
    // if (time == null) {
    //   while (!Blur.top.is('body')) {
    //     log({top:Blur.top});
    //     Blur.undo();
    //   }      
    // } else {
    Blur.list.filter(blur => blur.is_fully_chained).forEach(blur => blur.block.fadeOut(time, _ => blur.undo()));
    // }

    // let chained = Blur.list.filter(blur => blur.is_chained);
    // let list = Blur.list;
    // log({list});
    // while (Blur.list.find(blur => blur.is_chained)) {
    //   Blur.list.find(blur => blur.is_chained).undo();
    // }
    // Blur.list.forEach( blur => {if (blur.is_chained) blur.undo()} );
    // log("UNDO all");
  }
  static Checkmark() {
    blurTop('checkmark', {
      callback: () => { Blur.undo({ repeat: 1 }) },
      callback_delay: 1000
    });
  }
  static Error({ header = 'Error', message = 'Sorry there was an error' }) {
    const modal = $('#Error');
    modal.find('.message').html(`<h1 class='pink'>${header}</h1><div class='p-small'>${message}</div>`);
    blurTop(modal);
  }
}
export class Menu {
  constructor(options = {}) {
    this.define_by(options);
    this.define_by({
      id: this.ele.attr('id'),
      items: this.ele.find('.tab').get().map(item => new MenuItem({
        ele: $(item),
        menu: this,
      }.merge($(item).data()))).filter(item => item.id != 'divide')
    })
    this.ele.data({ class_obj: this, initialized: true }).addClass(`menu${this.index}`)
    this.define_by({
      links: this.items.filter(item => item.is_link),
      dropdowns: this.items.filter(item => item.is_dropdown),
    });
    if (!Menu.is_popping && this.index != 0) {
      let initial = this.active_tab;

      const tab = this.items.find(item => item.id == initial) || this.items[0];
      tab.load();
      // if (initial) {
      //   const tab = this.items.find(item => item.id == initial) || this.items[0];
      //   tab.load();
      // }
      // else this.items[0].load();
    }
  }

  get index() { return $('.menuBar').index(this.ele) }
  get is_last() { return $(this.target).find('.menuBar').dne() }

  get active_tab() { return Menu.tabs[this.id] || null }
  get active_item() { return this.items.find(item => this.active_tab == item.id) }
  reload() {
    let current = this.active_tab;
    this.items.find(item => item.id == current).load();
  }
  push_history_state() {
    if (this.target == 'window') return;
    let state = history.state || {}, page_name = `Body Wizard - ${this.active_item.text}`;
    state.merge({ tabs: Menu.tabs, page_name });
    document.title = page_name;
    history.pushState(state, page_name);
    // log({state}, `PUSHING STATE ${page_name}`);
  }
  replace_history_state() {
    if (this.target == 'window') return;
    let state = history.state || {}, page_name = `Body Wizard - ${this.active_item.text}`;
    state.merge({ tabs: Menu.tabs, page_name });
    document.title = page_name;
    history.replaceState(state, page_name);
    // log({state}, `REPLACING STATE ${page_name}`);
  }

  static get headers() {
    let tabs = tab_str(), uids = uid_str();
    let headers = {
      'X-Current-Tabs': tabs,
      'X-Current-Uids': uids,
      'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
    };
    return headers;
  }
  static load(tab_id) { $(`#${tab_id}`).getObj().on_click() }
  static reload_tab() {
    $('.menuBar').last().getObj().reload();
  }
  static async fetch(options = {}) {
    let { data = {}, method = 'GET', url, target, replace_target = false, is_html = true } = options;
    const new_modal = (typeof target == 'string' && target.includes('new_modal'));
    if (new_modal) return Menu.new_modal(options);

    if (!target) throw new Error('target missing');
    else if (target === 'same_tab') target = $('.loadTarget').last();

    if (options.blur === true) options.blur = {};

    if (options.blur) blur(target, 'loading', options.blur);

    // if (target === 'same_tab') {
    //   // target = $('.loadTarget').last();
    //   blur(target, 'loading', options.blur);
    // } else if (options.blur) {
    //   blur(target, 'loading', options.blur);
    // }
    return $.ajax({
      url: url,
      headers: Menu.headers,
      data: data,
      method: method,
      success: (response, status, request) => {
        if (options.blur) Blur.undo({ ele: $(target) });
        if (is_html) {
          if (replace_target) $(target).replaceWith(response);
          else $(target).html(response);
        }
        initialize.newContent();
        if (options.callback) options.callback();
        return true;
      }
    });
  }
  static async new_modal(options = {}) {
    let { in_background, url, target, data = {}, method = 'GET' } = options;
    const [m, id] = target.split(":");
    if (!in_background) blurTop('loading');
    return $.ajax({
      url, data, method,
      headers: Menu.headers,
      success: (response, status, request) => {
        let modal, existing = $(`#${id}`), exists = id ? existing.exists() : false;
        if (id) {
          if (exists) {
            modal = existing.html(response);
          } else {
            modal = $(response).attr('id', id);
          }
        } else {
          modal = $(response);
        }

        if (!in_background) { unblur(); blurTop(modal); }
        else modal.hide().appendTo('body');
        initialize.newContent();
        return true;
      }
    });
  }
  static async popstate(state) {
    // log({tabs:state.tabs},`POP ${state.page_name}`);
    Menu.is_popping = true;
    tabs(state.tabs);
    let index = 1, menu = $(`.menu${index}`);
    while (menu.exists()) {
      let menu_obj = menu.getObj(), active = Menu.tabs[menu_obj.id] || null;
      if (active) await menu_obj.items.find(item => item.id == active).load();
      else await menu_obj.items[0].load();
      index++;
      menu = $(`.menu${index}`);
    }
    Menu.is_popping = false;
  }
  static get tabs() { return Menu.tab_list == undefined ? Menu.tab_list = {} : Menu.tab_list }
  static get tab_str() { return JSON.stringify(Menu.tabs) }
  static set_tab(menu_id, tab_id) {
    let tabs = Menu.tabs;
    tabs[menu_id] = tab_id;
    Menu.tab_list = tabs;
    return tabs;
  }
  static set_tabs(json) {
    let tabs = Menu.tabs;
    tabs.merge(json);
    Menu.tab_list = tabs;
    // log({tabs,json},'SETTING TABS');
    return tabs;
  }
  static unset_tab(menu_id) { delete Menu.tab_list[menu_id]; return Menu.tabs; }

  static check_headers(xhr, settings, ev) {
    let uid_list = system.validation.json(xhr.getResponseHeader('X-Current-Uids')),
      tab_list = system.validation.json(xhr.getResponseHeader('X-Current-Tabs')),
      csrf = xhr.getResponseHeader('X-CSRF-TOKEN'),
      force_logout = xhr.getResponseHeader('X-FORCE-LOGOUT');

    log(`${now().time} ${settings.url}`, { uid_list, tab_list, xhr, response: xhr.responseJSON });
    if (force_logout != null && force_logout.toBool()) Menu.force_logout();
    if (uid_list) uids(uid_list);
    if (tab_list) tabs(tab_list);
    if (csrf) $('meta[name="csrf-token"]').attr('content', csrf);
    if (xhr.responseJSON) {
      const { error } = xhr.responseJSON;
      // const { error: generalError, save_result: { error: saveError } = {} } = xhr.responseJSON;
      // let error = generalError || saveError || null;
      if (error) {
        const modal = $("#Error");
        modal.find(".message").html(`<h2 class='pink'>${error.header}</h2><div class='p-small'>${error.message}</div>`);
        blurTop(modal);
      }
    }
  }
  static notifications_extracted(data) {
    let regex = /###notifications(.*)###/;
    let notifications = data.match(regex);
    if (notifications) {
      notifications = system.validation.json(notifications[1]);
      // if (notifications.notEmpty()) notifications.forEach(n => new Notification(n,'top'));
      if (notifications.notEmpty()) notifications.forEach(n => Notification.List.add_item(n.merge({ position: 'top' })));
    }
    return data.replace(regex, '');
  }
  static force_logout(forced = false) {
    if (forced) {
      let form = $(`<form action='/portal/logout' method='post'></form>`).appendTo('body');
      form.append(`<input name='logout_reason' hidden='true' value='due to inactivity'>`);
      form.submit();
    } else {
      let count = $(`<div/>`, { text: '30', class: 'bold pink xbig' });
      confirm({
        header: 'Session Expiring',
        count: count,
        message: $('<div>For your security, you will be logged out shortly</div>').append(count),
        yes_text: 'stay signed in',
        hide_no_btn: true,
        immediate: true,
        unblur_after_no_response: false,
        interval_fx: function () {
          let n = Number(count.text());
          count.text(n - 1);
        },
        timeout: 30000,
        no_response: function () {
          count.text('LOGGING OUT');
          let form = $(`<form action='/portal/logout' method='post'></form>`).appendTo('body');
          form.append(`<input name='logout_reason' hidden='true' value='due to inactivity'>`)
          form.submit();
        },
        affirm: function () { $.ajax('/keep-session'); }
      });
    }
  }
  static load(options) {
    console.log(options);
    const { url, blur = true } = options;
    const target = $('.loadTarget').last();
    log({ url, target });
    Menu.fetch({ url, target, blur });
  }
  // static refresh_page () {location.reload(true)}  
}
export class MenuItem {
  constructor(options = {}) {
    this.define_by(options);
    if (this.uri == '') delete this.uri;
    this.id = this.ele.attr('id');
    this.text = this.ele.children('.title').text().trim();
    this.is_link = this.uri != undefined;
    this.is_dropdown = this.ele.find('.dropdown').exists();
    this.ele.addHoverClassToggle().data({ class_obj: this });
    this.title = this.ele.children('.title').on('click', this.on_click.bind(this));
  }
  get top_tab() { return this.parent_tabs.last() }
  get parent_tabs() { return this.ele.parents('.tab') }
  get parent_titles() { return this.parent_tabs.children('.title') }

  async on_click() {
    if (this.is_link) {
      if (this.menu.is_last) this.menu.push_history_state();
      await this.load();

    } else if (this.is_dropdown) {
      this.ele.toggleClass('hover');
    }
  }
  load(options = {}) {
    if (this.menu.target == 'window') window.location.href = this.uri;
    else {
      options = this.load_options.merge(options);
      this.menu.ele.resetActives();
      tabs(this.menu.id, this.id);
      this.title.add(this.parent_titles).addClass('active');
      this.top_tab.removeClass('hover');
      // $(this.menu.target).html('');
      return Menu.fetch(options);
    }
  }
  get load_options() {
    return {
      url: this.uri,
      target: this.menu.target,
      blur: true,
      callback: _ => { if (this.menu.is_last) this.menu.replace_history_state() }
    };
  }
}
$(document).on('keyup', ev => { if (ev.keyCode == 27) Blur.undo({ exclude_loading: true }) });
$(document).on('scroll', ev => { ToolTip.hide_all() });

export const Features = { Notification, Button, ButtonBox, Filter, Editable, OptionBox, List, UpDown, Toggle, ToolTip, Warning, Banner, Autosave, Icon, KeyValueBox, Confirm, Blur };
window.Notification = Notification;

window.banner = Banner;
window.Http = Menu;

export const system = {
  user: {
    current: null,
    is: function (usertype) { return user.current ? (user.current.type == usertype) : false; },
    isSuper: function () { return (user.current && user.current.is_super != undefined) ? user.current.is_super : false; },
    isAdmin: function () { return (user.current && user.current.is_admin != undefined) ? user.current.is_admin : false; },
    set: function (userData) {
      if (Object.isFrozen(user)) return;
      user.current = Models.User.Auth = new Models.User(userData);
      if (user.current.is_super) {
        window.system = system;
        window.Models = Models;
        window.Features = Features;
        window.Forms = Forms;
        window.LUX = LUX;
        window.tabs = tabs;
      }
      Object.freeze(user);
    },
    login: async () => {
      let form = $('#LoginForm'), data = form.answersAsObj();
      blur(form, 'loading');
      $.ajax({
        url: "/login",
        method: "POST",
        data: data,
        success: function (data) {
          blur(form, "checkmark", {
            callback: _ => { window.location.reload() },
            // callback_delay: 1000
          });
          // setTimeout(function(){window.location.reload()},1000);
        },
        error: function (data) {
          unblur()
        }
      })
      // log({result});
    },
    initialize: () => {
      init('#RoleSelector', function () {
        let selector = $(this);
        $(this).on('click', 'li', function () {
          selector.find('.button').removeClass('disabled');
        });
        $(this).on('click', '.button', function () {
          if ($(this).hasClass('disabled')) return;
          let data = $("#RoleSelector").answersAsObj();
          data.selected_role = data.selected_role[0];
          blurTop('#loading');
          $.ajax({
            url: '/portal/select_role',
            method: 'POST',
            data: data,
            success: function () {
              location.reload();
            }
          })
        })
      })
    }
  },
  practice: {
    set: function (practice_data) {

    }
  },
  cookie: {
    get: name => {
      if (!document.cookie.includes(name)) return undefined;
      if (system.cookie.is_expired()) return undefined;
      return document.cookie.split('; ').find(row => row.startsWith(name)).split('=')[1];
    },
    is_expired: _ => {
      let date = document.cookie.split('; ').find(row => row.startsWith('expires')).split('=')[1];
      if (date === undefined) return false;
      date = LUX.fromHTTP(date);
      log({ now: now(), date });
      return now() > date;
    },
  },
  notifications: {
    initialize: {
      all: function () {
        init('#Notifications', function () {
          Notification.menu_ele = $('#Notifications');
          return;
        })
      },
    },
  },
  request: {
    // notifications_extracted: (data) => {
    //   let regex = /###notifications(.*)###/;
    //   let notifications = data.match(regex);
    //   if (notifications) {
    //     notifications = system.validation.json(notifications[1]);
    //     // if (notifications.notEmpty()) notifications.forEach(n => new Notification(n,'top'));
    //     if (notifications.notEmpty()) notifications.forEach(n => Notification.List.add_item(n.merge({position:'top'})));
    //   }
    //   return data.replace(regex,'');
    // },
    // force_logout: (forced = false) => {
    //   if (forced) {
    //     let form = $(`<form action='/portal/logout' method='post'></form>`).appendTo('body');
    //     form.append(`<input name='reason' hidden='true' value='due to inactivity'>`)
    //     form.submit();
    //   }else{
    //     let count = $(`<div/>`,{text:'30', class:'bold pink xbig'});
    //     confirm({
    //       header: 'Session Expiring',
    //       count: count,
    //       message: $('<div>For security reasons you will be logged out shortly</div>').append(count),
    //       yes_text: 'stay signed in',
    //       hide_no_btn: true,
    //       immediate: true,
    //       unblur_after_no_response: false,
    //       interval_fx: function(){
    //         let n = Number(count.text());
    //         count.text(n - 1);
    //       },
    //       timeout: 30000,
    //       no_response: function(){
    //         count.text('LOGGING OUT');
    //         let form = $(`<form action='/portal/logout' method='post'></form>`).appendTo('body');
    //         form.append(`<input name='reason' hidden='true' value='due to inactivity'>`)
    //         form.submit();
    //       },
    //       affirm: function() { $.ajax('/keep-session'); }
    //     });
    //   }
    // },
    refresh_page: () => { location.reload(true) }
  },
  initialize: {
    selection: null,
    error: null,
    newContent: function () {
      try {
        system.user.initialize();
        system.ui.initialize();
        notifications.initialize.all();
        system.display.initialize();
        // init('.menuBar', function() { 
        //   let options = {ele: $(this)}.merge($(this).data());
        //   new Menu(options);
        // })
        // menu.initialize.all();
        forms.initialize.all();
        resizeElements();
        masterStyle();
      } catch (error) {
        log({ error }, 'initialization error');
      }
    },
    ele: function (options = { select: null, action: null }) {
      try {
        let errors = {};
        if (typeof options != 'object') errors['initialize.ele() requires an options object'] = typeof options + ' given';
        if (!options.select) errors['options.select invalid'] = options.select;
        if (typeof options.function != 'function') errors['options.function must be a valid function'] = typeof options.function + ' given';
        if (!$.isEmptyObject(errors)) {
          errors['parameter given'] = options;
          throw (errors);
        }
        options.dataAttr = ifu(options.dataAttr, 'initialized');
        options.searchValue = ifu(options.searchValue, false);
        options.setValue = ifu(options.setValue, true);
        initialize.find(options.select, options.dataAttr, options.searchValue);
        if (!initialize.selection) {
          let s = options.select, is_jquery = s instanceof jQuery;
          if (is_jquery) s = `#${s.attr('id')} classes: ${s.attr('class')}`;
          throw new Error(`${initialize.error} ${s}`);
        }
        initialize.selection.each(function (e, element) {
          try {
            options.function.bind(element)();
            $(element).data(options.dataAttr, options.setValue);
          } catch (error) {
            console.log(error);
          }
        });
      } catch (error) {
        let message = error.message || null;
        error = error.error || error;
        if (debug.level(1)) log({ error, message, options }, !message ? `Failed to initialize` : message);
        return;
      }
      return initialize.selection;
    },
    find: function (selection, dataAttr = 'initialized', value = null) {
      let elements = null;
      try {
        if (selection instanceof jQuery) { elements = selection; }
        else if (typeof selection == 'string') { elements = $(selection); }
        else {
          throw ({ selection: selection, error: 'selection not string or jQuery' });
          return false;
        }
      } catch (error) {
        log({ error });
        return false;
      }
      let falsey = $.inArray(value, ['unset', 'null', null, 'undefined', undefined, "false", false]) > -1,
        match = elements.filter(function () {
          if (falsey) return !$(this).data(dataAttr);
          else return $(this).data(dataAttr) === value;
        });
      if (match.dne()) {
        initialize.selection = null;
        if (elements.dne()) system.initialize.error = 'element not in DOM';
        else system.initialize.error = `element exists, '${dataAttr}' != ${falsey ? 'falsey' : value}`;
      } else {
        initialize.selection = match;
      }
      return initialize.selection;
    },
  },
  ui: {
    initialize: () => {
      init('.menuBar', function () {
        let options = { ele: $(this) }.merge($(this).data());
        new Menu(options);
      });
      initAlt('.button', 'generic_fx', function () {
        let options = $(this).data('options') || $(this).data();
        options.ele = $(this);
        new Button(options);
      });
      init('#Feedback', function () {
        $(this).on('click', '.cancel', function () {
          let callback = system.ui.feedback.callback;
          if (callback && typeof callback == 'function') callback();
        })
      })
      init('.OptionBox', function () {
        new OptionBox($(this));
      });
      init('.list_update', function () {
        let data = $(this).data();
        new Models.ModelList(data);
        $(this).remove();
      })
    },
    pointer: {
      to_xy_coords: (ev) => {
        var out = { x: 0, y: 0 };
        if (ev.type === 'touchstart' || ev.type === 'touchmove' || ev.type === 'touchend' || ev.type === 'touchcancel') {
          var touch = ev.originalEvent.touches[0] || ev.originalEvent.changedTouches[0];
          out.x = touch.pageX;
          out.y = touch.pageY;
        } else if (ev.type === 'mousedown' || ev.type === 'mouseup' || ev.type === 'mousemove' || ev.type === 'mouseover' || ev.type === 'mouseout' || ev.type === 'mouseenter' || ev.type === 'mouseleave') {
          out.x = ev.pageX;
          out.y = ev.pageY;
        } else if (ev.type === 'click') {
          out.x = ev.pageX;
          out.y = ev.pageY;
        }
        return out;
      }
    },
    keyboard: {
      with_alt_key: ev => ev.altKey || ev.metaKey || ev.ctrlKey,
      allow_these_keys: (input, values) => {
        $(input).on('keydown', function (ev) {
          if (!system.ui.keyboard.key_match(ev.key, values) && !system.ui.keyboard.with_alt_key(ev)) {
            input.warn(`<i>${ev.key}</i> not allowed`);
            ev.preventDefault();
          }
        })
      },
      disallow_these_keys: (input) => {
        $(input).on('keydown', function (ev) {
          if (system.ui.keyboard.key_match(ev.key, values)) ev.preventDefault();
        })
      },
      key_match: (key, values) => {
        let key_allowed = false;
        if (typeof values == 'string') key_allowed = system.ui.keyboard.allow.string_characters(values, key);
        if (typeof values == 'object') key_allowed = system.ui.keyboard.allow.regex(values, key);
        let meta_keys = system.ui.keyboard.allow.meta_keys(key);
        return key_allowed || meta_keys;
      },
      allow: {
        string_characters: (string, key) => {
          if (key === undefined) return true;
          return string.split('').includes(key);
        },
        meta_keys: (key) => {
          if (key === undefined) return true;
          return ['Backspace', 'Tab', 'Escape', 'Shift', 'Meta'].includes(key) || key.includes('Arrow');
        },
        regex: (regex, key) => {
          if (key === undefined) return true;
          return key.match(regex);
        }
      },
      disallow: {
        string_characters: (string, key) => {
          return !string.split('').includes(key);
        },
        regex: (regex, key) => {
          return !key.match(regex);
        }
      }
    },
    editables: {
      new: (name = 'no name') => {
        let class_list_str = name.camel() + ' editable';
      }
    },
    confirm: {
      interval: null,
      prompt: async (settings) => {
        let header = settings.header || 'Confirm',
          message = settings.message || 'Confirming something but no message given',
          yes_text = settings.yes_text || 'confirm',
          no_text = settings.no_text || 'cancel',
          delay = settings.delay || null,
          affirm = settings.affirm || null,
          negate = settings.negate || null,
          callback_no_response = settings.callback_no_response || null,
          interval = settings.interval || null,
          modal = $("#Confirm");
        if (callback_no_response == 'negate') callback_no_response = negate;
        if (callback_no_response == 'affirm') callback_no_response = affirm;

        if (typeof header == 'string') header = $(`<h2 class='purple'>${header}</h2>`);
        if (typeof message == 'string') message = $(`<div>${message}</div>`);
        modal.find('.message').html("").append(header).append(message);
        modal.find('.confirmY').text(yes_text);
        modal.find('.confirmN').text(no_text);
        blurTop("#Confirm");
        let confirmed = await new Promise((resolve, reject) => {
          modal.on('click', '.confirmY, .resolve', function () { resolve(true) });
          modal.on('click', '.confirmN', function () { resolve(false) });
          if (interval && typeof interval == 'function') system.ui.confirm.interval = setInterval(interval, 1000);
          setTimeout(function () {
            reject('30s timeout');
          }, 30000)
        }).catch(error => {
          clearInterval(system.ui.confirm.interval);
        })
        if (delay) {
          setTimeout(function () {
            system.ui.confirm.handleCallback(confirmed, affirm, negate, callback_no_response);
          }, delay);
        } else {
          system.ui.confirm.handleCallback(confirmed, affirm, negate, callback_no_response);
        }
        log({ confirmed });
        return confirmed;
      },
      handleCallback: (confirmed, affirmative, negative, no_response) => {
        clearInterval(system.ui.confirm.interval);
        let clear = function () { if ($('#Confirm').is(':visible')) unblur(); }

        if (confirmed && affirmative) { log('affirm'); clear(); affirmative(); }
        else if (!confirmed && negative) { log('negate'); negative(); clear(); }
        else if (no_response) { log('no response'); no_response(); clear(); }
      }
    },
    feedback: {
      callback: null,
      display: (header, message, delay = null, callback = null) => {
        system.ui.feedback.callback = callback;
        header = $(`<h2>${header}</h2>`)
        if (message instanceof jQuery) message = message;
        else if (typeof message == 'string') message = $(`<div>${message}</div>`);
        $("#Feedback").find('.message').html('').append(header).append(message);
        if (delay) setTimeout(blurTop.bind("#Feedback"), delay);
        else blurTop("#Feedback");
      },
    },
    scroll: {
      pending: false,
      bar_width: () => window.innerWidth - $(window).width(),
    },
    viewport_dimensions: () => {
      var e = window;
      var a = 'inner';
      if (!('innerWidth' in window)) {
        a = 'client';
        e = document.documentElement || document.body;
      }
      let top = (window.pageYOffset || document.scrollTop) - (document.clientTop || 0);
      return {
        width: e[a + 'Width'] - system.ui.scroll.bar_width(),
        height: e[a + 'Height'],
        top: Number.isNaN(top) ? 0 : top
      }
    },
    body_dimensions: () => { return { width: $('body').outerWidth(), height: $('body').outerHeight() } }
  },
  validation: {
    xhr: {
      headers: {
        list: () => {
          let tabs = tab_str(), uids = uid_str();
          let headers = {
            'X-Current-Tabs': tabs,
            'X-Current-Uids': uids,
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
          };
          // console.log({headers});
          // log(headers,'SENDING HEADERS');
          return headers;
        },
        // check: request => {
        //   let uid_list = request.getResponseHeader('X-Current-Uids').json_if_valid(),
        //   tab_list = request.getResponseHeader('X-Current-Tabs').json_if_valid(),
        //   csrf = request.getResponseHeader('X-CSRF-TOKEN'),
        //   unreadNotifications = request.getResponseHeader('X-Unread-Notifications').json_if_valid(),
        //   force_logout = request.getResponseHeader('X-FORCE-LOGOUT');
        //   log({uid_list,tab_list,csrf,unreadNotifications},"CHECKING REQUEST");
        //   if (uid_list) uids(uid_list);
        //   if (tab_list) tabs(tab_list);
        //   if (csrf) $('meta[name="csrf-token"]').attr('content',csrf);
        //   if (unreadNotifications) {
        //     if (unreadNotifications === 'send ajax') notifications.get.unread();
        //     else notifications.add(unreadNotifications);
        //   }
        // },
      },
      error: {
        exists: response => {
          if (response.error) return system.validation.xhr.error.handle(response.error);
          else return false;
        },
        handle: error => {
          let callback = null;
          if (error.attr) {
            let input = $('input').filter(`.${error.attr}`);
            if (input.exists()) callback = function () { input.warn(`Update ${error.attr}`) }
          }
          log({ error });
          feedback(error.header, error.message, callback);
          return true;
        }
      }
    },
    csrf: {
      get: _ => {
        return $('meta[name="csrf-token"]').attr('content');
      }
    },
    json: data => {
      if (typeof data !== 'string') { return data; }
      try {
        var json = JSON.parse(data);
        if (json && typeof json === "object") {
          return json;
        }
      } catch (e) {
        if (debug.level(1)) log({ error: e, data: data }, 'jsonIfValid error');
      }
      return data;
    },
    boolean: (value, truthy_vals = ['true', 'yes'], falsey_vals = ['false', 'no ', 'no,']) => {
      if (value === true || value === false) return value;
      let is_true = truthy_vals.some(truthy => value.toLowerCase() === 'yes' || value.toLowerCase().includes(truthy.toLowerCase()));
      let is_false = falsey_vals.some(falsey => value.toLowerCase() === 'no' || value.toLowerCase().includes(falsey.toLowerCase()));
      return (!is_true && !is_false) ? value : is_true;
    },
    array: {
      join: (array, str = 'and', oxford = true) => {
        let response = '', arr = [...array];
        try {
          if (arr.length == 1) return arr[0];
          while (arr.length > 0) {
            if (arr.length == 1) response += `${str} ${arr.shift()}`;
            else response += `${arr.shift()}${(array.length == 2 || (arr.length == 1 && !oxford)) ? '' : ','} `;
          }
          return response;
        } catch (error) {
          log({ error });
        }
      },
    },
    address: {
      parse: (options = {}) => {
        try {
          let components = options.components || null,
            unit = options.unit || null,
            format = options.format || 'short',
            as_array = ifu(options.as_array, true),
            include_unit = ifu(options.include_unit, true);
          if (!components) return [];
          let str = '', obj = {}, types = ['street_number', 'route', 'locality', 'administrative_area_level_1', 'country', 'postal_code', 'postal_code_suffix'], type_regex = new RegExp(`(${types.join('|')})`, 'g');
          let get = type => {
            let match = components.find(c => c.types.includes(type));
            return match ? match[`${format}_name`] : '';
          };
          let line_array = array => { return array.map(line => line.replaceAll(type_regex, match => get(match))); };
          let array = line_array(['street_number route', 'locality, administrative_area_level_1 postal_code']);
          if (unit && include_unit) array.splice(1, 0, unit);
          return array;
        } catch (error) {
          log({ error });
          return null;
        }
      }
    },
    // input: {
    //   // date: (input) => {
    //   //   input.allowKeys('0123456789/ ,');
    //   //   input.on('keydown',function(ev){
    //   //     let v = $(this).val(), l = v.length, k = ev.key;
    //   //     if (l == 0 & k == '/') ev.preventDefault();
    //   //     if (l == 1 & k == '/') $(this).val(`0${v}`);
    //   //     if (l == 3 & k == '/') ev.preventDefault();
    //   //     if (l == 4 & k == '/') $(this).val(`${v.slice(0,3)}0${v.slice(3,5)}`);
    //   //     if (l >= 6 & k == '/') ev.preventDefault();
    //   //     if (l >= 10 && !['Backspace','Tab'].includes(k) && !k.includes('Arrow') && !$(this).hasSelectedText()) ev.preventDefault();
    //   //   })
    //   //   input.on('keyup',function(ev){
    //   //     let v = $(this).val(), l = v.length, k = ev.key;
    //   //     if (k == 'Backspace') return;
    //   //     if (l == 2) $(this).val(`${v}/`);
    //   //     if (l == 5) $(this).val(`${v}/`);
    //   //   })
    //   //   return input;
    //   // },
    //   // time: (input) => {
    //   //   input.allowKeys('0123456789:ampm ');
    //   //   return input;
    //   // },
    //   // phone: (input) => {
    //     // input.allowKeys('0123456789-() ');
    //     // input.on('blur',function(){
    //     //   let val = input.val();
    //     //   val = val.replace(/[()\- ]/g, '');
    //     //   if (val.length < 10) {input.warn('Invalid phone number - too few digits'); return;}
    //     //   if (val.length > 10) {input.warn('Invalid phone number - too many digits'); return;}
    //     //   val = `(${val.substr(0,3)}) ${val.substr(3,3)}-${val.substr(6,4)}`;
    //     //   input.val(val);
    //     // });
    //     // return input;
    //   // },
    //   // email: (input) => {
    //   //   input.on('blur',function(){
    //   //     let val = input.val();
    //   //     if (!val.match(/.*@.*\..*/)) input.warn('Invalid email');
    //   //   });
    //   //   return input;
    //   // },
    //   // username: (input) => {
    //     // input.allowKeys(/[a-zA-Z0-9_]/);
    //     // input.on('blur',function(){
    //     //   let val = input.val();
    //     //   if (val.length < 5) input.warn('Must be at least 5 characters');
    //     // });
    //     // input.on('keydown',function(ev){
    //     //   let v = $(this).val(), l = v.length, k = ev.key;
    //     //   if (l >= 14 && !['Backspace','Tab'].includes(k) && !k.includes('Arrow') && !$(this).hasSelectedText()) {
    //     //     ev.preventDefault();
    //     //     input.warn('Max length is 14');
    //     //   }
    //     // })        
    //     // return input;
    //   // }
    // },
    get_ele: selector => {
      let ele = $(selector);
      if (ele.dne()) throw new Error(`ele not found using $(${selector})`);
      return ele;
    }
  },
  modals: {
    list: ['Confirm', 'Warn', 'Error', 'CheckmarkBlur', 'Feedback', 'Refresh', 'Notification', 'ErrorMessageFromClient', 'AutoSaveWrap'],
    reset: () => {
      let current = $("#ModalHome").children(),
        removeThese = current.filter((m, modal) => !system.modals.list.includes($(modal).attr('id')));
      removeThese.remove();
    }
  },
  display: {
    initialize: () => {
      init($('.KeyValueBox'), function () {
        let ele = $(this), options = ele.data('options') || ele.data();
        let new_box = new KeyValueBox(options.merge({ ele }));
      });
      init($('.List'), function () {
        let ele = $(this), options = ele.data('options') || ele.data();
        new List(options.merge({ ele }));
      });
      init($('.Icon'), function () {
        if ($(this).hasClass('datepick-trigger')) return;
        let proxy = $(this), options = proxy.data('options') || proxy.data();
        new Icon(options.merge({ proxy }));
      });
      init('.Table', function () {
        let ele = $(this), options = ele.data('options') || ele.data();
        new Models.Table(options.merge({ ele }));
      });
      init('.Banner', function () {
        let ele = $(this), options = ele.data('options') || ele.data();
        new Banner(options.merge({ ele }));
      })

      // system.display.size.footer.adjust_body_padding();
      // system.display.size.footer.adjust_full_splash();
    },
    format: {
      readableJson: json => {
        return JSON.stringify(json)
          .replace(/(:|,)/g, '$& ')
          .replace(/\[\]/g, '[ ]')
          .replace(/\[\[/g, '[ [').replace(/\[\[/g, '[ [')
          .replace(/\]\]/g, '] ]').replace(/\]\]/g, '] ]')
          .replace(/\[\{/g, '[ {').replace(/\[\{/g, '[ {')
          .replace(/\]\}/g, '] }').replace(/\}\]/g, '] }');
      },
      indentedJson: json => {
        let ele = $('<div/>', { class: 'column' });
        for (let key in json) {
          let value = json[key];
          if (value === null) value = 'null';
          let type = typeof value, is_numeric = key.is_numeric();
          // log({ key, is_numeric })
          if (['string', 'number'].includes(type) || value instanceof jQuery) {
            if (is_numeric) ele.append(`<div>${value}</div>`);
            else ele.append(`<div>${key}: ${value}</div>`);
          } else {
            ele.append(`<div>${value.is_array() ? `Array (${value.length})` : `Object`}`)
            ele.append(system.display.format.indentedJson(value).addClass('indent'));
            // ele.append(u)

          }
        }
        return ele;
      }
    },
    size: {
      font: {
        get_root: () => { return system.display.size.font.get_ele_font_size('body') },
        get_ele_font_size: (selector) => { return Number(system.validation.get_ele(selector).css('font-size').split("px")[0]) },
      },
      width: {
        fix: ele => {
          try {
            ele = $(ele);
            if (ele.dne()) throw new Error('element not found');
            let w = ele.outerWidth();
            ele.css({ width: px_to_rem(w) });
          } catch (error) {
            log({ error, ele });
          }

        }
      },
      px_to_rem: (px = null) => {
        if (!px) throw new Error('px not given');
        if (typeof px != 'number') throw new Error('px must be number');
        return `${px / get_rem_px()}rem`;
      },
      rem_to_px: (rem = null) => {
        if (!rem) throw new Error('rem not given');
        if (typeof rem != 'number') throw new Error('rem must be number');
        return rem * get_rem_px();
      },
      footer: {
        adjust_body_padding: () => {
          let height = $('footer').outerHeight();
          $('body').css({ paddingBottom: height });
        },
        adjust_full_splash: () => {
          let height = $('footer').outerHeight();
          $('.splash.top.full').css({ height: `calc(100vh - ${height}px)` });
        }
      }
    }
  },
  warn: (options = {}) => {
    try {
      let string = ifu(options.string, options.message, options.text, 'warning'),
        ele = ifu(options.ele, options.target, null),
        position = ifu(options.position, 'above'),
        justified = ifu(options.justified, 'left'),
        time = ifu(options.time, 2000),
        callback = ifu(options.callback, null),
        no_message = options.no_message || false,
        fade = ifu(options.fade, true);
      if (no_message) return;

      ele = $(ele);
      if (!ele || ele.dne()) { log({ ele }, 'no elements selected'); alert('no elements selected'); return; }
      else if (ele.length > 1) {
        ele.each((e, el) => {
          if (e > 0) system.warn(options.merge({ ele: el, no_message: true }));
        });
        ele = ele.first();
      }


      let warning = $(`<div/>`, {
        class: 'Warning',
        html: string,
      });
      let css = {}, ele_box = ele[0].getBoundingClientRect(), ele_x = ele_box.x, ele_h = ele_box.height, ele_offset = ele.offset(), warning_box = warning[0].getBoundingClientRect(), warning_x = warning_box.x, warning_h = warning_box.height, warning_offset = warning.offset(), diff_x = ele_x - warning_x, diff_x_abs = Math.abs(ele_x - warning_x);
      if (position == 'above') {
        css = { left: ele_box.x, top: ele_box.y, transform: 'translateY(-120%)' };
        if (justified == 'center') {
          css.merge({ left: ele_box.x + ele_box.width / 2, transform: 'translate(-50%, -120%)' });
        }
      }
      else {
        log({ position }, `position not defined: ${position}`);
        alert(`position not defined: ${position}`);
        return;
      }
      warning.appendTo('body').css(css).slideFadeIn();

      if (ele.is('input, textarea, select, ul')) ele.addClass('borderFlash');
      // time => delay
      // if (fade && time) {

      // }
      // log({warning});
      if (fade && time) {
        setTimeout(function () {
          warning.slideFadeOut(1000, _ => { warning.remove(); });
          ele.removeClass('borderFlash');
          if (callback && typeof callback == 'function') callback();
        }, time + 400);
      } else {
        warning.on('click', _ => { warning.slideFadeOut(_ => { warning.remove() }) })
      }
    } catch (error) {
      log({ error });
    }
  },
};

window.user = system.user;
window.initialize = system.initialize;
window.get_rem_px = system.display.size.font.get_root;
window.get_em_px = (selector) => system.display.size.font.get_ele_font_size(selector);
window.fix_width = system.display.size.width.fix;
window.uids = (type = null, uid = null) => {
  if (type === null) return Models.Model.uids;
  else if (typeof type == 'object') Models.Model.set_uids(type);
  else if (uid === null) return Models.Model.uid(type);
  else if (uid === false) Models.Model.unset_uid(type);
  else Models.Model.set_uid(type, uid);
}
window.tabs = (menu_id = null, tab_id = null) => {
  if (menu_id === null) return Menu.tabs;
  else if (typeof menu_id == 'object') Menu.set_tabs(menu_id);
  else if (tab_id === null) return Menu.tab(menu_id);
  // else if (tab === false) Menu.unset_tab(menu_id);
  else Menu.set_tab(menu_id, tab_id);
}
window.uid_str = _ => Models.Model.uid_str;
window.tab_str = _ => Menu.tab_str;
window.body = () => system.ui.body_dimensions();
window.view = () => system.ui.viewport_dimensions();
window.px_to_rem = px => system.display.size.px_to_rem(px);
window.rem_to_px = rem => system.display.size.rem_to_px(rem);
window.blur = (ele, modal, options = {}) => { new Blur({ ele, modal }.merge(options)) };
window.blurTop = (modal, options = {}) => { new Blur({ modal }.merge(options)) };
window.blurError = ({ header = 'Error', message = `Sorry, there has been an error` }) => { Blur.Error({ header, message }) };
window.unblur = (options = {}) => {
  Blur.undo(options);
};
window.unblurAll = (time = null) => { Blur.undo_all(time) };
window.feedback = (header, message, delay = null, callback = null) => {
  if (typeof delay == 'function') {
    callback = delay;
    delay = null;
  }
  system.ui.feedback.display(header, message, delay, callback);
};
window.confirm = options => new Confirm(options);
window.init = function (ele, fx) {
  if (debug.level(1)) log({ ele }, typeof ele == 'string' ? ele : 'jquery obj');
  if (Array.isArray(ele)) {
    ele.forEach(function (params) {
      if (params.length == 2) init(params[0], params[1]);
      else if (params.length === 3) initAlt(params[0], params[1], params[2]);
    })
  }
  else {
    if (typeof fx != 'function') log({ error: { ele, fx } }, 'invalid initialization function, consider initAlt()');
    system.initialize.ele({ select: ele, function: fx })
  };
};
window.initAlt = (ele, attr, fx) => system.initialize.ele({ select: ele, function: fx, dataAttr: attr });
window.toBool = (val, true_if_contains) => system.validation.boolean(val, true_if_contains);
window.get_setting = (obj, string, fall_back) => system.validation.settings.get(obj, string, fall_back);
window.ifu = function (val, backup) {
  let args = [...arguments], count = args.length, current = args.shift();
  try {
    while (typeof current === 'undefined' && args.notEmpty()) { current = args.shift(); }
  } catch (error) {
    console.log({ error, args, current });
  }

  return current;
};
window.ifn = function (val, backup, allowArray = false) {
  let args = [...arguments], count = args.length, current = args.shift();
  // let args = [...arguments], count = args.length, current = args.shift();
  try {
    // console.log({args});
    while ((typeof current === 'undefined' || current === null) && args.notEmpty()) { current = args.shift(); }
  } catch (error) {
    console.log({ error, args, current });
  }
  // while ((typeof current === 'undefined' || current === null) && args.notEmpty()) { current = args.shift(); }
  return current;
};
window.iff = function (val, backup, allowArray = false) {
  let args = [...arguments], count = args.length, current = args.shift();
  try {
    while (!current && args.notEmpty()) { current = args.shift(); }
  } catch (error) {
    console.log({ error, args, current });
  }
  // while ((typeof current === 'undefined' || current === null) && args.notEmpty()) { current = args.shift(); }
  // return current;
  // console.groupCollapsed('IFF');
  // console.log({args,current});
  // while (!current && args.notEmpty()) { current = args.shift(); }
  // console.log(current);
  // console.groupEnd();
  return current;

  // if (Array.isArray(val) && !allowArray)
  //   {let test = undefined; for (let x = 0; x < val.length - 1; x++){test = iff(val[x], val[x+1]); if (test === val[x]) break;} val = test;}
  // return val || backup;
};


export const practice = {
  info: null,
  set: function (practiceData) {
    if (Object.isFrozen(practice)) return;
    practice.info = practiceData;
    let tz = practice.info.tz.replace(/ /g, '_');
    window.tz = tz;
    LuxonSettings.defaultZoneName = tz;
    window.now = () => LUX.NOW;
    if (user.isSuper()) window.practice = practice;
    Object.freeze(practice);
  },
  get: function (key) {
    if (!practice.info) log({ error: 'practice info not set' });
    return (practice.info[key] != undefined) ? practice.info[key] : null;
  }
}
export const notifications = system.notifications;
// const const_map = {};

window.addEventListener('popstate', (event) => {
  let state = event.state;
  if (state && state.tabs) Menu.popstate(state);
  // console.log("location: " + document.location + ", state: " + JSON.stringify(event.state));
});

$(document).ready(function () {
  let tab_list = $("#NavBar").data('tabs');
  let userInfo = $("#NavBar").data('user'),
    practiceInfo = $("#NavBar").data('practice');

  if (tab_list) tabs(tab_list);
  if (userInfo) user.set(userInfo);
  else setInterval(_ => { $.ajax('/keep-session') }, 10 * 60 * 1000);
  if (practiceInfo) practice.set(practiceInfo);
  initialize.newContent();
})

var systemModalList = ['Confirm', 'Warn', 'Error', 'Feedback', 'Refresh', 'Notification', 'ErrorMessageFromClient', 'AutoSaveWrap'];

(function ($) {
  $.sanitize = function (input) {
    var output = input.replace(/<script[^>]*?>.*?<\/script>/gi, '').
      replace(/<[\/\!]*?[^<>]*?>/gi, '').
      replace(/<style[^>]*?>.*?<\/style>/gi, '').
      replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
    return output;
  };
})(jQuery);


$.fn.getObj = function (type = null, include_parents = true, include_self = true) {
  let obj = null, objName = 'class_obj';
  try {
    if (type) {
      type = type.replace('.', '');
      if (type === 'target_ele') objName = 'Tog`gle';
      let this_obj = include_self ? $(this).data(objName) : undefined;
      if (this_obj != undefined && $(this).is(`.${type}`)) obj = this_obj;
      else if (include_parents) {
        let ele = include_self ? $(this).closest(`.${type}`) : $(this).parents(`.${type}`).first();
        while (ele.exists()) {
          let ele_obj = ele.data(objName);
          if (ele_obj) { obj = ele_obj; break; }
          ele = ele.parent().closest(`.${type}`);
        }
      }
    } else {
      if (this.data(objName) != undefined) obj = this.data(objName);
      else if (include_parents) {
        let parents = this.parents();
        parents.each((p, parent) => {
          if ($(parent).data(objName) != undefined) {
            obj = $(parent).data(objName);
            return false;
          }
        })
      }
    }
    if (!obj) throw new Error('class_obj not found');
  } catch (error) {
    // log ({error,ele:this});
    return null;
  }
  return obj;
}
$.fn.parentModal = function () {
  return $(this).closest('.blur').parent();
}
$.fn.replaceText = function (regex, replace) {
  this.get().forEach(ele => {
    let text = $(ele).text().replace(regex, replace);
    $(ele).text(text);
  });
  return this;
}
$.fn.addHoverClassToggle = function () {
  this.hover(function () { $(this).addClass('hover') }, function () { $(this).removeClass('hover') });
  return this;
}
$.fn.addOpacityHover = function () {
  let initial = $(this).css('opacity');
  if (initial == 1) { initial = 0.6; $(this).css({ opacity: initial }) }
  this.on('mouseenter', function () { $(this).animate({ opacity: 1 }) })
    .on('mouseleave', function () { $(this).animate({ opacity: initial }) });
  return this;
};

$.fn.cssTransition = function (time) {
  let transition = this.css('transition') || '';
  try {
    // let transition = this.css('transition');
    transition = `${transition.replace(/opacity ([\d|\.]*)(ms|s)( ease \d*s)?(, |\b)/g, '')}`;
    if (!transition || transition == 'all 0s ease 0s') transition = `opacity ${time}ms`;
    else transition += `, opacity ${time}ms`;
    this.css({ transition });
  } catch (error) {
    log({ error, ele: this, transition });
  }
  return this;
};
// $.fn.saveOpacity = function (value = null) {
//   let opacity = Number(this.css('opacity'));
//   this.data({opacity});
//   if (value !== null) this.changeOpacity(value);
//   return this;
// };
// $.fn.changeOpacity = function (value) {
//   this.css({opacity:value});
//   return this;
// };
$.fn.resetOpacity = function () {
  let opacity = this.data('opacity') || 1;
  this.css({ opacity });
  return this;
}
$.fn.slideFadeOut = function (time = 400, callback = null) {
  try {
    if (this.dne()) return;
    if (typeof time === 'function') { callback = time; time = 400; }
    callback = typeof callback == 'function' ? callback.bind(this) : null;

    this.each((x, ele) => {
      let e = $(ele);
      e.cssTransition(time).css({ opacity: 0 }).delay(100).slideUp(time);
      setTimeout(_ => e.resetOpacity(), time + 101);
    })
    if (callback) setTimeout(callback, time + 101);
  } catch (error) {
    log({ error, time, callback, ele: this });
  }
  return this;
};
$.fn.slideFadeIn = async function (time = 400, callback = null) {
  try {
    if (this.dne()) return;
    if (typeof time === 'function') { callback = time; time = 400; }
    callback = typeof callback == 'function' ? callback.bind(this) : null;

    this.each((x, ele) => {
      let e = $(ele);
      // e.cssTransition(0).css({opacity:0});
      e.cssTransition(time).slideDown(time).delay(100).resetOpacity();
    })
    await this.promise();
  } catch (error) {
    log({ error, time, callback, ele: this });
  }
  return this;
};
$.fn.slideFadeToggle = function (time = 400, callback = null) {
  if (typeof time == 'function') {
    callback = time;
    time = 400;
  }
  if (this.is(':visible')) this.slideFadeOut(time, callback);
  else this.slideFadeIn(time, callback);
}

$.fn.moveUp = function (px = 1) {
  this.get().forEach(ele => {
    let top = $(ele).css('top').replace('px', '');
    top = top - px;
    $(ele).css({ top });
  })
}
$.fn.moveLeft = function (px = 1) {
  this.get().forEach(ele => {
    let left = $(ele).css('left').replace('px', '');
    left = left - px;
    $(ele).css({ left });
  })
}

$.fn.isVisible = function (padding = 15) {
  let parent_blur = this.isInside('.blur') ? this.closest('.blur').children().first() : null;
  let ele_box = this[0].getBoundingClientRect(), bottom = window.innerHeight, right = window.innerWidth - system.ui.scroll.bar_width(), top = 0, left = 0;
  if (parent_blur) {
    let parent_box = parent_blur[0].getBoundingClientRect();
    bottom = parent_box.bottom;
    right = parent_box.right;
    left = parent_box.left;
    top = parent_box.top;
  }
  top += padding; right -= padding; left += padding;

  let is_visible = {
    top: ele_box.top > top && ele_box.top < bottom,
    bottom: ele_box.bottom > top && ele_box.bottom < bottom,
    right: ele_box.right <= right && ele_box.right >= padding,
    left: ele_box.left >= left && ele_box.left >= padding,
    ele_box, parent_box: { top, left, bottom, right }, parent: parent_blur ? parent_blur : 'window',
  }
  return is_visible;
}
$.fn.getTopOffset = function (offset = 0) {
  if (this.is('.tooltip')) return offset;
  let parent = this.isInside('.blur') ? this.closest('.blur').children().first() : null;
  if (parent) offset += parent[0].getBoundingClientRect().top;
  else {
    offset += 30;
    let bars = $("#NavBar").add('.menuBar').not('.siteMenu');
    bars.each((b, bar) => offset += $(bar).outerHeight());
  }
  // log({ offset });
  return offset;
}
$.fn.smartScroll = async function (settings = {}) {
  let is_hidden = () => !this.is(':visible'), parentToggle = this.getObj('target_ele');
  let duration = settings.duration || 1000,
    callback = settings.callback || null,
    offset = settings.offset || 0,
    force = settings.force || false;

  if (system.ui.scroll.pending) {
    let pending = () => system.ui.scroll.pending;
    new Promise((resolve) => {
      let check = setInterval(() => {
        if (!pending()) {
          clearInterval(check);
          resolve();
        }
      }, 50);
    }).then(() => { if (callback) callback() });
    return;
  }
  system.ui.scroll.pending = true;
  while (is_hidden() && parentToggle) {
    await parentToggle.show(200);
    parentToggle = parentToggle.target.getObj('target_ele', true, false);
  }

  let ele = this.isInside('.blur') ? this.closest('.blur').children().first() : null;
  delete settings.callback; delete settings.duration; delete settings.force;
  let is_visible = this.isVisible(offset);
  const finish = () => {
    system.ui.scroll.pending = false;
    if (callback) callback();
  }
  offset += this.getTopOffset();
  settings.offset = -offset;

  if (is_visible.top && !force) finish();
  else {
    if (ele) ele.scrollTo(this[0], duration, settings);
    else $.scrollTo(this, duration, settings);

    setTimeout(finish, duration);
  }
}
$.fn.warn = function (string = 'warning', options = {}) {
  system.warn({
    ele: this,
    string: string,
    position: options.position || 'above',
    time: options.time || 2000,
    callback: options.callback || null,
    fade: ifu(options.fade, true),
  });
  return this;
}
$.fn.allowKeys = function (values) { system.ui.keyboard.allow_these_keys(this, values) }
$.fn.disallowKeys = function (values) { system.ui.keyboard.disallow_these_keys(this, values) }
// $.fn.toBool = function (true_if_contains = 'yes') {
//   return toBool(this.verify(), true_if_contains);
// }
$.fn.resetActives = function () {
  this.find('.active').removeClass('active');
  return this;
}
$.fn.resetClass = function (className) {
  this.find(`.${className}`).removeClass(className);
  return this;
}
$.fn.hasSelectedText = function () { return this[0].selectionStart != this[0].selectionEnd; }
$.fn.verify = function (string = null) {
  try {
    if (this.length > 1) throw new Error('too many elements to verify');
    let class_obj = this.closest('.answer, .item, .section, .form').data('class_obj');
    if (!class_obj) throw new Error('ele does not have class_obj');
    if (typeof class_obj.verify == 'function') return class_obj.verify(string);
    else throw new Error('class_obj does not have verify');
  } catch (error) {
    log({ error })
  }
}
$.fn.set = function (value = null) {
  try {
    if (this.length > 1) {
      this.each((e, ele) => { $(ele).set(value) })
      return;
    }
    let class_obj = this.data('class_obj');
    if (!class_obj) throw new Error('ele does not have class_obj');
    if (class_obj instanceof Forms.Answer) {
      class_obj.value = value;
    }
  } catch (error) {
    if (debug.level(1)) log({ error });
  }
}
$.fn.findAnswer = function (options) {
  return Forms.Answer.find(Forms.Answer.get_all_within(this, false), options);
}
$.fn.answersAsObj = function () {
  return forms.response.all_answers_as_obj(this);
}
$.fn.exists = function () {
  return this != undefined && this.length > 0;
}
$.fn.dne = function () {
  return this.length == 0;
}
$.fn.isSolo = function () {
  return this.exists() && this.length === 1;
}
$.fn.isInside = function (selector, include_self = true) {
  return include_self ? this.closest(selector).exists() : this.parent().closest(selector).exists();
}
$.fn.appendKeyValuePair = function (key, value) {
  $(this).append($("<div class='label'>" + key + "</div><div class='value'>" + value + "</div>"))
  return this;
};


$.fn.sortEle = function sortEle(selector = "div", attr = 'index') {
  $("> " + selector, this[0]).each((e, ele) => { log({ e, ele }) }).sort(dec_sort).appendTo(this[0]);
  function dec_sort(a, b) { return ($(b).data(attr)) < ($(a).data(attr)) ? 1 : -1; }
}

function commaSeparated(arr, quotes = false) {
  if (quotes) {
    $.each(arr, function (a, item) {
      arr[a] = "'" + arr[a] + "'";
    });
  }
  var last = arr.pop();
  if (arr.length == 0) {
    return last;
  } else if (arr.length == 1) {
    return arr.join(', ') + ' and ' + last;
  } else {
    return arr.join(', ') + ', and ' + last;
  }
}

function chkStrForArrayElement(yourstring, substrings) {
  var length = substrings.length;
  while (length--) {
    if (yourstring.indexOf(substrings[length]) != -1) {
      return true;
    }
  }
  return false;
}
function randomArrayElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}
function randomArrayElements(array, number) {
  var count = array.length, newArray = [], newEle = null;
  if (number > count) {
    alert('cannot select ' + number + " elements from an array of " + count + " items");
    return false;
  }
  do {
    newEle = randomArrayElement(array);
    if ($.inArray(newEle, array) === -1) {
      newArray.push(newEle);
    }
  } while (newArray.length < number);
}
function findObjKey(obj, value) {
  for (var key in obj) {
    console.log(obj, key, value);
    if (obj[key] === value) {
      return key;
    }
  }
  return null;
}
function toTitleCase(str) {
  return str.replace(/(?:^|\s)\w/g, function (match) {
    return match.toUpperCase();
  });
}

var uidList, tabList, tabHeaderInfo = {};
var SystemModalBtnFlash;
$.ajaxSetup({
  headers: Menu.headers,
  dataFilter: data => {
    data = data.trim();
    return Menu.notifications_extracted(data);
  }
});
$(document).ajaxError(function (ev, xhr, settings, error) {
  Menu.check_headers(xhr, settings, ev);
  if (error !== 'abort') {
    const modal = "#Error";
    const { status, responseJSON = {} } = xhr;
    const message = responseJSON.message || status;
    if ([419, 401].includes(status)) {
      // if ($.inArray(status, [419, 401]) > -1){
      Menu.force_logout(true);
    } else if (status === 404) {
      $(modal).find('.message').html("<h2>Not Found</h2><div>The content you asked for is not available</div>");
      $(modal).find(".submit").data('error', xhr);
      blurTop(modal);
    } else if (status == 422) {
      if ($("#Feedback").length == 0) {
        $("<div/>", {
          id: "Feedback",
          class: 'prompt',
          html: "<div class='message'></div><div class='options'><div class='button small cancel'>dismiss</div></div>"
        }).appendTo("#ModalHome");
      }
      var msg = $("#Feedback").find(".message"),
        errorJson = xhr.responseJSON;
      msg.html("");
      $("<h2 class='purple central'>Login Error</h2><div class='split3366KeyValues'></div>").appendTo(msg);
      $.each(errorJson.errors, function (key, value) {
        $("<div class='label'>" + key + "</div><div class='value'>" + value + "</div>").appendTo(msg.find(".split3366KeyValues"));
      });
      blurTop("#Feedback");
    } else {
      log({ ev, status, message, xhr, settings, error });
      $(modal).find(".submit").data('error', xhr);
      $(modal).find(".message").html("<h2 class='pink'>Error</h2><div>" + message + "</div>");
      blurTop(modal);
    }
    // var btn = $(modal).find(".submit");
    // SystemModalBtnFlash = setInterval(function () {
    //   btn.toggleClass("pink70 pink");
    // }, 500);
  }
}).ajaxSuccess(function (ev, xhr, settings) {
  Menu.check_headers(xhr, settings, ev);
});


// function submitErrorReport(){
//   console.log($("#Error").find(".submit").data('error'));
// }
// function updateUidList(uidList = null){
//   if (uidList){
//     $("#uidList").text(uidList);
//   }else{
//     $.ajax({
//       url:"/getvar",
//       method:"POST",
//       data:{
//         "getVar":"uidList"
//       },
//       success:function(data){
//         $("#uidList").text(data);
//       }
//     })

//   }
// }
// function setUid(model, uid){
//   try{
//     uidList = JSON.parse($("#uidList").text());
//     if (uidList == null){uidList = {};};
//   }catch(e){
//     uidList = {};
//   }
//   uidList[model] = uid;
//   $("#uidList").text(JSON.stringify(uidList));
// }
// function getUids(model = null){
//   try{
//     var uidList = JSON.parse($("#uidList").text());
//     if (uidList == null){return null;}
//     else if (model == null){return uidList;}
//     else if (uidList[model] == undefined){return null;}
//     else{return uidList[model];}        
//   }catch(e){
//     return null;
//   }
// }

// var defaultCSS = {
//   "item": {
//     "inline":"false"
//   },
//   'section': {
//     'displayNumbers':"false"
//   }
// };
// function getDefaultCSS(type){
//   return defaultCSS[type];
// }
// function formatDate(jsDateObj) {
//   var day = jsDateObj.getDate(), monthIndex = jsDateObj.getMonth() +1, year = jsDateObj.getFullYear();
//   return monthIndex + "/"+ day + '/' + year;
// }
// function formatTime(jsDateObj){
//   var hour = jsDateObj.getHours(), mins = jsDateObj.getMinutes(), meridian = (hour - 11 > 0) ? "pm" : "am";
//   if (mins == "0"){mins = "00";}
//   if (hour > 12){hour = hour - 12;}
//   return hour + ":" + mins + meridian;
// }



// EMAIL PHONE USERNAME FUNCTIONS
// function validateUsername(){
// // console.log("HI");
// var i = $(this);
// var val = i.val();
// var m = val.match(/[^a-zA-Z0-9._\-]/);
// val = val.replace(/[^a-zA-Z0-9._\-]/g,"");
// if (i.val()!=val){
//   i.off("keyup",validateUsername);
//   i.val(val);
//   var alertStr = (m == " ") ? "no spaces allowed" : m + " is not allowed";
//   alertBox(alertStr,i,"after",800);
//   setTimeout(function(){
//     i.on("keyup",validateUsername);
//   },801)
// }
// }
// function finalizeUsername(i){
//   var val = i.val();
//   if (val.length !=0 && (val.length < 5 || val.length > 15)){
//     i.off("focusout",finalizeUsername);
//     alertBox('must be between 5 and 15 characters',i,"after",800);
//     scrollToInvalidItem(i);
//     return false;
//   }
//   return true;
// }
// function validateEmail(){
//   var val = $(this).val(), i = $(this);
//   var m = val.match(/[^a-zA-Z0-9@._\-]/);
//   val = val.replace(/[^a-zA-Z0-9@._\-]/g,"");
//   if ($(this).val()!=val){
//     i.off("keyup",validateEmail);
//     $(this).val(val);
//     alertBox(m+" is an invalid character",$(this),"after",800);
//     setTimeout(function(){
//       i.on("keyup",validateEmail);
//     },801)
//   }
// }
// function finalizeEmail(i){
//   var val = i.val();
//   var pattern = /[a-zA-Z0-9._\-]*@[a-zA-Z0-9._\-]*\.[a-zA-Z0-9.]*/;
//   if (!pattern.test(val)){
//     scrollToInvalidItem(i);
//     alertBox('enter a valid email',i,"after",800);
//     return false;
//   }
//   return true;
// }
// function validatePhone(){
//   var i = $(this), val = i.val();
//   var m = val.match(/[^0-9.()-]/);
//   val = val.replace(/[^0-9.()-]/g,"");
//   if ($(this).val()!=val){
//     i.off("keyup",validatePhone);
//     $(this).val(val);
//     alertBox("numbers only",$(this),"after",800);
//     setTimeout(function(){
//       i.on("keyup",validatePhone);
//     },801)
//   }
// }
// function finalizePhone(i){
//   var val = i.val();
//   var digits = val.match(/\d/g);
//   if (digits != null && digits.length!=10){
//     scrollToInvalidItem(i);
//     alertBox("invalid phone number",i,"after",800);
//     return false;
//   }else if (digits != null){
//     var ph = digits[0]+digits[1]+digits[2]+"-"+digits[3]+digits[4]+digits[5]+"-"+digits[6]+digits[7]+digits[8]+digits[9];
//     i.val(ph);
//     return true;
//   }else{
//     alertBox("required",i,"after",800);
//     return false;
//   }
// }
// function checkPasswordStrength(i){
//   var pw = i.val(), errors = [];
//   if (!/[a-z]/.test(pw)){
//     errors.push('Password must contain a lower case letter.');
//   }
//   if (!/[A-Z]/.test(pw)){
//     errors.push('Password must contain an upper case letter.');
//   }
//   if (!/[0-9]/.test(pw)){
//     errors.push('Password must contain a number.');
//   }
//   if (pw.length < 5){
//     errors.push('Password must be at least 6 characters.');
//   }
//   if (errors.length == 0){
//     return true;
//   }else{
//     str = errors.join("<br>");
//     feedback("Attention",str);
//     return false;
//   }
// }

// function alertBox(message, ele, where = 'below', time = 1500, offset = null){
//   var hEle = ele.outerHeight(), wEle = ele.outerWidth(), wrap, wAlert, hAlert, readonly = ele.attr('readonly'), css;
//   if (ele.parent().is('.number')) hEle = ele.parent().outerHeight();
//   // if (ele.is('.radio, .checkboxes')){
//   //   console.log(hEle);
//   // }
//   if (time=="nofade"){
//     wrap = $('<span class="zeroWrap a"><span class="alert">'+message+'</span></span>');
//     time = 2000;
//   }else{
//     wrap = $('<span class="zeroWrap a f"><span class="alert f">'+message+'</span></span>');
//   }

//   if ($.inArray(ele.css('position'), ['fixed','absolute','relative']) == -1){
//     ele.css('position','relative');
//   }
//   wrap.appendTo("body");
//   wAlert = wrap.find('.alert').outerWidth();
//   hAlert = wrap.find('.alert').outerHeight();
//   if (where=="after"){
//     wrap.insertBefore(ele);
//     css = {top:0.5*hEle,left:wEle+5};
//   }else if (where=="ontop"){
//     wrap.appendTo(ele);
//     css = {top:0.5*hEle,left:0.5*wEle-0.5*wAlert};
//   }else if (where=="before"){
//     wrap.insertBefore(ele);
//     css = {top:0.5*hEle,left:-wAlert-5};
//   }else if (where=="above"){
//     wrap.insertBefore(ele);
//     css = {left:0.5*wEle,top:-hAlert-5};
//   }else if (where=="below"){
//     wrap.insertBefore(ele);
//     css = {left:0.5*wEle,bottom:-1.05*hAlert};
//   }

//   wrap.css(css);

//   if (offset!==null){
//     $(".alert").css("transform","translate("+offset+")");
//   }

//   setTimeout(function(){
//     $(".zeroWrap.a.f, .alert.f").slideFadeOut(600,function(){$(".zeroWrap.a.f, .alert.f").remove();})
//   },time)

// }
// function confirmBox(str,What,Where,Fade,Offset){
//     var h = What.outerHeight(true), w = What.outerWidth(true), ele, w2;
//     if (Fade=="nofade"){
//         ele = $('<span class="zeroWrap c"><span class="confirm">'+str+'</span></span>');
//     }else{
//         ele = $('<span class="zeroWrap c f"><span class="confirm f">'+str+'</span></span>');
//     }
//     if (Where=="after"){
//         ele.insertAfter(What).height(h);
//     }
//     else if (Where=="ontop"){
//         ele.insertBefore(What).height(h);
//     }
//     else if (Where=="before"){
//         ele.insertBefore(What).height(h);
//         w = ele.find(".confirm").outerWidth();
//         ele.find(".confirm").css("left","-"+w+"px");
//     }
//     else if (Where=="above"){
//         ele.insertBefore(What).height(h);
//         w2 = 0.5*w-0.5*$(ele).find(".confirm").outerWidth(true);
//         ele.find(".confirm").css({"top":"-"+h+"px","left":w2+"px"});
//     }    
//     else if (Where=="below"){
//         ele.insertBefore(What).height(h);
//         w2 = 0.5*w-0.5*$(ele).find(".confirm").outerWidth(true);
//         ele.find(".confirm").css({"top":2*h+"px","left":w2+"px"});
//     }
//     else if (Where=="append"){
//         ele.appendTo(What).height(h);
//     }
//     else {
//         ele.insertAfter(What).height(h);
//     }
//     if (Offset!==null){
//         $(".confirm").css("transform","translate("+Offset+")");
//     }


//     var BC = What.css("border-color");
//     What.css("border-color","rgb(46, 107, 53)");
//     setTimeout(function(){
//         What.css("border-color",BC);
//         What.focus();
//     },1500)

//     setTimeout(function(){
//         $(".zeroWrap.c.f, .confirm.f").fadeOut(600,function(){$(this).remove();})        
//     },1500)
// }

$(document).keyup(function (e) {
  if (e.keyCode === 27) {
    if ($('.tooltip').filter(':visible').exists()) ToolTip.hide_all();
    else if ($('.blur').exists()) unblur();
    // unblur();
  }
})
// .blur click
// $(document).on('click','.blur',function(ev){
//   let target = $(ev.target), is_blur = target.is('.blur'), is_clickable = target.children('.checkmark, .loading').dne();
//   if (is_blur && is_clickable) unblur();
// })

// function showOverflow(){
//   var elem = $(this).closest(".manageOverflow")[0];
//   var h1 = elem.scrollHeight, h2 = $(elem).innerHeight();

//   if ($(this).closest(".modalForm").length==0){
//     $(elem).css({
//       maxHeight:"none",
//       height:h2
//     })
//     $(elem).animate({height:h1},800,function(){$(elem).css("height","auto")});        
//   }else{
//     $(elem).css({
//       overflowX:"hidden",
//       overflowY:"auto"
//     })
//   }

//   slideFadeOut($(elem).find(".showOverflow"));
// }
// $(document).ready(function(){
//   $('.manageOverflow').each(function(i,ele){
//     checkOverflow(ele);
//   })
//   $("#Error").find(".submit").on('click',submitErrorReport);
//   $("body").on("click",".errorReport", submitErrorReport);
//   systemModals.find(".button").on('click',function(){
//     clearInterval(SystemModalBtnFlash);
//   })
// })



function animateWidthChange(elem) {
  var w1 = elem.scrollWidth, w2 = $(elem).innerWidth(), w3;
  $(elem).css({
    "width": w2,
    "overflow": "hidden"
  });
  var wait = setInterval(function () {
    w3 = elem.scrollWidth;
    console.log(w1 + " " + w2 + " " + w3);
    if (w3 != w1) {
      clearInterval(wait);
      $(elem).animate({ "width": w3 }, 800, function () {
        $(elem).css({
          "width": "auto",
          "oveflow": "auto"
        })
      })
    }
  }, 100)
  console.log('finish')
    ;
}
function wrapAndCenter(item) {
  if ($(item).is(".optionsNav.hide")) {
    $(item).wrap("<div class='wrapper' style='display:none'/>");
  } else {
    $(item).wrap("<div class='wrapper'/>");
  }
}

// function filterTableList(table){
//     $(".styled-table").removeClass("active");
//     table.addClass("active");

//     var filterObj = {}, 
//         filterList = [], 
//         AllRows = table.find("tr").not('.head, .noMatch'), 
//         noMatch = table.find(".noMatch");
//     $(".filter").removeClass("active").each(function(){
//         var checks = $(this).find(".tableFilter").filter(":checked").length,
//             searches = $(this).find(".tableSearch").filter(function(){return $(this).val()!=""}).length;
//         if (checks > 0 || searches > 0){
//             $(this).addClass("active");
//         }
//         if (searches > 0){
//             $(this).data('options','{"wholeWords":"false","separateWords":"true"}');
//         }
//     })
//     // console.log(AllRows);

//     //AllRows.removeClass("match").addClass("hide").unmark();
//     AllRows.unmark();
//     AllRows.unmark({element:"exclude"});
//     AllRows.show();

//     $(".tableFilter").filter(function(){
//         return table.is($(this).closest(".filter").data("target")) && $(this).is(":checked");
//     }).each(function(f,ele){
//         filterList.push($(ele).data('filter'));
//     })

//     $(".tableSearch").filter(function(){
//         return table.is($(this).closest(".filter").data("target")) && $(this).val()!="";
//     }).each(function(f,ele){
//         var filter = $(ele).data("filter") + ":" + $(ele).val();
//         filterList.push(filter);
//     })

//     filterList.forEach(function(filter,f){
//         var filterParts = filter.split(":"), type = filterParts[0], value = filterParts[1];
//         if (filterParts.length > 2){
//             value = filterParts[1] + ":" + filterParts[2];
//         }
//         if (filterObj[type]==undefined){
//             filterObj[type] = [value];
//         }else{
//             filterObj[type].push(value);
//         }
//     });

//     if ($.isEmptyObject(filterObj)){
//         AllRows.removeClass("hide");
//         if (AllRows.length==0){
//             noMatch.find(".name").text("None available").show();
//         }else{
//             noMatch.hide();
//         }
//         if (table.parent().hasClass("manageOverflow")){
//             checkOverflow(table.parent()[0]);
//         }

//         $('.clearTableFilters').filter('[data-target="#'+table.attr('id')+'"]').addClass('disabled');
//         return false;
//     }

//     $('.clearTableFilters').filter('[data-target="#'+table.attr('id')+'"]').removeClass('disabled');

//     AllRows.data("marks",0);
//     AllRows.data("match",0);
//     $.each(filterObj,function(type,values){
//         var options = $(".tableFilter, .tableSearch").filter(function(){
//             return table.is($(this).closest(".filter").data("target")) && $(this).data("filter").includes(type);
//         }).closest(".filter").data("options");

//         optionsObj = {};
//         // optionsObj['done'] = checkMatches;
//         optionsObj['done'] = function(){
//             // if (type != 'hide'){
//                 checkMatches();
//             // }
//         }
//         optionsObj['synonyms'] = {
//             "spleen":"spleen-pancreas",
//             "burner":"jiao"
//         };

//         if (options['highlight']=="false"){
//             optionsObj["className"] = "invis";
//         }
//         if (options['separateWords']=='false'){
//             optionsObj['separateWordSearch']=false;
//         }
//         if (options['wholeWords']=='true'){
//             optionsObj['accuracy']={value:"exactly",limiters:[",","."]};
//         }else{
//             optionsObj['accuracy']="partially";
//         }
//         if (type=='hide'){
//             optionsObj['element'] = 'exclude';
//         }
//         AllRows.find("."+type).mark(values,optionsObj);
//     })

//     if (filterObj.length == 1){
//         alert("HI");
//     }
//     AllRows.filter(function(){
//         return $(this).find("exclude").length > 0;
//     }).hide();

//     if (AllRows.filter(":visible").length==0){
//         noMatch.removeClass("hide").show();
//     }else{
//         noMatch.hide();
//     }
//     alternateRowColor(table);

//     if (table.parent().hasClass("manageOverflow")){
//         checkOverflow(table.parent()[0]);
//     }

//     checkHorizontalTableFit(table);
// }
function checkMatches() {
  var table = $(".styled-table").filter(".active");
  var filterCount = $(".filter").filter(function () {
    return table.is($(this).data("target")) && $(this).hasClass("active") && $(this).data('filter') != 'hide';
  }).length;

  var noMatch = table.find("tr").filter(".noMatch"),
    AllRows = table.find("tr").not('.head').not(noMatch);

  // DETERMINE AND SHOW MATCHES, HIDE THE REST
  AllRows.each(function () {
    var currentMarks = $(this).find("mark").length, previousMarks = $(this).data("marks"), currentMatches = $(this).data("match");
    if (currentMarks > previousMarks) {
      $(this).data('marks', currentMarks);
      $(this).data('match', currentMatches + 1);
    }
    if ($(this).data('match') == filterCount) {
      $(this).removeClass("hide").addClass("match");
    } else {
      $(this).addClass("hide").removeClass("match");
    }
    // console.log($(this).data());
  })
}
function checkHorizontalTableFit(table) {
  table.find("td, th").show();
  var hideOrder = table.data("hideorder").split(",");
  hideOrder.forEach(function (column, c) {
    if (table.parent()[0].scrollWidth > table.parent()[0].clientWidth + 1) {
      table.find("." + column).hide();
    }
  })
  table.find(".td_size_control").filter(":visible").each(function () {
    var h1 = $(this)[0].scrollHeight, h2 = $(this).height();
    if (h1 > h2) {
      $(this).find(".indicator").show();
    } else {
      $(this).find('.indicator').hide();
    }
  })
  alternateRowColor(table);
}
// var tableCheck = undefined;
// function resizeCheckTableWidth(){
//     if (tableCheck!=undefined){
//         clearTimeout(tableCheck);
//     }
//     tableCheck = setTimeout(function(){
//         $(".styled-table").each(function(i,t){
//             if ($(t).data("hideorder")!=undefined){
//                 checkHorizontalTableFit($(t));
//             }
//         })
//         tableCheck = undefined;
//     },500)
// }
function clearTableFilters() {
  if ($(this).hasClass('disabled')) { return false; }
  var t = $(this).data("target");
  // console.log(t);
  $(".filter").filter("[data-target='" + t + "']").find(".tableSearch").val("").keyup();
  $(".filter").filter("[data-target='" + t + "']").find(".tableFilter").each(function () {
    if ($(this).is(":checked")) {
      $(this).click();
    }
  })
  alternateRowColor($(t));
}

function resetOptionsNavBtns() {
  $(".optionsNav").off("click", ".button", optionsNavBtnClick);
  $(".optionsNav").on("click", ".button", optionsNavBtnClick);
}

function masterStyle() {
  // resetOptionsNavBtns();
  $(".wrapMe").filter(function () { return !$(this).parent().is(".wrapper"); }).each(function () {
    wrapAndCenter($(this));
  })
  // allowButtonFocus();
  // stylizeTables();
  $(".manageOverflow").each(function (i, ele) { checkOverflow(ele); })
  // $("#scrollToBtm").on("click", function(){$.scrollTo("max");})
  // $(".modalForm").each(function(){
  //   if ($(this).find(".cancel").length==0){
  //     $("<div class='cancel button small'>dismiss</div>").appendTo($(this));
  //   }
  // })
  // $(".modalLink").off("click",modalLinkClk);
  // $(".modalLink").on("click",modalLinkClk);
}


function SecurityReset(elem, value) {
  blurModal(elem, "#loading");
  console.log(value);
  $.ajax({
    url: "/php/launchpad/practitioner/security-reset.php",
    method: "POST",
    data: {
      SecurityReset: value
    },
    success: function (data) {
      //console.log(data);
      if (data) {
        blurModal(elem, "checkmark");
        setTimeout(function () {
          unblurElem($("body"));
        }, 1000)
        //  console.log("SUCCESS");
      } else {
        //console.log("FAIL");
      }
    }
  })

}

$(window).on("resize", resizeElements);
var splits = $(".split50, .split60, .split40"), leftOnly = splits.find(".leftOnly"), rightOnly = splits.find(".rightOnly");
function resizeSplits() {
  var bodyWidth = $("body").outerWidth();
  if (bodyWidth < 700) {
    splits.addClass("break");
    leftOnly.removeClass('leftOnly');
    rightOnly.removeClass('rightOnly');
  } else {
    splits.removeClass("break");
    leftOnly.addClass('leftOnly');
    rightOnly.addClass('rightOnly');
  }
}
function resizeFcCalendar(view) {
  $(".fc-toolbar").each(function () {
    var toolbar = $(this), fullCal = toolbar.closest('.fc'), w = toolbar.width(), em = getEm(), realWidth = toolbar[0].scrollWidth, wLeft = toolbar.find('.fc-left')[0].scrollWidth, wCenter = toolbar.find('.fc-center')[0].scrollWidth, wRight = toolbar.find('.fc-right')[0].scrollWidth, wTotal = wLeft + wCenter + wRight, changed = false;
    if (toolbar.find('.fc-center').html() == "") { toolbar.find('.fc-center').css({ padding: "0 1em" }) }
    while (realWidth - w > 1) {
      fullCal.css({ fontSize: "-=0.05em" });
      w = toolbar.width(); realWidth = toolbar[0].scrollWidth;
      changed = true;
    }
    while (wTotal + (3 * em) < w && em > getEm(fullCal)) {
      fullCal.css({ fontSize: "+=0.05em" });
      w = toolbar.width(); wLeft = toolbar.find('.fc-left').width(); wCenter = toolbar.find('.fc-center').width(); wRight = toolbar.find('.fc-right').width(); wTotal = wLeft + wCenter + wRight;
      changed = true;
    }
    if (changed) {
      calendar.updateSize();
    }
  })
}
function resizeQuotes() {
  $(".quote").each(function () {
    var h = $(this).outerHeight();
    $(this).closest(".quoteBlock").css("height", "calc(" + h.toString() + "px + 11em)");
  })
}
// function resizeFooterPadding() {
//   var h = $("footer").outerHeight();
//   $("body").css("padding-bottom", h);
// }
function getEm(ele = null) {
  if (ele == null) { ele = $("body") }
  return Number(ele.css('font-size').split("px")[0]);
}
var menuWidth;
function resizeImageClicks() {
  $('.imageClick').each(function () {
    var height = $(this).data('height') != 'null' ? $(this).data('height') : '20em',
      ratio = $(this).data('ratio') != 'null' ? Number($(this).data('ratio')) : 1.5, width,
      parentRect = $(this).parent()[0].getBoundingClientRect(), parentWidth = parentRect.width, newWidth, newHeight, visible = $(this).is(":visible");
    $(this).css({ height: height });
    var img = $(this);
    setTimeout(function () {
      var heightInPx = img.outerHeight(), newHeight;
      width = heightInPx * ratio;
      newWidth = width;
      // console.log(img,height);
      img.css({ width: width });
      // console.log(img.css('width'));
      if (visible) {
        while (newWidth > parentWidth) {
          newWidth = newWidth * 0.95;
        }
        if (newWidth != width) {
          newHeight = newWidth / ratio;
          img.css({ width: newWidth, height: newHeight });
        }
      }
    }, 501)
  });
}

// function resizeMobileMenuAndFooter(){
//   throw new Error('rewrite this resizeMobileMenuAndFooter function');
//   var siteMenu = $(".siteMenu").first();
//   var tabs = siteMenu.add("#MenuDisplay").children(".tab").not("#Notifications, #mobilePlaceholder, #MobileMenu"), hasPlaceholder = ($("#mobilePlaceholder").length == 1);
//   if (!siteMenu.hasClass("mobile")){
//     menuWidth = siteMenu.outerWidth();
//   }
//   var logo = $("#NavBar").find('.logo'), logoW = logo[0].scrollWidth, menuW = siteMenu[0].scrollWidth, em;
//   em = getEm();
//   var w = $("body").width();
//   var tooWide = ((logoW + menuW + 6*em) > w), wideEnough = null;
//   if (siteMenu.data('width') != undefined){
//     wideEnough = ((logoW + siteMenu.data('width') + 6*em) < w);
//   }
//   if (tooWide){
//     siteMenu.data('width',menuW);
//     siteMenu.addClass("mobile");
//     if (hasPlaceholder){
//       $("#mobilePlaceholder").replaceWith(tabs);
//     }else{
//       tabs.appendTo("#MenuDisplay");    
//     }
//   }else if (wideEnough){
//     siteMenu.removeClass("mobile");
//     tabs.appendTo(siteMenu);
//     siteMenu.find(".dropDown").removeClass("active");
//     siteMenu.removeData('width');
//   }
//   moveNotifications();

//   if (w < 480){$("footer").find(".logo, .icons, .contact, .hours").addClass("mobile");}
//   else if (w < 750){
//     $("footer").find(".logo, .icons").addClass("mobile");
//     $("footer").find(".contact, .hours").removeClass("mobile");
//   }
//   else {$("footer").find(".logo, .icons, .contact, .hours").removeClass("mobile");}
// }
// function moveNotifications(){
//   throw new Error('rewrite this moveNotifications function');

//   var siteMenu = $(".siteMenu").first(), mobileNow = siteMenu.hasClass('mobile');
//   if (mobileNow){
//     $("#Notifications").prependTo(siteMenu);
//   }else{
//     $("#Notifications").insertBefore(siteMenu.find(".divide"));
//   }
// }
// function listenMobileMenuExit(e){
//   if (!$(e.target).is(".tab, .title, .dropdown, li, #MenuToggle")){
//     $("#MenuToggle").click();
//   }
// }

var timer;
function resizeElements(ev) {
  //   clearTimeout(timer);
  //   timer = setTimeout(function(){
  //     if (typeof ev !== 'undefined' && typeof ev === 'object'
  //       && typeof ev.type !== 'undefined' && ev.type === 'resize'
  //       && vhIndicatorHeight !== undefined && !inputHasFocus){
  // // console.log(ev);
  // vhIndicatorHeight = vhIndicator.height();
  // }
  // // if (vhIndicatorHeight !== undefined) console.log(vhIndicatorHeight);
  // resizeSplits();
  // resizeQuotes();
  // resizeMobileMenuAndFooter();
  // resizeFooterPadding();
  // resizeImageClicks();
  // // resizeFcCalendar();
  // // optionsNavOverflowCheck();
  // }.bind(null, ev),150)
}


function followLink() {
  if ($(this).data('target') != undefined) {
    var t = $(this).data("target");
    window.location.href = t;
  } else if ($(this).data('tab') != undefined) {
    var t = $(this).data('tab');
    $(t).find(".title").click();
  }
}
function plural(model) {
  model = model.toLowerCase();
  model += "s";
  return model;
}
function singular(model) {
  model = model.toLowerCase();
  model = model.slice(0, -1);
  return model;
}

// $(document).on('click','.cancel', Blur.undo)

// $(document).ready(function(){
//   // vhIndicator = $(".vhIndicator").first();
//   // if (vhIndicator.length > 0){
//   //   vhIndicatorHeight = vhIndicator.length > 0 ? vhIndicator.height() : undefined;
//   //   $('body').on('focusin','input[type="text"], textarea',checkRapidVhShrink);
//   //   $('body').on('focusout','input[type="text"], textarea',checkRapidVhGrowth);        
//   // }
//   resizeElements();
//   if ($("#LoggedOut").length>0){
//     setTimeout(function(){
//       slideFadeOut($("#LoggedOut"));
//     },2000)
//   }
//   if (user && user.is('patient')){
//     systemModalList.push("createAppointment","editAppointment","SelectServices","SelectPractitioner","SelectLUX","ApptDetails","ServiceListModal","PractitionerListModal");
//     systemModals = systemModals.add($("#createAppointment, #editAppointment, #SelectServices, #SelectPractitioner, #SelectLUX, #ApptDetails, #ServiceListModal, #PractitionerListModal"));
//   }
//   // $(document).on('click','.cancel',function(ev){
//   //   if ($(ev.target).hasClass('toggle')) return;
//   //   Blur.undo();
//   // });
// })


jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend(jQuery.easing,
  {
    // t: current time, b: begInnIng value, c: change In value, d: duration

    def: 'easeOutQuad',
    swing: function (x, t, b, c, d) {
      //alert(jQuery.easing.default);
      return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
    },
    easeInQuad: function (x, t, b, c, d) {
      return c * (t /= d) * t + b;
    },
    easeOutQuad: function (x, t, b, c, d) {
      return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function (x, t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * t * t + b;
      return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    easeInCubic: function (x, t, b, c, d) {
      return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function (x, t, b, c, d) {
      return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function (x, t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
      return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    easeInQuart: function (x, t, b, c, d) {
      return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function (x, t, b, c, d) {
      return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function (x, t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
      return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    easeInQuint: function (x, t, b, c, d) {
      return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function (x, t, b, c, d) {
      return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function (x, t, b, c, d) {
      if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
      return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeInSine: function (x, t, b, c, d) {
      return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function (x, t, b, c, d) {
      return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function (x, t, b, c, d) {
      return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function (x, t, b, c, d) {
      return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: function (x, t, b, c, d) {
      return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function (x, t, b, c, d) {
      if (t == 0) return b;
      if (t == d) return b + c;
      if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
      return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function (x, t, b, c, d) {
      return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function (x, t, b, c, d) {
      return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function (x, t, b, c, d) {
      if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
      return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInElastic: function (x, t, b, c, d) {
      var s = 1.70158; var p = 0; var a = c;
      if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
      if (a < Math.abs(c)) { a = c; var s = p / 4; }
      else var s = p / (2 * Math.PI) * Math.asin(c / a);
      return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function (x, t, b, c, d) {
      var s = 1.70158; var p = 0; var a = c;
      if (t == 0) return b; if ((t /= d) == 1) return b + c; if (!p) p = d * .3;
      if (a < Math.abs(c)) { a = c; var s = p / 4; }
      else var s = p / (2 * Math.PI) * Math.asin(c / a);
      return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },
    easeInOutElastic: function (x, t, b, c, d) {
      var s = 1.70158; var p = 0; var a = c;
      if (t == 0) return b; if ((t /= d / 2) == 2) return b + c; if (!p) p = d * (.3 * 1.5);
      if (a < Math.abs(c)) { a = c; var s = p / 4; }
      else var s = p / (2 * Math.PI) * Math.asin(c / a);
      if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
      return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
    },
    easeInBack: function (x, t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function (x, t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function (x, t, b, c, d, s) {
      if (s == undefined) s = 1.70158;
      if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
      return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    easeInBounce: function (x, t, b, c, d) {
      return c - jQuery.easing.easeOutBounce(x, d - t, 0, c, d) + b;
    },
    easeOutBounce: function (x, t, b, c, d) {
      if ((t /= d) < (1 / 2.75)) {
        return c * (7.5625 * t * t) + b;
      } else if (t < (2 / 2.75)) {
        return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
      } else if (t < (2.5 / 2.75)) {
        return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
      } else {
        return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
      }
    },
    easeInOutBounce: function (x, t, b, c, d) {
      if (t < d / 2) return jQuery.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
      return jQuery.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
  });
