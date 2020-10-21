// import { RRule, RRuleSet, rrulestr } from 'rrule';

$(".jump").on("click",function(){
  var target = "#"+$(this).data("target");
  $.scrollTo(target);
});
const debug = {
  get y() {return debug.bool},
  get d() {return debug.depth},
  level: function(depth) {return debug.bool && debug.depth >= depth},
  bool: false,
  depth: 0,
  set: function(bool,depth = 0){
    if (user.isSuper()){
      debug.bool = bool;
      debug.depth = depth;
    }
  }
};
const log = function(info, text = null, allowArray = false){
  if (typeof info === 'string') text = info;
  let error = ifu([info.error, info.errors], null, allowArray);
  let data = {}, attrText = [];
  if (typeof info == 'object'){
    for (let attr in info){
      data[attr] = info[attr];
      attrText.push(attr);
    }
    attrText = attrText.join(', ');        
  }else{
    attrText = 'log info';
  }
  let stack_steps = (new Error()).stack.match(/at (.*) \((.*js):(.*):/g), stack_info = '';
  if (stack_steps && stack_steps[1]){
    let last_step = stack_steps[1].match(/at (.*) \((.*js):(.*):/),
      fx = last_step[1], file = last_step[2].split('/').pop(), line = last_step[3],
      last_step_str = `   - ${file} ${line}`;    
    stack_info = last_step_str;
  }

  if (error !== null || Array.isArray(error)) {
    text = ifn([text, info.text], attrText);
    if (error instanceof Error) text = error.message;
    delete data.text;
    console.groupCollapsed('%c '+ text + ' ' + stack_info,'color: red; font-weight: bold;');
    console.error(data);
    if (error.stack) console.log(error.stack);
    console.groupCollapsed('trace');
    console.trace();
    console.groupEnd();
    console.groupEnd();
  }
  else {
    text = ifn([text, info.text], attrText);
    delete data.text;
    console.groupCollapsed('%c '+ text + ' ' + stack_info,'color: green; font-weight: bold;');
    console.log(data);
    console.groupCollapsed('trace');
    console.trace();
    console.groupEnd();
    console.groupEnd();
  }
};
class Button {
  constructor(options){
    let errors = [];
    try{
      for (let attr in options) {this[attr] = options[attr]}
      if (!this.ele) this.ele = $("<div/>",{text: this.text}).appendTo('body');
      this.ele.data('class_obj',this);
      if (!this.class_list) this.class_list = 'button';
      else if (!this.class_list.includes('button')) this.class_list += ' button';
      if (this.action && typeof this.action == 'string') this.action = this.action.to_fx();
      if (this.css) this.ele.css(this.css);
      if (this.id) this.ele.attr('id',this.id);
      if (options.css) this.ele.css(options.css);
      this.ele.addClass(this.class_list).data({action: this.action, target: this.target, mode: this.mode});
      this.ele.on('click',this.click.bind(this));
      this.ele.data('generic_fx',true);
      if (this.tooltip) new ToolTip({target:this.ele}.merge(this.tooltip));
      this.relocate();
    }catch (error) {
      log({error,options});
    }
  }
  get element () {
    log({error: new Error('change btn element => ele')});
  }
  relocate () {
    if (this.insertAfter) this.ele.insertAfter(this.insertAfter);
    else if (this.insertBefore) this.ele.insertBefore(this.insertBefore);
    else if (this.appendTo) this.ele.appendTo(this.appendTo);
  }

  async click (ev) {
    let action = this.action, target = this.target, mode = this.mode, callback = this.callback;
    try{
      if (action) action.bind(this.ele,ev)();
      if (mode && target){
        if ($(target).dne()) target = `#${target}`;
        if ($(target).dne()) throw new Error(`Target not found`);
        if (mode == 'modal') blurTop(target);
        else if (mode == 'scroll') $.scrollTo(target);
        else if (mode == 'click') $(target).click();
        else if (mode == 'load') {
          let result = await menu.fetch(url,target);
          if (typeof callback == 'function') callback();
        }
      }else if (mode && !target) throw new Error(`Target not defined for mode:${mode}`);
      else if (!mode && target) throw new Error(`Mode not defined for target:${target}`);
    }catch(error){
      let options = {action,target,mode,callback};
      let message = 'BUTTON ERROR';
      log({error,message,options});
    }
  }
}
class Editable {
  constructor(options){
  // attributes: name, html_tag, id, callback
  let name = ifu(options.name,'no name'), class_list = name.camel() + ' editable',
  html_tag = ifu(options.html_tag, 'div'), id = ifu(options.id, null), callback = ifu(options.callback, null),
  replace = (options.replace && $(`#${options.replace}`).exists()) ? $(`#${options.replace}`) : null,
  initial = ifu(options.initial, null);
  this.ele = $(`<${html_tag}/>`,{
    class: class_list,
    id: id,
  });
  this.name = name;
  $(`<div class='pair'></div>`).append(`<input type='text' placeholder='${name.toTitleCase()}'>`).append(`<span class='value'></span>`).appendTo(this.ele);
  $(`<div class ='toggle edit'>(edit ${name})<div>`).on('click',{obj:this},this.edit.bind(this)).appendTo(this.ele);
  let btn_save = $(`<div class ='toggle save'>(save)<div>`).on('click',{obj:this},this.save.bind(this)).appendTo(this.ele);
  $(`<div class ='toggle cancel'>(cancel)<div>`).on('click',{obj:this},this.cancel.bind(this)).appendTo(this.ele);
  if (replace) replace.replaceWith(this.ele);
  if (initial) this.text = initial;
  else this.edit();
  this.ele.find('input').on('keyup',function(ev){
    if (ev.keyCode == '13') btn_save.click();
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

  edit () {
    this.ele.find('input, .save, .cancel').show();
    this.ele.find('.edit, .value').hide();
    if (this.text != '') this.ele.find('input').val(this.text);
  }
  save (ev) {
    this.ele.find('input, .save, .cancel').hide();
    this.ele.find('.edit, .value').show();

    if (!this.verify) {
      feedback(`Invalid ${this.name.toTitleCase()}`,`You must enter a ${this.name}.`);
      this.edit();
      this.ele.find('input').addClass('borderFlash');
    }else{
      this.ele.find('.value').text(this.value);      
      this.ele.find('input').removeClass('borderFlash');
      if (this.callback) this.callback(ev, this.value);
    }
  }
  cancel () {
    this.ele.find('input, .save, .cancel').hide();
    this.ele.find('.edit, .value').show();
    this.ele.find('input').val(this.ele.find('.value').text());
  }
}
class OptionBox {
  constructor (options = {}) {
    let header = ifu(options.header, null), id = ifu(options.id, null),
    header_html_tag = ifu(options.header_html_tag, 'h3');
    this.ele = $(`<div class='prompt'></div>`);
    if (options.css) this.ele.css(options.css);
    this.ele.append(`<div class='body'><div class='info'></div></div>`,`<div class='options'></div>`);
    this.body = this.ele.find('.body');
    this.info = this.ele.find('.info');
    this.option_list = this.ele.find('.options');
    this.header = header ? $(`<${header_html_tag} class='header'>${header}</${header_html_tag}>`).prependTo(this.body) : null;

    this.buttons = [];
    if (id) this.ele.attr('id',id);
    this.ele.appendTo('body');
  }

  add_info (ele) {
    this.info.append(ele);
    return this;
  }
  reset_header (str) {log({str}); this.header.html(str)}
  reset_info (ele = null) {
    this.info.html('');
    if (ele) this.add_info(ele);
    return this;
  }
  add_button_info (ele) {
    this.option_list.prepend(ele);
    return this;
  }
  add_button (options) {
    let text = ifu(options.text, 'button'), action = ifu(options.action, null), class_list = ifu(options.class_list, 'pink xsmall'), appendTo = this.option_list, tooltip = options.tooltip || null;
    let btn = new Button({text,action,class_list,appendTo});
    this.buttons.push(btn);
    if (tooltip) new ToolTip({target:btn.ele}.merge(tooltip));
    return btn;
  }
}
class List {
  constructor (options = {}) {
    this.ele = $(`<div/>`,{class:'List'});
    let text = ifu(options.header, null), tag = options.header_html_tag || 'h3';
    if (text) this.header = $(`<${tag}>${text}</${tag}>`).appendTo(this.ele);
    this.ul = $(`<ul/>`).css({display:'inline-block'}).appendTo(this.ele);
    if (options.css) this.ele.css(options.css);
    this.cssUlOnly = options.cssUlOnly || {};
    this.ul.css(this.cssUlOnly.merge({width:'max-content',maxWidth:'35em'}));
    this.action = ifu(options.action, null);
    this.filter = options.filter || null;
    if (this.filter) this.filter_create();
  }

  get items () {
    return this.ul.find('li');
  }
  get values () {
    return this.items.get().map(item => $(item).data('value'));
  }
  filter_create () {
    log({filter:this.filter});
  }
  filter_by_text (text) {
    // if (Array.isArray(text)) 
  }
  add_item (options = {}) {
    let text = options.text || 'text ?', action = options.action || null,
      item = $(`<li/>`,{class: options.class_list || '',html:`<span>${text}</span>`}).appendTo(this.ul), entire_li_clickable = options.entire_li_clickable || false, clickable_ele = entire_li_clickable ? item : item.find('span'), value = options.value || text;
    item.data('value',value);
    // this.items.push({text,ele:item});
    if (action && typeof action == 'function'){
      clickable_ele.css({cursor:'pointer'}).on('click',action).on('mouseenter',function(){item.css({backgroundColor:'var(--gray50)'})}).on('mouseleave',function(){item.css({backgroundColor:'transparent'})});
    }
    return item;
  }
  remove_by_index (index) {
    let item = this.items.get(index);
    if (!item) throw new Error(`Index ${index} does not exist`);
    $(item).slideFadeOut(function(){$(this).remove()});
  }
}
class UpDown {
  constructor (options) {
    this.ele = $("<div/>",{class:'UpDown flexbox'}).css({width:'1em',position:'relative'});
    let has_label = options.preLabel || options.postLabel || null;
    let up = new Image(), down = new Image();
    up.src = down.src = `/images/icons/arrow_down_purple.png`;
    $(up).css({transform:'rotate(180deg)',opacity:0.5,width:'1em',height:'1em',cursor:'pointer'}).addClass('up');
    $(down).css({opacity:0.5,width:'1em',height:'1em',cursor:'pointer'}).addClass('down');
    $(up).add(down).on('mouseenter',function(){$(this).animate({opacity:1})})
      .on('mouseleave',function(){$(this).animate({opacity:0.5},100)})
    this.ele.append(up,down);
    let css = options.css || null, action = options.action || null, callback = options.callback || null;
    if (action) {
      if (typeof action == 'function') this.action = action;
      else if (this[action] && typeof this[action] == 'function') this.action = this[action].bind(this);
      else log({error:'invalid action',options:options});
    }
    if (callback) {
      if (typeof callback == 'function') this.callback = callback;
      else if (this[callback] && typeof this[callback] == 'function') this.callback = this[callback].bind(this);
      else log({error:'invalid callback',options:options});
    }
    let updown = this;
    if (this.action) {
      this.ele.on('mousedown touchstart','.up, .down', function(ev){
        if (updown.action) updown.action(ev);
      })
    }
    if (this.callback && action != 'change_order') {
      this.ele.on('mouseup mouseleave touchend','.up, .down', function(ev){
        if (updown.callback) updown.callback(ev);
      })
    }
    this.selector = options.selector || null;

    if (has_label) {
      let classes = 'arrowLabel', labelClass = ifu(options.labelClass, null);
      if (labelClass) classes += ` ${options.labelClass}`;
      this.label = $('<span/>',{class: classes}).css({
        padding:'0 0.5em',
        color:'var(--purple)',
        opacity:0,
        transition:'opacity 400ms',
        position:'absolute',
        whiteSpace: 'nowrap',
      });
      if (options.preLabel) this.label.css({right:'100%'});
      else this.label.css({left:'100%'});
      let label = this.label;
      $(up).add(down).on('mouseenter',function(){$(this).closest('.UpDownWrap').find('.arrowLabel').addClass('opacity80Flash').css({opacity:0.3})})
      .on('mouseleave',function(){$(this).closest('.UpDownWrap').find('.arrowLabel').removeClass('opacity80Flash').css({opacity:0})});
      this.wrapper = $('<div/>',{class:'flexbox nowrap UpDownWrap'}).append(this.ele);
      if (options.labelCss && options.labelCss.json_if_valid()) this.label.css(options.labelCss.json_if_valid());
      if (options.preLabel) this.label.text(options.preLabel).prependTo(this.wrapper);
      else this.label.text(options.postLabel).appendTo(this.wrapper);
      this.ele = this.wrapper;
    }
    if (css) this.ele.css(css);
  }
  change_order (ev) {
    let arrow = $(ev.target), target = this.selector ? arrow.closest(this.selector) : arrow.closest('.UpDownWrap').parent(), parent = target.parent(), all_to_sort = this.selector ? parent.children(this.selector) : parent.children();
    UpDown.set_indices(all_to_sort);
    if (arrow.hasClass('up')) UpDown.shift_index_up(target, all_to_sort);
    if (arrow.hasClass('down')) UpDown.shift_index_down(target, all_to_sort);
    UpDown.sort(all_to_sort);
    UpDown.unset_indices(all_to_sort);
    if (this.callback) this.callback(ev);
  }
  static sort(all_to_sort) {
    let parent = all_to_sort.first().parent();
    all_to_sort.sort(UpDown.dec_sort).appendTo(parent);
  }
  static dec_sort(a, b) { return ($(b).data('index')) < ($(a).data('index')) ? 1 : -1; }
  static set_indices(all_to_sort, method = 'index') {
    if (method == 'index') all_to_sort.each((i,item) => $(item).data('index',i));
  }
  static unset_indices(all_to_sort) {all_to_sort.removeData('index');}
  static shift_index_up(target, all_to_sort) {
    let prev = target.prev();
    if (prev.dne()) return;
    prev.data().index++;
    target.data().index--;
  }
  static shift_index_down(target, all_to_sort) {
    let next = target.next();
    if (next.dne()) return;
    next.data().index--;
    target.data().index++;
  }
}
class Toggle {
  constructor (options = {}){
    try{
      if (options instanceof jQuery && options.is('.toggle_proxy')) {
        let ele = options, data = options.data();
        options = {toggle_ele:ele}.merge(data);
      }
      this.toggle_ele = $(options.toggle_ele).css('cursor','pointer').data({class_obj: this});
      this.target_ele = $(options.target_ele);
      if (this.target_ele.dne()) this.target_ele = $(`#${options.target_ele}`);
      if (this.target_ele.dne()) this.target_ele = $(`.${options.target_ele}`);
      if (this.target_ele.dne()) throw new Error('toggle target not found;');
      else if (!this.target_ele.isSolo()){
        if (!options.allow_multi) throw new Error(`multiple (${this.target_ele.length}) targets found, not allowed`);
        else log({error:new Error(`multiple (${this.target_ele.length}) targets found, check arrow direction`)})
      }
      let toggle_box = this.toggle_ele[0].getBoundingClientRect(),
        target_box = this.target_ele[0].getBoundingClientRect();
      this.target_is_below = (toggle_box.top < target_box.top) ? true : false;
      this.callback_hide = options.callback_hide || null;
      this.callback_show = options.callback_show || null;
      this.initial_state = options.initial_state || 'visible';
      this.hover_text = ifu(options.hover_text, null);
      this.arrow_position = options.arrow_position || 'left';
      if (this.toggle_ele.find('.arrow').exists()) this.arrow = this.toggle_ele.find('.arrow')[0];
      else {
        this.arrow = new Image();
        this.arrow.src = `/images/icons/arrow_down_purple.png`;
        $(this.arrow).css({height:'1em',width:'1em',opacity:'0.3',cursor:'pointer',transition:'transform 400ms'});
      }
      this.text = this.toggle_ele.text().trim();
      this.text_ele = $(`<div/>`,{text:this.text,class:'toggleText'});

      let t = this;
      $(this.toggle_ele).on('mouseenter',function(){
        $(t.arrow).animate({opacity:1});
        $(t.text_ele).animate({letterSpacing:'0.02em'},200)
      }).on('mouseleave',function(){setTimeout(function()
        {$(t.arrow).animate({opacity:0.3});
        $(t.text_ele).animate({letterSpacing:'0em'})},200)
      }).on('click',function(){
        let hide_me = t.target_ele.is(':visible');
        if (hide_me) t.hide();
        else t.show();
      });
      let text_ele_css = {cursor:'pointer',color:'purple'};
      if (this.arrow_position == 'left') {
        text_ele_css.merge({marginLeft:'0.5em'});
        this.toggle_ele.addClass('toggle_ele flexbox left').html('').prepend(this.arrow, this.text_ele);
      } else if (this.arrow_position == 'below') {
        this.toggle_ele.addClass('toggle_ele').html('').prepend(this.text_ele, this.arrow);
        $(`<div>`,{class:'flexbox'}).insertBefore(this.arrow).append(this.arrow);
      }
      this.text_ele.css(text_ele_css);
      this.to_initial_state(0);
      // if (this.initial_state == 'hidden') this.hide(0);
      // else this.show(0);
    }catch(error){
      log({error,options},`toggle constructor error`);
    }
  }
  to_initial_state (time = 400) {
    if (this.initial_state == 'hidden') this.hide(time);
    else this.show(time);
  }
  show (time = 400) {
    if (this.is_disabled) return;
    let target_below = this.target_is_below, arrow_left = this.arrow_position == 'left',
      angle = 0;
    if (arrow_left) angle = '0';
    else angle = '180';
    this.target_ele.slideFadeIn(time);
    $(this.arrow).css({transform:`rotate(${angle}deg)`});          
    if (this.callback_show && typeof this.callback_show == 'function') this.callback_show();
    return this;
  }
  hide (time = 400) {
    let target_below = this.target_is_below, arrow_left = this.arrow_position == 'left',
      angle = 0;
    if (arrow_left) angle = '-90';
    else angle = '0';
    // log({target_below,arrow_left,angle});
    this.target_ele.slideFadeOut(time);
    $(this.arrow).css({transform:`rotate(${angle}deg)`});
    if (this.callback_hide && typeof this.callback_hide == 'function') this.callback_hide();
    return this;
  }
  disable (message = null) {
    this.hide(0);
    this.is_disabled = true;
    if (message) {
      this.tooltip = new ToolTip({ target: this.toggle_ele, message, hide_btn: false });
    }
  }
  enable (options = {}) {
    this.is_disabled = false;
    if (this.tooltip) this.tooltip.ele.remove();
    if (!options.dont_show) this.show(0);
    if (options.message) {
      let ele = this.toggle_ele, tag = ele[0].nodeName, textAlign = ele.css('text-align');
      if (this.message_enable) this.message_enable.remove();
      this.message_enable = $(`<${tag}/>`,{html:options.message,class:'pink'}).css({textAlign}).prependTo(this.target_ele);
    }
  }
  reset (time = 400) {
    this.is_disabled = false;
    this.to_initial_state(time);
    if (this.message_enable) this.message_enable.remove();
    if (this.tooltip) this.tooltip.ele.remove();
  }
}
class ToolTip {
  constructor (options) {
    let tip = this;
    this.ele = $(`<div/>`).addClass('tooltip').appendTo('body');
    this.target = options.target || null;
    if (!this.target) throw new Error('target not provided');
    let existing = this.target.data('tooltip');
    if (existing) {existing.ele.remove();}
    this.target.data('tooltip', this);
    this.css = options.css || {};
    this.class = options.class || null;
    this.message = options.message || null;
    this.on_hide = options.on_hide || null;
    this.match_border = options.match_border || false;
    this.hide_on = options.hide_on || '';
    this.ele.data('class_obj',this).slideFadeOut(0);
    this.hide_btn = ifu(options.hide_btn,true);
    if (this.hide_btn) {
      let btn = new Image();
      btn.src = '/images/icons/red_x.png';
      $(btn).css({width:'1em',height:'1em',position:'absolute',top:'0.2em',right:'0.2em',opacity:0.5,cursor:'pointer'})
        .on('mouseenter',function(){$(this).animate({opacity:1})})
        .on('mouseleave',function(){$(this).animate({opacity:0.5})})
        .on('click',function(){tip.hide(0)})
        .appendTo(tip.ele);
    }
    this.mouse = {x: null, y: null};
    this.ele.css(this.css);
    if (this.class) this.ele.addClass(this.class);
    if (this.message) this.message_append(this.message);
    this.target.on('mouseenter', this.show.bind(this));
    this.target.on('mousemove', this.track.bind(this));
    this.target.on(`mouseleave ${this.hide_on}`, this.hide.bind(this));
    this.ele.on('mouseleave',function(ev){
      let target = $(ev.relatedTarget), next_tip = ToolTip.find_closest_tooltip(target);
      if (!target.is(tip.target)) tip.hide(ev);
      if (next_tip) next_tip.show(ev);
    }).on('mouseenter',this.mousein.bind(this));
  }
  message_append (msg) {
    if (typeof msg == 'object') {
      let is_jquery = msg instanceof jQuery;
      if (!is_jquery) msg = msg.to_key_value_html();
    }
    this.ele.append(msg);
  }
  show (ev) {
    let target = $(ev.relatedTarget);
    if (target.isInside('.tooltip')) return;
    $('.tooltip').hide();
    if (this.match_border) this.ele.css({borderColor:this.target.css('background-color')});
    clearTimeout(this.hide_timeout);
    this.ele.show().animate({opacity:1});
    this.mouse_pos = ev;
    this.move(ev, false);
  }
  move (ev, animate = true) {
    let target = $(ev.toElement);
    if (target.isInside('.tooltip')) return;
    // this.mouse_pos = ev;
    let ele = this.ele[0].getBoundingClientRect();
    // log({view:view(),body:body(),ele,pos:this.position});
    if (animate) this.ele.animate(this.position, 250);
    else this.ele.css(this.position);
    // this.check_overflow();
  }
  track (ev) {
    let move = this.move.bind(this,ev), tooltip = this;
    this.mouse_pos = ev;
    if (!tooltip.track_timeout) {
      tooltip.track_timeout = setTimeout(function(){
        move();
        tooltip.track_timeout = null;
      },250);
    }
  }
  mousein (ev) { clearTimeout(this.hide_timeout); clearTimeout(this.track_timeout); this.track_timeout = null }
  hide (ev, time = 500) {
    if (typeof ev == 'number') {time = ev; ev = undefined;}
    let target = ev != undefined ? $(ev.relatedTarget) : null, tt = this;
    if (target && target.isInside('.tooltip')) return;
    this.hide_timeout = setTimeout(function(){
      tt.ele.slideFadeOut();
      tt.track_timeout = null;
      if (tt.on_hide && typeof tt.on_hide == 'function') tt.on_hide();
    }, time);
    // this.track_timeout = null;
    // if (this.on_hide && typeof this.on_hide == 'function') this.on_hide();
  }
  check_overflow () {
    // let is_visible = this.ele.isVisible(), scroll_bar_width = system.ui.scroll.bar_width();
    // if (!is_visible.right || !is_visible.bottom) {
    //   if (!is_visible.right) this.left -= (is_visible.ele_box.right - is_visible.parent_box.right);
    //   if (!is_visible.bottom) this.top -= (is_visible.ele_box.height + 40);
    //   this.ele.css({top:this.top,left:this.left});      
    // }
  }
  get position () {
    let box = this.ele[0].getBoundingClientRect(), v = view(),
      border = {right: this.mouse.x + box.width + system.ui.scroll.bar_width(), bottom: this.mouse.y + box.height},
      pos_adjusted = {top: (border.bottom > v.height) ? this.mouse.y - box.height - 20 : this.mouse.y};
    if (border.right > v.width) {
      pos_adjusted.right = 10; this.ele.css({left: 'unset'});
    }
    else {
      this.ele.css({right: 'unset'}); pos_adjusted.left = this.mouse.x;
    }
    // log({box,border,pos_adjusted})
    return pos_adjusted;
  }
  set mouse_pos (ev) {
    // this.y = ev.pageY + 20;
    // this.x = ev.pageX + 5;
    this.mouse = {x: ev.pageX + 5, y: ev.pageY + 10};
  }
  hide_all_others () {$('.tooltip').filter(':visible').not(this.ele).hide() }
  static hide_all (time = 0) {
    let tip = $('.tooltip').filter(':visible');
    if (tip.exists()) tip.each((t,tip) => $(tip).data('class_obj').hide(undefined,time));
  }
  static find_closest_tooltip (ele) {
    let tooltip = ele.data('tooltip'), parents = ele.parents();
    if (!tooltip) {
      parents.each((p,parent) => {
        tooltip = $(parent).data('tooltip');
        if (tooltip != undefined) return false;
      })
    }
    return tooltip != undefined ? tooltip : null;
  }
}
class Warning {
  constructor (options) {
    for (let option in options) this[option] = options[option];
  }
  show () {
    let message = this.message || 'no message given', 
      ele = this.ele || null;
    ele.warn(message);
    // if (eles) eles.not(ele).warn('');
  }
}
class Autosave {
  constructor (options) {
    try {
      for (let option in options) {this[option] = options[option]}
      if (!this.send) throw new Error(`Autosave must have a 'send' ajax call`);
      if (this.ele) {
        this.indicator = $(`<div/>`,{class:'autosave_indicator flexbox left'}).css({
          position: 'sticky', top: this.ele.getTopOffset(), left: 0, zIndex: 49, height: 0,
        }).slideFadeOut(0);
        this.ele.prepend(this.indicator);
      }
      this.delay = this.delay || 10000;
      this.size = options.size || 2;
      this.message = options.message || 'changes saved';
    } catch (error) {
      log({error});
    }
    log({autosave:this});
  }

  async trigger (easing_fx = 'easeInOutSine') {
    log({autosave:this},'autosave trigger');
    let autosave = this, spinner = null, five_seconds_less = (this.delay - 5000 >= 0) ? this.delay - 5000 : this.delay;
    if (this.timer_outer) clearTimeout(this.timer_outer)
    if (this.timer_inner) clearTimeout(this.timer_inner)
    if (this.bg) this.bg.slideFadeOut();
    this.timer_outer = setTimeout(async function(){
      if (autosave.indicator) autosave.circle_create();
      autosave.timer_inner = setTimeout(async function(){
        if (autosave.indicator) spinner = autosave.circle.spin(easing_fx);
        let result = await autosave.send();
        if (autosave.indicator) {
          clearInterval(spinner);
          if (!result.error) {
            let checkmark = new Icon({type:'checkmark',size:autosave.size});
            autosave.bg.html('').append(checkmark.img,$(`<span/>`,{text: autosave.message}).css({fontSize:`${autosave.size/2}em`,marginLeft: '5px'})).on('click',function(){$(this).slideFadeOut(1000)});
            setTimeout(function(){autosave.bg.slideFadeOut(1000,function(){$(this).remove()})},5000);            
          } else {
            let x = new Icon({type:'red_x',size:autosave.size});
            autosave.bg.html('').css({backgroundColor:'var(--pink10o)',borderColor:'var(--pink50)',color:'var(--pink)'}).append(x.img,$(`<span/>`,{text: result.error.message}).css({fontSize:`${autosave.size/2}em`,marginLeft: '5px'})).on('click',function(){$(this).slideFadeOut(1000)});
            setTimeout(function(){autosave.bg.slideFadeOut(1000,function(){$(this).remove()})},5000);            
          }
        }        
        if (autosave.callback) autosave.callback(result);        
      },5000)
    }, five_seconds_less);
  }
  circle_create () {
    this.bg = Autosave.background();
    this.circle = new Icon({type:'circle',size:this.size,color:'var(--green)'});
    this.circle.dot.add(this.circle.dot2).css({opacity:0});
    this.indicator.html('').append(this.bg.append(this.circle.svg)).slideFadeIn();
    this.circle_loop();
    log({circle: this.circle});
    return this.circle;
  }
  circle_loop (easing_fx = 'easeInOutCubic') {
    let time = this.delay < 5000 ? this.delay : 5000, interval = time / 100, count = 0, circle = this.circle, circum = circle.circumference, bg = this.bg;
    circle.ele.css({strokeDasharray: `${circum}rem ${circum}rem`,strokeDashoffset: `${circum}rem`});
    let animation = setInterval(function(){
      let percent = count / 100;
      circle.ele.css({strokeDashoffset: `${circum - circum * percent}rem`, opacity: percent});
      circle.dot.css({transform:`rotate(${3.6*count}deg)`, opacity: percent});
      circle.dot2.css({opacity:percent});
      if (percent*2 <= 100) bg.css({opacity:percent*2});
      if (count == 100) clearInterval(animation);
      count++;
    },interval);
  }
  static background () {
    return $(`<div/>`,{class:'autosave_bg flexbox left'}).css({backgroundColor:'var(--green10o)',textAlign:'center',padding:'0.5em',borderRadius:'3px',opacity:0,border:'1px solid var(--green30)',color:'var(--green)',boxSizing:'border-box',lineHeight:'1'});
  }
}
class Icon {
  constructor (options) {
    if (!options.type) throw new Error('type must be given');
    if (!Icon[options.type]) throw new Error(`Icon.${options.type} does not exist`);
    this.type = options.type;
    this.data = Icon[options.type](options);
    for (let attr in this.data) {
      this[attr] = this.data[attr];
    }
  }

  spin (easing_fx = 'easeInOutSine') {
    if (this.type != 'circle') throw new Error(`Trying to spin a ${this.type}!`);
    let interval = 1000, circle = this, circum = circle.circumference, count = 0;
    circle.ele.css({strokeDasharray: `${circum}rem ${circum}rem`,strokeDashoffset: 0});
    circle.dot.css({transform:`rotate(0deg)`}).removeAttr('clip-path');
    circle.dot2.css({transform:`rotate(0deg)`}).removeAttr('clip-path');
    circle.g.css({transformOrigin:'50% 50%'});
    let ease = jQuery.easing[easing_fx], dashOffset_start = -circum*0.15, rotate_start = 360*0.15, group_angle = rotate_start;
    let spinner = null;
    
    circle.ele.animate({strokeDashoffset: `${dashOffset_start}rem`},{
      duration:interval/4,
      easing: 'easeInOutSine',
      step: function (a, b) {
        let percent = a / b.end;
        circle.g.css({transform:`rotate(${rotate_start*percent}deg)`});
        circle.dot.css({transform:`rotate(${rotate_start*percent}deg)`});
      },complete: function(){
        spinner = setInterval(function(){
          let increase_dash = (count % 200 < 100), up_percent = ease(0,count%100,1,100,100)/100;
          let percent = increase_dash ? up_percent : ease(0,count%100,100,-99,100)/100, arc_delta = circum*0.7*percent, radian_delta = 360*0.7*percent;
          circle.ele.css({strokeDashoffset: `${dashOffset_start - arc_delta}rem`});
          circle.dot.css({transform:`rotate(${rotate_start + radian_delta}deg)`});
          group_angle += 4;
          circle.g.css({transform:`rotate(${group_angle}deg)`});
          count++;
        },interval/100);
      }
    });
    this.spinner = spinner;
    return spinner;
  }
  static circle (options) {
    let size = options.size || 3, color = options.color || 'var(--gray97)';
    let stroke = size / 8;
    if (stroke < 0.3) stroke = 0.3;
    let radius = (size - stroke * 2) / 2,
      circumference = radius * 2 * Math.PI;

    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg"),
      circle = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
      dot = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
      dot2 = document.createElementNS("http://www.w3.org/2000/svg", "circle"),
      rect_right = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
      clip_left = document.createElementNS("http://www.w3.org/2000/svg", "clipPath"),
      rect_left = document.createElementNS("http://www.w3.org/2000/svg", "rect"),
      clip_right = document.createElementNS("http://www.w3.org/2000/svg", "clipPath"),
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    svg.setAttribute('width',`${size}rem`);
    svg.setAttribute('height',`${size}rem`);
    svg.append(defs);
    $(defs).append(clip_left,clip_right);
    clip_left.setAttribute('id','cut-off-left');
      clip_left.append(rect_right);
    rect_right.setAttribute('x','50%');
      rect_right.setAttribute('y',0);
      rect_right.setAttribute('width','50%');
      rect_right.setAttribute('height','100%');
    clip_right.setAttribute('id','cut-off-right');
      clip_right.append(rect_left);
    rect_left.setAttribute('x',0);
      rect_left.setAttribute('y',0);
      rect_left.setAttribute('width','50%');
      rect_left.setAttribute('height','100%');
    circle.setAttribute('stroke',color);
      circle.setAttribute('stroke-width',`${stroke}rem`);
      circle.setAttribute('fill','transparent');
      circle.setAttribute('r',`${radius}rem`);
      circle.setAttribute('cx',`${size / 2}rem`);
      circle.setAttribute('cy',`${size / 2}rem`);
    dot.setAttribute('fill',color);
      dot.setAttribute('r',`${stroke/2}rem`);
      dot.setAttribute('cx',`${size / 2}rem`);
      dot.setAttribute('cy',`${size/2 - radius}rem`);
      dot.setAttribute('clip-path',"url(#cut-off-left)");
    dot2.setAttribute('fill',color);
      dot2.setAttribute('r',`${stroke/2}rem`);
      dot2.setAttribute('cx',`${size / 2}rem`);
      dot2.setAttribute('cy',`${size/2 - radius}rem`);
      dot2.setAttribute('clip-path',"url(#cut-off-right)");
    $(circle).css({transform:'rotate(-90deg)',transformOrigin:'50% 50%'});
    $(dot).css({transformOrigin:'50% 50%'});
    $(dot2).css({transformOrigin:'50% 50%'});

    let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute('class','circle_group');

    $(g).append(circle,dot2,dot);
    $(svg).append(g);
    // .css({display:'inline-block',borderRadius:'50%',boxSizing:'border-box',border:`${stroke}rem dashed var(--green)`,width:`${size}rem`,height:`${size}rem`, transition: 'stroke-dashoffset 200ms, opacity 200ms'});
    return {svg: $(svg), ele: $(circle), dot: $(dot), dot2: $(dot2), stroke, radius, circumference, g: $(g)};
  }
  static checkmark (options) {
    let size = options.size || 5;
    let checkmark = new Image();
    checkmark.src = `/images/icons/checkmark_green.png`;
    $(checkmark).css({width:`${size}em`,height:`${size}em`}).addClass('checkmark');
    return {img:$(checkmark)};
  }
  static red_x (options) {
    let size = options.size || 5;
    let x = new Image();
    x.src = `/images/icons/x_styled_red.png`;
    $(x).css({width:`${size}em`,height:`${size}em`});
    return {img:$(x)};    
  }
}

class Menu {
  constructor(element,data){
    this.element = element;
    this.element.data('class_obj', this);
    this.name = element.attr('id');
    this.tabs = element.find('.tab');
    this.target = data.target;
    this.links = this.tabs.filter((t, tab) => ($(tab).data('uri') !== undefined && $(tab).data('uri') != ''));
    this.dropdowns = this.tabs.filter((t, tab) => $(tab).children('.dropDown').exists());
    this.loading = null;
    this.data = data;
    this.image_tabs = this.tabs.filter((t,tab) => {return $(tab).children('.title').data('image') !== undefined;});

    this.links.each((t, tab) => $(tab).on('click', {uri:$(tab).data('uri'),tabId:$(tab).attr('id')}, this.linkClick.bind(this)));
    this.dropdowns.each((t, tab) => {
      $(tab).on('mouseenter mouseleave', {tabId:$(tab).attr('id')}, this.dropdownHover.bind(this));
      $(tab).on('click', {tabId:$(tab).attr('id')}, this.dropdownClick.bind(this));
      $(tab).data('hold',false);
    });
    this.image_tabs.each((t,tab) => {
      let image = new Image;
      image.src = $(tab).children('.title').data('image');
      $(image).css({width:'2em',height:'2em',opacity:0.6}).addClass('title')
      .on('mouseenter',function(){$(this).animate({opacity:1})})
      .on('mouseleave',function(){$(this).animate({opacity:0.6})});
      $(tab).children('.title').replaceWith(image);
    })
    this.clickActive();
    this.hightlightActive();
  }

  get active() {
    let active = this.links.filter((t,tab) => $(tab).attr('id') == tabs.get(this.name));
    return active.exists() ? active : null;
  }

  clickActive(){
    if (this.active && this.target != 'window') this.active.click();
    else if (this.target != 'window') this.links.first().click();   
  }
  hightlightActive() {
    this.element.resetActives();
    if (this.active) {
      this.active.find('.title').addClass('active');
      this.active.parents('.tab').children('.title').addClass('active');
    }
  }
  insideDropdown(ev){
    return $(ev.target).closest('.dropDown').exists();
  }
  isNestedDropdown(ev){
    return !$(ev.target).parent().is(`#${ev.data.tabId}`);
  }
  linkClick(ev) {
    $("#loading").remove();
    let target = this.element.data('target'), uri = ev.data.uri, tabId = ev.data.tabId,
    modal = $(ev.target).parents('.tab').filter((t,tab) => {return $(tab).data('modal') === true}).exists();
    tabs.set(this.name, tabId);
    // if (this.loading) log({loading:this.loading});
    if (this.loading && this.loading.readyState != 4) this.loading.abort();
    this.hightlightActive();
    if (target == 'window') window.location.href = uri;
    else {
      // let circle = $("<div id='loading' class='lds-ring dark'><div></div><div></div><div></div><div></div></div>");
      let circle = system.blur.modal.loading('var(--purple70o)',6).css({marginTop:'3em'})
      $(target).html("").append(circle);
      system.modals.reset();
      this.loading = menu.fetch(uri, target);
    }
  }
  dropdownHover(ev){
    let tab = $(`#${ev.data.tabId}`), showing = tab.children('.showingDD').exists(), mouseIn = (ev.type === 'mouseenter');
    if (mouseIn && !showing) this.dropdownShow(tab);
    else if (!mouseIn && showing) this.dropdownHide(tab);
  }
  dropdownShow(tab){
    let fx = tab.data('afterdropdown') ? tab.data('afterdropdown').to_fx() : null;
    tab.children('.dropDown').addClass('active').slideDown(400,fx);
    tab.children('.title').addClass('showingDD');
  }
  dropdownHide(tab){
    tab.children('.dropDown').removeClass('active').slideUp(400);
    tab.children('.title').removeClass('showingDD');
    if (tab.is('#Notifications') && tab.hasClass('.multi')) {
      tab.find('.dropDown').resetActives();
      tab.removeClass('multi');
    }
  }
  dropdownClick(ev){
    let tab = $(`#${ev.data.tabId}`), title = tab.children('.title'), dropdown = tab.children('.dropDown'), evType = ev.type, target = ev.target;
    let showNow = !title.hasClass('showingDD');
    if (this.isNestedDropdown(ev) || (tab.is('#Notifications') && this.insideDropdown(ev))) return;
    if (showNow) this.dropdownShow(tab);
    else this.dropdownHide(tab);
  }
}
const menu = {
  list: () => $('.menuBar').get().map(menu => $(menu).getObj()),
  get: name => menu.list().find(menu => menu.name == name) || null,
  initialize: {
    all: function(){
      init('.menuBar', function() { new Menu($(this), $(this).data()) })
      let x = 0, menu_list = menu.list();
      while (x < menu_list.length){
        if (x == 0) menu_list[x].element.addClass('siteMenu');
        else if (x == 1) menu_list[x].element.addClass('topMenu');
        else menu_list[x].element.addClass(`subMenu${x-1}`);
        x++;
      }
    },
  },
  fetch: (url, target, replace_target = false) => {
    let data = {}, new_modal = (typeof target == 'string' && target.includes('new_modal'));
    if (new_modal) {
      blurTop('loading');
      data.mode = 'modal';
    }
    return $.ajax({
      url: url,
      headers: system.validation.xhr.headers.list(),
      data: data,
      success: (response, status, request) => {
        if (new_modal) {
          let split = target.split(':'), id = split[1] || null, 
            modal = id && $(`#${id}`).exists() ? $(`#${id}`) : $(`<div class='modalForm'${id ? `id='${id}'`:''}></div>`);
          $(`#${id}`).find('.loading').each((c,circle) => clearInterval($(circle).data('spinner')));
          log({target,modal,response});
          modal.html(response);
          blurTop(modal);
        } else {
          $(target).find('.loading').each((c,circle) => clearInterval($(circle).data('spinner')));
          if (replace_target) $(target).replaceWith(response);
          else $(target).html(response);
        }
        initialize.newContent();
      }
    });
  },
  reload: () => {
    let current = $('.menuBar').last().getObj(), active = current.active, url = active.data('uri');
    log({current,active,url});
    // unblurAll({callback:})
    blur($(current.target),'loading');
    menu.fetch(url, current.target);
  },
  load: async (options) => {
    let url = options.url || null,
    target = $(options.target) || null,
    callback = options.callback || null,
    modal = options.modal || false,
    blurred = options.blurred || false;
    loadingColor = options.loadingColor || 'var(--darkgray97)';
    if (!url || !target) {
      log({error:{url:url,target:target}},'missing at least one: url || target');
      return;
    }
    if (blurred) blur(target,'#loading');
    else target.html().append(system.blur.modal.loading(loadingColor).svg);
    let result = await menu.fetch(url, target);
    if (callback && typeof callback == 'function') callback();
  }
}
const tabs = {
  list: {},
  set: function(menu, tab = null){
    if (typeof menu == 'string' && menu != "") tabs.list[menu] = tab;
    else if (typeof menu == 'object') $.each(menu,function(key, value){tabs.set(key, value);});
  },
  get: function(menu){
    return (tabs.list[menu] != undefined) ? tabs.list[menu] : null;
  },
  clear: function(){tabs.list = {}},
  log: function(){console.log(tabs.list)}
};

const system = {
  user: {
    current: null,
    is: function(usertype){return user.current ? (user.current.type == usertype) : false;},
    isSuper: function(){return (user.current && user.current.is_super != undefined) ? user.current.is_super : false;},
    isAdmin: function(){return (user.current && user.current.is_admin != undefined) ? user.current.is_admin : false;},
    set: function(userData){
      if (Object.isFrozen(user)) return;
      user.current = userData;
      Object.freeze(user);
    },
    login: async () => {
      let form = $('#LoginForm'), data = form.answersAsObj();
      blur(form,'loading');
      $.ajax({
          url:"/login",
          method:"POST",
          data:data,
          success:function(data){
              blur(form,"#checkmark");
              setTimeout(function(){window.location.reload()},1000);
          },
          error:function(data){
              unblur()
          }
      })
      // log({result});
    },
    initialize: () => {
      init('#RoleSelector',function(){
        let selector = $(this);
        $(this).on('click','li',function(){
          selector.find('.button').removeClass('disabled');
        });
        $(this).on('click','.button',function(){
          if ($(this).hasClass('disabled')) return;
          let data = $("#RoleSelector").answersAsObj();
          data.selected_role = data.selected_role[0];
          blurTop('#loading');
          $.ajax({
            url: '/portal/select_role',
            method: 'POST',
            data: data,
            success: function(){
              location.reload();
            }
          })
        })
      })
    }
  },
  notifications: {
    current: [],
    ele: null,
    count_ele: null,
    unread_count: null,
    markAsUnreadBtn: null,
    markAsReadBtn: null,
    deleteBtn: null,
    selectBtn: null,
    allBtn: null,
    limit: 1,
    timer: null,
    scroll: {
      list: $("#Notifications").find('.scrollList'),
      pos: () => notifications.ele.find('.scrollList')[0].scrollTop,
      is_at_top: () => {return notifications.scroll.pos() === 0},
      is_at_bottom: () => {
        let scroll = notifications.scroll, list = scroll.list;
        return scroll.pos() + list[0].offsetHeight === list[0].scrollHeight;
      },
    },
    add: notificationJson => {
      notificationJson.forEach(notification => {
        if (!notifications.ele.find('.notification').find('.title').get().find(
          existing => $(existing).data('id') == notification.id)
        ) {
        log({notification}, `new notification ${moment().format('h:mma')}`);
          let node = $(`<div class='tab notification'><div class='title'><span class='selector'></span>${notification.type}<span class='indicator unread'></span></div></div>`);
          node.prependTo(notifications.ele.find('.scrollList')).find('.title').data(system.validation.json(notification.data));
          node.on('click',notifications.click);
        }
      })
      notifications.update.list();
    },
    get: {
      unread: async () => {
        let unreadNotifications = await $.ajax('/notification-check');
        let json = unreadNotifications.json_if_valid();
        if (!json || $.isEmptyObject(json)) return;
        notifications.add(json);
        clearInterval(notifications.timer);
        notifications.timer = setInterval(notifications.get.unread, 180000);
      },
      active: () => $("#Notifications").find(".list").find(".active"),
      activeIds: () => notifications.get.active().get().map(notification => $(notification).data('id')),
      count: () => notifications.get.active().length,
    },
    delete: async () => {
      try{
        let ele = notifications.ele.find('.list').is(':visible') ? notifications.ele.find('.list') : $("#Notification");
        blur(ele,'#loading');
        let ids = notifications.get.activeIds();
        let result = await $.ajax({
          url: '/notification-delete',
          method: 'POST',
          data: {ids: ids}
        })
        unblur();
        log({notifications:notifications.get.active()});
        if (result == 'checkmark') {
          notifications.get.active().parent().slideFadeOut(400,function(){
            $(this).remove();
            notifications.update.list();
            notifications.update.arrow_ele();
          });
        }else feedback('Error deleting','System admins have been notified.');
        return result == 'checkmark';
      }catch(error){
        log({error});
        return false;
      }
    },
    update: {
      ajax: async (status) => {
        let ids = notifications.get.activeIds();
        if (!status) {log({error:'status not defined',status:status}); return;}
        notifications.update.list(status);
        let result = await $.ajax({
          url: '/notification-update',
          method: 'POST',
          data: {ids: ids, status: status}
        })
        let reverse = (status == 'read') ? 'unread' : 'read';
        if (result.trim() != 'checkmark') {
          log({error:result},'notification error');
          notifications.update.list(reverse);
        }
      },
      list: (status = null) => {
        if (status) {
          let active = notifications.get.active();
          if (status == 'unread') active.find('.indicator').removeClass('read').addClass('unread');
          else if (status == 'read') active.find('.indicator').removeClass('unread').addClass('read');
        }
        let unreadCount = notifications.ele.find('.indicator.unread').length;
        notifications.count_ele.find('span').text(unreadCount);
        notifications.unread_count = unreadCount;
        let totalCount = notifications.ele.find('.notification').length;
        if (totalCount == 0 && notifications.ele.find('.noNotifications').dne()) {
          let noNotifications = $(`<div class='tab noNotifications'><div class='title'>No notifications</div></div>`);
          notifications.ele.find('.scrollList').prepend(noNotifications);
        }else if (totalCount != 0) notifications.ele.find('.noNotifications').remove();
      },
      arrow_ele: () => {
        let list = notifications.ele.find('.scrollList'), arrows = notifications.ele.find('.up,.down');
        if (list[0].scrollHeight == list[0].offsetHeight) arrows.slideFadeOut();
        else arrows.slideFadeIn();
      }
    },
    click: (ev) => {
      let notification = $(ev.target);
      if (notification.parent().hasClass('noNotifications')) return;
      if (notifications.limit == 1) {
        notifications.ele.resetActives();
        notification.addClass('active');
        notifications.update.ajax('read');
        notifications.open(notification);
        notifications.update.list('read');
      }else{
        notification.toggleClass('active');
      }
    },
    open: notification => {
      let data = notification.data(), message = $("#Notification").find('.message'), options = $("#Notification").find('.options');
      options.find('.button.temp').remove();
      message.html(`<h2 class='purple'>${data.type}</h2><h3>${data.description}</h3><div class='split3366KeyValues'></div>`);
      let list = message.find('.split3366KeyValues'),
      details = system.validation.json(data.details), buttons = system.validation.json(data.buttons);
      try{
        $.each(details, (key,value) => {
          if (value === null) value = 'none';
          log({key,value,list});
          value = notifications.handle[typeof value](value);
          list.append(`<div class='label'>${key}</div>`);
          list.append(value);
        })
      }catch(error){

      }
      if (data.model && data.uid) {
        uids.set(data.model,data.uid);
      }
      if (buttons) {
        buttons.forEach(button => {
          let btnOptions = {
            class_list: "small yellow temp",
            appendTo: options.find('.tempBtns'),
            text: button.text,
          }
          if (button.type == 'click') btnOptions.action = function(){unblurAll();$(button.target).click();}
          else if (button.type == 'viewModel') btnOptions.action = function(){log({btn:data},'view model')}
            new Button(btnOptions);
        });
      }
      blurTop("#Notification");
    },
    handle: {
      string: string => $(`<div class='value'>${string}</div>`),
      number: number => $(`<div class='value'>${number}</div>`),
      boolean: bool => $(`<div class='value'>${bool ? 'true' : 'false'}</div>`),
      function: fx => $(`<div class='value'>FXFXFXFX</div>`),
      array: array => {
        let ele = $(`<div class='value' style='word-break:break-word;'></div>`);
        array.forEach((item,i) => {
          ele.append(`<span class='bold' style='position:absolute;'>${i}</span>`);
          let vEle = $('<div style="margin-left:1.5em;"></div>').appendTo(ele);
          vEle.append(notifications.handle[typeof item](item));
        });
        return ele;
      },
      object: object => {
        if (Array.isArray(object)) return notifications.handle.array(object);
        let ele = $(`<div class='value'></div>`), attrStrs = [];
        var t, v, f;
        try{
          for (let attr in object){
            if (object.hasOwnProperty(attr)){
              let v = object[attr];
              if (typeof v === 'object') v = system.display.format.readableJson(v);
              ele.append(`<div><span class='bold' style='padding-right:0.5em'>${attr}:</span><span>${v}</span></div>`);
            }
          }
        }catch(error){
          log({error,v,t});
        }
        return ele;
      }
    },
    initialize: {
      all: function(){
        init('#Notifications',function(){
          notifications.ele = $("#Notifications").on('mouseenter',function(){
            $(this).find('.indicator.count').animate({opacity:1});
          }).on('mouseleave',function(){
            $(this).find('.indicator.count').animate({opacity:0.6});          
          });
          $.each(notifications.initialize, function(name, initFunc){
            if (!['all'].includes(name) && typeof initFunc === 'function') initFunc();
          });
          notifications.update.list();
          if (notifications.timer) clearInterval(notifications.timer);
          notifications.timer = setInterval(notifications.get.unread, 180000);        
        })
      },
      buttons: function(){
        init([
          [notifications.ele.find('.list').find(".tab"),function(){
            $(this).on('click', {notification: $(this)}, notifications.click)
          }],
          [notifications.ele.find('.button.markAsUnread'), function(){
            notifications.markAsUnreadBtn = new Button({
              ele: $(this),
              action: notifications.update.ajax.bind(null,'unread'),
              id: 'MarkSelectedAsUnreadBtn',
            });
          }],
          [notifications.ele.find('.button.markAsRead'), function(){
            notifications.markAsReadBtn = new Button({
              ele: $(this),
              action: notifications.update.ajax.bind(null,'read'),
              id: 'MarkSelectedAsReadBtn',
            });
          }],
          [notifications.ele.find('.button.delete'), function(){
            notifications.deleteBtn = new Button({
              ele: $(this),
              action: notifications.delete,
              id: 'DeleteSelectedBtn',
            });
          }],
          [$("#Notification").find('.button.markThisAsUnread'), function(){
            new Button({
              ele: $(this),
              action: function(){
                notifications.update.ajax('unread');
                unblur();
              },
              id: 'MarkThisAsUnread',
            });
          }],
          [$("#Notification").find('.button.deleteThis'), function(){
            new Button({
              ele: $(this),
              action: async function(){
                let result = await notifications.delete();  
                if (result) unblur();
              },
              id: 'DeleteThis',
            });
          }],
          [notifications.ele.find('.button.selectMultiple'), function(){
            notifications.deleteBtn = new Button({
              ele: $(this),
              action: function(){
                notifications.ele.toggleClass('multi');
                if (notifications.limit == 1) notifications.limit = null;
                else notifications.limit = 1;
              },
              id: 'SelectMultiBtn',
            });
          }],
          ]);     
      },
      count: function(){
        notifications.count_ele = $(`<span/>`,{
          class:'indicator count flexbox',
          html: `<span style='margin:1px 0 -1px 0'>${notifications.get.count()}</span>`
        }).css({opacity:0.6}).appendTo(notifications.ele);
      },
      arrows: function(){
        init(notifications.ele.find('.scrollList'),function(){
          let list = $(this), scroll = notifications.scroll, up = notifications.ele.find('.up'), down = notifications.ele.find('.down');
          down.css({backgroundColor:'var(--purple5'});
          down.on('click',function(ev){
            ev.preventDefault();
            if (scroll.is_at_bottom()) return;
            log({top:scroll.is_at_top},scroll.pos());
            list.scrollTo(scroll.pos() + 200,{axis:'y',onAfter:function(){
              if (scroll.is_at_bottom()) {
                down.css({backgroundColor:'transparent'});
                down.find('img').css({opacity:0.6});
              }
              if (!scroll.is_at_top()) up.css({backgroundColor:'var(--purple5'});
            }});
          }).on('mouseenter',function(){
            if (!scroll.is_at_bottom()) {
              $(this).find('img').css({opacity:1});
              $(this).css({backgroundColor:'var(--purple10)'})
            }
          }).on('mouseleave',function(){
            if ($(this).css('background-color') !== 'rgba(0, 0, 0, 0)') $(this).css({backgroundColor:'var(--purple5'});
            $(this).find('img').css({opacity:0.6})
          })
          up.on('click',function(ev){
            ev.preventDefault();
            if (scroll.is_at_top()) return;
            log({top:scroll.is_at_top},scroll.pos());
            list.scrollTo(scroll.pos() - 200,{axis:'y',onAfter:function(){
              if (scroll.is_at_top()) {
                up.css({backgroundColor:'transparent'});
                up.find('img').css({opacity:0.6});
              }
              if (!scroll.is_at_bottom()) down.css({backgroundColor:'var(--purple5'});
            }});
          }).on('mouseenter',function(){
            if (!scroll.is_at_top()) {
              $(this).find('img').css({opacity:1});
              $(this).css({backgroundColor:'var(--purple10)'})
            }
          }).on('mouseleave',function(){
            if ($(this).css('background-color') !== 'rgba(0, 0, 0, 0)') $(this).css({backgroundColor:'var(--purple5'});
            $(this).find('img').css({opacity:0.6})
          })
        })
      }
    },    
  },
  request: {
    check_headers: (xhr,settings,ev) => {
      let uidList = system.validation.json(xhr.getResponseHeader('X-Current-Uids')),
      tabList = system.validation.json(xhr.getResponseHeader('X-Current-Tabs')),
      csrf = xhr.getResponseHeader('X-CSRF-TOKEN'),
      unreadNotifications = system.validation.json(xhr.getResponseHeader('X-Unread-Notifications')),
      force_logout = xhr.getResponseHeader('X-FORCE-LOGOUT');
      log({xhr,json:xhr.responseJSON,responsetext:xhr.responseText},settings.url);
      if (force_logout != null && force_logout.toBool()) system.request.force_logout();
      if (uidList) {
        if (uidList === 'null') uids.clear();
        else uids.set(uidList);
      }
      if (tabList) tabs.set(tabList);
      if (csrf) $('meta[name="csrf-token"]').attr('content',csrf);
      if (unreadNotifications) {
        if (unreadNotifications === 'send ajax') notifications.get.unread();
        else notifications.add(unreadNotifications);
      }    
    },
    force_logout: (forced = false) => {
      if (forced) {
        let form = $(`<form action='/portal/logout' method='post'></form>`).appendTo('body');
        form.append(`<input name='reason' hidden='true' value='due to inactivity'>`)
        form.submit();
      }else{
        $("#Confirm").find('.confirmN').hide();
        confirm({
          header: 'Session Expiring',
          message: 'For security reasons you will be logged out shortly<br><span class="count" style="font-size:1.3em;font-weight:bold;color:var(--pink);">30</span>',
          btntext_yes: 'stay signed in',
          btntext_no: 'dismiss',
          interval: function(){
            let count = $("#Confirm").find('.count'), n = Number($("#Confirm").find('.count').text());
            count.text(n - 1);
          },
          callback_no_response: function(){
            $("#Confirm").find('.count').text('LOGGING OUT');
            let form = $(`<form action='/portal/logout' method='post'></form>`).appendTo('body');
            form.append(`<input name='reason' hidden='true' value='due to inactivity'>`)
            form.submit();
          },
          callback_affirmative: () => {unblur();$.ajax('/keep-session'); $("#Confirm").find('.confirmN').show();}
        });
      }
    },
    refresh_page: () => {location.reload(true)}
  },
  initialize: {
    selection: null,
    error: null,
    newContent: function(){
      try{
        system.user.initialize();
        system.ui.initialize();
        system.display.initialize();
        menu.initialize.all();
        if (forms) forms.initialize.all();
        if (notifications) notifications.initialize.all();
        if (table) table.initialize.all();          
        resizeElements();
        masterStyle();
      }catch(error){
        log({error},'initialization error');
      }
    },
    ele: function(options = {select:null, action: null}){
      try{
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
        initialize.selection.each(function(e,element){
          try{
            options.function.bind(element)();
            $(element).data(options.dataAttr, options.setValue);
          }catch(error){
            console.log(error);
          }
        });            
      }catch(error){
        let message = error.message || null;
        error = error.error || error;
        if (debug.level(1)) log({error,message,options}, !message ? `Failed to initialize` : message);
        return;
      }
      return initialize.selection;
    },
    find: function(selection, dataAttr = 'initialized', value = null){
      let elements = null;
      try{
        if (selection instanceof jQuery){elements = selection;}
        else if(typeof selection == 'string'){elements = $(selection);}
        else {
          throw({selection: selection, error: 'selection not string or jQuery'});
          return false;
        }
      }catch(error){
        log({error});
        return false;
      }
      let falsey = $.inArray(value,['unset','null',null,'undefined',undefined,"false",false]) > -1, 
      match = elements.filter(function(){
        if (falsey) return !$(this).data(dataAttr);
        else return $(this).data(dataAttr) === value;
      });
      if (match.dne()) {
        initialize.selection = null;
        if (elements.dne()) system.initialize.error = 'element not in DOM';
        else system.initialize.error = `element exists, '${dataAttr}' != ${falsey ? 'falsey' : value}`;
      }else{
        initialize.selection = match;
      }
      return initialize.selection;
    },
  },
  blur: {
    element: (options) => {
      ToolTip.hide_all();
      let ele = options.ele,
      modal = options.modal,
      time = options.time || 400,
      callback = options.callback || null,
      loadingColor = options.loadingColor || 'var(--darkgray97)',
      blurCss = options.blurCss || null,
      delay = options.delay || 0;

      if (!ele || !modal) {log({error:{ele,modal,time,callback}},'missing ele or modal'); return;}
      if (!$(ele).isSolo()) {log({error:{ele,modal,time,callback}},'ele not found'); return;}
      else ele = $(ele);
      if (ele.find('.blur').exists()) unblur();
      if (modal == '#loading' || modal == 'loading') modal = system.blur.modal.loading({loadingColor});
      else if (modal == '#checkmark' || modal == 'checkmark') modal = system.blur.modal.checkmark();
      else if (!$(modal).isSolo()) {log({error:{ele,modal,time,callback}},'invalid modal'); return;}
      else modal = $(modal);
      if (ele.is(modal)) {log({error:{ele,modal,time,callback}},'ele is modal'); return;}
      if (ele.is('body')) {
        unblurAll();
        if (modal.is('.loading')) modal.removeClass('dark').addClass('light');
      }

      ele.css(system.blur.ele.css(ele,modal));
      modal.css(system.blur.modal.css(ele,modal));
      system.blur.modal.addX(modal);

      let block = $("<div class='blur'></div>").css(system.blur.block.css(ele, modal));
      if (blurCss) block.css(blurCss);
      try{
        block.prependTo(ele).show();
        block.append(modal);
        system.blur.resize(ele, modal);
        if (callback && typeof callback == 'function') setTimeout(callback, time+delay);
        if (FormEle.waiting_for_list(modal)) {
          log({ele,modal},'WAITING FOR LIST!');
          alert("yeah i'm waiting!");
        }
      }catch(error){
        log({error,options},'blur error');
      }
      return modal;
    },
    topmost: (modal, options = {}) => {
      let top = system.blur.block.top();
      if (top) {
        let child = top.children().first();
        if (child.hasClass('loading') || child.hasClass('checkmark')){
          options.ele = top.parent();
          options.ele.find('.blur').remove();
        }else options.ele = child;
      }
      else {
        options.ele = $("body");
        options.loadingColor = 'var(--white97)';
      }
      options.modal = modal;
      return system.blur.element(options);
    },
    resize: (ele, modal) => {
      if (ele.is('body')) return;
      let count = 0;
      let maxHeight = ele.parent().height() * 0.96 - 1;
      if (modal[0].scrollHeight > ele.height()) ele.height(modal[0].scrollHeight);
      else ele.css('height','auto');
    },
    modal: {
      loading: (options) => {
        let loadingColor = options.loadingColor || 'var(--darkgray97)', size = options.size || 4;
        let circle = new Icon({type:'circle', size:size, color:loadingColor});
        circle.spin();
        circle.svg.addClass('loading').data('spinner',circle.spinner);
        return circle.svg;
      },
      checkmark: () => $('#CheckmarkBlur'),
      addX: (modal) => {
        if (modal.is('.loading') || modal.is('.checkmark')) return;
        let options = modal.children('.options'), has_option_box = options.exists(), append_ele = has_option_box ? options : modal;
        if (modal.find('.cancel').dne()) $("<div class='cancel button small'>dismiss</div>").appendTo(append_ele);
        if (modal.find('.cancelX').dne()) $("<div class='cancel cancelX'>x</div>").appendTo(append_ele);
      },
      css: (ele, modal) => {
        let css = {
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          boxShadow: '0 0 40px 10px var(--gray70)',
          display: 'block',
          margin: 'auto',
          borderColor: 'var(--darkgray70)'
        };
        if (ele.is('body')) css.merge({boxShadow: "0 0 40px 0 var(--gray)"});
        if (modal.is('.checkmark')) {
          css.merge({
            borderRadius: "50%",
            padding: "2em 2em",
            boxShadow: "0 0 20px 10px rgba(230,230,230,0.4)",
            backgroundColor: "var(--green10o)",
            border: "2px solid green"        
          })
        }else if (modal.is('.loading')) css.boxShadow = 'unset';
        return css;
      },
      top: () => system.blur.block.top().children().first(),
    },
    ele: {
      css: (ele, modal) => {
        let css = {
          overflowY: 'hidden',
        };
        return css;
      }
    },
    block: {
      css: (ele, modal) => {
        let css = {
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: '0',
          left: '0',
          padding: '0 !important',
          margin: '0 !important',
          backgroundColor: 'var(--darkgray97)',
          zIndex: '52',
        }
        if (ele.is('body')) {
          let top = (window.pageYOffset || document.scrollTop) - (document.clientTop || 0);
          if (isNaN(top)) top = 0;          
          css.merge({
            height: '100vh', top,
            boxShadow: '0 0 20px 10px rgb(110,110,110) inset',
          })
        } else {
          css.top = ele[0].scrollTop;
          if (!ele.isInside('blur')) {
            css.backgroundColor = 'var(--white80)';
            // css.boxShadow = 'unset';
            css.zIndex = 50;
          }
        }
        return css;
      },
      top: () => {
        let top = $('.blur').last().exists() ? $('.blur').last() : null;
        return top;
      }
    },
    undo: (options) => {
      let callback = options.callback || null,
      delay = options.delay || 400,
      fade = options.fade || null,
      top = system.blur.block.top(),
      repeat = options.repeat || null,
      ele = options.ele || null;
      if (ele) {
        if ($(ele).dne()) throw new Error(`can't unblur because ele doesn't exist`);
        else if ($(ele).find('.blur').dne()) return;
      }
      if (fade) {
        top.fadeOut(fade,function(){
          top.find('.loading').each((c,circle) => clearInterval($(circle).data('spinner')));
          top.children().appendTo('#ModalHome');
          top.parent().css({overflowY:'auto',height:'auto'});
          $(this).remove();
        });
      }else {
        if (!top) return;
        top.find('.loading').each((c,circle) => clearInterval($(circle).data('spinner')));
        top.children().appendTo('#ModalHome');
        top.parent().css({overflowY:'auto',height:'auto'});
        top.remove();
      }
      if (repeat && repeat > 1) {
        repeat--;
        system.blur.undo({delay,fade,callback,repeat});
      } else if (callback && typeof callback == 'function') setTimeout(callback, delay);
    },
    undoAll: (options) => {
      let callback = options.callback || null,
      delay = options.delay || 400,
      fade = options.fade || 400;
      all = $(".blur");
      if (fade) {
        all.fadeOut(fade,function(){
          all.children().appendTo('#ModalHome');
          all.parent().css({overflowY:'auto',height:'auto'});
          all.remove();
        });
      }else {
        all.children().appendTo('#ModalHome');
        all.parent().css({overflowY:'auto',height:'auto'});        
        all.remove();
      }
      if (callback && typeof callback == 'function') setTimeout(callback, delay);
    }
  },
  ui: {
    initialize: () => {
      initAlt('.button', 'generic_fx', function(){
        let options = $(this).data('options') || $(this).data();
        options.ele = $(this);
        new Button(options);
      });
      init('#Feedback',function(){
        $(this).on('click','.cancel',function(){
          let callback = system.ui.feedback.callback;
          if (callback && typeof callback == 'function') callback();
        })
      })
    },
    pointer: {
      to_xy_coords: (ev) => {
        var out = {x: 0, y: 0};
        if (ev.type === 'touchstart' || ev.type === 'touchmove' || ev.type === 'touchend' || ev.type === 'touchcancel') {
          var touch = ev.originalEvent.touches[0] || ev.originalEvent.changedTouches[0];
          out.x = touch.pageX;
          out.y = touch.pageY;
        } else if (ev.type === 'mousedown' || ev.type === 'mouseup' || ev.type === 'mousemove' || ev.type === 'mouseover' || ev.type === 'mouseout' || ev.type === 'mouseenter' || ev.type === 'mouseleave') {
          out.x = ev.pageX;
          out.y = ev.pageY;
        }
        return out;
      }
    },
    keyboard: {
      allow_these_keys: (input, values) => {
        $(input).on('keydown',function(ev){
          if (!system.ui.keyboard.key_match(ev.key, values)) {
            input.warn(`<i>${ev.key}</i> not allowed`);
            ev.preventDefault();
          }
        })
      },
      disallow_these_keys: (input) => {
        $(input).on('keydown',function(ev){
          if (system.ui.keyboard.key_match(ev.key, values)) ev.preventDefault();
        })
      },
      key_match: (key, values) => {
        let key_allowed = false;
        if (typeof values == 'string') key_allowed = system.ui.keyboard.allow.string_characters(values, key);
        if (typeof values == 'object') key_allowed = system.ui.keyboard.allow.regex(values, key);
        meta_keys = system.ui.keyboard.allow.meta_keys(key);
        return key_allowed || meta_keys;
      },
      allow: {
        string_characters: (string, key) => {
          if (key === undefined) return true;
          return string.split('').includes(key);
        },
        meta_keys: (key) => {
          if (key === undefined) return true;
          return ['Backspace','Tab','Escape','Shift','Meta'].includes(key) || key.includes('Arrow');
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
        if (typeof settings != 'object'){
          feedback('error','confirm requires object parameter');
          log({error:'using old confirm',settings:settings},'old confirm');
          return;
        }
        let header = settings.header || 'Confirm',
        message = settings.message || 'Confirming something but no message given',
        btntext_yes = settings.btntext_yes || 'confirm',
        btntext_no = settings.btntext_no || 'cancel',
        delay = settings.delay || null,
        callback_affirmative = settings.callback_affirmative || null,
        callback_negative = settings.callback_negative || null,
        callback_no_response = settings.callback_no_response || null,
        interval = settings.interval || null,
        modal = $("#Confirm");
        if (typeof header == 'string') header = $(`<h2 class='purple'>${header}</h2>`);
        if (typeof message == 'string') message = $(`<div>${message}</div>`);
        modal.find('.message').html("").append(header).append(message);
        modal.find('.confirmY').text(btntext_yes);
        modal.find('.confirmN').text(btntext_no);
        blurTop("#Confirm");
        let confirmed = await new Promise((resolve,reject) => {
          modal.on('click','.confirmY, .resolve',function(){resolve(true)});
          modal.on('click','.confirmN',function(){resolve(false)});
          if (interval && typeof interval == 'function') system.ui.confirm.interval = setInterval(interval,1000);
          setTimeout(function(){
            reject('30s timeout');
          },30000)
        }).catch(error => {
          clearInterval(system.ui.confirm.interval);
          if (callback_no_response && typeof callback_no_response == 'function') callback_no_response();
          else if ($('#Confirm').is(':visible')) unblur();
        })
        if (delay){
          setTimeout(system.ui.confirm.handleCallback.bind(null,confirmed,callback_affirmative,callback_negative),delay);
        }else{
          system.ui.confirm.handleCallback(confirmed,callback_affirmative,callback_negative);
        }
        return confirmed;
      },
      handleCallback: (confirmed, affirmative, negative) => {
        clearInterval(system.ui.confirm.interval);
        log({confirmed,affirmative,negative});
        if (confirmed && affirmative) affirmative();
        else if (!confirmed && negative) negative();
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
        if (delay) setTimeout(blurTop.bind("#Feedback"),delay);
        else blurTop("#Feedback");
      },
    },
    scroll: {
      pending: false,
      bar_width: () => window.innerWidth-$(window).width(),
    },
    viewport_dimensions: () => {
      var e = window;
      var a = 'inner';
      if (!('innerWidth' in window)){
          a = 'client';
          e = document.documentElement || document.body;
      }
      return { width: e[a+'Width'] - system.ui.scroll.bar_width(), height: e[a+'Height'] }
    },
    body_dimensions: () => {return {width: $('body').outerWidth(), height: $('body').outerHeight()}}
  },
  validation: {
    settings: {
      decode: (value) => {
        try {
          if (value.is_array()) return value;
          else if (typeof value == 'string') return value.toBool();
          else {
            //obj of Bool values to array of key names
            let array = [];
            for (let setting_name in value) {
              let val = value[setting_name].toBool();
              if (val) array.push(setting_name.addSpacesToKeyString());
            }
            return array;            
          }
        } catch (error) {
          log({error});
        }
        return value;
      },
      get: (settings_obj, string = null, fall_back = null) => {
        if (typeof settings_obj != 'object') throw new Error(`1st parameter must be object, ${typeof settings_obj} given`);
        if (typeof string != 'string' && string !== null) throw new Error(`2nd parameter must be string, ${typeof string} given`);
        if (!string) return settings_obj;
        let value = string.get_obj_val(settings_obj, true);
        return value != null ? system.validation.settings.decode(value) : fall_back;
      }
    },
    xhr: {
      headers: {
        list: () => {
          return {
            'X-Current-Tabs': JSON.stringify(tabs.list),
            'X-Current-Uids': JSON.stringify(uids.list),
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
          }
        },
        check: request => {
          let uidList = request.getResponseHeader('X-Current-Uids').json_if_valid(),
          tabList = request.getResponseHeader('X-Current-Tabs').json_if_valid(),
          csrf = request.getResponseHeader('X-CSRF-TOKEN'),
          unreadNotifications = request.getResponseHeader('X-Unread-Notifications').json_if_valid(),
          force_logout = request.getResponseHeader('X-FORCE-LOGOUT');
          // log({uidList,tabList,csrf,unreadNotifications});
          if (uidList) {
            if (uidList === 'null') uids.clear();
            else uids.set(uidList);
          }
          if (tabList) tabs.set(tabList);
          if (csrf) $('meta[name="csrf-token"]').attr('content',csrf);
          if (unreadNotifications) {
            if (unreadNotifications === 'send ajax') notifications.get.unread();
            else notifications.add(unreadNotifications);
          }
        },
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
            if (input.exists()) callback = function(){input.warn(`Update ${error.attr}`)}
          }
          log({error});
          feedback(error.header, error.message, callback);
          return true;
        }
      }
    },
    date: {
      datepick: {
        shorthand: {
          to_moment: (string) => {
            if (string == null) return null;
            let new_moment = moment();
            let dir = string.slice(0,1), n = string.slice(1,-1), unit = string.slice(-1);
            try{
              if (dir == '-') new_moment.subtract(n,unit).startOf('day');
              else new_moment.add(n,unit).endOf('day');
            }catch(error){
              log({error})
            }
            return new_moment;
          }
        }
      },
      comparison: (comparison_date, reference_date = null) => {
        if (!reference_date) reference_date = moment(); 
        return {
          is_same: comparison_date.isSame(reference_date),
          is_before: comparison_date.isBefore(reference_date),
          is_after: comparison_date.isAfter(reference_date),
        }
      },
      is_invalid: str => {
        let date = moment(str,'MM/DD/YYYY',true), invalid = (!date._isValid && str != '');
        return invalid;
      },
      is_in_range: (moment, min, max) => {

      },
    },
    json: data => {
      if (typeof data !== 'string'){return data;}
      try {
        var json = JSON.parse(data);
        if (json && typeof json === "object"){
          return json;
        }
      }catch (e) { 
        if (debug.level(1)) log({error:e,data:data},'jsonIfValid error');
      }
      return data;
    },
    boolean: (value, truthy_vals = ['true','yes'], falsey_vals = ['false','no ', 'no,']) => {
      if (value === true || value === false) return value;
      let is_true = truthy_vals.some(truthy => value.toLowerCase() === 'yes' || value.toLowerCase().includes(truthy.toLowerCase()));
      let is_false = falsey_vals.some(falsey => value.toLowerCase() === 'no' || value.toLowerCase().includes(falsey.toLowerCase()));
      return (!is_true && !is_false) ? value : is_true;
    },
    array: {
      join: (array, str = 'and', oxford = true) => {
        let response = '', arr = [...array];
        try{
          if (arr.length == 1) return arr[0];
          while (arr.length > 0) {
            if (arr.length == 1) response += `${str} ${arr.shift()}`;
            else response += `${arr.shift()}${(array.length == 2 || (arr.length == 1 && !oxford)) ? '':','} `;
          }
          return response;
        }catch(error){
          log({error});
        }
      },
    },
    input: {
      date: (input) => {
        input.allowKeys('0123456789/ ,');
        input.on('keydown',function(ev){
          let v = $(this).val(), l = v.length, k = ev.key;
          if (l == 0 & k == '/') ev.preventDefault();
          if (l == 1 & k == '/') $(this).val(`0${v}`);
          if (l == 3 & k == '/') ev.preventDefault();
          if (l == 4 & k == '/') $(this).val(`${v.slice(0,3)}0${v.slice(3,5)}`);
          if (l >= 6 & k == '/') ev.preventDefault();
          if (l >= 10 && !['Backspace','Tab'].includes(k) && !k.includes('Arrow') && !$(this).hasSelectedText()) ev.preventDefault();
        })
        input.on('keyup',function(ev){
          let v = $(this).val(), l = v.length, k = ev.key;
          if (k == 'Backspace') return;
          if (l == 2) $(this).val(`${v}/`);
          if (l == 5) $(this).val(`${v}/`);
        })
      },
      phone: (input) => {
        input.allowKeys('0123456789-() ');
        input.on('blur',function(){
          let val = input.val();
          val = val.replace(/[()\- ]/g, '');
          if (val.length < 10) {input.warn('Invalid phone number - too few digits'); return;}
          if (val.length > 10) {input.warn('Invalid phone number - too many digits'); return;}
          val = `(${val.substr(0,3)}) ${val.substr(3,3)}-${val.substr(6,4)}`;
          input.val(val);
        })
      },
      email: (input) => {
        input.on('blur',function(){
          let val = input.val();
          if (!val.match(/.*@.*\..*/)) input.warn('Invalid email');
        })
      },
      username: (input) => {
        input.allowKeys(/[a-zA-Z0-9_]/);
        input.on('blur',function(){
          let val = input.val();
          if (val.length < 5) input.warn('Must be at least 5 characters');
        })
      }
    },
    get_ele: selector => {
      let ele = $(selector);
      if (ele.dne()) throw new Error(`ele not found using ${selector}`);
      return ele;
    }
  },
  modals: {
    list: ['Confirm','Warn','Error','CheckmarkBlur','Feedback','Refresh','Notification','ErrorMessageFromClient','AutoSaveWrap'],
    reset: () => {
      let current = $("#ModalHome").children(), 
      removeThese = current.filter((m,modal) => !system.modals.list.includes($(modal).attr('id')));
      removeThese.remove();
    }
  },
  display: {
    initialize: () => {
      init('.flexbox.column',function(){
        let keys = $(this).find('.key'), values = $(this).find('.value'), width_max_k = 0, width_max_v = 0;
        keys.each(function(){let w = this.clientWidth; if (w > width_max_k) width_max_k = w;})
        values.each(function(){let w = this.clientWidth; if (w > width_max_v) width_max_v = w;})
        if (keys.exists()) keys.css({width:px_to_rem(width_max_k)});
        if (values.exists()) values.css({width:px_to_rem(width_max_v)});
      })
    },
    format: {
      readableJson: json => {
        return JSON.stringify(json)
        .replace(/(:|,)/g,'$& ')
        .replace(/\[\]/g,'[ ]')
        .replace(/\[\[/g,'[ [').replace(/\[\[/g,'[ [')
        .replace(/\]\]/g,'] ]').replace(/\]\]/g,'] ]')
        .replace(/\[\{/g,'[ {').replace(/\[\{/g,'[ {')
        .replace(/\]\}/g,'] }').replace(/\}\]/g,'] }');
      },
    },
    size: {
      font: {
        get_root: () => {return system.display.size.font.get_ele_font_size('body')},
        get_ele_font_size: (selector) => {return Number(system.validation.get_ele(selector).css('font-size').split("px")[0])},
      },
      width: {
        fix: ele => {
          try {
            ele = $(ele);
            if (ele.dne()) throw new Error('element not found');
            let w = ele.outerWidth();
            ele.css({width:px_to_rem(w)});
          } catch (error) {
            log({error});
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
    }
  },
  warn: (options = {}) => {
    try{
      let string = ifu(options.string, 'warning'),
        ele = ifu(options.ele, null),
        position = ifu(options.position, 'above'),
        time = ifu(options.time, 2000),
        callback = ifu(options.callback, null),
        no_message = options.no_message || false;

      ele = $(ele);
      if (!ele || ele.dne()) {log({ele}, 'no elements selected'); alert('no elements selected'); return;}
      else if (ele.length > 1) {
        ele.each((e,el) => {
          if (e > 0) system.warn(options.merge({ele:el,no_message:true}));
        });
        ele = ele.first();
      }


      let warning = $(`<div/>`,{
        css: {
          position: 'absolute', backgroundColor: 'white', color: 'var(--pink)', boxShadow: '0 0 5px 5px var(--pink70)', fontWeight: '700', padding: '0.2em 0.5em', borderRadius: '4px', border: '1px solid var(--pink)', opacity: '0', zIndex: 99
        },
        html: string,
      })
      let css = {}, ele_box = ele[0].getBoundingClientRect(), ele_x = ele_box.x, ele_h = ele_box.height, ele_offset = ele.offset(),warning_box = warning[0].getBoundingClientRect(), warning_x = warning_box.x, warning_h = warning_box.height, warning_offset = warning.offset(), diff_x = ele_x - warning_x, diff_x_abs = Math.abs(ele_x - warning_x);
      if (position == 'above') css = {position: 'fixed', left: ele_box.x, top: ele_box.y, transform: 'translateY(-120%)'};
      else {
        log({position}, `position not defined: ${position}`);
        alert(`position not defined: ${position}`);
        return;
      }
      if (!no_message) warning.appendTo('body').css(css).slideFadeIn();

      if (ele.is('input, textarea, select, ul')) ele.addClass('borderFlash');
      if (time != null) {
        setTimeout(function(){
          warning.slideFadeOut(1000, function(){warning.remove();});
          ele.removeClass('borderFlash');
          if (callback && typeof callback == 'function') callback();
        }, time + 400);      
      }else {
        warning.on('click',function(){$(this).slideFadeOut(function(){$(this).remove()})})
      }
    }catch(error) {

    }
  },
};

const class_map_all = {};
$(document).ready(function(){class_map_all.merge({system,menu,notifications})})

const user = system.user;
const initialize = system.initialize;
const modal = system.blur.modal;
const get_rem_px = system.display.size.font.get_root;
const fix_width = system.display.size.width.fix;
const body = () => system.ui.body_dimensions();
const view = () => system.ui.viewport_dimensions();
const px_to_rem = px => system.display.size.px_to_rem(px);
const rem_to_px = rem => system.display.size.rem_to_px(rem);
const blur = (ele, modal, options = {}) => system.blur.element({ele:ele,modal:modal}.merge(options));
const blurInstant = (ele, modal) => system.blur.element({ele:ele,modal:modal,time:0});
const blurTop = (modal, options = {}) => system.blur.topmost(modal, options);
const blurTopGet = () => system.blur.block.top();
const unblur = (options = {}) => {
  let repeat = typeof options == 'number' ? options : options.repeat || null;
  if (typeof options != 'object') options = {};
  let callback = options.callback || null,
    delay = options.delay || 400,
    fade = options.fade || null,
    ele = options.ele || null;
  system.blur.undo({callback,delay,fade,repeat,ele});
}
const unblurAll = (options = {}) => {
  let callback = options.callback || null,
  delay = options.delay || 400,
  fade = options.fade || null;
  system.blur.undoAll({callback,delay,fade});
}
const feedback = (header, message, delay = null, callback = null) => {
  if (typeof delay == 'function') {
    callback = delay;
    delay = null;
  }
  system.ui.feedback.display(header, message, delay, callback);
}
const confirm = settings => system.ui.confirm.prompt(settings);
const init = function(ele, fx){
  if (debug.level(1)) log({ele}, typeof ele == 'string' ? ele : 'jquery obj');
  if (Array.isArray(ele)) {
    ele.forEach(function(params){
      if (params.length == 2) init(params[0],params[1]);
      else if (params.length === 3) initAlt(params[0],params[1],params[2]);
    })
  }
  else {
    if (typeof fx != 'function') log({error:{ele,fx}},'invalid initialization function, consider initAlt()');
    system.initialize.ele({select:ele,function:fx})
  };
}
const initAlt = (ele, attr, fx) => system.initialize.ele({select:ele,function:fx,dataAttr:attr});
const toBool = (val, true_if_contains) => system.validation.boolean(val, true_if_contains);
const get_setting = (obj, string, fall_back) => system.validation.settings.get(obj,string,fall_back);

const uids = {
  list: {},
  set: function(model, uid = null){
    if (!user.current) return;
    if (typeof model == 'string') uids.list[model] = uid ? Number(uid) : null;
    else $.each(model,function(key, value){uids.set(key, value);});
  },
  get: function(model){
    if (!user.current) return;
    return (uids.list[model] != undefined) ? uids.list[model] : null;
  },
  clear: function(){uids.list = {}},
  log: function(){console.log(uids.list)}
};
const practice = {
  info: null,
  set: function(practiceData){
    if (Object.isFrozen(practice)) return;
    practice.info = practiceData;
    moment.tz.setDefault(practice.info.tz.replace(/ /g,'_'));
    Object.freeze(practice);
  },
  get: function(key){
    if (!practice.info) log({error:'practice info not set'});
    return (practice.info[key] != undefined) ? practice.info[key] : null;
  }
}
const notifications = system.notifications;
// const const_map = {};

$(document).ready(function(){
  let tabList = $("#NavBar").data('initialtabs'),
  userInfo = $("#NavBar").data('user'),
  practiceInfo = $("#NavBar").data('practiceinfo');

  if (tabList) tabs.set(tabList);
  if (userInfo) user.set(userInfo);
  if (practiceInfo) practice.set(practiceInfo);
  initialize.newContent();
  // const_map = {user,menu,model};
})

var systemModalList = ['Confirm','Warn','Error','Feedback','Refresh','Notification','ErrorMessageFromClient','AutoSaveWrap'],
systemModals = $('#Confirm, #Warn, #Error, #Feedback, #Refresh, #Notification, #ErrorMessageFromClient, #AutoSaveWrap'), usertype,
defaultTemplateInfo;

(function($) {
  $.sanitize = function(input) {
    var output = input.replace(/<script[^>]*?>.*?<\/script>/gi, '').
    replace(/<[\/\!]*?[^<>]*?>/gi, '').
    replace(/<style[^>]*?>.*?<\/style>/gi, '').
    replace(/<![\s\S]*?--[ \t\n\r]*>/gi, '');
    return output;
  };
})(jQuery);

function slideFadeOut(elem, time = 400, callback = null) {
  let t = "opacity "+time+"ms", fade = {opacity: 0, transition: t};
  elem.css(fade).delay(100).slideUp(time);

  if (callback && typeof callback == 'function') setTimeout(callback,time+101);
}
function slideFadeIn(elem, time = 400, callback = null){
  let t = "opacity "+time+"ms", solid = {opacity: 1, transition: t};
  elem.css("opacity","0");
  elem.slideDown(time).delay(100).css(solid);

  if (callback && typeof callback == 'function') setTimeout(callback,time+101);
}

$.fn.getObj = function(type = null, include_parents = true) {
  let obj = null;
  try {
    if (type) {
      let this_obj = $(this).data('class_obj');
      if (this_obj != undefined && $(this).is(`.${type}`)) obj = this_obj;
      else if (include_parents) {
        let ele = $(this).closest(`.${type}`);
        while (ele.exists()) {
          let ele_obj = ele.data('class_obj');
          if (ele_obj) {obj = ele_obj; break;}
          ele = ele.closest(`.${type}`);
        }
      }
    }else {
      if (this.data('class_obj') != undefined) obj = this.data('class_obj');
      else if (include_parents) {
        let parents = this.parents();
        parents.each((p,parent) => {
          if ($(parent).data('class_obj') != undefined) {
            obj = $(parent).data('class_obj');
            return false;
          }
        })
      }
    }
    if (!obj) throw new Error('class_obj not found');
  }catch (error) {
    log ({error,ele:this});
  }
  return obj;
}
$.fn.fixWidth = function() {
  this.each((e,ele) => fix_width(ele));
  return this;
}
$.fn.addHoverClassToggle = function () {
  this.hover(function(){$(this).addClass('hover')},function(){$(this).removeClass('hover')});
  return this;
}
$.fn.addOpacityHover = function () {
  let initial = $(this).css('opacity');
  $(this).data('opacity_initial',initial);
  this.on('mouseenter',function(){$(this).animate({opacity:1})}).on('mouseleave',function(){$(this).animate({opacity:$(this).data('opacity_initial')})});
};
$.fn.slideFadeOut = function (time = 400, callback = null) {
  if (typeof time === 'function'){ callback = time; time = 400; }
  if (callback && typeof callback == 'function') slideFadeOut(this, time, callback.bind(this));
  else slideFadeOut(this, time, null);
  return this;
};
$.fn.slideFadeIn = function (time = 400, callback = null) {
  if (typeof time == 'function'){ callback = time; time = 400; }
  if (callback && typeof callback == 'function') slideFadeIn(this, time, callback.bind(this));
  else slideFadeIn(this, time, null);
  return this;
};
$.fn.slideFadeToggle = function (time = 400, callback = null){
  if (typeof time == 'function'){
    callback = time;
    time = 400;
  }
  if (this.is(':visible')) this.slideFadeOut(time, callback);
  else this.slideFadeIn(time, callback);
}
$.fn.isVisible = function(padding = 15) {
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
    ele_box, parent_box: {top,left,bottom,right}, parent: parent_blur ? parent_blur : 'window',
  }
  return is_visible;
}
$.fn.getTopOffset = function (offset = 0) {
  if (this.is('.tooltip')) return offset;
  let parent = this.isInside('.blur') ? this.closest('.blur').children().first() : null;
  if (parent) offset += parent[0].getBoundingClientRect().top;
  else{
    offset += 30;
    let bars = $("#NavBar").add('.menuBar').not('.siteMenu');
    bars.each((b,bar) => offset += $(bar).outerHeight());
  }
  // log({offset});
  return offset;  
}
$.fn.smartScroll = function (settings = {}) {
  let duration = settings.duration || 1000,
  callback = settings.callback || null,
  offset = settings.offset || 0;
  let ele = this.isInside('.blur') ? this.closest('.blur').children().first() : null;
  delete settings.callback;
  delete settings.duration;
  let is_visible = this.isVisible(offset);
  offset += this.getTopOffset();
  settings.offset =  -offset;
  // log({is_visible,offset});
  if (is_visible.top) {
    if (callback && typeof callback == 'function') callback();
  } else {
    if (!system.ui.scroll.pending) {
      if (ele) ele.scrollTo(this[0], duration, settings);
      else $.scrollTo(this, duration, settings);
      system.ui.scroll.pending = true;
      setTimeout(function(){system.ui.scroll.pending = false}, duration);
    }
    if (callback && typeof callback == 'function') setTimeout(callback, duration);
  }
}
$.fn.warn = function (string = 'warning', options = {}){
  system.warn({
    ele: this,
    string: string,
    position: ifu(options.position, 'above'),
    time: ifu(options.time, 2000),
    callback: ifu(options.callback, null),
  });
  return this;
}
$.fn.allowKeys = function (values) {system.ui.keyboard.allow_these_keys(this, values)}
$.fn.disallowKeys = function (values) {system.ui.keyboard.disallow_these_keys(this, values)}
$.fn.toBool = function (true_if_contains = 'yes') {
  return toBool(this.verify(), true_if_contains);
}
$.fn.resetActives = function (){
  this.find('.active').removeClass('active');
  return this;
}
$.fn.resetClass = function (className){
  this.find(`.${className}`).removeClass(className);
  return this;
}
$.fn.hasSelectedText = function () {return this[0].selectionStart != this[0].selectionEnd;}
$.fn.verify = function(string = null){
  try{
    if (this.length > 1) throw new Error('too many elements to verify');
    let class_obj = this.closest('.answer, .item, .section, .form').data('class_obj');
    if (!class_obj) throw new Error('ele does not have class_obj');
    if (typeof class_obj.verify == 'function') return class_obj.verify(string);
    else throw new Error('class_obj does not have verify');
  }catch(error){
    log({error})
  }
}
$.fn.set = function (value = null) {
  try{
    if (this.length > 1) {
      this.each((e,ele) => {$(ele).set(value)})
      return;
    }
    let class_obj = this.data('class_obj');
    if (!class_obj) throw new Error('ele does not have class_obj');
    if (class_obj instanceof Answer) {
      class_obj.value = value;
    }
  }catch(error){
    if (debug.level(1)) log({error});
  }
}
$.fn.findAnswer = function (options) {
  return Answer.find(Answer.get_all_within(this,false),options);
}
$.fn.answersAsObj = function () {
  return forms.response.all_answers_as_obj(this);
}
$.fn.exists = function(){
  return this != undefined && this.length > 0;
}
$.fn.dne = function(){
  return this.length == 0;
}
$.fn.isSolo = function(){
  return this.exists() && this.length === 1;
}
$.fn.isInside = function(selector){
  if (typeof selector != 'string') throw new Error(`Selector must be string, ${typeof selector} given`);
  // log({selector,ele:this.closest(selector)});
  return this.closest(selector).exists();
}
$.fn.appendKeyValuePair = function (key,value) {
  $(this).append($("<div class='label'>"+key+"</div><div class='value'>"+value+"</div>"))
  return this;
};

Object.defineProperties(Array.prototype, {
  isSolo: {value: function(){return this.length === 1}},
  isEmpty: {value: function(){return this.length === 0}},
  notEmpty: {value: function(){return this.length > 0}},
  notSolo: {value: function(){return this.length > 1}},
  smartJoin: {value: function(str = 'and', oxford = true){return system.validation.array.join(this,str,oxford)}},
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
  }},
  slideFadeIn: {value: function(time,callback){
    if (this.ele) return this.ele.slideFadeIn(time,callback);
    else log({obj:this, error: new Error('no ele found in object')});
  }},
  slideFadeToggle: {value: function(time,callback){
    if (this.ele) return this.ele.slideFadeToggle(time,callback);
    else log({obj:this, error: new Error('no ele found in object')});
  }},
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
      if (this.hasOwnProperty(key)) wrapper.append(`<div><b style='padding-right:5px'>${key}:</b><span>${this[key]}</span></div>`);
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
  duplicate: {value: function(){ return {}.merge(this) }},
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
    return new class_map_all[this](attr_list);
  }},
  get_obj_val: {value: function(obj = null, ok_if_missing = false){
    let split = this.valueOf().split('.'), obj_val = null;
    try{
      let first = split.shift();
      obj_val = obj ? obj[first] : class_map_all[first] || system[first] || window[first];
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

$.fn.sortEle = function sortEle(selector = "div", attr = 'index') {
  $("> "+selector, this[0]).each((e,ele) => {log({e,ele})}).sort(dec_sort).appendTo(this[0]);
  function dec_sort(a, b){ return ($(b).data(attr)) < ($(a).data(attr)) ? 1 : -1; }
}

function commaSeparated (arr, quotes = false) {
  if (quotes){
    $.each(arr,function(a,item){
      arr[a] = "'"+arr[a]+"'";
    });
  }
  var last = arr.pop();
  if (arr.length == 0){
    return last;    
  }else if (arr.length == 1){
    return arr.join(', ') + ' and ' + last;    
  }else{
    return arr.join(', ') + ', and ' + last;
  }
}

function chkStrForArrayElement(yourstring,substrings){
  var length = substrings.length;
  while(length--) {
    if (yourstring.indexOf(substrings[length])!=-1) {
      return true;
    }
  }
  return false;
}
function randomArrayElement(array){
  return array[Math.floor(Math.random() * array.length)];
}
function randomArrayElements(array,number){
  var count = array.length, newArray = [], newEle = null;
  if (number > count){
    alert('cannot select '+number+" elements from an array of "+count+" items");
    return false;
  }
  do {
    newEle = randomArrayElement(array);
    if ($.inArray(newEle, array) === -1){
      newArray.push(newEle);
    }
  } while (newArray.length < number);
}
function findObjKey(obj,value){
  for (var key in obj){
    console.log(obj,key,value);
    if (obj[key] === value){
      return key;
    }
  }
  return null;
}
function toTitleCase(str) {
  return str.replace(/(?:^|\s)\w/g, function(match) {
    return match.toUpperCase();
  });
}

var uidList, tabList, tabHeaderInfo = {};
var SystemModalBtnFlash;
$.ajaxSetup({headers:system.validation.xhr.headers.list(),dataFilter:data=>data.trim()});
$(document).ajaxError(function(ev,xhr,settings,error){
  system.request.check_headers(xhr,settings,ev);  
  if (error !== 'abort'){
    log({ev,xhr,settings,error},`ajax error`);
    var status = xhr.status,
    message = (xhr.responseJSON != undefined) ? xhr.responseJSON.message : error,
    modal = "#Error";

    if ($.inArray(status, [419, 401]) > -1){
      system.request.force_logout(true);
    }else if (status === 404){
      $(modal).find('.message').html("<h2>Not Found</h2><div>The content you asked for is not available</div>");
      $(modal).find(".submit").data('error',xhr);
      blurTop(modal);
    }else if (status == 422){
      if ($("#Feedback").length == 0){
        $("<div/>",{
          id: "Feedback",
          class:'prompt',
          html: "<div class='message'></div><div class='options'><div class='button small cancel'>dismiss</div></div>"
        }).appendTo("#ModalHome");                
      }
      var msg = $("#Feedback").find(".message");
      errorJson = xhr.responseJSON;
      msg.html("");
      $("<h2>Login Error</h2><div class='split3366KeyValues'></div>").appendTo(msg);
      $.each(errorJson.errors, function(key,value){
        $("<div class='label'>"+key+"</div><div class='value'>"+value+"</div>").appendTo(msg.find(".split3366KeyValues"));
      });
      blurTop("#Feedback");
    }else{
      $(modal).find(".submit").data('error',xhr);
      $(modal).find(".message").html("<h2>Error</h2><div>"+message+"</div>");
      blurTop(modal);
    }
    var btn = $(modal).find(".submit");
    SystemModalBtnFlash = setInterval(function(){
      btn.toggleClass("pink70 pink");
    },500);
  }
}).ajaxSuccess(function(ev,xhr,settings){
  system.request.check_headers(xhr,settings,ev);
});


function submitErrorReport(){
  console.log($("#Error").find(".submit").data('error'));
}
function updateUidList(uidList = null){
  if (uidList){
    $("#uidList").text(uidList);
  }else{
    $.ajax({
      url:"/getvar",
      method:"POST",
      data:{
        "getVar":"uidList"
      },
      success:function(data){
        $("#uidList").text(data);
      }
    })

  }
}
function setUid(model, uid){
  try{
    uidList = JSON.parse($("#uidList").text());
    if (uidList == null){uidList = {};};
  }catch(e){
    uidList = {};
  }
  uidList[model] = uid;
  $("#uidList").text(JSON.stringify(uidList));
}
function getUids(model = null){
  try{
    var uidList = JSON.parse($("#uidList").text());
    if (uidList == null){return null;}
    else if (model == null){return uidList;}
    else if (uidList[model] == undefined){return null;}
    else{return uidList[model];}        
  }catch(e){
    return null;
  }
}

var defaultCSS = {
  "item": {
    "inline":"false"
  },
  'section': {
    'displayNumbers':"false"
  }
};
function getDefaultCSS(type){
  return defaultCSS[type];
}
function formatDate(jsDateObj) {
  var day = jsDateObj.getDate(), monthIndex = jsDateObj.getMonth() +1, year = jsDateObj.getFullYear();
  return monthIndex + "/"+ day + '/' + year;
}
function formatTime(jsDateObj){
  var hour = jsDateObj.getHours(), mins = jsDateObj.getMinutes(), meridian = (hour - 11 > 0) ? "pm" : "am";
  if (mins == "0"){mins = "00";}
  if (hour > 12){hour = hour - 12;}
  return hour + ":" + mins + meridian;
}



// EMAIL PHONE USERNAME FUNCTIONS
function validateUsername(){
// console.log("HI");
var i = $(this);
var val = i.val();
var m = val.match(/[^a-zA-Z0-9._\-]/);
val = val.replace(/[^a-zA-Z0-9._\-]/g,"");
if (i.val()!=val){
  i.off("keyup",validateUsername);
  i.val(val);
  var alertStr = (m == " ") ? "no spaces allowed" : m + " is not allowed";
  alertBox(alertStr,i,"after",800);
  setTimeout(function(){
    i.on("keyup",validateUsername);
  },801)
}
}
function finalizeUsername(i){
  var val = i.val();
  if (val.length !=0 && (val.length < 5 || val.length > 15)){
    i.off("focusout",finalizeUsername);
    alertBox('must be between 5 and 15 characters',i,"after",800);
    scrollToInvalidItem(i);
    return false;
  }
  return true;
}
function validateEmail(){
  var val = $(this).val(), i = $(this);
  var m = val.match(/[^a-zA-Z0-9@._\-]/);
  val = val.replace(/[^a-zA-Z0-9@._\-]/g,"");
  if ($(this).val()!=val){
    i.off("keyup",validateEmail);
    $(this).val(val);
    alertBox(m+" is an invalid character",$(this),"after",800);
    setTimeout(function(){
      i.on("keyup",validateEmail);
    },801)
  }
}
function finalizeEmail(i){
  var val = i.val();
  var pattern = /[a-zA-Z0-9._\-]*@[a-zA-Z0-9._\-]*\.[a-zA-Z0-9.]*/;
  if (!pattern.test(val)){
    scrollToInvalidItem(i);
    alertBox('enter a valid email',i,"after",800);
    return false;
  }
  return true;
}
function validatePhone(){
  var i = $(this), val = i.val();
  var m = val.match(/[^0-9.()-]/);
  val = val.replace(/[^0-9.()-]/g,"");
  if ($(this).val()!=val){
    i.off("keyup",validatePhone);
    $(this).val(val);
    alertBox("numbers only",$(this),"after",800);
    setTimeout(function(){
      i.on("keyup",validatePhone);
    },801)
  }
}
function finalizePhone(i){
  var val = i.val();
  var digits = val.match(/\d/g);
  if (digits != null && digits.length!=10){
    scrollToInvalidItem(i);
    alertBox("invalid phone number",i,"after",800);
    return false;
  }else if (digits != null){
    var ph = digits[0]+digits[1]+digits[2]+"-"+digits[3]+digits[4]+digits[5]+"-"+digits[6]+digits[7]+digits[8]+digits[9];
    i.val(ph);
    return true;
  }else{
    alertBox("required",i,"after",800);
    return false;
  }
}
function checkPasswordStrength(i){
  var pw = i.val(), errors = [];
  if (!/[a-z]/.test(pw)){
    errors.push('Password must contain a lower case letter.');
  }
  if (!/[A-Z]/.test(pw)){
    errors.push('Password must contain an upper case letter.');
  }
  if (!/[0-9]/.test(pw)){
    errors.push('Password must contain a number.');
  }
  if (pw.length < 5){
    errors.push('Password must be at least 6 characters.');
  }
  if (errors.length == 0){
    return true;
  }else{
    str = errors.join("<br>");
    feedback("Attention",str);
    return false;
  }
}

// function feedback(header, message, delay = null){
//   header = $(`<h2>${header}</h2>`)
//   if (message instanceof jQuery) message = message;
//   else if (typeof message == 'string') message = $(`<div>${message}</div>`);
//   $("#Feedback").find('.message').html('').append(header).append(message);

//   if (delay != null){
//     setTimeout(function(){
//       blurTopMost("#Feedback");            
//     },delay);
//   }else{
//     blurTopMost("#Feedback");   
//   }
// }
var confirmInterval = null;
// function confirm(header, message, yesText = null, noText = null, delay = null, affirmative = null, negative = null){
//   confirmBool = undefined;
//   if (typeof delay == 'function'){
//     negative = affirmative;
//     affirmative = delay;
//     delay = null;
//   }
//   header = $(`<h2 class='purple'>${header}</h2>`);
//   if (message instanceof jQuery) message = message;
//   else if (typeof message == 'string') message = $(`<div>${message}</div>`);
//   $("#Confirm").find('.message').html('').append(header).append(message);
//   if (yesText){$("#Confirm").find(".confirmY").text(yesText);}
//   else{$("#Confirm").find(".confirmY").text("confirm");}
//   if (noText){$("#Confirm").find(".confirmN").text(noText);}
//   else{$("#Confirm").find(".confirmN").text("cancel");}

//   if (delay != null){
//     setTimeout(function(){
//       blurTopMost("#Confirm");            
//     },delay);
//   }else{
//     blurTopMost("#Confirm");   
//   }
//   // if (!affirmative || typeof affirmative != 'function') return;
//   confirmInterval = setInterval(function(){
//     if (confirmBool != undefined){
//       clearInterval(confirmInterval);
//       if (confirmBool === true && typeof affirmative == 'function'){
//         affirmative();
//       }else if (confirmBool === false && typeof negative == 'function'){
//         negative();
//       }
//       confirmBool = undefined;
//     }
//   },100)
// }
// async function confirm(settings){
//   if (typeof settings != 'object'){
//     feedback('old funx','trying to use confirm');
//     log({error:'using old confirm'},'old confirm');
//     return;
//   }
//   let header = settings.header || 'Confirm',
//   message = settings.message || 'Confirming something but no message given',
//   btntext_yes = settings.btntext_yes || 'confirm',
//   btntext_no = settings.btntext_no || 'cancel',
//   delay = settings.delay || null,
//   callback_affirmative = settings.callback_affirmative || null,
//   callback_negative = settings.callback_negative || null,
//   modal = $("#Confirm");
//   if (typeof header == 'string') header = $(`<h2 class='purple'>${header}</h2>`);
//   if (typeof message == 'string') message = $(`<div>${message}</div>`);
//   modal.find('.message').html("").append(header).append(message);
//   modal.find('.confirmY').text(btntext_yes);
//   modal.find('.confirmN').text(btntext_no);
//   blurTopMost("#Confirm");
//   let confirmed = await new Promise((resolve,reject) => {
//     modal.on('click','.confirmY',function(){resolve(true)});
//     modal.on('click','.confirmN',function(){resolve(false)});
//     setTimeout(function(){
//       reject('Please confirm or cancel');
//     },10000)
//   });
//   log({confirmed});
//   if (delay){
//     setTimeout(handleConfirmCallback.bind(null,confirmed,callback_affirmative,callback_negative),delay);
//   }else{
//     handleConfirmCallback(confirmed,callback_affirmative,callback_negative);
//   }
// }
// function handleConfirmCallback(confirmed, affirmative, negative){
//   if (confirmed && affirmative) affirmative();
//   else if (!confirmed && negative) negative();
// }

function alertBox(message, ele, where = 'below', time = 1500, offset = null){
  var hEle = ele.outerHeight(), wEle = ele.outerWidth(), wrap, wAlert, hAlert, readonly = ele.attr('readonly'), css;
  if (ele.parent().is('.number')) hEle = ele.parent().outerHeight();
  if (ele.is('.radio, .checkboxes')){
    console.log(hEle);
// time = 'nofade';
}
if (time=="nofade"){
  wrap = $('<span class="zeroWrap a"><span class="alert">'+message+'</span></span>');
  time = 2000;
}else{
  wrap = $('<span class="zeroWrap a f"><span class="alert f">'+message+'</span></span>');
}

if ($.inArray(ele.css('position'), ['fixed','absolute','relative']) == -1){
  ele.css('position','relative');
}
wrap.appendTo("body");
wAlert = wrap.find('.alert').outerWidth();
hAlert = wrap.find('.alert').outerHeight();
if (where=="after"){
  wrap.insertBefore(ele);
  css = {top:0.5*hEle,left:wEle+5};
}else if (where=="ontop"){
  wrap.appendTo(ele);
  css = {top:0.5*hEle,left:0.5*wEle-0.5*wAlert};
}else if (where=="before"){
  wrap.insertBefore(ele);
  css = {top:0.5*hEle,left:-wAlert-5};
}else if (where=="above"){
  wrap.insertBefore(ele);
  css = {left:0.5*wEle,top:-hAlert-5};
}else if (where=="below"){
  wrap.insertBefore(ele);
  css = {left:0.5*wEle,bottom:-1.05*hAlert};
}
console.log(where,ele,css);

wrap.css(css);

if (offset!==null){
  $(".alert").css("transform","translate("+offset+")");
}

// if (ele.is('ul')){
// var bgColor = (ele.data('bgColor') != undefined) ? ele.data('bgColor') : ele.css('background-color');
// ele.data('bgColor',bgColor);
// ele.css('background-color','rgb(234,78,80)');
// setTimeout(function(){
//     ele.css("background-color",bgColor);
// },time)
// }else{
  var borderColor = (ele.data('borderColor') != undefined) ? ele.data('borderColor') : ele.css('border-color');
  ele.data('borderColor',borderColor);
  ele.css("border-color","rgb(234,78,80)").attr("readonly","true");
  setTimeout(function(){
    ele.css("border-color",borderColor);
    if (readonly != undefined){
      ele.attr('readonly',readonly);
    }else{
      ele.removeAttr("readonly");
      ele.focus();
    }
  },time)
// }

setTimeout(function(){
  $(".zeroWrap.a.f, .alert.f").slideFadeOut(600,function(){$(".zeroWrap.a.f, .alert.f").remove();})
},time)

}
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

$(document).keyup(function(e){
  if (e.keyCode === 27 && $('.blur').exists()) unblur();
})
$(document).on('click','.blur',function(ev){
  let target = $(ev.target), is_blur = target.is('.blur'), is_clickable = target.children('.checkmark, .loading').dne();
  if (is_blur && is_clickable) unblur({fade:400});
})

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


// function highlightRow(){
//     if ($(this).find("th").length==0){
//         $(this).addClass("hover");
//     }
// }
// function reverseHighlight(){
//     $(this).removeClass("hover");
// }
// function stylizeTables(){
//     var tables = $(document).find(".styledTable").filter(function(){
//         return $(this).data("styled") == undefined;
//     });
//     tables.wrap("<div class='tableWrapper'/>");
//     tables.filter(".clickable").find("tr").not(".head").hover(highlightRow,reverseHighlight);
//     tables.each(function(){
//         if ($(this).hasClass('hideOverflow')){
//             var t = $(this).closest(".tableWrapper"), h = $(this).data('maxheight');
//             t.addClass('manageOverflow').data("maxHeight",h);
//             $("<div/>",{
//                 class:"showOverflow",
//                 text:"show all matches"
//             }).appendTo(t);
//         }
//     })
//     tables.data('styled',true);
// }

function animateWidthChange(elem){
  var w1 = elem.scrollWidth, w2 = $(elem).innerWidth(), w3;
  $(elem).css({
    "width":w2,
    "overflow":"hidden"
  });
  var wait = setInterval(function(){
    w3 = elem.scrollWidth;
    console.log(w1+" "+w2+" "+w3);
    if (w3!=w1){
      clearInterval(wait);
      $(elem).animate({"width":w3},800,function(){
        $(elem).css({
          "width":"auto",
          "oveflow":"auto"
        })
      })
    }
  },100)
  console.log('finish')
  ;}
  function wrapAndCenter(item){
    if ($(item).is(".optionsNav.hide")){
      $(item).wrap("<div class='wrapper' style='display:none'/>");
    }else{
      $(item).wrap("<div class='wrapper'/>");
    }
  }

// function filterTableList(table){
//     $(".styledTable").removeClass("active");
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
function checkMatches(){
  var table = $(".styledTable").filter(".active");
  var filterCount = $(".filter").filter(function(){
    return table.is($(this).data("target")) && $(this).hasClass("active") && $(this).data('filter') != 'hide';
  }).length;

  var noMatch = table.find("tr").filter(".noMatch"),
  AllRows = table.find("tr").not('.head').not(noMatch);

// DETERMINE AND SHOW MATCHES, HIDE THE REST
AllRows.each(function(){
  var currentMarks = $(this).find("mark").length, previousMarks = $(this).data("marks"), currentMatches = $(this).data("match");
  if (currentMarks > previousMarks){
    $(this).data('marks',currentMarks);
    $(this).data('match',currentMatches+1);
  }
  if ($(this).data('match')==filterCount){
    $(this).removeClass("hide").addClass("match");
  }else{
    $(this).addClass("hide").removeClass("match");
  }
// console.log($(this).data());
})
}
function checkHorizontalTableFit(table){
  table.find("td, th").show();
  var hideOrder = table.data("hideorder").split(",");
  hideOrder.forEach(function(column,c){
    if (table.parent()[0].scrollWidth > table.parent()[0].clientWidth + 1){
      table.find("."+column).hide();
    }
  })
  table.find(".tdSizeControl").filter(":visible").each(function(){
    var h1 = $(this)[0].scrollHeight, h2 = $(this).height();
    if (h1 > h2){
      $(this).find(".indicator").show();
    }else{
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
//         $(".styledTable").each(function(i,t){
//             if ($(t).data("hideorder")!=undefined){
//                 checkHorizontalTableFit($(t));
//             }
//         })
//         tableCheck = undefined;
//     },500)
// }
function clearTableFilters(){
  if ($(this).hasClass('disabled')){return false;}
  var t = $(this).data("target");
// console.log(t);
$(".filter").filter("[data-target='"+t+"']").find(".tableSearch").val("").keyup();
$(".filter").filter("[data-target='"+t+"']").find(".tableFilter").each(function(){
  if ($(this).is(":checked")){
    $(this).click();
  }
})
alternateRowColor($(t));
}

function resetOptionsNavBtns(){
  $(".optionsNav").off("click",".button",optionsNavBtnClick);
  $(".optionsNav").on("click",".button",optionsNavBtnClick);
}

function masterStyle(){
// resetOptionsNavBtns();
$(".wrapMe").filter(function(){return !$(this).parent().is(".wrapper");}).each(function(){
  wrapAndCenter($(this));
})
// allowButtonFocus();
// stylizeTables();
$(".manageOverflow").each(function(i,ele){checkOverflow(ele);})
// $("#scrollToBtm").on("click", function(){$.scrollTo("max");})
// $(".modalForm").each(function(){
//   if ($(this).find(".cancel").length==0){
//     $("<div class='cancel button small'>dismiss</div>").appendTo($(this));
//   }
// })
// $(".modalLink").off("click",modalLinkClk);
// $(".modalLink").on("click",modalLinkClk);
}

function informational(){
  var info = $($(this).data('target'));
  if (info.find(".cancel").length == 0){
    $("<div/>",{
      class: "cancel",
      text: "dismiss"
    }).appendTo(info);
  }
  if (info.closest("#Block").length > 0){
    blurModal($("#Block").children().first(),)
  }else{
    blurElement($("#body"),info);
  }
}

var confirmBool=undefined;
$(document).on('click',".confirmY",function(){
  confirmBool = true;
})    
$(document).on('click',".confirmN",function(){
  confirmBool = false;
})   
// function warn(target,where,offset,customText=""){
//     customText = (customText != '') ? " "+customText : "";
//     var str = "<span class='confirmQ'>are you sure"+customText+"? this cannot be undone</span> <span class='confirmY'>yes</span><span class='confirmN'>no</span>";
//     alertBox(str,target,where,"nofade",offset);
// }

function SecurityReset(elem,value){
  blurModal(elem,"#loading");
  console.log(value);
  $.ajax({
    url:"/php/launchpad/practitioner/security-reset.php",
    method:"POST",
    data:{
      SecurityReset:value
    },
    success:function(data){
//console.log(data);
if (data){
  blurModal(elem,"#checkmark");
  setTimeout(function(){
    unblurElem($("body"));
  },1000)
//  console.log("SUCCESS");
}else{
//console.log("FAIL");
}
}
})

}

$(window).on("resize",resizeElements);
var splits = $(".split50, .split60, .split40"), leftOnly = splits.find(".leftOnly"), rightOnly = splits.find(".rightOnly");
function resizeSplits(){
  var bodyWidth = $("body").outerWidth();
  if (bodyWidth < 700){
    splits.addClass("break");
    leftOnly.removeClass('leftOnly');
    rightOnly.removeClass('rightOnly');
  }else{
    splits.removeClass("break");
    leftOnly.addClass('leftOnly');
    rightOnly.addClass('rightOnly');
  }
}
function resizeFcCalendar(view){
  $(".fc-toolbar").each(function(){
    var toolbar = $(this), fullCal = toolbar.closest('.fc'), w = toolbar.width(), em = getEm(), realWidth = toolbar[0].scrollWidth, wLeft = toolbar.find('.fc-left')[0].scrollWidth, wCenter = toolbar.find('.fc-center')[0].scrollWidth, wRight = toolbar.find('.fc-right')[0].scrollWidth, wTotal = wLeft + wCenter + wRight, changed = false;
    if(toolbar.find('.fc-center').html() == ""){toolbar.find('.fc-center').css({padding:"0 1em"})}
      while (realWidth - w > 1){
        fullCal.css({fontSize:"-=0.05em"});
        w = toolbar.width(); realWidth = toolbar[0].scrollWidth;
        changed = true;
      }
      while (wTotal + (3*em) < w && em > getEm(fullCal)){
        fullCal.css({fontSize:"+=0.05em"});
        w = toolbar.width(); wLeft = toolbar.find('.fc-left').width(); wCenter = toolbar.find('.fc-center').width(); wRight = toolbar.find('.fc-right').width(); wTotal = wLeft + wCenter + wRight;        
        changed = true;
      }
      if (changed){
        calendar.updateSize();
      }
    })
}
function resizeQuotes(){
  $(".quote").each(function(){
    var h = $(this).outerHeight();
    $(this).closest(".quoteBlock").css("height","calc("+h.toString()+"px + 11em)");
  })
}
function resizeFooterPadding(){
  var h = $("footer").outerHeight();
  $("body").css("padding-bottom",h);
}
function getEm(ele = null){
  if (ele == null){ele = $("body")}
    return Number(ele.css('font-size').split("px")[0]);
}
var menuWidth;
function resizeImageClicks(){
  $('.imageClick').each(function(){
    var height = $(this).data('height') != 'null' ? $(this).data('height') : '20em',
    ratio = $(this).data('ratio') != 'null' ? Number($(this).data('ratio')) : 1.5, width,
    parentRect = $(this).parent()[0].getBoundingClientRect(), parentWidth = parentRect.width, newWidth, newHeight, visible = $(this).is(":visible");
    $(this).css({height:height});
    var img = $(this);
    setTimeout(function(){
      var heightInPx = img.outerHeight(), newHeight;
      width = heightInPx * ratio;
      newWidth = width;
// console.log(img,height);
img.css({width:width});
// console.log(img.css('width'));
if (visible){
  while(newWidth > parentWidth){
    newWidth = newWidth*0.95;
  }
  if (newWidth != width){
    newHeight = newWidth / ratio;
    img.css({width:newWidth,height:newHeight});
  }
}
},501)
  });
}

function resizeMobileMenuAndFooter(){
  var siteMenu = $(".siteMenu").first();
  var tabs = siteMenu.add("#MenuDisplay").children(".tab").not("#Notifications, #mobilePlaceholder, #MobileMenu"), hasPlaceholder = ($("#mobilePlaceholder").length == 1);
  if (!siteMenu.hasClass("mobile")){
    menuWidth = siteMenu.outerWidth();
  }
  var logo = $("#NavBar").find('.logo'), logoW = logo[0].scrollWidth, menuW = siteMenu[0].scrollWidth, em;
  em = getEm();
  var w = $("body").width();
  var tooWide = ((logoW + menuW + 6*em) > w), wideEnough = null;
  if (siteMenu.data('width') != undefined){
    wideEnough = ((logoW + siteMenu.data('width') + 6*em) < w);
  }
// if (p > 0.6){
  if (tooWide){
    siteMenu.data('width',menuW);
    siteMenu.addClass("mobile");
    if (hasPlaceholder){
      $("#mobilePlaceholder").replaceWith(tabs);
    }else{
      tabs.appendTo("#MenuDisplay");    
    }
  }else if (wideEnough){
    siteMenu.removeClass("mobile");
    tabs.appendTo(siteMenu);
    siteMenu.find(".dropDown").removeClass("active");
    siteMenu.removeData('width');
  }
  moveNotifications();

  if (w < 480){$("footer").find(".logo, .icons, .contact, .hours").addClass("mobile");}
  else if (w < 750){
    $("footer").find(".logo, .icons").addClass("mobile");
    $("footer").find(".contact, .hours").removeClass("mobile");
  }
  else {$("footer").find(".logo, .icons, .contact, .hours").removeClass("mobile");}
}
function moveNotifications(){
  var siteMenu = $(".siteMenu").first(), mobileNow = siteMenu.hasClass('mobile');
  if (mobileNow){
    $("#Notifications").prependTo(siteMenu);
  }else{
    $("#Notifications").insertBefore(siteMenu.find(".divide"));
  }
}
function listenMobileMenuExit(e){
  if (!$(e.target).is(".tab, .title, .dropdown, li, #MenuToggle")){
    $("#MenuToggle").click();
  }
}

var timer;
function resizeElements(ev){
  clearTimeout(timer);
  timer = setTimeout(function(){
    if (typeof ev !== 'undefined' && typeof ev === 'object'
      && typeof ev.type !== 'undefined' && ev.type === 'resize'
      && vhIndicatorHeight !== undefined && !inputHasFocus){
// console.log(ev);
vhIndicatorHeight = vhIndicator.height();
}
// if (vhIndicatorHeight !== undefined) console.log(vhIndicatorHeight);
resizeSplits();
resizeQuotes();
resizeMobileMenuAndFooter();
resizeFooterPadding();
resizeImageClicks();
// resizeFcCalendar();
// optionsNavOverflowCheck();
}.bind(null, ev),150)
}


function followLink(){
  if ($(this).data('target') != undefined){
    var t = $(this).data("target");
    window.location.href = t;        
  }else if ($(this).data('tab') != undefined){
    var t = $(this).data('tab');
    $(t).find(".title").click();
  }
}
function plural(model){
  model = model.toLowerCase();
  model += "s";
  return model;
}
function singular(model){
  model = model.toLowerCase();
  model = model.slice(0, -1);
  return model;
}

const autosave = {
  settings: {
    saveBtn: null,
    btnText: null,
    timer: null,
    ajaxCall: null,
    callback: null,
    delay: 5000,
    countdown: null,
  },
  btnLoading: $("<div class='lds-ring insideBtn dark autosaveCircle'><div></div><div></div><div></div><div></div></div>"),
  initialize: function(options = autosave.settings){
    throw new Error("STOP USING THIS");
    try{
      autosave.reset();
      if (!options.ajaxCall || typeof options.ajaxCall != 'function'){
        throw new Error('autosave ajax call is required');
      } else autosave.settings.ajaxCall = options.ajaxCall;
      if (options.delay && typeof options.delay == 'number') autosave.settings.delay = options.delay;
      if (options.saveBtn && options.saveBtn instanceof jQuery){
        autosave.settings.saveBtn = options.saveBtn;
        autosave.settings.btnText = options.saveBtn.text();            
      }
      if (options.callback && typeof options.callback == 'function') autosave.settings.callback = options.callback;
    } catch (error) {
      log({error,options});
    }
  },
  clearTimer: () => {
    clearTimeout(autosave.settings.timer);
    clearInterval(autosave.settings.countdown);
    if (autosave.settings.saveBtn) {
      let text = '', flash = false, show = false;
      autosave.statusUpdate({text,flash,show});
    }
  },
  statusUpdate: (options = {}) => {
    let btn = autosave.settings.saveBtn, status = $("#AutoStatus");
    if (btn.parent(".autosaveSpan").dne()) btn.wrap("<span class='autosaveSpan'/>");
    status.addClass('pink');
    let span = btn.parent(), 
    margin = btn.css('margin'), 
    text = options.text || "",
    flash = options.flash || false,
    show = options.show || true;
    if (flash) status.addClass('opacityFlash');
    else status.removeClass('opacityFlash');
    if (show) status.slideFadeIn();
    else status.slideFadeOut();
    status.html(text);
    status.appendTo(span).css('transform','translate(-50%, calc(100% - '+margin+'))');
  },
  trigger: function(){
    throw new Error("STOP USING THIS");
    console.log('trigger');
    autosave.clearTimer();
    autosave.settings.timer = setTimeout(async function(){
      autosave.inProgress();
      log(autosave.settings);
      try{
        let result = await autosave.settings.ajaxCall().then((data,status,request) => {
          log({data,status,request});
          system.validation.xhr.headers.check(request);
          let callback = autosave.settings.callback;
          if (autosave.settings.callback) autosave.settings.callback.bind(null,data)();
          autosave.success();
        }).catch(error => log({error},'autosave error'));        
      }catch(error){
        log({error,setting:autosave.settings},'autosave error');
      }
    }, autosave.settings.delay);
    
    if (autosave.settings.saveBtn){
      let text = `saving changes in <span class='count' style='display:inline:block;margin-left:4px;'>${autosave.settings.delay/1000}</span>`, flash = true, show = true;
      autosave.statusUpdate({text,flash,show});
      autosave.settings.countdown = setInterval(function(){
        let c = $("#AutoStatus").find('.count'), s = Number(c.text());
        c.text(s-1);
      },1000);      
    }
  },
  inProgress: function(){
    console.log('in progress');
    if (autosave.settings.saveBtn){
      let text = 'saving changes', flash = true, show = true;
      autosave.statusUpdate({text,flash,show});
      let disabled = autosave.settings.saveBtn.hasClass('disabled'), span = autosave.settings.saveBtn.parent();
      autosave.settings.saveBtn.data('disabled',disabled);
      autosave.settings.saveBtn.addClass('disabled');
      autosave.btnLoading.clone().appendTo(span);
    }
  },
  success: function(){

var t = new Date(), timeStr = t.toLocaleTimeString(), wrap = $("#AutoSaveWrap");
$("#AutoConfirm").find(".message").text("Autosaved at " + timeStr);
// console.log(wrap);
wrap.slideFadeIn(1200);
setTimeout(wrap.slideFadeOut.bind(wrap,400),3600);
if (autosave.settings.saveBtn){
  let disabled = autosave.settings.saveBtn.data('disabled'),
  text = '<span>changes saved</span><span class="checkmark" style="position:relative">✓</span>', 
  flash = false, show = true;
  if (!disabled) autosave.settings.saveBtn.removeClass('disabled');
  autosave.settings.saveBtn.removeData('disabled').parent().find(".autosaveCircle").remove();
  autosave.statusUpdate({text,flash,show});
  setTimeout(function(){
    $("#AutoStatus").slideFadeOut(400,function(){$("#AutoStatus").appendTo("#AutoSaveWrap")});
  },4000)
}
}
};

// function initializeLinks(){
//   var links = filterUninitialized('.link');
//   links.on("click",followLink);
//   links.data('initialized',true);
// }

function initializeNewContent(){
  throw new Error(`don't use initializeNewContent`);
  if (typeof notify !== 'undefined'){
// resetEntireAppt();
initializeNewForms();
initializeNewModelForms();
// initializeNewModelTables();
table.initialize.all();
initializeSettingsForm();
// initializeApptForms();
appointment.initialize.all();
initializeScheduleForms();
checkNotifications();
// activateServiceSelection();
// initializeChartNotePage();
chartnote.initialize.all();
// initializeInvoicePage();
invoice.initialize.all();
}
initializeNewMenus();
initializeEditables();
initializeLinks();
resizeElements();
masterStyle();
}

var loadingRing = "<div class='lds-ring dark'><div></div><div></div><div></div><div></div></div>", loadingRingCSS = {top:"50%",transform:"translate(-50%,-50%)"}, vhIndicator, vhIndicatorHeight = undefined, inputHasFocus = false, rapidChangeTimer = null;
function checkRapidVhShrink(ev){
  inputHasFocus = true;
  input = $(ev.target), inputBoundaries = ev.target.getBoundingClientRect();
// console.log(inputBoundaries);
rapidChangeTimer = setTimeout(function(){
// console.log(vhIndicator.height(), vhIndicatorHeight);
if (vhIndicator.height() < vhIndicatorHeight * 0.85){
  console.log("SHRINK");
}
},250)
}
function checkRapidVhGrowth(){
  inputHasFocus = false;
// rapidChangeTimer = setTimeout(function(){
//     console.log(vhIndicator.height(), vhIndicatorHeight);
//     if (vhIndicator.height() > vhIndicatorHeight * 0.85){
// console.log("GROW");
//     }
// },250)
}

$(document).ready(function(){
  vhIndicator = $(".vhIndicator").first();
  if (vhIndicator.length > 0){
    vhIndicatorHeight = vhIndicator.length > 0 ? vhIndicator.height() : undefined;
    $('body').on('focusin','input[type="text"], textarea',checkRapidVhShrink);
    $('body').on('focusout','input[type="text"], textarea',checkRapidVhGrowth);        
  }
  resizeElements();
  if ($("#LoggedOut").length>0){
    setTimeout(function(){
      slideFadeOut($("#LoggedOut"));
    },2000)
  }
  if (user && user.is('patient')){
    systemModalList.push("createAppointment","editAppointment","SelectServices","SelectPractitioner","SelectDateTime","ApptDetails","ServiceListModal","PractitionerListModal");
    systemModals = systemModals.add($("#createAppointment, #editAppointment, #SelectServices, #SelectPractitioner, #SelectDateTime, #ApptDetails, #ServiceListModal, #PractitionerListModal"));
  }
// initializeLinks();
// $(".booknow").addClass("link").data("target","/booknow");
$(document).on('click','.cancel',function(ev){
  if ($(ev.target).hasClass('toggle')) return;
  unblur(); 
});
})

const ifu = function(val,backup,allowArray=false){
  if (Array.isArray(val) && !allowArray){
// if (debug.level(3)) console.log({val,allowArray},'using array as options');
let test = undefined; for (let x = 0; x < val.length - 1; x++){test = ifu(val[x], val[x+1]); if (test === val[x]) break;} val = test;
} 
if (debug.level(3)) console.log({val,allowArray},'using array as options');
return (typeof val !== 'undefined') ? val : backup;
}
const ifn = function(val,backup,allowArray=false){
  if (Array.isArray(val) && !allowArray)
    {let test = undefined; for (let x = 0; x < val.length - 1; x++){test = ifn(val[x], val[x+1]); if (test === val[x]) break;} val = test;} 
  return (typeof val !== 'undefined' && val !== null) ? val : backup;
}
const iff = function(val,backup,allowArray=false){
  if (Array.isArray(val) && !allowArray)
    {let test = undefined; for (let x = 0; x < val.length - 1; x++){test = iff(val[x], val[x+1]); if (test === val[x]) break;} val = test;}
  return val || backup;
}

jQuery.easing['jswing'] = jQuery.easing['swing'];

jQuery.extend( jQuery.easing,
{
  // t: current time, b: begInnIng value, c: change In value, d: duration
  
  def: 'easeOutQuad',
  swing: function (x, t, b, c, d) {
    //alert(jQuery.easing.default);
    return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
  },
  easeInQuad: function (x, t, b, c, d) {
    return c*(t/=d)*t + b;
  },
  easeOutQuad: function (x, t, b, c, d) {
    return -c *(t/=d)*(t-2) + b;
  },
  easeInOutQuad: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t + b;
    return -c/2 * ((--t)*(t-2) - 1) + b;
  },
  easeInCubic: function (x, t, b, c, d) {
    return c*(t/=d)*t*t + b;
  },
  easeOutCubic: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t + 1) + b;
  },
  easeInOutCubic: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t + b;
    return c/2*((t-=2)*t*t + 2) + b;
  },
  easeInQuart: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t + b;
  },
  easeOutQuart: function (x, t, b, c, d) {
    return -c * ((t=t/d-1)*t*t*t - 1) + b;
  },
  easeInOutQuart: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
    return -c/2 * ((t-=2)*t*t*t - 2) + b;
  },
  easeInQuint: function (x, t, b, c, d) {
    return c*(t/=d)*t*t*t*t + b;
  },
  easeOutQuint: function (x, t, b, c, d) {
    return c*((t=t/d-1)*t*t*t*t + 1) + b;
  },
  easeInOutQuint: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
    return c/2*((t-=2)*t*t*t*t + 2) + b;
  },
  easeInSine: function (x, t, b, c, d) {
    return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
  },
  easeOutSine: function (x, t, b, c, d) {
    return c * Math.sin(t/d * (Math.PI/2)) + b;
  },
  easeInOutSine: function (x, t, b, c, d) {
    return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
  },
  easeInExpo: function (x, t, b, c, d) {
    return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
  },
  easeOutExpo: function (x, t, b, c, d) {
    return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
  },
  easeInOutExpo: function (x, t, b, c, d) {
    if (t==0) return b;
    if (t==d) return b+c;
    if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
    return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
  },
  easeInCirc: function (x, t, b, c, d) {
    return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
  },
  easeOutCirc: function (x, t, b, c, d) {
    return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
  },
  easeInOutCirc: function (x, t, b, c, d) {
    if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
    return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
  },
  easeInElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
  },
  easeOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
  },
  easeInOutElastic: function (x, t, b, c, d) {
    var s=1.70158;var p=0;var a=c;
    if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
    if (a < Math.abs(c)) { a=c; var s=p/4; }
    else var s = p/(2*Math.PI) * Math.asin (c/a);
    if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
    return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
  },
  easeInBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*(t/=d)*t*((s+1)*t - s) + b;
  },
  easeOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158;
    return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
  },
  easeInOutBack: function (x, t, b, c, d, s) {
    if (s == undefined) s = 1.70158; 
    if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
    return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
  },
  easeInBounce: function (x, t, b, c, d) {
    return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
  },
  easeOutBounce: function (x, t, b, c, d) {
    if ((t/=d) < (1/2.75)) {
      return c*(7.5625*t*t) + b;
    } else if (t < (2/2.75)) {
      return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if (t < (2.5/2.75)) {
      return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
      return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
  },
  easeInOutBounce: function (x, t, b, c, d) {
    if (t < d/2) return jQuery.easing.easeInBounce (x, t*2, 0, c, d) * .5 + b;
    return jQuery.easing.easeOutBounce (x, t*2-d, 0, c, d) * .5 + c*.5 + b;
  }
});
