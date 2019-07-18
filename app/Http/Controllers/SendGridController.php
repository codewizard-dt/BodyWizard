<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Message;
use Illuminate\Support\Facades\Log;

class SendGridController extends Controller
{
    //
    public function incomingEvent(Request $request){
    	Log::info($request);
    }
}
