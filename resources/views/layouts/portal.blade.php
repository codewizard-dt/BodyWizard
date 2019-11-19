<!DOCTYPE html>
<?php 
    include_once app_path("/php/functions.php");
    $usertype = Auth::user()->user_type;
    if ($usertype == 'practitioner'){
        $menuData = "PortalPractitioner";
        $menuName = "PortalPractitioner";
        $items = ['home','divide','lock-ehr','logout'];
    }elseif ($usertype == 'patient'){
        $menuData = "PortalPatient";
        $menuName = "PortalPatient";
        $items = ['booknow','divide','logout'];
    }
?>
<html>
    <head>
        @push('extracss')
        <link rel="stylesheet" type="text/css" href="{{ asset('/css/forms.css') }} ">
        @endpush
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
                    <div class='button small submit pink'>send us an error report</div>
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
            <div id="Confirm" class='prompt'>
                <div class='message'></div>
                <div class='options'>
                    <div class='button small submit pink confirmY'>confirm</div>
                    <div class='button small cancel confirmN'>dismiss</div>
                </div>
            </div>
            <div id="Refresh" class='prompt'>
                <div class="message">
                    <h2>Session Timeout</h2>
                    <div>It's been too long! Let's log in again. You'll be automatically redirected shortly.<br>If not redirected, click below to reload.</div>
                </div>
                <div class="options">
                    <div class="button pink medium">Click here to manually refresh</div>
                </div>
            </div>
        </div>

        @include('layouts.footer-simple')

        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.min.js" integrity="sha256-H28SdxWrZ387Ldn0qogCzFiUDDxfPiNIyJX7BECQkDE=" crossorigin="anonymous"></script>
        <script type="text/javascript" src="{{ asset('/js/functions.js') }}"></script>
        <script type="text/javascript" src="{{ asset('/js/launchpad/launchpad.js') }}"></script>
        <script type="text/javascript" src="{{ asset('/js/scrollTo.js') }}"></script>
        <script type="text/javascript" src="{{ asset('/js/menus.js') }}"></script>
        <!-- <script type="text/javascript" src="{{ asset('/js/menus.js') }}"></script> -->
        <script type="text/javascript" src="{{ asset('/js/jonthornton-jquery-timepicker-99bc9e3/jquery.timepicker.min.js') }}"></script>
        <script type="text/javascript" src="{{ asset('/js/jquery.plugin.min.js') }}"></script>
        <script type="text/javascript" src="{{ asset('/js/jquery.datepick.min.js') }}"></script>
        <script type="text/javascript" src="{{ asset('/js/mark/jquery.mark.js') }}"></script>
        <script type='text/javascript' src="{{ asset('/js/summernote-lite.min.js') }}"></script>


        @yield('scripts')

    </body>
</html>
