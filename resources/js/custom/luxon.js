import {log, system} from '../functions';
import {DateTime as LUX} from 'luxon';
import {Duration} from 'luxon';
window.now = () => LUX.local();

Object.defineProperties(LUX, {
	From: {value: {
		js: js_date => {
			let dt = js_date ? LUX.fromJSDate(js_date) : null;
			if (dt && dt.invalid != null) throw new Error('Invalid Luxon obj From.js');
			return dt;
		},
		rrule: js_date => {
			let dt = js_date ? LUX.fromJSDate(js_date, {zone: 'utc'}) : null;
			if (dt && dt.invalid != null) throw new Error('Invalid Luxon obj From.js');
			let dtz = dt.setZone(tz, {keepLocalTime:true});
			return dtz;
		},
		time: (time_str, format = 'h:mm a') => {
			let dt = time_str ? LUX.fromFormat(time_str,format) : null;
			if (dt && dt.invalid != null) throw new Error('Invalid Luxon obj From.time');
			return dt;
		},
		date: (date_str, format = 'M/d/yyyy', time_update = true) => {
			if (!date_str) return null;
			let dt = LUX.fromFormat(date_str,format), t = time_update === true ? now() : time_update;
			if (time_update) {
				dt = dt.set({hour: t.hour, minute: t.minute, second: t.second});
			}
			if (dt && dt.invalid != null) throw new Error(`Invalid Luxon obj From.date datestr='${date_str}'`);
			return dt;
		},
		datetime: (date_str, time_str, date_format = 'M/d/yyyy', time_format = 'h:mm a') => {
			let dt = LUX.fromFormat(`${date_str} ${time_str}`, `${date_format} ${time_format}`);
			if (dt && dt.invalid != null) throw new Error(`Invalid Luxon obj From.datetime datestr='${date_str}' timestr='${time_str}'`);
			return dt;
		},
	}},
	Sort: {value: (datetimes, options = {}) => {
	  let order = options.order || 'asc';
	  if (typeof datetimes == 'string') datetimes = LUX.String.to_lux_array(datetimes, options);
	  datetimes = datetimes.sort();
	  if (order == 'desc') datetimes = datetimes.reverse();
	  return datetimes;
	}},
	String: {value: {
		to_lux_array: (string, options = {}) => string.split(options.separator || ', ').map(str => LUX.String.to_lux(str, options.format)),
		to_lux: (string, format = 'M/d/yyyy') => LUX.fromFormat(string, format),
		datepick: {
			shorthand: str => {
        if (str == null) return null;
        let lux = now(), fx = str.slice(0,1), n = str.slice(1,-1), unit = LUX.String.datepick.abbr(str.slice(-1)), duration = LUX.String.datepick.duration(n,unit);
        if (fx == '-') lux = lux.minus(duration).startOf('day');
        else lux = lux.plus(duration).endOf('day');
        return lux;
			},
			abbr: single_letter => {
				let map = {d:'days',h:'hours',w:'weeks',m:'months',y:'years'};
				return map[single_letter];
			},
			duration: (n, unit) => {
				let obj = {}; obj[unit] = n;
				return Duration.fromObject(obj);
			},
			validate: (string, min = null, max = null, format = 'M/d/yyyy') => {
				let array = string.split(',');
				try {
					return array.isEmpty() || array.every(date => {
						let dt = LUX.From.date(date.trim(), format);
						if (!dt) return true;
						if (min && dt < min) throw new Error(`${dt.date_num} is before earliest available (${min.date_num})`);
						if (max && dt > max) throw new Error(`${dt.date_num} is after latest available (${max.date_num})`);
						if (dt.invalid) throw new Error(`${date} IS NOT VALID`);
						return true;
					});
				} catch (error) {
					return error.message;
				}
			}
		},
		time: {
			to_obj: (str, format = 'h:mm a') => {
				let dt = LUX.From.time(str,format);
				return {hour: dt.hour, minute: dt.minute, second: dt.second};
			},			
			validate: (string, min = null, max = null, format = 'h:mm a') => {
				let array = string.split(',');
				try {
					return array.isEmpty() || array.every(time => {
						let dt = LUX.From.time(time.trim(), format);
						if (!dt) return true;
						if (min && dt < min) throw new Error(`${dt.time} is before earliest available (${min.time})`);
						if (max && dt > max) throw new Error(`${dt.time} is after latest available (${max.time})`);
						if (dt.invalid) throw new Error(`${time} IS NOT VALID`);
						return true;
					});
				} catch (error) {
					return error.message;
				}
			}
		},
		date: {
			to_obj: (str, format = 'M/d/yyyy') => {
				let dt = LUX.From.date(str,format);
				return {month: dt.month, year: dt.year, day: dt.day};
			},
		}
	}},
	Weekdays: {value: {
		map: {Monday:1,Tuesday:2,Wednesday:3,Thursday:4,Friday:5,Saturday:6,Sunday:7},
		shift: (array, delta) => {
			if (typeof array[0] == 'number') array = array.map(d => LUX.fromObject({weekday:d}));
			else if (typeof array[0] == 'string') {
				array = array.map(d => {
					if (Number.isNaN(Number(d))) return LUX.fromObject({weekday:LUX.Weekdays.map[d]});
					else return LUX.fromObject({weekday:Number(d)});
				})
			};
			array = array.map(d => d.plus({days:delta}).weekdayLong);
			return array;
		},
	}},
	DateShift: {value: (array, delta) => {
		if (typeof array[0] == 'string') array = array.map(d => LUX.From.date(d).plus({days:delta}).date_num);
		else array = array.map(d => d.plus({days:delta}));
		return array;
	}},
	RRule: {value: {
		Parse: (rrule) => {
			if (!rrule) return null;
			if (typeof rrule == 'string') rrule = rrulestr(rrule,{forceset:true});
			rrule = (rrule instanceof RRuleSet) ? rrule : null;
			if (!rrule) throw new Error('rrule not parseable to RRuleSet');
			return rrule;
		},
		Upcoming: (options = {}, datetime = LUX.NOW) => {
			if (!options.rrule) throw new Error('rrule not given for Upcoming');
			let rrule = LUX.RRule.Parse(options.rrule), limit = options.limit || 3, dates = [], working_datetime = datetime.rrule;
			while (dates.length < limit && working_datetime) {
				working_datetime = rrule.after(working_datetime);
				if (working_datetime) dates.push(LUX.From.rrule(working_datetime));
			}
			return dates;
		},
		Recent: (options = {}, datetime = LUX.NOW) => {
			if (!options.rrule) throw new Error('rrule not given for Upcoming');
			let rrule = LUX.RRule.Parse(options.rrule), limit = options.limit || 3, dates = [], working_datetime = datetime.rrule;
			while (dates.length < limit && working_datetime) {
				working_datetime = rrule.before(working_datetime);
				if (working_datetime) dates.push(LUX.From.rrule(working_datetime));
			}
			return dates;
		},
		Merge: (rrule_array) => {
			rrule_array = rrule_array.map(r => LUX.RRule.Parse(r));
			let rrule_set = rrule_array.shift();
			while (rrule_set === null) { rrule_set = rrule_array.shift() }
			while (rrule_array.length > 0) {
				let next = rrule_array.shift();
				while (next === null) { next = rrule_array.shift() }
		    next._rrule.forEach(rule => rrule_set.rrule(rule));
		    next._exrule.forEach(rule => rrule_set.exrule(rule));
		    next._rdate.forEach(date => rrule_set.rdate(date));
		    next._exdate.forEach(date => rrule_set.exdate(date));
			}
			return rrule_set;
		}
	}},
	NOW: {
		get () { return LUX.local() }
	}
});

Object.defineProperties(LUX.prototype, {
	time: {
		get () {	return this.toLocaleString(LUX.TIME_SIMPLE); }
	},
	time_24: {
		get () { return this.toLocaleString(LUX.TIME_24_WITH_SECONDS) }
	},
	datetime_db: {
		get () { return `${this.toFormat('yyyy-MM-dd')} ${this.time_24}` }
	},
	date_num: {
		get () {	return this.toLocaleString(LUX.DATE_SHORT); }
	},
	date: {
		get () { return this.toFormat('MMM d') }
	},
	rrule: {
		get () { return new Date(Date.UTC(this.year, this.month - 1, this.day, this.hour, this.minute)) }
	},
	start_of_week: {
		get () { return this.weekday === 7 ? this : this.startOf('week') }
	}
})
