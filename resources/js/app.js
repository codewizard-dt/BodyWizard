/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap');

// window.Vue = require('vue');

/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */

// const files = require.context('./', true, /\.vue$/i);
// files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key).default));

// Vue.component('example-component', require('./components/ExampleComponent.vue').default);

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

// const app = new Vue({
//     el: '#app',
// });

import { Calendar } from '@fullcalendar/core';
window.FullCal = Calendar;
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import rrulePlugin from '@fullcalendar/rrule';
import momentTimezonePlugin from '@fullcalendar/moment-timezone';
import { RRule, RRuleSet, rrulestr } from 'rrule';
window.RRule = RRule; window.RRuleSet = RRuleSet; window.rrulestr = rrulestr;
import moment from 'moment';
window.moment = moment;

// import {Features} from

// import {forms} from './forms';
require('./functions');
// require('./models');


// require('./menu');
// require('./menu-portal');
// //require('./launchpad/forms2');
// //require('./login');
// require('./scrollTo');
// require('./mark/jquery.mark.min.js')
// require('./jonthornton-jquery-timepicker-99bc9e3/jquery.timepicker.min.js');
