<?php
if (!defined('ROOT_DIR')) {
    define('ROOT_DIR', realpath($_SERVER['DOCUMENT_ROOT']));
}
// $rel = $_SERVER['REQUEST_URI'];
// $path = ROOT_DIR . $rel;
error_reporting(E_ERROR | E_WARNING | E_PARSE);
// error_reporting(0);
date_default_timezone_set('America/Chicago');
require_once ROOT_DIR . '/../vendor/autoload.php';
//require_once ROOT_DIR."/php/functions.php";
?>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="csrf-token" content="{{ csrf_token() }}">
<link rel='icon' type='image/png'
    href="data:image/png;base64,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">
<link rel="stylesheet" type="text/css" href="{{ secure_asset('/css/app.css') }} ">

@stack('metadata')
@stack('extracss')
