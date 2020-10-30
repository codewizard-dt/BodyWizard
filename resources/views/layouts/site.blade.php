<!DOCTYPE html>
<?php 
    // include_once app_path("/php/functions.php");
    $menuData = "SiteMenu";
    // $siteMenu = $menuJson[$menuData];
    if (Auth::guest()){
        $items = ['about','what_how','portal_login','divide','booknow'];
        $tabs = "no session";
    }elseif (Auth::user()){
        $items = ['about','what_how','divide','logout','portal_home'];
        $tabs = json_encode(session('CurrentTabs'));
        $uids = json_encode(session('uidList'));
    }
?>
<html>
    <head>
        @include('layouts.header')
    </head>

    <body>
        @include('layouts.menus.site-menu',
            [
                'items' => $items,
                'menuName' => "SiteMenu",
                'menuData' => $menuData
            ]
        )

        @yield("content")
        @include('layouts.footer')

        <script type='text/javascript' src="{{asset('/js/app.js')}}"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.min.js" integrity="sha256-H28SdxWrZ387Ldn0qogCzFiUDDxfPiNIyJX7BECQkDE=" crossorigin="anonymous"></script>
        <script type="text/javascript" src="{{asset('/js/jquery.plugin.min.js')}}"></script>
        <!-- <script type="text/javascript" src="{{asset('/js/functions.js')}}"></script> -->
        <script type="text/javascript" src="{{asset('/js/scrollTo.js')}}"></script>
        <script type="text/javascript" src="{{asset('/js/jonthornton-jquery-timepicker-99bc9e3/jquery.timepicker.min.js')}}"></script>

        <!-- <script type='text/javascript' src="{{asset('/js/moment.js')}}"></script> -->
        <!-- <script type='text/javascript' src="{{asset('/js/moment-timezone-with-data-10-year-range.js')}}"></script> -->
        @include ('schedules.scripts')
        <script type="text/javascript" src="{{asset('/js/jquery.datepick.min.js')}}"></script>
        <script type="text/javascript" src="{{asset('/js/mark/jquery.mark.js')}}"></script>
        <script type='text/javascript' src="{{asset('/js/summernote-lite.min.js')}}"></script>
        <!-- <script type='text/javascript' src='{{asset("/js/launchpad/forms.js")}}'></script> -->
        <!-- <script type='text/javascript' src="{{asset('/js/launchpad/models.js')}}"></script> -->
        <script type='text/javascript' src="{{asset('/js/jSignature.min.js')}}"></script>
        <script src="https://js.stripe.com/v3/"></script>

        @yield('scripts')

    </body>
</html>
