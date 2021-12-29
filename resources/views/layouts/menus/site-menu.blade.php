<?php
use App\Practice;
$tabs = json_encode(session('CurrentTabs'));
$practice = Practice::first();
$practiceInfo = $practice ? $practice->navBarInfo() : null;
$user = Auth::check() ? Auth::user()->navBarInfo() : null;
?>

<div id='NavBar' class='flexbox spread' data-tabs="{{ $tabs }}" data-practice='{{ json_encode($practiceInfo) }}'
    data-user='{{ json_encode($user) }}'>
    <a href="/">
        <div class='logo'></div>
    </a>
    @include('layouts.menus.menu-bar',[
    "menu_name" => $menuName,
    'menu_data' => $menuData,
    'items' => $items,
    'type' => 'site'
    ])
</div>
