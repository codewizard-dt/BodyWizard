@extends('layouts.portal')

@section('content')
	<div class='splash' id='needle_tray_1'>
	    <h1 class='purple shadow p-y-50'>Portal and EHR Settings</h1>
	</div>
	@include('layouts.menus.portal-menu',[
		'menuName'=>'portalSettingsMenu',
		'items'=>['settings-panel','display-settings']
	])
@endsection