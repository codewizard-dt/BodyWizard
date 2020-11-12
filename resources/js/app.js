
require('./bootstrap');

import { Calendar } from '@fullcalendar/core';
window.FullCal = Calendar;
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
import rrulePlugin from '@fullcalendar/rrule';
import { RRule, RRuleSet, rrulestr } from 'rrule';
window.RRule = RRule; window.RRuleSet = RRuleSet; window.rrulestr = rrulestr;
import { DateTime } from 'luxon';

require('./custom/prototypes');
require('./custom/luxon');
require('./functions');