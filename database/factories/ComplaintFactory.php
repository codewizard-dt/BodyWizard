<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\Complaint;
use Faker\Generator as Faker;

$factory->define(Complaint::class, function (Faker $faker) {
    return [
			'name' => $faker->words(3,true),
			'description' => $faker->text(150),
    ];
});
