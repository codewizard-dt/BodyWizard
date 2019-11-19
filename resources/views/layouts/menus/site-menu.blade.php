<?php 
    include_once app_path("/php/functions.php");
	$tabs = json_encode(session('CurrentTabs'));
	$uids = json_encode(session('uidList'));
?>

<div id='NavBar'>
    <a href="/"><div class='logo'></div></a>
	@include('layouts.menus.menu-bar',[
	    "menu_name" => $menuName,
	    'menu_data' => $menuData,
	    'items' => $items,
	    'type' => 'site'
	])
</div>

<div id="tabList"> {{ $tabs }} </div>
<div id="uidList"> {{ $uids }} </div>

<script type="text/javascript" src="{{ asset('/js/menus.js') }}"></script>