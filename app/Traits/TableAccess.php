<?php

namespace App\Traits;

use App\User;
use Mockery\Undefined;

// use Illuminate\Http\Request;

trait TableAccess
{
    private static $table_name;
    private static $primary_key;
    public static $model_name;
    public static $display_name = '';
    public static $display_name_plural;
    private static $is_category;
    private static $has_category;
    private static $has_settings;
    private static $is_user;
    public static $name_attr = 'name';

    public static function bootTableAccess()
    {
        $proxy = new static;
        static::$table_name = static::query()->getQuery()->from;
        static::$primary_key = $proxy->getKeyName();
        static::$model_name = class_basename(get_class());
        $name = isset(static::$alternate_name) ? static::$alternate_name : static::$model_name;
        static::$display_name = title(singularSpaces($name));
        static::$display_name_plural = title(pluralSpaces($name));
        static::$is_category = uses_trait($proxy, 'IsCategory');
        static::$has_category = uses_trait($proxy, 'HasCategory');
        static::$has_settings = uses_trait($proxy, 'HasSettings');
        static::$is_user = uses_trait($proxy, 'IsUser');
    }

    public static function fetch($params = [])
    {
        $select = get($params, 'select', '*');
        $where = get($params, 'where', null);
        $scopes = get($params, 'scopes', null);
        $orderBy = get($params, 'orderBy', null);

        $query = static::select($select);
        if (static::$model_name == 'Form' && !User::IsSuper()) {
            $query->nonSystem();
        }
        if ($scopes) {
            collect($scopes)->each(function ($scope) use ($query) {$query->$scope();});
        }

        if ($where) {
            $query->where(...$where);
        }

        if ($orderBy) {
            $query->orderBy(...$orderBy);
        }

        if (static::$has_settings) {
            $query->orderBy(static::$table_name . '.settings->system', 'desc')
                ->orderBy(static::$table_name . ".settings->Display Order");
        }
        if (static::$is_user) {
            $query->orderBy('users.last_name');
        }
        // else {
        //     $query->orderBy(static::$table_name . '.settings->system', 'desc')
        //         ->orderBy(static::$table_name . ".settings->Display Order")
        //         ->orderBy(static::$table_name . ".name");
        // }
        $items = $query->get();
        // logger("Fetch " . static::$table_name, $items->toArray());
        return $items;
    }

    public static function list_attrs()
    {
        $attrs = ['name', 'uid'];
        $unique = isset(static::$list_attributes) ? static::$list_attributes : [];
        smart_merge($attrs, $unique);

        if (static::$has_category) {
            smart_merge($attrs, ['category_name', 'category_id']);
        }
        if (static::$has_settings) {
            $attrs[] = 'settings';
        }
        return $attrs;
    }
    public static function get_list($collection = null)
    {
        try {
            if (static::$has_category === null) {
                static::bootTableAccess();
            }

            $list = $collection ? $collection : static::fetch();
            $list = $list->map(function ($instance, $uid) {
                return $instance->list_map();
                // $attrs = [];
                // collect($attr_names)->each(function ($key) use (&$attrs, $instance) {
                //     if ($key == 'uid') {
                //         $attrs['uid'] = $instance->getKey();
                //     } else {
                //         $attrs[$key] = e($instance->$key);
                //     }

                // });
                // return $attrs;
            })->toArray();

            return $list;
        } catch (\Exception$e) {
            $error = handleError($e);
            return compact('error');
        }
    }
    public function list_map($attr_names = null)
    {
        if ($attr_names === null) {
            $attr_names = static::list_attrs();
        }
        $values = [];
        foreach ($attr_names as $name) {
            $value = $name === 'uid' ? $this->getKey() : $this->$name;
            if (is_string($value)) {
                $value = e($value);
            }

            set($values, $name, $value);
        }
        return $values;
    }

    public static function table_attrs()
    {
        $options = static::base_table();
        if (method_exists(static::class, 'table')) {
            $unique = static::table();
            merge($options, $unique);
        }
        // logger($options);
        return $options;
    }
    public static function table_json($query_array = [])
    {
        try {
            $items = static::fetch($query_array);
            $options = static::table_attrs();

            $rows = $items->map(function ($item) use ($options) {
                return $item->table_map($options);
            })->toArray();

            $columns = collect($options['columns'])->map(function ($str, $key) {
                if (strpos($str, 'setting:') !== false) {
                    $str = snake($key);
                }
                return $str;
            })->toArray();

            set($options, 'columns', $columns);
            set($options, 'rows', $rows);
            set($options, 'buttons', static::table_buttons());
            set($options, 'list_update', static::get_list($items));
            // logger($options);
            return dataAttrStr($options);
        } catch (\Exception$e) {
            $error = reportError($e);
            return null;
        }
    }

