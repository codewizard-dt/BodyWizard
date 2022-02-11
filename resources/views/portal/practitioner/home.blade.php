<div class='splash vhIndicator' id='needle_tray_1'>
    <h1 class='purple shaded70'>Practitioner Launchpad</h1>
</div>
<?php
$items = ['appointments-calendar', 'patients-index', 'chart-notes-index', 'forms-home', 'new', 'indices'];
if (Auth::user()->is_superuser) {
    $items[] = 'artisan';
}
?>
@include('layouts.menus.portal-menu',[
'menuName'=>'launchpadMenu',
'items'=>$items
])
