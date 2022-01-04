<?php

namespace App\Traits;

use App\Practice;

trait UsePractice
{
    public $practice;
    public function initializeUsePractice()
    {
        $this->practice = app(Practice::class);
    }
}
