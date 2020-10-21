<?php 
    $menuData = isset($menuData) ? $menuData : "PortalTabOptions";
?>

@include('layouts.menus.menu-bar',[
    "menu_name" => $menuName,
    'menu_data' => $menuData,
    'items' => $items,
    'type' => 'portal'
])
