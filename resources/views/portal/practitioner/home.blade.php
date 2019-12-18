<div class='splash top' id='needle-tray-1'>
    <h1 class='purple white10 paddedSmall'>Practitioner Launchpad</h1>
</div>

@include('layouts.menus.portal-menu',[
	'menuName'=>'launchpadMenu',
	'items'=>['appointments-index','patients-home','diagnoses-home','botanicals-home','new','indices']
])