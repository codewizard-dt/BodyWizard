<!DOCTYPE html>
<?php 
    use Illuminate\Support\Facades\Log;

    $user = Auth::user();
    $usertype = $user->user_type;
    if ($usertype == 'practitioner'){
        $menuData = "PortalPractitioner";
        $menuName = "PortalPractitioner";
        $items = ['home','notifications','divide','lock-ehr','logout'];
    }elseif ($usertype == 'patient'){
        $menuData = "PortalPatient";
        $menuName = "PortalPatient";
        $items = ['booknow','notifications','divide','logout'];
    }
    $form = new \App\Form;
    $optionsEmail = ['name'=>'email','placeholder'=>'Your Email Address'];
    $optionsMsg = ['name'=>'errorMsg','placeholder'=>'Please include any relevant details, as well as any other way we can help.'];
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

        @include('layouts.forms.autosave-wrap')
        @yield("content")
        
        <div id='ModalHome'>
            <div id="Error" class='prompt'>
                <div class='message'></div>
                <div class='options'>
                    <div class='button small openErrorMsg pink'>send us a message</div>
                    <div class='button small cancel'>dismiss</div>
                </div>
            </div>
            <div id="ErrorMessageFromClient" class='prompt'>
                <div class="message">
                    <h2 class="purple">Send Us a Message</h2>
                    <div>
                        {{$form->answerDisp('text',$optionsEmail)}}
                        {{$form->answerDisp('text box',$optionsMsg)}}
                    </div>
                </div>
                <div class="options">
                    <div class="button small pink sendErrorMsg">send</div>
                    <div class="button small cancel">cancel</div>
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
                    <div>It's been too long! Let's log in again. You'll be automatically redirected shortly.<br>If not redirected, click below to reload.</div>
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

            <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-color/2.1.2/jquery.color.min.js" integrity="sha256-H28SdxWrZ387Ldn0qogCzFiUDDxfPiNIyJX7BECQkDE=" crossorigin="anonymous"></script>
            <script type="text/javascript" src="{{asset('/js/functions.js')}}"></script>
            <script type="text/javascript" src="{{asset('/js/launchpad/launchpad.js')}}"></script>
            <script type="text/javascript" src="{{asset('/js/scrollTo.js')}}"></script>
            <script type="text/javascript" src="{{asset('/js/menus.js')}}"></script>
            <script type="text/javascript" src="{{asset('/js/jonthornton-jquery-timepicker-99bc9e3/jquery.timepicker.min.js')}}"></script>
            <script type="text/javascript" src="{{asset('/js/jquery.plugin.min.js')}}"></script>
            <script type='text/javascript' src="{{asset('/js/moment.js')}}"></script>
            <script type='text/javascript' src="{{asset('/js/moment-timezone-with-data-10-year-range.js')}}"></script>
            <script type="text/javascript" src="{{asset('/js/jquery.datepick.min.js')}}"></script>
            <script type="text/javascript" src="{{asset('/js/mark/jquery.mark.js')}}"></script>
            <script type='text/javascript' src="{{asset('/js/summernote-lite.min.js')}}"></script>
            <script type='text/javascript' src='{{asset("/js/launchpad/forms.js")}}'></script>
            <script type='text/javascript' src='{{asset("/js/launchpad/chartnotes.js")}}'></script>
            <script type='text/javascript' src='{{asset("/js/launchpad/invoices.js")}}'></script>
            <script type='text/javascript' src="{{asset('/js/launchpad/save-model.js')}}"></script>
            <script type='text/javascript' src="{{asset('/js/launchpad/model-table.js')}}"></script>
            <script type='text/javascript' src="{{asset('/js/launchpad/model-settings.js')}}"></script>
            <script type='text/javascript' src="{{asset('/js/jSignature.min.js')}}"></script>
            <script src="https://js.stripe.com/v3/"></script>
            @include ('schedules.scripts')
        @yield('scripts')

    </body>
</html>
