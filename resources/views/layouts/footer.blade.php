        <footer class='purple-bg white p-small'>
            <span id='CheckmarkBlur' class='checkmark' style='display:none'><img src='/images/icons/checkmark_green.png'
                    style="width:3rem; height:3rem;"></span>
            <div class="flexbox">
                <div class='logo notext_white m-small'></div>
                <div class="flexbox m-small-y">
                    <div class='left m-small-x'>
                        <h4 class='white'>1706 South Lamar Blvd</h4>
                        <a class='white' href='tel:5122560216'>512-256-0216</a><br>
                        <a class='white' href='mailto:info@bodywizardmedicine.com'>info@bodywizardmedicine.com</a>
                    </div>
                    <div class='left m-small-x'>
                        <h4 class='white'>Hours of Operation</h4>
                        <div class="flexbox spread">
                            <span>Mon-Thurs</span><span>9:00-8:00</span>
                        </div>
                        <div class="flexbox spread">
                            <span>Friday</span><span>9:00-3:00</span>
                        </div>

                    </div>

                </div>
                <div class='icons basis-third m-small'>
                    <a class='icon-social fb' href='http://facebook.com/bodywizardmedicine' target="_blank"></a>
                    <a class='icon-social ig' href='http://instagram.com/spiritwizardry' target='_blank'></a>
                    <a class='icon-social youtube' href='http://youtube.com/spiritwizardry' target='_blank'></a>
                </div>
            </div>
            <div class='m-medium-y button booknow pink '>BOOK AN APPOINTMENT</div>
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
