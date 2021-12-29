import { log, system, menu, Features } from '../functions';
import { forms, Forms } from '../forms';
import { model, table, Models } from '../models';
import { DateTime as LUX } from 'luxon';

Object.defineProperties(Array, {
  intersect: {
    value: function () {
      let arrays = [...arguments], working_array = arrays.shiftNotNull();
      while (arrays.notEmpty()) {
        let next_array = arrays.shiftNotNull();
        if (next_array) working_array = working_array.filter(item => next_array.includes(item));
      }
      return working_array;
    }
  }
});
Object.defineProperties(Array.prototype, {
  isSolo: { value: function () { return this.length === 1 } },
  isEmpty: { value: function () { return this.length === 0 } },
  notEmpty: { value: function () { return this.length > 0 } },
  notSolo: { value: function () { return this.length > 1 } },
  smartJoin: {
    value: function (conj, options = {}) {
      if (this.isEmpty()) return options.none_ele || 'none';
      if (typeof conj == 'object') options = conj;
      else options.merge({ conj });
      conj = options.conj || options.str || 'and';
      let joiner = ifu(options.joiner, ', ');
      let limit_ele = options.limit_ele || '...';

      let array = options.map ? this.map(options.map) : [...this], limit = options.limit || null;

      if (options.map) log({ options, array });
      let oxford = ifu(options.oxford, true);
      let new_array = [];
      let at_limit = _ => limit && limit < (new_array.length + 2) / 2;
      let count = array.length;
      while (array.notEmpty()) {
        let next = options.null ? array.shift() : array.shiftNotNull();
        new_array.push(next === null ? options.null : next);
        if (at_limit()) { new_array.push(joiner, limit_ele); break; }
        if (array.isSolo()) new_array.push(`${(oxford && count != 2) ? `${joiner}${conj} ` : ` ${conj} `}`);
        else if (array.notSolo()) new_array.push(joiner);
      }
      return options.as_array ? new_array : new_array.join('');
    }
  },
  smartPush: {
    value: function () {
      let values = [...arguments];
      while (values.notEmpty()) {
        let value = values.shift();
        if (!this.includes(value)) this.push(value);
      }
      return this;
    }
  },
  smartPushFront: {
    value: function () {
      let count = this.length, values = [...arguments];
      while (values.notEmpty()) {
        let value = values.shift();
        if (!this.includes(value)) this.splice(0, 0, value);
      }
      return this;
    }
  },
  shiftNotNull: {
    value: function () {
      let value = undefined;
      do { value = this.shift() } while (value === null);
      return value;
    }
  },
  last: {
    value: function () {
      return this[this.length - 1];
    }
  }
});
Object.defineProperties(Object.prototype, {
  define_by: { value: function (object) { for (let key in object) this[key] = object[key] } },
  json_if_valid: { value: function () { return this } },
  slideFadeOut: {
    value: function (time, callback) {
      if (this.ele) return this.ele.slideFadeOut(time, callback);
      else log({ obj: this, error: new Error('no ele found in object') });
    }, writable: true
  },
  define_attrs_by_form: {
    value: function (selector) {
      try {
        let form = $(selector);
        if (form.dne()) throw new Error('form does not exist');
        if (form.length > 1) throw new Error('more than one form found');
        let all_pass = true, instance = this;
        this.attr_list = {};
        form.find('.answer').each((a, answer) => {
          let obj = $(answer).getObj(), response = $(answer).verify('required'), name = obj.options.name;
          if (response === false) all_pass = false;
          instance.attr_list[name] = response;
        })
        this.valid = all_pass;
      } catch (error) {
        log({ error, selector });
      }
    }
  },
  dot_notation_get: {
    value: function (nested_dot) {
      if (nested_dot === '') return this;
      let get = (obj, key) => { return obj[key] || obj[key.toTitleCase()] || obj[key.snake()] || obj[key.addSpacesToKeyString()] }
      let split = nested_dot.split('.'), next = split.shift(), value = get(this, next);
      try {
        while (split.notEmpty()) {
          if (value == undefined) return undefined;
          if (typeof value != 'object') throw new Error(`dot notation GET ${nested_dot} unresolvable, ran into non-object (${typeof value})`);
          next = split.shift();
          value = get(value, next);
        }
      } catch (error) {
        value = undefined;
      }
      return value;
    }
  },
  dot_notation_set: {
    value: function (nested_dot, new_value, options = {}) {
      let merge = ifu(options.merge, true);
      let force = ifu(options.force, true);
      let parents = nested_dot.split('.'), next = null, parent = this;
      let value_is_object = typeof new_value == 'object' && new_value !== null && !new_value.is_array();
      if (nested_dot == '') {
        if (typeof new_value == 'object' && !new_value.is_array()) this.merge(new_value);
        else throw new Error(`ERROR this operation would overwrite all settings`);
        return new_value;
      }

      try {
        while (parents.notEmpty()) {
          if (typeof parent != 'object') throw new Error(`dot notation SET ${nested_dot} unresolvable, ran into non-object (${typeof value}). Set options.force to true to override`);
          else if (parent.is_array()) throw new Error(`dot notation SET ${nested_dot} unresolvable, ran into array. Set options.force to true to override`);
          next = parents.shift();
          if (parent[next] === undefined || parent[next] === null) parent[next] = {};
          if (force && (typeof parent[next] != 'object' || parent[next].is_array())) {
            parent[next] = {};
          }
          if (parents.isEmpty()) {
            if (value_is_object && merge) parent[next].merge(new_value);
            else parent[next] = new_value;
          } else parent = parent[next];
        }
      } catch (error) { log({ error, nested_dot, new_value, options }); return error }
      return new_value;
    }
  },
  dot_notation_flatten: {
    value: function (dot = '.') {
      let flatten = {};
      for (let key in this) {
        if (!this.hasOwnProperty(key)) continue;
        let value = this[key], type = typeof value;
        if (type == 'object' && value.not_array()) {
          let inner_obj = value.dot_notation_flatten(dot);
          for (let inner_key in inner_obj) {
            if (!inner_obj.hasOwnProperty(inner_key)) continue;
            flatten[`${key}${dot}${inner_key}`] = inner_obj[inner_key];
          }
        } else flatten[key] = this[key];
      }
      // log({dot,flatten});
      return flatten;
    }
  },
  to_key_value_html: {
    value: function () {
      let wrapper = $('<div/>');
      for (let key in this) {
        let item = $('<div/>', { class: key.toKeyString() }), value = this[key];
        if (this.hasOwnProperty(key)) wrapper.append(
          item.append(
            `<b style='padding-right:5px'>${key}:</b>`,
            value instanceof jQuery ? value.clone(true) : `<span>${value}</span>`
          )
        );
      }
      return wrapper;
    }
  },
  toBool: { value: function () { return this } },
  not_array: {
    value: function () {
      return !Array.isArray(this) && this !== null;
    }
  },
  is_array: {
    value: function () {
      return Array.isArray(this);
    }
  },
  is_empty: {
    value: function () {
      for (let attr in this) {
        if (this.hasOwnProperty(attr)) return false;
      }
      return true;
    }
  },
  merge: {
    value: function (obj) {
      try {
        if (typeof obj == 'undefined' || obj === null) return this;
        if (typeof obj != 'object') throw new Error(`merge argument must be an object, ${typeof obj} given`);

        if (obj.is_array() && obj.isEmpty()) return this;
        else if (obj.is_array()) {
          // log({error:new Error(`merge argument should be an plain object, array given`)});
          if (this.is_array()) this.smartPush(...obj);
          else if ($.isEmptyObject(this)) throw new Error(`cannot merge array with plain object`);
          else throw new Error(`cannot merge array with plain object`);
          return this;
        }
        $.extend(true, this, obj);
        return this;
      } catch (error) {
        log({ error, obj, this: this });
      }
    }, writable: true
  },
  duplicate: {
    value: function () {
      let str = JSON.stringify(this), json = JSON.parse(str);
      return json;
    }
  },
});
Object.defineProperties(String.prototype, {
  is_array: {
    value: function () {
      return false;
    }
  },
  toTitleCase: {
    value: function () {
      return this.replace(/(?:^|\s)\w/g, function (match) {
        return match.toUpperCase();
      });
    }
  },
  ucFirst: {
    value: function () {
      return this.charAt(0).toUpperCase() + this.slice(1);
    }
  },
  camel: {
    value: function () {
      return this[0].toLowerCase() + this.toTitleCase().substring(1).replace(/ /g, '');
    }
  },
  snake: {
    value: function () {
      return this.toLowerCase().replace(/ /g, '_');
    }
  },
  lettersOnly: {
    value: function () {
      return this.replace(/[^a-zA-Z]/g, '');
    }
  },
  lettersAndSpacesOnly: {
    value: function () {
      return this.replace(/_/g, ' ').replace(/[^a-zA-Z0-9 ]/g, '');
    }
  },
  removeSpaces: {
    value: function () {
      return this.replace(/ /g, '');
    }
  },
  toKeyString: {
    value: function (add_spaces = false) {
      let str = this.lettersAndSpacesOnly().toTitleCase().removeSpaces();
      return add_spaces ? str.addSpacesToKeyString() : str;
    }
  },
  addSpacesToKeyString: {
    value: function () {
      let str = this.trim().replace(/[A-Z]/g, (letter, index) => ` ${letter}`);
      str = str.replace('I C D', 'ICD').replace('C P T', 'CPT').trim();
      return str;
    }
  },
  toBool: {
    value: function (truthy = undefined, falsey = undefined) {
      // return this.bool_match(true);
      return system.validation.boolean(this.valueOf(), truthy, falsey);
    }
  },
  bool_match: {
    value: function (boolean, truthy_vals = ['true', 'yes'], falsey_vals = ['false', 'no ', 'no,']) {
      if (boolean === true) {
        return truthy_vals.includes(this) || truthy_vals.some(v => this.includes(v));
      } else if (boolean === false) {
        return falsey_vals.includes(this) || falsey_vals.some(v => this.includes(v));
      } else return false;
    }
  },
  json_if_valid: { value: function () { return system.validation.json(this.toString()) } },
  to_class_obj: {
    value: function (attr_list) {
      let FoundClass = Models[this] || Features[this] || null;
      if (!FoundClass) log({ error: new Error(`unable to create obj from ${this}, check Models export `) });
      return FoundClass ? new FoundClass(attr_list) : null;
    }
  },
  get_obj_val: {
    value: function (obj = null, ok_if_missing = false) {
      let split = this.valueOf().split('.'), obj_val = null;
      try {
        let first = split.shift(), check_me = [Models, Forms, Features, system, window];
        if (first == 'system') obj_val = system;
        else if (first == 'forms') obj_val = forms;
        else if (first == 'model') obj_val = model;
        else if (first == 'Menu' || first == 'Http') obj_val = Http;
        else if (obj) obj_val = obj[first];
        while (check_me.notEmpty() && !obj_val) {
          let check = check_me.shift();
          obj_val = check[first];
        }
        if (!obj_val) throw new Error(`${first} not given or found in window or class_map`);
        if (obj_val) {
          while (split.length > 0) {
            let next = split.shift();
            obj_val = obj_val[next];
            if (obj_val == model.actions) { obj_val = model.actions.bind(null, split.shift()); }
          }
        }
        if (obj_val == undefined) throw new Error(`obj_val '${this}' not found`);
      } catch (error) {
        if (!ok_if_missing) log({ obj, error, string: this.valueOf() });
        obj_val = null;
      }
      return obj_val;
    }
  },
  // to_fx: {value: function(obj = null){
  //   let fx = this.get_obj_val(obj);
  //   if (fx && typeof fx != 'function') log({obj,string:this},`${this.valueOf()} not a function`);
  //   return fx;
  // }},
  to_fx: {
    get() {
      let base_str = this, split = base_str.split(':'), fx_str = split[0], bind_me = split.notSolo() ? split[1] : null;
      let fx = fx_str.get_obj_val();
      if (fx && typeof fx != 'function') log({ string: this }, `${fx_str.valueOf()} not a function`);
      return bind_me ? fx.bind(bind_me) : fx;
    }
  },
  moment_hmma: {
    value: function () {
      return moment(this, 'h:mma');
    }
  },
  countDecimals: {
    value: function () {
      return Number(this).countDecimals();
    }
  },
  toFixed: {
    value: function () {
      return Number(this).toFixed();
    }
  },
  is_numeric: {
    value: function () {
      let n = Number(n);
      return Number.isNaN(n);
    }
  },
});
Object.defineProperties(Number.prototype, {
  is_array: {
    value: function () {
      return Array.isArray(this);
    }
  },
  toKeyString: {
    value: function () {
      return this.toString().toKeyString();
    }
  },
  countDecimals: {
    value: function () {
      if (Math.floor(this.valueOf()) === this.valueOf()) return 0;
      return this.toString().split(".")[1].length || 0;
    }
  }
})
Object.defineProperties(Boolean.prototype, {
  toBool: { value: function () { return this.valueOf(); } },
  to_string: { value: function () { return this.valueOf() === true ? 'true' : 'false' } },
  // bool_match: {value: function(bool){return this.valueOf() === bool.toBool()}}
})
Object.defineProperties(Function.prototype, {
  to_fx: { get() { return this } }
});