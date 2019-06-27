<!DOCTYPE html>
<html>
    <head>
        @include('layouts.header')
    </head>

    <body>
        <div id='NavBar'>
            <a href="/"><div class='logo'></div></a>
            <div id='SiteMenu' class="menuBar website siteMenu"
                 data-target="window" 
                 data-populated="no">
                <div id='MobileMenu'>
                    <div id='MenuToggle'></div>
                    <div id='MenuDisplay'></div>
                </div>
                <div id="about" class="tab"><span class="title">About</span></div>
                <div id="services" class="tab"><span class="title">What + How</span></div>
                @if (Auth::guest())
                    <div id="portal" class="tab"><span class="title">Log In</span></div>
                @elseif (Auth::user())
                    <div id="portal" class="tab"><span class="title">Portal</span></div>
                    <div id="logout" class="tab"><span class="title">Log Out</span></div>
                @endif
                <div class='divide'></div>
                <div id="booknow" class="tab"><span class="title">Book Now</span></div>
            </div>
        </div>
        @yield("content")
        @include('layouts.footer')

<script
  src="https://code.jquery.com/jquery-3.3.1.min.js"
  integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
  crossorigin="anonymous"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.min.js" integrity="sha256-H28SdxWrZ387Ldn0qogCzFiUDDxfPiNIyJX7BECQkDE=" crossorigin="anonymous"></script>
 <script type="text/javascript" src="{{ asset('/js/functions.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/normal-site.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/toggles.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/scrollTo.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/menu.js') }}"></script>

<script type="text/javascript" src="{{ asset('/js/mark/jquery.mark.min.js') }}"></script>
<script type='text/javascript' src="{{ asset('/js/jonthornton-jquery-timepicker-99bc9e3/jquery.timepicker.min.js') }}"></script>

        @yield('scripts')

    </body>
</html>
