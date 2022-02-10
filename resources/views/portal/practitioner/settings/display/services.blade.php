<?php
use App\ServiceCategory;
use App\Service;
$serviceCategories = ServiceCategory::with('services')->orderBy('display_order')->get();
$serviceCategories = ($serviceCategories->count() == 0) ? [] : $serviceCategories;
?>
<h1 class="purple">Service Display Settings</h1>
<div id="ServiceOptions" class="displayOrder p-y-xsmall">
	<div>
		<h2>Display Order</h2>
		<div>These settings determine display order throughout the portal and website.</div>
	</div>
	<div class="column paddedSides">
		<h3>Categories</h3>
		<ul class="displayList" data-model='ServiceCategory'>
		@foreach($serviceCategories as $cat)
			<li data-target='service' data-uid='{{$cat->id}}'><span class="name">{{$cat->name}}</span><div class="UpDown"><div class="up"></div> <div class="down"></div></div></li>
		@endforeach	
		</ul>
	</div>
	<div class="column paddedSides">
		<h3>Services</h3>
		<ul class="displayList" id='ServiceList' data-model='Service'>
			<li class='service p-y-xsmall empty' data-condition='none'>Pick a category to order its services.</li>
			@foreach($serviceCategories as $cat)
				@foreach($cat->services as $service)
					<li class='service' data-condition='{{$cat->name}}' data-order='{{$service->Display Order}}' data-uid='{{$service->id}}'><span class="name">{{$service->name}}</span><div class="UpDown"><div class="up"></div> <div class="down"></div></div></li>
				@endforeach
			@endforeach	
		</ul>
	</div>
</div>
<div id="AutoSaveWrap" class="wrapper">
    <div id="AutoConfirm"><span class='message'>settings autosaved</span><span style="margin-left:10px" class="checkmark">✓</span></div>
</div>

<script type="text/javascript" src="{{ asset('/js/display-settings.js') }}"></script>
