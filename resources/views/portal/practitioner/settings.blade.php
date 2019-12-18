@extends('layouts.portal')

@section('content')
	<div class='splash top' id='needle-tray-1'>
	    <h1 class='purple shadow paddedSmall'>Portal and EHR Settings</h1>
	</div>
	@include('layouts.menus.portal-menu',[
		'menuName'=>'portalSettingsMenu',
		'items'=>['settings-panel','display-settings']
	])
@endsection