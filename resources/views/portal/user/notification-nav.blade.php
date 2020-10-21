@if (Auth::check())
<div id="Notifications" class='tab' data-afterdropdown='notifications.update.arrow_ele'>
    <div class="title" data-image="/images/icons/mail_icon_yellow.png">
        Notifications<span id='UnreadCount' class="indicator">{{Auth::user()->unreadNotifications->count()}}</span>
    </div>
    <div class="underline" style="width: 0%;"></div>
    <div class="list dropDown">
        @include('portal.user.notifications')
        <div class="options">
            <div class='pinkBg10 multiBtns'>
                <div class="button pink xsmall markAsUnread">unread</div>
                <div class="button pink xsmall markAsRead">read</div>
                <div class="button pink xsmall delete">delete</div>
            </div>
            <div class="button yellow xsmall selectMultiple">select multiple</div>
        </div>                
    </div>
</div>
@endif