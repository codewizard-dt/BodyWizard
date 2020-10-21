@include('layouts.menus.menu-bar',[
    "menu_name" => 'formsMenu',
    'menu_data' => 'PortalTabOptions',
    'items' => [
        'forms-index', 'forms-create', 'forms-edit'
    ]
])