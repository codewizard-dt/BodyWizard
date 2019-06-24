
$(document).ready(function(){
     $("#calfeedtarget").load("/calfeed",function(){
     	//console.log($("#calfeed").data("events"));
     	// console.log(JSON.parse($("#calfeed").data("events")));
     	loadCal($("#calendar"));
     });

     function loadCal(target){
     	var calendar = new FullCalendar.Calendar(target[0], {
     		plugins: ['dayGrid','list', 'timeGrid', 'interaction'],
            header:{
                left:"title",
                center:"",
                right:"prev,today,next dayGridMonth,timeGridWeek,timeGridDay",
            },
            dateClick: function(info){
				alert('Clicked on: ' + info.dateStr);
				alert('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
				alert('Current view: ' + info.view.type);
				// change the day's background color just for fun
				// info.dayEl.style.backgroundColor = 'red';
            },
            defaultView:"timeGridWeek",
            minTime:"08:00:00",
            maxTime:"020:00:00",
     		events: $("#calfeed").data("events")
     	})

		 calendar.render();
     }
})