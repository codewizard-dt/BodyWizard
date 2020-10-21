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
<!--             <p><span class='purple'>Username:</span><input name="username" id="username" type="text" required></p>
            <p><span class='purple'>Password:</span><input name="password" id="pw" type="password" required></p>
 -->            @include('layouts.forms.display.answer',[
                'type' => 'text',
                'options' => [
                    'preLabel' => 'Username:',
                    'labelCss' => ['width'=>'5em','textAlign'=>'right'],
                    'labelHtmlTag' => 'h4',
                    'inputCss' => ['maxWidth'=> '12em'],
                    'eleClass' => '!left'
                ],
                'name' => 'username'
            ])
            @include('layouts.forms.display.answer',[
                'type' => 'password',
                'options' => [
                    'preLabel' => 'Password:',
                    'labelCss' => ['width'=>'5em','textAlign'=>'right'],
                    'labelHtmlTag' => 'h4',
                    'inputCss' => ['maxWidth'=> '12em'],
                    'eleClass' => '!left'
                ],
                'name' => 'password'
            ])
            <!-- <p><input type="checkbox" name="remember" id="remember">Remember Me</p> -->
            <span class='modalLink' data-window='body' data-link='#NewUser'>first time</span><br>
            <div class="button xsmall submit pink" data-action='system.user.login'>log in</div>
            <div id='LoginStatus' class='wrapper'>
            </div>
            

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

