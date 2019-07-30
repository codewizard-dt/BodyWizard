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
    	$events = $request->all();
    	foreach ($events as $event){
    		$id = isset($event['bw_message_id']) ? $event['bw_message_id'] : false;
    		if ($id){
	    		$this->updateStatus($id,$event);
    		}
    	}
    }

    public function updateStatus($id,$data){
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
}
