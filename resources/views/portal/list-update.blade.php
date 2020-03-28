<?php 
$tabs = session('CurrentTabs') !== null ? json_encode(session('CurrentTabs')) : 'null';
$uids = session('uidList') !== null ? json_encode(session('uidList')) : 'null';
?>
<div class="listUpdate" data-tabs='{{$tabs}}' data-uids='{{$uids}}'></div>
<div class="userUpdate" data-usertype='{{Auth::user()->user_type}}' data-isadmin='{{Auth::user()->is_admin}}' data-issuperuser='{{Auth::user()->is_superuser}}'></div>