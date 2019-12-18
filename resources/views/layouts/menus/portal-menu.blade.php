<?php 
    // include_once app_path("/php/functions.php");
    $menuData = isset($menuData) ? $menuData : "PortalMenuList";
?>

@include('layouts.menus.menu-bar',[
    "menu_name" => $menuName,
    'menu_data' => $menuData,
    'items' => $items,
    'type' => 'portal'
])

<script type="text/javascript" src="{{ asset('/js/menus.js') }}"></script>