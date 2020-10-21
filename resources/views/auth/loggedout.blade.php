@extends('layouts.site')

@section('content')
<?php 
$message = request()->reason ? "You've been logged out ".request()->reason : "You've been logged out";
?>
<div class='splash top flexbox vhIndicator' id='shelf-2'>
    <div class="wrapper paddedBig">
        <div id="LoginForm">
        	<h2>{{$message}}</h2>
        	<a href='/portal'> <div class='pink70 button' style='margin-top:1em;'>log in again</div> </a>
        </div>
    </div>
</div>

@endsection