<?php

use App\Service;
use App\ServiceCategory;
use App\Form;
use Illuminate\Support\Facades\Auth;

$usertype = Auth::user()->user_type;

$services = Service::orderBy('service_category_id','asc')->orderBy('display_order','asc')->get();
$categories = ServiceCategory::orderBy('display_order','asc')->get();

$serviceArr = $services->map(function($service) use($usertype){
	$description = ($usertype == "patient") ? "description_calendar" : "description_admin";
	return [
		"id" => $service->id,
		"name" => $service->name,
		"duration" => $service->duration,
		"service_category_id" => $service->service_category_id,
		"description" => $service->$description,
		"price" => $service->price,
		"is_addon" => $service->is_addon,
		"addon_only" => $service->addon_only,
		"addon_services" => $service->addon_services,
		"new_patients_ok" => $service->new_patients_ok,
		"new_patients_only" => $service->new_patients_only
	];
})->toArray();
$serviceNames = $services->map(function($service){
	return $service->name;
})->toArray();
$categoryArr = $categories->map(function($category){
	return [
		"id" => $category->id,
		"name" => $category->name,
		"description" => $category->description,
		"display_order" => $category->Display Order
	];
})->toArray();
$categoryNames = $categories->map(function($category){
	return $category->name;;
})->toArray();

$serviceNames[] = "ID*services";
$categoryNames[] = "ID*categories";
$ctrl = new Form;
$serviceCategoryLabel = ($usertype == 'patient') ? "Service Type" : "Service Category";
?>
<div id="SelectServices" class='progressiveSelection selector toModalHome'>
	<div class="progressBar">
		<div class='back'>
			<div class="left"></div><div class="message"></div>
		</div>
	</div>
	<div id="CategoryDetails" class='step' data-name='categories' data-details="{{json_encode($categoryArr)}}">
		<div id="NoServicesAvailable">
			<h2 class='purple center' style='text-align: center;'>No additional services available</h2>
		</div>	
		<h2 class='purple center' style='text-align: center;' data-default='{{$serviceCategoryLabel}}'>{{$serviceCategoryLabel}}</h2>
		<div class='pink conditionalLabel'></div>
		{{$ctrl->answerDisp('radio',$categoryNames)}}
	</div>
	<div id="ServiceDetails" class='step' data-name='services' data-details="{{json_encode($serviceArr)}}">
		<h2 class='purple center' style='text-align: center;' data-default='Services'>Services</h2>
		<div class='pink conditionalLabel'></div>
		{{$ctrl->answerDisp('radio',$serviceNames)}}
		<div id='ServiceDescription'><div class="message"></div><div id='SelectServiceBtn' class="button xsmall pink">confirm</div></div>
	</div>
	<div id="ServiceSummary" class='step noBack'>
		<h2 class='purple center' style='text-align: center;' data-default='Services'>Services Summary</h2>
		<h3 class="summary pink"></h3>
		<div class='options'>
			<div class="button small pink70 add">add more services</div>
			<div class="button small pink70 remove">remove service</div>
		</div>
	</div>
</div>

