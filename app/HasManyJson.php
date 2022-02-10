<?php

namespace App;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

class HasManyJson extends HasMany
{

    public function getParentKeys()
    {
        if ($this->getParentKey() === null) {
            return [];
        }

        return json_decode($this->getParentKey(), true);
    }

    public function addConstraints()
    {
        if (static::$constraints) {
            $this->query->whereIn($this->foreignKey, $this->getParentKeys());

            $this->query->whereNotNull($this->foreignKey);
        }
    }

    public function addEagerConstraints(array $models)
    {
        $this->query->whereIn($this->foreignKey, $this->getKeys($models, $this->localKey));
    }

    protected function getKeys(array $models, $key = null)
    {
        $keys = [];
        collect($models)->each(function ($value) use ($key, &$keys) {
            $keys = array_merge($keys, json_decode($value->getAttribute($key), true));
        });
        return array_unique($keys);
    }

    public function matchMany(array $models, Collection $results, $relation)
    {

        $foreign = $this->getForeignKeyName();

        $dictionary = $results->mapToDictionary(function ($result) use ($foreign) {
            return [$result->{$foreign} => $result];
        })->all();

        foreach ($models as $model) {
            $ids = json_decode($model->getAttribute($this->localKey), true);
            $collection = collect();
            foreach ($ids as $id) {
                if (isset($dictionary[$id])) {
                    $collection = $collection->merge($this->getRelationValue($dictionary, $id, 'many'));
                }

            }
            $model->setRelation($relation, $collection);
        }

        return $models;
    }
}

// class AppModel extends Model
// {
//     public function hasManyJson($related, $foreignKey = null, $localKey = null)
//     {
//         $instance = new $related();
//         return new HasManyJson($instance->newQuery(), $this, $instance->getTable() . '.' . $foreignKey, $localKey);
//     }
// }
