<div id="Notifications" class='tab'>
    <div class="open title">
        Notifications<span id='UnreadCount' class="indicator">{{$user->unreadNotifications->count()}}</span>
    </div>
    <div class="underline" style="width: 0%;"></div>
    <div class="list dropDown">
        @include('portal.user.notifications')
        <div class="options">
            <div class='pink10BG multiBtns'>
                <div class="button pink xsmall markAsUnread">unread</div>
                <div class="button pink xsmall markAsRead">read</div>
                <div class="button pink xsmall delete">delete</div>
            </div>
            <div class="button yellow xsmall selectMultiple">select multiple</div>
        </div>                
    </div>
</div>
