@extends('layouts.site')
@push('metadata')
<title>Body Wizard Portal Login</title>
<meta name='description' content="Login for the Body Wizard Portal for patient, practitioner, and staff">
<meta property='og:url' content="https://bodywizardmedicine.com/portal">
<meta property='og:title' content="Body Wizard Portal Login">
<meta property='og:description' content="Login for the Body Wizard Portal for patient, practitioner, and staff">
@endpush

@section('content')
<div class='splash top full flexbox vhIndicator' id='shelf_2'>
    <div class="wrapper paddedBig">
        <div id="LoginForm" class='box'>
            @csrf

            <h2 class='purple marginSmall bottomOnly'>Portal Login</h2>
            @include('layouts.forms.display.answer',[
                'type' => 'text',
                'options' => [
                    'preLabel' => 'Username:',
                    'labelCss' => ['width'=>'5em','textAlign'=>'right'],
                    'labelHtmlTag' => 'h4',
                    'input_css' => ['maxWidth'=> '12em'],
                    'eleClass' => '!left nowrap'
                ],
                'name' => 'username'
            ])
            @include('layouts.forms.display.answer',[
                'type' => 'password',
                'options' => [
                    'preLabel' => 'Password:',
                    'labelCss' => ['width'=>'5em','textAlign'=>'right'],
                    'labelHtmlTag' => 'h4',
                    'input_css' => ['maxWidth'=> '12em'],
                    'eleClass' => '!left nowrap'
                ],
                'name' => 'password'
            ])
            <!-- <p><input type="checkbox" name="remember" id="remember">Remember Me</p> -->
            <a class='modalLink' data-window='body' data-link='#NewUser'>first time</a><br>
            <div class="button submit pink" data-action='system.user.login'>log in</div>
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