    public function table_map($options = null)
    {

        if ($options === null) {
            $options = static::table_attrs();
        }

        $columns = collect(get($options, 'columns', []));
        $data = collect(get($options, 'data', []));

        $row = $columns->map(function ($attr) {return $this->flatten($attr);});
        $row_data = $data->mapWithKeys(function ($attr) {return [$attr => $this->flatten($attr)];});
        set($row_data, 'uid', $this->getKey());
        set($row, 'data', $row_data);
        return $row->toArray();
    }

    public static function base_table()
    {
        $name = static::$name_attr;
        $array = [
            'model' => static::$model_name,
            'display_name' => static::$display_name,
            'header' => static::$display_name_plural,
            'buttons' => 'hello',
            'limit' => request('table_selection_limit', 'no limit'),
            'columns' => ['Name' => $name],
            'data' => [],
            'filters' => [
                new_input('text',
                    ['name', 'placeholder'],
                    ['text_search', 'Type to search ' . static::$display_name_plural],
                    ['placeholder_shift'],
                    ['false']
                ),
            ],
        ];
        if (static::$has_category) {
            $array['columns']['Category'] = 'category_name';
            $array['filters'][] = static::$category_table_filter;
        }

        return $array;
    }

    public static function instance_details($uid = null, $instance = null)
    {
        if ($uid === null || $uid === '') {
            return null;
        }

        try {
            $instance = static::find($uid);
            if (!$instance) {
                throw new \Exception(static::$display_name . ' with $uid = ' . $uid . ' not found');
            }
            return $instance->details_map();
        } catch (\Exception$e) {
            $error = handleError($e);
            return compact('error');
        }
    }
    public function details_map()
    {
        $details = $this->details();
        if (!$details) {
            // throw new \Exception(static::$display_name . ' "details" method array is empty');
            $details = [];
        }

        $array = [
            'name' => $this->name,
            'uid' => $this->getKey(),
            'General Info' => $details,
        ];
        if (static::$has_settings) {
            $array['Settings'] = $this->settings;
        }
        return $array;

    }

    public static function instance_buttons()
    {
        return [];
        // $model = static::$model_name;
        // $buttons = isset(static::$instance_actions) ? static::$instance_actions : [];

        // $class_list = 'xsmall purple70 p-xsmall';
        // if (static::$has_settings) {
        //     $buttons[] = [
        //         'text' => 'edit settings',
        //         'action' => $model . '.settings',
        //         'class_list' => $class_list,
        //     ];
        // }
        // return $buttons;
    }

    public static function table_buttons()
    {
        $model = static::$model_name;
        // $instance = new static;
        $buttons = [
            ['text' => 'add new', 'action' => 'Model.FormOpen', 'class_list' => 'pink'],
            ['text' => 'edit', 'action' => 'Model.edit', 'class_list' => 'pink disabled requires-selection select-1', 'disabled_message' => 'select exactly one'],
            ['text' => 'delete', 'action' => 'Model.delete', 'class_list' => 'pink disabled requires-selection'],
        ];
        if (static::$has_settings) {
            $buttons[] = [
                'text' => 'settings',
                'action' => $model . '.settings',
                'class_list' => 'pink disabled requires-selection',
            ];
        }
        if (static::$has_category) {
            $buttons[] = [
                'text' => 'categories',
                'action' => 'Menu.load',
                'class_list' => 'yellow',
                'url' => "/$model" . "Category/index",
            ];
        }
        if (static::$is_category) {
            $item_class = str_replace(" Category", "", static::$display_name);
            $buttons[] = [
                'text' => plural($item_class),
                'action' => 'Menu.load',
                'class_list' => 'yellow',
                'url' => "/$item_class/index",
            ];
        }
        foreach ($buttons as &$button) {
            $button['class_list'] .= ' small';
            $button['model'] = $model;
        }
        return $buttons;
    }

    public function flatten($attr)
    {
        $value = $this->$attr;
        return e(is_array($value) ? implodeAnd($value) : $value);
    }

}
