<tr class="no_match dont_filter">
	@foreach ($columns as $key => $value)
	   	@if ($loop->first)
	        <td class='{{camel($key)}}'>No matches</td>
	   	@else
	        <td class='{{camel($key)}}'></td>
	   	@endif
	@endforeach	
</tr>
