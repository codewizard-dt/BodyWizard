        <footer id="footer">
            <span id='CheckmarkBlur' class='checkmark' style='display:none'><img src='/images/icons/checkmark_green.png'
                    style="width:3rem; height:3rem;"></span>
            <div class='copyright'>
                <?php echo 'Copyright 2013-' . date('Y') . ', Body Wizard Integrative Medicine Studio, David Taylor MS L.Ac.'; ?>
            </div>
            <script type='text/javascript' src="{{ asset('/js/app.js') }}"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.min.js"
                        integrity="sha256-H28SdxWrZ387Ldn0qogCzFiUDDxfPiNIyJX7BECQkDE=" crossorigin="anonymous"></script>
            <script type="text/javascript" src="{{ asset('/js/jquery.plugin.min.js') }}"></script>
            <script type="text/javascript" src="{{ asset('/js/scrollTo.js') }}"></script>
            <script type="text/javascript"
                        src="{{ asset('/js/jonthornton-jquery-timepicker-99bc9e3/jquery.timepicker.min.js') }}">
            </script>
            <script type="text/javascript" src="{{ asset('/js/jquery.datepick.min.js') }}"></script>
            <script type="text/javascript" src="{{ asset('/js/mark/jquery.mark.js') }}"></script>
            <script type='text/javascript' src="{{ asset('/js/summernote-lite.min.js') }}"></script>
            <script type='text/javascript' src="{{ asset('/js/jSignature.min.js') }}"></script>
            <script src="https://js.stripe.com/v3/"></script>

            @yield('scripts')

        </footer>
