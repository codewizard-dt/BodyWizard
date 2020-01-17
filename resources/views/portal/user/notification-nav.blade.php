        <div id="Notifications" class='tab'>
            <div class="open title">
                Notifications<span id='UnreadCount' class="indicator">{{$user->unreadNotifications->count()}}</span>
            </div>
            <div class="underline" style="width: 0%;"></div>
            <div class="list dropDown">
                    @include('portal.user.notifications')
                <div class="options">
                    <div class='pink10BG multiBtns'>
                        <div class="button pink xsmall markMultiAsUnread">mark unread</div>
                        <div class="button pink xsmall markMultiAsRead">mark read</div>
                        <div class="button pink xsmall deleteMulti">delete</div>
                    </div>
                    <div class="button yellow xsmall selectMultiple">select</div>
                    <div class="button yellow xsmall selectAll">all</div>
                </div>                
            </div>
        </div>
