<?php 
    if (!defined("ROOT_DIR")){
        define("ROOT_DIR",realpath($_SERVER["DOCUMENT_ROOT"]));
    }
    $rel = $_SERVER['REQUEST_URI'];
    $path = ROOT_DIR.$rel;
	//error_reporting(E_ERROR | E_WARNING | E_PARSE); 
	error_reporting(0);
	date_default_timezone_set("America/Chicago");
    require_once ROOT_DIR."/../vendor/autoload.php";
    //require_once ROOT_DIR."/php/functions.php";
?>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8" >
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<link rel="stylesheet" type="text/css" href="{{ asset('/css/app.css') }} ">
<link href="{{ asset('/css/summernote-lite.css') }}" rel="stylesheet">
<script
  src="https://code.jquery.com/jquery-3.3.1.min.js"
  integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8="
  crossorigin="anonymous"></script>


 @stack('metadata')
 @stack('extracss')