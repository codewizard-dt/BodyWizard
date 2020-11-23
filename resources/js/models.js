import {system, practice, log, Features, menu} from './functions';
import {forms, Forms} from './forms';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import luxonPlugin from '@fullcalendar/luxon'
import rrulePlugin from '@fullcalendar/rrule';
import {DateTime as LUX, Duration as LUXDur} from 'luxon';

class ModelTable {
  constructor(ele, selectionLimit = 1){
    this.ele = ele;
    this.ele.data('class_obj',this);
    this.name = ele.attr('id');
    this.model = ele.data('model');
    this.nameColumn = ele.data('namecolumn');
    this.hideorder = ele.data('hideorder');
    this.limit = selectionLimit;
    this.rows = this.ele.find('tr').not('.head, .noMatch');
    this.nomatch = this.ele.find('tr').filter('.noMatch');
    ele.wrap("<div class='tableWrapper'/>");
    this.rows.addHoverClassToggle();

    let filters = [];
    init($('.filter').filter((f,filter) => $(filter).data('target') == ele.attr('id')),function(){
      let filter = new Features.Filter($(this));
      filters.push(filter);
      fix_width(filter.ele);
    })
    this.filters = filters;

    this.significance = this.ele.data('significance');
    if (this.significance == 'primary') {
      this.rows.on('click', {model:this.model}, this.loadModelDetails);
      this.connectedModels = {};
    }
    else if (this.significance == 'secondary') {
      this.modal = ele.closest('.connectedModel');
      this.rows.on('click', {table:this}, this.selectModel);
      this.connectedto = this.modal.data('connectedto');
      this.modal.find('.selectData').on('click', {modelTable:this}, this.assignSelection);
    }

    this.resizetimer = null;

    this.ele.data('class_obj',this);
    this.filter();
    if ($('.optionsNav').exists() && $('.optionsNav').data('model') == this.model){
      this.nav = $('.optionsNav');
      this.selectByUid(this.nav.data('uid'));
    }
  }

  get width(){
    return this.ele.parent().width();
  }
  get isTooWide(){
    let wrap = this.ele.parent().parent();
    return this.width > wrap.width();
  }
  showAllColumns(){
    this.ele.find('td, th').show();
  }

  get activeFilters(){return this.filters.filter(function(filter){return filter.isActive});}
  get matches(){
    let matches = this.activeFilters.map(function(filter){return filter.matches});
    let truematch = this.rows.map(function(){return $(this).data('uid')}).get();
    if (!matches.isEmpty()) {
      truematch = matches[0];
      if (matches.length > 1){
        for (let x = 1; x < matches.length; x++){
          truematch = truematch.filter(uid => matches[x].includes(uid));
        }
      }            
    }
    return truematch;
  }
  filter(){
    if (this.matches.isEmpty()){
      this.rows.hide();
      this.nomatch.show();
    }else{
      this.rows.hide();
      let matches = this.matches;
      this.rows.filter(function(){
        return matches.includes($(this).data('uid'));
      }).show();
      this.nomatch.hide();
    }
  }

  get selected(){return this.rows.filter('.active')}
  get selectedIds(){
    let idArr = this.selected.map((r,row) => $(row).data('uid')).get();
    return this.limit == 1 ? idArr[0] : idArr;
  }
  get selectedNames(){
    return this.selected.map((r,row) => this.getRowName.bind(this,row)()).get().join(', ');
  }
  get selectedData(){
    let dataArr = this.selected.map((r,row) => $.extend({}, $(row).data(), this.getRowContents(row), true)).get();
    return this.limit == 1 ? dataArr[0] : dataArr;
  }
  getRowContents(row){
    let cells = $(row).find('td'), contents = {};
    cells.each((c,cell) => {
      let key = $(cell).attr('class').split(' ')[0],
      value = trimCellContents($(cell));
      contents[key] = value;
    })
    return contents;
  }
  getDataById(uids){
    if (typeof uids == 'number'){
      let match = this.rows.get().find(row => $(row).data('uid') == uids);
      let columns = this.getRowContents(match);
      return $.extend(columns,$(match).data());
    }else{
      let fx = this.getDataById, modelTable = this;
      return uids.map(uid => fx.bind(modelTable, uid)());
    }
  }
  getNameById(uids){
    if (!uids) return null;
    if (typeof uids == 'number'){
      let match = this.rows.filter((r,row) => $(row).data('uid') == uids);
      return this.getRowName(match);
    }else{
      let fx = this.getNameById, modelTable = this;
      return uids.map(uid => fx.bind(modelTable, uid)());
    }
  }
  getRowName(row){return this.trimCellContents($(row).find('.'+this.nameColumn))}
  trimCellContents(cell){return $(cell).text().replace("...","").trim()}
  async loadModelDetails(ev){
    $('.optionsNav').smartScroll();
    if ($(this).hasClass('active')) return;
    else {
      let nav = $('.optionsNavWrapper');
      $(this).closest('table').resetActives();
      $(this).addClass('active');
      blur(nav,'loading');
      await menu.fetch(`/options-nav/${ev.data.model}/${$(this).data('uid')}`, nav, true);
      table.initialize.table_nav_options();
    }
  }
  selectModel(ev){
    let table = ev.data.table, limit = table.limit, model = table.model;
    if (limit == 1) {
      if ($(this).hasClass('active')) {
        $(this).removeClass('active');
      }else{
        table.ele.resetActives();
        $(this).addClass('active');                
      }
    }else if (table.selected.length < limit){
      $(this).addClass('active');
    }else{
      $(this).removeClass('active');
    }
    table.updateSelectedDisplay();
  }
  selectByUid(uids){
    let match = null;
    if (typeof uids == 'number'){
      match = this.rows.filter((r,row) => $(row).data('uid') == uids);
    }else{
      match = this.rows.filter((r,row) => uids.includes($(row).data('uid')));
    }
    this.ele.resetActives();
    $(match).addClass('active');
  }
  updateSelectedDisplay(){
    let fx = this.getRowName, table = this, text = this.selected.map((r,row) => fx.bind(table,row)()).get().join(', '),
    form = this.ele.closest('.modalForm'), display = form.find('.displaySelection'), btn = form.find('.selectData');
    if (text == "") {
      btn.addClass('disabled');
      display.text('none selected');
    }
    else {
      display.text(text);
      display.show()
      btn.removeClass('disabled');
    }
  }
  assignSelection(ev){
    if ($(this).hasClass('disabled')) return;
    let modelTable = ev.data.modelTable, connectedTo = modelTable.connectedto, ids = modelTable.selectedIds, names = modelTable.selectedNames;
    if (connectedTo == 'Appointment'){
      let model = modelTable.model.charAt(0).toLowerCase() + modelTable.model.slice(1), obj = {};
      obj[model] = ids;
      appointment.set(obj);
      appointment.update.detail(model, names);
    }
    if (modelTable.ele.is(':visible')) unblur();
  }
}
class Model {
  constructor (attr_list, type) {
    if (!attr_list) throw new Error('attr_list not provided to Model constructor');
    else this.valid = true;
    this.attr_list = attr_list;
    this.type = type.toKeyString();
    if (this.attr_list.uid) {
      this.uid = this.attr_list.uid;
    }
    log(this, `new ${type}`);
  }

