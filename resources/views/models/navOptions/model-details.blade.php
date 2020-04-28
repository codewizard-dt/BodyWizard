

<div class="split3366KeyValues">
@foreach($details as $attr => $val)
    @if (is_array($val))
        <div class='label {{camel($attr)}}'>{{$attr}}</div>
        <div class='value {{camel($attr)}}'>
        @foreach ($val as $k => $v)
            <div>
                @if (!is_numeric($k))
                    <span class='bold'>{{$k}}: </span>
                @endif
                @if (is_string($v))
                    <span>{!!$v!!}</span>
                @elseif (isset($v['text']))
                    <span>
                        {!!(isset($v['title']) ? '<span class="bold">'.$v['title'].'</span>:' : "")!!} {{$v['text']}}
                    </span>
                @else
                    <?php var_dump($v); ?>
                @endif
            </div>
        @endforeach
        </div>           
    @else
        <div class='label {{camel($attr)}}'>{{$attr}}</div><div class='value {{camel($attr)}}'>{!!$val!!}</div>
    @endif
@endforeach
</div>