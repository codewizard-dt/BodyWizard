<?php 
if (!isset($fetch)){$fetch = 'all';}
if ($fetch == 'unread'){
	$notifications = Auth::user()->unreadNotifications; 
}elseif ($fetch == 'all'){
	$notifications = Auth::user()->notifications; 
}
?>

<h2>Notifications</h2>
<ul>
    @forelse($notifications as $notification)
        <?php 
        $model = isset($notification->data["model"]) ? $notification->data["model"] : null; 
        $uid = isset($notification->data["uid"]) ? $notification->data["uid"] : null; 
        $changes = isset($notification->data["changes"]) ? json_encode($notification->data["changes"]) : null; 
        $click = isset($notification->data["click"]) ? json_encode($notification->data["click"]) : null; 
        $tabId = isset($notification->data["tabId"]) ? $notification->data["tabId"] : null; 
        $details = json_encode($notification->data["details"]); 
        $type = $notification->data['type']; 
        $createdAt = $notification->created_at;
        $time = dateOrTimeIfToday($createdAt->timestamp);
        $description = $notification->data['description'];
        $indicatorStatus = ($notification->read_at == null) ? 'unread' : 'read';
        ?>
        <li data-notificationid='{{$notification->id}}' data-created='{{$createdAt->format("n/j/y g:ia")}}' data-model='{{$model}}' data-uid='{{$uid}}' data-changes='{{$changes}}' data-details='{{$details}}' data-tabid='{{$tabId}}' data-type='{{$type}}' data-click='{{$click}}' data-description='{{$description}}'>{{$type}}<span class="indicator {{$indicatorStatus}}"></span></li>
    @empty
        <li>No Notifications</li>
    @endforelse
</ul>
