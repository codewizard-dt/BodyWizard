<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Message;
use Illuminate\Support\Facades\Log;
use App\Jobs\UpdateCalendar;


class PushController extends Controller
{
    //
    public function incomingSendGrid(Request $request){
    	// Log::info($request);
    	$events = $request->all();
    	foreach ($events as $event){
    		$id = isset($event['bw_message_id']) ? $event['bw_message_id'] : false;
    		if ($id){
	    		$this->updateMsgStatus($id,$event);
    		}
    	}
    }

    public function updateMsgStatus($id,$data){
    	$messageUpdate = Message::find($id);
    	$status = json_decode($messageUpdate->status,true);
    	Log::info($status);
    	$event = $data['event'];
    	$timestamp = $data['timestamp'];
    	if ($status[$event] === null){
    		$status[$event] = [$timestamp];
    	}else{
    		array_push($status[$event], $timestamp);
    	}
    	$messageUpdate->status = json_encode($status);
    	$messageUpdate->save();
    }
    public function googlePushVerification(Request $request){
        return view('confirmations.googlepush');
    }
    public function incomingGoogle(Request $request){
        // $headers = $request->
        // Log::info();
        $channel = getallheaders()['X-Goog-Channel-ID'];
        Log::info("Calendar change for practice id:".$channel);
    }
    public function incomingTwilioSms(Request $request){
        Log::info($request);
    }
    public function twilioError(Request $request){

    }
}
