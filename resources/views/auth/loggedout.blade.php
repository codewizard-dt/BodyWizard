@extends('layouts.site')

@section('content')
    <?php
    $logout = request('logout', false);
    $message = request()->logout_reaoson ? "You've been logged out " . request()->logout_reason : "You've been logged out";
    ?>
    <div class='splash full flexbox vhIndicator' id='shelf_2'>
        @if ($logout)
            <div class="box pink">{{ $message }}</div>
        @endif
        <div class="wrapper p-y-150">
            <div id="LoginForm" class="box">
                <h2>{{ $message }}</h2>
                <a href='/portal'>
                    <div class='pink70 button' style='margin-top:1em;'>log in again</div>
                </a>
            </div>
        </div>
    </div>

@endsection
