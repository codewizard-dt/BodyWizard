

<div class="split3366KeyValues">
  @foreach($details as $attr => $value)
  @if (is_array($value))
  <div class='label {{camel($attr)}}'>{{$attr}}</div>
  <div class='value {{camel($attr)}}'>
    @foreach ($value as $key => $val)
      @if ($attr == 'Pinned Notes')
        <div>@if(isset($val['title']))<span class='bold'>{{$val['title']}}: </span>@endif<span>{{$val['text']}}</span></div>
      @else
        <div>
          @if (!is_numeric($key))<span class='bold'>{{$key}}: </span> @endif
          {!!handleModelDetail($val)!!}
        </div>
      @endif
    @endforeach
  </div>           
  @else
  <div class='label {{camel($attr)}}'>{{$attr}}</div><div class='value {{camel($attr)}}'>{!!$value!!}</div>
  @endif
  @endforeach
</div>