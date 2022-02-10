<?php

namespace App\Traits;

use App\HasManyJson as AppHasManyJson;

trait HasManyJson
{
    public function hasManyJson($related, $foreignKey = null, $localKey = null)
    {
        $instance = new $related();
        return new AppHasManyJson($instance->newQuery(), $this, $instance->getTable() . '.' . $foreignKey, $localKey);
    }
}
