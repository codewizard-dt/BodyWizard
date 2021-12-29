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
    @include('layouts.menus.site-menu',
    [
    'items' => $items,
    'menuName' => "SiteMenu",
    'menuData' => $menuData
    ]
    )

    @yield("content")
    @include('layouts.footer')

</body>

</html>
