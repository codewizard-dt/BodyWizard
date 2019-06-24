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
                    <!-- <div id="portal" class="tab"><span class="title">Log In</span></div> -->
                @elseif (Auth::user())
                    <!-- <div id="portal" class="tab"><span class="title">Portal</span></div>
                    <div id="logout" class="tab"><span class="title">Log Out</span></div> -->
                @endif
                <div class='divide'></div>
                <div id="booknow" class="tab"><span class="title">Book Now</span></div>
            </div>
        </div>
        @yield("content")
        <footer id="footer">
            <div class='logo white'></div>
            <div class='contact'>
                <h4 class='white'>1706 South Lamar Blvd</h4>
                512-514-3706<br>
                info@bodywizard.studio
            </div>
            <div class='hours'>
                <h4 class='white'>Hours of Operation</h4>
                <span>Mon-Thurs</span>9:00-8:00<br>
                <span>Friday</span>9:00-3:00
            </div>
            <div class='icons'>
                <a href='http://facebook.com/bodywizardmedicine' target="_blank"><div id='fb'></div></a>
                <a href='http://instagram.com/spiritwizardry' target='_blank'><div id='ig'></div></a>
                <a href='http://youtube.com/spiritwizardry'><div id='youtube'></div></a>
            </div>
            <br>
            <div class='button booknow pink small'>BOOK AN APPOINTMENT</div>
            <div class='copyright'>
                <?php echo "Copyright 2013-" . date("Y") . ", Body Wizard Integrative Medicine Studio, David Taylor MS L.Ac." ?>
            </div>
            
        </footer>




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
