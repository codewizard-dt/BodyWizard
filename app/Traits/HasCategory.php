<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait HasCategory
{
    public static $model_name;
    public static $model_table_name;
    public static $category_name;
    public static $category_name_id;
    public static $category_table_name;
    public static $category_table_filter;

    public static function bootHasCategory()
    {
        static::$model_name = $model = class_basename(get_class());
        static::$model_table_name = $table = snake(plural($model));
        static::$category_name = $category = $model . 'Category';
        static::$category_name_id = $category_id = snake($category) . '_id';
        static::$category_table_name = $category_table = snake(plural($category));
        static::$category_table_filter = new_input('checkboxes',
            ['name', 'autofill_model', 'ele_css', 'preLabel', 'labelHtmlTag', 'labelClass'],
            ['category_name', static::$category_name, ['textAlign' => 'left'], 'Category Filter', 'h3', 'purple'],
        );
        static::addGlobalScope('categorized', function (Builder $builder) use ($table, $category_table, $category_id) {
            $builder->join($category_table, "$table.$category_id", '=', "$category_table.id")
                ->select("$table.*",
                    "$category_table.name as category_name",
                    "$category_table.settings as category_settings",
                    "$table.$category_id as category_id")
                ->orderBy("category_settings->Display Order")->orderBy('category_name')
                ->orderBy("$table.settings->Display Order")->orderBy("$table.name");
        });
    }

    public function initializeHasCategory()
    {
        $category_attrs = ['category_name', 'category_settings'];
        $this->append($category_attrs);
        $this->makeVisible($category_attrs);
    }

    public function category()
    {
        return $this->belongsTo("App\\" . static::$category_name, static::$category_name_id);
    }
    public function getCategoryNameAttribute()
    {
        return $this->category ? $this->category->name : 'none';
    }
    public function getCategorySettingsAttribute()
    {
        return $this->category ? $this->category->settings : 'none';
    }

}
