<?php 
$tabs = session('CurrentTabs') !== null ? json_encode(session('CurrentTabs')) : 'null';
$uids = session('uidList') !== null ? json_encode(session('uidList')) : 'null';
?>
<div class="listUpdate" data-tabs='{{$tabs}}' data-uids='{{$uids}}'></div>
