<?php

namespace App\Traits;

// use Illuminate\Http\Request;

trait TableAccess
{
    private static $table_name;
    private static $primary_key;
    private static $model_name;
    private static $model_display_name;
    private static $has_category;
    private static $has_settings;
    private static $is_user;
    // private static $basic_buttons = [
    //     ['text' => 'add new', 'action' => 'Model.create', 'class_list' => 'pink'],
    //     ['text' => 'edit', 'action' => 'Model.edit', 'class_list' => 'pink70 disabled requires-selection'],
    //     ['text' => 'delete', 'action' => 'Model.delete', 'class_list' => 'pink70 disabled requires-selection'],
    // ];

    public static function bootTableAccess()
    {
        $proxy = new static;
        static::$table_name = static::query()->getQuery()->from;
        static::$primary_key = $proxy->getKeyName();
        static::$model_name = class_basename(get_class());
        static::$model_display_name = isset(static::$display_name) ? static::$display_name : static::$model_name;
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
        if ($scopes) {
            collect($scopes)->each(function ($scope) use ($query) {$query->$scope();});
        }

        if ($where) {
            $query->where(...$where);
        }

        if ($orderBy) {
            $query->orderBy(...$orderBy);
        }

        if (static::$has_category) {
            $query->orderBy(static::$table_name . '.settings->system', 'desc')
                ->orderBy(static::$table_name . ".settings->Display Order");
        } elseif (static::$is_user) {
            $query->orderBy('users.last_name');
        } else {
            $query->orderBy(static::$table_name . '.settings->system', 'desc')
                ->orderBy(static::$table_name . ".settings->Display Order")
                ->orderBy(static::$table_name . ".name");
        }
        $items = $query->get();
        return $items;
    }

    public static function get_list($as_json = false, $collection = null)
    {
        try {
            if (static::$has_category === null) {
                static::bootTableAccess();
            }

            $select = ['name', 'uid'];
            $unique = isset(static::$list_cols) ? static::$list_cols : [];
            smart_merge($select, $unique);

            if (static::$has_category) {
                smart_merge($select, ['category_name', 'category_id']);
            }

            if (static::$has_settings) {
                $select[] = 'settings';
            }

            $list = $collection ? $collection : static::fetch();
            $list = $list->map(function ($instance, $uid) use ($select) {
                $attrs = [];
                collect($select)->each(function ($column) use (&$attrs, $instance) {
                    if ($column == 'uid') {
                        $attrs['uid'] = $instance->getKey();
                    } else {
                        $attrs[$column] = $instance->$column;
                    }

                });
                return $attrs;
            })->toArray();
            // $list['plural'] = plural(static::$model_name);
            return $as_json ? json_encode($list) : $list;
        } catch (\Exception $e) {
            $error = handleError($e);
            return compact('error');
        }
    }

    public static function table_json($query_array)
    {
        try {
            $items = static::fetch($query_array);
            $options = static::base_table();
            $unique = static::table();
            merge($options, $unique);

            function a($value)
            {return is_array($value) ? implodeAnd($value) : $value;}

            $rows = $items->map(function ($item) use ($options) {
                $row = collect($options['columns'])->map(function ($attr) use ($item) {return e(a($item->$attr));});
                $data = collect($options['data'])->mapWithKeys(function ($attr) use ($item) {return [$attr => e(a($item->$attr))];});
                set($data, 'uid', $item->getKey());
                set($row, 'data', $data);
                return $row;
            })->toArray();

            $columns = collect($options['columns'])->map(function ($str, $key) {
                if (strpos($str, 'setting:') !== false) {
                    $str = snake($key);
                }

                return $str;
            })->toArray();

            // $filters = collect($options['filters'])->map(function($info, $key) {

            // })->toArray();

            // set($options, 'filters', $filters);
            set($options, 'columns', $columns);
            set($options, 'rows', $rows);
            set($options, 'buttons', static::table_buttons());
            set($options, 'list_update', static::get_list(false, $items));
            return dataAttrStr($options);
        } catch (\Exception $e) {
            reportError($e);
            return '';
        }
    }

    public static function base_table()
    {
        $name = isset(static::$name_attr) ? static::$name_attr : 'name';
        $array = [
            'model' => static::$model_name,
            'display_name' => static::$model_display_name,
            'header' => plural(static::$model_display_name),
            'buttons' => 'hello',
            'limit' => request('table_selection_limit', 'no limit'),
            'columns' => ['Name' => $name],
            'filters' => [
                new_input('text',
                    ['name', 'placeholder', 'ele_css'],
                    ['text_search', 'Type to search ' . plural(static::$model_display_name), ['width' => '25em', 'maxWidth' => '95%']],
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

    public static function instance_details($uid = null)
    {
        if ($uid === null || $uid === '') {
            return null;
        }

        try {
            $instance = static::find($uid);
            $details = $instance->details();
            $array = $instance == null ? [] : [
                'name' => $instance->name,
                'uid' => $uid,
                static::$model_name . ' Details' => $details,
            ];
            if (uses_trait($instance, 'HasSettings')) {
                $array['Settings'] = $instance->settings;
            }
            return $array;
            // return $as_array ? $array : dataAttrStr($array);

        } catch (\Exception $e) {
            $error = handleError($e);
        }
    }

    public static function instance_buttons()
    {
        $model = static::$model_name;
        $instance_buttons = isset(static::$instance_actions) ? static::$instance_actions : [];

        $class_list = 'xsmall purple70';
        $instance_buttons[] = [
            'text' => 'edit ' . $model,
            'action' => $model . '.edit',
            'class_list' => $class_list,
        ];
        if (isset(static::$has_settings)) {
            $instance_buttons[] = [
                'text' => 'settings',
                'action' => $model . '.settings',
                'class_list' => $class_list,
            ];
        }

        $instance_buttons[] = [
            'text' => 'delete',
            'action' => $model . '.delete',
            'class_list' => $class_list,
        ];
        return $instance_buttons;
    }

    public static function table_buttons()
    {
        $model = static::$model_name;
        $table_buttons = [
            ['text' => 'add new', 'action' => 'Model.form_open', 'class_list' => 'pink'],
            ['text' => 'edit', 'action' => 'Model.edit', 'class_list' => 'pink70 disabled requires-selection'],
            ['text' => 'delete', 'action' => 'Model.delete', 'class_list' => 'pink70 disabled requires-selection'],
        ];
        foreach ($table_buttons as &$button) {
            $button['class_list'] .= ' p-xsmall small';
        }
        // ['text' => 'add new', 'action' => 'Model.create', 'class_list' => 'pink'],
        // ['text' => 'edit', 'action' => 'Model.edit', 'class_list' => 'pink70 disabled requires-selection'],
        // ['text' => 'delete', 'action' => 'Model.delete', 'class_list' => 'pink70 disabled requires-selection'],
        return $table_buttons;
    }

}
