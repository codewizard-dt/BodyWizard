@extends('layouts.site')

@section('content')
        <div id='crystalbuddha' class='splash top' style='padding-top:5em'>
            <div class='textBox central btnPopDown'>
                <div class='logo popUp'></div>
                <h1>This page doesn't exist</h1>
                <p>Sorry about that! It happens sometimes.</p>
                <div class='button link small pink' data-target="/about">find out more about us</div>
            </div>
        </div>
@endsection

@section('title', 'Page Not Found')
@section('description', "Page Not Found")
@section('path', "https://bodywizardmedicine.com/not-found")