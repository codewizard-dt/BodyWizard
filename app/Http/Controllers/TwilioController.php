<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Aloha\Twilio\Twilio;

class TwilioController extends Controller
{
    //
    private $twilio;
    public function __construct(){
    	$this->twilio = new Twilio($accountId, $token, $fromNumber);
    }

    public function incomingCall(Request $request){
    	
    }
}
