<div class='wrapMe marginBig bottomOnly' style='display:inline-block'>
   
	<?php 
		$nospaces = str_replace(" ", "", $model); 
	?>

	<table id='SingleScheduleTable' class='styledTable clickable scheduleTable' data-model='{{ $nospaces }}' data-hideorder="services">

        <tr class='head'>
            <th class='days'>Scheduled Days</th>
            <th class='hours'>Hours</th>
        	@if ($model != "StaffMember")
            <th class='services'>Services Offered</th>
            @endif
        </tr>
        @foreach ($schedule as $timeBlock)
        	<?php 
        	$hiddenFiltersAdded = false;
        	$timeBlock['break'] = isset($timeBlock['break']) ? $timeBlock['break'] : false;
        	$isBreak = $timeBlock['break'] ? "breakTime" : "";
        	?>
            <tr class='timeBlock {{ $isBreak }}' data-block='{{ $loop->index }}'>
	            <td class='days'><div class='tdSizeControl'>{{ displayDays($timeBlock['days']) }}<div class='indicator'>...</div></div></td>
	            <td class='hours'><div class='tdSizeControl'>{{ $timeBlock['start_time'] }} to {{ $timeBlock['end_time'] }}<div class='indicator'>...</div></div></td>
	            @if ($model != 'StaffMember')
		            <td class='services'><div class='tdSizeControl'>
		            	@if (isset($timeBlock['services']))
		            		<?php 
		            		$str = "";
		            		for($x =0;$x<count($timeBlock['services']);$x++){
		            			$str .= getNameFromUid("Service",$timeBlock['services'][$x]);
		            			if ($x<count($timeBlock['services']) -1){$str .= ", ";}
		            		}
		            		echo $str;
		            		?>
		            	@elseif ($isBreak)
		            		break time!
		            	@else
		            		All Available Services
		            	@endif
		            	<div class='indicator'>...</div></div>
		            </td>
	            @endif
            </tr>
        @endforeach
		
		<tr class='noMatch'>
            <td class='days'><div class='tdSizeControl'>No Scheduled Time Blocks<div class='indicator'>...</div></div></td>
            <td class='hours'><div class='tdSizeControl'><div class='indicator'>...</div></div></td>
            <td class='services'><div class='tdSizeControl'><div class='indicator'>...</div></div></td>
		</tr>
	</table>
</div>