  backup_attr_values (array) {
    let model = this;
    array.forEach(value_str => {
      let values = value_str.split(':'), attr = values[0], backups = values.slice(1);
      while (model.attr_list[attr] == undefined && backups.length > 0) {
        model.attr_list[attr] = model.attr_list[backups.shift()];
      }
      if (model.attr_list[attr] == undefined) delete model.attr_list[attr];
    })
  }
  static construct_from_form(selector) {
    let attr_list = {}, all_pass = true;;
    try {
      let form = $(selector);
      if (form.dne()) throw new Error('form does not exist');
      if (form.length > 1) throw new Error('more than one form found');
      // attr_list = {};
      form.find('.answer').filter(':visible').each((a,answer) => {
        let obj = $(answer).getObj(), value = $(answer).verify('required'), name = obj.options.name;
        if (value === false) all_pass = false;
        attr_list[name] = value;
        // log({answer,value,obj})
      })
    }catch (error) {
      log({error,selector});
      all_pass = false;
    }
    return all_pass ? attr_list : false;
  }
  update_attr_by_form (options = {}) {
    let attr_list = this.attr_list, all_pass = true;
    try {
      let form = options.form || null, type = this.attr_list.model || this.type;
      log({instance:this});
      if (!form) form = $(`#Create${type}`);
      if (form.dne()) throw new Error('form does not exist');
      if (form.length > 1) throw new Error('more than one form found');
      let answers = Forms.Answer.get_all_within(form);
      answers.forEach(answer => {
        let value = answer.verify('required'), name = answer.options.name;
        if (value === false) all_pass = false;
        attr_list[name] = value;
        // log({answer,value},value === false ? "FALSE" : value);
      })
    }catch (error) {
      log({error,options,all_pass});
      all_pass = false;
    }
    return all_pass;
  }
  clear_uid () {
    this.uid = null;
    this.attr_list.uid = null;
  }
  static settings_icon () {
    let icon = new Image();
    icon.src = '/images/icons/settings_icon_yellow.png';
    $(icon).css({width:'1.2em',height:'1.2em',marginLeft: '0.5em',cursor:'pointer',opacity:0.6}).addOpacityHover();
    return $(icon);
  }
  static settings_obj_to_array_of_true_values (obj) {
    let array = [];
    for (let setting_name in obj) {
      let val = obj[setting_name].toBool();
      if (val) array.push(setting_name.addSpacesToKeyString());
    }
    return array;
  }
  async edit () {
    if (!this.edit_unique) {
      await menu.fetch(`/edit/${this.type.toKeyString()}/${this.uid}`,'new_modal:EditModel');
      Models[this.type.toKeyString()].editing = this;
    } else {
      await this.edit_unique();
    }
    let top = blurTopGet(), form = top && top.find('.createModel').exists() ? top.find('.createModel') : null;
    if (form) Model.form_mode('edit',form);
  }
  async settings () {
    if (!this.settings_unique) {
      let model = this;
      await menu.fetch(`/settings/${this.type.toKeyString()}/${this.uid}`,'new_modal:SettingsModal');
      let answers = Forms.Answer.get_all_within("#SettingsModal");
      if (this.settings_autosave) answers.forEach(answer => answer.options.after_change_action = model.settings_autosave);
    } else await this.settings_unique();
  }
  async save (options = {}) {
    let type = this.type, model = this, columns = {}, relationships = {}, addl_post_data = {};
    let proceed = true, clear_on_success = ifu(options.clear_on_success || true), clear_count = this.clear_count || options.clear_count || null;
    if (this.on_save) proceed = await this.on_save();
    if (!proceed) return;
    try {
      if (this.valid) {
        let save_blur = this.save_blur || false;
        if (save_blur) blur(save_blur.ele,'loading',save_blur.options);
        else blurTop('loading',{loadingColor:'var(--green)',loadingFade:true});
        
        let db_obj = this.db_save_obj, callback = this.save_callback ? this.save_callback.bind(this) : null;
        if (type == 'User') db_obj.uid = this.attr_list.user_id;
        log({db_obj, attr_list:this.attr_list},`saving new SINGLE ${this.type}`);
        if (this.wants_checkmark || options.wants_checkmark) db_obj.merge({wants_checkmark:true});
        let result = await $.ajax({
          url: `/save/${type}`,
          method: 'POST',
          data: db_obj,
          success: function(response){
            if (system.validation.xhr.error.exists(response.save_result)) return;
            if (clear_on_success) {
              let blur_callback = function () {
                log({clear_count});
                if (clear_count) unblur({repeat:clear_count,fade:400});
                else unblurAll({fade:400});
              }
              if (save_blur) blur(save_blur.ele,'checkmark', { callback: blur_callback, delay: 500 });
              else blurTop('checkmark', { callback: blur_callback, delay: 500 });
            }
            // log({response});
            Model.update_list(type,response.list_update);
            if (callback) callback(response.save_result);
            else $('.loadTarget').last().html(response.save_result);
          }
        })
        return result;
      } else throw new Error('cannot save invalid model, !this.valid');
    } catch (error) {
      log({error,attr_list:this.attr_list});
    }
  }
  async delete (name = null) {
    if (!this.delete_unique) {
      let instance = this, callback = this.delete_callback || menu.reload;
      name = name || this.attr_list.name || null;
      return new Promise(resolve => {
        confirm({
          header: `Delete ${this.type}${name ? `: '${name}'` : ''}?`,
          message: '<h3 class="pink">This cannot be undone!<br>Are you sure?</h3>',
          btntext_yes: 'permanently delete',
          btntext_no: 'cancel',
          callback_affirmative: async function(){
            blur('body','loading',{loadingColor:'var(--green)'});
            let result = $.ajax({
              url: '/delete/'+instance.type+'/'+instance.uid,
              method: 'DELETE',
              success: function(response) {
                if (response == 'checkmark') {
                  blurTop('checkmark',{callback: unblurAll.bind(null,{delay:500,callback})})
                  resolve(true);
                } else resolve(false);
              }
            })
          }
        })

      })
    } else this.delete_unique();
  }
  get db_save_obj () {
    let model = this, columns = {}, relationships = {}, uid = this.save_uid || this.uid || this.attr_list.uid || null;
    if (!this.db_columns) throw new Error(`db_columns not defined for ${this.type}`);
    this.db_columns.forEach(column => {
      if (model.attr_list[column]) {
        let attr = model.attr_list[column];
        if (attr instanceof LUX) {
          if (column.includes('datetime') || column.includes('date_time')) attr = attr.datetime_db;
        }
        columns[column] = attr;
      }
    });
    if (this.db_relationships) {
      for (let model in this.db_relationships) {
        if (this.attr_list[model]) relationships[model] = {uids: this.attr_list[model], method: this.db_relationships[model]}
      }
    }
    return {uid, columns, relationships};
  }
  dont_save (attrs) {
    let list = this.attrs_not_to_save || [];
    if (typeof attrs == 'string') list.push(attrs);
    else if (attrs.is_array()) list = [...list,...attrs];
    this.attrs_not_to_save = list;
  }
  static form_mode (mode, form, options = {}) {
    // let mode = options.mode || 'create';
    let header = form.find('h1'), submit_btn = form.find('.submit.create, .submit.edit'), type = submit_btn.data('model');
    if (mode == 'create') {
      header.text(header.text().replace('Edit','Create'));
      let text = options.btn_text || `create ${type.addSpacesToKeyString()}`;
      submit_btn.addClass('create').removeClass('edit').text(text);      
    } else if (mode == 'edit') {
      header.text(header.text().replace('Create','Edit'));
      let text = options.btn_text || `save changes to ${type.addSpacesToKeyString()}`;
      submit_btn.addClass('edit').removeClass('create').text(text);      
    }
  }
  static popup_links(model) {
    // log(Models);
    let unique = Models[model].popup_links_unique;
    return unique ? unique() : [];
  }
  static list_has_column (list, column) {return list && list[0] && list[0][column] != undefined;}
  static list_missing_columns (list, columns) {return columns.filter(column => !Model.list_has_column(list,column));}
  static list_is_pending (model) {return linkable_lists_pending[model] && linkable_lists_pending[model] === true;}
  static list (model) {return linkable_lists[model.toKeyString()] || null};
  static async update_list (model, list) {
    linkable_lists[model] = list;
    log({model,list:linkable_lists.model});
  }
  static async get_list (options = {}) {
    let model = options.model.toKeyString(), columns = options.columns || [], force = options.force || false, list = linkable_lists[model];
    columns.smartPush('name','uid');
    if (list && Model.list_missing_columns(list,columns).isEmpty() && !force) return linkable_lists[model];
    if (Model.list_is_pending(model)) {return await Model.await_list(model);}
    linkable_lists_pending[model] = true;
    let list_response = await $.ajax({
      url: `/${model}/list`,
      method: 'POST',
      data: {columns},
    });
    linkable_lists[model] = list_response;
    linkable_lists_pending[model] = false;
    return list_response;
  }
  static async await_list (model) {
    model = model.toKeyString();
    return await new Promise(resolve => {
      let timer = setInterval(function(){
        let list = linkable_lists[model];
        if (list) {
          clearInterval(timer);
          resolve(list);
        }
      },100);
    });
  }
  static names (model, uids) {
    try {
      let list = Model.list(model);
      if (!list) throw new Error('list not loaded');
      if (!uids.is_array()) uids = [uids];
      return uids.map(uid => list.find(m => m.uid == uid).name);
    } catch (error) {
      log({error,model,uids});
      return [];
    }
  }
  static async save_multi_callback (model_arr, data_arr) {
    model_arr.forEach((model,m) => {
      log({model,data:data_arr[m]});
      if (model.save_callback && !system.validation.xhr.error.exists(data_arr[m])) model.save_callback(data_arr[m],true);
    })
  }
  static async save_multi (model_array, options = {}) {
    let db_array = model_array.map(model => {
      return model.db_save_obj.merge({type: model.type});
    }), blur_ele = options.blur_ele || null, loadingColor = options.loadingColor || 'var(--darkgray97)';
    if (blur_ele) blur(blur_ele,'loading',{loadingColor});
    else blurTop('loading',{loadingColor});
    let data = {models: db_array};
    log({data, model_array, options},'save MULTI');
    if (options.wants_checkmark) data.merge({wants_checkmark:true});
    try {
      let result = await $.ajax({
        url: `/save/multi`,
        method: 'POST',
        data: data,
        success: async function(response){
          if (system.validation.xhr.error.exists(response)) return;
          await Model.save_multi_callback(model_array, response);
          if (blur_ele) unblur({ele:blur_ele});
          else unblurAll();
        }
      });
      return result;
    } catch (error) {
      log({error});
      return false;
    } 
  }
  static async retrieve (attrs, type, options = {}) {
    let instance = await $.ajax({
      url: `/retrieve/${type}`,
      method: 'POST',
      data: {attrs}.merge(options),
      success: function(response) {
        if (system.validation.xhr.error.exists(response)) return null;
        return response;
      }
    })
    return instance;
  }
  static async create_or_edit (options = {}) {
    try {
      if (!options.where) throw new Error('create_or_edit requires options.where');
      if (!options.type) throw new Error('create_or_edit requires options.type');
      let data = {where:options.where}.merge(options.ajax_data || {});
      log(data,'create or edit request');
      return await menu.fetch({
        url:`/create_or_edit/${options.type}`, 
        target:`new_modal:CreateOrEdit${options.type}`, 
        method:"POST", 
        data
      });
    } catch (error) {
      log({error,options});
    }
  }
}

