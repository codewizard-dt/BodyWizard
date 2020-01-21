<?php 
    // // include_once app_path("/php/functions.php");
    $menuJson = json_decode(file_get_contents(app_path("/json/menu-data.json")),true);

    $allTabs = $menuJson[$menu_data];
    $scroll = "";
    $items = isset($items) ? $items : [];
    $type = isset($type) ? $type : 'portal';

    if ($type == 'site'){
        $classes = "menuBar website siteMenu";
        $target = "window";
        $mobile = [
            "id" => 'MobileMenu',
            'text' => '',
            'dropdown' => [
                [
                    'id' => 'mobilePlaceholder',
                    'text' => '',
                    'dropdown' => false,
                    'uri' => ''
                ]
            ]
        ];
    }elseif ($type == 'portal'){
        $classes = "menuBar portal wrapper";
        $target = "#".$menu_name."Target";
    }elseif ($type == 'scroll'){
        $classes = "menuBar website";
        $target = "window";
        $scroll = "data-mode='scroll' ";
    }
?>


<div class="{{ $classes }}"
     id="{{ $menu_name }}" 
     data-target="{{ $target }}"
     {{ $scroll }}>
    @if ($type == 'site')
        <!-- <div id='MobileMenu'>
            <div id='MenuToggle'></div>
            <div id='MenuDisplay'></div>
        </div> -->
        @include ('layouts.menus.menu-item',$mobile)
    @endif
    @forelse ($items as $name)
        @include ('layouts.menus.menu-item',$allTabs[$name])
    @empty
        @foreach ($allTabs as $name)
            @include ('layouts.menus.menu-item',$allTabs[$name])
        @endforeach
    @endforelse
</div>

@if ($target != 'window')
    <div id="{{ $menu_name }}Target" class='loadTarget'> </div>
@endif

<?php 
unset($items);
?>