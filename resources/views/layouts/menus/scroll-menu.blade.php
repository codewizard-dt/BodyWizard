<?php 
    include_once app_path("/php/functions.php");
?>

@include('layouts.menus.menu-bar',[
    "menu_name" => $menuName,
    'menu_data' => $menuData,
    'type' => 'scroll'
])