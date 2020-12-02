<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class AddDefaultHeaders
{

public function handle($request, Closure $next)
{
	$response = $next($request);

	$user = Auth::check() ? Auth::user() : null;

	if ($user){
		if ($request->ajax()) {			
			$ids = session()->get('notification_ids',[]);
			$notifications = $user->notifications()->select('id','type','data','created_at','read_at')->whereNotIn('id',$ids)->get();
			if ($notifications->count() > 0) {
				smart_merge($ids,$notifications->map(function($n){return $n['id'];})->toArray());
				session(['notification_ids'=>$ids]);
				$content = $response->content().'###notifications'.$notifications->toJson().'###';
				$response->setContent($content);				
			}
		}
    $isNotificationCheck = ($request->path() == 'notification-retrieve');
    $forceLogout = false;
    if (!$isNotificationCheck) session(['realTimestamp' => time()]);
    else {
        $difference = time() - session('realTimestamp');
        $forceLogout = ($difference > 20*60);
    }
    $headers = [
	    'X-Current-Uids' => json_encode(session('uidList')),
	    'X-Current-Tabs' => json_encode(session('CurrentTabs')),
	    'X-CSRF-TOKEN' => csrf_token(),
	    'X-FORCE-LOGOUT' => $forceLogout ? 'true' : 'false',
		];
			    // 'X-Unread-Notifications' => strlen($notification_json) < 15000 ? $notification_json : 'send ajax',
		// if (!$isNotificationCheck) $headers['X-Unread-Notifications'] = strlen($notification_json) < 1500 ? $notification_json : 'send ajax';
		$response->withHeaders($headers);
	}else{
		$response->withHeaders([
	    'X-Current-Uids' => null,
	    'X-Current-Tabs' => null,
	    'X-CSRF-TOKEN' => null,
	    'X-FORCE-LOGOUT' => null,
		]);
	}

	return $response;
}
}
