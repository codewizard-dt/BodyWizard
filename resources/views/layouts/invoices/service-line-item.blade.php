<?php 
$user = Auth::user();
$price = $service->price;
$classes = ['service'];
$settings = $service->settings;
$isAddOn = $service->is_addon;
// $description = $service->description_admin;

$data = [];
if ($isAddOn){
	$classes[] = 'addOn';
	$data[] = [
		'addOnPrice',
		isset($settings['add_on_price']) ? $settings['add_on_price'] : $service->price
	];
}else{
	$data[] = ['addOnPrice','null'];
}
$data[] = ['model','Service'];
$data[] = ['uid',$service->id];
// $data[] = ['price',$price];
?>
@include('layouts.invoices.line-item',
[
	'classes' => $classes,
	'data_attributes' => $data,
	'description' => $service->name,
	'price' => $price,
	'type' => 'service'
])