<div class='splash top' id='needle-tray-1'>
    <h1 class='purple white10 paddedSmall'>Practitioner Launchpad</h1>
</div>
<?php 
$items = ['appointments-index','patients-home','chart-notes-index','new','indices'];
if (Auth::user()->email === 'david@bodywizardmedicine.com'){
	$items = ['appointments-index','patients-home','chart-notes-index','new','indices','artisan'];
}
?>
@include('layouts.menus.portal-menu',[
	'menuName'=>'launchpadMenu',
	'items'=>$items
])