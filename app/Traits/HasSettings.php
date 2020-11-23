<?php

namespace App\Traits;
use Illuminate\Support\Facades\Log;

trait HasSettings
{
	public function get_setting($dot_notation, $default = null) {
		if (!$this->settings) return $default;
		$value = get($this->settings, $dot_notation, $default);
		return $value;
	}
	public function get_setting_bool($dot_notation, $default = false) {
		return $this->to_bool($this->get_setting($dot_notation, $default));
	}

	public function to_bool($value, $strict = true) {
		if ($strict) {
			if ($value === 'true') return true;
			else if ($value === 'false') return false;
			else return $value;
		} else {
			throw new \Exception('not-strict mode not defined');
		}
	}
}