class Category extends Model {
  // constructor (attr_list, )
}
class SettingsManager {
  constructor (options, mode = 'display') {
    for (let attr in options) {this[attr] = options[attr]}
    if (!this.obj) throw new Error('must supply an object');
    if (!this.obj.settings) this.obj.settings = {};
    SettingsManager.convert_obj_values_to_bool(this.obj.settings);
    if (!this.autosave && mode == 'edit') {
      if (!this.save || typeof this.save != 'function') throw new Error('must supply a save function');
      if (this.callback && typeof this.callback != 'function') this.callback = null;
      let settings_manager = this;
      this.autosave = new Features.Autosave({
        ele: $("#SettingsModal"),
        delay: 10000,
        send: function() {
          settings_manager.has_changes = false;
          return settings_manager.save();
        },
        callback: settings_manager.callback,
      })
    }
  }
  get_setting (nested_dot) {
    nested_dot = `settings.${nested_dot}`;
    let value = this.obj.dot_notation_get(nested_dot);
    return typeof value == 'string' ? value.toBool() : value;
  }
  update (answer) {
    this.has_changes = true;
    let split = answer.name.split('.'), master = {}, working = master;
    let value = answer.get();
    if (value != null && typeof value == 'object') {
      log({working,master,value},`1`)
      while (split.notEmpty()) {
        let next = split.shift();
        working[next] = {};
        working = working[next];
      }      
      working.merge(value);
    } else {
      log({working,master,value},`2`)
      while (split.notSolo()) {
        let next = split.shift();
        working[next] = {};
        working = working[next];
        log({working,next,value},`3`);
      }
      working[split.shift()] = value;
      log({working,master,value},`4`)
      // working = value;
    }
    log({value,master,working},`${typeof value}`);
    this.obj.settings.merge(master);
    if (this.obj.settings_apply) this.obj.settings_apply(400);
    log({obj:this.obj,answer,response:answer.get()},'UPDATE');
  }
  popup_create (header = '') {
    let update = this.update.bind(this), manager = this;
    let icon = Model.settings_icon(), 
      tooltip = new Features.ToolTip({
        target: icon,
        css: {borderColor: 'var(--yellow)', alignItems: 'flex-start'},
        class: 'flexbox column',
        message: header,
        match_border: false,
        on_hide: function () {if (manager.has_changes) manager.autosave.trigger()},
      }), add = function (input) {
        let name = input.name, existing = null, initial = null;
        if (input.options.usePreLabel) existing = manager.get_setting(`${name}.${input.options.preLabel.toKeyString()}`);
        else existing = manager.get_setting(name);
        initial = input.options.save_as_bool ? SettingsManager.array_of_true_values(existing) : existing;
        if (manager.obj instanceof Forms.Section) log({initial,existing,input});
        input.merge({options: {on_change_action: update}, initial});
        let answer = new Forms.Answer(input);
        tooltip.message_append(answer.ele.addClass('flexbox left').css({width:'auto'}).wrap(`<div class='flexbox'></div>`));
      };
    return {icon,tooltip,add};
  }
  static array_of_true_values (obj, addSpacesToKeys = true) {
    let array = [];
    try {
      for (let attr in obj) {
        if (obj[attr] === true) array.push(attr.addSpacesToKeyString());
      }
    } catch (error) {
      log({error,obj});
    }
    return array;
  }
  static convert_obj_values_to_bool (obj) {
    try {
      for (let attr in obj) {
        let type = typeof obj[attr];
        if (type == 'string') obj[attr] = obj[attr].toBool();
        else if (type == 'object' && !attr.is_array()) SettingsManager.convert_obj_values_to_bool(obj[attr]);
      }
    } catch (error) {
      log({error,obj});
    }
  }
}
class Practice extends Model {
  constructor (attr_list) {
    super(attr_list, 'Practice');
  }
  async schedule_edit () {
    await menu.fetch(`/schedule/Practice/${this.uid}`,'new_modal:EditSchedule');
    // let calendar = $('#EditSchedule').find('.calendar').getObj();
    // let schedule = $('#EditSchedule').find('.schedule').getObj();
  }
  async schedule_save () {
    this.schedule.add_response();
    // if (this.schedule.add_response()) {
    //   this.schedule.save('Practice', this.uid);
    // }
  }
}
class User extends Model {
  constructor (attr_list, type = 'patient') {
    super(attr_list, 'User');
    this.backup_attr_values(['username:email','address_billing:address_mailing']);
    this.usertype = type;
    if (!this.attr_list.roles) this.attr_list.roles = {list:[type],default:null};
    // this.dont_save(['name','user_id']);
    this.save_uid = this.user_id;
  }

  get is_super () {return this.attr_list.is_super || false}
  get is_admin () {return this.attr_list.is_admin || false}
  async delete_unique () {
    log({this:this});
    let instance = this;
    confirm({
      header: `Delete ${this.attr_list.model}: ${this.attr_list.name}?`,
      message: '<h3 class="pink">This cannot be undone!<br>Are you sure?</h3>',
      btntext_yes: 'permanently delete',
      btntext_no: 'cancel',
      callback_affirmative: async function(){
        blur('body','loading');
        let result = await $.ajax({
          url: '/delete/'+instance.attr_list.model+'/'+instance.uid,
          method: 'DELETE',
        })
        if (result == 'checkmark') {
          blurTop('checkmark',{
            callback:function(){unblurAll({callback:menu.reload})},
            delay:500});
        }
      }
    })
  }
  async edit_unique () {
    return menu.fetch(`/edit/${this.usertype.toKeyString()}/${this.uid}`,'new_modal:EditUser');
  }
  settings_unique () {
    menu.fetch(`/settings/${this.usertype.toKeyString()}/${this.uid}`,'new_modal:UserSettings');
  }
  async roles_edit () {log("EDITING")}
  async roles_save () {}

  async schedule_edit () {
    let UserType = this.usertype.toKeyString(), user = this;
    await menu.fetch(`/schedule/${UserType}/${this.uid}`,'new_modal:EditSchedule');
    // let calendar = $('#EditSchedule').find('.calendar').getObj();
    // let schedule = $('#EditSchedule').find('.schedule').getObj();
    // init('.calendar.schedule',function(){
    //   user.schedule = new Schedule({ele:$(this),model:UserType,uid:user.uid});
    // })
  }

  async schedule_save () {
    this.schedule.add_response();
    // if (this.schedule.add_response()) {
    //   this.schedule.save(this.usertype.toKeyString(), this.uid);
    // }
  }
}
class Patient extends User {
  constructor (attr_list = null) {
    let attrs = attr_list || Model.construct_from_form('#CreatePatient');
    super(attrs, 'patient');
  }
}
class Practitioner extends User {
  constructor (attr_list = null) {
    let attrs = attr_list || Model.construct_from_form('#CreatePractitioner');
    super(attrs, 'practitioner');
  }
}
class StaffMember extends User {
  constructor (attr_list = null) {
    let attrs = attr_list || Model.construct_from_form('#CreateStaffMember');
    super(attrs, 'staff member');
  }
}
class Calendar {
  constructor (ele = null) {
    this.ele = $(ele);
    if (this.ele.dne()) throw new Error('Calendar requires an element');
    this.ele.data('class_obj',this);
    this.options = this.ele.data();
    this.form = this.options.form ? $(this.options.form) : null;
    this.form_obj = this.form ? this.form.find('.form').getObj() : null;
    let schedule_eles = this.ele.find('.schedule'), schedules = [];
    schedule_eles.each((s,schedule) => {
      let obj = new Schedule(schedule, s, this.ele);
      schedules.push(obj);
      obj.calendar = this;
    })
    this.schedules = schedules;
    let calendar = this, fullcal_options = {
      plugins: [dayGridPlugin,listPlugin, timeGridPlugin, interactionPlugin, rrulePlugin, luxonPlugin],
      timeZone: tz,
      headerToolbar: {
        left:"title",
        center:"",
        right:"prev,today,next dayGridMonth,timeGridWeek,timeGridDay",
      },
      height: 'auto',
      initialView:"timeGridWeek",
      slotMinTime:'08:00:00',
      slotMaxTime:'20:00:00',
      editable: true,
      eventDrop: async function(info) {
        let result = await calendar.event_drop(info);
        log({result},'dropping event');
        if (!result) info.revert();
      },
      eventResize: async function(info) {
        let result = await calendar.event_resize(info);
        log({result},'resize result');
        if (result != 'checkmark') info.revert();
      },
      eventClick: function(info) {calendar.event_click(info)},
      dateClick: function(info) {calendar.date_click(info)},
      eventMouseEnter: function(info) {calendar.event_mouseenter(info)},
      eventMouseLeave: function(info) {calendar.event_mouseleave(info)},
      eventDidMount: function(info) {calendar.event_mount(info)},
      // eventRender: function(info) {
      //   if (calendar.event_render(info) === false) return false;
      // },
      eventSources: this.event_sources,
      eventOrder: "displayOrder,start,-duration,allDay,title",
    };
    if (this.options.fullcal) fullcal_options.merge(this.options.fullcal);
    this.fullcal = new FullCal(this.ele[0], fullcal_options);
    this.fullcal.render();
    // return;
    let view = this.ele.find('.fc-view');
    blur(view,'loading',{loadingColor:'var(--pink)',blurCss:{backgroundColor:'var(--white50)'}});      
    let cal = this, wait = setInterval(function(){
      if (cal.schedules.every(schedule => schedule.loading === false)) {
        clearInterval(wait);
        setTimeout(function(){unblur({ele:view})},100);
        log({view,schedules:cal.schedules},'done');
      }
    },100);
    if (this.schedule_active.modal.id == 'Appointment') this.schedule_active.autosave = new Features.Autosave({send: this.schedule_active.save.bind(this.schedule_active), delay:5000, message: 'All schedule changes saved', ele: this.ele});
  }
  get event_list () {return this.events ? this.events : []}
  get event_sources () {
    let schedule_events = this.schedules.map(schedule => schedule.event_source);
    return schedule_events;
  }
  get schedule_active () {return this.schedules.isSolo() ? this.schedules[0] : this.schedules.find(s => s.options.active)}
  async event_drop (info) {
    let group_id = info.event.groupId, event_source_id = info.event.source.id, source = this.fullcal.getEventSourceById(event_source_id), schedule = this.schedule_by_source_id(event_source_id), response = schedule.response_by_group_id(group_id), delta = info.delta;
    console.groupCollapsed('EVENT DROP');
    log({info,group_id,event_source_id,schedule,response});
    let result = null;
    if (schedule) {
      schedule.edit_recur = 'all';
      result = await schedule.update_by_delta(response, delta);
    }
    console.groupEnd();
    return result ? !system.validation.xhr.error.exists(result) : false;
  }
  async event_resize (info) {
    let group_id = info.event.groupId, event_source_id = info.event.source.id, source = this.fullcal.getEventSourceById(event_source_id), schedule = this.schedule_by_source_id(event_source_id), response = schedule.response_by_group_id(group_id), startDelta = info.startDelta, endDelta = info.endDelta;
    log({info,group_id,event_source_id,schedule,response}, 'event resize');
    if (schedule) return schedule.update_by_delta(response, {startDelta,endDelta});
    else return false;
  }

