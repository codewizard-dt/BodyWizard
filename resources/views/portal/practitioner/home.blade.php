<div class='splash top vhIndicator' id='needle_tray_1'>
    <h1 class='purple shaded70'>Practitioner Launchpad</h1>
</div>
<?php 
$items = ['appointments-calendar','patients-index','chart-notes-index','new','indices'];
if (Auth::user()->email === 'david@bodywizardmedicine.com'){
	$items[] = 'artisan';
}
?>
@include('layouts.menus.portal-menu',[
	'menuName'=>'launchpadMenu',
	'items'=>$items
])