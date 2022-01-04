<?php

namespace App;

// use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;

class Input
{
    public $name;
    public $type;
    public $options = [];
    public $settings = [];

    public function __construct(string $name, string $type)
    {
        $this->name = $name;
        $this->type = $type;
    }

    public function setOptions(array $options)
    {
        foreach ($options as $key => $value) {
            $this->setOption($key, $value);
        }
    }
    public function setOption($key, $value)
    {
        Arr::set($this->options, $key, $value);
    }

    public function placeholder($value = null)
    {
        if ($value === null) {
            return $this->options['placeholder'];
        } else {
            $this->setOption('placeholder', $value);
        }
    }
    public function autofill_model($value = null)
    {
        if ($value === null) {
            return $this->options['autofill_model'];
        } else {
            $this->setOption('autofill_model', $value);
        }
    }
}
