<?php 
	use App\Practice;
	$type = Auth::user()->user_type;
	if ($type == 'patient'){
		setUid('Patient', Auth::user()->patientInfo->id);
	}
	$tabs = json_encode(session('CurrentTabs'));
	$practice = Practice::getFromSession();
	$practiceInfo = $practice ? $practice->navBarInfo() : null;
?>

<div id='NavBar' data-initialtabs="{{$tabs}}" data-practiceinfo='{{json_encode($practiceInfo)}}'>
    <a href="/"><div class='logo'></div></a>
	@include('layouts.menus.menu-bar',[
	    "menu_name" => $menuName,
	    'menu_data' => $menuData,
	    'items' => $items,
	    'type' => 'site'
	])
</div>