@extends("layouts.portal")

@push('metadata')
<title>Body Wizard User Settings</title>
<meta name='description' content="Bringing Scientific Rigor to the Practice of Chinese Medicine">
<meta property='og:url' content="https://bodywizardmedicine.com/portal">
<meta property='og:title' content="Body Wizard User Settings">
<meta property='og:description' content="Bringing Scientific Rigor to the Practice of Chinese Medicine">
@endpush

@section('content')
<div class='splash' id='needle_tray_1'>
    <h1 class='purple shaded10 p-y-50'>User Settings</h1>
</div>
@include('layouts.menus.portal-menu',[
	'menuName'=>'settingsMenu',
	'menuData'=>'UserSettings',
	'items'=>['general-info','security']
])
@endsection
