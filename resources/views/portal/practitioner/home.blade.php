<div class='splash top' id='needle-tray-1'>
    <h1 class='purple shaded70'>Practitioner Launchpad</h1>
</div>
<?php 
$items = ['appointments-index','patients-index','chart-notes-index','new','indices'];
if (Auth::user()->email === 'david@bodywizardmedicine.com'){
	$items[] = 'artisan';
}
?>
@include('layouts.menus.portal-menu',[
	'menuName'=>'launchpadMenu',
	'items'=>$items
])