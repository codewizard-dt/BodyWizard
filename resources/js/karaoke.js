import {Features, log, system} from './functions';
import {Forms} from './forms';
import {DateTime as LUX} from 'luxon';
import {Settings as LuxonSettings} from 'luxon';


export class JankyStar {
	constructor (options = {}) {
		this.define_by(options);
		this.joined_at = options.arrived ? LUX.fromMillis(options.arrived) : now();
		this.count = options.count || 0;
		this.ele.data({class_obj:this}).addClass('flexbox column').css({padding:'0.2em 0.4em'})
		this.confirm_remove = new Features.Confirm({
			header: `Remove ${this.name}?`,
			message: `Only remove them if they're really gone`,
			affirm: this.remove_f_queue.bind(this),
		});
		let sing_check = new Features.Icon({
			type:'checkmark',
			size:1,
			action: _ => { this.add_count() },
		}), remove_f_queue = new Features.Icon({
			type:'styled_x',
			size:1,
			action: _ => this.confirm_remove.prompt(),
		});
		let name = this.ele.find('span').addClass('bold').css({marginRight:'1em'});
		this.options = { 
			name: name,
			top: $(`<div/>`,{class:'flexbox spread'}).append(name).appendTo(this.ele).css({width:'100%'}),
			info: $(`<div/>`,{class:'flexbox column left'}).appendTo(this.ele).css({fontSize:'0.6em',width:'100%'}),
		};
		this.options.sing_check = sing_check.img.hide().appendTo(this.options.top);
		this.options.delete = remove_f_queue.img.appendTo(this.options.top);
		this.options.count = $(`<span/>`,{text:this.count?`(${this.count})`:'',css:{marginLeft:'0.5em'}}).appendTo(this.options.name);
		this.options.arrival = $(`<span/>`,{text:`Joined: ${this.joined_at.time}`}).appendTo(this.options.info);
		this.options.last = $(`<span/>`).appendTo(this.options.info);
		this.up_down = new Features.UpDown({action:'change_order',callback:_ => {JankyStar.reset_indices(); JankyStar.set_cookie()},selector:'li',ele_css:{position:'absolute',right:'-1.5em'}});
		this.up_down.ele.appendTo(this.ele);
		this.song_timestamps = [];
		this.active = ifu(this.active, true);
		if (this.index !== undefined) this.ele.data({index:this.index});
	}
	pending () {
		this.ele.addClass('pending');
		this.options.sing_check.show(); this.options.delete.hide();
	}
	reverse () {
		this.ele.removeClass('pending down');
		this.options.sing_check.hide(); this.options.delete.show();
	}
	add_count () {
		let n = now();
		this.count++;
		this.last_sang = n;
		this.options.sing_check.hide(); this.options.delete.show();
		this.options.last.text(`Last song: ${this.last_sang.time}`);
		this.options.count.text(`(${this.count})`);
		this.ele.addClass('down');
		setTimeout( _ => {
			this.reverse();
			this.ele.appendTo(JankyStar.list.ul);
			JankyStar.reset_indices();
			JankyStar.set_cookie();
		},400)
	}
	remove_f_queue () {
		this.ele.detach();
		JankyStar.list.post_add_check();
		this.return = $(`<a/>`,{text:this.name,css:{margin:'0.5em',fontSize:'1.2em'}}).insertAfter(JankyStar.list.ele).on('click', _ => { this.add_back_to_queue() });
		this.active = false;
		JankyStar.set_cookie();
	}
	add_back_to_queue () {
		this.return.hide();
		this.ele.appendTo(JankyStar.list.ul).show();
		JankyStar.list.post_add_check();
		this.active = true;
	}
	get cookie () {
		return {
			count: this.count,
			arrived: this.joined_at.ts,
			active: this.active,
			index: this.index
		};
	}
	static get list_cookie () {
		return system.cookie.get('janky_list');		
	}
	static set_cookie () {
		document.cookie = `janky_list=${JankyStar.cookie}`;
		document.cookie = `expires=${now().plus({days:1}).toHTTP()}`
		log({cookie:system.cookie.get('janky_list')});
	}
	static get cookie () {
		let data = {};
		JankyStar.list_array.forEach(star => {
			data[star.name] = star.cookie;
		});
		return JSON.stringify(data);
	}
	static toggle_pending (ev) {
		if ($(ev.target).is('img')) return;
		let Janky = $(this).getObj();
		if (Janky.ele.hasClass('pending')) Janky.reverse();
		else Janky.pending(); 
	}
	static reset_indices () {
		log("reset");
		JankyStar.list_array.forEach(js => {
			let index = js.index = JankyStar.list.items.index(js.ele);
			js.ele.data({index});
		})
	}

	static add_to_list (answer, ev, options = {}) {
		let input = JankyStar.input, name = input.get(), icon_box = $('<div/>',{class:'flexbox notification_options'});
		if (name == null) {JankyStar.Warning.show({message:'enter a name first!'}); return;}
		else name = name.toTitleCase();
		if (JankyStar.list.find_by_value(name).exists()) {JankyStar.Warning.show({message:`${name} already on list!`}); return;}
		let ele = JankyStar.list.add_item({text: name,class_list:'JankyStar'});
		JankyStar.most_recent = new JankyStar({ele,name}.merge(options));
		JankyStar.list_array.push(JankyStar.most_recent);
		input.value = null;
		input.input.focus();
		JankyStar.set_cookie();
		if (!JankyStar.most_recent.active) JankyStar.most_recent.remove_f_queue();
	}
	static sort () {
		let items = JankyStar.list.items;
		function index_sort (a, b) {
			return $(a).data('index') - $(b).data('index');
		}
		items.sort(index_sort).appendTo(JankyStar.list.ul);
	}
	static ready () { 
		$('#karaoke_load').remove();
		JankyStar.input = $('.user_list').getObj('answer');
		JankyStar.list = new Features.List({
			header: 'Jankyoke Stars',
			ele_css: {fontSize: '1.4em'},
			ul_css: {overflow:'visible'},
			li_css: {padding: '1px 0.2em'},
			action: JankyStar.toggle_pending,
			li_selectable: false,
		});
		JankyStar.list_array = [];
		JankyStar.list.ele.insertAfter($('#AddButton'));
		JankyStar.Warning = new Features.Warning({message:'enter a name first',ele:JankyStar.input.ele});
		JankyStar.input.input.focus();
		let existing = JankyStar.list_cookie;
		if (existing) {
			existing = JSON.parse(existing);
			for (let name in existing) {
				JankyStar.input.value = name;
				JankyStar.add_to_list(null,null, {name}.merge(existing[name]));
			}
			JankyStar.sort();
		}
	}
}

window.JankyStar = JankyStar;