// require ('./functions');
import {system, practice, log, Features} from './functions';
import {forms, Forms} from './forms';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import rrulePlugin from '@fullcalendar/rrule';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';


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
    init($('.filter_proxy').filter((f,filter) => $(filter).data('target') == ele.attr('id')),function(){
      let filter = new Filter($(this));
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
      table.initialize.nav_options();
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
class Filter {
  constructor(ele){
    // log({ele});
    this.ele = $(ele);
    let data_attr = this.ele.data();
    this.options = data_attr.options;
    this.selector = data_attr.target;
    this.ele.data('class_obj',this);
    this.targets = $(`#${this.selector}`).exists() ? $(`#${this.selector}`) : $(`.${selector}`);
    if (this.targets.dne()) throw new Error(`filter targets not found using selector: ${selector}`);
    this.name = this.options.name || 'no_name';
    this.type = data_attr.type || 'text';
    this.item_tag = this.options.item_html_tag || 'div';
    if (this.type == 'attribute') {
      this.answer = this.ele.find('.answer').getObj();

    }else if (this.type == 'text'){
      this.answer = this.ele.find('.answer').getObj();
    }
    // log({filter:this});
    this.ele.toggleClass('filter_proxy filter');
  }

  get items () {
    let targets = this.targets, tag = this.item_tag, items = targets.find(tag).not('.no_filter');
    log({items,item_tag:this.item_tag})
    return items.exists() ? items : null;
  }
  get has_matches () {
    let matches = null, search = this.search_values, type = this.type, items = this.items;
    log({this:this});
    if (search == null) {
      matches = items;
    } else if (items) {
      let options = {className: this.name};
      if (type == 'text') {
        items.unmark(options);
        items.mark(search,options);
        matches = items.filter((i,item) => $(item).find('mark').exists());
      } else if (type == 'attribute') {
        let attribute = this.options.attribute;
        matches = items.filter((i,item) => {
          let value = $(item).data('filters')[attribute];
          return Array.isArray(search) ? search.some(str => value.includes(str)) : value.includes(search);
        });
      }
    }
    log({matches,search});
    this.matches = matches;
    return matches && matches.exists();
  }

  update () {
    this.search_values = this.answer.get();
    if (this.has_matches) {
      this.matches.show();
      this.items.not(this.matches).hide();
      this.targets.find(this.item_tag).filter('.no_match').hide();
    } else {
      this.items.hide();
      this.targets.find(this.item_tag).filter('.no_filter').show();
    }
  }
}

class Model {
  constructor (attr_list, type) {
    this.valid = attr_list ? true : false;
    this.attr_list = attr_list;
    this.type = type;
    if (this.attr_list.uid) {
      this.uid = this.attr_list.uid;
      // delete this.attr_list.uid;
    }
    this.dont_save(['model','id']);
    log({model:this},`new ${type}`);
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
      attr_list = {};
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
    // log({attr_list,all_pass});
    return all_pass ? attr_list : false;
  }
  update_attr_by_form (form_ele = null) {
    let attr_list = this.attr_list, all_pass = true;
    try {
      if (!form_ele) form_ele = $(`#Create${this.attr_list.model}`);
      // if (!form_ele) throw new Error('form ele not given');
      if (form_ele.dne()) throw new Error('form does not exist');
      if (form_ele.length > 1) throw new Error('more than one form found');
      form_ele.find('.answer').each((a,answer) => {
        let obj = $(answer).getObj(), value = $(answer).verify('required'), name = obj.options.name;
        if (value === false) all_pass = false;
        if (obj.initial != value) attr_list[name] = value;
        log({answer,value,obj})
      })
    }catch (error) {
      log({error,form_ele});
      all_pass = false;
    }
    // log({attr_list});
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
    } else {
      await this.edit_unique();
    }
    let top = blurTopGet(), form = top && top.find('.createModel').exists() ? top.find('.createModel') : null;
    if (form) {
      let header = form.find('h1'), submit_btn = form.find('.submit.create');
      header.text(header.text().replace('Create','Edit'));
      submit_btn.toggleClass('create edit').text(submit_btn.text().replace('add','save changes to'));      
    }
  }
  async settings () {
    if (!this.settings_unique) {
      await menu.fetch(`/settings/${this.type.toKeyString()}/${this.uid}`,'new_modal:SettingsModal');
    } else await this.settings_unique();
  }
  async save (options = {}) {
    let type = this.type, model = this, columns = {}, relationships = {}, addl_post_data = {};
    let clear_on_success = options.clear_on_success || true;
    if (this.on_save) await this.on_save();
    try {
      if (this.valid) {
        if (!this.db_columns) throw new Error(`db_columns not defined for ${type}`);
        this.db_columns.forEach(column => {if (model.attr_list[column]) columns[column] = model.attr_list[column]});
        if (this.db_relationships) {
          for (let model in this.db_relationships) {
            if (this.attr_list[model]) relationships[model] = {uids: this.attr_list[model], method: this.db_relationships[model]}
          }
        }
        let save_blur = this.save_blur || false;
        if (save_blur) blur(save_blur.ele,'loading',save_blur.options);
        else blurTop('loading',{loadingColor:'var(--green)',loadingFade:true});
        let uid = this.save_uid || this.uid || this.attr_list.uid || null, callback = this.save_callback ? this.save_callback.bind(this) : null;
        if (type == 'User') uid = this.attr_list.user_id;
        log({columns,relationships,obj:this,attr_list:this.attr_list},`saving new ${this.type}`);
        // return;
        let result = await $.ajax({
          url: `/save/${type}`,
          method: 'POST',
          data: {uid,columns,relationships},
          success: function(response){
            if (system.validation.xhr.error.exists(response)) return;
            if (clear_on_success) {
              if (save_blur) blur(save_blur.ele,'checkmark', { callback: function(){unblurAll({fade:400})}, delay: 500 });
              else blurTop('checkmark', { callback: function(){unblurAll({fade:400})}, delay: 500 });
            }
            if (callback) callback(response);
            else $('.loadTarget').last().html(response);
          }
        })
      }
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
  dont_save (attrs) {
    let list = this.attrs_not_to_save || [];
    if (typeof attrs == 'string') list.push(attrs);
    else if (attrs.is_array()) list = [...list,...attrs];
    this.attrs_not_to_save = list;
  }
  static list_has_column (list, column) {return list[0][column] != undefined;}
  static list_missing_columns (list, columns) {return columns.filter(column => !Model.list_has_column(list,column));}
  static list_is_pending (model) {return linkable_lists_pending[model] && linkable_lists_pending[model] === true;}
  static list (model) {return linkable_lists[model.toKeyString()] || null};
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
      this.autosave = new Autosave({
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
        if (manager.obj instanceof Section) log({initial,existing,input});
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
    let calendar = $('#EditSchedule').find('.calendar').getObj();
    let schedule = $('#EditSchedule').find('.schedule').getObj();
  }
  async schedule_save () {
    if (this.schedule.add_response()) {
      this.schedule.save('Practice', this.uid);
    }
  }
}
class User extends Model {
  constructor (attr_list, type = 'patient') {
    super(attr_list, 'User');
    this.backup_attr_values(['username:email','address_billing:address_mailing']);
    this.usertype = type;
    if (!this.attr_list.roles) this.attr_list.roles = {list:[type],default:null};
    this.dont_save(['name','user_id']);
    this.save_uid = this.user_id;
  }

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
    let calendar = $('#EditSchedule').find('.calendar').getObj();
    let schedule = $('#EditSchedule').find('.schedule').getObj();
    // init('.calendar.schedule',function(){
    //   user.schedule = new Schedule({ele:$(this),model:UserType,uid:user.uid});
    // })
  }

  async schedule_save () {
    if (this.schedule.add_response()) {
      this.schedule.save(this.usertype.toKeyString(), this.uid);
    }
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
      let obj = new Schedule(schedule,s);
      schedules.push(obj);
      obj.calendar = this;
    })
    this.schedules = schedules;
    log({cal:this,practice:practice.info,tz:practice.info.tz}, 'new calendar');
    // let tz = practice.info.tz;
    // alert(tz);
    let tz = practice.info.tz, client_tz = moment.tz.guess();
    // alert (`${tz}... ${client_tz}`);
    // return;
    let calendar = this, fullcal_options = {
      plugins: [dayGridPlugin,listPlugin, timeGridPlugin, interactionPlugin, rrulePlugin, momentTimezonePlugin],
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
        // log({result});
        if (result != 'checkmark') info.revert();
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
    let view = this.ele.find('.fc-view');
    blur(view,'loading',{loadingColor:'var(--pink)',blurCss:{backgroundColor:'var(--white50)'}});      
    let cal = this, wait = setInterval(function(){
      if (cal.schedules.every(schedule => schedule.loading === false)) {
        clearInterval(wait);
        setTimeout(function(){unblur({ele:view})},100);
      }
    },100);
  }
  get event_list () {return this.events ? this.events : []}
  get event_sources () {
    let schedule_events = this.schedules.map(schedule => schedule.event_source);
    return schedule_events;
  }
  get schedule_active () {return this.schedules.isSolo() ? this.schedules[0] : this.schedules.find(s => s.options.active)}
  async event_drop (info) {
    let group_id = info.event.groupId, event_source_id = info.event.source.id, source = this.fullcal.getEventSourceById(event_source_id), schedule = this.schedule_by_source_id(event_source_id), response = schedule.response_by_group_id(group_id), delta = info.delta;
    log({info,group_id,event_source_id,schedule,response}, 'event drop');
    if (schedule) return schedule.update_by_delta(response, {delta});
    else return false;
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
    if (info.isMirror || info.event.display == 'background') return;
    log({info}, 'event mount');
    let calendar = this;
    if (info.event.extendedProps.description) {
      let message = info.event.extendedProps.description.to_key_value_html();
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
  event_render (info) {
    try {
      let calendar = this, schedule = this.schedule_by_source_id(info.event.source.id), display = schedule.display;
      if (display == 'none') return false;
      else if (display == 'background') return;
      if (info.event.extendedProps.description && !info.isMirror) {
        log({event:info.event});
        let message = info.event.extendedProps.description.to_key_value_html();
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
    } catch (error) {
      // log({error,info,event:info.event});
      return false;
    }
  }
  event_mouseenter (info) {
    if (info.event.display == 'background') return;
    // log({info});
    let group_id = info.event.groupId;
    if (group_id && group_id != '') this.event_eles_by_group_id(group_id).addClass('hover');
    // eles.addClass('hover');
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
    let response = schedule.response_by_group_id(groupId);
    log({info});
    // schedule.edit_moment_start = moment(info.event.start);
    // schedule.edit_moment_end = moment(info.event.end);
    schedule.edit_event = info.event;
    schedule.form_open({response});      
  }
  date_click (info) {
    let schedule = this.schedule_active;
    log({date:moment(info.date),schedule}, 'date click');
    if (schedule) schedule.date_click_to_form(info);
    else log({error:new Error('schedule not selected')});
  }
  apply_event_info_to_tooltip (message, render_info) {
    this.apply_tooltip_info_by_class(message, render_info);
    this.apply_tooltip_info_generic(message, render_info);
  }
  apply_tooltip_info_generic (message, render_info) {
    let event = render_info.event, start = moment(event.start), end = moment(event.end);
    let description = `${start.format('MMM D h:mma')} - ${end.format('h:mma')}`;
    message.prepend(`<div><b>${description}</b></div>`);
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
      let edit_btn = new Features.Button({
        text:'edit', class_list: 'xxsmall yellow70', action: function(){
          let groupId = render_info.event.groupId, schedule = cal.schedule_by_event(render_info.event);
          let response = schedule.response_by_group_id(groupId);
          // log({render_info});
          // schedule.edit_moment_start = moment(render_info.event.start);
          // schedule.edit_moment_end = moment(render_info.event.end);
          schedule.edit_event = render_info.event;
          schedule.form_open({response});      
        }
      }), delete_btn = new Features.Button({
        text:'delete', class_list: 'xxsmall pink70', action: function(){
          let groupId = render_info.event.groupId, schedule = cal.schedule_by_event(render_info.event);
          let response = schedule.response_by_group_id(groupId);
          schedule.delete(response);
        }
      })
      message.append(edit_btn.ele,delete_btn.ele);
    }
  }
}
class Schedule {
  constructor(schedule_ele, cal_index) {
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
    // this.loading = false;
    // if (this.responses != null) this.events = this.form_responses_to_events(this.responses);
    // if (this.models != null) this.events = this.models_to_events(this.models);
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
    log({collection,match,uid});
    return match;
  }
  date_click_to_form (info) {
    let date_obj = moment(info.date), time = date_obj.format('h:mma'), date = date_obj.format('MM/DD/YYYY'), fill = {};
    if (this.modal.id == 'ScheduleBlock') {
      fill.merge({
        'hours.from': time,
        'hours.to': moment(date_obj).add(1,'h').format('h:mma'),
        'start date': moment(date_obj).startOf('week').format('MM/DD/YYYY'),
        'days of week': date_obj.day(),
        'select dates': date,      
      });      
    } else if (this.modal.id == 'Appointment') {
      fill.merge({
        date: date,
        time: time,
        SelectDates: date,      
        SelectWeekDays: Schedule.integer_to_weekday(Schedule.date_moment(date).day()),
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
    }
    return response !== false;
  }
  add_model (instance) {
    try {
      if (this.models === null) this.models = [];
      if (this.edit) this.replace_model(this.edit, instance.schedule_obj);
      else this.models.push(instance.schedule_obj);
    } catch (error) {
      log({error,instance});
      return false;
    }
    this.refresh_events();
    return instance.schedule_obj;
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
          response.Hours.From.answer = moment(response_obj.time_start,'h:mma').add(delta.milliseconds,'milliseconds').format('h:mma');
          response.Hours.To.answer = moment(response_obj.time_end,'h:mma').add(delta.milliseconds,'milliseconds').format('h:mma');
        }
        if (delta.days != 0) {
          if (response_obj.dates) {
            response.Days.ApplyTheseHoursTo.items.SelectDates.answer = response_obj.dates.map(date => {
              return moment(date,'MM/DD/YYYY').add(delta.days,'days').format('MM/DD/YYYY');
            }).join(', ');
          }
          if (response_obj.days) {
            let start = response.Days.ApplyTheseHoursTo.items.StartDate.answer, end = response.Days.ApplyTheseHoursTo.items.EndDateOptional.answer, weekdays = response.Days.ApplyTheseHoursTo.items.SelectDaysOfWeek.answer, weekday_item = this.form.item_search('days of week');
            response.Days.ApplyTheseHoursTo.items.StartDate.answer = moment(response_obj.date_start,'MM/DD/YYYY').add(delta.days,'days').format('MM/DD/YYYY');
            if (end) response.Days.ApplyTheseHoursTo.items.EndDateOptional.answer = moment(response_obj.date_end,'MM/DD/YYYY').add(delta.days,'days').format('MM/DD/YYYY');
            response.Days.ApplyTheseHoursTo.items.SelectDaysOfWeek.answer = Schedule.shift_weekdays(weekdays, delta.days);
          }
        }
      }
      if (delta_obj.startDelta) {
        let delta = delta_obj.startDelta, time_start = response_obj.time_start;
        response.Hours.From.answer = moment(response_obj.time_start,'h:mma').add(delta.milliseconds,'milliseconds').format('h:mma');
      }
      if (delta_obj.endDelta) {
        let delta = delta_obj.endDelta, time_end = response_obj.time_end;
        response.Hours.To.answer = moment(response_obj.time_end,'h:mma').add(delta.milliseconds,'milliseconds').format('h:mma');
      }
      this.refresh_events();
      return this.save();
    } else if (this.modal.id == 'Appointment') {
      log({response}, 'initial response');
      let time_start = response.time_start, time_end = response.time_end;
      if (delta_obj.delta) {
        let delta = delta_obj.delta;
        if (delta.milliseconds) {
          response.time_start = moment(time_start,'h:mma').add(delta.milliseconds,'milliseconds').format('h:mma');
          response.time_end = moment(time_end,'h:mma').add(delta.milliseconds,'milliseconds').format('h:mma');          
        }
        if (delta.days) {
          response.date = Schedule.date_moment(response.date).add(delta.days,'days').format('MM/DD/YYYY');
          if (response.recurrence) {
            let recur_obj = new Forms.FormResponse(response.recurrence), dates = recur_obj.response_for('SelectDates'), days = recur_obj.response_for('SelectWeekDays');
            if (dates) recur_obj.set_response_for('SelectDates', dates.split(', ').map(date => Schedule.date_moment(date).add(delta.days,'days').format('MM/DD/YYYY')).join(', '));
            if (days) recur_obj.set_response_for('SelectWeekDays', Schedule.shift_weekdays(days,delta.days));
            response.recurrence = recur_obj.json;
          }
        }
        // log({response,time_start,time_end}, 'delta');
      }
      if (delta_obj.startDelta) {
        let delta = delta_obj.startDelta;
        if (delta.milliseconds) response.time_start = moment(time_start,'h:mma').add(delta.milliseconds,'milliseconds').format('h:mma');
        // log({response,time_start,time_end,delta}, 'start delta');
      }
      if (delta_obj.endDelta) {
        let delta = delta_obj.endDelta;
        if (delta.milliseconds) response.time_end = moment(time_end,'h:mma').add(delta.milliseconds,'milliseconds').format('h:mma');
        // log({response,time_start,time_end,delta}, 'end delta');
      }
      let end = Schedule.time_moment(response.time_end), start = Schedule.time_moment(response.time_start), duration = end.diff(start, 'minutes');
      log({start,end,duration});
      response.duration = duration;
      log({response,delta_obj});
      let new_appointment = new Appointment(response.merge({time:response.time_start}));
      new_appointment.save_blur = this.save_blur_model;
      this.edit = response;
      return new_appointment.save();
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
    if (this.modal.ele) blurTop(this.modal.ele);
    let sched = this, header = this.modal.ele.find('h1').first().css({lineHeight:1.2});
    this.modal.ele.find('.toggle_ele').each((t,toggle) => {
      $(toggle).getObj().to_initial_state(0);
    })
    if (this.modal.id === 'ScheduleBlock') {
      this.edit = options.response ? options.response : null;
      if (this.edit) this.form.fill_by_response(this.edit);
      else if (options.fill) this.form.fill_by_key_value_object(options.fill);
    } else if (this.modal.id === 'Appointment') {
      this.edit = options.response ? options.response : null;
      let recur_toggle = this.modal.ele.find('.toggle_ele').getObj();
      if (this.edit) {
        log({edit:this.edit});
        let ev = this.edit_event, description = ev.extendedProps.description, answers = Forms.Answer.get_all_within(this.modal.ele,false), named = function(name) {return Forms.Answer.find(answers, {name})}, recur_form = this.form, header_text = `${description.Patient}<br>${moment(ev.start).format('MMM D h:mma')} - ${moment(ev.end).format('h:mma')}`;
        log({ev});
        header.html(header_text);
        answers.forEach(answer => answer.to_initial_value());
        for (let attr in this.edit) {
          let value = this.edit[attr];
          if (attr == 'time_start') attr = 'time';
          let input = named(attr);
          if (input) input.value = value;
          if (attr == 'date') {named('SelectDates').value = value} 
        }
        if (this.edit.recurrence) {
          recur_toggle.show(0); recur_form.fill_by_response(this.edit.recurrence);
          let header_str = `<b>${header_text}<br></b>Recurring Appointment`, recur_str = '';
          if (this.edit.dates) recur_str = `<h3>All Dates: ${this.edit.description['Linked Dates']}</h3>`;
          else recur_str = `<h3>${this.edit.description['Recurring']}<br><b>From</b> ${this.edit.date_start} <b style='margin-left:5px'>Until</b> ${this.edit.date_end ? this.edit.date_end : 'forever'}</h3>`;

          if ($('#RecurEditOptions').dne()) {
            this.recur_options = new OptionBox({id:'RecurEditOptions',header:header_str,header_html_tag:'h2'});
            this.recur_options.add_info(recur_str);
            this.recur_options.add_button_info(`<h3 class="pink bold">Would you like to change this event only or other events as well?</h3>`)
            this.recur_options.add_button({text:'this event only',
              action:function(){
                unblur(); sched.edit_recur = 'this';
                named('date').value = moment(sched.edit_event.start).format('MM/DD/YYYY');
                recur_toggle.disable(`Not enabled since you're editing 'this event only'`);
              }});
            this.recur_options.add_button({text:'this and future events', class_list:'pink70 xsmall',
              action:function(){
                let event = sched.edit_event;
                unblur(); sched.edit_recur = 'future';
                named('date').value = moment(event.start).format('MM/DD/YYYY');
                recur_toggle.enable();
              }});
            this.recur_options.add_button({text:'all events', class_list:'pink70 xsmall',
              action:function(){
                unblur(); sched.edit_recur = 'all';
                recur_toggle.enable();
              }});
            this.recur_options.add_button({text:'cancel',class_list:'cancel xsmall',action:unblurAll});
          } else {
            this.recur_options.reset_header(header_str);
            this.recur_options.reset_info(recur_str);
          }
          blurTop($('#RecurEditOptions'));
        } else {
          recur_toggle.reset(0);
          this.edit_recur = null;
        }
      } else {
        header.text('New Appointment');
        recur_toggle.reset(0);
        if (options.fill) {
          let answers = Forms.Answer.get_all_within(this.modal.ele,false), named = function(name) {return Forms.Answer.find(answers, {name})};
          answers.forEach(answer => answer.value = null);
          for (let attr in options.fill) {named(attr).value = options.fill[attr]}        
        }
      }

    }
  }
  static weekdays_to_integers (array) {
    return array.map(day => {
      if (day.toLowerCase().substring(0,2) == 'su') return 0;
      if (day.toLowerCase().substring(0,2) == 'mo') return 1;
      if (day.toLowerCase().substring(0,2) == 'tu') return 2;
      if (day.toLowerCase().substring(0,2) == 'we') return 3;
      if (day.toLowerCase().substring(0,2) == 'th') return 4;
      if (day.toLowerCase().substring(0,2) == 'fr') return 5;
      if (day.toLowerCase().substring(0,2) == 'sa') return 6;
    });
  }
  static integers_to_weekdays (array) {
    return array.map(integer => Schedule.integer_to_weekday(integer));
  }
  static integer_to_weekday (integer) {
    if (integer == 0) return 'Sunday';
    if (integer == 1) return 'Monday';
    if (integer == 2) return 'Tuesday';
    if (integer == 3) return 'Wednesday';
    if (integer == 4) return 'Thursday';
    if (integer == 5) return 'Friday';
    if (integer == 6) return 'Saturday';
  }
  static shift_weekdays (array, delta) {
    if (!delta) throw new Error('must provide delta in number of days');
    let integers = Schedule.weekdays_to_integers(array),
      shifted = Schedule.shift_weekday_integers(integers, delta),
      weekdays = Schedule.integers_to_weekdays(shifted);
      log({array,integers,shifted,weekdays});
    return weekdays;
  } 
  static shift_weekday_integers (array, delta) {
    return array.map(integer => {
      let shift = integer + delta;
      while (shift < 0) {shift += 7}
      while (shift > 6) {shift -= 7}
      return shift;
    });
  }
  static string_to_moment (string, format = 'MM/DD/YYYY h:mma') {
    return moment(string, format, true);
  }
  static string_to_db_datetime (string) {
    return Schedule.datetime_to_moment(string).format('YYYY-MM-DD HH:mm:ss');
  }
  static moment_to_db_datetime(date) {
    return date.format('YYYY-MM-DD HH:mm:ss');
  }
  static db_datetime_to_moment(string) {
    return moment(string, 'YYYY-MM-DD HH:mm:ss', true);
  }
  static datetime_to_moment (string) {return Schedule.string_to_moment(string)}
  static datetime_to_rdate (string, format) {
    let dt = Schedule.string_to_moment(string, format);
    return Schedule.moment_to_rdate(dt);
  }
  static moment_to_rdate (dt) {
    return new Date(Date.UTC(dt.utc().year(), dt.utc().month(), dt.utc().date(), dt.utc().hours(), dt.utc().minutes(), dt.utc().seconds()));
  }
  static date_moment (string) {return Schedule.string_to_moment(string, 'MM/DD/YYYY')}
  static time_moment (string) {return Schedule.string_to_moment(string, 'h:mma')}

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
    responses.forEach((response,r) => {
      let obj = schedule.response_to_obj(response);
      let group_id = `${source_id}_responses${r}`, description = {};
      try {
        if (obj.dates) {
          if (obj.dates.notSolo()) description['Linked Dates'] = obj.dates.join(', ');
          obj.dates.forEach(date => {
            let start = moment(`${date} ${obj.time_start}`,'MM-DD-YYYY hh:mma'), end = moment(`${date} ${obj.time_end}`,'MM-DD-YYYY hh:mma');
            events.push({
              title: obj.title,
              classNames: `${obj.class_list} ${group_id}`,
              start: start.toISOString(),
              end: end.toISOString(),
              groupId: group_id,
              description,
              displayOrder: obj.displayOrder ? obj.displayOrder : 0,
              display,
            })
          })
        } else {
          let start = moment(`${obj.date_start} ${obj.time_start}`,'MM-DD-YYYY hh:mma'), 
            end = moment(`${obj.date_start} ${obj.time_end}`,'MM-DD-YYYY hh:mma');
          description[`${obj.interval == 1 ? 'Weekly':`Every ${obj.interval} Weeks`}`] = obj.days.join(', ');
          description.merge({Starting: obj.date_start, Ending: obj.date_end ? obj.date_end : 'never'});
          let rrule = {
            freq: RRule.WEEKLY,
            interval: obj.interval,
            dtstart: start.toISOString(),
            byweekday: obj.days.map(day => RRule[day.substring(0,2).toUpperCase()])
          }, duration = end.diff(start);
          if (obj.date_end) rrule.until = moment(`${obj.date_end} ${obj.time_end}`,'MM-DD-YYYY hh:mma');
          events.push({
            title: obj.title,
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
        event.merge({title,classNames,description});
      }
      
      try {
        if (model.rrule) {
          let start = moment(`${model.date} ${model.time_start}`,'MM-DD-YYYY hh:mma'), 
            end = moment(`${model.date} ${model.time_end}`,'MM-DD-YYYY hh:mma'), duration = end.diff(start);
          event.merge({
            duration, rrule: model.rrule, start: start.toISOString()
          });
          // alert(start.toISOString());
          events.push(event);
        } else {
          let date = model.date, start = moment(`${date} ${model.time_start}`,'MM-DD-YYYY hh:mma').toISOString(), end = moment(`${date} ${model.time_end}`,'MM-DD-YYYY hh:mma').toISOString();
          event.merge({start,end});
          // alert(start);
          events.push(event);
        }
      } catch (error) {
        log({error,model});
      }
    })
    log({events});
    this.loading = false;
    return events;
  }
  async save() {
    if (!this.model) {feedback('No Model','Cannot save schedule, no instance attached'); return;}
    if (!this.uid) {feedback('No ID','Cannot save schedule, no instance attached'); return;}
    let columns = {}, model = this.model, uid = this.uid, view = this.calendar.ele.find('.fc-view');
    columns[this.db_attr] = this.response || this.models;
    if (columns[this.db_attr].is_array() && columns[this.db_attr].isEmpty()) columns[this.db_attr] = null;
    log({uid,columns,wants_checkmark: true});
    blur(view,'loading',{loadingColor:'var(--pink)'});
    let result = $.ajax({
      url: `/save/${model}`,
      method: 'POST',
      data: {uid,columns,wants_checkmark: true},
      success: function(response){
        if (system.validation.xhr.error.exists(response)) return;
        unblur({ele:view});
      }
    })
    return result;
  }
  async refresh_events () {
    this.loading = true; this.events = [];
    if (this.responses) this.events = this.form_responses_to_events(this.responses); 
    else if (this.models) this.events = await this.models_to_events(this.models);
    else this.loading = false;
    if (this.calendar && this.calendar.fullcal) this.source_add();
  }  
}
class Appointment extends Model{
  constructor (attr_list = null) {
    attr_list = attr_list || Model.construct_from_form('#Appointment');
    log({attr_list});
    super(attr_list, 'Appointment');

    if (!this.attr_list.date_time_start && this.attr_list.date && this.attr_list.time) {
      this.attr_list.date_time_start = Schedule.string_to_db_datetime(`${this.attr_list.date} ${this.attr_list.time}`);
      let end = Schedule.datetime_to_moment(`${this.attr_list.date} ${this.attr_list.time}`).add(this.attr_list.duration,'minutes');
      this.attr_list.date_time_end = Schedule.moment_to_db_datetime(end);
    }

    if (this.attr_list.WhenWillThisAppointmentRepeat) {
      let recur_form = $('#RecurringAppointment').getObj();
      this.attr_list.recurrence = recur_form.response;
    }
    if (this.attr_list.recurrence && !this.attr_list.recurring_id) {
      this.attr_list.recurring_id = this.uid;
      this.attr_list.rrule = this.rrule;
    }
    this.schedule = $('.calendar').find('.schedule').filter((s,schedule) => $(schedule).data('modal') == 'Appointment').getObj();
    if (this.schedule.edit) {
      this.attr_list.uid = this.schedule.edit.uid;
    }
    this.event_in_schedule = this.uid ? this.schedule.find(this.uid) : null;
  }

  static update_duration (services, ev) {
    let services_list = Model.list('service'), duration = 0, duration_obj = $('#Appointment').find('.duration').getObj();
    if (services instanceof Answer) services = services.get();
    if (services) {
      services.forEach(uid => {duration += services_list.find(service => service.uid == uid).duration;});
      if (duration_obj) duration_obj.value = duration;      
    }
    return duration;
  }
  get rrule () { return this.rrule_obj.toString(); }
  get rrule_obj () {
    if (!this.attr_list.recurrence) return null;
    let recur_obj = new Forms.FormResponse(this.attr_list.recurrence), 
      dates = recur_obj.response_for('SelectDates'), days = recur_obj.response_for('SelectWeekDays'), 
      until = recur_obj.response_for('EndDateOptional'), rrule_set =new RRuleSet(), start = null, end = null,
      // start = Schedule.db_datetime_to_moment(this.attr_list.date_time_start), 
      // end = Schedule.db_datetime_to_moment(this.attr_list.date_time_end), 
      interval = recur_obj.response_for('HowOften');
    if (this.attr_list.date_time_start) {
      start = Schedule.db_datetime_to_moment(this.attr_list.date_time_start);
      end = Schedule.db_datetime_to_moment(this.attr_list.date_time_end);     
    } else if (this.attr_list.date_start && this.attr_list.time_start) {
      start = Schedule.datetime_to_moment(`${this.attr_list.date_start} ${this.attr_list.time_start}`);
      end = Schedule.datetime_to_moment(`${this.attr_list.date_end} ${this.attr_list.time_end}`);
    } 
    if (!start || !end) throw new Error('Insufficient info for dtstart');
    let date = start.format('MM/DD/YYYY');
    try {
      if (dates) {
        if (!dates.is_array()) dates = dates.split(', ');
        dates.smartPush(date);
        let time_start = start.format('hh:mma'), dtstart = Schedule.datetime_to_rdate(`${date} ${time_start}`);
        dates.forEach(date => {rrule_set.rdate(Schedule.datetime_to_rdate(`${date} ${time_start}`))});
      } else {
        let rrule = {
          freq: RRule.WEEKLY,
          interval: interval,
          dtstart: Schedule.moment_to_rdate(start),
          byweekday: days.map(day => RRule[day.substring(0,2).toUpperCase()])
        };
        if (until) rrule.until = Schedule.datetime_to_rdate(`${until} ${end.format('hh:mma')}`);
        rrule_set.rrule(new RRule(rrule));
      }
      return rrule_set;
    } catch (error) {
      log({error,start,attr_list:this.attr_list});
      return null;
    }
    // this.attr_list.rrule = rrule_set.toString();
    // return this.attr_list.rrule;
  }
  get schedule_obj () {
    let obj = {type:'Appointment',uid:this.uid};
    let services = this.attr_list.services, group_id = `${this.event_source_id}_${this.uid}`, 
      start = Schedule.db_datetime_to_moment(this.attr_list.date_time_start), 
      end = Schedule.db_datetime_to_moment(this.attr_list.date_time_end), 
      patient_id = this.attr_list.patient_id, 
      practitioner_id = this.attr_list.practitioner_id, 
      date = this.attr_list.date, duration = end.diff(start,'minutes');
    obj.merge({
      services, patient_id, practitioner_id, date, duration,
      time_start: start.format('hh:mma'),
      time_end: end.format('hh:mma')
    })
    if (this.attr_list.recurrence) {
      let recur_obj = new Forms.FormResponse(this.attr_list.recurrence), dates = recur_obj.response_for('SelectDates'), rrule_set = new RRuleSet();
      obj.merge({recurrence:this.attr_list.recurrence, rrule:this.rrule, recurring_id: this.attr_list.recurring_id});
      if (dates) {
        if (!dates.is_array()) dates = dates.split(', ');
        dates.smartPush(date);
        let time_start = start.format('hh:mma'), dtstart = Schedule.datetime_to_rdate(`${date} ${time_start}`);
        dates.forEach(date => {rrule_set.rdate(Schedule.datetime_to_rdate(`${date} ${time_start}`))});
        obj.merge({
          dates,
          description: {'Linked Dates': dates.smartJoin()}
        });
      } else {
        obj.merge({
          days: recur_obj.response_for('SelectWeekDays'),
          interval: recur_obj.response_for('HowOften'),
          date_start: this.attr_list.date,
          date_end: recur_obj.response_for('EndDate'),
        });
        obj.description = {Recurring: `${obj.interval == 1 ? 'Weekly' : `Every ${obj.interval} weeks`} on ${obj.days.smartJoin()}`};
        // obj.merge({rrule: this.rrule});            
      }
    }
    log(obj,'getting schedule obj');
    return obj;
  }
  get db_columns () {
    return ['patient_id','practitioner_id','date_time_start','date_time_end','recurrence','recurring_id','rrule'];
  }
  get db_relationships () {
    return {sync: 'services'};
  }
  get service_names () {
    return Model.names('service',this.attr_list.services || []);
  }
  get patient_name () {
    return Model.names('patient',this.attr_list.patient_id)[0];
  }
  async on_save () {
    let sched = this.schedule, edit = sched.edit, edit_recur = sched.edit_recur;
    if (this.schedule.edit && this.schedule.edit_recur) {
      let existing = new Appointment(edit), date = this.attr_list.date;

      if (edit_recur == 'this') {
        let existing_datetime = Schedule.datetime_to_moment(`${date} ${existing.attr_list.time_start}`), exdate = Schedule.moment_to_rdate(existing_datetime), rule = existing.rrule_obj;
        rule.exdate(exdate);
        existing.attr_list.rrule = rule.toString();
        existing.on_save = null;
        log({sched,edit,edit_recur,existing_datetime,existing,date,exdate,rule});
        await existing.save({clear_on_success: false});
        this.attr_list.recurring_id = existing.uid;
        this.clear_uid();
      } else if (edit_recur == 'future') {

      }
    } 
  }
  async save_callback (data) {
    this.uid = data.uid;
    this.attr_list.uid = data.uid;
    this.attr_list.google_id = data.google_id;
    if (this.attr_list.recurrence && !this.attr_list.recurring_id) this.attr_list.recurring_id = data.uid;
    this.event_in_schedule = await this.schedule.add_model(this);
    if (this.event_in_schedule) return this.schedule.save();
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

export const Models = {ModelTable, Filter, Model, SettingsManager, Practice, User, Patient, Practitioner, StaffMember, Calendar, Schedule, Appointment, Service, Form};

// $(document).ready(function(){
//   class_map_all.merge({Form,FormEle,Patient,Practitioner,StaffMember,User,Service,Practice,model,Appointment})
// });
const class_map_linkable = {Patient,Practitioner,StaffMember,Service,Form};
const linkable_lists = {};
const linkable_lists_pending = {};

// const RRule = rrule.RRule, RRuleSet = rrule.RRuleSet;

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
    nav_options: function(){
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

