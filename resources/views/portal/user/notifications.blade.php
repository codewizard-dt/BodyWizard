@foreach(Auth::user()->notifications as $notification)
    <div class="tab notification">
        <div class='title' {!!notificationData($notification)!!}><span class="selector"></span>{{notificationType($notification)}}<span class="indicator {{$notification->read_at?'read':'unread'}}"></span></div>
    </div>
@endforeach
