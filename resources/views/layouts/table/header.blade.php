<tr class='head'>
	@foreach ($columns as $key => $value)
        <th class='{{camel($key)}}'>{{$key}}</th>
    @endforeach
</tr>
