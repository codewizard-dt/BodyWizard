@extends('layouts.site')

@section('content')
        <div id='crystalbuddha' class='splash' style='padding-top:5em'>
            <div class='textBox central btnPopDown'>
                <div class='logo popUp'></div>
                <h1>Restricted Page</h1>
                <p>Sorry, access to this is not allowed.</p>
                <div class='button link small pink' data-target="/about">find out more about us</div>
            </div>
        </div>
@endsection

@section('title', 'Restricted')
@section('description', "This page is restricted.  Login is required.")
@section('path', "https://bodywizardmedicine.com/restricted")