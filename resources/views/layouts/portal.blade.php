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
    @include('layouts.menus.site-menu',
    [
    'items' => $items,
    'menuName' => $menuName,
    'menuData' => $menuData
    ]
    )

    <form style='display:none' id='logoutForm' action='/logout' method='POST'>
        @csrf
    </form>

    @yield("content")

    <div id='ModalHome'>
        <div id="Error" class='prompt'>
            <div class='message'></div>
            <div class='options'>
                <div class='button small openErrorMsg pink'>send us a message</div>
                <div class='button small cancel'>dismiss</div>
            </div>
        </div>
        <div id="Feedback" class='prompt'>
            <div class='message'></div>
            <div class='options'>
                <div class='button small cancel'>dismiss</div>
            </div>
        </div>
        <div id="Warn" class='prompt'>
            <div class='message'></div>
            <div class='options'>
                <div class='button large submit pink confirmY'>YES</div>
                <div class='button large cancel confirmN'>cancel</div>
            </div>
        </div>
        <div id="Confirm" class='prompt large'>
            <div class='message'></div>
            <div class='options'>
                <div class='button small submit pink confirmY'>confirm</div>
                <div class='button small cancel confirmN'>dismiss</div>
            </div>
        </div>
        <div id="Refresh" class='prompt'>
            <div class="message">
                <h2>Session Timeout</h2>
                <div>It's been too long! Let's log in again. You'll be automatically redirected shortly.<br>If not
                    redirected, click below to reload.</div>
            </div>
            <div class="options">
                <div class="button pink medium">Click here to manually refresh</div>
            </div>
        </div>
        <div id="Notification" class='prompt large'>
            <div class="message"></div>
            <div class="options">
                <div style='display:inline-block;'>
                    <div class="button small pink markThisAsUnread">mark as unread</div>
                    <div class="button small pink deleteThis">delete notification</div>
                </div>
                <div style='display:inline-block;' class="tempBtns"></div>
                <div class="button small cancel">go back</div>
            </div>
        </div>
    </div>



    @include('layouts.footer-simple')

</body>

</html>
