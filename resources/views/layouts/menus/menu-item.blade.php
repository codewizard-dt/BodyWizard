<?php
if (!isset($dropdown)) {
    $dropdown = false;
}
if (!isset($text)) {
    $text = '';
}
$uri = !$dropdown && isset($uri) ? $uri : null;
$divide = $name == 'divide' ? ' divide' : '';
$modal = isset($modal) && $modal ? 'true' : 'false';
?>
@if ($name == 'notifications')
    @include ('layouts.notifications')
@else
    <div id="{{ $name }}" class="tab {{ $divide }}" data-uri="{{ $uri }}"
        data-modal="{{ $modal }}">
        @if (isset($image_url))
            <img class="title" src="{{ $image_url }}">
        @else
            <div class="title" data-uri="{{ $uri }}">{{ $text }}</div>
        @endif
        @if ($dropdown)
            <?php unset($image_url); ?>
            <div class="dropdown">
                @foreach ($dropdown as $name => $info)
                    @include('layouts.menus.menu-item',$info)
                @endforeach
            </div>
        @endif
    </div>
@endif
