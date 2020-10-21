<tr class='head no_filter'>
	@foreach ($columns as $key => $value)
        <th class='{{camel($key)}}'>{{$key}}</th>
    @endforeach
</tr>
