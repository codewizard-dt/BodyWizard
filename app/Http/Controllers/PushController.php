<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Message;
use App\Events\BugReported;
use Illuminate\Support\Facades\Log;
use App\Jobs\UpdateCalendar;


class PushController extends Controller
{
    //
    public function incomingSendGrid(Request $request){
    	Log::info($request);
    	$events = $request->all();
    	foreach ($events as $event){
    		$id = isset($event['bw_message_id']) ? $event['bw_message_id'] : false;
    		if ($id){
	    		$this->updateMsgStatus($id,$event);
    		}
    	}
    }

    public function updateMsgStatus($id,$data){
        try{
            $messageUpdate = Message::find($id);
            if (!$messageUpdate){return;}
            $status = $messageUpdate->status;
            $event = $data['event'];
            $timestamp = $data['timestamp'];
            $url = ($event == 'click') ? $data['url'] : null;
            if ($url){
                if (!isset($status[$event]) || $status[$event] === null){
                    $status[$event] = [[$timestamp => $url]];
                }else{
                    array_push($status[$event], [$timestamp => $url]);
                }                
            }else{
                if (!isset($status[$event]) || $status[$event] === null){
                    $status[$event] = [$timestamp];
                }else{
                    array_push($status[$event], $timestamp);
                }                
            }
            $messageUpdate->status = $status;
            $messageUpdate->save();
        }catch(\Exception $e){
            event(new BugReported(
                [
                    'description' => "Updating Message Status", 
                    'details' => $e, 
                    'category' => 'Push Notifications', 
                    'location' => 'PushController.php',
                    'user' => null
                ]
            ));
        }
    }
    public function googlePushVerification(Request $request){
        return view('confirmations.googlepush');
    }
    public function incomingGoogle(Request $request){
        $channel = getallheaders()['X-Goog-Channel-ID'];
        Log::info("Calendar change on channel:".$channel);
        // Log::info(getallheaders());
    }
    public function incomingTwilioSms(Request $request){
        // Log::info($request);
        $phone = $request->From;
        $msg = $request->Body;
    }
    public function twilioError(Request $request){

    }
}
