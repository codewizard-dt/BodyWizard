@extends('layouts.site')
@push('metadata')
    <title>Body Wizard Portal Login</title>
    <meta name='description' content="Login for the Body Wizard Portal for patient, practitioner, and staff">
    <meta property='og:url' content="https://bodywizardmedicine.com/portal">
    <meta property='og:title' content="Body Wizard Portal Login">
    <meta property='og:description' content="Login for the Body Wizard Portal for patient, practitioner, and staff">
@endpush

@section('content')
    @php
    use App\Input;
    $message = request()->logout_reason ? "You've been logged out " . request()->logout_reason : "You've been logged out";

    @endphp

    <div class='splash flexbox fit-container' id='shelf_2'>

        <div class="wrapper p-large-y">
            <div id="LoginForm" class='box p-small-y p-large-x'>
                @csrf

                <h2 class='purple central'>Portal Login</h2>

                @include('layouts.forms.display.answer',[
                'type' => 'username',
                'options' => [
                'preLabel' => 'Username:',
                'labelCss' => ['width'=>'5em','textAlign'=>'right'],
                'eleClass' => '!left nowrap'
                ],
                'name' => 'username'
                ])

                @include('layouts.forms.display.answer',[
                'type' => 'password',
                'options' => [
                'preLabel' => 'Password:',
                'labelCss' => ['width'=>'5em','textAlign'=>'right'],
                'eleClass' => '!left nowrap'
                ],
                'name' => 'password'
                ])
                <a class='modalLink text-small' data-window='body' data-link='#NewUser'>first time</a><br>
                <div class="button submit pink small" data-action='system.user.login'>log in</div>
                <input hidden id='recaptchaResponseLogin'>
                <input hidden id='recaptchaResponseNewUser'>
            </div>
        </div>
    </div>
@endsection
