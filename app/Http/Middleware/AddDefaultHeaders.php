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
	$userInfo = $user ? json_encode([
	    'id' => $user->id,
	    'type' => $user->user_type,
	    'is_admin' => $user->is_admin,
	    'is_super' => $user->is_superuser,
	    'practitioner_id' => $user->practitionerInfo->id,
	    'name' => $user->name		
		]) : null;

	if ($user){
		$notifications = $user->unreadNotifications;
		$response->withHeaders([
	    'X-Current-Uids' => json_encode(session('uidList')),
	    'X-Current-Tabs' => json_encode(session('CurrentTabs')),
	    'X-Unread-Notifications' => $notifications->count() < 50 ? $notifications->map(function($n){
	    	return ['type'=>notificationType($n),'data'=>notificationData($n,'json'),'id'=>$n->id];
	    })->toJson() : 'send ajax',
	    'X-CSRF-TOKEN' => csrf_token()
		]);
	}
	// Log::info($response);
	return $response;
}
}
