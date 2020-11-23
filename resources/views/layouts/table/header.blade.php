<tr class='head dont_filter'>
	@foreach ($columns as $key => $value)
        <th class='{{camel($key)}}'>{{$key}}</th>
    @endforeach
</tr>
