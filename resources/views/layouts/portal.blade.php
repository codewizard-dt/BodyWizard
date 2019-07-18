<!DOCTYPE html>
<html>
    <head>
        @push('extracss')
        <link rel="stylesheet" type="text/css" href="{{ asset('/css/forms.css') }} ">
        @endpush
        @include('layouts.header')
    </head>
    <?php $menuName = "Portal".ucfirst(Auth::user()->user_type) ?>
    <body>
        <div id='NavBar'>
            <a href="/"><div class='logo'></div></a>
            <div id='{{ $menuName }}' class="menuBar website siteMenu"
                 data-target="window" 
                 data-populated="no">
                <div id='MobileMenu'>
                    <div id='MenuToggle'></div>
                    <div id='MenuDisplay'></div>
                </div>
                @if ($usertype=='practitioner')
                <div id="lock" class="tab"><span class="title">Lock EHR</span></div>
                <div class='divide'></div>
                <div id="logout" class="tab"><span class="title">Log Out</span></div>
                @elseif ($usertype=='patient')
                <div id="about" class="tab"><span class="title">About</span></div>
                <div id="services" class="tab"><span class="title">What + How</span></div>
                <div class='divide'></div>
                <div id="logout" class="tab"><span class="title">Log Out</span></div>
                <div id="booknow" class="tab"><span class="title">Book Now</span></div>
                @elseif ($usertype='admin')
                <div id="lock" class="tab"><span class="title">Lock EHR</span></div>
                <div class='divide'></div>
                <div id="logout" class="tab"><span class="title">Log Out</span></div>
                @endif
            </div>
            <form style='display:none' id='logoutForm' action='/logout' method='POST'>
                @csrf
            </form>
        </div>
        
        @yield("content")
        

        @include('layouts.footer-simple')

        <script
          src="https://code.jquery.com/jquery-3.3.1.min.js"
          integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
          crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.min.js" integrity="sha256-H28SdxWrZ387Ldn0qogCzFiUDDxfPiNIyJX7BECQkDE=" crossorigin="anonymous"></script>
        <script type="text/javascript" src="{{ asset('/js/functions.js') }}"></script>
    <script type="text/javascript" src="{{ asset('/js/scrollTo.js') }}"></script>
    <script type="text/javascript" src="{{ asset('/js/menu.js') }}"></script>
    <script type="text/javascript" src="{{ asset('/js/menu-portal.js') }}"></script>
    <script type="text/javascript" src="{{ asset('/js/jonthornton-jquery-timepicker-99bc9e3/jquery.timepicker.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('/js/jquery.plugin.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('/js/jquery.datepick.min.js') }}"></script>
    <script type="text/javascript" src="{{ asset('/js/mark/jquery.mark.js') }}"></script>
    <script type='text/javascript' src="{{ asset('/js/summernote-lite.min.js') }}"></script>


        @yield('scripts')

    </body>
</html>
