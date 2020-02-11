@extends('layouts.site')
@push('extracss')
    <link rel="stylesheet" type="text/css" href="{{ asset('/css/forms.css') }} ">
@endpush
@push('metadata')
<title>Body Wizard Portal Login</title>
<meta name='description' content="Login for the Body Wizard Portal for patient, practitioner, and staff">
<meta property='og:url' content="https://bodywizardmedicine.com/portal">
<meta property='og:title' content="Body Wizard Portal Login">
<meta property='og:description' content="Login for the Body Wizard Portal for patient, practitioner, and staff">
@endpush

@section('content')
<div class='splash top flexbox vhIndicator' id='shelf-2'>
    <div class="wrapper paddedBig">
        <div id="LoginForm">
            @csrf

            <h2 class='purple marginSmall bottomOnly'>Portal Login</h2>
            <p><span class='purple'>Username:</span><input name="username" id="username" type="text" required></p>
            <p><span class='purple'>Password:</span><input name="password" id="pw" type="password" required></p>
            <!-- <p><input type="checkbox" name="remember" id="remember">Remember Me</p> -->
            <span class='modalLink' data-window='body' data-link='#NewUser'>first time</span><br>
            <div class="button xsmall submit pink" data-form='#LoginForm'>log in</div>
            <div id='LoginStatus' class='wrapper'>
            </div>
            <div id="Block" style="display: block;z-index: 0"><div id="loading" class="lds-ring" style="opacity: 1; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); transition: opacity 400ms ease 0s;"><div></div><div></div><div></div><div></div></div></div>

        </div>
    </div>
</div>
<div id="ModalHome">
    <div id="Error" class='prompt'>
        <div class='message'></div>
        <div class='options'>
            <div class='button small submit pink'>send us an error report</div>
            <div class='button small cancel'>dismiss</div>
        </div>
    </div>
    <div id='NewUser' class='modalForm'>
    </div>
</div>
<input hidden id='recaptchaResponseLogin'>
<input hidden id='recaptchaResponseNewUser'>



@endsection

@section('scripts')
<script src="https://www.google.com/recaptcha/api.js?render=6LeJPaYUAAAAAO6p9yup5feAIH69h0iZI-bG4ddW"></script>
<script>
    grecaptcha.ready(function () {
        grecaptcha.execute('6LeJPaYUAAAAAO6p9yup5feAIH69h0iZI-bG4ddW', { action: 'login' }).then(function (token) {
            var recaptchaResponse = document.getElementById('recaptchaResponseLogin');
            recaptchaResponse.value = token;
        });
        grecaptcha.execute('6LeJPaYUAAAAAO6p9yup5feAIH69h0iZI-bG4ddW', { action: 'NewUser' }).then(function (token) {
            var recaptchaResponse = document.getElementById('recaptchaResponseNewUser');
            recaptchaResponse.value = token;
        });
        $(document).ready(function(){
            setTimeout(function(){
                unblurElement($("#loading"));
                $("#LoginStatus").show();
                $("#Block").remove();
            },2000)
        })
    });
</script>
<script type="text/javascript" src="{{ asset('/js/jquery.plugin.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/jquery.datepick.min.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/launchpad/forms.js') }}"></script>
<script type="text/javascript" src="{{ asset('/js/login.js') }}"></script>
@endsection