<html>
    <head>
        @include('layouts.header')
    </head>

    <body>
        @yield("content")
        
        @include('layouts.footer')



        <script
          src="https://code.jquery.com/jquery-3.3.1.min.js"
          integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
          crossorigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.min.js" integrity="sha256-H28SdxWrZ387Ldn0qogCzFiUDDxfPiNIyJX7BECQkDE=" crossorigin="anonymous"></script>
<!--         <script type="text/javascript" src="{{ asset('/js/app.js') }}"></script>
 -->
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
