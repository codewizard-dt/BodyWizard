<div id="Filters">
    @forelse ($filters as $label => $options)
	    <div class='filter' data-target='{{$tableId}}' data-filter='{{camel($label)}}' data-type='data'>{{$label}}: 
	    	@foreach ($options as $key => $attr)
		    	<label><input type='checkbox' class='tableFilter' data-value='{{camel($key)}}'>{{$key}}</label>
	    	@endforeach
		</div>
    @empty
    @endforelse

    <div class='filter' data-target='{{$tableId}}' data-filter='textsearch' data-options='{"wholeWords":"false","separateWords":"true"}' data-type='text'><input class='tableSearch' type='text' data-filter='all' placeholder='Search'></div>
</div>
