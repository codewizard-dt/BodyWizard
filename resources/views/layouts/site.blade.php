<!DOCTYPE html>
<?php
// include_once app_path("/php/functions.php");
$menuData = 'SiteMenu';
// $siteMenu = $menuJson[$menuData];
if (Auth::guest()) {
    $items = ['about', 'what_how', 'portal_login', 'divide', 'booknow'];
    $tabs = 'no session';
} elseif (Auth::user()) {
    $items = ['about', 'what_how', 'divide', 'logout', 'portal_home'];
    $tabs = json_encode(session('CurrentTabs'));
    $uids = json_encode(session('uidList'));
}
?>
<html>

<head>
    @include('layouts.header')
</head>

<body>
    <div id="App" class='flexbox column stretch'>
        <div id="Nav">
            @include('layouts.menus.site-menu',
            [
            'items' => $items,
            'menuName' => "SiteMenu",
            'menuData' => $menuData
            ]
            )
        </div>
        <div id="Content" class='grow-1 flexbox column stretch'>
            @yield("content")
        </div>
        @include('layouts.modal-home')
        @include('layouts.footer',['contact_info'=>true])
    </div>
</body>

</html>
