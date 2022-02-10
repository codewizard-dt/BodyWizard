<?php

namespace App\Traits;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

trait HasSettings
{
    // static public $has_settings = true;

    public function __get($key)
    {
        $val = $this->getAttribute($key);
        if ($val) {
            return $val;
        } elseif (strpos($key, 'setting:') !== false) {
            $array = explode(':', $key);
            $key = $array[1];
            $default = count($array) > 2 ? $array[2] : null;
            return $this->get_setting($key, $default);
        } else {
            return null;
        }

    }

    public function get_setting($dot_notation, $default = null)
    {
        if (!$this->settings) {
            return $default;
        }

        $value = get($this->settings, $dot_notation, $default);
        return $value;
    }
    public function get_setting_bool($dot_notation, $default = false)
    {
        return $this->to_bool($this->get_setting($dot_notation, $default));
    }

    public function set_setting_by_array($array)
    {
        $replace = to_bool(request('fully_replace', true));
        if ($replace) {
            $this->settings = $array;
        } else {
            $array = dot($array);
            $settings = collect($array);
            logger(['initial dot' => $array, 'collection' => $settings]);
            $zero_index = $settings->filter(function ($value, $dot_notation) {return Str::endsWith($dot_notation, '.0');});
            $zero_index->each(function ($value, $dot_notation) use (&$array, &$settings) {
                $beginning = Str::before($dot_notation, '.0');
                $this->delete_setting($beginning);
            });
            collect(dot($array))->each(function ($value, $dot_notation) {
                // logger(compact('value','dot_notation'));
                $this->set_setting($dot_notation, $value);
            });
        }

        return $this->settings;
    }
    public function set_setting($dot_notation, $value)
    {
        try {
            if ($value === null) {
                return $this->delete_setting($dot_notation);
            }

            $settings_array = $this->settings == null ? [] : $this->settings;
            set($settings_array, $dot_notation, $value);
            $this->settings = $settings_array;
            return $this;
        } catch (\Exception $e) {
            handleError($e);
            return false;
        }
    }
    public function delete_setting($dot_notation)
    {
        $settings_array = $this->settings == null ? [] : $this->settings;
        forget($settings_array, $dot_notation);
        $this->settings = $settings_array;
        $dot_array = explode('.', $dot_notation);
        array_pop($dot_array);
        $parent_dot = implode('.', $dot_array);
        if ($parent_dot && !$this->get_setting($parent_dot)) {
            $this->delete_setting($parent_dot);
        }

        return $this;
    }

    public function to_bool($value, $strict = true)
    {
        if ($strict) {
            if ($value === 'true') {
                return true;
            } else if ($value === 'false') {
                return false;
            } else {
                return $value;
            }

        } else {
            throw new \Exception('not-strict mode not defined');
        }
    }
}
