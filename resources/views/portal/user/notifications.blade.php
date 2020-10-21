<div class='up flexbox'><img src='/images/icons/arrow_up_purple.png'></div>
<div class="scrollList">
@foreach(Auth::user()->notifications as $notification)
    <div class="tab notification">
        <div class='title' {!!notificationData($notification)!!}><span class="selector"></span>{{notificationType($notification)}}<span class="indicator {{$notification->read_at?'read':'unread'}}"></span></div>
    </div>
@endforeach	
</div>
<div class='down flexbox'><img src='/images/icons/arrow_down_purple.png'></div>
