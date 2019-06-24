<?php
Namespace App;
Use Carbon\Carbon;

if (isset($_POST['OptParams'])){
	// echo "opt params passed";	
}else{
	// echo "no opt params passed";
}

$calendar = app('GoogleCalendar');
$calendarId = config('google')['calendar_id'];
try{
    $results = $calendar->events->listEvents($calendarId);
    $events = $results->getItems();
}
catch(\Exception $e){
    $events = null;
}

$eventArr = [];
if (!empty($events)) {
    foreach ($events as $event) {
    	// reset vars
    	$newEvent = [];
    	unset($start, $end, $allDay, $id, $title, $extendedProps);

        $start = $event->start->dateTime;
        $allDay = false;
        if (empty($start)) {
            $start = $event->start->date;
            $allDay = true;
        }
        $end = $event->end->dateTime;
        if (empty($end)) {
            $end = $event->end->date;
        }
        $id = $event->id;
        $title = $event->summary;
        $extendedProperties = $event->extendedProperties->shared;
        $newEvent = array(
        	"start" => $start,
        	"end" => $end,
        	"allDay" => $allDay,
        	"id" => $id,
        	"title" => $title,
        	"extendedProperties" => $extendedProperties
        );
        $eventArr[] = $newEvent;
        // printf("%s (%s)\n", $event->getSummary(), $start);
    }
}
else{
    echo "Calendar NOT loaded";
}
file_put_contents(storage_path('app/calendar/practitioner-feed.php'), json_encode($eventArr));
// dd($eventArr);
?>
<h2 class="purple paddedSmall">Appointment Calendar</h2>
<div id="calendar"><div class='lds-ring dark'><div></div><div></div><div></div><div></div></div></div>
<div id='calfeedtarget'></div>
<!-- <script type="text/javascript" src="{{ asset('/js/fullcalendar-3.9.0/fullcalendar.js') }}"></script> -->
<!-- <script type='text/javascript' src="{{ asset('/js/app.js') }}"></script> -->
<script type='text/javascript' src="{{ asset('/fullcalendar4.1/core/main.js') }}"></script>
<script type='text/javascript' src="{{ asset('/fullcalendar4.1/daygrid/main.js') }}"></script>
<script type='text/javascript' src="{{ asset('/fullcalendar4.1/interaction/main.js') }}"></script>
<script type='text/javascript' src="{{ asset('/fullcalendar4.1/list/main.js') }}"></script>
<script type='text/javascript' src="{{ asset('/fullcalendar4.1/timegrid/main.js') }}"></script>
<script type='text/javascript' src="{{ asset('/js/moment.js') }}"></script>
<script type='text/javascript' src="{{ asset('/js/calendar-practitioner.js') }}"></script>