  schedule_by_source_id (source_id) {return this.schedules.find(s => s.event_source_id == source_id)}
  schedule_by_event (event) {
    let source_id = event.source.id;
    return this.schedule_by_source_id(source_id);
  }
  source_by_group_id (group_id) {
    let sources = this.fullcal.getEventSources();
    log({sources});
  }
  event_eles_by_group_id (group_id) {
    return this.ele.find('.fc-event').filter(`.${group_id}`);
  }
  event_classes (info) {

  }
  event_mount (info) {
    $(info.el).data({fc_event:info.event});
    if (info.isMirror || info.event.display == 'background') return;
    let calendar = this;
    if (info.event.extendedProps.description) {
      let message = info.event.extendedProps.description.to_key_value_html();
      // log({message,has_modified:message.find('.modified_indicator').exists()});
      if (message.find('.modified_indicator').exists()) message.append(`<div class='little pink modified_note'>Modified from original*</div>`);
      this.apply_event_info_to_tooltip(message,info);
      new Features.ToolTip({
        target: $(info.el),
        message: message,
        match_border: true,
        on_hide: function(){
          if (info.event.groupId) calendar.event_eles_by_group_id(info.event.groupId).removeClass('hover');
          else $(info.el).removeClass('hover');
        },
        hide_on: 'mousedown touchstart',
      })
    }
  }
  event_mouseenter (info) {
    if (info.event.display == 'background') return;
    let group_id = info.event.groupId;
    // log({info},'mouseenter info');
    $(info.el).removeClass('pinkBgFlash');
    if (group_id && group_id != '') this.event_eles_by_group_id(group_id).addClass('hover');
  }
  event_mouseleave (info) {
    if (info.event.display == 'background') return;
    let group_id = info.event.groupId, jsEvent = info.jsEvent;
    let target = jsEvent ? $(info.jsEvent.relatedTarget) : null;
    if (target && !target.is('.tooltip') && group_id && group_id != '') this.event_eles_by_group_id(group_id).removeClass('hover');
  }
  event_click (info) {
    let groupId = info.event.groupId, schedule = this.schedule_by_event(info.event);
    if (schedule.is_background) return;
    let response = schedule.response_by_group_id(groupId), ids = info.event.extendedProps.ids;
    log({info,response,ids});
    schedule.edit_event = info.event;
    schedule.form_open({response});      
  }
  date_click (info) {
    let schedule = this.schedule_active;
    // log({date:moment(info.date),schedule}, 'date click');
    if (schedule) schedule.date_click_to_form(info);
    else log({error:new Error('schedule not selected')});
  }
  apply_event_info_to_tooltip (message, render_info) {
    this.apply_tooltip_info_generic(message, render_info);
    this.apply_tooltip_info_by_class(message, render_info);
  }
  apply_tooltip_info_generic (message, render_info) {
    let event = render_info.event, start = LUX.fromISO(event.startStr), end = LUX.fromISO(event.endStr);
    let description = `${start.date} ${start.time} - ${end.time}`;
    message.prepend(`<div class='generic'><b>${description}</b></div>`);
  }
  apply_tooltip_info_by_class (message, render_info) {
    let ele = $(render_info.el);
    if (ele.hasClass('open')) {
      message.prepend(`<b class="green">${render_info.event.title}</b>`);
    }
    if (ele.hasClass('blocked')) {
      message.prepend('<b class="pink">This fully blocks and overrides all availability</b>');
    }
    if (ele.hasClass('Appointment')) {
      let cal = this, description = render_info.event.extendedProps.description;
      let groupId = render_info.event.groupId, schedule = cal.schedule_by_event(render_info.event);
      let appt_details = schedule.response_by_group_id(groupId), appointment_id = appt_details.uid, date_time_start = render_info.event.start;
      let chartnote_btn = new Features.Button({
        text:'chart note', class_list: 'xxsmall yellow', action: async function(){
          log({appt_details,groupId,render_info});
          let note = await Model.create_or_edit({
            where: {appointment_id, date_time_start},
            type: 'ChartNote',
            ajax_data: {mode:'modal'}
          });
          log({note});
        }, appendTo: message,
      }), invoice_btn = new Features.Button({
        text:'invoice', class_list: 'xxsmall yellow', action: function(){
          log({appt_details,groupId});
        }, appendTo: message,
      }), edit_btn = new Features.Button({
        text:'edit details', class_list: 'xxsmall yellow70', action: function(){
          schedule.edit_event = render_info.event;
          schedule.form_open({appt_details});      
        }, appendTo: message,
      }), delete_btn = new Features.Button({
        text:'delete', class_list: 'xxsmall pink70', action: function(){
          schedule.delete(appt_details);
        }, appendTo: message,
      })
      message.find('.generic, .Patient, .Practitioner, .Services').css({fontSize:'1.2em'});
    }
  }
}
class Schedule {
  constructor(schedule_ele, cal_index, cal_ele) {
    this.ele = $(schedule_ele);
    this.ele.data('class_obj',this);
    this.cal_index = cal_index;
    this.options = this.ele.data();
    this.db_attr = this.options.db_attr || 'schedule';
    this.model = this.options.model || null;
    this.uid = this.options.uid || null;
    if (model.current) model.current.schedule = this;
    this.responses = this.options.responses || null;
    this.models = this.options.models || null;
    this.modal = {id: this.options.modal, ele: this.options.modal ? ($(`#${this.options.modal}`).exists() ? $(`#${this.options.modal}`) : null) : null};
    this.form = this.modal.ele ? this.modal.ele.find('.form').getObj() : null;
    this.is_background = this.form === null;
    this.display = this.options.display || 'auto';
    this.refresh_events();
  }
  get event_list () {return this.events ? this.events : []}
  get event_source_id () {return `SCH_${this.cal_index}_${this.model}`}
  get event_source () {
    let source = {
      id: this.event_source_id, 
      events: this.event_list,
    }
    return source;
  }
  find (uid) {
    let collection = this.responses || this.models, match = collection.find(x => x.uid == uid) || null;
    log({collection,match,uid}, 'find model by uid');
    return match;
  }
  find_by_recurring_id (recurring_id) {
    let collection = this.responses || this.models, match = collection.filter(x => x.recurring_id == recurring_id) || null;
    log({collection,match,recurring_id}, 'find model by recurring id');
    return match;
  }
  date_click_to_form (info) {
    let dt = LUX.From.js(info.date), fill = {};
    // log({dt,day:dt.day})
    if (this.modal.id == 'ScheduleBlock') {
      fill.merge({
        'hours.from': dt.time,
        'hours.to': dt.plus({hours:1}).time,
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
    log({fill});
    this.form_open({fill});
  }
  source_remove () {
    let source_data = this.event_source, source_id = this.event_source_id,
      event_source = this.calendar.fullcal.getEventSourceById(this.event_source_id);
    event_source.remove();
  }
  source_add () {
    let source_data = this.event_source, source_id = this.event_source_id,
      event_source = this.calendar.fullcal.getEventSourceById(this.event_source_id);
    if (event_source) {
      event_source.remove();
      this.calendar.fullcal.addEventSource(source_data);      
    } else {
      log("EVENT SOURCE MISSING?!?!");
    }
    let view = this.calendar.ele.find('.fc-view');    
    unblur({ele:view});
  }
  add_response () {
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
  model_add (instance) {
    try {
      if (this.models === null) this.models = [];
      let uid = instance.uid || instance.attr_list.uid, existing = this.find(uid), new_obj = instance.schedule_obj;
      if (existing) this.replace_model(existing, new_obj);
      else this.models.push(new_obj);
      log({sch:this});
      this.autosave.trigger();
    } catch (error) {
      log({error,instance});
      return false;
    }
    this.refresh_events();
    return instance.schedule_obj;
  }
  model_find_related (model, exclude_self = false) {
    let models = this.models.filter(m => m.recurring_id && m.recurring_id == model.recurring_id);
    if (exclude_self) models = models.filter(m => m.uid != model.uid);
    return models;
  }
  async delete (response) {
    log({response});
    if (this.models) {
      let model = this.find(response.uid), index = this.models.indexOf(model);
      // log({models:this.models,model,index},'pre delete');
      if (this.modal.id == 'Appointment') {
        let appt = new Appointment(response),
          delete_result = await appt.delete(``);
        log({delete_result});
        if (delete_result) {
          this.models.splice(index,1);
          // log({models:this.models,model,index},'post delete');
          this.refresh_events();
          this.save();
        }
      }
    }
  }
  async replace_response (response_old, response_new) {
    let index = this.responses.indexOf(response_old);
    this.responses.splice(index,1,response_new);
  }
  async replace_model (model_old, model_new) {
    let index = this.models.indexOf(model_old);
    this.models.splice(index,1,model_new);
  }
  async update_by_delta (response, delta_obj) {
    if (this.modal.id == 'ScheduleBlock') {
      let response_obj = this.response_to_obj(response);
      if (delta_obj.delta) {
        let delta = delta_obj.delta, time_start = response_obj.time_start, time_end = response_obj.time_end;
        if (delta.milliseconds != 0) {
          response.Hours.From.answer = LUX.From.time(response_obj.time_start).plus({milliseconds:delta.milliseconds}).time;
          response.Hours.To.answer = LUX.From.time(response_obj.time_end).plus({milliseconds:delta.milliseconds}).time;
        }
        if (delta.days != 0) {
          if (response_obj.dates) {
            response.Days.ApplyTheseHoursTo.items.SelectDates.answer = response_obj.dates.map(date => {
              return LUX.From.date(date).plus({days:delta.days}).date_num;
            }).join(', ');
          }
          if (response_obj.days) {
            let start = response.Days.ApplyTheseHoursTo.items.StartDate.answer, end = response.Days.ApplyTheseHoursTo.items.EndDateOptional.answer, weekdays = response.Days.ApplyTheseHoursTo.items.SelectDaysOfWeek.answer, weekday_item = this.form.item_search('days of week');
            response.Days.ApplyTheseHoursTo.items.StartDate.answer = LUX.From.date(response_obj.date_start).plus({days:delta.days}).date_num;
            if (end) response.Days.ApplyTheseHoursTo.items.EndDateOptional.answer = LUX.From.date(response_obj.date_end).plus({days:delta.days}).date_num;
            response.Days.ApplyTheseHoursTo.items.SelectDaysOfWeek.answer = LUX.Weekdays.shift(weekdays, delta.days);
          }
        }
      }
      if (delta_obj.startDelta) {
        let delta = delta_obj.startDelta, time_start = response_obj.time_start;
        response.Hours.From.answer = LUX.From.time(response_obj.time_start).plus({milliseconds: delta.milliseconds}).time;
      }
      if (delta_obj.endDelta) {
        let delta = delta_obj.endDelta, time_end = response_obj.time_end;
        response.Hours.To.answer = LUX.From.time(response_obj.time_end).plus({milliseconds: delta.milliseconds}).time;
      }
      this.refresh_events();
      return this.save();
    } else if (this.modal.id == 'Appointment') {
      log({response, delta_obj});
      let new_appointment = new Appointment(response);
      new_appointment.update_dtstart(delta_obj);
      new_appointment.update_dtend(delta_obj);
      new_appointment.save_blur = this.save_blur_model;
      this.edit = response;
      log({response, delta_obj});
      return new_appointment.save();      
      // return false;
      // let time_start = response.time_start, time_end = response.time_end;
      // if (delta_obj.delta) {
      //   let delta = delta_obj.delta;
      //   if (delta.milliseconds) {
      //     response.time_start = LUX.From.time(time_start).plus({milliseconds: delta.milliseconds}).time;
      //     response.time_end = LUX.From.time(time_end).plus({milliseconds: delta.milliseconds}).time;
      //   }
      //   if (delta.days) {
      //     response.date = LUX.From.date(response.date).plus({days: delta.days}).date_num;
      //     if (response.recurrence) {
      //       let recur_obj = new Forms.FormResponse(response.recurrence), dates = recur_obj.response_for('SelectDates'), days = recur_obj.response_for('SelectWeekDays');
      //       if (dates) recur_obj.set_response_for('SelectDates', dates.split(', ').map(date => LUX.From.date(date).plus({days: delta.days}).date_num).join(', '));
      //       if (days) recur_obj.set_response_for('SelectWeekDays', LUX.Weekdays.shift(days,delta.days));
      //       response.recurrence = recur_obj.json;
      //     }
      //   }
      // }
      // if (delta_obj.startDelta) {
      //   let delta = delta_obj.startDelta;
      //   if (delta.milliseconds) response.time_start = LUX.From.time(time_start).plus({milliseconds: delta.milliseconds}).time;
      // }
      // if (delta_obj.endDelta) {
      //   let delta = delta_obj.endDelta;
      //   if (delta.milliseconds) response.time_end = LUX.From.time(time_end).plus({milliseconds: delta.milliseconds}).time;
      // }
      // let end = LUX.From.time(response.time_end), start = LUX.From.time(response.time_start), duration = end.diff(start, 'minutes').minutes;
      // response.duration = duration;
      // let new_appointment = new Appointment(response.merge({time:response.time_start}));
      // response.rrule = new_appointment.rrule;
      // new_appointment.save_blur = this.save_blur_model;
      // this.edit = response;
      // return new_appointment.save();
    }
  }
  response_by_group_id (group_id) {
    try {
      let group = [...group_id.matchAll(/([a-zA-Z]+)(\d+)$/g)][0];
      let response = this[group[1]][group[2]];
      return response ? response : null;
    } catch (error) {
      log({error,group_id});
      return null;
    }
  }
  form_open (options = {}) {
    let sched = this, header = this.modal.ele.find('h1').first().css({lineHeight:1.2});
    this.modal.ele.find('.toggle_ele').each((t,toggle) => {
      $(toggle).getObj().to_initial_state(0);
    })
    this.modal.ele.find('.section').slideFadeIn(0);
    if (this.modal.id === 'ScheduleBlock') {
      if (this.modal.ele) blurTop(this.modal.ele);
      this.edit = options.response ? options.response : null;
      if (this.edit) this.form.fill_by_response(this.edit);
      else if (options.fill) this.form.fill_by_key_value_object(options.fill);
    } else if (this.modal.id === 'Appointment') {
      Appointment.form_open(sched, options);
    }
  }
  static string_to_luxon (string, format = 'MM/DD/YYYY h:mma') {
    let m = moment(string, format, true); if (!m._isValid) throw new Error(`Invalid moment creation with str = ${string} and format = ${format}`);
    return m;
  }
  static string_to_db_datetime (string) {
    return Schedule.datetime_to_luxon(string).toISO();
  }
  static moment_to_db_datetime(date) {
    return date.format('YYYY-MM-DD HH:mm:ss');
  }
  
  exclusion_click (ev, model, date) {
    log({ev});
  }
  upcoming (model, options = {}) {
    let schedule = this;
    let limit = options.limit || 3, wiggle_limit = limit + 1,
      sort = options.sort || null,
      include_related = ifu(options.include_related, true),
      related = [], related_dates = [],
      recurring_id = model.recurring_id,
      force_refresh = options.force_refresh || false;
    this.rrule_cache = this.rrule_cache || {};
    this.upcoming_cache = this.upcoming_cache || {};
    let same_recurring_id = this.model_find_related(model)
    if (!this.rrule_cache[recurring_id]) {
      let related_rrulesets = same_recurring_id.map(m => m.rrule), merged_rrulesets = LUX.RRule.Merge(related_rrulesets);
      this.rrule_cache[recurring_id] = merged_rrulesets;
    }
    if (!this.upcoming_cache[recurring_id] || force_refresh) {
      let dates = LUX.RRule.Upcoming({rrule: this.rrule_cache[recurring_id], limit:wiggle_limit})
      same_recurring_id.forEach(m => { if (!m.rrule) dates.push(LUX.fromISO(m.start)) })
      this.upcoming_cache[model.recurring_id] = dates;
      log({rrule_cache: this.rrule_cache,upcoming_cache:this.upcoming_cache});
    }
    let rrule_set = this.rrule_cache[recurring_id], dates = this.upcoming_cache[recurring_id];
    let result = {model, rrule_set, limit, dates, max: dates.length > limit};
    return result;
  }
  upcoming_ele (result) {
    let sched = this;
    let update = function(ev, more = 3) {
      let ele = $(this).closest('.upcoming'), prev_result = ele.data(), limit = prev_result.limit, rrule_set = prev_result.rrule_set, new_result = sched.upcoming(prev_result.model, {force_refresh:true, limit: limit + more, sort: {order:'asc'}}), new_ele = sched.upcoming_ele(new_result);
      ele.replaceWith(new_ele);
      Features.ToolTip.find_containing_tooltip(new_ele).check_right();    
    }
    let see_more = $('<span/>',{css:{cursor:'pointer',color:'var(--pink)',textDecoration:'underline',fontSize:'0.9em'},text:'see more'}).on('click',update),
      list = $(`<span/>`,{class:'upcoming'}).data(result);
    list.append(sched.date_links(result));
    if (result.max) list.append(see_more);
    return list;
  }
  recent (model, options = {}) {
    let schedule = this;
    let limit = options.limit || 3, wiggle_limit = limit + 1,
      sort = options.sort || null,
      include_related = ifu(options.include_related, true),
      related = [], related_dates = [],
      recurring_id = model.recurring_id,
      force_refresh = options.force_refresh || false;      
    this.rrule_cache = this.rrule_cache || {};
    this.recent_cache = this.recent_cache || {};
    let same_recurring_id = this.model_find_related(model)
    if (!this.rrule_cache[recurring_id]) {
      let related_rrulesets = same_recurring_id.map(m => m.rrule), merged_rrulesets = LUX.RRule.Merge(related_rrulesets);
      this.rrule_cache[recurring_id] = merged_rrulesets;
    }
    if (!this.recent_cache[recurring_id] || force_refresh) {
      let dates = LUX.RRule.Recent({rrule: this.rrule_cache[recurring_id], limit:wiggle_limit})
      same_recurring_id.forEach(m => { if (!m.rrule) dates.push(LUX.fromISO(m.start)) })
      this.recent_cache[model.recurring_id] = dates;
      // log({rrule_cache: this.rrule_cache,recent_cache:this.recent_cache});
    }
    let rrule_set = this.rrule_cache[recurring_id], dates = this.recent_cache[recurring_id];
    let result = {model, rrule_set, limit, dates, max: dates.length > limit};
    return result;
  }
  recent_ele (result) {
    let sched = this;
    let update = function(ev, more = 3) {
      let ele = $(this).closest('.recent'), prev_result = ele.data(), limit = prev_result.limit, rrule_set = prev_result.rrule_set, new_result = sched.recent(prev_result.model, {force_refresh:true, limit: limit + more, sort: {order:'desc'}}), new_ele = sched.recent_ele(new_result);
      ele.replaceWith(new_ele);
      Features.ToolTip.find_containing_tooltip(new_ele).check_right();    
    }
    let see_more = $('<span/>',{css:{cursor:'pointer',color:'var(--pink)',textDecoration:'underline',fontSize:'0.9em'},text:'see more'}).on('click',update),
      list = $(`<span/>`,{class:'recent'}).data(result);
    list.append(sched.date_links(result));
    if (result.max) list.append(see_more);
    return list;
  }
  date_links (result) {
    let append_arr = [], dates = result.dates, max = result.max, sched = this;
    
    dates = dates.slice(0,result.limit);
    let count = dates.length;
    dates.forEach((date,d) => {
      append_arr.push(sched.date_link(date));
      if (d < count - 1 && count > 2) append_arr.push(', ');
      if (d == count - 2 && !max && count > 1) append_arr.push(`${count == 2 ? ' and ' : 'and '}`);
      if (d == count - 1 && max) append_arr.push('... ');
    })
    return append_arr;
  }
  date_link (date) {
    return $(`<span class='date_link'>${date.date_num}</span>`).data({date}).on('click', this.date_link_click.bind(this));
  }
  date_link_click (ev) {
    let target = $(ev.target), tt = Features.ToolTip.find_containing_tooltip(target);
    let data = target.data(), date = data.date, uid = data.uid, fc = this.calendar.fullcal;
    log({date},date.toISO());
    tt.hide(100);
    fc.gotoDate(date.toISO());
    let event_ele = $('.fc-event').filter(':visible').filter((e,ele) => {
      let fc_event = $(ele).data('fc_event'), this_uid = fc_event.extendedProps.ids ? fc_event.extendedProps.ids.uid : null;
      // log({evstart:fc_event.start,date:date.toJSDate()})
      return date.equals(LUX.From.js(fc_event.start));
    });
    event_ele.addClass('pinkBgFlash');
  }

  get save_blur_model () {
    return {ele: this.calendar.ele.find('.fc-view'),options:{loadingColor:'var(--pink)',blurCss:{backgroundColor:'var(--white50)'}}};    
  }
  response_to_obj (json) {
    let responses = new Forms.FormResponse(json), get_response = responses.response_for.bind(responses), obj = {};
    if (this.modal.id == 'ScheduleBlock') {
      let dates_or_days = get_response('days.apply to'), available = get_response('add availability or block') == 'add availability', services = '';
      obj.merge({time_start: get_response('hours.from'), time_end: get_response('hours.to')});
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
  form_responses_to_events (responses) {
    let events = [], source_id = this.event_source_id, schedule = this, display = this.display;
    log({display,schedule:this, bool: display == 'background'});
    responses.forEach((response,r) => {
      let obj = schedule.response_to_obj(response);
      let group_id = `${source_id}_responses${r}`, description = {};
      log({obj});
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
          description[`${obj.interval == 1 ? 'Weekly':`Every ${obj.interval} Weeks`}`] = obj.days.join(', ');
          description.merge({Starting: obj.date_start, Ending: obj.date_end ? obj.date_end : 'never'});
          let rrule = {
            freq: RRule.WEEKLY,
            interval: obj.interval,
            dtstart: start.toISO(),
            byweekday: obj.days.map(day => RRule[day.substring(0,2).toUpperCase()])
          }, duration = end.diff(start);
          if (obj.date_end) rrule.until = moment(`${obj.date_end} ${obj.time_end}`,'MM-DD-YYYY hh:mma');
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
        log({error,response,obj});
      }
    });
    this.loading = false;
    return events;
  }
  async models_to_events (models) {
    let events = [], source_id = this.event_source_id, schedule = this, display = this.display;
    let services = await Model.get_list({model:'service'}), patients = Model.get_list({model:'patient'}), practitioners = Model.get_list({model:'practitioner'});
    models.forEach((model,m) => {
      let groupId = `${source_id}_models${m}`, description = {};
      let event = {groupId,display,description};
      
      if (model.type == 'Appointment') {
        let service_names = Model.names('service',model.services), title = service_names.smartJoin(), classNames = `${service_names.map(name => name.toKeyString()).join(' ')} ${groupId} ${model.type}`, Patient = Model.names('patient',model.patient_id)[0], Practitioner = Model.names('practitioner',model.practitioner_id)[0], description ={Patient,Practitioner,Services:title};
        description.merge(model.description || {});
        event.merge({title,classNames,description,ids:{uid:model.uid,recurring_id:model.recurring_id}});
      }
      
      try {
        event.merge({start: model.start,end: model.end});
        if (model.rrule) {
          let upcoming = schedule.upcoming(model, {limit:3,format:'M/D/YYYY',sort:{order:'asc'} }), 
            recent = schedule.recent(model, {limit:3,format:'M/D/YYYY',sort:{order:'desc'} }),
            upcoming_ele = schedule.upcoming_ele(upcoming),
            recent_ele = schedule.recent_ele(recent),
            duration = LUX.fromISO(model.end).diff(LUX.fromISO(model.start));
          event.merge({rrule: model.rrule, duration});
          event.description.merge(Appointment.recurring_description(model.recurrence, LUX.fromISO(model.start)));
          event.description.merge({
            'Upcoming': upcoming_ele,
            'Most Recent': recent_ele,
          });
          events.push(event);
        } else {
          if (model.recurring_id) {
            let original_model = schedule.find(model.recurring_id);
            if (original_model) {
              let upcoming = schedule.upcoming(original_model,{limit:3,format:'M/D/YYYY',sort:{order:'asc'}}), 
                recent = schedule.recent(original_model,{limit:3,format:'M/D/YYYY',sort:{order:'desc'}}),
                upcoming_ele = schedule.upcoming_ele(upcoming),
                recent_ele = schedule.recent_ele(recent);
              event.description.merge(Appointment.recurring_description(original_model.recurrence,LUX.fromISO(original_model.start)));
              event.description.merge({
                'Upcoming': upcoming_ele,
                'Most Recent': recent_ele,
              });
            }
          }
          events.push(event);
        }
      } catch (error) {
        log({error,model});
      }
    })
    log({models,events},'models to events');
    this.loading = false;
    return events;
  }
  async save() {
    if (!this.model) {feedback('No Model','Cannot save schedule, no instance attached'); return;}
    if (!this.uid) {feedback('No ID','Cannot save schedule, no instance attached'); return;}
    let columns = {}, model = this.model, uid = this.uid, view = this.calendar.ele.find('.fc-view');
    columns[this.db_attr] = this.responses || this.models;
    if (columns[this.db_attr].is_array() && columns[this.db_attr].isEmpty()) columns[this.db_attr] = null;
    if (!this.autosave) blur(view,'loading',{loadingColor:'var(--pink)'});
    let result = $.ajax({
      url: `/save/${model}`,
      method: 'POST',
      data: {uid,columns,wants_checkmark: true},
      success: function(response){
        if (system.validation.xhr.error.exists(response)) return;
        if (!this.autosave) unblur({ele:view});
      }
    })
    return result;
  }
  async refresh_events () {
    this.loading = true; this.events = [];
    if (this.responses) this.events = this.form_responses_to_events(this.responses); 
    else if (this.models) this.events = await this.models_to_events(this.models);
    else this.loading = false;
    // log({events:this.events})
    if (this.calendar && this.calendar.fullcal) this.source_add();
  }
}
class Appointment extends Model{
  constructor (attr_list = null) {
    attr_list = attr_list || Model.construct_from_form('#Appointment');
    super(attr_list, 'Appointment');

    this.schedule = $('.calendar').getObj().schedules.find(s => s.modal.id == 'Appointment');
  }

  get rrule () { return this.rrule_obj.toString(); }
  get rrule_obj () {
    if (!this.attr_list.recurrence) return null;
    let recur_obj = new Forms.FormResponse(this.attr_list.recurrence), 
      dates = recur_obj.response_for('SelectDates'), days = recur_obj.response_for('SelectWeekDays'), 
      until_date = recur_obj.response_for('EndDateOptional'), rrule_set = new RRuleSet(), 
      start = this.start_lux, end = this.end_lux,
      interval = recur_obj.response_for('HowOften');
    if (!start || !end) {
      log({start,end,recur_obj,appt:this});
      throw new Error('Insufficient info for dtstart');
    }
    let date = start.date_num, exclusions = this.attr_list.exclusions, time_start = start.time, time_end = end.time;
    try {
      if (dates) {
        if (!dates.is_array()) dates = dates.split(', ');
        dates.smartPush(date);
        let time_start = start.time;
        dates.forEach(date => {rrule_set.rdate(LUX.From.datetime(date, time_start).rrule)});
      } else {
        let jsdate = start.toJSDate(), rrdate = start.rrule;
        log({start,jsdate,rrdate},'DIFFERENT DATES RRULE');
        let rrule = {
          freq: RRule.WEEKLY,
          interval: interval,
          dtstart: start.rrule,
          byweekday: days.map(day => RRule[day.substring(0,2).toUpperCase()]),
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
      log({rrule_set,str:rrule_set.toString()});
      return rrule_set;
    } catch (error) {
      log({error,start,attr_list:this.attr_list});
      return null;
    }
  }
  rrule_exclude (date_str) {
    let recur_obj = new Forms.FormResponse(this.attr_list.recurrence), dates = recur_obj.response_for('SelectDates');
    let exclusions = this.attr_list.exclusions || [];
    exclusions.smartPush(date_str);
    if (dates) {
      dates = dates.split(', ');
      let d = dates.indexOf(date_str);
      dates.splice(d,1);
      recur_obj.set_response_for('SelectDates', dates.join(', '))
    }
    this.attr_list.exclusions = exclusions;
  }
  update_dtstart (delta) {
    this.attr_list.date_time_start = this.start_lux.plus(delta);
    if (this.attr_list.recurrence) {
      let recurrence = new Forms.FormResponse(this.attr_list.recurrence), dates = recurrence.response_for('SelectDates'), days = recurrence.response_for('SelectWeekDays');
      log({dates,days});
      if (dates) {
        recurrence.set_response_for('SelectDates', LUX.DateShift(dates.split(', '), delta.days).join(', '));
      } else if (days) {
        recurrence.set_response_for('SelectWeekDays', LUX.Weekdays.shift(days, delta.days));
      }
      this.attr_list.recurrence = recurrence.json;
    }
  }
  update_dtend (delta) {
    log({delta});
    this.attr_list.date_time_end = this.end_lux.plus(delta);
  }
  get start_lux () {
    let start = this.attr_list.date_time_start || this.attr_list.start;
    return start ? LUX.fromISO(start) : null;
  }
  get end_lux () {
    let end = this.attr_list.date_time_end || this.attr_list.end;
    return end ? LUX.fromISO(end) : null;
  }
  static form_open (schedule, options = {}) {
    let header = schedule.modal.ele.find('h1').first();
    schedule.edit = options.response ? options.response : null;
    let recur_toggle = schedule.modal.ele.find('.toggle_ele').getObj();
    if (schedule.edit) {
      Appointment.editing = new Appointment(options.response);
      Appointment.original = new Appointment(options.response.duplicate());

      Model.form_mode('edit', schedule.modal.ele);
      let ev = schedule.edit_event, description = ev.extendedProps.description, answers = Forms.Answer.get_all_within(schedule.modal.ele,false), start = LUX.From.js(ev.start), end = LUX.From.js(ev.end), named = function(name) {return Forms.Answer.find(answers, {name})}, recur_form = schedule.form, header_text = `${description.Patient}<br>${start.date} ${start.time} - ${start.date != end.date ? `${end.date} ` : ''}${end.time}`;
      header.html(header_text);
      answers.forEach(answer => answer.to_initial_value());
      named('date').value = start.date_num;
      named('time').value = start.time;
      named('duration').value = end.diff(start,'minutes').minutes;
      named('services').value = schedule.edit.services;
      named('patient_id').value = schedule.edit.patient_id;
      named('practitioner_id').value = schedule.edit.practitioner_id;
      let recurrence = schedule.edit.recurrence;
      if (recurrence) {
        recur_toggle.show(0); recur_form.fill_by_response(recurrence);
        let header_str = `<b>${header_text}<br></b>Recurring Appointment`, 
          recur_str = Appointment.recurring_description(recurrence,start)['Recurring'],
          recur_str_middle = Appointment.recurring_description(recurrence,start,'middle')['Recurring'],
          recur_str_long = Appointment.recurring_description(recurrence,start,'long')['Recurring'],
          attr_ele = schedule.modal.ele.find('.section').first(),
          modal = schedule.modal.ele;
        recur_toggle.message = recur_str_long;
        recur_toggle.exclusions = Appointment.original.attr_list.exclusions;
        let recur_only = function() {
            recur_toggle.reset_messages();
            recur_toggle.enable({message:'<b>Currently Occurs</b> '+recur_toggle.message, message_class_list: 'boxPurple', message_tag:'h4'});
            // if (recur_toggle.exclusions && recur_toggle.exclusions.notEmpty()) {
            //   log({exclusions:recur_toggle.exclusions});
            //   let exclusions_box = recur_toggle.add_message({message:'<b>Exceptions:</b> <span></span><div style="font-size:0.7em" class="bold">THIS LIST OVERRIDES ALL OTHER RECURRING SETTINGS</div>', message_class_list: 'boxPink', message_tag:'h4'}), exclusions_list = exclusions_box.children('span');
            //   recur_toggle.exclusions.forEach(excl => {
            //     let exclusion_click = $('<span/>',{text:excl}).css({cursor:'pointer'}).on('click', sched.exclusion_click);
            //     exclusions_list.append(exclusion_click);
            //   })
            // }
            recur_toggle.toggle_ele.parent().slideFadeIn(0);
            attr_ele.slideFadeOut(0);
            schedule.edit_recur = 'all';
          }, attrs_only = function() {
            recur_toggle.toggle_ele.parent().slideFadeOut(0);
            attr_ele.slideFadeIn(0);
          }, show_modal = function () { unblur(); blurTop(modal) };
        if ($('#RecurEditOptions').dne()) {
          schedule.recurrence_only_btn = new Features.Button({text: 'edit recurring options', class_list: 'purple70 xsmall', css: {margin:'0.1em'}, 
            action: function(){ recur_only(); show_modal(); }
          });
          schedule.recur_options = new Features.OptionBox({id:'RecurEditOptions',header:header_str,header_html_tag:'h2'});
          schedule.recur_options.add_info(`<h3>${recur_str_middle}</h3>`).add_info(schedule.recurrence_only_btn.ele);
          schedule.recur_options.add_button_info(`<h2 class="pink bold">Edit Time, Services, or Practictioner</h2>`);
          schedule.recur_options.add_button({text:'this event only',
            action:function(){
              schedule.edit_recur = 'this';
              named('date').value = LUX.From.js(schedule.edit_event.start).date_num;
              attrs_only(); show_modal();
            }});
          schedule.recur_options.add_button({text:'this and future events', class_list:'pink70 xsmall',
            action:function(){
              let event = schedule.edit_event;
              schedule.edit_recur = 'future';
              named('date').value = LUX.From.js(event.start).date_num;
              named('date').disable({tooltip:{message:'Editing multiple dates, date change disabled'}});
              attrs_only(); show_modal();
            }});
          schedule.recur_options.add_button({text:'all events', class_list:'pink70 xsmall',
            action:function(){
              schedule.edit_recur = 'all';
              named('date').disable({tooltip:{message:`'Date' disabled since you are editing all occurences of this event`}});
              attrs_only(); show_modal();
            }});
          schedule.recur_options.add_button({text:'cancel',class_list:'cancel xsmall',action:unblurAll});
        } else {
          schedule.recur_options.reset_header(header_str);
          schedule.recur_options.reset_info(`<h3>${recur_str_middle}</h3>`).add_info(schedule.recurrence_only_btn);
        }
        blurTop($('#RecurEditOptions'));
      } else {
        recur_toggle.reset(0);
        if (Appointment.editing.attr_list.recurring_id) {
          let related = schedule.model_find_related(schedule.edit, true), str = '';
          recur_toggle.enable({message:'<b>This will create another recurring rule.</b><br>',message_tag:'h4'});
          recur_toggle.message_enable.append('Existing rules:<ul></ul>');
          let list = recur_toggle.message_enable.find('ul').css({listStyle:'inside'});
          log({related});
          related.forEach(m => list.append($(`<li>${m.description.Recurring}</li>`).css({marginLeft:'5px'})) );
        }
        schedule.edit_recur = null;
        blurTop(schedule.modal.ele);
      }
    } else {
      Appointment.editing = null;
      Model.form_mode('create',schedule.modal.ele);
      blurTop(schedule.modal.ele);
      header.text('New Appointment');
      recur_toggle.reset(0);
      if (options.fill) {
        let answers = Forms.Answer.get_all_within(schedule.modal.ele,false), named = function(name) {return Forms.Answer.find(answers, {name})};
        answers.forEach(answer => answer.value = null);
        for (let attr in options.fill) {named(attr).value = options.fill[attr]}        
      }
    }
  }
  static recurring_description (recurrence, start_lux, form = 'short') {
    let recur_obj = new Forms.FormResponse(recurrence), dates = recur_obj.response_for('SelectDates'), days = recur_obj.response_for('SelectWeekDays'), interval = recur_obj.response_for('HowOften'), until = recur_obj.response_for('EndDate'), desc = {};
    if (dates) {
      if (form == 'long') {
        dates = dates.split(', ');
        desc.Recurring = `On these dates: ${dates.smartJoin()}`;
      } else if (form == 'middle') {
        dates = dates.split(', ');
        desc.Recurring = `Only on selected dates (${dates.length} total)`;
      } else desc.Recurring = `Only on selected dates`;
    }
    else if (days) desc.Recurring = `${interval == 1 ? 'Weekly' : `Every ${interval} weeks`} on ${days.smartJoin()} ${until ? `until ${until}` : 'indefinitely'}`;
    return desc;
  }
  static update_duration (services, ev) {
    let services_list = Model.list('service'), duration = 0, duration_obj = $('#Appointment').find('.duration').getObj();
    if (services instanceof Forms.Answer) services = services.get();
    if (services) {
      services.forEach(uid => {duration += services_list.find(service => service.uid == uid).duration;});
      if (duration_obj) duration_obj.value = duration;      
    }
    return duration;
  }
  async retrieve_chart_note (appt_id, date_time_start, date_time_end) {

  }
  get schedule_obj () {
    try {
      let obj = {type:'Appointment',uid:this.uid};
      let services = this.attr_list.services, group_id = `${this.event_source_id}_${this.uid}`, 
        start = this.start_lux, end = this.end_lux, 
        patient_id = this.attr_list.patient_id, 
        practitioner_id = this.attr_list.practitioner_id;
        // date = this.attr_list.date;
      obj.merge({
        services, patient_id, practitioner_id, 
        start: start.toISO(),
        end: end.toISO(),
        recurring_id: this.attr_list.recurring_id,
      })
      if (this.attr_list.recurrence) {
        let recur_obj = new Forms.FormResponse(this.attr_list.recurrence), dates = recur_obj.response_for('SelectDates'), days = recur_obj.response_for('SelectWeekDays');
        obj.merge({
          recurrence: this.attr_list.recurrence, 
          rrule: this.rrule,
          exclusions: this.attr_list.exclusions || [],
          description: Appointment.recurring_description(this.attr_list.recurrence),
        });
        // let rrule_set = this.rrule_obj;
        // if (dates) {
        //   if (!dates.is_array()) dates = dates.split(', ');
        //   dates.smartPush(start.date_num);
        //   let time_start = start.format('hh:mma');
        //   obj.merge({
        //     dates,
        //     description: Appointment.recurring_description(this.attr_list.recurrence),
        //   });
        // } else {
        //   // let interval = recur_obj.response_for('HowOften');
        //   obj.merge({
        //     // days, 
        //     date_start: start.date_num,
        //     date_end: recur_obj.response_for('EndDate'),
        //     description: Appointment.recurring_description(this.attr_list.recurrence),
        //   });
        // }
      }
      log(obj, 'GETTING SCHEDULE OBJ');
      return obj;
    } catch (error) {
      log({error});
      return {};
    }
  }
  get db_columns () {
    return ['patient_id','practitioner_id','date_time_start','date_time_end','recurrence','exclusions','recurring_id'];
  }
  get db_relationships () {
    return {services:'sync'};
  }
  get service_names () {
    return Model.names('service',this.attr_list.services || []);
  }
  get patient_name () {
    return Model.names('patient',this.attr_list.patient_id)[0];
  }
  async on_save () {
    let sched = this.schedule, edit = sched.edit, edit_recur = sched.edit_recur;

    if (this.attr_list.date && this.attr_list.time) {
      this.attr_list.date_time_start = LUX.From.datetime(this.attr_list.date, this.attr_list.time);
      let duration = LUXDur.fromObject({minutes:this.attr_list.duration});
      this.attr_list.date_time_end = this.attr_list.date_time_start.plus(duration);
    }

    if (this.attr_list.WhenWillThisAppointmentRepeat) {
      let recur_form = $('#RecurringAppointment').getObj();
      this.attr_list.recurrence = recur_form.response;
    }
    if (this.attr_list.recurrence && !this.attr_list.recurring_id) {
      this.attr_list.recurring_id = this.uid;
      this.attr_list.rrule = this.rrule;
    }
    this.event_in_schedule = this.uid ? this.schedule.find(this.uid) : null;

    log({edit,edit_recur});
    if (edit && edit_recur) {
      if (edit_recur == 'all') return true;
      
      let existing = Appointment.original, date = this.attr_list.date;
      if (edit_recur == 'this') {
        existing.rrule_exclude(date);
        this.attr_list.recurrence = null;
      } else if (edit_recur == 'future') {
        let recurrence_old = existing.attr_list.recurrence, recurrence_new = this.attr_list.recurrence;
        // this.attr_list.recurrence = recurrence_new;
        let recur_old = new Forms.FormResponse(recurrence_old), recur_new = new Forms.FormResponse(recurrence_new);
        let dates = recur_old.response_for('SelectDates'), days = recur_old.response_for('SelectWeekDays');
        if (dates) {
          let time = now(), break_at = LUX.From.date(date, undefined, time);
          dates = dates.split(', ');
          let before_dates = dates.filter(d => LUX.From.date(d,undefined,time) < break_at),
            after_dates = dates.filter(d => LUX.From.date(d,undefined,time) >= break_at);
          recur_old.set_response_for('SelectDates', before_dates.join(', '));
          recur_new.set_response_for('SelectDates', after_dates.join(', '));
          // existing.attr_list.recurrence = recur_old.json;
          // this.attr_list.recurrence = recur_new.json;
          // log({recur_old,recur_new,recurrence_new,recurrence_old});
        }
      }
      this.attr_list.recurring_id = existing.attr_list.recurring_id;
      this.clear_uid();
      let appts = [this,existing];
      log({appts});
      // return false;
      let result_arr = await Model.save_multi(appts);
      return false;
    } 
    return true;
  }
  async save_callback (data) {
    this.uid = data.uid;
    this.attr_list.uid = data.uid;
    this.attr_list.google_id = data.google_id;
    this.attr_list.recurring_id = data.recurring_id;
    log({model:this},`UID: ${this.uid}`);    
    this.event_in_schedule = await this.schedule.model_add(this);
  }
  async delete_callback () {
    // defined to prevent default  
  }
}
class Service extends Model {
  constructor (attr_list = null) {
    if (!attr_list) attr_list = Model.construct_from_form('#CreateService');
    super(attr_list, 'Service');
  }

  get db_columns () {return ['name','service_category_id','description_calendar','description_admin','price','duration']}
  async settings_autosave () {
    log('hi');
  }
}
class ServiceCategory extends Model {
  constructor (attr_list = null) {
    if (!attr_list) attr_list = Model.construct_from_form('#CreateServiceCategory');
    super(attr_list, 'ServiceCategory');
  }

  get db_columns () {return ['name','description']}
  async settings_autosave () {
    log('hi');
  }
}
class Complaint extends Model {
  constructor (attr_list = null) {
    let attrs = attr_list || Model.construct_from_form('#CreateComplaint');
    super(attrs, 'complaint');
  }
  get db_columns () {
    return ['name','description','complaint_category_id','settings'];
  }
  get db_relationships () {
    return {icd_codes:'sync'};
  }
}
class ComplaintCategory extends Model {
  constructor (attr_list = null) {
    let attrs = attr_list || Model.construct_from_form('#CreateComplaintCategory');
    super(attrs, 'complaint category');
  }
  get db_columns () {
    return ['name','description','settings'];
  }
}
class IcdCode extends Model {
  constructor (attr_list = null) {
    let attrs = attr_list || IcdCode.construct_from_icd_tool();
    super(attrs, 'icd code');
    this.form = $('#CreateNewIcdCode');
  }
  static get form () { return $("#CreateNewIcdCode").exists() ? $("#CreateNewIcdCode") : null }
  static popup_links_unique() {
    let find_btn = new Features.Button({
      text:'find new code',
      class_list: 'xxsmall pink70',
      url: '/create/IcdCode',
      mode: 'load',
      target: 'new_modal:CreateNewIcdCode',
      callback: function(){
        let form = $('#CreateNewIcdCode'), btn = form.find('.button.create'), icd_codes = form.parentModal().find('.icd_codes').getObj('answer');
        log({btn,icd_codes,form});
        btn.text('save and apply').data({
          wants_checkmark:true,
          clear_count:2,
          save_callback: icd_codes.linked_list_update.bind(icd_codes),
        });
      }
    });
    return find_btn.ele;
  }
  get db_columns () {
    return ['code','title','text','url'];
  }
  save_callback () {
    IcdCode.entity = null;
  }
  static construct_from_icd_tool() {
    if (!IcdCode.entity) {
      feedback('No Code Selected','Select a code by clicking on it.');
      return false;
    }
    return {
      code: IcdCode.entity.code,
      title: IcdCode.entity.title,
      text: IcdCode.entity.bestMatchText.firstToUpper(),
      url: IcdCode.entity.uri,
    };
  }
}
class Form extends Model {
  constructor (attr_list) {
    super(attr_list, 'Form');
  }
  async preview () {
    menu.fetch(`/form/preview/${this.uid}`,'new_modal:FormPreview');
  }
  async edit_unique () {
    $('#forms-edit').click();
  }
  static async preview_by_uid (uid) {menu.fetch(`/form/preview/${uid}`,'new_modal:FormPreview');}
}
class ChartNote extends Model {
  constructor (attr_list = null) {
    attr_list = attr_list || Model.construct_from_form('#ChartNote');
    super(attr_list, 'ChartNote');
  }
  static get_existing (appt_uid, datetime) {

  }
}

export const Models = {ModelTable, Model, SettingsManager, Practice, User, Patient, Practitioner, StaffMember, Calendar, Schedule, Appointment, Service, ServiceCategory, Complaint, ComplaintCategory, IcdCode, Form, ChartNote};

export const class_map_linkable = {Patient,Practitioner,StaffMember,Service,Form};
export const linkable_lists = {};
export const linkable_lists_pending = {};

export const table = {
  list: () => $('.modelTable').get(),
  get: () => table.list().find(table => table.name == name) || null,
  initialize: {
    all: function(){
      if (!initialize.find('.modelTable')) return;
      $.each(table.initialize, function(name, initFunc){
        if (name != 'all' && typeof initFunc === 'function') initFunc();
      });
      if (!table.initialize.tableResize){
        $(window).on('resize', table.width.check);
        table.initialize.tableResize = true;
      }
      table.width.adjust();
    },
    tableResize: false,
    newTables: function(){
      init('.modelTable', function(){
        let newTable = new ModelTable($(this),1);
      })
    },
    table_nav_options: function(){
      init('.optionsNav',function(){
        if ($(this).data('uid') !== undefined) {
          let type = $(this).data('model'), options = $(this).data('options');
          model.current = type.to_class_obj(options);
        }else model.current = null;
        $(this).find('.navOption').each(function(){
          fix_width($(this));
          let action = $(this).data('action');
          $(this).on('click', model.current[action].bind(model.current))
        })
      })
    }
  },
  width: {
    timer: null,
    check: function(){
      clearTimeout(table.width.timer);
      table.width.timer = setTimeout(table.width.adjust, 300);
    },
    adjust: function(){
      $.each(table.list, function(t,modelTable){
        modelTable.showAllColumns();
        let hideMe = [...modelTable.hideorder];
        while (modelTable.isTooWide) {
          let hideNow = hideMe.shift();
          modelTable.element.find('.'+hideNow).hide();
        }
      })
    }
  },
};
export const model = {
  current: null,
  actions: (action) => {
    try {
      if (model.current[action] && typeof model.current[action] == 'function') model.current[action]();
      else throw new Error(`${model.current.type}.${action} is not a function`);
    }catch (error) {
      log({error});
    }
  },
}

