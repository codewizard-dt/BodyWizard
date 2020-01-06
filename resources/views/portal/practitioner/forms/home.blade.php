<?php 
    // include_once app_path("/php/functions.php");
?>
@include('layouts.menus.menu-bar',[
    "menu_name" => 'formsMenu',
    'menu_data' => 'PortalMenuList',
    'items' => [
        'forms-index', 'forms-edit','forms-create'
    ]
])

<!-- <script type="text/javascript">$(document).ready(function(){initializeNewMenus();})</script> -->