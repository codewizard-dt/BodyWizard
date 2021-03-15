@extends('layouts.portal')

@section ('content')
	<div class='splash top' id='needle_tray_1'>
	    <h1 class='purple shaded70 paddedXSmall'>Practice Settings</h1>
	</div>
	@include('layouts.menus.portal-menu',[
		"menuName" => 'practiceSettings',
		"items" => ['practice-contact','practice-hours','practice-legal']
	])
@endsection