<?php

namespace App\Http\Controllers;

use App\Events\BugReported;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    public function __construct(){
        $this->middleware('auth');
    }

    public function notificationCheck(Request $request){
        return view('portal.user.notifications',['fetch'=>$request->fetch]);
    }
    public function notificationUpdate(Request $request){
    	$action = $request->action;
    	$uids = $request->uids;
        if ($uids == null){return;}
    	try{
    		$notifications = Auth::user()->notifications->filter(function($notification) use ($uids){
    			return in_array($notification->id, $uids);
    		});
	    	if ($action == 'delete'){
	    		foreach($notifications as $n){
	    			$n->delete();
	    		}
	    	}elseif ($action == 'mark-unread'){
	    		foreach($notifications as $n){
	    			$n->read_at = null;
	    			$n->save();
	    		}
	    	}elseif ($action == 'mark-read'){
	    		$notifications->markAsRead();
	    	}    		
    	}catch(\Exception $e){
            reportError($e,'NotificationController 40');
    	}
    	return isset($e) ? listReturn($e) : listReturn('checkmark');
    }
}
