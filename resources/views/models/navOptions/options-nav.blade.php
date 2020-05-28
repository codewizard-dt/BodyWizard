@if (isset($instance))
	<div class="optionsNavWrapper">
		<h3 class="optionsNavHeader purple paddedSmall topOnly">{{$instance->name}}</h3>
		<div id="Current{{$model}}" class="optionsNav {{$extraClasses}}" data-model="{{$model}}" data-uid="{{$instance->getKey()}}">
			<div class="navHead">
				<span class="optionsBar">
					<span class="name" data-uid="{{$instance->getKey()}}" @foreach ($dataAttrs as $data) data-{{$data['key']}}="{{$data['value']}}"@endforeach></span>
				</span>
			</div>
			<div class="navDetails">
				<div class="navOptionsToggle down">
					<div class="arrow"></div>
				</div>
				@include ('models.navOptions.nav-buttons',['buttons'=>$buttons])
				@include ('models.navOptions.model-details',['details'=>$instance->modelDetails()])
			</div>
			<div class="navOptionsToggle down">
				<span class="label">more</span>
				<div class="arrow"></div>
			</div>
		</div>
		
	</div>
@else
	<div class="optionsNavWrapper">
		<h3 class="optionsNavHeader purple paddedSmall topOnly"></h3>
		<div class="optionsNav"></div>
		
	</div>
@endif