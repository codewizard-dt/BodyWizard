import {log, system} from '../functions';
import {model} from '../models';
import {DateTime as LUX} from 'luxon';

Object.defineProperties(Array.prototype, {
  isSolo: {value: function(){return this.length === 1}},
  isEmpty: {value: function(){return this.length === 0}},
  notEmpty: {value: function(){return this.length > 0}},
  notSolo: {value: function(){return this.length > 1}},
  smartJoin: {value: function(str, options = {}){
    if (typeof str == 'object') options = str;
    else options.merge({str});
    str = ifu(options.str, 'and');
    let oxford = options.oxford || true, map = options.map || null, array = this;
    if (map) array = this.map(map);
    return system.validation.array.join(array,str,oxford)}
  },
  smartPush: {value: function(){
    let count = this.length, values = [...arguments];
    while (values.notEmpty()) {
      let value = values.shift();
      if (!this.includes(value)) this.push(value);
    }
    return this.length != count;
  }}
});
Object.defineProperties(Object.prototype, {
  json_if_valid: {value: function(){return this}},
  slideFadeOut: {value: function(time,callback){
    if (this.ele) return this.ele.slideFadeOut(time,callback);
    else log({obj:this, error: new Error('no ele found in object')});
  },writable:true},
  slideFadeIn: {value: function(time,callback){
    if (this.ele) return this.ele.slideFadeIn(time,callback);
    else log({obj:this, error: new Error('no ele found in object')});
  },writable:true},
  slideFadeToggle: {value: function(time,callback){
    if (this.ele) return this.ele.slideFadeToggle(time,callback);
    else log({obj:this, error: new Error('no ele found in object')});
  },writable:true},
  define_attrs_by_form: {value: function(selector){
    try {
      let form = $(selector);
      if (form.dne()) throw new Error('form does not exist');
      if (form.length > 1) throw new Error('more than one form found');
      let all_pass = true, instance = this;
      this.attr_list = {};
      form.find('.answer').each((a,answer) => {
        let obj = $(answer).getObj(), response = $(answer).verify('required'), name = obj.options.name;
        if (response === false) all_pass = false;
        instance.attr_list[name] = response;
      })
      this.valid = all_pass;
    }catch (error) {
      log({error,selector});
    }
  }},
  dot_notation_get: {value: function(nested_dot){
    let split = nested_dot.split('.'), next = split.shift(), value = this[next];
    try {
      while (split.notEmpty()) {
        if (value == undefined) return undefined;
        if (typeof value != 'object') throw new Error('Cannot traverse fully into dot notation, ran into non-object');
        next = split.shift();
        value = value[next];
      }
    } catch (error) {
      value = undefined;
      log({error});
    }
    return value;
  }},
  to_key_value_html: {value: function(){
    let wrapper = $('<div/>');
    for (let key in this) {
      let item = $('<div/>',{class:key.toKeyString()});
      if (this.hasOwnProperty(key)) wrapper.append(
        item.append(
          `<b style='padding-right:5px'>${key}:</b>`,
          this[key] instanceof jQuery ? this[key].clone(true) : `<span>${this[key]}</span>`
          )
        );
    }
    return wrapper;
  }},
  is_array: {value: function(){
    return Array.isArray(this);
  }},
  is_empty: {value: function(){
    for (let attr in this) {
      if (this.hasOwnProperty(attr)) return false;
    }
    return true;
  }},
  merge: {value: function(obj){
    if (typeof obj != 'object') throw new Error(`merge argument must be an object, ${typeof obj} given`);
    $.extend(true,this,obj);
    return this;
  }},
  duplicate: {value: function(){ 
    let str = JSON.stringify(this), json = JSON.parse(str);
    return json;
  }},
});
Object.defineProperties(String.prototype, {
  is_array: {value: function(){
    return false;
  }},  
  toTitleCase: {value: function(){
    return this.replace(/(?:^|\s)\w/g, function(match) {
      return match.toUpperCase();
    });
  }},
  camel: {value: function(){
    return this[0].toLowerCase() + this.toTitleCase().substring(1).replace(/ /g, '');
  }},
  snake: {value: function(){
    return this.toLowerCase().replace(/ /g, '_');
  }},
  lettersOnly: {value: function(){
    return this.replace(/[^a-zA-Z]/g, '');
  }},
  lettersAndSpacesOnly: {value: function(){
    return this.replace(/_/g,' ').replace(/[^a-zA-Z ]/g, '');
  }},
  removeSpaces: {value: function(){
    return this.replace(/ /g,'');
  }},
  toKeyString: {value: function(add_spaces = false){
    let str = this.lettersAndSpacesOnly().toTitleCase().removeSpaces();
    return add_spaces ? str.addSpacesToKeyString() : str;
  }},
  addSpacesToKeyString: {value: function(){
    let matches = this.match(/[A-Z]/g), str = this;
    if (matches) matches.forEach((match,m) => {str = str.replace(match,`${m == 0 ? '' : ' '}${match}`)});
    return str;
  }},
  toBool: {value: function(truthy = undefined, falsey = undefined){
    return system.validation.boolean(this.valueOf(), truthy, falsey);
  }},
  json_if_valid: {value: function(){return system.validation.json(this.toString())}},  
  to_class_obj: {value: function(attr_list){
    let FoundClass = Models[this] || Features[this] || null;
    return FoundClass ? new FoundClass(attr_list) : null;
  }},
  get_obj_val: {value: function(obj = null, ok_if_missing = false){
    let split = this.valueOf().split('.'), obj_val = null;
    try{
      let first = split.shift();
      if (first == 'system') obj_val = system;
      else if (first == 'forms') obj_val = forms;
      else if (first == 'model') obj_val = model;
      else obj_val = obj ? obj[first] : Models[first] || Forms[first] || Features[first] || system[first] || window[first];
      if (!obj_val) throw new Error(`${first} not given or found in window or class_map`);
      if (obj_val) {
        while (split.length > 0) {
          let next = split.shift();
          obj_val = obj_val[next];
          if (obj_val == model.actions) {
            obj_val = model.actions.bind(null,split.shift());
          }
        }
      }
      if (obj_val == undefined) throw new Error(`obj_val '${this}' not found`);
    }catch(error) {
      if (!ok_if_missing) log({error,string:this.valueOf()});
      obj_val = null;
    }
    return obj_val;
  }},
  to_fx: {value: function(obj = null){
    let fx = this.get_obj_val(obj);
    if (fx && typeof fx != 'function') log({obj,string:this},`${this.valueOf()} not a function`);
    return fx;
  }},
  moment_hmma: {value: function(){
    return moment(this,'h:mma');
  }},
  countDecimals: {value: function(){
    return Number(this).countDecimals();
  }},
  toFixed: {value: function(){
    return Number(this).toFixed();
  }},
});
Object.defineProperties(Number.prototype, {
  is_array: {value: function(){
    return Array.isArray(this);
  }},
  toKeyString: {value: function() {
    return this.toString().toKeyString();
  }}
})
Object.defineProperties(Boolean.prototype, {
  toBool: {value: function(){return this.valueOf();}}
})
Number.prototype.countDecimals = function () {
  if(Math.floor(this.valueOf()) === this.valueOf()) return 0;
  return this.toString().split(".")[1].length || 0; 
}
