<!DOCTYPE html>
<?php
use Illuminate\Support\Facades\Log;

$user = Auth::user();
$usertype = $user->user_type;
if ($usertype == 'practitioner') {
    $menuData = 'PortalPractitioner';
    $menuName = 'PortalPractitioner';
    $items = ['home', 'notifications', 'divide', 'lock-ehr', 'logout'];
} elseif ($usertype == 'patient') {
    $menuData = 'PortalPatient';
    $menuName = 'PortalPatient';
    $items = ['booknow', 'notifications', 'divide', 'logout'];
}
$form = new \App\Form();
$optionsEmail = ['name' => 'email', 'placeholder' => 'Your Email Address'];
$optionsMsg = ['name' => 'errorMsg', 'placeholder' => 'Please include any relevant details, as well as any other way we can help.'];
?>
<html>

<head>
    @include('layouts.header')
</head>

<body>
    <div id="App" class='flexbox column stretch'>
        <div id="Nav" class='flexbox column stretch'>
            @include('layouts.menus.site-menu',
            [
            'items' => $items,
            'menuName' => $menuName,
            'menuData' => $menuData
            ]
            )

        </div>
        <div id="Content" class='grow-1 flexbox column stretch'>
            <div class='grow-1 w-max-100'>
                <form style='display:none' id='logoutForm' action='/logout' method='POST'>
                    @csrf
                </form>

                @yield("content")

            </div>

        </div>
        @include('layouts.modal-home')
        @include('layouts.footer',['contact_info'=>false])
    </div>
</body>

</html>
