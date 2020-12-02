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

  public function getUnread(Request $request){

    $json = Auth::user()->unreadNotifications->map(function($notification){
      return ['data'=>notificationData($notification,'json'),'type'=>notificationType($notification),'id'=>$notification->id];
    })->toJson();
    return $json;
  }
  public function retrieve (Request $request) {
    $ids = $request->ids;
    $new = Auth::user()->notifications()->select(['id','data','created_at','read_at','type']);
    if ($ids) $new->whereNotIn('id',$ids);
    return $new->get()->toArray();
  }
  public function update(Request $request){
    $status = $request->status;
    $ids = $request->ids;
    $notifications = Auth::user()->notifications()->whereIn('id',$ids);
    try{
      if ($status == 'unread') $notifications->update(['read_at' => null]);
      elseif ($status == 'read') $notifications->update(['read_at' => now()]);
    }catch(\Exception $e){
      reportError($e,'NotificationController update');
    }
    return isset($e) ? $e : 'checkmark';
  }
  public function delete(Request $request){
    try{
      $ids = $request->ids;
      $notifications = Auth::user()->notifications()->whereIn('id',$ids);
      $notifications->delete();
    }catch (\Exception $e){
      reportError($e,'NotificationController delete');
    }
    return isset($e) ? $e : 'checkmark';
  }
}
