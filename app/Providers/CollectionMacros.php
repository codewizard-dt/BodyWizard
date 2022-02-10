<?php

namespace App\Providers;

use Illuminate\Support\Collection;
use Illuminate\Support\ServiceProvider;

class CollectionMacros extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        Collection::macro('mapForListComponent', function () {
            if ($this->count() === 0) {
                return ["null%%None available"];
            }

            return $this->map(function ($model) {
                return $model->getKey() . '%%' . $model->name;
            })->toArray();
        });
    }
}
